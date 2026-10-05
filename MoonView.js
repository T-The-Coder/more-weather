.pragma library

// The Moon as seen from a place on Earth, shared by the More plugins (it
// imports nothing, so More Weather can take it as it is): where it stands
// in the sky, how much of it is lit, which way its lit side faces against
// the observer's horizon, how far and how large it is, and when it next
// rises and sets. Pure functions, so the tests load them in Node.
//
// Formulas from Jean Meeus, Astronomical Algorithms (2nd ed., 1998):
//  - the Moon's place: ch. 47 with the full tables 47.A and 47.B (about
//    10″ in longitude, 4″ in latitude, a few km in distance), the table
//    values as transcribed in PyMeeus (https://github.com/architest/pymeeus,
//    pymeeus/Moon.py, retrieved 2026-10-05; checked here against Meeus'
//    example 47.a);
//  - the Sun's place: ch. 25, the low-accuracy method (0.01°), example 25.a;
//  - nutation (the short series of ch. 22, 0.5″) and the mean obliquity
//    (eq. 22.2), example 22.a; mean sidereal time eq. 12.4;
//  - the topocentric place (ch. 40, parallax, with the observer's geocentric
//    position from ch. 11, the WGS 84 flattening), done with vectors;
//  - altitude and azimuth (ch. 13), the parallactic angle (eq. 14.1), the
//    illuminated fraction (eqs. 48.2, 48.3, 48.4) and the position angle
//    of the bright limb (eq. 48.5); refraction for apparentAltitude after
//    Bennett (eq. 16.4).
// Times are UTC ms. The series take Terrestrial Time: TT = UTC + 69.184 s
// (TAI − UTC = 37 s since 2017, IERS Bulletin C,
// https://hpiers.obspm.fr/iers/bul/bulc/bulletinc.dat, plus 32.184 s);
// UTC stands in for UT1 in the sidereal time (within 0.9 s).

var RAD = Math.PI / 180
var TT_MINUS_UTC_MS = 69184
var EARTH_RADIUS_KM = 6378.14 // Meeus' value for the parallax (ch. 40, 47)
var FLATTENING_BA = 0.99664719 // b/a for WGS 84 (Meeus ch. 11)
var MOON_RADIUS_KM = 1737.4 // NASA Moon fact sheet, https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html
var AU_KM = 149597870.7 // IAU 2012 B2

// Rise and set: the upper limb on the horizon with the standard 34′ of
// refraction (as the USNO and Meeus ch. 15 count them).
var REFRACTION_AT_HORIZON = 34 / 60

// Earthshine is drawn on crescents below this lit fraction (about four
// days from new): a drawing threshold, not a measured constant.
var EARTHSHINE_BELOW = 0.25

// Table 47.A: multiples of D, M, M′, F; Σl (0.000001°), Σr (0.001 km).
var TERMS_LR = [
  [0, 0, 1, 0, 6288774, -20905355], [2, 0, -1, 0, 1274027, -3699111], [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925], [0, 1, 0, 0, -185116, 48888], [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158], [2, -1, -1, 0, 57066, -152138], [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586], [0, 1, -1, 0, -40923, -129620], [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755], [2, 0, 0, -2, 15327, 10321], [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661], [4, 0, -1, 0, 10675, -34782], [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636], [2, 1, -1, 0, -7888, 24208], [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379], [1, 1, 0, 0, 4987, -16675], [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445], [4, 0, 0, 0, 3861, -11650], [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003], [2, 0, -1, 2, -2602, 0], [2, -1, -2, 0, 2390, 10056], [1, 0, 1, 0, -2348, 6322],
  [2, -2, 0, 0, 2236, -9884], [0, 1, 2, 0, -2120, 5751], [0, 2, 0, 0, -2069, 0], [2, -2, -1, 0, 2048, -4950],
  [2, 0, 1, -2, -1773, 4130], [2, 0, 0, 2, -1595, 0], [4, -1, -1, 0, 1215, -3958], [0, 0, 2, 2, -1110, 0],
  [3, 0, -1, 0, -892, 3258], [2, 1, 1, 0, -810, 2616], [4, -1, -2, 0, 759, -1897], [0, 2, -1, 0, -713, -2117],
  [2, 2, -1, 0, -700, 2354], [2, 1, -2, 0, 691, 0], [2, -1, 0, -2, 596, 0], [4, 0, 1, 0, 549, -1423],
  [0, 0, 4, 0, 537, -1117], [4, -1, 0, 0, 520, -1571], [1, 0, -2, 0, -487, -1739], [2, 1, 0, -2, -399, 0],
  [0, 0, 2, -2, -381, -4421], [1, 1, 1, 0, 351, 0], [3, 0, -2, 0, -340, 0], [4, 0, -3, 0, 330, 0],
  [2, -1, 2, 0, 327, 0], [0, 2, 1, 0, -323, 1165], [1, 1, -1, 0, 299, 0], [2, 0, 3, 0, 294, 0],
  [2, 0, -1, -2, 0, 8752]
]

