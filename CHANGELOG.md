# Changelog

All notable changes to More Weather are documented here.

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

