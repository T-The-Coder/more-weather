// Texts that can carry data from services or files (place names, warnings,
// imported lists) are shown as plain text: with Qt's default AutoText a
// crafted name holding HTML could load a remote image. Every QML Text
// whose `text` binding names an identifier from plain-text-sources.json
// must set `textFormat: Text.PlainText`, or explain itself in a
// `// rich text:` comment inside the element. Shared by the More plugins.
import { test } from "node:test"
import assert from "node:assert"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { root } from "./load.mjs"

const { identifiers } = JSON.parse(readFileSync(join(root, "tests/plain-text-sources.json"), "utf8"))
const watched = new Set(identifiers)
const opener = /^(\s*)(?:(?:component \w+|property \w+ \w+|\w+): )?Text \{$/

const files = ["", "app"].flatMap((dir) => existsSync(join(root, dir))
  ? readdirSync(join(root, dir)).filter((name) => name.endsWith(".qml")).map((name) => join(dir, name)) : [])

// The element's own lines (not its children's), and its whole text.
function element(lines, start) {
  const own = []
  let depth = 1
  let end = start + 1
  for (; end < lines.length && depth > 0; end++) {
    if (depth === 1) own.push(lines[end])
    depth += (lines[end].match(/\{/g) || []).length - (lines[end].match(/\}/g) || []).length
  }
  return { own, all: lines.slice(start, end).join("\n") }
}

// The `text:` binding with its continuation lines (indented deeper).
function textBinding(own) {
  const at = own.findIndex((line) => /^\s*text:/.test(line))
  if (at < 0) return ""
  const indent = own[at].match(/^\s*/)[0].length
  const parts = [own[at]]
  for (let i = at + 1; i < own.length && own[i].match(/^\s*/)[0].length > indent; i++) parts.push(own[i])
  return parts.join("\n")
}

for (const file of files) {
  test(`plain text: ${file}`, () => {
    const lines = readFileSync(join(root, file), "utf8").split("\n")
    const offenders = []
    lines.forEach((line, index) => {
      if (!opener.test(line)) return
      const { own, all } = element(lines, index)
      const binding = textBinding(own)
      const names = (binding.replace(/^\s*text:/, "").replace(/"(?:[^"\\]|\\.)*"/g, "").match(/[A-Za-z_]\w*/g) || [])
      if (!names.some((name) => watched.has(name))) return
      if (own.some((l) => /^\s*textFormat:\s*Text\.PlainText\s*$/.test(l))) return
      if (/\/\/ rich text:/.test(all)) return
      offenders.push(`${file}:${index + 1}`)
    })
    assert.deepEqual(offenders, [], "Text without textFormat: Text.PlainText")
  })
}