// Table 47.B: multiples of D, M, M′, F; Σb (0.000001°).
var TERMS_B = [
  [0, 0, 0, 1, 5128122], [0, 0, 1, 1, 280602], [0, 0, 1, -1, 277693], [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413], [2, 0, -1, -1, 46271], [2, 0, 0, 1, 32573], [0, 0, 2, 1, 17198], [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822], [2, -1, 0, -1, 8216], [2, 0, -2, -1, 4324], [2, 0, 1, 1, 4200], [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463], [2, -1, 0, 1, 2211], [2, -1, -1, -1, 2065], [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828], [0, 1, 0, 1, -1794], [0, 0, 0, 3, -1749], [0, 1, -1, 1, -1565], [1, 0, 0, 1, -1491],
  [0, 1, 1, 1, -1475], [0, 1, 1, -1, -1410], [0, 1, 0, -1, -1344], [1, 0, 0, -1, -1335], [0, 0, 3, 1, 1107],
  [4, 0, 0, -1, 1021], [4, 0, -1, 1, 833], [0, 0, 1, -3, 777], [4, 0, -2, 1, 671], [2, 0, 0, -3, 607],
  [2, 0, 2, -1, 596], [2, -1, 1, -1, 491], [2, 0, -2, 1, -451], [0, 0, 3, -1, 439], [2, 0, 2, 1, 422],
  [2, 0, -3, -1, 421], [2, 1, -1, 1, -366], [2, 1, 0, 1, -351], [4, 0, 0, 1, 331], [2, -1, 1, 1, 315],
  [2, -2, 0, -1, 302], [0, 0, 1, 3, -283], [2, 1, 1, -1, -229], [1, 1, 0, -1, 223], [1, 1, 0, 1, 223],
  [0, 1, -2, -1, -220], [2, 1, -1, -1, -220], [1, 0, 1, 1, -185], [2, -1, -2, -1, 181], [0, 1, 2, 1, -177],
  [4, 0, -2, -1, 176], [4, -1, -1, -1, 166], [1, 0, 1, -1, -164], [4, 0, 1, -1, 132], [1, 0, -1, -1, -119],
  [4, -1, 0, -1, 115], [2, -2, 0, 1, 107]
]

function wrap360(deg) {
  return (deg % 360 + 360) % 360
}

function wrap180(deg) {
  return ((deg + 180) % 360 + 360) % 360 - 180
}

// Julian centuries of TT since J2000.0 for a UTC moment.
function centuriesTT(utcMs) {
  return ((utcMs + TT_MINUS_UTC_MS) / 86400000 + 2440587.5 - 2451545.0) / 36525
}

