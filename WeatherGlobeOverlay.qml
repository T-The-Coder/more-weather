import QtQuick
import qs.Commons
import "Globe.js" as Globe
import "GlobeSymbols.js" as GlobeSymbols
import "EqualEarth.js" as EqualEarth
import "Model.js" as Model

// What the globe draws over the colour wash from the model (Settings →
// Display → Globe): the isobars every 4 hPa as thin lines, every second one
// labelled where there is room, with H and L at the pressure centres; the
// gust glyphs where the gusts reach 75 km/h (larger from 103); the
// active wash's values in numbers from z2; and the places of the
// thunderstorms, whose bolts flash now and then as items of their own
// (`bolts`, for WeatherGlobe's pool). Everything comes from the worker per time step
// (GlobeLayers.layersFor); here it is only projected and de-cluttered on
// screen, again with each turn or zoom.
Canvas {
  id: overlay
  required property var panel
  required property Item globe
  property var layers: null
  property bool isobars: false
  property bool storms: false
  property bool numbers: false
  // The wash's value at a point of the view (WeatherGlobe.washValueAt).
  property var valueAt: null
  // On screen after the last frame: gusts and bolts with x, y (for the
  // pointer and the bolts' items).
  property var gusts: []
  property var bolts: []
  property var stats: ({ count: 0, total: 0, max: 0 })
  property color ink: panel.foreground
  property color surface: Color.popups.background

  onLayersChanged: { mapped = ({}); requestPaint() }
  // The isobars in Equal Earth units, per level and line (flat map).
  property var mapped: ({})
  function mapLine(level, index, line) {
    var key = level + ":" + index
    var known = mapped[key]
    if (known) return known
    var out = []
    for (var j = 0; j + 1 < line.length; j += 2) {
      var p = EqualEarth.project(line[j + 1], line[j])
      out.push(p.x, p.y)
    }
    mapped[key] = out
    return out
  }
  onIsobarsChanged: requestPaint()
  onStormsChanged: requestPaint()
  onNumbersChanged: requestPaint()
  onInkChanged: requestPaint()

  function rgba(color, alpha) {
    return Qt.rgba(color.r, color.g, color.b, alpha)
  }
  // weather-windy (Material Design Icons in the Nerd Font), as on the wind tab.
  readonly property string gustGlyph: "\u{f059d}"
  // The wind's accent (Panel.windAccent), softened towards the text below
  // 103 km/h; the text colour without accents.
  function gustColor(kmh, strong) {
    var accent = panel.windAccent(kmh)
    if (!accent) return rgba(ink, strong ? 0.95 : 0.75)
    var c = Qt.color(accent)
    var f = strong ? 0 : 0.4
    return Qt.rgba(c.r + (ink.r - c.r) * f, c.g + (ink.g - c.g) * f, c.b + (ink.b - c.b) * f, 1)
  }
  function pressureText(hPa) {
    var p = Model.pressureValue(hPa, panel.useImperial)
    return p ? panel.localizedNumber(p.value) : ""
  }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    ctx.reset()
    var data = layers
    var R = globe.radius
    var cx = globe.centerX, cy = globe.centerY
    var P = globe.projection()
    var project = function(lat, lon) {
      var p = P.project(lat, lon)
      return { x: p.x, y: p.y, visible: p.visible && p.x >= -20 && p.x <= width + 20 && p.y >= -20 && p.y <= height + 20 }
    }
    var fontPx = Style.font.caption
    // Clear of my places' and the towns' labels (drawn by the globe).
    var taken = (globe.labelRects || []).slice()
    function free(rect) {
      if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > width || rect.y + rect.h > height) return false
      for (var i = 0; i < taken.length; i++) {
        var o = taken[i]
        if (rect.x < o.x + o.w && rect.x + rect.w > o.x && rect.y < o.y + o.h && rect.y + rect.h > o.y) return false
      }
      return true
    }
    function label(text, x, y, color, font) {
      ctx.font = font
      var w = ctx.measureText(text).width + 6, h = fontPx + 4
      var rect = { x: x - w / 2, y: y - h / 2, w: w, h: h }
      if (!free(rect)) return false
      taken.push(rect)
      ctx.fillStyle = rgba(surface, 0.7)
      ctx.fillRect(rect.x, rect.y, w, h)
      ctx.fillStyle = color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, x, y + 0.5)
      return true
    }
    var plain = panel.canvasFont(fontPx, false, false)
    var bold = panel.canvasFont(fontPx, true, false)

    // Isobars: split where a line turns behind the globe or crosses ±180°;
    // labels and centres only at rest.
    var still = !globe.moving
    if (isobars && data && data.isobars) {
      // The lines within the earth's edge, like the colour layers.
      ctx.save()
      P.traceEarth(ctx)
      ctx.clip()
      ctx.lineWidth = 0.9
      ctx.strokeStyle = rgba(ink, 0.45)
      ctx.beginPath()
      var labelSpots = []
      var iso = data.isobars
      for (var l = 0; l < iso.length; l++) {
        var labelled = still && iso[l].level % 8 === 0
        var text = labelled ? pressureText(iso[l].level) : ""
        for (var n = 0; n < iso[l].lines.length; n++) {
          var line = iso[l].lines[n]
          // On the flat map the points in map units, made once per data.
          var mapped = P.kind === "map" ? mapLine(l, n, line) : null
          var open = false, run = 0, lastLon = 0
          for (var j = 0; j + 1 < line.length; j += 2) {
            var visible, px, py
            if (mapped) {
              px = P.toScreenX(mapped[j])
              py = P.toScreenY(mapped[j + 1])
              visible = px >= -50 && px <= width + 50 && py >= -50 && py <= height + 50
            } else {
              visible = P.at(line[j + 1], line[j])
              px = P.x
              py = P.y
            }
            if (!visible || (open && Math.abs(line[j] - lastLon) > 180)) {
              open = false
              run = 0
              if (!visible) continue
            }
            if (open) ctx.lineTo(px, py)
            else ctx.moveTo(px, py)
            open = true
            lastLon = line[j]
            run++
            // A label a little way into each long enough visible run.
            if (labelled && run === 6 && px > 0 && py > 0 && px < width && py < height)
              labelSpots.push({ x: px, y: py, text: text })
          }
        }
      }
      ctx.stroke()
      ctx.restore()
      // H and L at the centres, then the labels where there is room.
      var centres = still ? data.centres || [] : []
      for (var c = 0; c < centres.length; c++) {
        var at = project(centres[c].lat, centres[c].lon)
        if (!at.visible) continue
        var high = centres[c].kind === "high"
        var letter = panel.i18n(high ? "globeHigh" : "globeLow")
        ctx.font = panel.canvasFont(Math.round(fontPx * 1.6), true, false)
        var w = ctx.measureText(letter).width + 4
        var rect = { x: at.x - w / 2, y: at.y - fontPx * 1.2, w: w, h: fontPx * 2.4 + 4 }
        if (!free(rect)) continue
        taken.push(rect)
        ctx.fillStyle = high ? rgba(Color.accent, 0.95) : rgba(ink, 0.9)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(letter, at.x, at.y - fontPx * 0.3)
        ctx.font = plain
        ctx.fillText(pressureText(centres[c].value), at.x, at.y + fontPx * 0.9)
      }
      for (var s = 0; s < labelSpots.length; s++) label(labelSpots[s].text, labelSpots[s].x, labelSpots[s].y, rgba(ink, 0.75), plain)
    }

    // Gusts: the wind glyph the tabs use (weather-windy), in the wind's
    // accent, larger and stronger from 103 km/h, on a thin halo of the
    // page's colour so it reads on any wash.
    var shownGusts = []
    var shownBolts = []
    if (storms && data && data.storms) {
      shownGusts = GlobeSymbols.declutterScreen(data.storms, project, 34)
      for (var g = 0; g < shownGusts.length; g++) {
        var gust = shownGusts[g]
        var strong = gust.level >= 2
        var size = Math.round(fontPx * (strong ? 1.35 : 1.1))
        var r = size / 2
        ctx.font = panel.canvasFont(size, false, false)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.lineJoin = "round"
        ctx.lineWidth = 2.5
        ctx.strokeStyle = rgba(surface, 0.85)
        ctx.strokeText(gustGlyph, gust.x, gust.y)
        ctx.fillStyle = gustColor(gust.gust, strong)
        ctx.fillText(gustGlyph, gust.x, gust.y)
        taken.push({ x: gust.x - r, y: gust.y - r, w: 2 * r, h: 2 * r })
      }
      shownBolts = GlobeSymbols.declutterScreen(data.thunderstorms || [], project, 30).slice(0, 24)
      for (var b = 0; b < shownBolts.length; b++)
        taken.push({ x: shownBolts[b].x - 8, y: shownBolts[b].y - 10, w: 16, h: 20 })
    }
    gusts = shownGusts
    bolts = shownBolts

    // The wash's values in numbers, from z2, on an even screen grid.
    if (numbers && still && globe.zoom >= 2 && valueAt) {
      var step = Math.max(96, fontPx * 9)
      for (var gy = step / 2; gy < height; gy += step) {
        for (var gx = step / 2; gx < width; gx += step) {
          var text = valueAt(gx, gy)
          if (text !== "") label(text, gx, gy, rgba(ink, 0.9), bold)
        }
      }
    }
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent) }
  }
}
