import QtQuick
import qs.Commons
import qs.Ui
import "GlobeFields.js" as GlobeFields

// Under the globe: the colour wash shown (a chip; a click or v takes the
// next), its scale with five ticks and the unit, what the data is (the
// model's resolution, when it was loaded, the daily limit), and its source.
Item {
  id: legend
  required property var panel
  required property Item globe
  readonly property string wash: globe.washKind
  readonly property bool imperial: panel.useImperial
  readonly property var loader: panel.globeData
  width: parent ? parent.width : 0
  height: Math.max(chip.height, scale.visible ? scale.height : 0) + (note.visible ? note.height + Style.space(4) : 0)

  function washName(kind) {
    return panel.i18n("globeWash" + kind.charAt(0).toUpperCase() + kind.slice(1))
  }

  BorderSurface {
    id: chip
    width: chipText.implicitWidth + Style.space(16)
    height: Style.space(22)
    radius: Style.cornerRadius
    color: Style.controlFill(false, chipMouse.containsMouse, Color.popups.text, Color.accent)
    borderSpec: Border.controlSpec(chipMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

    Text {
      id: chipText
      textFormat: Text.PlainText
      anchors.centerIn: parent
      text: legend.washName(legend.wash)
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
      onClicked: legend.panel.setViewDisplaySetting("globeWash", GlobeFields.nextWash(legend.wash))
    }
  }

  // The scale: one block per bucket, ticks under it.
  Item {
    id: scale
    visible: legend.wash !== "none"
    anchors.left: chip.right
    anchors.leftMargin: Style.space(12)
    anchors.verticalCenter: chip.verticalCenter
    width: Math.min(Style.space(220), legend.width - chip.width - source.width - Style.space(36))
    height: Style.space(8) + tickRow.height + Style.space(2)

    Canvas {
      id: bar
      width: parent.width
      height: Style.space(8)
      property var palette: legend.globe.washPalette
      property color ink: legend.panel.foreground
      onPaletteChanged: requestPaint()
      onWidthChanged: requestPaint()
      onPaint: {
        var ctx = getContext("2d")
        ctx.clearRect(0, 0, width, height)
        var colors = palette || []
        if (!colors.length) return
        var w = width / colors.length
        for (var i = 0; i < colors.length; i++) {
          var c = colors[i]
          ctx.fillStyle = Qt.rgba(c[0] / 255, c[1] / 255, c[2] / 255, Math.max(0.25, c[3] / 255))
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
        model: GlobeFields.ticks(legend.wash, legend.imperial)

        Text {
          required property var modelData
          required property int index
          textFormat: Text.PlainText
          x: Math.max(0, Math.min(tickRow.width - implicitWidth, modelData.at * tickRow.width - implicitWidth / 2))
          text: legend.panel.localizedNumber(modelData.value)
            + (index === 4 ? " " + GlobeFields.unit(legend.wash, legend.imperial) : "")
          color: legend.panel.mutedText
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
        }
      }
    }
  }

  Text {
    id: source
    textFormat: Text.PlainText
    visible: legend.wash !== "none"
    anchors.right: parent.right
    anchors.verticalCenter: chip.verticalCenter
    text: "OPEN-METEO"
    color: legend.panel.hintText
    font.family: legend.panel.fontFamily
    font.pixelSize: Style.font.caption
  }

  // What the data is: the model's resolution on the whole disc, when it was
  // loaded, and whether the daily limit holds new loads back.
  Text {
    id: note
    textFormat: Text.PlainText
    visible: legend.wash !== "none" && text !== ""
    anchors.top: chip.bottom
    anchors.topMargin: Style.space(4)
    width: parent.width
    wrapMode: Text.WordWrap
    text: {
      var parts = []
      if (legend.globe.zoom <= 1) parts.push(legend.panel.i18n("globeDataModel"))
      if (legend.loader.dataAt > 0)
        parts.push(legend.panel.i18n("globeDataTime", { time: Qt.formatTime(new Date(legend.loader.dataAt), "HH:mm") }))
      else parts.push(legend.panel.i18n("globeDataLoading"))
      if (legend.loader.limitHeld) parts.push(legend.panel.i18n("globeDataLimit"))
      return parts.join(" · ")
    }
    color: legend.panel.mutedText
    font.family: legend.panel.fontFamily
    font.pixelSize: Style.font.caption
  }
}
