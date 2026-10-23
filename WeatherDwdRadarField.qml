// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import qs.Commons
import "Model.js" as Model
import "RadarStyle.js" as RadarStyle

Item {
  id: field
  required property var panel
  property string timestamp: ""
  property var swatches
  readonly property var report: panel.radarViewReport
  readonly property var scan: {
    if (!report || !timestamp) return null
    for (var i = 0; i < report.radar.length; i++)
      if (Date.parse(report.radar[i].timestamp) === Date.parse(timestamp)) return report.radar[i]
    return null
  }
  readonly property int status: scan ? Image.Ready : Image.Loading
  readonly property real cellSize: 3 * Math.max(1, Style.font.baseSize / 12)
  readonly property bool software: GraphicsInfo.api === GraphicsInfo.Software
  Canvas {
    id: nativeGrid
    width: field.report ? field.report.cols : 1
    height: field.report ? field.report.rows : 1
    visible: !field.software
    property var scan: field.scan
    onScanChanged: requestPaint()
    onPainted: capture.scheduleUpdate()
    onAvailableChanged: if (available) requestPaint()
    onPaint: {
      if (!scan) return
      var ctx = getContext("2d"), img = ctx.createImageData(width, height)
      for (var y = 0; y < height; y++) for (var x = 0; x < width; x++) {
        var v = scan.precipitation_5[y][x], at = (y * width + x) * 4
        if (v === null || v <= 0) continue
        var code = Math.max(0, Math.min(12700, Math.round((RadarStyle.rateDbz(v * 0.12) + 32) * 100)))
        img.data[at] = code & 255; img.data[at + 1] = code >> 8; img.data[at + 3] = 255
      }
      ctx.putImageData(img, 0, 0)

    }
  }
  ShaderEffectSource {
    id: capture
    sourceItem: nativeGrid
    hideSource: true
    visible: false
    smooth: false
    mipmap: false
    live: false
    textureSize: Qt.size(nativeGrid.width, nativeGrid.height)
  }
  ShaderEffect {
    anchors.fill: parent
    visible: !field.software && !!field.scan
    property var source: capture
    property var swatches: field.swatches
    property size itemSize: Qt.size(width, height)
    property real cellSize: field.cellSize
    property int treatment: field.panel.radarTreatment
    property real weakBelow: field.panel.radarWeakReturns ? -32 : 5
    property vector4d mapBox: Qt.vector4d(field.panel.radarVisibleBounds.west, field.panel.radarVisibleBounds.east,
      field.panel.radarVisibleBounds.south, field.panel.radarVisibleBounds.north)
    property point gridOrigin: field.report ? Qt.point(field.report.origin.x, field.report.origin.y) : Qt.point(0, 0)
    property vector4d gridAxes: field.report ? Qt.vector4d(field.report.col.x, field.report.col.y, field.report.row.x, field.report.row.y) : Qt.vector4d(1, 0, 0, 1)
    property size gridSize: Qt.size(nativeGrid.width, nativeGrid.height)
    fragmentShader: Qt.resolvedUrl("shaders/radar-grid.frag.qsb")
    onStatusChanged: if (status === ShaderEffect.Error) console.warn("Radar paint shader:", log)
  }
  Canvas {
    anchors.fill: parent
    visible: field.software && !!field.scan
    smooth: false
    property var key: [field.scan, field.panel.radarVisibleBounds, field.panel.radarTreatment, field.panel.radarWeakReturns, width, height]
    onKeyChanged: if (visible) requestPaint()
    onVisibleChanged: if (visible) requestPaint()
    onAvailableChanged: if (available && visible) requestPaint()
    onPaint: {
      var ctx = getContext("2d"); ctx.reset(); ctx.clearRect(0, 0, width, height)
      if (!field.scan) return
      var box = field.panel.radarVisibleBounds
      RadarStyle.paintCells(ctx, width, height, field.cellSize, field.panel.radarTreatment, field.panel.radarWeakReturns, function(x, y) {
        var rate = Model.radarGridRate(field.report, field.scan, box.north - y / height * (box.north - box.south), box.west + x / width * (box.east - box.west))
        return RadarStyle.rateDbz(rate)
      })
    }
  }
}
