import QtQuick
import qs.Commons
import qs.Ui
import "Model.js" as Model

// My places: every favourite on one line in the body size, with the values
// the current weather can show, in the order chosen under Settings →
// Display. A click (or Alt+1…9, Alt+←/→) makes the place the shown one.
Column {
  id: favoritesSection
  required property var panel
  // As a tab the strip above already separates it from the section before.
  property bool inTab: false
  // The topmost section shown draws no line above it.
  property bool leading: false
  visible: panel.showFavoritesSection
  width: parent ? parent.width : 0
  spacing: Style.space(8)

  readonly property bool showSymbol: panel.displaySetting("favoritesSymbol", true)
  readonly property var columns: panel.displayFavoritesOrder.filter(function(key) {
    return panel.displaySetting(key, true)
  })

  FontMetrics {
    id: valueMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.body
  }
  // Names measured bold (the shown place is bold), so no name jumps.
  FontMetrics {
    id: nameMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.body
    font.bold: true
  }
  FontMetrics {
    id: headingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    font.letterSpacing: 1
  }

  // Column headings, the short labels of the current weather. The
  // temperature needs none: its degree sign says what it is.
  function headingText(key) {
    if (key === "favoritesFeelsLike")
      return panel.interfaceLanguage === "de" ? "GEFÜHLT" : panel.upperLabel(panel.i18n("feelsLikeShort"))
    if (key === "favoritesWind") return panel.upperLabel(panel.i18n("wind"))
    if (key === "favoritesHumidity") return panel.upperLabel(panel.i18n("humidity"))
    if (key === "favoritesMoon") return panel.upperLabel(panel.i18n("moon"))
    return ""
  }

  function valueText(row, key) {
    if (key === "favoritesTemperature") return row.temperature !== "" ? row.temperature + "°" : "–"
    if (key === "favoritesFeelsLike") return row.feelsLike || "–"
    if (key === "favoritesWind") return row.wind || "–"
    if (key === "favoritesHumidity") return row.humidity || "–"
    if (key === "favoritesMoon") return panel.heroMoonText
    return ""
  }

  // Each value column as wide as its widest entry, so the rows line up.
  function columnWidth(key) {
    var widest = 0
    var rows = panel.favoriteRows
    for (var i = 0; i < rows.length; ++i) widest = Math.max(widest, valueMetrics.advanceWidth(valueText(rows[i], key)))
    if (key === "favoritesMoon") widest += valueMetrics.height + 2 + Style.space(4)
    var heading = headingText(key)
    if (heading !== "") widest = Math.max(widest, headingMetrics.advanceWidth(heading) + heading.length)
    return Math.ceil(widest)
  }
  // Layout of every row: left margin, symbol, name, then the values right
  // after the name, so each line reads as one unit even in the wide app.
  // The name column is as wide as the longest name, at most 40 % of the row.
  readonly property real rowMargin: Style.space(10)
  readonly property real columnGap: Style.space(14)
  readonly property real symbolWidth: showSymbol ? Style.space(22) : 0
  // In a narrow view it gives way so the values still fit, down to 60 px.
  readonly property real valuesWidth: {
    var total = 0
    for (var c = 0; c < columns.length; ++c) total += (columnWidths[columns[c]] || 0) + (c > 0 ? columnGap : 0)
    return total
  }
  readonly property real nameWidth: {
    var widest = 0
    var rows = panel.favoriteRows
    for (var i = 0; i < rows.length; ++i) widest = Math.max(widest, nameMetrics.advanceWidth(rows[i].name))
    var available = width - rowMargin - Style.space(6) - (showSymbol ? symbolWidth + columnGap : 0)
      - (columns.length ? columnGap + valuesWidth : 0)
    return Math.max(Style.space(60), Math.min(Math.ceil(widest) + Style.space(4), width * 0.4, available))
  }
  readonly property real valuesX: rowMargin + (showSymbol ? symbolWidth + columnGap : 0) + nameWidth + columnGap
  // The table as a block, centred in the section (title and key hint keep
  // the section's edges like every other section's).
  readonly property real blockWidth: Math.min(width, valuesX + (columns.length ? valuesWidth : 0) + Style.space(10))
  readonly property real blockX: Math.max(0, Math.floor((width - blockWidth) / 2))
  readonly property var columnWidths: {
    var widths = {}
    for (var c = 0; c < columns.length; ++c) widths[columns[c]] = columnWidth(columns[c])
    return widths
  }

  Rectangle {
    visible: !favoritesSection.inTab && !favoritesSection.leading
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Item {
    width: parent.width
    height: favoritesTitle.implicitHeight

    Text {
      textFormat: Text.PlainText
      id: favoritesTitle
      anchors.left: parent.left
      text: panel.upperLabel(panel.i18n("myPlaces"))
      color: panel.mutedText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.bodySmall
      font.letterSpacing: 1
    }

    // Where the keys act, in muted type.
    Text {
      textFormat: Text.PlainText
      anchors.right: parent.right
      anchors.baseline: favoritesTitle.baseline
      width: Math.min(implicitWidth, parent.width - favoritesTitle.implicitWidth - Style.space(12))
      text: panel.i18n("favoritesKeysHint")
      color: panel.hintText
      font.family: panel.fontFamily
      font.pixelSize: Style.font.caption
      elide: Text.ElideRight
      horizontalAlignment: Text.AlignRight
    }
  }

  Column {
    width: parent.width
    spacing: 0

    // Headings over the value columns, right-aligned like the values.
    Item {
      width: parent.width
      height: headingRow.implicitHeight
      visible: favoritesSection.columns.length > 0

      Row {
        id: headingRow
        x: favoritesSection.blockX + favoritesSection.valuesX
        spacing: favoritesSection.columnGap

        Repeater {
          model: favoritesSection.columns

          Text {
            textFormat: Text.PlainText
            required property string modelData
            width: favoritesSection.columnWidths[modelData] || 0
            horizontalAlignment: Text.AlignRight
            text: favoritesSection.headingText(modelData)
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.letterSpacing: 1
          }
        }
      }
    }

    Repeater {
      model: panel.favoriteRows

      Rectangle {
        id: favoriteRow
        required property var modelData
        x: favoritesSection.blockX
        width: favoritesSection.blockWidth
        height: Math.max(Style.space(30), rowContent.implicitHeight + Style.space(8))
        radius: Style.cornerRadius
        color: rowMouse.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        // The shown place.
        Rectangle {
          visible: favoriteRow.modelData.active
          anchors.left: parent.left
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(3)
          height: parent.height - Style.space(10)
          radius: width / 2
          color: Color.accent
        }

        Row {
          id: rowContent
          anchors.left: parent.left
          anchors.leftMargin: favoritesSection.rowMargin
          anchors.verticalCenter: parent.verticalCenter
          spacing: favoritesSection.columnGap

          Text {
            textFormat: Text.PlainText
            id: favoriteSymbol
            visible: favoritesSection.showSymbol
            width: favoritesSection.symbolWidth
            anchors.verticalCenter: parent.verticalCenter
            horizontalAlignment: Text.AlignHCenter
            text: favoriteRow.modelData.symbol || "–"
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.italic: favoriteRow.modelData.stale
          }

          Text {
            textFormat: Text.PlainText
            id: favoriteName
            anchors.verticalCenter: parent.verticalCenter
            width: favoritesSection.nameWidth
            text: favoriteRow.modelData.name
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
            font.bold: favoriteRow.modelData.active
            elide: Text.ElideRight
          }

          Row {
            id: valuesRow
            anchors.verticalCenter: parent.verticalCenter
            spacing: rowContent.spacing

            Repeater {
              model: favoritesSection.columns

              Row {
                required property string modelData
                width: favoritesSection.columnWidths[modelData] || 0
                layoutDirection: Qt.RightToLeft
                spacing: Style.space(4)

                Text {
                  textFormat: Text.PlainText
                  text: favoritesSection.valueText(favoriteRow.modelData, parent.modelData)
                  // Temperatures tinted on a fixed −10…35 °C scale (colour accents).
                  color: (parent.modelData === "favoritesTemperature"
                    ? panel.absoluteTemperatureAccent(favoriteRow.modelData.temperatureC) : "") || panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.body
                  font.italic: favoriteRow.modelData.stale
                }

                // The moon as it stands in that place's sky (its own tilt,
                // dimmed below its horizon).
                WeatherMoonSphere {
                  visible: parent.modelData === "favoritesMoon"
                  anchors.verticalCenter: parent.verticalCenter
                  size: valueMetrics.height
                  readonly property var look: panel.favoriteMoonLooks[favoriteRow.modelData.index] || panel.heroMoonLook
                  illuminated: look.illuminated
                  phase: panel.heroMoonPhase
                  litAngle: look.angle
                  earthshine: look.earthshine
                  opacity: look.opacity

                  // Dimmed: below that place's horizon, said on hover.
                  HoverHandler { id: favoriteMoonHover }
                  PanelToolTip {
                    visible: favoriteMoonHover.hovered && parent.look.opacity < 1
                    text: panel.i18n("moonBelowHorizon")
                    fontFamily: panel.fontFamily
                  }
                  ink: panel.foreground
                }
              }
            }
          }
        }

        MouseArea {
          id: rowMouse
          anchors.fill: parent
          hoverEnabled: true
          cursorShape: favoriteRow.modelData.active ? Qt.ArrowCursor : Qt.PointingHandCursor
          onClicked: panel.showFavorite(favoriteRow.modelData.index)
        }
      }
    }
  }
}
