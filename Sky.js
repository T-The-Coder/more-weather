.pragma library

// The sun over the earth, for the More plugins' maps and globes: where it
// stands overhead, its elevation at a place, the day's sun times, the
// twilight steps along the day/night line as lat/lon areas, and the colours
// and drawing they share. No map projection here (WorldMap.js and Globe.js
// project); shared between More Time and More Weather (tools/sync-shared.sh).

var RAD = Math.PI / 180

// Where the sun stands overhead: the sun's position from the low-precision
// formulas of the Astronomical Almanac (good to about 0.01° in declination
// for this century), its longitude against Greenwich sidereal time.
function subsolarPoint(utcMs) {
  var n = (utcMs - Date.UTC(2000, 0, 1, 12)) / 86400000
  var L = 280.460 + 0.9856474 * n
  var g = (357.528 + 0.9856003 * n) * RAD
  var lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * RAD
  var epsilon = (23.439 - 0.0000004 * n) * RAD
  var alpha = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda)) / RAD
  var decl = Math.asin(Math.sin(epsilon) * Math.sin(lambda)) / RAD
  var gmst = 280.46061837 + 360.98564736629 * n
  var lon = ((alpha - gmst) % 360 + 540) % 360 - 180
  return { lat: decl, lon: lon }
}

// The area where the sun stands below `elevationDeg` as lat/lon rings, for
// the globe, sampled
// every `sampleDeg` degrees (2 when left out; a globe takes 4 while it
// turns by itself), as lat/lon rings
// [{lat, lon}, ...] to fill with the even-odd rule. It is a spherical cap
// around the antisolar point with an angular radius of 90° + elevation:
//  - holding one pole (always at 0°): one ring, the boundary from west to
//    east sampled every 2° of longitude, closed along the dark pole and the
//    ±180° meridians (the flat map's curved edge);
//  - holding no pole (−4°, −8° near the equinoxes): one oval with
//    continuous longitudes, which may run past ±180°;
//  - holding both poles (+6° near the equinoxes): the whole globe as a
//    rectangle, then the oval of the sunlit rest (even-odd leaves it out).
function twilightRings(utcMs, elevationDeg, sampleDeg) {
  var every = Number(sampleDeg) > 0 ? Number(sampleDeg) : 2
  var sun = subsolarPoint(utcMs)
  var e = Number(elevationDeg) || 0
  // A boundary right through a pole leaves the longitude undefined there
  // (and at 0° the old tangent formula infinite): keep the declination off it.
  var decl = sun.lat
  if (Math.abs(decl - e) < 0.05) decl = e + (decl < e ? -0.05 : 0.05)
  if (Math.abs(decl + e) < 0.05) decl = -e + (decl < -e ? -0.05 : 0.05)
  var latA = -decl
  var lonA = ((sun.lon + 360) % 360) - 180
  var rho = (90 + e) * RAD
  var north = decl < e
  var south = decl > -e
  var points = []
  var lat
  var lon
  if (north !== south) {
    // a sin(phi) + b cos(phi) = cos(rho): one crossing per meridian.
    var a = Math.sin(latA * RAD)
    var s = Math.cos(rho)
    var boundaryLat = function(lon) {
      var b = Math.cos(latA * RAD) * Math.cos((lon - lonA) * RAD)
      var r = Math.sqrt(a * a + b * b)
      var psi = Math.atan2(b, a)
      var base = Math.asin(Math.max(-1, Math.min(1, s / r)))
      var candidates = [base - psi, Math.PI - base - psi]
      for (var i = 0; i < 2; i++) {
        var c = Math.atan2(Math.sin(candidates[i]), Math.cos(candidates[i]))
        if (c >= -Math.PI / 2 - 1e-9 && c <= Math.PI / 2 + 1e-9) return Math.max(-90, Math.min(90, c / RAD))
      }
      return 0
    }
    for (lon = -180; lon <= 180; lon += every) points.push({ lat: boundaryLat(lon), lon: lon })
    var pole = north ? 90 : -90
    var step = pole < 0 ? -every : every
    for (lat = boundaryLat(180); (lat - pole) * step < 0; lat += step) points.push({ lat: lat, lon: 180 })
    for (lon = 180; lon >= -180; lon -= 4) points.push({ lat: pole, lon: lon })
    var end = boundaryLat(-180)
    for (lat = pole; (lat - end) * -step < 0; lat -= step) points.push({ lat: lat, lon: -180 })
    return [points]
  }
  // The oval: points at rho from the antisolar point, azimuth every 2°.
  // With both poles inside, it is drawn around the sun instead.
  var cLat = north ? -latA : latA
  var cLon = north ? lonA + 180 : lonA
  var radius = north ? Math.PI - rho : rho
  var sinC = Math.sin(cLat * RAD)
  var cosC = Math.cos(cLat * RAD)
  for (var az = 0; az < 360; az += every) {
    var t = az * RAD
    var sinLat = sinC * Math.cos(radius) + cosC * Math.sin(radius) * Math.cos(t)
    var pLat = Math.asin(Math.max(-1, Math.min(1, sinLat)))
    var dLon = Math.atan2(Math.sin(t) * Math.sin(radius) * cosC, Math.cos(radius) - sinC * sinLat)
    points.push({ lat: pLat / RAD, lon: cLon + dLon / RAD })
  }
  if (!north) return [points]
  var whole = []
  for (lat = -90; lat <= 90; lat += 2) whole.push({ lat: lat, lon: -180 })
  for (lat = 90; lat >= -90; lat -= 2) whole.push({ lat: lat, lon: 180 })
  return [whole, points]
}

