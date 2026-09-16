import QtQuick
import qs.Commons
import qs.Ui

// Scale bar plus zoom out / in buttons, overlaid on the radar and wind maps.
BorderSurface {
  id: zoomControls
  required property var panel
  required property Item mapItem
  width: zoomRow.implicitWidth + Style.space(10)
  height: Style.space(28)
  radius: Style.cornerRadius
  color: Color.popups.background
  borderSpec: Border.surfaceSpec("popups", "border", Color.popups.border, Style.normalBorderWidth)

  Row {
    id: zoomRow
    anchors.centerIn: parent
    spacing: Style.space(2)

    Item {
      id: mapScale
      width: Style.space(68)
      height: Style.space(19)
      // Measured on the map picture, which may be wider than the view when
      // the view is cropped left and right.
      readonly property real renderedMapWidth: mapItem.viewport ? mapItem.viewport.renderedWidth : mapItem.width
      readonly property real distanceKm: panel.mapScaleDistanceKm(Style.space(56), renderedMapWidth)
      readonly property real barPixelWidth: distanceKm * renderedMapWidth / Math.max(1, panel.mapRadiusKm * 2)

      Column {
        anchors.centerIn: parent
        spacing: 0

        Text {
          anchors.horizontalCenter: parent.horizontalCenter
          text: panel.distanceText(mapScale.distanceKm)
          color: Color.popups.text
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: true
        }

        Canvas {
          id: scaleCanvas
          anchors.horizontalCenter: parent.horizontalCenter
          width: mapScale.barPixelWidth
          height: Style.space(5)
          property color lineColor: Color.popups.text
          onLineColorChanged: requestPaint()
          onWidthChanged: requestPaint()
          onPaint: {
            var ctx = getContext("2d")
            ctx.clearRect(0, 0, width, height)
            ctx.strokeStyle = String(lineColor)
            ctx.lineWidth = 1.2
            ctx.lineCap = "square"
            ctx.beginPath()
            ctx.moveTo(0.6, 0.6)
            ctx.lineTo(width - 0.6, 0.6)
            ctx.moveTo(0.6, 0.6)
            ctx.lineTo(0.6, height - 0.6)
            ctx.moveTo(width - 0.6, 0.6)
            ctx.lineTo(width - 0.6, height - 0.6)
            ctx.stroke()
          }
        }
      }
    }

    Rectangle {
      anchors.verticalCenter: parent.verticalCenter
      width: Style.spacing.hairline
      height: Style.space(15)
      color: Color.popups.text
      opacity: 0.18
    }

    BorderSurface {
      width: Style.space(22)
      height: Style.space(20)
      radius: Style.cornerRadius
      enabled: panel.mapZoomLevel > panel.mapMinimumZoom
      opacity: enabled ? 1 : 0.38
      color: Style.controlFill(false, zoomOutMouse.containsMouse, Color.popups.text, Color.accent)
      borderSpec: Border.controlSpec(zoomOutMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

      Text {
        anchors.centerIn: parent
        text: "−"
        color: zoomOutMouse.containsMouse
          ? Style.hoverStateColor(Color.popups.text, Color.accent)
          : Color.popups.text
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        font.bold: true
      }

      MouseArea {
        id: zoomOutMouse
        anchors.fill: parent
        enabled: parent.enabled
        hoverEnabled: true
        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: panel.changeMapZoom(-1)
      }
    }

    BorderSurface {
      width: Style.space(22)
      height: Style.space(20)
      radius: Style.cornerRadius
      enabled: panel.mapZoomLevel < panel.mapMaximumZoom
      opacity: enabled ? 1 : 0.38
      color: Style.controlFill(false, zoomInMouse.containsMouse, Color.popups.text, Color.accent)
      borderSpec: Border.controlSpec(zoomInMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

      Text {
        anchors.centerIn: parent
        text: "+"
        color: zoomInMouse.containsMouse
          ? Style.hoverStateColor(Color.popups.text, Color.accent)
          : Color.popups.text
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        font.bold: true
      }

      MouseArea {
        id: zoomInMouse
        anchors.fill: parent
        enabled: parent.enabled
        hoverEnabled: true
        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
        onClicked: panel.changeMapZoom(1)
      }
    }
  }
}
