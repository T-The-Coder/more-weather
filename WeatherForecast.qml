import QtQuick
import qs.Commons
import "Model.js" as Model
import "Providers.js" as Providers

// One of the rain / radar / wind sections, in the window or as a tab. The
// view is created only while the section is shown in an open panel; the
// fixed slot height keeps the layout still when a view is swapped in.
Column {
  id: forecastSection
  required property var panel
  property string kind: "rain"
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  readonly property bool isRain: kind === "rain"
  readonly property bool isRadar: kind === "radar"
  visible: isRain ? panel.showRainSection : (isRadar ? panel.showRadarSection : panel.showWindSection)
  width: parent ? parent.width : 0
  spacing: Style.space(10)

  Rectangle {
    visible: !forecastSection.inTab && !forecastSection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Row {
    width: parent.width

    Text {
      id: forecastTitle
      text: forecastSection.isRadar
        ? (panel.radarUsesModelFallback
          ? panel.i18n("precipitationModelCurrent")
          : (panel.radarActiveProviderId === "dwd"
            ? panel.i18n("rainForecastTwoHours")
            : panel.i18n("rainRadarPastTwoHours")))
        : (forecastSection.isRain ? panel.i18n("rainForecastTwoHours")
          : panel.upperLabel(panel.i18n("wind")))
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    Item { width: parent.width - forecastTitle.implicitWidth - nowcastSource.implicitWidth; height: 1 }

    Text {
      id: nowcastSource
      readonly property string sourceLink: forecastSection.isRadar
        ? Providers.radarLink(panel.radarDisplayProviderId)
        : Providers.forecastLink(forecastSection.isRain
            ? panel.displayForecastProviderId : panel.windActiveProviderId)
      text: forecastSection.isRain
        ? panel.rainNowcastSourceLabel
        : (forecastSection.isRadar
          ? panel.i18n(Providers.radarLabelKey(panel.radarDisplayProviderId))
          : panel.i18n(Providers.forecastLabelKey(panel.windActiveProviderId)))
      color: panel.subtleText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.italic: forecastSection.isRain
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

  Loader {
    width: parent.width
    height: Style.space(230)
    visible: active
    active: forecastSection.isRain
    sourceComponent: Component { WeatherRainChart { panel: forecastSection.panel } }
  }

  Loader {
    width: parent.width
    height: forecastSection.panel.mapViewHeight(width)
    visible: active
    active: forecastSection.isRadar && forecastSection.panel.radarShown
    onActiveChanged: if (!active) forecastSection.panel.resetRadarDisplay()
    sourceComponent: Component { WeatherRadarMap { panel: forecastSection.panel } }
  }

  // Play, scrub and the frame's time, under the map (after Weather Radar).
  Loader {
    width: parent.width
    height: Style.space(34)
    visible: active
    active: forecastSection.isRadar && forecastSection.panel.radarShown
    sourceComponent: Component { WeatherRadarTimeline { panel: forecastSection.panel } }
  }

  Loader {
    width: parent.width
    height: forecastSection.panel.mapViewHeight(width)
    visible: active
    active: forecastSection.kind === "wind" && forecastSection.panel.windShown
    sourceComponent: Component { WeatherWindMap { panel: forecastSection.panel } }
  }
}
