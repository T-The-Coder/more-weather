// The place search's parsers (PlaceSearch.js, shared by the More plugins):
// Open-Meteo and Nominatim answers become { name, region, country,
// countryCode, lat, lon, tz }, and duplicates by rounded coordinates go.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const P = load("PlaceSearch.js")
const plain = (value) => JSON.parse(JSON.stringify(value))

test("Open-Meteo results keep the time zone", () => {
  const raw = JSON.stringify({ results: [
    { name: "Tórshavn", admin1: "Streymoy", country: "Faroe Islands", country_code: "FO", latitude: 62.01, longitude: -6.77, timezone: "Atlantic/Faroe" },
    { name: "No coordinates", country: "Nowhere" },
    { name: "Odd zone", country_code: "XYZ", latitude: 1, longitude: 2, timezone: "bad zone; rm" }
  ] })
  assert.deepStrictEqual(plain(P.parseOpenMeteo(raw)), [
    { name: "Tórshavn", region: "Streymoy", country: "Faroe Islands", countryCode: "fo", lat: 62.01, lon: -6.77, tz: "Atlantic/Faroe" },
    { name: "Odd zone", region: "", country: "", countryCode: "", lat: 1, lon: 2, tz: "" }
  ])
})

test("Open-Meteo without results or broken is empty", () => {
  assert.deepStrictEqual(plain(P.parseOpenMeteo("{}")), [])
  assert.deepStrictEqual(plain(P.parseOpenMeteo("")), [])
  assert.deepStrictEqual(plain(P.parseOpenMeteo("not json")), [])
})

test("Nominatim results have no time zone", () => {
  const raw = JSON.stringify([
    { name: "Klaksvík", lat: "62.2266", lon: "-6.589", address: { state: "Norðoyar", country: "Føroyar", country_code: "fo" } },
    { name: "", display_name: "Bergen, Vestland, Norge", lat: "60.39", lon: "5.32", address: { city: "Bergen", country: "Norge" } },
    { display_name: "Somewhere", lat: "x", lon: "1" }
  ])
  assert.deepStrictEqual(plain(P.parseNominatim(raw)), [
    { name: "Klaksvík", region: "Norðoyar", country: "Føroyar", countryCode: "fo", lat: 62.2266, lon: -6.589, tz: "" },
    { name: "Bergen", region: "", country: "Norge", countryCode: "", lat: 60.39, lon: 5.32, tz: "" }
  ])
  assert.deepStrictEqual(plain(P.parseNominatim("{}")), [])
})

test("duplicates by rounded coordinates go, the first stays", () => {
  const places = [
    { name: "A", lat: 50.001, lon: 8.001 },
    { name: "B", lat: 50.004, lon: 7.998 },
    { name: "C", lat: 51, lon: 8 }
  ]
  assert.deepStrictEqual(plain(P.dedupe(places, 8)).map((p) => p.name), ["A", "C"])
  assert.deepStrictEqual(plain(P.dedupe(places, 1)).map((p) => p.name), ["A"])
  // Rounding splits these two, the name joins them.
  const twins = [{ name: "Klaksvík", lat: 62.2255, lon: -6.5838 }, { name: "Klaksvik", lat: 62.2262, lon: -6.5858 }]
  assert.deepStrictEqual(plain(P.dedupe(twins, 8)).map((p) => p.name), ["Klaksvík"])
})

test("the requests ask for eight places in the language", () => {
  const om = P.openMeteoRequest("São Paulo", "pt")
  assert.match(om.url, /count=8/)
  assert.match(om.url, /name=S%C3%A3o%20Paulo/)
  assert.match(om.url, /language=pt/)
  const nm = P.nominatimRequest("São Paulo", "pt")
  assert.match(nm.url, /format=jsonv2&limit=8&addressdetails=1/)
  assert.equal(nm.headers["Accept-Language"], "pt")
})
