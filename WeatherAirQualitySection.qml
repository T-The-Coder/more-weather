import QtQuick
import qs.Commons

// Air quality index, particulate matter and ozone, and the pollen types that
// currently count, between the warnings and the hourly forecast.
Column {
  id: airSection
  required property var panel
  readonly property var summary: panel.airQualitySummary
  readonly property bool showIndex: panel.displaySetting("airQualityIndex", true)
  readonly property bool showPollen: panel.displaySetting("airQualityPollen", true)
  readonly property bool hasValues: !!summary && (summary.index !== null || summary.pm25 !== null
    || summary.pm10 !== null || summary.ozone !== null || summary.pollen !== null)
  readonly property bool italic: !!panel.airQuality && panel.airQuality.stale
  // Stays visible without values and says why, instead of disappearing.
  readonly property string statusText: hasValues ? ""
    : (summary ? panel.i18n("airQualityNoData")
      : (panel.airQuality && panel.airQuality.loadStatus === "failed"
        ? panel.i18n("airQualityUnavailable") : panel.i18n("airQualityLoading")))
  visible: panel.showAirQualitySection && (showIndex || showPollen)
  width: parent ? parent.width : 0
  spacing: Style.space(14)

  function amountText(value) {
    return value === null ? "–" : panel.localizedNumber(value, 0) + " µg/m³"
  }

  function pollenText() {
    if (!summary || summary.pollen === null) return panel.i18n("pollenUnavailable")
    if (!summary.pollen.length) return panel.i18n("pollenNone")
    var levelKeys = ["", "pollenLow", "pollenModerate", "pollenHigh"]
    return summary.pollen.map(function(entry) {
      var type = entry.type.charAt(0).toUpperCase() + entry.type.slice(1)
      return panel.i18n("pollen" + type) + " " + panel.i18n(levelKeys[entry.level])
    }).join(" · ")
  }

  Rectangle {
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Column {
    width: parent.width
    spacing: Style.space(8)

    Text {
      anchors.left: parent.left
      text: panel.upperLabel(panel.i18n("airQualityPollen"))
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    Text {
      visible: airSection.statusText !== ""
      width: parent.width
      text: airSection.statusText
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.italic: true
      wrapMode: Text.WordWrap
    }

    Flow {
      visible: airSection.showIndex && airSection.hasValues
      width: parent.width
      spacing: Style.space(18)

      Row {
        visible: !!airSection.summary && airSection.summary.index !== null
        spacing: Style.space(6)

        // Softened category colour; can be switched off in the settings.
        Rectangle {
          visible: panel.displaySetting("airQualityColor", true)
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(7)
          height: width
          radius: width / 2
          color: airSection.summary && airSection.summary.color
            ? panel.softAirQualityColor(airSection.summary.color) : "transparent"
        }

        // Label muted and small, value in front: the same pattern as PM2.5,
        // PM10 and O₃ beside it.
        Text {
          anchors.baseline: aqiValue.baseline
          text: "AQI"
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
        }

        Text {
          id: aqiValue
          text: airSection.summary && airSection.summary.index !== null
            ? airSection.summary.index + " · " + panel.i18n(airSection.summary.labelKey) : ""
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          font.bold: true
          font.italic: airSection.italic
        }
      }

      Repeater {
        model: airSection.summary ? [
          ["PM2.5", airSection.summary.pm25],
          ["PM10", airSection.summary.pm10],
          ["O₃", airSection.summary.ozone]
        ] : []

        Row {
          required property var modelData
          spacing: Style.space(5)

          Text {
            anchors.baseline: amount.baseline
            text: parent.modelData[0]
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
          }

          Text {
            id: amount
            text: airSection.amountText(parent.modelData[1])
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.italic: airSection.italic
          }
        }
      }
    }

    Row {
      visible: airSection.showPollen && airSection.hasValues
      width: parent.width
      spacing: Style.space(5)

      Text {
        id: pollenLabel
        anchors.baseline: pollenValue.baseline
        text: panel.i18n("pollen")
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }

      Text {
        id: pollenValue
        width: parent.width - pollenLabel.width - parent.spacing
        text: airSection.pollenText()
        color: panel.foreground
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        font.italic: airSection.italic
        wrapMode: Text.WordWrap
      }
    }
  }
}
