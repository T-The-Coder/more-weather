import QtQuick
import Quickshell
import Quickshell.Io
import "I18n.js" as I18n

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
    panel.generalOptions = {
      unitSystem: normalizedUnitSystem(parsed.unitSystem),
      language: normalizedLanguage(parsed.language)
    }
  }

  function setGeneralSetting(key, value) {
    var next = {
      unitSystem: normalizedUnitSystem(key === "unitSystem" ? value : panel.generalOptions.unitSystem),
      language: normalizedLanguage(key === "language" ? value : panel.generalOptions.language)
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
    for (var key in defaults) {
      if (key === "defaultForecastTab") {
        var tab = parseInt(source[key], 10)
        result[key] = isNaN(tab) ? defaults[key] : Math.max(0, Math.min(2, tab))
      } else if (key.indexOf("Order") > 0) {
        result[key] = panel.sanitizedOrder(source[key], key)
      } else if (key === "hoverUnitSystem") {
        result[key] = normalizedHoverUnitSystem(source[key])
      } else {
        result[key] = typeof source[key] === "boolean" ? source[key] : defaults[key]
      }
    }
    return result
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
    // something to show, which is what "when relevant" means now.
    var eventKeys = ["currentRainStart", "currentRainIntensity"]
    for (var i = 0; i < eventKeys.length; i++) {
      var key = eventKeys[i]
      if (typeof source[key + "WhenRelevant"] === "boolean") continue
      source[key + "WhenRelevant"] = source[key] === true
      source[key] = false
    }
    return source
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
      panel.precipitationTab = next.defaultForecastTab
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
    if (surface === activeSurface) panel.precipitationTab = next.defaultForecastTab
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

  // Moves one entry up or down in its list and writes the new order.
  function moveSettingsDisplayEntry(orderKey, key, delta) {
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
    next[key] = (key === "defaultForecastTab"
        ? Math.max(0, Math.min(2, Number(value) || 0))
        : (key === "hoverUnitSystem" ? normalizedHoverUnitSystem(value)
          : (key.indexOf("Order") > 0 ? panel.sanitizedOrder(value, key) : !!value)))
    // A menu bar entry shows always, when relevant, or on hover: switching
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
    if (key === "defaultForecastTab" && surface === activeSurface)
      panel.precipitationTab = next.defaultForecastTab
  }
}