// The Moon's geocentric place, mean equinox of date (Meeus ch. 47):
// { lon, lat (degrees), distanceKm }. T in Julian centuries (TT).
function moonEcliptic(T) {
  var Lp = 218.3164477 + (481267.88123421 + (-0.0015786 + (1 / 538841 - T / 65194000) * T) * T) * T
  var D = 297.8501921 + (445267.1114034 + (-0.0018819 + (1 / 545868 - T / 113065000) * T) * T) * T
  var M = 357.5291092 + (35999.0502909 + (-0.0001536 + T / 24490000) * T) * T
  var Mp = 134.9633964 + (477198.8675055 + (0.0087414 + (1 / 69699 - T / 14712000) * T) * T) * T
  var F = 93.2720950 + (483202.0175233 + (-0.0036539 + (-1 / 3526000 + T / 863310000) * T) * T) * T
  var A1 = (119.75 + 131.849 * T) * RAD
  var A2 = (53.09 + 479264.290 * T) * RAD
  var A3 = (313.45 + 481266.484 * T) * RAD
  var E = 1 - (0.002516 + 0.0000074 * T) * T
  var d = wrap360(D) * RAD, m = wrap360(M) * RAD, mp = wrap360(Mp) * RAD, f = wrap360(F) * RAD
  var lp = wrap360(Lp) * RAD
  var sl = 0, sr = 0, sb = 0
  var i, t, arg, scale
  for (i = 0; i < TERMS_LR.length; i++) {
    t = TERMS_LR[i]
    arg = t[0] * d + t[1] * m + t[2] * mp + t[3] * f
    scale = t[1] === 0 ? 1 : (t[1] === 1 || t[1] === -1 ? E : E * E)
    sl += t[4] * scale * Math.sin(arg)
    sr += t[5] * scale * Math.cos(arg)
  }
  for (i = 0; i < TERMS_B.length; i++) {
    t = TERMS_B[i]
    arg = t[0] * d + t[1] * m + t[2] * mp + t[3] * f
    scale = t[1] === 0 ? 1 : (t[1] === 1 || t[1] === -1 ? E : E * E)
    sb += t[4] * scale * Math.sin(arg)
  }
  sl += 3958 * Math.sin(A1) + 1962 * Math.sin(lp - f) + 318 * Math.sin(A2)
  sb += -2235 * Math.sin(lp) + 382 * Math.sin(A3) + 175 * Math.sin(A1 - f) + 175 * Math.sin(A1 + f)
    + 127 * Math.sin(lp - mp) - 115 * Math.sin(lp + mp)
  return { lon: wrap360(Lp + sl / 1000000), lat: sb / 1000000, distanceKm: 385000.56 + sr / 1000 }
}

// Nutation and obliquity (Meeus ch. 22): { dpsi, deps, eps0, eps } in degrees.
function nutation(T) {
  var omega = (125.04452 - 1934.136261 * T) * RAD
  var L = (280.4665 + 36000.7698 * T) * RAD
  var Lp = (218.3165 + 481267.8813 * T) * RAD
  var dpsi = (-17.20 * Math.sin(omega) - 1.32 * Math.sin(2 * L) - 0.23 * Math.sin(2 * Lp) + 0.21 * Math.sin(2 * omega)) / 3600
  var deps = (9.20 * Math.cos(omega) + 0.57 * Math.cos(2 * L) + 0.10 * Math.cos(2 * Lp) - 0.09 * Math.cos(2 * omega)) / 3600
  var eps0 = 23 + 26 / 60 + (21.448 - (46.8150 + (0.00059 - 0.001813 * T) * T) * T) / 3600
  return { dpsi: dpsi, deps: deps, eps0: eps0, eps: eps0 + deps }
}

// The Sun's apparent place (Meeus ch. 25, low accuracy):
// { lon (apparent), distanceAu }. T in Julian centuries (TT).
function sunEcliptic(T) {
  var L0 = 280.46646 + (36000.76983 + 0.0003032 * T) * T
  var M = (357.52911 + (35999.05029 - 0.0001537 * T) * T) * RAD
  var e = 0.016708634 - (0.000042037 + 0.0000001267 * T) * T
  var C = (1.914602 - (0.004817 + 0.000014 * T) * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M)
  var v = M + C * RAD
  var R = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(v))
  var omega = (125.04 - 1934.136 * T) * RAD
  return { lon: wrap360(L0 + C - 0.00569 - 0.00478 * Math.sin(omega)), distanceAu: R, omega: omega }
}

// Ecliptic (of date) to equatorial: { ra, dec } in degrees.
function toEquatorial(lon, lat, eps) {
  var l = lon * RAD, b = lat * RAD, e = eps * RAD
  var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l))
  var dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l))
  return { ra: wrap360(ra / RAD), dec: dec / RAD }
}

