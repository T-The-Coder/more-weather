.pragma library

// The globe's colour washes (WeatherGlobeWash.qml, the legend): the
// scales, their buckets and ticks. Colours that come from the theme (the
// temperature accents) are filled in by the view; the rest are fixed.
// Pure, tested in Node (tests/globe-grid.test.mjs).

var WASHES = ["none", "temperature", "cloud", "precipitation", "wind", "sst"]
// The grid variable each wash reads (wind: at 10 m; other heights through
// variableFor).
var VARIABLE = { temperature: "temperature_2m", cloud: "cloud_cover", precipitation: "precipitation",
  wind: "wind_speed_10m", sst: "sea_surface_temperature" }

var TEMPERATURE = { min: -40, max: 45, buckets: 34 }
// The sea's temperature on its own narrower scale, in the same colours.
var SST = { min: -2, max: 32, buckets: 34 }
// Cloud: a white veil, 0 to 70 % opaque over 0–100 % cover, in 10 steps.
var CLOUD_BUCKETS = 10
// Wind: 20 steps from calm to the height's scale (Model.WIND_LEVELS'
// scaleKmh), in the wind map's colours (WeatherWindField.qml).
var WIND_BUCKETS = 20
var WIND_STOPS = [
  [0, [43, 31, 143]], [8, [58, 63, 216]], [16, [47, 127, 232]], [25, [34, 182, 216]],
  [35, [47, 201, 143]], [48, [182, 212, 58]], [62, [242, 179, 58]], [78, [232, 82, 58]],
  [100, [180, 58, 214]]
]
// Precipitation in mm/h, log steps; nothing below the first.
var PRECIPITATION_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20]
// The radar legend's colours (Model.DWD_RADAR_COLORS) at those steps.
var PRECIPITATION_COLORS = ["#33FFFF", "#1ACC9A", "#019934", "#4DB31B", "#99CC01", "#FFFF01", "#FF8901", "#FE0000"]

function nextWash(wash) {
  var i = WASHES.indexOf(String(wash))
  return WASHES[(i + 1) % WASHES.length]
}

// The variable a wash reads, with the wind's height ("10m", "850hPa" …).
function variableFor(wash, level) {
  if (wash === "wind" && level && level !== "10m") return "wind_speed_" + level
  return VARIABLE[wash] || ""
}

// Washes whose buckets lie evenly along a range: { min, max }, else null.
function range(wash, scaleKmh) {
  if (wash === "temperature") return { min: TEMPERATURE.min, max: TEMPERATURE.max }
  if (wash === "sst") return { min: SST.min, max: SST.max }
  if (wash === "cloud") return { min: 0, max: 100 }
  if (wash === "wind") return { min: 0, max: Number(scaleKmh) || 100 }
  return null
}

function bucketCount(wash) {
  if (wash === "temperature") return TEMPERATURE.buckets
  if (wash === "sst") return SST.buckets
  if (wash === "cloud") return CLOUD_BUCKETS
  if (wash === "wind") return WIND_BUCKETS
  if (wash === "precipitation") return PRECIPITATION_STEPS.length
  return 0
}

// The bucket of a value (°C, %, km/h, mm/h), or -1 for none (missing, or
// no rain).
function bucket(wash, value, scaleKmh) {
  var v = Number(value)
  if (!isFinite(v)) return -1
  var r = range(wash, scaleKmh)
  if (r) {
    var count = bucketCount(wash)
    return Math.max(0, Math.min(count - 1, Math.floor((v - r.min) / (r.max - r.min) * count)))
  }
  if (wash === "precipitation") {
    if (v < PRECIPITATION_STEPS[0]) return -1
    var b = 0
    for (var i = 0; i < PRECIPITATION_STEPS.length; i++) if (v >= PRECIPITATION_STEPS[i]) b = i
    return b
  }
  return -1
}

// A bucket's middle value (°C, %, km/h; precipitation its step), for its
// colour.
function bucketValue(wash, index, scaleKmh) {
  var r = range(wash, scaleKmh)
  if (r) return r.min + (index + 0.5) * (r.max - r.min) / bucketCount(wash)
  if (wash === "precipitation") return PRECIPITATION_STEPS[index]
  return NaN
}

// The wind map's colour at a share (0–1) of the scale.
function windColor(share) {
  var x = Math.max(0, Math.min(1, share)) * 100
  for (var i = 1; i < WIND_STOPS.length; i++) {
    if (x > WIND_STOPS[i][0]) continue
    var f = (x - WIND_STOPS[i - 1][0]) / (WIND_STOPS[i][0] - WIND_STOPS[i - 1][0])
    var a = WIND_STOPS[i - 1][1], b = WIND_STOPS[i][1]
    return [Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f)]
  }
  return WIND_STOPS[WIND_STOPS.length - 1][1].slice()
}

// Fixed colours as [r, g, b, a] in 0–255 (temperature and the sea come
// from the view's accents).
function fixedColor(wash, index) {
  if (wash === "cloud") return [255, 255, 255, Math.round(255 * 0.7 * (index + 0.5) / CLOUD_BUCKETS)]
  if (wash === "wind") return windColor((index + 0.5) / WIND_BUCKETS).concat([170])
  if (wash === "precipitation") {
    var hex = PRECIPITATION_COLORS[Math.max(0, Math.min(PRECIPITATION_COLORS.length - 1, index))]
    return [parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16), 200]
  }
  return null
}

// Five ticks for the legend: { at (0–1 along the bar), value } in the shown
// unit (°F, in/h with `imperial`); the wind's in km/h (the view converts it
// to the wind unit).
function ticks(wash, imperial, scaleKmh) {
  var list = []
  var r = range(wash, scaleKmh)
  if (wash === "temperature" || wash === "sst") {
    for (var i = 0; i < 5; i++) {
      var c = r.min + i * (r.max - r.min) / 4
      list.push({ at: i / 4, value: imperial ? Math.round(c * 1.8 + 32) : Math.round(c) })
    }
  } else if (wash === "cloud" || wash === "wind") {
    for (var k = 0; k < 5; k++) list.push({ at: k / 4, value: Math.round(r.max * k / 4) })
  } else if (wash === "precipitation") {
    var picks = [0, 2, 4, 5, 7]
    for (var p = 0; p < picks.length; p++) {
      var mm = PRECIPITATION_STEPS[picks[p]]
      list.push({ at: picks[p] / PRECIPITATION_STEPS.length,
        value: imperial ? Math.round(mm / 25.4 * 1000) / 1000 : mm })
    }
  }
  return list
}

function unit(wash, imperial) {
  if (wash === "temperature" || wash === "sst") return imperial ? "°F" : "°C"
  if (wash === "cloud") return "%"
  if (wash === "precipitation") return imperial ? "in/h" : "mm/h"
  return ""
}

if (typeof module !== "undefined") module.exports = {}
