// The sun and the sky (Sky.js): no map projection involved. Shared by the
// More plugins (tools/sync-shared.sh).
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const S = load("Sky.js")
const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`)

test("subsolar point", () => {
  // June solstice noon UTC: sun over the Tropic of Cancer near Greenwich.
  const june = S.subsolarPoint(Date.UTC(2026, 5, 21, 12))
  near(june.lat, 23.44, 0.2)
  near(june.lon, 0, 1)
  const december = S.subsolarPoint(Date.UTC(2026, 11, 21, 0))
  near(december.lat, -23.44, 0.2)
  near(Math.abs(december.lon), 180, 1)
})

// ---- The sky colour of the menu bar time ----

// Bobingen near Augsburg, 2 October 2026 (CEST = UTC+2).
const place = [48.27, 10.83]
const at = (h, m = 0) => Date.UTC(2026, 9, 2, h - 2, m)
const elevation = (ms) => S.sunElevation(place[0], place[1], ms)
const strongest = (mix) => Object.entries(mix).sort((a, b) => b[1] - a[1])[0][0]

test("sun elevation: noon high, sunset near zero, midnight deep", () => {
  // Solar noon here is about 13:10 CEST; early October the sun stands at
  // about 90 − 48.3 − 3.6 ≈ 38°.
  near(elevation(at(13, 10)), 38.2, 1)
  // Sunset about 18:58 CEST.
  near(elevation(at(18, 58)), -0.6, 1)
  assert.ok(elevation(at(1, 10)) < -40)
  // The equator at an equinox noon: nearly overhead.
  assert.ok(S.sunElevation(0, 0, Date.UTC(2026, 2, 20, 12, 7)) > 89)
})

test("sky mix: day, golden hour, blue hour, night", () => {
  for (const e of [-30, -14, -10, -6, -4, -1, 2, 5, 8, 40]) {
    const mix = S.skyMix(e)
    near(mix.day + mix.golden + mix.blue + mix.night, 1, 1e-9)
  }
  assert.equal(strongest(S.skyMix(elevation(at(13)))), "day")
  assert.equal(strongest(S.skyMix(elevation(at(19)))), "golden")
  assert.equal(S.skyMix(-6).blue, 1)
  assert.equal(strongest(S.skyMix(elevation(at(23)))), "night")
  assert.equal(S.skyMix(-14).night, 1)
  assert.equal(S.skyMix(8).day, 1)
  // Monotone from day to night: as the sun sinks, the weight moves only
  // towards later phases.
  const rank = (mix) => mix.golden * 1 + mix.blue * 2 + mix.night * 3
  let previous = -1
  for (let e = 12; e >= -16; e -= 0.25) {
    const r = rank(S.skyMix(e))
    assert.ok(r >= previous - 1e-9, `rank falls at ${e}°`)
    previous = r
  }
})

test("sky colour: base colours, softened and readable", () => {
  assert.equal(S.skyColor(40), "#5ea8e8")
  assert.equal(S.skyColor(-30), "#4a3c9a")
  assert.equal(S.skyColor(0), "#e3a447")
  // On a dark theme the night is lifted towards the text until it reads.
  const darkBg = S.hexRgb("#1e1e2e")
  const darkFg = S.hexRgb("#cdd6f4")
  const lightBg = S.hexRgb("#eff1f5")
  const lightFg = S.hexRgb("#4c4f69")
  for (const e of [40, 0, -6, -30]) {
    assert.ok(S.contrast(S.hexRgb(S.skyColor(e, darkFg, darkBg)), darkBg) >= 3, `dark ${e}`)
    assert.ok(S.contrast(S.hexRgb(S.skyColor(e, lightFg, lightBg)), lightBg) >= 3, `light ${e}`)
  }
})

test("sun colour: gold, softened a quarter, then readable at 3:1", () => {
  assert.equal(S.sunColor(), "#e3a447")
  const gold = S.hexRgb("#e3a447")
  const pairs = [[[0.92, 0.92, 0.92], [0.1, 0.1, 0.12]], [[0.1, 0.1, 0.1], [0.98, 0.98, 0.98]],
    [[0.2, 0.2, 0.25], [0.95, 0.9, 0.8]], [[0.8, 0.85, 0.9], [0.15, 0.18, 0.2]]]
  for (const [fg, bg] of pairs) {
    const c = S.hexRgb(S.sunColor(fg, bg))
    assert.ok(S.contrast(c, bg) >= 3 || c.every((v, i) => Math.abs(v - fg[i]) < 0.003), `${fg} on ${bg}`)
    // Never further from gold than a quarter towards the text, unless needed.
    const quarter = S.mixRgb(gold, fg, 0.25)
    if (S.contrast(quarter, bg) >= 3) assert.equal(S.sunColor(fg, bg), S.rgbHex(quarter))
  }
})

test("sun times: Berlin, 2 October 2026 (CEST)", () => {
  const berlin = [52.52, 13.405]
  const cest = 2 * 3600
  const local = (h, m) => Date.UTC(2026, 9, 2, h - 2, m)
  const t = S.sunTimes(berlin[0], berlin[1], local(12, 0), cest)
  const minutes = (ms) => Math.round((ms - Date.UTC(2026, 9, 1, 22, 0)) / 60000)
  const hm = (h, m) => h * 60 + m
  assert.equal(t.polar, "")
  // Almanac values for Berlin that day: sunrise 07:09, sunset 18:42, solar
  // noon 12:55 (±3 min).
  assert.ok(Math.abs(minutes(t.sunrise) - hm(7, 9)) <= 3, `sunrise ${minutes(t.sunrise)}`)
  assert.ok(Math.abs(minutes(t.sunset) - hm(18, 42)) <= 3, `sunset ${minutes(t.sunset)}`)
  assert.ok(Math.abs((minutes(t.sunrise) + minutes(t.sunset)) / 2 - hm(12, 55)) <= 2)
  // Evening golden hour from +6° to −4°, then the blue hour to −8°.
  assert.ok(minutes(t.goldenEvening[0]) >= hm(17, 50) && minutes(t.goldenEvening[0]) <= hm(18, 5))
  assert.ok(minutes(t.goldenEvening[1]) >= hm(18, 55) && minutes(t.goldenEvening[1]) <= hm(19, 10))
  assert.equal(t.blueEvening[0], t.goldenEvening[1])
  assert.ok(minutes(t.blueEvening[1]) > minutes(t.blueEvening[0]) + 15)
  assert.ok(minutes(t.blueEvening[1]) <= hm(19, 45))
  // The morning mirrors it: blue, then golden across sunrise.
  assert.equal(t.blueMorning[1], t.goldenMorning[0])
  assert.ok(t.goldenMorning[0] < t.sunrise && t.sunrise < t.goldenMorning[1])
  assert.ok(t.goldenEvening[0] < t.sunset && t.sunset < t.goldenEvening[1])
  // The same day whatever moment of it is asked for.
  assert.deepEqual(S.sunTimes(berlin[0], berlin[1], local(0, 5), cest), t)
  // The limits are the sky colour's: golden at the start of the golden hour
  // changes to blue in the middle of the stops.
  near(S.sunElevation(berlin[0], berlin[1], t.goldenEvening[1]), -4, 0.05)
})

test("sun times: polar night and midnight sun", () => {
  // Longyearbyen (78° N): no sunrise in December, no sunset in June.
  const night = S.sunTimes(78.22, 15.65, Date.UTC(2026, 11, 21, 12), 3600)
  assert.equal(night.polar, "night")
  assert.equal(night.sunrise, 0)
  assert.equal(night.sunset, 0)
  assert.deepEqual([...night.goldenEvening], [0, 0])
  const day = S.sunTimes(78.22, 15.65, Date.UTC(2026, 5, 21, 12), 7200)
  assert.equal(day.polar, "day")
  assert.equal(day.sunset, 0)
})


test("night fill: 70 % black and 30 % night sky, stronger on dark themes", () => {
  const light = S.nightFill(S.hexRgb("#eff1f5"))
  const dark = S.nightFill(S.hexRgb("#1e1e2e"))
  near(light.r, 0x4a / 255 * 0.3, 1e-9)
  near(light.b, 0x9a / 255 * 0.3, 1e-9)
  assert.equal(light.a, 0.30)
  assert.equal(dark.a, 0.38)
  assert.equal(dark.r, light.r)
})


test("twilight layers: soft bands, then the night in three steps", () => {
  const bg = S.hexRgb("#eff1f5")
  const all = S.twilightLayers({ golden: true, blue: true, night: true }, bg)
  assert.deepEqual(all.map((l) => [l.high, l.low, l.fill.a]), [
    [6, 4, 0.10], [4, 2, 0.20], [2, 0, 0.28],
    [0, -3, 0.10], [-3, -6, 0.20], [-6, -8, 0.28],
    [0, -6, 0.12], [-6, -12, 0.24], [-12, null, 0.30]])
  // The night steps in the night colour, darker with every step; dark themes
  // take the stronger full night.
  near(all[6].fill.r, S.nightFill(bg).r, 1e-12)
  assert.equal(S.twilightLayers({ night: true }, S.hexRgb("#1e1e2e"))[2].fill.a, 0.38)
  assert.deepEqual([...S.twilightElevations(all)], [6, 4, 2, 0, -3, -6, -8, -12])
  assert.equal(S.twilightLayers({}, bg).length, 0)
})

test("twilight rings: night, golden and blue", () => {
  // June solstice noon UTC: the night (one pole) as one ring holding 180°.
  const june = Date.UTC(2026, 5, 21, 12)
  assert.equal(S.twilightRings(june, 0).length, 1)
  // Near the equinox −8° holds no pole (an oval) and +6° both (two rings).
  const equinox = Date.UTC(2026, 2, 20, 15)
  assert.equal(S.twilightRings(equinox, -8).length, 1)
  assert.equal(S.twilightRings(equinox, 6).length, 2)
  // Every boundary point has the sun at that elevation.
  for (const [ms, e] of [[june, 6], [june, -4], [equinox, -8], [equinox, 6], [june, 0]]) {
    const rings = S.twilightRings(ms, e)
    const boundary = rings[rings.length - 1].filter(p => Math.abs(p.lat) < 89 && Math.abs(Math.abs(p.lon) - 180) > 1e-9)
    for (const p of boundary.slice(0, 120)) near(S.sunElevation(p.lat, p.lon, ms), e, 0.2)
  }
})
