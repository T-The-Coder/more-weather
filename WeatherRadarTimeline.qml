import QtQuick
import qs.Commons
import qs.Ui

// Transport under the radar map, after the Weather Radar plugin: play /
// pause, a track with a notch per frame to drag or click through them, and
// the time of the frame on screen. The frame for now carries a taller notch;
// forecast frames after it sit on a track tinted in the accent colour, and a
// frame still loading shows a faint notch. The panel owns the playback state,
// so the keys (← → Space) and this stay in step.
Item {
  id: timeline
  required property var panel

  readonly property var frames: panel.radarFrames
  // Frames that can be shown: from radarFirstFrameIndex (DWD drops past
  // frames of its nowcast) to the last.
  readonly property int first: Math.min(panel.radarFirstFrameIndex, Math.max(0, frames.length - 1))
  readonly property int count: Math.max(0, frames.length - first)
  readonly property int nowIndex: {
    var best = -1
    var bestGap = Infinity
    var now = panel.nowDate.getTime()
    for (var i = first; i < frames.length; ++i) {
      var gap = Math.abs(new Date(frames[i].timestamp).getTime() - now)
      if (gap < bestGap) { best = i; bestGap = gap }
    }
    return best
  }
  readonly property int shownIndex: dragIndex >= 0 ? dragIndex : panel.radarFrameIndex
  property int dragIndex: -1
  readonly property int hoverIndex: trackMouse.containsMouse ? indexAt(trackMouse.mouseX - Style.space(7)) : -1

  function xFor(index) {
    if (count < 2) return 0
    return track.width * (index - first) / (count - 1)
  }
  function indexAt(x) {
    if (count < 2) return first
    return first + Math.max(0, Math.min(count - 1, Math.round(x / track.width * (count - 1))))
  }
  function choose(index) {
    if (index === panel.radarFrameIndex) return
    panel.scrubRadarFrame(index)
  }

  visible: frames.length > 0
  height: Style.space(34)

  // Play / pause.
  BorderSurface {
    id: playButton
    anchors.left: parent.left
    anchors.verticalCenter: parent.verticalCenter
    width: Style.space(28)
    height: Style.space(24)
    radius: Style.cornerRadius
    enabled: panel.radarPlayableFrameCount > 1
    opacity: enabled ? 1 : 0.38
    color: panel.radarPlaying
      ? Style.selectedFillFor(Color.popups.text, Color.accent)
      : Style.controlFill(false, playMouse.containsMouse, Color.popups.text, Color.accent)
    borderSpec: Border.controlSpec(panel.radarPlaying
      ? "selected" : (playMouse.containsMouse ? "hover-cursor" : "normal"), Color.popups.text, Color.accent)

    Text {
      textFormat: Text.PlainText
      anchors.centerIn: parent
      text: panel.radarPlaying ? "❚❚" : "▶"
      color: panel.radarPlaying
        ? Style.selectedStateColor(Color.popups.text, Color.accent)
        : (playMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : Color.popups.text)
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
    }

    MouseArea {
      id: playMouse
      anchors.fill: parent
      enabled: parent.enabled
      hoverEnabled: true
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: panel.toggleRadarPlayback()
    }
  }

  // The frame's time and its distance from now. A fixed width, so the track
  // never changes length while the label changes.
  TextMetrics {
    id: labelMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    font.bold: true
    text: "00:00 · +120 min"
  }
  Text {
    textFormat: Text.PlainText
    id: frameLabel
    anchors.right: parent.right
    anchors.verticalCenter: parent.verticalCenter
    width: labelMetrics.width + Style.space(4)
    horizontalAlignment: Text.AlignRight
    text: timeline.frames.length
      ? panel.radarFrameClock(timeline.frames[timeline.shownIndex]) + " · " + panel.radarFrameLead(timeline.shownIndex)
      : "–"
    color: Color.popups.text
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    font.bold: true
  }

  Item {
    id: track
    anchors.left: playButton.right
    anchors.right: frameLabel.left
    anchors.leftMargin: Style.space(14)
    anchors.rightMargin: Style.space(14)
    anchors.verticalCenter: parent.verticalCenter
    height: parent.height

    readonly property real lineHeight: Style.space(4)

    // Past and now on the plain track, the forecast on an accent tint.
    Rectangle {
      anchors.verticalCenter: parent.verticalCenter
      width: parent.width
      height: track.lineHeight
      radius: height / 2
      color: Color.popups.text
      opacity: 0.16
    }
    Rectangle {
      visible: timeline.nowIndex >= 0 && timeline.nowIndex < timeline.frames.length - 1
      anchors.verticalCenter: parent.verticalCenter
      x: timeline.xFor(timeline.nowIndex)
      width: parent.width - x
      height: track.lineHeight
      radius: height / 2
      color: Color.accent
      opacity: 0.3
    }
    // Played part up to the frame on screen.
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

    // A notch per frame; faint while its picture is still loading.
    Repeater {
      model: timeline.count

      Rectangle {
        required property int index
        readonly property int frame: timeline.first + index
        readonly property bool isNow: frame === timeline.nowIndex
        x: timeline.xFor(frame) - width / 2
        anchors.verticalCenter: parent.verticalCenter
        width: Math.max(1, Style.space(2))
        height: isNow ? track.lineHeight + Style.space(10) : track.lineHeight + Style.space(4)
        radius: 1
        color: isNow ? Color.popups.text : Color.popups.background
        opacity: isNow ? 0.8 : (timeline.panel.radarFrameReady[frame] ? 1 : 0.45)
      }
    }

    // The frame on screen.
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
        textFormat: Text.PlainText
        id: hoverText
        anchors.centerIn: parent
        text: timeline.hoverIndex >= 0
          ? panel.radarFrameClock(timeline.frames[timeline.hoverIndex]) + " · " + panel.radarFrameLead(timeline.hoverIndex)
          : ""
        color: Color.popups.text
        font.family: panel.fontFamily
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
        timeline.dragIndex = timeline.indexAt(mouse.x - Style.space(7))
        timeline.choose(timeline.dragIndex)
      }
      onPositionChanged: function(mouse) {
        if (!pressed) return
        var index = timeline.indexAt(mouse.x - Style.space(7))
        if (index === timeline.dragIndex) return
        timeline.dragIndex = index
        timeline.choose(index)
      }
      onReleased: timeline.dragIndex = -1
      onCanceled: timeline.dragIndex = -1
      // Shift with the wheel, or a sideways swipe, steps through the frames
      // (through the page's router, Panel.routeWheel), a frame per notch's
      // worth; a plain wheel scrolls the page.
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
        var next = Math.max(timeline.first, Math.min(timeline.frames.length - 1, timeline.panel.radarFrameIndex + step))
        timeline.choose(next)
      }
      Component.onCompleted: timeline.panel.registerWheelArea(trackMouse)
      Component.onDestruction: timeline.panel.unregisterWheelArea(trackMouse)
    }
  }
}
