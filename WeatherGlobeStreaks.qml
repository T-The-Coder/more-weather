import QtQuick
import "Globe.js" as Globe
import "GlobeView.js" as GlobeView
import "GlobeStreaks.js" as GlobeStreaks
import "GlobeFields.js" as GlobeFields

// The wind on the globe as drifting streaks (Settings → Display → Globe):
// about 300 particles in the part of the earth in view, moved by the
// model's wind (GlobeStreaks.step on the u/v lattices the worker builds)
// and drawn as short white segments on a canvas that fades a little each
// frame, so each leaves a trail, as in the wind map (WeatherWindField).
// Runs every 66 ms only while shown and not dragged; a turn or zoom wipes
// the trails, a zoom seeds the particles anew.
Canvas {
  id: streaks
  required property var panel
  required property Item globe
  property var uLattice: null
  property var vLattice: null
  // The height's scale end (km/h): aloft the particles move by the same
  // share of it, so a jet stream does not race.
  property real scaleKmh: 100
  property bool running: true
  // Lines alone carry the speed: coloured on the wind scale (softened
  // towards white); over the wind's colour they stay white.
  property bool coloured: false
  readonly property int count: 300
  property var particles: []
  property var box: null
  // What its frames cost (the screenshot harness reads it).
  property var stats: ({ count: 0, total: 0, max: 0 })

  renderTarget: Canvas.FramebufferObject
  renderStrategy: Canvas.Cooperative
  visible: !!uLattice && !!vLattice

  // The part of the earth in view, with longitudes within ±180 (null: all).
  function viewBox() {
    var b = globe.projection().box()
    var west = b.west, east = b.east
    // On the whole disc, the front half (the flat map shows it all).
    if (east - west >= 359 && !globe.isMap) {
      west = globe.centerLon - 90
      east = globe.centerLon + 90
    }
    if (east - west >= 359) return { south: b.south, north: b.north, west: -180, east: 179.99 }
    return { south: b.south, north: b.north, west: Globe.wrapLon(west), east: Globe.wrapLon(east) }
  }
  function reseed() {
    box = viewBox()
    particles = GlobeStreaks.seed(count, box)
    wipe = true
    requestPaint()
  }
  property bool wipe: false
  // A turn: the trails go, the particles stay; those now out of view are
  // seeded in it again as they move (GlobeStreaks.step).
  function viewChanged() {
    wipe = true
    if (!visible) return
    box = viewBox()
    // Drawn with the next tick, not with every frame of a turn.
    if (!tick.running) requestPaint()
  }
  // New wind (another time step) moves the particles on; they are seeded
  // only when there are none.
  onULatticeChanged: if (!particles.length) reseed()
  onVisibleChanged: if (visible) reseed()

  Timer {
    id: tick
    interval: 66
    repeat: true
    running: streaks.running && streaks.visible && !streaks.globe.dragging
    onTriggered: streaks.requestPaint()
  }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    if (wipe) {
      ctx.clearRect(0, 0, width, height)
      wipe = false
    } else {
      // Fade what was drawn, leaving trails.
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.14)"
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = "source-over"
    }
    if (!uLattice || !vLattice || !particles.length) return
    var R = globe.radius
    // Within the earth's edge, like the colour layers.
    var P = globe.projection()
    ctx.save()
    P.traceEarth(ctx)
    ctx.clip()
    // About 20 px a second at 10 m/s near the ground, whatever the zoom
    // (the map's pixels per radian near the centre about its scale).
    var pxPerRadian = P.kind === "map" ? P.scale : R
    var scale = 20 * 6371000 / (10 * Math.max(1, pxPerRadian)) * 100 / Math.max(10, scaleKmh)
    var segments = GlobeStreaks.step(particles, uLattice, vLattice, 0.066, scale, box)
    ctx.lineWidth = 1.1
    // One path per colour band (eight along the scale), so a frame strokes
    // a handful of paths, not a path per particle.
    var bands = coloured ? 8 : 1
    var paths = []
    for (var k = 0; k < bands; k++) paths.push([])
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i]
      var band = coloured ? Math.max(0, Math.min(bands - 1, Math.floor(s[4] * 3.6 / Math.max(10, scaleKmh) * bands))) : 0
      paths[band].push(s)
    }
    for (var b = 0; b < bands; b++) {
      if (!paths[b].length) continue
      if (coloured) {
        var rgb = GlobeFields.windColor((b + 0.5) / bands)
        ctx.strokeStyle = Qt.rgba((rgb[0] + (255 - rgb[0]) * 0.35) / 255, (rgb[1] + (255 - rgb[1]) * 0.35) / 255,
          (rgb[2] + (255 - rgb[2]) * 0.35) / 255, 0.9)
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.85)"
      }
      ctx.beginPath()
      strokeSegments(ctx, P, paths[b])
      ctx.stroke()
    }
    ctx.restore()
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent) }
  }
  function strokeSegments(ctx, P, list) {
    for (var i = 0; i < list.length; i++) {
      var s = list[i]
      if (!P.at(s[0], s[1])) continue
      var ax = P.x, ay = P.y
      if (!P.at(s[2], s[3])) continue
      // Not across the map's ±180° edge.
      if (Math.abs(P.x - ax) > 40 || Math.abs(P.y - ay) > 40) continue
      ctx.moveTo(ax, ay)
      ctx.lineTo(P.x, P.y)
    }
  }
}
