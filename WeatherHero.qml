import QtQuick
import qs.Commons
import qs.Ui

// Current conditions: icon and temperature on the left, equal statistic
// columns flush right, then the location / freshness / settings meta line.
Column {
  id: heroBlock
  required property var panel
  readonly property alias locationField: locationField

  function spinRefresh() { refreshSpin.restart() }

  // In the widget, symbol and temperature open the app; they light up on
  // hover like the clock panel's hero.
  readonly property color heroColor: heroOpenMouse.containsMouse
    ? Style.hoverStateColor(panel.foreground, Color.accent) : panel.foreground

  width: parent.width
  // The large temperature brings generous line leading of its own;
  // pull the meta line up into it instead of stacking more space.
  spacing: -Style.space(8)

  Item {
    id: heroRow
    width: parent.width
    height: Math.max(heroLeft.implicitHeight, weatherStats.implicitHeight)

    // Weather glyphs carry far more empty space than digits, so equal font
    // sizes do not look equal. The symbol is sized from ink bounds to the
    // height of the temperature digits and centred on their ink, not on the
    // two text boxes.
    FontMetrics {
      id: digitMetrics
      font: tempBig.font
    }

    FontMetrics {
      id: glyphReferenceMetrics
      font.family: panel.fontFamily
      font.pixelSize: 100
    }

    Row {
      id: heroLeft
      anchors.left: parent.left
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(16)

      Text {
        id: heroIcon
        visible: !panel.heroNightSymbol && panel.displaySetting("heroSymbol", true)
        // tightBoundingRect() is a plain method, so read a metrics property
        // first to re-measure when the font (or its fallback) changes.
        readonly property rect digitInk: digitMetrics.height > 0
          ? digitMetrics.tightBoundingRect("0") : Qt.rect(0, 0, 0, 0)
        readonly property rect glyphInk: glyphReferenceMetrics.height > 0
          ? glyphReferenceMetrics.tightBoundingRect(text) : Qt.rect(0, 0, 0, 0)
        readonly property real inkScale: glyphInk.height > 0 ? glyphInk.height / 100 : 0.8
        // Clamped so an unusually flat or tall glyph cannot blow up the row.
        readonly property int opticalSize: Math.round(Math.max(tempBig.font.pixelSize * 0.9,
          Math.min(tempBig.font.pixelSize * 1.8, digitInk.height / inkScale)))
        // Ink centre relative to the box centre, for the glyph and the digits.
        readonly property real glyphInkOffset: (glyphReferenceMetrics.ascent + glyphInk.y
          + glyphInk.height / 2) * opticalSize / 100 - height / 2
        readonly property real digitInkOffset: digitMetrics.ascent + digitInk.y
          + digitInk.height / 2 - tempBig.height / 2

        anchors.verticalCenter: parent.verticalCenter
        anchors.verticalCenterOffset: Math.round(digitInkOffset - glyphInkOffset)
        text: panel.displayLabel || "—"
        color: heroBlock.heroColor
        font.family: panel.fontFamily
        font.pixelSize: opticalSize
        font.italic: panel.weatherSymbolCached
        transform: Scale {
          origin.x: heroIcon.width / 2
          xScale: panel.mirrorsGlyph(heroIcon.text) ? -1 : 1
        }
      }

      // A little taller than the digits: the moon sits above the cloud, and
      // matching only the digit height would shrink the cloud itself.
      WeatherNightSymbol {
        visible: !!panel.heroNightSymbol && panel.displaySetting("heroSymbol", true)
        anchors.verticalCenter: parent.verticalCenter
        anchors.verticalCenterOffset: Math.round(heroIcon.digitInkOffset)
        moonGlyph: panel.heroNightSymbol ? panel.heroNightSymbol.moon : ""
        weatherGlyph: panel.heroNightSymbol ? panel.heroNightSymbol.weather : ""
        fontFamily: panel.fontFamily
        color: heroBlock.heroColor
        italic: panel.weatherSymbolCached
        mirrored: !!(panel.heroNightSymbol && panel.heroNightSymbol.mirrored)
        moonOnLeft: !!(panel.heroNightSymbol && panel.heroNightSymbol.moonOnLeft)
        inkHeight: heroIcon.digitInk.height * 1.15
      }

      Row {
        anchors.verticalCenter: parent.verticalCenter
        visible: panel.displaySetting("heroTemperature", true)
        spacing: Style.space(2)
        // "15 °C" keeps its reading order in right-to-left languages.
        LayoutMirroring.enabled: false

        Text {
          id: tempBig
          text: panel.reportTempNum || "—"
          color: heroBlock.heroColor
          font.family: panel.fontFamily
          font.pixelSize: heroRow.width < 680 ? 48 : 56
          font.bold: true
          font.italic: panel.currentTemperatureCached
        }
        Text {
          text: panel.current ? panel.tempUnit : ""
          color: heroBlock.heroColor
          font.family: panel.fontFamily
          font.pixelSize: Style.font.display
          font.italic: panel.currentTemperatureCached
          anchors.top: tempBig.top
          anchors.topMargin: Style.space(10)
        }
      }
    }

    MouseArea {
      id: heroOpenMouse
      x: heroLeft.x
      y: heroLeft.y
      width: heroLeft.width
      height: heroLeft.height
      enabled: !panel.standaloneMode
      hoverEnabled: enabled
      cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
      onClicked: panel.openApp()

      PanelToolTip {
        visible: heroOpenMouse.containsMouse
        text: panel.i18n("openInApp")
        fontFamily: panel.fontFamily
      }
    }

    // Equal-width columns sized by the longest localized label, the
    // last one ending on the panel's right edge.
    Row {
      id: weatherStats
      visible: !!panel.current
      anchors.right: parent.right
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(24)
      // Equal columns, measured off the labels and values themselves. The
      // delegates below are built from the chosen order, so the widths come
      // from these hidden twins instead.
      property real statColumnWidth: Math.max(feelsLabelMetrics.width, windLabelMetrics.width,
        humidityLabelMetrics.width, feelsValueMetrics.width, windValueMetrics.width,
        humidityValueMetrics.width)

      TextMetrics {
        id: feelsLabelMetrics
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        font.letterSpacing: 1
        text: panel.interfaceLanguage === "de" ? "GEFÜHLT" : panel.upperLabel(panel.i18n("feelsLikeShort"))
      }
      TextMetrics {
        id: windLabelMetrics
        font: feelsLabelMetrics.font
        text: panel.upperLabel(panel.i18n("wind"))
      }
      TextMetrics {
        id: humidityLabelMetrics
        font: feelsLabelMetrics.font
        text: panel.upperLabel(panel.i18n("humidity"))
      }
      TextMetrics {
        id: feelsValueMetrics
        font.family: panel.fontFamily
        font.pixelSize: Style.font.title
        text: panel.reportFeels
      }
      TextMetrics {
        id: windValueMetrics
        font: feelsValueMetrics.font
        text: panel.reportWind
      }
      TextMetrics {
        id: humidityValueMetrics
        font: feelsValueMetrics.font
        text: panel.reportHumidity
      }

      // The three values in the order chosen under Settings → Display.
      Repeater {
        model: panel.displayHeroOrder

        Column {
          required property string modelData
          readonly property bool isFeels: modelData === "heroFeelsLike"
          readonly property bool isWind: modelData === "heroWind"
          visible: panel.displaySetting(modelData, true)
          width: weatherStats.statColumnWidth
          spacing: Style.space(5)

          Text {
            text: parent.isFeels
              ? (panel.interfaceLanguage === "de" ? "GEFÜHLT" : panel.upperLabel(panel.i18n("feelsLikeShort")))
              : panel.upperLabel(panel.i18n(parent.isWind ? "wind" : "humidity"))
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.letterSpacing: 1
          }

          Text {
            text: parent.isFeels ? panel.reportFeels
              : (parent.isWind ? panel.reportWind : panel.reportHumidity)
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.italic: parent.isFeels ? panel.currentFeelsCached
              : (parent.isWind ? panel.currentWindCached : panel.currentHumidityCached)
          }
        }
      }
    }
  }

  Item {
    id: heroHeader
    width: parent.width
    height: Math.max(Style.space(18), locationHeaderRow.implicitHeight,
      locationEditRow.implicitHeight, locationMetaRow.implicitHeight)

    Row {
      id: locationHeaderRow
      visible: !panel.editingLocation && panel.reportLocation !== ""
      anchors.left: parent.left
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(6)

      // Pin: snap back to the auto-detected location. Name: open the
      // manual search. Dropdown: saved locations. Separate hit areas so
      // the three intents never collide.
      Item {
        id: locationPin
        width: Style.space(16)
        height: Style.space(18)
        anchors.verticalCenter: parent.verticalCenter

        Text {
          anchors.centerIn: parent
          text: ""  // nf-fa-map_marker
          color: locationPinMouse.containsMouse
            ? Style.hoverStateColor(panel.foreground, Color.accent)
            : panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
        }

        MouseArea {
          id: locationPinMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.useDetectedLocation()
        }
      }

      Text {
        id: locationNameText
        width: Math.min(implicitWidth, Math.max(Style.space(90),
          heroHeader.width - locationMetaRow.width - Style.space(60)))
        text: (panel.reportLocation || "").toUpperCase()
        color: locationNameHover.hovered
          ? Style.hoverStateColor(panel.foreground, Color.accent)
          : panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        font.italic: panel.locationCached
        font.letterSpacing: 1
        elide: Text.ElideRight
        anchors.verticalCenter: parent.verticalCenter

        TapHandler {
          onTapped: panel.startEditingLocation()
        }
        HoverHandler {
          id: locationNameHover
          cursorShape: Qt.PointingHandCursor
        }
      }

      Item {
        id: locationDropdown
        width: Style.space(14)
        height: Style.space(18)
        anchors.verticalCenter: parent.verticalCenter

        Text {
          anchors.centerIn: parent
          text: "▾"
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          rotation: panel.showSavedLocations ? 180 : 0
          Behavior on rotation { NumberAnimation { duration: 120 } }
        }

        MouseArea {
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.toggleSavedLocations()
        }
      }
    }

    Row {
      id: locationEditRow
      visible: panel.editingLocation
      anchors.left: parent.left
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(6)

      TextField {
        id: locationField
        width: Style.space(190)
        enabled: !panel.savingLocation
        placeholderText: panel.i18n("searchCity")
        foreground: panel.foreground
        font.family: panel.fontFamily

        onTextChanged: if (panel.editingLocation && !panel.savingLocation) panel.scheduleGeocode()
        onTextEdited: {
          panel.locationSearchPristine = false
          panel.searchFocusSection = "suggestions"
        }
      }

      // Clear back to IP auto-detect. While a committed location is
      // loading, this same compact affordance becomes a spinner.
      Rectangle {
        width: Style.space(18)
        height: Style.space(18)
        anchors.verticalCenter: parent.verticalCenter
        radius: Math.min(4, Style.cornerRadius)
        color: !panel.savingLocation && clearLocationArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        Text {
          anchors.centerIn: parent
          text: panel.savingLocation ? "󰦖" : "✕"
          font.family: panel.fontFamily
          color: panel.mutedText
          font.pixelSize: Style.font.bodySmall

          RotationAnimator on rotation {
            running: panel.savingLocation
            from: 0; to: 360
            duration: 800
            loops: Animation.Infinite
          }
        }

        MouseArea {
          id: clearLocationArea
          anchors.fill: parent
          enabled: !panel.savingLocation
          hoverEnabled: true
          cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
          onClicked: panel.clearLocation()
        }
      }
    }

    // Freshness and controls, flush right like the provider label on
    // the rain section header.
    Row {
      id: locationMetaRow
      anchors.right: parent.right
      anchors.verticalCenter: parent.verticalCenter
      spacing: Style.space(8)

      Text {
        anchors.verticalCenter: parent.verticalCenter
        text: panel.lastUpdatedLabel(panel.relativeTimeNowMs, panel.displayedUpdateMs).toUpperCase()
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        font.letterSpacing: 1
        font.italic: panel.lastUpdateFromCache
      }

      Item {
        width: Style.space(18)
        height: Style.space(18)
        anchors.verticalCenter: parent.verticalCenter

        Text {
          id: refreshIcon
          anchors.centerIn: parent
          text: "↻"
          color: refreshMouse.containsMouse
            ? Style.hoverStateColor(panel.foreground, Color.accent)
            : panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }

        RotationAnimation {
          id: refreshSpin
          target: refreshIcon
          property: "rotation"
          from: 0
          to: 360
          duration: 500
        }

        MouseArea {
          id: refreshMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: {
            refreshSpin.restart()
            panel.manualRefresh()
          }
        }
      }

      Item {
        width: Style.space(18)
        height: Style.space(18)
        anchors.verticalCenter: parent.verticalCenter

        Text {
          anchors.centerIn: parent
          text: ""  // nf-fa-gear
          color: settingsIconMouse.containsMouse
            ? Style.hoverStateColor(panel.foreground, Color.accent)
            : panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }

        MouseArea {
          id: settingsIconMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: {
            if (panel.editingLocation) panel.cancelEditingLocation()
            panel.showSavedLocations = false
            panel.openSettings()
          }
        }
      }
    }
  }
}
