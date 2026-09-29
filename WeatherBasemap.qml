import QtQuick
import QtQuick.Window
import Quickshell.Io
import qs.Commons
import "Basemap.js" as Basemap

// The drawn map under the radar and wind: land, lakes, towns, rivers and
// borders from Natural Earth (data/basemap.bin, built by
// tools/build-basemap.py, read through Basemap.js),
// in the theme's colours. After the Weather Radar plugin, whose tones this
// borrows: every colour is mixed between the popup's background and text, so
// the ground stays near the surface it sits on in light and dark themes.
//
// The picture reaches one view beyond each edge, so a drag moves a finished
// picture; it is drawn anew once the map settles. The Canvas is drawn at the
// screen's own pixel size and scaled down, which keeps thin lines sharp on a
// scaled screen.
Item {
  id: basemap
  required property var panel
  // The view's cropped map picture (Model.mapViewport) and its extent.
  required property var viewport
  property real west: panel.mapWest
  property real east: panel.mapEast
  property real south: panel.mapSouth
  property real north: panel.mapNorth

  readonly property int cellDegrees: 5
  readonly property string dataFile: String(Qt.resolvedUrl("data/basemap.bin")).replace(/^file:\/\//, "")

  // The drawn area: the view and one view on each side.
  readonly property real lonSpan: east - west
  readonly property real latSpan: north - south
  readonly property var neededCells: {
    var list = []
    if (!(lonSpan > 0) || !(latSpan > 0)) return list
    var firstRow = Math.floor((south - latSpan + 90) / cellDegrees)
    var lastRow = Math.floor((north + latSpan + 90) / cellDegrees)
    var firstCol = Math.floor((west - lonSpan + 180) / cellDegrees)
    var lastCol = Math.floor((east + lonSpan + 180) / cellDegrees)
    for (var row = Math.max(0, firstRow); row <= Math.min(35, lastRow); ++row)
      for (var col = firstCol; col <= lastCol; ++col)
        list.push(row + "_" + (((col % 72) + 72) % 72))
    return list
  }

  // Bumped when the file has been read; the cells come from Basemap.js,
  // which keeps the file and decoded cells for every map in this shell.
  property int loadedRevision: Basemap.loaded() ? 1 : 0

  readonly property color surface: Color.popups.background
  readonly property color ink: Color.popups.text
  function mix(amount) {
    return Qt.rgba(surface.r + (ink.r - surface.r) * amount, surface.g + (ink.g - surface.g) * amount,
      surface.b + (ink.b - surface.b) * amount, 1)
  }
  // Water carries a hint of the theme's blue.
  readonly property color water: panel.paletteColor ? panel.paletteColor("blue") : "#1e66f5"
  function tinted(color, amount) {
    return Qt.tint(color, Qt.rgba(water.r, water.g, water.b, amount))
  }
  readonly property color seaColor: tinted(mix(0.05), 0.12)
  readonly property color landColor: mix(0.13)
  readonly property color urbanColor: mix(0.21)
  readonly property color coastColor: mix(0.34)
  readonly property color riverColor: tinted(mix(0.24), 0.35)
  readonly property color admin1Color: mix(0.22)
  readonly property color admin0Color: mix(0.42)

  clip: false

  Rectangle {
    anchors.fill: parent
    color: basemap.seaColor
  }

  // The file is read once per shell; later maps find it in Basemap.js.
  FileView {
    path: basemap.loadedRevision === 0 ? basemap.dataFile : ""
    printErrors: false
    onLoaded: if (Basemap.load(data())) basemap.loadedRevision++
  }

  // Waits for the end of the event: the extent's four sides change one
  // after another.
  Timer {
    id: paintTimer
    interval: 0
    onTriggered: canvas.requestPaint()
  }
  onLoadedRevisionChanged: paintTimer.restart()
  onWestChanged: paintTimer.restart()
  onEastChanged: paintTimer.restart()
  onSouthChanged: paintTimer.restart()
  onNorthChanged: paintTimer.restart()
  onViewportChanged: paintTimer.restart()
  onSurfaceChanged: paintTimer.restart()
  onInkChanged: paintTimer.restart()
  onWaterChanged: paintTimer.restart()

  Canvas {
    id: canvas
    readonly property real ratio: Screen.devicePixelRatio || 1
    // Three views wide and high, at device pixels, scaled back down.
    x: -basemap.width
    y: -basemap.height
    width: basemap.width * 3 * ratio
    height: basemap.height * 3 * ratio
    scale: 1 / ratio
    transformOrigin: Item.TopLeft
    renderTarget: Canvas.FramebufferObject
    renderStrategy: Canvas.Cooperative

    onPaint: {
      var ctx = getContext("2d")
      ctx.reset()
      ctx.scale(ratio, ratio)
      ctx.fillStyle = String(basemap.seaColor)
      ctx.fillRect(0, 0, basemap.width * 3, basemap.height * 3)
      var view = basemap.viewport
      if (!view || !(basemap.lonSpan > 0) || !(basemap.latSpan > 0)) return
      // Degrees to canvas pixels: the view's own mapping, shifted by one
      // view into the canvas.
      var xScale = view.renderedWidth / basemap.lonSpan
      var yScale = view.renderedHeight / basemap.latSpan
      var xBase = basemap.width + view.offsetX - basemap.west * xScale
      var yBase = basemap.height + view.offsetY + basemap.north * yScale
      var keys = basemap.neededCells

      // A cell sits at its column's longitude nearest the view, so a view
      // across the date line draws the cells beyond it on the right side.
      function cellOrigin(key) {
        var parts = key.split("_")
        var row = Number(parts[0])
        var col = Number(parts[1])
        var lon = col * basemap.cellDegrees - 180
        var middle = (basemap.west + basemap.east) / 2
        while (lon + basemap.cellDegrees / 2 - middle > 180) lon -= 360
        while (lon + basemap.cellDegrees / 2 - middle < -180) lon += 360
        return { x: xBase + lon * xScale, y: yBase - (row * basemap.cellDegrees - 90) * yScale }
      }

      function trace(flat, origin, close, skipEdges) {
        var x = flat[0]
        var y = flat[1]
        var px = origin.x + x / 1000 * xScale
        var py = origin.y - y / 1000 * yScale
        ctx.moveTo(px, py)
        var edge = basemap.cellDegrees * 1000
        for (var i = 2; i < flat.length; i += 2) {
          var nx = x + flat[i]
          var ny = y + flat[i + 1]
          var qx = origin.x + nx / 1000 * xScale
          var qy = origin.y - ny / 1000 * yScale
          // An edge along the cell's border is where the polygon was cut,
          // not a coastline.
          if (skipEdges && ((x === nx && (x === 0 || x === edge)) || (y === ny && (y === 0 || y === edge))))
            ctx.moveTo(qx, qy)
          else
            ctx.lineTo(qx, qy)
          x = nx
          y = ny
        }
        if (close) {
          var fx = flat[0]
          var fy = flat[1]
          var closing = skipEdges && ((x === fx && (x === 0 || x === edge)) || (y === fy && (y === 0 || y === edge)))
          if (!closing) ctx.lineTo(origin.x + fx / 1000 * xScale, origin.y - fy / 1000 * yScale)
        }
      }

      function fillLayer(name, color) {
        ctx.fillStyle = String(color)
        for (var k = 0; k < keys.length; ++k) {
          var data = Basemap.cell(keys[k])
          if (!data || !data[name]) continue
          var origin = cellOrigin(keys[k])
          var features = data[name]
          for (var f = 0; f < features.length; ++f) {
            ctx.beginPath()
            for (var r = 0; r < features[f].length; ++r) {
              trace(features[f][r], origin, false, false)
              ctx.closePath()
            }
            ctx.fill()
          }
        }
      }

      function outlineLayer(name, color, lineWidth) {
        ctx.strokeStyle = String(color)
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        for (var k = 0; k < keys.length; ++k) {
          var data = Basemap.cell(keys[k])
          if (!data || !data[name]) continue
          var origin = cellOrigin(keys[k])
          var features = data[name]
          for (var f = 0; f < features.length; ++f)
            for (var r = 0; r < features[f].length; ++r) trace(features[f][r], origin, true, true)
        }
        ctx.stroke()
      }

      function strokeLayer(name, color, lineWidth) {
        ctx.strokeStyle = String(color)
        ctx.lineWidth = lineWidth
        ctx.beginPath()
        for (var k = 0; k < keys.length; ++k) {
          var data = Basemap.cell(keys[k])
          if (!data || !data[name]) continue
          var origin = cellOrigin(keys[k])
          var lines = data[name]
          for (var l = 0; l < lines.length; ++l) trace(lines[l], origin, false, false)
        }
        ctx.stroke()
      }

      // Holes (islands' lakes) are rings of their own: even-odd per feature.
      ctx.fillRule = Qt.OddEvenFill
      ctx.lineJoin = "round"
      ctx.lineCap = "round"
      fillLayer("land", basemap.landColor)
      fillLayer("lakes", basemap.seaColor)
      fillLayer("urban", basemap.urbanColor)
      strokeLayer("rivers", basemap.riverColor, 0.9)
      outlineLayer("lakes", basemap.coastColor, 0.8)
      outlineLayer("land", basemap.coastColor, 1)
      strokeLayer("admin1", basemap.admin1Color, 0.8)
      strokeLayer("admin0", basemap.admin0Color, 1.1)
    }
  }
}
