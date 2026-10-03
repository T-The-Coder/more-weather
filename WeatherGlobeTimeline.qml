import QtQuick
import qs.Commons
import qs.Ui

// The globe's forecast timeline, after the radar's (WeatherRadarTimeline):
// play / pause, a track with a notch per step to drag or click, a taller
// notch for now, and the shown step's day, time and distance from now.
// The whole earth runs now … +120 h in 3-hour steps, close up now … +48 h
// hourly (GlobeTimeline.js); the loader (WeatherGlobeData) owns the state,
// so the keys (, . Space n) and this stay in step.
Item {
  id: timeline
  required property var panel
  readonly property var loader: panel.globeData
  readonly property var steps: loader.steps
  readonly property int count: steps.length
  readonly property int shownIndex: dragIndex >= 0 ? dragIndex : loader.stepIndex
  property int dragIndex: -1
  readonly property int hoverIndex: trackMouse.containsMouse ? indexAt(trackMouse.mouseX - Style.space(7)) : -1

  function xFor(index) {
    if (count < 2) return 0
    return track.width * index / (count - 1)
  }
  function indexAt(x) {
    if (count < 2) return 0
    return Math.max(0, Math.min(count - 1, Math.round(x / track.width * (count - 1))))
  }
  function labelFor(index) {
    if (index < 0 || index >= count) return "–"
    return panel.globeStepLabel(steps[index], index === loader.nowIndex)
  }

  height: Style.space(34)

  // Play / pause.
  BorderSurface {
    id: playButton
    anchors.left: parent.left
    anchors.verticalCenter: parent.verticalCenter
    width: Style.space(28)
    height: Style.space(24)
    radius: Style.cornerRadius
    enabled: timeline.count > 1
    opacity: enabled ? 1 : 0.38
    color: timeline.loader.playing
      ? Style.selectedFillFor(Color.popups.text, Color.accent)
      : Style.controlFill(false, playMouse.containsMouse, Color.popups.text, Color.accent)
    borderSpec: Border.controlSpec(timeline.loader.playing
      ? "selected" : (playMouse.containsMouse ? "hover-cursor" : "normal"), Color.popups.text, Color.accent)

    Text {
      textFormat: Text.PlainText
      anchors.centerIn: parent
      text: timeline.loader.playing ? "❚❚" : "▶"
      color: timeline.loader.playing
        ? Style.selectedStateColor(Color.popups.text, Color.accent)
        : (playMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : Color.popups.text)
      font.family: timeline.panel.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
    }

    MouseArea {
      id: playMouse
      anchors.fill: parent
      enabled: parent.enabled
      hoverEnabled: true
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: timeline.loader.togglePlay()
    }
  }

  // The step's day, time and distance from now, at a fixed width so the
  // track keeps its length.
  TextMetrics {
    id: labelMetrics
    font.family: timeline.panel.fontFamily
    font.pixelSize: Style.font.caption
    font.bold: true
    text: "Wed. 00:00 · +120 h"
  }
  Text {
    id: stepLabel
    textFormat: Text.PlainText
    anchors.right: parent.right
    anchors.verticalCenter: parent.verticalCenter
    width: labelMetrics.width + Style.space(8)
    horizontalAlignment: Text.AlignRight
    text: timeline.labelFor(timeline.shownIndex)
    color: Color.popups.text
    font.family: timeline.panel.fontFamily
    font.pixelSize: Style.font.caption
    font.bold: true
  }

  Item {
    id: track
    anchors.left: playButton.right
    anchors.right: stepLabel.left
    anchors.leftMargin: Style.space(14)
    anchors.rightMargin: Style.space(14)
    anchors.verticalCenter: parent.verticalCenter
    height: parent.height
    readonly property real lineHeight: Style.space(4)

    // The forecast on an accent tint.
    Rectangle {
      anchors.verticalCenter: parent.verticalCenter
      width: parent.width
      height: track.lineHeight
      radius: height / 2
      color: Color.accent
      opacity: 0.3
    }
    // Played part up to the step on screen.
    Rectangle {
      anchors.verticalCenter: parent.verticalCenter
      width: timeline.xFor(timeline.shownIndex)
      height: track.lineHeight
      radius: height / 2
      color: Color.popups.text
      opacity: 0.55
      Behavior on width {
        enabled: timeline.dragIndex < 0
        NumberAnimation { duration: 120; easing.type: Easing.OutCubic }
      }
    }
    // A notch per step, taller for now and at each local midnight.
    Repeater {
      model: timeline.count
      Rectangle {
        required property int index
        readonly property bool isNow: index === timeline.loader.nowIndex
        readonly property bool midnight: timeline.panel.placeClock(timeline.steps[index] || 0) === "00:00"
        x: timeline.xFor(index) - width / 2
        anchors.verticalCenter: parent.verticalCenter
        width: Math.max(1, Style.space(isNow ? 2 : 1))
        height: isNow ? track.lineHeight + Style.space(10) : track.lineHeight + Style.space(midnight ? 7 : 3)
        radius: 1
        color: isNow ? Color.popups.text : Color.popups.background
        opacity: isNow ? 0.8 : 1
      }
    }
    // The step on screen.
    BorderSurface {
      readonly property bool hot: trackMouse.containsMouse || timeline.dragIndex >= 0
      width: Style.space(14)
      height: width
      radius: width / 2
      anchors.verticalCenter: parent.verticalCenter
      x: timeline.xFor(timeline.shownIndex) - width / 2
      color: Color.popups.text
      borderSpec: Border.flat(Color.popups.background, Math.max(1, Style.space(2)))
      scale: hot ? 1.15 : 1
      Behavior on x {
        enabled: timeline.dragIndex < 0
        NumberAnimation { duration: 120; easing.type: Easing.OutCubic }
      }
      Behavior on scale { NumberAnimation { duration: 110; easing.type: Easing.OutCubic } }
    }
    // The time under the pointer, above the track.
    Rectangle {
      visible: timeline.hoverIndex >= 0 && timeline.dragIndex < 0
      x: Math.max(-track.x, Math.min(track.width - width, timeline.xFor(timeline.hoverIndex) - width / 2))
      y: -height + Style.space(2)
      width: hoverText.implicitWidth + Style.space(10)
      height: hoverText.implicitHeight + Style.space(4)
      radius: Style.cornerRadius
      color: Color.popups.background
      border.color: Color.popups.border
      border.width: Style.spacing.hairline

      Text {
        id: hoverText
        textFormat: Text.PlainText
        anchors.centerIn: parent
        text: timeline.labelFor(timeline.hoverIndex)
        color: Color.popups.text
        font.family: timeline.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }

    MouseArea {
      id: trackMouse
      anchors.fill: parent
      anchors.leftMargin: -Style.space(7)
      anchors.rightMargin: -Style.space(7)
      hoverEnabled: true
      enabled: timeline.count > 1
      cursorShape: Qt.PointingHandCursor
      preventStealing: true
      onPressed: function(mouse) {
        timeline.loader.playing = false
        timeline.dragIndex = timeline.indexAt(mouse.x - Style.space(7))
        timeline.loader.showStep(timeline.dragIndex)
      }
      onPositionChanged: function(mouse) {
        if (!pressed) return
        var index = timeline.indexAt(mouse.x - Style.space(7))
        if (index === timeline.dragIndex) return
        timeline.dragIndex = index
        timeline.loader.showStep(index)
      }
      onReleased: timeline.dragIndex = -1
      onCanceled: timeline.dragIndex = -1

      // Shift with the wheel, or a sideways swipe, steps through the times
      // (through the page's router, Panel.routeWheel); a plain wheel
      // scrolls the page.
      property real wheelAccumulated: 0
      readonly property bool wheelEnabled: enabled
      function wantsWheel(wheel) {
        return timeline.panel.wheelIsSideways(wheel)
      }
      function takeWheel(wheel) {
        wheelAccumulated += wheel.angleDelta.y !== 0 ? wheel.angleDelta.y : -wheel.angleDelta.x
        if (Math.abs(wheelAccumulated) < 120) return
        var step = wheelAccumulated > 0 ? -1 : 1
        wheelAccumulated = 0
        timeline.loader.stepBy(step)
      }
      Component.onCompleted: timeline.panel.registerWheelArea(trackMouse)
      Component.onDestruction: timeline.panel.unregisterWheelArea(trackMouse)
    }
  }
}
