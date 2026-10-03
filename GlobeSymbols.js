.pragma library

// Storm and thunderstorm symbols for the globe section: where to put them,
// not how they look. Pure functions, tested in Node
// (tests/globe-symbols.test.mjs).
//
// Lattices as in GlobeIsolines.js ({ south, north, west, east, cols, rows,
// values, wrap }, values from the south-west corner, NaN unknown). Units as
// Open-Meteo answers by default: gusts in km/h, CAPE in J/kg, precipitation
// in mm (per hour on hourly data), weather codes WMO 4677 (95 thunderstorm,
// 96 and 99 with hail).
//
// De-cluttering on the lattice: places are binned into cells of `cellDeg`
// degrees of latitude and longitude, the strongest per cell stays.
// declutterScreen() does the same in pixels once the globe's projection is
// known.

var GUST_STORM = 75      // km/h, Beaufort 9
var GUST_SEVERE = 103    // km/h, Beaufort 11
var CAPE_MIN = 1500      // J/kg
var RAIN_MIN = 0.5       // mm/h

function known(v) {
  return typeof v === "number" && v === v
}

function ringCols(lattice) {
  if (!lattice.wrap) return lattice.cols
  return Math.abs(lattice.east - lattice.west - 360) < 1e-6 ? lattice.cols - 1 : lattice.cols
}

function lonOf(lattice, col) {
  var lon = lattice.west + col * (lattice.east - lattice.west) / (lattice.cols - 1)
  return lon > 180 ? lon - 360 : lon
}

function latOf(lattice, row) {
  return lattice.south + row * (lattice.north - lattice.south) / (lattice.rows - 1)
}

// Fractional column and row of (lat, lon), or null outside the lattice.
function position(lattice, lat, lon) {
  var cols = lattice.cols, rows = lattice.rows
  var fy = (lat - lattice.south) / (lattice.north - lattice.south) * (rows - 1)
  if (!(fy >= 0 && fy <= rows - 1)) return null
  var fx
  if (lattice.wrap) {
    var ring = ringCols(lattice)
    fx = (((lon - lattice.west) % 360) + 360) % 360 / ((lattice.east - lattice.west) / (cols - 1))
    if (fx >= ring) fx -= ring
  } else {
    fx = (lon - lattice.west) / (lattice.east - lattice.west) * (cols - 1)
    if (!(fx >= 0 && fx <= cols - 1)) return null
  }
  return { fx: fx, fy: fy }
}

// The value of the node nearest to (lat, lon), for values that must not be
// blended (weather codes); NaN outside a box lattice.
function nearestAt(lattice, lat, lon) {
  if (!lattice || !lattice.values) return NaN
  var at = position(lattice, lat, lon)
  if (!at) return NaN
  var col = Math.round(at.fx), row = Math.round(at.fy)
  if (lattice.wrap) col = col % ringCols(lattice)
  var v = lattice.values[row * lattice.cols + col]
  return known(v) ? v : NaN
}

// Bilinear value at (lat, lon); NaN outside a box lattice or where a corner
// is unknown.
function valueAt(lattice, lat, lon) {
  if (!lattice || !lattice.values) return NaN
  var at = position(lattice, lat, lon)
  if (!at) return NaN
  var cols = lattice.cols, ring = ringCols(lattice)
  var x0 = Math.floor(at.fx), y0 = Math.floor(at.fy)
  var x1 = lattice.wrap ? (x0 + 1) % ring : Math.min(x0 + 1, cols - 1)
  var y1 = Math.min(y0 + 1, lattice.rows - 1)
  var tx = at.fx - x0, ty = at.fy - y0, v = lattice.values
  var a = v[y0 * cols + x0], b = v[y0 * cols + x1], c = v[y1 * cols + x0], d = v[y1 * cols + x1]
  return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty
}

// The default cell for de-cluttering: 10° on the globe, an eighth of a
// box's smaller side.
function defaultCell(lattice) {
  if (lattice.wrap) return 10
  return Math.max(0.25, Math.min(lattice.north - lattice.south, lattice.east - lattice.west) / 8)
}

// Keeps the strongest place per cellDeg × cellDeg cell (by `score`), then
// the strongest `max` of them, strongest first.
function declutterGrid(points, cellDeg, max, score) {
  points.sort(function (a, b) { return score(b) - score(a) })
  var taken = {}, result = []
  for (var i = 0; i < points.length && result.length < max; i++) {
    var p = points[i]
    var key = Math.floor((p.lat + 90) / cellDeg) + ":" + Math.floor((p.lon + 180) / cellDeg)
    if (taken[key]) continue
    taken[key] = true
    result.push(p)
  }
  return result
}

// Every node of a lattice the symbols may stand on: the seam column once,
// no node within 5° of a pole (where a row is one place).
function eachNode(lattice, fn) {
  var n = ringCols(lattice)
  for (var r = 0; r < lattice.rows; r++) {
    var lat = latOf(lattice, r)
    if (Math.abs(lat) > 85) continue
    for (var c = 0; c < n; c++) fn(r, c, lat, lonOf(lattice, c))
  }
}

