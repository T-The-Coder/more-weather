import QtQuick

// The ground under the radar and wind maps: drawn in the theme's colours
// (WeatherBasemap), or the satellite picture for the view. Until the picture
// for a moved or zoomed view has arrived, the previous one stays at its old
// extent, so the map never blanks.
Item {
  id: ground
  required property var panel
  // The view's cropped map picture (Model.mapViewport).
  required property var viewport
  readonly property bool drawn: panel.mapStyle !== "satellite"
  property var stalePicture: null

  Connections {
    target: ground.panel
    // The satellite picture fills the view cropped: its extent is the map's.
    function onMapViewAboutToMove() {
      if (ground.drawn || satellite.status !== Image.Ready) return
      ground.stalePicture = {
        source: satellite.source,
        extent: { west: ground.panel.mapWest, east: ground.panel.mapEast,
          north: ground.panel.mapNorth, south: ground.panel.mapSouth }
      }
    }
  }

  WeatherBasemap {
    anchors.fill: parent
    visible: ground.drawn
    panel: ground.panel
    viewport: ground.viewport
  }
  WeatherStalePicture {
    picture: ground.stalePicture
    visible: !ground.drawn && satellite.status !== Image.Ready
    viewport: ground.viewport
    panel: ground.panel
  }
  WeatherRemoteImage {
    id: satellite
    anchors.fill: parent
    visible: !ground.drawn
    store: ground.panel.mapImages
    remoteUrl: ground.drawn ? "" : ground.panel.mapBasemapUrl
    onStatusChanged: if (status === Image.Ready) ground.stalePicture = null
  }
}
