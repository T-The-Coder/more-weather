import QtQuick
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui
import "Globe.js" as Globe
import "GlobeView.js" as GlobeView
import "Sky.js" as Sky
import "Moon.js" as Moon
import "Basemap.js" as Basemap
import "GlobeGrid.js" as GlobeGrid
import "I18n.js" as I18n
import "GlobeFields.js" as GlobeFields
import "GlobeProjection.js" as GlobeProjection
import "EqualEarth.js" as EqualEarth
import "Model.js" as Model

// The globe section: the earth seen from above (centre latitude and
// longitude, tilted up to 80°), zoomed from the whole disc (z0) to about
// 400 km across (z5); the land, day and night with the three twilight
// steps, the sun and the moon where they stand overhead, and my places with
// their symbol and temperature from the stored forecasts (no requests of its
// own). From z3 the coast, lakes, borders and towns come from the radar
// map's Natural Earth data (data/basemap.bin). A drag turns and tilts it,
// Ctrl + wheel and a double click zoom towards the pointer, the buttons and
// + − zoom, Ctrl + arrows turn and tilt, 0 goes back to the whole globe at
// the shown place; a click on a place turns to it and shows it. With
// "globeAutoRotate" it turns slowly by itself (z0 and z1 only), as More
// Time's globe does. View arithmetic: GlobeView.js.
Column {
  id: globeSection
  required property var panel
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  // The globe item, for children whose own `globe` property would hide its id.
  readonly property Item view: globe
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
        + (panel.displaySetting("globeTimeline", true) === true && panel.globeData.active
          ? " · " + panel.i18n("globeTimeKeysHint") : "")
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
    // As wide as the section, and as tall as the page's view less the
    // current weather and the tab strip above it, so the whole globe can
    // be seen at once; a zoomed globe is cut to this square.
    readonly property real viewHeight: panel.contentRoot ? panel.contentRoot.height - Style.space(200) : Style.space(420)
    readonly property real viewSize: Math.max(Style.space(160), Math.min(width, viewHeight))
    // Globe or flat map (Settings → Display → Globe: Map style); the map
    // as wide as the section, as tall as its proportions or the view allow.
    readonly property string style: String(panel.displaySetting("globeStyle", "globe"))
    readonly property bool isMap: style === "map"
    height: isMap ? Math.max(Style.space(120), Math.min(viewHeight, width * EqualEarth.Y_MAX / EqualEarth.X_MAX)) : viewSize
    // The projection for a frame (GlobeProjection): every layer asks it.
    function projection() {
      var lat = centerLat, lon = centerLon
      if (isMap) {
        var c = GlobeProjection.mapCentre(lat, lon, width, height, zoom)
        lat = c.lat
        lon = c.lon
      }
      return GlobeProjection.make({ style: style, centerLat: lat, centerLon: lon, zoom: zoom, width: width,
        height: height, radius: radius })
    }
    // The flat map's land (data/globe-land.json through Equal Earth) and
    // graticules, made once.
    readonly property var mapLand: isMap && landData
      ? landData.land.map(function(ring) { return EqualEarth.ringToMap(ring, landData.scale || 100) }) : null
    property var graticules: ({})
    // The flat map's twilight polygons (map units) for the shown minute,
    // kept until it changes.
    property var twilightCache: ({ minute: -1, polygons: {} })
    function mapTwilight(elevation) {
      if (twilightCache.minute !== minuteMs) twilightCache = { minute: minuteMs, polygons: {} }
      var key = String(elevation)
      if (!twilightCache.polygons[key]) twilightCache.polygons[key] = EqualEarth.twilightPolygon(minuteMs, elevation)
      return twilightCache.polygons[key]
    }
    function mapGraticule(step) {
      if (!graticules[step]) {
        var next = Object.assign({}, graticules)
        next[step] = EqualEarth.graticule(step)
        graticules = next
      }
      return graticules[step]
    }
    onStyleChanged: {
      zoom = 0
      canvas.requestPaint()
      wash.requestPaint()
      overlay.requestPaint()
      streaks.reseed()
    }
    clip: true
    // Room round the whole disc for the moon, which floats above its point.
    readonly property real lift: 1.18
    readonly property real radius: GlobeView.radiusFor(zoom, viewSize, lift)
    readonly property real centerX: width / 2
    readonly property real centerY: height / 2
    // Maps are never mirrored, whatever the language.
    LayoutMirroring.enabled: false
    LayoutMirroring.childrenInherit: true

    readonly property var panel: globeSection.panel
    readonly property bool showNight: panel.displaySetting("globeNight", true)
    readonly property bool showMoon: panel.displaySetting("globeMoon", true)
    readonly property string moonStyle: String(panel.displaySetting("globeMoonStyle", "space"))
    onMoonStyleChanged: canvas.requestPaint()
    readonly property bool showMarkers: panel.displaySetting("globeMarkers", true)
    readonly property bool autoRotate: panel.displaySetting("globeAutoRotate", false)
    readonly property real moonRadius: Style.space(6)
    // What painting costs (the screenshot harness measures it).
    property var paintStats: ({ count: 0, total: 0, max: 0 })

    // ---- The view: where it looks (longitude unwrapped, so turns animate
    //      the short way) and the zoom level.
    property real centerLat: 0
    property real centerLon: 0
    property int zoom: 0
    readonly property var placeTarget: ({ lat: panel.mapCenterLatitude, lon: panel.mapCenterLongitude })

    Component.onCompleted: {
      panel.globeItem = globe
      panel.registerWheelArea(globe)
      centerLon = panel.mapCenterLongitude || 0
    }
    Component.onDestruction: {
      if (panel.globeItem === globe) panel.globeItem = null
      panel.unregisterWheelArea(globe)
    }

    ParallelAnimation {
      id: turnAnimation
      NumberAnimation { id: latAnimation; target: globe; property: "centerLat"; duration: 600; easing.type: Easing.InOutCubic }
      NumberAnimation { id: lonAnimation; target: globe; property: "centerLon"; duration: 600; easing.type: Easing.InOutCubic }
    }
    // Turns (and tilts, with a latitude) to a place, the short way round.
    function turnTo(lat, lon) {
      if (lon === null || lon === undefined || isNaN(lon)) return
      turnAnimation.stop()
      latAnimation.from = centerLat
      latAnimation.to = lat === null || lat === undefined || isNaN(lat) ? centerLat : GlobeView.clampLat(lat)
      lonAnimation.from = centerLon
      lonAnimation.to = centerLon + Globe.shortestTurn(centerLon, lon)
      turnAnimation.start()
    }
    // Ctrl + arrows: by 15° on the whole disc, by a quarter of the view
    // when zoomed in; east/west turns, north/south tilts.
    function turnStep(east, north) {
      touched()
      var step = GlobeView.stepDegrees(zoom, radius, viewSize)
      var lat = turnAnimation.running ? latAnimation.to : centerLat
      var lon = turnAnimation.running ? lonAnimation.to : centerLon
      var cos = zoom >= 2 ? Math.max(0.2, Math.cos(lat * Math.PI / 180)) : 1
      turnTo(lat + north * step, Globe.wrapLon(lon + east * step / cos))
    }
    // The crosshair: the shown place in the middle, at the same zoom.
    function recenter() {
      touched()
      turnTo(placeTarget.lat, placeTarget.lon)
    }
    // 0: the whole globe, upright, the shown place facing.
    function reset() {
      touched()
      zoom = 0
      turnTo(0, placeTarget.lon)
    }
    function zoomBy(delta) {
      zoomAt(delta, 0, 0)
    }
    // Zooms one level towards the point (px, py) from the viewport's middle.
    function zoomAt(delta, px, py) {
      touched()
      var next = GlobeView.clampZoom(zoom + delta)
      if (next === zoom) return
      turnAnimation.stop()
      if (isMap) {
        // The place under the pointer stays under it.
        var P0 = projection()
        var under = P0.unproject(centerX + px, centerY + py)
        var s1 = GlobeProjection.mapScale(width, height, next)
        if (under) {
          var at = EqualEarth.project(under.lat, under.lon)
          var back = EqualEarth.unproject(at.x - px / s1, at.y + py / s1)
          if (back) {
            var c1 = GlobeProjection.mapCentre(back.lat, back.lon, width, height, next)
            centerLat = c1.lat
            centerLon = c1.lon
          }
        }
        zoom = next
        return
      }
      var r1 = GlobeView.radiusFor(next, viewSize, lift)
      var centre = GlobeView.zoomedCentre(centerLat, centerLon, radius, r1, px, py)
      centerLat = centre.lat
      centerLon = centre.lon
      zoom = next
    }
    // Ends a running turn at once (the screenshot harness).
    function finishTurn() {
      if (turnAnimation.running) turnAnimation.complete()
    }
    readonly property real placeLon: panel.mapCenterLongitude
    onPlaceLonChanged: turnTo(zoom >= 2 ? placeTarget.lat : null, placeLon)

    // ---- The land: data/globe-land.json once per process (Globe.prepareLand)
    //      and a coarse copy (points at least a degree apart, small islands
    //      kept whole) for the frames while it moves; from z3, at rest, the
    //      basemap's cells in view.
    property var land: null
    // The file as read (GlobeMarine's sea test for the loader).
    property var landData: null
    property var coarseLand: null
    readonly property bool moving: rotating || turnAnimation.running || dragging
    onMovingChanged: {
      canvas.requestPaint()
      overlay.requestPaint()
      if (!moving) wash.requestPaint()
    }
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
          globe.landData = data
          globe.land = Globe.prepareLand(data)
          globe.coarseLand = globe.coarseRings(data)
        } catch (e) {
          console.warn("more-weather: globe land data unreadable:", e)
        }
      }
    }
    // The radar map's Natural Earth data (Basemap.js keeps it for every map
    // in this shell); read here only when the globe needs it first.
    property int basemapRevision: Basemap.loaded() ? 1 : 0
    property FileView basemapFile: FileView {
      path: globe.zoom >= 3 && globe.basemapRevision === 0
        ? String(Qt.resolvedUrl("data/basemap.bin")).replace(/^file:\/\//, "") : ""
      printErrors: false
      onLoaded: {
        if (!Basemap.load(data())) return
        globe.basemapRevision++
        globe.panel.basemapRevision++
      }
    }
    onBasemapRevisionChanged: canvas.requestPaint()

    // ---- The sky, once a minute: where the sun and the moon stand
    //      overhead, and the twilight layers (Sky.twilightLayers).
    // The shown time (the timeline's, else now) to the minute: the sun, the
    // twilight and the moon follow it.
    readonly property double minuteMs: Math.floor(panel.globeData.displayMs / 60000) * 60000
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
    //      values from the stored forecast (Panel.favoriteRows), and the
    //      shown place when it is not one of them.
    readonly property var markers: {
      if (!showMarkers) return []
      var list = []
      var rows = panel.favoriteRows
      // At another time on the timeline each place shows its own forecast
      // for it; beyond its stored hours the current values, muted.
      var scrubbed = panel.globeData.scrubbed
      var at = panel.globeData.displayMs
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        if (!isFinite(row.latitude) || !isFinite(row.longitude)) continue
        var then = scrubbed ? panel.favoriteForecastAt(row.index, at) : null
        list.push({ index: row.index, name: row.name, lat: row.latitude, lon: row.longitude,
          symbol: then ? then.symbol : row.symbol, temperature: then ? then.temperature : row.temperature,
          wind: then ? "" : row.wind, active: row.active, muted: scrubbed && !then })
      }
      if (panel.activeFavoriteIndex < 0 && panel.reportLocation !== "")
        list.push({ index: -1, name: panel.reportLocation, lat: panel.mapCenterLatitude, lon: panel.mapCenterLongitude,
          symbol: panel.displayLabel, temperature: panel.reportTempNum, wind: panel.reportWind, active: true, muted: scrubbed })
      return list
    }

    onLandChanged: canvas.requestPaint()
    onSkyChanged: canvas.requestPaint()
    onMarkersChanged: canvas.requestPaint()
    onCenterLonChanged: if (!dragging || zoom < 2) viewChanged()
    onCenterLatChanged: if (!dragging || zoom < 2) viewChanged()
    onZoomChanged: { canvas.requestPaint(); wash.requestPaint(); overlay.requestPaint(); streaks.reseed() }
    function viewChanged() {
      canvas.requestPaint()
      wash.viewChanged()
      streaks.viewChanged()
      // The overlay every third frame while moving, between the wash's.
      if (!moving || wash.skipped % 3 === 1) overlay.requestPaint()
    }
    // The wash's value at a point of the view, with the place's coordinates
    // ("12 °C · 48° N 11° E"), or null.
    function washHover(x, y) {
      var text = washValueText(x, y)
      if (text === "") return null
      var place = projection().unproject(x, y)
      if (!place) return null
      var names = I18n.directionNames(panel.interfaceLanguage)
      var where = Math.round(Math.abs(place.lat)) + "° " + names[place.lat >= 0 ? 0 : 4] + " "
        + Math.round(Math.abs(place.lon)) + "° " + names[place.lon >= 0 ? 2 : 6]
      return { x: x, y: y, text: text + " · " + where }
    }
    // The wash's value at a point of the view in its unit ("12 °C",
    // "35 km/h"), or "" (the numbers overlay prints these too).
    // The colour layers' values at a point of the view: { kind: value }
    // (NaN where unknown), or null off the globe.
    function washValues(x, y) {
      if (!wash.visible) return null
      var place = projection().unproject(x, y)
      if (!place) return null
      var result = {}
      var on = wash.layers
      for (var i = 0; i < on.length; i++) {
        var pair = wash.lattices[on[i]]
        var value = NaN
        if (pair && pair.region) value = GlobeGrid.latticeValue(pair.region, place.lat, place.lon)
        if (pair && !isFinite(value)) value = GlobeGrid.latticeValue(pair.global, place.lat, place.lon)
        result[on[i]] = isFinite(value) ? value : NaN
      }
      return result
    }
    // A layer's value in its unit ("12 °C", "35 km/h"); `bare` the number
    // alone (the legend carries the unit).
    function layerValueText(kind, value, bare) {
      var unit = function(text) { return bare ? "" : " " + text }
      if (kind === "temperature" || kind === "sst") {
        return panel.tempScale === "fahrenheit" ? Math.round(value * 1.8 + 32) + unit("°F")
          : (panel.tempScale === "kelvin" ? Math.round(value + 273.15) + unit("K") : Math.round(value) + unit("°C"))
      }
      if (kind === "cloud") return Math.round(value) + unit("%")
      if (kind === "wind") {
        var wind = Model.windValue(value, panel.windUnitFor(panel.useImperial))
        return wind ? panel.localizedNumber(wind.value) + unit(wind.unit) : ""
      }
      return panel.useImperial ? panel.localizedNumber(Math.round(value / 25.4 * 100) / 100) + unit("in/h")
        : panel.localizedNumber(Math.round(value * 10) / 10) + unit("mm/h")
    }
    // The pointer's text: the topmost layer with a value there
    // (GlobeFields.topLayer: rain where it rains, then the temperatures, the
    // wind, the cloud) and, when it rains, the next one before it ("12 °C ·
    // 1.2 mm/h"); `bare` for the numbers overlay: the first number alone.
    function washValueText(x, y, bare) {
      var values = washValues(x, y)
      if (!values) return ""
      var on = wash.layers
      var top = GlobeFields.topLayer(on, values)
      if (top === "") return ""
      if (bare) return layerValueText(top, values[top], true)
      var text = layerValueText(top, values[top], false)
      if (top === "precipitation") {
        var rest = on.filter(function(kind) { return kind !== "precipitation" })
        var second = GlobeFields.topLayer(rest, values)
        if (second !== "") text = layerValueText(second, values[second], false) + " · " + text
      }
      return text
    }
    // A gust symbol or a bolt under the pointer: "Gusts 86 km/h",
    // "Thunderstorm".
    function symbolHover(x, y) {
      var near = Style.space(10)
      var list = overlay.gusts
      for (var i = 0; i < list.length; i++) {
        if (Math.hypot(list[i].x + shiftX - x, list[i].y + shiftY - y) > near) continue
        var wind = Model.windValue(list[i].gust, panel.windUnitFor(panel.useImperial))
        return { x: x, y: y, text: panel.i18n("globeGusts", { value: wind ? panel.localizedNumber(wind.value) + " " + wind.unit : "" }) }
      }
      var bolts = overlay.bolts
      for (var j = 0; j < bolts.length; j++)
        if (Math.hypot(bolts[j].x + shiftX - x, bolts[j].y + shiftY - y) <= near)
          return { x: x, y: y, text: panel.i18n("globeThunderstorm") }
      return null
    }
    readonly property var washPalettes: wash.palettes
    // The wind's height and its scale end (Model.WIND_LEVELS).
    readonly property string windHeight: String(panel.displaySetting("globeWindLevel", "10m"))
    readonly property real windScaleKmh: Model.windLevel(windHeight).scaleKmh
    // The thunderstorms' colour: UV-high's accent, a third of the way to
    // the text; the text without accents.
    readonly property color thunderColor: {
      var accent = panel.uvAccent(7)
      if (!accent) return panel.foreground
      var c = Qt.color(accent), ink = panel.foreground
      return Qt.rgba(c.r + (ink.r - c.r) * 0.35, c.g + (ink.g - c.g) * 0.35, c.b + (ink.b - c.b) * 0.35, 1)
    }
    readonly property Item canvasItem: canvas
    readonly property Item surfaceItem: surface
    readonly property Item overlayItem: overlay
    // My places' and the towns' labels drawn last (the overlay avoids them).
    property var labelRects: []
    readonly property Item streaksItem: streaks
    readonly property Item washItem: wash
    // The colour wash shown (Settings → Display → Globe, or v).
    readonly property var washLayers: panel.globeData.washLayers
    onWidthChanged: canvas.requestPaint()
    onHeightChanged: canvas.requestPaint()
    onShowMoonChanged: canvas.requestPaint()

    // Where the markers and the moon were drawn, for clicks and the hover.
    property var markerHits: []
    property var moonHit: null
    property var hover: null
    property var pointer: null
    property bool dragging: false

    // ---- Turning by itself (as in More Time), on the whole disc only:
    //      after the set delay without a touch it turns east about the
    //      poles, keeping the tilt, one turn in the set minutes, only while
    //      it can be seen; a press, drag, wheel or key stops it.
    property bool rotating: false
    // On screen: the section within the page's view, checked once a second
    // while turning by itself is on.
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
    readonly property bool canRotate: autoRotate && !isMap && zoom <= 1 && panel.globeShown && panel.motionAllowed && onScreen
      && !mouse.pressed && !panel.globeData.playing
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
    // As many frames a second as chosen (Settings → Display → Globe, 15 by
    // default); the turn advances by the time elapsed.
    readonly property int rotateFps: Number(panel.displaySetting("globeRotateFps", "15")) || 15
    Timer {
      id: rotateTimer
      interval: Math.round(1000 / Math.max(1, globe.rotateFps))
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

    // Close up, a drag moves the finished picture by this much until the
    // release draws it anew.
    property real shiftX: 0
    property real shiftY: 0

    // ---- The surface on the GPU (GLOBE-SHADER.md): up to z2, where the
    //      shader can run, the sphere's fill, the land, the colour layers
    //      and the night come from an equirectangular texture projected per
    //      pixel; turning then only changes uniforms. From z3, and wherever
    //      shaders cannot run (the software scene graph of the offscreen
    //      harness), the Canvas path below draws them as before.
    readonly property bool gpuWanted: surface.available && zoom < 3
    // Kept on after leaving until the Canvas picture is painted, so the
    // hand-over at z2/z3 never shows a frame without the surface's parts.
    property bool gpuHandover: false
    readonly property bool gpuSurface: gpuWanted || gpuHandover
    onGpuWantedChanged: {
      if (gpuWanted) { gpuHandover = false; return }
      gpuHandover = true
      canvas.requestPaint()
      wash.requestPaint()
      handoverTimer.restart()
    }
    Timer {
      id: handoverTimer
      // Two frames after the Canvas path has drawn.
      interval: 50
      onTriggered: globe.gpuHandover = false
    }
    // The texture's lattices settle for 80 ms, so the answers for several
    // layers repaint it once.
    property var textureLattices: ({})
    Timer {
      id: textureSettle
      interval: 80
      onTriggered: globe.textureLattices = globe.panel.globeData.lattices
    }
    Connections {
      target: globe.panel.globeData
      function onLatticesChanged() { textureSettle.restart() }
    }
    WeatherGlobeTexture {
      id: surfaceTexture
      visible: false
      enabled: surface.available
      // Smaller while the timeline plays, so a step costs less.
      textureWidth: globe.panel.globeData.playing ? 720 : 1024
      textureHeight: globe.panel.globeData.playing ? 360 : 512
      layers: surface.available ? globe.panel.globeData.washLayers : []
      lattices: globe.textureLattices
      landMask: globe.panel.globeData.landMask
      scaleKmh: globe.windScaleKmh
      palettes: wash.palettes
      landColor: globe.landColor
      landData: globe.landData
    }
    // The land's fill (Canvas path and texture alike): faint, but opaque
    // when the sea's temperature shows without the air's.
    readonly property color landColor: {
      var layers = washLayers, ink = panel.foreground, surfaceBg = Color.popups.background
      if (layers.indexOf("sst") < 0 || layers.indexOf("temperature") >= 0) return Qt.rgba(ink.r, ink.g, ink.b, 0.08)
      return Qt.rgba(surfaceBg.r * 0.92 + ink.r * 0.08, surfaceBg.g * 0.92 + ink.g * 0.08, surfaceBg.b * 0.92 + ink.b * 0.08, 1)
    }
    readonly property var surfaceCentre: isMap ? GlobeProjection.mapCentre(centerLat, centerLon, width, height, zoom)
      : ({ lat: centerLat, lon: centerLon })
    WeatherGlobeSurface {
      id: surface
      x: globe.shiftX
      y: globe.shiftY
      width: globe.width
      height: globe.height
      visible: globe.gpuSurface
      style: globe.isMap ? "map" : "globe"
      centerLat: globe.surfaceCentre.lat
      centerLon: globe.surfaceCentre.lon
      zoom: globe.zoom
      radius: globe.radius
      centerX: globe.centerX
      centerY: globe.centerY
      displayMs: globe.minuteMs
      night: globe.showNight
      background: Color.popups.background
      baseColor: globe.isMap ? "transparent" : Qt.rgba(globe.panel.foreground.r, globe.panel.foreground.g,
        globe.panel.foreground.b, 0.04)
      textureSource: surfaceTexture
    }

    // ---- What the globe costs, for the IPC status (Panel.providerStatus):
    //      every 5 s while shown, the frames drawn (the surface's, else the
    //      Canvas's) and the shell process's CPU time from /proc/self/stat.
    property var perf: ({ surface: false, fps: 0, cpuMsPerFrame: 0, cpuPercent: 0, textureMs: 0 })
    property var perfLast: null
    property var turningHistory: []
    property FileView procStat: FileView {
      path: "/proc/self/stat"
      blockLoading: true
      printErrors: false
    }
    Timer {
      interval: 5000
      repeat: true
      running: globe.panel.globeShown
      onRunningChanged: globe.perfLast = null
      onTriggered: {
        globe.procStat.reload()
        var text = String(globe.procStat.text() || "")
        var fields = text.slice(text.lastIndexOf(")") + 2).split(" ")
        // utime and stime (fields 14 and 15), in ticks of 10 ms.
        var cpuMs = (Number(fields[11]) + Number(fields[12])) * 10
        var frames = globe.gpuSurface ? surface.frames : globe.paintStats.count
        var now = Date.now()
        var last = globe.perfLast
        if (last && isFinite(cpuMs) && now > last.at) {
          var dFrames = Math.max(0, frames - last.frames), dCpu = cpuMs - last.cpu, dt = now - last.at
          // Windows spent turning by itself from start to end: the last 60 s
          // of them kept, so the numbers outlast the turning.
          var history = globe.turningHistory
          if (last.turning && globe.rotating) {
            history = history.concat([{ dt: dt, frames: dFrames, cpu: dCpu, surface: globe.gpuSurface }])
            var total = 0
            for (var h = history.length - 1; h >= 0; h--) {
              total += history[h].dt
              if (total > 60000) { history = history.slice(h + 1); break }
            }
            globe.turningHistory = history
          }
          var tDt = 0, tFrames = 0, tCpu = 0
          for (var k = 0; k < history.length; k++) {
            tDt += history[k].dt
            tFrames += history[k].frames
            tCpu += history[k].cpu
          }
          globe.perf = { surface: globe.gpuSurface, fps: Math.round(dFrames / dt * 10000) / 10,
            cpuMsPerFrame: dFrames ? Math.round(dCpu / dFrames * 10) / 10 : 0,
            cpuPercent: Math.round(dCpu / dt * 1000) / 10, textureMs: surfaceTexture.stats.last || 0,
            turning: { seconds: Math.round(tDt / 1000), fps: tDt ? Math.round(tFrames / tDt * 10000) / 10 : 0,
              cpuPercent: tDt ? Math.round(tCpu / tDt * 1000) / 10 : 0,
              cpuMsPerFrame: tFrames ? Math.round(tCpu / tFrames * 10) / 10 : 0,
              surface: history.length ? history[history.length - 1].surface : globe.gpuSurface } }
        }
        globe.perfLast = { at: now, cpu: cpuMs, frames: frames, turning: globe.rotating }
      }
    }

    // The sphere's faint fill, under the wash (the globe's only; the
    // surface has its own).
    Rectangle {
      visible: !globe.isMap && !globe.gpuSurface
      x: globe.shiftX + globe.centerX - globe.radius
      y: globe.shiftY + globe.centerY - globe.radius
      width: 2 * globe.radius
      height: width
      radius: globe.radius
      color: Qt.rgba(globe.panel.foreground.r, globe.panel.foreground.g, globe.panel.foreground.b, 0.04)
    }

    // The weather's colour layers from the model (WeatherGlobeData), under
    // the land, the night and the places, ending at the rim.
    WeatherGlobeWash {
      id: wash
      x: globe.shiftX
      y: globe.shiftY
      width: globe.width
      height: globe.height
      panel: globe.panel
      globe: globeSection.view
      layers: globe.panel.globeData.washLayers
      lattices: globe.panel.globeData.lattices
      landMask: globe.panel.globeData.landMask
      cells: globe.panel.standaloneMode ? 128 : 96
      scaleKmh: globe.windScaleKmh
      // The surface draws the layers while it shows.
      suspended: globe.gpuWanted && !globe.gpuHandover
    }

    Canvas {
      id: canvas
      x: globe.shiftX
      y: globe.shiftY
      width: globe.width
      height: globe.height
      property color ink: globe.panel.foreground
      property color accent: Color.accent
      property color surface: Color.popups.background
      onInkChanged: requestPaint()
      onAccentChanged: requestPaint()

      function rgba(color, alpha) {
        return Qt.rgba(color.r, color.g, color.b, alpha)
      }
      // The land's fill: faint, but opaque when the sea's temperature shows
      // without the air's (it has values only at sea).
      function landFill() {
        return globe.landColor
      }
      // Globe.js gives y to the north round the centre; the canvas wants
      // pixels downwards.
      function trace(ctx, xy, close) {
        ctx.moveTo(globe.centerX + xy[0], globe.centerY - xy[1])
        for (var i = 2; i < xy.length; i += 2) ctx.lineTo(globe.centerX + xy[i], globe.centerY - xy[i + 1])
        if (close) ctx.closePath()
      }
      // The projection of the frame being painted (GlobeProjection).
      property var proj: null
      function disc(ctx) {
        proj.traceEarth(ctx)
      }
      function screenPoint(lat, lon) {
        return proj.project(lat, lon)
      }
      // A point list in map units ({ x, y } or flat [x, y, ...]) as a path.
      function traceMap(ctx, points, close) {
        var flatList = typeof points[0] === "number"
        var n = flatList ? points.length / 2 : points.length
        for (var i = 0; i < n; i++) {
          var mx = flatList ? points[i * 2] : points[i].x, my = flatList ? points[i * 2 + 1] : points[i].y
          var sx = proj.toScreenX(mx), sy = proj.toScreenY(my)
          if (i === 0) ctx.moveTo(sx, sy)
          else ctx.lineTo(sx, sy)
        }
        if (close) ctx.closePath()
      }

      onPaint: {
        var started = Date.now()
        var ctx = getContext("2d")
        ctx.reset()
        var R = globe.radius
        if (R <= 0) return
        var P = globe.projection()
        canvas.proj = P
        // The surface on the GPU draws the fills (land, night) up to z2.
        var gpu = globe.gpuWanted && !globe.gpuHandover
        var flat = P.kind === "map"
        var m = flat ? null : P.matrix
        var zoom = globe.zoom
        var detail = zoom >= 3 && !globe.moving && Basemap.loaded()

        ctx.save()
        disc(ctx)
        ctx.clip()

        // Meridians and parallels, finer when zoomed in.
        ctx.strokeStyle = rgba(ink, 0.07)
        ctx.lineWidth = 1
        ctx.beginPath()
        if (flat) {
          var graticule = globe.mapGraticule(GlobeView.gridStep(zoom))
          for (var gl = 0; gl < graticule.length; gl++) traceMap(ctx, graticule[gl], false)
        } else if (zoom <= 2) {
          var lines = Globe.gridLinesView(m, R, 15)
          for (var g = 0; g < lines.length; g++) trace(ctx, lines[g], false)
        } else {
          traceGrid(ctx, m, GlobeView.gridStep(zoom))
        }
        ctx.stroke()

        // Land: a light fill and a crisp coastline.
        if (detail) {
          paintBasemap(ctx, m)
        } else if (flat) {
          // The flat map's land: rings in map units (EqualEarth.ringToMap);
          // the fill is the surface's while it shows.
          var mapRings = globe.mapLand || []
          if (!gpu) {
            ctx.beginPath()
            for (var mr = 0; mr < mapRings.length; mr++) traceMap(ctx, mapRings[mr].fill, true)
            ctx.fillStyle = landFill()
            ctx.fillRule = Qt.OddEvenFill
            ctx.fill()
          }
          ctx.beginPath()
          for (var ml = 0; ml < mapRings.length; ml++)
            for (var mc = 0; mc < mapRings[ml].lines.length; mc++) traceMap(ctx, mapRings[ml].lines[mc], false)
          ctx.strokeStyle = rgba(ink, 0.5)
          ctx.lineWidth = 0.8
          ctx.stroke()
        } else {
          var rings = (globe.moving || zoom >= 3 ? globe.coarseLand : globe.land) || []
          if (rings.length) {
            // The fill is the surface's while it shows.
            if (!gpu) {
              ctx.beginPath()
              for (var r = 0; r < rings.length; r++) {
                var polys = Globe.frontPolygonsView(rings[r], m, R)
                for (var p = 0; p < polys.length; p++) trace(ctx, polys[p], true)
              }
              ctx.fillStyle = landFill()
              ctx.fillRule = Qt.OddEvenFill
              ctx.fill()
            }
            ctx.beginPath()
            for (var l = 0; l < rings.length; l++) {
              var coast = Globe.frontLinesView(rings[l], m, R)
              for (var c = 0; c < coast.length; c++) trace(ctx, coast[c], false)
            }
            ctx.strokeStyle = rgba(ink, 0.5)
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
        var landDone = Date.now()

        // Night in three steps (civil, nautical, then night): caps round
        // the point opposite the sun, 90° + the elevation wide.
        // On the flat map each cap is one polygon in map units
        // (EqualEarth.twilightPolygon), filled even-odd within the outline.
        var sky = globe.sky
        var caps = {}
        // The surface draws the night while it shows.
        for (var e = 0; e < (gpu ? 0 : sky.elevations.length); e++) {
          var elevation = sky.elevations[e]
          caps[elevation] = flat ? [globe.mapTwilight(elevation)]
            : Globe.capPolygonView(sky.anti.lat, sky.anti.lon, 90 + elevation, m, R)
        }
        ctx.fillRule = Qt.OddEvenFill
        for (var t = 0; t < (gpu ? 0 : sky.layers.length); t++) {
          var layer = sky.layers[t]
          var areas = caps[layer.high].concat(layer.low !== null ? caps[layer.low] : [])
          if (!areas.length) continue
          ctx.beginPath()
          for (var q = 0; q < areas.length; q++) {
            if (flat) traceMap(ctx, areas[q], true)
            else trace(ctx, areas[q], true)
          }
          ctx.fillStyle = Qt.rgba(layer.fill.r, layer.fill.g, layer.fill.b, layer.fill.a)
          ctx.fill()
        }
        var sun = screenPoint(sky.sun.lat, sky.sun.lon)
        if (globe.showNight && sun.visible) Sky.paintSun(ctx, sun.x, sun.y, rgba(globe.panel.sunColor, 0.95))
        // The moon floats above its sub-lunar point, its shadow on the
        // surface; on the whole disc only, hidden behind the globe.
        var moon = zoom <= 1 ? sky.moon : null
        var moonAt = moon ? screenPoint(moon.lat, moon.lon) : null
        if (moon && moonAt.visible && !flat) Moon.paintMoonShadow(ctx, moonAt.x, moonAt.y, globe.moonRadius)
        ctx.restore()

        globe.moonHit = null
        if (moon && moonAt.visible) {
          // Above the globe, a little out from its point; on the map at it.
          var mx = flat ? moonAt.x : globe.centerX + (moonAt.x - globe.centerX) * 1.15
          var my = flat ? moonAt.y : globe.centerY + (moonAt.y - globe.centerY) * 1.15
          // Lit towards the sun as seen from space, or as the shown place
          // sees its phase (Settings → Display → Globe: Moon).
          var angle = Moon.moonLitAngleFor(globe.moonStyle, moon,
            Moon.moonLitAngle(moon, sky.sun, function(lat, lon) { return screenPoint(lat, lon) }),
            panel.mapCenterLatitude)
          Moon.paintMoon(ctx, mx, my, globe.moonRadius, angle, moon.illuminated, "238,236,226",
            Moon.rgbText(Sky.nightFill(globe.rgbOf(Color.popups.background))), Moon.rgbText(ink))
          globe.moonHit = { x: mx, y: my, moon: moon }
        }

        ctx.strokeStyle = rgba(ink, 0.35)
        ctx.lineWidth = 1
        disc(ctx)
        ctx.stroke()
        var skyDone = Date.now()

        var taken = paintMarkers(ctx, m)
        if (detail) paintTowns(ctx, m, taken)
        // The overlay's labels keep clear of these.
        globe.labelRects = taken
        mouse.updateHover()
        var done = Date.now()
        var st = globe.paintStats
        globe.paintStats = { count: st.count + 1, total: st.total + done - started, max: Math.max(st.max, done - started),
          land: (st.land || 0) + landDone - started, sky: (st.sky || 0) + skyDone - landDone,
          places: (st.places || 0) + done - skyDone }
      }

      // From z3: meridians and parallels every `step` degrees, only those
      // in view, sampled finely.
      function traceGrid(ctx, m, step) {
        var box = GlobeView.visibleBounds(globe.centerLat, Globe.wrapLon(globe.centerLon), globe.radius, width, height)
        var sample = step / 4
        function line(points) {
          var drawing = false
          for (var i = 0; i < points.length; i += 2) {
            var p = Globe.projectView(points[i], points[i + 1], m, globe.radius)
            if (!p.visible) { drawing = false; continue }
            var x = globe.centerX + p.x, y = globe.centerY - p.y
            if (drawing) ctx.lineTo(x, y)
            else ctx.moveTo(x, y)
            drawing = true
          }
        }
        var lat, lon, pts
        for (lon = Math.floor(box.west / step) * step; lon <= box.east; lon += step) {
          pts = []
          for (lat = box.south; lat <= box.north + sample; lat += sample) pts.push(Math.min(90, lat), lon)
          line(pts)
        }
        for (lat = Math.ceil(box.south / step) * step; lat <= box.north; lat += step) {
          if (Math.abs(lat) >= 90) continue
          pts = []
          for (lon = box.west; lon <= box.east + sample; lon += sample) pts.push(lat, lon)
          line(pts)
        }
      }

      // From z3, at rest: land, lakes, the coast and the borders between
      // countries from the basemap's 5° cells in view, each point projected
      // through the view; points closer than 0.7 px to the last one drawn
      // are left out, and edges along a cell's border (where a polygon was
      // cut) are never stroked.
      function paintBasemap(ctx, m) {
        var R = globe.radius
        var box = proj.box()
        var flatMap = proj.kind === "map"
        var cellDeg = 5
        var keys = []
        var firstRow = Math.max(0, Math.floor((box.south + 90) / cellDeg))
        var lastRow = Math.min(180 / cellDeg - 1, Math.floor((box.north + 90) / cellDeg))
        var firstCol = Math.floor((box.west + 180) / cellDeg)
        var lastCol = Math.floor((box.east + 180) / cellDeg)
        for (var row = firstRow; row <= lastRow; row++)
          for (var col = firstCol; col <= lastCol; col++) keys.push(row + "_" + (((col % 72) + 72) % 72))
        var cx = globe.centerX, cy = globe.centerY

        function trace(flat, south, west, close, skipEdges) {
          var x = 0, y = 0
          var lastX = NaN, lastY = NaN
          var pen = false
          var edge = cellDeg * 1000
          var n = flat.length
          var firstSx = NaN, firstSy = NaN
          for (var i = 0; i <= n; i += 2) {
            var closing = i === n
            if (closing && !close) break
            var nx, ny
            if (closing) { nx = flat[0]; ny = flat[1] } else if (i === 0) { nx = flat[0]; ny = flat[1] } else { nx = x + flat[i]; ny = y + flat[i + 1] }
            var cut = i > 0 && skipEdges && ((x === nx && (x === 0 || x === edge)) || (y === ny && (y === 0 || y === edge)))
            // Through the projection; on the flat map every point counts
            // (the view clips), on the globe only the front.
            var front = proj.at(south + ny / 1000, west + nx / 1000) || flatMap
            var sx = proj.x, sy = proj.y
            x = nx
            y = ny
            if (!front) { pen = false; continue }
            if (!pen || cut) {
              ctx.moveTo(sx, sy)
              pen = true
              lastX = sx
              lastY = sy
              continue
            }
            if (!closing && Math.abs(sx - lastX) + Math.abs(sy - lastY) < 0.7 && i + 2 < n) continue
            ctx.lineTo(sx, sy)
            lastX = sx
            lastY = sy
          }
        }
        function eachCell(layer, visit) {
          for (var k = 0; k < keys.length; k++) {
            var data = Basemap.cell(keys[k])
            if (!data || !data[layer]) continue
            var parts = keys[k].split("_")
            visit(data[layer], Number(parts[0]) * cellDeg - 90, Number(parts[1]) * cellDeg - 180)
          }
        }
        function outline(layer, style, lineWidth) {
          ctx.strokeStyle = style
          ctx.lineWidth = lineWidth
          ctx.beginPath()
          eachCell(layer, function(features, south, west) {
            for (var f = 0; f < features.length; f++)
              for (var r = 0; r < features[f].length; r++) trace(features[f][r], south, west, true, true)
          })
          ctx.stroke()
        }
        function stroke(layer, style, lineWidth) {
          ctx.strokeStyle = style
          ctx.lineWidth = lineWidth
          ctx.beginPath()
          eachCell(layer, function(lines, south, west) {
            for (var l = 0; l < lines.length; l++) trace(lines[l], south, west, false, false)
          })
          ctx.stroke()
        }
        ctx.fillRule = Qt.OddEvenFill
        ctx.lineJoin = "round"
        ctx.lineCap = "round"
        // Land with its lakes as holes: one even-odd path.
        ctx.beginPath()
        ;["land", "lakes"].forEach(function(layer) {
          eachCell(layer, function(features, south, west) {
            for (var f = 0; f < features.length; f++)
              for (var r = 0; r < features[f].length; r++) {
                trace(features[f][r], south, west, false, false)
                ctx.closePath()
              }
          })
        })
        ctx.fillStyle = landFill()
        ctx.fill()
        outline("lakes", rgba(ink, 0.35), 0.7)
        outline("land", rgba(ink, 0.5), 0.8)
        stroke("admin0", rgba(ink, 0.45), 1)
      }

      // Each place as a dot with "symbol name 12°" beside it (from z3 with
      // its wind when there is room), the shown place in the accent colour
      // and drawn first, so its label always gets a spot; a label that would
      // cover another goes elsewhere or stays out. Returns the taken spots.
      function paintMarkers(ctx, m) {
        var taken = []
        var hits = []
        var fontPx = Style.font.caption
        var labelFont = globe.panel.canvasFont(fontPx, false, false)
        var boldFont = globe.panel.canvasFont(fontPx, true, false)
        var list = globe.markers.slice(0).sort(function(a, b) { return (b.active ? 1 : 0) - (a.active ? 1 : 0) })
        for (var k = 0; k < list.length; k++) {
          var place = list[k]
          var p = screenPoint(place.lat, place.lon)
          // Behind the globe or out of view: not drawn, not clickable.
          if (!p.visible || p.x < -20 || p.y < -20 || p.x > width + 20 || p.y > height + 20) continue
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
          var labels = globe.zoom >= 3 && place.wind ? [label + " · " + place.wind, label] : [label]
          ctx.font = place.active ? boldFont : labelFont
          var labelColor = place.muted ? rgba(ink, 0.45) : (place.active ? accent : ink)
          for (var v = 0; v < labels.length; v++)
            if (placeLabel(ctx, labels[v], p, 8, fontPx, taken, labelColor)) break
        }
        globe.markerHits = hits
        return taken
      }

      // A label beside a point: right, left, above or below, the first spot
      // free of the taken ones and inside the view. True when drawn.
      function placeLabel(ctx, label, p, gap, fontPx, taken, color) {
        var w = ctx.measureText(label).width + 6
        var h = fontPx + 4
        var spots = [
          { x: p.x + gap, y: p.y - h / 2 }, { x: p.x - gap - w, y: p.y - h / 2 },
          { x: p.x - w / 2, y: p.y - gap - h }, { x: p.x - w / 2, y: p.y + gap }
        ]
        for (var s = 0; s < spots.length; s++) {
          var rect = { x: spots[s].x, y: spots[s].y, w: w, h: h }
          if (rect.x < 0 || rect.x + w > width || rect.y < 0 || rect.y + h > height) continue
          var free = true
          for (var i = 0; i < taken.length && free; i++) {
            var o = taken[i]
            if (rect.x < o.x + o.w && rect.x + rect.w > o.x && rect.y < o.y + o.h && rect.y + rect.h > o.y) free = false
          }
          if (!free) continue
          taken.push(rect)
          ctx.fillStyle = Qt.rgba(surface.r, surface.g, surface.b, 0.78)
          ctx.fillRect(rect.x, rect.y, w, h)
          ctx.fillStyle = color
          ctx.textAlign = "left"
          ctx.textBaseline = "middle"
          ctx.fillText(label, rect.x + 3, rect.y + h / 2 + 0.5)
          return true
        }
        return false
      }

      // From z3: Natural Earth's towns in view, the larger first, round
      // my places' labels.
      function paintTowns(ctx, m, taken) {
        var box = proj.box()
        var towns = Basemap.placesIn(box.west, box.east, box.south, box.north)
        towns.sort(function(a, b) { return (b.population || 0) - (a.population || 0) })
        var fontPx = Style.font.caption
        ctx.font = globe.panel.canvasFont(fontPx, false, false)
        var drawn = 0
        for (var i = 0; i < towns.length && drawn < 40; i++) {
          var town = towns[i]
          var p = screenPoint(town.latitude, town.longitude)
          if (!p.visible || p.x < 0 || p.y < 0 || p.x > width || p.y > height) continue
          var before = taken.length
          if (!placeLabel(ctx, town.name, p, 5, fontPx, taken, rgba(ink, 0.7))) continue
          taken.splice(before, 0, { x: p.x - 3, y: p.y - 3, w: 6, h: 6 })
          ctx.fillStyle = rgba(ink, 0.7)
          ctx.beginPath()
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2)
          ctx.fill()
          drawn++
        }
      }
    }

    // A drag turns and tilts the globe (at z2 and closer the picture moves
    // and is drawn anew on release, as on the radar map); a double click
    // zooms in at the pointer; a click on a place shows it; the resting
    // pointer names the place or the moon under it.
    // The model's overlays: wind streaks, then isobars, gusts and numbers,
    // then the thunderstorms' bolts (a pool of items, each flashing now and
    // then by itself while the globe is in view).
    WeatherGlobeStreaks {
      id: streaks
      x: globe.shiftX
      y: globe.shiftY
      width: globe.width
      height: globe.height
      panel: globe.panel
      globe: globeSection.view
      running: globe.panel.globeShown && globe.panel.motionAllowed && globe.onScreen && globe.panel.globeData.streaksOn
      uLattice: globe.panel.globeData.streaksOn && globe.panel.globeData.layers ? globe.panel.globeData.layers.u || null : null
      vLattice: globe.panel.globeData.streaksOn && globe.panel.globeData.layers ? globe.panel.globeData.layers.v || null : null
      scaleKmh: globe.windScaleKmh
      coloured: globe.panel.globeData.windMode === "lines"
    }
    WeatherGlobeOverlay {
      id: overlay
      x: globe.shiftX
      y: globe.shiftY
      width: globe.width
      height: globe.height
      panel: globe.panel
      globe: globeSection.view
      layers: globe.panel.globeData.layers
      isobars: globe.panel.globeData.isobarsOn
      storms: globe.panel.globeData.stormsOn
      numbers: globe.panel.displaySetting("globeNumbers", false) === true
      valueAt: function(x, y) { return globe.washValueText(x, y, true) }
    }
    Repeater {
      model: 24
      // lightning-bolt, the Nerd Font's Material glyph, in the
      // thunderstorm accent (UV-high, softened towards the text) with a
      // halo of the page's colour; a size above the place markers' glyphs
      // for the strongest. It rests steady and flashes briefly now and
      // then, each on its own random 8–20 s, while the globe is in view
      // and neither dragged nor playing.
      Text {
        id: bolt
        required property int index
        readonly property var place: index < overlay.bolts.length ? overlay.bolts[index] : null
        readonly property bool mayFlash: visible && globe.panel.globeShown && globe.panel.motionAllowed && globe.onScreen
          && !globe.dragging
          && !globe.panel.globeData.playing
        textFormat: Text.PlainText
        visible: !!place
        x: (place ? place.x : 0) + globe.shiftX - width / 2
        y: (place ? place.y : 0) + globe.shiftY - height / 2
        text: "\u{f140b}"
        font.family: globe.panel.fontFamily
        font.pixelSize: Math.round(Style.font.caption * (place && place.strength >= 2 ? 1.35 : 1.15))
        color: globe.thunderColor
        style: Text.Outline
        styleColor: Qt.rgba(Color.popups.background.r, Color.popups.background.g, Color.popups.background.b, 0.85)
        onMayFlashChanged: if (!mayFlash) { flash.stop(); opacity = 1 }
        Timer {
          interval: 4000 + ((bolt.index * 2797) % 12000) + Math.random() * 4000
          running: bolt.mayFlash
          repeat: true
          onTriggered: {
            flash.start()
            interval = 8000 + Math.random() * 12000
          }
        }
        SequentialAnimation {
          id: flash
          NumberAnimation { target: bolt; property: "opacity"; to: 0.35; duration: 50 }
          NumberAnimation { target: bolt; property: "opacity"; to: 1; duration: 60 }
          NumberAnimation { target: bolt; property: "opacity"; to: 0.35; duration: 50 }
          NumberAnimation { target: bolt; property: "opacity"; to: 1; duration: 90 }
        }
      }
    }

    MouseArea {
      id: mouse
      anchors.fill: parent
      hoverEnabled: true
      preventStealing: true
      cursorShape: globe.dragging ? Qt.ClosedHandCursor : Qt.OpenHandCursor
      property real pressX: 0
      property real pressY: 0
      property real pressLat: 0
      property real pressLon: 0

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
        if (marker) {
          globe.hover = { x: p.x, y: p.y, text: [marker.name,
            marker.temperature !== "" ? marker.temperature + " " + globe.panel.tempUnit : "", marker.symbol]
            .filter(function(part) { return !!part }).join(" · ") }
          return
        }
        // A storm's symbol, else the wash's value under the pointer, with
        // the place.
        globe.hover = globe.symbolHover(p.x, p.y) || globe.washHover(p.x, p.y)
      }
      function dragTo(x, y) {
        if (globe.isMap) {
          // The map follows the pointer, within its extent.
          var start = GlobeProjection.mapCentre(pressLat, pressLon, globe.width, globe.height, globe.zoom)
          var at = EqualEarth.project(start.lat, start.lon)
          var s = GlobeProjection.mapScale(globe.width, globe.height, globe.zoom)
          var back = EqualEarth.unproject(at.x - (x - pressX) / s, at.y + (y - pressY) / s)
          if (!back) return { lat: globe.centerLat, lon: globe.centerLon }
          return GlobeProjection.mapCentre(back.lat, back.lon, globe.width, globe.height, globe.zoom)
        }
        return GlobeView.panned(pressLat, pressLon, x - pressX, y - pressY, globe.radius)
      }

      onPressed: function(event) {
        globe.touched()
        turnAnimation.stop()
        pressX = event.x
        pressY = event.y
        pressLat = globe.centerLat
        pressLon = globe.centerLon
        globe.dragging = false
      }
      onPositionChanged: function(event) {
        if (pressed) {
          if (!globe.dragging && Math.abs(event.x - pressX) + Math.abs(event.y - pressY) > Style.space(4)) globe.dragging = true
          if (globe.dragging) {
            if (globe.zoom >= 2) {
              globe.shiftX = event.x - pressX
              globe.shiftY = event.y - pressY
            } else {
              var centre = dragTo(event.x, event.y)
              globe.centerLat = centre.lat
              globe.centerLon = centre.lon
            }
          }
          globe.hover = null
          return
        }
        globe.pointer = { x: event.x, y: event.y }
        updateHover()
      }
      onReleased: function(event) {
        if (globe.dragging && globe.zoom >= 2) {
          var centre = dragTo(event.x, event.y)
          globe.shiftX = 0
          globe.shiftY = 0
          globe.centerLat = centre.lat
          globe.centerLon = centre.lon
        }
        if (globe.dragging) {
          globe.dragging = false
          canvas.requestPaint()
        }
      }
      onCanceled: {
        canvas.x = 0
        canvas.y = 0
        globe.dragging = false
        canvas.requestPaint()
      }
      onExited: {
        globe.pointer = null
        globe.hover = null
      }
      onClicked: function(event) {
        var marker = markerAt(event.x, event.y)
        if (!marker) return
        globe.turnTo(globe.zoom >= 2 ? marker.lat : null, marker.lon)
        // The place becomes the shown one, the globe stays in view.
        if (marker.index >= 0 && !marker.active)
          globe.panel.selectSavedLocation(globe.panel.savedLocations[marker.index])
      }
      onDoubleClicked: function(event) {
        if (markerAt(event.x, event.y)) return
        globe.zoomAt(1, event.x - globe.centerX, event.y - globe.centerY)
      }
    }

    // The page routes wheels (Panel.routeWheel): Ctrl + wheel zooms towards
    // the pointer; a sideways one (a touchpad swipe, a tilting wheel, Shift
    // with the wheel) turns the globe; a plain one scrolls the page and says
    // how to zoom.
    readonly property bool wheelEnabled: true
    property real wheelAccumulated: 0
    function wantsWheel(wheel) {
      return (wheel.modifiers & Qt.ControlModifier) !== 0 || panel.wheelIsSideways(wheel)
    }
    function declineWheel(wheel) {
      zoomHint.opacity = 1
      zoomHintTimer.restart()
    }
    function takeWheel(wheel, point) {
      touched()
      if ((wheel.modifiers & Qt.ControlModifier) !== 0) {
        // Touchpads send small steps: a level per notch's worth.
        wheelAccumulated += wheel.angleDelta.y
        if (Math.abs(wheelAccumulated) < 120) return true
        var delta = wheelAccumulated > 0 ? 1 : -1
        wheelAccumulated = 0
        var at = point || { x: centerX, y: centerY }
        zoomAt(delta, at.x - centerX, at.y - centerY)
        return true
      }
      turnAnimation.stop()
      var centre = GlobeView.panned(centerLat, centerLon, panel.wheelSidewaysPixels(wheel), 0, radius)
      centerLon = centre.lon
      return true
    }

    // "Ctrl + wheel to zoom", briefly, when a plain wheel passes over it.
    Rectangle {
      id: zoomHint
      anchors.centerIn: parent
      width: zoomHintText.implicitWidth + Style.space(16)
      height: zoomHintText.implicitHeight + Style.space(8)
      radius: Style.cornerRadius
      color: Color.popups.background
      border.color: Color.popups.border
      border.width: Style.spacing.hairline
      opacity: 0
      visible: opacity > 0
      Behavior on opacity { NumberAnimation { duration: 180 } }
      Text {
        id: zoomHintText
        textFormat: Text.PlainText
        anchors.centerIn: parent
        text: globe.panel.i18n("mapZoomHint")
        color: Color.popups.text
        font.family: globe.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
    Timer {
      id: zoomHintTimer
      interval: 1400
      onTriggered: zoomHint.opacity = 0
    }

    // Back to the place (keeping the zoom), zoom out, zoom in.
    BorderSurface {
      anchors.top: parent.top
      anchors.right: parent.right
      anchors.margins: Style.space(8)
      width: zoomRow.implicitWidth + Style.space(10)
      height: Style.space(28)
      radius: Style.cornerRadius
      color: Color.popups.background
      borderSpec: Border.surfaceSpec("popups", "border", Color.popups.border, Style.normalBorderWidth)

      Row {
        id: zoomRow
        anchors.centerIn: parent
        spacing: Style.space(2)

        Repeater {
          model: [
            { glyph: "󰆤", action: "recenter", enabled: true },
            { glyph: "−", action: "out", enabled: globe.zoom > 0 },
            { glyph: "+", action: "in", enabled: globe.zoom < 5 }
          ]

          BorderSurface {
            id: zoomButton
            required property var modelData
            width: Style.space(22)
            height: Style.space(20)
            radius: Style.cornerRadius
            enabled: modelData.enabled
            opacity: enabled ? 1 : 0.38
            color: Style.controlFill(false, buttonMouse.containsMouse, Color.popups.text, Color.accent)
            borderSpec: Border.controlSpec(buttonMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

            Text {
              textFormat: Text.PlainText
              anchors.centerIn: parent
              text: zoomButton.modelData.glyph
              color: buttonMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : Color.popups.text
              font.family: globe.panel.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: true
            }

            MouseArea {
              id: buttonMouse
              anchors.fill: parent
              enabled: parent.enabled
              hoverEnabled: true
              cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
              onClicked: {
                var action = zoomButton.modelData.action
                if (action === "recenter") globe.recenter()
                else globe.zoomBy(action === "in" ? 1 : -1)
              }
            }
          }
        }
      }
    }

    PanelToolTip {
      visible: !!globe.hover
      x: globe.hover ? globe.hover.x + Style.space(12) : 0
      y: globe.hover ? globe.hover.y + Style.space(12) : 0
      text: globe.hover ? globe.hover.text : ""
      fontFamily: globe.panel.fontFamily
    }
  }

  // The forecast timeline, while a data layer shows (Settings → Display →
  // Globe: Timeline).
  WeatherGlobeTimeline {
    width: parent.width
    panel: globeSection.panel
    visible: globeSection.panel.displaySetting("globeTimeline", true) === true && globeSection.panel.globeData.active
  }

  WeatherGlobeLegend {
    panel: globeSection.panel
    globe: globeSection.view
  }
}
