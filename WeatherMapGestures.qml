import QtQuick
import qs.Commons

// Mouse on the radar and wind maps: drag to move the map, the wheel zooms
// one step at a time towards the pointer. While dragging, the map item's
// ground layers follow (mapItem.dragX / dragY); on release the view moves.
MouseArea {
  id: gestures
  required property var panel
  required property Item mapItem
  property real startX: 0
  property real startY: 0
  property bool dragging: false
  property real wheelAccumulated: 0

  acceptedButtons: Qt.LeftButton
  // The wind map reads the pointer for the wind under it.
  hoverEnabled: true
  cursorShape: dragging ? Qt.ClosedHandCursor : Qt.OpenHandCursor
  preventStealing: true

  onPressed: function(mouse) {
    startX = mouse.x
    startY = mouse.y
    dragging = false
  }
  onPositionChanged: function(mouse) {
    // With hover on, the pointer moves without a button too: only a held
    // button drags.
    if (!pressed) return
    var dx = mouse.x - startX
    var dy = mouse.y - startY
    // A few pixels of jitter are still a click.
    if (!dragging && Math.abs(dx) + Math.abs(dy) < 5) return
    dragging = true
    mapItem.dragX = dx
    mapItem.dragY = dy
  }
  onReleased: {
    if (dragging) {
      panel.panMap(mapItem.dragX, mapItem.dragY, mapItem.viewport)
    }
    mapItem.dragX = 0
    mapItem.dragY = 0
    dragging = false
  }
  onCanceled: {
    mapItem.dragX = 0
    mapItem.dragY = 0
    dragging = false
  }
  // The wheel arrives through the page's router (Panel.routeWheel). It
  // zooms with Ctrl held, as maps embedded in a page do; without, it scrolls
  // the page and a note says how to zoom.
  readonly property bool wheelEnabled: true
  signal zoomHintWanted()
  onZoomHintWanted: {
    if (!gestures.panel.showHints) return
    zoomHint.opacity = 1
    zoomHintTimer.restart()
  }

  // "Ctrl + wheel to zoom", briefly, when a plain wheel passes over the map.
  Rectangle {
    id: zoomHint
    anchors.centerIn: parent
    width: zoomHintText.implicitWidth + Style.space(16)
    height: zoomHintText.implicitHeight + Style.space(8)
    radius: Style.cornerRadius
    color: Color.popups.background
    border.color: Color.popups.border
    border.width: Style.spacing.hairline
    opacity: 0
    visible: opacity > 0
    Behavior on opacity { NumberAnimation { duration: 180 } }
    Text {
      textFormat: Text.PlainText
      id: zoomHintText
      anchors.centerIn: parent
      text: gestures.panel.i18n("mapZoomHint")
      color: Color.popups.text
      font.family: gestures.panel.fontFamily
      font.pixelSize: Style.font.caption
    }
  }
  Timer {
    id: zoomHintTimer
    interval: 1400
    onTriggered: zoomHint.opacity = 0
  }
  function wantsWheel(wheel) {
    return (wheel.modifiers & Qt.ControlModifier) !== 0
  }
  function declineWheel(wheel) {
    zoomHintWanted()
  }
  function takeWheel(wheel, point) {
    // Touchpads send small steps: a zoom level per notch's worth.
    wheelAccumulated += wheel.angleDelta.y
    if (Math.abs(wheelAccumulated) < 120) return
    var delta = wheelAccumulated > 0 ? 1 : -1
    wheelAccumulated = 0
    var level = Math.max(panel.mapMinimumZoom, Math.min(panel.mapMaximumZoom, panel.mapZoomLevel + delta))
    if (level === panel.mapZoomLevel) return
    panel.zoomMapAt(delta, point.x - width / 2, point.y - height / 2, mapItem.viewport)
  }
  Component.onCompleted: panel.registerWheelArea(gestures)
  Component.onDestruction: panel.unregisterWheelArea(gestures)
}
