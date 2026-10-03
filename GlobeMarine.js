.pragma library

// Sea surface temperature for the globe section from Open-Meteo's Marine
// API: the request for many places at once, reading the answer, and which
// places are sea (so land is never asked for). Pure functions, tested in
// Node (tests/globe-marine.test.mjs).
//
// The API (checked 2026-10-03): /v1/marine with comma-separated latitude
// and longitude lists, hourly=sea_surface_temperature (°C),
// forecast_days=1, timeformat=unixtime. Several places answer as a JSON
// array in request order (from the second one on with a location_id), a
// single place as one object. Places on land answer 200 with every value
// null. About 700 bytes per place for a day of hourly values.

var URL_BASE = "https://marine-api.open-meteo.com/v1/marine"
var BYTES_PER_POINT = 1200     // measured ~700 for 24 hourly values, with room
var MAX_POINTS = 100           // per request, to keep the URL short

function coordinate(value) {
  return (Math.round(Number(value) * 100) / 100).toFixed(2)
}

// { url, maxBytes } for the places ([{ lat, lon }], at most MAX_POINTS of
// them; see requests()).
function request(points) {
  var lats = [], lons = []
  for (var i = 0; i < points.length; i++) {
    lats.push(coordinate(points[i].lat))
    lons.push(coordinate(points[i].lon))
  }
  return {
    url: URL_BASE + "?latitude=" + lats.join(",") + "&longitude=" + lons.join(",") +
         "&hourly=sea_surface_temperature&forecast_days=1&timeformat=unixtime",
    maxBytes: 2048 + BYTES_PER_POINT * points.length
  }
}

// The places split into requests of at most `perRequest` (default
// MAX_POINTS): [{ url, maxBytes, points }].
function requests(points, perRequest) {
  var size = Math.max(1, Number(perRequest) || MAX_POINTS)
  var list = []
  for (var i = 0; i < points.length; i += size) {
    var chunk = points.slice(i, i + size)
    var req = request(chunk)
    list.push({ url: req.url, maxBytes: req.maxBytes, points: chunk })
  }
  return list
}

function number(v) {
  return typeof v === "number" && v === v ? v : NaN
}

// { times (ms), values: [[°C per time] per place] } from the answer's
// text; a place without an answer or on land has NaN values. Broken text
// gives no times and empty values.
function parse(text, points) {
  var count = points ? points.length : 0
  var empty = { times: [], values: [] }
  for (var e = 0; e < count; e++) empty.values.push([])
  var data
  try { data = JSON.parse(text) } catch (err) { return empty }
  if (!data || typeof data !== "object") return empty
  var list = Array.isArray(data) ? data : [data]
  var times = []
  for (var f = 0; f < list.length && !times.length; f++) {
    var hourly = list[f] && list[f].hourly
    if (hourly && Array.isArray(hourly.time))
      for (var t = 0; t < hourly.time.length; t++) times.push(Number(hourly.time[t]) * 1000)
  }
  if (!times.length) return empty
  var values = []
  for (var p = 0; p < Math.max(count, list.length); p++) {
    var row = []
    for (var k = 0; k < times.length; k++) row.push(NaN)
    values.push(row)
  }
  for (var i = 0; i < list.length; i++) {
    var entry = list[i]
    if (!entry || !entry.hourly || !Array.isArray(entry.hourly.sea_surface_temperature)) continue
    var index = typeof entry.location_id === "number" ? entry.location_id : i
    if (index < 0 || index >= values.length) continue
    var sst = entry.hourly.sea_surface_temperature
    for (var j = 0; j < times.length && j < sst.length; j++) values[index][j] = number(sst[j])
  }
  if (count) values.length = count
  return { times: times, values: values }
}

// Land rings from data/globe-land.json ({ scale, land: [[lon, lat, …]] }
// in 1/scale degrees), each with its bounding box; kept for the same data.
var landCache = { data: null, rings: null, scale: 1 }

function prepareLand(data) {
  if (!data || !data.land) return null
  if (landCache.data === data) return landCache
  var rings = []
  for (var r = 0; r < data.land.length; r++) {
    var ring = data.land[r]
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (var i = 0; i + 1 < ring.length; i += 2) {
      if (ring[i] < minX) minX = ring[i]
      if (ring[i] > maxX) maxX = ring[i]
      if (ring[i + 1] < minY) minY = ring[i + 1]
      if (ring[i + 1] > maxY) maxY = ring[i + 1]
    }
    rings.push({ points: ring, minX: minX, maxX: maxX, minY: minY, maxY: maxY })
  }
  landCache = { data: data, rings: rings, scale: Number(data.scale) || 1 }
  return landCache
}

// Even-odd test of (x, y) against one flat ring.
function inRing(ring, x, y) {
  var inside = false, n = ring.length
  for (var i = 0, j = n - 2; i < n; j = i, i += 2) {
    var xi = ring[i], yi = ring[i + 1], xj = ring[j], yj = ring[j + 1]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

// Whether (lat, lon) is sea: in none of the land rings. landRings is the
// parsed data/globe-land.json; without it everything counts as sea.
function isOcean(landRings, lat, lon) {
  var land = prepareLand(landRings)
  if (!land) return true
  var x = (((Number(lon) + 180) % 360 + 360) % 360 - 180) * land.scale
  var y = Number(lat) * land.scale
  for (var r = 0; r < land.rings.length; r++) {
    var ring = land.rings[r]
    if (x < ring.minX || x > ring.maxX || y < ring.minY || y > ring.maxY) continue
    if (inRing(ring.points, x, y)) return false
  }
  return true
}

// The places ([{ lat, lon }]) that are sea.
function oceanPoints(points, landRings) {
  var result = []
  for (var i = 0; i < points.length; i++)
    if (isOcean(landRings, points[i].lat, points[i].lon)) result.push(points[i])
  return result
}

if (typeof module !== "undefined") module.exports = {
  request: request, requests: requests, parse: parse, isOcean: isOcean, oceanPoints: oceanPoints,
  URL_BASE: URL_BASE, BYTES_PER_POINT: BYTES_PER_POINT, MAX_POINTS: MAX_POINTS
}
