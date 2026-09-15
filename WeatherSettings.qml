import QtQuick
import qs.Commons
import qs.Ui
import "I18n.js" as I18n

// Per-surface display settings (menu bar, app, widget). Created on demand
// while settings are open.
Rectangle {
  id: settingsView
  required property var panel
  anchors.fill: parent
  z: 100
  color: Color.popups.background

  MouseArea { anchors.fill: parent }

  Flickable {
    anchors.fill: parent
    anchors.margins: Style.space(4)
    z: 1
    contentWidth: width
    contentHeight: settingsColumn.implicitHeight
    clip: true
    boundsBehavior: Flickable.StopAtBounds
    interactive: contentHeight > height

    Column {
      id: settingsColumn
      width: parent.width
      spacing: Style.space(12)

      Item {
        width: parent.width
        height: Style.space(48)

        Column {
          anchors.left: parent.left
          anchors.verticalCenter: parent.verticalCenter
          spacing: Style.space(2)

          Text {
            text: panel.i18n("settings")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.bold: true
          }

          Text {
            text: panel.settingsPage === "shortcuts" ? panel.i18n("shortcutsSubtitle")
              : (panel.settingsPage === "sources" ? panel.i18n("sourcesSubtitle")
                : (panel.settingsTargetSurface === "app" ? panel.i18n("appSettings")
                  : (panel.settingsTargetSurface === "widget"
                    ? panel.i18n("widgetSettings") : panel.i18n("menubarSettings"))))
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
          }
        }

        Rectangle {
          anchors.right: parent.right
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(28)
          height: width
          radius: Style.cornerRadius
          color: closeSettingsMouse.containsMouse
            ? Style.hoverFillFor(panel.foreground, Color.accent)
            : "transparent"

          Text {
            anchors.centerIn: parent
            text: "✕"
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }

          MouseArea {
            id: closeSettingsMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.settingsOpen = false
          }
        }
      }

      // Settings pages, styled like the rain / radar / wind tabs so they read
      // as navigation rather than as another option to choose.
      Row {
        id: settingsPageRow
        anchors.horizontalCenter: parent.horizontalCenter
        spacing: Style.space(5)

        Repeater {
          model: panel.settingsPages

          Rectangle {
            required property string modelData
            readonly property bool selected: panel.settingsPage === modelData
            width: Math.max(Style.space(96), pageLabel.implicitWidth + Style.space(20))
            height: Style.space(28)
            radius: Style.cornerRadius
            color: selected || pageMouse.containsMouse
              ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

            Text {
              id: pageLabel
              anchors.centerIn: parent
              text: panel.i18n(parent.modelData === "shortcuts" ? "settingsPageShortcuts"
                : (parent.modelData === "sources" ? "settingsPageSources" : "settingsPageDisplay")).toUpperCase()
              color: parent.selected
                ? Style.hoverStateColor(panel.foreground, Color.accent)
                : panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: parent.selected
              font.letterSpacing: 1
            }

            MouseArea {
              id: pageMouse
              anchors.fill: parent
              hoverEnabled: true
              cursorShape: Qt.PointingHandCursor
              onClicked: panel.settingsPage = parent.modelData
            }
          }
        }
      }

      WeatherShortcutsPage {
        visible: panel.settingsPage === "shortcuts"
        panel: settingsView.panel
      }

      WeatherSourcesPage {
        visible: panel.settingsPage === "sources"
        panel: settingsView.panel
      }

      // Applies to the menu bar, the widget and the app alike.
      Rectangle {
        visible: panel.settingsPage === "display"
        width: settingsColumn.width
        height: generalSettingsContent.implicitHeight + Style.space(20)
        radius: Style.cornerRadius
        color: "transparent"
        border.color: panel.subtleText
        border.width: Style.spacing.hairline

        Column {
          id: generalSettingsContent
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.top: parent.top
          anchors.margins: Style.space(10)
          spacing: Style.space(8)

          Text {
            text: panel.i18n("general")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.bold: true
            font.letterSpacing: 1
          }

          Text {
            text: panel.i18n("unitSystem")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // Same control as the language below; "Automatic" names the result.
          Dropdown {
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            value: panel.settingsUnitSystem
            options: [
              { value: "auto", label: panel.i18n("autoUnits") + " (" + panel.i18n(panel.useImperial ? "imperialUnits" : "metricUnits") + ")" },
              { value: "metric", label: panel.i18n("metricUnits") + " · " + panel.i18n("metricUnitsSummary") },
              { value: "imperial", label: panel.i18n("imperialUnits") + " · " + panel.i18n("imperialUnitsSummary") }
            ]
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("unitSystem", value) }
          }

          Text {
            text: panel.i18n("language")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            value: String(panel.generalSetting("language", "auto"))
            options: [{ value: "auto", label: panel.i18n("languageAuto",
                { language: I18n.languageName(I18n.languageForLocale(panel.localeName)) }) }]
              .concat(I18n.supportedLanguages().map(function(code) {
                return { value: code, label: I18n.languageName(code) }
              }))
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("language", value) }
          }

        }
      }

      // Which part the cards below configure: the bar entry, its popup, or
      // the full app. Underlined tabs, so they read as a sub-level of the
      // page tabs above.
      Item {
        id: settingsSurfaceRow
        visible: panel.settingsPage === "display"
        width: parent.width
        height: Style.space(34)

        Rectangle {
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.bottom: parent.bottom
          height: Style.spacing.hairline
          color: panel.subtleText
        }

        Row {
          anchors.fill: parent

          Repeater {
            model: [
              { surface: "menubar", title: panel.i18n("menubar") },
              { surface: "widget", title: panel.i18n("widget") },
              { surface: "app", title: panel.i18n("app") }
            ]

            Item {
              required property var modelData
              readonly property bool selected: panel.settingsTargetSurface === modelData.surface
              width: settingsSurfaceRow.width / 3
              height: settingsSurfaceRow.height

              Text {
                anchors.centerIn: parent
                text: parent.modelData.title
                color: parent.selected || surfaceTabMouse.containsMouse
                  ? Style.hoverStateColor(panel.foreground, Color.accent)
                  : panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
                font.bold: parent.selected
              }

              Rectangle {
                visible: parent.selected
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                height: Style.space(2)
                color: Color.accent
              }

              MouseArea {
                id: surfaceTabMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: panel.settingsTargetSurface = parent.modelData.surface
              }
            }
          }
        }
      }

      Text {
        visible: panel.settingsPage === "display"
        width: parent.width
        text: panel.i18n("displaySettingsHint")
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        wrapMode: Text.WordWrap
      }

      Repeater {
        // Menu bar: cards in the order the entries appear in the bar; the
        // first card's switch shows or hides the whole bar entry.
        model: panel.settingsTargetSurface === "menubar" ? [
          {
            title: panel.i18n("currentWeather"),
            masterKey: "showCurrent",
            options: [
              { key: "currentWeatherSymbol", title: panel.i18n("weatherSymbol") },
              { key: "currentLocation", title: panel.i18n("location") },
              { key: "currentTemperature", title: panel.i18n("temperature") },
              { key: "currentFeelsLike", title: panel.i18n("feelsLikeTemperature") },
              { key: "currentWind", title: panel.i18n("wind") },
              { key: "currentHumidity", title: panel.i18n("humidity") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.upperLabel(panel.i18n("precipitation")),
            masterKey: "",
            dependsOn: "showCurrent",
            options: [
              { key: "currentPrecipitation", title: panel.i18n("precipitation") },
              { key: "currentRainStart", title: panel.i18n("rainStartTime") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.upperLabel(panel.i18n("airQualityPollen")),
            masterKey: "",
            dependsOn: "showCurrent",
            options: [
              { key: "currentAirQuality", title: panel.i18n("airQualityIndex") },
              { key: "currentAirQualityColor", title: panel.i18n("airQualityColor") },
              { key: "currentAirQualityAlert", title: panel.i18n("airQualityAlert") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.upperLabel(panel.i18n("weatherWarnings")),
            masterKey: "",
            dependsOn: "showCurrent",
            options: [
              { key: "currentWarnings", title: panel.i18n("weatherWarnings") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.upperLabel(panel.i18n("notifications")),
            masterKey: "",
            options: [
              { key: "notifySevereWarnings", title: panel.i18n("notifySevereWarnings") },
              { key: "notifyRainSoon", title: panel.i18n("notifyRainSoon") }
            ],
            hint: panel.i18n("notifySevereWarningsHint") + " " + panel.i18n("notifyRainSoonHint"),
            hasDefaultTab: false
          }
        ] : [
          // Same order as the sections in the view. The first row cannot be
          // hidden as a whole (it holds place, refresh and settings), so its
          // card has no master switch.
          {
            title: panel.i18n("currentWeather"),
            masterKey: "",
            options: [
              { key: "heroSymbol", title: panel.i18n("weatherSymbol") },
              { key: "heroTemperature", title: panel.i18n("temperature") },
              { key: "heroFeelsLike", title: panel.i18n("feelsLikeTemperature") },
              { key: "heroWind", title: panel.i18n("wind") },
              { key: "heroHumidity", title: panel.i18n("humidity") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.upperLabel(panel.i18n("airQualityPollen")),
            masterKey: "showAirQuality",
            options: [
              { key: "airQualityIndex", title: panel.i18n("airQualityIndex") },
              { key: "airQualityPollen", title: panel.i18n("pollen") },
              { key: "airQualityColor", title: panel.i18n("airQualityColor") }
            ],
            hint: panel.i18n("airQualityHint"),
            hasDefaultTab: false
          },
          {
            title: panel.i18n("hourly"),
            masterKey: "showHourly",
            options: [
              { key: "hourlyTime", title: panel.i18n("time") },
              { key: "hourlyIcon", title: panel.i18n("weatherSymbol") },
              { key: "hourlyTemperature", title: panel.i18n("temperature") },
              { key: "hourlyRainProbability", title: panel.i18n("rainProbability") },
              { key: "hourlyRainAmount", title: panel.i18n("rainAmount") },
              { key: "hourlyUv", title: panel.i18n("uvIndex") },
              { key: "hourlyWind", title: panel.i18n("wind") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.i18n("daily"),
            masterKey: "showDaily",
            options: [
              { key: "dailyDayName", title: panel.i18n("weekday") },
              { key: "dailyIcon", title: panel.i18n("weatherSymbol") },
              { key: "dailyTemperature", title: panel.i18n("temperatureRange") },
              { key: "dailyRainProbability", title: panel.i18n("rainProbability") },
              { key: "dailyRainAmount", title: panel.i18n("rainAmount") },
              { key: "dailyUv", title: panel.i18n("uvIndex") },
              { key: "dailyWind", title: panel.i18n("wind") },
              { key: "dailySunEvents", title: panel.i18n("sunriseSunset") }
            ],
            hasDefaultTab: false
          },
          {
            title: panel.i18n("forecast"),
            masterKey: "showForecast",
            options: [
              { key: "forecastIntensity", title: panel.i18n("intensity") },
              { key: "forecastProbability", title: panel.i18n("probability") },
              { key: "forecastTotal", title: panel.i18n("twoHourTotal") }
            ],
            hasDefaultTab: true
          }
        ]

        Rectangle {
          id: settingsCard
          required property var modelData
          visible: panel.settingsPage === "display"
          property var groupData: modelData
          // Cards that only apply while another switch is on (dependsOn).
          readonly property bool cardEnabled: !groupData.dependsOn
            || panel.settingsDisplaySetting(groupData.dependsOn, true)
          width: settingsColumn.width
          height: settingsCardContent.implicitHeight + Style.space(20)
          radius: Style.cornerRadius
          color: "transparent"
          border.color: panel.subtleText
          border.width: Style.spacing.hairline

          Column {
            id: settingsCardContent
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.margins: Style.space(10)
            spacing: 0

            WeatherSwitchRow {
              visible: settingsCard.groupData.masterKey !== ""
              panel: settingsView.panel
              width: parent.width
              settingKey: settingsCard.groupData.masterKey
              title: settingsCard.groupData.title
              emphasized: true
            }

            Text {
              visible: settingsCard.groupData.masterKey === ""
              opacity: settingsCard.cardEnabled ? 1 : 0.42
              width: parent.width
              height: Style.space(34)
              verticalAlignment: Text.AlignVCenter
              text: settingsCard.groupData.title
              color: panel.foreground
              font.family: panel.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
              font.letterSpacing: 1
              elide: Text.ElideRight
            }

            Text {
              visible: !!settingsCard.groupData.hint
              width: parent.width
              text: settingsCard.groupData.hint || ""
              bottomPadding: settingsCard.groupData.options.length > 0 ? Style.space(8) : 0
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }

            Rectangle {
              visible: settingsCard.groupData.options.length > 0
              width: parent.width
              height: Style.spacing.hairline
              color: panel.foreground
              opacity: 0.12
            }

            Repeater {
              model: settingsCard.groupData.options

              WeatherSwitchRow {
                panel: settingsView.panel
                required property var modelData
                width: settingsCardContent.width
                settingKey: modelData.key
                title: modelData.title
                rowEnabled: (settingsCard.groupData.masterKey === ""
                  || panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true))
                  && settingsCard.cardEnabled
              }
            }

            Item {
              visible: settingsCard.groupData.hasDefaultTab
              width: parent.width
              height: visible ? Style.space(66) : 0
              opacity: panel.settingsShowForecastSection ? 1 : 0.42

              Column {
                anchors.left: parent.left
                anchors.leftMargin: Style.space(12)
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.topMargin: Style.space(6)
                spacing: Style.space(6)

                Text {
                  text: panel.i18n("defaultTab")
                  color: panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Row {
                  id: defaultTabRow
                  width: parent.width
                  spacing: Style.space(5)

                  Repeater {
                    model: [panel.i18n("rain").toUpperCase(), panel.i18n("radar").toUpperCase(), panel.i18n("wind").toUpperCase()]

                    Rectangle {
                      required property string modelData
                      required property int index
                      width: (defaultTabRow.width - defaultTabRow.spacing * 2) / 3
                      height: Style.space(28)
                      radius: Style.cornerRadius
                      enabled: panel.settingsShowForecastSection
                      color: index === panel.settingsDefaultForecastTab
                        ? Style.selectedFillFor(panel.foreground, Color.accent)
                        : (defaultTabMouse.containsMouse
                          ? Style.hoverFillFor(panel.foreground, Color.accent)
                          : "transparent")
                      border.color: panel.subtleText
                      border.width: Style.spacing.hairline

                      Text {
                        anchors.centerIn: parent
                        text: modelData
                        color: index === panel.settingsDefaultForecastTab
                          ? Style.selectedStateColor(panel.foreground, Color.accent)
                          : panel.foreground
                        font.family: panel.fontFamily
                        font.pixelSize: Style.font.caption
                        font.bold: index === panel.settingsDefaultForecastTab
                      }

                      MouseArea {
                        id: defaultTabMouse
                        anchors.fill: parent
                        enabled: parent.enabled
                        hoverEnabled: true
                        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
                        onClicked: panel.displayOptionsStore.setSettingsDisplaySetting("defaultForecastTab", index)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Two-step reset: the first click arms it, a second click within a few
      // seconds restores the selected view's factory defaults.
      Rectangle {
        id: restoreDefaultsButton
        property bool armed: false
        readonly property bool isDefault: panel.displayOptionsStore.settingsDisplayIsDefault()
        visible: panel.settingsPage === "display"
        anchors.horizontalCenter: parent.horizontalCenter
        width: Math.min(settingsColumn.width,
          restoreDefaultsLabel.implicitWidth + Style.space(28))
        height: Style.space(32)
        radius: Style.cornerRadius
        enabled: !isDefault
        opacity: isDefault ? 0.42 : 1
        color: armed ? Style.selectedFillFor(panel.foreground, Color.accent)
          : (restoreDefaultsMouse.containsMouse
            ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")
        border.color: armed ? Color.accent : panel.subtleText
        border.width: Style.spacing.hairline

        onIsDefaultChanged: if (isDefault) armed = false
        onVisibleChanged: armed = false

        Connections {
          target: panel
          function onSettingsTargetSurfaceChanged() { restoreDefaultsButton.armed = false }
        }

        Timer {
          running: restoreDefaultsButton.armed
          interval: 4000
          onTriggered: restoreDefaultsButton.armed = false
        }

        Text {
          id: restoreDefaultsLabel
          anchors.centerIn: parent
          width: Math.min(implicitWidth, settingsColumn.width - Style.space(28))
          text: panel.i18n(parent.isDefault ? "defaultsActive"
            : (parent.armed ? "restoreDefaultsConfirm" : "restoreDefaults"))
          color: parent.armed
            ? Style.selectedStateColor(panel.foreground, Color.accent)
            : panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          font.bold: parent.armed
          elide: Text.ElideRight
        }

        MouseArea {
          id: restoreDefaultsMouse
          anchors.fill: parent
          enabled: parent.enabled
          hoverEnabled: true
          cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
          onClicked: {
            if (!parent.armed) {
              parent.armed = true
              return
            }
            parent.armed = false
            panel.displayOptionsStore.restoreSettingsDisplayDefaults()
          }
        }
      }

      Item {
        width: parent.width
        height: Style.space(4)
      }
    }
  }
}
