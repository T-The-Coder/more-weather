import QtQuick
import qs.Commons

// Credits shown on the maps: OpenStreetMap for the place labels, plus the
// radar provider when its terms ask for attribution (RainViewer's free API
// does). Each credit links to its source.
Row {
  id: attribution
  required property var panel
  // [label, url] pairs shown before the OpenStreetMap credit.
  property var credits: []
  anchors.left: parent.left
  anchors.bottom: parent.bottom
  anchors.margins: Style.space(6)
  spacing: Style.space(4)

  Repeater {
    model: attribution.credits.concat([["© OpenStreetMap contributors", "https://www.openstreetmap.org/copyright"]])

    Text {
      required property var modelData
      required property int index
      text: (index > 0 ? "· " : "") + modelData[0]
      color: Color.popups.text
      opacity: creditMouse.containsMouse ? 0.78 : 0.48
      font.family: attribution.panel.fontFamily
      font.pixelSize: Math.max(8, Style.font.caption - 2)

      MouseArea {
        id: creditMouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: Qt.openUrlExternally(parent.modelData[1])
      }
    }
  }
}
