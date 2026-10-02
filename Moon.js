.pragma library

// The Moon, shared by the More plugins (tools/sync-shared.sh): where it
// stands, its phase, and drawing it as a small shaded sphere on a Canvas
// (the MoonSphere component, maps, the globe). Pure functions, so the
// tests can load them in Node.

var RAD = Math.PI / 180

// Its phase: the true elongation from the Sun (Meeus ch. 49 low-precision
// terms, the same as More Weather's Model.moonPhaseFraction), 0 new, 0.25
// first quarter, 0.5 full, 0.75 last quarter.
function moonPhaseFraction(utcMs) {
  var centuries = (utcMs / 86400000 + 2440587.5 - 2451545) / 36525
  var elongation = 297.8501921 + 445267.1114034 * centuries
  var sunAnomaly = 357.5291092 + 35999.0502909 * centuries
  var moonAnomaly = 134.9633964 + 477198.8675055 * centuries
  var trueElongation = elongation
    + 6.289 * Math.sin(moonAnomaly * RAD)
    - 2.100 * Math.sin(sunAnomaly * RAD)
    + 1.274 * Math.sin((2 * elongation - moonAnomaly) * RAD)
    + 0.658 * Math.sin(2 * elongation * RAD)
    + 0.214 * Math.sin(2 * moonAnomaly * RAD)
    + 0.110 * Math.sin(elongation * RAD)
  var fraction = (trueElongation % 360) / 360
  return fraction < 0 ? fraction + 1 : fraction
}

// Where the Moon stands at the zenith, with its phase: { lat, lon, phase,
// illuminated (0–1), waxing }. Its geocentric ecliptic longitude and
// latitude from the main terms of Meeus' series (ch. 47, good to a few
// tenths of a degree), then right ascension and declination, and the
// longitude against Greenwich sidereal time as for the Sun. Parallax (up to
// a degree) is left out.
function moonPosition(utcMs) {
  var n = (utcMs - Date.UTC(2000, 0, 1, 12)) / 86400000
  var T = n / 36525
  var Lp = 218.3164477 + 481267.88123421 * T
  var D = (297.8501921 + 445267.1114034 * T) * RAD
  var M = (357.5291092 + 35999.0502909 * T) * RAD
  var Mp = (134.9633964 + 477198.8675055 * T) * RAD
  var F = (93.2720950 + 483202.0175233 * T) * RAD
  var lambda = (Lp + 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D)
    + 0.214 * Math.sin(2 * Mp) - 0.186 * Math.sin(M) - 0.114 * Math.sin(2 * F)
    - 0.059 * Math.sin(2 * D - 2 * Mp) - 0.057 * Math.sin(2 * D - M - Mp)
    + 0.053 * Math.sin(2 * D + Mp) + 0.046 * Math.sin(2 * D - M) - 0.041 * Math.sin(M - Mp)) * RAD
  var beta = (5.128 * Math.sin(F) + 0.281 * Math.sin(Mp + F) + 0.278 * Math.sin(Mp - F)
    + 0.173 * Math.sin(2 * D - F) + 0.055 * Math.sin(2 * D - Mp + F) + 0.046 * Math.sin(2 * D - Mp - F)) * RAD
  var epsilon = (23.439 - 0.0000004 * n) * RAD
  var alpha = Math.atan2(Math.sin(lambda) * Math.cos(epsilon) - Math.tan(beta) * Math.sin(epsilon), Math.cos(lambda)) / RAD
  var decl = Math.asin(Math.sin(beta) * Math.cos(epsilon) + Math.cos(beta) * Math.sin(epsilon) * Math.sin(lambda)) / RAD
  var gmst = 280.46061837 + 360.98564736629 * n
  var lon = ((alpha - gmst) % 360 + 540) % 360 - 180
  var phase = moonPhaseFraction(utcMs)
  return { lat: decl, lon: lon, phase: phase, illuminated: (1 - Math.cos(2 * Math.PI * phase)) / 2, waxing: phase < 0.5 }
}

