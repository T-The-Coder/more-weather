import QtQuick
import qs.Commons
import qs.Ui

BarWidget {
  id: root
  moduleName: "more-weather"

  function injectPanel() {
    var target = panelLoader.item
    if (!target) return
    if ("bar" in target) target.bar = root.bar
    if ("settings" in target) target.settings = root.settings
    if ("anchorItem" in target) target.anchorItem = button
    if ("hostWidget" in target) target.hostWidget = root
  }

  function refresh() {
    if (panelLoader.item && panelLoader.item.manualRefresh) panelLoader.item.manualRefresh()
  }

  function togglePanel() {
    if (panelLoader.item && panelLoader.item.toggle) panelLoader.item.toggle()
  }

  // Shape contract for shell.summon/hide/toggle routing (Bar.findPanelWidget
  // requires open/close/opened on the bar-widget root). Open maps to the
  // panel's hotkey path so summoning suppresses the center hover reveal,
  // matching what the old per-plugin IpcHandler did.
  readonly property bool opened: panelLoader.item ? panelLoader.item.opened === true : false

  function open() {
    if (panelLoader.item && panelLoader.item.openFromHotkey) panelLoader.item.openFromHotkey()
  }

  function close() {
    if (panelLoader.item && panelLoader.item.close) panelLoader.item.close()
  }

  // Forwarded so this widget can stand in for the panel as the bar's popout
  // identity: Bar.requestPopout prefers closeForPopoutSwitch over close, and
  // KeyboardPanel reads popoutSwitchClosing back off its owner.
  readonly property bool popoutSwitchClosing: panelLoader.item ? panelLoader.item.popoutSwitchClosing === true : false

  function closeForPopoutSwitch() {
    if (panelLoader.item) panelLoader.item.closeForPopoutSwitch()
  }

  // --- hover ------------------------------------------------------------
  // Entries set to "Hover" show while the pointer rests on the widget,
  // and the popup can open from hover alone. Once the popup is open it covers
  // the bar, so the panel's hover zones (widget spot, and the stretch from
  // it to the card) stand in for the button.
  readonly property bool pointerOnWidget: button.tooltipHovered
  // Text and symbols in the bar turn bold while the pointer rests on them,
  // also with the popup open over the widget's spot (menu bar setting
  // "Bold while hovered").
  readonly property bool barHoverHeld: !!panelLoader.item
    && (pointerOnWidget || (opened && panelLoader.item.popupPointerOnAnchor))
  readonly property bool barBold: barHoverHeld && panelLoader.item.menubarBoldOnHover
  // The values take the popup's colour accents always, or while the bar
  // would turn bold (menu bar setting "Colour the values"), never with the
  // global colour switch off.
  readonly property bool barAccents: !!panelLoader.item && panelLoader.item.colorAccents
    && (panelLoader.item.menubarAccents === "always"
      || (panelLoader.item.menubarAccents === "hover" && barHoverHeld))
  // An entry's accent while the bar is coloured, else "".
  function accentFor(key) {
    return barAccents && key !== "" ? panelLoader.item.menubarAccentFor(key) : ""
  }
  // An entry's accent, or the bar's text colour.
  function accentColor(key) {
    return accentFor(key) || button.foreground
  }
  // A value in its accent inside a styled line; plain without one.
  function accentSpan(value, key) {
    var escaped = String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    var accent = accentFor(key)
    return accent !== "" ? "<font color=\"" + String(accent) + "\">" + escaped + "</font>" : escaped
  }
  // "Wind 26 km/h" with only the value in its accent.
  function labelled(label, value, key) {
    return accentSpan(label + " ", "") + accentSpan(value, key)
  }
  // Opened while the pointer was on the widget; holds until the popup's
  // zones have seen the pointer, since they only learn of it once it moves.
  property bool hoverLatched: false
  property bool popupZoneSeen: false
  property bool openedByHover: false
  // Closed with the pointer still on the widget: no reopening until it
  // has left.
  property bool hoverOpenBlocked: false
  readonly property bool pointerNear: pointerOnWidget || (opened && !!panelLoader.item
    && (panelLoader.item.popupPointerInside || (hoverLatched && !popupZoneSeen)))

  onPointerNearChanged: {
    if (pointerNear) {
      hoverLeaveTimer.stop()
      hoverEnterTimer.start()
    } else {
      hoverEnterTimer.stop()
      hoverLeaveTimer.start()
    }
  }
  onPointerOnWidgetChanged: if (!pointerOnWidget && !opened) hoverOpenBlocked = false
  onOpenedChanged: {
    if (opened) {
      hoverLatched = pointerOnWidget || (!!panelLoader.item && panelLoader.item.menubarHovered)
    } else {
      hoverOpenBlocked = pointerOnWidget
        || (!!panelLoader.item && panelLoader.item.popupPointerOnAnchor)
        || (hoverLatched && !popupZoneSeen)
      hoverLatched = false
      openedByHover = false
    }
    popupZoneSeen = false
  }

  Connections {
    target: panelLoader.item
    ignoreUnknownSignals: true
    function onPopupPointerInsideChanged() {
      if (panelLoader.item.popupPointerInside) root.popupZoneSeen = true
    }
  }

  Timer {
    id: hoverEnterTimer
    interval: 120
    onTriggered: if (panelLoader.item) panelLoader.item.menubarHovered = true
  }

  Timer {
    id: hoverLeaveTimer
    interval: 400
    onTriggered: {
      var panel = panelLoader.item
      if (!panel) return
      panel.menubarHovered = false
      // A popup opened by hover closes again once the pointer has left it,
      // unless something in it is being edited.
      if (root.openedByHover && root.opened && root.popupZoneSeen
          && !panel.settingsOpen && !panel.editingLocation)
        panel.close()
    }
  }

  Timer {
    id: hoverOpenTimer
    interval: 250
    running: !!panelLoader.item && panelLoader.item.menubarOpenWidgetOnHover
      && root.pointerOnWidget && !root.opened && !root.hoverOpenBlocked
    onTriggered: {
      if (!panelLoader.item || root.opened) return
      root.openedByHover = true
      // The hotkey path: the plain open() left the popup without pointer
      // events while it mapped under the pointer.
      panelLoader.item.openFromHotkey()
    }
  }

  visible: panelLoader.item && panelLoader.item.menubarHasVisibleContent
    && (!root.vertical || panelLoader.item.menubarShowWeatherSymbol)
  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  onBarChanged: injectPanel()
  onSettingsChanged: injectPanel()

  Loader {
    id: panelLoader
    active: true
    source: Qt.resolvedUrl("Panel.qml")
    visible: false
    onLoaded: {
      root.injectPanel()
      injectAgainTimer.start()
    }
  }

  // Once more after this event, from a Timer rather than Qt.callLater so a
  // widget removed with its monitor never runs the call without its root.
  Timer {
    id: injectAgainTimer
    interval: 0
    onTriggered: root.injectPanel()
  }

  WidgetButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: ""
    labelVisible: false
    hasVisualContent: root.visible
    fixedWidth: root.vertical ? Style.bar.iconSlot : weatherBarContent.implicitWidth + Style.spaceReal(17.5)
    fixedHeight: root.vertical ? Style.bar.iconSlot : -1
    horizontalMargin: 8.75
    verticalPadding: 8.75
    // Tooltip suppressed because the panel is the detail view.
    tooltipText: ""

    Row {
      id: weatherBarContent
      anchors.centerIn: parent
      spacing: Style.space(5)

      // Entries in the order chosen under Settings → Display → Menu bar.
      Repeater {
        model: panelLoader.item ? panelLoader.item.menubarEntryOrder : []

        Loader {
          required property string modelData
          anchors.verticalCenter: parent.verticalCenter
          // An entry with nothing to say takes no space in the row. Read
          // from the entry's own flag: `visible` would report this loader's
          // state back to itself.
          visible: item ? item.entryVisible : false
          active: !!panelLoader.item
          sourceComponent: modelData === "currentWeatherSymbol" ? symbolEntry
            : (modelData === "currentSunrise" || modelData === "currentSunset"
                || modelData === "currentSunNext" ? sunEntry
            : (modelData === "currentMoon" ? moonEntry
            : (modelData === "currentRain" ? rainEntry
              : (modelData === "currentAirQuality" ? airQualityEntry
                : (modelData === "currentWarnings" ? warningEntry : textEntry)))))
        }
      }

      // Every entry that is a plain piece of text, told apart by its key.
      Component {
        id: textEntry

        Text {
          readonly property string entryKey: parent ? parent.modelData : ""
          property bool entryVisible: !root.vertical && plainText !== ""
          visible: entryVisible
          // Label and value with the value in its accent, for the entries
          // the popup colours; "" for the rest and with accents off.
          readonly property string accentText: {
            if (!root.barAccents || plainText === "") return ""
            var p = panelLoader.item
            if (entryKey === "currentTemperature") return root.accentSpan(plainText, entryKey)
            if (entryKey === "currentFeelsLike") return root.labelled(p.i18n("feelsLikeShort"), p.menubarReportFeels, entryKey)
            if (entryKey === "currentWind") return root.labelled(p.i18n("wind"), p.menubarReportWind, entryKey)
            if (entryKey === "currentUv") return root.labelled("UV", p.menubarUvValueText, entryKey)
            if (entryKey === "currentDayRange")
              return root.accentSpan(p.menubarDayMinText, "currentDayMin") + " / "
                + root.accentSpan(p.menubarDayMaxText, "currentDayMax")
            return ""
          }
          text: accentText !== "" ? accentText : plainText
          textFormat: accentText !== "" ? Text.StyledText : Text.PlainText
          readonly property string plainText: {
            if (!panelLoader.item) return ""
            if (entryKey === "currentLocation") return panelLoader.item.menubarShowLocation ? panelLoader.item.reportLocation : ""
            if (entryKey === "currentTemperature") return panelLoader.item.menubarShowTemperature ? panelLoader.item.menubarTemperatureText : ""
            if (entryKey === "currentFeelsLike")
              return panelLoader.item.menubarShowFeelsLike && panelLoader.item.menubarReportFeels !== ""
                ? panelLoader.item.i18n("feelsLikeShort") + " " + panelLoader.item.menubarReportFeels : ""
            if (entryKey === "currentWind")
              return panelLoader.item.menubarShowWind && panelLoader.item.menubarReportWind !== ""
                ? panelLoader.item.i18n("wind") + " " + panelLoader.item.menubarReportWind : ""
            if (entryKey === "currentHumidity")
              return panelLoader.item.menubarShowHumidity && panelLoader.item.menubarReportHumidity !== ""
                ? panelLoader.item.i18n("humidity") + " " + panelLoader.item.menubarReportHumidity : ""
            if (entryKey === "currentUv") return panelLoader.item.menubarUvText
            if (entryKey === "currentDayRange") return panelLoader.item.menubarDayRangeText
            if (entryKey === "currentRainAmount") return panelLoader.item.menubarRainAmountText
            if (entryKey === "currentPollen")
              return panelLoader.item.menubarPollenAlertText !== "" ? "\u{f032a} " + panelLoader.item.menubarPollenAlertText : ""
            return ""
          }
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.bold: root.barBold
          font.italic: {
            if (!panelLoader.item) return false
            if (entryKey === "currentLocation") return panelLoader.item.locationCached
            if (entryKey === "currentTemperature") return panelLoader.item.menubarTemperatureCached
            if (entryKey === "currentFeelsLike") return panelLoader.item.menubarFeelsCached
            if (entryKey === "currentWind") return panelLoader.item.menubarWindCached
            if (entryKey === "currentHumidity") return panelLoader.item.menubarHumidityCached
            if (entryKey === "currentUv") return panelLoader.item.menubarUvCached
            if (entryKey === "currentDayRange")
              return panelLoader.item.cachedField(panelLoader.item.todayForecast,
                panelLoader.item.menubarUseImperial ? "maxtempF" : "maxtempC")
            if (entryKey === "currentRainAmount")
              return panelLoader.item.cachedField(panelLoader.item.nextHourForecast, "rainAmount")
            if (entryKey === "currentPollen") return panelLoader.item.airQuality ? panelLoader.item.airQuality.stale : false
            return false
          }
          renderType: Text.NativeRendering
        }
      }

      Component {
        id: symbolEntry

        Text {
          id: barSymbol
          property bool entryVisible: !!panelLoader.item && panelLoader.item.menubarShowWeatherSymbol
          visible: entryVisible
          transform: Scale {
            origin.x: barSymbol.width / 2
            xScale: panelLoader.item && panelLoader.item.mirrorsGlyph(barSymbol.text) ? -1 : 1
          }
          text: panelLoader.item ? panelLoader.item.displayLabel : ""
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.bar.iconFont
          font.bold: root.barBold
          font.italic: panelLoader.item ? panelLoader.item.weatherSymbolCached : false
          renderType: Text.NativeRendering
        }
      }

      // Sunrise, sunset, or whichever of the two comes next — with the same
      // drawn arrow as the daily forecast.
      Component {
        id: sunEntry

        Row {
          readonly property string entryKey: parent ? parent.modelData : ""
          readonly property string time: {
            if (!panelLoader.item) return ""
            if (entryKey === "currentSunrise") return panelLoader.item.menubarSunriseText
            if (entryKey === "currentSunset") return panelLoader.item.menubarSunsetText
            return panelLoader.item.menubarSunNextText
          }
          readonly property bool rising: entryKey === "currentSunrise"
            || (entryKey === "currentSunNext" && !!panelLoader.item && panelLoader.item.menubarSunNextRising)
          property bool entryVisible: !root.vertical && time !== ""
          visible: entryVisible
          spacing: Style.space(3)

          Canvas {
            id: sunEventIcon
            anchors.verticalCenter: parent.verticalCenter
            // Same 11px drawing as the daily forecast's sun events.
            width: Style.space(11)
            height: Style.space(11)
            property color iconColor: button.foreground
            property bool rising: parent.rising
            property bool bold: root.barBold
            onIconColorChanged: requestPaint()
            onRisingChanged: requestPaint()
            onBoldChanged: requestPaint()
            onPaint: if (panelLoader.item) panelLoader.item.paintSunEventIcon(sunEventIcon, rising)
          }

          Text {
            anchors.verticalCenter: parent.verticalCenter
            text: parent.time
            color: button.foreground
            font.family: root.bar ? root.bar.fontFamily : Style.font.family
            font.pixelSize: Style.font.body
            font.bold: root.barBold
            font.italic: !!panelLoader.item && panelLoader.item.cachedField(panelLoader.item.todayForecast,
              parent.rising ? "sunrise" : "sunset")
            renderType: Text.NativeRendering
          }
        }
      }

      // The moon phase, mirrored south of the equator like every other
      // moon glyph.
      Component {
        id: moonEntry

        Text {
          id: barMoon
          property bool entryVisible: !root.vertical && !!panelLoader.item
            && panelLoader.item.menubarMoonText !== ""
          visible: entryVisible
          transform: Scale {
            origin.x: barMoon.width / 2
            xScale: panelLoader.item && panelLoader.item.mirrorsGlyph(barMoon.text) ? -1 : 1
          }
          text: panelLoader.item ? panelLoader.item.menubarMoonText : ""
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.bold: root.barBold
          renderType: Text.NativeRendering
        }
      }

      // The rain spot: the radar rate (mm/h) while it rains at the place,
      // the rain start when it is on its way, the probability otherwise —
      // see Panel.menubarRainBadgeText.
      Component {
        id: rainEntry

        Row {
          property bool entryVisible: !root.vertical && !!panelLoader.item
            && panelLoader.item.menubarRainBadgeText !== ""
          visible: entryVisible
          spacing: Style.space(3)

          Text {
            visible: rainDrop.level < 0
            anchors.verticalCenter: parent.verticalCenter
            text: "󰖌"
            color: button.foreground
            font.family: root.bar ? root.bar.fontFamily : Style.font.family
            font.pixelSize: Style.font.body
            font.bold: root.barBold
            font.italic: panelLoader.item ? panelLoader.item.rainBadgeCached : false
            renderType: Text.NativeRendering
          }

          // With the probability shown, the drop fills with it: outline,
          // half or full (Panel.menubarRainDropLevel).
          // The font's own outline drop, with its filled drop cut off above
          // the water line, so size and style match the text beside it.
          Item {
            id: rainDrop
            readonly property int level: panelLoader.item ? panelLoader.item.menubarRainDropLevel : -1
            // Filled by area, not height: the narrow tip holds little, so
            // half the water stands at 42 % of the drop's height (measured on
            // the glyph).
            readonly property real fill: level >= 100 ? 1 : (level >= 50 ? 0.423 : 0)
            // The drop's ink within the line, from the font itself.
            readonly property rect ink: dropMetrics.height > 0
              ? dropMetrics.tightBoundingRect("󰖌") : Qt.rect(0, 0, 0, 0)
            readonly property real waterLine: fill >= 1 ? 0
              : dropMetrics.ascent + ink.y + ink.height * (1 - fill)
            visible: level >= 0
            anchors.verticalCenter: parent.verticalCenter
            width: dropOutline.implicitWidth
            height: dropOutline.implicitHeight

            FontMetrics {
              id: dropMetrics
              font: dropOutline.font
            }

            Text {
              id: dropOutline
              text: "󰸊"
              color: button.foreground
              font.family: root.bar ? root.bar.fontFamily : Style.font.family
              font.pixelSize: Style.font.body
              font.bold: root.barBold
              renderType: Text.NativeRendering
            }

            Item {
              visible: rainDrop.fill > 0
              clip: true
              y: rainDrop.waterLine
              width: parent.width
              height: Math.max(0, parent.height - y)

              Text {
                y: -parent.y
                text: "󰖌"
                color: button.foreground
                font: dropOutline.font
                renderType: Text.NativeRendering
              }
            }
          }

          Text {
            anchors.verticalCenter: parent.verticalCenter
            text: panelLoader.item ? panelLoader.item.menubarRainBadgeText : ""
            color: root.accentColor("currentRain")
            font.family: root.bar ? root.bar.fontFamily : Style.font.family
            font.pixelSize: Style.font.body
            font.bold: root.barBold
            font.italic: panelLoader.item ? panelLoader.item.rainBadgeCached : false
            renderType: Text.NativeRendering
          }
        }
      }

      // Air quality index, with the softened category dot in front of it.
      Component {
        id: airQualityEntry

        Row {
          property bool entryVisible: !root.vertical && !!panelLoader.item
            && panelLoader.item.menubarAirQualityText !== ""
          visible: entryVisible
          spacing: Style.space(3)

          Rectangle {
            visible: !!panelLoader.item && panelLoader.item.menubarShowAirQualityColor
            anchors.verticalCenter: parent.verticalCenter
            width: Style.space(7)
            height: width
            radius: width / 2
            color: panelLoader.item ? panelLoader.item.menubarAirQualityColor : "transparent"
          }

          Text {
            anchors.verticalCenter: parent.verticalCenter
            text: "AQI"
            color: button.foreground
            font.family: root.bar ? root.bar.fontFamily : Style.font.family
            font.pixelSize: Style.font.body
            font.bold: root.barBold
            renderType: Text.NativeRendering
          }

          Text {
            anchors.verticalCenter: parent.verticalCenter
            text: panelLoader.item ? panelLoader.item.menubarAirQualityText : ""
            color: button.foreground
            font.family: root.bar ? root.bar.fontFamily : Style.font.family
            font.pixelSize: Style.font.body
            font.bold: root.barBold
            font.italic: panelLoader.item && panelLoader.item.airQuality ? panelLoader.item.airQuality.stale : false
            renderType: Text.NativeRendering
          }
        }
      }

      Component {
        id: warningEntry

        Text {
          property bool entryVisible: !root.vertical && !!panelLoader.item
            && panelLoader.item.menubarShowWarnings && panelLoader.item.hasWeatherAlert
          visible: entryVisible
          text: "!"
          color: panelLoader.item ? panelLoader.item.warningColor : button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.title
          font.bold: true
          font.italic: panelLoader.item ? panelLoader.item.warningsCached : false
          renderType: Text.NativeRendering
        }
      }
    }

    onPressed: function(b) {
      if (!root.bar) return
      if (b === Qt.RightButton) root.bar.run("omarchy-notification-send \"$(omarchy-weather-status)\"")
      else if (b === Qt.MiddleButton) root.refresh()
      // A click on a popup opened by hover keeps it open.
      else if (root.openedByHover && root.opened) root.openedByHover = false
      else root.togglePanel()
    }
  }
}
