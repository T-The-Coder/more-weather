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
// Winds aloft (Model.WIND_LEVELS other than 10 m) come in a request of
// their own per batch or tile, only while such a height is chosen: its two
// variables, keys with "@<level>" ("G9:3@850hPa", "T3:17:40@850hPa").
// The sea's temperature comes from Open-Meteo Marine for the global points
// at sea (GlobeMarine.oceanPoints), in chunks "S9:<i>", kept a day.
var MARINE_TTL_MS = 24 * 60 * 60 * 1000
var MARINE_CHUNK = 100
// Marine answers 400 for a whole request when one place has no data (the
// poles, the ice shelves): only places up to 72° are asked.
var MARINE_MAX_LAT = 72
// A failed request's key waits before it is asked again: 10 minutes, then
// twice as long each time, at most 6 hours.
function retryAfterMs(failures) {
  return Math.min(6 * 60 * 60 * 1000, 10 * 60 * 1000 * Math.pow(2, Math.max(0, failures - 1)))
}
function levelVariables(level) {
  return ["wind_speed_" + level, "wind_direction_" + level]
}
// Codes are never blended: the nearest point's.
var NEAREST = { weather_code: true }
// Kept as integers: the value times its scale.
var SCALES = { temperature_2m: 10, cloud_cover: 1, precipitation: 100, rain: 100, showers: 100, snowfall: 10,
  weather_code: 1, cape: 1, pressure_msl: 10,
  wind_speed_10m: 10, wind_direction_10m: 1, wind_gusts_10m: 10, sea_surface_temperature: 100 }
// Others (the heights' winds): tenths.
function scaleOf(name) {
  return SCALES[name] || 10
}

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

function batchKey(k, level) {
  return "G9:" + k + (level && level !== "10m" ? "@" + level : "")
}

// ---- The dense rain set (z0–z1, while the precipitation layer shows):
//      rings every 4.5° with round(80·cos lat) points (about 2,000 on the
//      earth), only precipitation and its kinds and the weather code, 48 h
//      hourly. Asked per cell of 15° × 15° (at most 16 points), only for
//      the cells facing the viewer (a point closer than 80° to the view's
//      centre: the disc's part where the rain is not foreshortened, about
//      800 points), nearest first, one after another as fast as
//      Open-Meteo's 600 calls a minute allow; each kept three hours, so a
//      turn loads each cell once.
var RAIN_RING_STEP = 4.5
var RAIN_RING_POINTS = 80
var RAIN_CELL = 15
var RAIN_HOURS = 48
var RAIN_TTL_MS = 3 * 60 * 60 * 1000
var RAIN_REACH = 80
var RAIN_VARIABLES = ["precipitation", "rain", "showers", "snowfall", "weather_code"]
// The variables the dense set serves (the others stay on the 510 points).
var RAIN_SERVES = { precipitation: true, weather_code: true }
// Open-Meteo counts each place as a call: 600 a minute.
var CALLS_PER_MINUTE = 600

