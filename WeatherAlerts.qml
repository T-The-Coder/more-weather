import QtQuick
import qs.Commons
import "Providers.js" as Providers

// Active official warnings for the configured place.
Column {
  id: alertsSection
  required property var panel
  visible: panel.hasWeatherAlert
  width: parent.width
  spacing: Style.space(8)

  Repeater {
    model: panel.activeWeatherAlerts

    Rectangle {
      required property var modelData
      width: parent.width - Style.space(32)
      // Capped rather than always fitting the full text — a long
      // description + instruction (common for storm warnings) could
      // otherwise make the popup very tall, especially with more than
      // one alert active at once. Short alerts still shrink to fit.
      height: Math.min(warningContent.implicitHeight + Style.space(20), Style.space(160))
      anchors.horizontalCenter: parent.horizontalCenter
      radius: Style.cornerRadius
      color: Style.hoverFillFor(panel.foreground, panel.warningColorForSeverity(modelData.severity))
      border.color: panel.warningColorForSeverity(modelData.severity)
      border.width: 1

      Flickable {
        id: warningScroll
        anchors.fill: parent
        anchors.margins: Style.space(10)
        contentWidth: width
        contentHeight: warningContent.implicitHeight
        clip: true
        boundsBehavior: Flickable.StopAtBounds

        // A long warning scrolls in its box when a gesture begins over it
        // (Panel.routeWheel); a page scroll passing over it goes on.
        readonly property bool wheelEnabled: contentHeight > height
        // At either end the scroll goes on to the page (false).
        function takeWheel(wheel) {
          var maximum = Math.max(0, contentHeight - height)
          var next = Math.max(0, Math.min(maximum, contentY - panel.wheelPixels(wheel, false)))
          if (next === contentY) return false
          contentY = next
          return true
        }
        Component.onCompleted: panel.registerWheelArea(warningScroll)
        Component.onDestruction: panel.unregisterWheelArea(warningScroll)

        Column {
          id: warningContent
          width: parent.width
          spacing: Style.space(6)

        Row {
          width: parent.width
          spacing: Style.space(8)

          Text {
            textFormat: Text.PlainText
            text: "!"
            color: panel.warningColorForSeverity(modelData.severity)
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.bold: true
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width - parent.children[0].implicitWidth - warningPeriodText.implicitWidth - parent.spacing * 2
            text: modelData.headline
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
            font.bold: true
            font.italic: panel.cachedField(modelData, "headline")
            wrapMode: Text.WordWrap
          }

          Text {
            textFormat: Text.PlainText
            id: warningPeriodText
            text: panel.warningPeriod(modelData)
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.italic: panel.cachedField(modelData, "onset")
              || panel.cachedField(modelData, "expires")
          }
        }

        Text {
          textFormat: Text.PlainText
          width: parent.width
          text: panel.upperLabel(panel.warningSeverityLabel(modelData.severity)) + " · " + modelData.event
            + (panel.displayAlertProviderId !== ""
              ? " · " + panel.i18n(Providers.alertLabelKey(panel.displayAlertProviderId)) : "")
          color: panel.warningColorForSeverity(modelData.severity)
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
          font.bold: true
          font.italic: panel.cachedField(modelData, "severity")
            || panel.cachedField(modelData, "event")
          font.letterSpacing: 1
          elide: Text.ElideRight

          MouseArea {
            anchors.fill: parent
            enabled: panel.displayAlertProviderId !== ""
            hoverEnabled: true
            cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
            onClicked: Qt.openUrlExternally(Providers.alertLink(panel.displayAlertProviderId))
          }
        }

        Text {
          textFormat: Text.PlainText
          width: parent.width
          text: modelData.description
          visible: text !== ""
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          font.italic: panel.cachedField(modelData, "description")
          wrapMode: Text.WordWrap
        }

        Text {
          textFormat: Text.PlainText
          width: parent.width
          text: modelData.instruction
          visible: text !== ""
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.caption
          font.italic: true
          wrapMode: Text.WordWrap
        }
        }
      }
    }
  }
}
