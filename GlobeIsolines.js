.pragma library

// Isolines (isobars) and pressure centres on a lattice, for the globe
// section. Pure functions, tested in Node (tests/globe-isolines.test.mjs).
//
// A lattice is { south, north, west, east, cols, rows, values, wrap }:
// values row by row from the south-west corner (index = row * cols + col),
// NaN where unknown; wrap is true when the longitudes go all the way round
// (the global lattice: 145 × 73 nodes at 2.5°, west −180, east 180, its
// last column the same meridian as its first).
//
// isolines(): marching squares with linear interpolation along the cell
// edges; segments are joined into polylines (open, or closed with the first
// point repeated at the end), cells with an unknown corner are skipped,
// saddles are resolved by the cell's mean, and a wrapping lattice joins its
// lines across the ±180° seam. One pass over the cells serves every level
// (a cell only visits the levels between its corners). extrema(): highs and
// lows (local maxima and minima), each deep enough against the ring of
// nodes round it.

// Nodes round the globe along a row: on a wrapping lattice whose last
// column repeats the first (east − west = 360°) one less than its columns.
function ringCols(lattice) {
  if (!lattice.wrap) return lattice.cols
  var span = lattice.east - lattice.west
  return Math.abs(span - 360) < 1e-6 ? lattice.cols - 1 : lattice.cols
}

function lonOf(lattice, col) {
  return lattice.west + col * (lattice.east - lattice.west) / (lattice.cols - 1)
}

function latOf(lattice, row) {
  return lattice.south + row * (lattice.north - lattice.south) / (lattice.rows - 1)
}

function known(v) {
  return typeof v === "number" && v === v
}

// The first level (a multiple of step from base) at or above the least
// known value, and how many levels fit up to the greatest.
function levelRange(values, step, base) {
  var lo = Infinity, hi = -Infinity
  for (var i = 0; i < values.length; i++) {
    var v = values[i]
    if (!known(v)) continue
    if (v < lo) lo = v
    if (v > hi) hi = v
  }
  if (!(step > 0) || lo > hi) return { first: 0, count: 0 }
  var first = base + Math.ceil((lo - base) / step) * step
  return { first: first, count: Math.min(1000, Math.floor((hi - first) / step + 1e-9) + 1) }
}

// The levels between the least and greatest known value.
function levelsFor(values, step, base) {
  var range = levelRange(values, Number(step), Number(base) || 0)
  var levels = []
  for (var i = 0; i < range.count; i++) levels.push(range.first + i * step)
  return levels
}

// The segments a cell's case draws, as pairs of its edges (0 bottom,
// 1 right, 2 top, 3 left); the saddles 5 and 10 are decided by the mean.
var CASES = [
  [], [3, 0], [0, 1], [3, 1], [1, 2], null, [0, 2], [3, 2],
  [3, 2], [0, 2], null, [1, 2], [3, 1], [0, 1], [3, 0], []
]

// [{ level, lines: [[lon, lat, lon, lat, …], …] }] for every level (a
// multiple of step from base, e.g. 4 hPa from 1000) that has a line.
//
// An edge key names a lattice edge by its south or west node: node × 2 for
// the edge to the east, node × 2 + 1 for the edge to the north (the seam
// column folded onto column 0), so neighbouring cells share their crossing
// points and the joining needs no float comparison.
function isolines(lattice, step, base) {
  var result = []
  if (!lattice || !lattice.values || lattice.cols < 2 || lattice.rows < 2) return result
  step = Number(step)
  var range = levelRange(lattice.values, step, Number(base) || 0)
  if (!range.count) return result
  var cols = lattice.cols, rows = lattice.rows, values = lattice.values
  var n = ringCols(lattice)
  var cellCols = lattice.wrap ? n : cols - 1
  var first = range.first, count = range.count
  var segments = []
  for (var l = 0; l < count; l++) segments.push([])

  for (var r = 0; r < rows - 1; r++) {
    for (var c = 0; c < cellCols; c++) {
      var c1 = (c + 1) % n
      var nbl = r * cols + c, nbr = r * cols + c1, ntl = nbl + cols, ntr = nbr + cols
      var bl = values[nbl], br = values[nbr], tr = values[ntr], tl = values[ntl]
      if (!known(bl) || !known(br) || !known(tr) || !known(tl)) continue
      var lo = Math.min(bl, br, tr, tl), hi = Math.max(bl, br, tr, tl)
      if (lo === hi) continue
      var edges = [nbl * 2, nbr * 2 + 1, ntl * 2, nbl * 2 + 1]
      var i0 = Math.max(0, Math.floor((lo - first) / step))
      for (var i = i0; i < count; i++) {
        var level = first + i * step
        if (level > hi) break
        if (level <= lo) continue
        var index = (bl >= level ? 1 : 0) | (br >= level ? 2 : 0) | (tr >= level ? 4 : 0) | (tl >= level ? 8 : 0)
        var pairs = CASES[index]
        if (!pairs) {
          var centreAbove = (bl + br + tr + tl) / 4 >= level
          // 5: bl and tr above; 10: br and tl above. The centre above joins
          // the corners above, cutting off the ones below, and the reverse.
          pairs = (index === 5) === centreAbove ? [0, 1, 2, 3] : [3, 0, 1, 2]
        }
        var list = segments[i]
        for (var p = 0; p < pairs.length; p += 2) list.push(edges[pairs[p]], edges[pairs[p + 1]])
      }
    }
  }

  var size = rows * cols * 2
  var stamp = new Int32Array(size), adj0 = new Int32Array(size), adj1 = new Int32Array(size)
  for (var k = 0; k < count; k++) {
    if (!segments[k].length) continue
    result.push({ level: first + k * step, lines: joinLevel(lattice, segments[k], first + k * step, k + 1, stamp, adj0, adj1, n) })
  }
  return result
}

