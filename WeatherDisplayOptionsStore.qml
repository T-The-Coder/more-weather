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
    for (var key in defaults) {
      if (key === "defaultForecastTab") {
        var tab = parseInt(source[key], 10)
        result[key] = isNaN(tab) ? defaults[key] : Math.max(0, Math.min(2, tab))
      } else {
        result[key] = typeof source[key] === "boolean" ? source[key] : defaults[key]
      }
    }
    return result
  }

  function normalizedLanguage(value) {
    var language = String(value || "auto")
    return I18n.supportedLanguages().indexOf(language) >= 0 ? language : "auto"
  }

  function normalizedUnitSystem(value) {
    var unit = String(value || "").toLowerCase()
    return unit === "imperial" || unit === "metric" ? unit : "auto"
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

  function settingsDisplayIsDefault() {
    var surface = panel.settingsTargetSurface
    var options = surface === "app" ? panel.appDisplayOptions
      : (surface === "widget" ? panel.widgetDisplayOptions : panel.menubarDisplayOptions)
    var defaults = panel.defaultOptionsFor(surface)
    for (var key in defaults)
      if (panel.optionValue(options, surface, key, undefined) !== defaults[key]) return false
    return true
  }

  function setSettingsDisplaySetting(key, value) {
    var surface = panel.settingsTargetSurface
    var source = surface === "app" ? panel.appDisplayOptions
      : (surface === "widget" ? panel.widgetDisplayOptions : panel.menubarDisplayOptions)
    var next = sanitizedDisplayOptions(source, surface)
    next[key] = (key === "defaultForecastTab"
        ? Math.max(0, Math.min(2, Number(value) || 0))
        : !!value)
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
