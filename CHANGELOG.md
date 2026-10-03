# Changelog

All notable changes to More Weather are documented here.

## Unreleased

- **Air pressure** (hPa at sea level, or inHg with US units), off by default:
  in the menu bar (with **Relevant** while it rises or falls by 1.5 hPa or
  more in three hours, and **Hover**), in the current weather with its trend
  as an arrow (following the hour cursor; the trend in words on hover), in
  the hourly forecast and as the day's mean in the daily forecast. From
  Open-Meteo (`pressure_msl`, two more variables in the forecast request),
  MET Norway and, in the DWD area, Bright Sky (MOSMIX).
- The globe **tilts and zooms**: a drag turns and tilts it (up to 80°), Ctrl
  + wheel and a double click zoom towards the pointer, `+` `−` and its
  buttons zoom, the crosshair brings the shown place to the middle, `0`
  goes back to the whole globe; Ctrl + arrows turn and tilt by 15°, or a
  quarter of the view when zoomed in (while no radar or wind map is
  shown). Six levels from the whole disc to about 400 km across; from z3
  the coast, lakes, borders and towns come from the radar map's Natural
  Earth data, the grid gets finer, and my places show their wind too.
  From z2 a drag moves the picture and draws it anew on release. Turning
  by itself stays on the whole disc (z0, z1) and keeps the tilt. View
  arithmetic in `GlobeView.js` with Node tests.
- **Globe**, a new section (in the app a tab after the wind map, off in the
  popup): the earth with day and night in three twilight steps, the sun and
  the moon overhead, and my places as markers with their symbol and
  temperature from the stored forecasts, no new requests. A drag, Shift +
  wheel or Ctrl+← → turns it, 0 brings back the shown place, a click on a
  place turns to it and shows it; it can turn by itself as in More Time
  (Settings → Display → Globe: night side, moon, places, turning by itself
  with its delay and speed). The pointer names a place (temperature and
  symbol) or the moon (lit share, waxing or waning). Built on the shared
  `Globe.js` view, `Sky.js` and `data/globe-land.json` from More Time; while
  it turns it draws a coarser coastline, about 17 ms a frame at 500 and
  840 px.
- The current weather shows as many value columns as fit beside the
  temperature, in their order, instead of running into it in a narrow
  window.
- Settings: when "Reset general settings" disappears, the cursor moves to
  its neighbour without a binding loop warning.

## 3.1.0 — 2026-10-03

Version 3.1 in short:

- **The menu bar reacts to the pointer:** bold while hovered, and its values
  in the popup's colour accents while hovered or always.
- **Tabs with symbols,** which keep only the symbol when all seven sections
  are tabs.
- **One place search with More Time:** Open-Meteo while typing, Nominatim on
  Enter, the same keys in both plugins, and More Time's cities importable as
  places.
- **Texts read like More Time's** in all 30 languages, each language in More
  Weather's own words.
- **The moon as a shaded sphere** in the current weather and my places.
- **New pictures** for the README and the plugin page.

In detail:

- While the pointer rests on the weather in the menu bar, its text and
  symbols turn bold (the sun-event arrow with a heavier line), also with the
  popup open over the widget. A new switch, **Bold while hovered** (on by
  default), sits above "Open the widget on hover" in the menu bar settings,
  is reached by the keyboard and travels with export and import.
- The place search runs through `WeatherPlaceSearch.qml` with
  `PlaceSearch.js`, shared with More Time: Open-Meteo's geocoder with up to
  eight results 350 ms after the last keystroke, one request at a time (a
  query that changed meanwhile waits for the pause again), duplicates (same
  spot, or the same name a few kilometres off) removed. Nominatim is never
  asked while typing (its usage policy forbids autocomplete): only Enter on
  a query Open-Meteo found nothing for asks it, at most once a second, and
  the next Enter takes what it found or the name as typed. Its keys, now the same in both plugins
  and on the Shortcuts page: ↑ ↓ move within the results or the saved
  places, Tab / ⇧ Tab switch between them, Enter uses the result or
  switches to the saved place, Esc closes. `+` (add the marked result) and
  `−` (remove the marked saved place) act only while the saved places have
  the focus (after Tab); the search field hands them to the list before
  typing them, and in the results they are typed, so names like
  "Saint-Denis" can be searched. Results carry the country code
  (`countryCode`) besides name, region, country and time zone.
