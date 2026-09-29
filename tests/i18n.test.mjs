import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

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
