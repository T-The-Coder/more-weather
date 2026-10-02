// The two More plugins share some files: the same in both repositories
// apart from the type prefix, the plugin id, the product name and the user
// agent version. tools/sync-shared.sh copies them and holds the lists; this
// test reads the lists there and fails when the copies drift apart. Without
// the sibling checked out next to this repository (../<sibling id>, or
// MORE_SIBLING_DIR) it skips.
import { test } from "node:test"
import assert from "node:assert"
import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { root } from "./load.mjs"

const script = readFileSync(join(root, "tools/sync-shared.sh"), "utf8")
const list = (name) => script.match(new RegExp(`^${name}=\\(([^)]*)\\)`, "m"))[1].trim().split(/\s+/)
const pair = list("pair")
const renamed = list("renamed")
const verbatim = list("verbatim")

function idOf(dir) {
  try {
    return JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")).id || basename(dir)
  } catch (e) {
    return basename(dir)
  }
}

// more-time → Time
const prefixOf = (id) => id.replace(/^more-/, "").replace(/^./, (c) => c.toUpperCase())

const self = idOf(root)
const sibling = pair.find((id) => id !== self)
const siblingRoot = process.env.MORE_SIBLING_DIR || join(dirname(root), sibling)
const haveSibling = pair.includes(self) && existsSync(siblingRoot)

// Both plugins' names become the same neutral ones.
function neutral(text) {
  for (const id of pair) {
    const prefix = prefixOf(id)
    text = text
      .replace(new RegExp(`${id}/\\d+(?:\\.\\d+)*`, "g"), "more-x/V")
      .replaceAll(`More ${prefix}`, "More X")
      .replaceAll(id, "more-x")
      .replace(new RegExp(`\\b${prefix}(?=[A-Z])`, "g"), "X")
  }
  return text
}

const files = renamed.map((name) => [prefixOf(self) + name, prefixOf(sibling) + name])
  .concat(verbatim.map((name) => [name, name]))

for (const [mine, theirs] of files) {
  test(`shared with the sibling: ${mine}`, (t) => {
    if (!haveSibling) {
      t.skip(`no sibling at ${siblingRoot}`)
      return
    }
    // Newly shared and not copied over yet: tools/sync-shared.sh to-sibling.
    if (!existsSync(join(siblingRoot, theirs))) {
      t.skip(`${theirs} not in ${siblingRoot} yet`)
      return
    }
    const ours = readFileSync(join(root, mine), "utf8")
    const other = readFileSync(join(siblingRoot, theirs), "utf8")
    assert.equal(neutral(ours), neutral(other),
      `${mine} differs from ${join(siblingRoot, theirs)}; reconcile, then run tools/sync-shared.sh`)
  })
}