// The point `deg` degrees from (lat1, lon1) along the great circle towards
// (lat2, lon2): which way the Sun lies, seen on the map, for the lit side.
function towards(lat1, lon1, lat2, lon2, deg) {
  var p1 = lat1 * RAD, l1 = lon1 * RAD, p2 = lat2 * RAD, l2 = lon2 * RAD
  var d = Math.acos(Math.max(-1, Math.min(1, Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(l2 - l1))))
  if (d < 1e-9) return { lat: lat1, lon: lon1 }
  var bearing = Math.atan2(Math.sin(l2 - l1) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(l2 - l1))
  var a = deg * RAD
  var lat = Math.asin(Math.sin(p1) * Math.cos(a) + Math.cos(p1) * Math.sin(a) * Math.cos(bearing))
  var lon = l1 + Math.atan2(Math.sin(bearing) * Math.sin(a) * Math.cos(p1), Math.cos(a) - Math.sin(p1) * Math.sin(lat))
  return { lat: lat / RAD, lon: lon / RAD }
}

// Which way the Sun lies from the Moon on screen (radians, canvas: 0 to the
// right, clockwise); toScreen(lat, lon) → { x, y }. The longitude is kept
// next to the Moon's, so the flat map does not look across ±180°.
function moonLitAngle(moon, sun, toScreen) {
  var toward = towards(moon.lat, moon.lon, sun.lat, sun.lon, 4)
  var dl = toward.lon - moon.lon
  while (dl > 180) dl -= 360
  while (dl < -180) dl += 360
  var p = toScreen(moon.lat, moon.lon)
  var q = toScreen(toward.lat, moon.lon + dl)
  return Math.atan2(q.y - p.y, q.x - p.x)
}

// The soft shadow the floating Moon casts at its sub-lunar point.
function paintMoonShadow(ctx, x, y, r) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(1, 0.45)
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)"
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// The Moon as a small sphere at (x, y), radius r, its lit side towards
// `angle`, `illuminated` 0–1 of the disc lit: the dark part faint, the lit
// part shaded brighter towards the Sun (a radial gradient), the terminator
// an ellipse of half-width r·|1 − 2k| bulging towards the light (crescent)
// or away from it (gibbous), and a thin soft outline. lit, dark, outline:
// "r,g,b" strings in 0–255 for the gradient's stops.
function paintMoon(ctx, x, y, r, angle, illuminated, lit, dark, outline) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = "rgba(" + dark + ", 0.55)"
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  var k = Math.max(0, Math.min(1, illuminated))
  var e = r * Math.abs(1 - 2 * k)
  var side = k < 0.5 ? 1 : -1
  var shade = ctx.createRadialGradient(r * 0.45, -r * 0.2, r * 0.1, 0, 0, r * 1.05)
  shade.addColorStop(0, "rgba(" + lit + ", 1)")
  shade.addColorStop(1, "rgba(" + lit + ", 0.62)")
  ctx.fillStyle = shade
  ctx.beginPath()
  ctx.moveTo(0, -r)
  for (var i = 1; i <= 24; i++) {
    var t = -Math.PI / 2 + i * Math.PI / 24
    ctx.lineTo(Math.cos(t) * r, Math.sin(t) * r)
  }
  for (var j = 1; j < 24; j++) {
    var u = Math.PI / 2 - j * Math.PI / 24
    ctx.lineTo(side * Math.cos(u) * e, Math.sin(u) * r)
  }
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = "rgba(" + outline + ", 0.45)"
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

// "r,g,b" in 0–255 of a colour given in 0–1, for paintMoon.
function rgbText(c) {
  return Math.round(c.r * 255) + "," + Math.round(c.g * 255) + "," + Math.round(c.b * 255)
}


if (typeof module !== "undefined") module.exports = {
  moonPhaseFraction: moonPhaseFraction, moonPosition: moonPosition, towards: towards,
  moonLitAngle: moonLitAngle, paintMoonShadow: paintMoonShadow, paintMoon: paintMoon, rgbText: rgbText
}
