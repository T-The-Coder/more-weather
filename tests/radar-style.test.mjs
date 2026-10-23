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
test('DWD decoding agrees with the existing provider legend, and forecast identity survives the clock', () => {
  const M = load('Model.js')
  for (const [rate, hex] of M.DWD_RADAR_COLORS) {
    const c = parseInt(hex.slice(1),16)
    assert.equal(R.decode(c >> 16,(c >> 8) & 255,c & 255,255,2), R.rateDbz(rate))
  }
  const now = Date.parse('2026-10-23T12:00:00Z')
  const report = {host:'https://tilecache.rainviewer.com',radar:{
    past:[{time:(now-600000)/1000,path:'/v2/radar/past'}],
    nowcast:[{time:(now-300000)/1000,path:'/v2/radar/forecast'}]
  }}
  const frames = M.rainViewerTimeline(report,now,2)
  assert.equal(frames[0].forecast,false)
  assert.equal(frames[1].forecast,true,'an old forecast must not become an observation')
})
test('viewport resolution, complete tile coverage and per-frame budgets', () => {
  const M = load('Model.js')
  assert.deepEqual(JSON.parse(JSON.stringify(M.radarRasterSize(840,400,2))), {width:1680,height:800})
  assert.equal(M.radarRasterSize(2000,1000,4).width,2048)
  const box = {west:7,east:10,south:49,north:51}
  for (const provider of ['rainviewer','jma']) {
    for (const scale of [1,3,10,100]) {
      const tiles = M.radarTilesFor(box,50,scale,provider,1)
      assert.ok(tiles.length > 0 && tiles.length <= M.RADAR_TILE_MAX_COUNT)
      assert.ok(Math.min(...tiles.map(t=>t.west)) <= box.west)
      assert.ok(Math.max(...tiles.map(t=>t.east)) >= box.east)
      assert.ok(Math.min(...tiles.map(t=>t.south)) <= box.south)
      assert.ok(Math.max(...tiles.map(t=>t.north)) >= box.north)
      assert.ok(tiles.length * (provider === "jma" ? M.RADAR_JMA_TILE_MAX_BYTES : M.RADAR_TILE_MAX_BYTES) <= M.RADAR_FRAME_MAX_BYTES)
    }
  }
  const fine = M.radarTilesFor(box,50,1,'rainviewer',1)
  const t = fine[0]
  assert.ok(40075.0167*Math.cos(50*Math.PI/180)/2**t.z/512 <= 1)
  assert.equal(M.radarTilesFor(box,50,NaN,'rainviewer',1).length,0)
})
test('native RADOLAN cells: geometry, conversion, no-data and hard bounds', () => {
  const M = load('Model.js')
  function lonLat(x,y) {
    const lat = (Math.PI/2-2*Math.atan(Math.hypot(x,y)/(6370.04*(1+Math.sin(Math.PI/3)))))*180/Math.PI
    return [10+Math.atan2(x,-y)*180/Math.PI,lat]
  }
  const ring = [lonLat(-500,-3500),lonLat(-500,-3502),lonLat(-498,-3502),lonLat(-498,-3500)]
  const raw = {geometry:{coordinates:[ring]},radar:[{timestamp:'2026-10-23T12:00:00Z',precipitation_5:[[100,0],[null,1]]}]}
  const report = M.radarGridReport(raw)
  assert.ok(report)
  const at = (x,y) => {const p=lonLat(x,y);return M.radarGridRate(report,report.radar[0],p[1],p[0])}
  assert.equal(at(-499.5,-3500.5),12)
  assert.equal(at(-498.5,-3500.5),null)
  assert.equal(at(-499.5,-3501.5),null)
  assert.equal(at(-498.5,-3501.5),0.12)
  assert.equal(at(-490,-3501),null)
  assert.equal(M.radarGridReport({...raw,radar:Array(33).fill(raw.radar[0])}),null)
  assert.equal(M.radarGridReport({...raw,radar:[{...raw.radar[0],precipitation_5:Array(1025).fill([1])}]}),null)
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
test('tile rows use Mercator pixel positions, never a stretched latitude image', () => {
  const M=load('Model.js')
  assert.equal(M.radarTileV(65,60,0),0)
  assert.equal(M.radarTileV(65,60,1),1)
  assert.ok(M.radarTileV(65,60,.5)>.5)
  assert.equal(M.radarImageByteLimit('https://tilecache.rainviewer.com/v2/radar/1/512/7/64/64/0/0_0.png',4*1024*1024),M.RADAR_TILE_MAX_BYTES)
  assert.equal(M.radarImageByteLimit('https://www.jma.go.jp/bosai/jmatile/x.png',4*1024*1024),M.RADAR_JMA_TILE_MAX_BYTES)
})
test('an observation wins when a provider repeats its timestamp in nowcast', () => {
  const M=load('Model.js'), time=Date.parse('2026-10-23T12:00:00Z')/1000
  const row={time,path:'/v2/radar/observed'}
  const frames=M.rainViewerTimeline({host:'https://tilecache.rainviewer.com',radar:{past:[row],nowcast:[row]}},time*1000,2)
  assert.equal(frames.length,1)
  assert.equal(frames[0].forecast,false)
})
test('a fresh observation does not become a forecast because the UI clock ticks once a minute', () => {
  const now=Date.parse('2026-10-23T12:00:00Z')
  assert.equal(R.ageMinutes('2026-10-23T12:00:45Z',now),0)
  assert.equal(R.ageMinutes('2026-10-23T11:59:15Z',now),0)
})
test('native grid requests cover all rotated viewport corners without clipping', () => {
  const M=load('Model.js'), box={west:12,east:16,south:52,north:54}
  const distance=M.radarGridDistance(box,53,14)/1000, centre=M.radarStereo(53,14)
  for (const lat of [box.south,box.north]) for (const lon of [box.west,box.east]) {
    const p=M.radarStereo(lat,lon)
    assert.ok(Math.abs(p.x-centre.x)<distance)
    assert.ok(Math.abs(p.y-centre.y)<distance)
  }
})
