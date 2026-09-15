import QtQuick
import "Model.js" as Model

// City labels for the radar and wind maps from OpenStreetMap (Overpass),
// cached on disk and refetched only when the map leaves the cached area.
Item {
  required property var panel

  function radarPlaceCacheCovers(latitude, longitude, radiusKm) {
    var cache = panel.radarPlaceCache || {}
    // Never let a transient empty Overpass response suppress labels for the
    // next 30 days. Only a cache containing actual places can cover a map.
    if (!Array.isArray(cache.places) || cache.places.length === 0
        || !(Number(cache.radiusKm) > 0)) return false
    if (String(cache.language || "") !== panel.interfaceLanguage) return false
    var age = Date.now() - Number(cache.fetchedAt || 0)
    if (!(age >= 0) || age > 30 * 24 * 60 * 60 * 1000) return false
    var centerDistance = Model.geographicDistanceKm(latitude, longitude,
      cache.centerLatitude, cache.centerLongitude)
    return isFinite(centerDistance) && centerDistance + radiusKm <= Number(cache.radiusKm)
  }

  function ensureRadarPlaces() {
    if (radarPlacesProc.running) return
    if (!panel.hasConfiguredCoordinates && !panel.areaInfo) return
    var latitude = Number(panel.mapCenterLatitude)
    var longitude = Number(panel.mapCenterLongitude)
    if (!isFinite(latitude) || !isFinite(longitude)) return
    var requestRadiusKm = panel.mapRadiusKm * 1.18
    // "Nearby" labels do not need to cover a very wide zoom level. Keeping
    // the actual Overpass query local makes it fast and avoids pulling in a
    // dense regional road/city context; cache coverage still follows the map.
    var queryRadiusKm = Math.min(requestRadiusKm, 120)
    if (radarPlaceCacheCovers(latitude, longitude, requestRadiusKm)) return

    panel.radarPlacesRequestLatitude = latitude
    panel.radarPlacesRequestLongitude = longitude
    panel.radarPlacesRequestRadiusKm = requestRadiusKm
    panel.radarPlacesRequestLanguage = panel.interfaceLanguage
    var latitudeRadius = queryRadiusKm / 111.32
    var longitudeRadius = queryRadiusKm
      / (111.32 * Math.max(0.2, Math.cos(latitude * Math.PI / 180)))
    var bbox = (latitude - latitudeRadius).toFixed(5) + ","
      + (longitude - longitudeRadius).toFixed(5) + ","
      + (latitude + latitudeRadius).toFixed(5) + ","
      + (longitude + longitudeRadius).toFixed(5)
    // Place nodes are both faster and less ambiguous than fetching complete
    // municipal boundaries. Limit the public query to cities; the Canvas
    // intentionally displays only a handful of large orientation points.
    var query = "[out:json][timeout:35];node[\"place\"=\"city\"][\"name\"]("
      + bbox + ");out body qt;"
    panel.radarPlacesQuery = query
    panel.radarPlacesEndpointIndex = 0
    panel.radarPlacesLoading = true
    startRadarPlacesEndpoint()
  }

  function startRadarPlacesEndpoint() {
    if (radarPlacesProc.running || panel.radarPlacesEndpointIndex >= panel.radarPlacesEndpoints.length) return
    panel.radarPlacesResponseAccepted = false
    radarPlacesProc.request = {
      url: panel.radarPlacesEndpoints[panel.radarPlacesEndpointIndex],
      method: "POST",
      body: "data=" + encodeURIComponent(panel.radarPlacesQuery),
      timeoutMs: 40000
    }
    radarPlacesProc.running = true
  }

  property Timer radarPlacesDebounce: Timer {
    interval: 500
    onTriggered: ensureRadarPlaces()
  }

  property Timer radarPlacesEndpointFallbackTimer: Timer {
    interval: 200
    onTriggered: startRadarPlacesEndpoint()
  }

  property WeatherRequest radarPlacesProc: WeatherRequest {
    onExited: function(exitCode) {
      if ((exitCode !== 0 || !panel.radarPlacesResponseAccepted)
          && panel.radarPlacesEndpointIndex + 1 < panel.radarPlacesEndpoints.length) {
        panel.radarPlacesEndpointIndex++
        radarPlacesEndpointFallbackTimer.restart()
        return
      }
      panel.radarPlacesLoading = false
      if (exitCode !== 0 || !panel.radarPlacesResponseAccepted)
        console.warn("weather: all OSM place providers failed; retaining last good labels")
      var moved = Model.geographicDistanceKm(panel.mapCenterLatitude, panel.mapCenterLongitude,
        panel.radarPlacesRequestLatitude, panel.radarPlacesRequestLongitude)
      var requestedExtentChanged = moved + panel.mapRadiusKm * 1.18 > panel.radarPlacesRequestRadiusKm
        || panel.interfaceLanguage !== panel.radarPlacesRequestLanguage
      if (requestedExtentChanged) radarPlacesDebounce.restart()
    }
    onFinished: function(text) {
      var raw = String(text || "").trim()
      if (!raw) return
      try {
        var response = JSON.parse(raw)
        if (!response || !Array.isArray(response.elements)) {
          console.warn("weather: OSM place query returned no element list")
          return
        }
        var places = Model.parseOverpassPlaces(raw, panel.radarPlacesRequestLanguage)
        if (!places.length) {
          console.warn("weather: OSM place query returned no usable places")
          return
        }
        var cache = {
          centerLatitude: panel.radarPlacesRequestLatitude,
          centerLongitude: panel.radarPlacesRequestLongitude,
          radiusKm: panel.radarPlacesRequestRadiusKm,
          language: panel.radarPlacesRequestLanguage,
          fetchedAt: Date.now(),
          places: places
        }
        panel.radarPlacesResponseAccepted = true
        panel.radarPlaceCache = cache
        panel.radarPlacesCacheFile.setText(JSON.stringify(cache) + "\n")
      } catch (e) {
        console.warn("weather: could not parse OSM place response:", e)
      }
    }
  }
}
