import QtQuick
import "Model.js" as Model

// One bounded native-tile mosaic. All tiles must be ready before presenting
// this frame; no partial mosaic is counted as the picture on screen.
Item {
  id: mosaic
  required property var panel
  required property var frameData
  required property var viewport
  property var swatches
  property bool load: true
  property int readiness: 0
  readonly property var tiles: Model.radarTilesFor(panel.radarVisibleBounds, panel.mapViewLatitude,
    viewport.pixelsPerKm, "rainviewer", panel.radarDeviceRatio)
  readonly property int status: {
    readiness
    if (!tiles.length || tileImages.count !== tiles.length) return Image.Loading
    for (var i = 0; i < tileImages.count; i++) {
      var image = tileImages.itemAt(i)
      if (!image || image.status !== Image.Ready) return Image.Loading
    }
    return Image.Ready
  }
  signal failed()
  Repeater {
    id: tileImages
    model: mosaic.tiles
    WeatherRadarFrame {
      required property var modelData
      readonly property var nw: Model.mapPoint(mosaic.viewport, modelData.north, modelData.west,
        mosaic.panel.mapWest, mosaic.panel.mapEast, mosaic.panel.mapSouth, mosaic.panel.mapNorth)
      readonly property var se: Model.mapPoint(mosaic.viewport, modelData.south, modelData.east,
        mosaic.panel.mapWest, mosaic.panel.mapEast, mosaic.panel.mapSouth, mosaic.panel.mapNorth)
      x: Math.max(0, nw.x); y: Math.max(0, nw.y)
      width: Math.max(0, Math.min(mosaic.width, se.x) - x)
      height: Math.max(0, Math.min(mosaic.height, se.y) - y)
      sourceWindow: Qt.rect((x - nw.x) / (se.x - nw.x), (y - nw.y) / (se.y - nw.y), width / (se.x - nw.x), height / (se.y - nw.y))
      tileLatitudes: Qt.point(modelData.north, modelData.south)
      fillMode: Image.Stretch
      sourceMode: 1
      swatches: mosaic.swatches
      treatment: mosaic.panel.radarTreatment
      weakReturns: mosaic.panel.radarWeakReturns
      store: mosaic.panel.mapImages
      remoteUrl: mosaic.frameData.fixture ? "fixture:radar-tile-" + modelData.z + "-" + modelData.x + "-" + modelData.y
        : Model.radarTileUrl(mosaic.frameData, modelData)
      byteLimit: Model.RADAR_TILE_MAX_BYTES
      load: mosaic.load
      onStatusChanged: mosaic.readiness++
      onFailed: mosaic.failed()

    }
  }
}
