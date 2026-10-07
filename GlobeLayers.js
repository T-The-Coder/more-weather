// The globe's overlays from the stored model data (GlobeWorker.js): per
// time step the isobars and pressure centres, the storm and thunderstorm
// places and the wind as east/north lattices for the streaks, each kept
// until the data or the step changes. No ".pragma library": the worker
// takes it in with Qt.include, after GlobeIsolines.js, GlobeSymbols.js,
// GlobeStreaks.js, GlobeMarine.js and GlobeGrid.js, whose functions it
// calls by their plain names (isolines, extrema, storms, thunderstorms,
// parse, globalLattice, regionLattice …). Tested in Node with the same
// files in one context (tests/globe-layers.test.mjs).

// Lattice size of a close-up box (WeatherGlobeData asks for the same).
var BOX_NODES = 72

// Open-Meteo Marine's answer for the global points at sea (GlobeMarine.parse)
// as the compact form (GlobeGrid.compactFromResponse): hourly for today,
// °C in hundredths. Null when nothing came back.
function compactFromMarine(text, points, key, nowMs) {
  var parsed = parse(text, points)
  if (!parsed.times.length) return null
  var times = parsed.times.map(function(ms) { return Math.round(ms / 1000) })
  var out = new Array(points.length * times.length)
  var known = 0
  for (var p = 0; p < points.length; p++) {
    var series = parsed.values[p] || []
    for (var t = 0; t < times.length; t++) {
      var v = series[t]
      var ok = typeof v === "number" && isFinite(v)
      if (ok) known++
      out[p * times.length + t] = ok ? Math.round(v * scaleOf("sea_surface_temperature")) : null
    }
  }
  if (!known) return null
  return {
    v: 1, kind: "marine", key: key, at: Number(nowMs),
    points: points.map(function(point) { return [point.lat, point.lon] }),
    times: times, vars: { sea_surface_temperature: out }
  }
}

// A store: { batches: { key: compact }, tiles: { key: compact }, rain:
// { key: compact } (the dense rain set's sectors), version, cache: {} }.
function newStore() {
  return { batches: {}, tiles: {}, rain: {}, version: 0, cache: {} }
}
function keep(store, compact) {
  if (!compact || !compact.key) return false
  var key = String(compact.key)
  if (key.indexOf("G9:") === 0 || key.indexOf("S9:") === 0) store.batches[key] = compact
  else if (key.indexOf("R9:") === 0) store.rain[key] = compact
  else store.tiles[key] = compact
  store.version++
  store.cache = {}
  return true
}
function forget(store, keys) {
  for (var i = 0; i < keys.length; i++) {
    delete store.tiles[keys[i]]
    delete store.rain[keys[i]]
  }
  store.version++
  store.cache = {}
}

function boxTag(box) {
  return box ? [box.south, box.north, box.west, box.east].map(function(v) { return Math.round(v * 100) }).join(",") : "all"
}
// Kept per hour and box until new data comes; a timeline played through
// and many views fill it, so it starts over past 240 entries.
function trimCache(store) {
  if (Object.keys(store.cache).length > 240) store.cache = { rainPlan: store.cache.rainPlan }
}

function hourOf(ms) {
  return Math.round(Number(ms) / 3600000)
}

// The whole earth's lattice of a variable at a time, kept per hour:
// precipitation and the weather code from the dense rain set where it is
// loaded (GlobeGrid.rainLattice), the 510 points elsewhere.
function globalFor(store, name, ms) {
  trimCache(store)
  var key = "g|" + name + "|" + hourOf(ms)
  if (!store.cache[key]) {
    var list = []
    for (var k in store.batches) list.push(store.batches[k])
    var coarse = globalLattice(list, name, ms)
    var rain = []
    for (var r in store.rain) rain.push(store.rain[r])
    // The dense set's node plan, made once per set of loaded cells (the
    // cache starts over with new data).
    if (rain.length && RAIN_SERVES[name] && !store.cache.rainPlan) store.cache.rainPlan = rainPlan(rain)
    store.cache[key] = withDense(coarse, rain.length ? rainLattice(rain, name, ms, store.cache.rainPlan) : null)
  }
  return store.cache[key]
}

// A box's lattice (from the tiles of `level`, the global one beneath).
function boxFor(store, name, ms, box, level, height) {
  var key = "b|" + name + "|" + hourOf(ms) + "|" + boxTag(box) + "|" + level + "|" + (height || "")
  if (!store.cache[key]) {
    store.cache[key] = regionLattice(store.tiles, globalFor(store, name, ms), name, ms, box, level,
      BOX_NODES, BOX_NODES, height)
  }
  return store.cache[key]
}

// The overlays asked for: { isobars: [{ level, lines }], centres:
// [{ kind, lat, lon, value }], storms, thunderstorms, u, v (m/s lattices) }.
// `request`: { ms, box (null for the whole earth), level (zoom), height
// (wind height id), isobars, storms, streaks (booleans) }.
function layersFor(store, request) {
  trimCache(store)
  var ms = request.ms
  var box = request.box || null
  var result = {}
  if (request.isobars) {
    var key = "iso|" + hourOf(ms)
    if (!store.cache[key]) {
      var pressure = globalFor(store, "pressure_msl", ms)
      store.cache[key] = { isobars: isolines(pressure, 4, 1000), centres: extrema(pressure) }
    }
    result.isobars = store.cache[key].isobars
    result.centres = store.cache[key].centres
  }
  var where = "|" + hourOf(ms) + "|" + boxTag(box) + "|" + (box ? request.level : "")
  if (request.storms) {
    var stormKey = "storms" + where
    if (!store.cache[stormKey]) {
      var pick = function(name) { return box ? boxFor(store, name, ms, box, request.level, "") : globalFor(store, name, ms) }
      store.cache[stormKey] = {
        storms: storms(pick("wind_gusts_10m")),
        thunderstorms: thunderstorms(pick("weather_code"), pick("cape"), pick("precipitation"))
      }
    }
    result.storms = store.cache[stormKey].storms
    result.thunderstorms = store.cache[stormKey].thunderstorms
  }
  if (request.streaks) {
    var height = request.height || "10m"
    var tag = height === "10m" ? "" : height
    var windKey = "wind" + where + "|" + height
    if (!store.cache[windKey]) {
      var pickWind = function(name) { return box ? boxFor(store, name, ms, box, request.level, tag) : globalFor(store, name, ms) }
      store.cache[windKey] = { u: metresPerSecond(pickWind("wind_u_" + height)), v: metresPerSecond(pickWind("wind_v_" + height)) }
    }
    result.u = store.cache[windKey].u
    result.v = store.cache[windKey].v
  }
  return result
}

function metresPerSecond(lattice) {
  var values = new Array(lattice.values.length)
  for (var i = 0; i < values.length; i++) values[i] = lattice.values[i] / 3.6
  return { south: lattice.south, north: lattice.north, west: lattice.west, east: lattice.east,
    cols: lattice.cols, rows: lattice.rows, values: values, wrap: lattice.wrap }
}

if (typeof module !== "undefined") module.exports = {}