// ---- The sky over a place, for the time in the menu bar ----

// The sun's elevation above the horizon in degrees at a place and moment
// (no refraction): +90 overhead, 0 on the horizon, below zero at night.
function sunElevation(lat, lon, utcMs) {
  var sun = subsolarPoint(utcMs)
  var phi = lat * RAD
  var decl = sun.lat * RAD
  var hourAngle = (lon - sun.lon) * RAD
  var s = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(hourAngle)
  return Math.asin(Math.max(-1, Math.min(1, s))) / RAD
}

// The golden hour is the sun between GOLDEN_LOW and GOLDEN_HIGH, the blue
// hour between BLUE_LOW and GOLDEN_LOW; sunrise and sunset are the upper
// limb on the horizon (refraction included). sunTimes and the sky colour
// share these limits.
var GOLDEN_HIGH = 6
var GOLDEN_LOW = -4
var BLUE_LOW = -8
var HORIZON = -0.833

// Day, golden hour, blue hour, night, by elevation: the stops below, linear
// in between, so the colour drifts across the evening instead of jumping.
// Each change is centred on the limits above: day to gold around +6°, gold
// to blue around −4°, then blue from −8° fading into night by −14°.
var SKY_STOPS = [
  [GOLDEN_HIGH + 2, "day"], [GOLDEN_HIGH - 2, "golden"], [GOLDEN_LOW + 1, "golden"], [GOLDEN_LOW - 1, "blue"],
  [BLUE_LOW, "blue"], [BLUE_LOW - 6, "night"]
]
var SKY_COLORS = { day: "#5ea8e8", golden: "#e3a447", blue: "#3b5bd6", night: "#4a3c9a" }

// Weights of the four phases at an elevation; they add up to 1.
function skyMix(elevationDeg) {
  var mix = { day: 0, golden: 0, blue: 0, night: 0 }
  var e = Number(elevationDeg)
  if (!(e < SKY_STOPS[0][0])) { mix.day = 1; return mix }
  var last = SKY_STOPS[SKY_STOPS.length - 1]
  if (!(e > last[0])) { mix[last[1]] = 1; return mix }
  for (var i = 0; i < SKY_STOPS.length - 1; i++) {
    var high = SKY_STOPS[i]
    var low = SKY_STOPS[i + 1]
    if (e > high[0] || e < low[0]) continue
    var t = (high[0] - e) / (high[0] - low[0])
    mix[high[1]] += 1 - t
    mix[low[1]] += t
    return mix
  }
  return mix
}

function hexRgb(hex) {
  var n = parseInt(String(hex).replace("#", ""), 16)
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]
}

function rgbHex(rgb) {
  var text = "#"
  for (var i = 0; i < 3; i++) {
    var v = Math.round(Math.max(0, Math.min(1, rgb[i])) * 255)
    text += (v < 16 ? "0" : "") + v.toString(16)
  }
  return text
}

function mixRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

// WCAG contrast of two colours given as [r, g, b] in 0–1.
function contrast(a, b) {
  function luminance(c) {
    var l = c.map(function(v) { return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) })
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]
  }
  var la = luminance(a)
  var lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// The sky colour for an elevation as "#rrggbb", softened a quarter towards
