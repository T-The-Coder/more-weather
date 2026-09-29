import { test } from "node:test"
// Loose comparison: arrays made inside the loaded file belong to another
// context, so their prototype differs from this one's.
import assert from "node:assert"
import { load } from "./load.mjs"

const Model = load("Model.js")
const hour = (iso, extra) => Object.assign({ time: iso }, extra || {})

test("stored forecasts drop past rows before they are cut to length", () => {
  // 2026-09-29: saved places still held the hours of 14 September, because
  // the oldest rows were kept and every newer forecast fell off the end.
  const old = []
  for (let h = 0; h < 72; ++h)
    old.push(hour(new Date(Date.UTC(2026, 8, 14, h)).toISOString(), { tempC: "20" }))
  const now = Date.parse("2026-09-29T18:30:00Z")
  const fresh = [hour("2026-09-29T18:00:00Z", { tempC: "21" }), hour("2026-09-29T19:00:00Z", { tempC: "19" })]
  const merged = Model.mergeWeatherSnapshotForStorage(
    { hourly: fresh, daily: [{ date: "2026-09-29" }, { date: "2026-09-30" }], current: { temp_C: "21" } },
    { hourly: old, daily: [{ date: "2026-09-14" }], current: { temp_C: "26" } }, now)
  assert.deepEqual(merged.hourly.map((row) => row.tempC), ["21", "19"])
  assert.deepEqual(merged.daily.map((row) => row.date), ["2026-09-29", "2026-09-30"])
  assert.strictEqual(merged.current.temp_C, "21")
})

test("hourlyValueAt interpolates between hours and stops where the series ends", () => {
  const series = [
    hour("2026-09-29T19:00+02:00", { tempC: "24" }),
    hour("2026-09-29T20:00+02:00", { tempC: "21" }),
    hour("2026-09-29T21:00+02:00", { tempC: "19" })
  ]
  const at = (iso) => Model.hourlyValueAt(series, Date.parse(iso), "tempC")
  assert.strictEqual(at("2026-09-29T20:30+02:00").value, 20)
  assert.strictEqual(at("2026-09-29T19:00+02:00").value, 24)
  // The last hour counts for up to 90 minutes after its start.
  assert.strictEqual(at("2026-09-29T22:00+02:00").value, 19)
  assert.strictEqual(at("2026-09-29T23:00+02:00"), null)
  assert.strictEqual(at("2026-09-29T18:00+02:00"), null)
})

test("temperatureExtrema labels one high and one low per swing, centred on flat tops", () => {
  const values = [15, 17, 20, 22, 22, 22, 21, 19, 16, 14, 13, 13, 14, 16, 19, 21, 23, 23, 22]
  const found = Model.temperatureExtrema(values, 5, 6).map((e) => [e.kind, e.index, e.value])
  assert.deepEqual(found, [["min", 0, 15], ["max", 4, 22], ["min", 10, 13], ["max", 16, 23]])
})

test("rainAlertStart honours threshold, lead time and rain already falling", () => {
  const now = new Date("2026-09-29T15:05:00Z")
  const slot = (minutes, mm, probability) => ({
    time: new Date(Date.parse("2026-09-29T15:00:00Z") + minutes * 60000).toISOString(),
    precipitation: mm, probability: probability
  })
  const series = [slot(0, 0.2, 80), slot(15, 0.3, 80), slot(30, 1.2, 60), slot(45, 6, 70), slot(60, 0, 10)]
  // Light rain is falling now: nothing to announce at "any rain".
  assert.strictEqual(Model.rainAlertStart(series, now, 0.1, 30), null)
  const moderate = Model.rainAlertStart(series, now, 0.51, 30)
  assert.strictEqual(moderate.time, slot(30).time)
  assert.strictEqual(moderate.level, 1)
  // Heavy rain lies beyond 30 minutes, within 60.
  assert.strictEqual(Model.rainAlertStart(series, now, 4.01, 30), null)
  assert.strictEqual(Model.rainAlertStart(series, now, 4.01, 60).level, 2)
  // Unlikely forecast rain does not count; radar rain always does.
  assert.strictEqual(Model.rainAlertStart([slot(15, 3, 20)], now, 0.1, 60), null)
  assert.notStrictEqual(Model.rainAlertStart([Object.assign(slot(15, 3, 20), { precipitationSource: "radar" })], now, 0.1, 60), null)
})

test("rainLevel follows the rain legend", () => {
  assert.deepEqual([0, 0.5, 0.6, 4, 4.1].map(Model.rainLevel), [0, 0, 1, 1, 2])
})

test("the drift arrow keeps a labelled length at every zoom", () => {
  // From the widest to the closest zoom (px per km), fast and slow rain.
  for (const pixelsPerKm of [0.3, 1, 3, 10, 30]) {
    for (const speed of [15, 40, 80]) {
      const arrow = Model.driftArrow({ speedKmh: speed, directionFrom: 250 }, pixelsPerKm, 900, 400, 46, 22)
      assert.ok(arrow.minutes > 0, `minutes at ${pixelsPerKm} px/km, ${speed} km/h`)
      assert.ok(arrow.length <= 900 / 2, "stays inside the view")
    }
  }
  const wide = Model.driftArrow({ speedKmh: 40, directionFrom: 270 }, 1, 900, 600, 46, 22)
  assert.strictEqual(wide.minutes, 120)
  assert.strictEqual(Model.driftArrow(null, 1, 900, 600, 46, 22), null)
})

test("the wind grid is read at the chosen height, gusts only at 10 m", () => {
  const report = [{
    latitude: 48.3, longitude: 10.8,
    current: { wind_speed_10m: 12, wind_direction_10m: 250, wind_gusts_10m: 30,
      wind_speed_850hPa: 40, wind_direction_850hPa: 270, wind_speed_250hPa: 180, wind_direction_250hPa: 280 }
  }]
  const ground = Model.windGridSeries(report, "10m")[0]
  assert.strictEqual(ground.windSpeed, 12)
  assert.strictEqual(ground.windGust, 30)
  const aloft = Model.windGridSeries(report, "850hPa")[0]
  assert.strictEqual(aloft.windSpeed, 40)
  assert.strictEqual(aloft.windDirection, 270)
  assert.strictEqual(aloft.windGust, null)
  // A height the report lacks gives no points; an unknown one means 10 m.
  assert.strictEqual(Model.windGridSeries(report, "500hPa").length, 0)
  assert.strictEqual(Model.windGridSeries(report, "nonsense")[0].windSpeed, 12)
  assert.strictEqual(Model.windLevel("250hPa").scaleKmh, 320)
})

test("today is the place's date, not this computer's", () => {
  // 00:30 in Germany on Wednesday is Tuesday 17:30 in Chicago (UTC−5).
  const now = Date.parse("2026-09-29T22:30:00Z")
  assert.strictEqual(Model.placeDate(now, -5 * 3600), "2026-09-29")
  assert.strictEqual(Model.placeDate(now, 2 * 3600), "2026-09-30")
  assert.strictEqual(Model.placeDate(now, 9 * 3600), "2026-09-30")
})

test("clock times are the place's", () => {
  const instant = Date.parse("2026-09-29T22:10:00Z")
  assert.strictEqual(Model.placeClock(instant, 9 * 3600), "07:10")
  assert.strictEqual(Model.placeClock(instant, -5 * 3600), "17:10")
})
