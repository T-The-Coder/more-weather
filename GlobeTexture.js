.pragma library
.import "GlobeFields.js" as GlobeFields

// The globe's colour layers as a flat equirectangular picture
// (WeatherGlobeTexture.qml) for the GPU surface (WeatherGlobeSurface.qml,
// GLOBE-SHADER.md): longitude -180…180 across, latitude +90…-90 down. The
// lattices are regular lat/lon grids, so this is a plain resample: nodes on
// a grid of places, each layer read bilinearly (the region's lattice first,
// else the whole earth's), coloured and composed as the Canvas wash does
// (WeatherGlobeWash.qml: base, wind, cloud, precipitation; each layer's
// colour from a lookup table, within 1.5/255 of the wash's), written as
// straight (not premultiplied) RGBA bytes for an ImageData.
// Pure, tested in Node (tests/globe-texture.test.mjs).

var KINDS = ["temperature", "sst", "wind", "cloud", "precipitation"]

// Plain arrays, never typed ones: an ArrayBuffer counts as memory outside
// QML's script engine, and enough of it makes the engine collect garbage
// before every allocation (measured: a repaint went from 0.1 s to minutes).
function zeros(n) {
  var a = new Array(n)
  for (var i = 0; i < n; i++) a[i] = 0
  return a
}

// A texel's x for a longitude and y for a latitude (pixel edges: -180° at
// x = 0, +90° at y = 0).
function texelX(lon, width) { return (Number(lon) + 180) / 360 * width }
function texelY(lat, height) { return (90 - Number(lat)) / 180 * height }

// A lattice's value at a place, bilinear, NaN outside it or unknown. A
// lattice: { south, north, west, east, cols, rows, values } with row 0 in
// the south; longitudes are taken round to the lattice's side.
function sampleLattice(l, lat, lon) {
  if (!l) return NaN
  var cols = l.cols, rows = l.rows
  var mid = (l.west + l.east) / 2
  if (lon < mid - 180) lon += 360
  else if (lon > mid + 180) lon -= 360
  var fx = (lon - l.west) * (cols - 1) / (l.east - l.west)
  var fy = (lat - l.south) * (rows - 1) / (l.north - l.south)
  if (!(fx >= -1e-9 && fx <= cols - 1 + 1e-9 && fy >= -1e-9 && fy <= rows - 1 + 1e-9)) return NaN
  fx = Math.max(0, Math.min(cols - 1, fx))
  fy = Math.max(0, Math.min(rows - 1, fy))
  var x0 = Math.min(cols - 2, Math.floor(fx)), y0 = Math.min(rows - 2, Math.floor(fy))
  var sx = fx - x0, sy = fy - y0, k = y0 * cols + x0, v = l.values
  return (v[k] * (1 - sx) + v[k + 1] * sx) * (1 - sy) + (v[k + cols] * (1 - sx) + v[k + cols + 1] * sx) * sy
}

// A { global, region } pair at the nodes (lats[i], lons[i]) into out
// (the region's lattice first with `useRegion`, else the whole earth's).
function sampleInto(pair, lats, lons, out, useRegion) {
  var n = out.length
  for (var i = 0; i < n; i++) {
    var v = NaN
    if (pair) {
      if (useRegion && pair.region) v = sampleLattice(pair.region, lats[i], lons[i])
      if (!(v === v) && pair.global) v = sampleLattice(pair.global, lats[i], lons[i])
    }
    out[i] = v
  }
}

// The same on a grid of cols × rows nodes over `box` (as gridNodes lays
// them out): separable, so each column's and row's place in the lattice is
// found once; several times faster than per node.
function sampleGrid(pair, box, cols, rows, out, useRegion) {
  var n = cols * rows
  for (var i = 0; i < n; i++) out[i] = NaN
  if (!pair) return
  if (useRegion && pair.region) gridFrom(pair.region, box, cols, rows, out)
  if (pair.global) gridFrom(pair.global, box, cols, rows, out)
}

