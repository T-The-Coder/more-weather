import QtQuick
import qs.Commons
import qs.Ui
import "I18n.js" as I18n
import "Model.js" as Model

// Per-surface display settings (menu bar, app, widget). Created on demand
// while settings are open.
Rectangle {
  id: settingsView
  required property var panel
  anchors.fill: parent
  z: 100
  color: Color.popups.background

  MouseArea { anchors.fill: parent }

  // Menu bar entries have two switch columns, "always" and "on hover"; both
  // columns take the width of the longer heading.
  TextMetrics {
    id: alwaysHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showAlways")
  }
  TextMetrics {
    id: onHoverHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showOnHover")
  }
  TextMetrics {
    id: relevantHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showWhenRelevant")
  }
  readonly property real switchColumnWidth: Math.max(Style.space(40),
    alwaysHeadingMetrics.advanceWidth + Style.space(6),
    relevantHeadingMetrics.advanceWidth + Style.space(6),
    onHoverHeadingMetrics.advanceWidth + Style.space(6))

  // Menu bar: cards in the order the entries appear in the bar; the first
  // card's switch shows or hides the whole bar entry. Widget and app: the
  // sections in their order. The keyboard walks the same list.
  readonly property var displayCards: panel.settingsOrderedCards(panel.settingsTargetSurface === "menubar" ? [
    // One list, in the order the bar draws it: the entries come from
    // different corners of the forecast, but they share one row.
    {
      title: panel.upperLabel(panel.i18n("menubar")),
      masterKey: "showCurrent",
      options: [
        { key: "currentWeatherSymbol", title: panel.i18n("weatherSymbol"), hover: true },
        { key: "currentLocation", title: panel.i18n("location"), hover: true },
        { key: "currentTemperature", title: panel.i18n("temperature"), hover: true },
        { key: "currentFeelsLike", title: panel.i18n("feelsLikeTemperature"), hover: true, relevant: true },
        { key: "currentWind", title: panel.i18n("wind"), hover: true, relevant: true },
        { key: "currentHumidity", title: panel.i18n("humidity"), hover: true },
        { key: "currentUv", title: panel.i18n("uvIndex"), hover: true, relevant: true },
        { key: "currentDayRange", title: panel.i18n("temperatureRange"), hover: true },
        { key: "currentPrecipitation", title: panel.i18n("rainProbability"), hover: true, relevant: true },
        { key: "currentRainIntensity", title: panel.i18n("rainIntensity"), hover: true, relevant: true },
        { key: "currentRainAmount", title: panel.i18n("rainAmount"), hover: true, relevant: true },
        { key: "currentRainStart", title: panel.i18n("rainStartTime"), hover: true, relevant: true },
        { key: "currentSunrise", title: panel.i18n("sunrise"), hover: true, relevant: true },
        { key: "currentSunset", title: panel.i18n("sunset"), hover: true, relevant: true },
        { key: "currentSunNext", title: panel.i18n("sunNext"), hover: true, relevant: true },
        { key: "currentMoon", title: panel.i18n("moonPhase"), hover: true, relevant: true },
        { key: "currentAirQuality", title: panel.i18n("airQualityIndex"), hover: true, relevant: true },
        { key: "currentAirQualityColor", title: panel.i18n("airQualityColor"), hover: true, relevant: true },
        { key: "currentPollen", title: panel.i18n("pollen"), hover: true, relevant: true },
        { key: "currentWarnings", title: panel.i18n("weatherWarnings"), hover: true }
      ],
      hint: panel.i18n("menubarRelevantCurrentHint") + " " + panel.i18n("menubarRelevantRainHint")
        + " " + panel.i18n("menubarRelevantAirHint"),
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("barBehavior")),
      masterKey: "",
      options: [
        { key: "openWidgetOnHover", title: panel.i18n("openWidgetOnHover") }
      ],
      hint: panel.i18n("openWidgetOnHoverHint"),
      hasHoverUnit: true,
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
      hasRainAlert: true,
      hasDefaultTab: false
    }
  ] : [
    // Same order as the sections in the view. The current weather can
    // move but not be hidden or become a tab (it holds place, refresh
    // and settings), so its card has no master switch.
    {
      title: panel.i18n("currentWeather"),
      masterKey: "",
      sectionKey: "current",
      fixedSection: true,
      hint: panel.i18n("currentWeatherHint"),
      options: [
        { key: "heroSymbol", title: panel.i18n("weatherSymbol") },
        { key: "heroTemperature", title: panel.i18n("temperature") },
        { key: "heroFeelsLike", title: panel.i18n("feelsLikeTemperature") },
        { key: "heroWind", title: panel.i18n("wind") },
        { key: "heroHumidity", title: panel.i18n("humidity") },
        { key: "heroMoon", title: panel.i18n("moonPhase") },
        { key: "heroYesterday", title: panel.i18n("compareYesterday") },
        { key: "heroMoonNext", title: panel.i18n("nextFullNewMoon") },
        { key: "heroServiceLink", title: panel.i18n("serviceLinkButton") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("myPlaces")),
      masterKey: "showFavorites",
      sectionKey: "favorites",
      hint: panel.i18n("favoritesHint"),
      options: [
        { key: "favoritesSymbol", title: panel.i18n("weatherSymbol") },
        { key: "favoritesTemperature", title: panel.i18n("temperature") },
        { key: "favoritesFeelsLike", title: panel.i18n("feelsLikeTemperature") },
        { key: "favoritesWind", title: panel.i18n("wind") },
        { key: "favoritesHumidity", title: panel.i18n("humidity") },
        { key: "favoritesMoon", title: panel.i18n("moonPhase") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("airQualityPollen")),
      masterKey: "showAirQuality",
      sectionKey: "airQuality",
      options: [
        { key: "airQualityIndex", title: panel.i18n("airQualityIndex") },
        { key: "airQualityPollen", title: panel.i18n("pollen") }
      ],
      hint: panel.i18n("airQualityHint"),
      hasDefaultTab: false
    },
    {
      title: panel.i18n("hourly"),
      masterKey: "showHourly",
      sectionKey: "hourly",
      options: [
        { key: "hourlyTime", title: panel.i18n("time") },
        { key: "hourlyIcon", title: panel.i18n("weatherSymbol") },
        { key: "hourlyTemperature", title: panel.i18n("temperature") },
        { key: "hourlyTemperatureCurve", title: panel.i18n("temperatureCurve") },
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
      sectionKey: "daily",
      options: [
        { key: "dailyDayName", title: panel.i18n("weekday") },
        { key: "dailyIcon", title: panel.i18n("weatherSymbol") },
        { key: "dailyTemperature", title: panel.i18n("temperatureRange") },
        { key: "dailyTemperatureBar", title: panel.i18n("temperatureBar") },
        { key: "dailyTemperatureCurve", title: panel.i18n("temperatureCurve") },
        { key: "dailyRainProbability", title: panel.i18n("rainProbability") },
        { key: "dailyRainAmount", title: panel.i18n("rainAmount") },
        { key: "dailyUv", title: panel.i18n("uvIndex") },
        { key: "dailyWind", title: panel.i18n("wind") },
        { key: "dailySunEvents", title: panel.i18n("sunriseSunset") },
        { key: "dailySunNext", title: panel.i18n("sunNext") },
        { key: "dailyMoon", title: panel.i18n("moonPhase") },
        { key: "dailyDayLength", title: panel.i18n("dayLength") },
        { key: "dailyDayLengthChange", title: panel.i18n("dayLengthChange") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("rain")),
      masterKey: "showRain",
      sectionKey: "rain",
      options: [
        { key: "forecastIntensity", title: panel.i18n("intensity") },
        { key: "forecastProbability", title: panel.i18n("probability") },
        { key: "forecastTotal", title: panel.i18n("twoHourTotal") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("radar")),
      masterKey: "showRadar",
      sectionKey: "radar",
      options: [
        { key: "radarRings", title: panel.i18n("radarRings") }
      ],
      hasMapStyle: true,
      hasDefaultTab: false
    },
    {
      title: panel.upperLabel(panel.i18n("wind")),
      masterKey: "showWind",
      sectionKey: "wind",
      options: [],
      hasDefaultTab: false
    },
    // The tab strip: moved like a section (its place in the window), with
    // the tabbed sections' cards indented under it and which tab opens first.
    {
      title: panel.upperLabel(panel.i18n("tabs")),
      masterKey: "",
      sectionKey: "tabs",
      fixedSection: true,
      options: [],
      hint: panel.i18n("tabsHint"),
      hasDefaultTab: true
    }
  ])

  // ---- Keyboard. One flat list of what can be set on the display page, in
  //      the order it is drawn; ↑↓ walk it, ←→ change the value or the
  //      column, Space / Enter switch or open, ⇧↑↓ move an entry.
  property string focusId: ""
  property int focusColumn: 0
  onFocusIdChanged: focusColumn = 0

  readonly property var unitOptions: [
    { value: "auto", label: panel.i18n("autoUnits") + " (" + panel.i18n(panel.useImperial ? "imperialUnits" : "metricUnits") + ")" },
    { value: "metric", label: panel.i18n("metricUnits") + " · " + panel.i18n("metricUnitsSummary") },
    { value: "imperial", label: panel.i18n("imperialUnits") + " · " + panel.i18n("imperialUnitsSummary") },
    { value: "kelvin", label: panel.i18n("kelvinUnits") + " · " + panel.i18n("kelvinUnitsSummary") }
  ]
  readonly property var languageOptions: [{ value: "auto", label: panel.i18n("languageAuto",
      { language: I18n.languageName(I18n.languageForLocale(panel.localeName)) }) }]
    .concat(I18n.supportedLanguages().map(function(code) {
      return { value: code, label: I18n.languageName(code) }
    }))
  readonly property var barPositionOptions: [
    { value: "left", label: panel.i18n(panel.barPlacement.verticalBar ? "barPositionTop" : "barPositionLeft") },
    { value: "center", label: panel.i18n("barPositionCenter") },
    { value: "right", label: panel.i18n(panel.barPlacement.verticalBar ? "barPositionBottom" : "barPositionRight") }
  ]
  readonly property var hoverUnitOptions: [
    { value: "", label: panel.i18n("hoverUnitSystemOff") },
    { value: "metric", label: panel.i18n("metricUnits") + " · " + panel.i18n("metricUnitsSummary") },
    { value: "imperial", label: panel.i18n("imperialUnits") + " · " + panel.i18n("imperialUnitsSummary") },
    { value: "kelvin", label: panel.i18n("kelvinUnits") + " · " + panel.i18n("kelvinUnitsSummary") }
  ]
  readonly property var windUnitOptions: [
    { value: "auto", label: panel.i18n("windUnitAuto", { unit: Model.windValue(0, Model.windUnitFor("auto", panel.useImperial)).unit }) },
    { value: "kmh", label: "km/h" },
    { value: "ms", label: "m/s" },
    { value: "mph", label: "mph" },
    { value: "kn", label: panel.i18n("windUnitKnots") + " (kn)" },
    { value: "bft", label: panel.i18n("windUnitBeaufort") + " (Bft)" }
  ]
  readonly property var refreshOptions: [
    { value: "0", label: panel.i18n("refreshDefault", { minutes: panel.setting("refreshMinutes", 15) }) }
  ].concat(panel.displayOptionsStore.refreshChoices.map(function(minutes) {
    return { value: String(minutes), label: panel.i18n("refreshEvery", { minutes: minutes }) }
  }))
  readonly property var radarRefreshOptions: [
    { value: "0", label: panel.i18n("radarRefreshAuto") }
  ].concat(panel.displayOptionsStore.radarChoices.map(function(minutes) {
    return { value: String(minutes), label: panel.i18n("refreshEvery", { minutes: minutes }) }
  }))
  readonly property var rainThresholdOptions: [
    { value: "any", label: panel.i18n("rainAlertAny") },
    { value: "moderate", label: panel.i18n("rainAlertModerate", { rate: panel.precipitationText(0.5, true) }) },
    { value: "heavy", label: panel.i18n("rainAlertHeavy", { rate: panel.precipitationText(4, true) }) }
  ]
  readonly property var rainRadiusOptions: panel.displayOptionsStore.choiceKeys.rainAlertRadius.map(function(km) {
    var minutes = Math.round(Number(km) / 50 * 60)
    var distance = panel.useImperial ? Math.round(Number(km) * 0.621371) + " mi" : km + " km"
    var lead = minutes < 60 ? minutes + " min" : panel.localizedNumber(minutes / 60) + " h"
    return { value: km, label: panel.i18n("rainAlertRadiusOption", { distance: distance, lead: lead }) }
  })
  readonly property var mapStyleOptions: [
    { value: "drawn", label: panel.i18n("mapStyleDrawn") },
    { value: "satellite", label: panel.i18n("mapStyleSatellite") }
  ]
  property var mapStyleDropdown: null
  // Set by the rain notification's dropdowns inside a card delegate.
  property var rainThresholdDropdown: null
  property var rainRadiusDropdown: null
  readonly property bool barPositionUsable: panel.barPlacement.section !== "" && !panel.barPlacement.busy
  // Set by the hover-unit dropdown, which sits inside a card delegate.
  property var hoverUnitDropdown: null

  function cardRowsEnabled(card) {
    var enabled = card.masterKey === "" || panel.settingsDisplaySetting(card.masterKey, true)
    return enabled && (!card.dependsOn || panel.settingsDisplaySetting(card.dependsOn, true))
  }

  readonly property var focusItems: {
    if (panel.settingsPage === "general") {
      var general = [
        { id: "unit", type: "dropdown" },
        { id: "windUnit", type: "dropdown" },
        { id: "language", type: "dropdown" }
      ]
      if (barPositionUsable) general.push({ id: "barPosition", type: "dropdown" })
      general.push({ id: "colorAccents", type: "accents" }, { id: "refresh", type: "dropdown" },
        { id: "radarRefresh", type: "dropdown" }, { id: "launcher", type: "launcher" })
      return general
    }
    if (panel.settingsPage !== "display") return []
    var items = []
    var menubar = panel.settingsTargetSurface === "menubar"
    for (var c = 0; c < displayCards.length; c++) {
      var card = displayCards[c]
      if (card.masterKey !== "" || card.fixedSection) {
        items.push({
          id: "master:" + (card.sectionKey || card.masterKey), type: "switch",
          key: card.fixedSection ? "" : card.masterKey,
          orderListKey: menubar ? "" : (card.fixedSection ? "sectionOrder" : panel.sectionOrderListFor(card.sectionKey)),
          orderEntry: card.fixedSection ? card.sectionKey : panel.orderKeyForSetting(card.masterKey)
        })
      }
      if (cardRowsEnabled(card)) {
        var options = panel.settingsOrderedOptions(card.options)
        for (var o = 0; o < options.length; o++) {
          var option = options[o]
          items.push({
            id: "switch:" + option.key, type: "switch", key: option.key,
            relevantKey: option.relevant ? option.key + "WhenRelevant" : "",
            hoverKey: option.hover ? option.key + "OnHover" : "",
            orderListKey: panel.orderListKeyForSetting(option.key),
            orderEntry: panel.orderKeyForSetting(option.key)
          })
        }
        if (card.hasHoverUnit) items.push({ id: "hoverUnit", type: "dropdown" })
        if (card.hasMapStyle) items.push({ id: "mapStyle", type: "dropdown" })
        if (card.hasRainAlert && panel.settingsDisplaySetting("notifyRainSoon", true))
          items.push({ id: "rainThreshold", type: "dropdown" }, { id: "rainRadius", type: "dropdown" })
      }
      if (card.sectionKey && !card.fixedSection && panel.settingsDisplaySetting(card.masterKey, true))
        items.push({ id: "placement:" + card.sectionKey, type: "placement", key: card.sectionKey + "AsTab" })
      if (card.hasDefaultTab && panel.settingsTabs.length > 0) items.push({ id: "defaultTab", type: "defaultTab" })
    }
    if (!panel.settingsOrderIsDefault) items.push({ id: "restoreOrder", type: "button" })
    if (!panel.displayOptionsStore.settingsDisplayIsDefault()) items.push({ id: "restoreDefaults", type: "button" })
    return items
  }
  readonly property var focusItem: {
    for (var i = 0; i < focusItems.length; i++) if (focusItems[i].id === focusId) return focusItems[i]
    return null
  }

  // Columns of a menu bar row: always, when relevant (if it has a rule),
  // on hover. Other rows have the one switch.
  function switchColumns(item) {
    var columns = []
    if (item.key !== "") columns.push(item.key)
    if (item.hoverKey !== undefined && item.hoverKey !== "") {
      columns.push(item.relevantKey || "")
      columns.push(item.hoverKey)
    }
    return columns
  }

  function moveFocus(delta) {
    if (!focusItems.length) return
    var index = -1
    for (var i = 0; i < focusItems.length; i++) if (focusItems[i].id === focusId) index = i
    var next = index < 0 ? (delta > 0 ? 0 : focusItems.length - 1)
      : Math.max(0, Math.min(focusItems.length - 1, index + delta))
    focusId = focusItems[next].id
  }

  function stepDropdown(id, delta) {
    var options = id === "unit" ? unitOptions : (id === "language" ? languageOptions
      : (id === "barPosition" ? barPositionOptions : (id === "windUnit" ? windUnitOptions
        : (id === "refresh" ? refreshOptions : (id === "radarRefresh" ? radarRefreshOptions
          : (id === "rainThreshold" ? rainThresholdOptions : (id === "rainRadius" ? rainRadiusOptions
            : (id === "mapStyle" ? mapStyleOptions : hoverUnitOptions))))))))
    var current = id === "unit" ? panel.settingsUnitSystem
      : (id === "language" ? String(panel.generalSetting("language", "auto"))
        : (id === "barPosition" ? panel.barPlacement.section
          : (id === "windUnit" ? String(panel.generalSetting("windUnit", "auto"))
            : (id === "refresh" ? String(panel.generalSetting("refreshMinutes", 0))
              : (id === "radarRefresh" ? String(panel.generalSetting("radarMinutes", 0))
                : (id === "rainThreshold" || id === "rainRadius" || id === "mapStyle" ? String(panel.settingsDisplaySetting(rainSettingKey(id), ""))
                  : panel.settingsHoverUnitSystem))))))
    var index = 0
    for (var i = 0; i < options.length; i++) if (options[i].value === current) index = i
    var next = Math.max(0, Math.min(options.length - 1, index + delta))
    if (next === index) return
    var value = options[next].value
    if (id === "unit") panel.displayOptionsStore.setGeneralSetting("unitSystem", value)
    else if (id === "language") panel.displayOptionsStore.setGeneralSetting("language", value)
    else if (id === "barPosition") panel.barPlacement.moveTo(value)
    else if (id === "windUnit") panel.displayOptionsStore.setGeneralSetting("windUnit", value)
    else if (id === "refresh") panel.displayOptionsStore.setGeneralSetting("refreshMinutes", Number(value))
    else if (id === "radarRefresh") panel.displayOptionsStore.setGeneralSetting("radarMinutes", Number(value))
    else if (id === "rainThreshold" || id === "rainRadius" || id === "mapStyle") panel.displayOptionsStore.setSettingsDisplaySetting(rainSettingKey(id), value)
    else panel.displayOptionsStore.setSettingsDisplaySetting("hoverUnitSystem", value)
  }

  function openDropdown(id) {
    var dropdown = id === "unit" ? unitDropdown : (id === "language" ? languageDropdown
      : (id === "barPosition" ? barPositionDropdown : (id === "windUnit" ? windUnitDropdown
        : (id === "refresh" ? refreshDropdown : (id === "radarRefresh" ? radarRefreshDropdown
          : (id === "rainThreshold" ? rainThresholdDropdown : (id === "rainRadius" ? rainRadiusDropdown
            : (id === "mapStyle" ? mapStyleDropdown : hoverUnitDropdown))))))))
    if (dropdown) dropdown.open()
  }

  // Stored key of a dropdown kept in the display options.
  function rainSettingKey(id) {
    return id === "rainThreshold" ? "rainAlertThreshold" : (id === "mapStyle" ? "mapStyle" : "rainAlertRadius")
  }

  function changeValue(item, delta) {
    if (item.type === "dropdown") stepDropdown(item.id, delta)
    else if (item.type === "switch") {
      var columns = switchColumns(item)
      var next = focusColumn + delta
      // Rows without a "when relevant" rule skip that column.
      if (next === 1 && columns[1] === "") next += delta
      if (next >= 0 && next < columns.length) focusColumn = next
    } else if (item.type === "placement") {
      panel.displayOptionsStore.setSettingsDisplaySetting(item.key, delta > 0)
    } else if (item.type === "defaultTab") {
      var tabs = panel.settingsTabs
      var index = Math.max(0, tabs.indexOf(panel.settingsDefaultTab))
      var target = Math.max(0, Math.min(tabs.length - 1, index + delta))
      if (target !== index) panel.displayOptionsStore.setSettingsDisplaySetting("defaultTab", tabs[target])
    }
  }

  function activate(item) {
    if (item.type === "dropdown") openDropdown(item.id)
    else if (item.type === "accents") {
      panel.displayOptionsStore.setGeneralSetting("colorAccents", !panel.colorAccents)
    } else if (item.type === "launcher") {
      if (!panel.appLauncherEntry.busy) panel.appLauncherEntry.setInstalled(!panel.appLauncherEntry.installed)
    } else if (item.type === "switch") {
      var key = switchColumns(item)[focusColumn] || ""
      if (key === "") return
      var fallback = key === item.key
      panel.displayOptionsStore.setSettingsDisplaySetting(key,
        !(panel.settingsDisplaySetting(key, fallback) === true))
    } else if (item.type === "placement") {
      panel.displayOptionsStore.setSettingsDisplaySetting(item.key,
        !(panel.settingsDisplaySetting(item.key, false) === true))
    } else if (item.type === "defaultTab") {
      changeValue(item, 1)
    } else if (item.id === "restoreOrder") {
      panel.displayOptionsStore.restoreSettingsDisplayOrder()
    } else if (item.id === "restoreDefaults") {
      restoreDefaultsButton.press()
    }
  }

  function reorder(item, delta) {
    if (!item || !item.orderListKey || !item.orderEntry) return
    panel.displayOptionsStore.moveSettingsDisplayEntry(item.orderListKey, item.orderEntry, delta)
  }

  // Keeps the focused setting on screen; called by each control as it
  // takes the keyboard focus.
  function ensureVisible(target) {
    if (!target) return
    Qt.callLater(function() {
      var top = target.mapToItem(settingsColumn, 0, 0).y - Style.space(8)
      var bottom = top + target.height + Style.space(16)
      var maximum = Math.max(0, settingsFlick.contentHeight - settingsFlick.height)
      if (top < settingsFlick.contentY) settingsFlick.contentY = Math.max(0, top)
      else if (bottom > settingsFlick.contentY + settingsFlick.height)
        settingsFlick.contentY = Math.min(maximum, bottom - settingsFlick.height)
    })
  }

  function scrollBy(delta) {
    var maximum = Math.max(0, settingsFlick.contentHeight - settingsFlick.height)
    settingsFlick.contentY = Math.max(0, Math.min(maximum, settingsFlick.contentY + delta))
  }

  // Returns true when the key was used.
  function handleKey(event) {
    var control = !!(event.modifiers & Qt.ControlModifier)
    var alternate = !!(event.modifiers & (Qt.AltModifier | Qt.MetaModifier))
    if (control || alternate) return false
    var shift = !!(event.modifiers & Qt.ShiftModifier)
    var text = String(event.text || "")
    var key = event.key

    if (key === Qt.Key_Tab || key === Qt.Key_Backtab) {
      panel.stepSettingsPage(shift || key === Qt.Key_Backtab ? -1 : 1)
      focusId = ""
      settingsFlick.contentY = 0
      return true
    }
    if (key === Qt.Key_PageDown || key === Qt.Key_PageUp) {
      scrollBy((key === Qt.Key_PageDown ? 1 : -1) * settingsFlick.height * 0.9)
      return true
    }
    if (key === Qt.Key_Home || key === Qt.Key_End) {
      scrollBy(key === Qt.Key_Home ? -settingsFlick.contentHeight : settingsFlick.contentHeight)
      return true
    }

    var down = key === Qt.Key_Down || text === "j" || text === "J"
    var up = key === Qt.Key_Up || text === "k" || text === "K"
    // Pages without settings just scroll.
    if (panel.settingsPage !== "display" && panel.settingsPage !== "general") {
      if (down || up) {
        scrollBy((down ? 1 : -1) * Style.space(48))
        return true
      }
      return false
    }

    if (panel.settingsPage === "display" && (text === "1" || text === "2" || text === "3")) {
      panel.settingsTargetSurface = ["menubar", "widget", "app"][Number(text) - 1]
      focusId = ""
      return true
    }
    if (down || up) {
      var moveEntry = shift || text === "J" || text === "K"
      if (moveEntry) reorder(focusItem, down ? 1 : -1)
      else moveFocus(down ? 1 : -1)
      return true
    }
    var left = key === Qt.Key_Left || text === "h"
    var right = key === Qt.Key_Right || text === "l"
    if (left || right) {
      if (focusItem) changeValue(focusItem, right ? 1 : -1)
      return true
    }
    if (key === Qt.Key_Space || key === Qt.Key_Return || key === Qt.Key_Enter) {
      if (focusItem) activate(focusItem)
      else moveFocus(1)
      return true
    }
    return false
  }

  Flickable {
    id: settingsFlick
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
              : (panel.settingsPage === "general" ? panel.i18n("generalSubtitle")
              : (panel.settingsPage === "sources" ? panel.i18n("sourcesSubtitle")
                : (panel.settingsTargetSurface === "app" ? panel.i18n("appSettings")
                  : (panel.settingsTargetSurface === "widget"
                    ? panel.i18n("widgetSettings") : panel.i18n("menubarSettings")))))
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
                : (parent.modelData === "sources" ? "settingsPageSources"
                  : (parent.modelData === "general" ? "settingsPageGeneral" : "settingsPageDisplay"))).toUpperCase()
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

      // Where the keys act, in muted type: pages here, the rest below the
      // view picker.
      Text {
        width: parent.width
        horizontalAlignment: Text.AlignHCenter
        text: panel.i18n("settingsPagesKeysHint")
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      WeatherShortcutsPage {
        visible: panel.settingsPage === "shortcuts"
        panel: settingsView.panel
      }

      WeatherSourcesPage {
        visible: panel.settingsPage === "sources"
        panel: settingsView.panel
      }

      // Keys on this page, in muted type where they act.
      Text {
        visible: panel.settingsPage === "general"
        width: parent.width
        text: panel.i18n("settingsGeneralKeysHint")
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      // Applies to the menu bar, the widget and the app alike.
      Rectangle {
        visible: panel.settingsPage === "general"
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
            id: unitDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "unit"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: panel.settingsUnitSystem
            options: settingsView.unitOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("unitSystem", value) }
          }

          Text {
            text: panel.i18n("windUnit")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // Wind on its own: km/h, m/s, mph, knots or Beaufort.
          Dropdown {
            id: windUnitDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "windUnit"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("windUnit", "auto"))
            options: settingsView.windUnitOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("windUnit", value) }
          }

          Text {
            text: panel.i18n("language")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: languageDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "language"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("language", "auto"))
            options: settingsView.languageOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("language", value) }
          }

          Text {
            text: panel.i18n("barPosition")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // The widget's section in Omarchy's bar, moved by Omarchy itself.
          Dropdown {
            id: barPositionDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            enabled: settingsView.barPositionUsable
            opacity: enabled ? 1 : 0.5
            hasCursor: settingsView.focusId === "barPosition"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: panel.barPlacement.section
            options: settingsView.barPositionOptions
            onChanged: function(value) { panel.barPlacement.moveTo(value) }
          }

          Text {
            width: parent.width
            text: panel.i18n(panel.barPlacement.section !== "" ? "barPositionHint" : "barPositionMissing")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Colour accents across the views, from the theme's palette.
          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "colorAccents"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("colorAccents")
            switchState: panel.colorAccents
            indented: false
            onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting("colorAccents", value) }
          }

          Text {
            width: parent.width
            text: panel.i18n("colorAccentsHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Updates: the forecast, and radar with the rain nowcast, apart.
          Text {
            topPadding: Style.space(6)
            text: panel.upperLabel(panel.i18n("refreshInterval"))
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.bold: true
            font.letterSpacing: 1
          }

          Text {
            text: panel.i18n("refreshForecast")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: refreshDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "refresh"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("refreshMinutes", 0))
            options: settingsView.refreshOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("refreshMinutes", Number(value)) }
          }

          Text {
            text: panel.i18n("refreshRadar")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: radarRefreshDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "radarRefresh"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("radarMinutes", 0))
            options: settingsView.radarRefreshOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("radarMinutes", Number(value)) }
          }

          Text {
            width: parent.width
            text: panel.i18n("refreshIntervalHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Adds the standalone app to the app launcher. Off by default: the
          // plugin writes nothing outside its own settings without consent.
          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "launcher"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("appLauncherEntry")
            switchState: panel.appLauncherEntry.installed
            indented: false
            rowEnabled: !panel.appLauncherEntry.busy
            onToggled: function(value) { panel.appLauncherEntry.setInstalled(value) }
          }

          Text {
            width: parent.width
            text: panel.i18n("appLauncherEntryHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
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
        text: panel.i18n("settingsKeysHint")
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      Text {
        visible: panel.settingsPage === "display"
        width: parent.width
        text: panel.i18n("displaySettingsHint")
          + (panel.settingsTargetSurface === "menubar" ? " " + panel.i18n("menubarHoverHint")
            : " " + panel.i18n("displaySectionsHint"))
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        wrapMode: Text.WordWrap
      }

      Repeater {
        model: settingsView.displayCards

        Rectangle {
          id: settingsCard
          required property var modelData
          visible: panel.settingsPage === "display"
          property var groupData: modelData
          // Cards that only apply while another switch is on (dependsOn).
          readonly property bool cardEnabled: !groupData.dependsOn
            || panel.settingsDisplaySetting(groupData.dependsOn, true)
          // Tabbed sections sit indented under the tab card.
          x: groupData.inTabs ? Style.space(18) : 0
          width: settingsColumn.width - x
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
              visible: settingsCard.groupData.masterKey !== "" || !!settingsCard.groupData.fixedSection
              panel: settingsView.panel
              width: parent.width
              settingKey: settingsCard.groupData.masterKey
              title: settingsCard.groupData.title
              emphasized: true
              showSwitch: !settingsCard.groupData.fixedSection
              kbFocused: settingsView.focusId === "master:"
                + (settingsCard.groupData.sectionKey || settingsCard.groupData.masterKey)
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              orderListKey: panel.settingsTargetSurface === "menubar" ? ""
                : (settingsCard.groupData.fixedSection ? "sectionOrder"
                  : panel.sectionOrderListFor(settingsCard.groupData.sectionKey))
              orderEntry: settingsCard.groupData.fixedSection ? settingsCard.groupData.sectionKey
                : panel.orderKeyForSetting(settingsCard.groupData.masterKey)
            }

            Text {
              visible: settingsCard.groupData.masterKey === "" && !settingsCard.groupData.fixedSection
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

            // Column headings over the "always" and "on hover" switches.
            Item {
              readonly property bool hasHoverColumn: {
                var options = settingsCard.groupData.options
                for (var i = 0; i < options.length; i++) if (options[i].hover) return true
                return false
              }
              visible: hasHoverColumn
              width: parent.width
              height: visible ? Style.space(24) : 0
              opacity: settingsCard.cardEnabled
                && (settingsCard.groupData.masterKey === ""
                  || panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true)) ? 1 : 0.42

              Row {
                anchors.right: parent.right
                anchors.bottom: parent.bottom

                Repeater {
                  model: [panel.i18n("showAlways"), panel.i18n("showWhenRelevant"), panel.i18n("showOnHover")]

                  Text {
                    required property string modelData
                    width: settingsView.switchColumnWidth
                    horizontalAlignment: Text.AlignHCenter
                    text: modelData
                    color: panel.mutedText
                    font.family: panel.fontFamily
                    font.pixelSize: Style.font.caption
                    elide: Text.ElideRight
                  }
                }
              }
            }

            Repeater {
              model: panel.settingsOrderedOptions(settingsCard.groupData.options)

              WeatherSwitchRow {
                panel: settingsView.panel
                required property var modelData
                width: settingsCardContent.width
                settingKey: modelData.key
                title: modelData.title
                relevantKey: modelData.relevant ? modelData.key + "WhenRelevant" : ""
                orderListKey: panel.orderListKeyForSetting(modelData.key)
                orderEntry: panel.orderKeyForSetting(modelData.key)
                hoverKey: modelData.hover ? modelData.key + "OnHover" : ""
                kbFocused: settingsView.focusId === "switch:" + modelData.key
                kbColumn: settingsView.focusColumn
                onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
                columnWidth: settingsView.switchColumnWidth
                rowEnabled: (settingsCard.groupData.masterKey === ""
                  || panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true))
                  && settingsCard.cardEnabled
              }
            }

            // In the scrolling window or as a tab of the shared strip.
            Item {
              id: placementItem
              visible: !!settingsCard.groupData.sectionKey && !settingsCard.groupData.fixedSection
              readonly property string placementKey: (settingsCard.groupData.sectionKey || "") + "AsTab"
              readonly property bool asTab: visible
                && panel.settingsDisplaySetting(placementKey, false) === true
              readonly property bool kbFocused: visible
                && settingsView.focusId === "placement:" + settingsCard.groupData.sectionKey
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              width: parent.width
              height: visible ? Style.space(40) : 0
              opacity: visible && panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true) ? 1 : 0.42

              Rectangle {
                visible: placementItem.kbFocused
                anchors.fill: parent
                radius: Style.cornerRadius
                color: "transparent"
                border.color: Color.accent
                border.width: Style.spacing.hairline
              }

              Row {
                id: placementRow
                anchors.left: parent.left
                anchors.leftMargin: Style.space(12)
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                spacing: Style.space(5)

                Text {
                  id: placementLabel
                  anchors.verticalCenter: parent.verticalCenter
                  width: Math.min(implicitWidth + Style.space(8), placementRow.width * 0.4)
                  text: panel.i18n("showAs")
                  color: panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.bodySmall
                  elide: Text.ElideRight
                }

                Repeater {
                  model: [false, true]

                  Rectangle {
                    required property bool modelData
                    readonly property bool selected: modelData === placementItem.asTab
                    width: (placementRow.width - placementLabel.width - placementRow.spacing * 2) / 2
                    height: Style.space(28)
                    radius: Style.cornerRadius
                    color: selected
                      ? Style.selectedFillFor(panel.foreground, Color.accent)
                      : (placementMouse.containsMouse
                        ? Style.hoverFillFor(panel.foreground, Color.accent)
                        : "transparent")
                    border.color: panel.subtleText
                    border.width: Style.spacing.hairline

                    Text {
                      anchors.centerIn: parent
                      width: Math.min(implicitWidth, parent.width - Style.space(8))
                      text: panel.i18n(parent.modelData ? "placementTab" : "placementWindow")
                      color: parent.selected
                        ? Style.selectedStateColor(panel.foreground, Color.accent)
                        : panel.foreground
                      font.family: panel.fontFamily
                      font.pixelSize: Style.font.caption
                      font.bold: parent.selected
                      elide: Text.ElideRight
                    }

                    MouseArea {
                      id: placementMouse
                      anchors.fill: parent
                      hoverEnabled: true
                      cursorShape: Qt.PointingHandCursor
                      onClicked: panel.displayOptionsStore.setSettingsDisplaySetting(
                        placementItem.placementKey, parent.modelData)
                    }
                  }
                }
              }
            }

            // Second unit system for the bar, shown while the pointer rests
            // on the widget.
            Column {
              visible: !!settingsCard.groupData.hasHoverUnit
              width: parent.width
              topPadding: Style.space(8)
              leftPadding: Style.space(12)
              spacing: Style.space(6)

              Text {
                text: panel.i18n("hoverUnitSystem")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "hoverUnit"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasHoverUnit) settingsView.hoverUnitDropdown = this
                value: panel.settingsHoverUnitSystem
                options: settingsView.hoverUnitOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("hoverUnitSystem", value) }
              }

              Text {
                width: parent.width - Style.space(12)
                text: panel.i18n("hoverUnitSystemHint")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }

            // Radar and wind maps: drawn in the theme's colours or satellite.
            Column {
              visible: !!settingsCard.groupData.hasMapStyle
              width: parent.width
              topPadding: Style.space(8)
              leftPadding: Style.space(12)
              spacing: Style.space(6)

              Text {
                text: panel.i18n("mapStyle")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "mapStyle"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasMapStyle) settingsView.mapStyleDropdown = this
                value: String(panel.settingsDisplaySetting("mapStyle", "drawn"))
                options: settingsView.mapStyleOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("mapStyle", value) }
              }

              Text {
                width: parent.width - Style.space(12)
                text: panel.i18n("mapStyleHint")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }

            // Rain notification: from which strength, and how far around
            // the place, which sets how far ahead the nowcast is read.
            Column {
              visible: !!settingsCard.groupData.hasRainAlert && panel.settingsDisplaySetting("notifyRainSoon", true)
              width: parent.width
              topPadding: Style.space(8)
              leftPadding: Style.space(12)
              spacing: Style.space(6)

              Text {
                text: panel.i18n("rainAlertThreshold")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "rainThreshold"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasRainAlert) settingsView.rainThresholdDropdown = this
                value: String(panel.settingsDisplaySetting("rainAlertThreshold", "any"))
                options: settingsView.rainThresholdOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("rainAlertThreshold", value) }
              }

              Text {
                text: panel.i18n("rainAlertRadius")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "rainRadius"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasRainAlert) settingsView.rainRadiusDropdown = this
                value: String(panel.settingsDisplaySetting("rainAlertRadius", "25"))
                options: settingsView.rainRadiusOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("rainAlertRadius", value) }
              }

              Text {
                width: parent.width - Style.space(12)
                text: panel.i18n("rainAlertHint")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }

            Item {
              id: defaultTabItem
              visible: settingsCard.groupData.hasDefaultTab
              readonly property bool kbFocused: visible && settingsView.focusId === "defaultTab"
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              width: parent.width
              height: visible ? Style.space(66) : 0
              opacity: panel.settingsTabs.length > 0 ? 1 : 0.42

              Rectangle {
                visible: defaultTabItem.kbFocused
                anchors.fill: parent
                radius: Style.cornerRadius
                color: "transparent"
                border.color: Color.accent
                border.width: Style.spacing.hairline
              }

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
                    model: panel.settingsTabs

                    Rectangle {
                      required property string modelData
                      readonly property int count: Math.max(1, panel.settingsTabs.length)
                      width: (defaultTabRow.width - defaultTabRow.spacing * (count - 1)) / count
                      height: Style.space(28)
                      radius: Style.cornerRadius
                      color: modelData === panel.settingsDefaultTab
                        ? Style.selectedFillFor(panel.foreground, Color.accent)
                        : (defaultTabMouse.containsMouse
                          ? Style.hoverFillFor(panel.foreground, Color.accent)
                          : "transparent")
                      border.color: panel.subtleText
                      border.width: Style.spacing.hairline

                      Text {
                        anchors.centerIn: parent
                        width: Math.min(implicitWidth, parent.width - Style.space(6))
                        text: panel.sectionTabLabel(modelData)
                        color: modelData === panel.settingsDefaultTab
                          ? Style.selectedStateColor(panel.foreground, Color.accent)
                          : panel.foreground
                        font.family: panel.fontFamily
                        font.pixelSize: Style.font.caption
                        font.bold: modelData === panel.settingsDefaultTab
                        elide: Text.ElideRight
                      }

                      MouseArea {
                        id: defaultTabMouse
                        anchors.fill: parent
                        enabled: parent.enabled
                        hoverEnabled: true
                        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
                        onClicked: panel.displayOptionsStore.setSettingsDisplaySetting("defaultTab", modelData)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // Both resets side by side: order only, and every switch.
      Row {
        visible: panel.settingsPage === "display"
        anchors.horizontalCenter: parent.horizontalCenter
        spacing: Style.space(10)

      // Order only: one click, since nothing switches off with it.
      Rectangle {
        id: restoreOrderButton
        width: Math.min((settingsColumn.width - Style.space(10)) / 2,
          restoreOrderLabel.implicitWidth + Style.space(28))
        height: Style.space(32)
        radius: Style.cornerRadius
        enabled: !panel.settingsOrderIsDefault
        opacity: enabled ? 1 : 0.42
        readonly property bool kbFocused: settingsView.focusId === "restoreOrder"
        onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
        color: (restoreOrderMouse.containsMouse || kbFocused) && enabled
          ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"
        border.color: kbFocused ? Color.accent : panel.subtleText
        border.width: Style.spacing.hairline

        Text {
          id: restoreOrderLabel
          anchors.centerIn: parent
          width: Math.min(implicitWidth, (settingsColumn.width - Style.space(10)) / 2 - Style.space(28))
          text: panel.i18n("restoreOrder")
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          elide: Text.ElideRight
        }

        MouseArea {
          id: restoreOrderMouse
          anchors.fill: parent
          enabled: parent.enabled
          hoverEnabled: true
          cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
          onClicked: panel.displayOptionsStore.restoreSettingsDisplayOrder()
        }
      }

      // Two-step reset: the first click arms it, a second click within a few
      // seconds restores the selected view's factory defaults.
      Rectangle {
        id: restoreDefaultsButton
        property bool armed: false
        readonly property bool isDefault: panel.displayOptionsStore.settingsDisplayIsDefault()
        readonly property bool kbFocused: settingsView.focusId === "restoreDefaults"
        onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
        // First press arms, a second one within a few seconds resets.
        function press() {
          if (isDefault) return
          if (!armed) {
            armed = true
            return
          }
          armed = false
          panel.displayOptionsStore.restoreSettingsDisplayDefaults()
        }
        width: Math.min((settingsColumn.width - Style.space(10)) / 2,
          restoreDefaultsLabel.implicitWidth + Style.space(28))
        height: Style.space(32)
        radius: Style.cornerRadius
        enabled: !isDefault
        opacity: isDefault ? 0.42 : 1
        color: armed ? Style.selectedFillFor(panel.foreground, Color.accent)
          : (restoreDefaultsMouse.containsMouse || kbFocused
            ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")
        border.color: armed || kbFocused ? Color.accent : panel.subtleText
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
          width: Math.min(implicitWidth, (settingsColumn.width - Style.space(10)) / 2 - Style.space(28))
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
          onClicked: parent.press()
        }
      }
      }

      Item {
        width: parent.width
        height: Style.space(4)
      }
    }
  }

  // The wheel scrolls a fixed step: Flickable's own wheel handling crawled.
  // Touchpads keep their pixel deltas, scaled up like the page's
  // (Panel.wheelPixels).
  MouseArea {
    anchors.fill: settingsFlick
    z: 2
    acceptedButtons: Qt.NoButton
    onWheel: function(wheel) {
      settingsView.scrollBy(-panel.wheelPixels(wheel, false))
      wheel.accepted = true
    }
  }
}
