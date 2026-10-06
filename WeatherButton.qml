import QtQuick
import qs.Commons
import qs.Ui

// A button of the panel and the settings, reachable by keyboard
// (kbFocused). With a confirmLabel, the first press arms it and a second one
// within four seconds acts, for actions that replace settings.
Rectangle {
  id: button
  required property var panel
  property string label: ""
  property string confirmLabel: ""
  // The full name where the label is a glyph ("+"): shown after a short
  // delay under the pointer, and the accessible name.
  property string tooltip: ""
  // Compact: the controls' height (Style.spacing.controlHeight, 28), to sit
  // in a row with dropdowns; otherwise 32.
  property bool compact: false
  // The label's size: the body's small size unless set (a glyph such as
  // "+" reads better at the body size).
  property real labelSize: Style.font.bodySmall
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
  height: compact ? Style.spacing.controlHeight : Style.space(32)
  radius: Style.cornerRadius
  opacity: enabled ? 1 : 0.42
  color: armed ? Style.selectedFillFor(panel.foreground, Color.accent)
    : (buttonMouse.containsMouse || kbFocused ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")
  border.color: armed || kbFocused ? Color.accent : panel.subtleText
  border.width: Style.spacing.hairline
  onVisibleChanged: armed = false
  Accessible.role: Accessible.Button
  Accessible.name: tooltip !== "" ? tooltip : label
  Accessible.onPressAction: press()

  Timer {
    running: button.armed
    interval: 4000
    onTriggered: button.armed = false
  }

  Text {
    textFormat: Text.PlainText
    id: buttonLabel
    anchors.centerIn: parent
    // A narrow window shortens the label rather than the button's padding;
    // centred in its box, so a glyph in a square button (narrower than the
    // padding) sits in the middle instead of starting there.
    width: Math.min(implicitWidth, Math.max(button.width - Style.space(28), Math.min(implicitWidth, button.width - Style.space(4))))
    horizontalAlignment: Text.AlignHCenter
    elide: Text.ElideRight
    text: button.armed ? button.confirmLabel : button.label
    color: button.armed ? Style.selectedStateColor(button.panel.foreground, Color.accent) : button.panel.foreground
    font.family: button.panel.fontFamily
    font.pixelSize: button.labelSize
    font.bold: button.armed
  }

  MouseArea {
    id: buttonMouse
    anchors.fill: parent
    enabled: button.enabled
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: button.press()

    PanelToolTip {
      visible: buttonMouse.containsMouse && button.tooltip !== ""
      text: button.tooltip
      fontFamily: button.panel.fontFamily
    }
  }
}
