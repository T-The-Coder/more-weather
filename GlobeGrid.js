// The globe's weather points (WeatherGlobeData.qml, GlobeWorker.js): where
// the model is asked, how the points are batched and tiled, the request URL,
// the compact form kept in the cache, and the daily request budget. Pure
// functions, tested in Node (tests/globe-grid.test.mjs). No ".pragma
// library": GlobeWorker.js takes it in with Qt.include.
//
// Global (the whole disc, z0–z1): rings every 9° from 81° S to 81° N with
// round(40·cos lat) points each, plus the poles: 510 points, five days in
// 3-hour steps. They load in 7 interleaved batches (point i in batch i % 7),
// so the first answer already covers the earth coarsely.
// Regional (z2–z5): tiles of 4 × 4 points, corners included (neighbouring
// tiles share their edge points, so values join without seams), 15°, 7.5°,
// 3.75° and 1.875° high, as wide as that at the band's latitude; 48 hours
// hourly.

var RING_STEP = 9
var RING_POINTS = 40
var BATCHES = 7
var GLOBAL_HOURS = 120
var TILE_HOURS = 48
var TILE_POINTS = 4
var TILE_SIZES = { 2: 15, 3: 7.5, 4: 3.75, 5: 1.875 }
var GLOBAL_TTL_MS = 6 * 60 * 60 * 1000
var TILE_TTL_MS = 3 * 60 * 60 * 1000
var MAX_TILES = 60
// Point-calls per UTC day: from the first no automatic renewals, from the
// second no requests at all.
var BUDGET_MANUAL = 2000
var BUDGET_STOP = 3000
var VARIABLES = ["temperature_2m", "cloud_cover", "precipitation", "weather_code", "cape", "pressure_msl",
  "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"]
// Kept as integers: the value times its scale.
var SCALES = { temperature_2m: 10, cloud_cover: 1, precipitation: 100, weather_code: 1, cape: 1, pressure_msl: 10,
  wind_speed_10m: 10, wind_direction_10m: 1, wind_gusts_10m: 10 }

function ringLats() {
  var list = []
  for (var lat = -90 + RING_STEP; lat < 90; lat += RING_STEP) list.push(lat)
  return list
}

function ringCount(lat) {
  return Math.max(1, Math.round(RING_POINTS * Math.cos(lat * Math.PI / 180)))
}

// Every global point in order: the south pole, the rings from south to
// north (longitudes from −180° east), the north pole. { lat, lon, ring }.
function globalPoints() {
  var points = [{ lat: -90, lon: 0, ring: 0 }]
  var lats = ringLats()
  for (var r = 0; r < lats.length; r++) {
    var count = ringCount(lats[r])
    for (var j = 0; j < count; j++) points.push({ lat: lats[r], lon: -180 + j * 360 / count, ring: r + 1 })
  }
  points.push({ lat: 90, lon: 0, ring: lats.length + 1 })
  return points
}

// The points of batch k (every BATCHES-th point from k), with their index.
function batchPoints(k) {
  var all = globalPoints()
  var list = []
  for (var i = k; i < all.length; i += BATCHES) list.push({ lat: all[i].lat, lon: all[i].lon, index: i })
  return list
}

function batchKey(k) {
  return "G9:" + k
}

