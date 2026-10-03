import QtQuick
import QtQuick.Window
import qs.Commons
import qs.Ui
import "Providers.js" as Providers
import "Model.js" as Model

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
  height: panel.mapViewHeight(width)
  clip: true

  // Where the cropped map picture lies in this view; every overlay uses it.
  readonly property var viewport: Model.mapViewport(width, height, panel.mapRadiusKm)
  readonly property real rainViewerTilePixels:
    Model.rainViewerTile(panel.mapRadiusKm, panel.mapViewLatitude).sizeKm * viewport.pixelsPerKm
  // The place on the map: marker, drift arrow, rings and its label sit
  // here, which is the centre until the map is moved.
  readonly property var placePoint: Model.mapPoint(viewport,
    panel.forecastRequestLatitude || panel.mapCenterLatitude,
    panel.forecastRequestLongitude || panel.mapCenterLongitude,
    panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
  // Drawn in the theme's colours (WeatherBasemap), or the satellite picture.
  readonly property bool drawnMap: panel.mapStyle !== "satellite"
  property real dragX: 0
  property real dragY: 0

  // The radar frame on screen when the view moves stays, placed at its old
  // extent, until the new one has arrived (the ground does the same, in
  // WeatherMapGround): a pan or zoom never blanks the map. `extent` is where
  // the picture's rectangle lies, in degrees.
  property var staleFrame: null
  function extentOf(item) {
    var view = viewport
    var lonSpan = panel.mapEast - panel.mapWest
    var latSpan = panel.mapNorth - panel.mapSouth
    function lonAt(x) { return panel.mapWest + (x - view.offsetX) / view.renderedWidth * lonSpan }
    function latAt(y) { return panel.mapNorth - (y - view.offsetY) / view.renderedHeight * latSpan }
    // A picture filling the view is cropped (PreserveAspectCrop): its
    // extent is the whole map picture.
    var cropped = item.fillMode === Image.PreserveAspectCrop && item.width === width && item.height === height
    var x = cropped ? view.offsetX : item.x
    var y = cropped ? view.offsetY : item.y
    var w = cropped ? view.renderedWidth : item.width
    var h = cropped ? view.renderedHeight : item.height
    return { west: lonAt(x), east: lonAt(x + w), north: latAt(y), south: latAt(y + h) }
  }
  function keepPictures() {
    var frame = frameRepeater.itemAt(panel.radarDisplayedFrameIndex)
    if (frame && frame.status === Image.Ready && frame.visible)
      staleFrame = { source: frame.source, extent: extentOf(frame) }
    else if (!panel.radarHasDisplayedFrame && staleFrame) {
      // Still waiting since the last move: keep the older picture.
    } else staleFrame = null
  }
  Connections {
    target: radarMapItem.panel
    function onMapViewAboutToMove() { radarMapItem.keepPictures() }
    function onRadarHasDisplayedFrameChanged() {
      if (radarMapItem.panel.radarHasDisplayedFrame) radarMapItem.staleFrame = null
    }
  }

  // Everything tied to the ground moves together while the map is dragged;
  // on release the view itself moves (panel.panMap) and this returns to 0.
  Item {
    id: geo
    x: radarMapItem.dragX
    y: radarMapItem.dragY
    width: radarMapItem.width
    height: radarMapItem.height

    // The ground under every radar source; DWD frames are the radar layer
    // alone since they stopped carrying the basemap themselves.
    WeatherMapGround {
      anchors.fill: parent
      panel: radarMapItem.panel
      viewport: radarMapItem.viewport
    }

    // The last frame at its old place until the frame for the new view is in.
    WeatherStalePicture {
      picture: radarMapItem.staleFrame
      visible: !panel.radarHasDisplayedFrame
      viewport: radarMapItem.viewport
      panel: radarMapItem.panel
    }

    // Keep every frame as a live Image item and only change which one
    // is visible. This avoids resetting an Image source (and its status)
    // at each step, so playback never flashes a loading message.
    Repeater {
      id: frameRepeater
      model: panel.radarFrames
      WeatherRemoteImage {
        // A RainViewer tile has its own scale and is square: it is drawn at
        // that scale around the centre instead of being stretched over the
        // view. Map pictures fill the view like the basemap.
        readonly property bool tile: !!modelData.rainViewer
        width: tile ? radarMapItem.rainViewerTilePixels : radarMapItem.width
        height: tile ? radarMapItem.rainViewerTilePixels : radarMapItem.height
        x: (radarMapItem.width - width) / 2
        y: (radarMapItem.height - height) / 2
        store: panel.mapImages
        remoteUrl: panel.radarFrameUrl(modelData)
        load: panel.radarFrameLoadAllowed(index)
        visible: index === panel.radarDisplayedFrameIndex && status === Image.Ready && !jmaLayer.covering
        onStatusChanged: if (status !== Image.Error) panel.updateRadarFrameStatus(index, status, modelData)
        onFailed: panel.updateRadarFrameStatus(index, Image.Error, modelData)
        Component.onCompleted: panel.updateRadarFrameStatus(index, status, modelData)
      }
    }

    // Japan: JMA's radar tiles over the frames above (WeatherJmaRadarLayer).
    WeatherJmaRadarLayer {
      id: jmaLayer
      anchors.fill: parent
      panel: radarMapItem.panel
      viewport: radarMapItem.viewport
    }

    // Distance rings around the place (25/50/100 km or miles, by zoom), so the
    // distance to the rain reads at a glance. Labels are Text for sharp type.
    Item {
      id: distanceRings
      anchors.fill: parent
      visible: radarMapItem.panel.displaySetting("radarRings", true)
      readonly property bool imperial: radarMapItem.panel.useImperial
      readonly property real unitKm: imperial ? 1.609344 : 1
      readonly property var center: Model.mapPoint(radarMapItem.viewport,
        radarMapItem.panel.forecastRequestLatitude || radarMapItem.panel.mapCenterLatitude,
        radarMapItem.panel.forecastRequestLongitude || radarMapItem.panel.mapCenterLongitude,
        radarMapItem.panel.mapWest, radarMapItem.panel.mapEast, radarMapItem.panel.mapSouth, radarMapItem.panel.mapNorth)
      // About three rings across the half width.
      readonly property real step: {
        var half = radarMapItem.panel.mapRadiusKm / unitKm
        var choices = [5, 10, 20, 25, 50, 100, 200, 250, 500]
        for (var i = 0; i < choices.length; ++i) if (choices[i] >= half / 3) return choices[i]
        return choices[choices.length - 1]
      }
      readonly property var radii: {
        var list = []
        var half = radarMapItem.panel.mapRadiusKm / unitKm
        for (var r = step; r <= half * 1.3 && list.length < 5; r += step) list.push(r)
        return list
      }
      readonly property real pixelsPerUnit: radarMapItem.viewport.pixelsPerKm * unitKm

      Canvas {
        id: ringCanvas
        anchors.fill: parent
        property var key: [distanceRings.center.x, distanceRings.center.y, distanceRings.radii, distanceRings.pixelsPerUnit,
          radarMapItem.drawnMap, radarMapItem.panel.foreground]
        onKeyChanged: requestPaint()
        onWidthChanged: requestPaint()
        onHeightChanged: requestPaint()
        onPaint: {
          var ctx = getContext("2d")
          ctx.reset()
          // The satellite background is dark whatever the theme: light rings
          // over a faint dark line read on land, water and rain alike. The
          // drawn map takes the text colour over a halo of the background.
          var drawn = radarMapItem.drawnMap
          var ink = radarMapItem.panel.foreground
          var surface = Color.popups.background
          ctx.lineWidth = 3
          ctx.strokeStyle = drawn ? Qt.rgba(surface.r, surface.g, surface.b, 0.5) : "rgba(0,0,0,0.25)"
          for (var s = 0; s < distanceRings.radii.length; ++s) {
            ctx.beginPath()
            ctx.arc(distanceRings.center.x, distanceRings.center.y,
              distanceRings.radii[s] * distanceRings.pixelsPerUnit, 0, Math.PI * 2)
            ctx.stroke()
          }
          ctx.lineWidth = 1
          ctx.strokeStyle = drawn ? Qt.rgba(ink.r, ink.g, ink.b, 0.45) : "rgba(255,255,255,0.6)"
          for (var i = 0; i < distanceRings.radii.length; ++i) {
            ctx.beginPath()
            ctx.arc(distanceRings.center.x, distanceRings.center.y,
              distanceRings.radii[i] * distanceRings.pixelsPerUnit, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      }

      Repeater {
        model: distanceRings.radii

        Text {
          textFormat: Text.PlainText
          required property real modelData
          x: distanceRings.center.x - implicitWidth / 2
          y: distanceRings.center.y - modelData * distanceRings.pixelsPerUnit - implicitHeight / 2
          text: radarMapItem.panel.localizedNumber(modelData) + (distanceRings.imperial ? " mi" : " km")
          color: radarMapItem.drawnMap ? radarMapItem.panel.foreground : "white"
          opacity: 0.9
          style: Text.Outline
          styleColor: radarMapItem.drawnMap ? Color.popups.background : "#99000000"
          font.family: radarMapItem.panel.fontFamily
          font.pixelSize: Style.font.caption
        }
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
        // The 5x7 grid spans the map picture, which may be cropped.
        var viewport = radarMapItem.viewport
        var cellWidth = viewport.renderedWidth / 6 * 1.08
        var cellHeight = viewport.renderedHeight / 4 * 1.08
        for (var i = 0; i < grid.length; ++i) {
          var amount = Math.max(0, Number(grid[i].precipitation || 0))
          if (amount < 0.02) continue
          var point = Model.mapPoint(viewport, grid[i].latitude, grid[i].longitude,
            panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
          var x = point.x
          var y = point.y
          ctx.fillStyle = amount >= 40 ? "rgba(188,46,219,0.82)"
            : (amount >= 4 ? "rgba(227,67,55,0.76)"
              : (amount >= 0.5 ? "rgba(246,183,52,0.70)" : "rgba(58,151,224,0.62)"))
          ctx.fillRect(x - cellWidth / 2, y - cellHeight / 2, cellWidth, cellHeight)
        }
      }
    }

    // While the frame loads the ground stays visible (with the previous
    // frame, after a move); a note at the top says so.
    Rectangle {
      visible: !panel.radarHasDisplayedFrame && !panel.radarUsesModelFallback
      anchors.horizontalCenter: parent.horizontalCenter
      anchors.top: parent.top
      anchors.topMargin: Style.space(10)
      width: loadingText.implicitWidth + Style.space(14)
      height: loadingText.implicitHeight + Style.space(6)
      radius: Style.cornerRadius
      color: Color.popups.background
      opacity: 0.9
      Text {
        textFormat: Text.PlainText
        id: loadingText
        anchors.centerIn: parent
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
      property var anchorPoint: radarMapItem.placePoint
      onAnchorPointChanged: requestPaint()
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

        // Match Image.PreserveAspectCrop for the WMS source, including the
        // vertical crop in the wide radar viewport.
        var sourceWidth = panel.mapImageWidth
        var sourceHeight = panel.mapImageHeight
        var imageScale = Math.max(width / sourceWidth, height / sourceHeight)
        var renderedWidth = sourceWidth * imageScale
        var renderedHeight = sourceHeight * imageScale
        var imageOffsetX = (width - renderedWidth) / 2
        var imageOffsetY = (height - renderedHeight) / 2
        var occupied = []
        if (radarZoomControls.visible)
          occupied.push({ x: radarZoomControls.x, y: radarZoomControls.y, w: radarZoomControls.width, h: radarZoomControls.height })

        var centerX = radarMapItem.placePoint.x
        var centerY = radarMapItem.placePoint.y
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
      property var motionData: panel.radarDrift
      property color arrowColor: panel.foreground
      property real pixelsPerKm: radarMapItem.viewport.pixelsPerKm
      property var anchorPoint: radarMapItem.placePoint
      onAnchorPointChanged: requestPaint()
      onMotionDataChanged: requestPaint()
      onArrowColorChanged: requestPaint()
      onPixelsPerKmChanged: requestPaint()
      onWidthChanged: requestPaint()
      onHeightChanged: requestPaint()
      onPaint: {
        var ctx = getContext("2d")
        ctx.clearRect(0, 0, width, height)
        // Radar-tracked where possible, else the 700 hPa or surface wind
        // (Model.rainDriftAt), for the time of the frame on screen. Drawn at
        // the map's true scale: the tail is where the rain was the labelled
        // time before it reaches the place (Model.driftArrow).
        var arrow = Model.driftArrow(motionData, pixelsPerKm, width, height, 46, 22)
        if (!arrow) return
        var dx = arrow.dx
        var dy = arrow.dy
        // Slow rain still gets a visible arrow; its labels are dropped below.
        var length = Math.max(18, arrow.length)
        var headX = radarMapItem.placePoint.x
        var headY = radarMapItem.placePoint.y
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

        // Middle waypoint with a shorter crossbar than the origin.
        var middle = null
        for (var m = 0; m < arrow.marks.length; ++m) if (arrow.marks[m].fraction < 1) middle = arrow.marks[m]
        if (middle) {
          var middleX = headX - dx * length * middle.fraction
          var middleY = headY - dy * length * middle.fraction
          ctx.beginPath()
          ctx.moveTo(middleX + normalX * 7, middleY + normalY * 7)
          ctx.lineTo(middleX - normalX * 7, middleY - normalY * 7)
          ctx.stroke()
        }

        // In near-calm air, or when not even 5 minutes fit, the arrow is too
        // short for honest time labels; the crossbars alone show the drift.
        if (!arrow.minutes || arrow.length < 36) return

        ctx.font = panel.canvasFont(Style.font.bodySmall, true)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        function drawTimeLabel(text, x, y) {
          var labelWidth = ctx.measureText(text).width + 12
          var labelHeight = 20
          var left = Math.max(2, Math.min(width - labelWidth - 2, x - labelWidth / 2))
          var top = Math.max(2, Math.min(height - labelHeight - 2, y - labelHeight / 2))
          ctx.fillStyle = "rgba(244,246,248,0.90)"
          ctx.fillRect(left, top, labelWidth, labelHeight)
          ctx.fillStyle = "#111820"
          ctx.fillText(text, left + labelWidth / 2, top + labelHeight / 2 + 1)
        }
        // The two labels sit on opposite sides of the line so they cannot
        // merge when the arrow is short.
        drawTimeLabel(Model.driftTimeLabel(arrow.minutes), tailX - normalX * 34, tailY - normalY * 34)
        // The middle label only where the two cannot crowd each other.
        if (middle && arrow.length >= 80) {
          var middleLabelX = headX - dx * length * middle.fraction + normalX * 34
          var middleLabelY = headY - dy * length * middle.fraction + normalY * 34
          drawTimeLabel(Model.driftTimeLabel(middle.minutes), middleLabelX, middleLabelY)
        }
      }
    }

    Rectangle {
      x: radarMapItem.placePoint.x - width / 2
      y: radarMapItem.placePoint.y - height / 2
      width: 12
      height: 12
      radius: 6
      color: "transparent"
      border.color: "#ff3b30"
      border.width: 3
    }
  }

  // Drag to move the map, the wheel zooms towards the pointer.
  WeatherMapGestures {
    anchors.fill: parent
    mapItem: radarMapItem
    panel: radarMapItem.panel
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
    credits: (radarMapItem.panel.radarDisplayProviderId === "jma"
      ? [["Radar © JMA", "https://www.jma.go.jp/bosai/nowc/"]]
      : (radarMapItem.panel.radarActiveProviderId === "rainviewer"
        ? [["Radar © RainViewer", "https://www.rainviewer.com/"]] : []))
      .concat(radarMapItem.drawnMap ? [["Natural Earth", "https://www.naturalearthdata.com/"]] : [])
  }

  Timer {
    interval: panel.radarFrameIndex >= panel.radarFrames.length - 1 ? 1300 : 600
    repeat: true
    // Playback holds while the window is hidden or minimised.
    running: panel.radarShown
      && panel.radarPlaying
      && panel.radarPlayableFrameCount > 1
      && (!radarMapItem.Window.window || (radarMapItem.Window.window.visible
        && radarMapItem.Window.window.visibility !== Window.Minimized))
    onTriggered: {
      var next = panel.nextRadarFrameIndex()
      if (panel.radarFrameReady[next]) panel.selectRadarFrame(next)
    }
  }
}
