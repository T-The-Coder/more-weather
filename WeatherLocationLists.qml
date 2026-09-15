import QtQuick
import qs.Commons

// Saved-locations dropdown, geocoding suggestions and the saved list shown
// inside search. Only one of these states is ever visible at a time.
Column {
  id: locationLists
  required property var panel
  width: parent ? parent.width : 0
  spacing: Style.space(14)
  visible: (panel.showSavedLocations && !panel.editingLocation)
    || (panel.editingLocation && !panel.savingLocation
      && (panel.locationSuggestions.length > 0 || panel.savedLocations.length > 0))

  // ---- Saved-locations dropdown ("Ortsverwaltung"). Pinned
  // auto-detect row first (mirrors the pin icon above), then the
  // user's saved locations.
  Column {
    visible: panel.showSavedLocations && !panel.editingLocation
    width: parent.width
    spacing: 0

    // Pinned, non-removable auto-detect row.
    Rectangle {
      width: parent.width
      height: autoRow.implicitHeight + Style.space(12)
      radius: Style.cornerRadius
      color: autoRowArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

      Row {
        id: autoRow
        anchors.left: parent.left
        anchors.leftMargin: Style.space(16)
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(8)

        Text {
          text: ""  // nf-fa-map_marker, same glyph as the pin icon above
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }
        Text {
          text: panel.i18n("useCurrentLocation")
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }
      }

      MouseArea {
        id: autoRowArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: { panel.useDetectedLocation(); panel.showSavedLocations = false }
      }
    }

    Repeater {
      model: panel.savedLocations

      Rectangle {
        required property var modelData
        required property int index
        width: parent.width
        height: savedRow.implicitHeight + Style.space(12)
        radius: Style.cornerRadius
        color: savedRowArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        Row {
          id: savedRow
          anchors.left: parent.left
          anchors.leftMargin: Style.space(16)
          anchors.verticalCenter: parent.verticalCenter
          spacing: Style.space(8)

          Text {
            text: modelData.name
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }
        }

        // Non-overlapping with removeButton (anchored to its left
        // edge) -- no click-propagation tricks needed.
        MouseArea {
          id: savedRowArea
          anchors.left: parent.left
          anchors.right: removeButton.left
          anchors.top: parent.top
          anchors.bottom: parent.bottom
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onClicked: panel.selectSavedLocation(modelData)
        }

        Rectangle {
          id: removeButton
          width: Style.space(18)
          height: Style.space(18)
          anchors.right: parent.right
          anchors.rightMargin: Style.space(12)
          anchors.verticalCenter: parent.verticalCenter
          radius: Math.min(4, Style.cornerRadius)
          color: removeButtonArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

          Text {
            anchors.centerIn: parent
            text: "✕"
            font.family: panel.fontFamily
            color: panel.mutedText
            font.pixelSize: Style.font.bodySmall
          }

          MouseArea {
            id: removeButtonArea
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.removeSavedLocation(index)
          }
        }
      }
    }
  }

  // ---- Geocoding suggestions while the location is being edited.
  Column {
    visible: panel.editingLocation && !panel.savingLocation && panel.locationSuggestions.length > 0
    width: parent.width
    spacing: 0

    Repeater {
      model: panel.locationSuggestions

      Rectangle {
        required property var modelData
        required property int index
        width: parent.width
        height: suggestionRow.implicitHeight + Style.space(12)
        radius: Style.cornerRadius
        color: panel.searchFocusSection === "suggestions"
          && index === panel.suggestionIndex
          ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

        Row {
          id: suggestionRow
          anchors.left: parent.left
          anchors.leftMargin: Style.space(16)
          anchors.verticalCenter: parent.verticalCenter
          spacing: Style.space(8)

          Text {
            text: modelData.name
            color: panel.searchFocusSection === "suggestions"
              && index === panel.suggestionIndex
              ? Style.hoverStateColor(panel.foreground, Color.accent) : panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }
          Text {
            visible: text !== ""
            text: modelData.description
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            anchors.verticalCenter: parent.verticalCenter
          }
        }

        // Non-overlapping with addSuggestionButton (anchored to its
        // left edge) -- clicking the name still picks/switches; the "+"
        // button below only bookmarks, without switching or closing.
        MouseArea {
          anchors.left: parent.left
          anchors.right: addSuggestionButton.left
          anchors.top: parent.top
          anchors.bottom: parent.bottom
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onPositionChanged: {
            panel.searchFocusSection = "suggestions"
            panel.suggestionIndex = index
          }
          onClicked: panel.pickSuggestion(modelData)
        }

        Rectangle {
          id: addSuggestionButton
          width: Style.space(18)
          height: Style.space(18)
          anchors.right: parent.right
          anchors.rightMargin: Style.space(12)
          anchors.verticalCenter: parent.verticalCenter
          radius: Math.min(4, Style.cornerRadius)
          color: addSuggestionArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

          Text {
            anchors.centerIn: parent
            text: "+"
            font.family: panel.fontFamily
            color: panel.mutedText
            font.pixelSize: Style.font.bodySmall
          }

          MouseArea {
            id: addSuggestionArea
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.addSavedLocation(modelData)
          }
        }
      }
    }
  }
  // ---- Saved locations, also reachable from inside search (same
  // rows/behavior as the dropdown, so removing/switching doesn't
  // require closing search first).
  Rectangle {
    visible: panel.editingLocation && !panel.savingLocation && panel.savedLocations.length > 0
    width: parent.width
    height: Style.spacing.hairline
    color: panel.foreground
    opacity: 0.12
  }

  Column {
    visible: panel.editingLocation && !panel.savingLocation && panel.savedLocations.length > 0
    width: parent.width
    spacing: 0

    Rectangle {
      width: parent.width
      height: searchAutoRow.implicitHeight + Style.space(12)
      radius: Style.cornerRadius
      color: searchAutoRowArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

      Row {
        id: searchAutoRow
        anchors.left: parent.left
        anchors.leftMargin: Style.space(16)
        anchors.verticalCenter: parent.verticalCenter
        spacing: Style.space(8)

        Text {
          text: ""  // nf-fa-map_marker, same glyph as the pin icon above
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }
        Text {
          text: panel.i18n("useCurrentLocation")
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.body
        }
      }

      MouseArea {
        id: searchAutoRowArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: panel.useDetectedLocation()
      }
    }

    Repeater {
      model: panel.savedLocations

      Rectangle {
        required property var modelData
        required property int index
        width: parent.width
        height: searchSavedRow.implicitHeight + Style.space(12)
        radius: Style.cornerRadius
        color: panel.searchFocusSection === "saved"
          && index === panel.savedLocationIndex
          ? Style.hoverFillFor(panel.foreground, Color.accent)
          : (searchSavedRowArea.containsMouse
            ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent")

        Row {
          id: searchSavedRow
          anchors.left: parent.left
          anchors.leftMargin: Style.space(16)
          anchors.verticalCenter: parent.verticalCenter
          spacing: Style.space(8)

          Text {
            text: modelData.name
            color: panel.searchFocusSection === "saved"
              && index === panel.savedLocationIndex
              ? Style.hoverStateColor(panel.foreground, Color.accent)
              : panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }
        }

        MouseArea {
          id: searchSavedRowArea
          anchors.left: parent.left
          anchors.right: searchRemoveButton.left
          anchors.top: parent.top
          anchors.bottom: parent.bottom
          hoverEnabled: true
          cursorShape: Qt.PointingHandCursor
          onPositionChanged: {
            panel.searchFocusSection = "saved"
            panel.savedLocationIndex = index
          }
          onClicked: panel.pickSuggestion(modelData)
        }

        Rectangle {
          id: searchRemoveButton
          width: Style.space(18)
          height: Style.space(18)
          anchors.right: parent.right
          anchors.rightMargin: Style.space(12)
          anchors.verticalCenter: parent.verticalCenter
          radius: Math.min(4, Style.cornerRadius)
          color: searchRemoveButtonArea.containsMouse ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

          Text {
            anchors.centerIn: parent
            text: "✕"
            font.family: panel.fontFamily
            color: panel.mutedText
            font.pixelSize: Style.font.bodySmall
          }

          MouseArea {
            id: searchRemoveButtonArea
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.removeSavedLocation(index)
          }
        }
      }
    }
  }
}
