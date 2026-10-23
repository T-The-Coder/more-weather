// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import QtQuick.Window
import qs.Commons
import qs.Commons as Commons
import qs.Ui
import "Providers.js" as Providers
import "Model.js" as Model
import "RadarStyle.js" as RadarStyle

// Native radar frames over quiet geography with place labels, rings,
// a crosshair, scale and playback controls. Loaded only while the radar tab is shown; the
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

  WeatherRadarPalette { id: palette }

  // Where the cropped map picture lies in this view; every overlay uses it.
  readonly property var viewport: Model.mapViewport(width, height, panel.mapRadiusKm)
  Binding { target: panel; property: "radarStageWidth"; value: radarMapItem.width; restoreMode: Binding.RestoreNone }
  Binding { target: panel; property: "radarStageHeight"; value: radarMapItem.height; restoreMode: Binding.RestoreNone }
  Binding { target: panel; property: "radarDeviceRatio"; value: Screen.devicePixelRatio || 1; restoreMode: Binding.RestoreNone }
  // The place on the map: crosshair, rings and its label sit
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
      staleFrame = { source: frame.source, extent: extentOf(frame), mode: frame.paintMode }
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
      quiet: true
      viewport: radarMapItem.viewport
    }

    // The last frame at its old place until the frame for the new view is in.
    WeatherRadarFrame {
      readonly property var picture: radarMapItem.staleFrame
      readonly property var northWest: picture ? Model.mapPoint(radarMapItem.viewport, picture.extent.north, picture.extent.west,
        panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth) : ({ x: 0, y: 0 })
      readonly property var southEast: picture ? Model.mapPoint(radarMapItem.viewport, picture.extent.south, picture.extent.east,
        panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth) : ({ x: 0, y: 0 })
      source: picture ? picture.source : ""
      x: northWest.x; y: northWest.y
      width: Math.max(0, southEast.x - northWest.x)
      height: Math.max(0, southEast.y - northWest.y)
      fillMode: Image.Stretch
      visible: !panel.radarHasDisplayedFrame
      swatches: palette.texture
      sourceMode: picture ? picture.mode : 0
      treatment: panel.radarTreatment
      weakReturns: panel.radarWeakReturns
    }

    // Keep every frame as a live Image item and only change which one
    // is visible. This avoids resetting an Image source (and its status)
    // at each step, so playback never flashes a loading message.
    Repeater {
      id: frameRepeater
      model: panel.radarFrames
      WeatherRadarLayerFrame {
        required property var modelData
        required property int index
        anchors.fill: parent
        panel: radarMapItem.panel
        frameData: modelData
        viewport: radarMapItem.viewport
        swatches: palette.texture
        load: panel.radarFrameLoadAllowed(index)
        visible: index === panel.radarDisplayedFrameIndex && status === Image.Ready && !jmaLayer.covering
        onRendered: panel.updateRadarFrameReady(index, true)
        onStatusChanged: if (status !== Image.Error) panel.updateRadarFrameStatus(index, status, modelData)
        onFailed: panel.updateRadarFrameStatus(index, Image.Error, modelData)
        Component.onCompleted: panel.updateRadarFrameStatus(index, status, modelData)
      }
    }

    // Japan: JMA's radar tiles over the frames above (WeatherJmaRadarLayer).
    WeatherJmaRadarLayer {
      id: jmaLayer
      swatches: palette.texture
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
          var surface = Commons.Color.popups.background
          ctx.lineWidth = 3
          ctx.strokeStyle = Qt.rgba(surface.r, surface.g, surface.b, 0.5)
          for (var s = 0; s < distanceRings.radii.length; ++s) {
            ctx.beginPath()
            ctx.arc(distanceRings.center.x, distanceRings.center.y,
              distanceRings.radii[s] * distanceRings.pixelsPerUnit, 0, Math.PI * 2)
            ctx.stroke()
          }
          ctx.lineWidth = 1
          ctx.strokeStyle = Qt.rgba(ink.r, ink.g, ink.b, 0.18)
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
          text: panel.i18n(distanceRings.imperial ? "radarDistanceMi" : "radarDistanceKm", { count: panel.localizedNumber(modelData) })
          color: Commons.Color.popups.text
          opacity: 0.45
          style: Text.Outline
          styleColor: Commons.Color.popups.background
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
      layer.enabled: visible && GraphicsInfo.api !== GraphicsInfo.Software
      layer.effect: WeatherRadarPaint {
        swatches: palette.texture
        sourceMode: 1
        treatment: panel.radarTreatment
        weakBelow: panel.radarWeakReturns ? -32 : 5
      }
      property var gridData: panel.precipitationGrid
      property bool weakReturns: panel.radarWeakReturns
      onWeakReturnsChanged: requestPaint()
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
          if (pointAmount >= 0.02 && (weakReturns || RadarStyle.rateDbz(pointAmount) >= 5)) {
            var code = Math.max(1, Math.min(127, Math.round(RadarStyle.rateDbz(pointAmount) + 32)))
            ctx.fillStyle = GraphicsInfo.api === GraphicsInfo.Software ? RadarStyle.rateColor(pointAmount)
              : "rgb(" + code + "," + code + "," + code + ")"
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
          if (amount < 0.02 || (!weakReturns && RadarStyle.rateDbz(amount) < 5)) continue
          var point = Model.mapPoint(viewport, grid[i].latitude, grid[i].longitude,
            panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
          var x = point.x
          var y = point.y
          var code = Math.max(1, Math.min(127, Math.round(RadarStyle.rateDbz(amount) + 32)))
          ctx.fillStyle = GraphicsInfo.api === GraphicsInfo.Software ? RadarStyle.rateColor(amount)
            : "rgb(" + code + "," + code + "," + code + ")"
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
      color: Commons.Color.popups.background
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
      property color labelBackgroundColor: Commons.Color.popups.background
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

          ctx.fillStyle = String(labelColor)
          ctx.beginPath()
          ctx.arc(pointX, pointY, 1.6, 0, Math.PI * 2)
          ctx.fill()
          drawMapLabel(name, textX, pointY, String(labelColor), 0.65, 0.76)
          occupied.push(labelRect)
          drawn++
        }
      }
    }

    Item {
      x: radarMapItem.placePoint.x
      y: radarMapItem.placePoint.y
      Rectangle { x: -8; y: -0.5; width: 16; height: 1; color: Qt.alpha(Commons.Color.popups.text, 0.45) }
      Rectangle { x: -0.5; y: -8; width: 1; height: 16; color: Qt.alpha(Commons.Color.popups.text, 0.45) }
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
    showScale: false
    panel: radarMapItem.panel
    mapItem: radarMapItem
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: Style.space(8)
  }

  Rectangle {
    id: scaleBar
    anchors.left: parent.left
    anchors.bottom: parent.bottom
    anchors.margins: Style.space(8)
    readonly property var distance: RadarStyle.scaleBar(radarMapItem.viewport.pixelsPerKm, Style.space(80), panel.useImperial)
    width: Style.space(94)
    height: Style.space(28)
    color: Commons.Color.popups.background
    opacity: 0.9
    Text {
      textFormat: Text.PlainText
      anchors.horizontalCenter: parent.horizontalCenter
      text: panel.i18n(panel.useImperial ? "radarDistanceMi" : "radarDistanceKm", { count: panel.localizedNumber(scaleBar.distance.value) })
      color: Commons.Color.popups.text
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
    }
    Rectangle {
      anchors.bottom: parent.bottom
      anchors.bottomMargin: Style.space(4)
      anchors.horizontalCenter: parent.horizontalCenter
      width: scaleBar.distance.pixels
      height: Style.spacing.hairline
      color: Commons.Color.popups.text
      Rectangle { width: Style.spacing.hairline; height: Style.space(5); anchors.bottom: parent.bottom; color: Qt.alpha(Commons.Color.popups.text, 0.45) }
      Rectangle { width: Style.spacing.hairline; height: Style.space(5); anchors.right: parent.right; anchors.bottom: parent.bottom; color: Qt.alpha(Commons.Color.popups.text, 0.45) }
    }
  }
  Text {
    textFormat: Text.PlainText
    id: mapCredit
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.margins: Style.space(8)
    width: Math.max(1, parent.width - scaleBar.width - Style.space(32))
    text: panel.i18n("radarMapCredit", { source: panel.i18n(Providers.radarLabelKey(panel.radarDisplayProviderId)) })
    horizontalAlignment: Text.AlignRight
    wrapMode: Text.WordWrap
    color: Commons.Color.popups.text
    style: Text.Outline
    styleColor: Commons.Color.popups.background
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption - 2
  }

  Timer {
    interval: panel.radarFrameIndex >= panel.radarFrames.length - 1 ? 1300 : 600
    repeat: true
    // Playback holds while nobody can see it (Panel.motionAllowed: the
    // window hidden or minimised, another workspace, the monitor off).
    running: panel.radarShown
      && panel.radarPlaying
      && panel.radarPlayableFrameCount > 1
      && panel.motionAllowed
    onTriggered: {
      var next = panel.nextRadarFrameIndex()
      if (panel.radarFrameReady[next]) panel.selectRadarFrame(next)
    }
  }
}
