.pragma library
// Adapted from Omastorm by Wes Grimes (https://github.com/wesleygrimes/omastorm), MIT licence; see THIRD-PARTY-NOTICES.md

// Shared output palette for the legend and value-aware radar painters.
var bounds = [-32, 0, 10, 20, 30, 35, 40, 45, 50, 55, 60, 65, 70]
// Omastorm's reflectivity ramp; 35 dBZ interpolates its 30/40 swatches.
var colors = ["#34465f", "#426b88", "#4098a5", "#51b897", "#85c76b", "#a8d16b", "#cadb6b",
  "#f0cd61", "#eda24c", "#e67349", "#d84c64", "#b55096", "#e2b4df"]
var weakFloor = 5
function rateDbz(rate) {
  return typeof rate === "number" && isFinite(rate) && rate > 0 ? 10 * Math.log(200 * Math.pow(rate, 1.6)) / Math.LN10 : null
}
function band(dbz) {
  if (dbz === null || !isFinite(dbz)) return -1
  var result = 0
  for (var i = 1; i < bounds.length; i++) if (dbz >= bounds[i]) result = i
  return result
}
function rateColor(rate) {
  var index = band(rateDbz(rate))
  return index < 0 ? "transparent" : colors[index]
}
function rainViewerDbz(byte, alpha) {
  if (!alpha || !Number.isInteger(byte) || byte <= 0 || byte > 255) return null
  var raw = byte >= 128 ? byte - 128 : byte
  return raw > 0 ? raw - 32 : null
}
function sourceMode(provider) {
  return provider === "dwd" ? 2 : provider === "jma" ? 3 : 0
}
// Tick styling reads the existing catalogue response without annotating or
// replacing the frames. Observations win duplicate times; unknowns stay observed.
function rainViewerForecast(frame, report) {
  var time = Date.parse(frame.timestamp)
  var radar = report && report.radar
  if (!radar || !isFinite(time)) return false
  var past = radar.past || [], nowcast = radar.nowcast || []
  for (var i = 0; i < Math.min(64, past.length); i++) if (Number(past[i].time) * 1000 === time) return false
  for (var j = 0; j < Math.min(64, nowcast.length); j++) if (Number(nowcast[j].time) * 1000 === time) return true
  return false
}
function scaleBar(pixelsPerKm, maxPixels, imperial) {
  if (!(pixelsPerKm > 0) || !(maxPixels > 0)) return { value: 0, pixels: 0 }
  var unitKm = imperial ? 1.609344 : 1
  var raw = maxPixels / pixelsPerKm / unitKm
  var power = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10))
  var normalized = raw / power
  var value = (normalized >= 5 ? 5 : normalized >= 2 ? 2 : 1) * power
  return { value: value, pixels: value * unitKm * pixelsPerKm }
}
function layout(width, height, baseSize, focus) {
  if (focus) return "FOCUS"
  var scale = Math.max(1, baseSize / 12)
  return width >= 560 * scale && height >= 620 * scale ? "FULL" : "LEAN"
}
// Frame age and feed health are independent; a forecast is never a fresh observation.
function ageMinutes(timestamp, now) {
  var time = Date.parse(timestamp)
  return isFinite(time) && isFinite(now) ? (Math.abs(now - time) < 60000 ? 0 : Math.floor((now - time) / 60000)) : null
}
function feedState(referenceMs, now, failed) {
  if (failed) return "radarUnreachable"
  if (!(referenceMs > 0) || !isFinite(now)) return "radarLoading"
  return now - referenceMs >= 600000 ? "radarStale" : "radarLive"
}
function loopStart(frames, first, selected) {
  return frames.length > first ? String(frames[selected >= frames.length - 1 ? first : Math.max(first, selected)].timestamp) : ""
}
function nextFrame(frames, first, current, startTimestamp) {
  if (!frames.length) return -1
  first = Math.max(0, Math.min(first, frames.length - 1))
  if (current + 1 < frames.length) return Math.max(first, current + 1)
  for (var i = first; i < frames.length; i++) if (frames[i].timestamp === startTimestamp) return i
  return first
}

// Input palette lower bounds, matching Model.DWD_RADAR_COLORS and the checked
// JMA fixture's PLTE. Unknown colour codes remain missing.
var dwdClasses = [[0.1,0x33ffff],[0.2,0x1acc9a],[0.4,0x019934],[1,0x4db31b],
  [2,0x99cc01],[3,0xcce601],[5,0xffff01],[7.5,0xffc401],[10,0xff8901],
  [15,0xff4501],[30,0xfe0000],[45,0xe5004c],[75,0xcc0098],[100,0x6600cb],[150,0x0000fe]]
var jmaClasses = [[0.1,0xf2f2ff],[1,0xa0d2ff],[5,0x218cff],[10,0x0041ff],
  [20,0xfaf500],[30,0xff9900],[50,0xff2800],[80,0xb40068]]
function decode(red, green, blue, alpha, mode) {
  if (!alpha) return null
  if (mode === 1) return rainViewerDbz(red, alpha)
  var classes = mode === 2 ? dwdClasses : mode === 3 ? jmaClasses : []
  for (var i = 0; i < classes.length; i++) {
    var color = classes[i][1]
    var dr = red - (color >> 16), dg = green - ((color >> 8) & 255), db = blue - (color & 255)
    if (dr * dr + dg * dg + db * db < 9) return rateDbz(classes[i][0])
  }
  return null
}
var density = [0,7,3,6,4,8,2,5,1]
function coverage(index, treatment, x, y) {
  var group = Math.min(3, Math.floor(index * 4 / colors.length))
  if (treatment === 1) return density[y * 3 + x] < [2,4,7,9][group] ? 1 : 0
  if (treatment === 2) {
    var half = [1.75,2,2.25,2.5][group] / 2 + 0.5
    return Math.max(0, Math.min(1, half - Math.abs(x + 0.5 - 1.5)))
      * Math.max(0, Math.min(1, half - Math.abs(y + 0.5 - 1.5)))
  }
  return 1
}

function color(dbz) {
  var index = band(dbz)
  if (index < 0) return "transparent"
  if (index === 0 || index === bounds.length - 1) return colors[index]
  var t = Math.max(0, Math.min(1, (dbz - bounds[index]) / (bounds[index + 1] - bounds[index])))
  var a = parseInt(colors[index].slice(1), 16), b = parseInt(colors[index + 1].slice(1), 16)
  var rgb = []
  for (var shift = 16; shift >= 0; shift -= 8) rgb.push(Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t))
  return "#" + rgb.map(function(v) { return (v < 16 ? "0" : "") + v.toString(16) }).join("")
}
function paintCells(ctx, width, height, size, treatment, weakReturns, sample, originX, originY) {
  originX = originX || 0; originY = originY || 0
  for (var y = -((originY % size + size) % size); y < height; y += size)
    for (var x = -((originX % size + size) % size); x < width; x += size) {
      var value = sample(x + size / 2, y + size / 2)
      if (value === null || (!weakReturns && value < weakFloor)) continue
      var bandIndex = band(value)
      ctx.fillStyle = color(value)
      for (var dy = 0; dy < 3; dy++) for (var dx = 0; dx < 3; dx++) {
        ctx.globalAlpha = coverage(bandIndex, treatment, dx, dy)
        ctx.fillRect(x + dx * size / 3, y + dy * size / 3, size / 3, size / 3)
      }
    }
  ctx.globalAlpha = 1
}
