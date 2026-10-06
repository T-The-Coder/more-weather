import QtQuick
import qs.Commons

// "Ctrl + wheel to zoom", briefly, when a plain wheel passes over a map or
// the globe (show()); not while the control hints are off.
Rectangle {
  id: zoomHint
  required property var panel
  function show() {
    if (!panel.showHints) return
    opacity = 1
    hideTimer.restart()
  }

  anchors.centerIn: parent
  width: hintText.implicitWidth + Style.space(16)
  height: hintText.implicitHeight + Style.space(8)
  radius: Style.cornerRadius
  color: Color.popups.background
  border.color: Color.popups.border
  border.width: Style.spacing.hairline
  opacity: 0
  visible: opacity > 0
  Behavior on opacity { NumberAnimation { duration: 180 } }

  Text {
    id: hintText
    textFormat: Text.PlainText
    anchors.centerIn: parent
    text: zoomHint.panel.i18n("mapZoomHint")
    color: Color.popups.text
    font.family: zoomHint.panel.fontFamily
    font.pixelSize: Style.font.caption
  }
  Timer {
    id: hideTimer
    interval: 1400
    onTriggered: zoomHint.opacity = 0
  }
}
