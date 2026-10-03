import QtQuick
import qs.Commons

// A button of the panel and the settings, reachable by keyboard
// (kbFocused). With a confirmLabel, the first press arms it and a second one
// within four seconds acts, for actions that replace settings.
Rectangle {
  id: button
  required property var panel
  property string label: ""
  property string confirmLabel: ""
  property bool kbFocused: false
  property bool armed: false
  signal activated()

  function press() {
    if (!enabled) return
    if (confirmLabel !== "" && !armed) {
      armed = true
      return
    }
    armed = false
    activated()
  }

  implicitWidth: buttonLabel.implicitWidth + Style.space(28)
  height: Style.space(32)
  radius: Style.cornerRadius
  opacity: enabled ? 1 : 0.42
  color: armed ? Style.selectedFillFor(panel.foreground, Color.accent)
    : (buttonMouse.containsMouse || kbFocused ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")
  border.color: armed || kbFocused ? Color.accent : panel.subtleText
  border.width: Style.spacing.hairline
  onVisibleChanged: armed = false

  Timer {
    running: button.armed
    interval: 4000
    onTriggered: button.armed = false
  }

  Text {
    textFormat: Text.PlainText
    id: buttonLabel
    anchors.centerIn: parent
    // A narrow window shortens the label rather than the button's padding.
    width: Math.min(implicitWidth, button.width - Style.space(28))
    elide: Text.ElideRight
    text: button.armed ? button.confirmLabel : button.label
    color: button.armed ? Style.selectedStateColor(button.panel.foreground, Color.accent) : button.panel.foreground
    font.family: button.panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    font.bold: button.armed
  }

  MouseArea {
    id: buttonMouse
    anchors.fill: parent
    enabled: button.enabled
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: button.press()
  }
}
