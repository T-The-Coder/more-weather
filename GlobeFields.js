.pragma library

// The globe's colour washes (WeatherGlobeWash.qml, the legend): the
// scales, their buckets and ticks. Colours that come from the theme (the
// temperature accents) are filled in by the view; the rest are fixed.
// Pure, tested in Node (tests/globe-grid.test.mjs).

var WASHES = ["none", "temperature", "cloud", "precipitation"]
// The grid variable each wash reads.
var VARIABLE = { temperature: "temperature_2m", cloud: "cloud_cover", precipitation: "precipitation" }

var TEMPERATURE = { min: -40, max: 45, buckets: 34 }
// Cloud: a white veil, 0 to 70 % opaque over 0–100 % cover, in 10 steps.
var CLOUD_BUCKETS = 10
// Precipitation in mm/h, log steps; nothing below the first.
var PRECIPITATION_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20]
// The radar legend's colours (Model.DWD_RADAR_COLORS) at those steps.
var PRECIPITATION_COLORS = ["#33FFFF", "#1ACC9A", "#019934", "#4DB31B", "#99CC01", "#FFFF01", "#FF8901", "#FE0000"]

function nextWash(wash) {
  var i = WASHES.indexOf(String(wash))
  return WASHES[(i + 1) % WASHES.length]
}

function bucketCount(wash) {
  if (wash === "temperature") return TEMPERATURE.buckets
  if (wash === "cloud") return CLOUD_BUCKETS
  if (wash === "precipitation") return PRECIPITATION_STEPS.length
  return 0
}

// The bucket of a value (°C, %, mm/h), or -1 for none (missing, or no rain).
function bucket(wash, value) {
  var v = Number(value)
  if (!isFinite(v)) return -1
  if (wash === "temperature") {
    var t = (v - TEMPERATURE.min) / (TEMPERATURE.max - TEMPERATURE.min)
    return Math.max(0, Math.min(TEMPERATURE.buckets - 1, Math.floor(t * TEMPERATURE.buckets)))
  }
  if (wash === "cloud") return Math.max(0, Math.min(CLOUD_BUCKETS - 1, Math.floor(v / 100 * CLOUD_BUCKETS)))
  if (wash === "precipitation") {
    if (v < PRECIPITATION_STEPS[0]) return -1
    var b = 0
    for (var i = 0; i < PRECIPITATION_STEPS.length; i++) if (v >= PRECIPITATION_STEPS[i]) b = i
    return b
  }
  return -1
}

// A bucket's middle value (temperature in °C), for its colour.
function bucketValue(wash, index) {
  if (wash === "temperature")
    return TEMPERATURE.min + (index + 0.5) * (TEMPERATURE.max - TEMPERATURE.min) / TEMPERATURE.buckets
  if (wash === "cloud") return (index + 0.5) * 100 / CLOUD_BUCKETS
  if (wash === "precipitation") return PRECIPITATION_STEPS[index]
  return NaN
}

// Fixed colours as [r, g, b, a] in 0–255 (temperature comes from the view).
function fixedColor(wash, index) {
  if (wash === "cloud") return [255, 255, 255, Math.round(255 * 0.7 * (index + 0.5) / CLOUD_BUCKETS)]
  if (wash === "precipitation") {
    var hex = PRECIPITATION_COLORS[Math.max(0, Math.min(PRECIPITATION_COLORS.length - 1, index))]
    return [parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16), 200]
  }
  return null
}

// Five ticks for the legend: { at (0–1 along the bar), value } in the shown
// unit (°F, in/h with `imperial`).
function ticks(wash, imperial) {
  var list = []
  if (wash === "temperature") {
    for (var i = 0; i < 5; i++) {
      var c = TEMPERATURE.min + i * (TEMPERATURE.max - TEMPERATURE.min) / 4
      list.push({ at: i / 4, value: imperial ? Math.round(c * 1.8 + 32) : Math.round(c) })
    }
  } else if (wash === "cloud") {
    for (var k = 0; k < 5; k++) list.push({ at: k / 4, value: k * 25 })
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
  if (wash === "temperature") return imperial ? "°F" : "°C"
  if (wash === "cloud") return "%"
  if (wash === "precipitation") return imperial ? "in/h" : "mm/h"
  return ""
}

if (typeof module !== "undefined") module.exports = {}
