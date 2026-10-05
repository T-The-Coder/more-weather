import QtQuick
import "Moon.js" as Moon

// The Moon as a small shaded sphere (Moon.paintMoon), shared by the More
// plugins (tools/sync-shared.sh): its phase lit towards `litAngle` (radians,
// canvas: 0 to the right, clockwise; π/2 lights it from below), `size` its
// diameter. ink: the outline; night: the dark part. The lit part is a pale
// tone that reads on light and dark themes. earthshine: the night side
// faintly lit (MoonView.view's flag for a thin crescent).
Canvas {
  id: sphere
  property real illuminated: 0.5
  property real phase: 0.25
  property real litAngle: phase < 0.5 ? 0 : Math.PI
  property real size: 24
  property color ink: "white"
  property color night: "#16122e"
  property string litTone: "238,236,226"
  property bool earthshine: false

  implicitWidth: size + 2
  implicitHeight: size + 2
  onIlluminatedChanged: requestPaint()
  onLitAngleChanged: requestPaint()
  onSizeChanged: requestPaint()
  onInkChanged: requestPaint()
  onNightChanged: requestPaint()
  onEarthshineChanged: requestPaint()

  onPaint: {
    var ctx = getContext("2d")
    ctx.reset()
    Moon.paintMoon(ctx, width / 2, height / 2, sphere.size / 2, sphere.litAngle, sphere.illuminated,
      sphere.litTone, Moon.rgbText(sphere.night), Moon.rgbText(sphere.ink), sphere.earthshine)
  }
}
