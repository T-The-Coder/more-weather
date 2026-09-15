import QtQuick
import "Model.js" as Model

// Air quality and pollen for the shown place from Open-Meteo's air quality
// API (Copernicus CAMS). Only fetched while the section or the menu bar hint
// is switched on, at most once an hour per place, and paused while
// Open-Meteo is rate limited. The last values for a place stay available
// when a later fetch fails.
Item {
  required property var panel

  property var report: null
  property string reportKey: ""
  property double fetchedAtMs: 0
  property string requestKey: ""
  // "idle", "loading", "ok", or "failed" (request failed or rate limited).
  property string loadStatus: "idle"
  readonly property int maxAgeMs: 60 * 60 * 1000
  // Older values are shown in italics, like other cached data.
  readonly property bool stale: report !== null && panel.relativeTimeNowMs - fetchedAtMs > 2 * maxAgeMs

  function placeKey() {
    var lat = Number(panel.mapCenterLatitude)
    var lon = Number(panel.mapCenterLongitude)
    if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)) return ""
    return lat.toFixed(2) + "," + lon.toFixed(2)
  }

  function refresh() {
    if (!panel.airQualityWanted) return
    var key = placeKey()
    if (!key) return
    // Never show another place's values while the new place loads.
    if (key !== reportKey && report !== null) {
      report = null
      loadStatus = "idle"
    }
    if (key === reportKey && Date.now() - fetchedAtMs < maxAgeMs) return
    if (airRequest.running) return
    if (!panel.openMeteoAvailable()) {
      if (report === null) loadStatus = "failed"
      return
    }
    requestKey = key
    if (report === null) loadStatus = "loading"
    airRequest.request = {
      url: Model.airQualityRequestUrl(panel.mapCenterLatitude, panel.mapCenterLongitude),
      timeoutMs: 8000
    }
    airRequest.running = true
  }

  // Checks every five minutes; refresh() itself limits fetches to hourly.
  property Timer ageTimer: Timer {
    interval: 5 * 60 * 1000
    running: panel.airQualityWanted
    repeat: true
    triggeredOnStart: true
    onTriggered: refresh()
  }

  property WeatherRequest airRequest: WeatherRequest {
    onFinished: function(text) {
      try {
        var parsed = JSON.parse(String(text || ""))
        if (parsed && parsed.current && requestKey === placeKey()) {
          report = parsed
          reportKey = requestKey
          fetchedAtMs = Date.now()
          loadStatus = "ok"
        }
      } catch (e) { }
    }
    onExited: function(exitCode) {
      if (exitCode !== 0) panel.noteOpenMeteoResponse(airRequest)
      if (loadStatus === "loading") loadStatus = "failed"
    }
  }
}
