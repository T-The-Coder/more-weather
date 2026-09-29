import { test } from "node:test"
import assert from "node:assert"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { load, root } from "./load.mjs"

const Basemap = load("Basemap.js")
const file = readFileSync(join(root, "data", "basemap.bin"))
const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)

test("data/basemap.bin loads and its cells decode inside their bounds", () => {
  assert.ok(Basemap.load(buffer))
  // Bobingen (48.27 N, 10.83 E): row 27, column 38 of the 5° grid.
  const cell = Basemap.cell("27_38")
  assert.ok(cell && cell.land && cell.land.length > 0, "land around Augsburg")
  assert.ok(cell.rivers && cell.rivers.length > 0, "rivers (Lech, Danube)")
  let points = 0
  for (const name of ["land", "lakes", "urban", "rivers", "admin1", "admin0"]) {
    for (const feature of cell[name] || []) {
      for (const list of name === "land" || name === "lakes" || name === "urban" ? feature : [feature]) {
        let x = 0
        let y = 0
        for (let i = 0; i < list.length; i += 2) {
          x = i === 0 ? list[0] : x + list[i]
          y = i === 0 ? list[1] : y + list[i + 1]
          assert.ok(x >= 0 && x <= 5000 && y >= 0 && y <= 5000, `${name} point ${x},${y}`)
          points++
        }
      }
    }
  }
  assert.ok(points > 1000)
  // Open sea has no cell: the South Atlantic at 30° S, 30° W.
  assert.strictEqual(Basemap.cell("12_30"), null)
})

test("Natural Earth's towns come back as map places for an extent", () => {
  const places = Basemap.placesIn(9.4, 12.2, 47.8, 48.7)
  const augsburg = places.find((place) => place.name === "Augsburg")
  assert.ok(augsburg, "Augsburg in the Bobingen area")
  assert.ok(Math.abs(augsburg.latitude - 48.37) < 0.05 && Math.abs(augsburg.longitude - 10.9) < 0.05)
  assert.strictEqual(augsburg.place, "city")
  assert.ok(augsburg.population > 200000)
  // Names keep their accents (UTF-8).
  assert.ok(Basemap.placesIn(-10, 30, 35, 70).some((place) => /[^\x00-\x7f]/.test(place.name)))
})

test("an unreadable file is refused", () => {
  const Fresh = load("Basemap.js")
  assert.strictEqual(Fresh.load(new ArrayBuffer(4)), false)
  assert.strictEqual(Fresh.cell("27_38"), null)
})