// Fills the NaN nodes of out from lattice l, bilinear.
function gridFrom(l, box, cols, rows, out) {
  var lc = l.cols, lr = l.rows, v = l.values
  var mid = (l.west + l.east) / 2
  var xs = (lc - 1) / (l.east - l.west), ys = (lr - 1) / (l.north - l.south)
  var cx0 = new Array(cols), csx = new Array(cols)
  for (var c = 0; c < cols; c++) {
    var lon = box.west + (box.east - box.west) * c / (cols - 1)
    if (lon < mid - 180) lon += 360
    else if (lon > mid + 180) lon -= 360
    var fx = (lon - l.west) * xs
    if (!(fx >= -1e-9 && fx <= lc - 1 + 1e-9)) { cx0[c] = -1; continue }
    fx = Math.max(0, Math.min(lc - 1, fx))
    var x0 = Math.min(lc - 2, Math.floor(fx))
    cx0[c] = x0
    csx[c] = fx - x0
  }
  for (var r = 0; r < rows; r++) {
    var lat = box.north - (box.north - box.south) * r / (rows - 1)
    var fy = (lat - l.south) * ys
    if (!(fy >= -1e-9 && fy <= lr - 1 + 1e-9)) continue
    fy = Math.max(0, Math.min(lr - 1, fy))
    var y0 = Math.min(lr - 2, Math.floor(fy)), sy = fy - y0, uy = 1 - sy
    var base = y0 * lc, o = r * cols
    for (var k = 0; k < cols; k++) {
      var j = o + k
      if (out[j] === out[j]) continue
      var x = cx0[k]
      if (x < 0) continue
      var sx = csx[k], ux = 1 - sx, i0 = base + x
      out[j] = (v[i0] * ux + v[i0 + 1] * sx) * uy + (v[i0 + lc] * ux + v[i0 + lc + 1] * sx) * sy
    }
  }
}

// The box all the layers' regional lattices on cover together, with the
// finest node spacing among them in degrees: { south, north, west, east,
// step } or null without any.
function regionBox(layers, lattices) {
  var box = null
  for (var i = 0; i < layers.length; i++) {
    var pair = lattices[layers[i]]
    var r = pair && pair.region
    if (!r || !(r.cols > 1) || !(r.rows > 1)) continue
    var step = Math.min((r.east - r.west) / (r.cols - 1), (r.north - r.south) / (r.rows - 1))
    if (!box) {
      box = { south: r.south, north: r.north, west: r.west, east: r.east, step: step }
      continue
    }
    box.south = Math.min(box.south, r.south)
    box.north = Math.max(box.north, r.north)
    box.west = Math.min(box.west, r.west)
    box.east = Math.max(box.east, r.east)
    box.step = Math.min(box.step, step)
  }
  return box
}

// Per layer its buckets' colours, flat [r, g, b, a, …] in 0–255;
// temperature and the sea through `temperatureColor(value, min, max)` (a
// colour string or Qt color, as Panel.temperatureAccent) with alpha 150, as
// the wash makes them; without it a plain blue → red ramp.
function palettes(temperatureColor) {
  var map = {}
  for (var k = 0; k < KINDS.length; k++) {
    var kind = KINDS[k]
    var flat = []
    var count = GlobeFields.bucketCount(kind)
    for (var i = 0; i < count; i++) {
      var rgba
      if (kind === "temperature" || kind === "sst") {
        var r = GlobeFields.range(kind)
        var value = GlobeFields.bucketValue(kind, i)
        rgba = rampColor((value - r.min) / (r.max - r.min))
        if (temperatureColor) {
          var c = rgbOf(temperatureColor(value, r.min, r.max))
          if (c) rgba = [c[0], c[1], c[2], 150]
        }
      } else {
        rgba = GlobeFields.fixedColor(kind, i)
      }
      flat.push(rgba[0], rgba[1], rgba[2], rgba[3])
    }
    map[kind] = flat
  }
  return map
}

