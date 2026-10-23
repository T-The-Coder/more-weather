import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { root } from './load.mjs'

// Base c6fcf53 fingerprints: fetching, parsing, budgets, projection and cache
// files must remain identical. These checks work offline without Git metadata.
const baseline = {
  'Model.js': '8787f07467a4fb55881df2b99cda677104830abd804c0f9315458b1a6bcd7753',
  'WeatherMapPrefetch.qml': '90d8bee1829ab7e756fd21fd3ce90eba35cac4ee2100dfd7611d572e0ce750ba',
  'WeatherImageStore.qml': '15a8ef8264245b13c2a0e704d115425ee2e030f6264f0bff2cac0cdc4c238d7f',
  'WeatherRemoteImage.qml': 'da90b7bb52b7ee645a32ebe295be6adedced6a0f1296308eb6409c948e2f71f5',
  'GlobeRadar.js': '5149209decf4fa5372edc30b938c2539551109c4e579d9b6899480bb73a57482',
  'WeatherGlobeRadar.qml': '72dc3210ac16f0409df8a6357e7a0a91485ed673d69ad83907a1729b174e8966',
  'Providers.js': '553e7f018dbca607ed32210a972905f9fbe04d50462e530ac8f44cc334d1c0d2',
  'RadarMotion.mjs': '2f3cf008fc55d1b44aafffe75e9449df7af0ff2b9ca4bda873b7fc3892ad9f31',
}
test('data-only radar files retain c6fcf53 acquisition and computation exactly', () => {
  for (const [file, hash] of Object.entries(baseline)) {
    assert.equal(createHash('sha256').update(readFileSync(`${root}/${file}`)).digest('hex'), hash, file)
  }
  for (const file of ['RadarGridWorker.js','WeatherDwdRadarField.qml','WeatherRadarTileFrame.qml']) {
    assert.equal(existsSync(`${root}/${file}`), false, `no additional grid fetch/projection or tile planner: ${file}`)
  }
})

