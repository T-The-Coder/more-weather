import QtQuick
import qs.Commons

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
    // Up to six tabs share the width; a few keep the familiar size.
    readonly property real tabWidth: Math.min(Style.space(82),
      (tabsSection.width - spacing * Math.max(0, panel.displayTabs.length - 1))
        / Math.max(1, panel.displayTabs.length))

    Repeater {
      model: panel.displayTabs

      Rectangle {
        required property string modelData
        readonly property bool selected: modelData === panel.currentTab
        width: tabStrip.tabWidth
        height: Style.space(28)
        radius: Style.cornerRadius
        color: selected || tabMouse.containsMouse
          ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        Text {
          anchors.centerIn: parent
          width: Math.min(implicitWidth, parent.width - Style.space(8))
          text: panel.sectionTabLabel(modelData)
          color: parent.selected
            ? Style.hoverStateColor(panel.foreground, Color.accent)
            : panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: parent.selected
          elide: Text.ElideRight
        }

        MouseArea {
          id: tabMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.activeTab = modelData
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
