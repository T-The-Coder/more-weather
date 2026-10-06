import QtQuick
import qs.Commons

// One labelled switch in the settings cards. Menu bar entries carry three of
// them: shown always, only when the value stands out, or only on hover.
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
  property string relevantKey: ""
  // Rows that can be moved within their view's order carry the arrows.
  property string orderListKey: ""
  property string orderEntry: ""
  readonly property var orderList: orderListKey !== "" ? panel.settingsOrderFor(orderListKey) : []
  readonly property int orderIndex: orderEntry !== "" ? orderList.indexOf(orderEntry) : -1
  readonly property bool orderable: orderIndex >= 0
  property string hoverKey: ""
  // False for an entry that can only be moved, never switched off.
  property bool showSwitch: true
  // Keyboard focus in the settings, and which switch column it is on
  // (0 always, 1 when relevant, 2 on hover).
  property bool kbFocused: false
  property int kbColumn: 0
  // Width of each switch column, shared with the column headings above.
  property real columnWidth: Style.space(32)
  readonly property bool columned: hoverKey !== ""
  signal toggled(bool value)
  readonly property bool checked: settingKey !== ""
    ? panel.settingsDisplaySetting(settingKey, true) : switchState
  readonly property bool relevantChecked: relevantKey !== ""
    && panel.settingsDisplaySetting(relevantKey, false) === true
  readonly property bool hoverChecked: hoverKey !== ""
    && panel.settingsDisplaySetting(hoverKey, false) === true

  width: parent ? parent.width : 0
  height: Style.space(34)
  radius: Style.cornerRadius
  enabled: rowEnabled
  opacity: rowEnabled ? 1 : 0.42
  color: displaySettingMouse.containsMouse || relevantSettingMouse.containsMouse
      || hoverSettingMouse.containsMouse || kbFocused
    ? Style.hoverFillFor(panel.foreground, Color.accent)
    : "transparent"
  border.color: kbFocused ? Color.accent : "transparent"
  border.width: kbFocused ? Style.spacing.hairline : 0

  Row {
    id: orderButtons
    visible: switchRow.orderable
    anchors.left: parent.left
    anchors.leftMargin: parent.indented ? Style.space(6) : 0
    anchors.verticalCenter: parent.verticalCenter
    spacing: Style.space(2)

    Repeater {
      model: [-1, 1]

      Rectangle {
        required property int modelData
        readonly property bool usable: switchRow.rowEnabled
          && switchRow.orderIndex + modelData >= 0
          && switchRow.orderIndex + modelData < switchRow.orderList.length
        width: Style.space(18)
        height: Style.space(18)
        radius: Style.cornerRadius
        opacity: usable ? 1 : 0.3
        color: orderMouse.containsMouse && usable
          ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        Text {
          textFormat: Text.PlainText
          anchors.centerIn: parent
          // The font draws ▼ about a pixel above its middle (measured,
          // tests/ui/glyph-check.py); ▲ sits right.
          anchors.verticalCenterOffset: parent.modelData > 0 ? 1 : 0
          text: parent.modelData < 0 ? "▲" : "▼"
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
        }

        MouseArea {
          id: orderMouse
          anchors.fill: parent
          enabled: parent.usable
          hoverEnabled: true
          cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
          onClicked: panel.displayOptionsStore.moveSettingsDisplayEntry(
            switchRow.orderListKey, switchRow.orderEntry, parent.modelData)
        }
      }
    }
  }

  Text {
    textFormat: Text.PlainText
    anchors.left: switchRow.orderable ? orderButtons.right : parent.left
    // A row flush with the card text still keeps its label off the focus ring.
    anchors.leftMargin: switchRow.orderable ? Style.space(6)
      : (parent.indented ? Style.space(12) : (switchRow.kbFocused ? Style.space(6) : 0))
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
    anchors.right: switchRow.columned ? relevantColumn.left : parent.right
    anchors.top: parent.top
    anchors.bottom: parent.bottom
    width: switchRow.columned ? switchRow.columnWidth : Style.space(32)

    WeatherSwitchToggle {
      visible: switchRow.showSwitch
      panel: switchRow.panel
      anchors.centerIn: parent
      checked: switchRow.checked
    }

    ColumnCursor { visible: switchRow.kbFocused && switchRow.columned && switchRow.kbColumn === 0 }
  }

  // Entries without a rule for “relevant” leave this column empty rather than offer a switch that would mean the same as the one beside it.
  Item {
    id: relevantColumn
    visible: switchRow.columned
    anchors.right: hoverColumn.left
    anchors.top: parent.top
    anchors.bottom: parent.bottom
    width: switchRow.columned ? switchRow.columnWidth : 0

    WeatherSwitchToggle {
      visible: switchRow.relevantKey !== ""
      panel: switchRow.panel
      anchors.centerIn: parent
      checked: switchRow.relevantChecked
    }

    ColumnCursor { visible: switchRow.kbFocused && switchRow.kbColumn === 1 }

    Text {
      textFormat: Text.PlainText
      visible: switchRow.relevantKey === ""
      anchors.centerIn: parent
      text: "–"
      color: panel.subtleText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
    }

    MouseArea {
      id: relevantSettingMouse
      anchors.fill: parent
      enabled: switchRow.rowEnabled && switchRow.relevantKey !== ""
      hoverEnabled: true
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: panel.displayOptionsStore.setSettingsDisplaySetting(switchRow.relevantKey, !switchRow.relevantChecked)
    }
  }

  Item {
    id: hoverColumn
    visible: switchRow.columned
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.bottom: parent.bottom
    width: switchRow.columned ? switchRow.columnWidth : 0

    WeatherSwitchToggle {
      panel: switchRow.panel
      anchors.centerIn: parent
      checked: switchRow.hoverChecked
    }

    ColumnCursor { visible: switchRow.kbFocused && switchRow.kbColumn === 2 }

    MouseArea {
      id: hoverSettingMouse
      anchors.fill: parent
      enabled: switchRow.rowEnabled && parent.visible
      hoverEnabled: true
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: panel.displayOptionsStore.setSettingsDisplaySetting(switchRow.hoverKey, !switchRow.hoverChecked)
    }
  }

  // Marks the switch column the keyboard is on in a menu bar row.
  component ColumnCursor: Rectangle {
    anchors.fill: parent
    anchors.margins: Style.space(3)
    radius: Style.cornerRadius
    color: "transparent"
    border.color: Color.accent
    border.width: Style.spacing.hairline
  }

  MouseArea {
    id: displaySettingMouse
    anchors.fill: parent
    anchors.leftMargin: orderButtons.visible ? orderButtons.width + Style.space(6) : 0
    anchors.rightMargin: relevantColumn.width + hoverColumn.width
    enabled: parent.rowEnabled && parent.showSwitch
    hoverEnabled: true
    cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
    onClicked: {
      if (parent.settingKey !== "") panel.displayOptionsStore.setSettingsDisplaySetting(parent.settingKey, !parent.checked)
      else parent.toggled(!parent.checked)
    }
  }
}