// Greenwich mean sidereal time in degrees (Meeus eq. 12.4), from UT.
function gmst(utcMs) {
  var d = utcMs / 86400000 + 2440587.5 - 2451545.0
  var T = d / 36525
  return wrap360(280.46061837 + 360.98564736629 * d + (0.000387933 - T / 38710000) * T * T)
}

// The geocentric apparent places of the Moon and the Sun at a moment:
// { moon: { ra, dec, distanceKm, lon, lat }, sun: { ra, dec, distanceAu, lon },
//   gast (apparent sidereal time at Greenwich, degrees) }.
function geocentric(utcMs) {
  var T = centuriesTT(utcMs)
  var n = nutation(T)
  var m = moonEcliptic(T)
  var mlon = m.lon + n.dpsi
  var mq = toEquatorial(mlon, m.lat, n.eps)
  var s = sunEcliptic(T)
  // Meeus ch. 25: with the low-accuracy apparent longitude the obliquity
  // gets + 0.00256° cos Ω.
  var sq = toEquatorial(s.lon, 0, n.eps0 + 0.00256 * Math.cos(s.omega))
  return {
    moon: { ra: mq.ra, dec: mq.dec, distanceKm: m.distanceKm, lon: wrap360(mlon), lat: m.lat },
    sun: { ra: sq.ra, dec: sq.dec, distanceAu: s.distanceAu, lon: s.lon },
    gast: wrap360(gmst(utcMs) + n.dpsi * Math.cos(n.eps * RAD))
  }
}

// The observer's geocentric position (Meeus ch. 11): ρ sin φ′, ρ cos φ′ in
// Earth radii for geodetic latitude lat (degrees) and height (m).
function observerTerms(lat, heightM) {
  var phi = lat * RAD
  var u = Math.atan(FLATTENING_BA * Math.tan(phi))
  var h = (Number(heightM) || 0) / 6378140
  return { rs: FLATTENING_BA * Math.sin(u) + h * Math.sin(phi), rc: Math.cos(u) + h * Math.cos(phi) }
}

// The Moon's topocentric right ascension, declination (degrees), distance
// (km) and local hour angle (degrees) seen from (lat, lon, height), given
// geocentric() for the moment.
function topocentric(g, lat, lon, heightM) {
  var o = observerTerms(lat, heightM)
  var theta = (g.gast + lon) * RAD
  var a = g.moon.ra * RAD, d = g.moon.dec * RAD, r = g.moon.distanceKm
  var x = r * Math.cos(d) * Math.cos(a) - EARTH_RADIUS_KM * o.rc * Math.cos(theta)
  var y = r * Math.cos(d) * Math.sin(a) - EARTH_RADIUS_KM * o.rc * Math.sin(theta)
  var z = r * Math.sin(d) - EARTH_RADIUS_KM * o.rs
  var dist = Math.sqrt(x * x + y * y + z * z)
  var ra = wrap360(Math.atan2(y, x) / RAD)
  return { ra: ra, dec: Math.asin(z / dist) / RAD, distanceKm: dist, hourAngle: wrap360(g.gast + lon - ra) }
}

// Altitude (degrees, airless) and azimuth (degrees from north through east)
// of hour angle H and declination dec at latitude lat (Meeus ch. 13).
function horizontal(H, dec, lat) {
  var h = H * RAD, d = dec * RAD, phi = lat * RAD
  var alt = Math.asin(Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(h))
  var az = Math.atan2(Math.sin(h), Math.cos(h) * Math.sin(phi) - Math.tan(d) * Math.cos(phi))
  return { altitude: alt / RAD, azimuth: wrap360(az / RAD + 180) }
}

// The parallactic angle q (Meeus eq. 14.1), degrees: the position angle of
// the zenith seen at the object, east of north.
function parallacticAngle(H, dec, lat) {
  var h = H * RAD, d = dec * RAD, phi = lat * RAD
  return Math.atan2(Math.sin(h), Math.tan(phi) * Math.cos(d) - Math.sin(d) * Math.cos(h)) / RAD
}

