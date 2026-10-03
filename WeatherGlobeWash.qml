import QtQuick
import "Globe.js" as Globe
import "GlobeFields.js" as GlobeFields

// The globe's colour wash (temperature, cloud, precipitation, wind or the
// sea's temperature): a small
// picture, one pixel per cell of an n-wide grid over the view, scaled up
// smoothly; the cells on the rim are as opaque as they are inside it. Each cell looks up the place under its middle (the inverse of
// the view's projection), reads the value bilinearly from the lattices
// (the region's close up, else the whole earth's), and takes its bucket's
// colour (GlobeFields). Kept to itself so a shader could replace it.
Canvas {
  id: wash
  required property var panel
  required property Item globe
  // "temperature", "cloud", "precipitation", "wind" or "sst" ("none" draws
  // nothing).
  property string kind: "none"
  // The wind's scale end in km/h (the height's, Model.WIND_LEVELS).
  property real scaleKmh: 100
  property var globalLattice: null
  property var regionLattice: null
  // Cells across: 96 in the popup, 128 in the app; half of that while
  // the globe moves, which the smooth scaling hides.
  property int cells: 96
  // What its frames cost (the screenshot harness reads it).
  property var stats: ({ count: 0, total: 0, max: 0 })

  readonly property int columns: globe.moving ? Math.round(cells / 2) : cells
  readonly property int rows: Math.max(1, Math.round(columns * globe.height / Math.max(1, globe.width)))
  width: columns
  height: rows
  transform: Scale { xScale: wash.globe.width / wash.columns; yScale: wash.globe.height / wash.rows }
  smooth: true
  visible: kind !== "none" && !!globalLattice

  // Each bucket's colour, [r, g, b, a] in 0–255: temperature (−40…45 °C)
  // and the sea (−2…32 °C) in the plugin's accent colours along their
  // scales, the rest fixed.
  readonly property var palette: {
    var list = []
    var count = GlobeFields.bucketCount(kind)
    for (var i = 0; i < count; i++) {
      if (kind === "temperature" || kind === "sst") {
        var r = GlobeFields.range(kind)
        var color = panel.temperatureAccent(GlobeFields.bucketValue(kind, i), r.min, r.max)
        var c = color ? Qt.color(color) : panel.foreground
        list.push([Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255), 150])
      } else {
        list.push(GlobeFields.fixedColor(kind, i))
      }
    }
    return list
  }

  onPaletteChanged: requestPaint()
  onGlobalLatticeChanged: requestPaint()
  onRegionLatticeChanged: requestPaint()
  onKindChanged: requestPaint()
  onScaleKmhChanged: requestPaint()
  onWidthChanged: requestPaint()
  onHeightChanged: requestPaint()

  // The pictures, kept per size (still and moving): each new ImageData
  // adds its pixels to the script engine's tally of outside memory, and
  // enough of them make every allocation in the shell collect garbage
  // first (the globe's frames took seconds).
  property var images: ({})

  // While the globe moves, every second frame.
  property int skipped: 0
  function viewChanged() {
    if (!visible) return
    if (globe.moving && (++skipped % 2) === 1) return
    requestPaint()
  }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    ctx.clearRect(0, 0, width, height)
    if (kind === "none" || !globalLattice) return
    var size = columns + "x" + rows
    var image = images[size]
    if (!image) {
      image = ctx.createImageData(columns, rows)
      // Two sizes at most: a resized globe leaves its old ones behind.
      var kept = Object.keys(images).length < 2 ? Object.assign({}, images) : {}
      kept[size] = image
      images = kept
    }
    var pixels = image.data
    for (var z = 0; z < pixels.length; z++) pixels[z] = 0
    var m = Globe.viewMatrix(globe.centerLat, Globe.wrapLon(globe.centerLon))
    var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8]
    var R = globe.radius
    var cellW = globe.width / columns, cellH = globe.height / rows
    var cx = globe.centerX, cy = globe.centerY
    var deg = 180 / Math.PI
    var cellR = Math.max(cellW, cellH) / R
    var rimLimit = Math.pow(1 + cellR / 2, 2)
    var g = globalLattice, gv = g.values, gcols = g.cols
    // The region's lattice in locals (no wrap: the longitude is moved next
    // to its box).
    var region = regionLattice
    var rv = region ? region.values : null
    var rcols = region ? region.cols : 0, rrows = region ? region.rows : 0
    var rwest = region ? region.west : 0, rsouth = region ? region.south : 0
    var rxs = region ? (rcols - 1) / (region.east - region.west) : 0
    var rys = region ? (rrows - 1) / (region.north - region.south) : 0
    var rmid = region ? (region.west + region.east) / 2 : 0
    // The colours flat, four numbers each; the even scales take their
    // bucket by a straight scale, precipitation by its steps.
    var colors = palette
    var flat = []
    for (var n = 0; n < colors.length; n++) flat.push(colors[n][0], colors[n][1], colors[n][2], colors[n][3])
    var count = colors.length
    var span = GlobeFields.range(kind, scaleKmh)
    var linear = !!span
    var low = span ? span.min : 0
    var perBucket = span ? count / (span.max - span.min) : 0
    var kindName = kind
    for (var r = 0; r < rows; r++) {
      var w = (cy - (r + 0.5) * cellH) / R
      for (var c = 0; c < columns; c++) {
        var u = ((c + 0.5) * cellW - cx) / R
        var q = u * u + w * w
        if (q > rimLimit) continue
        var uu = u, ww = w
        // How much of the cell lies inside the rim, for its opacity.
        var cover = 1
        if (q > (1 - cellR) * (1 - cellR)) {
          var d = Math.sqrt(q)
          cover = Math.min(1, (1 - d) / cellR + 0.5)
          if (cover <= 0) continue
          if (d > 1) {
            // Past the rim: the rim's own value.
            uu = u / d
            ww = w / d
            q = 1
          }
        }
        var f = Math.sqrt(1 - q)
        var vx = uu * m0 + ww * m3 + f * m6, vy = uu * m1 + ww * m4 + f * m7, vz = uu * m2 + ww * m5 + f * m8
        var lat = Math.asin(vz) * deg, lon = Math.atan2(vy, vx) * deg
        var value = NaN
        if (rv) {
          var rl = lon
          if (rl < rmid - 180) rl += 360
          else if (rl > rmid + 180) rl -= 360
          var rx = (rl - rwest) * rxs, ry = (lat - rsouth) * rys
          if (rx >= 0 && rx <= rcols - 1 && ry >= 0 && ry <= rrows - 1) {
            var rx0 = Math.min(rcols - 2, Math.floor(rx)), ry0 = Math.min(rrows - 2, Math.floor(ry))
            var sx = rx - rx0, sy = ry - ry0
            var j = ry0 * rcols + rx0
            value = (rv[j] * (1 - sx) + rv[j + 1] * sx) * (1 - sy) + (rv[j + rcols] * (1 - sx) + rv[j + rcols + 1] * sx) * sy
          }
        }
        if (!(value === value)) {
          // The whole earth's lattice: nodes every 2.5°, 145 × 73.
          var fx = (lon + 180) / 2.5, fy = (lat + 90) / 2.5
          var x0 = Math.min(143, Math.floor(fx)), y0 = Math.min(71, Math.floor(fy))
          var tx = fx - x0, ty = fy - y0
          var i = y0 * gcols + x0
          value = (gv[i] * (1 - tx) + gv[i + 1] * tx) * (1 - ty) + (gv[i + gcols] * (1 - tx) + gv[i + gcols + 1] * tx) * ty
        }
        if (!(value === value)) continue
        var b
        if (linear) {
          b = Math.floor((value - low) * perBucket)
          b = b < 0 ? 0 : (b >= count ? count - 1 : b)
        } else {
          b = GlobeFields.bucket(kindName, value)
          if (b < 0) continue
        }
        var k = (r * columns + c) * 4, o = b * 4
        pixels[k] = flat[o]
        pixels[k + 1] = flat[o + 1]
        pixels[k + 2] = flat[o + 2]
        pixels[k + 3] = Math.round(flat[o + 3] * cover)
      }
    }
    // With the dirty rectangle spelled out: Qt 6.11's putImageData puts
    // nothing without it.
    ctx.putImageData(image, 0, 0, 0, 0, columns, rows)
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent) }
  }
}
