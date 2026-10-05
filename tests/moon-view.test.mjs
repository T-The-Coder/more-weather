// MoonView.js: Meeus' worked examples, then the Moon seen from Berlin and
// Sydney on three dates against JPL Horizons (altitude, azimuth, lit
// fraction, bright limb, distance, size) and the USNO (rise and set), from
// tests/fixtures/moonview-reference.json (tools/fetch-moonview-fixture.py).
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const V = load("MoonView.js")
const REF = JSON.parse(readFileSync(join(root, "tests/fixtures/moonview-reference.json"), "utf8"))
const MIN = 60000
const near = (a, b, eps, what = "") => assert.ok(Math.abs(a - b) <= eps, `${what} ${a} != ${b} (±${eps})`)
const angle = (a, b) => ((a - b) % 360 + 540) % 360 - 180
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 }
const horizonsDate = (s) => {
  const m = s.match(/(\d+)-(\w+)-(\d+) (\d+):(\d+)/)
  return Date.UTC(+m[1], MONTHS[m[2]], +m[3], +m[4], +m[5])
}
// A UTC moment for TT (the examples are in TD).
const fromTT = (ms) => ms - 69184

// Meeus, Astronomical Algorithms, example 47.a (1992 April 12, 0h TD):
// λ = 133.162655°, β = −3.229126°, Δ = 368 409.7 km; apparent α =
// 134.688470°, δ = 13.768368° (as reproduced by PyMeeus' doctests,
// pymeeus/Moon.py, retrieved 2026-10-05).
test("Meeus example 47.a", () => {
  const T = V.centuriesTT(fromTT(Date.UTC(1992, 3, 12)))
  const m = V.moonEcliptic(T)
  near(m.lon, 133.162655, 2e-6, "λ")
  near(m.lat, -3.229126, 2e-6, "β")
  near(m.distanceKm, 368409.7, 0.1, "Δ")
  const g = V.geocentric(fromTT(Date.UTC(1992, 3, 12)))
  near(g.moon.ra, 134.688470, 2e-4, "α")
  near(g.moon.dec, 13.768368, 2e-4, "δ")
})

// Example 22.a (1987 April 10, 0h TD): Δψ = −3.788″, Δε = +9.443″, ε0 =
// 23°26′27.407″; the short series is good to 0.5″ and 0.1″.
// Example 25.a (1992 October 13, 0h TD): α☉ = 13h13m31.4s, δ☉ = −7°47′06″,
// R = 0.99766 au. Example 12.a: GMST 1987-04-10 0h UT = 13h10m46.3668s.
test("Meeus examples 22.a, 25.a, 12.a", () => {
  const n = V.nutation(V.centuriesTT(fromTT(Date.UTC(1987, 3, 10))))
  near(n.dpsi * 3600, -3.788, 0.5, "Δψ")
  near(n.deps * 3600, 9.443, 0.1, "Δε")
  near(n.eps0, 23 + 26 / 60 + 27.407 / 3600, 0.001 / 3600, "ε0")
  const g = V.geocentric(fromTT(Date.UTC(1992, 9, 13)))
  near(g.sun.ra, (13 + 13 / 60 + 31.4 / 3600) * 15, 0.2 / 3600 * 15, "α☉")
  near(g.sun.dec, -(7 + 47 / 60 + 6 / 3600), 1 / 3600, "δ☉")
  near(g.sun.distanceAu, 0.99766, 1e-5, "R")
  near(V.gmst(Date.UTC(1987, 3, 10)), (13 + 10 / 60 + 46.3668 / 3600) * 15, 1e-5, "GMST")
})

