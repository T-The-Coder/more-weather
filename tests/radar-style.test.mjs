import { test } from 'node:test'
import assert from 'node:assert/strict'
import { load } from './load.mjs'
const R = load('RadarStyle.js')
test('palette: missing, rate conversion, exact boundaries and saturation', () => {
  assert.equal(R.colors.length, R.bounds.length)
  for (const x of [null, undefined, 0, -1, NaN, Infinity]) assert.equal(R.rateDbz(x), null)
  assert.ok(Math.abs(R.rateDbz(1) - 23.0103) < 0.0001)
  assert.equal(R.band(null), -1)
  R.bounds.forEach((b, i) => assert.equal(R.band(b), i))
  assert.equal(R.band(100), R.colors.length - 1)
  assert.equal(R.rainViewerDbz(72, 255), 40)
  assert.equal(R.rainViewerDbz(200, 255), 40)
  assert.equal(R.rainViewerDbz(0, 255), null)
  assert.equal(R.rainViewerDbz(72, 0), null)
})
test('age is the shown frame; feed is stale at ten minutes independently', () => {
  const now = Date.parse('2026-10-23T12:00:00Z')
  assert.equal(R.ageMinutes('2026-10-23T11:57:00Z', now), 3)
  assert.equal(R.ageMinutes('2026-10-23T12:20:00Z', now), -20)
  assert.equal(R.ageMinutes('invalid', now), null)
  assert.equal(R.feedState(now - 599999, now, false), 'radarLive')
  assert.equal(R.feedState(now - 600000, now, false), 'radarStale')
  assert.equal(R.feedState(now, now, true), 'radarUnreachable')
  assert.equal(R.feedState(0, now, false), 'radarLoading')
})
test('playback captures selection, wraps, starts full history at newest, survives eviction', () => {
  const frames = ['a','b','c','d'].map(timestamp => ({timestamp}))
  assert.equal(R.loopStart(frames, 0, 1), 'b')
  assert.equal(R.nextFrame(frames, 0, 3, 'b'), 1)
  assert.equal(R.nextFrame(frames, 0, 1, 'b'), 2)
  assert.equal(R.loopStart(frames, 1, 3), 'b')
  assert.equal(R.nextFrame(frames.slice(2), 0, 1, 'b'), 0)
  assert.equal(R.nextFrame([], 0, 0, ''), -1)
})
test('scale bar rounds down to 1/2/5 and represents the labelled ground distance', () => {
  for (const imperial of [false, true]) for (const ppKm of [0.1, 0.9, 2, 17, 100]) {
    const s = R.scaleBar(ppKm, 90, imperial)
    assert.ok(s.pixels <= 90.000001 && s.pixels > 0)
    assert.ok(Math.abs(s.pixels / ppKm - s.value * (imperial ? 1.609344 : 1)) < 1e-8)
    assert.ok([1,2,5].includes(Math.round(s.value / 10 ** Math.floor(Math.log10(s.value)))))
  }
  assert.equal(R.scaleBar(0, 90, false).pixels, 0)
})
test('layout responds to both dimensions, theme scale and focus override', () => {
  assert.equal(R.layout(560, 620, 12, false), 'FULL')
  assert.equal(R.layout(559, 620, 12, false), 'LEAN')
  assert.equal(R.layout(560, 619, 12, false), 'LEAN')
  assert.equal(R.layout(560, 620, 16, false), 'LEAN')
  assert.equal(R.layout(200, 200, 16, true), 'FOCUS')
})
test('class decoders accept documented colours and reject missing/unknown cells', () => {
  for (const [mode, classes] of [[2,R.dwdClasses],[3,R.jmaClasses]]) for (const [rate, c] of classes) {
    assert.equal(R.decode(c >> 16, (c >> 8) & 255, c & 255, 255, mode), R.rateDbz(rate))
    assert.equal(R.decode(c >> 16, (c >> 8) & 255, c & 255, 0, mode), null)
  }
  assert.equal(R.decode(128,128,128,255,3), null)
  assert.equal(R.decode(255,255,255,255,3), null)
})
test('all treatments keep the same value; coverage increases with the palette quartile', () => {
  for (const treatment of [0,1,2]) {
    let previous = 0
    for (const band of [0,3,6,9]) {
      let area = 0
      for (let y=0;y<3;y++) for(let x=0;x<3;x++) area += R.coverage(band,treatment,x,y)
      assert.ok(area >= previous && area <= 9)
      previous = area
    }
  }
})
test('DWD decoding agrees with the existing provider legend', () => {
  const M = load('Model.js')
  for (const [rate, hex] of M.DWD_RADAR_COLORS) {
    const c = parseInt(hex.slice(1),16)
    assert.equal(R.decode(c >> 16,(c >> 8) & 255,c & 255,255,2), R.rateDbz(rate))
  }
  assert.equal(R.sourceMode('rainviewer'), 0, 'original coloured images are not monochrome data')
  for (const provider of ['nws','eccc','fmi','knmi']) assert.equal(R.sourceMode(provider), 0)
})
test('continuous palette includes the 35 dBZ step; measured negatives stay distinct from missing', () => {
  assert.ok(R.bounds.includes(35))
  assert.equal(R.colors.length,13)
  assert.notEqual(R.color(32),R.color(34))
  assert.notEqual(R.color(-10),'transparent')
  assert.equal(R.color(null),'transparent')
  assert.equal(R.decode(22,22,22,255,1),-10)
  assert.equal(R.decode(22,22,22,0,1),null)
})

test('a fresh observation does not become a forecast because the UI clock ticks once a minute', () => {
  const now=Date.parse('2026-10-23T12:00:00Z')
  assert.equal(R.ageMinutes('2026-10-23T12:00:45Z',now),0)
  assert.equal(R.ageMinutes('2026-10-23T11:59:15Z',now),0)
})
test('forecast tick identity comes from the existing report without changing frames', () => {
  const frame = {timestamp: '2026-10-23T12:00:00Z'}
  const time = Date.parse(frame.timestamp) / 1000
  const before = JSON.stringify(frame)
  assert.equal(R.rainViewerForecast(frame, {radar:{past:[],nowcast:[{time}]}}), true)
  assert.equal(R.rainViewerForecast(frame, {radar:{past:[{time}],nowcast:[{time}]}}), false)
  assert.equal(R.rainViewerForecast(frame, {radar:{past:[],nowcast:[]}}), false)
  assert.equal(R.rainViewerForecast(frame, null), false)
  assert.equal(JSON.stringify(frame), before)
})
