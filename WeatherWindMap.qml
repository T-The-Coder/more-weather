import QtQuick
import qs.Commons
import qs.Ui
import "Providers.js" as Providers
import "Model.js" as Model

// Animated Best Match wind field for the map extent. Loaded only while the
// wind tab is shown; the grid and the basemap are fetched in the background
// (WeatherWindGrid, WeatherMapPrefetch).
Item {
  id: windMapItem
  required property var panel
  // Maps are geographic: never mirror them for right-to-left languages.
  LayoutMirroring.enabled: false
  LayoutMirroring.childrenInherit: true
  width: parent.width
  height: panel.mapViewHeight(width)
  clip: true

  // Where the cropped map picture lies in this view; the wind overlay uses it.
  readonly property var viewport: Model.mapViewport(width, height, panel.mapRadiusKm)

  Rectangle {
    anchors.fill: parent
    color: Color.popups.background
  }

  WeatherRemoteImage {
    id: windMapBackground
    anchors.fill: parent
    store: panel.mapImages
    remoteUrl: panel.mapBasemapUrl
  }

  Canvas {
    id: windMapCanvas
    anchors.fill: parent
    property real phase: 0
    property var gridData: panel.windMapData
    onPhaseChanged: requestPaint()
    onGridDataChanged: requestPaint()
    onWidthChanged: requestPaint()
    onHeightChanged: requestPaint()
    onPaint: {
      var ctx = getContext("2d")
      ctx.clearRect(0, 0, width, height)
      var grid = panel.windMapData
      if (!grid.length) return
      ctx.fillStyle = "rgba(27,103,194,0.22)"
      ctx.fillRect(0, 0, width, height)

      // Dense animated particles use the nearest real grid vector.
      ctx.strokeStyle = "rgba(255,255,255,0.68)"
      ctx.lineWidth = 1.15
      for (var s = 0; s < 140; ++s) {
        var sample = grid[s % grid.length]
        var direction = Number(sample.windDirection || 0)
        var speed = Number(sample.windSpeed || 0)
        var angle = (direction + 90) * Math.PI / 180
        var dx = Math.cos(angle), dy = Math.sin(angle)
        var anchor = grid.length > 1
          ? Model.mapPoint(windMapItem.viewport, sample.latitude, sample.longitude,
            panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
          : null
        var anchorX = anchor ? anchor.x : (s * 79 % width)
        var anchorY = anchor ? anchor.y : (s * 47 % height)
        var jitterX = ((s * 37) % 61) - 30
        var jitterY = ((s * 53) % 45) - 22
        // Drift roughly proportional to the real wind: about 5 px/s at
        // 7 km/h, 12 px/s at 20 km/h and 50 px/s at 100 km/h (one phase step
        // per 90 ms). A small floor keeps calm air from freezing completely.
        var travel = (windMapCanvas.phase * (0.15 + speed * 0.045) + s * 7) % 34 - 17
        var px = anchorX + jitterX + dx * travel
        var py = anchorY + jitterY + dy * travel
        var length = 5 + Math.min(11, speed / 2)
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(px + dx * length, py + dy * length)
        ctx.stroke()
      }

      // One vector arrow at each of the 35 Best Match samples.
      if (grid.length > 1) {
        ctx.strokeStyle = "rgba(255,209,128,0.92)"
        ctx.lineWidth = 1.45
        for (var g = 0; g < grid.length; ++g) {
          var item = grid[g]
          var itemAngle = (Number(item.windDirection || 0) + 90) * Math.PI / 180
          var itemDx = Math.cos(itemAngle), itemDy = Math.sin(itemAngle)
          var itemPoint = Model.mapPoint(windMapItem.viewport, item.latitude, item.longitude,
            panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
          var itemX = itemPoint.x
          var itemY = itemPoint.y
          var arrowLength = 7 + Math.min(12, Number(item.windSpeed || 0) / 2)
          var tipX = itemX + itemDx * arrowLength
          var tipY = itemY + itemDy * arrowLength
          ctx.beginPath(); ctx.moveTo(itemX, itemY); ctx.lineTo(tipX, tipY); ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(tipX, tipY)
          ctx.lineTo(tipX - itemDx * 4 - itemDy * 2.5, tipY - itemDy * 4 + itemDx * 2.5)
          ctx.moveTo(tipX, tipY)
          ctx.lineTo(tipX - itemDx * 4 + itemDy * 2.5, tipY - itemDy * 4 - itemDx * 2.5)
          ctx.stroke()
        }
      }
    }
  }

  Rectangle {
    visible: panel.windMapData.length === 0
    anchors.fill: parent
    color: Color.popups.background

    Text {
      // Above the place marker and drift arrow, which sit at the centre.
      anchors.horizontalCenter: parent.horizontalCenter
      anchors.top: parent.top
      anchors.topMargin: Style.space(14)
      text: panel.windGridFailed
        ? panel.i18n("noWindData")
        : panel.i18n("windDataLoading")
      color: panel.foreground
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
    }
  }

  Canvas {
    id: windPlacesCanvas
    anchors.fill: parent
    property var candidateData: panel.radarPlaceCandidates
    property string selectedName: panel.reportLocation
    property color labelColor: panel.foreground
    property real west: panel.mapWest
    property real east: panel.mapEast
    property real south: panel.mapSouth
    property real north: panel.mapNorth
    onCandidateDataChanged: requestPaint()
    onSelectedNameChanged: requestPaint()
    onLabelColorChanged: requestPaint()
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

      function drawOutlinedText(text, x, y, foreground, opacity) {
        ctx.fillStyle = "rgba(0,0,0,0.72)"
        ctx.fillText(text, x + 1, y + 1)
        ctx.globalAlpha = opacity
        ctx.fillStyle = foreground
        ctx.fillText(text, x, y)
        ctx.globalAlpha = 1
      }

      var sourceWidth = panel.mapImageWidth
      var sourceHeight = panel.mapImageHeight
      var imageScale = Math.max(width / sourceWidth, height / sourceHeight)
      var renderedWidth = sourceWidth * imageScale
      var renderedHeight = sourceHeight * imageScale
      var imageOffsetX = (width - renderedWidth) / 2
      var imageOffsetY = (height - renderedHeight) / 2
      var occupied = []
      if (windZoomControls.visible)
        occupied.push({ x: windZoomControls.x, y: windZoomControls.y, w: windZoomControls.width, h: windZoomControls.height })
      if (windSummary.visible)
        occupied.push({ x: windSummary.x, y: windSummary.y, w: windSummary.width, h: windSummary.height })

      var centerX = width / 2
      var centerY = height / 2
      var ownName = String(selectedName || panel.configuredLocation || "")
      if (ownName) {
        ctx.font = panel.canvasFont(Style.font.caption)
        ctx.textBaseline = "middle"
        ctx.textAlign = "left"
        var ownWidth = ctx.measureText(ownName).width
        var ownX = centerX + 10
        if (ownX + ownWidth > width - 8) {
          ctx.textAlign = "right"
          ownX = centerX - 10
        }
        var ownY = centerY - 10
        drawOutlinedText(ownName, ownX, ownY, String(labelColor), 0.78)
        occupied.push({
          x: ctx.textAlign === "left" ? ownX - 2 : ownX - ownWidth - 2,
          y: ownY - 7,
          w: ownWidth + 4,
          h: 14
        })
      }

      ctx.font = panel.canvasFont(Math.max(8, Style.font.caption - 1))
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
        var labelRect = {
          x: alignLeft ? textX - 2 : textX - textWidth - 2,
          y: pointY - 7,
          w: textWidth + 4,
          h: 14
        }
        var collides = false
        for (var r = 0; r < occupied.length; ++r) {
          if (overlaps(labelRect, occupied[r], 4)) { collides = true; break }
        }
        if (collides) continue

        ctx.fillStyle = "rgba(244,246,248,0.60)"
        ctx.beginPath()
        ctx.arc(pointX, pointY, 1.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.textAlign = alignLeft ? "left" : "right"
        drawOutlinedText(name, textX, pointY, String(labelColor), 0.62)
        occupied.push(labelRect)
        drawn++
      }
    }
  }

  Rectangle {
    visible: panel.windMapData.length > 0
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
    id: windZoomControls
    panel: windMapItem.panel
    mapItem: windMapItem
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: Style.space(8)
  }

  WeatherMapAttribution {
    panel: windMapItem.panel
  }

  BorderSurface {
    id: windSummary
    visible: panel.windMapCurrent !== null
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.margins: Style.space(8)
    width: windMapLabel.implicitWidth + Style.space(12)
    height: Style.space(28)
    radius: Style.cornerRadius
    color: Color.popups.background
    borderSpec: Border.surfaceSpec("popups", "border", Color.popups.border, Style.normalBorderWidth)

    Text {
      id: windMapLabel
      anchors.centerIn: parent
      text: panel.windMapCurrent
        ? panel.i18n("windMapSummary", {
            location: panel.reportLocation,
            speed: panel.windMapSpeed(panel.windMapCurrent.windSpeed),
            direction: panel.windDirectionName(panel.windMapCurrent.windDirection),
            gust: panel.windMapSpeed(panel.windMapCurrent.windGust),
            unit: panel.useImperial ? "mph" : "km/h"
          })
        : panel.i18n("windDataLoading")
      color: Color.popups.text
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
      font.italic: panel.windMapUsesCache
    }
  }

  Timer {
    interval: 90
    repeat: true
    running: panel.opened && panel.precipitationTab === 2 && panel.windMapData.length > 0
    // Wraps after ~25 h; an earlier wrap made every particle jump at once.
    onTriggered: windMapCanvas.phase = (windMapCanvas.phase + 1) % 1000000
  }
}
