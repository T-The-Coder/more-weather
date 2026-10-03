import QtQuick
import Quickshell.Io
import "GlobeTexture.js" as GlobeTexture

// The globe's surface as a flat equirectangular picture for the GPU path
// (WeatherGlobeSurface.qml, GLOBE-SHADER.md): longitude -180…180 across,
// latitude +90…-90 down, textureWidth × textureHeight (2:1). Painted, bottom
// to top: the colour layers (GlobeTexture.compose, as the Canvas wash
// composes them: the whole earth's lattices over the whole picture, then the
// regional lattices' detail into their box) and the land's fill
// (data/globe-land.json, plain lat/lon → x/y). Never per frame: only when
// the lattices, the layer set, the land, the colours or the size change; the
// surface projects it onto the turning globe.
// The node grid is smoothly stretched over the picture (a pattern: Qt 6.11
// has no smoothing for a scaled drawImage), so colours blend between nodes.
Canvas {
  id: texture
  property int textureWidth: 1024
  property int textureHeight: 512
  width: textureWidth
  height: textureHeight
  // The colour layers on ("temperature", "sst", "wind", "cloud",
  // "precipitation") and per layer { global, region } lattices, as for the
  // wash (WeatherGlobeData).
  property var layers: []
  property var lattices: ({})
  property var landMask: null
  property real scaleKmh: 100
  // Per layer its buckets' colours (the wash's `palettes`); left null, a
  // plain ramp (GlobeTexture.palettes).
  property var palettes: null
  // Nodes per 2.5° cell of the whole earth's lattice: 1 composes at the
  // lattice's own nodes (about 40 ms), 2 every 1.25° (about 4 × the cost).
  property int oversample: 1
  // The isobars ({ level, lines }) and centres to draw, or null; their
  // text and colours.
  property var isobars: null
  property var centres: null
  property var labelText: function(hPa) { return String(Math.round(hPa)) }
  property string font: "10px sans-serif"
  property string bigFont: "bold 15px sans-serif"
  property string highText: "H"
  property string lowText: "L"
  property color ink: "white"
  property color surfaceColor: "black"
  property color highColor: "white"
  onIsobarsChanged: requestPaint()
  onInkChanged: requestPaint()
  // The land's fill; transparent leaves the land out.
  property color landColor: Qt.rgba(1, 1, 1, 0.08)
  // data/globe-land.json as parsed; read here when left null.
  property var landData: null
  // What its repaints cost: { count, total, max, last } in ms, and the
  // script's time by part, summed (tests/ui/shader/shell.qml reads both).
  property var stats: ({ count: 0, total: 0, max: 0, last: 0 })
  property var parts: ({ sample: 0, compose: 0, copy: 0, draw: 0, land: 0 })

  readonly property var shownLand: landData || ownLand
  property var ownLand: null
  property FileView landFile: FileView {
    path: texture.landData ? "" : String(Qt.resolvedUrl("data/globe-land.json")).replace(/^file:\/\//, "")
    printErrors: false
    onLoaded: {
      try {
        texture.ownLand = JSON.parse(text())
      } catch (e) {
        console.warn("more-weather: globe land data unreadable:", e)
      }
    }
  }

  onLayersChanged: requestPaint()
  onLatticesChanged: requestPaint()
  onLandMaskChanged: requestPaint()
  onScaleKmhChanged: requestPaint()
  onPalettesChanged: requestPaint()
  onOversampleChanged: requestPaint()
  onLandColorChanged: requestPaint()
  onShownLandChanged: requestPaint()
  onWidthChanged: requestPaint()
  onHeightChanged: requestPaint()

  // Buffers kept per size and use (plain arrays, GlobeTexture.zeros;
  // each new ImageData also adds to the script engine's outside memory).
  property var buffers: ({})
  function buffer(key, make) {
    var b = buffers[key]
    if (!b) {
      b = make()
      var kept = Object.keys(buffers).length < 24 ? Object.assign({}, buffers) : {}
      kept[key] = b
      buffers = kept
    }
    return b
  }

  // A grid of cols × rows nodes over `box`, its colours composed, drawn
  // stretched so that node i's pixel middle sits on its place; clipped to
  // the box's rectangle (and its copy a turn east or west when it crosses
  // ±180°).
  function paintNodes(ctx, box, cols, rows, useRegion, pal, active) {
    var t0 = Date.now()
    var n = cols * rows
    var size = cols + "x" + rows
    var values = {}
    for (var k = 0; k < active.length; k++) {
      values[active[k]] = buffer(active[k] + size, function() { return GlobeTexture.zeros(n) })
      GlobeTexture.sampleGrid(lattices[active[k]], box, cols, rows, values[active[k]], useRegion)
    }
    var mask = null
    if (values.sst && values.temperature && landMask) {
      mask = buffer("mask" + size, function() { return GlobeTexture.zeros(n) })
      GlobeTexture.sampleGrid({ global: landMask, region: null }, box, cols, rows, mask, false)
    }
    var t1 = Date.now()
    var image = buffer("image" + size, function() { return ctx.createImageData(cols, rows) })
    var rgba = buffer("rgba" + size, function() { return GlobeTexture.zeros(n * 4) })
    GlobeTexture.compose(values, mask, pal, scaleKmh, rgba, n)
    var tc = Date.now()
    // Composed into a plain array, then copied: writing the ImageData from
    // the library's loop measured several times slower.
    var data = image.data
    for (var q = 0; q < n * 4; q++) data[q] = rgba[q]
    var t2 = Date.now()
    parts.copy += t2 - tc
    var x0 = GlobeTexture.texelX(box.west, width), x1 = GlobeTexture.texelX(box.east, width)
    var y0 = GlobeTexture.texelY(box.north, height), y1 = GlobeTexture.texelY(box.south, height)
    var cellW = (x1 - x0) / (cols - 1), cellH = (y1 - y0) / (rows - 1)
    var pattern = ctx.createPattern(image, "no-repeat")
    for (var shift = -width; shift <= width; shift += width) {
      if (x1 + shift <= 0 || x0 + shift >= width) continue
      // The box on whole texels, so the clip and the clearing leave no
      // half-covered seam.
      var bx = Math.round(x0 + shift), by = Math.round(y0)
      var bw = Math.round(x1 + shift) - bx, bh = Math.round(y1) - by
      ctx.save()
      ctx.beginPath()
      ctx.rect(bx, by, bw, bh)
      ctx.clip()
      // The region replaces the whole earth's colours in its box (drawn
      // over them, two translucent layers would add up).
      if (useRegion) ctx.clearRect(bx, by, bw, bh)
      ctx.translate(x0 + shift - cellW / 2, y0 - cellH / 2)
      ctx.scale(cellW, cellH)
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, cols, rows)
      ctx.restore()
    }
    parts.sample += t1 - t0
    parts.compose += tc - t1
    parts.draw += Date.now() - t2
  }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    ctx.reset()
    ctx.clearRect(0, 0, width, height)
    var active = []
    for (var i = 0; i < layers.length; i++) {
      var pair = lattices[layers[i]]
      if (pair && (pair.global || pair.region) && active.indexOf(layers[i]) < 0) active.push(layers[i])
    }
    if (active.length) {
      var pal = palettes || GlobeTexture.palettes(null)
      // The whole earth: the global lattice's nodes, `oversample` times
      // finer, but never finer than the picture's texels.
      var cols = Math.min(Math.round(width / 2), 144 * Math.max(1, oversample)) + 1
      var rows = Math.round((cols - 1) / 2) + 1
      paintNodes(ctx, { south: -90, north: 90, west: -180, east: 180 }, cols, rows, false, pal, active)
      // The region's detail into its box, at its finest lattice's spacing
      // (at most a node per texel).
      var box = GlobeTexture.regionBox(active, lattices)
      if (box) {
        var texelDeg = 360 / width
        var step = Math.max(texelDeg, box.step / Math.max(1, oversample))
        var rc = Math.max(2, Math.min(width, Math.round((box.east - box.west) / step) + 1))
        var rr = Math.max(2, Math.min(height, Math.round((box.north - box.south) / step) + 1))
        paintNodes(ctx, box, rc, rr, true, pal, active)
      }
    }
    // The land's fill over the layers (as the Canvas path draws it).
    var tLand = Date.now()
    var land = shownLand
    if (land && land.land && landColor.a > 0) {
      var scale = land.scale || 100
      var sx = width / 360 / scale, sy = height / 180 / scale
      ctx.beginPath()
      for (var r = 0; r < land.land.length; r++) {
        var ring = land.land[r]
        for (var p = 0; p + 1 < ring.length; p += 2) {
          var x = ring[p] * sx + width / 2, y = height / 2 - ring[p + 1] * sy
          if (p === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
      }
      ctx.fillRule = Qt.OddEvenFill
      ctx.fillStyle = landColor
      ctx.fill()
    }
    parts.land += Date.now() - tLand
    // The isobars and their highs and lows (z0–z1 with the GPU surface:
    // fixed on the earth, so turning does not redraw them).
    if (isobars && isobars.length) {
      ctx.lineWidth = 1
      ctx.strokeStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.45)
      ctx.beginPath()
      var labels = []
      for (var l = 0; l < isobars.length; l++) {
        for (var n = 0; n < isobars[l].lines.length; n++) {
          var line = isobars[l].lines[n]
          for (var k = 0; k + 1 < line.length; k += 2) {
            var lx = (line[k] + 180) / 360 * width, ly = (90 - line[k + 1]) / 180 * height
            var jump = k > 0 && Math.abs(line[k] - line[k - 2]) > 180
            if (k === 0 || jump) ctx.moveTo(lx, ly)
            else ctx.lineTo(lx, ly)
            if (isobars[l].level % 8 === 0 && k === 12 && Math.abs(line[k + 1]) < 70)
              labels.push({ x: lx, y: ly, text: labelText(isobars[l].level) })
          }
        }
      }
      ctx.stroke()
      ctx.font = font
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      for (var b = 0; b < labels.length; b++) {
        var w = ctx.measureText(labels[b].text).width + 4
        ctx.fillStyle = Qt.rgba(surfaceColor.r, surfaceColor.g, surfaceColor.b, 0.7)
        ctx.fillRect(labels[b].x - w / 2, labels[b].y - 6, w, 12)
        ctx.fillStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.8)
        ctx.fillText(labels[b].text, labels[b].x, labels[b].y + 0.5)
      }
      for (var c = 0; c < (centres || []).length; c++) {
        var centre = centres[c]
        var cx = (centre.lon + 180) / 360 * width, cy = (90 - centre.lat) / 180 * height
        ctx.font = bigFont
        ctx.fillStyle = centre.kind === "high" ? highColor : Qt.rgba(ink.r, ink.g, ink.b, 0.9)
        ctx.fillText(centre.kind === "high" ? highText : lowText, cx, cy - 4)
        ctx.font = font
        ctx.fillText(labelText(centre.value), cx, cy + 9)
      }
    }
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent), last: spent }
  }
}
