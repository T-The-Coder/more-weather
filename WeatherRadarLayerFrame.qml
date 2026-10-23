import QtQuick
import "Model.js" as Model

Item {
  id: frame
  required property var panel
  required property var frameData
  required property var viewport
  property var swatches
  property bool load: true
  readonly property bool tiled: !!frameData.rainViewer
  readonly property bool numeric: !frameData.rainViewer && !frameData.wmsProvider
  readonly property int status: numeric ? field.status : tiled ? tiles.status : picture.status
  readonly property url source: picture.source
  readonly property int fillMode: Image.Stretch
  readonly property int paintMode: frameData.rainViewer ? 1 : 0
  signal failed()
  signal rendered()
  Connections {
    target: frame.panel
    function onRadarViewReportChanged() { if (frame.numeric && frame.status === Image.Ready) frame.rendered() }
  }
  WeatherRadarTileFrame {
    id: tiles
    anchors.fill: parent
    panel: frame.panel
    frameData: frame.frameData
    viewport: frame.viewport
    swatches: frame.swatches
    load: frame.load && frame.tiled
    visible: frame.tiled && status === Image.Ready
    onFailed: frame.failed()
  }
  WeatherRadarFrame {
    id: picture
    anchors.fill: parent
    fillMode: Image.Stretch
    store: frame.panel.mapImages
    remoteUrl: frame.tiled || frame.numeric ? "" : frame.panel.radarFrameUrl(frame.frameData)
    sourceMode: frame.frameData.fixture ? 1 : 0
    swatches: frame.swatches
    treatment: frame.panel.radarTreatment
    weakReturns: frame.panel.radarWeakReturns
    load: frame.load && !frame.tiled && !frame.numeric
    visible: !frame.tiled && !frame.numeric
    onFailed: frame.failed()
  }
  WeatherDwdRadarField {
    id: field
    anchors.fill: parent
    panel: frame.panel
    timestamp: frame.numeric ? String(frame.frameData.timestamp) : ""
    swatches: frame.swatches
    visible: frame.numeric
  }
}
