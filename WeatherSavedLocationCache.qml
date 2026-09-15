import QtQuick
import "Model.js" as Model
import "Providers.js" as Providers

// Background forecasts for saved locations (bar instance only), so switching
// to a favourite shows recent data at once. Entries refresh after six hours.
Item {
  required property var panel
  // Provider chain of the location being fetched, fixed when it starts: a
  // rate limit noted mid-way must not shift the indices under it.
  property var providerChain: []

  function prepareSavedCacheQueue() {
    if (panel.standaloneMode || !panel.weatherDataCacheLoaded || savedCacheProc.running) return
    var entries = panel.weatherDataCache && panel.weatherDataCache.entries ? panel.weatherDataCache.entries : ({})
    var refreshBefore = Date.now() - 6 * 60 * 60 * 1000
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

  property Timer savedCacheNextTimer: Timer {
    interval: 250
    onTriggered: startNextSavedCacheRequest()
  }

  property Timer savedCacheProviderFallbackTimer: Timer {
    interval: 250
    onTriggered: startSavedCacheProvider()
  }

  property WeatherRequest savedCacheProc: WeatherRequest {
    onExited: function(exitCode) {
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
        var parsed = provider && provider.id === "met-no" ? Model.metNoToOpenMeteo(response) : response
        if (!parsed || !parsed.current || !parsed.daily || !parsed.hourly) return
        panel.storeWeatherSnapshot(active,
          panel.weatherSnapshotFromReport(parsed, active.name, provider && provider.id), false)
        panel.savedCacheResponseAccepted = true
      } catch (e) { }
    }
  }
}
