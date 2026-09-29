import QtQuick
import "Model.js" as Model
import "Providers.js" as Providers

// Background forecasts for saved locations (bar instance only), so switching
// to a favourite shows recent data at once and "My places" lists them.
// Entries refresh with the forecast interval (15 minutes by default) while
// that section is shown, else after six hours; a timer looks every five
// minutes, whatever the main forecast does.
Item {
  required property var panel
  // Provider chain of the location being fetched, fixed when it starts: a
  // rate limit noted mid-way must not shift the indices under it.
  property var providerChain: []

  function prepareSavedCacheQueue() {
    // Not while a place is being fetched (its forecast, then Bright Sky):
    // it would be queued again before it is stored.
    if (panel.standaloneMode || !panel.weatherDataCacheLoaded || savedCacheProc.running
        || brightSkyProc.running || panel.savedCacheActive) return
    var entries = panel.weatherDataCache && panel.weatherDataCache.entries ? panel.weatherDataCache.entries : ({})
    // With the forecast interval while "My places" is shown, else every six
    // hours.
    var refreshBefore = Date.now() - (panel.favoritesWanted ? Math.max(10, panel.refreshMinutes) * 60 : 6 * 60 * 60) * 1000
    var queue = []
    for (var i = 0; i < panel.savedLocations.length; ++i) {
      var location = panel.savedLocations[i]
      var key = Model.weatherCacheKey(location.name, location.latitude, location.longitude)
      var entry = entries[key]
      if (!key || key === panel.activeWeatherCacheKey) continue
      if (!entry || Number(entry.updatedAt || 0) < refreshBefore) queue.push(location)
    }
    panel.savedCacheQueue = queue
    startNextSavedCacheRequest()
  }

  function startSavedCacheProvider() {
    if (!panel.savedCacheActive || savedCacheProc.running) return
    var providers = providerChain
    if (panel.savedCacheProviderIndex < 0 || panel.savedCacheProviderIndex >= providers.length) {
      panel.savedCacheActive = null
      startNextSavedCacheRequest()
      return
    }
    panel.savedCacheResponseAccepted = false
    savedCacheProc.request = Providers.forecastRequest(providers[panel.savedCacheProviderIndex].id,
      panel.savedCacheActive.latitude, panel.savedCacheActive.longitude)
    if (savedCacheProc.request) savedCacheProc.running = true
  }

  function startNextSavedCacheRequest() {
    if (panel.standaloneMode || savedCacheProc.running || panel.savedCacheActive) return
    if (!panel.savedCacheQueue.length) return
    var queue = panel.savedCacheQueue.slice(0)
    panel.savedCacheActive = queue.shift()
    panel.savedCacheQueue = queue
    panel.savedCacheProviderIndex = 0
    providerChain = panel.forecastChain(panel.savedCacheActive.latitude, panel.savedCacheActive.longitude)
    startSavedCacheProvider()
  }

  property Timer savedCacheSchedule: Timer {
    interval: 1800
    onTriggered: prepareSavedCacheQueue()
  }

  property Timer savedCachePoll: Timer {
    interval: 5 * 60 * 1000
    repeat: true
    running: !panel.standaloneMode
    onTriggered: prepareSavedCacheQueue()
  }

  property Timer savedCacheNextTimer: Timer {
    interval: 250
    onTriggered: startNextSavedCacheRequest()
  }

  property Timer savedCacheProviderFallbackTimer: Timer {
    interval: 250
    onTriggered: startSavedCacheProvider()
  }

  // In the DWD area the forecast waits here for Bright Sky, so the place's
  // values come from the same sources as when it is the shown place.
  property var pendingForecast: null

  function storePending(mosmix) {
    var pending = pendingForecast
    pendingForecast = null
    if (pending) panel.storeWeatherSnapshot(pending.location,
      panel.weatherSnapshotFromReport(pending.report, pending.location.name, pending.providerId, mosmix), false)
    panel.savedCacheActive = null
    savedCacheNextTimer.restart()
  }

  property WeatherRequest brightSkyProc: WeatherRequest {
    property var report: null
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        report = parsed && parsed.weather && parsed.weather.length ? parsed : null
      } catch (e) { report = null }
    }
    // Without Bright Sky the place keeps its forecast alone.
    onExited: function(exitCode) {
      var mosmix = exitCode === 0 ? report : null
      report = null
      storePending(mosmix)
    }
  }

  property WeatherRequest savedCacheProc: WeatherRequest {
    onExited: function(exitCode) {
      if (exitCode === 0 && panel.savedCacheResponseAccepted && pendingForecast) {
        var location = pendingForecast.location
        brightSkyProc.report = null
        brightSkyProc.request = { url: panel.brightSkyWeatherUrl(location.latitude, location.longitude), timeoutMs: 8000 }
        brightSkyProc.running = true
        return
      }
      if (exitCode !== 0) panel.noteOpenMeteoResponse(savedCacheProc)
      if (exitCode !== 0 || !panel.savedCacheResponseAccepted) {
        if (panel.savedCacheActive && panel.savedCacheProviderIndex + 1 < providerChain.length) {
          panel.savedCacheProviderIndex++
          savedCacheProviderFallbackTimer.restart()
          return
        }
      }
      panel.savedCacheActive = null
      savedCacheNextTimer.restart()
    }
    onFinished: function(text) {
      var active = panel.savedCacheActive
      if (!active) return
      try {
        var response = JSON.parse(String(text || ""))
        var provider = providerChain[panel.savedCacheProviderIndex]
        var parsed = provider && provider.id === "met-no" ? Model.metNoToOpenMeteo(response) : Model.withPlaceOffsets(response)
        if (!parsed || !parsed.current || !parsed.daily || !parsed.hourly) return
        panel.savedCacheResponseAccepted = true
        if (panel.usesDwdRegionalSources(active.latitude, active.longitude)) {
          pendingForecast = { location: active, report: parsed, providerId: provider && provider.id }
          return
        }
        panel.storeWeatherSnapshot(active,
          panel.weatherSnapshotFromReport(parsed, active.name, provider && provider.id), false)
      } catch (e) { }
    }
  }
}
