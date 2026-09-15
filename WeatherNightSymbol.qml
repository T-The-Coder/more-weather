import QtQuick

// The current moon phase peeking out behind a cloud / precipitation glyph,
// for the large night symbol. The font has no such combined glyphs, and its
// weather glyphs are hollow outlines, so simply stacking two Text items would
// let the moon's lines show through the cloud. Instead the cloud's silhouette
// (its outline plus everything enclosed by it, grown by a small gap) is
// punched out of the moon before the cloud is drawn on top.
Canvas {
  id: symbol

  property string moonGlyph: ""
  property string weatherGlyph: ""
  property string fontFamily: "monospace"
  property color color: "white"
  // Ink height of the whole symbol, top of the moon to bottom of the cloud.
  property real inkHeight: 48
  property bool italic: false
  // Southern-hemisphere view: the moon glyph is drawn mirrored.
  property bool mirrored: false
  // The moon peeks out on its lit side: top left instead of top right.
  property bool moonOnLeft: false

  // Proportions of the composition relative to inkHeight.
  readonly property real weatherShare: 0.84
  readonly property real moonShare: 0.56
  readonly property real moonOverlap: 0.42
  readonly property int gap: Math.max(1, Math.round(inkHeight / 24))

  FontMetrics {
    id: reference
    font.family: symbol.fontFamily
    font.pixelSize: 100
  }

  readonly property rect weatherInk: reference.height > 0 && weatherGlyph !== ""
    ? reference.tightBoundingRect(weatherGlyph) : Qt.rect(0, 0, 0, 0)
  readonly property rect moonInk: reference.height > 0 && moonGlyph !== ""
    ? reference.tightBoundingRect(moonGlyph) : Qt.rect(0, 0, 0, 0)

  readonly property real weatherSize: weatherInk.height > 0
    ? 100 * inkHeight * weatherShare / weatherInk.height : 0
  readonly property real moonSize: moonInk.height > 0
    ? 100 * inkHeight * moonShare / moonInk.height : 0
  readonly property real weatherInkWidth: weatherInk.width * weatherSize / 100
  readonly property real moonInkWidth: moonInk.width * moonSize / 100
  readonly property real moonInkLeft: moonOnLeft ? 0 : weatherInkWidth - moonInkWidth * moonOverlap
  readonly property real weatherInkLeft: moonOnLeft ? moonInkWidth * (1 - moonOverlap) : 0

  implicitWidth: Math.ceil(Math.max(weatherInkLeft + weatherInkWidth, moonInkLeft + moonInkWidth)) + gap * 2
  implicitHeight: Math.ceil(inkHeight) + gap * 2
  width: implicitWidth
  height: implicitHeight

  onMoonGlyphChanged: requestPaint()
  onWeatherGlyphChanged: requestPaint()
  onFontFamilyChanged: requestPaint()
  onColorChanged: requestPaint()
  onInkHeightChanged: requestPaint()
  onItalicChanged: requestPaint()
  onMirroredChanged: requestPaint()
  onMoonOnLeftChanged: requestPaint()
  onWidthChanged: requestPaint()
  onHeightChanged: requestPaint()

  function glyphFont(pixelSize) {
    return (italic ? "italic " : "") + Math.round(pixelSize) + "px \"" + fontFamily + "\""
  }

  // Draws one glyph so that its ink box starts at (left, top), optionally
  // mirrored about the centre of that box.
  function drawGlyph(ctx, glyph, ink, pixelSize, left, top, mirror) {
    var scale = pixelSize / 100
    ctx.save()
    if (mirror) {
      ctx.translate(2 * left + ink.width * scale, 0)
      ctx.scale(-1, 1)
    }
    ctx.font = glyphFont(pixelSize)
    ctx.textBaseline = "alphabetic"
    ctx.textAlign = "left"
    ctx.fillText(glyph, left - ink.x * scale, top - ink.y * scale)
    ctx.restore()
  }

  onPaint: {
    var ctx = getContext("2d")
    ctx.reset()
    if (moonGlyph === "" || weatherGlyph === "" || weatherSize <= 0 || moonSize <= 0) return
    ctx.fillStyle = String(color)

    var weatherLeft = gap + weatherInkLeft
    var weatherTop = gap + inkHeight * (1 - weatherShare)
    var moonLeft = gap + moonInkLeft
    var moonTop = gap

    // 1. Cloud alone, to find its silhouette.
    drawGlyph(ctx, weatherGlyph, weatherInk, weatherSize, weatherLeft, weatherTop)
    var cloud = ctx.getImageData(0, 0, width, height)
    var w = cloud.width
    var h = cloud.height
    var pixels = cloud.data
    var total = w * h
    var outside = new Uint8Array(total)
    var queue = new Int32Array(total)
    var head = 0
    var tail = 0
    function wall(index) { return pixels[index * 4 + 3] > 40 }
    function seed(index) {
      if (outside[index] || wall(index)) return
      outside[index] = 1
      queue[tail++] = index
    }
    for (var x = 0; x < w; ++x) { seed(x); seed((h - 1) * w + x) }
    for (var y = 0; y < h; ++y) { seed(y * w); seed(y * w + w - 1) }
    while (head < tail) {
      var i = queue[head++]
      var px = i % w
      if (px > 0) seed(i - 1)
      if (px < w - 1) seed(i + 1)
      if (i >= w) seed(i - w)
      if (i < total - w) seed(i + w)
    }
    // Silhouette = not reachable from the border; grow it by `gap` pixels so
    // the moon stops just short of the cloud's outline.
    var cut = new Uint8Array(total)
    var reach = Math.round(gap * w / Math.max(1, width))
    for (y = 0; y < h; ++y) {
      for (x = 0; x < w; ++x) {
        if (outside[y * w + x]) continue
        for (var dy = -reach; dy <= reach; ++dy) {
          var yy = y + dy
          if (yy < 0 || yy >= h) continue
          for (var dx = -reach; dx <= reach; ++dx) {
            var xx = x + dx
            if (xx >= 0 && xx < w) cut[yy * w + xx] = 1
          }
        }
      }
    }

    // 2. Moon, with the silhouette punched out. putImageData does not reach
    //    the rendered canvas here, so the cut is cleared as row spans.
    ctx.clearRect(0, 0, width, height)
    drawGlyph(ctx, moonGlyph, moonInk, moonSize, moonLeft, moonTop, mirrored)
    var sx = width / w
    var sy = height / h
    for (y = 0; y < h; ++y) {
      x = 0
      while (x < w) {
        if (!cut[y * w + x]) { ++x; continue }
        var start = x
        while (x < w && cut[y * w + x]) ++x
        // Half a pixel of overlap: the canvas is scaled to the screen, and
        // abutting spans would leave faint seams between rows.
        ctx.clearRect(start * sx - 0.5, y * sy - 0.5, (x - start) * sx + 1, sy + 1)
      }
    }

    // 3. Cloud on top.
    drawGlyph(ctx, weatherGlyph, weatherInk, weatherSize, weatherLeft, weatherTop)
  }
}
