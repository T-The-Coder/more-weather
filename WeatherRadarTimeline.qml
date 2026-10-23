// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import qs.Commons
import qs.Commons as Commons
import qs.Ui

Item {
  id: timeline
  required property var panel
  property bool compact: false
  readonly property var frames: panel.radarFrames
  readonly property int first: panel.radarFirstFrameIndex
  readonly property int count: panel.radarPlayableFrameCount
  readonly property int shownIndex: panel.radarHasDisplayedFrame ? panel.radarDisplayedFrameIndex : -1
  readonly property int tickCount: ticks.count
  height: Style.space(compact ? 64 : 44)
  LayoutMirroring.enabled: false
  LayoutMirroring.childrenInherit: true
  function choose(index) { panel.scrubRadarFrame(index) }
  function indexAt(x) { return first + Math.round(Math.max(0, Math.min(1, x / Math.max(1, track.width))) * Math.max(0, count - 1)) }

  Row {
    id: transport
    anchors.left: parent.left
    anchors.bottom: parent.bottom
    spacing: Style.space(4)
    Repeater {
      model: ["radarFirst", "radarPrevious", "shortcutRadarPlay", "radarNext", "radarLast"]
      BorderSurface {
        required property int index
        required property string modelData
        width: Style.space(28)
        height: Style.space(26)
        enabled: timeline.count > 1
        opacity: enabled ? 1 : 0.35
        color: Style.controlFill(index === 2 && timeline.panel.radarPlaying, hit.containsMouse, Commons.Color.popups.text, Commons.Color.accent)
        borderSpec: Border.controlSpec(hit.containsMouse ? "hover-cursor" : "normal", Commons.Color.popups.text, Commons.Color.accent)
        Accessible.role: Accessible.Button
        Accessible.name: timeline.panel.i18n(modelData)
        Text {
          textFormat: Text.PlainText
          anchors.centerIn: parent
          text: ["|‹", "‹", timeline.panel.radarPlaying ? "Ⅱ" : "▷", "›", "›|"][parent.index]
          color: Commons.Color.popups.text
          font.family: timeline.panel.fontFamily
          font.pixelSize: Style.font.body
        }
        MouseArea {
          id: hit
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: {
            switch (parent.index) {
            case 0: timeline.choose(timeline.first); break
            case 1: timeline.panel.stepRadarBackward(); break
            case 2: timeline.panel.toggleRadarPlayback(); break
            case 3: timeline.panel.stepRadarForward(); break
            case 4: timeline.choose(timeline.frames.length - 1); break
            }
          }
        }
      }
    }
  }
  Item {
    id: stripHeader
    anchors.left: timeline.compact ? parent.left : transport.right
    anchors.leftMargin: timeline.compact ? 0 : Style.space(12)
    anchors.right: parent.right
    height: Style.space(18)
    Text {
      textFormat: Text.PlainText
      id: stripStamp
      anchors.left: parent.left
      anchors.right: frameIndex.left
      anchors.rightMargin: Style.space(8)
      text: timeline.panel.radarStripStamp
      elide: Text.ElideRight
      color: Commons.Color.popups.text
      opacity: 0.7
      font.family: timeline.panel.fontFamily
      font.pixelSize: Style.font.caption
    }
    Text {
      textFormat: Text.PlainText
      id: frameIndex
      anchors.right: parent.right
      text: timeline.panel.i18n("radarFrameIndex", { current: timeline.shownIndex < timeline.first ? 0 : timeline.shownIndex - timeline.first + 1, total: timeline.count })
      color: Commons.Color.popups.text
      opacity: 0.7
      font.family: timeline.panel.fontFamily
      font.pixelSize: Style.font.caption
    }
  }
  Item {
    id: track
    anchors.left: transport.right
    anchors.leftMargin: Style.space(12)
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    height: Style.space(24)
    Repeater {
      id: ticks
      model: timeline.count
      BorderSurface {
        required property int index
        readonly property int frame: timeline.first + index
        readonly property bool selected: frame === timeline.shownIndex
        readonly property bool forecast: timeline.panel.radarFrameIsForecast(timeline.frames[frame])
        x: timeline.count > 1 ? index * (track.width - width) / (timeline.count - 1) : (track.width - width) / 2
        anchors.verticalCenter: parent.verticalCenter
        width: Style.space(selected || forecast ? 3 : 2)
        height: Style.space(selected ? 16 : 10)
        color: selected ? Commons.Color.accent : forecast ? "transparent" : Commons.Color.popups.text
        opacity: selected ? 1 : timeline.panel.radarFrameReady[frame] ? 0.6 : 0.25
        borderSpec: Border.flat(forecast ? Commons.Color.accent : "transparent", Style.spacing.hairline)
      }
    }
    MouseArea {
      id: trackMouse
      anchors.fill: parent
      enabled: timeline.count > 1
      preventStealing: true
      hoverEnabled: true
      cursorShape: Qt.PointingHandCursor
      onPressed: mouse => timeline.choose(timeline.indexAt(mouse.x))
      onPositionChanged: mouse => { if (pressed) timeline.choose(timeline.indexAt(mouse.x)) }
      property real wheelAccumulated: 0
      readonly property bool wheelEnabled: enabled
      function wantsWheel(wheel) { return timeline.panel.wheelIsSideways(wheel) }
      function takeWheel(wheel) {
        wheelAccumulated += wheel.angleDelta.y !== 0 ? wheel.angleDelta.y : -wheel.angleDelta.x
        if (Math.abs(wheelAccumulated) < 120) return
        timeline.choose(Math.max(timeline.first, Math.min(timeline.frames.length - 1,
          timeline.panel.radarFrameIndex + (wheelAccumulated > 0 ? -1 : 1))))
        wheelAccumulated = 0
      }
      Component.onCompleted: timeline.panel.registerWheelArea(trackMouse)
      Component.onDestruction: timeline.panel.unregisterWheelArea(trackMouse)
    }
  }
}
