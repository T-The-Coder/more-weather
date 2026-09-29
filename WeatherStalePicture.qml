import QtQuick
import "Model.js" as Model

// A map picture from before the view moved, stretched over the rectangle it
// covered ({ source, extent: { west, east, south, north } }), until the
// picture for the new view has arrived.
Image {
  id: stale
  required property var panel
  required property var viewport
  property var picture: null
  readonly property var northWest: picture ? Model.mapPoint(viewport, picture.extent.north, picture.extent.west,
    panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth) : ({ x: 0, y: 0 })
  readonly property var southEast: picture ? Model.mapPoint(viewport, picture.extent.south, picture.extent.east,
    panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth) : ({ x: 0, y: 0 })
  source: picture ? picture.source : ""
  x: northWest.x
  y: northWest.y
  width: Math.max(0, southEast.x - northWest.x)
  height: Math.max(0, southEast.y - northWest.y)
  fillMode: Image.Stretch
  cache: true
  smooth: true
}
