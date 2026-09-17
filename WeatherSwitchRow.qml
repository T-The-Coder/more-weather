import QtQuick
import qs.Commons

// One labelled on/off switch in the settings cards. Menu bar entries with a
// hoverKey get a second switch: shown always, or only on hover.
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
  property string hoverKey: ""
  // Width of each switch column, shared with the column headings above.
  property real columnWidth: Style.space(32)
  signal toggled(bool value)
  readonly property bool checked: settingKey !== ""
    ? panel.settingsDisplaySetting(settingKey, true) : switchState
  readonly property bool hoverChecked: hoverKey !== ""
    && panel.settingsDisplaySetting(hoverKey, false) === true

  width: parent ? parent.width : 0
  height: Style.space(34)
  radius: Style.cornerRadius
  enabled: rowEnabled
  opacity: rowEnabled ? 1 : 0.42
  color: displaySettingMouse.containsMouse || hoverSettingMouse.containsMouse
    ? Style.hoverFillFor(panel.foreground, Color.accent)
    : "transparent"

  Text {
    anchors.left: parent.left
    anchors.leftMargin: parent.indented ? Style.space(12) : 0
    anchors.right: permanentColumn.left
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

  Item {
    id: permanentColumn
    anchors.right: switchRow.hoverKey !== "" ? hoverColumn.left : parent.right
    anchors.top: parent.top
    anchors.bottom: parent.bottom
    width: switchRow.hoverKey !== "" ? switchRow.columnWidth : Style.space(32)

    WeatherSwitchToggle {
      panel: switchRow.panel
      anchors.centerIn: parent
      checked: switchRow.checked
    }
  }

  Item {
    id: hoverColumn
    visible: switchRow.hoverKey !== ""
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.bottom: parent.bottom
    width: switchRow.hoverKey !== "" ? switchRow.columnWidth : 0

    WeatherSwitchToggle {
      panel: switchRow.panel
      anchors.centerIn: parent
      checked: switchRow.hoverChecked
    }

    MouseArea {
      id: hoverSettingMouse
      anchors.fill: parent
      enabled: switchRow.rowEnabled && parent.visible
      hoverEnabled: true
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: panel.displayOptionsStore.setSettingsDisplaySetting(switchRow.hoverKey, !switchRow.hoverChecked)
    }
  }

  MouseArea {
    id: displaySettingMouse
    anchors.fill: parent
    anchors.rightMargin: hoverColumn.width
    enabled: parent.rowEnabled
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: {
      if (parent.settingKey !== "") panel.displayOptionsStore.setSettingsDisplaySetting(parent.settingKey, !parent.checked)
      else parent.toggled(!parent.checked)
    }
  }
}