// Storms: [{ lat, lon, gust, level }] at the local maxima of the gusts
// (km/h) of at least 75 (level 1), 103 and more level 2. Options: storm,
// severe (the thresholds), cellDeg, max (default 40).
function storms(gustLattice, options) {
  options = options || {}
  if (!gustLattice || !gustLattice.values) return []
  var threshold = options.storm !== undefined ? Number(options.storm) : GUST_STORM
  var severe = options.severe !== undefined ? Number(options.severe) : GUST_SEVERE
  var cellDeg = Number(options.cellDeg) || defaultCell(gustLattice)
  var max = options.max !== undefined ? Number(options.max) : 40
  var cols = gustLattice.cols, rows = gustLattice.rows, values = gustLattice.values
  var n = ringCols(gustLattice), wrap = !!gustLattice.wrap
  var found = []
  eachNode(gustLattice, function (r, c, lat, lon) {
    var v = values[r * cols + c]
    if (!known(v) || v < threshold) return
    for (var dr = -1; dr <= 1; dr++) {
      for (var dc = -1; dc <= 1; dc++) {
        var rr = r + dr, cc = c + dc
        if (rr < 0 || rr >= rows) continue
        if (wrap) cc = (cc + n) % n
        else if (cc < 0 || cc >= cols) continue
        if (values[rr * cols + cc] > v) return
      }
    }
    found.push({ lat: lat, lon: lon, gust: v, level: v >= severe ? 2 : 1 })
  })
  return declutterGrid(found, cellDeg, max, function (p) { return p.gust })
}

// Strength of a weather code: 95 thunderstorm 1, 96 with hail 2, 99 with
// heavy hail 3, anything else 0.
function codeStrength(code) {
  return code === 95 ? 1 : code === 96 ? 2 : code === 99 ? 3 : 0
}

// Thunderstorms: [{ lat, lon, strength, cape }] where the nearest node's
// weather code is 95, 96 or 99 (strength 1, 2, 3), or where CAPE is at
// least 1500 J/kg with at least 0.5 mm/h of precipitation (strength 1,
// 2 from 2500 J/kg). The places are the code lattice's nodes; CAPE and
// precipitation are read there (bilinear), either may be null. Options:
// cape, rain (the thresholds), cellDeg, max (default 24).
function thunderstorms(weatherCodeLattice, capeLattice, precipitationLattice, options) {
  options = options || {}
  var base = weatherCodeLattice || capeLattice
  if (!base || !base.values) return []
  var capeMin = options.cape !== undefined ? Number(options.cape) : CAPE_MIN
  var rainMin = options.rain !== undefined ? Number(options.rain) : RAIN_MIN
  var cellDeg = Number(options.cellDeg) || defaultCell(base)
  var max = options.max !== undefined ? Number(options.max) : 24
  var found = []
  eachNode(base, function (r, c, lat, lon) {
    var code = weatherCodeLattice ? nearestAt(weatherCodeLattice, lat, lon) : NaN
    var strength = codeStrength(code)
    var cape = capeLattice ? valueAt(capeLattice, lat, lon) : NaN
    if (known(cape) && cape >= capeMin && precipitationLattice) {
      var rain = valueAt(precipitationLattice, lat, lon)
      if (known(rain) && rain >= rainMin) strength = Math.max(strength, cape >= 2500 ? 2 : 1)
    }
    if (strength > 0) found.push({ lat: lat, lon: lon, strength: strength, cape: known(cape) ? cape : 0 })
  })
  return declutterGrid(found, cellDeg, max, function (p) { return p.strength * 100000 + p.cape })
}

// The score a place sorts by: its strength, gust, or the size of its value.
function defaultScore(p) {
  if (known(p.strength)) return p.strength * 100000 + (known(p.cape) ? p.cape : 0)
  if (known(p.gust)) return p.gust
  if (known(p.depth)) return p.depth
  return known(p.value) ? Math.abs(p.value) : 0
}

// The places that stay on screen: project(lat, lon) gives { x, y, visible };
// hidden places go, then each place closer than minPx to a stronger one.
// Returns copies with x and y, strongest first. `score` optional.
function declutterScreen(points, project, minPx, score) {
  score = score || defaultScore
  var list = []
  for (var i = 0; i < points.length; i++) {
    var at = project(points[i].lat, points[i].lon)
    if (!at || !at.visible) continue
    var copy = {}
    for (var key in points[i]) copy[key] = points[i][key]
    copy.x = at.x
    copy.y = at.y
    list.push(copy)
  }
  list.sort(function (a, b) { return score(b) - score(a) })
  var kept = [], min2 = minPx * minPx
  for (var j = 0; j < list.length; j++) {
    var p = list[j], free = true
    for (var k = 0; k < kept.length && free; k++) {
      var dx = kept[k].x - p.x, dy = kept[k].y - p.y
      free = dx * dx + dy * dy >= min2
    }
    if (free) kept.push(p)
  }
  return kept
}

if (typeof module !== "undefined") module.exports = {
  storms: storms, thunderstorms: thunderstorms, declutterScreen: declutterScreen,
  nearestAt: nearestAt, valueAt: valueAt, codeStrength: codeStrength,
  GUST_STORM: GUST_STORM, GUST_SEVERE: GUST_SEVERE, CAPE_MIN: CAPE_MIN, RAIN_MIN: RAIN_MIN
}
