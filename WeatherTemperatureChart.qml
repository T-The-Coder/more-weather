import QtQuick
import QtQuick.Shapes
import qs.Commons
import "Model.js" as Model

// Temperature as a line chart across the forecast, after linecast: a thin
// line whose every segment wears the warmth of its middle on the absolute
// colour scale, daylight as a faint band, a rule at midnight with the day's
// name, the value written at each high and low of a swing, and a marker with
// the value under the pointer. Lines are Shapes and labels Text, so both stay
// sharp at any screen scale.
Item {
  id: chart
  required property var panel
  // One entry per line: { values: [°C], texts: [label per point], plainColor,
  // extrema: "max" or "min" to label only peaks or troughs (default both) }.
  property var lines: []
  readonly property int count: lines.length ? lines[0].values.length : 0
  // Horizontal distance between points; the first sits half a step in,
  // moved by xOffset (the daily columns have a gap after each).
  property real step: count > 0 ? width / count : 0
  property real xOffset: 0
  // Daylight per point (true, false, or undefined for no band).
  property var daylight: []
  // Midnight rules: [{ index, label }], drawn before the point at index.
  property var rules: []
  // Time labels under the plot: [{ index, label }].
  property var axis: []
  // Point marked by the hour cursor, or -1.
  property int markIndex: -1
  // The point for now, marked with a dot; the line before it is dimmed.
  // -1 for none.
  property int nowIndex: 0
  // Spacing of the high and low labels (Model.temperatureExtrema): within
  // how many points a label's value must be the extreme, and how many
  // points apart two labels of a kind must be.
  property int extremaWindow: 5
  property int extremaGap: 6
  // Time per point, shown above the plot while the pointer rests there.
  property var timeTexts: []
  // Rain per point in mm (for the hour), drawn as bars from the bottom of
  // the plot behind the line; empty for none.
  property var rain: []
  // Bars reach their full height (half the plot) at this many mm, on a
  // square-root scale so a light shower still shows.
  property real rainFullMm: 8
  readonly property color rainColor: panel.paletteColor ? panel.paletteColor("blue") : "#1e66f5"
  function rainHeight(mm) {
    var value = Number(mm)
    if (!(value > 0)) return 0
    return Math.max(2, plotHeight * 0.5 * Math.min(1, Math.sqrt(value / rainFullMm)))
  }
  property real plotHeight: Style.space(100)
  signal picked(int index)

  readonly property real captionHeight: captionMetrics.height
  readonly property real ruleTop: 0
  readonly property real plotTop: rules.length || timeTexts.length ? captionHeight + Style.space(4) : 0
  readonly property real plotBottom: plotTop + plotHeight
  // Extrema labels sit inside the plot, above peaks and below troughs.
  readonly property real labelRoom: captionHeight + Style.space(3)
  readonly property int hoverIndex: chartMouse.containsMouse && step > 0
    ? Math.max(0, Math.min(count - 1, Math.floor((chartMouse.mouseX - xOffset) / step))) : -1

  implicitHeight: plotBottom + (axis.length ? captionHeight + Style.space(4) : 0)
  height: implicitHeight

  // The span of all lines, widened to at least 6 °C around its middle so a
  // steady day stays a gentle wave.
  readonly property var range: {
    var low = Infinity
    var high = -Infinity
    for (var l = 0; l < lines.length; ++l)
      for (var i = 0; i < lines[l].values.length; ++i) {
        var value = Number(lines[l].values[i])
        if (!isFinite(value)) continue
        low = Math.min(low, value)
        high = Math.max(high, value)
      }
    if (!isFinite(low)) return { low: 0, span: 1 }
    var span = Math.max(6, high - low)
    return { low: (low + high) / 2 - span / 2, span: span }
  }

  function xAt(index) { return xOffset + (index + 0.5) * step }
  function yAt(celsius) {
    var inner = plotHeight - 2 * labelRoom
    return plotTop + labelRoom + inner * (1 - (celsius - range.low) / range.span)
  }
  function colorFor(celsius, plain) {
    return panel.absoluteTemperatureAccent(celsius) || plain
  }

  TextMetrics {
    id: captionMetrics
    font.family: chart.panel.fontFamily
    font.pixelSize: Style.font.caption
    text: "0"
  }

  // Daylight bands, one per stretch of daylight so no seams show.
  readonly property var daylightRuns: {
    var runs = []
    if (daylight.length !== count) return runs
    for (var i = 0; i < count; ++i) {
      if (daylight[i] !== true) continue
      if (runs.length && runs[runs.length - 1].end === i) runs[runs.length - 1].end = i + 1
      else runs.push({ start: i, end: i + 1 })
    }
    return runs
  }
  Repeater {
    model: chart.daylightRuns

    Rectangle {
      required property var modelData
      x: chart.xOffset + modelData.start * chart.step
      y: chart.plotTop
      width: (modelData.end - modelData.start) * chart.step
      height: chart.plotHeight
      color: chart.panel.foreground
      opacity: 0.045
    }
  }

  // Rain bars.
  Repeater {
    model: chart.rain.length === chart.count ? chart.count : 0

    Rectangle {
      required property int index
      readonly property real barHeight: chart.rainHeight(chart.rain[index])
      visible: barHeight > 0
      x: chart.xAt(index) - width / 2
      y: chart.plotBottom - barHeight
      width: Math.max(2, chart.step * 0.7)
      height: barHeight
      radius: Math.min(2, width / 2)
      color: chart.rainColor
      opacity: index < chart.nowIndex ? 0.12 : 0.28
    }
  }

  // Midnight rules with the new day's name.
  Repeater {
    model: chart.rules

    Item {
      required property var modelData
      x: chart.xOffset + modelData.index * chart.step

      Rectangle {
        y: chart.ruleTop
        width: Style.spacing.hairline
        height: chart.plotBottom
        color: chart.panel.foreground
        opacity: 0.14
      }

      Text {
        x: Style.space(4)
        y: chart.ruleTop
        text: modelData.label
        color: chart.panel.mutedText
        font.family: chart.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }

  // Hover and hour-cursor markers.
  Rectangle {
    visible: chart.hoverIndex >= 0 && chart.hoverIndex !== chart.markIndex
    x: chart.xAt(chart.hoverIndex)
    y: chart.plotTop
    width: Style.spacing.hairline
    height: chart.plotHeight
    color: chart.panel.foreground
    opacity: 0.3
  }
  Text {
    readonly property real rainMm: chart.hoverIndex >= 0 && chart.rain.length === chart.count
      ? Number(chart.rain[chart.hoverIndex]) : 0
    readonly property string label: chart.hoverIndex < 0 ? ""
      : (chart.timeTexts[chart.hoverIndex] || "")
        + (rainMm > 0 && chart.panel.precipitationText ? " · " + chart.panel.precipitationText(rainMm, false) : "")
    visible: label !== ""
    x: Math.max(0, Math.min(chart.width - implicitWidth, chart.xAt(chart.hoverIndex) - implicitWidth / 2))
    y: chart.plotTop - implicitHeight - Style.space(2)
    text: label
    color: chart.panel.foreground
    font.family: chart.panel.fontFamily
    font.pixelSize: Style.font.caption
  }
  Rectangle {
    visible: chart.markIndex >= 0 && chart.markIndex < chart.count
    x: chart.xAt(chart.markIndex)
    y: chart.plotTop
    width: Style.spacing.hairline
    height: chart.plotHeight
    color: Color.accent
  }

  // The lines, one Shape per segment so each wears its own colour.
  Repeater {
    model: chart.lines

    Item {
      id: lineItem
      required property var modelData
      required property int index
      anchors.fill: parent

      Repeater {
        model: Math.max(0, chart.count - 1)

        Shape {
          id: segment
          required property int index
          readonly property real from: Number(lineItem.modelData.values[index])
          readonly property real to: Number(lineItem.modelData.values[index + 1])
          anchors.fill: parent
          visible: isFinite(from) && isFinite(to)
          opacity: segment.index < chart.nowIndex ? 0.4 : 1
          preferredRendererType: Shape.CurveRenderer

          ShapePath {
            strokeWidth: 2
            strokeColor: chart.colorFor((segment.from + segment.to) / 2, lineItem.modelData.plainColor)
            fillColor: "transparent"
            capStyle: ShapePath.RoundCap
            startX: chart.xAt(segment.index)
            startY: chart.yAt(segment.from)
            PathLine { x: chart.xAt(segment.index + 1); y: chart.yAt(segment.to) }
          }
        }
      }

      // Now, and the value under the pointer or the hour cursor.
      Repeater {
        model: [chart.nowIndex, chart.markIndex, chart.hoverIndex]

        Rectangle {
          required property int modelData
          readonly property real value: modelData >= 0 ? Number(lineItem.modelData.values[modelData]) : NaN
          visible: isFinite(value)
          x: chart.xAt(modelData) - width / 2
          y: chart.yAt(value) - height / 2
          width: Style.space(7)
          height: width
          radius: width / 2
          color: chart.colorFor(value, lineItem.modelData.plainColor)
        }
      }

      // Highs above the line, lows below, one per swing.
      Repeater {
        model: Model.temperatureExtrema(lineItem.modelData.values, chart.extremaWindow, chart.extremaGap).filter(function(point) {
          var kinds = lineItem.modelData.extrema
          return !kinds || kinds === point.kind
        })

        Text {
          required property var modelData
          readonly property bool high: modelData.kind === "max"
          x: Math.max(0, Math.min(chart.width - implicitWidth, chart.xAt(modelData.index) - implicitWidth / 2))
          y: high ? chart.yAt(modelData.value) - implicitHeight - Style.space(2)
            : chart.yAt(modelData.value) + Style.space(2)
          // The hovered point's own label takes over there.
          visible: modelData.index !== chart.hoverIndex
          text: lineItem.modelData.texts[modelData.index] || ""
          color: chart.colorFor(modelData.value, lineItem.modelData.plainColor)
          font.family: chart.panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: true
        }
      }

      Text {
        readonly property real value: chart.hoverIndex >= 0 ? Number(lineItem.modelData.values[chart.hoverIndex]) : NaN
        // Above the line for the top line, below it for a second one.
        readonly property bool above: lineItem.index === 0
        visible: isFinite(value)
        x: Math.max(0, Math.min(chart.width - implicitWidth, chart.xAt(chart.hoverIndex) + Style.space(6)))
        y: above ? chart.yAt(value) - implicitHeight - Style.space(2) : chart.yAt(value) + Style.space(2)
        text: chart.hoverIndex >= 0 ? (lineItem.modelData.texts[chart.hoverIndex] || "") : ""
        color: chart.colorFor(value, lineItem.modelData.plainColor)
        font.family: chart.panel.fontFamily
        font.pixelSize: Style.font.caption
        font.bold: true
      }
    }
  }

  // Time labels under the plot.
  Repeater {
    model: chart.axis

    Text {
      required property var modelData
      x: Math.max(0, Math.min(chart.width - implicitWidth, chart.xAt(modelData.index) - implicitWidth / 2))
      y: chart.plotBottom + Style.space(4)
      text: modelData.label
      color: chart.panel.mutedText
      font.family: chart.panel.fontFamily
      font.pixelSize: Style.font.caption
    }
  }

  MouseArea {
    id: chartMouse
    y: chart.plotTop
    width: parent.width
    height: chart.plotHeight
    hoverEnabled: true
    cursorShape: Qt.PointingHandCursor
    onClicked: if (chart.hoverIndex >= 0) chart.picked(chart.hoverIndex)
  }
}
