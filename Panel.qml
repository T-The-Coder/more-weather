import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model
import "Basemap.js" as Basemap
import "I18n.js" as I18n
import "Providers.js" as Providers
import "GlobeFields.js" as GlobeFields

Panel {
  id: root
  moduleName: "more-weather"
  ipcTarget: "more-weather"
  manageIpc: false
  LayoutMirroring.enabled: I18n.isRightToLeft(interfaceLanguage)
  LayoutMirroring.childrenInherit: true
  // Work for "after this event" goes through defer() rather than Qt.callLater.
  // The shell rebuilds its panels when a monitor goes away (a lid closed and
  // opened again within a second), and calls Qt.callLater had queued then ran
  // against the destroyed panel, where `root` is already null. The Timer dies
  // with the panel, so its queue does too. Same idea as WeatherRemoteImage.
  property bool panelAlive: true
  property var deferredCalls: []

  function defer(fn) {
    if (!panelAlive || typeof fn !== "function") return
    // Like Qt.callLater, the same function queued twice runs once.
    if (deferredCalls.indexOf(fn) >= 0) return
    deferredCalls = deferredCalls.concat([fn])
    if (!deferredCallTimer.running) deferredCallTimer.start()
  }

  function runDeferredCalls() {
    var calls = deferredCalls
    deferredCalls = []
    for (var i = 0; i < calls.length && panelAlive; ++i) {
      try {
        calls[i]()
      } catch (e) {
        console.warn("more-weather: deferred call failed:", e, e && e.stack)
      }
    }
  }

  Timer {
    id: deferredCallTimer
    interval: 0
    onTriggered: root.runDeferredCalls()
  }

  Component.onDestruction: {
    panelAlive = false
    deferredCalls = []
    deferredCallTimer.stop()
  }

  Component.onCompleted: {
    // Adopt whatever radar timeline the startup cycle delivers.
    mapRefreshWindowUntilMs = Date.now() + mapRefreshWindowMs * 3
    syncStableSeries()
    radarPlaces.radarPlacesDebounce.restart()
  }

  property var anchorItem: null
  // The daily section, kept from its loader so keyboard scrolling reaches it.
  property var dailySection: null
  property bool openedFromHotkey: false
  // The same weather controller and view back both surfaces. The bar keeps
  // using KeyboardPanel; the standalone Quickshell config opts into a normal
  // xdg-toplevel window instead.
  property bool standaloneMode: false
  onStandaloneModeChanged: {
    settingsTargetSurface = standaloneMode ? "app" : "widget"
    root.defer(function() {
      displayOptionsStore.appDisplayOptionsFile.reload()
      displayOptionsStore.widgetDisplayOptionsFile.reload()
      displayOptionsStore.menubarDisplayOptionsFile.reload()
    })
  }
  readonly property color foreground: root.bar ? root.bar.foreground : Color.popups.text
  readonly property string fontFamily: root.bar && root.bar.fontFamily
    ? root.bar.fontFamily : Style.font.family
  // The two secondary text tones used everywhere: muted for labels and
  // supporting values, subtle for tertiary hints and hairline borders.
  readonly property color mutedText: Qt.darker(foreground, 1.35)
  readonly property color subtleText: Qt.darker(foreground, 1.7)
  // Key hints ("⇧ ← → another hour", "Alt 1–9"): the text colour faded
  // towards the theme's background, so they recede in light and dark themes.
  readonly property color hintText: Qt.tint(foreground,
    Qt.rgba(Color.popups.background.r, Color.popups.background.g, Color.popups.background.b, 0.55))

  // Canvas text in the panel's own font, so charts and map labels match the
  // rest of the popup instead of falling back to a proportional sans-serif.
  function canvasFont(pixelSize, bold, italic) {
    return (italic ? "italic " : "") + (bold ? "bold " : "")
      + Math.round(pixelSize) + "px \"" + fontFamily + "\""
  }

  // Width of spaced caption text (day names), for choosing between long and
  // short labels without binding a Text to its own measurement.
  FontMetrics {
    id: captionMetrics
    font.family: root.fontFamily
    font.pixelSize: Style.font.caption
  }
  function captionTextWidth(text) {
    var value = String(text || "")
    return captionMetrics.advanceWidth(value) + value.length
  }

  // Hourly and daily forecasts share one column grid so their columns line up.
  readonly property int forecastColumns: 6
  readonly property real forecastColumnGap: Style.space(12)
  function forecastColumnWidth(availableWidth) {
    return Math.max(Style.space(52),
      (availableWidth - forecastColumnGap * (forecastColumns - 1)) / forecastColumns)
  }

  // The bar tracks the widget mounted in its slot — BarWidget.qml — not this
  // nested panel. Everything the bar identifies a panel by has to be that
  // widget: the popout coordinator (and with it the open-panel dot under the
  // pill) compares against `slot.activeItem`, and switchPanelFrom looks the
  // slot up the same way.
  property var hostWidget: null
  readonly property var barIdentity: hostWidget || root

  function open() {
    openedFromHotkey = false
    settingsOpen = false
    activeTab = defaultTab
    setCenterHoverRevealSuppressed(false)
    root.controller.show()
    locationFile.reload()
    savedLocationsFile.reload()
    displayOptionsStore.appDisplayOptionsFile.reload()
    displayOptionsStore.widgetDisplayOptionsFile.reload()
    displayOptionsStore.menubarDisplayOptionsFile.reload()
    root.ensureDataLoaded()
  }

  function openFromHotkey() {
    openedFromHotkey = true
    settingsOpen = false
    activeTab = defaultTab
    root.controller.show()
    locationFile.reload()
    savedLocationsFile.reload()
    displayOptionsStore.appDisplayOptionsFile.reload()
    displayOptionsStore.widgetDisplayOptionsFile.reload()
    displayOptionsStore.menubarDisplayOptionsFile.reload()
    root.ensureDataLoaded()
    // Set after showing, not before: showing hands the popout coordinator
    // over, which closes whichever panel was open, and that close clears the
    // shared flag. Deferring means the panel taking over always wins, while
    // a handoff to a panel that does not manage the flag still leaves it
    // cleared rather than stuck on.
    root.defer(function() {
      if (root.opened) setCenterHoverRevealSuppressed(true)
    })
  }

  function close() {
    hourCursor = -1
    setCenterHoverRevealSuppressed(false)
    if (root.editingLocation) root.cancelEditingLocation()
    root.settingsOpen = false
    root.showSavedLocations = false
    root.controller.hide()
  }

  // Settings pages, in tab order; ← / → step through them.
  readonly property var settingsPages: ["general", "display", "shortcuts", "sources"]
  property string settingsPage: "general"

  function stepSettingsPage(delta) {
    var index = settingsPages.indexOf(settingsPage)
    settingsPage = settingsPages[(index + delta + settingsPages.length) % settingsPages.length]
  }

  function openSettings(page) {
    settingsPage = page || "general"
    settingsTargetSurface = standaloneMode ? "app" : "widget"
    displayOptionsStore.appDisplayOptionsFile.reload()
    displayOptionsStore.widgetDisplayOptionsFile.reload()
    displayOptionsStore.menubarDisplayOptionsFile.reload()
    settingsOpen = true
  }

  function toggle() {
    if (root.opened) root.close()
    else root.openFromHotkey()
  }

  function switchPanel(direction) {
    if (root.bar && typeof root.bar.switchPanelFrom === "function")
      return root.bar.switchPanelFrom(root.barIdentity, direction)
    return false
  }

  function setCenterHoverRevealSuppressed(value) {
    if (root.bar && typeof root.bar.setCenterHoverRevealSuppressed === "function")
      root.bar.setCenterHoverRevealSuppressed(value)
    else if (root.bar && "centerHoverRevealSuppressed" in root.bar)
      root.bar.centerHoverRevealSuppressed = value
  }

  // Opening the already-running panel must not start another network cycle.
  // The reports and radar frames stay in memory until the refresh timer, a
  // manual refresh, or a location change replaces them. Only the very first
  // open needs to bootstrap the data when no request has started yet.
  function ensureDataLoaded() {
    if (lastRefreshAttemptMs <= 0
        && placeReport === null
        && dailyForecastReport === null
        && radarReport === null)
      root.defer(function() { root.refreshTick(true) })
  }

  // Place for the forecast (name, county, region, country, coordinates) in
  // the nearest_area shape; see Model.placeReport and placeLookup.refreshPlace().
  property var placeReport: null
  property var dailyForecastReport: null
  property var uvReport: null
  property var mosmixReport: null
  property var radarReport: null
  // Rain drift read from a wider DWD radar grid (RadarMotion.mjs);
  // the grid itself is not kept.
  property var radarMotion: []
  // Wet share around the place per radar frame (RadarMotion.mjs), for the
  // rain probability of the next two hours.
  property var radarWet: null
  // When the radar data in use was fetched, here or by the other instance,
  // and when this instance last asked. The DWD nowcast is renewed every five
  // minutes, and so is the radar here (radarLiveTimer), independently of the
  // forecast cycle.
  property double radarFetchedAtMs: 0
  // When the wide grid behind radarMotion and radarWet was fetched; tracked
  // apart from radarFetchedAtMs because the worker's results arrive, and are
  // published, a moment after the place grid.
  property double radarMotionAtMs: 0
  // Place and time of the wide-grid request in flight, fixed when it is sent
  // so a response for a place the user has left is recognised.
  property string radarMotionRequestToken: ""
  property double radarMotionRequestAtMs: 0
  property double radarAttemptMs: 0
  // Radar and rain nowcast: every new measurement (about five minutes, the
  // services publish no faster), or a longer interval from Settings →
  // General to save data.
  readonly property int radarMinutes: Math.max(0, Number(generalSetting("radarMinutes", 0)) || 0)
  readonly property int radarRefreshMs: Math.max(5, radarMinutes) * 60 * 1000
  property var rainViewerReport: null
  property var windGridReport: null
  // Recent wind grids by map extent. Each grid costs Open-Meteo 35 calls, so
  // the maps refresh hourly (and on a manual refresh) instead of with every
  // forecast cycle; zooming back or reopening the tab reuses a grid.
  readonly property int mapRefreshMs: 60 * 60 * 1000
  property var windGridCache: ({})
  readonly property int windGridCacheMs: mapRefreshMs
  property string windGridRequestKey: ""
  property var alertReport: null
  property string providerCountry: ""
  property var forecastProviderChain: []
  property int forecastProviderIndex: 0
  property string forecastRequestProviderId: "open-meteo"
  property string forecastProviderId: "open-meteo"
  property real forecastRequestLatitude: 0
  property real forecastRequestLongitude: 0
  property var regionalRadarFrames: []
  property string regionalRadarProviderId: ""
  property bool regionalRadarFailed: false
  property bool regionalRadarResponseAccepted: false
  property bool rainViewerFailed: false
  property bool rainViewerResponseAccepted: false
  property var alertProviderChain: []
  property int alertProviderIndex: 0
  property string alertProviderId: ""
  property string alertActiveProviderId: ""
  property bool alertResponseAccepted: false
  property int pendingAlertProviderIndex: -1
  // Name of the auto-detected place (IP geolocation).
  property string placeName: ""

  // Configured location, read from the weather.json state file (owned by
  // omarchy-weather-location). The query key is the coordinates when stored,
  // else the encoded name; empty means IP auto-detect. The watch makes hand
  // edits take effect live.
  property var configuredLocationState: ({ name: "", latitude: null, longitude: null })
  readonly property string configuredLocation: configuredLocationState.name
  readonly property string locationQuery: Model.locationQueryKey(configuredLocationState.name, configuredLocationState.latitude, configuredLocationState.longitude)

  // Keep the previous report visible while the new location loads. The
  // editor remains open with a spinner, so stale data is never presented
  // under the newly configured location label.
  onLocationQueryChanged: {
    if (savingLocation) savingLocationQueryStarted = true
    placeReport = null
    placeResolvedKey = ""
    dailyForecastReport = null
    uvReport = null
    lastSuccessfulUpdateMs = 0
    lastRefreshAttemptMs = 0
    lastForecastFailureMs = 0
    refreshFailureCount = 0
    cacheFallbackActive = false
    lastUpdateFromCache = false
    alertReport = null
    alertActiveProviderId = ""
    providerCountry = ""
    mosmixReport = null
    radarReport = null
    radarMotion = []
    radarWet = null
    radarFetchedAtMs = 0
    radarMotionAtMs = 0
    rainViewerReport = null
    regionalRadarFrames = []
    regionalRadarProviderId = ""
    regionalRadarFailed = false
    rainViewerFailed = false
    windGridReport = null
    windGridFailed = false
    windGridRefreshPending = true
    placeRetries = 0
    placeProviderIndex = 0
    dailyForecastRetries = 0
    root.defer(root.activateWeatherCache)
    if (placeLookup) placeLookup.placeProc.running = false
    dailyForecastProc.running = false
    // Radar responses for the previous place must not land here.
    radarProc.running = false
    radarMotionProc.running = false
    sharedLiveAppliedPublishedAt = 0
    root.defer(function() { root.refreshTick(true) })
  }

  property FileView locationFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/weather.json"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: root.configuredLocationState = Model.parseLocationFile(text())
    onLoadFailed: root.configuredLocationState = Model.parseLocationFile("")
  }

  // Saved-locations bookmark list ("Ortsverwaltung") — a separate,
  // plugin-owned file, written directly with setText(). The bar and the
  // standalone app both write it (and an import of the settings does), so
  // each watches it for the other's changes.
  property FileView savedLocationsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-locations.json"
    watchChanges: true
    onFileChanged: reload()
    atomicWrites: true
    printErrors: false
    onLoaded: {
      root.savedLocations = Model.parseSavedLocations(text())
      savedLocationCache.savedCacheSchedule.restart()
    }
    onLoadFailed: {
      root.savedLocations = Model.defaultSavedLocations()
      savedLocationCache.savedCacheSchedule.restart()
    }
  }

  property FileView weatherDataCacheFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-data-cache.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: root.loadWeatherDataCache(text())
    onLoadFailed: root.loadWeatherDataCache("")
  }

  // ---- Colour accents (Settings → General). The hues come from the
  //      current Omarchy theme's colors.toml, so they suit every theme; they
  //      are mixed into the text colour to stay readable on light and dark.
  property var themePalette: ({
    red: "#d20f39", orange: "#fe640b", yellow: "#df8e1d", green: "#40a02b",
    cyan: "#179299", blue: "#1e66f5", magenta: "#8839ef"
  })
  property FileView themeColorsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/current/theme/colors.toml"
    watchChanges: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: {
      var palette = {}
      for (var key in root.themePalette) palette[key] = root.themePalette[key]
      var lines = String(text()).split("\n")
      for (var i = 0; i < lines.length; ++i) {
        var match = lines[i].match(/^\s*(red|orange|yellow|green|cyan|blue|magenta)\s*=\s*"?(#[0-9a-fA-F]{6})"?/)
        if (match) palette[match[1]] = match[2]
      }
      root.themePalette = palette
    }
  }
  readonly property bool colorAccents: generalSetting("colorAccents", true) !== false

  function paletteColor(name) {
    var hex = String(themePalette[name] || "#808080")
    return Qt.rgba(parseInt(hex.substr(1, 2), 16) / 255, parseInt(hex.substr(3, 2), 16) / 255,
      parseInt(hex.substr(5, 2), 16) / 255, 1)
  }
  // The hue over the text colour, strong enough to read as colour, soft
  // enough to stay text.
  function accentOf(color) {
    return Qt.tint(foreground, Qt.rgba(color.r, color.g, color.b, 0.72))
  }
  // Cool to warm over [low, high]: blue, cyan, yellow, orange, red.
  function temperatureAccent(celsius, low, high) {
    var value = parseFloat(celsius)
    if (!colorAccents || !isFinite(value) || !isFinite(low) || !isFinite(high)) return ""
    var t = high > low ? Math.max(0, Math.min(1, (value - low) / (high - low))) : 0.5
    var stops = [[0, "blue"], [0.35, "cyan"], [0.65, "yellow"], [0.85, "orange"], [1, "red"]]
    for (var i = 1; i < stops.length; ++i) {
      if (t > stops[i][0]) continue
      var from = paletteColor(stops[i - 1][1])
      var to = paletteColor(stops[i][1])
      var f = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])
      return accentOf(Qt.rgba(from.r + (to.r - from.r) * f, from.g + (to.g - from.g) * f,
        from.b + (to.b - from.b) * f, 1))
    }
    return accentOf(paletteColor("red"))
  }
  // Every temperature tint uses one fixed scale, so a colour means the same
  // warmth in the current weather, the hours, the days and my places.
  readonly property real accentScaleLow: -10
  readonly property real accentScaleHigh: 35
  function absoluteTemperatureAccent(celsius) {
    return temperatureAccent(celsius, accentScaleLow, accentScaleHigh)
  }
  // Against yesterday: warmer warm, colder cool, from one degree.
  function yesterdayAccent(changeCelsius) {
    var value = parseFloat(changeCelsius)
    if (!colorAccents || !isFinite(value) || Math.abs(value) < 1) return ""
    return accentOf(paletteColor(value > 0 ? "orange" : "blue"))
  }
  // Rain probability: green, yellow, cyan, blue as it rises.
  // Rain chance from the text colour at 0 % through cyan, dark blue and
  // magenta to violet at 100 %, all from the theme (violet, which themes
  // lack, as blue and magenta mixed and deepened).
  function rainProbabilityAccent(percent) {
    var value = parseFloat(percent)
    if (!colorAccents || !isFinite(value)) return ""
    var t = Math.max(0, Math.min(1, value / 100))
    function mix(a, b, f) {
      return Qt.rgba(a.r + (b.r - a.r) * f, a.g + (b.g - a.g) * f, a.b + (b.b - a.b) * f, 1)
    }
    var blue = paletteColor("blue")
    var magenta = paletteColor("magenta")
    var stops = [[0, foreground], [0.25, accentOf(paletteColor("cyan"))],
      [0.5, accentOf(Qt.darker(blue, 1.45))], [0.75, accentOf(magenta)],
      [1, accentOf(Qt.darker(mix(blue, magenta, 0.55), 1.25))]]
    for (var i = 1; i < stops.length; ++i)
      if (t <= stops[i][0])
        return mix(stops[i - 1][1], stops[i][1], (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]))
    return stops[stops.length - 1][1]
  }
  // UV in the WHO bands from "moderate" (3) up; low stays neutral.
  function uvAccent(index) {
    var value = parseFloat(index)
    if (!colorAccents || !isFinite(value) || value < 3) return ""
    return accentOf(paletteColor(value < 6 ? "yellow" : (value < 8 ? "orange" : (value < 11 ? "red" : "magenta"))))
  }
  // Wind from a gale (Bft 7, 50 km/h) orange, from a storm (Bft 9) red.
  function windAccent(kmh) {
    var value = parseFloat(kmh)
    if (!colorAccents || !isFinite(value) || value < 50) return ""
    return accentOf(paletteColor(value < 75 ? "orange" : "red"))
  }
  // The week of the daily forecast, which the temperature bars span.
  readonly property var weekTemperatureRange: {
    var low = Infinity
    var high = -Infinity
    for (var i = 0; i < forecastDays.length; ++i) {
      var min = parseFloat(forecastDays[i].mintempC)
      var max = parseFloat(forecastDays[i].maxtempC)
      if (isFinite(min)) low = Math.min(low, min)
      if (isFinite(max)) high = Math.max(high, max)
    }
    return { low: low, high: high }
  }

  // Every hour of the forecast days, midnight to midnight, for the daily
  // temperature line: { time, tempC (unrounded, NaN where missing), rain
  // (mm in the hour), isDay }. In the DWD area from Bright Sky, the source of
  // the day columns and the hourly forecast: the station's measurements for
  // the hours gone, MOSMIX after them. Open-Meteo, which starts its hours at
  // midnight today, fills in elsewhere and beyond.
  readonly property var weekHours: {
    var hourly = dailyForecastReport && dailyForecastReport.hourly
    var days = forecastDays
    if (!days.length) return []
    var byHour = {}
    if (hourly && hourly.time && hourly.temperature_2m) {
      for (var i = 0; i < hourly.time.length; ++i) {
        var value = hourly.temperature_2m[i] === null ? NaN : parseFloat(hourly.temperature_2m[i])
        byHour[String(hourly.time[i]).slice(0, 13)] = {
          tempC: value,
          rain: hourly.precipitation ? (parseFloat(hourly.precipitation[i]) || 0) : 0,
          isDay: hourly.is_day ? Number(hourly.is_day[i]) !== 0 : undefined,
          pressureHpa: hourly.pressure_msl ? Model.pressureText(hourly.pressure_msl[i]) : ""
        }
      }
    }
    var rows = !cacheFallbackActive && mosmixReport && mosmixReport.weather ? mosmixReport.weather : []
    for (var r = 0; r < rows.length; ++r) {
      var temperature = rows[r].temperature
      if (temperature === null || temperature === undefined || !isFinite(Number(temperature))) continue
      var key = String(rows[r].timestamp || "").slice(0, 13)
      var known = byHour[key]
      byHour[key] = {
        tempC: Number(temperature),
        rain: Number(rows[r].precipitation) || 0,
        // Daylight from the forecast's hours; Bright Sky's own is its icon.
        isDay: known && known.isDay !== undefined ? known.isDay
          : String(rows[r].icon || "").indexOf("night") < 0,
        pressureHpa: Model.pressureText(rows[r].pressure_msl) || (known ? known.pressureHpa : "")
      }
    }
    var list = []
    for (var d = 0; d < days.length; ++d) {
      var date = String(days[d].date || "").slice(0, 10)
      for (var h = 0; h < 24; ++h) {
        var hourKey = date + "T" + (h < 10 ? "0" : "") + h
        var entry = byHour[hourKey]
        list.push({
          time: hourKey + ":00",
          tempC: entry ? entry.tempC : NaN,
          rain: entry ? entry.rain : 0,
          isDay: entry ? entry.isDay : undefined,
          pressureHpa: entry ? entry.pressureHpa : ""
        })
      }
    }
    return list
  }
  // The hour now at the place: its UTC offset from the forecast, since the
  // hours are the place's own and this computer may be elsewhere.
  readonly property int weekHoursNowIndex: {
    var key = new Date(nowDate.getTime() + placeUtcOffsetSeconds * 1000).toISOString().slice(0, 13)
    for (var i = 0; i < weekHours.length; ++i) if (weekHours[i].time.slice(0, 13) === key) return i
    return -1
  }

  property FileView radarPlacesCacheFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-radar-places.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: {
      root.radarPlaceCache = Model.parseRadarPlaceCache(text())
      root.defer(root.radarPlaces.ensureRadarPlaces)
    }
    onLoadFailed: {
      root.radarPlaceCache = Model.parseRadarPlaceCache("")
      root.defer(root.radarPlaces.ensureRadarPlaces)
    }
  }

  // The first read can race shell startup (observed sporadically), leaving a
  // stored location unhonored until the next file write. One delayed reload
  // self-corrects; if the first read was fine it's a no-op, since identical
  // state doesn't change locationQuery and so triggers no refetch.
  Timer {
    interval: 1500
    running: true
    onTriggered: locationFile.reload()
  }

  property int placeRetries: 0
  property int placeProviderIndex: 0
  property string placeRequestKind: ""
  // locationQuery the current placeReport was resolved for.
  property string placeResolvedKey: ""
  property int dailyForecastRetries: 0
  property int radarRetries: 0
  property double lastRefreshAttemptMs: 0
  property double lastSuccessfulUpdateMs: 0
  property double lastForecastFailureMs: 0
  // Failed cycles in a row. Scheduled retries back off 2, 5, 10, then every
  // refreshMinutes, so an outage does not start a full cycle every minute.
  property int refreshFailureCount: 0
  readonly property var refreshBackoffMinutes: [2, 5, 10]
  // Open-Meteo answered 429: skip it (forecast, UV, wind grid) until then.
  property double openMeteoBlockedUntilMs: 0
  // Wall-clock "now" for bindings, advanced by refreshTick once a minute.
  // Bindings must use this rather than new Date(): QML only re-evaluates a
  // binding when a property it reads changes, never because time passed.
  property double relativeTimeNowMs: Date.now()
  readonly property var nowDate: new Date(relativeTimeNowMs)

  // Click-to-edit state for the location label.
  property bool editingLocation: false
  property bool savingLocation: false
  property bool savingLocationQueryStarted: false
  // Search results while the location is being edited (the shared
  // WeatherPlaceSearch), as suggestion rows: name, "region, country" and
  // the coordinates.
  readonly property var locationSuggestions: editingLocation
    ? placeSearch.results.map(suggestionForPlace) : []
  property alias suggestionIndex: placeSearch.index
  property bool locationSearchPristine: true
  // Logical keyboard focus while the location search is open. The text field
  // remains available for typing; Tab/arrow/+/- operate on the selected list.
  property string searchFocusSection: "suggestions"
  property int savedLocationIndex: 0

  // Multi-location management ("Ortsverwaltung"): a separate, plugin-owned
  // list of saved locations, independent of configuredLocationState (the
  // active/displayed location, owned by omarchy-weather-location). Clicking
  // a saved entry switches the active location the same way pickSuggestion
  // does; removing one only edits this list and never touches the active
  // location, even if it's the one currently showing.
  property bool showSavedLocations: false
  property var savedLocations: []
  property bool weatherDataCacheLoaded: false
  property var weatherDataCache: ({ version: 1, lastActiveKey: "", lastAutoKey: "", entries: ({}) })
  property string activeWeatherCacheKey: ""
  property var cachedWeatherSnapshot: null
  property var savedCacheQueue: []
  property var savedCacheActive: null
  property int savedCacheProviderIndex: 0
  property bool savedCacheResponseAccepted: false
  property bool cacheFallbackActive: false
  property bool lastUpdateFromCache: false
  readonly property double displayedUpdateMs: cacheFallbackActive
    ? Number(activeWeatherCacheEntryValue("updatedAt", 0))
    : lastSuccessfulUpdateMs
  property bool settingsOpen: false
  property string settingsTargetSurface: root.standaloneMode ? "app" : "widget"
  property bool appDisplayOptionsLoaded: false
  property bool widgetDisplayOptionsLoaded: false
  property bool menubarDisplayOptionsLoaded: false
  property var appDisplayOptions: defaultDisplayOptions()
  property var widgetDisplayOptions: defaultWidgetDisplayOptions()
  property var menubarDisplayOptions: defaultMenubarDisplayOptions()

  readonly property bool showHourlySection: displaySetting("showHourly", true)
  readonly property bool showDailySection: displaySetting("showDaily", true)
  readonly property bool showRainSection: displaySetting("showRain", true)
  readonly property bool showRadarSection: displaySetting("showRadar", true)
  readonly property bool showWindSection: displaySetting("showWind", true)
  readonly property bool showGlobeSection: displaySetting("showGlobe", true)
  readonly property bool showAirQualitySection: displaySetting("showAirQuality", false)
  // The bar instance also loads air quality for the menu bar hint.
  readonly property bool airQualityWanted: showAirQualitySection
    || (!standaloneMode && menubarShowCurrent
      && (menubarEntryConfigured("currentAirQuality") || menubarEntryConfigured("currentPollen")
        || menubarEntryConfigured("currentAirQualityColor")))
  onAirQualityWantedChanged: if (airQuality) airQuality.refresh()
  readonly property var airQualitySummary: Model.airQualitySummary(airQuality ? airQuality.report : null,
    Providers.countryCode(unitCountry) === "us")
  readonly property bool showForecastIntensity: displaySetting("forecastIntensity", true)
  readonly property bool showForecastProbability: displaySetting("forecastProbability", true)
  readonly property bool showForecastTotal: displaySetting("forecastTotal", true)

  // Sections: each is on or off, and shown either in the scrolling window or
  // as one tab of a shared tab strip. The strip stands where the first
  // tabbed section sits in the order; 1–9 pick its tabs in that order.
  // The current weather moves too, but always shows in the window: it holds
  // the place, refresh and settings controls.
  readonly property var sectionMasterKeys: ({
    favorites: "showFavorites", airQuality: "showAirQuality", hourly: "showHourly", daily: "showDaily",
    rain: "showRain", radar: "showRadar", wind: "showWind", globe: "showGlobe"
  })
  function sectionTabsFrom(order, lookup) {
    var tabs = []
    for (var i = 0; i < order.length; i++) {
      var key = order[i]
      if (!sectionMasterKeys[key]) continue
      if (lookup(sectionMasterKeys[key], true) && lookup(key + "AsTab", false)) tabs.push(key)
    }
    return tabs
  }
  // What the scrolling column draws: the window sections, and the tab strip
  // where "tabs" stands in the order. Tabbed sections keep their own order
  // among the tabs only, so moving one never moves the strip.
  readonly property var displayTabs: sectionTabsFrom(displaySectionOrder, displaySetting)
  readonly property var displayLayout: {
    var layout = []
    for (var i = 0; i < displaySectionOrder.length; i++) {
      var key = displaySectionOrder[i]
      if (key === "tabs") {
        if (displayTabs.length) layout.push("tabs")
      } else if (displayTabs.indexOf(key) < 0) {
        layout.push(key)
      }
    }
    return layout
  }
  readonly property string defaultTab: {
    var wanted = String(displaySetting("defaultTab", "rain"))
    return displayTabs.indexOf(wanted) >= 0 ? wanted : (displayTabs.length ? displayTabs[0] : "")
  }
  // The picked tab; a tab that is gone falls back to the default one.
  property string activeTab: ""
  readonly property string currentTab: displayTabs.indexOf(activeTab) >= 0 ? activeTab : defaultTab
  function sectionShown(key) {
    if (key === "current") return true
    if (!displaySetting(sectionMasterKeys[key], true)) return false
    return displayTabs.indexOf(key) < 0 || currentTab === key
  }
  readonly property bool radarShown: opened && sectionShown("radar")
  readonly property bool windShown: opened && sectionShown("wind")
  readonly property bool globeShown: opened && sectionShown("globe")
  // The globe takes Ctrl + arrows, + − and 0 while no radar or wind map is
  // shown (they keep theirs).
  readonly property bool globeKeys: globeShown && !radarShown && !windShown
  // The globe section, for its keys (WeatherGlobe).
  property Item globeItem: null
  readonly property var settingsTabs: sectionTabsFrom(settingsSectionOrder, settingsDisplaySetting)
  readonly property string settingsDefaultTab: {
    var wanted = String(settingsDisplaySetting("defaultTab", "rain"))
    return settingsTabs.indexOf(wanted) >= 0 ? wanted : (settingsTabs.length ? settingsTabs[0] : "")
  }
  // Material Design Icons from the bar's Nerd Font, one per section.
  function sectionTabGlyph(key) {
    if (key === "favorites") return "\u{f0350}"    // map-marker-multiple
    if (key === "airQuality") return "\u{f032a}"   // leaf
    if (key === "hourly") return "\u{f0150}"       // clock-outline
    if (key === "daily") return "\u{f00ed}"        // calendar
    if (key === "rain") return "\u{f0596}"         // weather-pouring
    if (key === "radar") return "\u{f0437}"        // radar
    if (key === "wind") return "\u{f059d}"         // weather-windy
    if (key === "globe") return "\u{f01e7}"        // earth
    return ""
  }
  function sectionTabLabel(key) {
    return upperLabel(i18n(key === "airQuality" ? "airTab" : (key === "favorites" ? "myPlaces" : key)))
  }
  readonly property string settingsUnitSystem: String(generalSetting("unitSystem", "auto"))
  readonly property string settingsHoverUnitSystem: String(settingsDisplaySetting("hoverUnitSystem", ""))

  // Set by the bar widget while the pointer rests on it: entries switched to
  // "Hover" join the permanent ones for that time.
  property bool menubarHovered: false
  // Menu bar entries. Each is shown always ("<key>"), only when it stands
  // out ("<key>WhenRelevant") or only under the pointer ("<key>OnHover").
  readonly property var menubarHoverKeys: [
    "currentWeatherSymbol", "currentLocation", "currentTemperature", "currentFeelsLike",
    "currentWind", "currentHumidity", "currentPressure", "currentUv", "currentDayRange",
    "currentPrecipitation", "currentRainIntensity", "currentRainAmount", "currentRainStart",
    "currentSunrise", "currentSunset", "currentSunNext", "currentMoon",
    "currentAirQuality", "currentAirQualityColor", "currentPollen", "currentWarnings"
  ]
  readonly property bool menubarShowCurrent: menubarDisplaySetting("showCurrent", true)
  // Text and symbols in the bar turn bold while the pointer rests on them.
  readonly property bool menubarBoldOnHover: menubarDisplaySetting("boldOnHover", true) !== false
  // The values in the bar in the popup's colour accents: "off", "hover"
  // (while the bar turns bold) or "always". The global colour switch
  // (colorAccents) still has the last word.
  readonly property string menubarAccents: {
    var value = String(menubarDisplaySetting("menubarAccents", "hover"))
    return value === "off" || value === "always" ? value : "hover"
  }
  // Each coloured entry's accent, from the same functions as the popup;
  // "" leaves the entry in the bar's text colour.
  function menubarAccentFor(key) {
    if (!current) return ""
    if (key === "currentTemperature") return absoluteTemperatureAccent(current.temp_C)
    if (key === "currentFeelsLike") return absoluteTemperatureAccent(current.FeelsLikeC)
    if (key === "currentWind") return windAccent(current.windspeedKmph)
    if (key === "currentUv") return uvAccent(currentUvIndex)
    if (key === "currentDayMin") return todayForecast ? absoluteTemperatureAccent(todayForecast.mintempC) : ""
    if (key === "currentDayMax") return todayForecast ? absoluteTemperatureAccent(todayForecast.maxtempC) : ""
    // The rain spot only while it shows the probability (the drop does).
    if (key === "currentRain") return menubarRainDropLevel >= 0 ? rainProbabilityAccent(nextHourRainProbability) : ""
    return ""
  }
  readonly property bool menubarOpenWidgetOnHover: !standaloneMode
    && menubarDisplaySetting("openWidgetOnHover", false)
  // Nothing always shown but something on "Hover": the weather symbol stays as
  // the spot to point at.
  readonly property bool menubarHoverHandle: {
    var anyHover = false
    for (var i = 0; i < menubarHoverKeys.length; i++) {
      var key = menubarHoverKeys[i]
      if (key === "currentAirQualityColor") continue
      if (menubarDisplaySetting(key, false) || menubarDisplaySetting(key + "WhenRelevant", false)) return false
      if (menubarDisplaySetting(key + "OnHover", false)) anyHover = true
    }
    return anyHover
  }
  readonly property bool menubarShowLocation: menubarShowCurrent && menubarEntryShown("currentLocation")
  readonly property bool menubarShowWeatherSymbol: menubarShowCurrent
    && (menubarEntryShown("currentWeatherSymbol") || menubarHoverHandle)
  readonly property bool menubarShowTemperature: menubarShowCurrent && menubarEntryShown("currentTemperature")
  readonly property bool menubarShowFeelsLike: menubarShowCurrent && menubarEntryShown("currentFeelsLike")
  readonly property bool menubarShowWind: menubarShowCurrent && menubarEntryShown("currentWind")
  readonly property bool menubarShowHumidity: menubarShowCurrent && menubarEntryShown("currentHumidity")
  readonly property bool menubarShowPressure: menubarShowCurrent && menubarEntryShown("currentPressure")
  readonly property bool menubarShowUv: menubarShowCurrent && menubarEntryShown("currentUv")
  // Today's forecast row, for the day's range and its sun events.
  readonly property var todayForecast: forecastDays.length > 0 ? forecastDays[0] : null
  // The day's low and high, low first as in the daily forecast and its
  // week bar; the parts for the bar's accents, the whole for the rest.
  readonly property bool menubarShowDayRange: menubarShowCurrent
    && menubarEntryShown("currentDayRange") && !!todayForecast
  readonly property string menubarDayMinText: menubarShowDayRange
    ? Model.tempBare(todayForecast.mintempC, todayForecast.mintempF, menubarTempScale) : ""
  readonly property string menubarDayMaxText: menubarShowDayRange
    ? Model.tempBare(todayForecast.maxtempC, todayForecast.maxtempF, menubarTempScale) : ""
  readonly property string menubarDayRangeText: menubarShowDayRange
    ? menubarDayMinText + " / " + menubarDayMaxText : ""
  readonly property string menubarRainAmountText: !menubarShowCurrent
    || !menubarEntryShown("currentRainAmount") || !nextHourForecast ? ""
    : "󰖌 " + precipitationTextForUnit(nextHourForecast.rainAmount, false, menubarUseImperial)
  readonly property string menubarSunriseText: menubarShowCurrent
    && menubarEntryShown("currentSunrise") && todayForecast && todayForecast.sunrise
    ? forecastEventTime(todayForecast.sunrise) : ""
  readonly property string menubarSunsetText: menubarShowCurrent
    && menubarEntryShown("currentSunset") && todayForecast && todayForecast.sunset
    ? forecastEventTime(todayForecast.sunset) : ""
  // One spot that follows the sun: the next event, with its own arrow.
  readonly property var menubarSunNextEvent: menubarShowCurrent
    && menubarEntryShown("currentSunNext") ? nextSunEvent(todayForecast, 0) : null
  readonly property string menubarSunNextText: menubarSunNextEvent
    ? forecastEventTime(menubarSunNextEvent.time) : ""
  readonly property bool menubarSunNextRising: !!menubarSunNextEvent && menubarSunNextEvent.rising
  readonly property string menubarMoonText: menubarShowCurrent && menubarEntryShown("currentMoon")
    ? Model.moonPhaseGlyph(nowDate) : ""
  // "UV 6", or a dash while the forecast carries no value (at night).
  readonly property string menubarUvValueText: !menubarShowUv ? ""
    : (currentUvIndex !== "" ? localizedNumber(currentUvIndex) : "–")
  readonly property string menubarUvText: menubarShowUv ? "UV " + menubarUvValueText : ""
  readonly property bool menubarShowPrecipitation: menubarShowCurrent && menubarEntryShown("currentPrecipitation")
  readonly property bool menubarShowWarnings: menubarShowCurrent && menubarEntryShown("currentWarnings")
  readonly property bool notifySevereWarnings: menubarDisplaySetting("notifySevereWarnings", true)
  readonly property bool notifyRainSoon: menubarDisplaySetting("notifyRainSoon", true)
  // Rain notification: from which strength (the rain legend's levels) and how
  // far around the place. Rain moves at about 50 km/h, so the radius becomes
  // the lead time looked ahead in the nowcast: 25 km about 30 minutes.
  readonly property string rainAlertThreshold: String(menubarDisplaySetting("rainAlertThreshold", "any"))
  readonly property real rainAlertThresholdRate: rainAlertThreshold === "heavy" ? 4.01
    : (rainAlertThreshold === "moderate" ? 0.51 : 0.1)
  readonly property int rainAlertRadiusKm: Number(menubarDisplaySetting("rainAlertRadius", "25")) || 25
  readonly property int rainAlertLeadMinutes: Math.round(rainAlertRadiusKm / 50 * 60)
  // Rain the radar measures at that strength now is nothing to announce,
  // whatever the nowcast's first slot says.
  readonly property var rainAlert: isCurrentlyRaining && parseFloat(radarCurrentIntensity) >= rainAlertThresholdRate
    ? null : Model.rainAlertStart(rainNowcast, nowDate, rainAlertThresholdRate, rainAlertLeadMinutes)
  onNotifyRainSoonChanged: notifications.scheduleAlertNotifications()
  onUpcomingRainChanged: notifications.scheduleAlertNotifications()
  onRainAlertChanged: notifications.scheduleAlertNotifications()

  // Shared hero/bar icon state, updated with each successful weather response.
  // The current-conditions symbol. Derived from liveCurrent, so it follows
  // the minute tick like the temperature beside it; assigned once per
  // response, it used to keep the sky of the fetch time for 15 minutes.
  readonly property string label: Model.currentIcon(
    Model.radarAdjustedCondition(liveCurrent, observedRadarIntensity, thunderstormConfirmed), "", nowDate)
  readonly property bool thunderstormConfirmed: Model.thunderstormConfirmed(alertReport, mosmixReport, nowDate)

  readonly property bool hasConfiguredCoordinates: !isNaN(parseFloat(String(configuredLocationState.latitude))) && !isNaN(parseFloat(String(configuredLocationState.longitude)))
  readonly property var openMeteoCurrent: Model.openMeteoCurrentCondition(dailyForecastReport)
  readonly property var mosmixCurrent: Model.brightSkyCurrentCondition(mosmixReport, openMeteoCurrent, nowDate)
  // MOSMIX where it has answered (it already falls back to Open-Meteo's
  // current values field by field), otherwise the forecast provider's.
  readonly property var liveCurrent: mosmixCurrent
  readonly property var displayedLiveCurrent: cacheFallbackActive ? null : liveCurrent
  readonly property var current: Model.mergeCachedWeatherObject(displayedLiveCurrent,
    (cacheFallbackActive || displayedLiveCurrent) && cachedWeatherSnapshot
      ? cachedWeatherSnapshot.current : null)
  readonly property string displayLabel: !cacheFallbackActive && label !== "" ? label
    : String((cacheFallbackActive || displayedLiveCurrent) && cachedWeatherSnapshot
      && cachedWeatherSnapshot.label || "")
  readonly property bool weatherSymbolCached: displayLabel !== ""
    && (cacheFallbackActive || label === "")
  // Moon phase behind the cloud / precipitation glyph for the large symbol at
  // night; null by day and for clear or overcast skies. The bar and the
  // hourly strip keep single glyphs, which stay legible at small sizes.
  readonly property var heroNightSymbol: Model.nightCompositeSymbol(
    Model.radarAdjustedCondition(current, observedRadarIntensity, thunderstormConfirmed), nowDate, mapCenterLatitude)
  // Moon phase glyphs are drawn as seen from the northern hemisphere; views
  // mirror them for places south of the equator.
  readonly property bool moonMirrored: Model.moonMirroredAt(mapCenterLatitude)
  function mirrorsGlyph(text) {
    return moonMirrored && Model.isMoonPhaseGlyph(text)
  }
  // ---- Current weather extras.
  // Now against yesterday at the same hour, in the shown scale: "+2°".
  readonly property var yesterdayChangeCelsius: current && yesterdayReport && !cacheFallbackActive
    ? Model.yesterdayTemperatureChange(yesterdayReport, current.temp_C, nowDate) : null
  readonly property string heroYesterdayText: {
    if (yesterdayChangeCelsius === null) return ""
    var change = Math.round(tempScale === "fahrenheit" ? yesterdayChangeCelsius * 1.8 : yesterdayChangeCelsius)
    var sign = change > 0 ? "+" : (change < 0 ? "−" : "±")
    return sign + localizedNumber(Math.abs(change)) + (tempScale === "kelvin" ? " K" : "°")
  }
  // The next full or new moon and how far away it is.
  readonly property var nextMoon: Model.nextMoonEvent(nowDate)
  readonly property string heroMoonNextLabel: nextMoon ? upperLabel(i18n(nextMoon.full ? "fullMoon" : "newMoon")) : ""
  readonly property string heroMoonNextGlyph: nextMoon ? String.fromCharCode(nextMoon.full ? 0xe39b : 0xe38d) : ""
  readonly property string heroMoonNextText: {
    if (!nextMoon) return ""
    var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime()
    var eventDay = new Date(nextMoon.date.getFullYear(), nextMoon.date.getMonth(), nextMoon.date.getDate()).getTime()
    var days = Math.round((eventDay - today) / 86400000)
    return days <= 0 ? i18n("moonToday") : (days === 1 ? i18n("moonTomorrow") : i18n("moonInDays", { days: days }))
  }
  // A forecast day's length ("11:51 h", after a sun-clock glyph) and its
  // change against the day before (a trend glyph and "4 min"), at the
  // place's latitude.
  function dayLengthText(day) {
    var length = day ? Model.dayLengthFor(day.date, forecastRequestLatitude || mapCenterLatitude) : null
    if (!length) return ""
    var minutes = length.minutes % 60
    return "󱩸 " + Math.floor(length.minutes / 60) + ":" + (minutes < 10 ? "0" : "") + minutes + " h"
  }
  function dayLengthChangeText(day) {
    var length = day ? Model.dayLengthFor(day.date, forecastRequestLatitude || mapCenterLatitude) : null
    if (!length) return ""
    // Trending down / up / flat: the day grows shorter, longer, or stays.
    var trend = length.change < 0 ? "󰔳" : (length.change > 0 ? "󰔵" : "󰔴")
    return trend + " " + localizedNumber(Math.abs(length.change)) + " min"
  }
  // The place's forecast at its national weather service (Providers).
  readonly property var serviceLink: Providers.serviceForecastLink(providerCountry,
    forecastRequestLatitude || mapCenterLatitude, forecastRequestLongitude || mapCenterLongitude, interfaceLanguage)
  function openServiceLink() {
    if (serviceLink && serviceLink.url) Qt.openUrlExternally(serviceLink.url)
  }

  // Today's phase for the current-weather row and my places: glyph (for
  // the bar), lit share, and the shaded sphere's lit fraction (0–1).
  readonly property string heroMoonGlyph: Model.moonPhaseGlyph(nowDate)
  readonly property real heroMoonPhase: Model.moonPhaseFraction(nowDate)
  readonly property real heroMoonIlluminated: (1 - Math.cos(2 * Math.PI * heroMoonPhase)) / 2
  // Where the sphere is lit (WeatherMoonSphere.litAngle): the waxing moon
  // from the right, the waning from the left, the other way round south
  // of the equator.
  function moonLitAngle(mirrored) {
    return (heroMoonPhase < 0.5) !== !!mirrored ? 0 : Math.PI
  }
  readonly property string heroMoonText: localizedNumber(Model.moonIlluminationPercent(nowDate)) + "%"
  // A forecast day's phase, taken on that day's evening.
  function dayMoonGlyph(day) {
    var evening = day ? Model.moonEveningDate(day.date) : null
    return evening ? Model.moonPhaseGlyph(evening) : ""
  }
  function dayMoonText(day) {
    var evening = day ? Model.moonEveningDate(day.date) : null
    return evening ? localizedNumber(Model.moonIlluminationPercent(evening)) + "%" : ""
  }
  readonly property string displayForecastProviderId: !cacheFallbackActive && dailyForecastReport
    ? forecastProviderId : String(cacheFallbackActive && cachedWeatherSnapshot
      && cachedWeatherSnapshot.forecastProviderId || forecastProviderId)
  // The forecast's name: MeteoSwiss where its ICON-CH series led the answer.
  readonly property string displayForecastLabelKey: !cacheFallbackActive && dailyForecastReport
      && dailyForecastReport._modelId === "meteoswiss"
    ? Providers.forecastLabelKey("meteoswiss") : Providers.forecastLabelKey(displayForecastProviderId)
  readonly property string displayAlertProviderId: !cacheFallbackActive && alertReport
    ? alertActiveProviderId : String(cacheFallbackActive && cachedWeatherSnapshot
      && cachedWeatherSnapshot.alertProviderId || alertActiveProviderId)
  readonly property var areaInfo: placeReport && placeReport.nearest_area && placeReport.nearest_area[0]
    ? placeReport.nearest_area[0] : null
  onAreaInfoChanged: root.defer(function() {
    root.activateWeatherCache()
    root.scheduleWeatherCachePersist()
  })
  readonly property var liveForecastDays: Model.hybridForecastDays(mosmixReport,
    dailyForecastReport, todayDate, uvReport)
  readonly property var displayedLiveForecastDays: cacheFallbackActive ? [] : liveForecastDays
  readonly property var computedForecastDays: Model.mergeCachedWeatherSeries(displayedLiveForecastDays,
    (cacheFallbackActive || displayedLiveForecastDays.length > 0) && cachedWeatherSnapshot
      // Cached days before today are history, not forecast.
      ? (cachedWeatherSnapshot.daily || []).filter(function(day) { return String(day && day.date || "") >= todayDate })
      : [], "date", 0, 7)
  readonly property var liveHourlyForecast: Model.hybridHourlyForecast(mosmixReport,
    dailyForecastReport, uvReport, radarReport, nowDate, 6, liveRainNowcast, thunderstormConfirmed)
  readonly property double cacheWindowStartMs: {
    var start = new Date(relativeTimeNowMs)
    start.setMinutes(0, 0, 0)
    return start.getTime()
  }
  readonly property var displayedLiveHourlyForecast: cacheFallbackActive ? [] : liveHourlyForecast
  // ---- Hour cursor: Shift+←/→ (or a click on an hour) picks one of the
  //      next 24 hours, and the current weather reads it out.
  readonly property var cursorHours: cacheFallbackActive
    ? (cachedWeatherSnapshot && cachedWeatherSnapshot.hourly ? cachedWeatherSnapshot.hourly.slice(0, 24) : [])
    : Model.hybridHourlyForecast(mosmixReport, dailyForecastReport, uvReport, radarReport, nowDate, 24,
      liveRainNowcast, thunderstormConfirmed)
  property int hourCursor: -1
  readonly property var cursorHour: hourCursor >= 0 && hourCursor < cursorHours.length ? cursorHours[hourCursor] : null
  onConfiguredLocationStateChanged: hourCursor = -1
  function moveHourCursor(delta) {
    if (!cursorHours.length) return
    var next = hourCursor < 0 ? (delta > 0 ? 0 : cursorHours.length - 1) : hourCursor + delta
    hourCursor = next < 0 || next >= cursorHours.length ? -1 : next
  }
  function toggleHourCursor(time) {
    var index = -1
    for (var i = 0; i < cursorHours.length; ++i) if (cursorHours[i].time === time) index = i
    hourCursor = index === hourCursor ? -1 : index
  }
  function hourCursorTime(hour) {
    return hour && hour.time ? String(hour.time).slice(11, 16) : ""
  }
  // What the current weather shows: now, or the hour under the cursor.
  readonly property string heroTempNum: cursorHour
    ? Model.tempNumber(cursorHour.tempC, cursorHour.tempF, tempScale) : reportTempNum
  readonly property string heroSymbolText: cursorHour ? hourlyIcon(cursorHour) : displayLabel
  readonly property string heroFeels: cursorHour
    ? (cursorHour.feelsLikeC !== "" && cursorHour.feelsLikeC !== undefined
      ? Model.tempWithUnit(cursorHour.feelsLikeC, cursorHour.feelsLikeF, tempScale) : "–")
    : reportFeels
  readonly property string heroWind: cursorHour ? (windText(cursorHour.windSpeedKmph, useImperial) || "–") : reportWind
  readonly property string heroHumidity: cursorHour
    ? (cursorHour.humidity !== "" && cursorHour.humidity !== undefined ? localizedNumber(cursorHour.humidity) + "%" : "–")
    : reportHumidity
  readonly property string heroPressure: cursorHour
    ? (pressureText(cursorHour.pressureHpa, useImperial) || "–") : reportPressure
  // The pressure's trend at the hour shown: a glyph, "" without one.
  readonly property string heroPressureTrend: cursorHour ? pressureTrendAt(cursorHour.time) : pressureTrendNow
  readonly property string heroPressureTrendGlyph: pressureTrendGlyph(heroPressureTrend)
  readonly property string heroPressureTrendText: heroPressureTrend === "rising" ? i18n("pressureRising")
    : (heroPressureTrend === "falling" ? i18n("pressureFalling")
      : (heroPressureTrend === "steady" ? i18n("pressureSteady") : ""))
  readonly property var heroTempCelsius: cursorHour ? cursorHour.tempC : (current ? current.temp_C : "")
  readonly property var heroFeelsCelsius: cursorHour ? cursorHour.feelsLikeC : (current ? current.FeelsLikeC : "")
  readonly property var heroWindKmph: cursorHour ? cursorHour.windSpeedKmph : (current ? current.windspeedKmph : "")
  readonly property var computedHourlyForecast: Model.mergeCachedWeatherSeries(displayedLiveHourlyForecast,
    (cacheFallbackActive || displayedLiveHourlyForecast.length > 0) && cachedWeatherSnapshot
      ? cachedWeatherSnapshot.hourly : [], "time", cacheWindowStartMs, 6)
  readonly property var liveRainNowcast: Model.rainNowcastSeries(mosmixReport, dailyForecastReport, nowDate, 9,
    radarReport, radarWet, regionalNowcast ? regionalNowcast.currentPoints : [])
  // Source label for the rain tab: the radar supplies amounts wherever it
  // reaches, the forecast the probability and anything beyond.
  readonly property string rainNowcastSourceLabel: {
    var forecast = mosmixReport ? i18n("sourceMosmix") : i18n(displayForecastLabelKey)
    var regional = regionalNowcast && regionalNowcast.currentPoints.length ? regionalNowcast.activeProviderId : ""
    for (var i = 0; i < rainNowcast.length; ++i)
      if (rainNowcast[i].precipitationSource === "radar")
        return i18n(regional ? Providers.regionalNowcastLabelKey(regional) : "sourceRadar") + " + " + forecast
    return forecast
  }
  readonly property var displayedLiveRainNowcast: cacheFallbackActive ? [] : liveRainNowcast
  readonly property var computedRainNowcast: Model.mergeCachedWeatherSeries(displayedLiveRainNowcast,
    (cacheFallbackActive || displayedLiveRainNowcast.length > 0) && cachedWeatherSnapshot
      ? cachedWeatherSnapshot.nowcast : [], "time", relativeTimeNowMs - 15 * 60 * 1000, 9)
  readonly property var dwdRadarFrames: Model.radarTimeline(cacheFallbackActive ? null : radarReport, nowDate, 2)
  readonly property var rainViewerFrames: Model.rainViewerTimeline(cacheFallbackActive ? null : rainViewerReport, nowDate, 2)

  // The series below are recomputed every minute. Views are only handed a new
  // array when the content actually differs, so Repeaters keep their
  // delegates (and radar frames their loaded images) across the minute tick.
  property var forecastDays: []
  property var hourlyForecast: []
  property var rainNowcast: []
  property var radarFrames: []
  property var activeWeatherAlerts: []
  onComputedForecastDaysChanged: syncStableSeries()
  onComputedHourlyForecastChanged: syncStableSeries()
  onComputedRainNowcastChanged: syncStableSeries()
  onComputedRadarFramesChanged: syncStableSeries()
  onComputedWeatherAlertsChanged: syncStableSeries()

  function syncStableSeries() {
    function same(a, b) { return JSON.stringify(a) === JSON.stringify(b) }
    if (!same(forecastDays, computedForecastDays)) forecastDays = computedForecastDays
    if (!same(hourlyForecast, computedHourlyForecast)) hourlyForecast = computedHourlyForecast
    if (!same(rainNowcast, computedRainNowcast)) rainNowcast = computedRainNowcast
    syncRadarFrames()
    if (!same(activeWeatherAlerts, computedWeatherAlerts)) activeWeatherAlerts = computedWeatherAlerts
  }

  // The radar map shows a snapshot of the timeline that is renewed on its own
  // cadence (radarFilmRefreshMs), not with every data update: each new
  // timeline means a new set of frame images, which are loaded in the
  // background (WeatherMapPrefetch). A manual
  // refresh, a location or zoom change, startup and the playback controls
  // open a short window in which a new timeline is adopted; so does a change
  // of source (fallback), since the old frames are unusable then.
  //
  // Between renewals the DWD nowcast snapshot is cut at "now" when shown
  // (radarFirstFrameIndex), so it never shows frames that lie in the past.
  property double radarFramesAdoptedMs: 0
  // With the radar numbers every five minutes, the film follows: with every
  // DWD run while the radar tab is open, every 15 minutes in the background
  // so an opened tab starts current. A new film is about 24 x 20 KB of radar
  // layers, loaded three at a time to spare DWD's GeoServer bursts.
  readonly property int radarFilmRefreshMs: Math.max(radarShown ? 5 : 15, radarMinutes) * 60 * 1000
  property double mapRefreshWindowUntilMs: 0
  readonly property int mapRefreshWindowMs: 60 * 1000
  // Location and zoom changes load new pictures anyway: no staging.
  property double radarDirectAdoptUntilMs: 0
  // A newer timeline whose pictures are still loading. It replaces the shown
  // one once the frame it will show is ready, so the map never falls back to
  // its loading card for an update.
  property var pendingRadarFrames: []
  property double pendingRadarSinceMs: 0
  property var pendingRadarReady: []
  property int pendingRadarReadyCount: 0
  readonly property int pendingRadarFirstIndex: radarFirstFrameIndexFor(pendingRadarFrames, nowDate)
  // Loading 24 pictures from a slow server three at a time takes a while;
  // past this the pending set is taken as it is.
  readonly property int pendingRadarTimeoutMs: 3 * 60 * 1000
  onPendingRadarFramesChanged: {
    pendingRadarReady = []
    pendingRadarReadyCount = 0
  }

  // The shown set loads the same way: three pictures at a time from the
  // frame for now on, counted by WeatherMapPrefetch. The frame on screen may
  // always load, so stepping never waits for the queue.
  property var shownRadarPrefetched: []
  property int shownRadarPrefetchedCount: 0

  function noteShownRadarFramePrefetched(index) {
    var frames = radarFrames
    root.defer(function() {
      if (frames !== root.radarFrames || root.shownRadarPrefetched[index]) return
      var done = root.shownRadarPrefetched.slice(0)
      done[index] = true
      root.shownRadarPrefetched = done
      root.shownRadarPrefetchedCount++
    })
  }

  function radarFrameLoadAllowed(index) {
    var position = index - radarFirstFrameIndex
    return index === radarFrameIndex
      || (position >= 0 && position < shownRadarPrefetchedCount + 3)
  }
  // The user stepped or played: keep their frame instead of following now.
  property bool radarUserNavigated: false
  property string radarSelectedTimestamp: ""
  property double radarTimelineRequestMs: 0

  function radarFramesSource(frames) {
    if (!frames || !frames.length) return ""
    var frame = frames[0]
    return frame.wmsProvider ? String(frame.wmsProvider) : (frame.rainViewer ? "rainviewer" : "dwd")
  }

  function openMapRefreshWindow(direct) {
    mapRefreshWindowUntilMs = Date.now() + mapRefreshWindowMs
    if (direct) radarDirectAdoptUntilMs = mapRefreshWindowUntilMs
    syncRadarFrames()
  }

  function syncRadarFrames() {
    var next = computedRadarFrames
    if (JSON.stringify(radarFrames) === JSON.stringify(next)) {
      if (pendingRadarFrames.length) pendingRadarFrames = []
      return
    }
    var now = Date.now()
    var sourceChanged = radarFramesSource(radarFrames) !== radarFramesSource(next)
    var due = sourceChanged
      || now - radarFramesAdoptedMs >= radarFilmRefreshMs
      || now < mapRefreshWindowUntilMs
    if (!due) return
    if (sourceChanged || !radarFrames.length || !next.length || now < radarDirectAdoptUntilMs) {
      commitRadarFrames(next)
    } else if (JSON.stringify(pendingRadarFrames) !== JSON.stringify(next)) {
      pendingRadarFrames = next
      pendingRadarSinceMs = now
    }
  }

  function commitRadarFrames(frames) {
    var fromPending = frames === pendingRadarFrames
    var readyFlags = pendingRadarReady
    var readyCount = pendingRadarReadyCount
    radarFrames = frames
    // Pictures the pending set already loaded count as loaded for the shown
    // set right away, so its items take them over before the pending items
    // release them.
    if (fromPending && readyCount > 0) {
      shownRadarPrefetched = readyFlags.slice(0)
      shownRadarPrefetchedCount = readyCount
    }
    radarFramesAdoptedMs = Date.now()
    // Released a moment later, once the shown set holds the same pictures.
    root.defer(function() { root.pendingRadarFrames = [] })
  }

  // WeatherMapPrefetch reports the pending set's pictures here. Deferred:
  // replacing a Repeater model from inside an Image's status signal makes
  // Qt connect new Images to a pixmap reply that is being torn down, and
  // Quickshell crashes.
  function pendingRadarFrameStatus(index, status) {
    var frames = pendingRadarFrames
    root.defer(function() { root.applyPendingRadarFrameStatus(frames, index, status) })
  }

  function applyPendingRadarFrameStatus(frames, index, status) {
    if (frames !== pendingRadarFrames || index < 0 || index >= pendingRadarFrames.length) return
    // A picture that still fails after its retries: switch, and let the
    // shown map's fallback logic decide.
    if (status === Image.Error) {
      commitRadarFrames(pendingRadarFrames)
      return
    }
    if (status !== Image.Ready || pendingRadarReady[index]) return
    var ready = pendingRadarReady.slice(0)
    ready[index] = true
    pendingRadarReady = ready
    var first = radarFirstFrameIndexFor(frames, nowDate)
    var count = 0
    for (var i = first; i < frames.length; ++i) if (ready[i]) count++
    pendingRadarReadyCount = count
    // Switch only with every frame from now on ready: playback of the new
    // set must not wait for pictures still on their way.
    if (count >= frames.length - first) commitRadarFrames(pendingRadarFrames)
  }

  // First frame worth showing. The DWD nowcast starts at its fetch time, so
  // everything before the frame for "now" is dropped; observed timelines
  // (RainViewer, regional WMS) are all in the past by nature and stay whole.
  function radarFirstFrameIndexFor(frames, date) {
    if (radarFramesSource(frames) !== "dwd") return 0
    return Model.closestRadarFrameIndex(frames, date || new Date())
  }
  readonly property int radarFirstFrameIndex: radarFirstFrameIndexFor(radarFrames, nowDate)
  readonly property int radarPlayableFrameCount: Math.max(0, radarFrames.length - radarFirstFrameIndex)
  onRadarFirstFrameIndexChanged: {
    if (!radarFrames.length) return
    // Follow the clock unless the user is looking at a frame of their own;
    // never keep a frame that has dropped into the past.
    if (radarFrameIndex < radarFirstFrameIndex || (!radarPlaying && !radarUserNavigated))
      selectRadarFrame(radarFirstFrameIndex)
  }

  // Frame to show for a timeline: the user's frame if it is still in it,
  // otherwise the one for now.
  function radarTargetFrameIndex(frames) {
    var first = radarFirstFrameIndexFor(frames, nowDate)
    if (radarUserNavigated && radarSelectedTimestamp) {
      var selected = new Date(radarSelectedTimestamp).getTime()
      for (var i = first; i < frames.length; ++i)
        if (new Date(frames[i].timestamp).getTime() === selected) return i
    }
    return radarFramesSource(frames) === "dwd" ? first : Model.closestRadarFrameIndex(frames, nowDate)
  }

  // A DWD nowcast has lost frames once its start is ten minutes old; an
  // observed timeline is behind when its newest frame is 15 minutes old.
  function radarTimelineStale(frames) {
    if (!frames || !frames.length) return false
    var now = Date.now()
    if (radarFramesSource(frames) === "dwd")
      return now - new Date(frames[0].timestamp).getTime() >= 10 * 60 * 1000
    return now - new Date(frames[frames.length - 1].timestamp).getTime() >= 15 * 60 * 1000
  }

  // Play, pause and stepping renew an outdated timeline, so the full two
  // hours are available again. A timeline the forecast cycle already
  // fetched is used as is; otherwise only the radar sources are asked.
  function renewRadarOnInteraction() {
    if (!radarTimelineStale(radarFrames)) return
    openMapRefreshWindow(false)
    var now = Date.now()
    if (radarTimelineStale(computedRadarFrames) && now - radarTimelineRequestMs >= 60 * 1000) {
      radarTimelineRequestMs = now
      refreshRadarTimeline()
    }
  }

  // Japan: JMA's radar tiles over the regular frames, once its times are in
  // (WeatherJmaRadarLayer). Only the credit and the source label follow it.
  readonly property bool jmaRadarActive: !!regionalNowcast && regionalNowcast.providerId === "jma"
    && regionalNowcast.jmaObserved.length > 0 && radarFrames.length > 0 && !radarUsesModelFallback
  readonly property string radarDisplayProviderId: jmaRadarActive ? "jma" : radarActiveProviderId
  readonly property string preferredRadarProviderId: Providers.primaryRadarProvider(
    providerCountry, mapCenterLatitude, mapCenterLongitude)
  readonly property var officialRadarFrames: preferredRadarProviderId === "dwd"
    ? (regionalRadarFailed ? [] : dwdRadarFrames)
    : ((!regionalRadarFailed && regionalRadarProviderId === preferredRadarProviderId)
      ? regionalRadarFrames : [])
  readonly property bool radarUsesRainViewer: officialRadarFrames.length === 0
    && !rainViewerFailed && rainViewerFrames.length > 0
  readonly property var computedRadarFrames: officialRadarFrames.length > 0
    ? officialRadarFrames : (radarUsesRainViewer ? rainViewerFrames : [])
  readonly property var sampledPrecipitationGrid: Model.precipitationGridSeries(
    cacheFallbackActive ? null : windGridReport)
  readonly property var precipitationGrid: sampledPrecipitationGrid.length > 0
    ? sampledPrecipitationGrid
    : (rainNowcast.length > 0 ? [{
        latitude: mapCenterLatitude,
        longitude: mapCenterLongitude,
        precipitation: Number(rainNowcast[0].precipitation || 0)
      }] : [])
  readonly property bool radarUsesModelFallback: radarFrames.length === 0 && precipitationGrid.length > 0
  readonly property string radarActiveProviderId: officialRadarFrames.length > 0
    ? preferredRadarProviderId : (radarUsesRainViewer ? "rainviewer"
      : (displayForecastProviderId === "met-no" ? "met-no-model" : "open-meteo-model"))
  property int radarFrameIndex: 0
  property int radarDisplayedFrameIndex: 0
  // Drift for the radar frame on screen, so the arrow follows playback.
  readonly property double radarDisplayedFrameMs: {
    var frame = radarFrames.length
      ? radarFrames[Math.max(0, Math.min(radarDisplayedFrameIndex, radarFrames.length - 1))] : null
    var stamp = frame ? new Date(frame.timestamp).getTime() : NaN
    return isNaN(stamp) ? relativeTimeNowMs : stamp
  }
  readonly property var radarDrift: Model.rainDriftAt(cacheFallbackActive ? [] : radarMotion,
    cacheFallbackActive ? null : dailyForecastReport, rainNowcast, radarDisplayedFrameMs)
  property var radarFrameReady: []
  property bool radarHasDisplayedFrame: false
  property bool radarPlaying: false
  readonly property int defaultMapZoomLevel: 1
  property int mapZoomLevel: defaultMapZoomLevel
  readonly property int mapMinimumZoom: -2
  readonly property int mapMaximumZoom: 3
  property var radarPlaceCache: ({ centerLatitude: null, centerLongitude: null, radiusKm: 0, language: "", fetchedAt: 0, places: [] })
  property bool radarPlacesLoading: false
  property real radarPlacesRequestLatitude: 0
  property real radarPlacesRequestLongitude: 0
  property real radarPlacesRequestRadiusKm: 0
  property string radarPlacesRequestLanguage: ""
  property string radarPlacesQuery: ""
  property int radarPlacesEndpointIndex: 0
  property bool radarPlacesResponseAccepted: false
  readonly property var radarPlacesEndpoints: Providers.placeEndpoints()
  property bool windGridLoading: false
  property bool windGridFailed: false
  property bool windGridResponseAccepted: false
  property bool windGridRefreshPending: false
  property real windGridRequestLatitude: 0
  property real windGridRequestLongitude: 0
  property real windGridRequestRadiusKm: 0
  // Height of the wind map (Model.WIND_LEVELS), chosen in the wind tab.
  readonly property string windLevelId: Model.windLevel(String(generalSetting("windLevel", "10m"))).id
  readonly property var windLevelInfo: Model.windLevel(windLevelId)
  function stepWindLevel(delta) {
    var levels = Model.WIND_LEVELS
    var index = 0
    for (var i = 0; i < levels.length; ++i) if (levels[i].id === windLevelId) index = i
    var next = Math.max(0, Math.min(levels.length - 1, index + delta))
    if (next !== index) displayOptionsStore.setGeneralSetting("windLevel", levels[next].id)
  }
  // "1 500 m" or "4 900 ft" for a height of the wind map.
  function windLevelText(level) {
    if (useImperial) return localizedNumber(Math.round(level.metres * 3.28084 / (level.metres < 1000 ? 10 : 100)) * (level.metres < 1000 ? 10 : 100)) + " ft"
    return level.metres >= 10000 ? localizedNumber(level.metres / 1000) + " km" : localizedNumber(level.metres) + " m"
  }
  readonly property var windGrid: Model.windGridSeries(cacheFallbackActive ? null : windGridReport, windLevelId)
  // The point forecast stands in only for the 10 m wind it has.
  readonly property var windMapData: windGrid.length > 0 || windLevelId !== "10m"
    ? windGrid
    : (rainNowcast.length > 0 ? [{
        latitude: mapCenterLatitude,
        longitude: mapCenterLongitude,
        windSpeed: rainNowcast[0].windSpeed,
        windDirection: rainNowcast[0].windDirection,
        windGust: rainNowcast[0].windGust
      }] : [])
  readonly property string windActiveProviderId: windGrid.length > 0
    ? "open-meteo" : displayForecastProviderId
  readonly property var windMapCurrent: windMapData.length > 0
    ? windMapData[Math.floor(windMapData.length / 2)]
    : null
  readonly property bool windMapUsesCache: windGrid.length === 0
    && rainNowcast.length > 0 && (cachedField(rainNowcast[0], "windSpeed")
      || cachedField(rainNowcast[0], "windDirection")
      || cachedField(rainNowcast[0], "windGust"))
  readonly property var liveActiveWeatherAlerts: Model.weatherAlerts(alertReport, nowDate, interfaceLanguage)
  onLiveActiveWeatherAlertsChanged: notifications.scheduleAlertNotifications()
  onNotifySevereWarningsChanged: notifications.scheduleAlertNotifications()
  readonly property var cachedActiveWeatherAlerts: cachedWeatherSnapshot && Array.isArray(cachedWeatherSnapshot.alerts)
    ? cachedWeatherSnapshot.alerts.filter(function(alert) {
        var expires = new Date(alert && alert.expires || "").getTime()
        return isNaN(expires) || expires > relativeTimeNowMs
      }) : []
  readonly property var computedWeatherAlerts: cacheFallbackActive
    ? Model.mergeCachedWeatherSeries([], cachedActiveWeatherAlerts, "id", 0, 0)
    : liveActiveWeatherAlerts
  readonly property bool hasWeatherAlert: activeWeatherAlerts.length > 0
  readonly property var primaryWeatherAlert: hasWeatherAlert ? activeWeatherAlerts[0] : null
  readonly property color warningColor: primaryWeatherAlert
    ? warningColorForSeverity(primaryWeatherAlert.severity)
    : root.foreground
  readonly property bool usingCachedData: weatherSymbolCached
    || locationCached || lastUpdateFromCache || windMapUsesCache
    || Model.weatherObjectUsesCache(current)
    || Model.weatherSeriesUsesCache(hourlyForecast)
    || Model.weatherSeriesUsesCache(forecastDays)
    || Model.weatherSeriesUsesCache(rainNowcast)
    || Model.weatherSeriesUsesCache(activeWeatherAlerts)
  onProviderCountryChanged: {
    // Shared reports already carry the alerts for this country; the regional
    // radar timeline is not shared and still has to be loaded here.
    var fromShared = root.applyingSharedLive
    root.defer(function() {
      root.refreshRegionalRadar()
      if (fromShared) return
      root.refreshAlerts()
      // The country can decide the preferred forecast provider (MET Norway
      // in the Nordics). The first forecast may have started before the
      // country was known; switch once rather than wait for the next cycle.
      var chain = root.forecastChain(root.forecastRequestLatitude,
        root.forecastRequestLongitude, root.providerCountry)
      if (chain.length && root.dailyForecastReport && !dailyForecastProc.running
          && chain[0].id !== root.forecastProviderId) {
        root.forecastProviderChain = chain
        root.dailyForecastRetries = 0
        root.startForecastProvider(0)
      }
    })
  }
  // configuredLocationState.latitude/longitude are null in auto-detect
  // mode (no saved coordinates) — Number(null) is 0, which silently
  // centered the radar map on the Gulf of Guinea instead of the
  // IP-resolved position. Fall back to areaInfo (the place lookup's
  // coordinates, the same source refreshDailyForecast resolves against).
  readonly property real mapCenterLatitude: hasConfiguredCoordinates
    ? Number(configuredLocationState.latitude)
    : parseFloat(String(areaInfo && areaInfo.latitude
      || activeWeatherCacheEntryValue("latitude", 0)))
  readonly property real mapCenterLongitude: hasConfiguredCoordinates
    ? Number(configuredLocationState.longitude)
    : parseFloat(String(areaInfo && areaInfo.longitude
      || activeWeatherCacheEntryValue("longitude", 0)))
  // Level 0 is the former ±150 km view. Each step changes the physical
  // extent by a factor of 1.5 while retaining the location at the center.
  // mapRadiusKm is the east-west half extent; north-south follows the
  // picture's proportions (Model.mapLatitudeRadiusKm), so the map is not
  // squashed: it used to span as many km north-south as east-west in a
  // picture half as tall.
  readonly property real mapRadiusKm: 150 / Math.pow(1.5, mapZoomLevel)
  readonly property int mapImageWidth: Model.MAP_IMAGE_WIDTH
  readonly property int mapImageHeight: Model.MAP_IMAGE_HEIGHT
  // The map view: the place, moved by dragging the map (degrees). A new
  // place, the recentre button and the 0 key return it to the place.
  // Radar and wind maps: drawn in the theme's colours, or satellite.
  readonly property string mapStyle: String(displaySetting("mapStyle", "drawn"))
  property real mapPanLatitude: 0
  property real mapPanLongitude: 0
  readonly property bool mapPanned: mapPanLatitude !== 0 || mapPanLongitude !== 0
  readonly property real mapViewLatitude: Math.max(-80, Math.min(80, mapCenterLatitude + mapPanLatitude))
  readonly property real mapViewLongitude: {
    var lon = mapCenterLongitude + mapPanLongitude
    return ((lon + 540) % 360) - 180
  }
  readonly property real mapLatitudeRadius: Model.mapLatitudeRadiusKm(mapRadiusKm) / 111.32
  readonly property real mapLongitudeRadius: mapRadiusKm / (111.32 * Math.max(0.2, Math.cos(mapViewLatitude * Math.PI / 180)))
  readonly property real mapWest: mapViewLongitude - mapLongitudeRadius
  readonly property real mapEast: mapViewLongitude + mapLongitudeRadius
  readonly property real mapSouth: mapViewLatitude - mapLatitudeRadius
  readonly property real mapNorth: mapViewLatitude + mapLatitudeRadius
  readonly property string mapBbox: mapWest.toFixed(4) + "," + mapSouth.toFixed(4) + "," + mapEast.toFixed(4) + "," + mapNorth.toFixed(4)
  // No map pictures before the place is known: the extent around 0/0 is
  // meaningless and only costs requests.
  readonly property bool mapExtentKnown: isFinite(mapCenterLatitude) && isFinite(mapCenterLongitude)
    && !(mapCenterLatitude === 0 && mapCenterLongitude === 0)
  // The satellite picture; the drawn map needs none.
  readonly property string mapBasemapUrl: mapExtentKnown && mapStyle === "satellite"
    ? Providers.calmContextMapUrl(mapBbox, mapImageWidth, mapImageHeight) : ""
  // Bumped when data/basemap.bin has been read (WeatherBasemap).
  property int basemapRevision: Basemap.loaded() ? 1 : 0
  // Place names for the maps: OpenStreetMap's (more places, in the chosen
  // language), and Natural Earth's larger towns from the map data where
  // OpenStreetMap has none nearby: offline, after it failed, or in a view
  // moved away from the area it was asked for.
  readonly property var mapPlaces: {
    var osm = radarPlaceCache.places || []
    if (basemapRevision < 1) return osm
    var extra = Basemap.placesIn(mapWest - mapLongitudeRadius * 0.2, mapEast + mapLongitudeRadius * 0.2,
      mapSouth - mapLatitudeRadius * 0.2, mapNorth + mapLatitudeRadius * 0.2)
    var kept = []
    for (var i = 0; i < extra.length; ++i) {
      var near = false
      for (var j = 0; j < osm.length && !near; ++j)
        near = Model.geographicDistanceKm(extra[i].latitude, extra[i].longitude, osm[j].latitude, osm[j].longitude) < 5
      if (!near) kept.push(extra[i])
    }
    return osm.concat(kept)
  }
  readonly property var radarPlaceCandidates: Model.radarPlaceCandidates(
    mapPlaces, mapViewLatitude, mapViewLongitude,
    mapRadiusKm, mapZoomLevel, reportLocation)
  onMapCenterLatitudeChanged: {
    mapPanLatitude = 0
    mapPanLongitude = 0
    if (airQuality) root.defer(airQuality.refresh)
    openMapRefreshWindow(true)
    root.defer(function() { root.refreshRegionalRadar() })
  }
  onMapCenterLongitudeChanged: {
    mapPanLatitude = 0
    mapPanLongitude = 0
    if (airQuality) root.defer(airQuality.refresh)
    openMapRefreshWindow(true)
    root.defer(function() { root.refreshRegionalRadar() })
  }
  // A moved view needs its own pictures, place names and wind samples.
  function mapViewMoved() {
    radarFrameReady = []
    radarHasDisplayedFrame = false
    radarPlaces.radarPlacesDebounce.restart()
    windGridRefreshPending = true
    windGridLoader.windGridDebounce.restart()
  }
  onMapViewLatitudeChanged: mapViewMoved()
  onMapViewLongitudeChanged: mapViewMoved()
  onInterfaceLanguageChanged: radarPlaces.radarPlacesDebounce.restart()
  readonly property bool windMapVisible: windShown
  onWindMapVisibleChanged: if (windMapVisible) windGridLoader.windGridDebounce.restart()
  // Switching views never starts the animation implicitly. Leaving the
  // radar pauses it; returning shows the retained frame until Play is used.
  onRadarShownChanged: if (!radarShown) radarPlaying = false
  onRadarFramesChanged: {
    shownRadarPrefetched = []
    shownRadarPrefetchedCount = 0
    // A renewed timeline keeps the user's frame and running playback.
    var initialFrame = radarTargetFrameIndex(radarFrames)
    radarFrameIndex = initialFrame
    radarDisplayedFrameIndex = initialFrame
    radarFrameReady = []
    radarHasDisplayedFrame = false
    if (radarFrames.length - radarFirstFrameIndexFor(radarFrames, nowDate) < 2) radarPlaying = false
  }
  onMapZoomLevelChanged: {
    // Every Image source changes with mapBbox. Keep the selected timestamp,
    // but show the loading state until that frame is ready at the new scale.
    radarFrameReady = []
    radarHasDisplayedFrame = false
    radarPlaying = false
    // New images are loaded for the new extent anyway; take the latest
    // timeline for them rather than the hourly snapshot.
    openMapRefreshWindow(true)
    radarPlaces.radarPlacesDebounce.restart()
    // Wind samples must cover the same physical extent as the background.
    // Do not keep rendering the old ±150 km grid against a new map scale.
    windGridReport = null
    windGridRefreshPending = true
    windGridLoader.windGridDebounce.restart()
  }
  readonly property var nextHourForecast: hourlyForecast.length > 0 ? hourlyForecast[0] : null
  readonly property string nextHourRainProbability: nextHourForecast && nextHourForecast.rainProbability !== ""
    ? String(nextHourForecast.rainProbability)
    : ""
  // Prefer the live DWD radar observation where available. Worldwide, use
  // the current Best Match 15-minute model intensity as the graceful fallback.
  readonly property string observedRadarIntensity: cacheFallbackActive
    ? "" : Model.radarCurrentIntensity(radarReport, nowDate)
  // UV index of the current forecast hour; empty at night and while the
  // forecast has not arrived.
  readonly property string currentUvIndex: nextHourForecast
    && nextHourForecast.uvIndex !== undefined && nextHourForecast.uvIndex !== null
    ? String(nextHourForecast.uvIndex) : ""
  readonly property string radarCurrentIntensity: observedRadarIntensity !== ""
    ? observedRadarIntensity
    : (rainNowcast.length > 0 ? Number(rainNowcast[0].precipitation || 0).toFixed(1) : "")
  readonly property bool isCurrentlyRaining: radarCurrentIntensity !== "" && parseFloat(radarCurrentIntensity) >= 0.1
  readonly property string rainBadgeText: isCurrentlyRaining
    ? precipitationText(radarCurrentIntensity, true)
    : (nextHourRainProbability !== "" ? nextHourRainProbability + "%" : "")
  readonly property string reportCountry: areaInfo && areaInfo.country && areaInfo.country[0] ? areaInfo.country[0].value : ""

  readonly property string localeName: String(Qt.locale().name || "")
  // Chosen per surface in the settings; the bar instance (widget and menu
  // bar) follows the widget's choice.
  readonly property string interfaceLanguage: I18n.resolvedLanguage(generalSetting("language", "auto"), localeName)
  readonly property var interfaceLocale: Qt.locale(I18n.localeName(interfaceLanguage))
  // The place's own UTC offset (from the forecast), else this computer's:
  // "today" and "now" are the place's, which may be a day away from here
  // (Chicago on Tuesday evening while it is Wednesday in Germany).
  readonly property int placeUtcOffsetSeconds: dailyForecastReport
    && isFinite(Number(dailyForecastReport.utc_offset_seconds))
    ? Number(dailyForecastReport.utc_offset_seconds) : -new Date(relativeTimeNowMs).getTimezoneOffset() * 60
  readonly property string todayDate: Model.placeDate(relativeTimeNowMs, placeUtcOffsetSeconds)
  // "HH:mm" of an instant at the place, like the forecast's own times.
  function placeClock(date) {
    var ms = date instanceof Date ? date.getTime() : Number(date)
    return isNaN(ms) ? "" : Model.placeClock(ms, placeUtcOffsetSeconds)
  }
  // "auto" resolves by the place's country first and the locale second.
  readonly property string unitCountry: reportCountry || providerCountry
  readonly property bool useImperial: Model.shouldUseImperial(
    generalSetting("unitSystem", "auto"), localeName, unitCountry)

  // Auto-refresh interval in minutes; clamped to a sane minimum.
  // The general setting when chosen, else the widget's shell.json entry.
  readonly property int refreshMinutes: Number(generalSetting("refreshMinutes", 0)) > 0
    ? Number(generalSetting("refreshMinutes", 0))
    : Math.max(1, parseInt(setting("refreshMinutes", 15), 10) || 15)

  readonly property string reportLocation: configuredLocation || placeName
    || (areaInfo && areaInfo.areaName && areaInfo.areaName[0] ? areaInfo.areaName[0].value : "")
    || String(cacheFallbackActive ? activeWeatherCacheEntryValue("name", "") : "")
  readonly property bool locationCached: configuredLocation === "" && placeName === ""
    && !areaInfo && cacheFallbackActive && reportLocation !== ""
  readonly property string tempScale: Model.temperatureScale(
    generalSetting("unitSystem", "auto"), localeName, unitCountry)
  readonly property string reportTempNum:   current ? Model.tempNumber(current.temp_C, current.temp_F, tempScale) : ""
  readonly property string tempUnit:        Model.tempUnitLabel(tempScale)
  readonly property string reportFeels:     current ? Model.tempWithUnit(current.FeelsLikeC, current.FeelsLikeF, tempScale) : ""
  readonly property string reportWind:      current ? windText(current.windspeedKmph, useImperial) : ""
  readonly property string reportHumidity:  current ? (localizedNumber(current.humidity) + "%") : ""
  readonly property string reportPressure:  current ? pressureText(current.pressureHpa, useImperial) : ""
  readonly property bool currentPressureCached: cachedField(current, "pressureHpa")
  // ---- Air pressure: "1013 hPa" or "29.92 inHg", and its trend over the
  //      last three hours (Model.pressureTrend) from the week's hours.
  function pressureText(hPa, imperial) {
    var pressure = Model.pressureValue(hPa, imperial)
    if (!pressure) return ""
    // Whole hPa without a group separator ("1004", not "1,004").
    return (imperial ? localizedNumber(pressure.value, 2) : String(pressure.value)) + " " + pressure.unit
  }
  function pressureTrendAt(time) {
    var key = String(time || "").slice(0, 13)
    for (var i = 0; i < weekHours.length; ++i)
      if (weekHours[i].time.slice(0, 13) === key) return Model.pressureTrend(weekHours, i)
    return ""
  }
  readonly property string pressureTrendNow: Model.pressureTrend(weekHours, weekHoursNowIndex)
  function pressureTrendGlyph(trend) {
    return trend === "rising" ? "\u{f0535}" : (trend === "falling" ? "\u{f0533}" : (trend === "steady" ? "\u{f0534}" : ""))
  }
  readonly property bool currentTemperatureCached: currentFieldCached("temp_C", "temp_F")
  readonly property bool currentFeelsCached: currentFieldCached("FeelsLikeC", "FeelsLikeF")
  readonly property bool currentWindCached: currentFieldCached("windspeedKmph", "windspeedMiles")
  readonly property bool currentHumidityCached: cachedField(current, "humidity")
  // Units in the bar: the general setting, or the second system while the
  // pointer rests on the widget.
  readonly property string menubarHoverUnitSystem: String(menubarDisplaySetting("hoverUnitSystem", ""))
  readonly property string menubarUnitSystem: menubarHovered && menubarHoverUnitSystem !== ""
    ? menubarHoverUnitSystem : String(generalSetting("unitSystem", "auto"))
  readonly property bool menubarUseImperial: Model.shouldUseImperial(
    menubarUnitSystem, localeName, unitCountry)
  readonly property string menubarTempScale: Model.temperatureScale(
    menubarUnitSystem, localeName, unitCountry)
  readonly property string menubarReportTempNum: current
    ? Model.tempNumber(current.temp_C, current.temp_F, menubarTempScale) : ""
  readonly property string menubarTemperatureText: menubarReportTempNum === "" ? ""
    : (menubarTempScale === "kelvin" ? menubarReportTempNum + " K" : menubarReportTempNum + "°")
  readonly property string menubarReportFeels: current
    ? Model.tempWithUnit(current.FeelsLikeC, current.FeelsLikeF, menubarTempScale) : ""
  readonly property string menubarReportWind: current ? windText(current.windspeedKmph, menubarUseImperial) : ""
  readonly property string menubarReportHumidity: current ? localizedNumber(current.humidity) + "%" : ""
  // With the trend's glyph after the value, when there is one.
  readonly property string menubarReportPressure: {
    var text = current ? pressureText(current.pressureHpa, menubarUseImperial) : ""
    var glyph = pressureTrendGlyph(pressureTrendNow)
    return text !== "" && glyph !== "" ? text + " " + glyph : text
  }
  readonly property bool menubarPressureCached: cachedField(current, "pressureHpa")
  readonly property bool menubarTemperatureCached: cachedField(current,
    menubarTempScale === "fahrenheit" ? "temp_F" : "temp_C")
  readonly property bool menubarFeelsCached: cachedField(current,
    menubarTempScale === "fahrenheit" ? "FeelsLikeF" : "FeelsLikeC")
  readonly property bool menubarWindCached: cachedField(current,
    menubarUseImperial ? "windspeedMiles" : "windspeedKmph")
  readonly property bool menubarHumidityCached: cachedField(current, "humidity")
  readonly property bool menubarUvCached: !!nextHourForecast && cachedField(nextHourForecast, "uvIndex")
  readonly property bool rainBadgeCached: menubarRainBadgeShowsIntensity
    ? ((cacheFallbackActive || radarReport === null) && rainNowcast.length > 0
      && cachedField(rainNowcast[0], "precipitation"))
    : (hourlyForecast.length > 0 && cachedField(hourlyForecast[0], "rainProbability"))
  readonly property bool warningsCached: Model.weatherSeriesUsesCache(activeWeatherAlerts)
  // Rain expected within the two-hour nowcast while it is dry now.
  readonly property var upcomingRain: isCurrentlyRaining ? null
    : Model.upcomingRainStart(rainNowcast, nowDate)
  readonly property string upcomingRainTime: upcomingRain
    ? placeClock(upcomingRain.date) : ""
  readonly property bool menubarShowAirQuality: menubarShowCurrent
    && menubarEntryShown("currentAirQuality")
  readonly property string menubarAirQualityText: menubarShowAirQuality
    && airQualitySummary && airQualitySummary.index !== null
    ? String(airQualitySummary.index) : ""
  // Strongest pollen of the place, named with its level ("Mugwort high").
  readonly property var topPollen: airQualitySummary && airQualitySummary.pollen
    && airQualitySummary.pollen.length ? airQualitySummary.pollen[0] : null
  readonly property bool menubarShowPollen: menubarShowCurrent && menubarEntryShown("currentPollen")
  readonly property string menubarPollenAlertText: {
    if (!menubarShowPollen || !airQualitySummary) return ""
    if (!topPollen) return i18n("pollenNone")
    return i18n("pollen" + topPollen.type.charAt(0).toUpperCase() + topPollen.type.slice(1)) + " "
      + i18n(topPollen.level >= 3 ? "pollenHigh" : (topPollen.level === 2 ? "pollenModerate" : "pollenLow"))
  }
  // The AQI category colours are loud on most themes: mix them into the
  // muted text colour.
  function softAirQualityColor(hex) {
    var match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex || ""))
    if (!match) return mutedText
    return Qt.tint(mutedText, Qt.rgba(parseInt(match[1], 16) / 255,
      parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255, 0.6))
  }
  // Same softened dot as in the app and widget, switched on separately.
  readonly property bool menubarShowAirQualityColor: menubarAirQualityText !== ""
    && menubarEntryShown("currentAirQualityColor")
  readonly property color menubarAirQualityColor: airQualitySummary && airQualitySummary.color
    ? softAirQualityColor(airQualitySummary.color) : foreground
  readonly property bool menubarShowRainStart: menubarShowCurrent
    && menubarEntryShown("currentRainStart")
  readonly property string menubarRainStartText: !menubarShowRainStart ? ""
    : (upcomingRainTime !== "" ? i18n("rainFromTime", { time: upcomingRainTime })
      : (isCurrentlyRaining ? "" : i18n("rainNone")))
  // One rain spot in the bar: the rain start when rain is on its way, the
  // radar intensity (mm/h) while it rains, the next hour's probability (%)
  // otherwise. A shown intensity takes the place of the probability, which
  // says little while it rains; `currentPrecipitation` is the probability.
  readonly property bool menubarShowRainIntensity: menubarShowCurrent
    && menubarEntryShown("currentRainIntensity")
  readonly property bool menubarRainBadgeShowsIntensity: menubarRainStartText === ""
    && menubarShowRainIntensity
  readonly property string menubarRainBadgeText: menubarRainStartText !== "" ? menubarRainStartText
    : (menubarRainBadgeShowsIntensity
      ? precipitationTextForUnit(radarCurrentIntensity !== "" ? radarCurrentIntensity : "0",
        true, menubarUseImperial)
      : (menubarShowPrecipitation && nextHourRainProbability !== "" ? nextHourRainProbability + "%" : ""))
  // How full the bar's drop is drawn while the badge shows the probability:
  // rounded to 0 (outline), 50 (half) or 100 (full). Quarters were tried, but
  // at bar size 25 % looked like the outline and 75 % like full. -1 for the
  // rate and the rain start, which keep the plain filled drop.
  readonly property int menubarRainDropLevel: menubarRainStartText === "" && !menubarRainBadgeShowsIntensity
      && menubarShowPrecipitation && nextHourRainProbability !== ""
    ? Math.max(0, Math.min(100, Math.round(Number(nextHourRainProbability) / 50) * 50)) : -1
  readonly property bool menubarHasVisibleContent: displayLabel !== "" && menubarShowCurrent && (
    menubarShowLocation || menubarShowWeatherSymbol || menubarShowTemperature
      || menubarShowFeelsLike || menubarShowWind || menubarShowHumidity || menubarShowPressure
      || menubarShowUv || menubarRainBadgeText !== "" || menubarPollenAlertText !== ""
      || menubarDayRangeText !== "" || menubarRainAmountText !== "" || menubarSunriseText !== ""
      || menubarSunsetText !== "" || menubarSunNextText !== "" || menubarMoonText !== ""
      || menubarAirQualityText !== ""
      || menubarShowWarnings || menubarHoverHandle)

  function i18n(key, values) {
    return I18n.text(interfaceLanguage, key, values)
  }

  // Factory defaults per surface. The app is the full view; the widget popup
  // opens over other windows, so it starts with the essentials only.
  function defaultDisplayOptions() {
    return {
      heroSymbol: true,
      heroTemperature: true,
      heroFeelsLike: true,
      heroWind: true,
      heroHumidity: true,
      heroPressure: false,
      heroMoon: true,
      heroYesterday: true,
      heroMoonNext: false,
      heroServiceLink: true,
      radarRings: true,
      mapStyle: "drawn",
      dailyDayLength: true,
      dailyTemperatureBar: true,
      dailyTemperatureCurve: true,
      hourlyTemperatureCurve: true,
      dailyDayLengthChange: true,
      showHourly: true,
      hourlyTime: true,
      hourlyIcon: true,
      hourlyTemperature: true,
      hourlyRainProbability: true,
      hourlyRainAmount: true,
      hourlyUv: true,
      hourlyWind: true,
      hourlyPressure: false,
      showDaily: true,
      dailyDayName: true,
      dailyIcon: true,
      dailyTemperature: true,
      dailyRainProbability: true,
      dailyRainAmount: true,
      dailyUv: true,
      dailyWind: true,
      dailyPressure: false,
      dailySunEvents: true,
      dailySunNext: false,
      dailyMoon: true,
      showRain: true,
      showRadar: true,
      showWind: true,
      showGlobe: true,
      globeNight: true,
      globeMoon: true,
      globeMarkers: true,
      globeAutoRotate: false,
      globeWash: "temperature",
      globeRotateDelay: "10",
      globeRotateSpeed: "4",
      airQualityAsTab: false,
      hourlyAsTab: false,
      dailyAsTab: false,
      rainAsTab: true,
      radarAsTab: true,
      windAsTab: true,
      globeAsTab: true,
      forecastIntensity: true,
      forecastProbability: true,
      forecastTotal: true,
      showAirQuality: false,
      showFavorites: true,
      favoritesAsTab: false,
      favoritesSymbol: true,
      favoritesTemperature: true,
      favoritesFeelsLike: true,
      favoritesWind: true,
      favoritesHumidity: true,
      favoritesMoon: false,
      favoritesOrder: defaultFavoritesOrder(),
      heroOrder: defaultHeroOrder(),
      sectionOrder: defaultSectionOrder(),
      hourlyOrder: defaultHourlyOrder(),
      dailyOrder: defaultDailyOrder(),
      airQualityIndex: true,
      airQualityPollen: true,
      defaultTab: "rain"
    }
  }

  function defaultWidgetDisplayOptions() {
    var options = defaultDisplayOptions()
    // The globe is the app's; the popup can switch it on.
    options.showGlobe = false
    options.hourlyRainAmount = false
    options.hourlyUv = false
    options.hourlyWind = false
    options.dailyRainAmount = false
    options.dailyUv = false
    options.dailyWind = false
    options.dailySunEvents = false
    options.favoritesHumidity = false
    options.dailyDayLength = false
    options.dailyTemperatureBar = false
    options.dailyTemperatureCurve = false
    options.hourlyTemperatureCurve = false
    options.dailyDayLengthChange = false
    // The popup is narrower than the app: four value columns beside the
    // temperature are as many as fit.
    options.heroYesterday = false
    return options
  }

  function defaultOptionsFor(surface) {
    return surface === "menubar" ? defaultMenubarDisplayOptions()
      : (surface === "widget" ? defaultWidgetDisplayOptions() : defaultDisplayOptions())
  }

  function defaultMenubarDisplayOptions() {
    return {
      showCurrent: true,
      currentWeatherSymbol: true,
      currentWeatherSymbolWhenRelevant: false,
      currentWeatherSymbolOnHover: false,
      currentLocation: false,
      currentLocationWhenRelevant: false,
      currentLocationOnHover: false,
      currentTemperature: true,
      currentTemperatureWhenRelevant: false,
      currentTemperatureOnHover: false,
      currentFeelsLike: false,
      currentFeelsLikeWhenRelevant: false,
      currentFeelsLikeOnHover: false,
      currentWind: false,
      currentWindWhenRelevant: false,
      currentWindOnHover: false,
      currentHumidity: false,
      currentHumidityWhenRelevant: false,
      currentHumidityOnHover: false,
      currentPressure: false,
      currentPressureWhenRelevant: false,
      currentPressureOnHover: false,
      currentUv: false,
      currentUvWhenRelevant: false,
      currentUvOnHover: false,
      currentPrecipitation: true,
      currentPrecipitationWhenRelevant: false,
      currentPrecipitationOnHover: false,
      currentRainIntensity: false,
      currentRainIntensityWhenRelevant: true,
      currentRainIntensityOnHover: false,
      currentRainStart: false,
      currentRainStartWhenRelevant: true,
      currentRainStartOnHover: false,
      currentAirQuality: false,
      currentAirQualityWhenRelevant: false,
      currentAirQualityOnHover: false,
      currentAirQualityColor: false,
      currentAirQualityColorWhenRelevant: false,
      currentAirQualityColorOnHover: false,
      currentDayRange: false,
      currentDayRangeWhenRelevant: false,
      currentDayRangeOnHover: false,
      currentRainAmount: false,
      currentRainAmountWhenRelevant: false,
      currentRainAmountOnHover: false,
      currentSunrise: false,
      currentSunriseWhenRelevant: false,
      currentSunriseOnHover: false,
      currentSunset: false,
      currentSunsetWhenRelevant: false,
      currentSunsetOnHover: false,
      currentSunNext: false,
      currentSunNextWhenRelevant: false,
      currentSunNextOnHover: false,
      currentMoon: false,
      currentMoonWhenRelevant: false,
      currentMoonOnHover: false,
      currentPollen: false,
      currentPollenWhenRelevant: false,
      currentPollenOnHover: false,
      currentWarnings: true,
      currentWarningsWhenRelevant: false,
      currentWarningsOnHover: false,
      entryOrder: defaultMenubarEntryOrder(),
      hoverUnitSystem: "",
      boldOnHover: true,
      menubarAccents: "hover",
      openWidgetOnHover: false,
      notifySevereWarnings: true,
      notifyRainSoon: true,
      rainAlertThreshold: "any",
      rainAlertRadius: "25"
    }
  }

  // Missing keys fall back to the surface's factory default, so callers'
  // fallback only matters for keys that have no default at all.
  // Unit system and language apply to the menu bar, widget and app alike.
  property var generalOptions: ({ unitSystem: "auto", language: "auto", windUnit: "auto", refreshMinutes: 0,
    radarMinutes: 0, colorAccents: true, windLevel: "10m" })
  function generalSetting(key, fallback) {
    var value = generalOptions ? generalOptions[key] : undefined
    return value === undefined ? fallback : value
  }

  function optionValue(options, surface, key, fallback) {
    var value = options ? options[key] : undefined
    if (value === undefined) value = defaultOptionsFor(surface)[key]
    return value === undefined ? fallback : value
  }

  function displaySetting(key, fallback) {
    return root.standaloneMode ? optionValue(appDisplayOptions, "app", key, fallback)
      : optionValue(widgetDisplayOptions, "widget", key, fallback)
  }

  function settingsDisplaySetting(key, fallback) {
    var surface = settingsTargetSurface
    var options = surface === "app" ? appDisplayOptions
      : (surface === "widget" ? widgetDisplayOptions : menubarDisplayOptions)
    return optionValue(options, surface, key, fallback)
  }

  // Display order per surface. Entries the file does not name keep their
  // place at the end, so a new entry never disappears.
  function defaultMenubarEntryOrder() {
    return ["currentWeatherSymbol", "currentLocation", "currentTemperature", "currentDayRange",
      "currentFeelsLike", "currentWind", "currentHumidity", "currentPressure", "currentUv", "currentRain",
      "currentRainAmount", "currentSunrise", "currentSunset", "currentSunNext", "currentMoon",
      "currentAirQuality", "currentPollen", "currentWarnings"]
  }

  function defaultFavoritesOrder() {
    // The symbol always leads, before the name; the values follow in order.
    return ["favoritesTemperature", "favoritesFeelsLike", "favoritesWind", "favoritesHumidity", "favoritesMoon"]
  }

  function defaultHeroOrder() {
    return ["heroFeelsLike", "heroWind", "heroHumidity", "heroPressure", "heroMoon", "heroYesterday", "heroMoonNext"]
  }

  function defaultSectionOrder() {
    return ["current", "favorites", "airQuality", "hourly", "daily", "tabs", "rain", "radar", "wind", "globe"]
  }

  function defaultHourlyOrder() {
    return ["hourlyTime", "hourlyIcon", "hourlyTemperature", "hourlyRainProbability",
      "hourlyRainAmount", "hourlyUv", "hourlyWind", "hourlyPressure"]
  }

  function defaultDailyOrder() {
    return ["dailyDayName", "dailyIcon", "dailyTemperature", "dailyTemperatureBar", "dailyRainProbability",
      "dailyRainAmount", "dailyUv", "dailyWind", "dailyPressure", "dailySunEvents", "dailySunNext",
      "dailyDayLength", "dailyDayLengthChange", "dailyMoon"]
  }

  function defaultOrderFor(orderKey) {
    if (orderKey === "entryOrder") return defaultMenubarEntryOrder()
    if (orderKey === "heroOrder") return defaultHeroOrder()
    if (orderKey === "hourlyOrder") return defaultHourlyOrder()
    if (orderKey === "dailyOrder") return defaultDailyOrder()
    if (orderKey === "favoritesOrder") return defaultFavoritesOrder()
    return defaultSectionOrder()
  }

  // Which list an entry in the settings belongs to.
  function orderListKeyForSetting(key) {
    // The temperature charts sit under the columns, outside their order.
    if (key === "hourlyTemperatureCurve" || key === "dailyTemperatureCurve") return ""
    if (String(key).indexOf("current") === 0 || key === "showCurrent") return "entryOrder"
    if (String(key).indexOf("hero") === 0) return "heroOrder"
    if (String(key).indexOf("hourly") === 0 && key !== "showHourly") return "hourlyOrder"
    if (String(key).indexOf("daily") === 0 && key !== "showDaily") return "dailyOrder"
    if (String(key).indexOf("favorites") === 0) return "favoritesOrder"
    if (key === "showAirQuality" || key === "showHourly" || key === "showDaily"
        || key === "showRain" || key === "showRadar" || key === "showWind" || key === "showFavorites"
        || key === "showGlobe")
      return "sectionOrder"
    return ""
  }

  // The stored order, cleaned up against the defaults.
  function sanitizedOrder(value, orderKey) {
    var defaults = defaultOrderFor(orderKey)
    var result = []
    var list = value && value.length !== undefined ? value : []
    // Up to 2.4 rain, radar and wind shared one "forecast" section.
    if (orderKey === "sectionOrder") {
      var expanded = []
      for (var f = 0; f < list.length; f++) {
        if (String(list[f]) === "forecast") expanded.push("rain", "radar", "wind")
        else expanded.push(list[f])
      }
      list = expanded
      // Up to 2.4 the strip stood where the first tabbed section did; the
      // forecast tabs were those, so it goes before them.
      if (list.length && list.indexOf("tabs") < 0) {
        var at = list.length
        var forecastKeys = ["rain", "radar", "wind"]
        for (var t = 0; t < list.length; t++) if (forecastKeys.indexOf(String(list[t])) >= 0) { at = t; break }
        list = list.slice(0, at).concat(["tabs"], list.slice(at))
      }
    }
    for (var i = 0; i < list.length; i++) {
      var key = String(list[i])
      if (defaults.indexOf(key) >= 0 && result.indexOf(key) < 0) result.push(key)
    }
    // Up to 2.4 the current weather always stood first.
    if (orderKey === "sectionOrder" && list.length > 0 && result.indexOf("current") < 0)
      result.unshift("current")
    // Entries the stored order does not name yet (added in a later version)
    // go after their predecessor in the default order, so related entries
    // stay together, instead of at the end.
    for (var d = 0; d < defaults.length; d++) {
      if (result.indexOf(defaults[d]) >= 0) continue
      var after = -1
      for (var p = d - 1; p >= 0 && after < 0; p--) after = result.indexOf(defaults[p])
      result.splice(after + 1, 0, defaults[d])
    }
    return result
  }

  readonly property var menubarEntryOrder: sanitizedOrder(
    menubarDisplayOptions ? menubarDisplayOptions.entryOrder : null, "entryOrder")
  readonly property var displayHeroOrder: sanitizedOrder(displaySetting("heroOrder", null), "heroOrder")
  readonly property var displaySectionOrder: sanitizedOrder(displaySetting("sectionOrder", null), "sectionOrder")
  readonly property var displayHourlyOrder: sanitizedOrder(displaySetting("hourlyOrder", null), "hourlyOrder")
  readonly property var displayDailyOrder: sanitizedOrder(displaySetting("dailyOrder", null), "dailyOrder")
  readonly property var displayFavoritesOrder: sanitizedOrder(displaySetting("favoritesOrder", null), "favoritesOrder")
  readonly property var settingsEntryOrder: sanitizedOrder(settingsDisplaySetting("entryOrder", null), "entryOrder")
  readonly property var settingsHeroOrder: sanitizedOrder(settingsDisplaySetting("heroOrder", null), "heroOrder")
  readonly property var settingsSectionOrder: sanitizedOrder(settingsDisplaySetting("sectionOrder", null), "sectionOrder")
  readonly property var settingsHourlyOrder: sanitizedOrder(settingsDisplaySetting("hourlyOrder", null), "hourlyOrder")
  readonly property var settingsDailyOrder: sanitizedOrder(settingsDisplaySetting("dailyOrder", null), "dailyOrder")
  readonly property var settingsFavoritesOrder: sanitizedOrder(settingsDisplaySetting("favoritesOrder", null), "favoritesOrder")

  function menubarDisplaySetting(key, fallback) {
    return optionValue(menubarDisplayOptions, "menubar", key, fallback)
  }

  // Settings rows that share one spot in the bar move together.
  function settingsOrderFor(orderKey) {
    if (orderKey === "entryOrder") return settingsEntryOrder
    if (orderKey === "heroOrder") return settingsHeroOrder
    if (orderKey === "hourlyOrder") return settingsHourlyOrder
    if (orderKey === "dailyOrder") return settingsDailyOrder
    if (orderKey === "favoritesOrder") return settingsFavoritesOrder
    // The window order (sections in the window and the tab strip), and the
    // order of the tabbed sections among themselves.
    if (orderKey === "tabOrder") return settingsTabs
    if (orderKey === "sectionOrder")
      return settingsSectionOrder.filter(function(key) { return settingsTabs.indexOf(key) < 0 })
    return settingsSectionOrder
  }

  // The settings rows and cards follow the order they describe, so the
  // arrows move an entry where the eye expects it.
  function sortedByOrder(entries, orderKey, keyOf) {
    var order = settingsOrderFor(orderKey)
    var decorated = []
    for (var i = 0; i < entries.length; i++) {
      var place = order.indexOf(orderKeyForSetting(keyOf(entries[i])))
      decorated.push({ entry: entries[i], place: place < 0 ? -1 : place, index: i })
    }
    decorated.sort(function(a, b) {
      if (a.place < 0 || b.place < 0) return a.index - b.index
      return a.place - b.place || a.index - b.index
    })
    var result = []
    for (var d = 0; d < decorated.length; d++) result.push(decorated[d].entry)
    return result
  }

  // Whether the picked view still draws its entries in factory order.
  readonly property bool settingsOrderIsDefault: settingsTargetSurface === "menubar"
    ? String(settingsEntryOrder) === String(defaultMenubarEntryOrder())
    : (String(settingsHeroOrder) === String(defaultHeroOrder())
      && String(settingsSectionOrder) === String(defaultSectionOrder())
      && String(settingsHourlyOrder) === String(defaultHourlyOrder())
      && String(settingsDailyOrder) === String(defaultDailyOrder())
      && String(settingsFavoritesOrder) === String(defaultFavoritesOrder()))

  // A card's rows all belong to the same list, so the first one names it.
  function settingsOrderedOptions(options) {
    var list = options || []
    var orderKey = list.length > 0 ? orderListKeyForSetting(list[0].key) : ""
    if (orderKey === "") return list
    // Options outside the order (the temperature charts) follow the rest.
    var ordered = []
    var fixed = []
    for (var i = 0; i < list.length; i++)
      (orderListKeyForSetting(list[i].key) === "" ? fixed : ordered).push(list[i])
    return sortedByOrder(ordered, orderKey, function(option) { return option.key }).concat(fixed)
  }

  // Section cards follow the section order; the cards around them (current
  // weather first, tabs last) keep their place.
  // Section cards in the window order; the tabbed sections' cards follow
  // the tab card, in tab order, marked `inTabs` (drawn indented under it).
  function settingsOrderedCards(cards) {
    if (settingsTargetSurface === "menubar") return cards
    var list = cards || []
    var bySection = {}
    var others = []
    for (var i = 0; i < list.length; i++) {
      if (list[i].sectionKey) bySection[list[i].sectionKey] = list[i]
      else others.push(list[i])
    }
    var result = []
    function withTabFlag(card, inTabs) {
      var copy = {}
      for (var key in card) copy[key] = card[key]
      copy.inTabs = inTabs
      return copy
    }
    for (var o = 0; o < settingsSectionOrder.length; o++) {
      var key = settingsSectionOrder[o]
      if (!bySection[key] || settingsTabs.indexOf(key) >= 0) continue
      result.push(withTabFlag(bySection[key], false))
      if (key === "tabs")
        for (var t = 0; t < settingsTabs.length; t++)
          if (bySection[settingsTabs[t]]) result.push(withTabFlag(bySection[settingsTabs[t]], true))
    }
    return result.concat(others)
  }

  // Which order a section card's arrows move it in.
  function sectionOrderListFor(sectionKey) {
    return settingsTabs.indexOf(sectionKey) >= 0 ? "tabOrder" : "sectionOrder"
  }

  function orderKeyForSetting(key) {
    if (key === "currentPrecipitation" || key === "currentRainIntensity" || key === "currentRainStart")
      return "currentRain"
    if (key === "currentAirQualityColor") return "currentAirQuality"
    if (key === "showAirQuality") return "airQuality"
    if (key === "showHourly") return "hourly"
    if (key === "showDaily") return "daily"
    if (key === "showRain") return "rain"
    if (key === "showFavorites") return "favorites"
    if (key === "showRadar") return "radar"
    if (key === "showWind") return "wind"
    if (key === "showGlobe") return "globe"
    return key
  }

  function menubarEntryConfigured(key) {
    return menubarDisplaySetting(key, false) === true
      || menubarDisplaySetting(key + "WhenRelevant", false) === true
      || menubarDisplaySetting(key + "OnHover", false) === true
  }

  function menubarEntryShown(key) {
    if (menubarDisplaySetting(key, false) === true) return true
    if (menubarHovered && menubarDisplaySetting(key + "OnHover", false) === true) return true
    return menubarDisplaySetting(key + "WhenRelevant", false) === true && menubarEntryRelevant(key)
  }

  // What "Relevant" means per entry: the value stands out enough to be
  // worth the space. Entries without a rule (symbol, place, temperature,
  // humidity, warnings) offer the choice greyed out in settings.
  function menubarEntryRelevant(key) {
    if (key === "currentFeelsLike")
      return current && current.FeelsLikeC !== undefined && current.temp_C !== undefined
        && Math.abs(parseFloat(current.FeelsLikeC) - parseFloat(current.temp_C)) >= 3
    if (key === "currentWind")
      return !!current && parseFloat(current.windspeedKmph) >= 20
    if (key === "currentUv")
      return currentUvIndex !== "" && parseFloat(currentUvIndex) >= 6
    // Rising or falling by 1.5 hPa or more in three hours.
    if (key === "currentPressure") return pressureTrendNow === "rising" || pressureTrendNow === "falling"
    if (key === "currentPrecipitation")
      return nextHourRainProbability !== "" && parseFloat(nextHourRainProbability) >= 30
    if (key === "currentRainIntensity") return isCurrentlyRaining
    if (key === "currentRainStart") return upcomingRainTime !== ""
    if (key === "currentAirQuality" || key === "currentAirQualityColor")
      return !!airQualitySummary && airQualitySummary.category >= 3
    if (key === "currentRainAmount")
      return !!nextHourForecast && parseFloat(nextHourForecast.rainAmount) > 0
    // The sun events matter as they come closer: within the hour before them.
    if (key === "currentSunrise") return sunEventWithinTheHour(todayForecast ? todayForecast.sunrise : "")
    if (key === "currentSunset") return sunEventWithinTheHour(todayForecast ? todayForecast.sunset : "")
    if (key === "currentSunNext") {
      var next = nextSunEvent(todayForecast, 0)
      return !!next && sunEventWithinTheHour(next.time)
    }
    if (key === "currentMoon") return !!heroNightSymbol || isNightNow
    if (key === "currentPollen") return !!topPollen && topPollen.level >= 3
    if (key === "currentWarnings") return hasWeatherAlert
    return false
  }

  function activeWeatherCacheEntryValue(key, fallback) {
    var entries = weatherDataCache && weatherDataCache.entries ? weatherDataCache.entries : ({})
    var entry = entries[activeWeatherCacheKey]
    var value = entry ? entry[key] : undefined
    return value === undefined || value === null || value === "" ? fallback : value
  }

  function resolvedWeatherCacheKey() {
    var entries = weatherDataCache && weatherDataCache.entries
      ? weatherDataCache.entries : ({})
    var configuredKey = Model.weatherCacheKey(configuredLocation,
      configuredLocationState.latitude, configuredLocationState.longitude)
    if (configuredKey && entries[configuredKey]) return configuredKey
    // Older/name-only weather.json files cannot reproduce the coordinate key
    // created by a successful lookup. Prefer the last active matching entry,
    // then the newest same-name entry, so offline startup still finds it.
    if (configuredLocation) {
      var wantedName = String(configuredLocation).toLowerCase().trim()
      var lastActive = String(weatherDataCache && weatherDataCache.lastActiveKey || "")
      if (entries[lastActive]
          && String(entries[lastActive].name || "").toLowerCase().trim() === wantedName)
        return lastActive
      var keys = Object.keys(entries)
      var newestKey = ""
      var newestTime = 0
      for (var i = 0; i < keys.length; ++i) {
        var entry = entries[keys[i]]
        if (String(entry && entry.name || "").toLowerCase().trim() !== wantedName) continue
        var updatedAt = Number(entry.updatedAt || 0)
        if (updatedAt > newestTime) {
          newestKey = keys[i]
          newestTime = updatedAt
        }
      }
      if (newestKey) return newestKey
      if (configuredKey) return configuredKey
    }
    if (areaInfo) {
      var areaName = areaInfo.areaName && areaInfo.areaName[0] ? areaInfo.areaName[0].value : ""
      var areaKey = Model.weatherCacheKey(areaName, areaInfo.latitude, areaInfo.longitude)
      if (areaKey) return areaKey
    }
    return String(weatherDataCache && weatherDataCache.lastAutoKey || "")
  }

  function activateWeatherCache() {
    if (!weatherDataCacheLoaded) return
    var key = resolvedWeatherCacheKey()
    var entries = weatherDataCache && weatherDataCache.entries ? weatherDataCache.entries : ({})
    activeWeatherCacheKey = key
    cachedWeatherSnapshot = key && entries[key] ? entries[key].snapshot : null
    updateCacheFallbackState(Date.now())
  }

  function hasUsableActiveWeatherCache() {
    return !!(cachedWeatherSnapshot && (cachedWeatherSnapshot.current
      || (cachedWeatherSnapshot.hourly && cachedWeatherSnapshot.hourly.length)
      || (cachedWeatherSnapshot.daily && cachedWeatherSnapshot.daily.length)))
  }

  function updateCacheFallbackState(nowMs) {
    var shouldUse = hasUsableActiveWeatherCache()
      && Model.shouldUseWeatherCache(lastSuccessfulUpdateMs,
        lastForecastFailureMs, Number(nowMs || Date.now()))
    cacheFallbackActive = shouldUse
    lastUpdateFromCache = shouldUse
  }

  function recordForecastRefreshFailure() {
    refreshFailureCount++
    lastForecastFailureMs = Date.now()
    updateCacheFallbackState(lastForecastFailureMs)
  }

  property bool sharedLiveLoaded: false
  property var sharedLiveData: null
  property bool sharedLiveOwnFetch: false
  property bool applyingSharedLive: false
  property double sharedLiveAppliedPublishedAt: 0
  property string sharedInstanceIdValue: ""
  readonly property int sharedRefreshClaimMs: 90 * 1000
  readonly property string sharedLiveLocationKey: hasConfiguredCoordinates
    ? Model.weatherCacheKey(configuredLocation, configuredLocationState.latitude, configuredLocationState.longitude)
    : "auto:" + locationQuery

  // Scheduled refresh entry point. forceDue ignores the last attempt time
  // (location change, first open) but still defers to fresh shared data and
  // to a cycle the other instance has just claimed.
  function refreshTick(forceDue) {
    var now = Date.now()
    relativeTimeNowMs = now
    updateCacheFallbackState(now)
    syncRadarFrames()
    // Pictures that never report (a stalled request) must not hold the
    // update back for good.
    if (pendingRadarFrames.length && now - pendingRadarSinceMs >= pendingRadarTimeoutMs)
      commitRadarFrames(pendingRadarFrames)
    if (!sharedLiveLoaded) return
    sharedLive.applySharedLiveData()

    var refreshInterval = refreshMinutes * 60 * 1000
    var reference = lastSuccessfulUpdateMs > 0 ? lastSuccessfulUpdateMs : lastRefreshAttemptMs
    var due = forceDue
      ? (lastSuccessfulUpdateMs <= 0 || now - lastSuccessfulUpdateMs >= refreshInterval)
      : (reference === 0 || now - reference >= refreshInterval)
    // A cycle that started after the last success and has not succeeded
    // counts as failed, even when it never got as far as the forecast. Its
    // retry waits by the backoff instead of the full interval (or no time).
    var failures = refreshFailureCount
    if (!failures && lastRefreshAttemptMs > 0 && lastRefreshAttemptMs > lastSuccessfulUpdateMs)
      failures = 1
    if (failures > 0) {
      var waitMinutes = failures <= refreshBackoffMinutes.length
        ? Math.min(refreshMinutes, refreshBackoffMinutes[failures - 1]) : refreshMinutes
      due = (lastSuccessfulUpdateMs <= 0 || now - lastSuccessfulUpdateMs >= refreshInterval)
        && now - lastRefreshAttemptMs >= waitMinutes * 60 * 1000
    }
    if (!due) return

    var shared = sharedLiveData
    if (shared && shared.locationKey === sharedLiveLocationKey
        && shared.refreshStartedBy && shared.refreshStartedBy !== sharedLive.sharedInstanceId()
        && now - Number(shared.refreshStartedAt || 0) < sharedRefreshClaimMs) {
      sharedClaimWaitTimer.restart()
      return
    }
    refresh()
  }

  function recordForecastRefreshSuccess(nowMs) {
    var updated = Number(nowMs || Date.now())
    refreshFailureCount = 0
    lastSuccessfulUpdateMs = updated
    lastForecastFailureMs = 0
    relativeTimeNowMs = updated
    cacheFallbackActive = false
    lastUpdateFromCache = false
  }

  function loadWeatherDataCache(raw) {
    weatherDataCache = Model.parseWeatherDataCache(raw, Date.now())
    weatherDataCacheLoaded = true
    activateWeatherCache()
    savedLocationCache.savedCacheSchedule.restart()
  }

  function cachedField(object, key) {
    return Model.weatherFieldIsCached(object, key)
  }

  function currentFieldCached(metricKey, imperialKey) {
    return cachedField(current, useImperial && imperialKey ? imperialKey : metricKey)
  }

  // A saved place's weather, built like the shown place's: in the DWD area
  // with Bright Sky (`mosmix`) for the current values, the hours and the
  // days, so a place reads the same in "My places" and once shown.
  function weatherSnapshotFromReport(source, locationName, providerId, mosmix) {
    var now = new Date()
    // The saved place's own date, from its forecast's UTC offset.
    var today = Model.placeDate(now.getTime(), source && isFinite(Number(source.utc_offset_seconds))
      ? Number(source.utc_offset_seconds) : -now.getTimezoneOffset() * 60)
    var openMeteoCurrent = Model.openMeteoCurrentCondition(source)
    var currentCondition = mosmix ? Model.brightSkyCurrentCondition(mosmix, openMeteoCurrent, now) : openMeteoCurrent
    return {
      label: Model.currentIcon(currentCondition, ""),
      forecastProviderId: String(providerId || source && source._providerId || "open-meteo"),
      alertProviderId: "",
      current: currentCondition,
      hourly: Model.hybridHourlyForecast(mosmix || null, source, source, null, now, 72),
      daily: Model.hybridForecastDays(mosmix || null, source, today, source).slice(0, 3),
      nowcast: Model.rainNowcastSeries(null, source, now, 9),
      alerts: []
    }
  }

  function liveWeatherSnapshot() {
    return {
      label: label,
      forecastProviderId: forecastProviderId,
      alertProviderId: alertActiveProviderId,
      current: liveCurrent,
      hourly: Model.hybridHourlyForecast(mosmixReport, dailyForecastReport,
        uvReport || dailyForecastReport, radarReport, new Date(), 72, liveRainNowcast, thunderstormConfirmed),
      daily: liveForecastDays.slice(0, 3),
      nowcast: liveRainNowcast,
      alerts: liveActiveWeatherAlerts
    }
  }

  function storeWeatherSnapshot(location, snapshot, makeActive) {
    if (root.standaloneMode || !weatherDataCacheLoaded || !location || !snapshot) return
    var key = Model.weatherCacheKey(location.name, location.latitude, location.longitude)
    if (!key) return
    var entries = weatherDataCache && weatherDataCache.entries ? weatherDataCache.entries : ({})
    var oldEntry = entries[key]
    var mergedSnapshot = Model.mergeWeatherSnapshotForStorage(snapshot,
      oldEntry && oldEntry.snapshot)
    if (!mergedSnapshot.current && !mergedSnapshot.hourly.length && !mergedSnapshot.daily.length) return
    var nextEntries = ({})
    var keys = Object.keys(entries)
    for (var i = 0; i < keys.length; ++i) nextEntries[keys[i]] = entries[keys[i]]
    nextEntries[key] = {
      name: String(location.name || ""),
      latitude: location.latitude === undefined ? null : location.latitude,
      longitude: location.longitude === undefined ? null : location.longitude,
      updatedAt: Date.now(),
      snapshot: mergedSnapshot
    }
    var nextCache = {
      version: 1,
      lastActiveKey: makeActive ? key : String(weatherDataCache.lastActiveKey || ""),
      lastAutoKey: makeActive && !hasConfiguredCoordinates
        ? key : String(weatherDataCache.lastAutoKey || ""),
      entries: nextEntries
    }
    weatherDataCache = nextCache
    if (makeActive) {
      activeWeatherCacheKey = key
      cachedWeatherSnapshot = mergedSnapshot
    }
    weatherDataCacheFile.setText(JSON.stringify(nextCache) + "\n")
  }

  function persistActiveWeatherSnapshot() {
    if (root.standaloneMode || !weatherDataCacheLoaded) return
    var latitude = hasConfiguredCoordinates ? configuredLocationState.latitude
      : (areaInfo ? areaInfo.latitude : null)
    var longitude = hasConfiguredCoordinates ? configuredLocationState.longitude
      : (areaInfo ? areaInfo.longitude : null)
    var name = reportLocation || configuredLocation
    if (!name && (latitude === null || longitude === null)) return
    storeWeatherSnapshot({ name: name, latitude: latitude, longitude: longitude },
      liveWeatherSnapshot(), true)
  }

  function scheduleWeatherCachePersist() {
    if (root.sharedLiveOwnFetch && !root.applyingSharedLive) sharedLive.sharedLivePublishTimer.restart()
    if (!root.standaloneMode) weatherCachePersistTimer.restart()
  }

  function localizedNumber(value, forcedDecimals) {
    if (value === undefined || value === null || value === "") return ""
    var number = Number(value)
    if (!isFinite(number)) return String(value)
    var decimals = forcedDecimals
    if (decimals === undefined || decimals === null) {
      var raw = String(value)
      var point = raw.indexOf(".")
      decimals = point < 0 ? 0 : Math.min(3, raw.length - point - 1)
    }
    return latinDigits(interfaceLocale.toString(number, "f", Math.max(0, Number(decimals) || 0)))
  }

  // Arabic and Persian locales format numbers with their own digits, while
  // times, temperatures and percentages elsewhere use Latin digits. Keep one
  // digit set so a row never mixes them.
  function latinDigits(text) {
    return String(text).replace(/[\u0660-\u0669]/g, function(d) {
      return String(d.charCodeAt(0) - 0x0660)
    }).replace(/[\u06F0-\u06F9]/g, function(d) {
      return String(d.charCodeAt(0) - 0x06F0)
    }).replace(/\u066B/g, ".").replace(/\u066C/g, ",")
  }

  // Short, upper-case column label; Greek capitals drop the tonos accent.
  function upperLabel(text) {
    return String(text).toUpperCase().normalize("NFD")
      .replace(/([\u0391-\u03A9])\u0301/g, "$1").normalize("NFC")
  }

  function precipitationUnit(rate) {
    return useImperial ? (rate ? "in/h" : "in") : (rate ? "mm/h" : "mm")
  }

  function precipitationValue(value) {
    if (value === undefined || value === null || value === "") return null
    var number = Number(value)
    if (!isFinite(number)) return null
    return useImperial ? Model.millimetersToInches(number) : number
  }

  function precipitationText(value, rate) {
    var converted = precipitationValue(value)
    if (converted === null) return "– " + precipitationUnit(rate)
    return localizedNumber(converted, useImperial ? 2 : 1) + " " + precipitationUnit(rate)
  }

  function precipitationTextForUnit(value, rate, imperial) {
    var unit = imperial ? (rate ? "in/h" : "in") : (rate ? "mm/h" : "mm")
    if (value === undefined || value === null || value === "") return "– " + unit
    var number = Number(value)
    if (!isFinite(number)) return "– " + unit
    var converted = imperial ? Model.millimetersToInches(number) : number
    return localizedNumber(converted, imperial ? 2 : 1) + " " + unit
  }

  function windMapSpeed(value) {
    var wind = Model.windValue(value, windUnitFor(useImperial))
    return wind ? localizedNumber(wind.value) : "–"
  }
  readonly property string windMapUnit: {
    var wind = Model.windValue(0, windUnitFor(useImperial))
    return wind ? wind.unit : "km/h"
  }

  function distanceText(kilometers) {
    var converted = useImperial ? Model.kilometersToMiles(kilometers) : Number(kilometers)
    if (converted === null || !isFinite(converted)) return "–"
    var isWhole = Math.abs(converted - Math.round(converted)) < 0.01
    return localizedNumber(isWhole ? Math.round(converted) : converted, isWhole || converted >= 10 ? 0 : 1)
      + (useImperial ? " mi" : " km")
  }

  function intensityRangeKey(metricKey) {
    return useImperial && metricKey !== "rainNoneRange" ? metricKey + "Imperial" : metricKey
  }

  function warningColorForSeverity(severity) {
    if (severity === "extreme") return "#d32f2f"
    if (severity === "severe") return "#ef6c00"
    if (severity === "moderate") return "#f9a825"
    return "#fdd835"
  }

  function warningSeverityLabel(severity) {
    if (severity === "extreme") return i18n("warningExtreme")
    if (severity === "severe") return i18n("warningSevere")
    if (severity === "moderate") return i18n("warningModerate")
    return i18n("warningMinor")
  }

  function warningPeriod(alert) {
    if (!alert) return ""
    var onset = alert.onset ? new Date(alert.onset) : null
    var expires = alert.expires ? new Date(alert.expires) : null
    var startText = onset && !isNaN(onset.getTime()) ? latinDigits(interfaceLocale.toString(onset, "ddd HH:mm")) : i18n("effectiveNow")
    var endText = expires && !isNaN(expires.getTime()) ? latinDigits(interfaceLocale.toString(expires, "ddd HH:mm")) : i18n("untilFurtherNotice")
    return startText + " – " + endText
  }

  function lastUpdatedLabel(nowMs, updatedMs) {
    var updated = Number(updatedMs || 0)
    if (!isFinite(updated) || updated <= 0) return i18n("updating")
    var elapsedMinutes = Math.max(0, Math.floor((Number(nowMs) - updated) / 60000))
    if (elapsedMinutes < 1) return i18n("justNow")
    if (elapsedMinutes < 60) return i18n("minutesAgo", { count: elapsedMinutes })
    return i18n("hoursAgo", { count: Math.floor(elapsedMinutes / 60) })
  }

  function refresh() {
    // Each full refresh cycle gets a fresh retry budget, so an earlier
    // exhausted round (e.g. waking with the network still down) doesn't
    // starve retries for the rest of the session.
    placeRetries = 0
    placeProviderIndex = 0
    dailyForecastRetries = 0
    radarRetries = 0
    lastRefreshAttemptMs = Date.now()
    sharedLiveOwnFetch = true
    sharedLive.claimSharedRefresh(lastRefreshAttemptMs)
    placeLookup.refreshPlace()
    // With stored coordinates, or a place already resolved, this fetches the
    // forecast right away. Without either it is a no-op until the place
    // lookup reports coordinates.
    refreshDailyForecast(null)
    radarPlaces.radarPlacesDebounce.restart()
  }

  // DWD's kilometre-scale radar and Bright Sky's MOSMIX/alerts are regional
  // specialities. The generous border box retains their useful edge coverage
  // around Germany; every other coordinate uses the global source path.
  // Bright Sky's hours from midnight today for a week: the station's
  // measurements for the hours gone, DWD MOSMIX after them.
  function brightSkyWeatherUrl(lat, lon) {
    var today = new Date()
    var lastDay = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    return "https://api.brightsky.dev/weather"
      + "?lat=" + encodeURIComponent(String(lat))
      + "&lon=" + encodeURIComponent(String(lon))
      + "&date=" + Qt.formatDate(today, "yyyy-MM-dd")
      + "&last_date=" + Qt.formatDate(lastDay, "yyyy-MM-dd")
      + "&tz=" + encodeURIComponent("Europe/Berlin")
  }

  function usesDwdRegionalSources(latitude, longitude) {
    return Providers.usesDwd(latitude, longitude)
  }

  function openMeteoAvailable() {
    return Date.now() >= openMeteoBlockedUntilMs
  }

  // Forecast providers for a point, without Open-Meteo while it is rate
  // limited (as long as another provider remains).
  function forecastChain(latitude, longitude, country) {
    var chain = Providers.forecastProviders(latitude, longitude, country)
    if (openMeteoAvailable()) return chain
    var usable = chain.filter(function(provider) { return provider.id !== "open-meteo" })
    return usable.length ? usable : chain
  }

  // Reads a failed request; on HTTP 429 from Open-Meteo, pauses it until the
  // limit named in the response resets (daily limits at 00:00 UTC).
  function noteOpenMeteoResponse(request) {
    if (!request || request.status !== 429) return false
    if (String(request.request && request.request.url || "").indexOf("open-meteo.com") < 0) return false
    var reason = String(request.errorText || "").toLowerCase()
    var now = new Date()
    var until
    if (reason.indexOf("minutely") >= 0) until = now.getTime() + 60 * 1000
    else if (reason.indexOf("daily") >= 0)
      until = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    else until = now.getTime() + 60 * 60 * 1000
    if (until > openMeteoBlockedUntilMs) {
      openMeteoBlockedUntilMs = until
      console.warn("more-weather: Open-Meteo rate limited until", new Date(until).toISOString())
    }
    return true
  }

  function startForecastProvider(index) {
    if (dailyForecastProc.running || index < 0 || index >= forecastProviderChain.length) return
    forecastProviderIndex = index
    var provider = forecastProviderChain[index]
    forecastRequestProviderId = provider.id
    dailyForecastProc.request = Providers.forecastRequest(provider.id,
      forecastRequestLatitude, forecastRequestLongitude, providerCountry)
    if (dailyForecastProc.request) dailyForecastProc.running = true
  }

  function refreshDailyForecast(sourceReport) {
    if (dailyForecastProc.running) return

    var lat = parseFloat(String(root.configuredLocationState.latitude))
    var lon = parseFloat(String(root.configuredLocationState.longitude))
    if (isNaN(lat) || isNaN(lon)) {
      var area = sourceReport && sourceReport.nearest_area && sourceReport.nearest_area[0] ? sourceReport.nearest_area[0] : root.areaInfo
      if (!area) return
      lat = parseFloat(String(area.latitude || ""))
      lon = parseFloat(String(area.longitude || ""))
    }
    if (isNaN(lat) || isNaN(lon)) return

    forecastRequestLatitude = lat
    forecastRequestLongitude = lon
    forecastProviderChain = forecastChain(lat, lon, providerCountry)
    forecastProviderIndex = 0
    dailyForecastRetries = 0
    startForecastProvider(0)

    var uvUrl = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + encodeURIComponent(String(lat))
      + "&longitude=" + encodeURIComponent(String(lon))
      + "&daily=uv_index_max&hourly=uv_index"
      + "&forecast_days=8&timezone=auto"
    if (openMeteoAvailable()) {
      uvProc.request = { url: uvUrl, timeoutMs: 5000 }
      uvProc.running = true
      // Yesterday at this hour, for the comparison in the current weather.
      if (!yesterdayProc.running) {
        yesterdayProc.request = {
          url: "https://api.open-meteo.com/v1/forecast?latitude=" + encodeURIComponent(String(lat))
            + "&longitude=" + encodeURIComponent(String(lon))
            + "&hourly=temperature_2m&past_days=1&forecast_days=1&timezone=auto",
          timeoutMs: 5000
        }
        yesterdayProc.running = true
      }
    }

    var useDwd = usesDwdRegionalSources(lat, lon)
    if (useDwd) {
      mosmixProc.request = { url: brightSkyWeatherUrl(lat, lon), timeoutMs: 8000 }
      mosmixProc.running = true

      startDwdRadarRequest(lat, lon)
    } else {
      mosmixProc.running = false
      radarProc.running = false
      radarMotionProc.running = false
      mosmixReport = null
      radarReport = null
      radarMotion = []
      radarWet = null
    }

    startRainViewerRequest()
    refreshRegionalRadar()
    refreshAlerts()
    windGridLoader.requestWindGrid(lat, lon)
  }

  function startDwdRadarRequest(lat, lon) {
    if (radarProc.running) return
    radarAttemptMs = Date.now()
    var radarUrl = "https://api.brightsky.dev/radar"
      + "?lat=" + encodeURIComponent(String(lat))
      + "&lon=" + encodeURIComponent(String(lon))
      + "&distance=1000&format=plain&tz=" + encodeURIComponent("Europe/Berlin")
    // Request the current DWD RV nowcast window through +2 hours.
    var radarStartMs = Math.floor(Date.now() / (5 * 60 * 1000)) * 5 * 60 * 1000
    radarUrl += "&date=" + encodeURIComponent(new Date(radarStartMs).toISOString())
      + "&last_date=" + encodeURIComponent(new Date(radarStartMs + 2 * 60 * 60 * 1000).toISOString())
    // ~1.3 MB for the full two-hour window.
    radarProc.request = { url: radarUrl, timeoutMs: 8000, maxBytes: 16 * 1024 * 1024 }
    radarProc.running = true
    startRadarMotionRequest(lat, lon, radarStartMs)
  }

  // The same nowcast window over 100 x 100 km, wide enough to follow rain
  // for 15 minutes at any plausible speed (~0.5 MB, ~90 KB compressed).
  // Only the drift computed from it is kept.
  function startRadarMotionRequest(lat, lon, startMs) {
    if (radarMotionProc.running) return
    radarMotionRequestToken = locationQuery
    radarMotionRequestAtMs = Date.now()
    radarMotionProc.request = {
      url: "https://api.brightsky.dev/radar"
        + "?lat=" + encodeURIComponent(String(lat))
        + "&lon=" + encodeURIComponent(String(lon))
        + "&distance=50000&format=plain"
        + "&date=" + encodeURIComponent(new Date(startMs).toISOString())
        + "&last_date=" + encodeURIComponent(new Date(startMs + 2 * 60 * 60 * 1000).toISOString()),
      timeoutMs: 10000
    }
    radarMotionProc.running = true
  }

  // RainViewer supplies observed radar frames across more than 150
  // countries and doubles as a fallback if the regional DWD feed is down.
  function startRainViewerRequest() {
    if (rainViewerProc.running) return
    rainViewerResponseAccepted = false
    rainViewerProc.request = { url: "https://api.rainviewer.com/public/weather-maps.json", timeoutMs: 8000 }
    rainViewerProc.running = true
  }

  // Only the radar timelines, for the playback controls.
  // Every 30 s: renews the DWD radar when DWD should have published its next
  // run, unless the other instance has fresher data or has just claimed the
  // request. DWD computes a run every five minutes and publishes it about five
  // minutes after its reference time, so the run after reference R is asked
  // for from R + 10.5 min; without a known run, five minutes after the last
  // fetch. Failed or early attempts wait two minutes. Only in the DWD area.
  function radarLiveTick() {
    var lat = Number(forecastRequestLatitude || mapCenterLatitude)
    var lon = Number(forecastRequestLongitude || mapCenterLongitude)
    if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)) return
    if (!usesDwdRegionalSources(lat, lon)) return
    if (radarProc.running || radarMotionProc.running) return
    sharedLive.applySharedRadar()
    var now = Date.now()
    var reference = radarReport && radarReport.radar && radarReport.radar.length
      ? new Date(radarReferenceTime(radarReport.radar[0])).getTime() : NaN
    var nextRunMs = isFinite(reference)
      ? Math.max(reference + 10.5 * 60 * 1000, radarFetchedAtMs + radarRefreshMs)
      : radarFetchedAtMs + radarRefreshMs
    if (now < nextRunMs && now - radarFetchedAtMs < 2 * radarRefreshMs) return
    if (now - radarAttemptMs < 2 * 60 * 1000) return
    if (sharedLive.radarClaimedByOther()) return
    sharedLive.claimRadar()
    radarRetries = 0
    startDwdRadarRequest(lat, lon)
  }

  property Timer radarLiveTimer: Timer {
    interval: 30 * 1000
    repeat: true
    running: root.sharedLiveLoaded
    onTriggered: root.radarLiveTick()
  }

  function refreshRadarTimeline() {
    var lat = Number(forecastRequestLatitude || mapCenterLatitude)
    var lon = Number(forecastRequestLongitude || mapCenterLongitude)
    if (!isFinite(lat) || !isFinite(lon)) return
    if (usesDwdRegionalSources(lat, lon)) {
      radarRetries = 0
      startDwdRadarRequest(lat, lon)
    }
    startRainViewerRequest()
    refreshRegionalRadar()
  }

  function refreshRegionalRadar() {
    var providerId = preferredRadarProviderId
    if (!providerId || providerId === "dwd") {
      regionalRadarFrames = []
      regionalRadarProviderId = providerId
      regionalRadarFailed = false
      return
    }
    if (regionalRadarTimelineProc.running) return
    var request = Providers.radarCapabilitiesRequest(providerId)
    if (!request) return
    // Keep the current timeline of the same provider until the new one
    // arrives; clearing it would flip the map to the fallback source and
    // back on every cycle.
    if (regionalRadarProviderId !== providerId) regionalRadarFrames = []
    regionalRadarProviderId = providerId
    regionalRadarFailed = false
    regionalRadarResponseAccepted = false
    regionalRadarTimelineProc.request = request
    regionalRadarTimelineProc.running = true
  }

  function startAlertProvider(index) {
    if (index < 0 || index >= alertProviderChain.length) return
    if (alertProc.running) {
      pendingAlertProviderIndex = index
      return
    }
    alertProviderIndex = index
    var provider = alertProviderChain[index]
    if (provider.staged) {
      alertProviderId = provider.id
      alertResponseAccepted = false
      alertLookup.start(provider, forecastRequestLatitude, forecastRequestLongitude)
      return
    }
    var request = Providers.alertRequest(provider, forecastRequestLatitude, forecastRequestLongitude)
    if (!request) return
    alertProviderId = provider.id
    alertResponseAccepted = false
    alertProc.request = request
    alertProc.running = true
  }

  // Both a new forecast cycle and a newly resolved country ask for warnings,
  // often within seconds of each other; the same request is sent only once
  // a minute.
  property string lastAlertRequestKey: ""
  property double lastAlertRequestMs: 0

  function refreshAlerts() {
    var lat = Number(forecastRequestLatitude || mapCenterLatitude)
    var lon = Number(forecastRequestLongitude || mapCenterLongitude)
    if (!isFinite(lat) || !isFinite(lon)) return
    var chain = Providers.alertProviders(providerCountry, lat, lon)
    if (!chain.length) return
    var key = chain.map(function(provider) { return provider.id }).join(",")
      + "@" + lat.toFixed(2) + "," + lon.toFixed(2)
    var now = Date.now()
    if (key === lastAlertRequestKey && now - lastAlertRequestMs < 60 * 1000) return
    lastAlertRequestKey = key
    lastAlertRequestMs = now
    alertProviderChain = chain
    startAlertProvider(0)
  }

  // A parsed warnings report from any provider becomes the shown one.
  function acceptAlertReport(parsed, providerId) {
    if (!parsed || !Array.isArray(parsed.alerts) || providerId !== alertProviderId) return
    alertReport = parsed
    alertResponseAccepted = true
    alertActiveProviderId = providerId
    console.info("more-weather: warning provider active:", alertActiveProviderId)
    scheduleWeatherCachePersist()
  }

  function alertLookupFailed(providerId) {
    if (providerId !== alertProviderId) return
    console.warn("more-weather: warning provider failed:", providerId)
    advanceAlertProvider()
  }

  function advanceAlertProvider() {
    var next = alertProviderIndex + 1
    if (next < alertProviderChain.length) {
      pendingAlertProviderIndex = next
      alertFallbackTimer.restart()
    }
  }

  // ---- Location editing. Clicking the location label swaps it for a search
  //      field; picking a geocoded suggestion persists name + coordinates to
  //      the module's shell.json entry. An empty commit returns to auto.
  function startEditingLocation(initialText) {
    var typedText = String(initialText || "")
    var startsWithTypedText = typedText.length > 0
    editingLocation = true
    showSavedLocations = false
    savingLocation = false
    savingLocationQueryStarted = false
    placeSearch.query = ""
    searchFocusSection = "suggestions"
    savedLocationIndex = 0
    locationSearchPristine = !startsWithTypedText
    scrollHeroIntoView()
    root.defer(function() {
      locationField.text = startsWithTypedText
        ? typedText : (root.reportLocation || root.configuredLocation)
      if (startsWithTypedText) locationField.cursorPosition = locationField.text.length
      else locationField.selectAll()
      locationField.forceActiveFocus()
    })
  }

  function cancelEditingLocation() {
    editingLocation = false
    savingLocation = false
    savingLocationQueryStarted = false
    placeSearch.query = ""
    locationSearchPristine = true
    searchFocusSection = "suggestions"
    savedLocationIndex = 0
    root.defer(function() { if (keyCatcher) keyCatcher.forceActiveFocus() })
  }

  function savedLocationIndexFor(entry) {
    if (!entry) return -1
    var latitude = parseFloat(entry.latitude)
    var longitude = parseFloat(entry.longitude)
    for (var i = 0; i < savedLocations.length; ++i) {
      var saved = savedLocations[i]
      if (saved && saved.name === entry.name
          && Number(saved.latitude) === latitude
          && Number(saved.longitude) === longitude)
        return i
    }
    return -1
  }

  function setSearchFocus(section) {
    var hasSuggestions = locationSuggestions.length > 0
    var hasFavorites = savedLocations.length > 0
    if (section === "saved" && hasFavorites) {
      searchFocusSection = "saved"
      savedLocationIndex = Math.max(0, Math.min(savedLocations.length - 1, savedLocationIndex))
    } else if (section === "suggestions" && hasSuggestions) {
      searchFocusSection = "suggestions"
      suggestionIndex = Math.max(0, Math.min(locationSuggestions.length - 1, suggestionIndex))
    } else if (hasFavorites) {
      searchFocusSection = "saved"
      savedLocationIndex = Math.max(0, Math.min(savedLocations.length - 1, savedLocationIndex))
    } else {
      searchFocusSection = "suggestions"
      suggestionIndex = 0
    }
  }

  function toggleSearchFocus() {
    setSearchFocus(searchFocusSection === "suggestions" ? "saved" : "suggestions")
  }

  function focusCityNameField() {
    root.defer(function() {
      if (!editingLocation) return
      locationField.forceActiveFocus()
      locationField.cursorPosition = locationField.text.length
    })
  }

  function isPlusKey(event) {
    return event.key === Qt.Key_Plus || event.text === "+"
      || (event.key === Qt.Key_Equal && !!(event.modifiers & Qt.ShiftModifier))
  }
  function isMinusKey(event) {
    return event.key === Qt.Key_Minus || event.text === "-"
  }

  // "+" and "−" while the saved places have the focus (after Tab): add the
  // marked result, remove the marked place. Called by the search field
  // before its text input sees the key; anywhere else the two are part of a
  // name ("Saint-Denis"). True when the key was used.
  function searchFieldKey(event) {
    if (searchFocusSection !== "saved" || (event.modifiers & (Qt.ControlModifier | Qt.AltModifier | Qt.MetaModifier)))
      return false
    if (isPlusKey(event)) addMarkedSearchLocation()
    else if (isMinusKey(event)) removeMarkedSearchLocation()
    else return false
    return true
  }

  // "+" in the saved places: the result marked in the list above joins them.
  function addMarkedSearchLocation() {
    var entry = locationSuggestions[suggestionIndex] || null
    if (!entry) return false

    addSavedLocation(entry)
    var savedIndex = savedLocationIndexFor(entry)
    if (savedIndex < 0) return false
    searchFocusSection = "saved"
    savedLocationIndex = savedIndex
    return true
  }

  // "−" removes the marked saved place (not a result that happens to be
  // saved too).
  function removeMarkedSearchLocation() {
    if (searchFocusSection !== "saved") return false
    var entry = savedLocations[savedLocationIndex] || null
    var savedIndex = savedLocationIndexFor(entry)
    if (savedIndex < 0) return false

    removeSavedLocation(savedIndex)
    return true
  }

  // Hero and daily strip live in their own components; these are the handles
  // the controller needs from them.
  readonly property var locationField: hero ? hero.locationField : null

  // The search field's text goes to the place search, which waits for a
  // pause in typing.
  function updatePlaceSearch() {
    placeSearch.query = locationField ? locationField.text : ""
  }

  // A click on a result row.
  function placeSearchPick(i) {
    placeSearch.pick(i)
  }

  function suggestionForPlace(place) {
    return {
      name: place.name,
      description: [place.region, place.country].filter(function(part) { return !!part }).join(", "),
      latitude: place.lat,
      longitude: place.lon
    }
  }

  // Widget only: hand over to the standalone app. Its launcher raises a
  // running instance instead of starting a second one.
  function openApp() {
    if (standaloneMode) return
    close()
    Quickshell.execDetached([appLauncherPath()])
  }

  // The app launcher script inside this plugin folder.
  function appLauncherPath() {
    return decodeURIComponent(String(Qt.resolvedUrl("app/more-weather")).replace(/^file:\/\//, ""))
  }

  function refreshWithFeedback() {
    if (hero) hero.spinRefresh()
    manualRefresh()
  }

  // A refresh asked for by the user also renews the radar and wind maps,
  // which the scheduled cycle only does hourly.
  function manualRefresh() {
    openMapRefreshWindow(false)
    windGridLoader.invalidate()
    refresh()
  }

  // Selects the frame closest to now when the radar view is shown; the
  // hourly snapshot may have been taken a while ago.
  function showCurrentRadarFrame() {
    radarPlaying = false
    radarUserNavigated = false
    selectRadarFrame(radarTargetFrameIndex(radarFrames))
  }

  // Called when the radar view is torn down: its images go with it, so the
  // readiness bookkeeping must start from scratch the next time it is shown.
  function resetRadarDisplay() {
    radarFrameReady = []
    radarHasDisplayedFrame = false
    radarPlaying = false
  }

  // The place field lives in the current-weather section, which the order
  // may put further down: bring it into view for the search.
  function scrollHeroIntoView() {
    if (!hero) return
    var top = hero.mapToItem(weatherColumn, 0, 0).y
    var maximum = Math.max(0, weatherScroll.contentHeight - weatherScroll.height)
    if (top < weatherScroll.contentY || top + hero.height > weatherScroll.contentY + weatherScroll.height)
      weatherScroll.contentY = Math.max(0, Math.min(maximum, top))
  }

  function scrollWeatherBy(delta) {
    var maximum = Math.max(0, weatherScroll.contentHeight - weatherScroll.height)
    weatherScroll.contentY = Math.max(0, Math.min(maximum, weatherScroll.contentY + delta))
  }

  function scrollDailyBy(columns) {
    if (!dailySection || !dailySection.scroller) return
    var scroller = dailySection.scroller
    var step = forecastColumnWidth(scroller.width) + forecastColumnGap
    var maximum = Math.max(0, scroller.contentWidth - scroller.width)
    scroller.contentX = Math.max(0, Math.min(maximum, scroller.contentX + columns * step))
  }

  // Keyboard map, identical in the popup and the app. The groups follow the
  // Shortcuts page (WeatherShortcutsPage.qml), which lists them for the
  // user; keep both in sync with the code below.
  // General
  //   Esc                close the search, the settings or the list, then
  //                      the panel (first it clears the hour cursor)
  //   Tab / ⇧ Tab        next / previous bar panel (Omarchy convention)
  //   Ctrl+,             open the settings
  //   r, F5              refresh
  //   o                  open the app (widget only)
  //   w                  the place at its weather service
  //   Alt+1–9            favourite 1–9; Alt+← / Alt+→ previous / next one
  //   /, Enter           search a place
  // Scrolling
  //   ↑ ↓, j k           scroll               PgUp PgDn  a page
  //   Home End           to the top / bottom
  //   ← →, h l           scroll the daily strip (radar shown: see below)
  //   ⇧ ← →              move the hour cursor; ⌫ or Esc back to now
  // Tabs and maps
  //   1–9                the tabs, in their order
  //   ← →, h l           radar: previous / next frame
  //   Space              radar: play / pause
  //   + − 0              map zoom in / out / reset (radar and wind)
  //   Ctrl+arrows        move the map by a quarter of the view
  //   ⇧ ↑ ↓              wind map: height above ground
  // Place search (while editing the place)
  //   ↑ ↓                choose          Tab  results / favourites
  //   Enter              take the place  + −  add / remove favourite
  //   Esc                cancel
  // Settings: WeatherSettings.handleKey (Tab / ⇧ Tab pages, 1 2 3 view,
  //   ↑ ↓ / j k choose, ← → / h l change, Space / Enter switch or open,
  //   ⇧ ↑ ↓ / J K move, PgUp PgDn Home End scroll, Esc close).
  function handlePanelKey(event) {
    var control = !!(event.modifiers & Qt.ControlModifier)
    var command = !!(event.modifiers & Qt.MetaModifier)
    var alternate = !!(event.modifiers & Qt.AltModifier)
    var plain = !control && !command && !alternate
    var text = String(event.text || "")

    if (event.key === Qt.Key_F5) {
      refreshWithFeedback()
      event.accepted = true
      return
    }
    if (control && event.key === Qt.Key_Comma) {
      if (editingLocation) cancelEditingLocation()
      showSavedLocations = false
      openSettings()
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Escape && hourCursor >= 0 && !editingLocation && !settingsOpen) {
      hourCursor = -1
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Escape) {
      if (editingLocation) cancelEditingLocation()
      else if (settingsOpen) {
        settingsOpen = false
        root.defer(function() { keyCatcher.forceActiveFocus() })
      } else if (showSavedLocations) showSavedLocations = false
      else close()
      event.accepted = true
      return
    }

    if (settingsOpen) {
      if (settingsLoader.item && settingsLoader.item.handleKey(event)) event.accepted = true
      return
    }

    var plusKey = isPlusKey(event)
    var minusKey = isMinusKey(event)

    if (editingLocation) {
      if (plain && (event.key === Qt.Key_Tab || event.key === Qt.Key_Backtab)) {
        toggleSearchFocus()
        event.accepted = true
      } else if (searchFieldKey(event)) {
        event.accepted = true
      } else if (event.key === Qt.Key_Down) {
        if (searchFocusSection === "saved" && savedLocations.length > 0) {
          savedLocationIndex = Math.min(savedLocations.length - 1, savedLocationIndex + 1)
        } else if (locationSuggestions.length > 0) {
          placeSearch.step(1)
          locationSearchPristine = false
        }
        event.accepted = true
      } else if (event.key === Qt.Key_Up) {
        if (searchFocusSection === "saved" && savedLocations.length > 0) {
          savedLocationIndex = Math.max(0, savedLocationIndex - 1)
        } else if (locationSuggestions.length > 0) {
          placeSearch.step(-1)
          locationSearchPristine = false
        }
        event.accepted = true
      } else if (event.key === Qt.Key_Return || event.key === Qt.Key_Enter) {
        if (!savingLocation) {
          if (searchFocusSection === "saved" && savedLocations.length > 0)
            selectSavedLocation(savedLocations[savedLocationIndex])
          else {
            // The untouched, selected current place is a two-step keyboard
            // affordance: first Enter marks it, immediate second Enter exits
            // at that same place without rewriting or dropping coordinates.
            if (locationSearchPristine) cancelEditingLocation()
            // No result yet: Nominatim may know it (asked only on Enter);
            // the next Enter commits what it found, or the name as typed.
            else if ((locationSuggestions.length > 0 && placeSearch.resultsCurrent) || !placeSearch.submit())
              commitLocation()
          }
        }
        event.accepted = true
      }
      return
    }

    // Alt+1…9: favourite 1–9; Alt+← / Alt+→: previous / next favourite.
    if (alternate && !control && !command && savedLocations.length > 0) {
      if (event.key >= Qt.Key_1 && event.key <= Qt.Key_9) {
        showFavorite(event.key - Qt.Key_1)
        event.accepted = true
        return
      }
      if (event.key === Qt.Key_Left || event.key === Qt.Key_Right) {
        stepFavorite(event.key === Qt.Key_Right ? 1 : -1)
        event.accepted = true
        return
      }
    }

    // Ctrl + arrows turn and tilt the globe while it has the keys.
    if (control && !alternate && !command && globeKeys && globeItem) {
      var east = event.key === Qt.Key_Left ? -1 : (event.key === Qt.Key_Right ? 1 : 0)
      var north = event.key === Qt.Key_Up ? 1 : (event.key === Qt.Key_Down ? -1 : 0)
      if (east !== 0 || north !== 0) {
        globeItem.turnStep(east, north)
        event.accepted = true
        return
      }
    }
    // Ctrl+arrows move the radar or wind map by a quarter of the view.
    if (control && !alternate && !command && (radarShown || windShown)) {
      var across = event.key === Qt.Key_Left ? -1 : (event.key === Qt.Key_Right ? 1 : 0)
      var along = event.key === Qt.Key_Up ? 1 : (event.key === Qt.Key_Down ? -1 : 0)
      if (across !== 0 || along !== 0) {
        panMapBy(across * 0.25, along * 0.25)
        event.accepted = true
        return
      }
    }
    if (!plain) return

    if (event.key === Qt.Key_Tab || event.key === Qt.Key_Backtab) {
      switchPanel((event.modifiers & Qt.ShiftModifier) || event.key === Qt.Key_Backtab ? -1 : 1)
      event.accepted = true
      return
    }
    if (text.length === 1 && text >= "1" && text <= "9") {
      var tabIndex = Number(text) - 1
      if (tabIndex < displayTabs.length) activeTab = displayTabs[tabIndex]
      event.accepted = true
      return
    }
    if (text === "w") {
      openServiceLink()
      event.accepted = true
      return
    }
    if (text === "o" && !standaloneMode) {
      openApp()
      event.accepted = true
      return
    }
    if (text === "r" || text === "R") {
      refreshWithFeedback()
      event.accepted = true
      return
    }
    if (text === "/" || event.key === Qt.Key_Return || event.key === Qt.Key_Enter) {
      startEditingLocation()
      event.accepted = true
      return
    }

    // v: the globe's next colour wash.
    if (globeKeys && globeItem && text === "v") {
      setViewDisplaySetting("globeWash", GlobeFields.nextWash(displaySetting("globeWash", "temperature")))
      event.accepted = true
      return
    }
    // + − zoom the globe, 0 brings back the whole globe at the shown place.
    if (globeKeys && globeItem && (plusKey || minusKey)) {
      globeItem.zoomBy(plusKey ? 1 : -1)
      event.accepted = true
      return
    }
    if (globeKeys && globeItem && text === "0") {
      globeItem.reset()
      event.accepted = true
      return
    }
    var mapView = radarShown || windShown
    if (mapView && (plusKey || minusKey)) {
      changeMapZoom(plusKey ? 1 : -1)
      event.accepted = true
      return
    }
    if (mapView && text === "0") {
      resetMapView()
      event.accepted = true
      return
    }

    var lineStep = Style.space(48)
    // Shift+↑/↓ change the wind map's height while it is shown;
    // ahead of ↑/↓, which scroll the view whatever Shift says.
    if (windShown && (event.modifiers & Qt.ShiftModifier)
        && (event.key === Qt.Key_Up || event.key === Qt.Key_Down)) {
      stepWindLevel(event.key === Qt.Key_Up ? 1 : -1)
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Down || text === "j") {
      scrollWeatherBy(lineStep)
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Up || text === "k") {
      scrollWeatherBy(-lineStep)
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_PageDown || event.key === Qt.Key_PageUp) {
      scrollWeatherBy((event.key === Qt.Key_PageDown ? 1 : -1) * weatherScroll.height * 0.9)
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Home || event.key === Qt.Key_End) {
      scrollWeatherBy(event.key === Qt.Key_Home ? -weatherScroll.contentHeight : weatherScroll.contentHeight)
      event.accepted = true
      return
    }

    // Shift+←/→ move the hour cursor; Backspace returns to now.
    if ((event.modifiers & Qt.ShiftModifier) && (event.key === Qt.Key_Left || event.key === Qt.Key_Right)) {
      moveHourCursor(event.key === Qt.Key_Right ? 1 : -1)
      event.accepted = true
      return
    }
    if (event.key === Qt.Key_Backspace && hourCursor >= 0) {
      hourCursor = -1
      event.accepted = true
      return
    }

    var leftKey = event.key === Qt.Key_Left || text === "h"
    var rightKey = event.key === Qt.Key_Right || text === "l"
    var radarView = radarShown && radarFrames.length > 0
    if (leftKey || rightKey) {
      if (radarView) {
        if (rightKey) stepRadarForward()
        else stepRadarBackward()
      } else {
        scrollDailyBy(rightKey ? 1 : -1)
      }
      event.accepted = true
      return
    }
    if (radarView && event.key === Qt.Key_Space) {
      toggleRadarPlayback()
      event.accepted = true
    }
  }

  function commitLocation() {
    var location = Model.locationCommit(locationField.text, locationSuggestions, suggestionIndex)
    if (location.name === "") {
      clearLocation()
      return
    }
    savingLocation = true
    savingLocationQueryStarted = false
    configuredLocationState = {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }
    persistLocation(location.name, location.latitude, location.longitude)
  }

  function clearLocation() {
    persistLocation("", null, null)
    placeName = ""
    cancelEditingLocation()
  }

  // Clicking the location pin (as opposed to the name, which opens manual
  // search): drop the pinned coordinates and go back to auto-detection —
  // the closest thing to "this computer's location" available here, since
  // there's no GeoClue/GPS service running on this machine. Auto-detection
  // itself happens in placeLookup.refreshPlace(): an empty locationQuery asks IP
  // geolocation services for the caller's location, and that response feeds
  // refreshDailyForecast with real coordinates.
  // clearLocation() alone only clears the saved pin and waits for the next
  // scheduled refresh (up to refreshMinutes away); calling refresh() here
  // too forces that lookup to happen right away, like open() does.
  function useDetectedLocation() {
    // Mirror pickSuggestion, not clearLocation: setting savingLocation is
    // what makes locationSaveProc.onExited force-kill and restart any
    // fetch already in flight for the location we're leaving. Without it
    // (clearLocation's plain path) a request already in flight for the old
    // location can complete after us and stomp this change with its now-
    // stale result — that's why the pin previously appeared to do nothing.
    savingLocation = true
    savingLocationQueryStarted = false
    configuredLocationState = { name: "", latitude: null, longitude: null }
    placeName = ""
    persistLocation("", null, null)
  }

  function pickSuggestion(suggestion) {
    if (!suggestion) return
    savingLocation = true
    savingLocationQueryStarted = false
    configuredLocationState = {
      name: suggestion.name,
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    }
    persistLocation(suggestion.name, suggestion.latitude, suggestion.longitude)
  }

  function toggleSavedLocations() {
    root.showSavedLocations = !root.showSavedLocations
    if (root.showSavedLocations && root.editingLocation) root.cancelEditingLocation()
  }

  // ---- My places: the favourites with their weather, one row each. The
  //      active place reads the live values, the others the background
  //      forecasts of WeatherSavedLocationCache (shared through the cache
  //      file, so the app shows what the bar instance fetched).
  readonly property bool showFavoritesSection: displaySetting("showFavorites", true) && savedLocations.length > 0
  // Either view shows the section: the bar instance then renews the
  // favourites' forecasts every half hour instead of every six hours.
  readonly property bool favoritesWanted: savedLocations.length > 0
    && (optionValue(appDisplayOptions, "app", "showFavorites", true)
      || optionValue(widgetDisplayOptions, "widget", "showFavorites", true))
  readonly property int activeFavoriteIndex: savedLocationIndexFor(configuredLocationState)
  // A saved place's weather for now: read from its stored hourly forecast,
  // between the hours, so a row keeps up with the clock between fetches
  // instead of showing the value of the fetch (on a summer evening the
  // temperature falls several degrees an hour). The stored current values
  // fill in where the forecast has no hour for now.
  function favoriteValuesNow(snapshot) {
    var stored = snapshot.current || {}
    var hourly = snapshot.hourly || []
    var now = relativeTimeNowMs
    function at(key) {
      var found = Model.hourlyValueAt(hourly, now, key)
      return found ? found : null
    }
    var temperature = at("tempC")
    if (!temperature) return snapshot.current || null
    var feels = at("feelsLikeC")
    var wind = at("windSpeedKmph")
    var humidity = at("humidity")
    function fahrenheit(c) { return String(Math.round(c * 1.8 + 32)) }
    return {
      temp_C: String(Math.round(temperature.value)),
      temp_F: fahrenheit(temperature.value),
      FeelsLikeC: feels ? String(Math.round(feels.value)) : stored.FeelsLikeC,
      FeelsLikeF: feels ? fahrenheit(feels.value) : stored.FeelsLikeF,
      windspeedKmph: wind ? String(Math.round(wind.value)) : stored.windspeedKmph,
      humidity: humidity ? String(Math.round(humidity.value)) : stored.humidity,
      symbol: Model.hourlyIcon(temperature.row)
    }
  }

  readonly property var favoriteRows: {
    var rows = []
    var entries = weatherDataCache && weatherDataCache.entries ? weatherDataCache.entries : ({})
    var staleBefore = relativeTimeNowMs - 60 * 60 * 1000
    for (var i = 0; i < savedLocations.length; ++i) {
      var place = savedLocations[i]
      var active = i === activeFavoriteIndex
      var entry = entries[Model.weatherCacheKey(place.name, place.latitude, place.longitude)]
      var snapshot = entry && entry.snapshot ? entry.snapshot : null
      var values = active ? current : (snapshot ? favoriteValuesNow(snapshot) : null)
      var updatedAt = active ? displayedUpdateMs : Number(entry && entry.updatedAt || 0)
      rows.push({
        index: i,
        name: String(place.name || ""),
        temperatureC: values ? values.temp_C : "",
        active: active,
        symbol: active ? displayLabel : (values && values.symbol || String(snapshot && snapshot.label || "")),
        temperature: values ? Model.tempNumber(values.temp_C, values.temp_F, tempScale) : "",
        feelsLike: values ? Model.tempWithUnit(values.FeelsLikeC, values.FeelsLikeF, tempScale) : "",
        wind: values ? windText(values.windspeedKmph, useImperial) : "",
        humidity: values && values.humidity !== undefined && values.humidity !== "" ? localizedNumber(values.humidity) + "%" : "",
        latitude: Number(place.latitude),
        longitude: Number(place.longitude),
        moonMirrored: Model.moonMirroredAt(place.latitude),
        stale: !active && (!updatedAt || updatedAt < staleBefore)
      })
    }
    return rows
  }

  // A favourite becomes the shown place, with the current weather in view.
  function showFavorite(index) {
    if (index < 0 || index >= savedLocations.length) return
    if (index !== activeFavoriteIndex) selectSavedLocation(savedLocations[index])
    root.defer(function() { root.scrollHeroIntoView() })
  }

  // The tab strip (WeatherTabs), for scrolling it into view.
  property Item tabsItem: null

  function showTab(name) {
    if (displayTabs.indexOf(String(name)) < 0) return
    activeTab = String(name)
    // The strip at the top of the view, with as much of the tab as fits.
    root.defer(function() {
      if (!tabsItem) return
      var top = tabsItem.mapToItem(weatherColumn, 0, 0).y
      var maximum = Math.max(0, weatherScroll.contentHeight - weatherScroll.height)
      weatherScroll.contentY = Math.max(0, Math.min(maximum, top))
    })
  }

  function stepFavorite(delta) {
    var count = savedLocations.length
    if (!count) return
    var from = activeFavoriteIndex
    showFavorite(from < 0 ? (delta > 0 ? 0 : count - 1) : (from + delta + count) % count)
  }

  // Row click (not the remove button): switch active location like a
  // search pick, then close the dropdown.
  function selectSavedLocation(entry) {
    if (!entry) return
    root.pickSuggestion(entry)  // identical {name, latitude, longitude} shape — reuse verbatim
    root.showSavedLocations = false
  }

  // Remove button: edits the saved list only, never configuredLocationState
  // — removing the location you're currently viewing must not change what's
  // displayed, it just stops being bookmarked.
  function removeSavedLocation(index) {
    root.savedLocations = Model.removeSavedLocationAt(root.savedLocations, index)
    savedLocationsFile.setText(JSON.stringify(root.savedLocations, null, 2) + "\n")
    if (root.editingLocation) {
      if (root.savedLocations.length > 0) {
        root.searchFocusSection = "saved"
        root.savedLocationIndex = 0
      } else {
        root.searchFocusSection = "suggestions"
        root.savedLocationIndex = 0
        root.focusCityNameField()
      }
    }
  }

  // "+" on a suggestion row: add without switching the active location and
  // without closing the search.
  function addSavedLocation(entry) {
    root.savedLocations = Model.addSavedLocation(root.savedLocations, entry)
    savedLocationsFile.setText(JSON.stringify(root.savedLocations, null, 2) + "\n")
    if (root.editingLocation && entry) {
      var savedIndex = root.savedLocationIndexFor(entry)
      if (savedIndex >= 0) {
        root.searchFocusSection = "saved"
        root.savedLocationIndex = savedIndex
      }
    }
    savedLocationCache.savedCacheSchedule.restart()
  }

  // A display setting of the view shown (the app or the popup), as the
  // settings would set it.
  function setViewDisplaySetting(key, value) {
    var surface = settingsTargetSurface
    settingsTargetSurface = standaloneMode ? "app" : "widget"
    displayOptionsStore.setSettingsDisplaySetting(key, value)
    settingsTargetSurface = surface
  }

  // The settings' keyboard cursor (for the screenshot run's checks).
  readonly property string settingsFocusId: settingsLoader.item ? settingsLoader.item.focusId : ""

  // The whole saved list at once (the import of More Time's cities).
  function replaceSavedLocations(list) {
    root.savedLocations = list
    savedLocationsFile.setText(JSON.stringify(root.savedLocations, null, 2) + "\n")
    savedLocationCache.savedCacheSchedule.restart()
  }

  function finishSavingLocation() {
    if (savingLocation && savingLocationQueryStarted) cancelEditingLocation()
  }

  function persistLocation(name, latitude, longitude) {
    if (name && latitude !== null && longitude !== null)
      locationSaveProc.command = ["omarchy-weather-location", "--set", name, latitude + "," + longitude]
    else if (name)
      locationSaveProc.command = ["omarchy-weather-location", "--set", name]
    else
      locationSaveProc.command = ["omarchy-weather-location", "--clear"]
    locationSaveProc.running = true
  }

  function dayName(dateString, short) {
    return Model.dayName(dateString, function(date) {
      var weekday = date.getDay()
      return interfaceLocale.dayName(weekday === 0 ? 7 : weekday,
        short ? Locale.ShortFormat : Locale.LongFormat)
    })
  }

  function dailyDayName(dateString, short) {
    var date = String(dateString || "").slice(0, 10)
    if (date === todayDate) return i18n("today")
    return dayName(dateString, short)
  }

  // Bare degree value (no unit letter), used in the forecast row.
  function bareTempForDay(day, kind) {
    return Model.bareTempForDay(day, kind, tempScale)
  }

  // Representative icon for a forecast day: the hourly entry nearest noon.
  function dayIcon(day) {
    return Model.dayIcon(day)
  }

  function hourlyTemp(hour) {
    return Model.hourlyTemp(hour, tempScale)
  }

  function hourlyIcon(hour) {
    return Model.hourlyIcon(hour)
  }

  function hourlyTime(hour) {
    return hour && hour.time ? String(hour.time).slice(11, 16) : ""
  }

  function forecastWind(entry) {
    return entry ? (windText(entry.windSpeedKmph, useImperial) || "–") : "–"
  }

  // Wind in the unit chosen under Settings → General (Model.windValue).
  function windUnitFor(imperial) {
    return Model.windUnitFor(generalSetting("windUnit", "auto"), imperial)
  }
  function windText(kmh, imperial) {
    var wind = Model.windValue(kmh, windUnitFor(imperial))
    if (!wind) return ""
    return wind.unit === "Bft" ? "Bft " + localizedNumber(wind.value) : localizedNumber(wind.value) + " " + wind.unit
  }

  function forecastEventTime(value) {
    var timestamp = String(value || "")
    return timestamp.length >= 16 ? timestamp.slice(11, 16) : "–"
  }

  // The sun event a day still has ahead of it: sunrise before dawn, sunset
  // during the day, and the next day's sunrise once the sun has set. Days
  // after today always start with their sunrise.
  // True while the sun is below the horizon at the place.
  readonly property bool isNightNow: {
    if (!todayForecast || !todayForecast.sunrise || !todayForecast.sunset) return false
    var now = nowDate.getTime()
    return now < new Date(todayForecast.sunrise).getTime()
      || now > new Date(todayForecast.sunset).getTime()
  }

  function sunEventWithinTheHour(value) {
    if (!value) return false
    var delta = new Date(value).getTime() - nowDate.getTime()
    return delta >= 0 && delta <= 3600000
  }

  function nextSunEvent(day, index) {
    if (!day) return null
    var now = nowDate
    var sunrise = day.sunrise ? new Date(day.sunrise) : null
    var sunset = day.sunset ? new Date(day.sunset) : null
    if (sunrise && now < sunrise) return { rising: true, time: day.sunrise }
    if (sunset && now < sunset) return { rising: false, time: day.sunset }
    var next = forecastDays.length > index + 1 ? forecastDays[index + 1] : null
    if (next && next.sunrise) return { rising: true, time: next.sunrise }
    return sunset ? { rising: false, time: day.sunset } : null
  }

  function paintSunEventIcon(canvas, rising) {
    var ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = canvas.iconColor
    ctx.lineWidth = canvas.bold === true ? 2 : 1.2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    var centerX = canvas.width / 2
    var baselineY = canvas.height - 1
    var tipY = rising ? 1 : baselineY - 0.5
    var farY = rising ? baselineY - 0.5 : 1
    var arrowWing = 2.25
    ctx.beginPath()
    ctx.moveTo(1, baselineY)
    ctx.lineTo(canvas.width - 1, baselineY)
    ctx.moveTo(centerX, farY)
    ctx.lineTo(centerX, tipY)
    ctx.moveTo(centerX, tipY)
    ctx.lineTo(centerX - arrowWing, rising ? tipY + arrowWing : tipY - arrowWing)
    ctx.moveTo(centerX, tipY)
    ctx.lineTo(centerX + arrowWing, rising ? tipY + arrowWing : tipY - arrowWing)
    ctx.stroke()
  }

  function nowcastTime(point) {
    var timestamp = point ? (point.time || point.timestamp || "") : ""
    return timestamp ? String(timestamp).slice(11, 16) : ""
  }

  function windDirectionName(degrees) {
    var names = I18n.directionNames(interfaceLanguage)
    var value = Number(degrees)
    if (isNaN(value)) return "–"
    return names[Math.round(((value % 360) + 360) % 360 / 45) % 8]
  }

  function radarReferenceTime(frame) {
    var parts = String(frame && frame.source || "").split("::")
    if (parts.length < 3) return ""
    var reference = new Date(parts[parts.length - 1])
    return isNaN(reference.getTime()) ? "" : reference.toISOString()
  }

  // ---- Wheel and touchpad on the page.
  // Omarchy scales touchpad scrolling down to 0.4 (browsers add their own
  // acceleration on top), which made the view crawl; pixel deltas are scaled
  // back up here. A mouse wheel scrolls a fixed step per notch.
  readonly property real touchpadScrollFactor: 2.5
  function wheelPixels(wheel, horizontal) {
    var pixels = horizontal ? wheel.pixelDelta.x : wheel.pixelDelta.y
    if (pixels !== 0) return pixels * touchpadScrollFactor
    var angle = horizontal ? wheel.angleDelta.x : wheel.angleDelta.y
    return angle / 120 * Style.space(60)
  }
  // Areas inside the page that take the wheel themselves (the daily strip,
  // maps, the radar timeline, long warnings). Each has wheelEnabled,
  // wantsWheel(wheel) and takeWheel(wheel, point), and may have
  // declineWheel(wheel) to hint at what it wants instead. A plain vertical
  // wheel belongs to the page: the strip and the timeline take sideways
  // scrolling or Shift, the maps Ctrl, a warning only while it can scroll.
  function wheelIsSideways(wheel) {
    if (wheel.modifiers & Qt.ShiftModifier) return true
    if (wheel.pixelDelta.x !== 0 || wheel.pixelDelta.y !== 0)
      return Math.abs(wheel.pixelDelta.x) > Math.abs(wheel.pixelDelta.y)
    return Math.abs(wheel.angleDelta.x) > Math.abs(wheel.angleDelta.y)
  }
  // Sideways distance of a wheel step: Shift turns a vertical wheel sideways.
  function wheelSidewaysPixels(wheel) {
    var sideways = wheelPixels(wheel, true)
    return sideways !== 0 ? sideways : wheelPixels(wheel, false)
  }
  property var wheelAreas: []
  function registerWheelArea(item) {
    if (wheelAreas.indexOf(item) < 0) wheelAreas = wheelAreas.concat([item])
  }
  function unregisterWheelArea(item) {
    wheelAreas = wheelAreas.filter(function(area) { return area !== item })
  }
  // Scroll latching, as in browsers: a gesture stays with what it began on
  // (the page, or an area) until it pauses, so scrolling the page across the
  // daily strip or a map keeps scrolling the page.
  property var wheelLatch: null
  property double wheelLatchUntil: 0
  readonly property int wheelLatchMs: 450
  function routeWheel(wheel, source, scroller) {
    var now = Date.now()
    // Ctrl or Shift says what the wheel is meant for: it ends the latch.
    var aimed = (wheel.modifiers & (Qt.ControlModifier | Qt.ShiftModifier)) !== 0
    var target = now < wheelLatchUntil && !aimed ? wheelLatch : null
    if (target && target !== scroller && (!target.visible || wheelAreas.indexOf(target) < 0)) target = null
    // A latched area whose terms no longer hold (Ctrl let go over a map, a
    // sideways swipe turned into an upward one) gives the scroll to the page.
    if (target && target !== scroller && target.wantsWheel && !target.wantsWheel(wheel)) target = scroller
    if (!target) {
      target = scroller
      for (var i = wheelAreas.length - 1; i >= 0; --i) {
        var area = wheelAreas[i]
        if (!area.visible || !area.wheelEnabled) continue
        var local = area.mapFromItem(source, wheel.x, wheel.y)
        if (local.x < 0 || local.y < 0 || local.x > area.width || local.y > area.height) continue
        if (area.wantsWheel && !area.wantsWheel(wheel)) {
          if (area.declineWheel) area.declineWheel(wheel)
          break
        }
        target = area
        break
      }
    }
    wheelLatch = target
    wheelLatchUntil = now + wheelLatchMs
    if (target === scroller) {
      var maximum = Math.max(0, scroller.contentHeight - scroller.height)
      scroller.contentY = Math.max(0, Math.min(maximum, scroller.contentY - wheelPixels(wheel, false)))
    } else if (target.takeWheel(wheel, target.mapFromItem(source, wheel.x, wheel.y)) === false) {
      // An area at its end hands the scroll on to the page.
      wheelLatch = scroller
      var limit = Math.max(0, scroller.contentHeight - scroller.height)
      scroller.contentY = Math.max(0, Math.min(limit, scroller.contentY - wheelPixels(wheel, false)))
    }
  }

  // Just before the map view moves or zooms: the maps keep their current
  // pictures on screen until the new ones are in (WeatherStalePicture).
  signal mapViewAboutToMove()

  function changeMapZoom(delta) {
    var nextLevel = Math.max(mapMinimumZoom,
      Math.min(mapMaximumZoom, mapZoomLevel + delta))
    if (nextLevel === mapZoomLevel) return
    mapViewAboutToMove()
    mapZoomLevel = nextLevel
  }

  // Moves the view by a drag of dx, dy view pixels on a map drawn with
  // `viewport` (Model.mapViewport).
  function panMap(dx, dy, viewport, quiet) {
    if (!viewport || !(viewport.renderedWidth > 0) || !(viewport.renderedHeight > 0)) return
    if (!quiet) mapViewAboutToMove()
    var lon = mapPanLongitude - dx / viewport.renderedWidth * (mapEast - mapWest)
    var lat = mapPanLatitude + dy / viewport.renderedHeight * (mapNorth - mapSouth)
    mapPanLongitude = ((lon + 540) % 360) - 180
    mapPanLatitude = Math.max(-80 - mapCenterLatitude, Math.min(80 - mapCenterLatitude, lat))
  }

  // Moves the view by fractions of its width (east) and height (north).
  function panMapBy(east, north) {
    mapViewAboutToMove()
    var lon = mapPanLongitude + east * (mapEast - mapWest)
    var lat = mapPanLatitude + north * (mapNorth - mapSouth)
    mapPanLongitude = ((lon + 540) % 360) - 180
    mapPanLatitude = Math.max(-80 - mapCenterLatitude, Math.min(80 - mapCenterLatitude, lat))
  }

  // Zooms by `delta` levels keeping the point dx, dy pixels from the view's
  // centre where it is (the mouse wheel zooms towards the pointer).
  function zoomMapAt(delta, dx, dy, viewport) {
    var nextLevel = Math.max(mapMinimumZoom, Math.min(mapMaximumZoom, mapZoomLevel + delta))
    if (nextLevel === mapZoomLevel || !viewport) return
    var keep = 1 - Math.pow(1.5, mapZoomLevel - nextLevel)
    mapViewAboutToMove()
    panMap(-dx * keep, -dy * keep, viewport, true)
    mapZoomLevel = nextLevel
  }

  function resetMapView() {
    if (!mapPanned && mapZoomLevel === defaultMapZoomLevel) return
    mapViewAboutToMove()
    mapPanLatitude = 0
    mapPanLongitude = 0
    mapZoomLevel = defaultMapZoomLevel
  }

  // Height of the radar and wind maps: the picture's own proportions where
  // the view is narrow (the popup), taller maps in a wide window up to a cap,
  // beyond which the picture is cropped top and bottom.
  function mapViewHeight(viewWidth) {
    return Math.round(Math.max(Style.space(230),
      Math.min(Style.space(400), viewWidth * mapImageHeight / mapImageWidth)))
  }

  function mapScaleDistanceKm(targetPixels, mapWidthPixels) {
    // Keep the initial scale label deterministic across the popup and the
    // wider standalone window: 20 km over the ±100 km default extent, with a
    // clean 10 mi as the imperial counterpart.
    var kilometersPerPixel = mapRadiusKm * 2 / Math.max(1, mapWidthPixels)
    // The fixed label only applies while its bar still fits the scale box;
    // wider maps at the default zoom would otherwise overflow it.
    var fixedKilometers = useImperial ? 10 / 0.621371 : 20
    if (mapZoomLevel === defaultMapZoomLevel && fixedKilometers / kilometersPerPixel <= targetPixels * 1.1)
      return fixedKilometers
    var rawKilometers = kilometersPerPixel * targetPixels
    var rawDisplayDistance = useImperial ? Model.kilometersToMiles(rawKilometers) : rawKilometers
    if (!(rawDisplayDistance > 0)) return 0
    var magnitude = Math.pow(10, Math.floor(Math.log(rawDisplayDistance) / Math.LN10))
    var normalized = rawDisplayDistance / magnitude
    var step = normalized >= 5 ? 5 : (normalized >= 2 ? 2 : 1)
    var displayDistance = step * magnitude
    return useImperial ? displayDistance / 0.621371 : displayDistance
  }

  function radarFrameUrl(frame) {
    if (!mapExtentKnown) return ""
    if (frame && frame.wmsProvider)
      return Providers.radarMapUrl(frame.wmsProvider, root.mapBbox, mapImageWidth, mapImageHeight, frame.timestamp)
    if (frame && frame.rainViewer) {
      // RainViewer's coordinate-tile form is explicitly intended for small
      // embedded maps. Its maximum supported zoom is 7; the view draws the
      // tile at its own scale (Model.rainViewerTile).
      var zoom = Model.rainViewerTile(root.mapRadiusKm, root.mapViewLatitude).zoom
      return String(frame.rainViewerHost || "") + String(frame.rainViewerPath || "")
        + "/512/" + zoom
        + "/" + Number(root.mapViewLatitude).toFixed(5)
        + "/" + Number(root.mapViewLongitude).toFixed(5)
        + "/2/1_1.png"
    }
    var url = "https://maps.dwd.de/geoserver/dwd/ows?service=WMS&version=1.1.1&request=GetMap"
      // The radar layer alone (about 20 KB instead of 150 KB with the basemap
      // burnt in) over the basemap picture every frame shares.
      + "&layers=dwd:Niederschlagsradar&styles="
      + "&bbox=" + root.mapBbox + "&width=" + mapImageWidth + "&height=" + mapImageHeight + "&srs=EPSG:4326"
      + "&format=image/png&transparent=true"
    if (!frame || !frame.timestamp) return url
    var frameTime = new Date(frame.timestamp)
    if (isNaN(frameTime.getTime())) return url
    // GeoServer advertises the RV dimension in UTC. Bright Sky returns the
    // same instant with a local offset, which must be normalized before it
    // can be used as an exact WMS time key.
    url += "&time=" + encodeURIComponent(frameTime.toISOString())
    var referenceTime = radarReferenceTime(frame)
    if (referenceTime !== "") url += "&DIM_REFERENCE_TIME=" + encodeURIComponent(referenceTime)
    return url
  }

  function radarFrameClock(frame) {
    if (!frame || !frame.timestamp) return i18n("current")
    var date = new Date(frame.timestamp)
    return isNaN(date.getTime()) ? i18n("current") : placeClock(date)
  }

  function radarFrameLead(index) {
    if (!radarFrames.length || index < 0 || index >= radarFrames.length) return ""
    if (radarFrames[index].rainViewer || radarFrames[index].wmsProvider) {
      var observed = new Date(radarFrames[index].timestamp).getTime()
      if (isNaN(observed)) return ""
      var ageMinutes = Math.round((observed - Date.now()) / 60000)
      if (Math.abs(ageMinutes) < 10) return i18n("now")
      if (ageMinutes < 0) return "−" + Math.abs(ageMinutes) + " min"
      return "+" + ageMinutes + " min"
    }
    // Counted from the frame for now, not from the start of the fetched
    // nowcast, which may lie in the past.
    var first = new Date(radarFrames[Math.min(radarFirstFrameIndex, radarFrames.length - 1)].timestamp).getTime()
    var current = new Date(radarFrames[index].timestamp).getTime()
    if (isNaN(first) || isNaN(current)) return ""
    var minutes = Math.max(0, Math.round((current - first) / 60000))
    if (minutes === 0) return i18n("now")
    if (minutes < 60) return "+" + minutes + " min"
    var remaining = minutes % 60
    return "+" + Math.floor(minutes / 60) + " h" + (remaining ? " " + remaining + " min" : "")
  }

  function toggleRadarPlayback() {
    if (radarPlayableFrameCount < 2) return
    radarUserNavigated = true
    if (!radarPlaying && radarFrameIndex >= radarFrames.length - 1) selectRadarFrame(radarFirstFrameIndex)
    radarPlaying = !radarPlaying
    renewRadarOnInteraction()
  }

  function nextRadarFrameIndex() {
    return radarFrameIndex + 1 < radarFrames.length ? radarFrameIndex + 1
      : radarFirstFrameIndexFor(radarFrames, nowDate)
  }

  function updateRadarFrameReady(index, ready) {
    if (index < 0 || index >= radarFrames.length) return
    var states = radarFrameReady.slice(0)
    states[index] = ready
    radarFrameReady = states
    if (ready && index === radarFrameIndex) {
      radarDisplayedFrameIndex = index
      radarHasDisplayedFrame = true
    }
  }

  function updateRadarFrameStatus(index, status, frame) {
    if (status === Image.Error) {
      // Deferred for the same reason as pendingRadarFrameStatus: the
      // fallback replaces the frames of the Repeater that reported.
      root.defer(function() { root.noteRadarFrameError(frame) })
      return
    }
    updateRadarFrameReady(index, status === Image.Ready)
  }

  function noteRadarFrameError(frame) {
    if (frame && frame.wmsProvider) {
      regionalRadarFailed = true
      console.warn("more-weather: regional radar image failed, falling back:", frame.wmsProvider)
    } else if (radarActiveProviderId === "dwd") {
      regionalRadarFailed = true
      console.warn("more-weather: DWD radar image failed, falling back to RainViewer")
    } else if (frame && frame.rainViewer) {
      rainViewerFailed = true
      console.warn("more-weather: RainViewer image failed, using model precipitation fallback")
    }
  }

  function selectRadarFrame(index) {
    if (!radarFrames.length) return
    // Wraps within the frames that are shown (from radarFirstFrameIndex,
    // computed here since the binding may lag behind a new timeline).
    var first = Math.min(radarFirstFrameIndexFor(radarFrames, nowDate), radarFrames.length - 1)
    var count = radarFrames.length - first
    var target = first + ((index - first) % count + count) % count
    radarFrameIndex = target
    radarSelectedTimestamp = String(radarFrames[target].timestamp || "")
    // All frames load in parallel and remain as Image instances. If a user
    // reaches one unusually early, retain the previous image until it is
    // ready instead of flashing a loading card between two frames.
    if (radarFrameReady[target]) {
      radarDisplayedFrameIndex = target
      radarHasDisplayedFrame = true
    }
  }

  function stepRadarBackward() {
    if (!radarFrames.length) return
    radarPlaying = false
    radarUserNavigated = true
    selectRadarFrame(radarFrameIndex - 1)
    renewRadarOnInteraction()
  }

  // A frame picked on the timeline under the map: stops playback there.
  function scrubRadarFrame(index) {
    if (!radarFrames.length) return
    radarPlaying = false
    radarUserNavigated = true
    selectRadarFrame(index)
    renewRadarOnInteraction()
  }

  function stepRadarForward() {
    if (!radarFrames.length) return
    radarPlaying = false
    radarUserNavigated = true
    selectRadarFrame(radarFrameIndex + 1)
    renewRadarOnInteraction()
  }

  // With configured coordinates this fetch is the only thing that updates the
  // bar icon, so a dropped response (e.g. waking before the network is back)
  // gets one quick retry before the independent MET Norway adapter takes over.
  function scheduleDailyForecastRetry() {
    if (dailyForecastRetries < 1) {
      dailyForecastRetries++
    } else if (forecastProviderIndex + 1 < forecastProviderChain.length) {
      forecastProviderIndex++
      dailyForecastRetries = 0
    } else {
      console.warn("more-weather: all forecast providers failed; retaining last good data")
      root.recordForecastRefreshFailure()
      return
    }
    dailyForecastRetryTimer.restart()
  }

  Timer {
    id: dailyForecastRetryTimer
    interval: 1200
    onTriggered: root.startForecastProvider(root.forecastProviderIndex)
  }

  Timer {
    id: alertFallbackTimer
    interval: 250
    onTriggered: {
      if (alertProc.running) {
        restart()
        return
      }
      var target = root.pendingAlertProviderIndex
      root.pendingAlertProviderIndex = -1
      if (target >= 0) root.startAlertProvider(target)
    }
  }

  // Radar (unlike the forecast above) had no retry at all: a single
  // dropped or rate-limited Bright Sky response left radarReport frozen on
  // whatever it last held until the next full refreshMinutes cycle, up to
  // 15 minutes later — silently, since the old catch swallowed failures.
  // That produced a stale rainBadgeText/isCurrentlyRaining reading with no
  // trace in the log to explain it.
  function scheduleRadarRetry() {
    if (radarRetries >= 3) return
    radarRetries++
    radarRetryTimer.restart()
  }

  Timer {
    id: radarRetryTimer
    interval: 2500
    onTriggered: if (!radarProc.running) radarProc.running = true
  }

  Timer {
    id: weatherCachePersistTimer
    interval: 350
    onTriggered: root.persistActiveWeatherSnapshot()
  }

  WeatherRequest {
    id: dailyForecastProc
    onFinished: function(text) {
      var raw = String(text || "").trim()
      if (!raw) {
        if (root.forecastRequestProviderId === "open-meteo"
            && root.noteOpenMeteoResponse(dailyForecastProc))
          root.dailyForecastRetries = 1
        root.scheduleDailyForecastRetry()
        return
      }
      try {
        var response = JSON.parse(raw)
        // In Switzerland the answer holds MeteoSwiss ICON-CH and Best Match
        // side by side (Providers.openMeteoForecastUrl).
        if (root.forecastRequestProviderId === "open-meteo" && Providers.usesMeteoSwiss(root.providerCountry))
          response = Model.mergedModelForecast(response, "meteoswiss_icon_seamless", "best_match", "meteoswiss")
        var parsed = root.forecastRequestProviderId === "met-no"
          ? Model.metNoToOpenMeteo(response) : Model.withPlaceOffsets(response)
        if (!parsed || !parsed.current || !parsed.daily || !parsed.hourly)
          throw new Error("incomplete forecast response")
        parsed._providerId = root.forecastRequestProviderId
        root.dailyForecastReport = parsed
        root.forecastProviderId = root.forecastRequestProviderId
        console.info("more-weather: forecast provider active:", root.forecastProviderId)
        root.recordForecastRefreshSuccess(Date.now())
        root.dailyForecastRetries = 0
        root.scheduleWeatherCachePersist()
        if (Model.weatherResponseCompletesSave(root.hasConfiguredCoordinates, root.forecastRequestProviderId))
          root.finishSavingLocation()
      } catch (e) {
        // Keep last-good daily forecast visible, but try again shortly.
        root.scheduleDailyForecastRetry()
      }
    }
  }

  WeatherRequest {
    id: mosmixProc
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        if (!parsed.weather || !parsed.weather.length) return
        root.mosmixReport = parsed
        root.scheduleWeatherCachePersist()
      } catch (e) { }
    }
  }

  // Yesterday's hourly temperatures (Model.yesterdayTemperatureChange).
  property var yesterdayReport: null
  WeatherRequest {
    id: yesterdayProc
    onExited: function(exitCode) { if (exitCode !== 0) root.noteOpenMeteoResponse(yesterdayProc) }
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        if (parsed.hourly && parsed.hourly.temperature_2m) root.yesterdayReport = parsed
      } catch (e) { }
    }
  }

  WeatherRequest {
    id: uvProc
    onExited: function(exitCode) { if (exitCode !== 0) root.noteOpenMeteoResponse(uvProc) }
    onFinished: function(text) {
      try {
        var parsed = Model.withPlaceOffsets(JSON.parse(String(text || "")))
        if (parsed.daily && parsed.daily.uv_index_max) {
          root.uvReport = parsed
          root.scheduleWeatherCachePersist()
        }
      } catch (e) { }
    }
  }

  WeatherRequest {
    id: radarMotionProc
    // A failed request keeps the last drift; rainDriftAt ignores steps that
    // no longer match the frame on screen and falls back to the model wind.
    onFinished: function(text) {
      var raw = String(text || "").trim()
      if (!raw) return
      radarMotionWorker.sendMessage({
        token: root.radarMotionRequestToken,
        at: root.radarMotionRequestAtMs,
        text: raw
      })
    }
  }

  WorkerScript {
    id: radarMotionWorker
    source: "RadarMotionWorker.mjs"
    onMessage: function(message) {
      // A result for a location the user has since left is dropped.
      if (message.token !== root.locationQuery) return
      if (!message.motion) {
        console.warn("more-weather: radar motion response unreadable")
        return
      }
      root.radarMotion = message.motion
      root.radarWet = message.wet
      root.radarMotionAtMs = Number(message.at) || Date.now()
      root.sharedLive.publishSharedRadar()
      console.info("more-weather: radar drift tracked for", message.motion.length, "of 8 steps")
      root.scheduleWeatherCachePersist()
    }
  }

  WeatherRequest {
    id: radarProc
    onFinished: function(text) {
      var raw = String(text || "").trim()
      if (!raw) {
        root.scheduleRadarRetry()
        return
      }
      try {
        var parsed = JSON.parse(raw)
        if (parsed.radar && parsed.radar.length) {
          root.radarReport = parsed
          root.radarFetchedAtMs = Date.now()
          root.sharedLive.publishSharedRadar()
          root.radarRetries = 0
          root.regionalRadarFailed = false
          root.scheduleWeatherCachePersist()
        } else {
          root.scheduleRadarRetry()
        }
      } catch (e) {
        root.scheduleRadarRetry()
      }
    }
  }

  WeatherRequest {
    id: rainViewerProc
    onExited: function(exitCode) {
      if (exitCode !== 0 || !root.rainViewerResponseAccepted) {
        // A last-good catalogue remains usable until its timestamps age out.
        // Only suppress RainViewer when no valid frames remain.
        if (!root.rainViewerFrames.length) root.rainViewerFailed = true
      }
    }
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        if (parsed.host && parsed.radar && parsed.radar.past) {
          root.rainViewerReport = parsed
          root.rainViewerResponseAccepted = true
          root.rainViewerFailed = false
        }
      } catch (e) { }
    }
  }

  WeatherRequest {
    id: regionalRadarTimelineProc
    onExited: function(exitCode) {
      if (exitCode !== 0 || !root.regionalRadarResponseAccepted) {
        root.regionalRadarFailed = true
        console.warn("more-weather: regional radar provider failed:", root.regionalRadarProviderId, exitCode)
      }
    }
    onFinished: function(text) {
      var frames = Model.wmsRadarTimeline(String(text || ""),
        root.regionalRadarProviderId, new Date(), 2)
      if (frames.length) {
        root.regionalRadarFrames = frames
        root.regionalRadarResponseAccepted = true
        root.regionalRadarFailed = false
        console.info("more-weather: regional radar provider active:", root.regionalRadarProviderId)
      }
    }
  }

  WeatherRequest {
    id: alertProc
    onExited: function(exitCode) {
      if (root.pendingAlertProviderIndex >= 0) {
        alertFallbackTimer.restart()
      } else if (exitCode !== 0 || !root.alertResponseAccepted) {
        console.warn("more-weather: warning provider failed:", root.alertProviderId, exitCode)
        root.advanceAlertProvider()
      }
    }
    onFinished: function(text) {
      var raw = String(text || "").trim()
      if (!raw) return
      try {
        var parsed = null
        if (root.alertProviderId === "nws")
          parsed = Model.nwsAlertReport(raw)
        else if (root.alertProviderId === "meteoalarm")
          parsed = Model.meteoAlarmAlertReport(raw,
            Model.placeAliases(root.placeReport, root.configuredLocation))
        else if (root.alertProviderId === "meteoalarm-api")
          parsed = Model.meteoAlarmApiAlertReport(raw,
            Model.placeAliases(root.placeReport, root.configuredLocation),
            I18n.serviceLanguage(root.interfaceLanguage))
        else if (root.alertProviderId === "eccc")
          parsed = Model.ecccAlertReport(raw, root.forecastRequestLatitude,
            root.forecastRequestLongitude, I18n.serviceLanguage(root.interfaceLanguage))
        else if (root.alertProviderId === "bom")
          parsed = Model.bomAlertReport(raw)
        else if (root.alertProviderId === "inmet")
          parsed = Model.inmetAlertReport(raw, root.forecastRequestLatitude, root.forecastRequestLongitude)
        else {
          var response = JSON.parse(raw)
          if (response && Array.isArray(response.alerts)) parsed = response
        }
        root.acceptAlertReport(parsed, root.alertProviderId)
      } catch (e) { }
    }
  }

  // Finding a place by name (shared with More Time): Open-Meteo, then
  // Nominatim. A pick is used like a click on its row.
  WeatherPlaceSearch {
    id: placeSearch
    panel: root
    onPicked: function(place) { root.pickSuggestion(root.suggestionForPlace(place)) }
  }

  Process {
    id: locationSaveProc
    onExited: function(exitCode) {
      if (exitCode !== 0 || !root.savingLocation) return

      // FileView handles changed locations. Explicitly refresh here too so
      // saving the already-active location cannot strand the spinner.
      locationFile.reload()
      if (!root.savingLocationQueryStarted) {
        root.savingLocationQueryStarted = true
        root.placeRetries = 0
        root.dailyForecastRetries = 0
        placeLookup.placeProc.running = false
        dailyForecastProc.running = false
        root.defer(root.refresh)
      }
    }
  }

  Timer {
    id: refreshTimer
    // Check against wall-clock time instead of relying on one long timer.
    // Long Qt timers may resume with their old remaining duration after the
    // machine wakes, leaving the weather stale for another full interval.
    interval: 60 * 1000
    running: true
    repeat: true
    triggeredOnStart: true
    onTriggered: root.refreshTick(false)
  }

  property Timer sharedStartupTimer: Timer {
    interval: 2500
    onTriggered: {
      root.refreshTick(true)
      windGridLoader.windGridDebounce.restart()
    }
  }

  // The other instance claimed this cycle; look again once its claim has
  // expired in case it never published.
  Timer {
    id: sharedClaimWaitTimer
    interval: root.sharedRefreshClaimMs + 1000
    onTriggered: root.refreshTick(true)
  }

  // Non-visual parts in their own files; each works through `panel`.
  property WeatherPlaceLookup placeLookup: WeatherPlaceLookup { panel: root }
  property WeatherNotifications notifications: WeatherNotifications { panel: root }
  property WeatherSavedLocationCache savedLocationCache: WeatherSavedLocationCache { panel: root }
  property WeatherWindGrid windGridLoader: WeatherWindGrid { panel: root }
  property WeatherImageStore mapImages: WeatherImageStore {}
  property WeatherMapPrefetch mapPrefetch: WeatherMapPrefetch { panel: root }
  property WeatherRadarPlaces radarPlaces: WeatherRadarPlaces { panel: root }
  property WeatherSharedLiveData sharedLive: WeatherSharedLiveData { panel: root }
  property WeatherDisplayOptionsStore displayOptionsStore: WeatherDisplayOptionsStore { panel: root }
  property WeatherSettingsTransfer settingsTransfer: WeatherSettingsTransfer { panel: root }
  property WeatherCityImport cityImport: WeatherCityImport { panel: root }
  property WeatherGlobeData globeData: WeatherGlobeData { panel: root }
  property WeatherAirQuality airQuality: WeatherAirQuality { panel: root }
  property WeatherRegionalNowcast regionalNowcast: WeatherRegionalNowcast { panel: root }
  property WeatherAlertLookup alertLookup: WeatherAlertLookup { panel: root }
  property WeatherAppLauncherEntry appLauncherEntry: WeatherAppLauncherEntry { panel: root }
  property WeatherBarPlacement barPlacement: WeatherBarPlacement { panel: root }

  IpcHandler {
    target: root.ipcTarget

    function open(): void { root.openFromHotkey() }
    function close(): void { root.close() }
    function show(): void { root.openFromHotkey() }
    function hide(): void { root.close() }
    function toggle(): void { root.toggle() }
    function edit(): void { root.openFromHotkey(); root.startEditingLocation() }
    function settings(): void { root.openFromHotkey(); root.openSettings() }
    function refresh(): void { root.manualRefresh() }
    // Favourites for global key bindings: the panel opens on the place.
    function favorite(index: int): void { root.openFromHotkey(); root.showFavorite(index - 1) }
    function nextFavorite(): void { root.openFromHotkey(); root.stepFavorite(1) }
    function previousFavorite(): void { root.openFromHotkey(); root.stepFavorite(-1) }
    // A tab by its section key (rain, radar, wind, favorites, ...), scrolled
    // into view; for global key bindings. The window is not brought forward.
    function tab(name: string): void { root.showTab(name) }
    function providerStatus(): string {
      return JSON.stringify({
        language: root.interfaceLanguage,
        locale: root.localeName,
        supportedLanguages: I18n.supportedLanguages().length,
        keyboardEditingLocation: root.editingLocation,
        keyboardSearchPristine: root.locationSearchPristine,
        keyboardSuggestionIndex: root.suggestionIndex,
        keyboardSuggestionCount: root.locationSuggestions.length,
        keyboardSearchText: locationField.text,
        keyboardSearchFocus: root.searchFocusSection,
        keyboardSavedLocationIndex: root.savedLocationIndex,
        keyboardSavedLocationCount: root.savedLocations.length,
        settingsOpen: root.settingsOpen,
        lastRefreshAttemptAt: root.lastRefreshAttemptMs,
        forecast: root.displayForecastProviderId,
        radarPreferred: root.preferredRadarProviderId || "rainviewer",
        radarActive: root.radarActiveProviderId,
        radarModelFallback: root.radarUsesModelFallback,
        activeTab: root.currentTab,
        tabs: root.displayTabs,
        radarPlaying: root.radarPlaying,
        radarFrameCount: root.radarFrames.length,
        radarTime: root.radarFrameLead(root.radarFrameIndex),
        windTime: "now",
        windGridPoints: root.windGrid.length,
        mapZoomLevel: root.mapZoomLevel,
        mapScale: root.distanceText(root.mapScaleDistanceKm(56, 480)),
        warnings: root.displayAlertProviderId,
        units: root.useImperial ? "imperial" : "metric",
        menubarUnits: root.menubarUseImperial ? "imperial" : "metric",
        menubarOptions: root.menubarDisplayOptions,
        menubarVisible: root.menubarHasVisibleContent,
        cacheUsing: root.usingCachedData,
        cacheFallbackActive: root.cacheFallbackActive,
        place: root.placeReport ? root.placeReport._placeSource : "",
        placeName: root.reportLocation,
        country: root.providerCountry,
        cacheFallbackDelayMinutes: Model.WEATHER_CACHE_FALLBACK_DELAY_MS / 60000,
        lastLiveUpdateAt: root.lastSuccessfulUpdateMs,
        lastForecastFailureAt: root.lastForecastFailureMs,
        cacheKey: root.activeWeatherCacheKey,
        cacheEntries: Object.keys(root.weatherDataCache && root.weatherDataCache.entries || {}).length,
        cacheUpdatedAt: Number(root.activeWeatherCacheEntryValue("updatedAt", 0)),
        cacheCurrentAvailable: root.current !== null,
        cacheHourlyRows: root.hourlyForecast.length,
        cacheDailyRows: root.forecastDays.length,
        cachedCurrentFields: root.current && root.current._cachedFields
          ? Object.keys(root.current._cachedFields) : [],
        windGridPoints: root.windGrid.length,
        windPointFallback: root.windGrid.length === 0 && root.windMapData.length > 0
      })
    }
  }

  // The bar's popup (WeatherPopup.qml), loaded by URL so the app, which has
  // its own window, never resolves the layer-shell types (they cannot exist
  // offscreen either, in the screenshot run).
  Loader {
    id: popupLoader
    active: !root.standaloneMode
    Component.onCompleted: setSource(Qt.resolvedUrl("WeatherPopup.qml"), { weatherPanel: root })
  }
  readonly property Item popupContentHost: popupLoader.item ? popupLoader.item.contentHost : null
  readonly property real contentHeight: weatherColumn.implicitHeight


  // Pointer over the popup or the stretch between it and the bar widget, and
  // over the widget itself, while the popup is open.
  readonly property bool popupPointerInside: !standaloneMode && opened && !!popupLoader.item && popupLoader.item.spanHovered
  // Not tied to `opened`: the bar widget reads it while the popup closes.
  readonly property bool popupPointerOnAnchor: !standaloneMode && !!popupLoader.item && popupLoader.item.anchorHovered

  FloatingWindow {
    id: standaloneWindow
    visible: root.standaloneMode && root.opened
    title: root.reportLocation !== "" ? root.i18n("weather") + " — " + root.reportLocation : root.i18n("weather")
    color: Color.popups.background
    implicitWidth: Style.space(520)
    implicitHeight: Style.space(760)
    minimumSize: Qt.size(Style.space(420), Style.space(480))

    onVisibleChanged: {
      if (!visible && root.standaloneMode && root.opened) root.close()
      else if (visible) root.defer(function() { keyCatcher.forceActiveFocus() })
    }

    Item {
      id: standaloneContentHost
      anchors.fill: parent
      anchors.margins: Style.spacing.popupPadding
    }
  }

  // Back to the panel's key handling, e.g. after a dropdown list closes.
  function restoreKeyFocus() {
    root.defer(function() { keyCatcher.forceActiveFocus() })
  }

  // The current-weather block, wherever the section order puts it.
  property Item hero: null
  // Everything the panel shows, in the popup or the app window (the
  // screenshot run in tests/ grabs it).
  readonly property Item contentRoot: keyCatcher

  function sectionComponent(key) {
    if (key === "current") return currentSectionComponent
    if (key === "favorites") return favoritesSectionComponent
    if (key === "airQuality") return airQualitySectionComponent
    if (key === "hourly") return hourlySectionComponent
    if (key === "daily") return dailySectionComponent
    if (key === "rain") return rainSectionComponent
    if (key === "radar") return radarSectionComponent
    if (key === "wind") return windSectionComponent
    if (key === "globe") return globeSectionComponent
    return tabsSectionComponent
  }

  // One visual tree, reparented into either the popup card or the application
  // window. All future layout and feature work therefore lands in both.
  Item {
    id: keyCatcher
    parent: root.standaloneMode ? standaloneContentHost : root.popupContentHost
    anchors.fill: parent
    focus: true
    // The tree is reparented into a popup or window outside this item, so
    // mirroring for right-to-left languages has to be set again here.
    LayoutMirroring.enabled: I18n.isRightToLeft(root.interfaceLanguage)
    LayoutMirroring.childrenInherit: true
    Keys.priority: Keys.BeforeItem
    Keys.onPressed: function(event) { root.handlePanelKey(event) }

    Flickable {
      id: weatherScroll
      anchors.fill: parent
      contentWidth: width
      contentHeight: weatherColumn.implicitHeight

      clip: true
      boundsBehavior: Flickable.StopAtBounds
      interactive: contentHeight > height

      Column {
        id: weatherColumn
        width: weatherScroll.width
        spacing: Style.space(14)

        // Current weather with place, refresh and settings, the place
        // search lists and the warnings: one section, moved as a whole.
        Component {
          id: currentSectionComponent

          Column {
            id: currentSection
            spacing: Style.space(14)
            // The topmost section shown draws no line above it.
            property bool leading: false

            Rectangle {
              visible: !currentSection.leading
              width: parent.width
              height: Style.spacing.hairline
              color: root.foreground
              opacity: 0.12
            }

            WeatherHero {
              panel: root
              width: parent.width
              Component.onCompleted: root.hero = this
              Component.onDestruction: if (root.hero === this) root.hero = null
            }
            WeatherLocationLists { panel: root }

            Text {
              textFormat: Text.PlainText
              visible: !root.current
              text: root.i18n("fetchingForecast")
              color: root.mutedText
              font.family: root.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.italic: true
            }

            WeatherAlerts { panel: root; width: parent.width }
          }
        }
        Component { id: airQualitySectionComponent; WeatherAirQualitySection { panel: root } }
        Component { id: hourlySectionComponent; WeatherHourly { panel: root } }
        Component { id: dailySectionComponent; WeatherDaily { panel: root } }
        Component { id: favoritesSectionComponent; WeatherFavorites { panel: root } }
        Component { id: rainSectionComponent; WeatherForecast { panel: root; kind: "rain" } }
        Component { id: radarSectionComponent; WeatherForecast { panel: root; kind: "radar" } }
        Component { id: windSectionComponent; WeatherForecast { panel: root; kind: "wind" } }
        Component { id: globeSectionComponent; WeatherGlobe { panel: root } }
        Component { id: tabsSectionComponent; WeatherTabs { panel: root } }

        // Sections in the order chosen under Settings → Display; the tabbed
        // ones share one strip in the place of the first.
        Repeater {
          id: sectionRepeater
          model: root.displayLayout

          Loader {
            id: sectionLoader
            required property string modelData
            required property int index
            readonly property bool shown: !!item && item.visible
            // No section above it is shown: then it draws no separator.
            readonly property bool leading: {
              for (var i = 0; i < index; ++i) {
                var before = sectionRepeater.itemAt(i)
                if (before && before.shown) return false
              }
              return true
            }
            width: weatherColumn.width
            sourceComponent: root.sectionComponent(modelData)
            onLoaded: if (modelData === "daily") root.dailySection = item
            Binding {
              target: sectionLoader.item
              property: "leading"
              value: sectionLoader.leading
              when: !!sectionLoader.item
            }
          }
        }

        Text {
          textFormat: Text.PlainText
          visible: root.usingCachedData
          width: parent.width - Style.space(32)
          anchors.horizontalCenter: parent.horizontalCenter
          text: root.i18n("cachedDataNotice")
          color: root.mutedText
          font.family: root.fontFamily
          font.pixelSize: Style.font.caption
          wrapMode: Text.WordWrap
          horizontalAlignment: Text.AlignHCenter
        }
      }
    }

    // Every wheel and touchpad scroll over the page goes through
    // routeWheel: scaled for touchpads, and latched to the page or to the
    // area it began on.
    MouseArea {
      anchors.fill: weatherScroll
      z: 2
      acceptedButtons: Qt.NoButton
      onWheel: function(wheel) {
        root.routeWheel(wheel, this, weatherScroll)
        wheel.accepted = true
      }
    }

    Loader {
      id: settingsLoader
      anchors.fill: parent
      z: 100
      active: root.settingsOpen
      sourceComponent: Component { WeatherSettings { panel: root } }
    }
  }
}