// Horizons (DE441, airless apparent topocentric) every 3 hours on
// 2026-03-03, 2026-06-15 and 2026-10-05 from Berlin and Sydney. The bright
// limb is opposite Horizons' PsAng (the position angle of the extended
// Sun→Moon radius vector). Measured worst errors: see ASTRO-SKY.md.
test("against JPL Horizons: Berlin and Sydney, three dates", () => {
  let worst = { alt: 0, az: 0, k: 0, chi: 0, dist: 0, diam: 0 }
  for (const [name, place] of Object.entries(REF.places)) {
    for (const [date, day] of Object.entries(place.dates)) {
      for (const row of day.horizons) {
        const ms = horizonsDate(row.utc)
        const v = V.view(place.lat, place.lon, ms, { riseSet: false, heightM: name === "berlin" ? 34 : 3 })
        const what = `${name} ${row.utc}`
        near(v.altitude, row.altitude, 0.3, `${what} altitude`)
        // Azimuth: compare along the sky (it spins near the zenith).
        near(angle(v.azimuth, row.azimuth) * Math.cos(row.altitude * Math.PI / 180), 0, 0.3, `${what} azimuth`)
        near(v.illuminated, row.illuminated, 0.01, `${what} lit`)
        near(angle(v.brightLimbAngle, row.psAng - 180), 0, 2, `${what} bright limb`)
        near(v.distanceKm, row.distanceKm, 60, `${what} distance`)
        near(v.angularDiameterDeg * 3600, row.angularDiameterArcsec, 2, `${what} diameter`)
        worst = {
          alt: Math.max(worst.alt, Math.abs(v.altitude - row.altitude)),
          az: Math.max(worst.az, Math.abs(angle(v.azimuth, row.azimuth) * Math.cos(row.altitude * Math.PI / 180))),
          k: Math.max(worst.k, Math.abs(v.illuminated - row.illuminated)),
          chi: Math.max(worst.chi, Math.abs(angle(v.brightLimbAngle, row.psAng - 180))),
          dist: Math.max(worst.dist, Math.abs(v.distanceKm - row.distanceKm)),
          diam: Math.max(worst.diam, Math.abs(v.angularDiameterDeg * 3600 - row.angularDiameterArcsec))
        }
      }
    }
  }
  if (process.env.MOONVIEW_REPORT) console.log(worst)
})

// USNO rise and set (upper limb, 34′ refraction), UTC, for the same days.
test("rise and set against the USNO", () => {
  let worst = 0
  for (const [name, place] of Object.entries(REF.places)) {
    for (const [date, day] of Object.entries(place.dates)) {
      const [y, m, d] = date.split("-").map(Number)
      const start = Date.UTC(y, m - 1, d)
      const v = V.view(place.lat, place.lon, start, { heightM: 0 })
      for (const [phen, key] of [["Rise", "rise"], ["Set", "set"]]) {
        const hm = day.usno[phen]
        if (!hm) continue
        const [h, mi] = hm.split(":").map(Number)
        const usno = start + (h * 60 + mi) * MIN
        assert.ok(v[key], `${name} ${date} ${key}`)
        near(v[key], usno, 3 * MIN, `${name} ${date} ${key}`)
        worst = Math.max(worst, Math.abs(v[key] - usno) / MIN)
      }
    }
  }
  if (process.env.MOONVIEW_REPORT) console.log("rise/set worst min", worst)
})

test("tilt, litAngle, waxing, earthshine, parallactic angle", () => {
  // The parallactic angle is 0 on the meridian (south of the zenith, north
  // hemisphere) and positive (zenith to the east of north) after transit.
  near(V.parallacticAngle(0, 10, 52), 0, 1e-9)
  assert.ok(V.parallacticAngle(30, 10, 52) > 0)
  // A waxing crescent seen from Berlin in the evening is lit low on the
  // right: tilt between −180 and 0; seen from Sydney, lit on the left.
  const evening = Date.UTC(2026, 9, 13, 17) // two days after new (10 Oct 15:50)
  const b = V.view(52.52, 13.405, evening, { riseSet: false })
  const s = V.view(-33.87, 151.21, Date.UTC(2026, 9, 13, 8), { riseSet: false })
  assert.equal(b.waxing, true)
  assert.equal(b.earthshine, true)
  assert.ok(b.tilt < 0, `Berlin tilt ${b.tilt}`)
  assert.ok(s.tilt > 0, `Sydney tilt ${s.tilt}`)
  // litAngle: tilt 0 → up (−π/2), tilt −90 (right) → 0.
  near(b.litAngle, (-90 - b.tilt) * Math.PI / 180, 1e-12)
  const full = V.view(52.52, 13.405, Date.UTC(2026, 9, 26, 4, 12), { riseSet: false })
  assert.ok(full.illuminated > 0.99 && !full.earthshine)
  near(full.phase, 0.5, 0.01)
  // aboveHorizon agrees with the rise and set it reports.
  const v = V.view(52.52, 13.405, Date.UTC(2026, 9, 5, 12))
  assert.equal(v.aboveHorizon, v.set !== null && (v.rise === null || v.set < v.rise))
})
