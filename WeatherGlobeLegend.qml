import QtQuick
import qs.Commons
import qs.Ui
import "GlobeFields.js" as GlobeFields
import "Model.js" as Model

// Under the globe: one row of toggle chips, every layer always there, the
// colour layers first, then the overlays (GlobeFields.CHIPS): a click
// switches that layer, Shift + click or a right click shows a colour layer
// alone; active chips look like the selected tab. The chips write the same
// display options as the Globe card. Below them a scale row per colour
// layer on (name, scale, unit; the wind's with its mode and height), then
// once what the data is and its source.
Item {
  id: legend
  required property var panel
  required property Item globe
  readonly property bool imperial: panel.useImperial
  readonly property var loader: panel.globeData
  // The scales shown: the colour layers on, and the wind whenever it is on
  // (its lines alone carry the speed in the scale's colours).
  readonly property var scales: {
    var list = loader.washLayers.slice()
    if (loader.windOn && list.indexOf("wind") < 0) list.push("wind")
    return GlobeFields.LAYERS.filter(function(kind) { return list.indexOf(kind) >= 0 })
  }
  // Glyphs only where the row would be too tight for the names.
  readonly property bool glyphOnly: width < Style.space(380)
  width: parent ? parent.width : 0
  height: column.height

  function layerName(kind) {
    return panel.i18n("globeWash" + kind.charAt(0).toUpperCase() + kind.slice(1))
  }
  // The view's own chips first (shape, night, moon, places, timeline), then
  // the layers' (GlobeFields.CHIPS), a divider between the groups.
  // `alone`: the glyph says it (globe, flat map, moon, places), so the chip
  // shows it without its name, which the hover label and the accessible
  // name keep (`tip`, the full text).
  readonly property var allChips: [
    { key: "globeStyle", value: "globe", layer: "", glyph: "\u{f01e7}", label: "mapStyleGlobe", alone: true },
    { key: "globeStyle", value: "map", layer: "", glyph: "\u{f034d}", label: "mapStyleFlat", alone: true },
    { key: "globeNight", layer: "", glyph: "\u{f0594}", label: "chipNight", divider: true },
    { key: "globeMoon", layer: "", glyph: "\u{f0f65}", label: "moon", alone: true },
    { key: "globeMarkers", layer: "", glyph: "\u{f034e}", label: "chipPlaces", tip: "globeMarkers", alone: true },
    { key: "globeTimeline", layer: "", glyph: "\u{f0954}", label: "globeTimeline" }
  ].concat(GlobeFields.CHIPS.map(function(chip, index) {
    var copy = Object.assign({}, chip)
    if (index === 0) copy.divider = true
    return copy
  }))
  function chipOn(chip) {
    if (chip.value !== undefined) return String(panel.displaySetting(chip.key, "globe")) === chip.value
    return panel.globeSwitchOn(chip.key)
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
    spacing: Style.space(6)

    // The chips.
    Flow {
      id: chips
      width: parent.width
      spacing: Style.space(4)

      Repeater {
        model: legend.allChips

        Row {
          id: chipSlot
          required property var modelData
          spacing: Style.space(4)

          // The thin divider before the overlays.
          Rectangle {
            visible: !!chipSlot.modelData.divider
            width: 1
            height: Style.space(16)
            anchors.verticalCenter: parent.verticalCenter
            color: legend.panel.mutedText
            opacity: 0.5
          }
          Item {
            visible: !!chipSlot.modelData.divider
            width: Style.space(2)
            height: 1
          }

          Rectangle {
            id: chip
            readonly property bool on: legend.chipOn(chipSlot.modelData)
            readonly property bool glyphAlone: legend.glyphOnly || !!chipSlot.modelData.alone
            readonly property string fullText: legend.panel.i18n(chipSlot.modelData.tip || chipSlot.modelData.label)
            Accessible.role: Accessible.CheckBox
            Accessible.name: fullText
            Accessible.checked: on
            width: chipRow.implicitWidth + Style.space(14)
            height: Style.space(24)
            radius: Style.cornerRadius
            color: on || chipMouse.containsMouse ? Style.hoverFillFor(legend.panel.foreground, Color.accent) : "transparent"
            border.color: on ? "transparent" : Qt.rgba(legend.panel.foreground.r, legend.panel.foreground.g,
              legend.panel.foreground.b, 0.18)
            border.width: Style.spacing.hairline

            Row {
              id: chipRow
              anchors.centerIn: parent
              spacing: Style.space(4)

              Text {
                textFormat: Text.PlainText
                anchors.verticalCenter: parent.verticalCenter
                text: chipSlot.modelData.glyph
                color: chip.on ? Style.hoverStateColor(legend.panel.foreground, Color.accent) : legend.panel.mutedText
                font.family: legend.panel.fontFamily
                font.pixelSize: Style.font.body
              }
              Text {
                textFormat: Text.PlainText
                visible: !chip.glyphAlone
                anchors.verticalCenter: parent.verticalCenter
                text: legend.panel.i18n(chipSlot.modelData.label)
                color: chip.on ? Style.hoverStateColor(legend.panel.foreground, Color.accent) : legend.panel.mutedText
                font.family: legend.panel.fontFamily
                font.pixelSize: Style.font.caption
                font.bold: chip.on
              }
            }

            MouseArea {
              id: chipMouse
              anchors.fill: parent
              hoverEnabled: true
              acceptedButtons: Qt.LeftButton | Qt.RightButton
              cursorShape: Qt.PointingHandCursor
              onClicked: function(mouse) {
                var layer = chipSlot.modelData.layer
                var solo = mouse.button === Qt.RightButton || (mouse.modifiers & Qt.ShiftModifier)
                if (chipSlot.modelData.value !== undefined) legend.panel.setViewDisplaySetting(chipSlot.modelData.key, chipSlot.modelData.value)
                else if (solo && layer !== "") legend.panel.soloGlobeLayer(layer)
                else legend.panel.setViewDisplaySetting(chipSlot.modelData.key, !chip.on)
              }
            }

            // The full name above a glyph-only chip, a moment after the
            // pointer rests on it.
            Timer {
              id: tipDelay
              property bool done: false
              interval: 400
              running: chip.glyphAlone && chipMouse.containsMouse
              onRunningChanged: if (running) done = false
              onTriggered: done = true
            }
            Rectangle {
              visible: chip.glyphAlone && chipMouse.containsMouse && tipDelay.done
              y: -height - Style.space(4)
              x: (parent.width - width) / 2
              z: 10
              width: tipText.implicitWidth + Style.space(10)
              height: tipText.implicitHeight + Style.space(4)
              radius: Style.cornerRadius
              color: Color.popups.background
              border.color: Color.popups.border
              border.width: Style.spacing.hairline

              Text {
                id: tipText
                textFormat: Text.PlainText
                anchors.centerIn: parent
                text: chip.fullText
                color: Color.popups.text
                font.family: legend.panel.fontFamily
                font.pixelSize: Style.font.caption
              }
            }
          }
        }
      }
    }

    // A scale per colour layer on.
    Repeater {
      model: legend.scales

      Item {
        id: row
        required property string modelData
        readonly property string kind: modelData
        readonly property bool isWind: kind === "wind"
        width: column.width
        height: Math.max(nameText.implicitHeight, scale.height) + (isWind ? modeRow.height + Style.space(4) : 0)

        Text {
          id: nameText
          textFormat: Text.PlainText
          width: Style.space(110)
          elide: Text.ElideRight
          text: legend.layerName(row.kind)
            + (row.isWind ? " · " + legend.panel.windLevelText(Model.windLevel(legend.globe.windHeight)) : "")
          color: legend.panel.foreground
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: true
        }

        Item {
          id: scale
          anchors.left: parent.left
          anchors.leftMargin: Style.space(118)
          width: Math.min(Style.space(220), row.width - Style.space(118) - unitLabel.implicitWidth - Style.space(12))
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
              // Smooth, as the layer is drawn.
              var gradient = ctx.createLinearGradient(0, 0, width, 0)
              for (var i = 0; i < count; i++)
                gradient.addColorStop((i + 0.5) / count, Qt.rgba(flat[i * 4] / 255, flat[i * 4 + 1] / 255,
                  flat[i * 4 + 2] / 255, Math.max(0.35, flat[i * 4 + 3] / 255)))
              ctx.fillStyle = gradient
              ctx.fillRect(0, 0, width, height)
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
          y: (bar.height - height) / 2
          text: legend.unitText(row.kind)
          color: legend.panel.mutedText
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
        }

        // The wind's mode: lines, colour or both.
        Row {
          id: modeRow
          visible: row.isWind
          anchors.top: scale.bottom
          anchors.topMargin: Style.space(4)
          anchors.left: scale.left
          spacing: Style.space(2)

          Repeater {
            model: GlobeFields.WIND_MODES

            Rectangle {
              id: modeChip
              required property string modelData
              readonly property bool on: legend.loader.windMode === modelData
              width: modeText.implicitWidth + Style.space(12)
              height: Style.space(20)
              radius: Style.cornerRadius
              color: on || modeMouse.containsMouse ? Style.hoverFillFor(legend.panel.foreground, Color.accent) : "transparent"
              border.color: on ? "transparent" : Qt.rgba(legend.panel.foreground.r, legend.panel.foreground.g,
                legend.panel.foreground.b, 0.18)
              border.width: Style.spacing.hairline

              Text {
                id: modeText
                textFormat: Text.PlainText
                anchors.centerIn: parent
                text: legend.panel.i18n(modeChip.modelData === "lines" ? "globeWindLines"
                  : (modeChip.modelData === "colour" ? "globeWindColour" : "globeWindBoth"))
                color: modeChip.on ? Style.hoverStateColor(legend.panel.foreground, Color.accent) : legend.panel.mutedText
                font.family: legend.panel.fontFamily
                font.pixelSize: Style.font.caption
              }
              MouseArea {
                id: modeMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: legend.panel.setViewDisplaySetting("globeWindMode", modeChip.modelData)
              }
            }
          }
        }
      }
    }

    // What the data is, once, and its source.
    Item {
      width: column.width
      height: note.implicitHeight
      visible: note.text !== ""

      Text {
        id: note
        textFormat: Text.PlainText
        anchors.left: parent.left
        anchors.right: source.left
        anchors.rightMargin: Style.space(8)
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
          return parts.join(" · ")
        }
        color: legend.panel.mutedText
        font.family: legend.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
      Text {
        id: source
        textFormat: Text.PlainText
        anchors.right: parent.right
        text: legend.loader.needsMarine ? "OPEN-METEO · MARINE" : "OPEN-METEO"
        color: legend.panel.hintText
        font.family: legend.panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }
}
