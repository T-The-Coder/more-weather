import QtQuick
import qs.Commons

// The on/off pill used by WeatherSwitchRow.
Rectangle {
  id: toggle
  required property var panel
  property bool checked: false

  width: Style.space(32)
  height: Style.space(18)
  radius: height / 2
  color: checked ? Color.accent : panel.subtleText
  opacity: checked ? 0.9 : 0.42

  Rectangle {
    width: Style.space(14)
    height: width
    radius: width / 2
    y: (parent.height - height) / 2
    x: toggle.checked ? toggle.width - width - Style.space(2) : Style.space(2)
    color: Color.popups.background
    Behavior on x { NumberAnimation { duration: 100 } }
  }
}
