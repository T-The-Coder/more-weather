import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const M = load("Model.js")
const url = (i) => `https://alerts.example.gov/${i}.xml`
const entries = (ids) => ids.map((i) => ({ link: url(i), published: NaN }))
const begin = (store, place = "48,11") => M.beginAlertRefresh(store, place)
const feed = (store, ids) => M.takeAlertFeedEntries(store, entries(ids), 100000, 10000)
const record = (id, extra = {}) => ({ alert_id: String(id), status: "actual", category: "met", ...extra })
const count = (store) => Object.keys(store.documents).length
const checkBytes = (store) => {
  let total = 0
  for (const [key, doc] of Object.entries(store.documents)) {
    const bytes = 2 * (key.length + store.place.length) + M.alertRecordBytes(doc.alerts)
    assert.equal(doc.bytes, bytes)
    total += bytes
  }
  assert.equal(store.bytes, total)
  assert.ok(total <= M.ALERT_MAX_RETAINED_BYTES)
  assert.ok(count(store) <= M.ALERT_MAX_DOCS)
}

test("every retained field is a bounded primitive, with an ellipsis only when cut", () => {
  const fields = M.normalizedAlertRecord({})
  const input = Object.fromEntries(Object.keys(fields).map((key) => [key, "x".repeat(10000)]))
  input.raw = { xml: "unbounded provider object" }
  input.info = [input.raw]
  input._level = 30
  const result = M.normalizedAlertRecord(input)
  for (const [key, value] of Object.entries(result)) {
    if (key === "_level") {
      assert.equal(value, 30)
      continue
    }
    const max = key.startsWith("description_") || key === "_references" ? M.ALERT_DESCRIPTION_MAX
      : key.startsWith("instruction_") || key === "web" ? M.ALERT_INSTRUCTION_MAX : M.ALERT_HEADLINE_MAX
    assert.equal(value.length, max, key)
    assert.ok(value.endsWith("…"), key)
  }
  assert.equal(result.raw, undefined)
  assert.equal(result.info, undefined)
  assert.equal(M.alertText("x".repeat(300), 300), "x".repeat(300))
  assert.equal(M.alertText(123, 300), "123")
  assert.equal(M.alertText("u".repeat(150000), 150000).length, 150000, "long URLs do not overflow the argument stack")
  assert.equal(M.alertText({ nested: "provider data" }, 300), "")
  assert.equal(M.alertRecordBytes([M.normalizedAlertRecord({ headline_en: "🌧" })]), 4)
})

test("CAP parser returns flat truncated records and still handles updates and cancellations", () => {
  const cap = (id, type, refs = "") => `<alert><identifier>${id}</identifier><msgType>${type}</msgType>`
    + `<references>${refs}</references><info><language>en</language><category>Met</category>`
    + `<headline>${"H".repeat(500)}</headline><description>${"D".repeat(6000)}</description>`
    + `<instruction>${"I".repeat(3000)}</instruction></info></alert>`
  const first = M.capAlerts(cap("first", "Alert"), 48, 11, "test", "")
  const update = M.capAlerts(cap("second", "Update", "sender,first,sent"), 48, 11, "test", "")
  const cancel = M.capAlerts(cap("third", "Cancel", "sender,second,sent"), 48, 11, "test", "")
  assert.equal(first[0].headline_en.length, 300)
  assert.equal(first[0].description_en.length, 4000)
  assert.equal(first[0].instruction_en.length, 2000)
  assert.ok(Object.values(first[0]).every((v) => typeof v === "string" || typeof v === "number"))
  const result = M.withoutSupersededAlerts(first.concat(update, cancel))
  assert.deepEqual(result.map((a) => a.alert_id), ["third"])
  assert.deepEqual(M.weatherAlerts({ alerts: result }, Date.now(), "en"), [])
})

test("documents, provider reports and place presentations have independent record caps", () => {
  const rows = Array.from({ length: 350 }, (_, i) => record(i, { headline_en: "H".repeat(500) }))
  const store = M.newAlertRetention()
  begin(store)
  const kept = M.keepAlertDocument(store, url(0), rows)
  assert.equal(kept.length, M.ALERT_MAX_PER_DOC)
  assert.equal(store.documents[url(0)].alerts.length, M.ALERT_MAX_PER_DOC)
  rows[0].headline_en = "changed"
  assert.equal(kept[0].headline_en.length, 300)
  assert.equal(M.normalizedAlertReport({ alerts: rows }).alerts.length, M.ALERT_MAX_PER_PLACE)
  assert.equal(M.weatherAlerts({ alerts: rows }, Date.now(), "en").length, M.ALERT_MAX_PER_PLACE)
  const nws = M.nwsAlertReport({ features: rows.map((a) => ({ id: a.alert_id, properties: { headline: a.headline_en } })) })
  assert.equal(nws.alerts.length, M.ALERT_MAX_PER_DOC)
  assert.equal(nws.alerts[1].headline_en.length, 300)
  // JMA reads municipality items before it builds the output alert array.
  const jma = M.jmaAlertReport([{ reportDatetime: "2026-10-23T00:00:00Z", warning: {
    class20Items: [{ areaCode: "test", kinds: [{ code: "10", status: "発表" }] }]
  } }], "test")
  assert.equal(jma.alerts.length, 1)
})

