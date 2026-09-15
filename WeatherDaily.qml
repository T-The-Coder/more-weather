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

            // Long weekday names fall back to the short form when a narrow
            // column cannot fit them (DONNERSTAG in the popup, say).
            Text {
              readonly property string longName: panel.dailyDayName(dayColumn.modelData.date).toUpperCase()
              visible: panel.displaySetting("dailyDayName", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: panel.captionTextWidth(longName) <= dayColumn.width
                ? longName
                : panel.dailyDayName(dayColumn.modelData.date, true).toUpperCase()
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.italic: panel.cachedField(modelData, "date")
              font.letterSpacing: 1
            }

            Text {
              visible: panel.displaySetting("dailyIcon", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: panel.dayIcon(modelData)
              color: panel.foreground
              font.family: panel.fontFamily
              font.pixelSize: Style.font.title
              font.italic: panel.cachedField(modelData, "openMeteoWeatherCode")
            }

            Row {
              visible: panel.displaySetting("dailyTemperature", true)
              anchors.horizontalCenter: parent.horizontalCenter
              spacing: Style.space(6)

              Text {
                text: panel.bareTempForDay(modelData, "max")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.body
                // Bold like the hourly temperature; the minimum stays muted.
                font.bold: true
                font.italic: panel.cachedField(modelData,
                  panel.useImperial ? "maxtempF" : "maxtempC")
              }
              Text {
                text: panel.bareTempForDay(modelData, "min")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.body
                font.italic: panel.cachedField(modelData,
                  panel.useImperial ? "mintempF" : "mintempC")
              }
            }

            Text {
              visible: panel.displaySetting("dailyRainProbability", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: "󰖗 " + (modelData.rainProbability !== "" ? modelData.rainProbability : "–") + "%"
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.italic: panel.cachedField(modelData, "rainProbability")
            }

            Text {
              visible: panel.displaySetting("dailyRainAmount", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: "󰖌 " + panel.precipitationText(modelData.rainAmount, false)
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.italic: panel.cachedField(modelData, "rainAmount")
            }

            Text {
              visible: panel.displaySetting("dailyUv", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: "UV " + (modelData.uvIndex !== "" ? panel.localizedNumber(modelData.uvIndex) : "–")
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.italic: panel.cachedField(modelData, "uvIndex")
            }

            Text {
              visible: panel.displaySetting("dailyWind", true)
              anchors.horizontalCenter: parent.horizontalCenter
              text: "󰖝 " + panel.forecastWind(modelData)
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.italic: panel.cachedField(modelData,
                panel.useImperial ? "windSpeedMph" : "windSpeedKmph")
            }

            Grid {
              visible: panel.displaySetting("dailySunEvents", true)
              anchors.horizontalCenter: parent.horizontalCenter
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
                  text: panel.forecastEventTime(modelData.sunrise)
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  font.italic: panel.cachedField(modelData, "sunrise")
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
                  text: panel.forecastEventTime(modelData.sunset)
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  font.italic: panel.cachedField(modelData, "sunset")
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
