import QtQuick

// The lines fixed on the earth for the GPU surface (WeatherGlobe.qml): the
// coasts of data/globe-land.json and the grid (meridians every 15°,
// parallels every 15°), as a flat equirectangular picture (longitude
// -180…180 across, latitude +90…-90 down), 2048 × 1024 so a one-pixel line
// stays crisp on the turning globe up to z2. A second WeatherGlobeSurface
// (no night, no base) projects it over the colour layers; painted once per
// change of the land or the colours, never per frame, so the Canvas no
// longer strokes coasts and grid while the globe turns.
// (The basemap's lakes and borders exist only from z3, where the Canvas
// path draws them anyway.)
Canvas {
  id: lines
  property int textureWidth: 2048
  property int textureHeight: 1024
  width: textureWidth
  height: textureHeight
  property var landData: null
  property color ink: "white"
  property bool grid: true
  // What its repaints cost (ms): { count, last }.
  property var stats: ({ count: 0, last: 0 })

  onLandDataChanged: requestPaint()
  onInkChanged: requestPaint()
  onWidthChanged: requestPaint()

  function tx(lon) { return (lon + 180) / 360 * width }
  function ty(lat) { return (90 - lat) / 180 * height }

  onPaint: {
    var started = Date.now()
    var ctx = getContext("2d")
    ctx.reset()
    ctx.clearRect(0, 0, width, height)
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    // The grid, as faint as the Canvas path's.
    if (grid) {
      ctx.strokeStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.07)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      for (var lon = -165; lon <= 180; lon += 15) {
        ctx.moveTo(tx(lon), 0)
        ctx.lineTo(tx(lon), height)
      }
      for (var lat = -75; lat <= 75; lat += 15) {
        ctx.moveTo(0, ty(lat))
        ctx.lineTo(width, ty(lat))
      }
      ctx.stroke()
    }
    // The coasts: each ring's edges, without those along ±180° or a pole
    // and those jumping across ±180° (seams of the data, not coast).
    var land = landData
    if (land && land.land) {
      var scale = land.scale || 100
      ctx.strokeStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.5)
      ctx.lineWidth = 1.7
      ctx.beginPath()
      for (var r = 0; r < land.land.length; r++) {
        var ring = land.land[r]
        var n = Math.floor(ring.length / 2)
        var pen = false
        for (var i = 0; i < n; i++) {
          var j = (i + 1) % n
          var lon0 = ring[i * 2] / scale, lat0 = ring[i * 2 + 1] / scale
          var lon1 = ring[j * 2] / scale, lat1 = ring[j * 2 + 1] / scale
          var seam = Math.abs(lon1 - lon0) > 180
            || (Math.abs(lat0) >= 89.99 && Math.abs(lat1) >= 89.99)
            || (Math.abs(lon0) >= 179.99 && Math.abs(lon1) >= 179.99 && lon0 * lon1 > 0)
          if (seam) { pen = false; continue }
          if (!pen) ctx.moveTo(tx(lon0), ty(lat0))
          ctx.lineTo(tx(lon1), ty(lat1))
          pen = true
        }
      }
      ctx.stroke()
    }
    stats = { count: stats.count + 1, last: Date.now() - started }
  }
}
