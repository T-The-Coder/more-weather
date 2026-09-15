import QtQuick
import qs.Commons

// Next hours on the shared forecast column grid.
Column {
  id: hourlySection
  required property var panel
  visible: panel.showHourlySection && panel.hourlyForecast.length > 0
  width: parent ? parent.width : 0
  spacing: Style.space(14)

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
      text: panel.i18n("hourly")
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    // Columns start at the left edge on the grid shared with Daily below,
    // so hour N and day N sit in the same column.
    Row {
      spacing: panel.forecastColumnGap

      Repeater {
        model: panel.hourlyForecast

        Column {
          required property var modelData
          spacing: Style.space(3)
          width: panel.forecastColumnWidth(hourlySection.width)

          Text {
            visible: panel.displaySetting("hourlyTime", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: panel.hourlyTime(modelData)
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData, "time")
          }

          Text {
            id: hourIcon
            visible: panel.displaySetting("hourlyIcon", true)
            anchors.horizontalCenter: parent.horizontalCenter
            transform: Scale {
              origin.x: hourIcon.width / 2
              xScale: panel.mirrorsGlyph(hourIcon.text) ? -1 : 1
            }
            text: panel.hourlyIcon(modelData)
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.italic: panel.cachedField(modelData, "weatherCode")
              || panel.cachedField(modelData, "isDay")
          }

          Text {
            visible: panel.displaySetting("hourlyTemperature", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: panel.hourlyTemp(modelData)
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
            font.bold: true
            font.italic: panel.cachedField(modelData, panel.useImperial ? "tempF" : "tempC")
          }

          Text {
            visible: panel.displaySetting("hourlyRainProbability", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: "󰖗 " + (modelData.rainProbability !== "" ? modelData.rainProbability : "–") + "%"
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData, "rainProbability")
          }

          Text {
            visible: panel.displaySetting("hourlyRainAmount", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: "󰖌 " + panel.precipitationText(modelData.rainAmount, false)
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData, "rainAmount")
          }

          Text {
            visible: panel.displaySetting("hourlyUv", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: "UV " + (modelData.uvIndex !== "" ? panel.localizedNumber(modelData.uvIndex) : "–")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData, "uvIndex")
          }

          Text {
            visible: panel.displaySetting("hourlyWind", true)
            anchors.horizontalCenter: parent.horizontalCenter
            text: "󰖝 " + panel.forecastWind(modelData)
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData,
              panel.useImperial ? "windSpeedMph" : "windSpeedKmph")
          }
        }
      }
    }
  }
}