// ---- Tiles.
function tileSize(level) {
  return TILE_SIZES[Math.max(2, Math.min(5, Math.round(level)))]
}
function tileRow(lat, level) {
  var size = tileSize(level)
  return Math.max(0, Math.min(Math.round(180 / size) - 1, Math.floor((Math.max(-90, Math.min(90, lat)) + 90) / size)))
}
// The longitude width of a tile in a row: the height, widened by 1/cos of
// the band's middle, so that a whole number fits round the earth.
function tileLonSize(level, row) {
  var size = tileSize(level)
  var middle = -90 + (row + 0.5) * size
  var wide = size / Math.max(0.05, Math.cos(middle * Math.PI / 180))
  return 360 / Math.max(1, Math.round(360 / wide))
}
function tileColumns(level, row) {
  return Math.round(360 / tileLonSize(level, row))
}
function tileKey(level, row, col) {
  return "T" + level + ":" + row + ":" + col
}
function parseTileKey(key) {
  var match = /^T(\d):(\d+):(\d+)$/.exec(String(key))
  return match ? { level: Number(match[1]), row: Number(match[2]), col: Number(match[3]) } : null
}
function tileAt(lat, lon, level) {
  var row = tileRow(lat, level)
  var width = tileLonSize(level, row)
  var columns = tileColumns(level, row)
  var col = Math.floor((wrapLon(lon) + 180) / width) % columns
  return tileKey(level, row, col)
}
function tileBounds(key) {
  var t = parseTileKey(key)
  if (!t) return null
  var size = tileSize(t.level)
  var width = tileLonSize(t.level, t.row)
  var south = -90 + t.row * size
  var west = -180 + t.col * width
  return { south: south, north: south + size, west: west, east: west + width }
}
// The 4 × 4 points, row by row from the south-west corner, corners included.
function tilePoints(key) {
  var b = tileBounds(key)
  if (!b) return []
  var list = []
  for (var i = 0; i < TILE_POINTS; i++)
    for (var j = 0; j < TILE_POINTS; j++)
      list.push({ lat: b.south + (b.north - b.south) * i / (TILE_POINTS - 1),
        lon: b.west + (b.east - b.west) * j / (TILE_POINTS - 1) })
  return list
}
// The tiles of a level covering a box (west/east may run past ±180°).
function tilesFor(box, level) {
  var keys = []
  var seen = {}
  var first = tileRow(box.south, level)
  var last = tileRow(box.north, level)
  for (var row = first; row <= last; row++) {
    var width = tileLonSize(level, row)
    var columns = tileColumns(level, row)
    var from = Math.floor((box.west + 180) / width)
    var to = Math.floor((box.east + 180) / width)
    if (to - from >= columns) { from = 0; to = columns - 1 }
    for (var c = from; c <= to; c++) {
      var key = tileKey(level, row, ((c % columns) + columns) % columns)
      if (!seen[key]) { seen[key] = true; keys.push(key) }
    }
  }
  return keys
}

function wrapLon(lon) {
  return ((Number(lon) + 180) % 360 + 360) % 360 - 180
}

// ---- The request: { url, timeoutMs, maxBytes } for WeatherRequest.
function coordinate(value) {
  return String(Math.round(value * 100) / 100)
}
function forecastRequest(points, kind) {
  var lats = [], lons = []
  for (var i = 0; i < points.length; i++) {
    lats.push(coordinate(points[i].lat))
    lons.push(coordinate(wrapLon(points[i].lon)))
  }
  var global = kind === "global"
  return {
    url: "https://api.open-meteo.com/v1/forecast?latitude=" + lats.join(",") + "&longitude=" + lons.join(",")
      + "&hourly=" + VARIABLES.join(",")
      + (global ? "&temporal_resolution=hourly_3&forecast_hours=" + GLOBAL_HOURS : "&forecast_hours=" + TILE_HOURS)
      + "&timeformat=unixtime&timezone=GMT",
    timeoutMs: 20000,
    // About 2.7 KB a point for five 3-hourly days, 3 KB for 48 hours: twice that.
    maxBytes: Math.max(64 * 1024, points.length * 6 * 1024)
  }
}

// ---- The daily budget.
function utcDay(ms) {
  return new Date(Number(ms)).toISOString().slice(0, 10)
}
// "ok", "manual" (only loads the user causes) or "stop".
function budgetState(count) {
  var n = Number(count) || 0
  return n >= BUDGET_STOP ? "stop" : (n >= BUDGET_MANUAL ? "manual" : "ok")
}
function mayLoad(count, userCaused) {
  var state = budgetState(count)
  return state === "ok" || (state === "manual" && !!userCaused)
}
// The day's count after adding `points` at `nowMs`: a new day starts at 0.
function countedCalls(calls, points, nowMs) {
  var day = utcDay(nowMs)
  var count = calls && calls.utcDay === day ? Number(calls.count) || 0 : 0
  return { utcDay: day, count: count + points }
}