// One level's segments (flat pairs of edge keys) joined into polylines.
// stamp/adj0/adj1 are scratch arrays indexed by edge key, reused across
// levels: an entry counts only when its stamp is this level's mark.
function joinLevel(lattice, flat, level, mark, stamp, adj0, adj1, n) {
  var cols = lattice.cols, values = lattice.values
  var segCount = flat.length / 2
  for (var s = 0; s < segCount; s++) {
    for (var e = 0; e < 2; e++) {
      var key = flat[2 * s + e]
      if (stamp[key] !== mark) { stamp[key] = mark; adj0[key] = s; adj1[key] = -1 }
      else adj1[key] = s
    }
  }
  var used = new Uint8Array(segCount)

  function point(key, out) {
    var a = key >> 1, row = Math.floor(a / cols), col = a - row * cols
    var b, lonA = lonOf(lattice, col), latA = latOf(lattice, row), lonB = lonA, latB = latA
    if (key & 1) { b = a + cols; latB = latOf(lattice, row + 1) }
    else { b = row * cols + (col + 1) % n; lonB = lonOf(lattice, col + 1) }
    var va = values[a], vb = values[b]
    var t = vb === va ? 0.5 : (level - va) / (vb - va)
    var lon = lonA + (lonB - lonA) * t
    out.push(lon > 180 ? lon - 360 : lon, latA + (latB - latA) * t)
  }

  function nextSegment(key) {
    if (adj0[key] >= 0 && !used[adj0[key]]) return adj0[key]
    if (adj1[key] >= 0 && !used[adj1[key]]) return adj1[key]
    return -1
  }

  function walk(chain, key) {
    for (;;) {
      var seg = nextSegment(key)
      if (seg < 0) return
      used[seg] = 1
      key = flat[2 * seg] === key ? flat[2 * seg + 1] : flat[2 * seg]
      chain.push(key)
    }
  }

  var lines = []
  for (var start = 0; start < segCount; start++) {
    if (used[start]) continue
    used[start] = 1
    var forward = [flat[2 * start], flat[2 * start + 1]]
    walk(forward, forward[1])
    var keys = forward
    if (!(forward.length > 2 && forward[0] === forward[forward.length - 1])) {
      var backward = [forward[0]]
      walk(backward, forward[0])
      keys = backward.reverse().concat(forward.slice(1))
    }
    var line = []
    for (var j = 0; j < keys.length; j++) point(keys[j], line)
    lines.push(line)
  }
  return lines
}

// The angle between two places, in degrees.
function distanceDeg(lat1, lon1, lat2, lon2) {
  var rad = Math.PI / 180
  var dLat = (lat2 - lat1) * rad, dLon = (lon2 - lon1) * rad
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return 2 * Math.asin(Math.min(1, Math.sqrt(a))) / rad
}

function normalizeLon(lon) {
  return ((lon + 180) % 360 + 360) % 360 - 180
}

// A parabola's vertex through three equally spaced values, as an offset
// from the middle one (−0.5 … 0.5).
function vertexOffset(a, b, c) {
  var d = a - 2 * b + c
  if (!known(a) || !known(c) || d === 0) return 0
  return Math.max(-0.5, Math.min(0.5, (a - c) / (2 * d)))
}