- Settings → General → Places: **Import cities from More Time** adds More
  Time's world clock cities with coordinates that are not saved yet (the
  place search's rule: the same spot, or the same name within a few
  kilometres, so Paris, Texas joins Paris, France), in their order, and says how many were added and how many were there
  already. Without More Time's city list the button is off, with a hint.
- The values in the menu bar can take the popup's colour accents: a new
  menu bar setting **Colour the values** (right below "Bold while hovered",
  keyboard-reachable, part of export, import and reset) is off, while
  hovered (default, the same moment the bar turns bold) or always.
  Temperature, the day's low and high, feels-like, wind, UV and the rain
  chance use the popup's own accent functions, so bar and popup agree; the
  symbol, sun times, moon, rain amount and pollen stay plain, the warning
  mark and the air quality dot keep their own colours, and the global
  "Colour accents" switch turns it off as well.
- The tabs show their section's symbol next to the name (places, air,
  hourly, daily, rain, radar, wind), in the style of More Time's tabs. When
  the strip is too narrow for the names (all seven sections as tabs, where
  "My places" was cut short), it shows the symbols alone, the name as a
  tooltip.
- In the popup, a button beside the gear opens the app (as do `o` and a
  click on the symbol or the temperature). All four controls of that line
  (service link, refresh, app, gear) share one muted colour, hover colour and
  size; the refresh arrow is now a symbol from the same icon set.
- Settings → General has a **Reset general settings** button while a general
  option differs from its default (the wind map's height stays); once used,
  the keyboard cursor moves to the item before it.
- Texts shared with More Time now read like More Time's, in all 30
  languages but in More Weather's own words for settings, widget, app and
  menu bar (French "paramètres", Finnish "pienoissovellus", Hungarian
  "minialkalmazás" and so on; older texts that used another word, such as
  the French "réglages" or the European Portuguese "definições", now use the
  same one): "What the menu bar / widget / app shows", "Each view has its own
  settings.", "Reset this view", "Reset order", "Relevant" and "Hover" for the
  switch columns (the hints quote them), "Open the widget on hover", "Tab on
  opening", "To the top / bottom", and the keyboard hints on the settings
  pages. The app launcher hint says what the app shares with the bar, and the
  shortcut texts for Esc, Ctrl + , and the click that opens the app were
  reworded.
- Headings stored in capitals (General, Hourly, Daily, the rain chart titles,
  the shortcut groups, the warning levels, In use, Coverage…) are now stored
  in normal case and set in capitals where they are shown, so Greek loses
  its accents there as it should.
- README: a Keyboard table and an IPC section, the fixed path to the app
  launcher switch (Settings → General), and one section order shared with
  More Time.
- Texts from services and files are shown as plain text: every text label
  sets `textFormat: Text.PlainText`, so a place or warning name holding HTML
  can no longer load anything, and notifications escape `&` and `<` in their
  titles and bodies (the warning and rain notifications, and the status on
  a right click on the bar). `tests/plain-text.test.mjs` (shared with More
  Time, with the identifiers in `tests/plain-text-sources.json`) checks every
  label that shows such data.
- The translations moved from one 780 KB `I18n.js` into one file per
  language under `i18n/` (the largest about 37 KB), since the plugin
  marketplace refuses text files over 512 KiB; `I18n.js` imports them and
  keeps its functions. The texts are unchanged.
- Log lines start with `more-weather:`; the user agent says `more-weather/3.1`.
- Today's moon in the current weather and in my places is a small shaded
  sphere (`WeatherMoonSphere.qml` with `Moon.js`, shared with More Time)
  the height of a line of text, lit from the right while it waxes and from
  the left while it wanes, the other way round south of the equator; the
  lit share stays beside it.
- The week's temperature curve under the daily forecast no longer runs
  past the scrolling strip into the window's margin: segments outside the
  visible part are not drawn (curve-rendered lines wholly outside a
  clipping area escaped the clip).
- The bar widget's hover (entries on hover, open on hover and closing again,
  the latch while the popup maps under the pointer) moved into
  `WeatherBarHover.qml`, shared with More Time; behaviour unchanged.
- New README pictures and `preview.png`, from live data: Napa under an NWS
  Heat Advisory, storms over New Orleans on the NWS radar, Wellington's wind
  in a gale, my places with six world cities, the coloured menu bar over the
  widget, and the menu bar settings. `tests/ui-showcase.sh` takes them,
  `tools/build-preview.sh` puts them together.
