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
  // Entries set to "on hover" show while the pointer rests on the widget,
  // and the popup can open from hover alone. Once the popup is open it covers
  // the bar, so the panel's hover zones (widget spot, and the stretch from
  // it to the card) stand in for the button.
  readonly property bool pointerOnWidget: button.tooltipHovered
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

      Text {
        id: barSymbol
        visible: panelLoader.item && panelLoader.item.menubarShowWeatherSymbol
        anchors.verticalCenter: parent.verticalCenter
        transform: Scale {
          origin.x: barSymbol.width / 2
          xScale: panelLoader.item && panelLoader.item.mirrorsGlyph(barSymbol.text) ? -1 : 1
        }
        text: panelLoader.item ? panelLoader.item.displayLabel : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.bar.iconFont
        font.italic: panelLoader.item ? panelLoader.item.weatherSymbolCached : false
        renderType: Text.NativeRendering
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowLocation && text !== ""
        anchors.verticalCenter: parent.verticalCenter
        text: panelLoader.item ? panelLoader.item.reportLocation : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        font.italic: panelLoader.item ? panelLoader.item.locationCached : false
        renderType: Text.NativeRendering
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowTemperature && text !== ""
        anchors.verticalCenter: parent.verticalCenter
        text: panelLoader.item && panelLoader.item.menubarReportTempNum !== ""
          ? panelLoader.item.menubarReportTempNum + "°"
          : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        font.italic: panelLoader.item ? panelLoader.item.menubarTemperatureCached : false
        renderType: Text.NativeRendering
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowFeelsLike && panelLoader.item.menubarReportFeels !== ""
        anchors.verticalCenter: parent.verticalCenter
        text: panelLoader.item
          ? panelLoader.item.i18n("feelsLikeShort") + " " + panelLoader.item.menubarReportFeels : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        font.italic: panelLoader.item ? panelLoader.item.menubarFeelsCached : false
        renderType: Text.NativeRendering
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowWind && panelLoader.item.menubarReportWind !== ""
        anchors.verticalCenter: parent.verticalCenter
        text: panelLoader.item
          ? panelLoader.item.i18n("wind") + " " + panelLoader.item.menubarReportWind : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        font.italic: panelLoader.item ? panelLoader.item.menubarWindCached : false
        renderType: Text.NativeRendering
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowHumidity && panelLoader.item.menubarReportHumidity !== ""
        anchors.verticalCenter: parent.verticalCenter
        text: panelLoader.item
          ? panelLoader.item.i18n("humidity") + " " + panelLoader.item.menubarReportHumidity : ""
        color: button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.body
        font.italic: panelLoader.item ? panelLoader.item.menubarHumidityCached : false
        renderType: Text.NativeRendering
      }

      Row {
        // Shows the observed radar rate (mm/h) while it's actually raining
        // at the configured location, falling back to the forecast
        // probability (%) otherwise — see Panel.rainBadgeText.
        visible: !root.vertical && panelLoader.item && panelLoader.item.menubarRainBadgeText !== ""
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(3)

        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: "󰖌"
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.italic: panelLoader.item ? panelLoader.item.rainBadgeCached : false
          renderType: Text.NativeRendering
        }

        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: panelLoader.item ? panelLoader.item.menubarRainBadgeText : ""
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.italic: panelLoader.item ? panelLoader.item.rainBadgeCached : false
          renderType: Text.NativeRendering
        }
      }

      // Air quality index: switched on for the menu bar, or as the hint for poor air.
      Row {
        visible: !root.vertical && panelLoader.item && panelLoader.item.menubarAirQualityText !== ""
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(3)

        Rectangle {
          visible: !!panelLoader.item && panelLoader.item.menubarShowAirQualityColor
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(7)
          height: width
          radius: width / 2
          color: panelLoader.item ? panelLoader.item.menubarAirQualityColor : "transparent"
        }

        // "AQI" as text: the wind-like air glyph read as a wind value.
        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: "AQI"
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          renderType: Text.NativeRendering
        }

        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: panelLoader.item ? panelLoader.item.menubarAirQualityText : ""
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.italic: panelLoader.item && panelLoader.item.airQuality ? panelLoader.item.airQuality.stale : false
          renderType: Text.NativeRendering
        }
      }

      // High pollen; hidden otherwise.
      Row {
        visible: !root.vertical && panelLoader.item && panelLoader.item.menubarPollenAlertText !== ""
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(3)

        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: "\u{f032a}"
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          renderType: Text.NativeRendering
        }

        Text {
          anchors.verticalCenter: parent.verticalCenter
          text: panelLoader.item ? panelLoader.item.menubarPollenAlertText : ""
          color: button.foreground
          font.family: root.bar ? root.bar.fontFamily : Style.font.family
          font.pixelSize: Style.font.body
          font.italic: panelLoader.item && panelLoader.item.airQuality ? panelLoader.item.airQuality.stale : false
          renderType: Text.NativeRendering
        }
      }

      Text {
        visible: !root.vertical && panelLoader.item
          && panelLoader.item.menubarShowWarnings && panelLoader.item.hasWeatherAlert
        anchors.verticalCenter: parent.verticalCenter
        text: "!"
        color: panelLoader.item ? panelLoader.item.warningColor : button.foreground
        font.family: root.bar ? root.bar.fontFamily : Style.font.family
        font.pixelSize: Style.font.title
        font.bold: true
        font.italic: panelLoader.item ? panelLoader.item.warningsCached : false
        renderType: Text.NativeRendering
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
