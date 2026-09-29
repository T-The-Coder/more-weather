import QtQuick
import qs.Commons

// Next hours on the shared forecast column grid.
Column {
  id: hourlySection
  required property var panel
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  visible: panel.showHourlySection && panel.hourlyForecast.length > 0
  width: parent ? parent.width : 0
  spacing: Style.space(14)

  Rectangle {
    visible: !hourlySection.inTab && !hourlySection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }
  Column {
    width: parent.width
    spacing: Style.space(8)

    Item {
      width: parent.width
      height: hourlyTitle.implicitHeight

      Text {
        id: hourlyTitle
        anchors.left: parent.left
        text: panel.i18n("hourly")
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        font.letterSpacing: 1
      }

      // The hour cursor's keys, in muted type where they act.
      Text {
        anchors.right: parent.right
        anchors.baseline: hourlyTitle.baseline
        width: Math.min(implicitWidth, parent.width - hourlyTitle.implicitWidth - Style.space(12))
        text: panel.i18n("hourCursorHint")
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        elide: Text.ElideRight
        horizontalAlignment: Text.AlignRight
      }
    }

    // Columns start at the left edge on the grid shared with Daily below,
    // so hour N and day N sit in the same column.
    Row {
      spacing: panel.forecastColumnGap

      Repeater {
        model: panel.hourlyForecast

        // One hour; the one under the hour cursor is highlighted, and a
        // click picks it (a second click returns to now).
        Item {
          id: hourCell
          required property var modelData
          readonly property bool picked: !!panel.cursorHour && panel.cursorHour.time === modelData.time
          width: panel.forecastColumnWidth(hourlySection.width)
          height: hourColumn.implicitHeight

          Rectangle {
            anchors.fill: parent
            anchors.margins: -Style.space(3)
            radius: Style.cornerRadius
            visible: hourCell.picked || hourMouse.containsMouse
            color: Style.hoverFillFor(panel.foreground, Color.accent)
            border.color: hourCell.picked ? Color.accent : "transparent"
            border.width: Style.spacing.hairline
          }

          MouseArea {
            id: hourMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.toggleHourCursor(hourCell.modelData.time)
          }

          Column {
            id: hourColumn
            readonly property var hour: hourCell.modelData
            spacing: Style.space(3)
            width: parent.width

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
                // Colour accents (Settings → General): temperature by warmth on
                // the one scale used everywhere, rain chance, UV and strong wind.
                color: {
                  var hour = hourColumn.hour
                  var accent = ""
                  if (isTemperature) accent = panel.absoluteTemperatureAccent(hour.tempC)
                  else if (entryKey === "hourlyRainProbability") accent = panel.rainProbabilityAccent(hour.rainProbability)
                  else if (entryKey === "hourlyUv") accent = panel.uvAccent(hour.uvIndex)
                  else if (entryKey === "hourlyWind") accent = panel.windAccent(hour.windSpeedKmph)
                  return accent || (isTemperature ? panel.foreground : panel.mutedText)
                }
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

    // The next 24 hours as a temperature line, after linecast. A click
    // picks the hour for the hour cursor, like a click on a column.
    WeatherTemperatureChart {
      readonly property var hours: panel.cursorHours
      visible: panel.displaySetting("hourlyTemperatureCurve", true) && hours.length > 2
      width: parent.width
      panel: hourlySection.panel
      lines: [{
        values: hours.map(function(hour) { return parseFloat(hour.tempC) }),
        texts: hours.map(function(hour) { return panel.hourlyTemp(hour) }),
        plainColor: panel.foreground
      }]
      daylight: hours.map(function(hour) { return Number(hour.isDay) !== 0 })
      // Times are the place's own ("2026-09-30T03:00"), so the hour and the
      // date are read from the text, not from this computer's time zone.
      rules: {
        var list = []
        for (var i = 1; i < hours.length; ++i) {
          var time = String(hours[i].time)
          if (Number(time.slice(11, 13)) === 0)
            list.push({ index: i, label: panel.dailyDayName(time.slice(0, 10), true) })
        }
        return list
      }
      axis: {
        var list = []
        for (var i = 0; i < hours.length; ++i)
          if (Number(String(hours[i].time).slice(11, 13)) % 3 === 0)
            list.push({ index: i, label: panel.hourlyTime(hours[i]) })
        return list
      }
      markIndex: {
        if (!panel.cursorHour) return -1
        for (var i = 0; i < hours.length; ++i) if (hours[i].time === panel.cursorHour.time) return i
        return -1
      }
      timeTexts: hours.map(function(hour) { return panel.hourlyTime(hour) })
      rain: hours.map(function(hour) { return parseFloat(hour.rainAmount) || 0 })
      onPicked: function(index) { panel.toggleHourCursor(hours[index].time) }
    }
  }
}
