import QtQuick

WeatherRadarFrame {
  id: frame
  required property var panel
  required property var frameData
  required property var viewport
  readonly property int paintMode: frameData.fixture ? 1 : frameData.rainViewer || frameData.wmsProvider ? 0 : 2
  fillMode: Image.PreserveAspectCrop
  store: panel.mapImages
  remoteUrl: panel.radarFrameUrl(frameData)
  sourceMode: paintMode
  treatment: panel.radarTreatment
  weakReturns: panel.radarWeakReturns
}