const panelFunctions = {
  syncStableSeries: '603e4ab76f65a32fbd922276e3cd024018f6d7efa62ea58bdceb166997779aae',
  noteShownRadarFramePrefetched: '141b16fcb570bcd0132820a0930f646e061a81e04d73de79f7596a9bb5e5cf56',
  radarFrameLoadAllowed: '8fce427fd174158a8543f641455a816366270ba0294c7ba70302ebc422a026ff',
  radarFramesSource: '4518ddec9ba71dee5f00ea86e8406c1ae77951ea6edc3451999ad2d02a064506',
  openMapRefreshWindow: 'd51db88a8993f1c0d1f2161fd87c8ef9e90a1581dc578b56a381ca0d2a5ecc05',
  syncRadarFrames: 'be5629b6bda55368eeccfef1237eef5fb57a715a6c34772134a76e635a0dfe8b',
  commitRadarFrames: '3edb37dc473445ba7139df8276f73cc532eb3aa720f89f2faf3dc8e976eca23f',
  pendingRadarFrameStatus: '47b042e78bb71fc4cddae31bcd9112f4f391d2b8d2efa8bbb6accca01ee6cee8',
  applyPendingRadarFrameStatus: '0be743abe345a2c9b96bb59d046b83018d720d665e9eb1230a8ffb8ff83627fa',
  radarFirstFrameIndexFor: '48af291e5552ccfa351c1ea26cb4933f2904b0440812ebe943585865c97fa897',
  radarTargetFrameIndex: '9a0f39064289700a0374d2e91060301f3362b420399cdd0897fb2dc3e466da04',
  radarTimelineStale: '580d94b8e9dddf7373d49f7ce2269d308bd468886777db8130f170bf5f3a5a62',
  renewRadarOnInteraction: '10459f00e9db44f17c1fb33a7175fb174abbac9a9ec352e7c388d0976651bd33',
  mapViewMoved: '0e4271e13c0b7846710689251104a617e1c35ac4f3942c9e719a70b4af38e88b',
  refreshTick: '48bebd369c54ac1397398129c9d850ec100df59898200efd0c3bb8a6bc0e7f5c',
  refresh: '2fec36feaaea99600a759151b9892bee31c3818ad9dcd655a2f86c2317f3ceaf',
  startForecastProvider: '9c47673ed71a6539c265e79f55074321ec328a689fcb3e25b8c025d242839080',
  startDwdRadarRequest: '6d05ad249942286e1b7bccdcda39ce1c5655954a30b4f666407a5ffd1f453f1c',
  startRadarMotionRequest: 'd5b890f3af6aed687f904bae475f9861940921b2333bffe098da943ab54a2f64',
  radarLiveTick: 'b9990a4ddb0126eeb0a599071d80f6d5cb66afd96ed22b8d9495b8be0d95acf2',
  refreshRadarTimeline: '2bc4beaf2cd26f6eb49c69c2add8ce1841bb5c19c00267d26aa93ce4a74a19a6',
  refreshRegionalRadar: '132b0cb746f8d33eff0252424a0b4fa55669cd98ef1aafd6f8623d5eae40e7ad',
  showCurrentRadarFrame: 'b6125d5ed190d4a7dacb40760fd257ac0d93900a78b8edd13e029321431f8303',
  resetRadarDisplay: '42c6d46142a289f687627a05e189948df1cacddd58c95e2e79afee7cf968e456',
  radarReferenceTime: '54faaba7b023d50ea05095a27b7e5465eaf443009bd74e33ebba1c8acf0b180c',
  radarFrameUrl: '434dbfaa5c2d34efe47e8035bb1afebe7906874e25d0839fd9a88613aaca9b1d',
  radarFrameClock: '16f0fef0be4e63fc256a894a7863bb4bfeab982d84707ef5f20f140f3d5f37bd',
  radarFrameLead: '4f837d6e4ee21d894146243744990ee1e14703141735464a0027db0841e3aa1f',
  updateRadarFrameReady: '9ed617e4c41427abc46dd3f4f04ae797b998a75481ba37f49c5a697e4fdcfe50',
  updateRadarFrameStatus: '24b9e903a4e2475bf817afed92378d8318db40514149796dd7fb6c5826f5e651',
  noteRadarFrameError: '06e33e8ffcbe91253d903f430263a8b1b94f37e6919be7469d5b7f90dd9b5223',
  selectRadarFrame: '2b3d9f548b5c6c3e95909161cada0ac4ac0c0b1cb4fb5ccd0d51015c5d2918bd',
  stepRadarBackward: '6a86f133efc210c5568deaa040f767ff09977e950f5a70da6d9090d467d81fd3',
  scrubRadarFrame: '8755492ad53af1f93b95c51581492d3929fd9913cca42aa80e9f2ae8eaf91922',
  stepRadarForward: '295c6c4f4405f1071a8e812d7685758b62bfb5b9ca60e03a3c9ff52d5474cd4b',
  scheduleRadarRetry: 'bf54ff61edb5e2ef0eb55f8d3bd495126bd9f613f10069754f18eab9efac6745',
}
test('existing Panel functions retain base computations, URLs, fallback and request scheduling', () => {
  const panel = readFileSync(`${root}/Panel.qml`, 'utf8')
  for (const [name, hash] of Object.entries(panelFunctions)) {
    const start = panel.indexOf(`  function ${name}(`)
    assert.ok(start >= 0, name)
    const end = panel.indexOf('\n  }', start) + 4
    assert.equal(createHash('sha256').update(panel.slice(start, end)).digest('hex'), hash, name)
  }
  assert.ok(!panel.includes('requestRadarViewGrid'))
  assert.ok(!panel.includes('radarFixtureFrames'), 'fixture overrides belong only in the test snapshot')
})
