import QtQuick
import "Globe.js" as Globe
import "GlobeView.js" as GlobeView
import "GlobeStreaks.js" as GlobeStreaks

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
    var b = GlobeView.visibleBounds(globe.centerLat, Globe.wrapLon(globe.centerLon), globe.radius, width, height)
    var west = b.west, east = b.east
    // On the whole disc, the front half.
    if (east - west >= 359) {
      west = globe.centerLon - 90
      east = globe.centerLon + 90
    }
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
    // About 20 px a second at 10 m/s near the ground, whatever the zoom.
    var scale = 20 * 6371000 / (10 * Math.max(1, R)) * 100 / Math.max(10, scaleKmh)
    var segments = GlobeStreaks.step(particles, uLattice, vLattice, 0.066, scale, box)
    var m = Globe.viewMatrix(globe.centerLat, Globe.wrapLon(globe.centerLon))
    var cx = globe.centerX, cy = globe.centerY
    ctx.strokeStyle = "rgba(255,255,255,0.85)"
    ctx.lineWidth = 1.1
    ctx.beginPath()
    for (var i = 0; i < segments.length; i++) {
      var s = segments[i]
      var a = Globe.projectView(s[0], s[1], m, R)
      var b = Globe.projectView(s[2], s[3], m, R)
      if (!a.visible || !b.visible) continue
      ctx.moveTo(cx + a.x, cy - a.y)
      ctx.lineTo(cx + b.x, cy - b.y)
    }
    ctx.stroke()
    var spent = Date.now() - started
    stats = { count: stats.count + 1, total: stats.total + spent, max: Math.max(stats.max, spent) }
  }
}
