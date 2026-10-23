// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md
import QtQuick
import "RadarStyle.js" as RadarStyle

Item {
  id: palette
  readonly property alias texture: capture
  width: RadarStyle.colors.length
  height: 1
  Row {
    id: strip
    Repeater {
      model: RadarStyle.colors
      Rectangle {
        required property string modelData
        width: 1
        height: 1
        color: modelData
      }
    }
  }
  ShaderEffectSource {
    id: capture
    sourceItem: strip
    hideSource: true
    visible: false
    smooth: false
    mipmap: false
    textureSize: Qt.size(RadarStyle.colors.length, 1)
  }
}
