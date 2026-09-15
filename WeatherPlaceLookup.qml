import QtQuick
import "Model.js" as Model
import "Providers.js" as Providers
import "I18n.js" as I18n

// Place lookup for the forecast place: reverse geocoding for stored
// coordinates, a name search for name-only locations, IP geolocation for
// auto-detect. Results and retry state live on the panel.
Item {
  required property var panel

  // ---- Place lookup: name, region and country for the forecast place.
  //      Stored coordinates are reverse-geocoded once per location
  //      (Nominatim); a name-only location is searched once (Open-Meteo
  //      geocoding); auto-detect asks IP geolocation services every cycle,
  //      since the network, and with it the place, can change.
  function refreshPlace() {
    if (placeProc.running) return
    var language = I18n.serviceLanguage(panel.interfaceLanguage)
    if (panel.hasConfiguredCoordinates || panel.configuredLocation !== "") {
      if (panel.placeReport && panel.placeResolvedKey === panel.locationQuery) return
      panel.placeRequestKind = panel.hasConfiguredCoordinates ? "reverse" : "search"
      placeProc.request = panel.hasConfiguredCoordinates
        ? Providers.reversePlaceRequest(panel.configuredLocationState.latitude,
          panel.configuredLocationState.longitude, language)
        : Providers.placeSearchRequest(panel.configuredLocation, language)
    } else {
      var providers = Providers.ipPlaceProviders()
      panel.placeProviderIndex = Math.max(0, Math.min(providers.length - 1, panel.placeProviderIndex))
      panel.placeRequestKind = "ip"
      placeProc.request = { url: providers[panel.placeProviderIndex].url, timeoutMs: 6000 }
    }
    placeProc.running = true
  }

  function applyPlace(text) {
    var place = null
    if (panel.placeRequestKind === "ip")
      place = Model.ipPlace(Providers.ipPlaceProviders()[panel.placeProviderIndex].id, text)
    else if (panel.placeRequestKind === "reverse")
      place = Model.nominatimReversePlace(text, panel.configuredLocationState.latitude,
        panel.configuredLocationState.longitude)
    else
      place = Model.geocodingSearchPlace(text, panel.configuredLocation)
    var next = Model.placeReport(place, panel.placeRequestKind)
    if (!next) return false

    var previous = panel.areaInfo
    var nextArea = next.nearest_area[0]
    var moved = !previous || Model.geographicDistanceKm(previous.latitude, previous.longitude,
      nextArea.latitude, nextArea.longitude) > 5
    panel.placeReport = next
    panel.placeResolvedKey = panel.locationQuery
    panel.placeRetries = 0
    panel.providerCountry = Model.placeCountryCode(next)
    if (panel.placeRequestKind === "ip") panel.placeName = String(place.name || "")
    if (Model.weatherResponseCompletesSave(panel.hasConfiguredCoordinates, "place"))
      panel.finishSavingLocation()
    // Stored coordinates already started the forecast from refresh(). Other
    // places need the resolved coordinates, and a new forecast only when the
    // place actually moved.
    if (!panel.hasConfiguredCoordinates && moved) panel.refreshDailyForecast(next)
    panel.scheduleWeatherCachePersist()
    return true
  }

  // Next IP service, then a few spaced retries of the whole lookup.
  function schedulePlaceRetry() {
    if (panel.placeRequestKind === "ip" && panel.placeProviderIndex + 1 < Providers.ipPlaceProviders().length) {
      panel.placeProviderIndex++
      placeRetryTimer.interval = 250
      placeRetryTimer.restart()
      return
    }
    if (panel.placeRetries >= 2) {
      console.warn("weather: place lookup failed:", panel.placeRequestKind)
      // Without coordinates there is no forecast to fetch at all; that makes
      // this the definitive refresh failure and may unlock the cache.
      if (!panel.hasConfiguredCoordinates && !panel.areaInfo) panel.recordForecastRefreshFailure()
      return
    }
    panel.placeRetries++
    panel.placeProviderIndex = 0
    placeRetryTimer.interval = 2500
    placeRetryTimer.restart()
  }

  property WeatherRequest placeProc: WeatherRequest {
    onFinished: function(text) {
      if (!applyPlace(text)) schedulePlaceRetry()
    }
  }

  property Timer placeRetryTimer: Timer {
    interval: 2500
    onTriggered: refreshPlace()
  }
}
