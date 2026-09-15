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
  In the DWD area DWD MOSMIX (Bright Sky) refines current values and days.
- Radar: regional official service (DWD, NWS MRMS or ECCC GeoMet) -> RainViewer
  -> precipitation model field. RainViewer is credited on the map, as its
  free terms require. The field uses the Open-Meteo grid when
  available and otherwise the active point forecast (including MET Norway),
  always with explicit model-fallback attribution.
- Warnings: DWD -> MeteoAlarm in Germany; NWS in the United States; ECCC
  (api.weather.gc.ca weather-alerts) in Canada; MeteoAlarm Atom feed -> the
  MeteoAlarm JSON API in its 39 European countries. Last-good warnings
  remain available only until their own expiry time.
- Wind: Open-Meteo 5x7 grid -> the active point forecast's wind vector. If the
  primary forecast also fails, the MET Norway-normalised point vector is used.

## Replacing or adding a provider

1. Add the regional selection and request builder to `Providers.js`.
2. Add a small adapter in `Model.js` that returns the existing normalized
   forecast, radar-frame, or `{ alerts: [...] }` shape.
3. Insert the provider in the relevant ordered array. No UI changes are needed
   unless the provider needs a new attribution label.

Provider failures must never clear last-good weather data. A response is only
made active after its adapter validates the minimum fields required by the UI.