// Highs and lows: [{ kind: "high" | "low", lat, lon, value }], strongest
// first. A node is a centre when it is the greatest (least) known value
// within `radius` nodes (default 3) and at least `minDepth` (default 2,
// the lattice's unit) above (below) the mean of the ring of nodes `radius`
// away; centres of a kind closer than `minDistanceDeg` (default 15° on a
// wrapping lattice, a quarter of the box's smaller side otherwise) to a
// stronger one are dropped; at most `max` (default 12). Nodes closer than
// `radius` to the lattice's north or south edge (or, on a box, to any edge)
// are never centres. The position is refined between the nodes by a
// parabola through the neighbours.
function extrema(lattice, options) {
  var result = []
  if (!lattice || !lattice.values) return result
  options = options || {}
  var radius = Math.max(1, Math.round(options.radius || 3))
  var minDepth = options.minDepth !== undefined ? Number(options.minDepth) : 2
  var max = options.max !== undefined ? Number(options.max) : 12
  var minDistance = options.minDistanceDeg !== undefined ? Number(options.minDistanceDeg)
    : lattice.wrap ? 15
    : Math.max(0.5, Math.min(lattice.north - lattice.south, lattice.east - lattice.west) / 4)
  var cols = lattice.cols, rows = lattice.rows, values = lattice.values
  var n = ringCols(lattice)
  var colStart = lattice.wrap ? 0 : radius
  var colEnd = lattice.wrap ? n : cols - radius
  var dLon = (lattice.east - lattice.west) / (cols - 1)
  var dLat = (lattice.north - lattice.south) / (rows - 1)

  function at(row, col) {
    if (lattice.wrap) col = ((col % n) + n) % n
    else if (col < 0 || col >= cols) return NaN
    if (row < 0 || row >= rows) return NaN
    return values[row * cols + col]
  }

  // Greatest or least within `reach`: +1 maximum, −1 minimum, 0 neither.
  function extremeWithin(r, c, v, reach) {
    var isMax = true, isMin = true
    for (var dr = -reach; dr <= reach; dr++) {
      for (var dc = -reach; dc <= reach; dc++) {
        var w = at(r + dr, c + dc)
        if (w > v) isMax = false
        else if (w < v) isMin = false
        if (!isMax && !isMin) return 0
      }
    }
    return isMax ? 1 : -1
  }

  var candidates = []
  for (var r = radius; r < rows - radius; r++) {
    for (var c = colStart; c < colEnd; c++) {
      var v = at(r, c)
      if (!known(v)) continue
      // The near neighbours first: most nodes fail there.
      var sign = extremeWithin(r, c, v, 1)
      if (sign !== 0 && radius > 1) sign = extremeWithin(r, c, v, radius)
      if (sign === 0) continue
      var ringSum = 0, ringCount = 0
      for (var d = -radius; d <= radius; d++) {
        var ring = [at(r - radius, c + d), at(r + radius, c + d)]
        if (d > -radius && d < radius) ring.push(at(r + d, c - radius), at(r + d, c + radius))
        for (var q = 0; q < ring.length; q++) if (known(ring[q])) { ringSum += ring[q]; ringCount++ }
      }
      if (!ringCount) continue
      var depth = v - ringSum / ringCount
      if (depth * sign < minDepth || depth === 0) continue
      var ox = vertexOffset(at(r, c - 1), v, at(r, c + 1))
      var oy = vertexOffset(at(r - 1, c), v, at(r + 1, c))
      candidates.push({ kind: sign > 0 ? "high" : "low", lat: latOf(lattice, r) + oy * dLat,
                        lon: normalizeLon(lonOf(lattice, c) + ox * dLon), value: v, depth: Math.abs(depth) })
    }
  }
  candidates.sort(function (a, b) { return b.depth - a.depth })
  for (var i = 0; i < candidates.length && result.length < max; i++) {
    var cand = candidates[i], near = false
    for (var j = 0; j < result.length && !near; j++)
      near = result[j].kind === cand.kind && distanceDeg(result[j].lat, result[j].lon, cand.lat, cand.lon) < minDistance
    if (!near) result.push({ kind: cand.kind, lat: cand.lat, lon: cand.lon, value: cand.value })
  }
  return result
}

if (typeof module !== "undefined") module.exports = {
  isolines: isolines, extrema: extrema, levelsFor: levelsFor, distanceDeg: distanceDeg
}
