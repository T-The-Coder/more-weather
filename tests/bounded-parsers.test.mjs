// The other readers of network and file bytes stay bounded by what they
// read, not by numbers the data declares: JSON "length" members, the
// radar grids' sizes, the XML readers' scans, the basemap's tables and the
// globe's cached data.
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"
import { radarFrames, radarMotionSeries, radarWetFractions } from "../RadarMotion.mjs"

const M = load("Model.js")
const fast = (fn, ms = 300) => {
  const start = performance.now()
  const result = fn()
  const took = performance.now() - start
  assert.ok(took < ms, `took ${took.toFixed(1)} ms`)
  return result
}

test("parseJson drops a forged length, arrays keep theirs", () => {
  const data = M.parseJson('{"hourly": {"time": {"length": 4000000000}, "temperature_2m": [1, 2, 3]}}')
  assert.equal(data.hourly.time.length, undefined)
  assert.equal(data.hourly.temperature_2m.length, 3)
  // A forecast whose daily times claim billions of entries reads as none.
  const report = M.parseJson('{"daily": {"time": {"length": 4000000000}}, "hourly": {"time": []}}')
  assert.deepEqual(fast(() => M.openMeteoHourlyForecast(report, "", 6)), [])
})

test("radar grids: forged sizes and shapes are refused", () => {
  const row = (n) => Array(n).fill(0)
  const frame = (rows, cols, t) => ({ timestamp: new Date(t).toISOString(), precipitation_5: Array.from({ length: rows }, () => row(cols)) })
  const good = { radar: [frame(20, 20, 0), frame(20, 20, 900000)] }
  assert.equal(radarFrames(good).length, 2)
  assert.deepEqual(radarFrames({ radar: [frame(20, 20, 0), frame(20, 21, 900000)] }), [])
  assert.deepEqual(radarFrames({ radar: [frame(1300, 1, 0)] }), [])
  assert.deepEqual(radarFrames({ radar: [{ precipitation_5: { length: 1e9 } }] }), [])
  assert.deepEqual(radarFrames({ radar: Array.from({ length: 100 }, (_, i) => ({ timestamp: i })) }), [])
  // A corner polygon claiming tiny cells cannot widen the searches.
  const tiny = { ...good, geometry: { coordinates: [[[0, 0], [0, 1e-9], [1e-9, 1e-9], [1e-9, 0]]] } }
  fast(() => { radarMotionSeries(tiny); radarWetFractions(tiny) }, 1000)
})

test("XML readers scan once, also without closing tags", () => {
  const open = "<item><title>x".repeat(40000)
  fast(() => M.bomAlertReport("<rss>" + open), 500)
  fast(() => M.capFeedEntries("<feed>" + "<entry><link href=\"https://a\"".repeat(40000)), 500)
  fast(() => M.capAlerts("<alert>" + "<info><area><polygon>1,2 ".repeat(30000), 48, 11, "x", ""), 500)
  fast(() => M.decodeXml("<![CDATA[".repeat(50000) + "<".repeat(50000)), 500)
  // And read what they did before.
  const feed = '<feed><entry><link href="https://a.example/1"/><updated>2026-10-11T00:00:00Z</updated></entry>'
    + '<entry><link href="https://a.example/2"/></entry></feed>'
  assert.deepEqual(M.capFeedEntries(feed).map((e) => e.link), ["https://a.example/1", "https://a.example/2"])
  assert.equal(M.xmlElement("<a><cap:areaDesc x=\"1\">Nord &amp; <![CDATA[Süd]]></cap:areaDesc></a>", "cap:areaDesc"), "Nord & Süd")
})

test("basemap: a table or cell beyond the file is refused", () => {
  const B = load("Basemap.js")
  const header = (count, extra) => {
    const bytes = new Uint8Array(8 + count * 10 + extra)
    bytes.set([77, 87, 66, 77, 2, 5, count & 255, count >> 8])
    return bytes
  }
  const short = new Uint8Array(108)
  short.set([77, 87, 66, 77, 2, 5, 244, 1])
  assert.equal(B.load(short.buffer), false, "500 entries in 100 bytes")
  const one = header(1, 4)
  one.set([0, 0, 0, 0, 0, 0, 255, 255, 255, 0], 8)
  assert.equal(B.load(one.buffer), false)
  const file = readFileSync(join(root, "data", "basemap.bin"))
  assert.ok(B.load(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)))
})

