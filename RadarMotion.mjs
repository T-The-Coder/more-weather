// Rain drift read from Bright Sky's RADOLAN RV grid: a 100 x 100 km grid is
// compared with the same grid 15 minutes later, and the shift that matches
// best is how far the rain moved. An ES module so RadarMotionWorker.mjs can
// import it; the search takes about half a second in Quickshell's engine.

var RADAR_MOTION_STEP_MINUTES = 15
// Faster than any rain drift worth drawing; bounds the search.
var RADAR_MOTION_MAX_KMH = 160
// Wet cells (km²) a frame needs before its pattern is worth tracking.
var RADAR_MOTION_MIN_WET_CELLS = 40
// How much the best shift must improve on no shift at all; a uniform or
// structureless rain field matches every shift about equally.
var RADAR_MOTION_MIN_GAIN = 0.15

// Cell size and rotation of Bright Sky's polar-stereographic grid, read
// from the corner polygon (top-left, bottom-left, bottom-right, top-right).
export function radarGridGeometry(report, rows, cols) {
  var coordinates = report && report.geometry && report.geometry.coordinates
  var ring = coordinates && coordinates.length === 1 && coordinates[0].length >= 4
    ? coordinates[0] : coordinates
  if (!ring || ring.length < 4 || !rows || !cols) return { cellKm: 1, rotation: 0 }
  function offsetKm(from, to) {
    var latitude = (from[1] + to[1]) / 2 * Math.PI / 180
    return { east: (to[0] - from[0]) * 111.32 * Math.cos(latitude), north: (to[1] - from[1]) * 111.32 }
  }
  var up = offsetKm(ring[1], ring[0])
  var across = offsetKm(ring[1], ring[2])
  return {
    cellKm: (Math.sqrt(up.east * up.east + up.north * up.north) / rows
      + Math.sqrt(across.east * across.east + across.north * across.north) / cols) / 2,
    // Clockwise angle from true north to grid north, in radians.
    rotation: Math.atan2(up.east, up.north)
  }
}

// Square roots damp intense cores so the whole pattern, not one cell,
// decides the match; `factor` averages blocks for the coarse search.
function radarMotionGrid(raw, factor) {
  var rows = Math.floor(raw.length / factor)
  var cols = Math.floor((raw[0] || []).length / factor)
  var data = new Float64Array(rows * cols)
  for (var r = 0; r < rows * factor; ++r) {
    var line = raw[r] || []
    var target = Math.floor(r / factor) * cols
    for (var c = 0; c < cols * factor; ++c) {
      var value = Number(line[c]) || 0
      if (value > 0) data[target + Math.floor(c / factor)] += Math.sqrt(value)
    }
  }
  var cells = factor * factor
  for (var i = 0; i < data.length; ++i) data[i] /= cells
  return { data: data, rows: rows, cols: cols }
}

// Mean absolute difference between `a` and `b` read `dy` rows and `dx`
// columns further on, over the overlap. Cells dry in both are skipped so
// dry surroundings do not make every shift look alike.
function radarShiftError(a, b, dy, dx) {
  var sum = 0
  var count = 0
  var rowEnd = Math.min(a.rows, a.rows - dy)
  var colEnd = Math.min(a.cols, a.cols - dx)
  for (var r = Math.max(0, -dy); r < rowEnd; ++r) {
    var aRow = r * a.cols
    var bRow = (r + dy) * a.cols + dx
    for (var c = Math.max(0, -dx); c < colEnd; ++c) {
      var va = a.data[aRow + c]
      var vb = b.data[bRow + c]
      if (va === 0 && vb === 0) continue
      sum += Math.abs(va - vb)
      count++
    }
  }
  return count ? { error: sum / count, count: count } : null
}

function radarBestShift(a, b, centerY, centerX, radius, minCount) {
  var best = null
  for (var dy = centerY - radius; dy <= centerY + radius; ++dy) {
    for (var dx = centerX - radius; dx <= centerX + radius; ++dx) {
      var match = radarShiftError(a, b, dy, dx)
      if (!match || match.count < minCount) continue
      if (!best || match.error < best.error) best = { dy: dy, dx: dx, error: match.error }
    }
  }
  return best
}

// Drift every 15 minutes of a Bright Sky radar report:
// [{ time (ms), directionFrom (degrees, meteorological), speedKmh }].
// Only trackable steps are listed. Runs once per response, not per frame.
export function radarMotionSeries(report) {
  var frames = report && report.radar ? report.radar : []
  var result = []
  if (frames.length < 2 || !frames[0].precipitation_5 || !frames[0].precipitation_5.length) return result
  var first = frames[0].precipitation_5
  var geometry = radarGridGeometry(report, first.length, first[0].length)
  var stepMs = RADAR_MOTION_STEP_MINUTES * 60 * 1000
  var byTime = {}
  var times = []
  for (var i = 0; i < frames.length; ++i) {
    var stamp = new Date(frames[i].timestamp).getTime()
    if (isNaN(stamp) || byTime[stamp] || !frames[i].precipitation_5) continue
    byTime[stamp] = frames[i]
    times.push(stamp)
  }
  times.sort(function(a, b) { return a - b })
  var coarse = 4
  var maxCells = RADAR_MOTION_MAX_KMH * RADAR_MOTION_STEP_MINUTES / 60 / geometry.cellKm
  var cos = Math.cos(geometry.rotation)
  var sin = Math.sin(geometry.rotation)
  for (var j = 0; j < times.length; ++j) {
    if ((times[j] - times[0]) % stepMs !== 0) continue
    var later = byTime[times[j] + stepMs]
    if (!later) continue
    var rawA = byTime[times[j]].precipitation_5
    var wet = 0
    for (var r = 0; r < rawA.length; ++r)
      for (var c = 0; c < rawA[r].length; ++c) if (rawA[r][c] > 0) wet++
    if (wet < RADAR_MOTION_MIN_WET_CELLS) continue
    var rough = radarBestShift(radarMotionGrid(rawA, coarse), radarMotionGrid(later.precipitation_5, coarse),
      0, 0, Math.ceil(maxCells / coarse), Math.ceil(RADAR_MOTION_MIN_WET_CELLS / (coarse * coarse)))
    if (!rough) continue
    var fineA = radarMotionGrid(rawA, 1)
    var fineB = radarMotionGrid(later.precipitation_5, 1)
    var fine = radarBestShift(fineA, fineB, rough.dy * coarse, rough.dx * coarse, 2, RADAR_MOTION_MIN_WET_CELLS)
    var still = radarShiftError(fineA, fineB, 0, 0)
    if (!fine || !still || still.error <= 0 || 1 - fine.error / still.error < RADAR_MOTION_MIN_GAIN) continue
    // Rows grow southward and columns eastward in grid coordinates.
    var gridEast = fine.dx * geometry.cellKm
    var gridNorth = -fine.dy * geometry.cellKm
    var east = gridEast * cos + gridNorth * sin
    var north = -gridEast * sin + gridNorth * cos
    var toward = Math.atan2(east, north) * 180 / Math.PI
    result.push({
      time: times[j],
      directionFrom: Math.round((toward + 540) % 360),
      speedKmh: Math.round(Math.sqrt(east * east + north * north) * 60 / RADAR_MOTION_STEP_MINUTES)
    })
  }
  return result
}
