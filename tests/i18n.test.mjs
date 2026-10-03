import { test } from "node:test"
import assert from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const I18n = load("I18n.js")

// Names that read the same everywhere (sources like "DWD MOSMIX", units,
// the rain legend's ranges) exist only in English and German and fall back
// to English. A text any other language has must be in all of them: a
// translation block that skipped a language shows up here.
test("a translated text is there in every language", () => {
  const languages = Object.keys(I18n.catalog).filter((language) => language !== "en" && language !== "de")
  const missing = []
  for (const key of Object.keys(I18n.catalog.en)) {
    const have = languages.filter((language) => typeof I18n.catalog[language][key] === "string")
    if (have.length === 0 || have.length === languages.length) continue
    for (const language of languages)
      if (!have.includes(language)) missing.push(language + ": " + key)
  }
  assert.deepEqual(missing, [])
})

test("German has every English text", () => {
  const missing = Object.keys(I18n.catalog.en).filter((key) => typeof I18n.catalog.de[key] !== "string")
  assert.deepEqual(missing, [])
})

test("no language has texts English lacks", () => {
  const extra = []
  for (const language of Object.keys(I18n.catalog))
    for (const key of Object.keys(I18n.catalog[language]))
      if (!(key in I18n.catalog.en)) extra.push(`${language}: ${key}`)
  assert.deepEqual(extra, [])
})

test("placeholders survive translation", () => {
  const broken = []
  for (const [key, text] of Object.entries(I18n.catalog.en)) {
    const names = (String(text).match(/\{[a-zA-Z]+\}/g) || []).sort().join(",")
    for (const language of Object.keys(I18n.catalog)) {
      const translated = I18n.catalog[language][key]
      if (typeof translated !== "string") continue
      const found = (translated.match(/\{[a-zA-Z]+\}/g) || []).sort().join(",")
      if (found !== names) broken.push(`${language}: ${key} has ${found || "none"}, expects ${names || "none"}`)
    }
  }
  assert.deepEqual(broken, [])
})

// Every key the views ask for exists. Keys come from i18n("…") and
// label("…") calls (every quoted key inside the call, so both sides of a
// choice count), the Shortcuts and Sources pages' tables, the providers'
// label keys and the air quality scales; keys built from a prefix are
// listed with the values the code uses.
test("every key used in the QML exists", () => {
  const english = I18n.catalog.en
  const used = new Set()
  const sources = readdirSync(root).filter((name) => name.endsWith(".qml"))
    .map((file) => readFileSync(join(root, file), "utf8"))
  for (const source of sources) {
    for (const call of source.matchAll(/\b(?:i18n|label)\(((?:[^()]|\([^()]*\))*)\)/g)) {
      // Only the key argument: what follows a top-level comma are values.
      const argument = call[1].split(/,\s*\{/)[0]
      // Literals compared with (=== "x") or appended (+ "x") are not keys.
      for (const match of argument.matchAll(/(===|!==|\+)?\s*"([A-Za-z][A-Za-z0-9_]*)"/g))
        if (!match[1]) used.add(match[2])
    }
    for (const match of source.matchAll(/(?:action|title|details): "((?:shortcut|source)[A-Za-z]+)"/g)) used.add(match[1])
    for (const match of source.matchAll(/keys: \[([^\]]*)\], translateKeys: true/g))
      for (const key of match[1].matchAll(/"([A-Za-z]+)"/g)) used.add(key[1])
    // Sources page: each group's coverage line is its title + "Coverage".
    for (const match of source.matchAll(/title: "(sourceGroup[A-Za-z]+)"/g)) used.add(match[1] + "Coverage")
    for (const match of source.matchAll(/key: "(settings[A-Za-z]+)"/g)) used.add(match[1])
  }
  for (const file of ["Providers.js", "Model.js"]) {
    const source = readFileSync(join(root, file), "utf8")
    for (const match of source.matchAll(/labelKey: "([A-Za-z]+)"/g)) used.add(match[1])
    for (const match of source.matchAll(/return "(source[A-Za-z]+)"/g)) used.add(match[1])
  }
  const Model = load("Model.js")
  assert.ok(Model.AQI_LABELS, "Model.AQI_LABELS moved")
  for (const labels of Object.values(Model.AQI_LABELS))
    for (const key of labels) used.add(key)
  // Section tabs (Panel.sectionTabLabel) and the settings pages.
  for (const section of ["airTab", "myPlaces", "hourly", "daily", "rain", "radar", "wind", "globe"]) used.add(section)
  for (const page of ["General", "Display", "Shortcuts", "Sources"]) used.add("settingsPage" + page)
  for (const surface of ["menubar", "widget", "app"]) used.add(surface + "Settings")
  const missing = [...used].filter((key) => !(key in english)).sort()
  assert.deepEqual(missing, [])
})
