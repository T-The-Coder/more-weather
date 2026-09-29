import QtQuick
import qs.Commons
import "Model.js" as Model

// Seven-day strip on the shared forecast column grid, scrollable sideways.
Column {
  id: dailySection
  required property var panel
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  readonly property alias scroller: forecastScroller
  visible: panel.showDailySection && panel.forecastDays.length > 0
  width: parent ? parent.width : 0
  spacing: Style.space(14)

  Rectangle {
    visible: !dailySection.inTab && !dailySection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  // One fixed-width row, horizontally scrollable. Keeping the viewport at
  // parent.width preserves the popup/app width.
  Item {
    width: parent.width
    height: dailyTitle.height + Style.space(8) + forecastScroller.height
      + (forecastScroller.interactive ? Style.space(8) : 0)

    // Section title, styled and spaced like HOURLY above.
    Text {
      id: dailyTitle
      anchors.left: parent.left
      anchors.top: parent.top
      text: panel.i18n("daily")
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    Flickable {
      id: forecastScroller
      anchors.left: parent.left
      anchors.right: parent.right
      anchors.top: dailyTitle.bottom
      anchors.topMargin: Style.space(8)
      height: forecastRow.height + (weekChart.shown ? Style.space(10) + weekChart.height : 0)
      contentWidth: forecastRow.width
      contentHeight: height
      clip: true
      boundsBehavior: Flickable.StopAtBounds
      flickableDirection: Flickable.HorizontalFlick
      interactive: contentWidth > width

      // The page's wheel router (Panel.routeWheel) hands this strip only
      // sideways scrolling: a touchpad swipe, a tilting wheel, or Shift with
      // the wheel. Up and down always scroll the page.
      readonly property bool wheelEnabled: interactive
      function wantsWheel(wheel) {
        return panel.wheelIsSideways(wheel)
      }
      function takeWheel(wheel) {
        var maximum = Math.max(0, contentWidth - width)
        contentX = Math.max(0, Math.min(maximum, contentX - panel.wheelSidewaysPixels(wheel)))
      }
      Component.onCompleted: panel.registerWheelArea(forecastScroller)
      Component.onDestruction: panel.unregisterWheelArea(forecastScroller)

      // Same column grid as Hourly: six columns fill the viewport, the
      // seventh day is a scroll away.
      Row {
        id: forecastRow
        spacing: panel.forecastColumnGap

        Repeater {
          model: panel.forecastDays

          Column {
            id: dayColumn
            required property var modelData
            required property int index
            spacing: Style.space(3)
            width: panel.forecastColumnWidth(forecastScroller.width)

            // Values in the order chosen under Settings → Display.
            Repeater {
              model: panel.displayDailyOrder

              Loader {
                required property string modelData
                anchors.horizontalCenter: parent.horizontalCenter
                // The entry's own flag: `visible` would report this loader's
                // state back to itself.
                visible: item ? item.entryVisible : false
                sourceComponent: modelData === "dailyIcon" ? dayIconEntry
                  : (modelData === "dailyTemperature" ? dayTemperatureEntry
                    : (modelData === "dailySunEvents" ? daySunEventsEntry
                      : (modelData === "dailySunNext" ? daySunNextEntry
                        : (modelData === "dailyMoon" ? dayMoonEntry
                          : (modelData === "dailyTemperatureBar" ? dayTemperatureBarEntry
                          : (modelData === "dailyDayLength" ? dayLengthEntry
                            : (modelData === "dailyDayLengthChange" ? dayLengthChangeEntry : dayTextEntry)))))))
              }
            }

            Component {
              id: dayTextEntry

              Text {
                readonly property string entryKey: parent ? parent.modelData : ""
                // Long weekday names fall back to the short form when a narrow
                // column cannot fit them (DONNERSTAG in the popup, say).
                readonly property string longName: entryKey === "dailyDayName"
                  ? panel.dailyDayName(dayColumn.modelData.date).toUpperCase() : ""
                property bool entryVisible: panel.displaySetting(entryKey, true)
                visible: entryVisible
                text: {
                  var day = dayColumn.modelData
                  if (entryKey === "dailyDayName")
                    return panel.captionTextWidth(longName) <= dayColumn.width
                      ? longName : panel.dailyDayName(day.date, true).toUpperCase()
                  if (entryKey === "dailyRainProbability")
                    return "󰖗 " + (day.rainProbability !== "" ? day.rainProbability : "–") + "%"
                  if (entryKey === "dailyRainAmount") return "󰖌 " + panel.precipitationText(day.rainAmount, false)
                  if (entryKey === "dailyUv")
                    return "UV " + (day.uvIndex !== "" ? panel.localizedNumber(day.uvIndex) : "–")
                  if (entryKey === "dailyWind") return "󰖝 " + panel.forecastWind(day)
                  return ""
                }
                // Colour accents: rain chance, UV and strong wind.
                color: {
                  var day = dayColumn.modelData
                  var accent = entryKey === "dailyRainProbability" ? panel.rainProbabilityAccent(day.rainProbability)
                    : (entryKey === "dailyUv" ? panel.uvAccent(day.uvIndex)
                      : (entryKey === "dailyWind" ? panel.windAccent(day.windSpeedKmph) : ""))
                  return accent || panel.mutedText
                }
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                font.letterSpacing: entryKey === "dailyDayName" ? 1 : 0
                font.italic: {
                  var day = dayColumn.modelData
                  if (entryKey === "dailyDayName") return panel.cachedField(day, "date")
                  if (entryKey === "dailyRainProbability") return panel.cachedField(day, "rainProbability")
                  if (entryKey === "dailyRainAmount") return panel.cachedField(day, "rainAmount")
                  if (entryKey === "dailyUv") return panel.cachedField(day, "uvIndex")
                  if (entryKey === "dailyWind")
                    return panel.cachedField(day, panel.useImperial ? "windSpeedMph" : "windSpeedKmph")
                  return false
                }
              }
            }

            Component {
              id: dayIconEntry

              Text {
                property bool entryVisible: panel.displaySetting("dailyIcon", true)
                visible: entryVisible
                text: panel.dayIcon(dayColumn.modelData)
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.title
                font.italic: panel.cachedField(dayColumn.modelData, "openMeteoWeatherCode")
              }
            }

            Component {
              id: dayTemperatureEntry

              Row {
                property bool entryVisible: panel.displaySetting("dailyTemperature", true)
                visible: entryVisible
                spacing: Style.space(6)

                // Low left, high right, like the week bar below: cool to warm
                // reads left to right on both.
                Text {
                  text: panel.bareTempForDay(dayColumn.modelData, "min")
                  color: panel.absoluteTemperatureAccent(dayColumn.modelData.mintempC) || panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.body
                  font.italic: panel.cachedField(dayColumn.modelData,
                    panel.useImperial ? "mintempF" : "mintempC")
                }
                Text {
                  text: panel.bareTempForDay(dayColumn.modelData, "max")
                  // Warm or cool on the one scale used everywhere (colour accents).
                  color: panel.absoluteTemperatureAccent(dayColumn.modelData.maxtempC) || panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.body
                  // Bold like the hourly temperature; the minimum stays muted.
                  font.bold: true
                  font.italic: panel.cachedField(dayColumn.modelData,
                    panel.useImperial ? "maxtempF" : "maxtempC")
                }
              }
            }

            // Only what is still ahead: sunrise or sunset, whichever comes
            // next for this day.
            Component {
              id: daySunNextEntry

              Row {
                readonly property var event: panel.nextSunEvent(dayColumn.modelData, dayColumn.index)
                property bool entryVisible: panel.displaySetting("dailySunNext", false) && !!event
                visible: entryVisible
                spacing: Style.space(2)

                Canvas {
                  id: sunNextIcon
                  anchors.verticalCenter: parent.verticalCenter
                  width: Style.space(11)
                  height: Style.space(11)
                  property color iconColor: panel.mutedText
                  property bool rising: parent.event ? parent.event.rising : true
                  onIconColorChanged: requestPaint()
                  onRisingChanged: requestPaint()
                  onPaint: panel.paintSunEventIcon(sunNextIcon, rising)
                }

                Text {
                  anchors.verticalCenter: parent.verticalCenter
                  text: parent.event ? panel.forecastEventTime(parent.event.time) : ""
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  font.italic: panel.cachedField(dayColumn.modelData,
                    parent.event && parent.event.rising ? "sunrise" : "sunset")
                }
              }
            }

            // The day's range as a bar on the week's scale, cool to warm
            // with colour accents, in the text colour without.
            Component {
              id: dayTemperatureBarEntry

              Item {
                id: temperatureBar
                readonly property var day: dayColumn.modelData
                readonly property real low: panel.weekTemperatureRange.low
                readonly property real high: panel.weekTemperatureRange.high
                readonly property real minimum: parseFloat(day.mintempC)
                readonly property real maximum: parseFloat(day.maxtempC)
                property bool entryVisible: panel.displaySetting("dailyTemperatureBar", true)
                  && isFinite(minimum) && isFinite(maximum) && high > low
                visible: entryVisible
                width: dayColumn.width * 0.8
                height: Style.space(10)

                Rectangle {
                  anchors.verticalCenter: parent.verticalCenter
                  width: parent.width
                  height: Style.space(4)
                  radius: height / 2
                  color: panel.foreground
                  opacity: 0.1
                }

                Rectangle {
                  readonly property real from: (parent.minimum - parent.low) / (parent.high - parent.low)
                  readonly property real to: (parent.maximum - parent.low) / (parent.high - parent.low)
                  anchors.verticalCenter: parent.verticalCenter
                  x: parent.width * from
                  width: Math.max(height, parent.width * (to - from))
                  height: Style.space(4)
                  radius: height / 2
                  gradient: Gradient {
                    orientation: Gradient.Horizontal
                    GradientStop {
                      position: 0
                      color: panel.absoluteTemperatureAccent(temperatureBar.minimum) || panel.mutedText
                    }
                    GradientStop {
                      position: 1
                      color: panel.absoluteTemperatureAccent(temperatureBar.maximum) || panel.mutedText
                    }
                  }
                }
              }
            }

            // Day length, and separately its change against the day before.
            Component {
              id: dayLengthEntry

              Text {
                property bool entryVisible: panel.displaySetting("dailyDayLength", true) && text !== ""
                visible: entryVisible
                text: panel.dayLengthText(dayColumn.modelData)
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
              }
            }

            Component {
              id: dayLengthChangeEntry

              Text {
                property bool entryVisible: panel.displaySetting("dailyDayLengthChange", true) && text !== ""
                visible: entryVisible
                text: panel.dayLengthChangeText(dayColumn.modelData)
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
              }
            }

            // Moon phase on the day's evening: glyph (mirrored south of the
            // equator) and lit share.
            Component {
              id: dayMoonEntry

              Row {
                property bool entryVisible: panel.displaySetting("dailyMoon", true)
                  && dayMoonGlyph.text !== ""
                visible: entryVisible
                spacing: Style.space(2)

                Text {
                  id: dayMoonGlyph
                  anchors.verticalCenter: parent.verticalCenter
                  text: panel.dayMoonGlyph(dayColumn.modelData)
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  transform: Scale {
                    origin.x: dayMoonGlyph.width / 2
                    xScale: panel.mirrorsGlyph(dayMoonGlyph.text) ? -1 : 1
                  }
                }

                Text {
                  anchors.verticalCenter: parent.verticalCenter
                  text: panel.dayMoonText(dayColumn.modelData)
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                }
              }
            }

            Component {
              id: daySunEventsEntry

              Grid {
                property bool entryVisible: panel.displaySetting("dailySunEvents", true)
                visible: entryVisible
                columns: panel.standaloneMode ? 2 : 1
                columnSpacing: Style.space(4)
                rowSpacing: Style.space(1)

                Row {
                  spacing: Style.space(2)

                  Canvas {
                    id: sunriseIcon
                    anchors.verticalCenter: parent.verticalCenter
                    width: Style.space(11)
                    height: Style.space(11)
                    property color iconColor: panel.mutedText
                    onIconColorChanged: requestPaint()
                    onPaint: panel.paintSunEventIcon(sunriseIcon, true)
                  }

                  Text {
                    anchors.verticalCenter: parent.verticalCenter
                    text: panel.forecastEventTime(dayColumn.modelData.sunrise)
                    color: panel.mutedText
                    font.family: panel.fontFamily
                    font.pixelSize: Style.font.caption
                    font.italic: panel.cachedField(dayColumn.modelData, "sunrise")
                  }
                }

                Row {
                  spacing: Style.space(2)

                  Canvas {
                    id: sunsetIcon
                    anchors.verticalCenter: parent.verticalCenter
                    width: Style.space(11)
                    height: Style.space(11)
                    property color iconColor: panel.mutedText
                    onIconColorChanged: requestPaint()
                    onPaint: panel.paintSunEventIcon(sunsetIcon, false)
                  }

                  Text {
                    anchors.verticalCenter: parent.verticalCenter
                    text: panel.forecastEventTime(dayColumn.modelData.sunset)
                    color: panel.mutedText
                    font.family: panel.fontFamily
                    font.pixelSize: Style.font.caption
                    font.italic: panel.cachedField(dayColumn.modelData, "sunset")
                  }
                }
              }
            }
          }
        }
      }

      // The temperature hour by hour through the week, after linecast's
      // chart: each day under its column, a rule with the day's name in the
      // gap at midnight, daylight as a band, the day's high and low written
      // at their hours, the past of today dimmed. It scrolls with the days.
      WeatherTemperatureChart {
        id: weekChart
        readonly property var hours: panel.weekHours
        readonly property bool shown: panel.displaySetting("dailyTemperatureCurve", true)
          && hours.filter(function(hour) { return isFinite(hour.tempC) }).length > 2
        visible: shown
        y: forecastRow.height + Style.space(10)
        width: forecastRow.width
        panel: dailySection.panel
        step: (panel.forecastColumnWidth(forecastScroller.width) + panel.forecastColumnGap) / 24
        xOffset: -panel.forecastColumnGap / 2
        nowIndex: panel.weekHoursNowIndex
        // One label per high and per low of a day.
        extremaWindow: 8
        extremaGap: 12
        lines: [{
          values: hours.map(function(hour) { return hour.tempC }),
          texts: hours.map(function(hour) {
            var c = Math.round(hour.tempC)
            return isFinite(c) ? Model.tempBare(c, Math.round(hour.tempC * 1.8 + 32), panel.tempScale) : ""
          }),
          plainColor: panel.foreground
        }]
        daylight: hours.map(function(hour) { return hour.isDay })
        rules: {
          var list = []
          for (var i = 24; i < hours.length; i += 24)
            list.push({ index: i, label: panel.dailyDayName(hours[i].time.slice(0, 10), true) })
          return list
        }
        axis: {
          var list = []
          for (var i = 0; i < hours.length; ++i) {
            var hour = i % 24
            if (hour === 6 || hour === 12 || hour === 18) list.push({ index: i, label: String(hour) })
          }
          return list
        }
        rain: hours.map(function(hour) { return hour.rain })
        timeTexts: hours.map(function(hour) {
          return panel.dailyDayName(hour.time.slice(0, 10), true) + " " + hour.time.slice(11, 16)
        })
      }
    }

    // Scroll indicator: a rounded accent thumb on a faint track, thicker
    // than a hairline so it never reads as the separator below.
    Item {
      visible: forecastScroller.interactive
      anchors.left: parent.left
      anchors.right: parent.right
      anchors.bottom: parent.bottom
      height: Style.space(3)

      Rectangle {
        anchors.fill: parent
        radius: height / 2
        color: panel.foreground
        opacity: 0.06
      }

      Rectangle {
        readonly property real maximum: Math.max(1, forecastScroller.contentWidth - forecastScroller.width)
        width: Math.max(Style.space(36), parent.width * forecastScroller.width / forecastScroller.contentWidth)
        height: parent.height
        radius: height / 2
        x: (parent.width - width) * forecastScroller.contentX / maximum
        color: Color.accent
        opacity: 0.7
      }
    }
  }
}
