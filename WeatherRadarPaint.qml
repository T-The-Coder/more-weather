// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick

ShaderEffect {
  // Native sanitized texture; the shader addresses the nearest source cell.
  property var source
  property var swatches
  property int sourceMode: 1
  property int treatment: 1
  property real mercator: 0
  property point latitudes: Qt.point(0, 0)
  property point mercatorEdges: Qt.point(0, 1)
  property real cellSize: 3
  property point cellOrigin: Qt.point(0, 0)
  property rect sampleRect: Qt.rect(0, 0, 1, 1)
  property real weakBelow: 5
  property size itemSize: Qt.size(width, height)
  fragmentShader: Qt.resolvedUrl("shaders/radar-map.frag.qsb")
  onStatusChanged: if (status === ShaderEffect.Error) console.warn("Radar paint shader:", log)
}
