.pragma library

// One colour means one warmth everywhere (the text's accents, the globe's
// temperature and sea layers, its legend): the plugin's sequence blue,
// cyan, yellow, orange, red over −10 … 35 °C as the text has always shown
// it, extended below to a blue-violet at −40 °C and above to a dark magenta
// at 45 °C, all from the theme's palette and softened towards the text
// colour the same way (Panel.accentOf: 72 % colour over the text).
// Colours are [r, g, b] in 0–1. Pure, tested in Node
// (tests/temperature-scale.test.mjs).

var LOW = -10
var HIGH = 35
var MIN = -40
var MAX = 45

function mix(a, b, f) {
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}
// Qt.darker's factor, near enough: the value scaled down.
function darker(c, factor) {
  return [c[0] / factor, c[1] / factor, c[2] / factor]
}
// The accent of a colour over the text: 72 % colour.
function soften(c, foreground) {
  return mix(foreground, c, 0.72)
}

// The scale's stops [celsius, [r, g, b]] for a theme: { blue, cyan, yellow,
// orange, red, magenta, foreground } as [r, g, b].
function stops(theme) {
  var span = HIGH - LOW
  var violet = darker(mix(theme.blue, theme.magenta, 0.55), 1.25)
  var deepMagenta = darker(theme.magenta, 1.35)
  return [
    [MIN, soften(violet, theme.foreground)],
    [LOW, soften(theme.blue, theme.foreground)],
    [LOW + 0.35 * span, soften(theme.cyan, theme.foreground)],
    [LOW + 0.65 * span, soften(theme.yellow, theme.foreground)],
    [LOW + 0.85 * span, soften(theme.orange, theme.foreground)],
    [HIGH, soften(theme.red, theme.foreground)],
    [MAX, soften(deepMagenta, theme.foreground)]
  ]
}

// The colour of a temperature (°C) on the scale; the ends hold beyond −40
// and 45 °C. Null without a number.
function color(celsius, theme) {
  var value = parseFloat(celsius)
  if (!isFinite(value)) return null
  var list = stops(theme)
  if (value <= list[0][0]) return list[0][1]
  for (var i = 1; i < list.length; i++) {
    if (value > list[i][0]) continue
    return mix(list[i - 1][1], list[i][1], (value - list[i - 1][0]) / (list[i][0] - list[i - 1][0]))
  }
  return list[list.length - 1][1]
}

if (typeof module !== "undefined") module.exports = {}
