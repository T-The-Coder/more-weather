import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Model.js" as Model
import "I18n.js" as I18n
import "Providers.js" as Providers

Panel {
  id: root
  moduleName: "more-weather"
  ipcTarget: "more-weather"
  manageIpc: false
  LayoutMirroring.enabled: I18n.isRightToLeft(interfaceLanguage)
  LayoutMirroring.childrenInherit: true
  Component.onCompleted: {
    // Adopt whatever radar timeline the startup cycle delivers.
    mapRefreshWindowUntilMs = Date.now() + mapRefreshWindowMs * 3
    syncStableSeries()
    radarPlaces.radarPlacesDebounce.restart()
  }

  property var anchorItem: null
  property bool openedFromHotkey: false
  // The same weather controller and view back both surfaces. The bar keeps
  // using KeyboardPanel; the standalone Quickshell config opts into a normal
  // xdg-toplevel window instead.
  property bool standaloneMode: false
  onStandaloneModeChanged: {
    settingsTargetSurface = standaloneMode ? "app" : "widget"
    Qt.callLater(function() {
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
    precipitationTab = defaultForecastTab
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
    precipitationTab = defaultForecastTab
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
    Qt.callLater(function() {
      if (root.opened) setCenterHoverRevealSuppressed(true)
    })
  }

  function close() {
    setCenterHoverRevealSuppressed(false)
    if (root.editingLocation) root.cancelEditingLocation()
    root.settingsOpen = false
    root.showSavedLocations = false
    root.controller.hide()
  }

  // Settings pages, in tab order; ← / → step through them.
  readonly property var settingsPages: ["display", "shortcuts", "sources"]
  property string settingsPage: "display"

  function stepSettingsPage(delta) {
    var index = settingsPages.indexOf(settingsPage)
    settingsPage = settingsPages[(index + delta + settingsPages.length) % settingsPages.length]
  }

  function openSettings(page) {
    settingsPage = page || "display"
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
      Qt.callLater(function() { root.refreshTick(true) })
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
    Qt.callLater(root.activateWeatherCache)
    if (placeLookup) placeLookup.placeProc.running = false
    dailyForecastProc.running = false
    sharedLiveAppliedPublishedAt = 0
    Qt.callLater(function() { root.refreshTick(true) })
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
  // plugin-owned file. Unlike weather.json (owned by the root-installed
  // omarchy-weather-location CLI), nothing else ever writes this file, so
  // watchChanges stays false and we're free to write it directly with
  // setText() — same idiom Notifications/Service.qml and agents/Main.qml
  // use for their own single-writer JSON state.
  property FileView savedLocationsFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-locations.json"
    watchChanges: false
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

  property FileView radarPlacesCacheFile: FileView {
    path: Quickshell.env("HOME") + "/.local/state/omarchy/settings/more-weather-radar-places.json"
    watchChanges: true
    atomicWrites: true
    printErrors: false
    onFileChanged: reload()
    onLoaded: {
      root.radarPlaceCache = Model.parseRadarPlaceCache(text())
      Qt.callLater(root.radarPlaces.ensureRadarPlaces)
    }
    onLoadFailed: {
      root.radarPlaceCache = Model.parseRadarPlaceCache("")
      Qt.callLater(root.radarPlaces.ensureRadarPlaces)
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
  property var locationSuggestions: []
  property int suggestionIndex: 0
  property bool locationSearchPristine: true
  // Logical keyboard focus while the location search is open. The text field
  // remains available for typing; Tab/arrow/+/- operate on the selected list.
  property string searchFocusSection: "suggestions"
  property int savedLocationIndex: 0
  property string geocodePendingQuery: ""
  property string geocodeActiveQuery: ""

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
  readonly property bool showForecastSection: displaySetting("showForecast", true)
  readonly property bool showAirQualitySection: displaySetting("showAirQuality", false)
  // The bar instance also loads air quality for the menu bar hint.
  readonly property bool airQualityWanted: showAirQualitySection
    || (!standaloneMode && (menubarShowAirQuality || menubarShowAirQualityAlert))
  onAirQualityWantedChanged: if (airQuality) airQuality.refresh()
  readonly property var airQualitySummary: Model.airQualitySummary(airQuality ? airQuality.report : null,
    Providers.countryCode(unitCountry) === "us")
  readonly property bool showForecastIntensity: displaySetting("forecastIntensity", true)
  readonly property bool showForecastProbability: displaySetting("forecastProbability", true)
  readonly property bool showForecastTotal: displaySetting("forecastTotal", true)
  readonly property int defaultForecastTab: Math.max(0, Math.min(2,
    Number(displaySetting("defaultForecastTab", 0)) || 0))
  readonly property bool settingsShowForecastSection: settingsDisplaySetting("showForecast", true)
  readonly property int settingsDefaultForecastTab: Math.max(0, Math.min(2,
    Number(settingsDisplaySetting("defaultForecastTab", 0)) || 0))
  readonly property string settingsUnitSystem: String(generalSetting("unitSystem", "auto"))

  readonly property bool menubarShowCurrent: menubarDisplaySetting("showCurrent", true)
  readonly property bool menubarShowLocation: menubarShowCurrent && menubarDisplaySetting("currentLocation", false)
  readonly property bool menubarShowWeatherSymbol: menubarShowCurrent && menubarDisplaySetting("currentWeatherSymbol", true)
  readonly property bool menubarShowTemperature: menubarShowCurrent && menubarDisplaySetting("currentTemperature", true)
  readonly property bool menubarShowFeelsLike: menubarShowCurrent && menubarDisplaySetting("currentFeelsLike", false)
  readonly property bool menubarShowWind: menubarShowCurrent && menubarDisplaySetting("currentWind", false)
  readonly property bool menubarShowHumidity: menubarShowCurrent && menubarDisplaySetting("currentHumidity", false)
  readonly property bool menubarShowPrecipitation: menubarShowCurrent && menubarDisplaySetting("currentPrecipitation", true)
  readonly property bool menubarShowWarnings: menubarShowCurrent && menubarDisplaySetting("currentWarnings", true)
  readonly property bool notifySevereWarnings: menubarDisplaySetting("notifySevereWarnings", true)
  readonly property bool notifyRainSoon: menubarDisplaySetting("notifyRainSoon", true)
  onNotifyRainSoonChanged: notifications.scheduleAlertNotifications()
  onUpcomingRainChanged: notifications.scheduleAlertNotifications()

  // Shared hero/bar icon state, updated with each successful weather response.
  // The current-conditions symbol. Derived from liveCurrent, so it follows
  // the minute tick like the temperature beside it; assigned once per
  // response, it used to keep the sky of the fetch time for 15 minutes.
  readonly property string label: Model.currentIcon(liveCurrent, "", nowDate)

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
  readonly property var heroNightSymbol: Model.nightCompositeSymbol(current, nowDate, mapCenterLatitude)
  // Moon phase glyphs are drawn as seen from the northern hemisphere; views
  // mirror them for places south of the equator.
  readonly property bool moonMirrored: Model.moonMirroredAt(mapCenterLatitude)
  function mirrorsGlyph(text) {
    return moonMirrored && Model.isMoonPhaseGlyph(text)
  }
  readonly property string displayForecastProviderId: !cacheFallbackActive && dailyForecastReport
    ? forecastProviderId : String(cacheFallbackActive && cachedWeatherSnapshot
      && cachedWeatherSnapshot.forecastProviderId || forecastProviderId)
  readonly property string displayAlertProviderId: !cacheFallbackActive && alertReport
    ? alertActiveProviderId : String(cacheFallbackActive && cachedWeatherSnapshot
      && cachedWeatherSnapshot.alertProviderId || alertActiveProviderId)
  readonly property var areaInfo: placeReport && placeReport.nearest_area && placeReport.nearest_area[0]
    ? placeReport.nearest_area[0] : null
  onAreaInfoChanged: Qt.callLater(function() {
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
    dailyForecastReport, uvReport, radarReport, nowDate, 6)
  readonly property double cacheWindowStartMs: {
    var start = new Date(relativeTimeNowMs)
    start.setMinutes(0, 0, 0)
    return start.getTime()
  }
  readonly property var displayedLiveHourlyForecast: cacheFallbackActive ? [] : liveHourlyForecast
  readonly property var computedHourlyForecast: Model.mergeCachedWeatherSeries(displayedLiveHourlyForecast,
    (cacheFallbackActive || displayedLiveHourlyForecast.length > 0) && cachedWeatherSnapshot
      ? cachedWeatherSnapshot.hourly : [], "time", cacheWindowStartMs, 6)
  readonly property var liveRainNowcast: Model.rainNowcastSeries(mosmixReport, dailyForecastReport, nowDate, 9, radarReport)
  // Source label for the rain tab: the radar supplies amounts wherever it
  // reaches, the forecast the probability and anything beyond.
  readonly property string rainNowcastSourceLabel: {
    var forecast = mosmixReport ? i18n("sourceMosmix")
      : i18n(Providers.forecastLabelKey(displayForecastProviderId))
    for (var i = 0; i < rainNowcast.length; ++i)
      if (rainNowcast[i].precipitationSource === "radar") return i18n("sourceRadar") + " + " + forecast
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

  // The radar map shows a snapshot of the timeline that is renewed hourly,
  // not with every forecast cycle: each new timeline means a new set of frame
  // images, which are loaded in the background (WeatherMapPrefetch). A manual
  // refresh, a location or zoom change, startup and the playback controls
  // open a short window in which a new timeline is adopted; so does a change
  // of source (fallback), since the old frames are unusable then.
  //
  // Between renewals the DWD nowcast snapshot is cut at "now" when shown
  // (radarFirstFrameIndex), so it never shows frames that lie in the past.
  property double radarFramesAdoptedMs: 0
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
    Qt.callLater(function() {
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
      || now - radarFramesAdoptedMs >= mapRefreshMs
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
    Qt.callLater(function() { root.pendingRadarFrames = [] })
  }

  // WeatherMapPrefetch reports the pending set's pictures here. Deferred:
  // replacing a Repeater model from inside an Image's status signal makes
  // Qt connect new Images to a pixmap reply that is being torn down, and
  // Quickshell crashes.
  function pendingRadarFrameStatus(index, status) {
    var frames = pendingRadarFrames
    Qt.callLater(function() { root.applyPendingRadarFrameStatus(frames, index, status) })
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
  readonly property var radarCurrentFrame: radarFrames.length > 0
    ? radarFrames[Math.max(0, Math.min(radarFrameIndex, radarFrames.length - 1))]
    : null
  readonly property var windGrid: Model.windGridSeries(cacheFallbackActive ? null : windGridReport)
  readonly property var windMapData: windGrid.length > 0
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
    Qt.callLater(function() {
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
  readonly property real mapLatitudeRadius: Model.mapLatitudeRadiusKm(mapRadiusKm) / 111.32
  readonly property real mapLongitudeRadius: mapRadiusKm / (111.32 * Math.max(0.2, Math.cos(mapCenterLatitude * Math.PI / 180)))
  readonly property real mapWest: mapCenterLongitude - mapLongitudeRadius
  readonly property real mapEast: mapCenterLongitude + mapLongitudeRadius
  readonly property real mapSouth: mapCenterLatitude - mapLatitudeRadius
  readonly property real mapNorth: mapCenterLatitude + mapLatitudeRadius
  readonly property string mapBbox: mapWest.toFixed(4) + "," + mapSouth.toFixed(4) + "," + mapEast.toFixed(4) + "," + mapNorth.toFixed(4)
  // No map pictures before the place is known: the extent around 0/0 is
  // meaningless and only costs requests.
  readonly property bool mapExtentKnown: isFinite(mapCenterLatitude) && isFinite(mapCenterLongitude)
    && !(mapCenterLatitude === 0 && mapCenterLongitude === 0)
  readonly property string mapBasemapUrl: mapExtentKnown
    ? Providers.calmContextMapUrl(mapBbox, mapImageWidth, mapImageHeight) : ""
  readonly property var radarPlaceCandidates: Model.radarPlaceCandidates(
    radarPlaceCache.places || [], mapCenterLatitude, mapCenterLongitude,
    mapRadiusKm, mapZoomLevel, reportLocation)
  onMapCenterLatitudeChanged: {
    if (airQuality) Qt.callLater(airQuality.refresh)
    radarPlaces.radarPlacesDebounce.restart()
    windGridRefreshPending = true
    windGridLoader.windGridDebounce.restart()
    openMapRefreshWindow(true)
    Qt.callLater(function() { root.refreshRegionalRadar() })
  }
  onMapCenterLongitudeChanged: {
    if (airQuality) Qt.callLater(airQuality.refresh)
    radarPlaces.radarPlacesDebounce.restart()
    windGridRefreshPending = true
    windGridLoader.windGridDebounce.restart()
    openMapRefreshWindow(true)
    Qt.callLater(function() { root.refreshRegionalRadar() })
  }
  onInterfaceLanguageChanged: radarPlaces.radarPlacesDebounce.restart()
  property int precipitationTab: 0
  readonly property bool windMapVisible: opened && precipitationTab === 2
  onWindMapVisibleChanged: if (windMapVisible) windGridLoader.windGridDebounce.restart()
  // Switching views never starts the animation implicitly. Leaving the
  // radar pauses it; returning shows the retained frame until Play is used.
  onPrecipitationTabChanged: if (precipitationTab !== 1) radarPlaying = false
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
  readonly property string todayDate: Qt.formatDate(new Date(relativeTimeNowMs), "yyyy-MM-dd")
  // "auto" resolves by the place's country first and the locale second.
  readonly property string unitCountry: reportCountry || providerCountry
  readonly property bool useImperial: Model.shouldUseImperial(
    generalSetting("unitSystem", "auto"), localeName, unitCountry)

  // Auto-refresh interval in minutes; clamped to a sane minimum.
  readonly property int refreshMinutes: Math.max(1, parseInt(setting("refreshMinutes", 15), 10) || 15)

  readonly property string reportLocation: configuredLocation || placeName
    || (areaInfo && areaInfo.areaName && areaInfo.areaName[0] ? areaInfo.areaName[0].value : "")
    || String(cacheFallbackActive ? activeWeatherCacheEntryValue("name", "") : "")
  readonly property bool locationCached: configuredLocation === "" && placeName === ""
    && !areaInfo && cacheFallbackActive && reportLocation !== ""
  readonly property string reportTempNum:   current ? String(useImperial ? current.temp_F : current.temp_C) : ""
  readonly property string tempUnit:        "°" + (useImperial ? "F" : "C")
  readonly property string reportFeels:     current ? formatTemp(useImperial ? current.FeelsLikeF : current.FeelsLikeC) : ""
  readonly property string reportWind:      current ? (useImperial ? (localizedNumber(current.windspeedMiles) + " mph") : (localizedNumber(current.windspeedKmph) + " km/h")) : ""
  readonly property string reportHumidity:  current ? (localizedNumber(current.humidity) + "%") : ""
  readonly property bool currentTemperatureCached: currentFieldCached("temp_C", "temp_F")
  readonly property bool currentFeelsCached: currentFieldCached("FeelsLikeC", "FeelsLikeF")
  readonly property bool currentWindCached: currentFieldCached("windspeedKmph", "windspeedMiles")
  readonly property bool currentHumidityCached: cachedField(current, "humidity")
  readonly property bool menubarUseImperial: Model.shouldUseImperial(
    generalSetting("unitSystem", "auto"), localeName, unitCountry)
  readonly property string menubarReportTempNum: current
    ? String(menubarUseImperial ? current.temp_F : current.temp_C) : ""
  readonly property string menubarReportFeels: current
    ? Model.formatTemp(menubarUseImperial ? current.FeelsLikeF : current.FeelsLikeC, menubarUseImperial) : ""
  readonly property string menubarReportWind: current
    ? (menubarUseImperial
      ? localizedNumber(current.windspeedMiles) + " mph"
      : localizedNumber(current.windspeedKmph) + " km/h") : ""
  readonly property string menubarReportHumidity: current ? localizedNumber(current.humidity) + "%" : ""
  readonly property bool menubarTemperatureCached: cachedField(current,
    menubarUseImperial ? "temp_F" : "temp_C")
  readonly property bool menubarFeelsCached: cachedField(current,
    menubarUseImperial ? "FeelsLikeF" : "FeelsLikeC")
  readonly property bool menubarWindCached: cachedField(current,
    menubarUseImperial ? "windspeedMiles" : "windspeedKmph")
  readonly property bool menubarHumidityCached: cachedField(current, "humidity")
  readonly property bool rainBadgeCached: isCurrentlyRaining
    ? ((cacheFallbackActive || radarReport === null) && rainNowcast.length > 0
      && cachedField(rainNowcast[0], "precipitation"))
    : (hourlyForecast.length > 0 && cachedField(hourlyForecast[0], "rainProbability"))
  readonly property bool warningsCached: Model.weatherSeriesUsesCache(activeWeatherAlerts)
  // Rain expected within the two-hour nowcast while it is dry now.
  readonly property var upcomingRain: isCurrentlyRaining ? null
    : Model.upcomingRainStart(rainNowcast, nowDate)
  readonly property string upcomingRainTime: upcomingRain
    ? Qt.formatTime(upcomingRain.date, "HH:mm") : ""
  readonly property bool menubarShowAirQuality: menubarShowCurrent
    && menubarDisplaySetting("currentAirQuality", false)
  // The hint shows poor air (EU "poor" / US "unhealthy" and worse) or a high
  // pollen level, and nothing otherwise.
  readonly property bool menubarShowAirQualityAlert: menubarShowCurrent
    && menubarDisplaySetting("currentAirQualityAlert", false)
  // One AQI entry for both: always when switched on, or once the air is poor.
  readonly property string menubarAirQualityText: airQualitySummary && airQualitySummary.index !== null
    && (menubarShowAirQuality || (menubarShowAirQualityAlert && airQualitySummary.category >= 3))
    ? String(airQualitySummary.index) : ""
  readonly property string menubarPollenAlertText: {
    var top = menubarShowAirQualityAlert && airQualitySummary && airQualitySummary.pollen
      && airQualitySummary.pollen.length ? airQualitySummary.pollen[0] : null
    if (!top || top.level < 3) return ""
    return i18n("pollen" + top.type.charAt(0).toUpperCase() + top.type.slice(1)) + " " + i18n("pollenHigh")
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
    && menubarDisplaySetting("currentAirQualityColor", false)
  readonly property color menubarAirQualityColor: airQualitySummary && airQualitySummary.color
    ? softAirQualityColor(airQualitySummary.color) : foreground
  readonly property bool menubarShowRainStart: menubarShowCurrent
    && menubarDisplaySetting("currentRainStart", true)
  readonly property string menubarRainStartText: menubarShowRainStart && upcomingRainTime !== ""
    ? i18n("rainFromTime", { time: upcomingRainTime }) : ""
  readonly property string menubarRainBadgeText: menubarRainStartText !== "" ? menubarRainStartText
    : (!menubarShowPrecipitation ? ""
      : (isCurrentlyRaining
        ? precipitationTextForUnit(radarCurrentIntensity, true, menubarUseImperial)
        : (nextHourRainProbability !== "" ? nextHourRainProbability + "%" : "")))
  readonly property bool menubarHasVisibleContent: displayLabel !== "" && menubarShowCurrent && (
    menubarShowLocation || menubarShowWeatherSymbol || menubarShowTemperature
      || menubarShowFeelsLike || menubarShowWind || menubarShowHumidity
      || menubarShowPrecipitation || menubarRainStartText !== "" || menubarPollenAlertText !== ""
      || menubarAirQualityText !== ""
      || menubarShowWarnings)

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
      showHourly: true,
      hourlyTime: true,
      hourlyIcon: true,
      hourlyTemperature: true,
      hourlyRainProbability: true,
      hourlyRainAmount: true,
      hourlyUv: true,
      hourlyWind: true,
      showDaily: true,
      dailyDayName: true,
      dailyIcon: true,
      dailyTemperature: true,
      dailyRainProbability: true,
      dailyRainAmount: true,
      dailyUv: true,
      dailyWind: true,
      dailySunEvents: true,
      showForecast: true,
      forecastIntensity: true,
      forecastProbability: true,
      forecastTotal: true,
      showAirQuality: false,
      airQualityIndex: true,
      airQualityPollen: true,
      airQualityColor: true,
      defaultForecastTab: 0
    }
  }

  function defaultWidgetDisplayOptions() {
    var options = defaultDisplayOptions()
    options.hourlyRainAmount = false
    options.hourlyUv = false
    options.hourlyWind = false
    options.dailyRainAmount = false
    options.dailyUv = false
    options.dailyWind = false
    options.dailySunEvents = false
    return options
  }

  function defaultOptionsFor(surface) {
    return surface === "menubar" ? defaultMenubarDisplayOptions()
      : (surface === "widget" ? defaultWidgetDisplayOptions() : defaultDisplayOptions())
  }

  function defaultMenubarDisplayOptions() {
    return {
      showCurrent: true,
      currentLocation: false,
      currentWeatherSymbol: true,
      currentTemperature: true,
      currentFeelsLike: false,
      currentWind: false,
      currentHumidity: false,
      currentPrecipitation: true,
      currentWarnings: true,
      currentRainStart: true,
      currentAirQuality: false,
      currentAirQualityColor: false,
      currentAirQualityAlert: false,
      notifySevereWarnings: true,
      notifyRainSoon: true
    }
  }

  // Missing keys fall back to the surface's factory default, so callers'
  // fallback only matters for keys that have no default at all.
  // Unit system and language apply to the menu bar, widget and app alike.
  property var generalOptions: ({ unitSystem: "auto", language: "auto" })
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

  function menubarDisplaySetting(key, fallback) {
    return optionValue(menubarDisplayOptions, "menubar", key, fallback)
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

  function weatherSnapshotFromReport(source, locationName, providerId) {
    var currentCondition = Model.openMeteoCurrentCondition(source)
    var now = new Date()
    var today = Qt.formatDate(now, "yyyy-MM-dd")
    return {
      label: Model.currentIcon(currentCondition, ""),
      forecastProviderId: String(providerId || source && source._providerId || "open-meteo"),
      alertProviderId: "",
      current: currentCondition,
      hourly: Model.hybridHourlyForecast(null, source, source, null, now, 72),
      daily: Model.hybridForecastDays(null, source, today, source).slice(0, 3),
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
        uvReport || dailyForecastReport, radarReport, new Date(), 72),
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
    var converted = useImperial ? Model.kilometersPerHourToMilesPerHour(value) : Number(value)
    return converted === null || !isFinite(converted) ? "–" : localizedNumber(Math.round(converted))
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
      console.warn("weather: Open-Meteo rate limited until", new Date(until).toISOString())
    }
    return true
  }

  function startForecastProvider(index) {
    if (dailyForecastProc.running || index < 0 || index >= forecastProviderChain.length) return
    forecastProviderIndex = index
    var provider = forecastProviderChain[index]
    forecastRequestProviderId = provider.id
    dailyForecastProc.request = Providers.forecastRequest(provider.id,
      forecastRequestLatitude, forecastRequestLongitude)
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
    }

    var useDwd = usesDwdRegionalSources(lat, lon)
    if (useDwd) {
      var today = new Date()
      var lastDay = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      var weatherUrl = "https://api.brightsky.dev/weather"
        + "?lat=" + encodeURIComponent(String(lat))
        + "&lon=" + encodeURIComponent(String(lon))
        + "&date=" + Qt.formatDate(today, "yyyy-MM-dd")
        + "&last_date=" + Qt.formatDate(lastDay, "yyyy-MM-dd")
        + "&tz=" + encodeURIComponent("Europe/Berlin")
      mosmixProc.request = { url: weatherUrl, timeoutMs: 8000 }
      mosmixProc.running = true

      startDwdRadarRequest(lat, lon)
    } else {
      mosmixProc.running = false
      radarProc.running = false
      radarMotionProc.running = false
      mosmixReport = null
      radarReport = null
      radarMotion = []
    }

    startRainViewerRequest()
    refreshRegionalRadar()
    refreshAlerts()
    windGridLoader.requestWindGrid(lat, lon)
  }

  function startDwdRadarRequest(lat, lon) {
    if (radarProc.running) return
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
    locationSuggestions = []
    suggestionIndex = 0
    searchFocusSection = "suggestions"
    savedLocationIndex = 0
    locationSearchPristine = !startsWithTypedText
    Qt.callLater(function() {
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
    locationSuggestions = []
    locationSearchPristine = true
    searchFocusSection = "suggestions"
    savedLocationIndex = 0
    geocodeDebounce.stop()
    Qt.callLater(function() { if (keyCatcher) keyCatcher.forceActiveFocus() })
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
    Qt.callLater(function() {
      if (!editingLocation) return
      locationField.forceActiveFocus()
      locationField.cursorPosition = locationField.text.length
    })
  }

  function addMarkedSearchLocation() {
    var entry = searchFocusSection === "saved"
      ? (savedLocations[savedLocationIndex] || null)
      : (locationSuggestions[suggestionIndex] || null)
    if (!entry) return false

    addSavedLocation(entry)
    var savedIndex = savedLocationIndexFor(entry)
    if (savedIndex < 0) return false
    searchFocusSection = "saved"
    savedLocationIndex = savedIndex
    return true
  }

  function removeMarkedSearchLocation() {
    var entry = searchFocusSection === "saved"
      ? (savedLocations[savedLocationIndex] || null)
      : (locationSuggestions[suggestionIndex] || null)
    var savedIndex = savedLocationIndexFor(entry)
    if (savedIndex < 0) return false

    removeSavedLocation(savedIndex)
    return true
  }

  // Hero and daily strip live in their own components; these are the handles
  // the controller needs from them.
  readonly property var locationField: hero ? hero.locationField : null

  function scheduleGeocode() {
    geocodeDebounce.restart()
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

  function scrollWeatherBy(delta) {
    var maximum = Math.max(0, weatherScroll.contentHeight - weatherScroll.height)
    weatherScroll.contentY = Math.max(0, Math.min(maximum, weatherScroll.contentY + delta))
  }

  function scrollDailyBy(columns) {
    if (!daily || !daily.scroller) return
    var scroller = daily.scroller
    var step = forecastColumnWidth(scroller.width) + forecastColumnGap
    var maximum = Math.max(0, scroller.contentWidth - scroller.width)
    scroller.contentX = Math.max(0, Math.min(maximum, scroller.contentX + columns * step))
  }

  // Keyboard map, identical in the popup and the app:
  //   Esc              close search, settings or the saved list, then the panel
  //   Tab / Shift+Tab  next / previous bar panel (Omarchy convention);
  //                    while searching: switch between results and favorites
  //   1 2 3            rain, radar, wind view
  //   r, F5            refresh                 Ctrl+,  settings
  //   /, Enter         search a place
  //   ↑ ↓, j k         scroll                  PgUp PgDn Home End  page / jump
  //   ← →, h l         radar: step frames; otherwise scroll the daily strip
  //   Space            radar: play / pause
  //   + − 0            map zoom in / out / reset (radar and wind)
  //   ← → (settings)   previous / next settings page
  // WeatherShortcutsPage.qml lists these for the user; keep it in sync.
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
    if (event.key === Qt.Key_Escape) {
      if (editingLocation) cancelEditingLocation()
      else if (settingsOpen) {
        settingsOpen = false
        Qt.callLater(function() { keyCatcher.forceActiveFocus() })
      } else if (showSavedLocations) showSavedLocations = false
      else close()
      event.accepted = true
      return
    }

    if (settingsOpen) {
      if (event.key === Qt.Key_Left || event.key === Qt.Key_Right) {
        stepSettingsPage(event.key === Qt.Key_Right ? 1 : -1)
        event.accepted = true
      }
      return
    }

    var plusKey = event.key === Qt.Key_Plus
      || (event.key === Qt.Key_Equal && !!(event.modifiers & Qt.ShiftModifier))
      || text === "+"
    var minusKey = event.key === Qt.Key_Minus || text === "-"

    if (editingLocation) {
      if (plain && (event.key === Qt.Key_Tab || event.key === Qt.Key_Backtab)) {
        toggleSearchFocus()
        event.accepted = true
      } else if (plain && (plusKey || minusKey)) {
        if (plusKey) addMarkedSearchLocation()
        else removeMarkedSearchLocation()
        event.accepted = true
      } else if (event.key === Qt.Key_Down) {
        if (searchFocusSection === "saved" && savedLocations.length > 0) {
          savedLocationIndex = Math.min(savedLocations.length - 1, savedLocationIndex + 1)
        } else if (locationSuggestions.length > 0) {
          suggestionIndex = Math.min(locationSuggestions.length - 1, suggestionIndex + 1)
          locationSearchPristine = false
        }
        event.accepted = true
      } else if (event.key === Qt.Key_Up) {
        if (searchFocusSection === "saved" && savedLocations.length > 0) {
          savedLocationIndex = Math.max(0, savedLocationIndex - 1)
        } else if (locationSuggestions.length > 0) {
          suggestionIndex = Math.max(0, suggestionIndex - 1)
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
            else commitLocation()
          }
        }
        event.accepted = true
      }
      return
    }

    if (!plain) return

    if (event.key === Qt.Key_Tab || event.key === Qt.Key_Backtab) {
      switchPanel((event.modifiers & Qt.ShiftModifier) || event.key === Qt.Key_Backtab ? -1 : 1)
      event.accepted = true
      return
    }
    if (text === "1" || text === "2" || text === "3") {
      if (showForecastSection) precipitationTab = Number(text) - 1
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

    var mapView = precipitationTab === 1 || precipitationTab === 2
    if (mapView && (plusKey || minusKey)) {
      changeMapZoom(plusKey ? 1 : -1)
      event.accepted = true
      return
    }
    if (mapView && text === "0") {
      mapZoomLevel = defaultMapZoomLevel
      event.accepted = true
      return
    }

    var lineStep = Style.space(48)
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

    var leftKey = event.key === Qt.Key_Left || text === "h"
    var rightKey = event.key === Qt.Key_Right || text === "l"
    var radarView = precipitationTab === 1 && radarFrames.length > 0
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

  // Debounced geocoding. Only one curl runs at a time; if the query moved on
  // while a fetch was in flight, the latest query is fetched right after.
  function requestGeocode() {
    var query = locationField.text.trim()
    if (query.length < 2) {
      locationSuggestions = []
      return
    }
    geocodePendingQuery = query
    if (!geocodeProc.running) startGeocode()
  }

  function startGeocode() {
    geocodeActiveQuery = geocodePendingQuery
    geocodeProc.request = {
      url: "https://geocoding-api.open-meteo.com/v1/search?name=" + encodeURIComponent(geocodeActiveQuery)
        + "&count=5&language=" + encodeURIComponent(I18n.serviceLanguage(interfaceLanguage)) + "&format=json",
      timeoutMs: 5000
    }
    geocodeProc.running = true
  }

  function formatTemp(value) {
    return Model.formatTemp(value, useImperial)
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
    return Model.bareTempForDay(day, kind, useImperial)
  }

  // Representative icon for a forecast day: the hourly entry nearest noon.
  function dayIcon(day) {
    return Model.dayIcon(day)
  }

  function hourlyTemp(hour) {
    return Model.hourlyTemp(hour, useImperial)
  }

  function hourlyIcon(hour) {
    return Model.hourlyIcon(hour)
  }

  function hourlyTime(hour) {
    return hour && hour.time ? String(hour.time).slice(11, 16) : ""
  }

  function forecastWind(entry) {
    if (!entry) return "–"
    var value = useImperial ? entry.windSpeedMph : entry.windSpeedKmph
    if (value === undefined || value === null || value === "") return "–"
    return localizedNumber(value) + (useImperial ? " mph" : " km/h")
  }

  function forecastEventTime(value) {
    var timestamp = String(value || "")
    return timestamp.length >= 16 ? timestamp.slice(11, 16) : "–"
  }

  function paintSunEventIcon(canvas, rising) {
    var ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = canvas.iconColor
    ctx.lineWidth = 1.2
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

  function changeMapZoom(delta) {
    var nextLevel = Math.max(mapMinimumZoom,
      Math.min(mapMaximumZoom, mapZoomLevel + delta))
    if (nextLevel === mapZoomLevel) return
    mapZoomLevel = nextLevel
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
      var zoom = Model.rainViewerTile(root.mapRadiusKm, root.mapCenterLatitude).zoom
      return String(frame.rainViewerHost || "") + String(frame.rainViewerPath || "")
        + "/512/" + zoom
        + "/" + Number(root.mapCenterLatitude).toFixed(5)
        + "/" + Number(root.mapCenterLongitude).toFixed(5)
        + "/2/1_1.png"
    }
    var url = "https://maps.dwd.de/geoserver/dwd/ows?service=WMS&version=1.1.1&request=GetMap"
      + "&layers=dwd:bluemarble,dwd:Niederschlagsradar&styles=,"
      + "&bbox=" + root.mapBbox + "&width=" + mapImageWidth + "&height=" + mapImageHeight + "&srs=EPSG:4326"
      + "&format=image/png&transparent=false"
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
    return isNaN(date.getTime()) ? i18n("current") : Qt.formatTime(date, "HH:mm")
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
      Qt.callLater(function() { root.noteRadarFrameError(frame) })
      return
    }
    updateRadarFrameReady(index, status === Image.Ready)
  }

  function noteRadarFrameError(frame) {
    if (frame && frame.wmsProvider) {
      regionalRadarFailed = true
      console.warn("weather: regional radar image failed, falling back:", frame.wmsProvider)
    } else if (radarActiveProviderId === "dwd") {
      regionalRadarFailed = true
      console.warn("weather: DWD radar image failed, falling back to RainViewer")
    } else if (frame && frame.rainViewer) {
      rainViewerFailed = true
      console.warn("weather: RainViewer image failed, using model precipitation fallback")
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
      console.warn("weather: all forecast providers failed; retaining last good data")
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
        var parsed = root.forecastRequestProviderId === "met-no"
          ? Model.metNoToOpenMeteo(response) : response
        if (!parsed || !parsed.current || !parsed.daily || !parsed.hourly)
          throw new Error("incomplete forecast response")
        parsed._providerId = root.forecastRequestProviderId
        root.dailyForecastReport = parsed
        root.forecastProviderId = root.forecastRequestProviderId
        console.info("weather: forecast provider active:", root.forecastProviderId)
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

  WeatherRequest {
    id: uvProc
    onExited: function(exitCode) { if (exitCode !== 0) root.noteOpenMeteoResponse(uvProc) }
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
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
      radarMotionWorker.sendMessage({ token: root.locationQuery, text: raw })
    }
  }

  WorkerScript {
    id: radarMotionWorker
    source: "RadarMotionWorker.mjs"
    onMessage: function(message) {
      // A result for a location the user has since left is dropped.
      if (message.token !== root.locationQuery) return
      if (!message.motion) {
        console.warn("weather: radar motion response unreadable")
        return
      }
      root.radarMotion = message.motion
      console.info("weather: radar drift tracked for", message.motion.length, "of 8 steps")
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
        console.warn("weather: regional radar provider failed:", root.regionalRadarProviderId, exitCode)
      }
    }
    onFinished: function(text) {
      var frames = Model.wmsRadarTimeline(String(text || ""),
        root.regionalRadarProviderId, new Date(), 2)
      if (frames.length) {
        root.regionalRadarFrames = frames
        root.regionalRadarResponseAccepted = true
        root.regionalRadarFailed = false
        console.info("weather: regional radar provider active:", root.regionalRadarProviderId)
      }
    }
  }

  WeatherRequest {
    id: alertProc
    onExited: function(exitCode) {
      if (root.pendingAlertProviderIndex >= 0) {
        alertFallbackTimer.restart()
      } else if (exitCode !== 0 || !root.alertResponseAccepted) {
        console.warn("weather: warning provider failed:", root.alertProviderId, exitCode)
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
        else {
          var response = JSON.parse(raw)
          if (response && Array.isArray(response.alerts)) parsed = response
        }
        if (parsed && Array.isArray(parsed.alerts)) {
          root.alertReport = parsed
          root.alertResponseAccepted = true
          root.alertActiveProviderId = root.alertProviderId
          console.info("weather: warning provider active:", root.alertActiveProviderId)
          root.scheduleWeatherCachePersist()
        }
      } catch (e) { }
    }
  }

  WeatherRequest {
    id: geocodeProc
    onFinished: function(text) {
      root.locationSuggestions = root.editingLocation ? Model.parseGeocodingResults(text) : []
      root.suggestionIndex = 0
      if (root.savedLocations.length > 0)
        root.savedLocationIndex = Math.min(root.savedLocations.length - 1, root.savedLocationIndex)
      if (root.geocodePendingQuery !== root.geocodeActiveQuery) Qt.callLater(root.startGeocode)
    }
  }

  Timer {
    id: geocodeDebounce
    interval: 300
    onTriggered: root.requestGeocode()
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
        Qt.callLater(root.refresh)
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
  property WeatherAirQuality airQuality: WeatherAirQuality { panel: root }
  property WeatherAppLauncherEntry appLauncherEntry: WeatherAppLauncherEntry { panel: root }

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
        precipitationTab: root.precipitationTab,
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

  KeyboardPanel {
    id: panel
    anchorItem: root.anchorItem
    owner: root.barIdentity
    bar: root.bar
    open: !root.standaloneMode && root.opened
    centerOnBar: true
    focusTarget: keyCatcher
    contentWidth: panel.fittedContentWidth(Style.space(480))
    contentHeight: panel.fittedContentHeight(root.settingsOpen
      ? Style.space(650)
      : weatherColumn.implicitHeight)

    Item {
      id: popupContentHost
      anchors.fill: parent
    }
  }

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
      else if (visible) Qt.callLater(function() { keyCatcher.forceActiveFocus() })
    }

    Item {
      id: standaloneContentHost
      anchors.fill: parent
      anchors.margins: Style.spacing.popupPadding
    }
  }

  // One visual tree, reparented into either the popup card or the application
  // window. All future layout and feature work therefore lands in both.
  Item {
    id: keyCatcher
    parent: root.standaloneMode ? standaloneContentHost : popupContentHost
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

        WeatherHero { id: hero; panel: root; width: parent.width }
        WeatherLocationLists { panel: root }

        Text {
          visible: !root.current
          text: root.i18n("fetchingForecast")
          color: root.mutedText
          font.family: root.fontFamily
          font.pixelSize: Style.font.bodySmall
          font.italic: true
        }

        WeatherAlerts { panel: root; width: parent.width }
        WeatherAirQualitySection { panel: root }
        WeatherHourly { panel: root }
        WeatherDaily { id: daily; panel: root }
        WeatherForecast { panel: root }

        Text {
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

    Loader {
      anchors.fill: parent
      z: 100
      active: root.settingsOpen
      sourceComponent: Component { WeatherSettings { panel: root } }
    }
  }
}
