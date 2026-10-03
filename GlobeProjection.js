.pragma library
.import "Globe.js" as Globe
.import "GlobeView.js" as GlobeView
.import "EqualEarth.js" as EqualEarth

// The globe section's two pictures of the earth behind one interface
// (WeatherGlobe.qml and its layers): the orthographic globe (Globe.js,
// tilted and zoomed) and the flat Equal Earth map (EqualEarth.js, panned
// and zoomed). Layers, markers, overlays, streaks and the wash ask a
// projection made for the frame, never the style:
//   at(lat, lon)          → whether the place is in front; P.x, P.y its
//                           screen point (no object made: for loops)
//   project(lat, lon)     → { x, y, visible }
//   unproject(x, y)       → { lat, lon } or null off the earth
//   unprojectNear(x, y, out, reach) → true with out.lat/out.lon for a
//                           point on the earth or up to `reach` px past
//                           its edge (taken onto the edge), else false
//   traceEarth(ctx)       → the earth's edge as a path (disc or outline)
//   box()                 → the lat/lon box in view { south, north, west, east }
//   onEarth(x, y)         → whether a screen point lies on the earth
// View: { style ("globe" | "map"), centerLat, centerLon, zoom, width,
// height, radius (the globe's, px), lift }.
// Pure, tested in Node (tests/globe-projection.test.mjs).

var RAD = Math.PI / 180

// The flat map's pixels per map unit: the whole map fits the view at z0,
// twice that per level.
function mapScale(width, height, zoom) {
  var fit = Math.min(Number(width) / (2 * EqualEarth.X_MAX), Number(height) / (2 * EqualEarth.Y_MAX))
  return Math.max(1e-6, fit) * Math.pow(2, GlobeView.clampZoom(zoom))
}

// The flat map's centre kept so the map covers the view where it can: on
// the whole map (z0) the middle; zoomed, within the map's extent.
function mapCentre(lat, lon, width, height, zoom) {
  var s = mapScale(width, height, zoom)
  var c = EqualEarth.project(Number(lat) || 0, Globe.wrapLon(Number(lon) || 0))
  var halfX = Math.max(0, EqualEarth.X_MAX - Number(width) / 2 / s)
  var halfY = Math.max(0, EqualEarth.Y_MAX - Number(height) / 2 / s)
  var x = Math.max(-halfX, Math.min(halfX, c.x)), y = Math.max(-halfY, Math.min(halfY, c.y))
  var back = EqualEarth.unproject(x, y)
  return back ? { lat: back.lat, lon: back.lon } : { lat: 0, lon: 0 }
}

function make(view) {
  return view.style === "map" ? flat(view) : orthographic(view)
}

function orthographic(view) {
  var R = Number(view.radius)
  var cx = Number(view.width) / 2, cy = Number(view.height) / 2
  var m = Globe.viewMatrix(view.centerLat, Globe.wrapLon(view.centerLon))
  var m0 = m[0], m1 = m[1], m2 = m[2], m3 = m[3], m4 = m[4], m5 = m[5], m6 = m[6], m7 = m[7], m8 = m[8]
  var P = { kind: "globe", matrix: m, radius: R, cx: cx, cy: cy, x: 0, y: 0 }
  P.at = function(lat, lon) {
    var phi = lat * RAD, lam = lon * RAD, cp = Math.cos(phi)
    var vx = cp * Math.cos(lam), vy = cp * Math.sin(lam), vz = Math.sin(phi)
    P.x = cx + R * (m0 * vx + m1 * vy + m2 * vz)
    P.y = cy - R * (m3 * vx + m4 * vy + m5 * vz)
    return m6 * vx + m7 * vy + m8 * vz >= -1e-9
  }
  P.project = function(lat, lon) {
    var front = P.at(lat, lon)
    return { x: P.x, y: P.y, visible: front }
  }
  P.unprojectNear = function(x, y, out, reach) {
    var u = (x - cx) / R, w = (cy - y) / R
    var q = u * u + w * w
    if (q > 1) {
      var d = Math.sqrt(q)
      if ((d - 1) * R > (reach || 0)) return false
      u /= d
      w /= d
      q = 1
    }
    var f = Math.sqrt(1 - q)
    var vx = u * m0 + w * m3 + f * m6, vy = u * m1 + w * m4 + f * m7, vz = u * m2 + w * m5 + f * m8
    out.lat = Math.asin(Math.max(-1, Math.min(1, vz))) / RAD
    out.lon = Math.atan2(vy, vx) / RAD
    return true
  }
  P.unproject = function(x, y) {
    return Globe.unprojectView(x - cx, cy - y, m, R)
  }
  P.onEarth = function(x, y) {
    var dx = x - cx, dy = y - cy
    return dx * dx + dy * dy <= R * R
  }
  P.traceEarth = function(ctx) {
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
  }
  P.box = function() {
    return GlobeView.visibleBounds(view.centerLat, Globe.wrapLon(view.centerLon), R, view.width, view.height)
  }
  return P
}

