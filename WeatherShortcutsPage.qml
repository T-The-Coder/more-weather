import QtQuick
import qs.Commons

// Settings page listing every keyboard shortcut and the menu bar clicks.
// Mirrors Panel.handlePanelKey and BarWidget.onPressed; keep them in sync.
Column {
  id: shortcutsPage
  required property var panel
  width: parent ? parent.width : 0
  spacing: Style.space(12)

  readonly property var groups: [
    {
      title: "shortcutsGroupGeneral",
      rows: [
        { keys: ["Esc"], action: "shortcutClose" },
        { keys: ["Tab", "⇧ Tab"], action: "shortcutSwitchPanel" },
        { keys: ["Ctrl ,"], action: "shortcutSettings" },
        { keys: ["r", "F5"], action: "shortcutRefresh" },
        { keys: ["o"], action: "shortcutOpenApp" },
        { keys: ["/", "Enter"], action: "shortcutSearch" }
      ]
    },
    {
      title: "shortcutsGroupNavigation",
      rows: [
        { keys: ["↑ ↓", "j k"], action: "shortcutScroll" },
        { keys: ["PgUp", "PgDn"], action: "shortcutPage" },
        { keys: ["Home", "End"], action: "shortcutJump" },
        { keys: ["← →", "h l"], action: "shortcutScrollDaily" }
      ]
    },
    {
      title: "shortcutsGroupForecast",
      rows: [
        { keys: ["1", "2", "3"], action: "shortcutViews" },
        { keys: ["← →", "h l"], action: "shortcutRadarStep" },
        { keys: ["Space"], action: "shortcutRadarPlay" },
        { keys: ["+", "−"], action: "shortcutZoom" },
        { keys: ["0"], action: "shortcutZoomReset" }
      ]
    },
    {
      title: "shortcutsGroupSearch",
      rows: [
        { keys: ["↑ ↓"], action: "shortcutSearchSelect" },
        { keys: ["Tab"], action: "shortcutSearchSection" },
        { keys: ["Enter"], action: "shortcutSearchPick" },
        { keys: ["+", "−"], action: "shortcutSearchFavorite" },
        { keys: ["Esc"], action: "shortcutSearchCancel" }
      ]
    },
    {
      title: "shortcutsGroupSettings",
      rows: [
        { keys: ["← →"], action: "shortcutSettingsPages" },
        { keys: ["Esc"], action: "shortcutSettingsClose" }
      ]
    },
    {
      title: "shortcutsGroupMouse",
      rows: [
        { keys: ["mouseLeft"], translateKeys: true, action: "shortcutMouseToggle" },
        { keys: ["mouseLeft"], translateKeys: true, action: "shortcutMouseOpenApp" },
        { keys: ["mouseMiddle"], translateKeys: true, action: "shortcutMouseRefresh" },
        { keys: ["mouseRight"], translateKeys: true, action: "shortcutMouseNotify" }
      ]
    }
  ]

  Text {
    width: parent.width
    text: panel.i18n("shortcutsHint")
    color: panel.mutedText
    font.family: panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    wrapMode: Text.WordWrap
  }

  Repeater {
    model: shortcutsPage.groups

    Rectangle {
      id: groupCard
      required property var modelData
      width: shortcutsPage.width
      height: groupContent.implicitHeight + Style.space(20)
      radius: Style.cornerRadius
      color: "transparent"
      border.color: shortcutsPage.panel.subtleText
      border.width: Style.spacing.hairline

      Column {
        id: groupContent
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Style.space(10)
        spacing: Style.space(6)

        Text {
          text: shortcutsPage.panel.i18n(groupCard.modelData.title)
          color: shortcutsPage.panel.foreground
          font.family: shortcutsPage.panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          font.bold: true
          font.letterSpacing: 1
        }

        Repeater {
          model: groupCard.modelData.rows

          Item {
            id: shortcutRow
            required property var modelData
            width: groupContent.width
            height: Math.max(keyRow.height, actionText.implicitHeight)

            // Key caps in a fixed-width column so the descriptions line up.
            Row {
              id: keyRow
              width: Math.round(groupContent.width * 0.36)
              spacing: Style.space(4)

              Repeater {
                model: shortcutRow.modelData.keys

                Rectangle {
                  required property string modelData
                  width: keyLabel.implicitWidth + Style.space(12)
                  height: keyLabel.implicitHeight + Style.space(6)
                  radius: Math.min(4, Style.cornerRadius)
                  color: Style.hoverFillFor(shortcutsPage.panel.foreground, Color.accent)
                  border.color: shortcutsPage.panel.subtleText
                  border.width: Style.spacing.hairline

                  Text {
                    id: keyLabel
                    anchors.centerIn: parent
                    text: shortcutRow.modelData.translateKeys
                      ? shortcutsPage.panel.i18n(parent.modelData) : parent.modelData
                    color: shortcutsPage.panel.foreground
                    font.family: shortcutsPage.panel.fontFamily
                    font.pixelSize: Style.font.caption
                    font.bold: true
                  }
                }
              }
            }

            Text {
              id: actionText
              anchors.left: keyRow.right
              anchors.leftMargin: Style.space(8)
              anchors.right: parent.right
              anchors.verticalCenter: keyRow.verticalCenter
              text: shortcutsPage.panel.i18n(shortcutRow.modelData.action)
              color: shortcutsPage.panel.mutedText
              font.family: shortcutsPage.panel.fontFamily
              font.pixelSize: Style.font.bodySmall
              wrapMode: Text.WordWrap
            }
          }
        }
      }
    }
  }
}
