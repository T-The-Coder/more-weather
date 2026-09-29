# Changelog

All notable changes to More Weather are documented here.

## Unreleased

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
  Earth, shipped with the plugin (data/basemap.bin, 2.6 MB; only the 5° cells
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

