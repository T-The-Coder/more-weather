import QtQuick
import "Globe.js" as Globe
import "GlobeRadar.js" as GlobeRadar
import "GlobeView.js" as GlobeView
import "EqualEarth.js" as EqualEarth

// The radar from z2 on the GPU (shaders/radar.frag): the view's radar
// tiles (WeatherGlobeRadar.raster) painted once into a picture of their
// longitude/latitude box at about the tiles' resolution, projected per
// fragment over the globe's surface like the earth's picture, so z2 is as
// sharp as the close-up views. Only where shaders run; elsewhere the wash
// draws the radar (WeatherGlobeWash).
Item {
  id: radarSurface
  property Item globe: null
  property var raster: null
  // The view's centre as the earth's surface uses it.
  property real centerLat: 0
  property real centerLon: 0
  readonly property bool available: GraphicsInfo.api !== GraphicsInfo.Software
  readonly property var box: GlobeRadar.rasterBox(raster, centerLon)
  // Repaints of the box picture (the screenshot harness and the motion log
  // read it).
  property int paints: 0

  readonly property var matrix: Globe.viewMatrix(centerLat, Globe.wrapLon(centerLon))
  readonly property bool flat: !!globe && globe.isMap
  readonly property var mapCentre: EqualEarth.project(centerLat, Globe.wrapLon(centerLon))

  // The box picture: each tile into its rectangle (equal latitude steps, a
  // plain stretch).
  Canvas {
    id: picture
    visible: false
    width: 1024
    height: 1024
    property var loadedSources: ({})
    onPaint: {
      var ctx = getContext("2d")
      ctx.reset()
      ctx.clearRect(0, 0, width, height)
      var b = radarSurface.box
      var r = radarSurface.raster
      if (!b || !r) return
      // Each tile from its picture file at full resolution, in strips of
      // equal latitude (web mercator to the box's plain degrees). Pictures
      // of tiles no longer shown are let go.
      var shown = {}
      for (var key0 in r.tiles) if (r.tiles[key0].source) shown[r.tiles[key0].source] = true
      for (var old in loadedSources) if (!shown[old]) unloadImage(old)
      loadedSources = shown
      for (var key in r.tiles) {
        var tile = r.tiles[key]
        if (!tile.source) continue
        if (!isImageLoaded(tile.source)) {
          loadImage(tile.source)
          continue
        }
        var rect = GlobeRadar.tileRect(tile.box, b, width, height)
        var parts = GlobeRadar.strips(tile.z, tile.y, 48, 512)
        for (var k = 0; k < parts.length; k++) {
          var part = parts[k]
          ctx.drawImage(tile.source, 0, part.sy, 512, part.sh,
            rect.x, rect.y + part.dy * rect.height, rect.width, part.dh * rect.height + 0.5)
        }
      }
      radarSurface.paints++
    }
    onPainted: capture.scheduleUpdate()
    onImageLoaded: requestPaint()
  }
  onRasterChanged: if (available) picture.requestPaint()

  ShaderEffectSource {
    id: capture
    sourceItem: picture
    hideSource: true
    live: false
    smooth: true
    mipmap: false
    textureSize: Qt.size(picture.width, picture.height)
    // Zero-sized but visible: a texture provider only.
    width: 0
    height: 0
  }

  ShaderEffect {
    anchors.fill: parent
    visible: radarSurface.available && !!radarSurface.box && !!radarSurface.globe
    blending: true
    fragmentShader: Qt.resolvedUrl("shaders/radar.frag.qsb")
    property var radar: capture
    property size itemSize: Qt.size(width, height)
    property point center: Qt.point(radarSurface.globe ? radarSurface.globe.centerX : 0, radarSurface.globe ? radarSurface.globe.centerY : 0)
    property real radius: Math.max(1, radarSurface.globe ? radarSurface.globe.radius : 1)
    property vector3d rowRight: Qt.vector3d(radarSurface.matrix[0], radarSurface.matrix[1], radarSurface.matrix[2])
    property vector3d rowUp: Qt.vector3d(radarSurface.matrix[3], radarSurface.matrix[4], radarSurface.matrix[5])
    property vector3d rowDepth: Qt.vector3d(radarSurface.matrix[6], radarSurface.matrix[7], radarSurface.matrix[8])
    property real flatMap: radarSurface.flat ? 1 : 0
    property real mapScale: Math.max(1e-6, Math.min(width / (2 * EqualEarth.X_MAX), height / (2 * EqualEarth.Y_MAX)))
      * Math.pow(2, GlobeView.clampZoom(radarSurface.globe ? radarSurface.globe.zoom : 0))
    property point mapCenter: Qt.point(radarSurface.mapCentre.x, radarSurface.mapCentre.y)
    property vector4d box: radarSurface.box
      ? Qt.vector4d(radarSurface.box.west, radarSurface.box.east, radarSurface.box.south, radarSurface.box.north)
      : Qt.vector4d(0, 1, 0, 1)
    onStatusChanged: if (status === ShaderEffect.Error) console.warn("more-weather: radar shader:", log)
  }
}