function rainRingLats() {
  var list = []
  for (var lat = -90 + RAIN_RING_STEP; lat < 90 - 1e-9; lat += RAIN_RING_STEP) list.push(Math.round(lat * 10) / 10)
  return list
}
function rainCellOf(lat, lon) {
  var bands = 180 / RAIN_CELL, cols = 360 / RAIN_CELL
  return "R9:" + Math.min(bands - 1, Math.floor((lat + 90) / RAIN_CELL)) + ":"
    + Math.min(cols - 1, Math.floor((wrapLon(lon) + 180) / RAIN_CELL))
}
// Every dense point: { lat, lon, cell (its key) }.
var rainPointList = null
function rainPoints() {
  if (rainPointList) return rainPointList
  var points = []
  var lats = rainRingLats()
  for (var r = 0; r < lats.length; r++) {
    var count = Math.max(1, Math.round(RAIN_RING_POINTS * Math.cos(lats[r] * Math.PI / 180)))
    for (var j = 0; j < count; j++) {
      var lon = -180 + j * 360 / count
      points.push({ lat: lats[r], lon: lon, cell: rainCellOf(lats[r], lon) })
    }
  }
  rainPointList = points
  return points
}
function rainCellPoints(key) {
  return rainPoints().filter(function(p) { return p.cell === key })
}
// The great-circle distance in degrees.
function angularDistance(lat1, lon1, lat2, lon2) {
  var r = Math.PI / 180
  var c = Math.sin(lat1 * r) * Math.sin(lat2 * r) + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lon2 - lon1) * r)
  return Math.acos(Math.max(-1, Math.min(1, c))) / r
}
// The cells facing a view centred on (lat, lon), nearest first.
function rainCellsFor(lat, lon) {
  var best = {}
  var points = rainPoints()
  for (var i = 0; i < points.length; i++) {
    var d = angularDistance(lat, lon, points[i].lat, points[i].lon)
    if (d >= RAIN_REACH) continue
    var c = points[i].cell
    if (best[c] === undefined || d < best[c]) best[c] = d
  }
  return Object.keys(best).sort(function(a, b) { return best[a] - best[b] })
}
// The dense points a view centred on (lat, lon) asks for (its cells').
function rainPointsFacing(lat, lon) {
  var cells = {}
  rainCellsFor(lat, lon).forEach(function(c) { cells[c] = true })
  return rainPoints().filter(function(p) { return cells[p.cell] })
}
// Wet weather codes: drizzle, rain, freezing rain, snow, showers, thunder.
function wetCode(code) {
  var c = Math.round(Number(code))
  return (c >= 51 && c <= 67) || (c >= 71 && c <= 77) || (c >= 80 && c <= 86) || (c >= 95 && c <= 99)
}
// Whether a dense cell may see precipitation in the 48 hours from fromMs,
// by the 510 points (the global batches): any of them in the cell or a
// ring's step (9°) around it with at least 0.1 mm or a wet weather code.
// A dry cell is not asked for. Without base data: wet (asked).
function rainCellWet(batches, key, fromMs) {
  var m = /^R9:(\d+):(\d+)$/.exec(String(key))
  if (!m) return true
  var south = -90 + Number(m[1]) * RAIN_CELL - RING_STEP, north = south + RAIN_CELL + 2 * RING_STEP
  var west = -180 + Number(m[2]) * RAIN_CELL - RING_STEP, width = RAIN_CELL + 2 * RING_STEP
  var from = Number(fromMs) / 1000, to = from + RAIN_HOURS * 3600
  var seen = false
  for (var b = 0; b < batches.length; b++) {
    var batch = batches[b]
    if (!batch || batch.kind !== "global" || !batch.times.length) continue
    var rain = batch.vars.precipitation, codes = batch.vars.weather_code
    var steps = []
    for (var t = 0; t < batch.times.length; t++) if (batch.times[t] >= from - 3 * 3600 && batch.times[t] <= to) steps.push(t)
    for (var p = 0; p < batch.points.length; p++) {
      var lat = batch.points[p][0]
      if (lat < south || lat > north) continue
      var east = ((batch.points[p][1] - west) % 360 + 360) % 360
      if (east > width && Math.abs(lat) < 89) continue
      seen = true
      for (var s = 0; s < steps.length; s++) {
        var i = p * batch.times.length + steps[s]
        if (rain && rain[i] !== null && rain[i] / SCALES.precipitation >= 0.1) return true
        if (codes && codes[i] !== null && wetCode(codes[i])) return true
      }
    }
  }
  return !seen
}