// ---- Least recently used tiles: the key moves to the front; returns the
// list and the keys that fall off beyond `max`.
function touchedLru(list, key, max) {
  var next = [key]
  for (var i = 0; i < list.length; i++) if (list[i] !== key) next.push(list[i])
  return { list: next.slice(0, max), evicted: next.slice(max) }
}

// ---- The compact form (cache files, the worker's store): points as
// [lat, lon], times in unix seconds, each variable as integers point by
// point (value · scale, null where missing).
function compactFromResponse(text, points, kind, key, nowMs) {
  var data = JSON.parse(String(text))
  var list = Array.isArray(data) ? data : [data]
  if (!list.length || list.length !== points.length) return null
  var times = list[0].hourly && list[0].hourly.time ? list[0].hourly.time : []
  var vars = {}
  for (var v = 0; v < VARIABLES.length; v++) {
    var name = VARIABLES[v]
    var scale = SCALES[name]
    var out = new Array(points.length * times.length)
    for (var p = 0; p < list.length; p++) {
      var series = list[p].hourly && list[p].hourly[name] ? list[p].hourly[name] : []
      for (var t = 0; t < times.length; t++) {
        var value = series[t]
        out[p * times.length + t] = value === null || value === undefined || !isFinite(value) ? null : Math.round(value * scale)
      }
    }
    vars[name] = out
  }
  return {
    v: 1, kind: kind, key: key, at: Number(nowMs),
    points: points.map(function(point) { return [point.lat, point.lon] }),
    times: times, vars: vars
  }
}

// A variable's value at point p and time step t, or NaN.
function compactValue(compact, name, p, t) {
  var values = compact.vars[name]
  var value = values ? values[p * compact.times.length + t] : null
  return value === null || value === undefined ? NaN : value / SCALES[name]
}

// The time step nearest to `ms` (unix seconds in `times`).
function nearestStep(times, ms) {
  var target = Number(ms) / 1000
  var best = 0
  for (var i = 1; i < times.length; i++) if (Math.abs(times[i] - target) < Math.abs(times[best] - target)) best = i
  return best
}

// A variable's value in mm/h, °C, % …: precipitation in a 3-hourly step
// is the sum of the three hours.
function rateValue(compact, name, p, t) {
  var value = compactValue(compact, name, p, t)
  return name === "precipitation" && compact.kind === "global" ? value / 3 : value
}

// ---- Lattices: values at grid nodes, { south, north, west, east, cols,
//      rows, values (row by row from the south-west, NaN where unknown),
//      wrap (the longitudes go round) }.

// The whole earth, every 2.5°, from the global batches loaded so far: along
// each ring between its known points (round the ring), then between the
// rings above and below.
function globalLattice(batches, name, ms) {
  var cols = 145, rows = 73
  var byRing = {}
  for (var b = 0; b < batches.length; b++) {
    var batch = batches[b]
    if (!batch || !batch.times.length) continue
    var t = nearestStep(batch.times, ms)
    for (var p = 0; p < batch.points.length; p++) {
      var value = rateValue(batch, name, p, t)
      if (!isFinite(value)) continue
      var lat = batch.points[p][0]
      var ring = byRing[lat] || (byRing[lat] = [])
      ring.push([wrapLon(batch.points[p][1]), value])
    }
  }
  var lats = Object.keys(byRing).map(Number).sort(function(a, c) { return a - c })
  for (var r = 0; r < lats.length; r++) byRing[lats[r]].sort(function(a, c) { return a[0] - c[0] })
  function alongRing(ring, lon) {
    if (ring.length === 1) return ring[0][1]
    var n = ring.length
    var hi = 0
    while (hi < n && ring[hi][0] < lon) hi++
    var a = ring[(hi - 1 + n) % n], c = ring[hi % n]
    var span = ((c[0] - a[0]) % 360 + 360) % 360
    if (span === 0) return a[1]
    var into = ((lon - a[0]) % 360 + 360) % 360
    return a[1] + (c[1] - a[1]) * into / span
  }
  var values = new Array(cols * rows)
  for (var row = 0; row < rows; row++) {
    var nodeLat = -90 + row * 2.5
    var below = -1, above = -1
    for (var k = 0; k < lats.length; k++) {
      if (lats[k] <= nodeLat) below = k
      if (lats[k] >= nodeLat && above < 0) above = k
    }
    for (var col = 0; col < cols; col++) {
      var lon = -180 + col * 2.5
      var lower = below >= 0 ? alongRing(byRing[lats[below]], lon) : NaN
      var upper = above >= 0 ? alongRing(byRing[lats[above]], lon) : NaN
      var v
      if (!isFinite(lower)) v = upper
      else if (!isFinite(upper) || lats[above] === lats[below]) v = lower
      else v = lower + (upper - lower) * (nodeLat - lats[below]) / (lats[above] - lats[below])
      values[row * cols + col] = isFinite(v) ? v : NaN
    }
  }
  return { south: -90, north: 90, west: -180, east: 180, cols: cols, rows: rows, values: values, wrap: true }
}

