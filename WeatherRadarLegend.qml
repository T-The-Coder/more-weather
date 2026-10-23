// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import qs.Commons
import qs.Commons as Commons
import "RadarStyle.js" as RadarStyle

Column {
  id: legend
  required property var panel
  property bool showStrip: true
  property string providerId: panel.radarDisplayProviderId
  property bool modelFallback: panel.radarUsesModelFallback
  property string attribution: ""
  property bool showTreatment: true
  readonly property bool values: RadarStyle.sourceMode(providerId) !== 0 || modelFallback
  width: parent.width
  spacing: Style.space(3)
  Row {
    width: parent.width
    visible: legend.showStrip && legend.values
    Repeater {
      model: RadarStyle.colors
      Column {
        required property string modelData
        required property int index
        width: legend.width / RadarStyle.colors.length
        spacing: Style.space(3)
        Rectangle {
          width: parent.width
          height: Style.space(5)
          gradient: Gradient {
            orientation: Gradient.Horizontal
            GradientStop { position: 0; color: RadarStyle.colors[index] }
            GradientStop { position: 1; color: RadarStyle.colors[Math.min(RadarStyle.colors.length - 1, index + 1)] }
          }
          opacity: !legend.panel.radarWeakReturns && RadarStyle.bounds[parent.index] < 5 ? 0.3 : 1
        }
        Text {
          textFormat: Text.PlainText
          text: legend.panel.i18n("radarLegendValue", { value: parent.index === 0 ? "<0" : RadarStyle.bounds[parent.index] + (parent.index === RadarStyle.bounds.length - 1 ? "+" : "") })
          color: Commons.Color.popups.text
          font.family: legend.panel.fontFamily
          font.pixelSize: Style.font.caption
          visible: legend.width > Style.space(500) || parent.index % 2 === 0 || parent.index === RadarStyle.bounds.length - 1
        }
      }
    }
  }
  Text {
    textFormat: Text.PlainText
    width: parent.width
    text: (legend.attribution ? legend.attribution + " · " : "") + (!legend.values ? legend.panel.i18n("radarProviderColors")
      : legend.panel.i18n(legend.providerId === "rainviewer" ? "radarDbz" : "radarApproxDbz")
        + " · " + legend.panel.i18n(legend.panel.radarWeakReturns ? "radarWeakShown" : "radarWeakHidden")
        + (legend.showTreatment ? " · " + legend.panel.i18n(["radarPixels", "radarGlyphs", "radarStipple"][legend.panel.radarTreatment]) : ""))
    color: Commons.Color.popups.text
    opacity: 0.65
    wrapMode: Text.WordWrap
    font.family: legend.panel.fontFamily
    font.pixelSize: Style.font.caption
  }
}