- Development: the popup moved into `WeatherPopup.qml`, loaded only in the
  bar, so the panel also loads offscreen. `tests/ui-shots.sh` shoots every
  view offscreen with synthetic weather and no network
  (`MORE_PLUGINS_OFFLINE=1`), plus the menu bar with coloured values, and
  logs `CHECK` lines for the search's `+`/`−`, the accents dropdown and the
  cursor after a reset; a new i18n test checks that every key the QML
  asks for exists, another that no language has keys English lacks.
  `WeatherSettingsButton` is now `WeatherButton`, and the files shared with
  More Time are kept in step by `tools/sync-shared.sh` and checked by
  `tests/shared-files.test.mjs`.

## 3.0.0 — 2026-09-30

Version 3 in short:

- **Radar and wind map drawn in your theme,** from map data that ships with
  the plugin; drag to move, Ctrl + wheel to zoom; satellite stays a map style.
- **Wind map after RegenVorschau:** a colour wash of the speed and streaks
  drifting with the wind, at 10 m up to 10 km.
- **Temperature lines** over the next 24 hours and through the week, with
  rain bars, daylight and labelled highs and lows.
- **My places:** every saved place on one line, one key away.
- **Your layout:** every section in the window or as a tab, in your order.
- **Rain alerts** with a threshold and a radius; more official national
  weather services and warnings worldwide.
- Colour accents, an hour cursor, a radar timeline, export and import of
  the settings, full keyboard control, and tests that run on every push.