// the text colour like the other accents, and further (up to 60 %) until it
// reads at 3:1 on the background, so the night stays legible on a dark
// theme and the day on a light one. foreground, background: [r, g, b].
function skyColor(elevationDeg, foreground, background) {
  var mix = skyMix(elevationDeg)
  var rgb = [0, 0, 0]
  for (var phase in mix) {
    var c = hexRgb(SKY_COLORS[phase])
    for (var i = 0; i < 3; i++) rgb[i] += c[i] * mix[phase]
  }
  if (!foreground) return rgbHex(rgb)
  var t = 0.25
  var out = mixRgb(rgb, foreground, t)
  while (background && contrast(out, background) < 3 && t < 0.6) {
    t += 0.05
    out = mixRgb(rgb, foreground, t)
  }
  return rgbHex(out)
}

// The Sun's colour wherever it is drawn (maps, globes, Astro, the sun
// glyphs): gold #E3A447 softened a quarter towards the text colour, and
// further (up to the text colour itself) until it reads at 3:1 on the
// background. foreground, background: [r, g, b] in 0–1; "#rrggbb".
var SUN_GOLD = "#e3a447"
function sunColor(foreground, background) {
  if (!foreground) return SUN_GOLD
  var gold = hexRgb(SUN_GOLD)
  var out = gold
  for (var step = 5; step <= 20; step++) {
    out = mixRgb(gold, foreground, step / 20)
    if (!background || contrast(out, background) >= 3) break
  }
  return rgbHex(out)
}

// ---- Drawing shared by the flat maps and the globes. Colours are
//      { r, g, b, a } in 0–1 or Qt colours.

// The twilight bands' fills: gold and blue of the sky colours, translucent.
function bandFill(name) {
  var c = hexRgb(name === "golden" ? SKY_COLORS.golden : SKY_COLORS.blue)
  return { r: c[0], g: c[1], b: c[2], a: 0.28 }
}

// The layers the flat map and the globe fill along the day/night line, in
// drawing order: { high, low, fill } is the area where the sun stands below
// `high` and not below `low` (low null: below `high`), each the even-odd fill
// of the caps at those elevations (twilightRings, WorldMap.twilightPolygon,
// Globe.capPolygonView).
//  - The golden band (+6° … 0°) in three steps, strongest at the day/night
//    line (the gold is deepest with the sun lowest) and fading towards the
//    day; the blue band (0° … −8°) in three steps the other way round,
//    lightest at the line and deepest towards the night, as the blue
//    deepens while the sun sinks, so it runs into the night steps.
//  - The night after them, darkening the blue band too: civil twilight
//    (0° … −6°), nautical (−6° … −12°), then full night below −12°, in the
//    night colour at growing alpha (nightFill).
// options: { golden, blue, night } switches; background: [r, g, b].
var GOLDEN_STEPS = [[6, 4, 0.10], [4, 2, 0.20], [2, 0, 0.28]]
var BLUE_STEPS = [[0, -3, 0.10], [-3, -6, 0.20], [-6, -8, 0.28]]
var NIGHT_STEPS = [[0, -6, 0.12], [-6, -12, 0.24], [-12, null, 0]]

function twilightLayers(options, background) {
  var layers = []
  function add(steps, color, last) {
    for (var i = 0; i < steps.length; i++) {
      var alpha = steps[i][2] || last
      layers.push({ high: steps[i][0], low: steps[i][1], fill: { r: color.r, g: color.g, b: color.b, a: alpha } })
    }
  }
  if (options.golden) add(GOLDEN_STEPS, bandFill("golden"))
  if (options.blue) add(BLUE_STEPS, bandFill("blue"))
  if (options.night) {
    var night = nightFill(background)
    add(NIGHT_STEPS, night, night.a)
  }
  return layers
}

// The elevations the layers need, each once.
function twilightElevations(layers) {
  var seen = []
  for (var i = 0; i < layers.length; i++) {
    if (seen.indexOf(layers[i].high) < 0) seen.push(layers[i].high)
    if (layers[i].low !== null && seen.indexOf(layers[i].low) < 0) seen.push(layers[i].low)
  }
  return seen
}

