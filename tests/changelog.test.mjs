// Changelog.js: the change log as data (shared by the More plugins).
import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const C = load("Changelog.js")

const SAMPLE = `# Changelog

All notable changes are documented here.

## Unreleased

- **Astro: time lapse.** The timeline's speeds make way for a
  time lapse; \`Space\` plays it, see [the README](README.md).
- **Chimes:**
  - a beep every *quarter* hour
  - an hour chime
- A plain point without a lead.

## 1.0.1 — 2026-10-03

- **Names are shown as plain text:** no HTML.

## 1.0.0 - 2026-10-02

First release.

> **Chimes are on by default:** mute them with \`m\`.

### Details

- **Clock in the bar:**
  - Time, seconds.
`

test("sections: unreleased, versions with em dash or hyphen", () => {
  const s = C.parse(SAMPLE)
  assert.deepEqual(s.map((x) => [x.version, x.date, x.unreleased]),
    [["", "", true], ["1.0.1", "2026-10-03", false], ["1.0.0", "2026-10-02", false]])
})

test("items: bold lead as title, the rest as plain text", () => {
  const [unreleased, patch, first] = C.parse(SAMPLE)
  assert.deepEqual(unreleased.items[0], { title: "Astro: time lapse",
    text: "The timeline's speeds make way for a time lapse; Space plays it, see the README." })
  assert.deepEqual(unreleased.items[1], { title: "Chimes", text: "• a beep every quarter hour\n• an hour chime" })
  assert.deepEqual(unreleased.items[2], { title: "", text: "A plain point without a lead." })
  assert.deepEqual(patch.items, [{ title: "Names are shown as plain text", text: "no HTML." }])
  assert.deepEqual(first.items.map((i) => i.title), ["", "Chimes are on by default", "", "Clock in the bar"])
  assert.equal(first.items[1].text, "mute them with m.")
  assert.equal(first.items[2].text, "Details")
})

test("plain: markdown to text", () => {
  assert.equal(C.plain("**a** `b` [c](http://x) *d* snake_case \\*e"), "a b c d snake_case *e")
  assert.equal(C.plain("2 * 3 * 4"), "2 * 3 * 4")
})

test("nothing to read: no sections", () => {
  assert.deepEqual(C.parse(""), [])
  assert.deepEqual(C.parse(null), [])
  assert.deepEqual(C.parse("just text\n- and a point"), [])
})

test("this plugin's own change log parses, every item with text", () => {
  const sections = C.parse(readFileSync(join(root, "CHANGELOG.md"), "utf8"))
  assert.ok(sections.length >= 3)
  const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"))
  assert.ok(sections.some((s) => s.version === manifest.version), "the installed version has a section")
  for (const s of sections) {
    assert.ok(s.items.length > 0, s.version || "Unreleased")
    for (const item of s.items) {
      assert.ok(item.text !== "" || item.title !== "", JSON.stringify(item))
      assert.ok(!/\*\*|`/.test(item.title + item.text), JSON.stringify(item))
    }
  }
})
