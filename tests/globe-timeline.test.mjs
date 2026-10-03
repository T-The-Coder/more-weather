// The globe's time scrubber (GlobeTimeline.js): aligned steps, "now",
// clamping, playback.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const T = load("GlobeTimeline.js")
const H = 3600000
const utc = (s) => Date.parse(s)

test("global steps sit on the 3-hour UTC slots across midnight", () => {
  const now = utc("2026-10-03T22:41:00Z")
  const list = [...T.steps(now, "global")]
  assert.equal(list[0], utc("2026-10-03T21:00:00Z"))
  assert.equal(list[1], utc("2026-10-04T00:00:00Z"))
  assert.equal(list.length, 41)
  assert.equal(list[40], utc("2026-10-08T21:00:00Z"))
  assert.ok(list[40] <= now + 120 * H)
  assert.ok(list.every((t, i) => i === 0 || t - list[i - 1] === 3 * H))
  assert.equal(T.atNow(list, now), 0)
  assert.equal(T.playbackDelay("global"), 400)
})

test("regional steps are hourly on the full hour", () => {
  const now = utc("2026-10-03T23:59:59Z")
  const list = [...T.steps(now, "regional")]
  assert.equal(list[0], utc("2026-10-03T23:00:00Z"))
  assert.equal(list[1], utc("2026-10-04T00:00:00Z"))
  assert.equal(list.length, 49)
  assert.equal(T.playbackDelay("regional"), 250)
  // On the hour exactly, now is its own step and +48 h the last.
  const sharp = [...T.steps(utc("2026-10-03T12:00:00Z"), "regional")]
  assert.equal(sharp[0], utc("2026-10-03T12:00:00Z"))
  assert.equal(sharp[48], utc("2026-10-05T12:00:00Z"))
})

test("the now step is the latest one not after now", () => {
  const list = [0, H, 2 * H, 3 * H]
  assert.equal(T.atNow(list, 2 * H - 1), 1)
  assert.equal(T.atNow(list, 2 * H), 2)
  assert.equal(T.atNow(list, -5), 0)
  assert.equal(T.atNow(list, 10 * H), 3)
  assert.equal(T.atNow([], 0), -1)
})

test("nearest index and clamping", () => {
  const list = [0, H, 2 * H, 3 * H]
  assert.equal(T.nearestIndex(list, 0.4 * H), 0)
  assert.equal(T.nearestIndex(list, 0.5 * H), 0)
  assert.equal(T.nearestIndex(list, 0.6 * H), 1)
  assert.equal(T.nearestIndex(list, -H), 0)
  assert.equal(T.nearestIndex(list, 9 * H), 3)
  assert.equal(T.nearestIndex([], 0), -1)
  assert.equal(T.clampIndex(7, list), 3)
  assert.equal(T.clampIndex(-2, list), 0)
  assert.equal(T.clampIndex(1.6, list), 2)
  assert.equal(T.clampIndex("x", list), 0)
  assert.equal(T.clampIndex(0, []), -1)
})

test("playback steps, loops or stops", () => {
  const list = [0, H, 2 * H]
  assert.equal(T.advance(0, list, 1, false), 1)
  assert.equal(T.advance(2, list, 1, false), 2)
  assert.equal(T.advance(2, list, 1, true), 0)
  assert.equal(T.advance(0, list, -1, true), 2)
  assert.equal(T.advance(0, list, -1, false), 0)
  assert.equal(T.advance(9, list, 1, true), 0)
  assert.equal(T.advance(0, [], 1, true), -1)
})

test("labels give the day offset and local time", () => {
  const now = utc("2026-10-03T22:41:00Z")
  const list = T.steps(now, "global")
  const plain = (v) => JSON.parse(JSON.stringify(v))
  assert.deepStrictEqual(plain(T.stepLabel(list[0], now, "global", 0)), { dayOffset: 0, hour: 21, minute: 0, isNow: true })
  assert.deepStrictEqual(plain(T.stepLabel(list[1], now, "global", 0)), { dayOffset: 1, hour: 0, minute: 0, isNow: false })
  // In CEST (+2 h) now is already the 4th; 21 UTC was 23 h on the 3rd.
  assert.deepStrictEqual(plain(T.stepLabel(list[0], now, "global", 120)), { dayOffset: -1, hour: 23, minute: 0, isNow: true })
  assert.deepStrictEqual(plain(T.stepLabel(list[1], now, "global", 120)), { dayOffset: 0, hour: 2, minute: 0, isNow: false })
  // India (+5:30) shows the half hours.
  assert.deepStrictEqual(plain(T.stepLabel(list[1], now, "global", 330)), { dayOffset: 0, hour: 5, minute: 30, isNow: false })
  // Without an offset the system zone counts; the fields are still there.
  const local = T.stepLabel(list[2], now, "global")
  assert.ok(local.hour >= 0 && local.hour < 24 && local.minute >= 0 && local.isNow === false)
  // Regional: the hour now falls in only.
  assert.equal(T.stepLabel(utc("2026-10-03T22:00:00Z"), now, "regional", 0).isNow, true)
  assert.equal(T.stepLabel(utc("2026-10-03T21:00:00Z"), now, "regional", 0).isNow, false)
})
