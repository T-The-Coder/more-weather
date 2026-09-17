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
          id: hourColumn
          required property var modelData
          readonly property var hour: modelData
          spacing: Style.space(3)
          width: panel.forecastColumnWidth(hourlySection.width)

          // Values in the order chosen under Settings → Display.
          Repeater {
            model: panel.displayHourlyOrder

            Loader {
              required property string modelData
              anchors.horizontalCenter: parent.horizontalCenter
              // The entry's own flag: `visible` would report this loader's
              // state back to itself.
              visible: item ? item.entryVisible : false
              sourceComponent: modelData === "hourlyIcon" ? hourIconEntry : hourTextEntry
            }
          }

          Component {
            id: hourTextEntry

            Text {
              readonly property string entryKey: parent ? parent.modelData : ""
              readonly property bool isTemperature: entryKey === "hourlyTemperature"
              property bool entryVisible: panel.displaySetting(entryKey, true)
              visible: entryVisible
              text: {
                var hour = hourColumn.hour
                if (entryKey === "hourlyTime") return panel.hourlyTime(hour)
                if (entryKey === "hourlyTemperature") return panel.hourlyTemp(hour)
                if (entryKey === "hourlyRainProbability")
                  return "󰖗 " + (hour.rainProbability !== "" ? hour.rainProbability : "–") + "%"
                if (entryKey === "hourlyRainAmount") return "󰖌 " + panel.precipitationText(hour.rainAmount, false)
                if (entryKey === "hourlyUv")
                  return "UV " + (hour.uvIndex !== "" ? panel.localizedNumber(hour.uvIndex) : "–")
                if (entryKey === "hourlyWind") return "󰖝 " + panel.forecastWind(hour)
                return ""
              }
              color: isTemperature ? panel.foreground : panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: isTemperature ? Style.font.body : Style.font.caption
              font.bold: isTemperature
              font.italic: {
                var hour = hourColumn.hour
                if (entryKey === "hourlyTime") return panel.cachedField(hour, "time")
                if (entryKey === "hourlyTemperature")
                  return panel.cachedField(hour, panel.useImperial ? "tempF" : "tempC")
                if (entryKey === "hourlyRainProbability") return panel.cachedField(hour, "rainProbability")
                if (entryKey === "hourlyRainAmount") return panel.cachedField(hour, "rainAmount")
                if (entryKey === "hourlyUv") return panel.cachedField(hour, "uvIndex")
                if (entryKey === "hourlyWind")
                  return panel.cachedField(hour, panel.useImperial ? "windSpeedMph" : "windSpeedKmph")
                return false
              }
            }
          }

          Component {
            id: hourIconEntry

            Text {
              id: hourIcon
              property bool entryVisible: panel.displaySetting("hourlyIcon", true)
              visible: entryVisible
              transform: Scale {
                origin.x: hourIcon.width / 2
                xScale: panel.mirrorsGlyph(hourIcon.text) ? -1 : 1
              }
              text: panel.hourlyIcon(hourColumn.hour)
              color: panel.foreground
              font.family: panel.fontFamily
              font.pixelSize: Style.font.title
              font.italic: panel.cachedField(hourColumn.hour, "weatherCode")
                || panel.cachedField(hourColumn.hour, "isDay")
            }
          }
        }
      }
    }
  }
}
