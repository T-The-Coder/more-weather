import QtQuick
import qs.Commons
import "Model.js" as Model

// Two-hour rain intensity and probability chart.
Item {
  id: rainChart
  required property var panel
  width: parent ? parent.width : 0
  height: Style.space(230)

  Canvas {
    id: precipitationCanvas
    visible: panel.precipitationTab === 0 && panel.rainNowcast.length >= 2
      && (panel.showForecastIntensity || panel.showForecastProbability || panel.showForecastTotal)
    width: parent.width
    height: Style.space(230)
    property var sourceData: panel.rainNowcast
    property string interfaceLanguage: panel.interfaceLanguage
    property color foregroundColor: panel.foreground
    property color accentColor: Color.accent
    property color probabilityColor: "#5aa9ff"
    property bool showIntensitySeries: panel.showForecastIntensity
    // Only when the series has probabilities: MET Norway supplies none, and a
    // line at 0 % read as "no rain" beside rain bars.
    property bool showProbabilitySeries: panel.showForecastProbability
      && panel.rainNowcast.some(function(point) {
        return point.probability !== null && point.probability !== undefined && point.probability !== ""
      })
    property bool showTotalLabel: panel.showForecastTotal
    property bool sourceUsesCache: Model.weatherSeriesUsesCache(panel.rainNowcast)
    property string rainStartTime: panel.upcomingRainTime
    onRainStartTimeChanged: requestPaint()
    property string fontFamily: panel.fontFamily
    onFontFamilyChanged: requestPaint()
    onSourceDataChanged: requestPaint()
    onInterfaceLanguageChanged: requestPaint()
    onForegroundColorChanged: requestPaint()
    onAccentColorChanged: requestPaint()
    onProbabilityColorChanged: requestPaint()
    onShowIntensitySeriesChanged: requestPaint()
    onShowProbabilitySeriesChanged: requestPaint()
    onShowTotalLabelChanged: requestPaint()
    onSourceUsesCacheChanged: requestPaint()
    onWidthChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var fg = String(foregroundColor)
      var accent = String(accentColor)
      var points = panel.rainNowcast
      if (!points || points.length < 2) return
      var probability = String(probabilityColor)
      var labelFont = panel.canvasFont(Style.font.caption, true)
      var rangeFont = panel.canvasFont(Math.max(8, Style.font.caption - 1))
      var axisFont = panel.canvasFont(Style.font.caption)
      // DWD rain-intensity limits, condensed into the five levels used by
      // this compact chart. Each label gets its own line for the level name
      // and the corresponding hourly rate.
      var intensityLabels = [
        [panel.i18n("rainExtreme"), panel.i18n(panel.intensityRangeKey("rainExtremeRange"))],
        [panel.i18n("rainStrong"), panel.i18n(panel.intensityRangeKey("rainStrongRange"))],
        [panel.i18n("rainMedium"), panel.i18n(panel.intensityRangeKey("rainMediumRange"))],
        [panel.i18n("rainWeak"), panel.i18n(panel.intensityRangeKey("rainWeakRange"))],
        [panel.i18n("rainNone"), panel.i18n("rainNoneRange")]
      ]
      // Balance the axis gutters so the plot itself (not just the
      // full-width Canvas) is centered. Gutters are measured in the panel
      // font, since translated labels and a monospace face vary in width.
      var gutter = 18
      if (showIntensitySeries) {
        var widest = 0
        for (var m = 0; m < intensityLabels.length; ++m) {
          ctx.font = labelFont
          widest = Math.max(widest, ctx.measureText(intensityLabels[m][0]).width)
          ctx.font = rangeFont
          widest = Math.max(widest, ctx.measureText(intensityLabels[m][1]).width)
        }
        gutter = Math.max(gutter, Math.ceil(widest) + 16)
      }
      if (showProbabilitySeries) {
        ctx.font = axisFont
        gutter = Math.max(gutter, Math.ceil(ctx.measureText("100%").width) + 14)
      }
      var left = gutter
      var right = gutter
      // Both series share the time axis. Intensity uses the categorical
      // scale on the left; probability uses the percentage scale on
      // the right. The header band holds their legend and total.
      var top = 52
      var bottom = 42
      var plotW = width - left - right
      var plotH = height - top - bottom
      var intensityValues = []
      var probabilityValues = []
      for (var i = 0; i < points.length; ++i) {
        intensityValues.push(Number(points[i].precipitation || 0))
        probabilityValues.push(Number(points[i].probability || 0))
      }
      var barCount = Math.max(1, intensityValues.length - 1)
      var totalAmount = 0
      for (i = 0; i < barCount; ++i) totalAmount += intensityValues[i] / 4
      ctx.strokeStyle = fg
      ctx.globalAlpha = 0.16
      ctx.lineWidth = 1
      for (var line = 0; line <= 4; ++line) {
        var gy = top + plotH * line / 4
        ctx.beginPath(); ctx.moveTo(left, gy); ctx.lineTo(left + plotW, gy); ctx.stroke()
      }
      ctx.globalAlpha = 1
      ctx.fillStyle = fg
      if (showIntensitySeries) {
        ctx.textAlign = "right"
        for (line = 0; line <= 4; ++line) {
          var labelY = top + plotH * line / 4
          ctx.font = labelFont
          ctx.fillText(intensityLabels[line][0], left - 8, labelY - 2)
          ctx.font = rangeFont
          ctx.fillText(intensityLabels[line][1], left - 8, labelY + Style.font.caption)
        }
      }

      if (showProbabilitySeries) {
        ctx.textAlign = "left"
        ctx.font = axisFont
        for (line = 0; line <= 4; ++line) {
          ctx.fillText((100 - line * 25) + "%", left + plotW + 7, top + plotH * line / 4 + 4)
        }
      }

      // Compact two-color legend. The total gets a separate header row
      // so translated labels cannot collide in the narrow popup.
      ctx.textAlign = "left"
      ctx.font = panel.canvasFont(Style.font.bodySmall)
      var legendX = left
      if (showIntensitySeries) {
        ctx.fillStyle = accent
        ctx.fillRect(legendX, 7, 10, 8)
        ctx.fillStyle = fg
        var intensityUnitLabel = panel.i18n("intensityUnit", { unit: panel.precipitationUnit(true) })
        ctx.fillText(intensityUnitLabel, legendX + 15, 15)
        legendX += 25 + ctx.measureText(intensityUnitLabel).width
      }
      if (showProbabilitySeries) {
        ctx.strokeStyle = probability
        ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(legendX, 11); ctx.lineTo(legendX + 14, 11); ctx.stroke()
        ctx.fillStyle = probability
        ctx.beginPath(); ctx.arc(legendX + 7, 11, 2.3, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = fg
        ctx.fillText(panel.i18n("probability"), legendX + 19, 15)
      }
      var displayedTotal = panel.precipitationValue(totalAmount)
      var totalDecimals = panel.useImperial ? 2 : 1
      var totalValues = {
        amount: panel.localizedNumber(displayedTotal, totalDecimals),
        unit: panel.precipitationUnit(false)
      }
      totalValues.time = rainStartTime
      var totalLabel = rainStartTime !== ""
        ? panel.i18n("rainFromTotal", totalValues)
        : (totalAmount < 0.01
          ? panel.i18n("noRainExpected", totalValues)
          : panel.i18n("total", totalValues))
      if (showTotalLabel) {
        ctx.textAlign = "right"
        ctx.font = panel.canvasFont(Style.font.bodySmall, false, sourceUsesCache)
        ctx.fillText(totalLabel, left + plotW, 34)
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

      // Nine sample timestamps delimit exactly eight 15-minute bars.
      // Draw bars first so the probability line remains unobstructed.
      if (showIntensitySeries) {
        var barStep = plotW / barCount
        var barWidth = Math.max(4, barStep * 0.58)
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
        ctx.strokeStyle = "rgba(0,0,0,0.38)"
        ctx.lineWidth = 4.5
        probabilityPath(probabilityValues)
        ctx.stroke()
        ctx.strokeStyle = probability
        ctx.lineWidth = 2.5
        probabilityPath(probabilityValues)
        ctx.stroke()
        ctx.fillStyle = probability
        for (var p = 0; p < probabilityValues.length; ++p) {
          ctx.beginPath(); ctx.arc(pointX(p), probabilityY(probabilityValues[p]), 2.5, 0, Math.PI * 2); ctx.fill()
        }
      }
      ctx.fillStyle = fg
      ctx.font = panel.canvasFont(Style.font.bodySmall, false, sourceUsesCache)
      // Start, end and every half hour between them.
      var labels = []
      for (var quarter = 0; quarter <= 4; ++quarter) {
        var labelIndex = Math.round((points.length - 1) * quarter / 4)
        if (labels.indexOf(labelIndex) < 0) labels.push(labelIndex)
      }
      for (i = 0; i < labels.length; ++i) {
        var idx = labels[i]
        ctx.textAlign = i === 0 ? "left" : (i === labels.length - 1 ? "right" : "center")
        ctx.fillText(panel.nowcastTime(points[idx]), left + plotW * idx / (points.length - 1), height - 8)
      }
    }
  }

  // Shown instead of the Canvas above (which needs at least two data
  // points to compute an axis scale) when the nowcast fetch — the
  // Open-Meteo-only 15-minute data, no DWD equivalent — hasn't
  // succeeded yet. Same fixed height so the tab doesn't jump when data
  // does arrive.
  Text {
    visible: panel.precipitationTab === 0 && panel.rainNowcast.length < 2
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
