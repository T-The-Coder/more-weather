// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import qs.Commons
import qs.Commons as Commons
import "RadarStyle.js" as RadarStyle
import "Providers.js" as Providers

Item {
  id: radarView
  required property var panel
  property bool compact: false
  readonly property string layoutMode: RadarStyle.layout(width, Math.max(0, panel.contentRoot.height - mapToItem(panel.contentRoot, 0, 0).y), Style.font.body, panel.radarFocus)
  readonly property bool full: layoutMode === "FULL" && !compact
  readonly property alias timeline: timeline
  readonly property alias map: mapStage
  width: parent.width
  implicitHeight: chrome.implicitHeight
  Component.onCompleted: panel.radarViewItem = radarView
  Component.onDestruction: if (panel.radarViewItem === radarView) panel.radarViewItem = null

  Rectangle { anchors.fill: parent; color: Commons.Color.popups.background }
  Column {
    id: chrome
    width: radarView.width
    spacing: Style.space(8)
  Text {
    textFormat: Text.PlainText
    visible: radarView.full && !panel.radarFocus
    text: panel.upperLabel(panel.i18n("radar"))
    color: Commons.Color.popups.text
    font.family: panel.fontFamily
    font.pixelSize: Style.font.body
    font.letterSpacing: 1
  }
  Item {
    id: siteRow
    width: parent.width
    height: Style.space(24)
    visible: !panel.radarFocus
    Text {
      textFormat: Text.PlainText
      anchors.left: parent.left
      anchors.right: statusBadge.left
      anchors.rightMargin: Style.space(8)
      anchors.verticalCenter: parent.verticalCenter
      text: panel.i18n(Providers.radarLabelKey(panel.radarDisplayProviderId)) + " · " + panel.reportLocation
        + (radarView.full ? " · " + panel.i18n("radarAutomatic") : "")
      elide: Text.ElideRight
      color: Commons.Color.popups.text
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.bold: true
    }
    Row {
      id: statusBadge
      anchors.right: parent.right
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(6)
      Rectangle { width: Style.space(6); height: width; radius: width / 2; anchors.verticalCenter: parent.verticalCenter; color: panel.radarStatusColor }
      Text {
        textFormat: Text.PlainText
        text: panel.i18n(panel.radarFeedState) + (radarView.compact ? " · " + panel.radarAgeText : "")
        color: panel.radarStatusColor
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }
  Text {
    textFormat: Text.PlainText
    id: productLine
    visible: !panel.radarFocus && !radarView.compact
    width: parent.width
    text: panel.radarProductText + " · " + panel.i18n(Providers.radarLabelKey(panel.radarDisplayProviderId))
    color: Commons.Color.popups.text
    opacity: 0.7
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    wrapMode: Text.WordWrap
  }
  Text {
    textFormat: Text.PlainText
    id: metaLine
    visible: !panel.radarFocus && !radarView.compact
    width: parent.width
    horizontalAlignment: Text.AlignRight
    text: panel.radarAgeText
    color: Commons.Color.popups.text
    opacity: 0.7
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
  }
  WeatherRadarMap {
    id: mapStage
    panel: radarView.panel
    width: radarView.width
    height: radarView.panel.mapViewHeight(width)
    // Move the existing map into the content root in Focus, retaining the
    // ready frames and camera; all global shortcuts still reach the panel.
    states: State {
      name: "focus"
      when: radarView.panel.radarFocus
      ParentChange {
        target: mapStage
        parent: radarView.panel.contentRoot
        x: 0; y: 0
        width: radarView.panel.contentRoot.width
        height: radarView.panel.contentRoot.height
      }
      PropertyChanges { target: mapStage; z: 10 }
    }
    Rectangle {
      id: focusStamp
      visible: radarView.panel.radarFocus || radarView.compact
      anchors.right: parent.right
      anchors.left: parent.left
      anchors.bottom: parent.bottom
      anchors.margins: Style.space(8)
      anchors.bottomMargin: Style.space(52)
      height: focusText.implicitHeight + Style.space(8)
      color: Commons.Color.popups.background
      opacity: 0.94
      Rectangle {
        x: Style.space(4)
        y: Style.space(8)
        width: Style.space(6); height: width; radius: width / 2
        color: radarView.panel.radarStatusColor
      }
      Text {
        textFormat: Text.PlainText
        id: focusText
        anchors.fill: parent
        anchors.margins: Style.space(4)
        anchors.leftMargin: Style.space(16)
        text: radarView.panel.radarFocus
          ? radarView.panel.i18n(radarView.panel.radarFeedState) + " · " + radarView.panel.radarStripStamp + " · " + radarView.panel.radarAgeText
          : radarView.panel.radarProductText + " · " + radarView.panel.radarStripStamp
        color: radarView.panel.radarStatusColor
        wrapMode: Text.WordWrap
        font.family: radarView.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }
  WeatherRadarLegend {
    panel: radarView.panel
    visible: !panel.radarFocus && !radarView.compact
    showStrip: radarView.full
  }
  WeatherRadarTimeline {
    id: timeline
    panel: radarView.panel
    width: parent.width
    visible: !panel.radarFocus
    compact: radarView.compact || radarView.width < Style.space(540)
  }
  }
}