// How long to wait after asking for `points` places, to stay within the
// calls a minute.
function pacingMs(points) {
  return Math.ceil(Number(points) * 60000 / CALLS_PER_MINUTE)
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
// The wind height a key belongs to ("" for the base data), and the key
// without it.
function keyLevel(key) {
  var at = String(key).indexOf("@")
  return at < 0 ? "" : String(key).slice(at + 1)
}
function baseKey(key) {
  var at = String(key).indexOf("@")
  return at < 0 ? String(key) : String(key).slice(0, at)
}
function withLevel(key, level) {
  return level && level !== "10m" ? baseKey(key) + "@" + level : baseKey(key)
}
// How long a key's data stays fresh.
function ttlOf(key) {
  var k = String(key)
  if (k.indexOf("S9:") === 0) return MARINE_TTL_MS
  if (k.indexOf("R9:") === 0) return RAIN_TTL_MS
  return k.indexOf("G9:") === 0 ? GLOBAL_TTL_MS : TILE_TTL_MS
}
function parseTileKey(key) {
  var match = /^T(\d):(\d+):(\d+)$/.exec(baseKey(key))
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
function forecastRequest(points, kind, variables) {
  var lats = [], lons = []
  for (var i = 0; i < points.length; i++) {
    lats.push(coordinate(points[i].lat))
    lons.push(coordinate(wrapLon(points[i].lon)))
  }
  var global = kind === "global"
  var rain = kind === "rain"
  return {
    url: "https://api.open-meteo.com/v1/forecast?latitude=" + lats.join(",") + "&longitude=" + lons.join(",")
      + "&hourly=" + (variables || (rain ? RAIN_VARIABLES : VARIABLES)).join(",")
      + (global ? "&temporal_resolution=hourly_3&forecast_hours=" + GLOBAL_HOURS
        : "&forecast_hours=" + (rain ? RAIN_HOURS : TILE_HOURS))
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
// The dense rain set keeps 600 calls of room below the first mark, so the
// day's later refresh of the base data is never held back by it.
var RAIN_RESERVE = 600
function mayLoadRain(count, points) {
  return Number(count || 0) + Number(points) + RAIN_RESERVE <= BUDGET_MANUAL
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
function compactFromResponse(text, points, kind, key, nowMs, variables) {
  var data = JSON.parse(String(text))
  var list = Array.isArray(data) ? data : [data]
  if (!list.length || list.length !== points.length) return null
  var times = list[0].hourly && list[0].hourly.time ? list[0].hourly.time : []
  var vars = {}
  var names = variables || VARIABLES
  for (var v = 0; v < names.length; v++) {
    var name = names[v]
    var scale = scaleOf(name)
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
  return value === null || value === undefined ? NaN : value / scaleOf(name)
}

// The time step nearest to `ms` (unix seconds in `times`).
function nearestStep(times, ms) {
  var target = Number(ms) / 1000
  var best = 0
  for (var i = 1; i < times.length; i++) if (Math.abs(times[i] - target) < Math.abs(times[best] - target)) best = i
  return best
}

// The wind's east (u) or north (v) part in km/h at point p, step t, from
// the speed and the meteorological direction (where it comes from), so
// lattices blend vectors, never angles: names "wind_u_<height>",
// "wind_v_<height>" ("wind_u_10m", "wind_v_850hPa").
function windPart(compact, name, p, t) {
  var height = name.slice(7)
  var speed = compactValue(compact, "wind_speed_" + height, p, t)
  var from = compactValue(compact, "wind_direction_" + height, p, t) * Math.PI / 180
  if (!isFinite(speed) || !isFinite(from)) return NaN
  return name.charAt(5) === "u" ? -speed * Math.sin(from) : -speed * Math.cos(from)
}

// A variable's value in mm/h, °C, % …: precipitation in a 3-hourly step
// is the sum of the three hours.
function rateValue(compact, name, p, t) {
  if (name.indexOf("wind_u_") === 0 || name.indexOf("wind_v_") === 0) return windPart(compact, name, p, t)
  var value = compactValue(compact, name, p, t)
  return name === "precipitation" && compact.kind === "global" ? value / 3 : value
}

// ---- Lattices: values at grid nodes, { south, north, west, east, cols,
//      rows, values (row by row from the south-west, NaN where unknown),
//      wrap (the longitudes go round) }.

// The whole earth, every 2.5°, from the global batches loaded so far: along
// each ring between its known points (round the ring), then between the
// rings above and below.
// `maxGap` (optional, a function of the ring's latitude giving degrees):
// nodes between known points further apart along a ring stay unknown (the
// dense rain set, loaded for part of the earth only).
function globalLattice(batches, name, ms, maxGap) {
  var cols = 145, rows = 73
  var nearest = !!NEAREST[name]
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
  function alongRing(ring, lon, ringLat) {
    if (ring.length === 1) return ring[0][1]
    var n = ring.length
    var hi = 0
    while (hi < n && ring[hi][0] < lon) hi++
    var a = ring[(hi - 1 + n) % n], c = ring[hi % n]
    var span = ((c[0] - a[0]) % 360 + 360) % 360
    if (span === 0) return a[1]
    if (maxGap && span > maxGap(ringLat)) return NaN
    var into = ((lon - a[0]) % 360 + 360) % 360
    if (nearest) return into <= span / 2 ? a[1] : c[1]
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
    // Beyond the outermost dense rings (towards the poles) it is unknown.
    if (maxGap && (below < 0 || above < 0)) {
      for (var c0 = 0; c0 < cols; c0++) values[row * cols + c0] = NaN
      continue
    }
    for (var col = 0; col < cols; col++) {
      var lon = -180 + col * 2.5
      var lower = below >= 0 ? alongRing(byRing[lats[below]], lon, lats[below]) : NaN
      var upper = above >= 0 ? alongRing(byRing[lats[above]], lon, lats[above]) : NaN
      var v
      if (!isFinite(lower)) v = upper
      else if (!isFinite(upper) || lats[above] === lats[below]) v = lower
      else if (nearest) v = nodeLat - lats[below] <= lats[above] - nodeLat ? lower : upper
      else v = lower + (upper - lower) * (nodeLat - lats[below]) / (lats[above] - lats[below])
      values[row * cols + col] = isFinite(v) ? v : NaN
    }
  }
  return { south: -90, north: 90, west: -180, east: 180, cols: cols, rows: rows, values: values, wrap: true }
}

// The dense rain set's lattice of a variable (RAIN_SERVES) at a time: null
// for a time outside its 48 hours; unknown away from the loaded sectors
// (two of its own spacings without a point).
function rainLattice(batches, name, ms, plan) {
  if (!RAIN_SERVES[name] || !batches.length) return null
  var target = Number(ms) / 1000
  var times = batches[0].times
  if (!times || !times.length || target < times[0] - 3600 || target > times[times.length - 1] + 3600) return null
  return rainLatticeFromPlan(plan || rainPlan(batches), batches, name, ms)
}
// What does not change with the time: for each node of the 2.5° lattice
// the two points along the ring below and above it, their weights, and the
// rings' weight (as globalLattice finds them), so a time step only reads
// values. Made once per set of loaded cells.
function rainPlan(batches) {
  var refs = []
  var byRing = {}
  for (var b = 0; b < batches.length; b++) {
    var batch = batches[b]
    for (var p = 0; p < batch.points.length; p++) {
      var lat = batch.points[p][0]
      var ring = byRing[lat] || (byRing[lat] = [])
      ring.push([wrapLon(batch.points[p][1]), refs.length])
      refs.push([b, p])
    }
  }
  var lats = Object.keys(byRing).map(Number).sort(function(a, c) { return a - c })
  for (var r = 0; r < lats.length; r++) byRing[lats[r]].sort(function(a, c) { return a[0] - c[0] })
  function gapOf(lat) { return 2.01 * 360 / Math.max(1, Math.round(RAIN_RING_POINTS * Math.cos(lat * Math.PI / 180))) }
  // [index a, index c, fraction] along a ring, or null where unknown.
  function along(ring, lon, ringLat) {
    if (ring.length === 1) return [ring[0][1], ring[0][1], 0]
    var n = ring.length
    var hi = 0
    while (hi < n && ring[hi][0] < lon) hi++
    var a = ring[(hi - 1 + n) % n], c = ring[hi % n]
    var span = ((c[0] - a[0]) % 360 + 360) % 360
    if (span === 0) return [a[1], a[1], 0]
    if (span > gapOf(ringLat)) return null
    return [a[1], c[1], (((lon - a[0]) % 360 + 360) % 360) / span]
  }
  // Flat arrays per node (plain numbers, -1 for unknown): the lower and
  // the upper ring's two points and fraction, and the rings' weight (-1:
  // one ring only).
  var cols = 145, rows = 73, N = cols * rows
  var la = new Array(N), lc = new Array(N), lf = new Array(N), ua = new Array(N), uc = new Array(N), uf = new Array(N)
  var w = new Array(N), used = []
  for (var row = 0; row < rows; row++) {
    var nodeLat = -90 + row * 2.5
    var below = -1, above = -1
    for (var k = 0; k < lats.length; k++) {
      if (lats[k] <= nodeLat) below = k
      if (lats[k] >= nodeLat && above < 0) above = k
    }
    for (var col = 0; col < cols; col++) {
      var i = row * cols + col
      la[i] = -1; ua[i] = -1; w[i] = -1
      if (below < 0 || above < 0) continue
      var lon = -180 + col * 2.5
      var lower = along(byRing[lats[below]], lon, lats[below])
      var upper = along(byRing[lats[above]], lon, lats[above])
      if (!lower && !upper) continue
      if (lower) { la[i] = lower[0]; lc[i] = lower[1]; lf[i] = lower[2] }
      if (upper) { ua[i] = upper[0]; uc[i] = upper[1]; uf[i] = upper[2] }
      w[i] = lats[above] === lats[below] ? -1 : (nodeLat - lats[below]) / (lats[above] - lats[below])
      used.push(i)
    }
  }
  return { refs: refs, cols: cols, rows: rows, la: la, lc: lc, lf: lf, ua: ua, uc: uc, uf: uf, w: w, used: used }
}
function rainLatticeFromPlan(plan, batches, name, ms) {
  var nearest = !!NEAREST[name]
  var scale = scaleOf(name)
  // The values straight from the compact arrays (hourly: no rate to make).
  var series = batches.map(function(batch) {
    return { values: batch.vars[name] || null, count: batch.times.length, step: nearestStep(batch.times, ms) }
  })
  var point = new Array(plan.refs.length)
  for (var r = 0; r < plan.refs.length; r++) {
    var ref = plan.refs[r]
    var sr = series[ref[0]]
    var raw = sr.values ? sr.values[ref[1] * sr.count + sr.step] : null
    point[r] = raw === null || raw === undefined ? NaN : raw / scale
  }
  var N = plan.cols * plan.rows
  var values = new Array(N)
  for (var z = 0; z < N; z++) values[z] = NaN
  var la = plan.la, lc = plan.lc, lf = plan.lf, ua = plan.ua, uc = plan.uc, uf = plan.uf, wr = plan.w
  for (var q = 0; q < plan.used.length; q++) {
    var i = plan.used[q]
    var lower = NaN, upper = NaN
    if (la[i] >= 0) {
      var a = point[la[i]], c = point[lc[i]]
      lower = nearest ? (lf[i] <= 0.5 ? a : c) : a + (c - a) * lf[i]
    }
    if (ua[i] >= 0) {
      var a2 = point[ua[i]], c2 = point[uc[i]]
      upper = nearest ? (uf[i] <= 0.5 ? a2 : c2) : a2 + (c2 - a2) * uf[i]
    }
    var v
    if (!(lower === lower)) v = upper
    else if (!(upper === upper) || wr[i] < 0) v = lower
    else if (nearest) v = wr[i] <= 0.5 ? lower : upper
    else v = lower + (upper - lower) * wr[i]
    values[i] = v === v ? v : NaN
  }
  return { south: -90, north: 90, west: -180, east: 180, cols: plan.cols, rows: plan.rows, values: values, wrap: true }
}
// The coarse lattice with the dense one laid over it where that is known.
function withDense(coarse, dense) {
  if (!dense) return coarse
  if (!coarse) return dense
  var values = new Array(coarse.values.length)
  for (var i = 0; i < values.length; i++) values[i] = isFinite(dense.values[i]) ? dense.values[i] : coarse.values[i]
  return { south: coarse.south, north: coarse.north, west: coarse.west, east: coarse.east, cols: coarse.cols,
    rows: coarse.rows, values: values, wrap: coarse.wrap, dense: true }
}

// A lattice's value at a place (bilinear), NaN outside it or where unknown.
function latticeValue(lattice, lat, lon, nearest) {
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
  if (nearest) return v[i + (tx > 0.5 ? 1 : 0) + (ty > 0.5 ? lattice.cols : 0)]
  return (v[i] * (1 - tx) + v[i + 1] * tx) * (1 - ty) + (v[i + lattice.cols] * (1 - tx) + v[i + lattice.cols + 1] * tx) * ty
}

// A tile's value at a place inside it (bilinear between its 4 × 4 points).
function tileValue(tile, name, ms, lat, lon) {
  var b = tileBounds(tile.key)
  // A time past the tile's 48 hours (or before them) is the global data's.
  var target = Number(ms) / 1000
  if (!tile.times.length || target < tile.times[0] - 3600 || target > tile.times[tile.times.length - 1] + 3600) return NaN
  var t = nearestStep(tile.times, ms)
  var n = TILE_POINTS - 1
  var x = wrapLon(lon)
  while (x < b.west) x += 360
  var fx = (x - b.west) / (b.east - b.west) * n
  var fy = (lat - b.south) / (b.north - b.south) * n
  var x0 = Math.max(0, Math.min(n - 1, Math.floor(fx))), y0 = Math.max(0, Math.min(n - 1, Math.floor(fy)))
  var tx = Math.max(0, Math.min(1, fx - x0)), ty = Math.max(0, Math.min(1, fy - y0))
  function at(i, j) { return rateValue(tile, name, i * TILE_POINTS + j, t) }
  if (NEAREST[name]) return at(y0 + (ty > 0.5 ? 1 : 0), x0 + (tx > 0.5 ? 1 : 0))
  return (at(y0, x0) * (1 - tx) + at(y0, x0 + 1) * tx) * (1 - ty) + (at(y0 + 1, x0) * (1 - tx) + at(y0 + 1, x0 + 1) * tx) * ty
}

// A box seen from close up: each node from the tile of `level` it lies in,
// where that tile is loaded, else from the global lattice underneath.
// `height` picks the tiles of a wind height ("@850hPa" keys).
function regionLattice(tiles, global, name, ms, box, level, cols, rows, height) {
  var values = new Array(cols * rows)
  for (var row = 0; row < rows; row++) {
    var lat = box.south + (box.north - box.south) * row / (rows - 1)
    for (var col = 0; col < cols; col++) {
      var lon = box.west + (box.east - box.west) * col / (cols - 1)
      var tile = tiles[withLevel(tileAt(lat, lon, level), height)]
      var v = tile ? tileValue(tile, name, ms, lat, lon) : NaN
      if (!isFinite(v)) v = latticeValue(global, lat, lon, !!NEAREST[name])
      values[row * cols + col] = isFinite(v) ? v : NaN
    }
  }
  return { south: box.south, north: box.north, west: box.west, east: box.east, cols: cols, rows: rows,
    values: values, wrap: false }
}

if (typeof module !== "undefined") module.exports = {}