test("LRU count eviction includes empty and unreadable documents, hits refresh recency", () => {
  const store = M.newAlertRetention()
  begin(store)
  for (let i = 0; i < M.ALERT_MAX_DOCS; ++i) M.keepAlertDocument(store, url(i), i % 2 ? null : [record(i)])
  feed(store, [0])
  M.keepAlertDocument(store, url(64), [])
  assert.ok(store.documents[url(0)])
  assert.equal(store.documents[url(1)], undefined)
  assert.ok(store.documents[url(64)])
  assert.equal(count(store), 64)
  checkBytes(store)
})

test("LRU byte eviction, replacements and an oversized document maintain exact accounting", () => {
  const store = M.newAlertRetention()
  begin(store)
  const large = Array.from({ length: 100 }, (_, i) => record(i, {
    description_en: "D".repeat(4000), description_de: "D".repeat(4000)
  }))
  M.keepAlertDocument(store, url(0), large)
  M.keepAlertDocument(store, url(1), large)
  feed(store, [0])
  M.keepAlertDocument(store, url(2), large)
  assert.ok(store.documents[url(0)])
  assert.equal(store.documents[url(1)], undefined)
  assert.ok(store.documents[url(2)])
  assert.equal(count(store), 2, "bytes evict well before the 64 URL limit")
  checkBytes(store)
  M.keepAlertDocument(store, url(0), [])
  checkBytes(store)
  const huge = Array.from({ length: 200 }, (_, i) => record(i, {
    description_en: "D".repeat(4000), description_de: "D".repeat(4000),
    instruction_en: "I".repeat(2000), instruction_de: "I".repeat(2000)
  }))
  M.keepAlertDocument(store, url(3), huge)
  assert.equal(store.documents[url(3)], undefined, "a single oversized document cannot remain cached")
  checkBytes(store)
})

test("refresh spends at most 32 download attempts across feeds and defers the rest", () => {
  const store = M.newAlertRetention()
  const ids = Array.from({ length: 100 }, (_, i) => i)
  begin(store)
  feed(store, ids)
  feed(store, ids)
  const downloaded = []
  for (let link; (link = M.nextAlertDownload(store));) {
    downloaded.push(link)
    M.keepAlertDocument(store, link, [])
  }
  assert.equal(downloaded.length, 32)
  assert.equal(new Set(downloaded).size, 32)
  assert.equal(store.downloads, 32)
  feed(store, [101, 102])
  assert.equal(M.nextAlertDownload(store), "")
  M.endAlertRefresh(store)
  begin(store)
  feed(store, ids)
  assert.equal(M.nextAlertDownload(store), url(32), "cached entries do not spend the next refresh's budget")
  // No keep call for failed downloads: they still use all 32 attempts.
  while (M.nextAlertDownload(store)) {}
  assert.equal(store.downloads, 32)
  assert.equal(M.nextAlertDownload(store), "")
  checkBytes(store)
})

test("refresh end drops disappeared and stale URLs; a place change releases old matches", () => {
  const store = M.newAlertRetention()
  begin(store)
  for (let i = 0; i < 4; ++i) M.keepAlertDocument(store, url(i), [record(i)])
  feed(store, [1, 2])
  M.takeAlertFeedEntries(store, [{ link: url(3), published: 1 }], 100000, 10000)
  assert.equal(feed(store, [1, 2]).length, 0, "overlapping feeds do not duplicate cached alerts")
  M.endAlertRefresh(store)
  assert.deepEqual(Object.keys(store.documents), [url(1), url(2)])
  checkBytes(store)
  begin(store)
  feed(store, [2])
  M.endAlertRefresh(store)
  assert.deepEqual(Object.keys(store.documents), [url(2)])
  begin(store, "49,12")
  assert.equal(count(store), 0)
  assert.equal(store.bytes, 0)
  M.keepAlertDocument(store, url(0), [])
  M.endAlertRefresh(store) // Empty/failed feeds leave no referenced documents.
  assert.equal(count(store), 0)
  checkBytes(store)
})


test("deferred URLs get a turn even when earlier requests fail or the LRU cache churns", () => {
  for (const successful of [false, true]) {
    const store = M.newAlertRetention()
    const ids = Array.from({ length: 100 }, (_, i) => i)
    const attempted = new Set()
    for (let cycle = 0; cycle < 5; ++cycle) {
      begin(store)
      feed(store, ids)
      for (let link; (link = M.nextAlertDownload(store));) {
        attempted.add(link)
        if (successful) M.keepAlertDocument(store, link, [])
      }
      M.endAlertRefresh(store)
      checkBytes(store)
    }
    assert.equal(attempted.size, 100, successful ? "LRU churn" : "failed attempts")
  }
})
