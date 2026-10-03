import QtQuick
import qs.Commons
import qs.Ui

// The sections set to "as tab" share this strip, in their chosen order; the
// number keys pick them the same way. Only the picked section is created.
Column {
  id: tabsSection
  required property var panel
  visible: panel.displayTabs.length > 0
  width: parent ? parent.width : 0
  spacing: Style.space(10)
  // The topmost section shown draws no line above it.
  property bool leading: false
  // Known to the panel, which scrolls the strip into view (IPC `tab`).
  Component.onCompleted: panel.tabsItem = tabsSection
  Component.onDestruction: if (panel.tabsItem === tabsSection) panel.tabsItem = null

  Rectangle {
    visible: !tabsSection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Row {
    id: tabStrip
    anchors.horizontalCenter: parent.horizontalCenter
    spacing: Style.space(5)
    readonly property real tabWidth: Math.min(Style.space(96),
      (tabsSection.width - spacing * Math.max(0, panel.displayTabs.length - 1))
        / Math.max(1, panel.displayTabs.length))
    // Too narrow for a readable name (all seven sections as tabs): the
    // glyph alone, the name in a tooltip.
    readonly property bool glyphOnly: tabWidth < Style.space(80)

    Repeater {
      model: panel.displayTabs

      Rectangle {
        id: tabItem
        required property string modelData
        readonly property bool selected: modelData === panel.currentTab
        width: tabStrip.tabWidth
        height: Style.space(28)
        radius: Style.cornerRadius
        color: selected || tabMouse.containsMouse
          ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        // The section's glyph, then its name (if there is room).
        Row {
          anchors.centerIn: parent
          spacing: Style.space(4)
          width: Math.min(implicitWidth, parent.width - Style.space(8))

          Text {
            textFormat: Text.PlainText
            id: tabGlyph
            anchors.verticalCenter: parent.verticalCenter
            text: panel.sectionTabGlyph(parent.parent.modelData)
            color: parent.parent.selected
              ? Style.hoverStateColor(panel.foreground, Color.accent)
              : panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }

          Text {
            textFormat: Text.PlainText
            visible: !tabStrip.glyphOnly
            anchors.verticalCenter: parent.verticalCenter
            width: Math.min(implicitWidth, parent.parent.width - Style.space(8) - tabGlyph.width - parent.spacing)
            text: panel.sectionTabLabel(parent.parent.modelData)
            color: parent.parent.selected
              ? Style.hoverStateColor(panel.foreground, Color.accent)
              : panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: parent.parent.selected
            elide: Text.ElideRight
          }
        }

        MouseArea {
          id: tabMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.activeTab = parent.modelData
        }

        PanelToolTip {
          visible: tabStrip.glyphOnly && tabMouse.containsMouse
          text: panel.sectionTabLabel(tabItem.modelData)
          fontFamily: panel.fontFamily
        }
      }
    }
  }

  Loader {
    id: tabContent
    width: parent.width
    sourceComponent: panel.currentTab !== "" ? panel.sectionComponent(panel.currentTab) : null
    onLoaded: {
      item.inTab = true
      if (panel.currentTab === "daily") panel.dailySection = item
    }
  }
}
