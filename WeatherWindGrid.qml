import QtQuick
import "Model.js" as Model

// The 5x7 Best Match wind grid behind the wind map, fetched for the map's
// current extent at startup, hourly in the background and on a manual
// refresh, so the wind tab opens with data already in place. Grids are shared
// with the other instance (bar or app) through WeatherSharedLiveData: a grid
// the other one fetched within the hour is used instead of a new request.
Item {
  required property var panel

  // Start of the last grid request, successful or not. The background check
  // waits backgroundRetryMs after it so a failing request is not retried
  // every minute.
  property double fetchStartedMs: 0
  readonly property int backgroundRetryMs: 15 * 60 * 1000
  // Time of the last manual refresh: grids older than this are not reused.
  property double forceSinceMs: 0

  // The "f" marks grids spread over the flat map extent; square grids cached
  // before the map was unsquashed no longer match.
  function extentKey(latitude, longitude, radiusKm) {
    return Number(latitude).toFixed(3) + "," + Number(longitude).toFixed(3) + "," + Math.round(radiusKm) + ",f"
  }

  function rememberWindGrid(key, report, at) {
    if (!key || !report) return
    var now = Date.now()
    var next = ({})
    for (var existing in panel.windGridCache)
      if (now - panel.windGridCache[existing].at < panel.windGridCacheMs) next[existing] = panel.windGridCache[existing]
    next[key] = { at: Number(at || now), report: report }
    panel.windGridCache = next
  }

  function usableGrid(entry) {
    return !!entry && Number(entry.at) >= forceSinceMs
      && Date.now() - Number(entry.at) < panel.windGridCacheMs
  }

  function showWindGrid(key, report) {
    panel.windGridRefreshPending = false
    panel.windGridFailed = false
    panel.windGridLoading = false
    if (panel.windGridReport !== report) panel.windGridReport = report
  }

  // Manual refresh: drop every remembered grid so the next request fetches.
  function invalidate() {
    forceSinceMs = Date.now()
    panel.windGridCache = ({})
    windGridDebounce.restart()
  }

  // A grid the other instance published. Shown right away when it covers
  // the current extent and is newer than what this instance holds.
  function adoptSharedGrid(key, entry) {
    var local = panel.windGridCache[key]
    if (!usableGrid(entry) || (local && Number(local.at) >= Number(entry.at))) return
    rememberWindGrid(key, entry.report, entry.at)
    var current = extentKey(panel.mapCenterLatitude, panel.mapCenterLongitude, panel.mapRadiusKm)
    if (key === current) {
      claimWaitTimer.stop()
      showWindGrid(key, entry.report)
    }
  }

  // Load a 5×7 Best Match vector grid for the map's current physical extent.
  // Zooming therefore changes both the basemap and the sampled wind field,
  // instead of projecting a fixed ±150 km grid onto a different viewport.
  function requestWindGrid(latitude, longitude) {
    var lat = latitude === undefined ? Number(panel.mapCenterLatitude) : Number(latitude)
    var lon = longitude === undefined ? Number(panel.mapCenterLongitude) : Number(longitude)
    var radiusKm = Number(panel.mapRadiusKm)
    var cacheKey = extentKey(lat, lon, radiusKm)
    if (windGridProc.running) {
      // Startup and a manual refresh ask from several places at once; only
      // a different extent (or a refresh after this request began) needs
      // another request.
      if (cacheKey !== panel.windGridRequestKey || fetchStartedMs < forceSinceMs)
        panel.windGridRefreshPending = true
      return
    }

    if ((!panel.hasConfiguredCoordinates && !panel.areaInfo) || !isFinite(lat) || !isFinite(lon)) return
    // The shared file decides whether the other instance already has this
    // grid; loading it starts the first request.
    if (!panel.sharedLiveLoaded) return
    panel.windGridRequestLatitude = lat
    panel.windGridRequestLongitude = lon
    panel.windGridRequestRadiusKm = radiusKm

    // The 35-point grid is by far the most expensive Open-Meteo request, so
    // a grid is reused for an hour; the regular forecast cycle, reopening the
    // tab, zooming back and the other instance's grids all count.
    var cached = panel.windGridCache[cacheKey]
    if (usableGrid(cached)) {
      showWindGrid(cacheKey, cached.report)
      return
    }
    var shared = panel.sharedLive.sharedWindGrid(cacheKey, forceSinceMs)
    if (shared) {
      rememberWindGrid(cacheKey, shared.report, shared.at)
      showWindGrid(cacheKey, shared.report)
      return
    }
    // The other instance is fetching this grid right now; wait for it to
    // publish (adoptSharedGrid) or for its claim to expire.
    if (panel.sharedLive.windGridClaimedByOther(cacheKey)) {
      panel.windGridRefreshPending = false
      if (!panel.windGridReport) panel.windGridLoading = true
      claimWaitTimer.restart()
      return
    }
    if (!panel.openMeteoAvailable()) {
      panel.windGridRefreshPending = false
      panel.windGridLoading = false
      panel.windGridFailed = true
      return
    }
    panel.windGridRequestKey = cacheKey
    panel.windGridRefreshPending = false
    panel.windGridResponseAccepted = false
    panel.windGridFailed = false
    panel.windGridLoading = true
    fetchStartedMs = Date.now()
    panel.sharedLive.claimWindGrid(cacheKey)

    // One batched Open-Meteo request returns all 35 sample points.
    var windLatitudes = []
    var windLongitudes = []
    var windRows = 5
    var windColumns = 7
    // Spread over the map picture's extent, which is flatter than it is wide.
    var latRadius = Model.mapLatitudeRadiusKm(radiusKm) / 111.32
    var lonRadius = radiusKm / (111.32 * Math.max(0.2, Math.cos(lat * Math.PI / 180)))
    for (var windRow = 0; windRow < windRows; ++windRow) {
      var gridLat = lat + latRadius - 2 * latRadius * windRow / (windRows - 1)
      for (var windColumn = 0; windColumn < windColumns; ++windColumn) {
        windLatitudes.push(gridLat.toFixed(4))
        windLongitudes.push((lon - lonRadius + 2 * lonRadius * windColumn / (windColumns - 1)).toFixed(4))
      }
    }
    var windGridUrl = "https://api.open-meteo.com/v1/forecast"
      + "?latitude=" + windLatitudes.join(",")
      + "&longitude=" + windLongitudes.join(",")
      + "&current=wind_speed_10m,wind_direction_10m,wind_gusts_10m,precipitation"
      + "&wind_speed_unit=kmh"
    windGridProc.request = { url: windGridUrl, timeoutMs: 12000 }
    windGridProc.running = true
  }

  property Timer windGridDebounce: Timer {
    interval: 350
    onTriggered: requestWindGrid()
  }

  property Timer claimWaitTimer: Timer {
    // WeatherSharedLiveData.windGridClaimMs plus a second.
    interval: 31 * 1000
    onTriggered: requestWindGrid()
  }

  // Hourly background refresh. Checked once a minute against wall-clock time
  // (like the forecast cycle) so it also catches up after suspend; the cache
  // turns every check within the hour into a no-op.
  property Timer windGridBackgroundTimer: Timer {
    interval: 60 * 1000
    running: true
    repeat: true
    onTriggered: {
      var key = extentKey(panel.mapCenterLatitude, panel.mapCenterLongitude, panel.mapRadiusKm)
      if (!usableGrid(panel.windGridCache[key]) && Date.now() - fetchStartedMs >= backgroundRetryMs)
        requestWindGrid()
    }
  }

  property WeatherRequest windGridProc: WeatherRequest {
    onExited: function(exitCode) {
      panel.windGridLoading = false
      if (exitCode !== 0 || !panel.windGridResponseAccepted) {
        panel.noteOpenMeteoResponse(windGridProc)
        panel.windGridFailed = true
        panel.sharedLive.releaseWindGridClaim(panel.windGridRequestKey)
        console.warn("weather: Best Match wind grid request failed with exit code", exitCode)
      }
      if (panel.windGridRefreshPending) {
        panel.windGridRefreshPending = false
        windGridDebounce.restart()
      }
    }
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        if ((Array.isArray(parsed) && parsed.length) || parsed.current) {
          panel.windGridResponseAccepted = true
          panel.windGridFailed = false
          // Dated by the request's start, so a manual refresh made while it
          // was running still fetches again.
          var at = fetchStartedMs
          rememberWindGrid(panel.windGridRequestKey, parsed, at)
          panel.sharedLive.publishWindGrid(panel.windGridRequestKey, at, parsed)
          // A location/zoom change can finish while an older request is
          // still in flight. Never flash that stale grid on the new map.
          if (!panel.windGridRefreshPending) panel.windGridReport = parsed
        }
      } catch (e) {
        panel.windGridResponseAccepted = false
      }
    }
  }
}