function flat(view) {
  var w = Number(view.width), h = Number(view.height)
  var cx = w / 2, cy = h / 2
  var s = mapScale(w, h, view.zoom)
  var centre = EqualEarth.project(Number(view.centerLat) || 0, Globe.wrapLon(Number(view.centerLon) || 0))
  var ox = centre.x, oy = centre.y
  var P = { kind: "map", scale: s, cx: cx, cy: cy, x: 0, y: 0, mapX: ox, mapY: oy }
  // Map units to the screen and back.
  P.toScreenX = function(mx) { return cx + (mx - ox) * s }
  P.toScreenY = function(my) { return cy - (my - oy) * s }
  P.at = function(lat, lon) {
    var p = EqualEarth.project(lat, Globe.wrapLon(lon))
    P.x = cx + (p.x - ox) * s
    P.y = cy - (p.y - oy) * s
    return P.x >= -50 && P.x <= w + 50 && P.y >= -50 && P.y <= h + 50
  }
  P.project = function(lat, lon) {
    var inView = P.at(lat, lon)
    return { x: P.x, y: P.y, visible: inView }
  }
  P.unproject = function(x, y) {
    return EqualEarth.unproject((x - cx) / s + ox, -(y - cy) / s + oy)
  }
  P.unprojectNear = function(x, y, out, reach) {
    var mx = (x - cx) / s + ox, my = -(y - cy) / s + oy
    var place = EqualEarth.unproject(mx, my)
    if (!place) {
      // Past the outline: onto it (the pole's flat edge, the ±180°
      // meridians) when within reach.
      var my0 = Math.max(-EqualEarth.Y_MAX, Math.min(EqualEarth.Y_MAX, my))
      if (Math.abs(my - my0) * s > (reach || 0)) return false
      var row = EqualEarth.unproject(0, my0)
      if (!row) return false
      var edge = EqualEarth.project(row.lat, 180).x
      if (Math.abs(mx) > edge) {
        if ((Math.abs(mx) - edge) * s > (reach || 0)) return false
        out.lat = row.lat
        out.lon = mx < 0 ? -180 : 180
        return true
      }
      place = EqualEarth.unproject(mx, my0)
      if (!place) return false
    }
    out.lat = place.lat
    out.lon = place.lon
    return true
  }
  P.onEarth = function(x, y) {
    return !!P.unproject(x, y)
  }
  var outline = null
  P.traceEarth = function(ctx) {
    if (!outline) outline = EqualEarth.outline()
    ctx.beginPath()
    for (var i = 0; i < outline.length; i++) {
      var sx = cx + (outline[i].x - ox) * s, sy = cy - (outline[i].y - oy) * s
      if (i === 0) ctx.moveTo(sx, sy)
      else ctx.lineTo(sx, sy)
    }
    ctx.closePath()
  }
  P.box = function() {
    // The view's corners and edge middles, each onto the map.
    var south = 90, north = -90, west = 180, east = -180
    var any = false
    for (var i = 0; i <= 4; i++) {
      for (var j = 0; j <= 4; j++) {
        var place = EqualEarth.unproject((w * i / 4 - cx) / s + ox, -(h * j / 4 - cy) / s + oy)
        if (!place) continue
        any = true
        south = Math.min(south, place.lat)
        north = Math.max(north, place.lat)
        west = Math.min(west, place.lon)
        east = Math.max(east, place.lon)
      }
    }
    if (!any) return { south: -90, north: 90, west: -180, east: 180 }
    // A pole on the map's flat edge reaches all longitudes there.
    var top = -(0 - cy) / s + oy, bottom = -(h - cy) / s + oy
    if (top >= EqualEarth.Y_MAX) north = 90
    if (bottom <= -EqualEarth.Y_MAX) south = -90
    return { south: south, north: north, west: west, east: east }
  }
  return P
}

if (typeof module !== "undefined") module.exports = {}
