# Weather provider adapters

Provider choice and endpoint construction live in `Providers.js`; response
normalisation lives in `Model.js`; `Panel.qml` only drives the ordered chains.
This separation keeps the widget and standalone app on the same policy.

## Current fallback order

- Place: stored coordinates -> Nominatim reverse geocoding (once per
  location); name-only location -> Open-Meteo geocoding (exact name first);
  auto-detect -> ipwho.is -> ipapi.co -> GeoJS. The result supplies the
  country (provider selection) and the MeteoAlarm area aliases.
- Forecast: Open-Meteo Best Match -> MET Norway Locationforecast -> retained
  last-good data. In NO, SE, FI and DK MET Norway (MET Nordic) comes first.
  In CH and LI the Open-Meteo request asks for MeteoSwiss ICON-CH (seamless,
  five days) next to Best Match; Model.mergedModelForecast takes MeteoSwiss
  wherever it has a value. In the DWD area DWD MOSMIX (Bright Sky) refines
  current values and days.
- Rain nowcast: DWD radar via Bright Sky in the DWD area; MET Norway
  Nowcast 2.0 in NO, SE, FI, DK, GeoSphere Austria's INCA nowcast in AT and
  Buienradar's rain text (KNMI radar) in NL and BE, JMA in JP (the rain at
  the place read from one pixel of JMA's radar and nowcast tiles, which
  carry the intensity class as a palette index)
  (WeatherRegionalNowcast.qml, every five minutes); the forecast's 15-minute
  values everywhere else and beyond the radar's reach.
- Radar: regional official service (DWD, NWS MRMS, ECCC GeoMet, FMI or KNMI) -> RainViewer.
  In Japan JMA's radar tiles lie over the frames as a separate layer
  (WeatherJmaRadarLayer.qml); timeline and playback stay the frames'.
  -> precipitation model field. RainViewer is credited on the map, as its
  free terms require. The field uses the Open-Meteo grid when
  available and otherwise the active point forecast (including MET Norway),
  always with explicit model-fallback attribution.
- Radar drift arrow: motion tracked in a 100 x 100 km DWD RADOLAN RV grid
  (Bright Sky, DWD area) -> Open-Meteo 700 hPa wind -> surface wind of the
  active forecast.
- Warnings: DWD -> MeteoAlarm in Germany; NWS in the United States; ECCC
  (api.weather.gc.ca weather-alerts) in Canada; MeteoAlarm Atom feed -> the
  MeteoAlarm JSON API in its 39 European countries; the BOM state warnings
  feed in Australia; MetService CAP (RSS, then each alert's CAP document) in
  New Zealand; JMA's municipality warnings in Japan (area boxes, outline,
  office, warning file); INMET's active-warnings JSON (with polygons) in
  Brazil; SMN's CAP feed in Argentina; everywhere else the country's official
  CAP feeds from the Alert Hub register of WMO-registered alerting
  authorities (the authorities' own feeds, not the hub's lagging mirror).
  The staged ones run through WeatherAlertLookup.qml, which remembers every
  CAP document per place, so a refresh only reads new documents.
  Last-good warnings remain available only until their own expiry time.
- Wind: Open-Meteo 5x7 grid -> the active point forecast's wind vector. If the
  primary forecast also fails, the MET Norway-normalised point vector is used.
- Base map: drawn from Natural Earth 1:10m (public domain; land, lakes, urban
  areas, rivers, state and country borders), shipped as data/basemap.bin
  (2.6 MB, 5° x 5° cells behind an index, built by tools/build-basemap.py and
  read by Basemap.js), so it needs no request. The
  satellite style is DWD's bluemarble WMS picture for the current view.

## Replacing or adding a provider

1. Add the regional selection and request builder to `Providers.js`.
2. Add a small adapter in `Model.js` that returns the existing normalized
   forecast, radar-frame, or `{ alerts: [...] }` shape.
3. Insert the provider in the relevant ordered array. No UI changes are needed
   unless the provider needs a new attribution label.

Provider failures must never clear last-good weather data. A response is only
made active after its adapter validates the minimum fields required by the UI.
