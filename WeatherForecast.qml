import QtQuick
import qs.Commons
import "Model.js" as Model
import "Providers.js" as Providers

// Rain / radar / wind tabs. Each view is created only while its tab is
// visible in an open panel; the fixed slot height keeps the layout still
// when a view is swapped in.
Column {
  id: forecastSection
  required property var panel
  visible: panel.showForecastSection
    && (panel.rainNowcast.length > 0 || panel.radarFrames.length > 0
      || panel.windMapData.length > 0 || panel.windGridLoading || panel.windGridFailed)
  width: parent ? parent.width : 0
  spacing: Style.space(10)

  Row {
    width: parent.width

    Text {
      text: panel.precipitationTab === 1
        ? (panel.radarUsesModelFallback
          ? panel.i18n("precipitationModelCurrent")
          : (panel.radarActiveProviderId === "dwd"
            ? panel.i18n("rainForecastTwoHours")
            : panel.i18n("rainRadarPastTwoHours")))
        : panel.i18n("rainForecastTwoHours")
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    Item { width: parent.width - parent.children[0].implicitWidth - nowcastSource.implicitWidth; height: 1 }

    Text {
      id: nowcastSource
      readonly property string sourceLink: panel.precipitationTab === 1
        ? Providers.radarLink(panel.radarActiveProviderId)
        : Providers.forecastLink(panel.precipitationTab === 2
            ? panel.windActiveProviderId : panel.displayForecastProviderId)
      text: panel.precipitationTab === 0
        ? panel.rainNowcastSourceLabel
        : (panel.precipitationTab === 1
          ? panel.i18n(Providers.radarLabelKey(panel.radarActiveProviderId))
          : panel.i18n(Providers.forecastLabelKey(panel.windActiveProviderId)))
      color: panel.subtleText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.italic: panel.precipitationTab === 0
        && Model.weatherSeriesUsesCache(panel.rainNowcast)

      MouseArea {
        anchors.fill: parent
        enabled: nowcastSource.sourceLink !== ""
        hoverEnabled: true
        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: Qt.openUrlExternally(nowcastSource.sourceLink)
      }
    }
  }

  Row {
    id: precipitationTabs
    anchors.horizontalCenter: parent.horizontalCenter
    spacing: Style.space(5)

    Repeater {
      model: [panel.i18n("rain").toUpperCase(), panel.i18n("radar").toUpperCase(), panel.i18n("wind").toUpperCase()]

      Rectangle {
        required property string modelData
        required property int index
        width: Style.space(82)
        height: Style.space(28)
        radius: Style.cornerRadius
        color: index === panel.precipitationTab
          ? Style.hoverFillFor(panel.foreground, Color.accent)
          : (tabMouse.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")

        Text {
          anchors.centerIn: parent
          text: modelData
          color: index === panel.precipitationTab
            ? Style.hoverStateColor(panel.foreground, Color.accent)
            : panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: index === panel.precipitationTab
        }

        MouseArea {
          id: tabMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.precipitationTab = index
        }
      }
    }
  }

  Loader {
    width: parent.width
    height: Style.space(230)
    visible: active
    active: forecastSection.panel.precipitationTab === 0
    sourceComponent: Component { WeatherRainChart { panel: forecastSection.panel } }
  }

  Loader {
    width: parent.width
    height: forecastSection.panel.mapViewHeight(width)
    visible: active
    active: forecastSection.panel.opened && forecastSection.panel.precipitationTab === 1
    onActiveChanged: if (!active) forecastSection.panel.resetRadarDisplay()
    sourceComponent: Component { WeatherRadarMap { panel: forecastSection.panel } }
  }

  Loader {
    width: parent.width
    height: forecastSection.panel.mapViewHeight(width)
    visible: active
    active: forecastSection.panel.opened && forecastSection.panel.precipitationTab === 2
    sourceComponent: Component { WeatherWindMap { panel: forecastSection.panel } }
  }
}
