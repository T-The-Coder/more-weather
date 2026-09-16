import QtQuick
import qs.Commons
import qs.Ui
import "Providers.js" as Providers

// Radar frames over the context basemap with place labels, the wind-drift
// arrow and playback controls. Loaded only while the radar tab is shown; the
// frame images are already fetched in the background by WeatherMapPrefetch.
Item {
  id: radarMapItem
  required property var panel
  Component.onCompleted: panel.showCurrentRadarFrame()
  // Maps are geographic: never mirror them for right-to-left languages.
  LayoutMirroring.enabled: false
  LayoutMirroring.childrenInherit: true
  width: parent.width
  height: Style.space(230)
  clip: true

  WeatherRemoteImage {
    anchors.fill: parent
    visible: panel.radarActiveProviderId !== "dwd"
    store: panel.mapImages
    remoteUrl: Providers.calmContextMapUrl(panel.mapBbox, 480, 250)
  }

  // Keep every frame as a live Image item and only change which one
  // is visible. This avoids resetting an Image source (and its status)
  // at each step, so playback never flashes a loading message.
  Repeater {
    model: panel.radarFrames
    WeatherRemoteImage {
      anchors.fill: parent
      store: panel.mapImages
      remoteUrl: panel.radarFrameUrl(modelData)
      load: panel.radarFrameLoadAllowed(index)
      visible: index === panel.radarDisplayedFrameIndex && status === Image.Ready
      onStatusChanged: if (status !== Image.Error) panel.updateRadarFrameStatus(index, status, modelData)
      onFailed: panel.updateRadarFrameStatus(index, Image.Error, modelData)
      Component.onCompleted: panel.updateRadarFrameStatus(index, status, modelData)
    }
  }

  // Last-resort precipitation picture. If both the official regional
  // WMS and RainViewer fail, reuse the same 5x7 Best Match grid as the
  // wind view and render current model precipitation honestly as a
  // model field (never labelled as observed radar).
  Canvas {
    anchors.fill: parent
    visible: panel.radarUsesModelFallback
    property var gridData: panel.precipitationGrid
    property real west: panel.mapWest
    property real east: panel.mapEast
    property real south: panel.mapSouth
    property real north: panel.mapNorth
    onGridDataChanged: requestPaint()
    onWestChanged: requestPaint()
    onEastChanged: requestPaint()
    onSouthChanged: requestPaint()
    onNorthChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var grid = panel.precipitationGrid
      if (!grid.length || panel.mapEast === panel.mapWest || panel.mapNorth === panel.mapSouth) return
      if (grid.length === 1) {
        var pointAmount = Math.max(0, Number(grid[0].precipitation || 0))
        if (pointAmount >= 0.02) {
          ctx.fillStyle = pointAmount >= 40 ? "rgba(188,46,219,0.52)"
            : (pointAmount >= 4 ? "rgba(227,67,55,0.46)"
              : (pointAmount >= 0.5 ? "rgba(246,183,52,0.40)" : "rgba(58,151,224,0.34)"))
          ctx.fillRect(0, 0, width, height)
        }
        return
      }
      var cellWidth = width / 6 * 1.08
      var cellHeight = height / 4 * 1.08
      for (var i = 0; i < grid.length; ++i) {
        var amount = Math.max(0, Number(grid[i].precipitation || 0))
        if (amount < 0.02) continue
        var x = (Number(grid[i].longitude) - panel.mapWest) / (panel.mapEast - panel.mapWest) * width
        var y = (panel.mapNorth - Number(grid[i].latitude)) / (panel.mapNorth - panel.mapSouth) * height
        ctx.fillStyle = amount >= 40 ? "rgba(188,46,219,0.82)"
          : (amount >= 4 ? "rgba(227,67,55,0.76)"
            : (amount >= 0.5 ? "rgba(246,183,52,0.70)" : "rgba(58,151,224,0.62)"))
        ctx.fillRect(x - cellWidth / 2, y - cellHeight / 2, cellWidth, cellHeight)
      }
    }
  }

  Rectangle {
    visible: !panel.radarHasDisplayedFrame && !panel.radarUsesModelFallback
    anchors.fill: parent
    color: Color.popups.background
    Text {
      // Above the place marker and drift arrow, which sit at the centre.
      anchors.horizontalCenter: parent.horizontalCenter
      anchors.top: parent.top
      anchors.topMargin: Style.space(14)
      text: panel.radarFrames.length
        ? panel.i18n("radarLoading")
        : panel.i18n("noRadarData")
      color: panel.foreground
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
    }
  }

  Canvas {
    id: radarPlacesCanvas
    anchors.fill: parent
    property var candidateData: panel.radarPlaceCandidates
    property string selectedName: panel.reportLocation
    property color labelColor: panel.foreground
    property color labelBackgroundColor: Color.popups.background
    property real west: panel.mapWest
    property real east: panel.mapEast
    property real south: panel.mapSouth
    property real north: panel.mapNorth
    onCandidateDataChanged: requestPaint()
    onSelectedNameChanged: requestPaint()
    onLabelColorChanged: requestPaint()
    onLabelBackgroundColorChanged: requestPaint()
    onWestChanged: requestPaint()
    onEastChanged: requestPaint()
    onSouthChanged: requestPaint()
    onNorthChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      if (width <= 0 || height <= 0) return

      function overlaps(a, b, padding) {
        var gap = padding || 0
        return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x
          && a.y < b.y + b.h + gap && a.y + a.h + gap > b.y
      }

      function labelBounds(text, x, y) {
        var textWidth = ctx.measureText(text).width
        var paddingX = 4
        return {
          x: ctx.textAlign === "right" ? x - textWidth - paddingX : x - paddingX,
          y: y - 8,
          w: textWidth + paddingX * 2,
          h: 16
        }
      }

      function fillRoundedRect(rect, radius) {
        var r = Math.min(radius, rect.w / 2, rect.h / 2)
        ctx.beginPath()
        ctx.moveTo(rect.x + r, rect.y)
        ctx.lineTo(rect.x + rect.w - r, rect.y)
        ctx.quadraticCurveTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + r)
        ctx.lineTo(rect.x + rect.w, rect.y + rect.h - r)
        ctx.quadraticCurveTo(rect.x + rect.w, rect.y + rect.h, rect.x + rect.w - r, rect.y + rect.h)
        ctx.lineTo(rect.x + r, rect.y + rect.h)
        ctx.quadraticCurveTo(rect.x, rect.y + rect.h, rect.x, rect.y + rect.h - r)
        ctx.lineTo(rect.x, rect.y + r)
        ctx.quadraticCurveTo(rect.x, rect.y, rect.x + r, rect.y)
        ctx.closePath()
        ctx.fill()
      }

      function drawMapLabel(text, x, y, foreground, textOpacity, backgroundOpacity) {
        var rect = labelBounds(text, x, y)
        ctx.globalAlpha = backgroundOpacity
        ctx.fillStyle = String(labelBackgroundColor)
        fillRoundedRect(rect, 3)
        ctx.globalAlpha = textOpacity
        ctx.fillStyle = foreground
        ctx.fillText(text, x, y)
        ctx.globalAlpha = 1
        return rect
      }

      // Match Image.PreserveAspectCrop for the 480×250 WMS source,
      // including the vertical crop in the wide radar viewport.
      var sourceWidth = 480
      var sourceHeight = 250
      var imageScale = Math.max(width / sourceWidth, height / sourceHeight)
      var renderedWidth = sourceWidth * imageScale
      var renderedHeight = sourceHeight * imageScale
      var imageOffsetX = (width - renderedWidth) / 2
      var imageOffsetY = (height - renderedHeight) / 2
      var occupied = []
      if (radarZoomControls.visible)
        occupied.push({ x: radarZoomControls.x, y: radarZoomControls.y, w: radarZoomControls.width, h: radarZoomControls.height })
      if (radarControls.visible)
        occupied.push({ x: radarControls.x, y: radarControls.y, w: radarControls.width, h: radarControls.height })

      var centerX = width / 2
      var centerY = height / 2
      var ownName = String(selectedName || panel.configuredLocation || "")
      if (ownName) {
        ctx.font = panel.canvasFont(Style.font.caption, true)
        ctx.textBaseline = "middle"
        ctx.textAlign = "left"
        var ownWidth = ctx.measureText(ownName).width
        var ownX = centerX + 10
        if (ownX + ownWidth > width - 8) {
          ctx.textAlign = "right"
          ownX = centerX - 10
        }
        var ownY = centerY - 10
        occupied.push(drawMapLabel(ownName, ownX, ownY,
          String(labelColor), 0.98, 0.84))
      }

      ctx.font = panel.canvasFont(Style.font.caption)
      ctx.textBaseline = "middle"
      var drawn = 0
      var places = candidateData || []
      for (var i = 0; i < places.length && drawn < 4; ++i) {
        var place = places[i]
        var u = (Number(place.longitude) - west) / Math.max(0.000001, east - west)
        var v = (north - Number(place.latitude)) / Math.max(0.000001, north - south)
        var pointX = imageOffsetX + u * renderedWidth
        var pointY = imageOffsetY + v * renderedHeight
        if (pointX < 10 || pointX > width - 10 || pointY < 10 || pointY > height - 10) continue
        if (Math.abs(pointX - centerX) < 105 && Math.abs(pointY - centerY) < 82) continue

        var name = String(place.name || "")
        var textWidth = ctx.measureText(name).width
        var alignLeft = pointX + textWidth + 7 <= width - 7
        var textX = alignLeft ? pointX + 5 : pointX - 5
        ctx.textAlign = alignLeft ? "left" : "right"
        var labelRect = labelBounds(name, textX, pointY)
        var collides = false
        for (var r = 0; r < occupied.length; ++r) {
          if (overlaps(labelRect, occupied[r], 4)) { collides = true; break }
        }
        if (collides) continue

        ctx.fillStyle = "rgba(244,246,248,0.60)"
        ctx.beginPath()
        ctx.arc(pointX, pointY, 1.6, 0, Math.PI * 2)
        ctx.fill()
        drawMapLabel(name, textX, pointY, String(labelColor), 0.94, 0.76)
        occupied.push(labelRect)
        drawn++
      }
    }
  }

  Canvas {
    id: frontArrowCanvas
    anchors.fill: parent
    property var motionData: panel.rainNowcast
    property color arrowColor: panel.foreground
    property real mapZoomScale: Math.pow(1.5, panel.mapZoomLevel)
    onMotionDataChanged: requestPaint()
    onArrowColorChanged: requestPaint()
    onMapZoomScaleChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      if (!panel.rainNowcast.length) return

      var speed = Number(panel.rainNowcast[0].windSpeed || 0)
      var direction = Number(panel.rainNowcast[0].windDirection || 0)
      // Meteorological direction denotes where air comes from. The
      // arrow points along the flow and ends at the selected place.
      var angle = (direction + 90) * Math.PI / 180
      var dx = Math.cos(angle)
      var dy = Math.sin(angle)
      // A wind displacement covers more screen pixels when the map
      // is zoomed in and fewer when zoomed out. Keep a small minimum
      // so calm wind remains legible.
      var length = Math.max(18, Math.min(width * 0.38, speed * 10 * mapZoomScale))
      var headX = width / 2
      var headY = height / 2
      var tailX = headX - dx * length
      var tailY = headY - dy * length
      var normalX = -dy
      var normalY = dx

      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.strokeStyle = "rgba(0,0,0,0.58)"
      ctx.lineWidth = 5
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(headX, headY); ctx.stroke()
      ctx.strokeStyle = String(arrowColor)
      ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(headX, headY); ctx.stroke()

      // Arrow head at the location and the T-shaped upstream origin,
      // matching the RegenVorschau convention.
      ctx.beginPath()
      ctx.moveTo(headX, headY)
      ctx.lineTo(headX - dx * 11 + normalX * 6, headY - dy * 11 + normalY * 6)
      ctx.moveTo(headX, headY)
      ctx.lineTo(headX - dx * 11 - normalX * 6, headY - dy * 11 - normalY * 6)
      ctx.moveTo(tailX + normalX * 11, tailY + normalY * 11)
      ctx.lineTo(tailX - normalX * 11, tailY - normalY * 11)
      ctx.stroke()

      // One-hour waypoint: exactly halfway along the two-hour
      // displacement, with a shorter crossbar than the origin.
      var oneHourX = tailX + dx * length * 0.5
      var oneHourY = tailY + dy * length * 0.5
      ctx.beginPath()
      ctx.moveTo(oneHourX + normalX * 7, oneHourY + normalY * 7)
      ctx.lineTo(oneHourX - normalX * 7, oneHourY - normalY * 7)
      ctx.stroke()

      // In near-calm air the arrow is too short to separate its time
      // labels from the place marker and name; the crossbars alone still
      // show the drift then.
      if (length < 48) return

      // Anchor each label to the center of its own crossbar and move
      // both equally outward on opposite sides of the arrow.
      var labelX = tailX - normalX * 34
      var labelY = tailY - normalY * 34
      var timeLabelWidth = 36
      var timeLabelHeight = 20
      ctx.font = panel.canvasFont(Style.font.bodySmall, true)
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      var label = "+2h"
      ctx.fillStyle = "rgba(244,246,248,0.90)"
      ctx.fillRect(labelX - timeLabelWidth / 2, labelY - timeLabelHeight / 2, timeLabelWidth, timeLabelHeight)
      ctx.fillStyle = "#111820"
      ctx.fillText(label, labelX, labelY + 1)

      // Put +1h on the opposite side of the line from +2h. This
      // prevents the labels merging when winds make the arrow short.
      var oneHourLabelX = oneHourX + normalX * 34
      var oneHourLabelY = oneHourY + normalY * 34
      ctx.font = panel.canvasFont(Style.font.bodySmall, true)
      var oneHourLabel = "+1h"
      ctx.fillStyle = "rgba(244,246,248,0.90)"
      ctx.fillRect(oneHourLabelX - timeLabelWidth / 2, oneHourLabelY - timeLabelHeight / 2, timeLabelWidth, timeLabelHeight)
      ctx.fillStyle = "#111820"
      ctx.fillText(oneHourLabel, oneHourLabelX, oneHourLabelY + 1)
    }
  }

  Rectangle {
    x: parent.width / 2 - width / 2
    y: parent.height / 2 - height / 2
    width: 12
    height: 12
    radius: 6
    color: "transparent"
    border.color: "#ff3b30"
    border.width: 3
  }

  WeatherMapZoomControls {
    id: radarZoomControls
    panel: radarMapItem.panel
    mapItem: radarMapItem
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: Style.space(8)
  }

  WeatherMapAttribution {
    panel: radarMapItem.panel
    credits: radarMapItem.panel.radarActiveProviderId === "rainviewer"
      ? [["Radar © RainViewer", "https://www.rainviewer.com/"]] : []
  }

  BorderSurface {
    id: radarControls
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.margins: Style.space(8)
    width: radarControlRow.implicitWidth + Style.space(12)
    height: Style.space(28)
    radius: Style.cornerRadius
    color: Color.popups.background
    borderSpec: Border.surfaceSpec("popups", "border", Color.popups.border, Style.normalBorderWidth)

    Row {
      id: radarControlRow
      anchors.centerIn: parent
      spacing: Style.space(6)

      Text {
        anchors.verticalCenter: parent.verticalCenter
        text: panel.radarFrames.length
          ? panel.radarFrameClock(panel.radarCurrentFrame)
            + " · " + panel.radarFrameLead(panel.radarFrameIndex)
          : "–"
        color: Color.popups.text
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        font.bold: true
      }

      Rectangle {
        anchors.verticalCenter: parent.verticalCenter
        width: Style.spacing.hairline
        height: Style.space(16)
        color: Color.popups.text
        opacity: 0.18
      }

      Row {
        id: buttonGroup
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(2)

          BorderSurface {
            width: Style.space(22)
            height: Style.space(20)
            radius: Style.cornerRadius
            enabled: panel.radarPlayableFrameCount > 1
            opacity: enabled ? 1 : 0.38
            color: Style.controlFill(false, backMouse.containsMouse, Color.popups.text, Color.accent)
            borderSpec: Border.controlSpec(backMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

            Behavior on color { ColorAnimation { duration: 80 } }

            Text {
              anchors.centerIn: parent
              text: "←"
              color: backMouse.containsMouse
                ? Style.hoverStateColor(Color.popups.text, Color.accent)
                : Color.popups.text
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: true
            }

            MouseArea {
              id: backMouse
              anchors.fill: parent
              enabled: parent.enabled
              hoverEnabled: true
              cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
              onClicked: panel.stepRadarBackward()
            }
          }

          BorderSurface {
            width: Style.space(22)
            height: Style.space(20)
            radius: Style.cornerRadius
            enabled: panel.radarPlayableFrameCount > 1
            opacity: enabled ? 1 : 0.38
            color: panel.radarPlaying
              ? Style.selectedFillFor(Color.popups.text, Color.accent)
              : Style.controlFill(false, playMouse.containsMouse, Color.popups.text, Color.accent)
            borderSpec: Border.controlSpec(panel.radarPlaying
              ? "selected"
              : (playMouse.containsMouse ? "hover-cursor" : "normal"),
              Color.popups.text, Color.accent)

            Behavior on color { ColorAnimation { duration: 100 } }

            Text {
              anchors.centerIn: parent
              text: panel.radarPlaying ? "❚❚" : "▶"
              color: panel.radarPlaying
                ? Style.selectedStateColor(Color.popups.text, Color.accent)
                : (playMouse.containsMouse
                  ? Style.hoverStateColor(Color.popups.text, Color.accent)
                  : Color.popups.text)
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: true
            }

            MouseArea {
              id: playMouse
              anchors.fill: parent
              enabled: parent.enabled
              hoverEnabled: true
              cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
              onClicked: panel.toggleRadarPlayback()
            }
          }

          BorderSurface {
            width: Style.space(22)
            height: Style.space(20)
            radius: Style.cornerRadius
            enabled: panel.radarPlayableFrameCount > 1
            opacity: enabled ? 1 : 0.38
            color: Style.controlFill(false, forwardMouse.containsMouse, Color.popups.text, Color.accent)
            borderSpec: Border.controlSpec(forwardMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

            Behavior on color { ColorAnimation { duration: 80 } }

            Text {
              anchors.centerIn: parent
              text: "→"
              color: forwardMouse.containsMouse
                ? Style.hoverStateColor(Color.popups.text, Color.accent)
                : Color.popups.text
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              font.bold: true
            }

            MouseArea {
              id: forwardMouse
              anchors.fill: parent
              enabled: parent.enabled
              hoverEnabled: true
              cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
              onClicked: panel.stepRadarForward()
            }
          }
      }

    }
  }

  Timer {
    interval: panel.radarFrameIndex >= panel.radarFrames.length - 1 ? 1300 : 600
    repeat: true
    running: panel.opened
      && panel.precipitationTab === 1
      && panel.radarPlaying
      && panel.radarPlayableFrameCount > 1
    onTriggered: {
      var next = panel.nextRadarFrameIndex()
      if (panel.radarFrameReady[next]) panel.selectRadarFrame(next)
    }
  }
}
