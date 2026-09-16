import QtQuick
import qs.Commons
import "Providers.js" as Providers

// Settings page describing every data source, with the provider that is
// actually serving each kind of data right now.
Column {
  id: sourcesPage
  required property var panel
  width: parent ? parent.width : 0
  spacing: Style.space(12)

  function label(key) { return panel.i18n(key) }

  readonly property string forecastInUse: panel.cacheFallbackActive ? "CACHE"
    : (panel.dailyForecastReport || panel.mosmixReport
      ? (panel.mosmixReport ? label("sourceMosmix") + " + " : "")
        + label(Providers.forecastLabelKey(panel.displayForecastProviderId))
      : "")

  // Source of the radar drift arrow for the frame on screen (Model.rainDriftAt).
  readonly property string driftInUse: {
    var drift = panel.radarDrift
    if (!drift || (!panel.radarFrames.length && !panel.radarUsesModelFallback)) return ""
    if (drift.source === "radar") return "DWD RADAR"
    if (drift.source === "steering") return "OPEN-METEO · 700 HPA"
    return label(Providers.forecastLabelKey(panel.displayForecastProviderId))
  }

  readonly property string placeInUse: {
    var source = panel.placeReport ? String(panel.placeReport._placeSource || "") : ""
    if (source === "reverse") return "NOMINATIM"
    if (source === "search") return "OPEN-METEO · GEOCODING"
    if (source === "ip") return "IP · " + String(Providers.ipPlaceProviders()[panel.placeProviderIndex].id).toUpperCase()
    return ""
  }

  readonly property var groups: [
    {
      title: "sourceGroupForecast", details: "sourceGroupForecastDetails",
      inUse: forecastInUse,
      links: [["DWD / Bright Sky", "https://brightsky.dev/"], ["Open-Meteo", "https://open-meteo.com/"],
        ["MET Norway", "https://api.met.no/"]]
    },
    {
      title: "sourceGroupUv", details: "sourceGroupUvDetails",
      inUse: panel.uvReport ? label("sourceBestMatch") : "",
      links: [["Open-Meteo", "https://open-meteo.com/"]]
    },
    {
      title: "sourceGroupNowcast", details: "sourceGroupNowcastDetails",
      inUse: panel.rainNowcast.length > 0 ? panel.rainNowcastSourceLabel : "",
      links: [["DWD / Bright Sky", "https://brightsky.dev/"], ["Open-Meteo", "https://open-meteo.com/"],
        ["MET Norway", "https://api.met.no/"]]
    },
    {
      title: "sourceGroupRadar", details: "sourceGroupRadarDetails",
      inUse: panel.radarFrames.length > 0 || panel.radarUsesModelFallback
        ? label(Providers.radarLabelKey(panel.radarActiveProviderId)) : "",
      links: [["DWD", "https://www.dwd.de/"], ["NWS", "https://radar.weather.gov/"],
        ["ECCC", "https://geo.weather.gc.ca/geomet/"], ["RainViewer", "https://www.rainviewer.com/"],
        ["Open-Meteo", "https://open-meteo.com/"], ["MET Norway", "https://api.met.no/"]]
    },
    {
      title: "sourceGroupDrift", details: "sourceGroupDriftDetails",
      inUse: driftInUse,
      links: [["DWD / Bright Sky", "https://brightsky.dev/"], ["Open-Meteo", "https://open-meteo.com/"]]
    },
    {
      title: "sourceGroupWind", details: "sourceGroupWindDetails",
      inUse: panel.windGrid.length > 0 ? label("sourceBestMatch")
        : (panel.windMapData.length > 0
          ? label(Providers.forecastLabelKey(panel.displayForecastProviderId)) : ""),
      links: [["Open-Meteo", "https://open-meteo.com/"]]
    },
    {
      title: "sourceGroupWarnings", details: "sourceGroupWarningsDetails",
      inUse: panel.displayAlertProviderId !== ""
        ? label(Providers.alertLabelKey(panel.displayAlertProviderId)) : "",
      links: [["DWD", "https://www.dwd.de/"], ["MeteoAlarm", "https://meteoalarm.org/"],
        ["NWS", "https://www.weather.gov/"], ["ECCC", "https://weather.gc.ca/"]]
    },
    {
      title: "sourceGroupAirQuality", details: "sourceGroupAirQualityDetails",
      inUse: panel.airQuality && panel.airQuality.report ? "OPEN-METEO · CAMS" : "",
      links: [["Open-Meteo", "https://open-meteo.com/en/docs/air-quality-api"],
        ["Copernicus CAMS", "https://atmosphere.copernicus.eu/"]]
    },
    {
      title: "sourceGroupLocation", details: "sourceGroupLocationDetails",
      inUse: placeInUse,
      links: [["ipwho.is", "https://ipwho.is/"], ["ipapi.co", "https://ipapi.co/"],
        ["GeoJS", "https://www.geojs.io/"], ["Nominatim", "https://nominatim.org/"],
        ["Open-Meteo", "https://open-meteo.com/"]]
    },
    {
      title: "sourceGroupMap", details: "sourceGroupMapDetails",
      inUse: "DWD GEOSERVER · OPENSTREETMAP",
      links: [["DWD GeoServer", "https://maps.dwd.de/"], ["© OpenStreetMap", "https://www.openstreetmap.org/copyright"],
        ["Overpass API", "https://wiki.openstreetmap.org/wiki/Overpass_API"]]
    },
    {
      title: "sourceGroupMoon", details: "sourceGroupMoonDetails",
      inUse: label("sourceLocalCalculation"),
      links: []
    }
  ]

  Text {
    width: parent.width
    text: label("sourcesHint") + " " + panel.i18n("sourceRefreshInfo", {
      minutes: panel.refreshMinutes,
      updated: panel.lastUpdatedLabel(panel.relativeTimeNowMs, panel.displayedUpdateMs)
    })
    color: panel.mutedText
    font.family: panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    wrapMode: Text.WordWrap
  }

  Repeater {
    model: sourcesPage.groups

    Rectangle {
      id: sourceCard
      required property var modelData
      width: sourcesPage.width
      height: sourceContent.implicitHeight + Style.space(20)
      radius: Style.cornerRadius
      color: "transparent"
      border.color: sourcesPage.panel.subtleText
      border.width: Style.spacing.hairline

      Column {
        id: sourceContent
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Style.space(10)
        spacing: Style.space(5)

        Item {
          width: parent.width
          height: Math.max(sourceTitle.implicitHeight, inUseText.implicitHeight)

          Text {
            id: sourceTitle
            anchors.left: parent.left
            anchors.right: inUseText.left
            anchors.rightMargin: Style.space(8)
            text: sourcesPage.label(sourceCard.modelData.title)
            color: sourcesPage.panel.foreground
            font.family: sourcesPage.panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.bold: true
            elide: Text.ElideRight
          }

          // The provider serving this data at the moment.
          Text {
            id: inUseText
            anchors.right: parent.right
            anchors.verticalCenter: sourceTitle.verticalCenter
            width: Math.min(implicitWidth, parent.width * 0.55)
            horizontalAlignment: Text.AlignRight
            text: sourceCard.modelData.inUse !== ""
              ? sourcesPage.label("sourceInUse") + " · " + sourceCard.modelData.inUse
              : sourcesPage.label("sourceNotInUse")
            color: sourceCard.modelData.inUse !== ""
              ? Color.accent : sourcesPage.panel.subtleText
            font.family: sourcesPage.panel.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: sourceCard.modelData.inUse !== ""
            elide: Text.ElideRight
          }
        }

        Text {
          width: parent.width
          text: sourcesPage.label(sourceCard.modelData.details)
          color: sourcesPage.panel.mutedText
          font.family: sourcesPage.panel.fontFamily
          font.pixelSize: Style.font.caption
          wrapMode: Text.WordWrap
        }

        // Where each source applies; keys follow the group title.
        Text {
          width: parent.width
          text: "<b>" + sourcesPage.label("sourceCoverage") + "</b> "
            + sourcesPage.label(sourceCard.modelData.title + "Coverage")
          textFormat: Text.StyledText
          color: sourcesPage.panel.mutedText
          font.family: sourcesPage.panel.fontFamily
          font.pixelSize: Style.font.caption
          wrapMode: Text.WordWrap
        }

        Flow {
          visible: sourceCard.modelData.links.length > 0
          width: parent.width
          spacing: Style.space(10)

          Repeater {
            model: sourceCard.modelData.links

            Text {
              required property var modelData
              text: modelData[0] + " ↗"
              color: linkMouse.containsMouse
                ? Style.hoverStateColor(sourcesPage.panel.foreground, Color.accent)
                : sourcesPage.panel.subtleText
              font.family: sourcesPage.panel.fontFamily
              font.pixelSize: Style.font.caption
              font.underline: linkMouse.containsMouse

              MouseArea {
                id: linkMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: Qt.openUrlExternally(parent.modelData[1])
              }
            }
          }
        }
      }
    }
  }
}
