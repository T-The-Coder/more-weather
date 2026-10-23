// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import qs.Commons
import "RadarStyle.js" as RadarStyle
import "Model.js" as Model

Item {
  id: frame
  property alias store: picture.store
  property alias remoteUrl: picture.remoteUrl
  property alias load: picture.load
  property alias source: picture.source
  property alias status: picture.status
  property alias fillMode: picture.fillMode
  property alias smooth: picture.smooth
  property alias byteLimit: picture.byteLimit
  property int sourceMode: 0
  property int treatment: 1
  property bool weakReturns: false
  property var swatches
  property rect sourceWindow: Qt.rect(0, 0, 1, 1)
  property point tileLatitudes: Qt.point(0, 0)
  readonly property bool mercatorTile: tileLatitudes.x > tileLatitudes.y
  property point cellOrigin: Qt.point(x, y)
  readonly property real cellSize: 3 * Math.max(1, Style.font.baseSize / 12)
  readonly property bool software: GraphicsInfo.api === GraphicsInfo.Software
  readonly property rect sampleRect: {
    var iw = picture.sourceSize.width, ih = picture.sourceSize.height
    if (fillMode === Image.Stretch || iw < 1 || ih < 1) return sourceWindow
    var factor = Math.max(width / iw, height / ih)
    var u = width / (iw * factor), v = height / (ih * factor)
    return Qt.rect((1 - u) / 2, (1 - v) / 2, u, v)
  }
  signal failed()
  onWidthChanged: if (visible && software && sourceMode > 0) settle.restart()
  onHeightChanged: if (visible && software && sourceMode > 0) settle.restart()
  // Canvas can become available after the initial layout paint request.
  // Repaint once after settling, including when the map is resized.
  Timer {
    id: settle
    interval: 60
    running: frame.visible && frame.software && frame.status === Image.Ready
    onTriggered: { decoder.requestPaint(); cpu.requestPaint() }
  }
  WeatherRemoteImage {
    id: picture
    anchors.fill: parent
    smooth: false
    // Shader samples the Image's native texture directly. No enlarged layer
    // capture, downscaled intermediate, interpolation or mipmaps.
    visible: frame.sourceMode === 0
    onFailed: frame.failed()
  }
  WeatherRadarPaint {
    anchors.fill: parent
    visible: !frame.software && frame.sourceMode > 0 && frame.status === Image.Ready
    source: picture
    swatches: frame.swatches
    sourceMode: frame.sourceMode
    treatment: frame.treatment
    weakBelow: frame.weakReturns ? -32 : 5
    cellSize: frame.cellSize
    cellOrigin: frame.cellOrigin
    sampleRect: frame.sampleRect
    mercator: frame.mercatorTile ? 1 : 0
    latitudes: Qt.point(frame.tileLatitudes.x + frame.sampleRect.y * (frame.tileLatitudes.y - frame.tileLatitudes.x),
      frame.tileLatitudes.x + (frame.sampleRect.y + frame.sampleRect.height) * (frame.tileLatitudes.y - frame.tileLatitudes.x))
    mercatorEdges: frame.mercatorTile ? Qt.point(Model.radarMercatorY(frame.tileLatitudes.x), Model.radarMercatorY(frame.tileLatitudes.y)) : Qt.point(0, 1)
  }
  // Software renderer: read the native image once, then address native
  // pixels with integer indices. Never draw a resized radar image to sample it.
  Canvas {
    id: decoder
    visible: false
    width: Math.max(1, picture.sourceSize.width)
    height: Math.max(1, picture.sourceSize.height)
    property string loaded: ""
    property var pixelsData: null
    property var key: [frame.source, frame.status, width, height]
    onKeyChanged: if (frame.software && frame.sourceMode > 0 && frame.visible) requestPaint()
    onImageLoaded: requestPaint()
    onAvailableChanged: if (available) requestPaint()
    onPaint: {
      var url = String(frame.source)
      if (loaded !== url) { if (loaded) unloadImage(loaded); loaded = url; pixelsData = null }
      if (!url || frame.status !== Image.Ready || width > Model.RADAR_WMS_MAX_SIDE || height > Model.RADAR_WMS_MAX_SIDE) return
      if (!isImageLoaded(url)) { loadImage(url); return }
      var ctx = getContext("2d")
      ctx.reset(); ctx.drawImage(url, 0, 0, width, height)
      pixelsData = ctx.getImageData(0, 0, width, height).data
      cpu.requestPaint()
    }
  }
  Canvas {
    id: cpu
    anchors.fill: parent
    smooth: false
    visible: frame.software && frame.sourceMode > 0
    property var key: [decoder.pixelsData, frame.visible, frame.treatment, frame.weakReturns, frame.sampleRect, frame.cellOrigin, frame.tileLatitudes, width, height]
    onKeyChanged: if (visible && frame.visible) requestPaint()
    onVisibleChanged: if (visible) requestPaint()
    onAvailableChanged: if (available && visible) requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.reset(); ctx.clearRect(0, 0, width, height)
      if (!decoder.pixelsData) { decoder.requestPaint(); return }
      var iw = decoder.width, ih = decoder.height, data = decoder.pixelsData, rect = frame.sampleRect
      RadarStyle.paintCells(ctx, width, height, frame.cellSize, frame.treatment, frame.weakReturns, function(x, y) {
        var sx = Math.max(0, Math.min(iw - 1, Math.floor((rect.x + x / width * rect.width) * iw)))
        var v = frame.mercatorTile ? Model.radarTileV(frame.tileLatitudes.x, frame.tileLatitudes.y, rect.y + y / height * rect.height) : rect.y + y / height * rect.height
        var sy = Math.max(0, Math.min(ih - 1, Math.floor(v * ih)))
        var at = (sy * iw + sx) * 4
        var value = RadarStyle.decode(data[at], data[at + 1], data[at + 2], data[at + 3], frame.sourceMode)
        return value
      }, frame.cellOrigin.x, frame.cellOrigin.y)
    }
  }
}