// Refraction (degrees) to add to an airless altitude: Bennett's formula as
// inverted by Meeus (eq. 16.4, Sæmundsson), 10 °C and 1010 hPa; 0 well
// below the horizon.
function refraction(altitude) {
  if (altitude < -2) return 0
  return 1.02 / Math.tan((altitude + 10.3 / (altitude + 5.11)) * RAD) / 60
}

// The Moon's geocentric place every hour from `fromMs` for 25 hours, for
// the rise and set search: { t0, ra, dec, distanceKm } arrays. In an hour
// the Moon moves about half a degree almost uniformly, so a straight line
// between the hours is good to well under an arcsecond.
var TABLE_STEP_MS = 3600000

function hourlyTable(fromMs) {
  var out = { t0: fromMs, ra: [], dec: [], distanceKm: [] }
  for (var i = 0; i <= 25; i++) {
    var g = geocentric(fromMs + i * TABLE_STEP_MS)
    out.ra.push(g.moon.ra)
    out.dec.push(g.moon.dec)
    out.distanceKm.push(g.moon.distanceKm)
  }
  return out
}

// How far the upper limb stands above the refracted horizon at a moment
// (degrees): the topocentric altitude of the centre plus 34′ plus the
// topocentric semidiameter, from the hourly table.
function limbHeight(tab, lat, lon, utcMs, heightM) {
  var x = (utcMs - tab.t0) / TABLE_STEP_MS
  var i = Math.max(0, Math.min(24, Math.floor(x)))
  var f = x - i
  var dra = tab.ra[i + 1] - tab.ra[i]
  if (dra > 180) dra -= 360
  if (dra < -180) dra += 360
  var g = {
    moon: { ra: tab.ra[i] + f * dra, dec: tab.dec[i] + f * (tab.dec[i + 1] - tab.dec[i]),
      distanceKm: tab.distanceKm[i] + f * (tab.distanceKm[i + 1] - tab.distanceKm[i]) },
    // Nutation in right ascension (under 1.1″ of time) is left out here.
    gast: gmst(utcMs)
  }
  var t = topocentric(g, lat, lon, heightM)
  var alt = horizontal(t.hourAngle, t.dec, lat).altitude
  return alt + REFRACTION_AT_HORIZON + Math.asin(MOON_RADIUS_KM / t.distanceKm) / RAD
}

// Between a and b (UTC ms) where limbHeight changes sign, by bisection to
// about a second.
function bisectCrossing(tab, lat, lon, a, b, rising, heightM) {
  for (var k = 0; k < 10; k++) {
    var mid = (a + b) / 2
    if ((limbHeight(tab, lat, lon, mid, heightM) >= 0) === rising) b = mid
    else a = mid
  }
  return Math.round((a + b) / 2)
}

// The next rise and set of the upper limb within 24 h after `fromMs`:
// { rise, set } in UTC ms, 0 for one that does not happen (the Moon's day
// is 24 h 50 min, so one of them is missing on about one day a month, and
// both can be near the poles). The series runs 26 times (hourly table);
// the scan every 10 minutes and the bisection use the table.
function riseSet(lat, lon, fromMs, heightM) {
  var tab = hourlyTable(fromMs)
  var step = 600000
  var rise = 0, set = 0
  var a = fromMs
  var va = limbHeight(tab, lat, lon, a, heightM)
  for (var i = 0; i < 144 && !(rise && set); i++) {
    var b = a + step
    var vb = limbHeight(tab, lat, lon, b, heightM)
    if (!rise && va < 0 && vb >= 0) rise = bisectCrossing(tab, lat, lon, a, b, true, heightM)
    if (!set && va >= 0 && vb < 0) set = bisectCrossing(tab, lat, lon, a, b, false, heightM)
    a = b
    va = vb
  }
  return { rise: rise, set: set }
}