function rampColor(t) {
  var x = Math.max(0, Math.min(1, t))
  return [Math.round(40 + 215 * x), Math.round(90 + 80 * Math.sin(Math.PI * x)), Math.round(230 - 200 * x), 150]
}

// "#rrggbb" or an object with r, g, b in 0–1 (a QML color) → [r, g, b]
// in 0–255, null otherwise.
function rgbOf(c) {
  if (!c) return null
  if (typeof c === "string") {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c.length === 9 ? "#" + c.substr(3) : c)
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null
  }
  if (typeof c.r === "number") return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)]
  return null
}

// The colour at a fractional bucket position fi (bucket middles at
// i + 0.5) as the wash blends it, into out[o…o+3] (straight, 0–255).
function blendInto(P, count, fi, out, o) {
  var x = fi - 0.5
  var i0 = x <= 0 ? 0 : (x >= count - 1 ? count - 2 : Math.floor(x))
  var t = x <= 0 ? 0 : (x >= count - 1 ? 1 : x - i0)
  if (count < 2) { i0 = 0; t = 0 }
  var a = i0 * 4, b = Math.min(count - 1, i0 + 1) * 4, u = 1 - t
  out[o] = P[a] * u + P[b] * t; out[o + 1] = P[a + 1] * u + P[b + 1] * t
  out[o + 2] = P[a + 2] * u + P[b + 2] * t; out[o + 3] = (P[a + 3] * u + P[b + 3] * t) / 255
}

// Entries of the lookup tables below: a layer's colour is a function of
// its value alone, so it is tabulated once per picture (LUT_SIZE steps over
// the scale: 0.08 °C for the temperature) instead of blended per node.
var LUT_SIZE = 1024

// A table for a scale min…max over `count` buckets: entry e holds the
// colour (r, g, b straight 0–255, a 0–1) at min + e/(size-1)·(max-min).
function rangeLut(P, count) {
  var t = zeros(LUT_SIZE * 4)
  for (var e = 0; e < LUT_SIZE; e++) blendInto(P, count, e / (LUT_SIZE - 1) * count, t, e * 4)
  return t
}

// Precipitation's table over ln(mm/h) from the first step to the last,
// the fade-in over the first step folded into its alpha.
function rainLut(P) {
  var steps = GlobeFields.PRECIPITATION_STEPS, last = steps.length - 1
  var lo = Math.log(steps[0]), hi = Math.log(steps[last])
  var t = zeros(LUT_SIZE * 4)
  for (var e = 0; e < LUT_SIZE; e++) {
    var v = Math.exp(lo + (hi - lo) * e / (LUT_SIZE - 1))
    var k = 0
    while (k < last && v >= steps[k + 1] * (1 - 1e-9)) k++
    var fk = k >= last ? last : k + Math.log(v / steps[k]) / Math.log(steps[k + 1] / steps[k])
    blendInto(P, steps.length, fk + 0.5, t, e * 4)
    t[e * 4 + 3] *= Math.min(1, (v - steps[0]) / (steps[1] - steps[0]))
  }
  return { table: t, lo: lo, per: (LUT_SIZE - 1) / (hi - lo) }
}

// A range layer's table with its scale: { table, min, per (entries per unit) }.
function tableFor(kind, P, scaleKmh) {
  var r = GlobeFields.range(kind, scaleKmh)
  return { table: rangeLut(P, GlobeFields.bucketCount(kind)), min: r.min, per: (LUT_SIZE - 1) / (r.max - r.min) }
}

