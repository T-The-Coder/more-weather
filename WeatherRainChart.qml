import QtQuick
import qs.Commons
import "Model.js" as Model

// Two-hour rain intensity and probability chart. The Canvas draws only the
// grid, bars, line and legend swatches; every label is a Text on top. Canvas
// text is rasterised at the logical size and scaled with the screen, which
// blurred it on fractional scaling (1.25).
Item {
  id: rainChart
  required property var panel
  width: parent ? parent.width : 0
  height: Style.space(230)

  readonly property bool chartShown: panel.rainNowcast.length >= 2
    && (panel.showForecastIntensity || panel.showForecastProbability || panel.showForecastTotal)
  readonly property bool showIntensitySeries: panel.showForecastIntensity
  // Only when the series has probabilities: MET Norway supplies none, and a
  // line at 0 % read as "no rain" beside rain bars.
  readonly property bool showProbabilitySeries: panel.showForecastProbability
    && panel.rainNowcast.some(function(point) {
      return point.probability !== null && point.probability !== undefined && point.probability !== ""
    })
  readonly property bool showTotalLabel: panel.showForecastTotal
  readonly property bool sourceUsesCache: Model.weatherSeriesUsesCache(panel.rainNowcast)
  readonly property string rainStartTime: panel.upcomingRainTime
  readonly property color probabilityColor: "#5aa9ff"

  // DWD rain-intensity limits, condensed into the five levels used by this
  // compact chart: the level name and its hourly rate on two lines.
  readonly property var intensityLabels: [
    [panel.i18n("rainExtreme"), panel.i18n(panel.intensityRangeKey("rainExtremeRange"))],
    [panel.i18n("rainStrong"), panel.i18n(panel.intensityRangeKey("rainStrongRange"))],
    [panel.i18n("rainMedium"), panel.i18n(panel.intensityRangeKey("rainMediumRange"))],
    [panel.i18n("rainWeak"), panel.i18n(panel.intensityRangeKey("rainWeakRange"))],
    [panel.i18n("rainNone"), panel.i18n("rainNoneRange")]
  ]
  readonly property string intensityUnitLabel: panel.i18n("intensityUnit", { unit: panel.precipitationUnit(true) })

  FontMetrics { id: labelMetrics; font.family: panel.fontFamily; font.pixelSize: Style.font.caption; font.bold: true }
  FontMetrics { id: rangeMetrics; font.family: panel.fontFamily; font.pixelSize: Math.max(8, Style.font.caption - 1) }
  FontMetrics { id: axisMetrics; font.family: panel.fontFamily; font.pixelSize: Style.font.caption }
  FontMetrics { id: legendMetrics; font.family: panel.fontFamily; font.pixelSize: Style.font.bodySmall }

  // Balanced axis gutters, so the plot itself (not just the full width) is
  // centered. Measured in the panel font, since translated labels and a
  // monospace face vary in width.
  readonly property real gutter: {
    var value = 18
    if (showIntensitySeries) {
      var widest = 0
      for (var m = 0; m < intensityLabels.length; ++m) {
        widest = Math.max(widest, labelMetrics.advanceWidth(intensityLabels[m][0]),
          rangeMetrics.advanceWidth(intensityLabels[m][1]))
      }
      value = Math.max(value, Math.ceil(widest) + 16)
    }
    if (showProbabilitySeries) value = Math.max(value, Math.ceil(axisMetrics.advanceWidth("100%")) + 14)
    return value
  }
  // Both series share the time axis. Intensity uses the categorical scale on
  // the left, probability the percentage scale on the right; the header band
  // holds their legend and total.
  readonly property real plotLeft: gutter
  readonly property real plotTop: 52
  readonly property real plotWidth: width - 2 * gutter
  readonly property real plotHeight: height - plotTop - 42
  readonly property real probabilityLegendX: showIntensitySeries
    ? plotLeft + 25 + legendMetrics.advanceWidth(intensityUnitLabel) : plotLeft

  readonly property real totalAmount: {
    var points = panel.rainNowcast
    var sum = 0
    for (var i = 0; i < Math.max(1, points.length - 1) && i < points.length; ++i)
      sum += Number(points[i].precipitation || 0) / 4
    return sum
  }
  readonly property string totalLabel: {
    var values = {
      amount: panel.localizedNumber(panel.precipitationValue(totalAmount), panel.useImperial ? 2 : 1),
      unit: panel.precipitationUnit(false),
      time: rainStartTime
    }
    return rainStartTime !== "" ? panel.i18n("rainFromTotal", values)
      : (totalAmount < 0.01 ? panel.i18n("noRainExpected", values) : panel.i18n("total", values))
  }
  // Start, end and every half hour between them.
  readonly property var timeLabels: {
    var points = panel.rainNowcast
    var labels = []
    if (points.length < 2) return labels
    var indices = []
    for (var quarter = 0; quarter <= 4; ++quarter) {
      var index = Math.round((points.length - 1) * quarter / 4)
      if (indices.indexOf(index) < 0) indices.push(index)
    }
    for (var i = 0; i < indices.length; ++i) {
      labels.push({
        text: panel.nowcastTime(points[indices[i]]),
        x: plotLeft + plotWidth * indices[i] / (points.length - 1),
        align: i === 0 ? "left" : (i === indices.length - 1 ? "right" : "center")
      })
    }
    return labels
  }

  Canvas {
    id: precipitationCanvas
    visible: rainChart.chartShown
    width: parent.width
    height: Style.space(230)
    property var sourceData: panel.rainNowcast
    property color foregroundColor: panel.foreground
    property color accentColor: Color.accent
    property var layoutKey: [rainChart.gutter, rainChart.probabilityLegendX, rainChart.showIntensitySeries,
      rainChart.showProbabilitySeries]
    onSourceDataChanged: requestPaint()
    onForegroundColorChanged: requestPaint()
    onAccentColorChanged: requestPaint()
    onLayoutKeyChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var fg = String(foregroundColor)
      var accent = String(accentColor)
      var points = panel.rainNowcast
      if (!points || points.length < 2) return
      var probability = String(rainChart.probabilityColor)
      var showIntensitySeries = rainChart.showIntensitySeries
      var showProbabilitySeries = rainChart.showProbabilitySeries
      var left = rainChart.plotLeft
      var top = rainChart.plotTop
      var plotW = rainChart.plotWidth
      var plotH = rainChart.plotHeight
      var intensityValues = []
      var probabilityValues = []
      for (var i = 0; i < points.length; ++i) {
        intensityValues.push(Number(points[i].precipitation || 0))
        probabilityValues.push(Number(points[i].probability || 0))
      }
      var barCount = Math.max(1, intensityValues.length - 1)
      ctx.strokeStyle = fg
      ctx.globalAlpha = 0.16
      ctx.lineWidth = 1
      for (var line = 0; line <= 4; ++line) {
        var gy = top + plotH * line / 4
        ctx.beginPath(); ctx.moveTo(left, gy); ctx.lineTo(left + plotW, gy); ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Legend swatches; their labels are Text items (below).
      if (showIntensitySeries) {
        ctx.fillStyle = accent
        ctx.fillRect(left, 7, 10, 8)
      }
      if (showProbabilitySeries) {
        var legendX = rainChart.probabilityLegendX
        ctx.fillStyle = Qt.rgba(rainChart.probabilityColor.r, rainChart.probabilityColor.g,
          rainChart.probabilityColor.b, 0.25)
        ctx.fillRect(legendX, 7, 14, 8)
        ctx.strokeStyle = probability
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(legendX, 7.5); ctx.lineTo(legendX + 14, 7.5); ctx.stroke()
      }

      function pointX(index) { return left + plotW * index / (intensityValues.length - 1) }
      function intensityPosition(value) {
        // Piecewise interpolation keeps light and moderate rain visible
        // while preserving the DWD category boundaries at 0.5, 4 and
        // 40 mm/h. The open-ended extreme band fills up to 80 mm/h.
        var amount = Math.max(0, Number(value) || 0)
        if (amount <= 0) return 0
        if (amount <= 0.5) return amount / 0.5
        if (amount <= 4) return 1 + (amount - 0.5) / 3.5
        if (amount <= 40) return 2 + (amount - 4) / 36
        return 3 + Math.min(1, (amount - 40) / 40)
      }
      function probabilityY(value) {
        var fraction = Math.min(100, Math.max(0, Number(value) || 0)) / 100
        return top + plotH * (1 - fraction)
      }
      // A monotone cubic through every point (Fritsch-Carlson): the curve
      // passes through the plotted values and never swings above 100 % or
      // below 0 % between them. The former midpoint smoothing cut corners,
      // which the radar's sharp steps (2 % to 95 % within a quarter hour)
      // turned into a visible miss.
      function probabilityPath(series) {
        var count = series.length
        var xs = []
        var ys = []
        for (var p = 0; p < count; ++p) { xs.push(pointX(p)); ys.push(probabilityY(series[p])) }
        ctx.beginPath()
        ctx.moveTo(xs[0], ys[0])
        if (count < 3) {
          for (p = 1; p < count; ++p) ctx.lineTo(xs[p], ys[p])
          return
        }
        var slopes = []
        for (p = 0; p < count - 1; ++p) slopes.push((ys[p + 1] - ys[p]) / (xs[p + 1] - xs[p]))
        var tangents = [slopes[0]]
        for (p = 1; p < count - 1; ++p)
          tangents.push(slopes[p - 1] * slopes[p] <= 0 ? 0 : (slopes[p - 1] + slopes[p]) / 2)
        tangents.push(slopes[count - 2])
        for (p = 0; p < count - 1; ++p) {
          if (slopes[p] === 0) { tangents[p] = 0; tangents[p + 1] = 0; continue }
          var a = tangents[p] / slopes[p]
          var b = tangents[p + 1] / slopes[p]
          var h = a * a + b * b
          if (h > 9) {
            var t = 3 / Math.sqrt(h)
            tangents[p] = t * a * slopes[p]
            tangents[p + 1] = t * b * slopes[p]
          }
        }
        for (p = 0; p < count - 1; ++p) {
          var dx = (xs[p + 1] - xs[p]) / 3
          ctx.bezierCurveTo(xs[p] + dx, ys[p] + tangents[p] * dx,
            xs[p + 1] - dx, ys[p + 1] - tangents[p + 1] * dx, xs[p + 1], ys[p + 1])
        }
      }

      // The probability's translucent area goes under the bars, its line
      // over them.
      if (showProbabilitySeries) {
        var gradient = ctx.createLinearGradient(0, top, 0, top + plotH)
        gradient.addColorStop(0, Qt.rgba(rainChart.probabilityColor.r, rainChart.probabilityColor.g,
          rainChart.probabilityColor.b, 0.28))
        gradient.addColorStop(1, Qt.rgba(rainChart.probabilityColor.r, rainChart.probabilityColor.g,
          rainChart.probabilityColor.b, 0.04))
        probabilityPath(probabilityValues)
        ctx.lineTo(pointX(probabilityValues.length - 1), top + plotH)
        ctx.lineTo(pointX(0), top + plotH)
        ctx.closePath()
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Nine sample timestamps delimit exactly eight 15-minute bars.
      // Draw bars first so the probability line remains unobstructed.
      if (showIntensitySeries) {
        var barStep = plotW / barCount
        var barWidth = Math.max(4, barStep * 0.46)
        ctx.fillStyle = accent
        ctx.globalAlpha = 0.82
        for (var b = 0; b < barCount; ++b) {
          var bx = left + b * barStep + (barStep - barWidth) / 2
          var bh = plotH * intensityPosition(intensityValues[b]) / 4
          // Radar-backed bars take the DWD radar map's colour for their
          // intensity; forecast bars keep the neutral colour, which also
          // shows where the radar ends.
          var radarColor = points[b].precipitationSource === "radar"
            ? Model.dwdRadarColor(intensityValues[b]) : ""
          ctx.fillStyle = radarColor || accent
          if (bh > 0) {
            ctx.fillRect(bx, top + plotH - Math.max(2, bh), barWidth, Math.max(2, bh))
          } else {
            ctx.globalAlpha = 0.20
            ctx.fillRect(bx, top + plotH - 1, barWidth, 1)
            ctx.globalAlpha = 0.82
          }
        }
        ctx.globalAlpha = 1
      }

      if (showProbabilitySeries) {
        ctx.strokeStyle = probability
        ctx.lineWidth = 1.5
        probabilityPath(probabilityValues)
        ctx.stroke()
      }
    }
  }

  // ---- Labels, as Text for sharp type (WeatherChartLabel). Positions follow
  //      the canvas layout; `baselineY` places each like a fillText call.
  Item {
    anchors.fill: parent
    visible: rainChart.chartShown

    Repeater {
      model: rainChart.showIntensitySeries ? 5 : 0

      Item {
        required property int index
        readonly property real lineY: rainChart.plotTop + rainChart.plotHeight * index / 4

        WeatherChartLabel {
          panel: rainChart.panel
          text: rainChart.intensityLabels[index][0]
          font.bold: true
          align: "right"
          anchorX: rainChart.plotLeft - 8
          baselineY: parent.lineY - 2
        }
        WeatherChartLabel {
          panel: rainChart.panel
          text: rainChart.intensityLabels[index][1]
          font.pixelSize: Math.max(8, Style.font.caption - 1)
          align: "right"
          anchorX: rainChart.plotLeft - 8
          baselineY: parent.lineY + Style.font.caption
        }
      }
    }

    Repeater {
      model: rainChart.showProbabilitySeries ? 5 : 0

      WeatherChartLabel {
        panel: rainChart.panel
        required property int index
        text: (100 - index * 25) + "%"
        anchorX: rainChart.plotLeft + rainChart.plotWidth + 7
        baselineY: rainChart.plotTop + rainChart.plotHeight * index / 4 + 4
      }
    }

    WeatherChartLabel {
      panel: rainChart.panel
      visible: rainChart.showIntensitySeries
      text: rainChart.intensityUnitLabel
      font.pixelSize: Style.font.bodySmall
      anchorX: rainChart.plotLeft + 15
      baselineY: 15
    }

    WeatherChartLabel {
      panel: rainChart.panel
      visible: rainChart.showProbabilitySeries
      text: panel.i18n("probability")
      font.pixelSize: Style.font.bodySmall
      anchorX: rainChart.probabilityLegendX + 19
      baselineY: 15
    }

    WeatherChartLabel {
      panel: rainChart.panel
      visible: rainChart.showTotalLabel
      text: rainChart.totalLabel
      font.pixelSize: Style.font.bodySmall
      font.italic: rainChart.sourceUsesCache
      align: "right"
      anchorX: rainChart.plotLeft + rainChart.plotWidth
      baselineY: 34
    }

    Repeater {
      model: rainChart.timeLabels

      WeatherChartLabel {
        panel: rainChart.panel
        required property var modelData
        text: modelData.text
        font.pixelSize: Style.font.bodySmall
        font.italic: rainChart.sourceUsesCache
        align: modelData.align
        anchorX: modelData.x
        baselineY: rainChart.height - 8
      }
    }
  }

  // Shown instead of the Canvas above (which needs at least two data
  // points to compute an axis scale) when the nowcast fetch — the
  // Open-Meteo-only 15-minute data, no DWD equivalent — hasn't
  // succeeded yet. Same fixed height so the tab doesn't jump when data
  // does arrive.
  Text {
    textFormat: Text.PlainText
    visible: panel.rainNowcast.length < 2
    width: parent.width
    height: Style.space(230)
    text: panel.i18n("noDataWaiting")
    horizontalAlignment: Text.AlignHCenter
    verticalAlignment: Text.AlignVCenter
    color: panel.mutedText
    font.family: panel.fontFamily
    font.pixelSize: Style.font.bodySmall
  }
}
