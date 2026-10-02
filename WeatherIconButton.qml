import QtQuick
import qs.Commons

// A glyph that acts: start, pause, lap, delete. `active` marks a switch that
// is on; `armed` a delete waiting for its second press.
Rectangle {
  id: iconButton
  required property var panel
  property string glyph: ""
  property bool active: false
  property bool armed: false
  property bool kbFocused: false
  property real glyphSize: Style.font.title
  signal activated()

  implicitWidth: Style.space(28)
  implicitHeight: Style.space(28)
  radius: Style.cornerRadius
  opacity: enabled ? 1 : 0.42
  color: armed ? Style.selectedFillFor(panel.foreground, Color.urgent)
    : (active ? Style.selectedFillFor(panel.foreground, Color.accent)
      : (iconMouse.containsMouse || kbFocused ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"))
  border.color: armed ? Color.urgent : (kbFocused ? Color.accent : "transparent")
  border.width: armed || kbFocused ? Style.spacing.hairline : 0

  Text {
    anchors.centerIn: parent
    text: iconButton.glyph
    color: iconButton.armed ? Color.urgent
      : (iconButton.active ? Style.selectedStateColor(iconButton.panel.foreground, Color.accent) : iconButton.panel.foreground)
    font.family: iconButton.panel.fontFamily
    font.pixelSize: iconButton.glyphSize
  }

  MouseArea {
    id: iconMouse
    anchors.fill: parent
    enabled: iconButton.enabled
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: iconButton.activated()
  }
}
