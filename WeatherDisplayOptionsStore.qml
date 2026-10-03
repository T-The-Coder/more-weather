import QtQuick
import Quickshell
import Quickshell.Io
import "I18n.js" as I18n
import "Model.js" as Model

// Loads, sanitizes and writes the per-surface display options (app, widget,
// menu bar). Reading an option stays on the panel (displaySetting and friends).
Item {
  required property var panel

  // App, bar popup (widget), and menu bar intentionally keep separate profiles.
  // Every file is loaded in both surfaces so either settings screen can edit
  // every profile.
  property FileView generalOptionsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-general.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: loadGeneralOptions(text())
    onLoadFailed: loadGeneralOptions("")
  }

  function loadGeneralOptions(raw) {
    var parsed = ({})
    try { parsed = JSON.parse(String(raw || "{}")) || ({}) }
    catch (e) { parsed = ({}) }
    panel.generalOptions = sanitizedGeneral(parsed)
  }

  function sanitizedGeneral(raw) {
    var source = raw && typeof raw === "object" ? raw : ({})
    return {
      unitSystem: normalizedUnitSystem(source.unitSystem),
      language: normalizedLanguage(source.language),
      windUnit: normalizedWindUnit(source.windUnit),
      refreshMinutes: normalizedRefreshMinutes(source.refreshMinutes),
      radarMinutes: normalizedRadarMinutes(source.radarMinutes),
      colorAccents: source.colorAccents !== false,
      windLevel: normalizedWindLevel(source.windLevel)
    }
  }

  // The General page's options at their defaults? The wind map's height is
  // set on the map itself and stays out of it.
  function generalIsDefault() {
    var defaults = sanitizedGeneral({})
    var current = sanitizedGeneral(panel.generalOptions)
    for (var key in defaults)
      if (key !== "windLevel" && current[key] !== defaults[key]) return false
    return true
  }

  function restoreGeneralDefaults() {
    var next = sanitizedGeneral({ windLevel: panel.generalOptions ? panel.generalOptions.windLevel : "" })
    panel.generalOptions = next
    generalOptionsFile.setText(JSON.stringify(next) + "\n")
  }

  // Height of the wind map (Model.WIND_LEVELS).
  function normalizedWindLevel(value) {
    return Model.windLevel(String(value || "10m")).id
  }

  // Wind in its own unit (Model.windUnitFor); "auto" follows the unit system.
  function normalizedWindUnit(value) {
    var unit = String(value || "auto")
    return ["auto", "kmh", "ms", "mph", "kn", "bft"].indexOf(unit) >= 0 ? unit : "auto"
  }

  // Minutes between forecast updates; 0 leaves it to the widget's
  // shell.json entry (15 by default). MET Norway asks for at least ten.
  readonly property var refreshChoices: [10, 15, 20, 30, 60]
  function normalizedRefreshMinutes(value) {
    var minutes = parseInt(value, 10)
    return refreshChoices.indexOf(minutes) >= 0 ? minutes : 0
  }

  // Radar and rain nowcast; 0 takes every new measurement (about 5 min).
  readonly property var radarChoices: [10, 15, 30]
  function normalizedRadarMinutes(value) {
    var minutes = parseInt(value, 10)
    return radarChoices.indexOf(minutes) >= 0 ? minutes : 0
  }

  function setGeneralSetting(key, value) {
    var next = {
      unitSystem: normalizedUnitSystem(key === "unitSystem" ? value : panel.generalOptions.unitSystem),
      language: normalizedLanguage(key === "language" ? value : panel.generalOptions.language),
      windUnit: normalizedWindUnit(key === "windUnit" ? value : panel.generalOptions.windUnit),
      refreshMinutes: normalizedRefreshMinutes(key === "refreshMinutes" ? value : panel.generalOptions.refreshMinutes),
      radarMinutes: normalizedRadarMinutes(key === "radarMinutes" ? value : panel.generalOptions.radarMinutes),
      colorAccents: (key === "colorAccents" ? value : panel.generalOptions.colorAccents) !== false,
      windLevel: normalizedWindLevel(key === "windLevel" ? value : panel.generalOptions.windLevel)
    }
    panel.generalOptions = next
    generalOptionsFile.setText(JSON.stringify(next) + "\n")
  }

  property FileView appDisplayOptionsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-app-display.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: loadDisplayOptionsFor("app", text())
    onLoadFailed: loadDisplayOptionsFor("app", "")
  }

  property FileView widgetDisplayOptionsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-widget-display.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: loadDisplayOptionsFor("widget", text())
    onLoadFailed: loadDisplayOptionsFor("widget", "")
  }

  property FileView menubarDisplayOptionsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-menubar-display.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: loadDisplayOptionsFor("menubar", text())
    onLoadFailed: loadDisplayOptionsFor("menubar", "")
  }

  function sanitizedDisplayOptions(raw, surface) {
    var defaults = panel.defaultOptionsFor(surface)
    var source = raw && typeof raw === "object" ? raw : ({})
    var result = ({})
    if (surface === "menubar") source = migratedMenubarOptions(source)
    else source = migratedSectionOptions(source)
    for (var key in defaults) {
      if (key === "defaultTab") {
        result[key] = normalizedSectionKey(source[key], defaults[key])
      } else if (key.indexOf("Order") > 0) {
        result[key] = panel.sanitizedOrder(source[key], key)
      } else if (key === "hoverUnitSystem") {
        result[key] = normalizedHoverUnitSystem(source[key])
      } else if (choiceKeys[key]) {
        result[key] = normalizedChoice(key, source[key], defaults[key])
      } else {
        result[key] = typeof source[key] === "boolean" ? source[key] : defaults[key]
      }
    }
    return result
  }

  function normalizedSectionKey(value, fallback) {
    var key = String(value || "")
    return panel.defaultSectionOrder().indexOf(key) >= 0 ? key : fallback
  }

  // Up to 2.4 rain, radar and wind were fixed tabs of one "forecast"
  // section, with one switch and a numbered default tab.
  function migratedSectionOptions(raw) {
    var source = ({})
    for (var key in raw) source[key] = raw[key]
    if (typeof source.showForecast === "boolean") {
      var names = ["showRain", "showRadar", "showWind"]
      for (var i = 0; i < names.length; i++)
        if (typeof source[names[i]] !== "boolean") source[names[i]] = source.showForecast
    }
    if (source.defaultTab === undefined && source.defaultForecastTab !== undefined) {
      var index = parseInt(source.defaultForecastTab, 10)
      source.defaultTab = ["rain", "radar", "wind"][isNaN(index) ? 0 : Math.max(0, Math.min(2, index))]
    }
    return source
  }

  // Older menu bar files, brought to the three-way switches without changing
  // what the bar shows.
  function migratedMenubarOptions(raw) {
    var source = ({})
    for (var key in raw) source[key] = raw[key]
    // Up to 2.1: one precipitation switch covered probability and intensity.
    if (typeof source.currentRainIntensity !== "boolean" && typeof source.currentPrecipitation === "boolean")
      source.currentRainIntensity = source.currentPrecipitation
    if (typeof source.currentRainIntensityOnHover !== "boolean"
        && typeof source.currentPrecipitationOnHover === "boolean")
      source.currentRainIntensityOnHover = source.currentPrecipitationOnHover
    // Up to 2.2: one alert switch covered poor air and high pollen.
    if (typeof source.currentAirQualityAlert === "boolean" && typeof source.currentPollen !== "boolean") {
      source.currentPollen = false
      source.currentPollenWhenRelevant = source.currentAirQualityAlert
      if (source.currentAirQualityAlert && source.currentAirQuality !== true) {
        source.currentAirQuality = false
        source.currentAirQualityWhenRelevant = true
      }
      if (typeof source.currentAirQualityAlertOnHover === "boolean")
        source.currentPollenOnHover = source.currentAirQualityAlertOnHover
    }
    // Up to 2.2: rain start and intensity only ever showed when there was
    // something to show, which is what "Relevant" means now.
    var eventKeys = ["currentRainStart", "currentRainIntensity"]
    for (var i = 0; i < eventKeys.length; i++) {
      var key = eventKeys[i]
      if (typeof source[key + "WhenRelevant"] === "boolean") continue
      source[key + "WhenRelevant"] = source[key] === true
      source[key] = false
    }
    return source
  }

  // Settings that take one of a few values, not a switch.
  readonly property var choiceKeys: ({
    rainAlertThreshold: ["any", "moderate", "heavy"],
    rainAlertRadius: ["10", "25", "50", "100"],
    mapStyle: ["drawn", "satellite"],
    menubarAccents: ["off", "hover", "always"],
    globeRotateDelay: ["5", "10", "30"],
    globeRotateSpeed: ["1", "2", "4", "8"],
    globeWash: ["none", "temperature", "cloud", "precipitation"]
  })
  function normalizedChoice(key, value, fallback) {
    var text = String(value === undefined || value === null ? "" : value)
    return choiceKeys[key].indexOf(text) >= 0 ? text : fallback
  }

  function normalizedHoverUnitSystem(value) {
    var unit = String(value || "").toLowerCase()
    return unit === "metric" || unit === "imperial" || unit === "kelvin" ? unit : ""
  }

  function normalizedLanguage(value) {
    var language = String(value || "auto")
    return I18n.supportedLanguages().indexOf(language) >= 0 ? language : "auto"
  }

  function normalizedUnitSystem(value) {
    var unit = String(value || "").toLowerCase()
    return unit === "imperial" || unit === "metric" || unit === "kelvin" ? unit : "auto"
  }

  function loadDisplayOptionsFor(surface, raw) {
    var parsed = ({})
    try { parsed = JSON.parse(String(raw || "{}")) }
    catch (e) { parsed = ({}) }
    var next = sanitizedDisplayOptions(parsed, surface)
    var firstLoad = surface === "app" ? !panel.appDisplayOptionsLoaded
      : (surface === "widget" ? !panel.widgetDisplayOptionsLoaded : !panel.menubarDisplayOptionsLoaded)
    if (surface === "app") {
      panel.appDisplayOptions = next
      panel.appDisplayOptionsLoaded = true
    } else if (surface === "widget") {
      panel.widgetDisplayOptions = next
      panel.widgetDisplayOptionsLoaded = true
    } else {
      panel.menubarDisplayOptions = next
      panel.menubarDisplayOptionsLoaded = true
    }
    var activeSurface = panel.standaloneMode ? "app" : "widget"
    if (firstLoad && panel.opened && surface === activeSurface)
      panel.activeTab = next.defaultTab
  }

  // Resets the surface picked in settings to its factory defaults.
  function restoreSettingsDisplayDefaults() {
    var surface = panel.settingsTargetSurface
    var next = panel.defaultOptionsFor(surface)
    var text = JSON.stringify(next) + "\n"
    if (surface === "app") {
      panel.appDisplayOptions = next
      appDisplayOptionsFile.setText(text)
    } else if (surface === "widget") {
      panel.widgetDisplayOptions = next
      widgetDisplayOptionsFile.setText(text)
    } else {
      panel.menubarDisplayOptions = next
      menubarDisplayOptionsFile.setText(text)
    }
    var activeSurface = panel.standaloneMode ? "app" : "widget"
    if (surface === activeSurface) panel.activeTab = next.defaultTab
  }

  // Puts the picked view's entries back into factory order, leaving every
  // switch as it is.
  function restoreSettingsDisplayOrder() {
    if (panel.settingsTargetSurface === "menubar") {
      setSettingsDisplaySetting("entryOrder", panel.defaultMenubarEntryOrder())
      return
    }
    setSettingsDisplaySetting("heroOrder", panel.defaultHeroOrder())
    setSettingsDisplaySetting("sectionOrder", panel.defaultSectionOrder())
    setSettingsDisplaySetting("hourlyOrder", panel.defaultHourlyOrder())
    setSettingsDisplaySetting("dailyOrder", panel.defaultDailyOrder())
    setSettingsDisplaySetting("favoritesOrder", panel.defaultFavoritesOrder())
  }

  function settingsDisplayIsDefault() {
    var surface = panel.settingsTargetSurface
    var options = surface === "app" ? panel.appDisplayOptions
      : (surface === "widget" ? panel.widgetDisplayOptions : panel.menubarDisplayOptions)
    var defaults = panel.defaultOptionsFor(surface)
    for (var key in defaults) {
      var value = panel.optionValue(options, surface, key, undefined)
      var fallback = defaults[key]
      if (fallback && fallback.length !== undefined && typeof fallback !== "string") {
        if (String(value) !== String(fallback)) return false
      } else if (value !== fallback) return false
    }
    return true
  }

  // Moves one entry up or down in its list and writes the new order. The
  // window and tab orders are views of the one section order: an entry
  // swaps places there with its neighbour in the view.
  function moveSettingsDisplayEntry(orderKey, key, delta) {
    if (orderKey === "sectionOrder" || orderKey === "tabOrder") {
      var peers = panel.settingsOrderFor(orderKey)
      var peerIndex = peers.indexOf(key)
      var neighbour = peers[peerIndex + delta]
      if (peerIndex < 0 || neighbour === undefined) return
      var sections = panel.sanitizedOrder(panel.settingsDisplaySetting("sectionOrder", null), "sectionOrder")
      var from = sections.indexOf(key)
      var to = sections.indexOf(neighbour)
      if (from < 0 || to < 0) return
      sections[from] = neighbour
      sections[to] = key
      setSettingsDisplaySetting("sectionOrder", sections)
      return
    }
    var order = panel.sanitizedOrder(panel.settingsDisplaySetting(orderKey, null), orderKey)
    var index = order.indexOf(key)
    var target = index + delta
    if (index < 0 || target < 0 || target >= order.length) return
    order.splice(index, 1)
    order.splice(target, 0, key)
    setSettingsDisplaySetting(orderKey, order)
  }

  function setSettingsDisplaySetting(key, value) {
    var surface = panel.settingsTargetSurface
    var source = surface === "app" ? panel.appDisplayOptions
      : (surface === "widget" ? panel.widgetDisplayOptions : panel.menubarDisplayOptions)
    var next = sanitizedDisplayOptions(source, surface)
    next[key] = (key === "defaultTab"
        ? normalizedSectionKey(value, "rain")
        : (key === "hoverUnitSystem" ? normalizedHoverUnitSystem(value)
          : (choiceKeys[key] ? normalizedChoice(key, value, next[key])
            : (key.indexOf("Order") > 0 ? panel.sanitizedOrder(value, key) : !!value))))
    // A menu bar entry is "Always", "Relevant" or "Hover": switching
    // one on switches the other two off.
    if (surface === "menubar" && next[key] === true) {
      var base = key.replace(/(WhenRelevant|OnHover)$/, "")
      var siblings = [base, base + "WhenRelevant", base + "OnHover"]
      for (var i = 0; i < siblings.length; i++)
        if (siblings[i] !== key && siblings[i] in next) next[siblings[i]] = false
    }
    if (surface === "app") {
      panel.appDisplayOptions = next
      appDisplayOptionsFile.setText(JSON.stringify(next) + "\n")
    } else if (surface === "widget") {
      panel.widgetDisplayOptions = next
      widgetDisplayOptionsFile.setText(JSON.stringify(next) + "\n")
    } else {
      panel.menubarDisplayOptions = next
      menubarDisplayOptionsFile.setText(JSON.stringify(next) + "\n")
    }
    var activeSurface = panel.standaloneMode ? "app" : "widget"
    if (key === "defaultTab" && surface === activeSurface)
      panel.activeTab = next.defaultTab
  }
}
