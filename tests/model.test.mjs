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

test("More Time's cities join the saved places once, in their order", () => {
  const { samePlace } = load("PlaceSearch.js")
  const saved = [
    { name: "Reykjavík", latitude: 64.1466, longitude: -21.9426 },
    { name: "Paris", latitude: 48.8566, longitude: 2.3522 }
  ]
  const raw = JSON.stringify([
    { name: "Tokyo", country: "Japan", tz: "Asia/Tokyo", lat: 35.6895, lon: 139.6917 },
    // The same name a few kilometres off: already there.
    { name: "Reykjavik", country: "Iceland", tz: "Atlantic/Reykjavik", lat: 64.13, lon: -21.9 },
    { name: "UTC", country: "", tz: "Etc/UTC", lat: null, lon: null },
    // The same name far away: another place.
    { name: "Paris", country: "United States", tz: "America/Chicago", lat: 33.6609, lon: -95.5555 },
    // Another name on the same spot: already there.
    { name: "Tokio", country: "Japan", tz: "Asia/Tokyo", lat: 35.69, lon: 139.69 }
  ])
  const result = Model.importedCities(saved, raw, samePlace)
  assert.deepEqual(result.list.map((p) => p.name), ["Reykjavík", "Paris", "Tokyo", "Paris"])
  assert.equal(result.added, 2)
  assert.equal(result.existing, 2)
  assert.equal(result.skipped, 1)
  assert.equal(saved.length, 2)
  assert.equal(Model.importedCities(saved, "not json", samePlace).added, 0)
})

// ---- Air pressure.
test("pressure in hPa or inHg", () => {
  assert.deepEqual(Model.pressureValue("1013.25", false), { value: 1013, unit: "hPa" })
  assert.deepEqual(Model.pressureValue(1013.25, true), { value: 29.92, unit: "inHg" })
  assert.equal(Model.pressureValue("", false), null)
  assert.equal(Model.pressureText(1013.26), "1013.3")
})

test("pressure trend over three hours", () => {
  const rows = [1010, 1011, 1012, 1012.4, 1013.6, 1010.4].map((p) => ({ pressureHpa: String(p) }))
  assert.equal(Model.pressureTrend(rows, 3), "rising")      // 1012.4 − 1010 = 2.4
  assert.equal(Model.pressureTrend(rows, 4), "rising")      // 1013.6 − 1011 = 2.6
  assert.equal(Model.pressureTrend(rows, 5), "falling")     // 1010.4 − 1012 = −1.6
  const steady = [1013, 1013, 1013, 1014].map((p) => ({ pressureHpa: String(p) }))
  assert.equal(Model.pressureTrend(steady, 3), "steady")
  assert.equal(Model.pressureTrend(rows, 2), "")            // no row three hours back
  assert.equal(Model.pressureTrend([{ pressureHpa: "" }, {}, {}, { pressureHpa: "1000" }], 3), "")
})

test("the day's pressure is the mean of its hours, from twelve on", () => {
  const times = []
  const values = []
  for (let h = 0; h < 24; h++) { times.push(`2026-10-03T${String(h).padStart(2, "0")}:00`); values.push(1000 + h) }
  for (let h = 0; h < 11; h++) { times.push(`2026-10-04T${String(h).padStart(2, "0")}:00`); values.push(1020) }
  const means = Model.dailyPressureMeans(times, values)
  assert.equal(means["2026-10-03"], "1011.5")
  assert.equal(means["2026-10-04"], undefined)
})

test("Open-Meteo carries pressure into now, the hours and the days", () => {
  const time = []
  const pressure = []
  for (let h = 0; h < 24; h++) { time.push(`2026-10-03T${String(h).padStart(2, "0")}:00`); pressure.push(1015) }
  const report = {
    current: { temperature_2m: 12, pressure_msl: 1013.24 },
    hourly: { time, temperature_2m: time.map(() => 12), pressure_msl: pressure },
    daily: { time: ["2026-10-03"], temperature_2m_max: [14], temperature_2m_min: [9] }
  }
  assert.equal(Model.openMeteoCurrentCondition(report).pressureHpa, "1013.2")
  assert.equal(Model.openMeteoHourlyForecast(report, "", 3)[0].pressureHpa, "1015")
  assert.equal(Model.openMeteoForecastDays(report, "2026-10-03")[0].pressureHpa, "1015")
})

test("MET Norway's sea-level pressure reaches now and the hours", () => {
  const report = { properties: { timeseries: [0, 1].map((h) => ({
    time: `2026-10-03T1${h}:00:00Z`,
    data: { instant: { details: { air_temperature: 8, air_pressure_at_sea_level: 1001.5 + h } },
      next_1_hours: { summary: { symbol_code: "cloudy" }, details: { precipitation_amount: 0 } } }
  })) } }
  const converted = Model.metNoToOpenMeteo(report)
  assert.equal(converted.current.pressure_msl, 1001.5)
  assert.deepEqual(Array.from(converted.hourly.pressure_msl), [1001.5, 1002.5])
  assert.equal(Model.openMeteoCurrentCondition(converted).pressureHpa, "1001.5")
})

test("Bright Sky's pressure in now, the hours, the days and the shared report", () => {
  const now = new Date("2026-10-03T12:20:00Z")
  const weather = []
  for (let h = 0; h < 24; h++)
    weather.push({ timestamp: `2026-10-03T${String(h).padStart(2, "0")}:00:00+00:00`, temperature: 10, pressure_msl: 1020 + (h === 12 ? 1 : 0), icon: "cloudy" })
  const report = { weather }
  assert.equal(Model.brightSkyCurrentCondition(report, null, now).pressureHpa, "1021")
  assert.equal(Model.hybridHourlyForecast(report, null, null, null, now, 2)[1].pressureHpa, "1020")
  assert.equal(Model.compactMosmixReport(report).weather[0].pressure_msl, 1020)
  const day = Model.hybridForecastDays(report, null, "2026-10-03", null)[0]
  assert.equal(day.pressureHpa, String(Math.round((1020 * 23 + 1021) / 24 * 10) / 10))
})
