import QtQuick
import "Model.js" as Model

// JMA radar over the regular radar map in Japan. JMA publishes its radar
// only as Web Mercator tiles, so this layer sits apart from the frame
// pipeline: the timeline, playback and loading stay those of the frames
// underneath (RainViewer there), and for the frame on screen this layer shows
// the JMA picture of the nearest time, as a mosaic of tiles placed at their
// true extent. Until all tiles of that time are loaded the frame underneath
// stays visible, so a slow tile never leaves a gap.
Item {
  id: jmaLayer
  required property var panel
  // The view's cropped map picture (Model.mapViewport), for placing tiles.
  required property var viewport

  readonly property bool active: panel.jmaRadarActive
  readonly property var times: active
    ? panel.regionalNowcast.jmaObserved.concat(panel.regionalNowcast.jmaForecast) : []
  readonly property var tiles: active
    ? Model.jmaTilesFor(panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth, panel.mapCenterLatitude) : []

  visible: active

  // JMA time for a frame: the nearest within half a step either side.
  function timeFor(timestamp) {
    var target = new Date(timestamp).getTime()
    if (!isFinite(target)) return null
    var best = null
    for (var i = 0; i < times.length; ++i) {
      var gap = Math.abs(times[i].ms - target)
      if (gap <= 7.5 * 60 * 1000 && (best === null || gap < Math.abs(best.ms - target))) best = times[i]
    }
    return best
  }

  Repeater {
    model: jmaLayer.active ? jmaLayer.panel.radarFrames : []

    Item {
      id: frameLayer
      required property var modelData
      required property int index
      readonly property var time: jmaLayer.timeFor(modelData.timestamp)
      property int readyCount: 0
      readonly property bool complete: time !== null && jmaLayer.tiles.length > 0 && readyCount >= jmaLayer.tiles.length
      anchors.fill: parent
      visible: index === jmaLayer.panel.radarDisplayedFrameIndex && complete

      Repeater {
        model: frameLayer.time ? jmaLayer.tiles : []

        WeatherRemoteImage {
          required property var modelData
          readonly property var northWest: Model.mapPoint(jmaLayer.viewport, modelData.north, modelData.west,
            jmaLayer.panel.mapWest, jmaLayer.panel.mapEast, jmaLayer.panel.mapSouth, jmaLayer.panel.mapNorth)
          readonly property var southEast: Model.mapPoint(jmaLayer.viewport, modelData.south, modelData.east,
            jmaLayer.panel.mapWest, jmaLayer.panel.mapEast, jmaLayer.panel.mapSouth, jmaLayer.panel.mapNorth)
          property bool counted: false
          x: northWest.x
          y: northWest.y
          width: southEast.x - northWest.x
          height: southEast.y - northWest.y
          // Stretched to the tile's extent; Mercator's bend within one tile
          // is far below a pixel at these sizes.
          fillMode: Image.Stretch
          smooth: false
          store: jmaLayer.panel.mapImages
          remoteUrl: Model.jmaTileUrl(frameLayer.time, modelData.z, modelData.x, modelData.y)
          load: jmaLayer.panel.radarFrameLoadAllowed(frameLayer.index)
          onStatusChanged: {
            if (status === Image.Ready && !counted) {
              counted = true
              frameLayer.readyCount++
            }
          }
          Component.onCompleted: if (status === Image.Ready && !counted) {
            counted = true
            frameLayer.readyCount++
          }
          Component.onDestruction: if (counted) frameLayer.readyCount--
        }
      }
    }
  }
}
