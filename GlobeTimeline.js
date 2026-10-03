.pragma library

// The globe's time scrubber: which times it offers, which one is "now",
// stepping and playing through them. Times are ms since the epoch; the
// formatting is left to the UI. Pure functions, tested in Node
// (tests/globe-timeline.test.mjs).
//
// Ranges: "global" covers now … +120 h in 3-hour steps on the UTC slots
// (00, 03, … 21 UTC, as the global models run), "regional" now … +48 h
// hourly on the full hour. The first step is the slot now falls in, so
// "now" is always the first step.

var HOUR = 3600000

function stepMs(range) {
  return range === "global" ? 3 * HOUR : HOUR
}

function spanMs(range) {
  return range === "global" ? 120 * HOUR : 48 * HOUR
}

// The steps for a range: from the slot now falls in to now + the range.
function steps(nowMs, range) {
  var size = stepMs(range)
  var start = Math.floor(nowMs / size) * size
  var end = nowMs + spanMs(range)
  var list = []
  for (var t = start; t <= end; t += size) list.push(t)
  return list
}

// The index of the step closest to ms (the earlier one on a tie), −1 when
// there are none.
function nearestIndex(list, ms) {
  if (!list || !list.length) return -1
  var lo = 0, hi = list.length - 1
  while (lo < hi) {
    var mid = (lo + hi) >> 1
    if (list[mid] < ms) lo = mid + 1
    else hi = mid
  }
  if (lo > 0 && ms - list[lo - 1] <= list[lo] - ms) return lo - 1
  return lo
}

// An index within the steps (rounded), −1 when there are none.
function clampIndex(index, list) {
  if (!list || !list.length) return -1
  var i = Math.round(Number(index) || 0)
  return Math.max(0, Math.min(list.length - 1, i))
}

// The index of the latest step not after now (the first one if all are
// later), −1 when there are none.
function atNow(list, nowMs) {
  if (!list || !list.length) return -1
  var found = 0
  for (var i = 0; i < list.length && list[i] <= nowMs; i++) found = i
  return found
}

// The pieces of a step's label: { dayOffset (days after today), hour,
// minute, isNow }. Local time by the system's zone, or by utcOffsetMinutes
// when given (east positive, e.g. 120 for CEST). isNow: the step now falls
// in (a range's step long).
function stepLabel(ms, nowMs, range, utcOffsetMinutes) {
  function offset(t) {
    return utcOffsetMinutes !== undefined && utcOffsetMinutes !== null
      ? Number(utcOffsetMinutes) * 60000 : -new Date(t).getTimezoneOffset() * 60000
  }
  var local = ms + offset(ms), localNow = nowMs + offset(nowMs)
  var day = 86400000
  var minutes = Math.floor((((local % day) + day) % day) / 60000)
  return {
    dayOffset: Math.floor(local / day) - Math.floor(localNow / day),
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
    isNow: ms <= nowMs && nowMs - ms < stepMs(range)
  }
}

// The next index for playback (direction +1 forward, −1 back): past the
// end it starts over when loop is set, otherwise it stays (the same index
// back means: stop playing).
function advance(index, list, direction, loop) {
  if (!list || !list.length) return -1
  var next = clampIndex(index, list) + (direction < 0 ? -1 : 1)
  if (next >= list.length) return loop ? 0 : list.length - 1
  if (next < 0) return loop ? list.length - 1 : 0
  return next
}

// How long playback shows each step, in ms.
function playbackDelay(range) {
  return range === "global" ? 400 : 250
}

if (typeof module !== "undefined") module.exports = {
  steps: steps, nearestIndex: nearestIndex, clampIndex: clampIndex, atNow: atNow, stepLabel: stepLabel,
  advance: advance, playbackDelay: playbackDelay, stepMs: stepMs, HOUR: HOUR
}