// The colours of n nodes composed into `pixels` (straight RGBA bytes, as
// ImageData.data, or any array): values maps layer → array (NaN unknown),
// mask the land mask's values at the nodes (or null), pal from palettes().
// Bottom to top as the wash: the base (the sea's temperature over the
// ocean, else the air's), the wind (alone the base, over a temperature at
// half), the cloud's white veil (up to 70 %), precipitation.
function compose(values, mask, pal, scaleKmh, pixels, n) {
  var temp = values.temperature, sst = values.sst, wind = values.wind, cloud = values.cloud, rain = values.precipitation
  // No nested functions here: a closure would move this function's
  // variables into a heap context in QML's engine (several times slower).
  var top = LUT_SIZE - 1
  var T = temp ? tableFor("temperature", pal.temperature) : null
  var S = sst ? tableFor("sst", pal.sst) : null
  var W = wind ? tableFor("wind", pal.wind, scaleKmh) : null
  var Rn = rain ? rainLut(pal.precipitation) : null
  var rainFrom = GlobeFields.PRECIPITATION_STEPS[0]
  for (var j = 0; j < n; j++) {
    var R0 = 0, G0 = 0, B0 = 0, A0 = 0, e = 0, L = null, a = 0
    var based = false
    // 1. The base.
    var sv = sst ? sst[j] : NaN, tv = temp ? temp[j] : NaN
    if (sv === sv && (!temp || (mask && mask[j] < 0.5))) {
      L = S.table; e = (sv - S.min) * S.per
    } else if (tv === tv) {
      L = T.table; e = (tv - T.min) * T.per
    }
    if (L) {
      e = (e <= 0 ? 0 : (e >= top ? top : Math.round(e))) * 4
      a = L[e + 3]
      R0 = L[e] * a; G0 = L[e + 1] * a; B0 = L[e + 2] * a; A0 = a
      based = true
    }
    // 2. The wind.
    var wv = wind ? wind[j] : NaN
    if (wv === wv) {
      L = W.table; e = (wv - W.min) * W.per
      e = (e <= 0 ? 0 : (e >= top ? top : Math.round(e))) * 4
      a = L[e + 3] * (based ? 0.5 : 1)
      R0 = L[e] * a + R0 * (1 - a); G0 = L[e + 1] * a + G0 * (1 - a)
      B0 = L[e + 2] * a + B0 * (1 - a); A0 = a + A0 * (1 - a)
    }
    // 3. The cloud's veil.
    var cv = cloud ? cloud[j] : NaN
    if (cv === cv) {
      a = 0.007 * (cv <= 0 ? 0 : (cv >= 100 ? 100 : cv))
      R0 = 255 * a + R0 * (1 - a); G0 = 255 * a + G0 * (1 - a)
      B0 = 255 * a + B0 * (1 - a); A0 = a + A0 * (1 - a)
    }
    // 4. Precipitation.
    var rv = rain ? rain[j] : NaN
    if (rv >= rainFrom) {
      L = Rn.table; e = (Math.log(rv) - Rn.lo) * Rn.per
      e = (e <= 0 ? 0 : (e >= top ? top : Math.round(e))) * 4
      a = L[e + 3]
      R0 = L[e] * a + R0 * (1 - a); G0 = L[e + 1] * a + G0 * (1 - a)
      B0 = L[e + 2] * a + B0 * (1 - a); A0 = a + A0 * (1 - a)
    }
    var o = j * 4
    if (A0 < 0.004) {
      pixels[o] = 0; pixels[o + 1] = 0; pixels[o + 2] = 0; pixels[o + 3] = 0
      continue
    }
    pixels[o] = R0 / A0; pixels[o + 1] = G0 / A0; pixels[o + 2] = B0 / A0; pixels[o + 3] = A0 * 255
  }
}

// The nodes of a grid over a box: cols × rows places from (north, west) in
// rows going south, into lats and lons (plain arrays, length cols × rows).
function gridNodes(box, cols, rows, lats, lons) {
  for (var r = 0; r < rows; r++) {
    var lat = box.north - (box.north - box.south) * r / (rows - 1)
    for (var c = 0; c < cols; c++) {
      lats[r * cols + c] = lat
      lons[r * cols + c] = box.west + (box.east - box.west) * c / (cols - 1)
    }
  }
}

if (typeof module !== "undefined") module.exports = {}