test("globe store: cached data of the wrong shape is not kept", () => {
  const W = load("GlobeLayers.js")
  const store = W.newStore()
  assert.equal(W.keep(store, { key: "T1", times: { length: 1e9 }, points: [], vars: {} }), false)
  assert.equal(W.keep(store, { key: "T1", times: [1, 2], points: [[0, 0]], vars: { t: [1] } }), false)
  assert.equal(W.keep(store, { key: "T1", times: [1, 2], points: [[0, 0]], vars: { t: [1, 2] } }), true)
})

test("alert-hub links: https to a named public host only", () => {
  for (const ok of ["https://alerts.example.gov/cap/rss", "https://ssl.smn.gob.ar/CAP/AR.php", "https://a.b.c:8443/x"])
    assert.ok(M.publicHttpsUrl(ok), ok)
  for (const bad of ["http://alerts.example.gov/rss", "https://127.0.0.1/x", "https://10.1.2.3/x", "https://172.16.0.1/",
    "https://192.168.1.1/feed", "https://169.254.169.254/latest", "https://[fe80::1]/x", "https://[::1]/",
    "https://localhost/x", "https://printer.local/x", "https://intranet/x", "https://user@host.example/x",
    "https://0x7f000001/x", "ftp://a.example/x", "javascript:alert(1)", ""])
    assert.ok(!M.publicHttpsUrl(bad), bad)
  const hub = JSON.stringify({ sources: [
    { source: { authorityCountry: "XX", capAlertFeedStatus: "operating", capAlertFeed: "https://met.example.org/rss", sourceId: "xx-met-en" } },
    { source: { authorityCountry: "XX", capAlertFeedStatus: "operating", capAlertFeed: "http://met.example.org/rss", sourceId: "xx-met-fr" } },
    { source: { authorityCountry: "XX", capAlertFeedStatus: "operating", capAlertFeed: "https://192.168.0.5/rss", sourceId: "xx-x" } }] })
  assert.deepEqual(M.alertHubFeeds(hub, "xx").map((f) => f.url), ["https://met.example.org/rss"])
  const feed = '<rss><item><link>https://met.example.org/a.xml</link></item><item><link>http://met.example.org/b.xml</link></item>'
    + '<item><link>https://10.0.0.2/c.xml</link></item></rss>'
  assert.deepEqual(M.capFeedEntries(feed).map((e) => e.link), ["https://met.example.org/a.xml"])
})

test("map pictures only from the known hosts", () => {
  for (const ok of ["https://tilecache.rainviewer.com/v2/radar/1/512/5/1/2/2/1_1.png", "https://maps.dwd.de/geoserver/dwd/ows?x=1",
    "https://opengeo.ncep.noaa.gov/geoserver/x", "https://geo.weather.gc.ca/geomet?a", "https://openwms.fmi.fi/geoserver/Radar/wms",
    "https://geoservices.knmi.nl/adagucserver?d", "https://www.jma.go.jp/bosai/jmatile/x.png"])
    assert.ok(M.imageHostAllowed(ok), ok)
  for (const bad of ["http://maps.dwd.de/x", "https://maps.dwd.de.evil.example/x", "https://evil.example/maps.dwd.de",
    "file:///etc/passwd", "data:image/png;base64,AAAA", "https://127.0.0.1/x", "https://user@maps.dwd.de/x"])
    assert.ok(!M.imageHostAllowed(bad), bad)
})

test("saved places: at most 50, names at most 100 characters; JMA times digits only", () => {
  const many = Array.from({ length: 80 }, (_, i) => ({ name: "P" + i + "x".repeat(i === 0 ? 300 : 0), latitude: i, longitude: i }))
  const warn = console.warn
  console.warn = () => {}
  try {
    const list = M.parseSavedLocations(JSON.stringify(many))
    assert.equal(list.length, M.SAVED_PLACES_MAX)
    assert.equal(list[0].name.length, M.SAVED_PLACE_NAME_MAX)
    const full = list.slice()
    assert.equal(M.addSavedLocation(full, { name: "One more", latitude: 1, longitude: 2 }).length, M.SAVED_PLACES_MAX)
  } finally {
    console.warn = warn
  }
  const times = M.jmaTargetTimes(JSON.stringify([
    { basetime: "20261011234000", validtime: "20261011234000", elements: ["hrpns"] },
    { basetime: "../../x", validtime: "20261011235000", elements: ["hrpns"] }]))
  assert.deepEqual(times.map((t) => t.basetime), ["20261011234000"])
})
