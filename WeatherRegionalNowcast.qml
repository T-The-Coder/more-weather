import QtQuick
import "Model.js" as Model
import "Providers.js" as Providers

// Rain in the next two hours from a national radar nowcast beyond the DWD
// radar: MET Norway Nowcast 2.0 in Norway, Sweden, Finland and Denmark,
// GeoSphere Austria's INCA nowcast in Austria, Buienradar (KNMI radar) in
// the Netherlands and Belgium, JMA in Japan. Each is renewed every five
// minutes; rainNowcastSeries takes `points` for the 15-minute slots they
// cover. JMA has no point data: its time lists are read, then the one tile
// pixel at the place for the newest observation and each forecast step. A
// failed request keeps the last points until they have run out.
QtObject {
  id: nowcast
  required property var panel

  readonly property real latitude: Number(panel.forecastRequestLatitude || panel.mapCenterLatitude)
  readonly property real longitude: Number(panel.forecastRequestLongitude || panel.mapCenterLongitude)
  readonly property string providerId: isFinite(latitude) && isFinite(longitude)
    ? Providers.regionalNowcastProvider(panel.providerCountry, latitude, longitude) : ""
  readonly property string requestKey: providerId === "" ? ""
    : providerId + "@" + latitude.toFixed(3) + "," + longitude.toFixed(3)

  property var points: []
  // JMA: observed and forecast times (Model.jmaTargetTimes), kept for the
  // radar map's JMA layer too.
  property var jmaObserved: []
  property var jmaForecast: []
  property var jmaQueue: []
  property var jmaPoints: []
  property string jmaStep: ""
  property string pointsKey: ""
  property string activeProviderId: ""
  property double fetchedAtMs: 0
  // Every five minutes, or the longer radar interval from the settings.
  readonly property int refreshMs: panel.radarRefreshMs || 5 * 60 * 1000

  // Points of another place or source never reach the chart.
  readonly property var currentPoints: pointsKey === requestKey ? points : []

  onRequestKeyChanged: {
    // A round for the previous place is dropped.
    if (jmaStep !== "") {
      request.running = false
      jmaStep = ""
    }
    if (requestKey === "") {
      points = []
      pointsKey = ""
      activeProviderId = ""
    }
    refresh()
  }

  function refresh() {
    if (requestKey === "" || request.running || jmaStep !== "") return
    if (providerId === "jma") {
      jmaPoints = []
      jmaFetch("observed", "https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json", false)
      return
    }
    var spec = Providers.regionalNowcastRequest(providerId, latitude, longitude)
    if (!spec) return
    request.key = requestKey
    request.provider = providerId
    request.request = spec
    request.running = true
  }

  function jmaFetch(step, url, binary) {
    jmaStep = step
    request.key = requestKey
    request.provider = "jma"
    request.request = { url: url, timeoutMs: 8000, binary: binary }
    request.running = true
  }

  // The newest observation, then every forecast step, one tile each.
  function jmaNextTile() {
    if (!jmaQueue.length) {
      points = jmaPoints
      pointsKey = requestKey
      activeProviderId = jmaPoints.length ? "jma" : ""
      fetchedAtMs = Date.now()
      jmaStep = ""
      return
    }
    var time = jmaQueue[0]
    jmaQueue = jmaQueue.slice(1)
    var tile = Model.mercatorTile(latitude, longitude, 10)
    request.time = time
    request.tile = tile
    jmaFetch("tile", Model.jmaTileUrl(time, 10, tile.x, tile.y), true)
  }

  function jmaFinished(raw) {
    if (jmaStep === "observed") {
      jmaObserved = Model.jmaTargetTimes(raw) || []
      jmaFetch("forecast", "https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json", false)
    } else if (jmaStep === "forecast") {
      jmaForecast = Model.jmaTargetTimes(raw) || []
      var queue = jmaObserved.length ? [jmaObserved[jmaObserved.length - 1]] : []
      jmaQueue = queue.concat(jmaForecast)
      jmaNextTile()
    } else if (jmaStep === "tile") {
      var rate = Model.jmaTileRainRate(raw, request.tile.px, request.tile.py)
      if (rate !== null) {
        var list = jmaPoints.slice()
        list.push({ start: request.time.ms, end: request.time.ms + 5 * 60 * 1000, rate: rate })
        jmaPoints = list
      }
      jmaNextTile()
    }
  }

  property WeatherRequest request: WeatherRequest {
    property var time: null
    property var tile: null
    // A JMA step that fails ends the round with what it has.
    onExited: function(exitCode) {
      if (exitCode !== 0 && provider === "jma" && nowcast.jmaStep !== "") {
        if (nowcast.jmaStep === "tile") nowcast.jmaNextTile()
        else nowcast.jmaStep = ""
      }
    }
    property string key: ""
    property string provider: ""
    onFinished: function(text) {
      var raw = String(text || "")
      if (!raw || key !== nowcast.requestKey) return
      if (provider === "jma") {
        nowcast.jmaFinished(raw)
        return
      }
      raw = raw.trim()
      var parsed = provider === "geosphere" ? Model.geosphereNowcastPoints(raw)
        : (provider === "buienradar" ? Model.buienradarNowcastPoints(raw, new Date()) : Model.metNowcastPoints(raw))
      if (parsed === null) return
      nowcast.points = parsed
      nowcast.pointsKey = key
      nowcast.activeProviderId = parsed.length ? provider : ""
      nowcast.fetchedAtMs = Date.now()
    }
  }

  property Timer refreshTimer: Timer {
    interval: 60 * 1000
    repeat: true
    running: nowcast.requestKey !== ""
    onTriggered: if (Date.now() - nowcast.fetchedAtMs >= nowcast.refreshMs) nowcast.refresh()
  }
}
