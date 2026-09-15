import QtQuick
import qs.Commons

// One labelled on/off switch in the settings cards.
Rectangle {
  id: switchRow
  required property var panel
  property string settingKey: ""
  property string title: ""
  property bool emphasized: false
  property bool rowEnabled: true
  // Rows without a settingKey show `switchState` and report clicks through
  // `toggled` instead of writing a display option.
  property bool switchState: false
  // Card rows sit indented below their card title; a row among other
  // controls (General) lines up with them instead.
  property bool indented: !emphasized
  signal toggled(bool value)
  readonly property bool checked: settingKey !== ""
    ? panel.settingsDisplaySetting(settingKey, true) : switchState

  width: parent ? parent.width : 0
  height: Style.space(34)
  radius: Style.cornerRadius
  enabled: rowEnabled
  opacity: rowEnabled ? 1 : 0.42
  color: displaySettingMouse.containsMouse
    ? Style.hoverFillFor(panel.foreground, Color.accent)
    : "transparent"

  Text {
    anchors.left: parent.left
    anchors.leftMargin: parent.indented ? Style.space(12) : 0
    anchors.right: displaySettingToggle.left
    anchors.rightMargin: Style.space(8)
    anchors.verticalCenter: parent.verticalCenter
    text: parent.title
    color: panel.foreground
    font.family: panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    font.bold: parent.emphasized
    font.letterSpacing: parent.emphasized ? 1 : 0
    elide: Text.ElideRight
  }

  Rectangle {
    id: displaySettingToggle
    anchors.right: parent.right
    anchors.verticalCenter: parent.verticalCenter
    width: Style.space(32)
    height: Style.space(18)
    radius: height / 2
    color: parent.checked ? Color.accent : panel.subtleText
    opacity: parent.checked ? 0.9 : 0.42

    Rectangle {
      width: Style.space(14)
      height: width
      radius: width / 2
      y: (parent.height - height) / 2
      x: displaySettingToggle.parent.checked
        ? displaySettingToggle.width - width - Style.space(2)
        : Style.space(2)
      color: Color.popups.background
      Behavior on x { NumberAnimation { duration: 100 } }
    }
  }

  MouseArea {
    id: displaySettingMouse
    anchors.fill: parent
    enabled: parent.rowEnabled
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: {
      if (parent.settingKey !== "") panel.displayOptionsStore.setSettingsDisplaySetting(parent.settingKey, !parent.checked)
      else parent.toggled(!parent.checked)
    }
  }
}
