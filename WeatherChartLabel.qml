import QtQuick
import qs.Commons

// One chart label as a Text, placed like a canvas fillText: `anchorX` with
// left / center / right alignment, `baselineY` for the text's baseline.
// Canvas text is rasterised at the logical size and scaled with the screen,
// which blurs it on fractional scaling; a Text stays sharp.
Text {
  required property var panel
  property real baselineY: 0
  property string align: "left"
  property real anchorX: 0
  x: align === "right" ? anchorX - implicitWidth : (align === "center" ? anchorX - implicitWidth / 2 : anchorX)
  y: baselineY - baselineOffset
  color: panel.foreground
  font.family: panel.fontFamily
  font.pixelSize: Style.font.caption
  renderType: Text.NativeRendering
}
