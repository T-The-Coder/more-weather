import QtQuick
import QtQuick.Window
import qs.Commons
import qs.Ui
import "Providers.js" as Providers
import "Model.js" as Model

// Animated Best Match wind field for the map extent, after RegenVorschau:
// a colour wash of the speed and streaks drifting with the wind. Loaded only while the
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
  // The place: marker and its label sit here, the centre until the map moves.
  readonly property var placePoint: Model.mapPoint(viewport,
    panel.forecastRequestLatitude || panel.mapCenterLatitude,
    panel.forecastRequestLongitude || panel.mapCenterLongitude,
    panel.mapWest, panel.mapEast, panel.mapSouth, panel.mapNorth)
  readonly property bool drawnMap: panel.mapStyle !== "satellite"
  // The streaks move only while the tab is shown in a window that is.
  readonly property bool animating: panel.windShown && panel.windMapData.length > 0
    && (!Window.window || (Window.window.visible && Window.window.visibility !== Window.Minimized))
  property real dragX: 0
  property real dragY: 0

  // Everything tied to the ground moves together while the map is dragged;
  // on release the view itself moves (panel.panMap) and this returns to 0.
  Item {
    id: geo
    x: windMapItem.dragX
    y: windMapItem.dragY
    width: windMapItem.width
    height: windMapItem.height

    Rectangle {
      anchors.fill: parent
      color: Color.popups.background
    }

    WeatherMapGround {
      anchors.fill: parent
      panel: windMapItem.panel
      viewport: windMapItem.viewport
    }

    // The wind as a flowing field: speed as a colour wash, white streaks
    // drifting with it (WeatherWindField, after RegenVorschau).
    WeatherWindField {
      id: windField
      anchors.fill: parent
      panel: windMapItem.panel
      viewport: windMapItem.viewport
      washOpacity: windMapItem.drawnMap ? 0.5 : 0.62
      scaleKmh: panel.windLevelInfo.scaleKmh
      running: windMapItem.animating
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
      property var anchorPoint: windMapItem.placePoint
      property bool drawnStyle: windMapItem.drawnMap
      onAnchorPointChanged: requestPaint()
      onDrawnStyleChanged: requestPaint()
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
          var surface = Color.popups.background
          ctx.fillStyle = windMapItem.drawnMap ? Qt.rgba(surface.r, surface.g, surface.b, 0.8) : "rgba(0,0,0,0.72)"
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
        occupied.push({ x: windLevelControls.x, y: windLevelControls.y, w: windLevelControls.width, h: windLevelControls.height })
        if (windSummary.visible)
          occupied.push({ x: windSummary.x, y: windSummary.y, w: windSummary.width, h: windSummary.height })

        var centerX = windMapItem.placePoint.x
        var centerY = windMapItem.placePoint.y
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
      x: windMapItem.placePoint.x - width / 2
      y: windMapItem.placePoint.y - height / 2
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
    id: windGestures
    anchors.fill: parent
    mapItem: windMapItem
    panel: windMapItem.panel
  }

  // Height of the wind: ▲ higher, ▼ lower (also Shift+↑ / Shift+↓), then
  // the height itself.
  BorderSurface {
    id: windLevelControls
    anchors.left: parent.left
    anchors.top: parent.top
    anchors.margins: Style.space(8)
    width: windLevelRow.implicitWidth + Style.space(10)
    height: Style.space(28)
    radius: Style.cornerRadius
    color: Color.popups.background
    borderSpec: Border.surfaceSpec("popups", "border", Color.popups.border, Style.normalBorderWidth)

    Row {
      id: windLevelRow
      anchors.centerIn: parent
      spacing: Style.space(4)

      Repeater {
        model: [{ glyph: "▲", delta: 1 }, { glyph: "▼", delta: -1 }]

        BorderSurface {
          id: levelButton
          required property var modelData
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(22)
          height: Style.space(20)
          radius: Style.cornerRadius
          enabled: modelData.delta < 0 ? panel.windLevelId !== "10m" : panel.windLevelId !== "250hPa"
          opacity: enabled ? 1 : 0.38
          color: Style.controlFill(false, levelMouse.containsMouse, Color.popups.text, Color.accent)
          borderSpec: Border.controlSpec(levelMouse.containsMouse ? "hover-cursor" : "normal", Color.popups.text, Color.accent)

          Text {
            anchors.centerIn: parent
            text: levelButton.modelData.glyph
            color: levelMouse.containsMouse ? Style.hoverStateColor(Color.popups.text, Color.accent) : Color.popups.text
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
          }

          MouseArea {
            id: levelMouse
            anchors.fill: parent
            enabled: levelButton.enabled
            hoverEnabled: true
            cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
            onClicked: panel.stepWindLevel(levelButton.modelData.delta)
          }
        }
      }

      Text {
        anchors.verticalCenter: parent.verticalCenter
        leftPadding: Style.space(2)
        rightPadding: Style.space(4)
        text: panel.windLevelText(panel.windLevelInfo)
          + (panel.windLevelId.indexOf("hPa") > 0 ? " · " + panel.windLevelId.replace("hPa", " hPa") : "")
        color: Color.popups.text
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        font.bold: true
      }

      // The keys, in faint type where they act.
      Text {
        anchors.verticalCenter: parent.verticalCenter
        rightPadding: Style.space(4)
        text: "⇧ ↑ ↓"
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }

  WeatherMapZoomControls {
    id: windZoomControls
    panel: windMapItem.panel
    mapItem: windMapItem
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: Style.space(8)
  }

  // The wind under the pointer: speed and where it comes from.
  Rectangle {
    readonly property var wind: windGestures.containsMouse && !windGestures.dragging
      ? windField.windAt(windGestures.mouseX - windMapItem.dragX, windGestures.mouseY - windMapItem.dragY) : null
    visible: wind !== null
    x: Math.min(parent.width - width - Style.space(4), windGestures.mouseX + Style.space(14))
    y: Math.max(Style.space(4), windGestures.mouseY - height - Style.space(6))
    width: pointerWind.implicitWidth + Style.space(12)
    height: pointerWind.implicitHeight + Style.space(6)
    radius: Style.cornerRadius
    color: Color.popups.background
    border.color: Color.popups.border
    border.width: Style.spacing.hairline
    Text {
      id: pointerWind
      anchors.centerIn: parent
      text: parent.wind
        ? panel.windMapSpeed(parent.wind.speed) + " " + panel.windMapUnit + " · "
          + panel.windDirectionName((Math.atan2(parent.wind.u, -parent.wind.v) * 180 / Math.PI + 540) % 360)
        : ""
      color: Color.popups.text
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
    }
  }

  // Colour scale of the wash.
  Column {
    anchors.left: parent.left
    anchors.bottom: parent.bottom
    anchors.leftMargin: Style.space(8)
    anchors.bottomMargin: Style.space(24)
    spacing: Style.space(2)
    visible: panel.windMapData.length > 0

    Rectangle {
      width: Style.space(150)
      height: Style.space(6)
      radius: height / 2
      gradient: Gradient {
        orientation: Gradient.Horizontal
        GradientStop { position: 0; color: "#2b1f8f" }
        GradientStop { position: 0.08; color: "#3a3fd8" }
        GradientStop { position: 0.16; color: "#2f7fe8" }
        GradientStop { position: 0.25; color: "#22b6d8" }
        GradientStop { position: 0.35; color: "#2fc98f" }
        GradientStop { position: 0.48; color: "#b6d43a" }
        GradientStop { position: 0.62; color: "#f2b33a" }
        GradientStop { position: 0.78; color: "#e8523a" }
        GradientStop { position: 1; color: "#b43ad6" }
      }
    }
    Item {
      width: Style.space(150)
      height: legendZero.implicitHeight
      Text {
        id: legendZero
        text: panel.windMapSpeed(0)
        color: Color.popups.text
        style: Text.Outline
        styleColor: Color.popups.background
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }
      Text {
        x: parent.width * 0.5 - implicitWidth / 2
        text: panel.windMapSpeed(panel.windLevelInfo.scaleKmh / 2)
        color: Color.popups.text
        style: Text.Outline
        styleColor: Color.popups.background
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }
      Text {
        anchors.right: parent.right
        text: panel.windMapSpeed(panel.windLevelInfo.scaleKmh) + " " + panel.windMapUnit
        color: Color.popups.text
        style: Text.Outline
        styleColor: Color.popups.background
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
      }
    }
  }

  WeatherMapAttribution {
    panel: windMapItem.panel
    credits: windMapItem.drawnMap ? [["Natural Earth", "https://www.naturalearthdata.com/"]] : []
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
      text: panel.windMapCurrent && panel.windLevelId !== "10m"
        ? panel.i18n("windMapSummaryAloft", {
            location: panel.reportLocation,
            speed: panel.windMapSpeed(panel.windMapCurrent.windSpeed),
            direction: panel.windDirectionName(panel.windMapCurrent.windDirection),
            unit: panel.windMapUnit
          })
        : panel.windMapCurrent
        ? panel.i18n("windMapSummary", {
            location: panel.reportLocation,
            speed: panel.windMapSpeed(panel.windMapCurrent.windSpeed),
            direction: panel.windDirectionName(panel.windMapCurrent.windDirection),
            gust: panel.windMapSpeed(panel.windMapCurrent.windGust),
            unit: panel.windMapUnit
          })
        : panel.i18n("windDataLoading")
      color: Color.popups.text
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
      font.italic: panel.windMapUsesCache
    }
  }

}