// A lattice's value at a place (bilinear), NaN outside it or where unknown.
function latticeValue(lattice, lat, lon) {
  if (!lattice) return NaN
  var x = Number(lon)
  if (lattice.wrap) x = wrapLon(x)
  else {
    while (x < lattice.west - 180) x += 360
    while (x > lattice.east + 180) x -= 360
  }
  var fx = (x - lattice.west) / (lattice.east - lattice.west) * (lattice.cols - 1)
  var fy = (lat - lattice.south) / (lattice.north - lattice.south) * (lattice.rows - 1)
  if (!(fx >= 0 && fx <= lattice.cols - 1 && fy >= 0 && fy <= lattice.rows - 1)) return NaN
  var x0 = Math.min(lattice.cols - 2, Math.floor(fx)), y0 = Math.min(lattice.rows - 2, Math.floor(fy))
  var tx = fx - x0, ty = fy - y0
  var v = lattice.values
  var i = y0 * lattice.cols + x0
  return (v[i] * (1 - tx) + v[i + 1] * tx) * (1 - ty) + (v[i + lattice.cols] * (1 - tx) + v[i + lattice.cols + 1] * tx) * ty
}

// A tile's value at a place inside it (bilinear between its 4 × 4 points).
function tileValue(tile, name, ms, lat, lon) {
  var b = tileBounds(tile.key)
  var t = nearestStep(tile.times, ms)
  var n = TILE_POINTS - 1
  var x = wrapLon(lon)
  while (x < b.west) x += 360
  var fx = (x - b.west) / (b.east - b.west) * n
  var fy = (lat - b.south) / (b.north - b.south) * n
  var x0 = Math.max(0, Math.min(n - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(n - 1, Math.floor(fy)))
  var tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0))
  function at(i, j) { return rateValue(tile, name, i * TILE_POINTS + j, t) }
  return (at(y0, x0) * (1 - tx) + at(y0, x0 + 1) * tx) * (1 - ty) + (at(y0 + 1, x0) * (1 - tx) + at(y0 + 1, x0 + 1) * tx) * ty
}

// A box seen from close up: each node from the tile of `level` it lies in,
// where that tile is loaded, else from the global lattice underneath.
function regionLattice(tiles, global, name, ms, box, level, cols, rows) {
  var values = new Array(cols * rows)
  for (var row = 0; row < rows; row++) {
    var lat = box.south + (box.north - box.south) * row / (rows - 1)
    for (var col = 0; col < cols; col++) {
      var lon = box.west + (box.east - box.west) * col / (cols - 1)
      var tile = tiles[tileAt(lat, lon, level)]
      var v = tile ? tileValue(tile, name, ms, lat, lon) : NaN
      if (!isFinite(v)) v = latticeValue(global, lat, lon)
      values[row * cols + col] = isFinite(v) ? v : NaN
    }
  }
  return { south: box.south, north: box.north, west: box.west, east: box.east, cols: cols, rows: rows,
    values: values, wrap: false }
}

if (typeof module !== "undefined") module.exports = {}