// The Moon seen from (lat, lon) (degrees, east +) at utcMs:
//   altitude, azimuth: topocentric, airless (degrees; azimuth from north
//     through east); apparentAltitude: with refraction;
//   aboveHorizon: the upper limb above the refracted horizon;
//   illuminated (0–1), phase (0 new, 0.25 first quarter, 0.5 full, 0.75
//     last quarter; from the ecliptic longitudes), waxing;
//   brightLimbAngle χ: position angle of the bright limb's midpoint,
//     degrees east of celestial north (0–360);
//   parallacticAngle q: position angle of the zenith (degrees);
//   tilt = χ − q (−180…180): the lit side's direction measured from the
//     observer's "up" (the zenith) towards the left as they face the Moon
//     (counterclockwise on the sky): 0 lit on top, 90 lit on the left,
//     −90 lit on the right;
//   litAngle: the same for a canvas (radians, 0 to the right, clockwise,
//     y down), as Moon.paintMoon takes it;
//   distanceKm (from the observer), angularDiameterDeg;
//   rise, set: the next moments within 24 h (UTC ms) or null;
//   earthshine: a thin crescent (illuminated below EARTHSHINE_BELOW).
// options: { heightM (metres above the ellipsoid, 0), riseSet (true;
// false skips the rise and set search, which is nearly all of the cost) }.
function view(lat, lon, utcMs, options) {
  var heightM = options && options.heightM ? options.heightM : 0
  var g = geocentric(utcMs)
  var t = topocentric(g, lat, lon, heightM)
  var hz = horizontal(t.hourAngle, t.dec, lat)
  var q = parallacticAngle(t.hourAngle, t.dec, lat)
  var a = t.ra * RAD, d = t.dec * RAD, a0 = g.sun.ra * RAD, d0 = g.sun.dec * RAD
  // Elongation ψ and phase angle i (Meeus 48.2, 48.3).
  var cpsi = Math.sin(d0) * Math.sin(d) + Math.cos(d0) * Math.cos(d) * Math.cos(a0 - a)
  var psi = Math.acos(Math.max(-1, Math.min(1, cpsi)))
  var R = g.sun.distanceAu * AU_KM
  var i = Math.atan2(R * Math.sin(psi), t.distanceKm - R * Math.cos(psi))
  var k = (1 + Math.cos(i)) / 2
  // Bright limb (Meeus 48.5).
  var chi = wrap360(Math.atan2(Math.cos(d0) * Math.sin(a0 - a),
    Math.sin(d0) * Math.cos(d) - Math.cos(d0) * Math.sin(d) * Math.cos(a0 - a)) / RAD)
  var tilt = wrap180(chi - q)
  var phase = wrap360(g.moon.lon - g.sun.lon) / 360
  var semi = Math.asin(MOON_RADIUS_KM / t.distanceKm) / RAD
  var wantRiseSet = !(options && options.riseSet === false)
  var rs = wantRiseSet ? riseSet(lat, lon, utcMs, heightM) : { rise: 0, set: 0 }
  return {
    altitude: hz.altitude,
    azimuth: hz.azimuth,
    apparentAltitude: hz.altitude + refraction(hz.altitude),
    aboveHorizon: hz.altitude + REFRACTION_AT_HORIZON + semi > 0,
    illuminated: k,
    phase: phase,
    waxing: phase < 0.5,
    brightLimbAngle: chi,
    parallacticAngle: q,
    tilt: tilt,
    litAngle: (-90 - tilt) * RAD,
    distanceKm: t.distanceKm,
    angularDiameterDeg: 2 * semi,
    rise: rs.rise || null,
    set: rs.set || null,
    earthshine: k < EARTHSHINE_BELOW
  }
}

if (typeof module !== "undefined") module.exports = {
  TERMS_LR: TERMS_LR, TERMS_B: TERMS_B, EARTHSHINE_BELOW: EARTHSHINE_BELOW, REFRACTION_AT_HORIZON: REFRACTION_AT_HORIZON,
  centuriesTT: centuriesTT, moonEcliptic: moonEcliptic, nutation: nutation, sunEcliptic: sunEcliptic,
  toEquatorial: toEquatorial, gmst: gmst, geocentric: geocentric, observerTerms: observerTerms,
  topocentric: topocentric, horizontal: horizontal, parallacticAngle: parallacticAngle, refraction: refraction,
  riseSet: riseSet, view: view
}
