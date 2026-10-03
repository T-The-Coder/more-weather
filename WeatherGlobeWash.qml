import QtQuick
import "Globe.js" as Globe
import "GlobeFields.js" as GlobeFields

// The globe's colour layers in one picture (Settings → Display → Globe),
// composed bottom to top in a fixed order:
//   1. the base: the air's temperature; with the sea's temperature too,
//      that over the ocean and the air's over land (a land mask lattice);
//   2. the wind's speed: alone the base, with a temperature over it at 50 %;
//   3. the cloud as a white veil;
//   4. precipitation in radar colours (nothing below 0.1 mm/h).
// A layer without data at a place leaves the others be.
//
// How: the place under each corner of an n-wide grid of cells (the
// inverse of the view's projection, nodes just past the rim on the rim),
// each layer read bilinearly from its lattices (the region's close up,
// else the whole earth's) and coloured by its bucket (GlobeFields), the
// colours composed per node; then a picture of a pixel per node filled
// into the disc as a stretched pattern, smoothly interpolated, so the
// colour ends exactly at the rim, antialiased. Kept to itself so a shader could replace it.
Canvas {
  id: wash
  required property var panel
  required property Item globe
  // The colour layers on ("temperature", "sst", "wind", "cloud",
  // "precipitation"), and per layer { global, region } lattices.
  property var layers: []
  property var lattices: ({})
  // Land (1) and sea (0) every 2.5°, for the sea's temperature beside the
  // air's; null until made.
  property var landMask: null
  // The wind's scale end in km/h (the height's, Model.WIND_LEVELS).
  property real scaleKmh: 100
  // Cells across: 96 in the popup, 128 in the app; fewer while moving.
  property int cells: 96
  // What its frames cost (the screenshot harness reads it).
  property var stats: ({ count: 0, total: 0, max: 0 })

  readonly property bool on: layers.length > 0 && layers.some(function(kind) {
    return !!lattices[kind] && !!lattices[kind].global
  })
  visible: on

  // Per layer its buckets' colours, flat [r, g, b, a, …] in 0–255:
  // temperature (−40…45 °C) and the sea (−2…32 °C) in the plugin's accent
  // colours along their scales, the rest fixed.
  readonly property var palettes: {
    var map = {}
    var kinds = ["temperature", "sst", "wind", "cloud", "precipitation"]
    for (var k = 0; k < kinds.length; k++) {
      var kind = kinds[k]
      var flat = []
      var count = GlobeFields.bucketCount(kind)
      for (var i = 0; i < count; i++) {
        var rgba
        if (kind === "temperature" || kind === "sst") {
          var r = GlobeFields.range(kind)
          var color = panel.temperatureAccent(GlobeFields.bucketValue(kind, i), r.min, r.max)
          var c = color ? Qt.color(color) : panel.foreground
          rgba = [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255), 150]
        } else {
          rgba = GlobeFields.fixedColor(kind, i)
        }
        flat.push(rgba[0], rgba[1], rgba[2], rgba[3])
      }
      map[kind] = flat
    }
    return map
  }

  onPalettesChanged: requestPaint()
  onLatticesChanged: requestPaint()
  onLayersChanged: requestPaint()
  onLandMaskChanged: requestPaint()
  onScaleKmhChanged: requestPaint()
  onWidthChanged: requestPaint()
  onHeightChanged: requestPaint()

  // While the globe moves, every second frame.
  property int skipped: 0
  function viewChanged() {
    if (!visible) return
    if (globe.moving && (++skipped % 2) === 1) return
    requestPaint()
  }

  // Buffers kept per size: each new ImageData adds its pixels to the
  // script engine's tally of outside memory, and enough of them make every
  // allocation in the shell collect garbage first.
  property var buffers: ({})
  function buffer(ctx, key, make) {
    var b = buffers[key]
    if (!b) {
      b = make()
      // A resized globe leaves its old sizes behind (still and moving, a
      // dozen kinds each).
      var kept = Object.keys(buffers).length < 40 ? Object.assign({}, buffers) : {}
      kept[key] = b
      buffers = kept
    }
    return b
  }

  // Plain arrays, not typed ones: an ArrayBuffer counts as memory outside
  // the script engine's heap, and kept ones push the engine into
  // collecting garbage before every allocation (the whole shell slows).
  function plainArray(n) {
    var a = new Array(n)
    for (var i = 0; i < n; i++) a[i] = 0
    return a
  }

  // A layer's values at the nodes into `out` (NaN where unknown): the
  // region's lattice first, then the whole earth's, bilinear, inline.
  function sample(pair, lats, lons, inside, out) {
    var n = out.length
    for (var i = 0; i < n; i++) out[i] = NaN
    if (!pair) return
    var region = pair.region
    if (region) {
      var rv = region.values, rcols = region.cols, rrows = region.rows
      var rwest = region.west, rsouth = region.south
      var rxs = (rcols - 1) / (region.east - region.west), rys = (rrows - 1) / (region.north - region.south)
      var rmid = (region.west + region.east) / 2
      for (var j = 0; j < n; j++) {
        if (!inside[j]) continue
        var lon = lons[j]
        if (lon < rmid - 180) lon += 360
        else if (lon > rmid + 180) lon -= 360
        var rx = (lon - rwest) * rxs, ry = (lats[j] - rsouth) * rys
        if (!(rx >= 0 && rx <= rcols - 1 && ry >= 0 && ry <= rrows - 1)) continue
        var x0 = Math.min(rcols - 2, Math.floor(rx)), y0 = Math.min(rrows - 2, Math.floor(ry))
        var sx = rx - x0, sy = ry - y0, k = y0 * rcols + x0
        out[j] = (rv[k] * (1 - sx) + rv[k + 1] * sx) * (1 - sy) + (rv[k + rcols] * (1 - sx) + rv[k + rcols + 1] * sx) * sy
      }
    }
    var g = pair.global
    if (!g) return
    var gv = g.values, gcols = g.cols
    for (var m = 0; m < n; m++) {
      if (!inside[m] || out[m] === out[m]) continue
      // The whole earth's lattice: nodes every 2.5°, 145 × 73.
      var fx = (lons[m] + 180) / 2.5, fy = (lats[m] + 90) / 2.5
      var gx = Math.min(143, Math.floor(fx)), gy = Math.min(71, Math.floor(fy))
      var tx = fx - gx, ty = fy - gy, i0 = gy * gcols + gx
      out[m] = (gv[i0] * (1 - tx) + gv[i0 + 1] * tx) * (1 - ty) + (gv[i0 + gcols] * (1 - tx) + gv[i0 + gcols + 1] * tx) * ty
    }
  }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    ctx.clearRect(0, 0, width, height)
    if (!on) return
    var moving = globe.moving
    // While moving fewer cells: half, and less with several layers.
    var cols = moving ? Math.round(cells * (layers.length > 1 ? 0.4 : 0.5)) : cells
    var rows = Math.max(1, Math.round(cols * height / Math.max(1, width)))
    var nodeCols = cols + 1, nodeRows = rows + 1, n = nodeCols * nodeRows
    var size = cols + "x" + rows
    var lats = buffer(ctx, "lat" + size, function() { return plainArray(n) })
    var lons = buffer(ctx, "lon" + size, function() { return plainArray(n) })
    var inside = buffer(ctx, "in" + size, function() { return plainArray(n) })

    // The place under each node; nodes up to a cell past the rim take the
    // rim's, so the clip finds colour all the way round.
    var m = Globe.viewMatrix(globe.centerLat, Globe.wrapLon(globe.centerLon))
    var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8]
    var R = globe.radius
    var cellW = width / cols, cellH = height / rows
    var cx = globe.centerX, cy = globe.centerY
    var deg = 180 / Math.PI
    var reach = Math.pow(1 + 1.5 * Math.max(cellW, cellH) / R, 2)
    for (var r = 0; r < nodeRows; r++) {
      var w = (cy - r * cellH) / R
      for (var c = 0; c < nodeCols; c++) {
        var i = r * nodeCols + c
        var u = (c * cellW - cx) / R
        var q = u * u + w * w
        if (q > reach) { inside[i] = 0; continue }
        var uu = u, ww = w
        if (q > 1) { var d = Math.sqrt(q); uu = u / d; ww = w / d; q = 1 }
        var f = Math.sqrt(1 - q)
        var vx = uu * m0 + ww * m3 + f * m6, vy = uu * m1 + ww * m4 + f * m7, vz = uu * m2 + ww * m5 + f * m8
        inside[i] = 1
        lats[i] = Math.asin(Math.max(-1, Math.min(1, vz))) * deg
        lons[i] = Math.atan2(vy, vx) * deg
      }
    }

    // Each layer's values at the nodes.
    var active = {}
    for (var l = 0; l < layers.length; l++) active[layers[l]] = true
    var values = {}
    var kinds = ["temperature", "sst", "wind", "cloud", "precipitation"]
    for (var k = 0; k < kinds.length; k++) {
      if (!active[kinds[k]]) continue
      values[kinds[k]] = buffer(ctx, "v" + kinds[k] + size, function() { return plainArray(n) })
      sample(lattices[kinds[k]], lats, lons, inside, values[kinds[k]])
    }
    var mask = null
    if (active.sst && active.temperature && landMask) {
      mask = buffer(ctx, "mask" + size, function() { return plainArray(n) })
      sample({ global: landMask, region: null }, lats, lons, inside, mask)
    }

    // The colours per node, premultiplied, composed bottom to top.
    var colours = buffer(ctx, "rgba" + size, function() { return plainArray(n * 4) })
    var pal = palettes
    var temp = values.temperature, sst = values.sst, wind = values.wind, cloud = values.cloud, rain = values.precipitation
    var tRange = GlobeFields.range("temperature"), sRange = GlobeFields.range("sst"), wRange = GlobeFields.range("wind", scaleKmh)
    var tCount = GlobeFields.bucketCount("temperature"), sCount = GlobeFields.bucketCount("sst")
    var wCount = GlobeFields.bucketCount("wind"), cCount = GlobeFields.bucketCount("cloud")
    var tPer = tCount / (tRange.max - tRange.min), sPer = sCount / (sRange.max - sRange.min), wPer = wCount / (wRange.max - wRange.min)
    var steps = GlobeFields.PRECIPITATION_STEPS
    var tPal = pal.temperature, sPal = pal.sst, wPal = pal.wind, cPal = pal.cloud, rPal = pal.precipitation
    for (var j = 0; j < n; j++) {
      var o = j * 4
      var R0 = 0, G0 = 0, B0 = 0, A0 = 0
      if (inside[j]) {
        var b = -1, P = null
        // 1. The base.
        var seaHere = sst && sst[j] === sst[j] && (!temp || (mask && mask[j] === mask[j] && mask[j] < 0.5))
        if (seaHere) {
          b = Math.floor((sst[j] - sRange.min) * sPer); b = b < 0 ? 0 : (b >= sCount ? sCount - 1 : b); P = sPal
        } else if (temp && temp[j] === temp[j]) {
          b = Math.floor((temp[j] - tRange.min) * tPer); b = b < 0 ? 0 : (b >= tCount ? tCount - 1 : b); P = tPal
        }
        if (P) {
          var a = P[b * 4 + 3] / 255
          R0 = P[b * 4] * a; G0 = P[b * 4 + 1] * a; B0 = P[b * 4 + 2] * a; A0 = a
        }
        // 2. The wind: alone the base, over a temperature at half.
        if (wind && wind[j] === wind[j]) {
          b = Math.floor((wind[j] - wRange.min) * wPer); b = b < 0 ? 0 : (b >= wCount ? wCount - 1 : b)
          var wa = wPal[b * 4 + 3] / 255 * (P ? 0.5 : 1)
          R0 = wPal[b * 4] * wa + R0 * (1 - wa); G0 = wPal[b * 4 + 1] * wa + G0 * (1 - wa)
          B0 = wPal[b * 4 + 2] * wa + B0 * (1 - wa); A0 = wa + A0 * (1 - wa)
        }
        // 3. The cloud's veil.
        if (cloud && cloud[j] === cloud[j]) {
          b = Math.floor(cloud[j] / 100 * cCount); b = b < 0 ? 0 : (b >= cCount ? cCount - 1 : b)
          var ca = cPal[b * 4 + 3] / 255
          R0 = cPal[b * 4] * ca + R0 * (1 - ca); G0 = cPal[b * 4 + 1] * ca + G0 * (1 - ca)
          B0 = cPal[b * 4 + 2] * ca + B0 * (1 - ca); A0 = ca + A0 * (1 - ca)
        }
        // 4. Precipitation, from 0.1 mm/h.
        if (rain && rain[j] >= steps[0]) {
          b = 0
          for (var s = 1; s < steps.length; s++) if (rain[j] >= steps[s]) b = s
          var ra = rPal[b * 4 + 3] / 255
          R0 = rPal[b * 4] * ra + R0 * (1 - ra); G0 = rPal[b * 4 + 1] * ra + G0 * (1 - ra)
          B0 = rPal[b * 4 + 2] * ra + B0 * (1 - ra); A0 = ra + A0 * (1 - ra)
        }
      }
      colours[o] = R0; colours[o + 1] = G0; colours[o + 2] = B0; colours[o + 3] = A0
    }

    // The picture: a pixel per node, filled into the disc as a pattern
    // stretched over the view. The pattern is interpolated smoothly and the
    // disc's edge antialiased, so the colour ends exactly at the rim.
    // (Qt 6.11 has no smoothing for a scaled drawImage; a pattern has.)
    var image = buffer(ctx, "img" + size, function() { return ctx.createImageData(nodeCols, nodeRows) })
    var pixels = image.data
    for (var e = 0; e < n; e++) {
      var o4 = e * 4, A = colours[o4 + 3]
      if (A < 0.004) { pixels[o4 + 3] = 0; continue }
      pixels[o4] = colours[o4] / A
      pixels[o4 + 1] = colours[o4 + 1] / A
      pixels[o4 + 2] = colours[o4 + 2] / A
      pixels[o4 + 3] = A * 255
    }
    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    // Pattern pixel i's middle on node i.
    ctx.translate(-cellW / 2, -cellH / 2)
    ctx.scale(cellW, cellH)
    ctx.fillStyle = ctx.createPattern(image, "no-repeat")
    ctx.fill()
    ctx.restore()
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent) }
  }
}
