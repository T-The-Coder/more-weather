import QtQuick
import "Model.js" as Model

// The wind as a flowing field, after RegenVorschau and Ventusky: the speed as
// a smooth colour wash from deep blue (calm) through cyan, green and yellow
// to red and violet (storm), and white streaks drifting with the wind,
// faster where it blows harder, each leaving a short fading trail.
//
// The 35 sampled points become a lattice of wind vectors once per data
// update (a Gaussian blend of the east and north components, as wide as the
// samples lie apart, so directions blend rather than jump and no point
// stands out as a blot); the colour wash is that lattice drawn
// a pixel per cell and scaled up smoothly, and the streaks read it
// bilinearly. The animation runs only while `running`.
Item {
  id: field
  required property var panel
  // The view's cropped map picture (Model.mapViewport).
  required property var viewport
  property var samples: panel.windMapData
  property bool running: true
  // Over the dark satellite picture the wash can be stronger.
  property real washOpacity: 0.55
  // Speed at the colour scale's end: winds aloft blow far harder than at
  // 10 m (Model.WIND_LEVELS), so the scale widens with the height.
  property real scaleKmh: 100

  readonly property int columns: 64
  readonly property int rows: Math.max(8, Math.round(columns * height / Math.max(1, width)))
  // Lattice: per cell the vector in km/h towards east (u) and south (v, the
  // screen's downward direction) and the speed.
  property var lattice: null

  // Colour scale in km/h; fixed like the radar's, since it carries data.
  readonly property var stops: [
    [0, [43, 31, 143]], [8, [58, 63, 216]], [16, [47, 127, 232]], [25, [34, 182, 216]],
    [35, [47, 201, 143]], [48, [182, 212, 58]], [62, [242, 179, 58]], [78, [232, 82, 58]],
    [100, [180, 58, 214]]
  ]
  function colorAt(speed) {
    var kmh = speed * 100 / scaleKmh
    var list = stops
    if (kmh <= list[0][0]) return list[0][1]
    for (var i = 1; i < list.length; ++i) {
      if (kmh > list[i][0]) continue
      var f = (kmh - list[i - 1][0]) / (list[i][0] - list[i - 1][0])
      var a = list[i - 1][1]
      var b = list[i][1]
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
    }
    return list[list.length - 1][1]
  }

  function rebuild() {
    var points = []
    var list = samples || []
    for (var s = 0; s < list.length; ++s) {
      var sample = list[s]
      var speed = Number(sample.windSpeed) || 0
      // Meteorological direction is where the wind comes from.
      var toward = ((Number(sample.windDirection) || 0) + 180) * Math.PI / 180
      var at = list.length > 1
        ? Model.mapPoint(viewport, sample.latitude, sample.longitude,
          panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
        : { x: width / 2, y: height / 2 }
      points.push({ x: at.x, y: at.y, u: Math.sin(toward) * speed, v: -Math.cos(toward) * speed })
    }
    if (!points.length || width <= 0 || height <= 0) {
      lattice = null
      return
    }
    // Blend width: about the samples' spacing, from the area they share.
    var spacing = Math.sqrt(width * height / points.length)
    var twoSigma2 = 2 * Math.pow(spacing * 0.7, 2)
    var cells = new Float32Array(columns * rows * 3)
    var cellWidth = width / (columns - 1)
    var cellHeight = height / (rows - 1)
    for (var r = 0; r < rows; ++r) {
      for (var c = 0; c < columns; ++c) {
        var x = c * cellWidth
        var y = r * cellHeight
        var weightSum = 0
        var u = 0
        var v = 0
        for (var p = 0; p < points.length; ++p) {
          var dx = points[p].x - x
          var dy = points[p].y - y
          var w = Math.exp(-(dx * dx + dy * dy) / twoSigma2) + 1e-9
          weightSum += w
          u += points[p].u * w
          v += points[p].v * w
        }
        u /= weightSum
        v /= weightSum
        var index = (r * columns + c) * 3
        cells[index] = u
        cells[index + 1] = v
        cells[index + 2] = Math.sqrt(u * u + v * v)
      }
    }
    lattice = { cells: cells, cellWidth: cellWidth, cellHeight: cellHeight }
    wash.requestPaint()
  }

  // The vector at a point of the view, bilinear between lattice cells.
  function windAt(x, y) {
    var data = lattice
    if (!data) return null
    var fx = Math.max(0, Math.min(columns - 1.001, x / data.cellWidth))
    var fy = Math.max(0, Math.min(rows - 1.001, y / data.cellHeight))
    var c = Math.floor(fx)
    var r = Math.floor(fy)
    var tx = fx - c
    var ty = fy - r
    var cells = data.cells
    var a = (r * columns + c) * 3
    var b = a + columns * 3
    var u = (cells[a] * (1 - tx) + cells[a + 3] * tx) * (1 - ty) + (cells[b] * (1 - tx) + cells[b + 3] * tx) * ty
    var v = (cells[a + 1] * (1 - tx) + cells[a + 4] * tx) * (1 - ty) + (cells[b + 1] * (1 - tx) + cells[b + 4] * tx) * ty
    return { u: u, v: v, speed: Math.sqrt(u * u + v * v) }
  }

  Timer {
    id: rebuildTimer
    interval: 0
    onTriggered: field.rebuild()
  }
  onSamplesChanged: rebuildTimer.restart()
  onScaleKmhChanged: rebuildTimer.restart()
  onViewportChanged: rebuildTimer.restart()
  onWidthChanged: rebuildTimer.restart()
  onHeightChanged: rebuildTimer.restart()
  Connections {
    target: field.panel
    function onMapWestChanged() { rebuildTimer.restart() }
    function onMapNorthChanged() { rebuildTimer.restart() }
  }

  // The colour wash: one pixel per lattice cell, scaled up with smoothing.
  Canvas {
    id: wash
    // Each pixel's centre on its lattice point.
    readonly property real cellWidth: field.width / Math.max(1, field.columns - 1)
    readonly property real cellHeight: field.height / Math.max(1, field.rows - 1)
    width: field.columns
    height: field.rows
    transform: Scale { xScale: wash.cellWidth; yScale: wash.cellHeight }
    x: -cellWidth / 2
    y: -cellHeight / 2
    smooth: true
    opacity: field.washOpacity
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var data = field.lattice
      if (!data) return
      // Opaque cells a little larger than a pixel, each covering the soft
      // edge of the one before: exact 1×1 cells overlap by fractions of a
      // pixel on a scaled screen and leave a lattice of blots.
      for (var r = 0; r < field.rows; ++r) {
        for (var c = 0; c < field.columns; ++c) {
          var rgb = field.colorAt(data.cells[(r * field.columns + c) * 3 + 2])
          ctx.fillStyle = "rgb(" + Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]) + ")"
          ctx.fillRect(c, r, 1.6, 1.6)
        }
      }
    }
  }

  // The streaks: particles that live a few seconds, move with the field and
  // are drawn as short segments on a canvas that fades a little each frame.
  // The streaks: particles that live a few seconds, move with the field and
  // are drawn as short segments on a canvas that fades a little each frame,
  // so each leaves a trail. The loop reads the lattice inline and makes no
  // objects: it runs for every particle fifteen times a second.
  Canvas {
    id: streaks
    anchors.fill: parent
    renderTarget: Canvas.FramebufferObject
    renderStrategy: Canvas.Cooperative
    property var particles: []
    readonly property int count: Math.round(Math.min(380, Math.max(100, field.width * field.height / 1000)))

    function spawn(particle) {
      particle.x = Math.random() * width
      particle.y = Math.random() * height
      particle.age = Math.floor(Math.random() * 80)
      return particle
    }

    onPaint: {
      var ctx = getContext("2d")
      var data = field.lattice
      if (!data) {
        ctx.clearRect(0, 0, width, height)
        return
      }
      if (particles.length !== count) {
        var list = []
        for (var n = 0; n < count; ++n) list.push(spawn({}))
        particles = list
      }
      // Fade what was drawn, leaving trails.
      ctx.globalCompositeOperation = "destination-out"
      ctx.fillStyle = "rgba(0,0,0,0.14)"
      ctx.fillRect(0, 0, width, height)
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = "rgba(255,255,255,0.85)"
      ctx.lineWidth = 1.1
      ctx.beginPath()
      var cells = data.cells
      var columns = field.columns
      var maxColumn = columns - 1.001
      var maxRow = field.rows - 1.001
      // About 2 px per frame (30 px a second) at 20 km/h near the ground;
      // aloft the same share of the scale, so a jet stream does not race.
      var step = 0.1 * 100 / field.scaleKmh
      for (var i = 0; i < particles.length; ++i) {
        var particle = particles[i]
        var fx = Math.max(0, Math.min(maxColumn, particle.x / data.cellWidth))
        var fy = Math.max(0, Math.min(maxRow, particle.y / data.cellHeight))
        var c = Math.floor(fx)
        var r = Math.floor(fy)
        var tx = fx - c
        var ty = fy - r
        var a = (r * columns + c) * 3
        var b = a + columns * 3
        var u = (cells[a] * (1 - tx) + cells[a + 3] * tx) * (1 - ty) + (cells[b] * (1 - tx) + cells[b + 3] * tx) * ty
        var v = (cells[a + 1] * (1 - tx) + cells[a + 4] * tx) * (1 - ty) + (cells[b + 1] * (1 - tx) + cells[b + 4] * tx) * ty
        var nx = particle.x + u * step
        var ny = particle.y + v * step
        particle.age++
        if (particle.age > 90 || nx < 0 || ny < 0 || nx > width || ny > height) {
          spawn(particle)
          particle.age = 0
          continue
        }
        ctx.moveTo(particle.x, particle.y)
        ctx.lineTo(nx, ny)
        particle.x = nx
        particle.y = ny
      }
      ctx.stroke()
    }
  }

  Timer {
    interval: 66
    repeat: true
    running: field.running && field.visible && field.lattice !== null
    onTriggered: streaks.requestPaint()
  }
}
