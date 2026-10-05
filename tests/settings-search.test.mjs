// SettingsSearch.js: the settings' search. Shared by the More plugins
// (tools/sync-shared.sh).
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const S = load("SettingsSearch.js")
const entries = [
  { id: "language", heading: "General › Language and format", texts: ["Sprache", "Allgemein", "Language", "General"] },
  { id: "night", heading: "Display › World › Sky", texts: ["Nachtseite", "Die Nacht in drei Stufen", "Night side"] },
  { id: "moon", heading: "Display › World › Sky", texts: ["Mond", "Moon"] },
  { id: "dial", heading: "Display › Clock", texts: ["Zifferblatt", "Clock face", "Uhr"] },
  { id: "cafe", heading: "Display › Clock", texts: ["Café-Modus"] }
]

test("folding: case, accents, dashes and spaces", () => {
  assert.equal(S.fold("  Café-Modus_Été  "), "cafe modus ete")
  assert.equal(S.fold(null), "")
  assert.deepEqual([...S.words(" Nacht   SEITE ")], ["nacht", "seite"])
  assert.deepEqual([...S.words("")], [])
})

test("matches: every word somewhere, in the interface language or in English", () => {
  const ids = (q) => S.matches(q, entries).map((e) => e.id)
  assert.deepEqual(ids("night"), ["night"])
  assert.deepEqual(ids("nacht"), ["night"])
  assert.deepEqual(ids("drei nacht"), ["night"])
  assert.deepEqual(ids("cafe"), ["cafe"])
  assert.deepEqual(ids("CAFÉ modus"), ["cafe"])
  assert.deepEqual(ids("mo"), ["moon", "cafe"])
  assert.deepEqual(ids("nothing here"), [])
  assert.deepEqual(ids("   "), [])
})

test("grouped by heading, in order", () => {
  const groups = S.grouped(S.matches("n", entries))
  assert.deepEqual(groups.map((g) => [g.heading, g.items.length]),
    [["General › Language and format", 1], ["Display › World › Sky", 2]])
  assert.deepEqual([...S.grouped([])], [])
})