- Added the moon phase to the widget and the app: as a header value next to
  feels-like, wind and humidity, and as a row in the daily forecast (phase on
  each day's evening). Both show the phase symbol, mirrored south of the
  equator, and the lit share in percent, and can be hidden and reordered.
- Every section (air quality, hourly, daily, rain, radar and wind) can now be
  shown either in the window or as a tab, separately for the widget and the app.
  Rain, radar and wind are independent sections instead of fixed tabs of one
  forecast block. The tabs share one strip, which has its own place in the
  section order; in the settings the tabbed sections are listed indented
  under it and set the order of the tabs, and keys 1–9 select them in that
  order.
  The default tab can be any tabbed section. Existing settings carry over
  unchanged.
- The current weather is a section of its own and can be moved like the others,
  together with the warnings below it; it always stays in the window. Starting
  a place search scrolls it into view.
- Updated the explanations in the settings (display page, current weather,
  tabs) and the shortcut list for movable sections and tabs.
- The settings can be adjusted completely by keyboard: Tab / ⇧ Tab switch
  pages, 1–3 pick menu bar, widget or app, ↑↓ (j k) move between settings,
  ←→ (h l) change a value or pick the switch column, Space / Enter switch, open
  a list or press a button, and ⇧↑↓ (J K) move the entry. The page switch moved
  from ←→ to Tab. Muted hints in the settings and the shortcut list describe
  the keys.
- Current weather: the change against yesterday at the same hour ("−2°") and
  the next full or new moon ("in 11 days") as optional columns, and a button
  (key `w`) that opens the place at a weather service (NWS, ECCC, else yr.no).
- Daily forecast: day length (sun-clock glyph) and, as its own entry, its
  change against the day before (a trend glyph for shorter, longer or equal,
  and the minutes).
  By default they sit with sunrise and sunset. Entries a stored order does
  not know yet are placed after their neighbour in the default order instead
  of at the end.
- Radar map: distance rings around the place (by zoom, km or miles).
- Settings: "General" is its own, first page (and opens first), with a wind
  unit of its own (km/h, m/s, mph, knots, Beaufort) and separate update
  intervals for the forecast (10–60 minutes, or the widget's default) and for
  radar with the rain nowcast (every new measurement, about 5 minutes, or 10,
  15 or 30 minutes to save data).
- Every section except the topmost shown draws a separating line above it,
  the current weather included.
- The settings scroll a fixed step per mouse wheel notch instead of the
  sluggish default.
- New section "My places": every favorite on one line in the body size, with
  weather symbol, temperature, feels-like, wind, humidity and moon (columns
  switchable and sortable). The values follow the name directly and the table
  is centred, so each line reads as one unit in the wide app too. A click, Alt+1–9 or Alt+←/→ makes a favorite the
  shown place and scrolls the current weather into view; IPC calls
  `favorite`, `nextFavorite` and `previousFavorite` allow global key
  bindings. While the section is shown, the favorites' weather is renewed
  with the forecast interval (15 minutes by default) instead of every six
  hours, checked every five minutes. A row reads its values for now from the
  place's stored hourly forecast, between the hours, rather than the values
  of the last fetch, so it keeps up with the clock (on a summer evening the
  temperature falls several degrees an hour).
- Hour cursor, after the yr.no plugin: Shift+←/→ (or a click on an hour)
  picks one of the next 24 hours, and the current weather reads it out —
  symbol, temperature, feels-like, wind and humidity, with "at 17:00" in
  place of the update time. Backspace or Esc return to now.
- Radar and wind map drawn in the theme's colours, after the Weather Radar
  plugin: land, lakes, towns, rivers, state and country borders from Natural
  Earth, shipped with the plugin (data/basemap.bin, 2.7 MB; only the 5° cells
  around the view are decoded), so
  the ground needs no network and follows theme changes. The satellite
  picture stays available under Settings → Display → Radar → Map style.
- The map can be moved: drag it, Ctrl + wheel zooms towards the pointer,
  and `0` or the new crosshair button returns to the place. Radar frames,
  place names and the wind grid follow the view; until the new pictures
  arrive the previous ones stay in place, so moving never blanks the map.
  The place marker, drift arrow and distance rings stay on the place. On the
  drawn map, rings, labels and wind particles use the text colour.
- Radar timeline under the map, after the Weather Radar plugin, in place of
  the small control box in the map's corner: play/pause, a track with a
  notch per frame to drag, click or scroll through, a taller notch for now,
  the forecast frames on an accent tint, faint notches for frames still
  loading, the time under the pointer, and the frame's time and distance
  from now on the right.
- While a radar frame loads, the map stays visible with a small note
  instead of being covered.
- Rain notification with a threshold and a radius (Settings → Display → menu
  bar → Notifications), after the Weather Radar plugin: any rain, moderate
  or more, or heavy only, on the rain legend's scale, and 10, 25, 50 or
  100 km around the place, read as 12 minutes to 2 hours ahead at about
  50 km/h. Light rain now no longer hides a downpour ahead, and rain that
  gets stronger is announced again. The defaults (any rain, 25 km ≈ 30
  minutes) match the previous behaviour.
- Fixed: the stored forecasts of saved places (and the offline copy of the
  shown place) kept their oldest hours and days and dropped every newer
  forecast, so "My places" worked from hours two weeks old and only the
  current value moved. Past rows are now dropped before the lists are cut.
- Export and import under Settings → General: the general settings, the
  display of menu bar, widget and app, and the saved places as one JSON file
  (by default ~/Downloads/more-weather-settings.json; the path can be
  edited). An import is confirmed with a second press, goes through the
  same checks as the settings files, and first saves the current settings
  to more-weather-settings-backup.json, so importing that file undoes it.
  Keyboard: the path field, Export and Import are in the page's key order.
- "Today" is the place's day, not this computer's: after midnight in Europe
  Chicago's Tuesday went missing and Wednesday was called today. The radar
  timeline, "rain from" and the rain notification show the place's time too.
- Japan: when JMA's radar picture is complete it replaces the frame below it
  instead of covering it with both showing, and it comes at zoom 10 for the
  closer views (it was scaled up threefold and blocky).
- Export and import show home paths as ~/….
- Importing the backup file itself restores it without first overwriting
  it (an undo used to import the settings it was meant to replace), and
  reports a restore; export and import wait for each other.
- The IPC call `tab <name>` scrolls the tab strip into view wherever it
  sits in the section order.
- Saved places changed in the app now reach the bar at once and the other
  way round (the places file is watched like the other settings files).
- Wind map after RegenVorschau: the speed as a smooth colour wash from deep
  blue (calm) to violet (storm) with a legend, and white streaks drifting
  with the wind, faster where it blows harder, each with a fading trail; the
  wind under the pointer shows its speed and direction. The animation runs
  at fifteen frames a second and takes about a fifth of a processor core
  while the map is on screen (Qt draws it in software; a GPU version was
  cheaper but blurred the streaks), none while it is hidden. The settings'
  wind card says so.
- The wind map's height can be switched at its top left (arrows, then the
  height and a faint key hint), or with Shift+↑/↓:
  10 m, 120 m, and the pressure levels 850 hPa (about 1,500 m), 700 hPa
  (3,000 m), 500 hPa (5,500 m) and 250 hPa (10 km, the jet stream). All come
  in the same request, so switching is instant; the colour scale widens with
  the height, and the choice is kept.
- Radar playback and the wind animation pause while the window is hidden
  or minimised.
- The warning lookups' large documents (Alert Hub register, CAP feeds and
  documents, JMA's area files) are parsed in a background thread
  (ModelWorker.js) instead of on the shell's main thread.
- Fixes from a review: letting go of Ctrl (or turning a sideways swipe
  upward) mid-gesture now hands the scroll back to the page instead of
  zooming the map or moving the daily strip on; no rain notification while
  the radar measures rain of that strength at the place already; a saved
  place is no longer queued a second time while it is being fetched.
- A QML syntax check (tests/qml-syntax.sh, qmllint) runs with the tests.
- One source per place in the DWD area: the week's temperature line now
  takes Bright Sky's hours like the day columns and the hourly forecast (the
  station's measurements for the hours gone, MOSMIX after them), so the
  line's low and high match the columns; saved places there are fetched
  from Bright Sky too, so "My places" reads the same as the place once shown.
- Map place names work offline: Natural Earth's towns ship with the map data
  and fill in where OpenStreetMap has none (it failed, or the map was moved
  away from the area it was asked for).
- Ctrl + arrow keys move the radar and wind map by a quarter of the view.
- The map data is one 2.7 MB file (data/basemap.bin, read through
  Basemap.js) instead of many small ones.
- Tests for Node's built-in runner (node --test tests/*.test.mjs): forecast
  merging, rain alerts, the temperature line, the drift arrow, the map data
  and the translations; they run on GitHub for every push.
- Temperature line, after linecast: under the hourly columns the next 24
  hours as one line, each segment coloured by its warmth, with daylight
  bands, a rule and day name at midnight, the value at each high and low, a
  dot for now, and the value under the pointer; a click picks the hour for
  the hour cursor, which the line marks. Under the daily columns the same
  line hour by hour through the week: each day under its column with a
  rule and its name at midnight, daylight bands, the day's high and low
  written at their hours, today's past hours dimmed, the day and hour under
  the pointer; it scrolls with the days. Each is a switch under
  Settings → Display (hourly and daily), on in the app and off in the popup.
- Both temperature lines carry the rain as bars from the bottom of the
  chart, in the theme's blue (square-root scale up to 8 mm in the hour);
  the amount joins the time under the pointer.
- The temperature lines' midnight rules, hour marks and "now" follow the
  place's own time, not this computer's time zone.
- Scrolling: touchpads scroll about two and a half times faster (Omarchy
  sets them to 0.4 for browsers, which accelerate on their own), in the
  view and in the settings. A scroll that began on the page stays with the
  page while it runs across the daily strip, a map, the radar timeline or a
  long warning. A plain up-and-down wheel always belongs to the page: the
  daily strip and the radar timeline take sideways scrolling (a touchpad
  swipe, a tilting wheel, or Shift + wheel), the maps zoom with Ctrl +
  wheel and otherwise show a short note saying so, and a long warning
  scrolls within its box and hands on to the page at its ends.
- Key hints ("⇧ ← → another hour", "Alt 1–9", the settings' key lines) are
  set in a fainter colour, the text colour faded towards the theme's
  background, so they recede in light themes too.
- The air quality colour dot is now one of the colour accents instead of a
  switch of its own under the air quality section.
- Rain chance colours run from the text colour at 0 % through cyan, dark
  blue and magenta to violet at 100 %, instead of green to blue.
- Radar drift arrow: its time labels no longer disappear at some zoom
  levels. The marks now use round steps from 5 minutes to two hours, and
  three or four hours when zoomed far out on slow rain.
- Colour accents, after meteobar, switchable under Settings → General:
  temperatures by warmth on one fixed scale (−10 to 35 °C) everywhere, so a
  colour means the same warmth in every view, rain chance, UV from
  "moderate" and wind from a gale by level, and the change against yesterday
  (warmer warm, colder cool), in the current Omarchy theme's palette. A new daily entry
  shows each day's range as a bar on the week's scale. Daily and menu bar
  ranges now read low before high, like the bar: cool left, warm right.
- The rain chart looks lighter, after the yr.no plugin: slimmer flat bars,
  and the probability as a thin line over a translucent area instead of a
  thick line with a shadow and dots.
- The rain chart's labels are sharp on fractionally scaled screens: they are
  now text items over the chart instead of being drawn into the canvas.
- The rain drop in the menu bar shows the rain probability: an outline below
  25 %, half full from 25 %, full from 75 %. It is the font's own drop, so it
  matches the text; half is measured by area, since the tip holds little.
- More official data sources, all free and without registration:
  - Switzerland and Liechtenstein: MeteoSwiss ICON-CH (1–2 km) for the first
    five days of the forecast; Open-Meteo's Best Match there is DWD ICON-D2.
  - Rain nowcast from national radar: MET Norway Nowcast in Norway, Sweden,
    Finland and Denmark, GeoSphere Austria's INCA nowcast in Austria (east of
    16° E the DWD radar did not reach).
  - Finnish radar from FMI and Dutch radar from KNMI instead of RainViewer.
  - Rain nowcast for the Netherlands and Belgium from Buienradar (KNMI radar).
  - Japan: JMA radar on the map and JMA's one-hour radar nowcast for the rain
    chart, read from JMA's map tiles.
  - Warnings for Australia (Bureau of Meteorology, per state), New Zealand
    (MetService CAP) and Japan (JMA, per municipality, 2026 warning system).
  - Warnings for Brazil (INMET) and Argentina (SMN), and for every other
    country that publishes official CAP warnings registered with the WMO,
    through the Alert Hub register (about 115 countries, many of them in
    Africa, South America, Asia and Oceania). Only weather, environment and
    fire alerts are shown; messages that a later one updates are dropped.
  - The Sources page names and links the new services.

## 2.4.0 — 2026-09-17

- Made the order of displayed information configurable throughout the plugin:
  menu-bar entries, widget and app header values, sections, and hourly and daily
  forecast columns can all be rearranged independently.
- Added a separate reset-order action, so the default order can be restored
  without changing visibility settings.
- Added sunrise, sunset, next sun event, moon phase, daily temperature range,
  and next-hour rain amount as menu-bar entries.
- Added a combined sun column to the daily forecast; it shows whichever of
  sunrise and sunset comes next.

## 2.3.0 — 2026-09-17

- Added a third menu-bar visibility mode, **When relevant**, alongside
  **Always** and **On hover**. Always-visible values now show an explicit empty
  state instead of disappearing when no event is present.
- Added UV index and pollen as independent menu-bar entries.
- Added Kelvin as a temperature unit throughout the plugin.
- Added an optional second unit system for menu-bar values while the pointer is
  over the widget.
- Preserved existing menu-bar behavior when migrating settings from earlier
  releases.

## 2.2.0 — 2026-09-17

- Made every menu-bar entry independently configurable as always visible or
  visible on hover.
- Added an option to open the weather card on hover and close it after the
  pointer leaves both the widget and the card.
- Split rain probability and current rain intensity into separate menu-bar
  entries while preserving the previous precipitation setting on upgrade.

## 2.1.2 — 2026-09-17

- Fixed deferred panel work surviving monitor removal or shell panel rebuilds,
  which could produce null-object errors immediately before a Quickshell crash.

## 2.1.1 — 2026-09-16

- Added a setting to move the widget between the left, center, and right bar
  sections using Omarchy's own bar-layout command.

## 2.1.0 — 2026-09-16

- Upgraded the DWD-area rain nowcast to five-minute radar updates. Rain amount,
  rain start, short-term probability, current and hourly symbols, and the rain
  chart now use the radar where available and fall back to forecast data where
  needed.
- Reworked the radar drift arrow to follow tracked precipitation motion in the
  DWD area, with 700 hPa model wind and surface wind as fallbacks. The arrow and
  maps now use the correct geographic scale and viewport.
- Required a warning or station observation before presenting a thunderstorm as
  confirmed, reducing false lightning indicators from forecast-only data.
- Added clearer half-hour labels and radar-derived colors to the rain chart,
  plus detailed source explanations in all 30 interface languages.
- Added **Show in app launcher** to Settings. The generated launcher entry can
  remove itself safely after the plugin has been uninstalled.
- Added strict response-size limits for weather requests and byte, pixel,
  concurrency, and age limits for downloaded map images.
- Fixed current-condition timing, forecasts for places in other time zones,
  Canadian ECCC radar requests, missing probability data, transient invalid map
  extents, and cross-instance radar sharing after location changes.

