// The shell's theme colours as Commons.Color (shared by the More plugins):
// QtQuick 6.12 ships a type named Color that hides the qs.Commons singleton
// of that name, so a bare `Color.accent` is undefined there. Every QML file
// addresses it as Commons.Color, with `import qs.Commons as Commons`.
import { test } from "node:test"
import assert from "node:assert"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { root } from "./load.mjs"

function qmlFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...qmlFiles(path))
    else if (entry.name.endsWith(".qml")) out.push(path)
  }
  return out
}

const files = qmlFiles(root)

test("no bare Color. in any QML file", () => {
  const found = []
  for (const file of files) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      if (/(?<![\w.])Color\./.test(line)) found.push(relative(root, file) + ":" + (i + 1) + ": " + line.trim())
    })
  }
  assert.deepEqual(found, [])
})

test("files that use Commons.Color import qs.Commons as Commons", () => {
  const missing = files.filter((file) => {
    const source = readFileSync(file, "utf8")
    return /\bCommons\.Color\./.test(source) && !/^import qs\.Commons as Commons\s*$/m.test(source)
  }).map((file) => relative(root, file))
  assert.deepEqual(missing, [])
})
