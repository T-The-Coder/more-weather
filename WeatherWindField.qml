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
// a pixel per cell and scaled up smoothly; the streaks are drawn on the
// graphics card from the same lattice (shaders/windstreaks.frag), so the
// animation costs almost no processor time. It runs only while `running`.
Item {
  id: field
  required property var panel
  // The view's cropped map picture (Model.mapViewport).
  required property var viewport
  property var samples: panel.windMapData
  property bool running: true
  // Over the dark satellite picture the wash can be stronger.
  property real washOpacity: 0.55

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
  function colorAt(kmh) {
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
    vectors.requestPaint()
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
  // The field's vectors as a small texture for the shader: east and south
  // components in red and green, 0.5 for calm, 0 and 1 for 120 km/h.
  Canvas {
    id: vectors
    width: field.columns
    height: field.rows
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var data = field.lattice
      if (!data) return
      for (var r = 0; r < field.rows; ++r) {
        for (var c = 0; c < field.columns; ++c) {
          var at = (r * field.columns + c) * 3
          var red = Math.round(Math.max(0, Math.min(255, (0.5 + data.cells[at] / 240) * 255)))
          var green = Math.round(Math.max(0, Math.min(255, (0.5 + data.cells[at + 1] / 240) * 255)))
          ctx.fillStyle = "rgb(" + red + "," + green + ",0)"
          // Opaque and a little larger than a pixel, as in the wash.
          ctx.fillRect(c, r, 1.6, 1.6)
        }
      }
    }
  }
  ShaderEffectSource {
    id: vectorTexture
    sourceItem: vectors
    hideSource: true
    smooth: true
    width: 1
    height: 1
    visible: false
  }

  Image {
    id: dotsImage
    source: "data/wind-dots.png"
    smooth: true
  }
  ShaderEffectSource {
    id: dotsTexture
    sourceItem: dotsImage
    hideSource: true
    smooth: true
    width: 1
    height: 1
    visible: false
  }

  // The streaks, drawn on the graphics card (shaders/windstreaks.frag); the
  // only work here is moving `phase` along, once a second round. Fifteen
  // steps a second rather than an animation's sixty: each step redraws the
  // whole window, which is what the animation costs.
  ShaderEffect {
    id: streaks
    anchors.fill: parent
    visible: field.lattice !== null
    property var vectorField: vectorTexture
    property var dots: dotsTexture
    property real phase: 0
    property size viewSize: Qt.size(width, height)
    fragmentShader: "shaders/windstreaks.frag.qsb"
  }
  Timer {
    interval: 66
    repeat: true
    running: field.running && field.visible && field.lattice !== null
    onTriggered: streaks.phase = (streaks.phase + interval / 1000) % 1
  }
}
