import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Globe.js" as Globe
import "Sky.js" as Sky
import "Moon.js" as Moon

// The globe section: the earth from above the equator (Globe.js's view, its
// tilt fixed at 0 for now), the land, day and night with the three twilight
// steps, the sun and the moon where they stand overhead, and my places with
// their symbol and temperature from the stored forecasts (no requests of its
// own). A click on a place turns the globe to it and shows it; a drag or a
// sideways wheel turns the globe; Ctrl+← → turn it by 15°, 0 brings the
// shown place back to the middle. With "globeAutoRotate" it turns slowly by
// itself after a while without a touch, as More Time's globe does.
Column {
  id: globeSection
  required property var panel
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  visible: panel.showGlobeSection
  width: parent ? parent.width : 0
  spacing: Style.space(8)

  Rectangle {
    visible: !globeSection.inTab && !globeSection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Item {
    width: parent.width
    height: globeTitle.implicitHeight

    Text {
      id: globeTitle
      textFormat: Text.PlainText
      anchors.left: parent.left
      text: panel.upperLabel(panel.i18n("globe"))
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    // Where the keys act, in muted type.
    Text {
      textFormat: Text.PlainText
      anchors.right: parent.right
      anchors.baseline: globeTitle.baseline
      width: Math.min(implicitWidth, parent.width - globeTitle.implicitWidth - Style.space(12))
      text: panel.i18n("globeKeysHint")
      color: panel.hintText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      elide: Text.ElideRight
      horizontalAlignment: Text.AlignRight
    }
  }

  Item {
    id: globe
    width: parent.width
    // Room round the disc for the moon, which floats above its point.
    readonly property real lift: 1.18
    // As wide as the section, and as tall as the page's view less the
    // current weather and the tab strip above it, so the whole globe can
    // be seen at once.
    readonly property real viewHeight: panel.contentRoot ? panel.contentRoot.height - Style.space(200) : Style.space(420)
    readonly property real radius: Math.max(Style.space(120), Math.min(width, viewHeight)) / 2 / lift
    readonly property real centerX: width / 2
    readonly property real centerY: radius * lift
    height: 2 * radius * lift
    // Maps are never mirrored, whatever the language.
    LayoutMirroring.enabled: false
    LayoutMirroring.childrenInherit: true

    readonly property var panel: globeSection.panel
    readonly property bool showNight: panel.displaySetting("globeNight", true)
    readonly property bool showMoon: panel.displaySetting("globeMoon", true)
    readonly property bool showMarkers: panel.displaySetting("globeMarkers", true)
    readonly property bool autoRotate: panel.displaySetting("globeAutoRotate", false)
    readonly property real moonRadius: Style.space(6)
    // What painting costs (the screenshot harness measures a turn).
    property var paintStats: ({ count: 0, total: 0, max: 0 })

    Component.onCompleted: {
      panel.globeItem = globe
      panel.registerWheelArea(globe)
      centerLon = panel.mapCenterLongitude || 0
    }
    Component.onDestruction: {
      if (panel.globeItem === globe) panel.globeItem = null
      panel.unregisterWheelArea(globe)
    }

    // The longitude facing the viewer, unwrapped: turns animate through it
    // the short way and the drawing wraps it.
    property real centerLon: 0
    NumberAnimation {
      id: turnAnimation
      target: globe
      property: "centerLon"
      duration: 600
      easing.type: Easing.InOutCubic
    }
    function turnTo(lon) {
      if (lon === null || lon === undefined || isNaN(lon)) return
      turnAnimation.stop()
      turnAnimation.from = centerLon
      turnAnimation.to = centerLon + Globe.shortestTurn(centerLon, lon)
      turnAnimation.start()
    }
    function turnBy(degrees) {
      touched()
      turnTo(Globe.wrapLon((turnAnimation.running ? turnAnimation.to : centerLon) + degrees))
    }
    function recenter() {
      touched()
      turnTo(panel.mapCenterLongitude)
    }
    // Ends a running turn at once (the screenshot harness).
    function finishTurn() {
      if (turnAnimation.running) turnAnimation.complete()
    }
    readonly property real placeLon: panel.mapCenterLongitude
    onPlaceLonChanged: turnTo(placeLon)

    // ---- The land, once per process (Globe.prepareLand), and a coarse copy
    //      (points at least a degree apart; small islands kept whole) for
    //      the frames while it turns.
    property var land: null
    property var coarseLand: null
    readonly property bool moving: rotating || turnAnimation.running || (mouse.pressed && mouse.dragged)
    onMovingChanged: canvas.requestPaint()
    function coarseRings(data) {
      var scale = data.scale || 100
      var rings = []
      for (var r = 0; r < data.land.length; r++) {
        var ring = data.land[r]
        var flat = []
        var lastLat = null, lastLon = 0
        for (var i = 0; i < ring.length; i += 2) {
          var lon = ring[i] / scale, lat = ring[i + 1] / scale
          var far = lastLat === null || Math.abs(lat - lastLat) + Math.abs(lon - lastLon) * Math.cos(lat * Math.PI / 180) >= 1
          if (far || i >= ring.length - 2) {
            flat.push(lat, lon)
            lastLat = lat
            lastLon = lon
          }
        }
        if (flat.length < 8) {
          flat = []
          for (var k = 0; k < ring.length; k += 2) flat.push(ring[k + 1] / scale, ring[k] / scale)
        }
        rings.push(Globe.prepareVectors(flat))
      }
      return rings
    }
    property FileView landFile: FileView {
      path: String(Qt.resolvedUrl("data/globe-land.json")).replace(/^file:\/\//, "")
      printErrors: false
      onLoaded: {
        try {
          var data = JSON.parse(text())
          globe.land = Globe.prepareLand(data)
          globe.coarseLand = globe.coarseRings(data)
        } catch (e) {
          console.warn("more-weather: globe land data unreadable:", e)
        }
      }
    }

    // ---- The sky, once a minute: where the sun and the moon stand
    //      overhead, and the twilight layers (Sky.twilightLayers).
    readonly property double minuteMs: Math.floor(panel.relativeTimeNowMs / 60000) * 60000
    function rgbOf(color) { return [color.r, color.g, color.b] }
    readonly property var sky: {
      var sun = Sky.subsolarPoint(minuteMs)
      var layers = Sky.twilightLayers({ golden: false, blue: false, night: showNight }, rgbOf(Color.popups.background))
      return {
        sun: sun,
        anti: { lat: -sun.lat, lon: Globe.wrapLon(sun.lon + 180) },
        layers: layers,
        elevations: Sky.twilightElevations(layers),
        moon: showMoon ? Moon.moonPosition(minuteMs) : null
      }
    }

    // ---- My places: each saved place with coordinates, its symbol and
    //      temperature from the stored forecast (Panel.favoriteRows), and
    //      the shown place when it is not one of them.
    readonly property var markers: {
      if (!showMarkers) return []
      var list = []
      var rows = panel.favoriteRows
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        if (!isFinite(row.latitude) || !isFinite(row.longitude)) continue
        list.push({ index: row.index, name: row.name, lat: row.latitude, lon: row.longitude, symbol: row.symbol,
          temperature: row.temperature, active: row.active })
      }
      if (panel.activeFavoriteIndex < 0 && panel.reportLocation !== "")
        list.push({ index: -1, name: panel.reportLocation, lat: panel.mapCenterLatitude, lon: panel.mapCenterLongitude,
          symbol: panel.displayLabel, temperature: panel.reportTempNum, active: true })
      return list
    }

    onLandChanged: canvas.requestPaint()
    onSkyChanged: canvas.requestPaint()
    onMarkersChanged: canvas.requestPaint()
    onCenterLonChanged: canvas.requestPaint()
    onWidthChanged: canvas.requestPaint()
    onShowMoonChanged: canvas.requestPaint()

    // Where the markers and the moon were drawn, for clicks and the hover.
    property var markerHits: []
    property var moonHit: null
    property var hover: null
    property var pointer: null

    // ---- Turning by itself (as in More Time): after the set delay without
    //      a touch it turns east, one turn in the set minutes, only while it
    //      can be seen; a press, drag, wheel or key stops it.
    property bool rotating: false
    // On screen: the section's top within the page's view, checked once a
    // second while turning by itself is on.
    property bool onScreen: true
    Timer {
      interval: 1000
      repeat: true
      running: globe.autoRotate && globe.panel.globeShown
      triggeredOnStart: true
      onTriggered: {
        var root = globe.panel.contentRoot
        if (!root) return
        var top = globe.mapToItem(root, 0, 0).y
        globe.onScreen = top + globe.height > 0 && top < root.height
      }
    }
    readonly property bool canRotate: autoRotate && panel.globeShown && onScreen && !mouse.pressed
    onCanRotateChanged: if (!canRotate) rotating = false
    readonly property int rotateDelaySeconds: Number(panel.displaySetting("globeRotateDelay", "10")) || 10
    readonly property int rotateTurnMinutes: Number(panel.displaySetting("globeRotateSpeed", "4")) || 4
    function touched() {
      rotating = false
      if (idleTimer.running) idleTimer.restart()
    }
    Timer {
      id: idleTimer
      interval: globe.rotateDelaySeconds * 1000
      running: globe.canRotate && !globe.rotating
      onTriggered: globe.rotating = true
    }
    // A frame for every pixel the surface moves at the centre, not more
    // often than 30 a second.
    Timer {
      id: rotateTimer
      interval: Math.max(33, Math.min(250, (180 / Math.PI / Math.max(1, globe.radius))
        / (360 / (globe.rotateTurnMinutes * 60000))))
      repeat: true
      running: globe.canRotate && globe.rotating
      property double last: 0
      onRunningChanged: last = Date.now()
      onTriggered: {
        var now = Date.now()
        var elapsed = Math.min(500, now - last)
        last = now
        if (!turnAnimation.running) globe.centerLon += elapsed * 360 / (globe.rotateTurnMinutes * 60000)
      }
    }

    Canvas {
      id: canvas
      anchors.fill: parent
      property color ink: globe.panel.foreground
      property color accent: Color.accent
      onInkChanged: requestPaint()
      onAccentChanged: requestPaint()

      function rgba(color, alpha) {
        return Qt.rgba(color.r, color.g, color.b, alpha)
      }
      // Globe.js gives y to the north round the centre; the canvas wants
      // pixels downwards.
      function trace(ctx, xy, close) {
        ctx.moveTo(globe.centerX + xy[0], globe.centerY - xy[1])
        for (var i = 2; i < xy.length; i += 2) ctx.lineTo(globe.centerX + xy[i], globe.centerY - xy[i + 1])
        if (close) ctx.closePath()
      }
      function disc(ctx) {
        ctx.beginPath()
        ctx.arc(globe.centerX, globe.centerY, globe.radius, 0, Math.PI * 2)
      }
      function screenPoint(lat, lon, m) {
        var p = Globe.projectView(lat, lon, m, globe.radius)
        return { x: globe.centerX + p.x, y: globe.centerY - p.y, visible: p.visible }
      }

      onPaint: {
        var started = Date.now()
        var ctx = getContext("2d")
        ctx.reset()
        var R = globe.radius
        if (R <= 0) return
        var m = Globe.viewMatrix(0, Globe.wrapLon(globe.centerLon))

        ctx.save()
        disc(ctx)
        ctx.clip()
        ctx.fillStyle = rgba(ink, 0.04)
        ctx.fillRect(0, 0, width, height)

        // Meridians and parallels every 15°, faintly.
        ctx.strokeStyle = rgba(ink, 0.07)
        ctx.lineWidth = 1
        var lines = Globe.gridLinesView(m, R, 15)
        ctx.beginPath()
        for (var g = 0; g < lines.length; g++) trace(ctx, lines[g], false)
        ctx.stroke()

        // Land: a light fill and a crisp coastline.
        // While it turns, the coarse coastline: a frame costs a third.
        var rings = (globe.moving ? globe.coarseLand : globe.land) || []
        if (rings.length) {
          ctx.beginPath()
          for (var r = 0; r < rings.length; r++) {
            var polys = Globe.frontPolygonsView(rings[r], m, R)
            for (var p = 0; p < polys.length; p++) trace(ctx, polys[p], true)
          }
          ctx.fillStyle = rgba(ink, 0.08)
          ctx.fillRule = Qt.OddEvenFill
          ctx.fill()
          ctx.beginPath()
          for (var l = 0; l < rings.length; l++) {
            var coast = Globe.frontLinesView(rings[l], m, R)
            for (var c = 0; c < coast.length; c++) trace(ctx, coast[c], false)
          }
          ctx.strokeStyle = rgba(ink, 0.5)
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
        var landDone = Date.now()

        // Night in three steps (civil, nautical, then night): caps round
        // the point opposite the sun, 90° + the elevation wide.
        var sky = globe.sky
        var caps = {}
        for (var e = 0; e < sky.elevations.length; e++) {
          var elevation = sky.elevations[e]
          caps[elevation] = Globe.capPolygonView(sky.anti.lat, sky.anti.lon, 90 + elevation, m, R)
        }
        ctx.fillRule = Qt.OddEvenFill
        for (var t = 0; t < sky.layers.length; t++) {
          var layer = sky.layers[t]
          var areas = caps[layer.high].concat(layer.low !== null ? caps[layer.low] : [])
          if (!areas.length) continue
          ctx.beginPath()
          for (var q = 0; q < areas.length; q++) trace(ctx, areas[q], true)
          ctx.fillStyle = Qt.rgba(layer.fill.r, layer.fill.g, layer.fill.b, layer.fill.a)
          ctx.fill()
        }
        var sun = screenPoint(sky.sun.lat, sky.sun.lon, m)
        if (globe.showNight && sun.visible) Sky.paintSun(ctx, sun.x, sun.y, rgba(accent, 0.95))
        // The moon floats above its sub-lunar point, its shadow on the
        // surface; hidden behind the globe.
        var moon = sky.moon
        var moonAt = moon ? screenPoint(moon.lat, moon.lon, m) : null
        if (moon && moonAt.visible) Moon.paintMoonShadow(ctx, moonAt.x, moonAt.y, globe.moonRadius)
        ctx.restore()

        globe.moonHit = null
        if (moon && moonAt.visible) {
          var mx = globe.centerX + (moonAt.x - globe.centerX) * 1.15
          var my = globe.centerY + (moonAt.y - globe.centerY) * 1.15
          var angle = Moon.moonLitAngle(moon, sky.sun, function(lat, lon) { return screenPoint(lat, lon, m) })
          Moon.paintMoon(ctx, mx, my, globe.moonRadius, angle, moon.illuminated, "238,236,226",
            Moon.rgbText(Sky.nightFill(globe.rgbOf(Color.popups.background))), Moon.rgbText(ink))
          globe.moonHit = { x: mx, y: my, moon: moon }
        }

        ctx.strokeStyle = rgba(ink, 0.35)
        ctx.lineWidth = 1
        disc(ctx)
        ctx.stroke()
        var skyDone = Date.now()

        paintMarkers(ctx, m)
        mouse.updateHover()
        var done = Date.now()
        var st = globe.paintStats
        globe.paintStats = { count: st.count + 1, total: st.total + done - started, max: Math.max(st.max, done - started),
          land: (st.land || 0) + landDone - started, sky: (st.sky || 0) + skyDone - landDone,
          places: (st.places || 0) + done - skyDone }
      }

      // Each place as a dot with "symbol name 12°" beside it, the shown
      // place in the accent colour and drawn first, so its label always
      // gets a spot; a label that would cover another goes elsewhere or
      // stays out.
      function paintMarkers(ctx, m) {
        var taken = []
        var hits = []
        function free(rect) {
          for (var i = 0; i < taken.length; i++) {
            var o = taken[i]
            if (rect.x < o.x + o.w && rect.x + rect.w > o.x && rect.y < o.y + o.h && rect.y + rect.h > o.y) return false
          }
          return true
        }
        var fontPx = Style.font.caption
        var labelFont = globe.panel.canvasFont(fontPx, false, false)
        var boldFont = globe.panel.canvasFont(fontPx, true, false)
        var list = globe.markers.slice(0).sort(function(a, b) { return (b.active ? 1 : 0) - (a.active ? 1 : 0) })
        var background = Color.popups.background
        for (var k = 0; k < list.length; k++) {
          var place = list[k]
          var p = screenPoint(place.lat, place.lon, m)
          // Behind the globe: not drawn, not clickable.
          if (!p.visible) continue
          ctx.fillStyle = place.active ? accent : ink
          ctx.beginPath()
          ctx.arc(p.x, p.y, place.active ? 4 : 3, 0, Math.PI * 2)
          ctx.fill()
          if (place.active) {
            ctx.strokeStyle = accent
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.arc(p.x, p.y, 7, 0, Math.PI * 2)
            ctx.stroke()
          }
          hits.push({ marker: place, x: p.x, y: p.y })
          taken.push({ x: p.x - 5, y: p.y - 5, w: 10, h: 10 })
          var label = (place.symbol ? place.symbol + " " : "") + place.name
            + (place.temperature !== "" && place.temperature !== undefined ? " " + place.temperature + "°" : "")
          ctx.font = place.active ? boldFont : labelFont
          var w = ctx.measureText(label).width + 6
          var h = fontPx + 4
          // Right, left, above, below the dot: the first free spot.
          var spots = [
            { x: p.x + 8, y: p.y - h / 2 }, { x: p.x - 8 - w, y: p.y - h / 2 },
            { x: p.x - w / 2, y: p.y - 8 - h }, { x: p.x - w / 2, y: p.y + 8 }
          ]
          for (var s = 0; s < spots.length; s++) {
            var rect = { x: spots[s].x, y: spots[s].y, w: w, h: h }
            if (rect.x < 0 || rect.x + w > width || rect.y < 0 || rect.y + h > height) continue
            if (!free(rect)) continue
            taken.push(rect)
            ctx.fillStyle = Qt.rgba(background.r, background.g, background.b, 0.78)
            ctx.fillRect(rect.x, rect.y, w, h)
            ctx.fillStyle = place.active ? accent : ink
            ctx.textAlign = "left"
            ctx.textBaseline = "middle"
            ctx.fillText(label, rect.x + 3, rect.y + h / 2 + 0.5)
            break
          }
        }
        globe.markerHits = hits
      }
    }

    // A drag or a sideways wheel turns the globe; a click on a place shows
    // it; the resting pointer names the place or the moon under it.
    MouseArea {
      id: mouse
      anchors.fill: parent
      hoverEnabled: true
      preventStealing: true
      property real pressX: 0
      property real pressLon: 0
      property bool dragged: false

      function markerAt(x, y) {
        var best = null
        var bestDistance = Style.space(12)
        for (var i = 0; i < globe.markerHits.length; i++) {
          var d = Math.hypot(globe.markerHits[i].x - x, globe.markerHits[i].y - y)
          if (d < bestDistance) { best = globe.markerHits[i].marker; bestDistance = d }
        }
        return best
      }
      function updateHover() {
        var p = globe.pointer
        if (!p || pressed) { globe.hover = null; return }
        var moonHit = globe.moonHit
        if (moonHit && Math.hypot(moonHit.x - p.x, moonHit.y - p.y) <= Style.space(8)) {
          var percent = Math.round(moonHit.moon.illuminated * 100)
          globe.hover = { x: p.x, y: p.y, text: globe.panel.i18n(moonHit.moon.waxing ? "moonWaxing" : "moonWaning",
            { percent: globe.panel.localizedNumber(percent) }) }
          return
        }
        var marker = markerAt(p.x, p.y)
        globe.hover = marker ? { x: p.x, y: p.y, text: [marker.name,
          marker.temperature !== "" ? marker.temperature + " " + globe.panel.tempUnit : "", marker.symbol]
          .filter(function(part) { return !!part }).join(" · ") } : null
      }

      onPressed: function(event) {
        globe.touched()
        turnAnimation.stop()
        pressX = event.x
        pressLon = globe.centerLon
        dragged = false
      }
      onPositionChanged: function(event) {
        if (pressed) {
          if (Math.abs(event.x - pressX) > Style.space(4)) dragged = true
          // The surface follows the pointer at the centre of the globe.
          if (dragged) globe.centerLon = pressLon - (event.x - pressX) / Math.max(1, globe.radius) * 180 / Math.PI
          globe.hover = null
          return
        }
        globe.pointer = { x: event.x, y: event.y }
        updateHover()
      }
      onExited: {
        globe.pointer = null
        globe.hover = null
      }
      onClicked: function(event) {
        if (dragged) return
        var marker = markerAt(event.x, event.y)
        if (!marker) return
        globe.turnTo(marker.lon)
        // The place becomes the shown one, the globe stays in view.
        if (marker.index >= 0 && !marker.active)
          globe.panel.selectSavedLocation(globe.panel.savedLocations[marker.index])
      }
    }

    // The page routes wheels (Panel.routeWheel): this takes the sideways
    // ones (a touchpad swipe, a tilting wheel, Shift with the wheel).
    readonly property bool wheelEnabled: true
    function wantsWheel(wheel) { return panel.wheelIsSideways(wheel) }
    function takeWheel(wheel) {
      touched()
      turnAnimation.stop()
      centerLon -= panel.wheelSidewaysPixels(wheel) / Math.max(1, radius) * 180 / Math.PI
      return true
    }

    PanelToolTip {
      visible: !!globe.hover
      x: globe.hover ? globe.hover.x + Style.space(12) : 0
      y: globe.hover ? globe.hover.y + Style.space(12) : 0
      text: globe.hover ? globe.hover.text : ""
      fontFamily: globe.panel.fontFamily
    }
  }
}