// The Sun at its zenith point: a disc with eight short rays, a little larger
// than a city's dot, so it is not taken for one.
function paintSun(ctx, x, y, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 1.4
  ctx.lineCap = "round"
  ctx.beginPath()
  ctx.arc(x, y, 3.6, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  for (var i = 0; i < 8; i++) {
    var a = i * Math.PI / 4
    ctx.moveTo(x + Math.cos(a) * 5.4, y + Math.sin(a) * 5.4)
    ctx.lineTo(x + Math.cos(a) * 8, y + Math.sin(a) * 8)
  }
  ctx.stroke()
  ctx.restore()
}

// The night side's fill: 70 % black and 30 % of the night sky (#4a3c9a),
// so it also shows on dark themes, where its alpha is raised too. Clearly
// darker than the twilight bands, which it covers on the night side.
// background: [r, g, b] in 0–1 (the popup's). { r, g, b, a } in 0–1.
function nightFill(background) {
  var night = hexRgb(SKY_COLORS.night)
  var bg = background || [1, 1, 1]
  var luminance = 0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]
  return { r: night[0] * 0.3, g: night[1] * 0.3, b: night[2] * 0.3, a: luminance < 0.5 ? 0.38 : 0.30 }
}

// The sun's day at a place: the local day containing `utcMs` (local by
// offsetSeconds), sampled every ten minutes and refined by bisection at each
// crossing. Instants in UTC ms, 0 when it does not happen that day:
//   { sunrise, sunset, goldenMorning: [start, end], goldenEvening,
//     blueMorning, blueEvening, polar: "" | "day" | "night" }
// A morning range rises through its limits, an evening one sinks.
function sunTimes(lat, lon, utcMs, offsetSeconds) {
  var offsetMs = (Number(offsetSeconds) || 0) * 1000
  var dayStart = Math.floor((utcMs + offsetMs) / 86400000) * 86400000 - offsetMs
  var step = 600000
  var samples = []
  var high = -90
  var low = 90
  for (var t = dayStart; t <= dayStart + 86400000; t += step) {
    var e = sunElevation(lat, lon, t)
    samples.push(e)
    high = Math.max(high, e)
    low = Math.min(low, e)
  }
  function crossing(limit, rising) {
    for (var i = 0; i + 1 < samples.length; i++) {
      var a = samples[i] - limit
      var b = samples[i + 1] - limit
      if (rising ? !(a < 0 && b >= 0) : !(a >= 0 && b < 0)) continue
      var from = dayStart + i * step
      var to = from + step
      for (var k = 0; k < 12; k++) {
        var mid = (from + to) / 2
        var above = sunElevation(lat, lon, mid) >= limit
        if (above === rising) to = mid
        else from = mid
      }
      return Math.round((from + to) / 2)
    }
    return 0
  }
  function range(start, end) { return start && end && end > start ? [start, end] : [0, 0] }
  return {
    sunrise: crossing(HORIZON, true),
    sunset: crossing(HORIZON, false),
    goldenMorning: range(crossing(GOLDEN_LOW, true), crossing(GOLDEN_HIGH, true)),
    goldenEvening: range(crossing(GOLDEN_HIGH, false), crossing(GOLDEN_LOW, false)),
    blueMorning: range(crossing(BLUE_LOW, true), crossing(GOLDEN_LOW, true)),
    blueEvening: range(crossing(GOLDEN_LOW, false), crossing(BLUE_LOW, false)),
    polar: low >= HORIZON ? "day" : (high < HORIZON ? "night" : "")
  }
}

if (typeof module !== "undefined") module.exports = {
  subsolarPoint: subsolarPoint, sunElevation: sunElevation, sunTimes: sunTimes, twilightRings: twilightRings,
  GOLDEN_HIGH: GOLDEN_HIGH, GOLDEN_LOW: GOLDEN_LOW, BLUE_LOW: BLUE_LOW, HORIZON: HORIZON,
  GOLDEN_STEPS: GOLDEN_STEPS, BLUE_STEPS: BLUE_STEPS, NIGHT_STEPS: NIGHT_STEPS, SKY_COLORS: SKY_COLORS,
  twilightLayers: twilightLayers, twilightElevations: twilightElevations, nightFill: nightFill, bandFill: bandFill,
  skyMix: skyMix, skyColor: skyColor, sunColor: sunColor, SUN_GOLD: SUN_GOLD, contrast: contrast, hexRgb: hexRgb, rgbHex: rgbHex, mixRgb: mixRgb,
  paintSun: paintSun
}
