import QtQuick
import "Globe.js" as Globe
import "GlobeView.js" as GlobeView
import "EqualEarth.js" as EqualEarth
import "Sky.js" as Sky

// The globe's surface on the GPU, shared by the More plugins
// (tools/sync-shared.sh): an equirectangular picture of the earth
// (`textureSource`, each plugin's own texture Canvas) projected
// per pixel by shaders/globe.frag onto the orthographic globe, exactly the
// view of the Canvas path (Globe.viewMatrix: centre lat/lon, radius, disc
// centre), or onto the flat Equal Earth map; over the sphere's base colour,
// with the night's three steps (0°, -6°, -12° of sun elevation) on top and
// the rim antialiased over its last pixel. Turning only changes uniforms:
// the picture is captured once per change of its content (`refresh()`, or
// the source's `painted` signal), never per frame.
// Lines, markers and labels stay on the Canvas layers above it.
// `available` is false where shaders cannot run (the software scene graph,
// as in the offscreen test harness): the caller keeps the Canvas path then.
Item {
  id: surface
  // The view: style "globe" or "map", the centre,
  // zoom (the flat map's scale), the globe's radius in px and the disc's
  // centre in item pixels.
  property string style: "globe"
  property real centerLat: 0
  property real centerLon: 0
  property real zoom: 0
  property real radius: Math.min(width, height) / 2
  property real centerX: width / 2
  property real centerY: height / 2
  // The shown time (ms): the sun's position for the night.
  property double displayMs: Date.now()
  property bool night: true
  // The theme: the night's colour and alphas follow it (Sky.twilightLayers
  // over the popup's background); the base under the picture (the sphere's
  // faint fill, premultiplied by the shader input).
  property color background: "#1e1e2e"
  property color baseColor: Qt.rgba(1, 1, 1, 0.04)
  // The picture (an Item: a Canvas, an Image …), captured into a texture.
  property Item textureSource: null

  readonly property bool flat: style === "map"
  // Whether the GPU path runs: not on the software scene graph, the shader
  // loaded.
  readonly property bool available: GraphicsInfo.api !== GraphicsInfo.Software
    && GraphicsInfo.api !== GraphicsInfo.Unknown && effect.status !== ShaderEffect.Error
  // Frames the shader drew (the harness counts them).
  property int frames: 0

  // Captures the picture anew (after it changed).
  function refresh() {
    capture.scheduleUpdate()
  }
  Connections {
    target: surface.textureSource
    ignoreUnknownSignals: true
    function onPainted() { surface.refresh() }
  }

  readonly property var matrix: Globe.viewMatrix(centerLat, Globe.wrapLon(centerLon))
  readonly property var sun: Sky.subsolarPoint(Math.floor(displayMs / 60000) * 60000)
  readonly property var nightLayers: Sky.twilightLayers({ golden: false, blue: false, night: true },
    [background.r, background.g, background.b])
  readonly property var mapCentre: EqualEarth.project(centerLat, Globe.wrapLon(centerLon))

  ShaderEffectSource {
    id: capture
    sourceItem: surface.textureSource
    hideSource: true
    live: false
    smooth: true
    mipmap: false
    wrapMode: ShaderEffectSource.RepeatHorizontally
    textureSize: surface.textureSource ? Qt.size(surface.textureSource.width, surface.textureSource.height) : Qt.size(1, 1)
    // A texture provider only: zero-sized, so it draws nothing itself, but
    // visible (an invisible item gets no scene-graph update, and the
    // capture would stay empty).
    width: 0
    height: 0
  }

  ShaderEffect {
    id: effect
    anchors.fill: parent
    visible: surface.available && !!surface.textureSource
    blending: true
    fragmentShader: Qt.resolvedUrl("shaders/globe.frag.qsb")
    property var source: capture
    property size itemSize: Qt.size(width, height)
    property point center: Qt.point(surface.centerX, surface.centerY)
    property real radius: Math.max(1, surface.radius)
    property vector3d rowRight: Qt.vector3d(surface.matrix[0], surface.matrix[1], surface.matrix[2])
    property vector3d rowUp: Qt.vector3d(surface.matrix[3], surface.matrix[4], surface.matrix[5])
    property vector3d rowDepth: Qt.vector3d(surface.matrix[6], surface.matrix[7], surface.matrix[8])
    property vector3d sunDir: {
      var phi = surface.sun.lat * Math.PI / 180, lam = surface.sun.lon * Math.PI / 180
      return Qt.vector3d(Math.cos(phi) * Math.cos(lam), Math.cos(phi) * Math.sin(lam), Math.sin(phi))
    }
    property real nightOn: surface.night ? 1 : 0
    // The bands below 0°, -6° and -12° (Sky.NIGHT_STEPS), one colour.
    property vector3d nightAlpha: {
      var l = surface.nightLayers
      return Qt.vector3d(l[0].fill.a, l[1].fill.a, l[2].fill.a)
    }
    property vector4d nightColor: {
      var f = surface.nightLayers[0].fill
      return Qt.vector4d(f.r, f.g, f.b, 1)
    }
    property vector4d baseColor: {
      var c = surface.baseColor
      return Qt.vector4d(c.r * c.a, c.g * c.a, c.b * c.a, c.a)
    }
    property real flatMap: surface.flat ? 1 : 0
    // The flat map's px per map unit: the whole map fits at z0, twice that
    // per level.
    property real mapScale: Math.max(1e-6, Math.min(width / (2 * EqualEarth.X_MAX), height / (2 * EqualEarth.Y_MAX)))
      * Math.pow(2, GlobeView.clampZoom(surface.zoom))
    property point mapCenter: Qt.point(surface.mapCentre.x, surface.mapCentre.y)
    onStatusChanged: if (status === ShaderEffect.Error) console.warn("more-weather: globe shader:", log)
  }

  // Counts the frames the scene graph drew while the surface shows.
  Connections {
    target: surface.Window.window
    enabled: effect.visible
    function onFrameSwapped() { surface.frames++ }
  }
}
