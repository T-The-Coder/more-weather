import QtQuick
import qs.Commons

// Seven-day strip on the shared forecast column grid, scrollable sideways.
Column {
  id: dailySection
  required property var panel
  readonly property alias scroller: forecastScroller
  visible: panel.showDailySection && panel.forecastDays.length > 0
  width: parent ? parent.width : 0
  spacing: Style.space(14)

  Rectangle {
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
      height: forecastRow.height
      contentWidth: forecastRow.width
      contentHeight: height
      clip: true
      boundsBehavior: Flickable.StopAtBounds
      flickableDirection: Flickable.HorizontalFlick
      interactive: contentWidth > width

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
                      : (modelData === "dailySunNext" ? daySunNextEntry : dayTextEntry)))
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
                color: panel.mutedText
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

                Text {
                  text: panel.bareTempForDay(dayColumn.modelData, "max")
                  color: panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.body
                  // Bold like the hourly temperature; the minimum stays muted.
                  font.bold: true
                  font.italic: panel.cachedField(dayColumn.modelData,
                    panel.useImperial ? "maxtempF" : "maxtempC")
                }
                Text {
                  text: panel.bareTempForDay(dayColumn.modelData, "min")
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.body
                  font.italic: panel.cachedField(dayColumn.modelData,
                    panel.useImperial ? "mintempF" : "mintempC")
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
    }

    // A mouse wheel scrolls this strip sideways; touchpads and dragging
    // continue to use Flickable's native horizontal interaction.
    MouseArea {
      anchors.fill: forecastScroller
      acceptedButtons: Qt.NoButton
      onWheel: function(wheel) {
        if (!forecastScroller.interactive) return
        var delta = wheel.angleDelta.x !== 0 ? wheel.angleDelta.x : wheel.angleDelta.y
        var maximum = Math.max(0, forecastScroller.contentWidth - forecastScroller.width)
        forecastScroller.contentX = Math.max(0, Math.min(maximum, forecastScroller.contentX - delta))
        wheel.accepted = true
      }
    }

    Rectangle {
      visible: forecastScroller.interactive
      anchors.left: parent.left
      anchors.right: parent.right
      anchors.bottom: parent.bottom
      height: Style.spacing.hairline
      radius: height / 2
      color: panel.foreground
      opacity: 0.12

      Rectangle {
        readonly property real maximum: Math.max(1, forecastScroller.contentWidth - forecastScroller.width)
        width: Math.max(Style.space(36), parent.width * forecastScroller.width / forecastScroller.contentWidth)
        height: parent.height
        radius: height / 2
        x: (parent.width - width) * forecastScroller.contentX / maximum
        color: Color.accent
      }
    }
  }
}
