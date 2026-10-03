// The one temperature scale (TemperatureScale.js): the text's colours over
// −10 … 35 °C, extended at both ends without a jump, the hues in order.
import { test } from "node:test"
import assert from "node:assert"
import { load } from "./load.mjs"

const S = load("TemperatureScale.js")
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255)
// Catppuccin Mocha-like palette on a light text colour, and a light theme.
const themes = [
  { blue: hex("#89b4fa"), cyan: hex("#94e2d5"), yellow: hex("#f9e2af"), orange: hex("#fab387"), red: hex("#f38ba8"),
    magenta: hex("#cba6f7"), foreground: hex("#cdd6f4") },
  { blue: hex("#1e66f5"), cyan: hex("#179299"), yellow: hex("#df8e1d"), orange: hex("#fe640b"), red: hex("#d20f39"),
    magenta: hex("#8839ef"), foreground: hex("#4c4f69") }
]
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
function hue(c) {
  const [r, g, b] = c, max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
  if (d === 0) return 0
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return (h * 60 + 360) % 360
}

for (const theme of themes) {
  test("the text's range is the old accent: blue at −10, red at 35, softened", () => {
    const soft = (c) => c.map((v, i) => theme.foreground[i] + (v - theme.foreground[i]) * 0.72)
    assert.ok(dist(S.color(-10, theme), soft(theme.blue)) < 1e-9)
    assert.ok(dist(S.color(35, theme), soft(theme.red)) < 1e-9)
    assert.ok(dist(S.color(5.75, theme), soft(theme.cyan)) < 1e-9)
  })

  test("no jump at −10 and 35, the ends distinct and held beyond", () => {
    for (const at of [-10, 35]) assert.ok(dist(S.color(at - 0.01, theme), S.color(at + 0.01, theme)) < 0.01, String(at))
    assert.ok(dist(S.color(-40, theme), S.color(-10, theme)) > 0.05)
    assert.ok(dist(S.color(45, theme), S.color(35, theme)) > 0.05)
    assert.ok(dist(S.color(-60, theme), S.color(-40, theme)) < 1e-9)
    assert.equal(S.color("x", theme), null)
  })

  test("the hues run in order: violet, blue, cyan, yellow, orange, red, magenta", () => {
    // Unwrapped: going down from violet through blue … red, and on past 0°
    // to magenta.
    const hues = [-40, -10, 5.75, 19.25, 28.25, 35, 45].map((c) => hue(S.color(c, theme)))
    for (let i = 1; i < hues.length; i++) while (hues[i] > hues[i - 1] + 180) hues[i] -= 360
    for (let i = 1; i < hues.length; i++) assert.ok(hues[i] <= hues[i - 1] + 1, JSON.stringify(hues))
  })
}
