import QtQuick
import qs.Commons
import qs.Ui
import "GlobeFields.js" as GlobeFields
import "Model.js" as Model

// Under the globe: a compact row per colour layer on (its name, a click on
// which switches it off; its scale with five ticks; the unit), a "+" that
// switches the next one on, then once what the data is (the model's
// resolution, when it was loaded or the time shown, the daily limit, the
// isobars' spacing, the streaks' height) and its source.
Item {
  id: legend
  required property var panel
  required property Item globe
  readonly property bool imperial: panel.useImperial
  readonly property var loader: panel.globeData
  readonly property var layers: loader.washLayers
  // The next layer "+" switches on, in the draw order; "" when all are on.
  readonly property string nextLayer: {
    for (var i = 0; i < GlobeFields.LAYERS.length; i++)
      if (layers.indexOf(GlobeFields.LAYERS[i]) < 0) return GlobeFields.LAYERS[i]
    return ""
  }
  width: parent ? parent.width : 0
  height: column.height

  function layerName(kind) {
    var name = panel.i18n("globeWash" + kind.charAt(0).toUpperCase() + kind.slice(1))
    // The wind's height with it, when it is not the ground's.
    if (kind === "wind" && globe.windHeight !== "10m") name += " · " + panel.windLevelText(Model.windLevel(globe.windHeight))
    return name
  }
  // A tick's number: the wind in the chosen wind unit, the rest as given;
  // the unit stands after the scale.
  function tickText(kind, value) {
    if (kind === "wind") {
      var wind = Model.windValue(value, panel.windUnitFor(imperial))
      return wind ? panel.localizedNumber(wind.value) : ""
    }
    return panel.localizedNumber(value)
  }
  function unitText(kind) {
    if (kind === "wind") {
      var wind = Model.windValue(0, panel.windUnitFor(imperial))
      return wind ? wind.unit : ""
    }
    return GlobeFields.unit(kind, imperial)
  }

  Column {
    id: column
    width: parent.width
    spacing: Style.space(4)

    Repeater {
      model: legend.layers

      Item {
        id: row
        required property string modelData
        readonly property string kind: modelData
        width: column.width
        height: Math.max(chip.height, scale.height)

        // The layer's name: a click switches it off.
        BorderSurface {
          id: chip
          width: Math.min(Style.space(150), chipText.implicitWidth + Style.space(16))
          height: Style.space(22)
          radius: Style.cornerRadius
          color: Style.controlFill(false, chipMouse.containsMouse, Color.popups.text, Color.accent)
          borderSpec: Border.controlSpec(chipMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

          Text {
            id: chipText
            textFormat: Text.PlainText
            anchors.centerIn: parent
            width: Math.min(implicitWidth, parent.width - Style.space(12))
            elide: Text.ElideRight
            text: legend.layerName(row.kind) + "  ×"
            color: chipMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : Color.popups.text
            font.family: legend.panel.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: true
          }

          MouseArea {
            id: chipMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: legend.panel.setGlobeLayer(row.kind, false)
          }
        }

        // The scale: one block per bucket, ticks under it.
        Item {
          id: scale
          anchors.left: parent.left
          anchors.leftMargin: Style.space(150) + Style.space(12)
          anchors.verticalCenter: chip.verticalCenter
          width: Math.min(Style.space(220), row.width - Style.space(150) - unitLabel.implicitWidth - Style.space(36))
          height: Style.space(8) + tickRow.height + Style.space(2)

          Canvas {
            id: bar
            width: parent.width
            height: Style.space(8)
            property var palette: legend.globe.washPalettes ? legend.globe.washPalettes[row.kind] : null
            property color ink: legend.panel.foreground
            onPaletteChanged: requestPaint()
            onWidthChanged: requestPaint()
            onPaint: {
              var ctx = getContext("2d")
              ctx.clearRect(0, 0, width, height)
              var flat = palette || []
              var count = flat.length / 4
              if (!count) return
              var w = width / count
              for (var i = 0; i < count; i++) {
                ctx.fillStyle = Qt.rgba(flat[i * 4] / 255, flat[i * 4 + 1] / 255, flat[i * 4 + 2] / 255,
                  Math.max(0.25, flat[i * 4 + 3] / 255))
                ctx.fillRect(i * w, 0, Math.ceil(w), height)
              }
              ctx.strokeStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.25)
              ctx.lineWidth = 1
              ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
            }
          }

          Item {
            id: tickRow
            anchors.top: bar.bottom
            anchors.topMargin: Style.space(2)
            width: parent.width
            height: tickMetrics.height

            FontMetrics {
              id: tickMetrics
              font.family: legend.panel.fontFamily
              font.pixelSize: Style.font.caption
            }

            Repeater {
              model: GlobeFields.ticks(row.kind, legend.imperial, legend.globe.windScaleKmh)

              Text {
                required property var modelData
                textFormat: Text.PlainText
                x: Math.max(0, Math.min(tickRow.width - implicitWidth, modelData.at * tickRow.width - implicitWidth / 2))
                text: legend.tickText(row.kind, modelData.value)
                color: legend.panel.mutedText
                font.family: legend.panel.fontFamily
                font.pixelSize: Style.font.caption
              }
            }
          }
        }

        Text {
          id: unitLabel
          textFormat: Text.PlainText
          anchors.left: scale.right
          anchors.leftMargin: Style.space(8)
          anchors.verticalCenter: chip.verticalCenter
          text: legend.unitText(row.kind)
          color: legend.panel.mutedText
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
        }
      }
    }

    // "+": the next colour layer on; the source on the right.
    Item {
      width: column.width
      height: Style.space(22)

      BorderSurface {
        id: plus
        visible: legend.nextLayer !== ""
        width: plusText.implicitWidth + Style.space(16)
        height: Style.space(22)
        radius: Style.cornerRadius
        color: Style.controlFill(false, plusMouse.containsMouse, Color.popups.text, Color.accent)
        borderSpec: Border.controlSpec(plusMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

        Text {
          id: plusText
          textFormat: Text.PlainText
          anchors.centerIn: parent
          text: "+ " + (legend.nextLayer !== "" ? legend.layerName(legend.nextLayer) : "")
          color: plusMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : legend.panel.mutedText
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
        }

        MouseArea {
          id: plusMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: legend.panel.setGlobeLayer(legend.nextLayer, true)
        }
      }

      Text {
        textFormat: Text.PlainText
        visible: legend.loader.active
        anchors.right: parent.right
        anchors.verticalCenter: parent.verticalCenter
        text: legend.loader.needsMarine ? "OPEN-METEO · MARINE" : "OPEN-METEO"
        color: legend.panel.hintText
        font.family: legend.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }

    // What the data is, once.
    Text {
      textFormat: Text.PlainText
      visible: text !== ""
      width: column.width
      wrapMode: Text.WordWrap
      text: {
        if (!legend.loader.active) return ""
        var parts = []
        if (legend.globe.zoom <= 1) parts.push(legend.panel.i18n("globeDataModel"))
        // At another time on the timeline: that time, not the data's age.
        if (legend.loader.scrubbed)
          parts.push(legend.panel.globeStepLabel(legend.loader.displayMs, false))
        else if (legend.loader.dataAt > 0)
          parts.push(legend.panel.i18n("globeDataTime", { time: Qt.formatTime(new Date(legend.loader.dataAt), "HH:mm") }))
        else parts.push(legend.panel.i18n("globeDataLoading"))
        if (legend.loader.limitHeld) parts.push(legend.panel.i18n("globeDataLimit"))
        if (legend.loader.isobarsOn)
          parts.push(legend.panel.i18n("globeIsobarsEvery", { value: legend.panel.useImperial ? "0.12 inHg" : "4 hPa" }))
        if (legend.loader.streaksOn && legend.layers.indexOf("wind") < 0)
          parts.push(legend.panel.i18n("globeStreaksAt", { height: legend.panel.windLevelText(Model.windLevel(legend.globe.windHeight)) }))
        return parts.join(" · ")
      }
      color: legend.panel.mutedText
      font.family: legend.panel.fontFamily
      font.pixelSize: Style.font.caption
    }
  }
}
