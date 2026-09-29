.pragma library

// Runtime UI catalogue. Every translated catalogue is an overlay on English:
// a missing key therefore falls back independently instead of breaking the
// whole locale. Compact catalogues keep the single-file QML JS module easy to
// replace and validate without adding runtime file I/O.
var catalog = {
  en: {
    weather: "Weather",
    warningExtreme: "EXTREME",
    warningSevere: "SEVERE",
    warningModerate: "MODERATE",
    warningMinor: "MINOR",
    effectiveNow: "effective now",
    untilFurtherNotice: "until further notice",
    updating: "updating…",
    justNow: "just now",
    minutesAgo: "{count} min ago",
    hoursAgo: "{count} h ago",
    today: "Today",
    current: "current",
    now: "now",
    searchCity: "Search city",
    feelsLike: "FEELS LIKE",
    wind: "Wind",
    humidity: "Humidity",
    autoDetected: "Auto-detected",
    fetchingForecast: "Fetching forecast…",
    hourly: "HOURLY",
    daily: "DAILY",
    forecast: "FORECAST",
    settings: "Settings",
    app: "App",
    widget: "Widget",
    menubar: "Menu bar",
    widgetSettings: "Widget settings",
    appSettings: "App settings",
    menubarSettings: "Menu bar settings",
    displaySettingsHint: "Choose what the selected view shows.",
    general: "GENERAL",
    unitSystem: "Unit system",
    metricUnits: "Metric",
    metricUnitsSummary: "°C · mm · km/h · km",
    imperialUnits: "US / Imperial",
    imperialUnitsSummary: "°F · in · mph · mi",
    time: "Time",
    weekday: "Weekday",
    weatherSymbol: "Weather symbol",
    temperature: "Temperature",
    feelsLikeTemperature: "Feels-like temperature",
    currentWeather: "CURRENT WEATHER",
    location: "Location",
    precipitation: "Precipitation",
    weatherWarnings: "Weather warnings",
    feelsLikeShort: "Feels",
    temperatureRange: "Min / max temperature",
    rainProbability: "Rain probability",
    rainAmount: "Rain amount",
    uvIndex: "UV index",
    sunriseSunset: "Sunrise / sunset",
    twoHourTotal: "Two-hour total",
    defaultTab: "Default forecast tab",
    rainForecastTwoHours: "RAIN FORECAST · 2 HOURS",
    rainRadarPastTwoHours: "RAIN RADAR · PAST 2 HOURS",
    precipitationModelCurrent: "PRECIPITATION MODEL · CURRENT",
    sourceMosmix: "DWD MOSMIX",
    sourceRadar: "DWD RADAR",
    sourceBestMatch: "OPEN-METEO · BEST MATCH",
    sourceMetNo: "MET.NO",
    sourceRainViewer: "RAINVIEWER RADAR",
    sourceNwsRadar: "NWS · OFFICIAL RADAR",
    sourceEcccRadar: "ECCC · OFFICIAL RADAR",
    sourceModelFallback: "OPEN-METEO · MODEL FALLBACK",
    sourceMetNoModelFallback: "MET.NO · MODEL FALLBACK",
    sourceDwdWarnings: "DWD WARNINGS",
    sourceNwsWarnings: "NWS WARNINGS",
    sourceMeteoAlarm: "METEOALARM WARNINGS",
    sourceEcccWarnings: "ECCC WARNINGS",
    rain: "Rain",
    probability: "Probability",
    intensity: "Intensity",
    intensityUnit: "Intensity · {unit}",
    rainNone: "No rain",
    rainNoneRange: "0",
    rainWeak: "Light",
    rainWeakRange: "> 0–0.5",
    rainWeakRangeImperial: "> 0–0.02",
    rainMedium: "Moderate",
    rainMediumRange: "> 0.5–4",
    rainMediumRangeImperial: "> 0.02–0.16",
    rainStrong: "Heavy",
    rainStrongRange: "> 4–40",
    rainStrongRangeImperial: "> 0.16–1.57",
    rainExtreme: "Extreme",
    rainExtremeRange: "> 40",
    rainExtremeRangeImperial: "> 1.57",
    radar: "Radar",
    noRainExpected: "No rain expected · {amount} {unit} / 2 h",
    total: "Total: {amount} {unit} / 2 h",
    noDataWaiting: "No data – waiting for refresh…",
    radarLoading: "Radar map is loading…",
    noRadarData: "No radar data available at this location",
    windMapSummary: "{location} · {speed} {unit} from {direction} · gusts {gust} {unit}",
    windDataLoading: "Wind data is loading…",
    noWindData: "No wind model data available",
    cachedDataNotice: "Italic values come from the cache (max. 3 days old).",
    // Settings pages: keyboard shortcuts and data sources.
    restoreDefaults: "Restore defaults",
    restoreDefaultsConfirm: "Click again to reset",
    defaultsActive: "Default settings active",
    useCurrentLocation: "Current location",
    autoUnits: "Automatic",
    autoUnitsSummary: "By location",
    notifySevereWarnings: "Severe weather notifications",
    notifySevereWarningsHint: "Desktop notification for severe and extreme warnings at the shown location.",
    rainStartTime: "Rain start time",
    rainFromTime: "from {time}",
    rainFromTotal: "Rain from {time} · {amount} {unit} / 2 h",
    rainNotificationTitle: "Rain from {time}",
    upToRate: "up to {rate}",
    notifyRainSoon: "Rain notifications",
    notifyRainSoonHint: "Notification when rain is expected within 30 minutes at the shown location.",
    airQualityPollen: "Air quality & pollen",
    airQualityIndex: "Air quality index",
    pollen: "Pollen",
    airQualityHint: "Open-Meteo (Copernicus CAMS), updated hourly. Pollen only in Europe.",
    aqiGood: "good",
    aqiFair: "fair",
    aqiModerate: "moderate",
    aqiPoor: "poor",
    aqiVeryPoor: "very poor",
    aqiExtremelyPoor: "extremely poor",
    aqiUnhealthySensitive: "unhealthy for sensitive groups",
    aqiUnhealthy: "unhealthy",
    aqiVeryUnhealthy: "very unhealthy",
    aqiHazardous: "hazardous",
    pollenAlder: "Alder",
    pollenBirch: "Birch",
    pollenGrass: "Grass",
    pollenMugwort: "Mugwort",
    pollenOlive: "Olive",
    pollenRagweed: "Ragweed",
    pollenLow: "low",
    pollenModerate: "moderate",
    pollenHigh: "high",
    pollenNone: "no notable pollen",
    pollenUnavailable: "no pollen data for this region",
    sourceGroupAirQuality: "Air quality & pollen",
    sourceGroupAirQualityDetails: "European air quality index (US AQI in the United States), PM2.5, PM10, ozone and pollen from the Copernicus CAMS model, fetched at most hourly while the section is switched on.",
    sourceGroupAirQualityCoverage: "Air quality worldwide; pollen in Europe only.",
    airQualityAlert: "Poor air & high pollen",
    airQualityLoading: "Loading air quality…",
    airQualityUnavailable: "No data could be fetched",
    airQualityNoData: "No data available for this place",
    airQualityColor: "Color indicator",
    openInApp: "Open in app",
    shortcutOpenApp: "Open the app (widget)",
    shortcutMouseOpenApp: "Symbol or temperature in the widget: open the app",
    language: "Language",
    languageAuto: "Automatic ({language})",
    appLauncherEntry: "Show in app launcher",
    appLauncherEntryHint: "Adds the More Weather app to the app launcher. If the plugin is removed, the entry deletes itself when it is next opened.",
    notifications: "Notifications",
    settingsPageDisplay: "Display",
    settingsPageShortcuts: "Shortcuts",
    settingsPageSources: "Sources",
    shortcutsSubtitle: "Keyboard and mouse",
    sourcesSubtitle: "Where the data comes from",
    shortcutsHint: "The same keys work in the widget and in the app.",
    shortcutsGroupGeneral: "GENERAL",
    shortcutsGroupNavigation: "SCROLLING",
    shortcutsGroupForecast: "RAIN, RADAR & WIND",
    shortcutsGroupSearch: "PLACE SEARCH",
    shortcutsGroupSettings: "SETTINGS",
    shortcutsGroupMouse: "MENU BAR",
    shortcutClose: "Close search, settings or list, then the panel",
    shortcutSwitchPanel: "Next / previous bar panel (widget)",
    shortcutSettings: "Open settings",
    shortcutRefresh: "Refresh now",
    shortcutSearch: "Search a place",
    shortcutScroll: "Scroll",
    shortcutPage: "Scroll a page",
    shortcutJump: "Jump to top / bottom",
    shortcutScrollDaily: "Scroll the daily forecast",
    shortcutViews: "Rain / radar / wind view",
    shortcutRadarStep: "Radar: previous / next frame",
    shortcutRadarPlay: "Radar: play / pause",
    shortcutZoom: "Map: zoom in / out",
    shortcutZoomReset: "Map: default zoom",
    shortcutSearchSelect: "Choose a result",
    shortcutSearchSection: "Switch between results and favorites",
    shortcutSearchPick: "Show the chosen place",
    shortcutSearchFavorite: "Add / remove favorite",
    shortcutSearchCancel: "Cancel the search",
    shortcutSettingsPages: "Previous / next settings page",
    shortcutSettingsClose: "Close settings",
    mouseLeft: "Left click",
    mouseMiddle: "Middle click",
    mouseRight: "Right click",
    shortcutMouseToggle: "Open / close the weather panel",
    shortcutMouseRefresh: "Refresh now",
    shortcutMouseNotify: "Weather as a notification",
    sourcesHint: "Sources are chosen per place and fall back automatically when one fails.",
    sourceInUse: "IN USE",
    sourceNotInUse: "not in use",
    sourceGroupForecast: "Current weather and forecast",
    sourceGroupForecastDetails: "Open-Meteo Best Match (the best national model per region), with MET Norway as fallback. In Norway, Sweden, Finland and Denmark MET Norway comes first, backed by its 1 km MET Nordic model. In the DWD area, DWD MOSMIX (via Bright Sky) refines temperature, rain and symbols.",
    sourceCoverage: "COVERAGE",
    sourceGroupForecastCoverage: "Worldwide. MET Norway first in NO, SE, FI, DK. DWD MOSMIX only in the DWD area (about 46.5–55.5° N, 5–16° E, beyond Germany too).",
    sourceGroupUvCoverage: "Worldwide.",
    sourceGroupNowcastCoverage: "Worldwide. MOSMIX rain values and the DWD radar amount only in the DWD area.",
    sourceGroupRadarCoverage: "DWD area (about 46.5–55.5° N, 5–16° E) · USA incl. Alaska, Hawaii, Puerto Rico and Guam (NWS) · Canada (ECCC) · everywhere else RainViewer (past two hours) · last resort: model precipitation from Open-Meteo or MET Norway.",
    sourceGroupWindCoverage: "Worldwide.",
    sourceGroupWarningsCoverage: "Germany: DWD, MeteoAlarm as fallback · MeteoAlarm in 39 countries: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Canada: ECCC · no warnings anywhere else.",
    sourceGroupLocationCoverage: "Worldwide.",
    sourceGroupMapCoverage: "Worldwide. Place labels from three Overpass servers in turn: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
    sourceGroupMoonCoverage: "Worldwide; mirrored south of the equator.",
    sourceGroupUv: "UV index",
    sourceGroupUvDetails: "Open-Meteo hourly and daily UV forecast.",
    sourceGroupNowcast: "Rain in the next two hours",
    sourceGroupNowcastDetails: "15-minute time axis from the forecast. In the DWD area the next two hours are built from the DWD radar nowcast via Bright Sky: rain that is already falling, moved along its track. Amounts and the rain start are the mean over 3 × 3 km around the place. The probability combines how much of the surroundings the radar shows wet – about 1 km now, widening to 10 km in two hours for the growing uncertainty – with the DWD MOSMIX probability, which counts for more the further ahead, since the radar cannot foresee showers that have yet to form. The hourly forecast takes these values for the hours they cover. Beyond the radar, and elsewhere, all values come from the forecast.",
    sourceGroupRadar: "Radar",
    sourceGroupRadarDetails: "Radar images from the official regional service; RainViewer steps in elsewhere and whenever that fails. Without any radar the map shows model precipitation.",
    sourceGroupWind: "Wind map",
    sourceGroupWindDetails: "Open-Meteo grid of 35 points over the map extent; otherwise the forecast wind at the place. The wind map shows the wind 10 m above ground.",
    sourceGroupDrift: "Rain drift arrow",
    sourceGroupDriftDetails: "Where rain on the radar is heading, for the frame on screen. In the DWD area the motion is tracked in the radar itself by comparing the rain pattern with the one 15 minutes later. Elsewhere, or with too little rain to follow, the model wind at about 3 km (700 hPa) is used, otherwise the surface wind. Rain moves with the wind a few kilometres up, which often blows from a different direction than the wind near the ground on the wind map – on showery days by several tens of degrees.",
    sourceGroupDriftCoverage: "Radar tracking in the DWD area (about 46.5–55.5° N, 5–16° E) · 700 hPa wind worldwide.",
    sourceGroupWarnings: "Weather warnings",
    sourceGroupWarningsDetails: "Official warnings for the place: DWD via Bright Sky, the European MeteoAlarm feed (its JSON API when the feed fails), the US National Weather Service or Environment and Climate Change Canada.",
    sourceGroupLocation: "Place",
    sourceGroupLocationDetails: "Auto-detect by IP address: ipwho.is, then ipapi.co, then GeoJS. For a chosen place, name, county and country are looked up once via Nominatim (OpenStreetMap). Place search: Open-Meteo Geocoding.",
    sourceGroupMap: "Map background and labels",
    sourceGroupMapDetails: "Satellite background: DWD GeoServer Blue Marble. City labels: OpenStreetMap via the Overpass API, cached for 30 days.",
    sourceGroupMoon: "Moon phase",
    sourceGroupMoonDetails: "Calculated locally (Meeus); mirrored for places south of the equator.",
    sourceLocalCalculation: "LOCAL CALCULATION",
    sourceRefreshInfo: "Refreshed every {minutes} min, the DWD radar every 5 min, shared between widget and app. Last update: {updated}.",
    barPosition: "Position in the bar",
    barPositionLeft: "Left",
    barPositionCenter: "Center",
    barPositionRight: "Right",
    barPositionTop: "Top",
    barPositionBottom: "Bottom",
    barPositionHint: "Moves the widget within Omarchy's bar.",
    barPositionMissing: "The widget is not on the bar.",
    showAlways: "Always",
    showOnHover: "On hover",
    menubarHoverHint: "Entries set to “On hover” appear while the pointer rests on the weather in the bar.",
    barBehavior: "Behavior",
    openWidgetOnHover: "Open widget on hover",
    openWidgetOnHoverHint: "Opens the widget when the pointer rests on the weather in the bar, and closes it once the pointer moves away. A click keeps it open.",
    rainIntensity: "Rain intensity",
    showWhenRelevant: "When relevant",
    menubarRelevantCurrentHint: "“When relevant” shows an entry only when it stands out: feels-like 3° off the temperature, wind from 20 km/h, UV from 6.",
    menubarRelevantRainHint: "“When relevant”: probability from 30 %, intensity while it rains, rain start within two hours. The rain start and the intensity take the probability's place.",
    menubarRelevantAirHint: "“When relevant”: air quality from “poor”, pollen at a high level.",
    kelvinUnits: "Kelvin",
    kelvinUnitsSummary: "K · mm · km/h · km",
    hoverUnitSystem: "Other units on hover",
    hoverUnitSystemOff: "Off",
    hoverUnitSystemHint: "While the pointer rests on the widget, the bar switches to this unit system. Kelvin changes temperatures only.",
    restoreOrder: "Restore order",
    sunNext: "Next sun event",
    sunrise: "Sunrise",
    sunset: "Sunset",
    moonPhase: "Moon phase",
    moon: "Moon"
  },
  de: {
    weather: "Wetter",
    warningExtreme: "EXTREM",
    warningSevere: "SCHWER",
    warningModerate: "MÄSSIG",
    warningMinor: "GERING",
    effectiveNow: "ab sofort",
    untilFurtherNotice: "bis auf Weiteres",
    updating: "wird aktualisiert…",
    justNow: "gerade eben",
    minutesAgo: "vor {count} min",
    hoursAgo: "vor {count} h",
    today: "Heute",
    current: "aktuell",
    now: "jetzt",
    searchCity: "Stadt suchen",
    feelsLike: "GEFÜHLT",
    wind: "Wind",
    humidity: "Feuchte",
    autoDetected: "Automatisch erkannt",
    fetchingForecast: "Vorhersage wird geladen…",
    hourly: "STÜNDLICH",
    daily: "TÄGLICH",
    forecast: "VORHERSAGE",
    settings: "Einstellungen",
    app: "App",
    widget: "Widget",
    menubar: "Menüleiste",
    widgetSettings: "Widget-Einstellungen",
    appSettings: "App-Einstellungen",
    menubarSettings: "Menüleisten-Einstellungen",
    displaySettingsHint: "Lege fest, was in der ausgewählten Ansicht angezeigt wird.",
    general: "ALLGEMEIN",
    unitSystem: "Einheitensystem",
    metricUnits: "Metrisch",
    metricUnitsSummary: "°C · mm · km/h · km",
    imperialUnits: "US / Imperial",
    imperialUnitsSummary: "°F · in · mph · mi",
    time: "Zeit",
    weekday: "Wochentag",
    weatherSymbol: "Wettersymbol",
    temperature: "Temperatur",
    feelsLikeTemperature: "Gefühlte Temperatur",
    currentWeather: "AKTUELLES WETTER",
    location: "Ort",
    precipitation: "Niederschlag",
    weatherWarnings: "Wetterwarnungen",
    feelsLikeShort: "Gef.",
    temperatureRange: "Min.- / Max.-Temperatur",
    rainProbability: "Regenwahrscheinlichkeit",
    rainAmount: "Regenmenge",
    uvIndex: "UV-Index",
    sunriseSunset: "Sonnenauf- / -untergang",
    twoHourTotal: "2-Stunden-Summe",
    defaultTab: "Standard-Tab im Forecast",
    rainForecastTwoHours: "REGENVORSCHAU · 2 STUNDEN",
    rainRadarPastTwoHours: "REGENRADAR · LETZTE 2 STUNDEN",
    precipitationModelCurrent: "NIEDERSCHLAGSMODELL · AKTUELL",
    sourceMosmix: "DWD MOSMIX",
    sourceRadar: "DWD RADAR",
    sourceBestMatch: "OPEN-METEO · BEST MATCH",
    sourceMetNo: "MET.NO",
    sourceRainViewer: "RAINVIEWER RADAR",
    sourceNwsRadar: "NWS · AMTLICHES RADAR",
    sourceEcccRadar: "ECCC · AMTLICHES RADAR",
    sourceModelFallback: "OPEN-METEO · MODELL-FALLBACK",
    sourceMetNoModelFallback: "MET.NO · MODELL-FALLBACK",
    sourceDwdWarnings: "DWD-WARNUNGEN",
    sourceNwsWarnings: "NWS-WARNUNGEN",
    sourceMeteoAlarm: "METEOALARM-WARNUNGEN",
    sourceEcccWarnings: "ECCC-WARNUNGEN",
    rain: "Regen",
    probability: "Wahrscheinlichkeit",
    intensity: "Intensität",
    intensityUnit: "Intensität · {unit}",
    rainNone: "Kein Regen",
    rainNoneRange: "0",
    rainWeak: "Schwach",
    rainWeakRange: "> 0–0,5",
    rainWeakRangeImperial: "> 0–0,02",
    rainMedium: "Mittel",
    rainMediumRange: "> 0,5–4",
    rainMediumRangeImperial: "> 0,02–0,16",
    rainStrong: "Stark",
    rainStrongRange: "> 4–40",
    rainStrongRangeImperial: "> 0,16–1,57",
    rainExtreme: "Extrem",
    rainExtremeRange: "> 40",
    rainExtremeRangeImperial: "> 1,57",
    radar: "Radar",
    noRainExpected: "Kein Regen erwartet · {amount} {unit} / 2 h",
    total: "Summe: {amount} {unit} / 2 h",
    noDataWaiting: "Keine Daten – warte auf Aktualisierung…",
    radarLoading: "Radarkarte wird geladen…",
    noRadarData: "An diesem Ort sind keine Radardaten verfügbar",
    windMapSummary: "{location} · {speed} {unit} aus {direction} · Böen {gust} {unit}",
    windDataLoading: "Winddaten werden geladen…",
    noWindData: "Keine Windmodelldaten verfügbar",
    cachedDataNotice: "Kursive Werte stammen aus dem Cache (max. 3 Tage alt).",
    restoreDefaults: "Standardwerte wiederherstellen",
    restoreDefaultsConfirm: "Zum Zurücksetzen erneut klicken",
    defaultsActive: "Standardwerte aktiv",
    useCurrentLocation: "Aktueller Standort",
    autoUnits: "Automatisch",
    autoUnitsSummary: "Nach Standort",
    notifySevereWarnings: "Unwetter-Benachrichtigungen",
    notifySevereWarningsHint: "Desktop-Benachrichtigung bei schweren und extremen Warnungen für den angezeigten Ort.",
    rainStartTime: "Regenbeginn",
    rainFromTime: "ab {time}",
    rainFromTotal: "Regen ab {time} · {amount} {unit} / 2 h",
    rainNotificationTitle: "Regen ab {time}",
    upToRate: "bis {rate}",
    notifyRainSoon: "Regen-Benachrichtigungen",
    notifyRainSoonHint: "Benachrichtigung, wenn am angezeigten Ort in den nächsten 30 Minuten Regen erwartet wird.",
    airQualityPollen: "Luftqualität & Pollen",
    airQualityIndex: "Luftqualitätsindex",
    pollen: "Pollen",
    airQualityHint: "Open-Meteo (Copernicus CAMS), stündlich aktualisiert. Pollen nur in Europa.",
    aqiGood: "gut",
    aqiFair: "ausreichend",
    aqiModerate: "mäßig",
    aqiPoor: "schlecht",
    aqiVeryPoor: "sehr schlecht",
    aqiExtremelyPoor: "extrem schlecht",
    aqiUnhealthySensitive: "ungesund für empfindliche Gruppen",
    aqiUnhealthy: "ungesund",
    aqiVeryUnhealthy: "sehr ungesund",
    aqiHazardous: "gefährlich",
    pollenAlder: "Erle",
    pollenBirch: "Birke",
    pollenGrass: "Gräser",
    pollenMugwort: "Beifuß",
    pollenOlive: "Olive",
    pollenRagweed: "Ambrosia",
    pollenLow: "gering",
    pollenModerate: "mittel",
    pollenHigh: "hoch",
    pollenNone: "keine nennenswerten Pollen",
    pollenUnavailable: "keine Pollendaten für diese Region",
    sourceGroupAirQuality: "Luftqualität & Pollen",
    sourceGroupAirQualityDetails: "Europäischer Luftqualitätsindex (in den USA US-AQI), PM2,5, PM10, Ozon und Pollen aus dem Copernicus-CAMS-Modell; höchstens stündlich abgerufen, solange der Abschnitt eingeschaltet ist.",
    sourceGroupAirQualityCoverage: "Luftqualität weltweit, Pollen nur in Europa.",
    airQualityAlert: "Schlechte Luft & hohe Pollen",
    airQualityLoading: "Luftqualität wird geladen…",
    airQualityUnavailable: "Kein Datenabruf möglich",
    airQualityNoData: "Keine Daten für diesen Ort vorhanden",
    airQualityColor: "Farbindikator",
    openInApp: "In App öffnen",
    shortcutOpenApp: "App öffnen (Widget)",
    shortcutMouseOpenApp: "Symbol oder Temperatur im Widget: App öffnen",
    language: "Sprache",
    languageAuto: "Automatisch ({language})",
    appLauncherEntry: "Im App-Starter anzeigen",
    appLauncherEntryHint: "Fügt die More-Weather-App dem App-Starter hinzu. Wird das Plugin entfernt, löscht sich der Eintrag beim nächsten Öffnen selbst.",
    notifications: "Benachrichtigungen",
    settingsPageDisplay: "Anzeige",
    settingsPageShortcuts: "Tastenkürzel",
    settingsPageSources: "Quellen",
    shortcutsSubtitle: "Tastatur und Maus",
    sourcesSubtitle: "Woher die Daten stammen",
    shortcutsHint: "Die Tasten gelten im Widget und in der App gleichermaßen.",
    shortcutsGroupGeneral: "ALLGEMEIN",
    shortcutsGroupNavigation: "SCROLLEN",
    shortcutsGroupForecast: "REGEN, RADAR & WIND",
    shortcutsGroupSearch: "ORTSSUCHE",
    shortcutsGroupSettings: "EINSTELLUNGEN",
    shortcutsGroupMouse: "MENÜLEISTE",
    shortcutClose: "Suche, Einstellungen oder Liste schließen, dann das Panel",
    shortcutSwitchPanel: "Nächstes / vorheriges Panel der Leiste (Widget)",
    shortcutSettings: "Einstellungen öffnen",
    shortcutRefresh: "Jetzt aktualisieren",
    shortcutSearch: "Ort suchen",
    shortcutScroll: "Scrollen",
    shortcutPage: "Seitenweise scrollen",
    shortcutJump: "Zum Anfang / Ende",
    shortcutScrollDaily: "Tagesvorschau scrollen",
    shortcutViews: "Ansicht Regen / Radar / Wind",
    shortcutRadarStep: "Radar: Bild zurück / vor",
    shortcutRadarPlay: "Radar: abspielen / anhalten",
    shortcutZoom: "Karte: hinein- / herauszoomen",
    shortcutZoomReset: "Karte: Standard-Zoom",
    shortcutSearchSelect: "Treffer auswählen",
    shortcutSearchSection: "Zwischen Treffern und Favoriten wechseln",
    shortcutSearchPick: "Gewählten Ort anzeigen",
    shortcutSearchFavorite: "Favorit hinzufügen / entfernen",
    shortcutSearchCancel: "Suche abbrechen",
    shortcutSettingsPages: "Vorherige / nächste Einstellungsseite",
    shortcutSettingsClose: "Einstellungen schließen",
    mouseLeft: "Linksklick",
    mouseMiddle: "Mittelklick",
    mouseRight: "Rechtsklick",
    shortcutMouseToggle: "Wetter-Panel öffnen / schließen",
    shortcutMouseRefresh: "Jetzt aktualisieren",
    shortcutMouseNotify: "Wetter als Benachrichtigung",
    sourcesHint: "Die Quellen werden je nach Ort gewählt; fällt eine aus, springt automatisch die nächste ein.",
    sourceInUse: "AKTIV",
    sourceNotInUse: "nicht aktiv",
    sourceGroupForecast: "Aktuelles Wetter und Vorhersage",
    sourceGroupForecastDetails: "Open-Meteo Best Match (das beste nationale Modell je Region), bei Ausfall MET Norway. In Norwegen, Schweden, Finnland und Dänemark hat MET Norway Vorrang, gestützt auf sein 1-km-Modell MET Nordic. Im DWD-Gebiet verfeinert DWD MOSMIX (über Bright Sky) Temperatur, Regen und Symbole.",
    sourceCoverage: "ABDECKUNG",
    sourceGroupForecastCoverage: "Weltweit. MET Norway zuerst in NO, SE, FI, DK. DWD MOSMIX nur im DWD-Gebiet (ca. 46,5–55,5° N, 5–16° O, also auch über Deutschland hinaus).",
    sourceGroupUvCoverage: "Weltweit.",
    sourceGroupNowcastCoverage: "Weltweit. MOSMIX-Regenwerte und die DWD-Radarmenge nur im DWD-Gebiet.",
    sourceGroupRadarCoverage: "DWD-Gebiet (ca. 46,5–55,5° N, 5–16° O) · USA inkl. Alaska, Hawaii, Puerto Rico und Guam (NWS) · Kanada (ECCC) · überall sonst RainViewer (letzte zwei Stunden) · zuletzt: Modell-Niederschlag von Open-Meteo oder MET Norway.",
    sourceGroupWindCoverage: "Weltweit.",
    sourceGroupWarningsCoverage: "Deutschland: DWD, ersatzweise MeteoAlarm · MeteoAlarm in 39 Ländern: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Kanada: ECCC · sonst nirgends Warnungen.",
    sourceGroupLocationCoverage: "Weltweit.",
    sourceGroupMapCoverage: "Weltweit. Städtenamen nacheinander von drei Overpass-Servern: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
    sourceGroupMoonCoverage: "Weltweit; südlich des Äquators gespiegelt.",
    sourceGroupUv: "UV-Index",
    sourceGroupUvDetails: "Stündliche und tägliche UV-Vorhersage von Open-Meteo.",
    sourceGroupNowcast: "Regen in den nächsten zwei Stunden",
    sourceGroupNowcastDetails: "15-Minuten-Zeitachse aus der Vorhersage. Im DWD-Gebiet entstehen die nächsten zwei Stunden aus dem DWD-Radar-Nowcast über Bright Sky: Regen, der bereits fällt, entlang seiner Zugbahn weitergerechnet. Mengen und Regenbeginn sind das Mittel über 3 × 3 km um den Ort. Die Wahrscheinlichkeit verbindet, wie viel der Umgebung das Radar nass zeigt – jetzt etwa 1 km, in zwei Stunden 10 km, weil die Unsicherheit wächst –, mit der Wahrscheinlichkeit aus DWD MOSMIX, die umso mehr zählt, je weiter es in die Zukunft geht, denn Schauer, die erst noch entstehen, kann das Radar nicht vorhersehen. Die Stundenvorhersage übernimmt diese Werte für die Stunden, die sie abdecken. Jenseits des Radars und anderswo stammen alle Werte aus der Vorhersage.",
    sourceGroupRadar: "Radar",
    sourceGroupRadarDetails: "Radarbilder vom amtlichen regionalen Dienst; RainViewer springt überall sonst und bei dessen Ausfall ein. Ganz ohne Radar zeigt die Karte Modell-Niederschlag.",
    sourceGroupWind: "Windkarte",
    sourceGroupWindDetails: "Open-Meteo-Gitter mit 35 Punkten über dem Kartenausschnitt; sonst der Vorhersagewind am Ort. Die Windkarte zeigt den Wind in 10 m Höhe.",
    sourceGroupDrift: "Zugrichtung des Regens",
    sourceGroupDriftDetails: "Wohin der Regen auf dem Radar zieht, passend zum gezeigten Bild. Im DWD-Gebiet wird die Bewegung im Radar selbst verfolgt: Das Regenmuster wird mit dem 15 Minuten späteren verglichen. Anderswo oder bei zu wenig Regen gilt der Modellwind in etwa 3 km Höhe (700 hPa), sonst der Bodenwind. Regen zieht mit dem Wind in einigen Kilometern Höhe, und der kommt oft aus einer anderen Richtung als der bodennahe Wind der Windkarte – an schauerreichen Tagen um mehrere Dutzend Grad.",
    sourceGroupDriftCoverage: "Radarverfolgung im DWD-Gebiet (ca. 46,5–55,5° N, 5–16° O) · 700-hPa-Wind weltweit.",
    sourceGroupWarnings: "Wetterwarnungen",
    sourceGroupWarningsDetails: "Amtliche Warnungen für den Ort: DWD über Bright Sky, der europäische MeteoAlarm-Feed (bei Ausfall dessen JSON-API), der US National Weather Service oder Environment and Climate Change Canada.",
    sourceGroupLocation: "Ort",
    sourceGroupLocationDetails: "Automatische Erkennung per IP-Adresse: ipwho.is, dann ipapi.co, dann GeoJS. Für einen gewählten Ort werden Name, Landkreis und Land einmalig über Nominatim (OpenStreetMap) ermittelt. Ortssuche: Open-Meteo Geocoding.",
    sourceGroupMap: "Kartenhintergrund und Beschriftung",
    sourceGroupMapDetails: "Satellitenhintergrund: DWD-GeoServer Blue Marble. Städtenamen: OpenStreetMap über die Overpass API, 30 Tage zwischengespeichert.",
    sourceGroupMoon: "Mondphase",
    sourceGroupMoonDetails: "Lokal berechnet (Meeus); südlich des Äquators gespiegelt.",
    sourceLocalCalculation: "LOKALE BERECHNUNG",
    sourceRefreshInfo: "Aktualisierung alle {minutes} min, das DWD-Radar alle 5 min, gemeinsam für Widget und App. Letzte Aktualisierung: {updated}.",
    barPosition: "Position in der Leiste",
    barPositionLeft: "Links",
    barPositionCenter: "Mitte",
    barPositionRight: "Rechts",
    barPositionTop: "Oben",
    barPositionBottom: "Unten",
    barPositionHint: "Verschiebt das Widget innerhalb der Omarchy-Leiste.",
    barPositionMissing: "Das Widget ist nicht in der Leiste.",
    showAlways: "Immer",
    showOnHover: "Beim Überfahren",
    menubarHoverHint: "Einträge mit „Beim Überfahren“ erscheinen, solange der Mauszeiger auf dem Wetter in der Leiste ruht.",
    barBehavior: "Verhalten",
    openWidgetOnHover: "Widget beim Überfahren öffnen",
    openWidgetOnHoverHint: "Öffnet das Widget, wenn der Mauszeiger auf dem Wetter in der Leiste ruht, und schließt es, sobald er sich entfernt. Ein Klick hält es offen.",
    rainIntensity: "Regenintensität",
    showWhenRelevant: "Wenn relevant",
    menubarRelevantCurrentHint: "„Wenn relevant“ zeigt einen Eintrag nur, wenn er auffällt: gefühlte Temperatur 3° neben der Temperatur, Wind ab 20 km/h, UV ab 6.",
    menubarRelevantRainHint: "„Wenn relevant“: Wahrscheinlichkeit ab 30 %, Intensität solange es regnet, Regenbeginn innerhalb von zwei Stunden. Regenbeginn und Intensität nehmen den Platz der Wahrscheinlichkeit ein.",
    menubarRelevantAirHint: "„Wenn relevant“: Luftqualität ab „schlecht“, Pollen bei hoher Belastung.",
    kelvinUnits: "Kelvin",
    kelvinUnitsSummary: "K · mm · km/h · km",
    hoverUnitSystem: "Beim Überfahren andere Einheiten",
    hoverUnitSystemOff: "Aus",
    hoverUnitSystemHint: "Solange der Mauszeiger auf dem Widget ruht, wechselt die Leiste zu diesem Einheitensystem. Kelvin betrifft nur Temperaturen.",
    restoreOrder: "Reihenfolge zurücksetzen",
    sunNext: "Sonnenauf- / -untergang als Nächstes",
    sunrise: "Sonnenaufgang",
    sunset: "Sonnenuntergang",
    moonPhase: "Mondphase",
    moon: "Mond"
  }
}

// Keep this order in sync with every compact catalogue below. Provider names,
// unit summaries and numeric intensity ranges intentionally retain their
// language-neutral/brand spelling from the English base catalogue.
var localizedKeys = [
  "weather", "warningExtreme", "warningSevere", "warningModerate", "warningMinor",
  "effectiveNow", "untilFurtherNotice", "updating", "justNow", "minutesAgo", "hoursAgo",
  "today", "current", "now", "searchCity",
  "feelsLike", "wind", "humidity", "autoDetected", "fetchingForecast",
  "hourly", "daily", "forecast", "settings", "app", "widget", "menubar",
  "widgetSettings", "appSettings", "menubarSettings", "displaySettingsHint",
  "general", "unitSystem", "metricUnits", "imperialUnits", "time", "weekday",
  "weatherSymbol", "temperature", "feelsLikeTemperature", "currentWeather", "location",
  "precipitation", "weatherWarnings", "feelsLikeShort", "temperatureRange",
  "rainProbability", "rainAmount", "uvIndex", "sunriseSunset", "twoHourTotal", "defaultTab",
  "rainForecastTwoHours", "rainRadarPastTwoHours", "precipitationModelCurrent",
  "rain", "probability", "intensity", "rainNone", "rainWeak", "rainMedium", "rainStrong",
  "rainExtreme", "radar", "noRainExpected", "total", "noDataWaiting", "radarLoading",
  "noRadarData", "windMapSummary", "windDataLoading", "noWindData", "cachedDataNotice"
]

var languageMeta = {
  en: { locale: "en_US", directions: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] },
  de: { locale: "de_DE", directions: ["N", "NO", "O", "SO", "S", "SW", "W", "NW"] },
  es: { locale: "es_ES", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  fr: { locale: "fr_FR", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  pt: { locale: "pt_BR", directions: ["N", "NE", "L", "SE", "S", "SO", "O", "NO"] },
  ru: { locale: "ru_RU", directions: ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"] },
  uk: { locale: "uk_UA", directions: ["Пн", "ПнСх", "Сх", "ПдСх", "Пд", "ПдЗх", "Зх", "ПнЗх"] },
  pl: { locale: "pl_PL", directions: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] },
  it: { locale: "it_IT", directions: ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] },
  nl: { locale: "nl_NL", directions: ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"] },
  tr: { locale: "tr_TR", directions: ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] },
  cs: { locale: "cs_CZ", directions: ["S", "SV", "V", "JV", "J", "JZ", "Z", "SZ"] },
  sv: { locale: "sv_SE", directions: ["N", "NO", "O", "SO", "S", "SV", "V", "NV"] },
  fi: { locale: "fi_FI", directions: ["P", "KO", "I", "KA", "E", "LO", "L", "LU"] },
  nb: { locale: "nb_NO", directions: ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"] },
  da: { locale: "da_DK", directions: ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"] },
  ro: { locale: "ro_RO", directions: ["N", "NE", "E", "SE", "S", "SV", "V", "NV"] },
  hu: { locale: "hu_HU", directions: ["É", "ÉK", "K", "DK", "D", "DNy", "Ny", "ÉNy"] },
  el: { locale: "el_GR", directions: ["Β", "ΒΑ", "Α", "ΝΑ", "Ν", "ΝΔ", "Δ", "ΒΔ"] },
  zh_CN: { locale: "zh_CN", directions: ["北", "东北", "东", "东南", "南", "西南", "西", "西北"] },
  zh_TW: { locale: "zh_TW", directions: ["北", "東北", "東", "東南", "南", "西南", "西", "西北"] },
  ja: { locale: "ja_JP", directions: ["北", "北東", "東", "南東", "南", "南西", "西", "北西"] },
  ko: { locale: "ko_KR", directions: ["북", "북동", "동", "남동", "남", "남서", "서", "북서"] },
  ar: { locale: "ar_SA", rtl: true, directions: ["ش", "ش ق", "ق", "ج ق", "ج", "ج غ", "غ", "ش غ"] },
  he: { locale: "he_IL", rtl: true, directions: ["צ", "צמז", "מז", "דמז", "ד", "דמע", "מע", "צמע"] },
  fa: { locale: "fa_IR", rtl: true, directions: ["ش", "ش‌ق", "ق", "ج‌ق", "ج", "ج‌غ", "غ", "ش‌غ"] },
  hi: { locale: "hi_IN", directions: ["उ", "उपू", "पू", "दपू", "द", "दप", "प", "उप"] },
  id: { locale: "id_ID", directions: ["U", "TL", "T", "TG", "S", "BD", "B", "BL"] },
  vi: { locale: "vi_VN", directions: ["B", "ĐB", "Đ", "ĐN", "N", "TN", "T", "TB"] },
  th: { locale: "th_TH", directions: ["น", "ตอ.เฉียงเหนือ", "ตอ.", "ตอ.เฉียงใต้", "ใต้", "ตต.เฉียงใต้", "ตต.", "ตต.เฉียงเหนือ"] }
}

function addCompactCatalog(language, values) {
  var result = {}
  for (var i = 0; i < localizedKeys.length && i < values.length; ++i)
    result[localizedKeys[i]] = values[i]
  catalog[language] = result
}

addCompactCatalog("es", [
  "Tiempo", "EXTREMO", "GRAVE", "MODERADO", "LEVE", "vigente ahora", "hasta nuevo aviso", "actualizando…", "ahora mismo", "hace {count} min", "hace {count} h", "Hoy", "actual", "ahora", "Buscar ciudad",
  "SENSACIÓN", "Viento", "Humedad", "Detectado automáticamente", "Obteniendo pronóstico…", "POR HORAS", "DIARIO", "PRONÓSTICO", "Ajustes", "Aplicación", "Widget", "Barra de menú", "Ajustes del widget", "Ajustes de la aplicación", "Ajustes de la barra de menú", "Elige qué muestra la vista seleccionada.",
  "GENERAL", "Sistema de unidades", "Métrico", "EE. UU. / Imperial", "Hora", "Día de la semana", "Símbolo meteorológico", "Temperatura", "Sensación térmica", "TIEMPO ACTUAL", "Ubicación", "Precipitación", "Avisos meteorológicos", "Sens.", "Temperatura mín. / máx.", "Probabilidad de lluvia", "Cantidad de lluvia", "Índice UV", "Amanecer / atardecer", "Total de dos horas", "Pestaña de pronóstico predeterminada",
  "PRONÓSTICO DE LLUVIA · 2 HORAS", "RADAR DE LLUVIA · ÚLTIMAS 2 HORAS", "MODELO DE PRECIPITACIÓN · ACTUAL", "Lluvia", "Probabilidad", "Intensidad", "Sin lluvia", "Débil", "Moderada", "Fuerte", "Extrema", "Radar",
  "No se espera lluvia · {amount} {unit} / 2 h", "Total: {amount} {unit} / 2 h", "Sin datos; esperando actualización…", "Cargando mapa de radar…", "No hay datos de radar disponibles en esta ubicación", "{location} · {speed} {unit} desde {direction} · ráfagas {gust} {unit}", "Cargando datos de viento…", "No hay datos del modelo de viento", "Los valores en cursiva vienen de la caché (máx. 3 días)."
])

addCompactCatalog("fr", [
  "Météo", "EXTRÊME", "SÉVÈRE", "MODÉRÉE", "MINEURE", "en vigueur maintenant", "jusqu’à nouvel ordre", "actualisation…", "à l’instant", "il y a {count} min", "il y a {count} h", "Aujourd’hui", "actuel", "maintenant", "Rechercher une ville",
  "RESSENTI", "Vent", "Humidité", "Détecté automatiquement", "Chargement des prévisions…", "PAR HEURE", "QUOTIDIEN", "PRÉVISIONS", "Paramètres", "Application", "Widget", "Barre de menus", "Paramètres du widget", "Paramètres de l’application", "Paramètres de la barre de menus", "Choisissez ce qu’affiche la vue sélectionnée.",
  "GÉNÉRAL", "Système d’unités", "Métrique", "US / Impérial", "Heure", "Jour de la semaine", "Symbole météo", "Température", "Température ressentie", "MÉTÉO ACTUELLE", "Lieu", "Précipitations", "Alertes météo", "Ressenti", "Température min. / max.", "Probabilité de pluie", "Quantité de pluie", "Indice UV", "Lever / coucher du soleil", "Total sur deux heures", "Onglet de prévision par défaut",
  "PRÉVISION DE PLUIE · 2 HEURES", "RADAR DE PLUIE · 2 DERNIÈRES HEURES", "MODÈLE DE PRÉCIPITATIONS · ACTUEL", "Pluie", "Probabilité", "Intensité", "Pas de pluie", "Faible", "Modérée", "Forte", "Extrême", "Radar",
  "Aucune pluie prévue · {amount} {unit} / 2 h", "Total : {amount} {unit} / 2 h", "Aucune donnée – en attente d’actualisation…", "Chargement de la carte radar…", "Aucune donnée radar disponible à cet endroit", "{location} · {speed} {unit} de {direction} · rafales {gust} {unit}", "Chargement des données de vent…", "Aucune donnée de modèle de vent disponible", "Les valeurs en italique viennent du cache (3 jours max.)."
])

addCompactCatalog("pt", [
  "Tempo", "EXTREMO", "SEVERO", "MODERADO", "LEVE", "em vigor agora", "até novo aviso", "atualizando…", "agora mesmo", "há {count} min", "há {count} h", "Hoje", "atual", "agora", "Buscar cidade",
  "SENSAÇÃO", "Vento", "Umidade", "Detectado automaticamente", "Obtendo previsão…", "POR HORA", "DIÁRIO", "PREVISÃO", "Configurações", "Aplicativo", "Widget", "Barra de menu", "Configurações do widget", "Configurações do aplicativo", "Configurações da barra de menu", "Escolha o que a visualização selecionada mostra.",
  "GERAL", "Sistema de unidades", "Métrico", "EUA / Imperial", "Hora", "Dia da semana", "Símbolo do tempo", "Temperatura", "Sensação térmica", "TEMPO ATUAL", "Local", "Precipitação", "Alertas meteorológicos", "Sensação", "Temperatura mín. / máx.", "Probabilidade de chuva", "Volume de chuva", "Índice UV", "Nascer / pôr do sol", "Total de duas horas", "Aba de previsão padrão",
  "PREVISÃO DE CHUVA · 2 HORAS", "RADAR DE CHUVA · ÚLTIMAS 2 HORAS", "MODELO DE PRECIPITAÇÃO · ATUAL", "Chuva", "Probabilidade", "Intensidade", "Sem chuva", "Fraca", "Moderada", "Forte", "Extrema", "Radar",
  "Sem chuva prevista · {amount} {unit} / 2 h", "Total: {amount} {unit} / 2 h", "Sem dados – aguardando atualização…", "Carregando mapa do radar…", "Não há dados de radar disponíveis neste local", "{location} · {speed} {unit} de {direction} · rajadas {gust} {unit}", "Carregando dados de vento…", "Não há dados do modelo de vento", "Os valores em itálico vêm do cache (até 3 dias)."
])

addCompactCatalog("ru", [
  "Погода", "ЭКСТРЕМАЛЬНАЯ", "ОПАСНАЯ", "УМЕРЕННАЯ", "НЕЗНАЧИТЕЛЬНАЯ", "действует сейчас", "до дальнейшего уведомления", "обновление…", "только что", "{count} мин назад", "{count} ч назад", "Сегодня", "текущая", "сейчас", "Поиск города",
  "ОЩУЩАЕТСЯ", "Ветер", "Влажность", "Определено автоматически", "Загрузка прогноза…", "ПО ЧАСАМ", "ПО ДНЯМ", "ПРОГНОЗ", "Настройки", "Приложение", "Виджет", "Строка меню", "Настройки виджета", "Настройки приложения", "Настройки строки меню", "Выберите, что показывать в выбранном представлении.",
  "ОБЩИЕ", "Система единиц", "Метрическая", "США / Имперская", "Время", "День недели", "Значок погоды", "Температура", "Ощущаемая температура", "ТЕКУЩАЯ ПОГОДА", "Местоположение", "Осадки", "Предупреждения о погоде", "Ощущ.", "Мин. / макс. температура", "Вероятность дождя", "Количество осадков", "УФ-индекс", "Восход / закат", "Сумма за два часа", "Вкладка прогноза по умолчанию",
  "ПРОГНОЗ ДОЖДЯ · 2 ЧАСА", "РАДАР ОСАДКОВ · ПОСЛЕДНИЕ 2 ЧАСА", "МОДЕЛЬ ОСАДКОВ · ТЕКУЩАЯ", "Дождь", "Вероятность", "Интенсивность", "Без дождя", "Слабая", "Умеренная", "Сильная", "Экстремальная", "Радар",
  "Дождь не ожидается · {amount} {unit} / 2 ч", "Всего: {amount} {unit} / 2 ч", "Нет данных — ожидание обновления…", "Загрузка карты радара…", "Для этого места нет радиолокационных данных", "{location} · {speed} {unit}, направление {direction} · порывы {gust} {unit}", "Загрузка данных о ветре…", "Нет данных модели ветра", "Значения курсивом взяты из кэша (не старше 3 дней)."
])

addCompactCatalog("uk", [
  "Погода", "ЕКСТРЕМАЛЬНА", "НЕБЕЗПЕЧНА", "ПОМІРНА", "НЕЗНАЧНА", "діє зараз", "до подальшого повідомлення", "оновлення…", "щойно", "{count} хв тому", "{count} год тому", "Сьогодні", "поточна", "зараз", "Пошук міста",
  "ВІДЧУВАЄТЬСЯ", "Вітер", "Вологість", "Визначено автоматично", "Завантаження прогнозу…", "ЩОГОДИНИ", "ЩОДНЯ", "ПРОГНОЗ", "Налаштування", "Застосунок", "Віджет", "Панель меню", "Налаштування віджета", "Налаштування застосунку", "Налаштування панелі меню", "Виберіть, що показувати у вибраному поданні.",
  "ЗАГАЛЬНІ", "Система одиниць", "Метрична", "США / Імперська", "Час", "День тижня", "Символ погоди", "Температура", "Відчутна температура", "ПОТОЧНА ПОГОДА", "Розташування", "Опади", "Попередження про погоду", "Відч.", "Мін. / макс. температура", "Імовірність дощу", "Кількість опадів", "УФ-індекс", "Схід / захід сонця", "Сума за дві години", "Типова вкладка прогнозу",
  "ПРОГНОЗ ДОЩУ · 2 ГОДИНИ", "РАДАР ОПАДІВ · ОСТАННІ 2 ГОДИНИ", "МОДЕЛЬ ОПАДІВ · ПОТОЧНА", "Дощ", "Імовірність", "Інтенсивність", "Без дощу", "Слабка", "Помірна", "Сильна", "Екстремальна", "Радар",
  "Дощ не очікується · {amount} {unit} / 2 год", "Усього: {amount} {unit} / 2 год", "Немає даних — очікування оновлення…", "Завантаження карти радара…", "Для цього місця немає радарних даних", "{location} · {speed} {unit} з {direction} · пориви {gust} {unit}", "Завантаження даних про вітер…", "Немає даних моделі вітру", "Значення курсивом узято з кешу (не старше 3 днів)."
])

addCompactCatalog("pl", [
  "Pogoda", "EKSTREMALNE", "POWAŻNE", "UMIARKOWANE", "NIEWIELKIE", "obowiązuje teraz", "do odwołania", "aktualizowanie…", "przed chwilą", "{count} min temu", "{count} godz. temu", "Dzisiaj", "bieżące", "teraz", "Szukaj miasta",
  "ODCZUWALNA", "Wiatr", "Wilgotność", "Wykryto automatycznie", "Pobieranie prognozy…", "GODZINOWO", "DZIENNIE", "PROGNOZA", "Ustawienia", "Aplikacja", "Widżet", "Pasek menu", "Ustawienia widżetu", "Ustawienia aplikacji", "Ustawienia paska menu", "Wybierz, co ma pokazywać wybrany widok.",
  "OGÓLNE", "System jednostek", "Metryczny", "USA / Imperialny", "Czas", "Dzień tygodnia", "Symbol pogody", "Temperatura", "Temperatura odczuwalna", "AKTUALNA POGODA", "Położenie", "Opady", "Ostrzeżenia pogodowe", "Odczuw.", "Temperatura min. / maks.", "Prawdopodobieństwo deszczu", "Suma opadów", "Indeks UV", "Wschód / zachód słońca", "Suma dwugodzinna", "Domyślna karta prognozy",
  "PROGNOZA DESZCZU · 2 GODZINY", "RADAR OPADÓW · OSTATNIE 2 GODZINY", "MODEL OPADÓW · BIEŻĄCY", "Deszcz", "Prawdopodobieństwo", "Natężenie", "Bez deszczu", "Słabe", "Umiarkowane", "Silne", "Ekstremalne", "Radar",
  "Brak spodziewanego deszczu · {amount} {unit} / 2 godz.", "Suma: {amount} {unit} / 2 godz.", "Brak danych — oczekiwanie na odświeżenie…", "Ładowanie mapy radarowej…", "Brak danych radarowych dla tej lokalizacji", "{location} · {speed} {unit} z {direction} · porywy {gust} {unit}", "Ładowanie danych o wietrze…", "Brak danych modelu wiatru", "Wartości kursywą pochodzą z pamięci podręcznej (do 3 dni)."
])

addCompactCatalog("it", [
  "Meteo", "ESTREMA", "GRAVE", "MODERATA", "MINORE", "in vigore ora", "fino a nuovo avviso", "aggiornamento…", "proprio ora", "{count} min fa", "{count} h fa", "Oggi", "attuale", "ora", "Cerca città",
  "PERCEPITA", "Vento", "Umidità", "Rilevato automaticamente", "Caricamento previsioni…", "ORARIE", "GIORNALIERE", "PREVISIONI", "Impostazioni", "App", "Widget", "Barra dei menu", "Impostazioni widget", "Impostazioni app", "Impostazioni barra dei menu", "Scegli cosa mostra la vista selezionata.",
  "GENERALI", "Sistema di unità", "Metrico", "USA / Imperiale", "Ora", "Giorno della settimana", "Simbolo meteo", "Temperatura", "Temperatura percepita", "METEO ATTUALE", "Posizione", "Precipitazioni", "Avvisi meteo", "Percepita", "Temperatura min. / max.", "Probabilità di pioggia", "Quantità di pioggia", "Indice UV", "Alba / tramonto", "Totale di due ore", "Scheda previsioni predefinita",
  "PREVISIONE PIOGGIA · 2 ORE", "RADAR PIOGGIA · ULTIME 2 ORE", "MODELLO PRECIPITAZIONI · ATTUALE", "Pioggia", "Probabilità", "Intensità", "Nessuna pioggia", "Debole", "Moderata", "Forte", "Estrema", "Radar",
  "Nessuna pioggia prevista · {amount} {unit} / 2 h", "Totale: {amount} {unit} / 2 h", "Nessun dato — in attesa di aggiornamento…", "Caricamento mappa radar…", "Nessun dato radar disponibile in questa posizione", "{location} · {speed} {unit} da {direction} · raffiche {gust} {unit}", "Caricamento dati del vento…", "Nessun dato del modello del vento", "I valori in corsivo vengono dalla cache (max 3 giorni)."
])

addCompactCatalog("nl", [
  "Weer", "EXTREEM", "ERNSTIG", "MATIG", "LICHT", "nu van kracht", "tot nader order", "bijwerken…", "zojuist", "{count} min geleden", "{count} u geleden", "Vandaag", "actueel", "nu", "Stad zoeken",
  "GEVOELSTEMPERATUUR", "Wind", "Luchtvochtigheid", "Automatisch gedetecteerd", "Voorspelling ophalen…", "PER UUR", "DAGELIJKS", "VOORSPELLING", "Instellingen", "App", "Widget", "Menubalk", "Widgetinstellingen", "App-instellingen", "Menubalkinstellingen", "Kies wat de geselecteerde weergave toont.",
  "ALGEMEEN", "Eenhedenstelsel", "Metrisch", "VS / Imperiaal", "Tijd", "Weekdag", "Weersymbool", "Temperatuur", "Gevoelstemperatuur", "HUIDIG WEER", "Locatie", "Neerslag", "Weerwaarschuwingen", "Gevoel", "Min. / max. temperatuur", "Kans op regen", "Hoeveelheid regen", "UV-index", "Zonsopkomst / zonsondergang", "Totaal over twee uur", "Standaardtabblad voorspelling",
  "REGENVERWACHTING · 2 UUR", "REGENRADAR · AFGELOPEN 2 UUR", "NEERSLAGMODEL · ACTUEEL", "Regen", "Kans", "Intensiteit", "Geen regen", "Licht", "Matig", "Zwaar", "Extreem", "Radar",
  "Geen regen verwacht · {amount} {unit} / 2 u", "Totaal: {amount} {unit} / 2 u", "Geen gegevens — wachten op vernieuwing…", "Radarkaart wordt geladen…", "Geen radargegevens beschikbaar op deze locatie", "{location} · {speed} {unit} uit {direction} · windstoten {gust} {unit}", "Windgegevens worden geladen…", "Geen windmodelgegevens beschikbaar", "Cursieve waarden komen uit de cache (max. 3 dagen)."
])

addCompactCatalog("tr", [
  "Hava Durumu", "AŞIRI", "CİDDİ", "ORTA", "HAFİF", "şimdi geçerli", "ikinci bir duyuruya kadar", "güncelleniyor…", "az önce", "{count} dk önce", "{count} sa önce", "Bugün", "güncel", "şimdi", "Şehir ara",
  "HİSSEDİLEN", "Rüzgâr", "Nem", "Otomatik algılandı", "Tahmin alınıyor…", "SAATLİK", "GÜNLÜK", "TAHMİN", "Ayarlar", "Uygulama", "Bileşen", "Menü çubuğu", "Bileşen ayarları", "Uygulama ayarları", "Menü çubuğu ayarları", "Seçili görünümde nelerin gösterileceğini seçin.",
  "GENEL", "Birim sistemi", "Metrik", "ABD / İngiliz", "Saat", "Haftanın günü", "Hava durumu simgesi", "Sıcaklık", "Hissedilen sıcaklık", "GÜNCEL HAVA", "Konum", "Yağış", "Hava durumu uyarıları", "Hissedilen", "Min. / maks. sıcaklık", "Yağmur olasılığı", "Yağmur miktarı", "UV indeksi", "Gün doğumu / gün batımı", "İki saatlik toplam", "Varsayılan tahmin sekmesi",
  "YAĞMUR TAHMİNİ · 2 SAAT", "YAĞMUR RADARI · SON 2 SAAT", "YAĞIŞ MODELİ · GÜNCEL", "Yağmur", "Olasılık", "Yoğunluk", "Yağmur yok", "Hafif", "Orta", "Şiddetli", "Aşırı", "Radar",
  "Yağmur beklenmiyor · {amount} {unit} / 2 sa", "Toplam: {amount} {unit} / 2 sa", "Veri yok — yenileme bekleniyor…", "Radar haritası yükleniyor…", "Bu konumda radar verisi yok", "{location} · {direction} yönünden {speed} {unit} · hamleler {gust} {unit}", "Rüzgâr verileri yükleniyor…", "Rüzgâr modeli verisi yok", "İtalik değerler önbellekten gelir (en fazla 3 günlük)."
])

addCompactCatalog("cs", [
  "Počasí", "EXTRÉMNÍ", "VÁŽNÉ", "MÍRNÉ", "MALÉ", "platí nyní", "do odvolání", "aktualizace…", "právě teď", "před {count} min", "před {count} h", "Dnes", "aktuální", "nyní", "Hledat město",
  "POCITOVĚ", "Vítr", "Vlhkost", "Zjištěno automaticky", "Načítání předpovědi…", "HODINOVĚ", "DENNĚ", "PŘEDPOVĚĎ", "Nastavení", "Aplikace", "Widget", "Panel nabídky", "Nastavení widgetu", "Nastavení aplikace", "Nastavení panelu nabídky", "Vyberte, co se má ve zvoleném zobrazení ukázat.",
  "OBECNÉ", "Systém jednotek", "Metrické", "USA / Imperiální", "Čas", "Den v týdnu", "Symbol počasí", "Teplota", "Pocitová teplota", "AKTUÁLNÍ POČASÍ", "Poloha", "Srážky", "Výstrahy počasí", "Pocitově", "Min. / max. teplota", "Pravděpodobnost deště", "Množství srážek", "UV index", "Východ / západ slunce", "Úhrn za dvě hodiny", "Výchozí karta předpovědi",
  "PŘEDPOVĚĎ DEŠTĚ · 2 HODINY", "SRÁŽKOVÝ RADAR · POSLEDNÍ 2 HODINY", "MODEL SRÁŽEK · AKTUÁLNÍ", "Déšť", "Pravděpodobnost", "Intenzita", "Bez deště", "Slabá", "Mírná", "Silná", "Extrémní", "Radar",
  "Déšť se neočekává · {amount} {unit} / 2 h", "Celkem: {amount} {unit} / 2 h", "Žádná data — čeká se na obnovení…", "Načítání radarové mapy…", "Pro tuto polohu nejsou dostupná radarová data", "{location} · {speed} {unit} ze směru {direction} · nárazy {gust} {unit}", "Načítání dat o větru…", "Nejsou dostupná data modelu větru", "Hodnoty kurzívou pocházejí z mezipaměti (max. 3 dny)."
])

addCompactCatalog("sv", [
  "Väder", "EXTREM", "ALLVARLIG", "MÅTTLIG", "MINDRE", "gäller nu", "tills vidare", "uppdaterar…", "just nu", "för {count} min sedan", "för {count} tim sedan", "I dag", "aktuell", "nu", "Sök stad",
  "KÄNNS SOM", "Vind", "Luftfuktighet", "Identifierad automatiskt", "Hämtar prognos…", "PER TIMME", "DAGLIG", "PROGNOS", "Inställningar", "App", "Widget", "Menyrad", "Widgetinställningar", "Appinställningar", "Menyradsinställningar", "Välj vad den valda vyn visar.",
  "ALLMÄNT", "Enhetssystem", "Metriskt", "USA / Brittiskt", "Tid", "Veckodag", "Vädersymbol", "Temperatur", "Känns som-temperatur", "AKTUELLT VÄDER", "Plats", "Nederbörd", "Vädervarningar", "Känns", "Min. / max. temperatur", "Sannolikhet för regn", "Regnmängd", "UV-index", "Soluppgång / solnedgång", "Totalt för två timmar", "Standardflik för prognos",
  "REGNPROGNOS · 2 TIMMAR", "REGNRADAR · SENASTE 2 TIMMARNA", "NEDERBÖRDSMODELL · AKTUELL", "Regn", "Sannolikhet", "Intensitet", "Inget regn", "Lätt", "Måttligt", "Kraftigt", "Extremt", "Radar",
  "Inget regn väntas · {amount} {unit} / 2 tim", "Totalt: {amount} {unit} / 2 tim", "Inga data — väntar på uppdatering…", "Radarkartan laddas…", "Inga radardata finns för den här platsen", "{location} · {speed} {unit} från {direction} · byar {gust} {unit}", "Vinddata laddas…", "Inga vindmodelldata finns", "Kursiva värden kommer från cachen (max 3 dagar)."
])

addCompactCatalog("fi", [
  "Sää", "ÄÄRIMMÄINEN", "VAKAVA", "KOHTALAINEN", "VÄHÄINEN", "voimassa nyt", "toistaiseksi", "päivitetään…", "juuri nyt", "{count} min sitten", "{count} t sitten", "Tänään", "nykyinen", "nyt", "Hae kaupunkia",
  "TUNTUU KUIN", "Tuuli", "Kosteus", "Tunnistettu automaattisesti", "Haetaan ennustetta…", "TUNNEITTAIN", "PÄIVITTÄIN", "ENNUSTE", "Asetukset", "Sovellus", "Pienoissovellus", "Valikkorivi", "Pienoissovelluksen asetukset", "Sovelluksen asetukset", "Valikkorivin asetukset", "Valitse, mitä valittu näkymä näyttää.",
  "YLEISET", "Yksikköjärjestelmä", "Metrinen", "Yhdysvaltalainen / Imperiaalinen", "Aika", "Viikonpäivä", "Sääsymboli", "Lämpötila", "Tuntuu kuin -lämpötila", "NYKYINEN SÄÄ", "Sijainti", "Sademäärä", "Säävaroitukset", "Tuntuu", "Min. / maks. lämpötila", "Sateen todennäköisyys", "Sademäärä", "UV-indeksi", "Auringonnousu / -lasku", "Kahden tunnin summa", "Ennusteen oletusvälilehti",
  "SADE-ENNUSTE · 2 TUNTIA", "SADETUTKA · VIIMEISET 2 TUNTIA", "SADEMALLI · NYKYINEN", "Sade", "Todennäköisyys", "Voimakkuus", "Ei sadetta", "Heikko", "Kohtalainen", "Voimakas", "Äärimmäinen", "Tutka",
  "Sadetta ei odoteta · {amount} {unit} / 2 t", "Yhteensä: {amount} {unit} / 2 t", "Ei tietoja — odotetaan päivitystä…", "Tutkakarttaa ladataan…", "Tutkatietoja ei ole saatavilla tässä sijainnissa", "{location} · {speed} {unit} suunnasta {direction} · puuskat {gust} {unit}", "Tuulitietoja ladataan…", "Tuulimallin tietoja ei ole saatavilla", "Kursivoidut arvot ovat välimuistista (enintään 3 päivää)."
])

addCompactCatalog("nb", [
  "Vær", "EKSTREM", "ALVORLIG", "MODERAT", "MINDRE", "gjelder nå", "inntil videre", "oppdaterer…", "akkurat nå", "for {count} min siden", "for {count} t siden", "I dag", "gjeldende", "nå", "Søk etter by",
  "FØLES SOM", "Vind", "Luftfuktighet", "Oppdaget automatisk", "Henter værmelding…", "TIME FOR TIME", "DAGLIG", "VÆRMELDING", "Innstillinger", "App", "Miniprogram", "Menylinje", "Innstillinger for miniprogram", "Appinnstillinger", "Innstillinger for menylinje", "Velg hva den valgte visningen skal vise.",
  "GENERELT", "Enhetssystem", "Metrisk", "USA / Britisk", "Tid", "Ukedag", "Værsymbol", "Temperatur", "Følt temperatur", "VÆRET NÅ", "Sted", "Nedbør", "Værvarsler", "Føles", "Min. / maks. temperatur", "Sannsynlighet for regn", "Regnmengde", "UV-indeks", "Soloppgang / solnedgang", "Totalt for to timer", "Standardfane for værmelding",
  "REGNVARSEL · 2 TIMER", "REGNRADAR · SISTE 2 TIMER", "NEDBØRSMODELL · NÅ", "Regn", "Sannsynlighet", "Intensitet", "Ingen regn", "Lett", "Moderat", "Kraftig", "Ekstrem", "Radar",
  "Ingen regn forventet · {amount} {unit} / 2 t", "Totalt: {amount} {unit} / 2 t", "Ingen data — venter på oppdatering…", "Radarkartet lastes…", "Ingen radardata er tilgjengelig for dette stedet", "{location} · {speed} {unit} fra {direction} · vindkast {gust} {unit}", "Vinddata lastes…", "Ingen vindmodelldata er tilgjengelig", "Kursive verdier kommer fra bufferen (maks. 3 dager)."
])

addCompactCatalog("da", [
  "Vejr", "EKSTREM", "ALVORLIG", "MODERAT", "MINDRE", "gælder nu", "indtil videre", "opdaterer…", "lige nu", "for {count} min siden", "for {count} t siden", "I dag", "aktuel", "nu", "Søg efter by",
  "FØLES SOM", "Vind", "Luftfugtighed", "Registreret automatisk", "Henter vejrudsigt…", "TIME FOR TIME", "DAGLIG", "VEJRUDSIGT", "Indstillinger", "App", "Widget", "Menulinje", "Widgetindstillinger", "Appindstillinger", "Indstillinger for menulinje", "Vælg, hvad den valgte visning skal vise.",
  "GENERELT", "Enhedssystem", "Metrisk", "USA / Britisk", "Tid", "Ugedag", "Vejrsymbol", "Temperatur", "Føles som-temperatur", "AKTUELT VEJR", "Placering", "Nedbør", "Vejrvarsler", "Føles", "Min. / maks. temperatur", "Sandsynlighed for regn", "Regnmængde", "UV-indeks", "Solopgang / solnedgang", "Total for to timer", "Standardfane for vejrudsigt",
  "REGNPROGNOSE · 2 TIMER", "REGNRADAR · SENESTE 2 TIMER", "NEDBØRSMODEL · AKTUEL", "Regn", "Sandsynlighed", "Intensitet", "Ingen regn", "Let", "Moderat", "Kraftig", "Ekstrem", "Radar",
  "Ingen regn forventet · {amount} {unit} / 2 t", "Total: {amount} {unit} / 2 t", "Ingen data — venter på opdatering…", "Radarkortet indlæses…", "Ingen radardata er tilgængelige for denne placering", "{location} · {speed} {unit} fra {direction} · vindstød {gust} {unit}", "Vinddata indlæses…", "Ingen vindmodeldata er tilgængelige", "Kursive værdier kommer fra cachen (maks. 3 dage)."
])

addCompactCatalog("ro", [
  "Vreme", "EXTREM", "SEVER", "MODERAT", "MINOR", "în vigoare acum", "până la noi informații", "se actualizează…", "chiar acum", "acum {count} min", "acum {count} h", "Astăzi", "actual", "acum", "Caută oraș",
  "SE SIMTE CA", "Vânt", "Umiditate", "Detectat automat", "Se preia prognoza…", "ORAR", "ZILNIC", "PROGNOZĂ", "Setări", "Aplicație", "Widget", "Bară de meniu", "Setări widget", "Setări aplicație", "Setări bară de meniu", "Alegeți ce afișează vizualizarea selectată.",
  "GENERAL", "Sistem de unități", "Metric", "SUA / Imperial", "Ora", "Ziua săptămânii", "Simbol meteo", "Temperatură", "Temperatură resimțită", "VREMEA ACTUALĂ", "Locație", "Precipitații", "Avertizări meteo", "Resimțită", "Temperatura min. / max.", "Probabilitate de ploaie", "Cantitate de ploaie", "Indice UV", "Răsărit / apus", "Total pe două ore", "Fila implicită de prognoză",
  "PROGNOZĂ PLOAIE · 2 ORE", "RADAR PLOAIE · ULTIMELE 2 ORE", "MODEL PRECIPITAȚII · ACTUAL", "Ploaie", "Probabilitate", "Intensitate", "Fără ploaie", "Slabă", "Moderată", "Puternică", "Extremă", "Radar",
  "Nu se așteaptă ploaie · {amount} {unit} / 2 h", "Total: {amount} {unit} / 2 h", "Nu există date — se așteaptă reîmprospătarea…", "Se încarcă harta radar…", "Nu există date radar pentru această locație", "{location} · {speed} {unit} din {direction} · rafale {gust} {unit}", "Se încarcă datele despre vânt…", "Nu există date ale modelului de vânt", "Valorile cursive provin din cache (max. 3 zile)."
])

addCompactCatalog("hu", [
  "Időjárás", "RENDKÍVÜLI", "SÚLYOS", "MÉRSÉKELT", "ENYHE", "most érvényes", "további értesítésig", "frissítés…", "éppen most", "{count} perce", "{count} órája", "Ma", "aktuális", "most", "Város keresése",
  "HŐÉRZET", "Szél", "Páratartalom", "Automatikusan észlelve", "Előrejelzés lekérése…", "ÓRÁNKÉNT", "NAPONTA", "ELŐREJELZÉS", "Beállítások", "Alkalmazás", "Minialkalmazás", "Menüsáv", "Minialkalmazás beállításai", "Alkalmazásbeállítások", "Menüsáv beállításai", "Válassza ki, mit mutasson a kijelölt nézet.",
  "ÁLTALÁNOS", "Mértékegységrendszer", "Metrikus", "USA / Angolszász", "Idő", "A hét napja", "Időjárási szimbólum", "Hőmérséklet", "Hőérzet", "AKTUÁLIS IDŐJÁRÁS", "Hely", "Csapadék", "Időjárási figyelmeztetések", "Hőérzet", "Min. / max. hőmérséklet", "Eső valószínűsége", "Csapadékmennyiség", "UV-index", "Napkelte / napnyugta", "Kétórás összeg", "Alapértelmezett előrejelzési lap",
  "ESŐ-ELŐREJELZÉS · 2 ÓRA", "CSAPADÉKRADAR · ELMÚLT 2 ÓRA", "CSAPADÉKMODELL · AKTUÁLIS", "Eső", "Valószínűség", "Intenzitás", "Nincs eső", "Gyenge", "Mérsékelt", "Erős", "Rendkívüli", "Radar",
  "Nem várható eső · {amount} {unit} / 2 ó", "Összesen: {amount} {unit} / 2 ó", "Nincs adat — várakozás a frissítésre…", "A radartérkép betöltése…", "Ehhez a helyhez nem érhetők el radaradatok", "{location} · {speed} {unit}, irány: {direction} · széllökések {gust} {unit}", "Széladatok betöltése…", "Nem érhetők el szélmodell-adatok", "A dőlt értékek a gyorsítótárból származnak (max. 3 napos)."
])

addCompactCatalog("el", [
  "Καιρός", "ΑΚΡΑΙΟ", "ΣΟΒΑΡΟ", "ΜΕΤΡΙΟ", "ΗΠΙΟ", "ισχύει τώρα", "μέχρι νεωτέρας", "ενημέρωση…", "μόλις τώρα", "πριν από {count} λεπ.", "πριν από {count} ώρ.", "Σήμερα", "τρέχον", "τώρα", "Αναζήτηση πόλης",
  "ΑΙΣΘΗΣΗ", "Άνεμος", "Υγρασία", "Αυτόματος εντοπισμός", "Λήψη πρόγνωσης…", "ΑΝΑ ΩΡΑ", "ΗΜΕΡΗΣΙΑ", "ΠΡΟΓΝΩΣΗ", "Ρυθμίσεις", "Εφαρμογή", "Γραφικό στοιχείο", "Γραμμή μενού", "Ρυθμίσεις γραφικού στοιχείου", "Ρυθμίσεις εφαρμογής", "Ρυθμίσεις γραμμής μενού", "Επιλέξτε τι εμφανίζει η επιλεγμένη προβολή.",
  "ΓΕΝΙΚΑ", "Σύστημα μονάδων", "Μετρικό", "ΗΠΑ / Αυτοκρατορικό", "Ώρα", "Ημέρα εβδομάδας", "Σύμβολο καιρού", "Θερμοκρασία", "Αισθητή θερμοκρασία", "ΤΡΕΧΩΝ ΚΑΙΡΟΣ", "Τοποθεσία", "Υετός", "Προειδοποιήσεις καιρού", "Αίσθηση", "Ελάχ. / μέγ. θερμοκρασία", "Πιθανότητα βροχής", "Ποσότητα βροχής", "Δείκτης UV", "Ανατολή / δύση ηλίου", "Σύνολο δύο ωρών", "Προεπιλεγμένη καρτέλα πρόγνωσης",
  "ΠΡΟΓΝΩΣΗ ΒΡΟΧΗΣ · 2 ΩΡΕΣ", "ΡΑΝΤΑΡ ΒΡΟΧΗΣ · ΤΕΛΕΥΤΑΙΕΣ 2 ΩΡΕΣ", "ΜΟΝΤΕΛΟ ΥΕΤΟΥ · ΤΡΕΧΟΝ", "Βροχή", "Πιθανότητα", "Ένταση", "Χωρίς βροχή", "Ασθενής", "Μέτρια", "Ισχυρή", "Ακραία", "Ραντάρ",
  "Δεν αναμένεται βροχή · {amount} {unit} / 2 ώρ.", "Σύνολο: {amount} {unit} / 2 ώρ.", "Δεν υπάρχουν δεδομένα — αναμονή ανανέωσης…", "Φόρτωση χάρτη ραντάρ…", "Δεν υπάρχουν δεδομένα ραντάρ σε αυτή την τοποθεσία", "{location} · {speed} {unit} από {direction} · ριπές {gust} {unit}", "Φόρτωση δεδομένων ανέμου…", "Δεν υπάρχουν δεδομένα μοντέλου ανέμου", "Οι πλάγιες τιμές είναι από την προσωρινή μνήμη (έως 3 ημέρες)."
])

addCompactCatalog("zh_CN", [
  "天气", "极端", "严重", "中等", "轻微", "当前生效", "直至另行通知", "正在更新…", "刚刚", "{count} 分钟前", "{count} 小时前", "今天", "当前", "现在", "搜索城市",
  "体感", "风", "湿度", "自动检测", "正在获取预报…", "每小时", "每日", "预报", "设置", "应用", "小组件", "菜单栏", "小组件设置", "应用设置", "菜单栏设置", "选择当前视图显示的内容。",
  "通用", "单位制", "公制", "美国 / 英制", "时间", "星期", "天气图标", "温度", "体感温度", "当前天气", "位置", "降水", "天气预警", "体感", "最低 / 最高温度", "降雨概率", "降雨量", "紫外线指数", "日出 / 日落", "两小时总量", "默认预报标签页",
  "降雨预报 · 2 小时", "降雨雷达 · 过去 2 小时", "降水模型 · 当前", "降雨", "概率", "强度", "无降雨", "小雨", "中雨", "大雨", "极端", "雷达",
  "预计无降雨 · {amount} {unit} / 2 小时", "总计：{amount} {unit} / 2 小时", "暂无数据——等待刷新…", "正在加载雷达图…", "此位置没有可用的雷达数据", "{location} · {direction}风 {speed} {unit} · 阵风 {gust} {unit}", "正在加载风力数据…", "没有可用的风力模型数据", "斜体数值来自缓存（最长 3 天）。"
])

addCompactCatalog("zh_TW", [
  "天氣", "極端", "嚴重", "中等", "輕微", "目前生效", "直至另行通知", "正在更新…", "剛剛", "{count} 分鐘前", "{count} 小時前", "今天", "目前", "現在", "搜尋城市",
  "體感", "風", "濕度", "自動偵測", "正在取得預報…", "每小時", "每日", "預報", "設定", "應用程式", "小工具", "選單列", "小工具設定", "應用程式設定", "選單列設定", "選擇目前檢視要顯示的內容。",
  "一般", "單位制", "公制", "美制 / 英制", "時間", "星期", "天氣圖示", "溫度", "體感溫度", "目前天氣", "位置", "降水", "天氣警報", "體感", "最低 / 最高溫度", "降雨機率", "降雨量", "紫外線指數", "日出 / 日落", "兩小時總量", "預設預報分頁",
  "降雨預報 · 2 小時", "降雨雷達 · 過去 2 小時", "降水模型 · 目前", "降雨", "機率", "強度", "無降雨", "小雨", "中雨", "大雨", "極端", "雷達",
  "預計無降雨 · {amount} {unit} / 2 小時", "總計：{amount} {unit} / 2 小時", "沒有資料——等待重新整理…", "正在載入雷達圖…", "此位置沒有可用的雷達資料", "{location} · {direction}風 {speed} {unit} · 陣風 {gust} {unit}", "正在載入風力資料…", "沒有可用的風力模型資料", "斜體數值來自快取（最長 3 天）。"
])

addCompactCatalog("ja", [
  "天気", "極端", "重大", "中程度", "軽度", "現在有効", "追って通知があるまで", "更新中…", "たった今", "{count}分前", "{count}時間前", "今日", "現在", "今", "都市を検索",
  "体感", "風", "湿度", "自動検出", "予報を取得中…", "1時間ごと", "毎日", "予報", "設定", "アプリ", "ウィジェット", "メニューバー", "ウィジェット設定", "アプリ設定", "メニューバー設定", "選択した表示に出す項目を選びます。",
  "一般", "単位系", "メートル法", "米国 / ヤード・ポンド法", "時刻", "曜日", "天気記号", "気温", "体感温度", "現在の天気", "場所", "降水", "気象警報", "体感", "最低 / 最高気温", "降水確率", "降水量", "UV指数", "日の出 / 日の入り", "2時間合計", "既定の予報タブ",
  "降雨予報 · 2時間", "雨雲レーダー · 過去2時間", "降水モデル · 現在", "雨", "確率", "強度", "雨なし", "弱い", "中程度", "強い", "極端", "レーダー",
  "雨の予報はありません · {amount} {unit} / 2時間", "合計：{amount} {unit} / 2時間", "データなし — 更新を待っています…", "レーダーマップを読み込み中…", "この場所ではレーダーデータを利用できません", "{location} · {direction}から {speed} {unit} · 最大瞬間風速 {gust} {unit}", "風データを読み込み中…", "風モデルデータを利用できません", "斜体の値はキャッシュから（最大3日）。"
])

addCompactCatalog("ko", [
  "날씨", "극심", "심각", "보통", "경미", "현재 발효 중", "추후 공지 시까지", "업데이트 중…", "방금", "{count}분 전", "{count}시간 전", "오늘", "현재", "지금", "도시 검색",
  "체감", "바람", "습도", "자동 감지", "예보 가져오는 중…", "시간별", "일별", "예보", "설정", "앱", "위젯", "메뉴 모음", "위젯 설정", "앱 설정", "메뉴 모음 설정", "선택한 보기에 표시할 항목을 선택하세요.",
  "일반", "단위 체계", "미터법", "미국 / 야드파운드법", "시간", "요일", "날씨 기호", "기온", "체감 온도", "현재 날씨", "위치", "강수", "기상 경보", "체감", "최저 / 최고 기온", "비 올 확률", "강수량", "자외선 지수", "일출 / 일몰", "2시간 합계", "기본 예보 탭",
  "강수 예보 · 2시간", "강우 레이더 · 지난 2시간", "강수 모델 · 현재", "비", "확률", "강도", "비 없음", "약함", "보통", "강함", "극심", "레이더",
  "비가 예상되지 않음 · {amount} {unit} / 2시간", "합계: {amount} {unit} / 2시간", "데이터 없음 — 새로 고침 대기 중…", "레이더 지도 로드 중…", "이 위치에는 레이더 데이터가 없습니다", "{location} · {direction}에서 {speed} {unit} · 돌풍 {gust} {unit}", "바람 데이터 로드 중…", "바람 모델 데이터가 없습니다", "기울임꼴 값은 캐시에서 가져온 것입니다(최대 3일)."
])

addCompactCatalog("ar", [
  "الطقس", "قصوى", "شديدة", "متوسطة", "طفيفة", "ساري الآن", "حتى إشعار آخر", "جارٍ التحديث…", "الآن", "منذ {count} د", "منذ {count} س", "اليوم", "الحالي", "الآن", "البحث عن مدينة",
  "المحسوسة", "الرياح", "الرطوبة", "تم الاكتشاف تلقائيًا", "جارٍ جلب التوقعات…", "كل ساعة", "يومي", "التوقعات", "الإعدادات", "التطبيق", "الأداة", "شريط القوائم", "إعدادات الأداة", "إعدادات التطبيق", "إعدادات شريط القوائم", "اختر ما تعرضه الواجهة المحددة.",
  "عام", "نظام الوحدات", "متري", "أمريكي / إمبراطوري", "الوقت", "يوم الأسبوع", "رمز الطقس", "درجة الحرارة", "درجة الحرارة المحسوسة", "الطقس الحالي", "الموقع", "الهطول", "تحذيرات الطقس", "المحسوسة", "درجة الحرارة الصغرى / العظمى", "احتمال المطر", "كمية المطر", "مؤشر الأشعة فوق البنفسجية", "الشروق / الغروب", "مجموع ساعتين", "علامة تبويب التوقعات الافتراضية",
  "توقع المطر · ساعتان", "رادار المطر · آخر ساعتين", "نموذج الهطول · الحالي", "المطر", "الاحتمال", "الشدة", "لا مطر", "خفيفة", "متوسطة", "غزيرة", "قصوى", "الرادار",
  "لا يُتوقع هطول مطر · {amount} {unit} / ساعتين", "المجموع: {amount} {unit} / ساعتين", "لا توجد بيانات — في انتظار التحديث…", "جارٍ تحميل خريطة الرادار…", "لا تتوفر بيانات رادار لهذا الموقع", "{location} · {speed} {unit} من {direction} · هبّات {gust} {unit}", "جارٍ تحميل بيانات الرياح…", "لا تتوفر بيانات نموذج الرياح", "القيم المائلة من الذاكرة المؤقتة (حتى 3 أيام)."
])

addCompactCatalog("he", [
  "מזג אוויר", "קיצונית", "חמורה", "בינונית", "קלה", "בתוקף כעת", "עד להודעה חדשה", "מתעדכן…", "ממש עכשיו", "לפני {count} דק׳", "לפני {count} שע׳", "היום", "נוכחי", "עכשיו", "חיפוש עיר",
  "מרגיש כמו", "רוח", "לחות", "זוהה אוטומטית", "התחזית נטענת…", "שעתי", "יומי", "תחזית", "הגדרות", "יישום", "יישומון", "שורת תפריטים", "הגדרות יישומון", "הגדרות יישום", "הגדרות שורת תפריטים", "בחרו מה יוצג בתצוגה שנבחרה.",
  "כללי", "מערכת יחידות", "מטרית", "אמריקאית / אימפריאלית", "שעה", "יום בשבוע", "סמל מזג אוויר", "טמפרטורה", "טמפרטורה מורגשת", "מזג האוויר כעת", "מיקום", "משקעים", "אזהרות מזג אוויר", "מרגיש", "טמפרטורת מינ׳ / מקס׳", "הסתברות לגשם", "כמות גשם", "מדד UV", "זריחה / שקיעה", "סך הכול לשעתיים", "לשונית תחזית כברירת מחדל",
  "תחזית גשם · שעתיים", "מכ״ם גשם · שעתיים אחרונות", "מודל משקעים · נוכחי", "גשם", "הסתברות", "עוצמה", "ללא גשם", "קלה", "בינונית", "חזקה", "קיצונית", "מכ״ם",
  "לא צפוי גשם · {amount} {unit} / שעתיים", "סך הכול: {amount} {unit} / שעתיים", "אין נתונים — ממתין לרענון…", "מפת המכ״ם נטענת…", "אין נתוני מכ״ם זמינים במיקום זה", "{location} · {speed} {unit} מכיוון {direction} · משבים {gust} {unit}", "נתוני הרוח נטענים…", "אין נתוני מודל רוח זמינים", "ערכים נטויים מהמטמון (עד 3 ימים)."
])

addCompactCatalog("fa", [
  "آب‌وهوا", "بسیار شدید", "شدید", "متوسط", "خفیف", "اکنون برقرار", "تا اطلاع بعدی", "در حال به‌روزرسانی…", "همین حالا", "{count} دقیقه پیش", "{count} ساعت پیش", "امروز", "فعلی", "اکنون", "جست‌وجوی شهر",
  "دمای حسی", "باد", "رطوبت", "تشخیص خودکار", "در حال دریافت پیش‌بینی…", "ساعتی", "روزانه", "پیش‌بینی", "تنظیمات", "برنامه", "ویجت", "نوار منو", "تنظیمات ویجت", "تنظیمات برنامه", "تنظیمات نوار منو", "موارد قابل نمایش در نمای انتخاب‌شده را برگزینید.",
  "عمومی", "سامانهٔ یکاها", "متریک", "آمریکایی / امپریال", "زمان", "روز هفته", "نماد آب‌وهوا", "دما", "دمای حسی", "آب‌وهوای فعلی", "مکان", "بارش", "هشدارهای هواشناسی", "حسی", "کمینه / بیشینهٔ دما", "احتمال باران", "مقدار باران", "شاخص فرابنفش", "طلوع / غروب خورشید", "مجموع دو ساعت", "زبانهٔ پیش‌فرض پیش‌بینی",
  "پیش‌بینی باران · 2 ساعت", "رادار باران · 2 ساعت گذشته", "مدل بارش · فعلی", "باران", "احتمال", "شدت", "بدون باران", "کم", "متوسط", "زیاد", "بسیار شدید", "رادار",
  "بارانی پیش‌بینی نمی‌شود · {amount} {unit} / 2 ساعت", "مجموع: {amount} {unit} / 2 ساعت", "داده‌ای نیست — در انتظار نوسازی…", "نقشهٔ رادار در حال بارگیری است…", "دادهٔ رادار برای این مکان موجود نیست", "{location} · {speed} {unit} از {direction} · تندباد {gust} {unit}", "داده‌های باد در حال بارگیری است…", "دادهٔ مدل باد موجود نیست", "مقادیر مورب از حافظهٔ نهان (حداکثر 3 روز)."
])

addCompactCatalog("hi", [
  "मौसम", "अत्यधिक", "गंभीर", "मध्यम", "मामूली", "अभी प्रभावी", "अगली सूचना तक", "अपडेट हो रहा है…", "अभी-अभी", "{count} मिनट पहले", "{count} घंटे पहले", "आज", "वर्तमान", "अभी", "शहर खोजें",
  "महसूस", "हवा", "आर्द्रता", "अपने-आप पता लगाया", "पूर्वानुमान लाया जा रहा है…", "प्रति घंटा", "दैनिक", "पूर्वानुमान", "सेटिंग्स", "ऐप", "विजेट", "मेन्यू बार", "विजेट सेटिंग्स", "ऐप सेटिंग्स", "मेन्यू बार सेटिंग्स", "चुनें कि चयनित दृश्य में क्या दिखे।",
  "सामान्य", "इकाई प्रणाली", "मीट्रिक", "अमेरिकी / इम्पीरियल", "समय", "सप्ताह का दिन", "मौसम चिह्न", "तापमान", "महसूस होने वाला तापमान", "वर्तमान मौसम", "स्थान", "वर्षण", "मौसम चेतावनियाँ", "महसूस", "न्यून. / अधिक. तापमान", "बारिश की संभावना", "बारिश की मात्रा", "यूवी सूचकांक", "सूर्योदय / सूर्यास्त", "दो घंटे का कुल", "डिफ़ॉल्ट पूर्वानुमान टैब",
  "बारिश का पूर्वानुमान · 2 घंटे", "वर्षा रडार · पिछले 2 घंटे", "वर्षण मॉडल · वर्तमान", "बारिश", "संभावना", "तीव्रता", "बारिश नहीं", "हल्की", "मध्यम", "तेज़", "अत्यधिक", "रडार",
  "बारिश की उम्मीद नहीं · {amount} {unit} / 2 घंटे", "कुल: {amount} {unit} / 2 घंटे", "कोई डेटा नहीं — रीफ़्रेश की प्रतीक्षा…", "रडार मानचित्र लोड हो रहा है…", "इस स्थान पर रडार डेटा उपलब्ध नहीं है", "{location} · {direction} से {speed} {unit} · झोंके {gust} {unit}", "हवा का डेटा लोड हो रहा है…", "हवा के मॉडल का डेटा उपलब्ध नहीं है", "तिरछे मान कैश से हैं (अधिकतम 3 दिन पुराने)।"
])

addCompactCatalog("id", [
  "Cuaca", "EKSTREM", "PARAH", "SEDANG", "RINGAN", "berlaku sekarang", "hingga pemberitahuan lebih lanjut", "memperbarui…", "baru saja", "{count} mnt lalu", "{count} jam lalu", "Hari ini", "saat ini", "sekarang", "Cari kota",
  "TERASA", "Angin", "Kelembapan", "Terdeteksi otomatis", "Mengambil prakiraan…", "PER JAM", "HARIAN", "PRAKIRAAN", "Pengaturan", "Aplikasi", "Widget", "Bilah menu", "Pengaturan widget", "Pengaturan aplikasi", "Pengaturan bilah menu", "Pilih yang ditampilkan oleh tampilan terpilih.",
  "UMUM", "Sistem satuan", "Metrik", "AS / Imperial", "Waktu", "Hari", "Simbol cuaca", "Suhu", "Suhu terasa", "CUACA SAAT INI", "Lokasi", "Presipitasi", "Peringatan cuaca", "Terasa", "Suhu min. / maks.", "Peluang hujan", "Jumlah hujan", "Indeks UV", "Matahari terbit / terbenam", "Total dua jam", "Tab prakiraan bawaan",
  "PRAKIRAAN HUJAN · 2 JAM", "RADAR HUJAN · 2 JAM TERAKHIR", "MODEL PRESIPITASI · SAAT INI", "Hujan", "Peluang", "Intensitas", "Tidak ada hujan", "Ringan", "Sedang", "Lebat", "Ekstrem", "Radar",
  "Hujan tidak diperkirakan · {amount} {unit} / 2 jam", "Total: {amount} {unit} / 2 jam", "Tidak ada data — menunggu penyegaran…", "Peta radar sedang dimuat…", "Data radar tidak tersedia di lokasi ini", "{location} · {speed} {unit} dari {direction} · embusan {gust} {unit}", "Data angin sedang dimuat…", "Data model angin tidak tersedia", "Nilai miring berasal dari cache (maks. 3 hari)."
])

addCompactCatalog("vi", [
  "Thời tiết", "CỰC ĐOAN", "NGHIÊM TRỌNG", "TRUNG BÌNH", "NHẸ", "có hiệu lực ngay", "cho đến khi có thông báo mới", "đang cập nhật…", "vừa xong", "{count} phút trước", "{count} giờ trước", "Hôm nay", "hiện tại", "bây giờ", "Tìm thành phố",
  "CẢM GIÁC", "Gió", "Độ ẩm", "Tự động phát hiện", "Đang tải dự báo…", "HÀNG GIỜ", "HÀNG NGÀY", "DỰ BÁO", "Cài đặt", "Ứng dụng", "Tiện ích", "Thanh menu", "Cài đặt tiện ích", "Cài đặt ứng dụng", "Cài đặt thanh menu", "Chọn nội dung hiển thị trong chế độ xem đã chọn.",
  "CHUNG", "Hệ đơn vị", "Mét", "Mỹ / Anh", "Thời gian", "Thứ", "Biểu tượng thời tiết", "Nhiệt độ", "Nhiệt độ cảm nhận", "THỜI TIẾT HIỆN TẠI", "Vị trí", "Lượng mưa", "Cảnh báo thời tiết", "Cảm giác", "Nhiệt độ thấp / cao", "Xác suất mưa", "Lượng mưa", "Chỉ số UV", "Bình minh / hoàng hôn", "Tổng hai giờ", "Thẻ dự báo mặc định",
  "DỰ BÁO MƯA · 2 GIỜ", "RADAR MƯA · 2 GIỜ QUA", "MÔ HÌNH MƯA · HIỆN TẠI", "Mưa", "Xác suất", "Cường độ", "Không mưa", "Nhẹ", "Vừa", "Mạnh", "Cực đoan", "Radar",
  "Không dự kiến có mưa · {amount} {unit} / 2 giờ", "Tổng: {amount} {unit} / 2 giờ", "Không có dữ liệu — đang chờ làm mới…", "Đang tải bản đồ radar…", "Không có dữ liệu radar tại vị trí này", "{location} · {speed} {unit} từ {direction} · gió giật {gust} {unit}", "Đang tải dữ liệu gió…", "Không có dữ liệu mô hình gió", "Giá trị in nghiêng lấy từ bộ nhớ đệm (tối đa 3 ngày)."
])

addCompactCatalog("th", [
  "สภาพอากาศ", "รุนแรงที่สุด", "รุนแรง", "ปานกลาง", "เล็กน้อย", "มีผลขณะนี้", "จนกว่าจะมีประกาศเพิ่มเติม", "กำลังอัปเดต…", "เมื่อสักครู่", "{count} นาทีที่แล้ว", "{count} ชั่วโมงที่แล้ว", "วันนี้", "ปัจจุบัน", "ขณะนี้", "ค้นหาเมือง",
  "รู้สึกเหมือน", "ลม", "ความชื้น", "ตรวจพบอัตโนมัติ", "กำลังดึงพยากรณ์…", "รายชั่วโมง", "รายวัน", "พยากรณ์", "การตั้งค่า", "แอป", "วิดเจ็ต", "แถบเมนู", "การตั้งค่าวิดเจ็ต", "การตั้งค่าแอป", "การตั้งค่าแถบเมนู", "เลือกสิ่งที่จะแสดงในมุมมองที่เลือก",
  "ทั่วไป", "ระบบหน่วย", "เมตริก", "สหรัฐฯ / อิมพีเรียล", "เวลา", "วันในสัปดาห์", "สัญลักษณ์สภาพอากาศ", "อุณหภูมิ", "อุณหภูมิที่รู้สึก", "สภาพอากาศปัจจุบัน", "ตำแหน่ง", "หยาดน้ำฟ้า", "คำเตือนสภาพอากาศ", "รู้สึก", "อุณหภูมิต่ำสุด / สูงสุด", "โอกาสฝนตก", "ปริมาณฝน", "ดัชนี UV", "พระอาทิตย์ขึ้น / ตก", "ยอดรวมสองชั่วโมง", "แท็บพยากรณ์เริ่มต้น",
  "พยากรณ์ฝน · 2 ชั่วโมง", "เรดาร์ฝน · 2 ชั่วโมงที่ผ่านมา", "แบบจำลองหยาดน้ำฟ้า · ปัจจุบัน", "ฝน", "ความน่าจะเป็น", "ความแรง", "ไม่มีฝน", "เบา", "ปานกลาง", "หนัก", "รุนแรงที่สุด", "เรดาร์",
  "ไม่คาดว่าจะมีฝน · {amount} {unit} / 2 ชม.", "รวม: {amount} {unit} / 2 ชม.", "ไม่มีข้อมูล — กำลังรอรีเฟรช…", "กำลังโหลดแผนที่เรดาร์…", "ไม่มีข้อมูลเรดาร์สำหรับตำแหน่งนี้", "{location} · {speed} {unit} จาก {direction} · ลมกระโชก {gust} {unit}", "กำลังโหลดข้อมูลลม…", "ไม่มีข้อมูลแบบจำลองลม", "ค่าตัวเอียงมาจากแคช (ไม่เกิน 3 วัน)"
])

// Keyed catalogue additions for the settings pages (shortcuts, data
// sources). Keyed rather than positional like the compact catalogues above,
// so later strings can never shift an existing translation.
function addCatalogEntries(language, values) {
  var target = catalog[language] || (catalog[language] = {})
  for (var key in values) target[key] = values[key]
}

addCatalogEntries("es", {
  "settingsPageDisplay": "Visualización",
  "settingsPageShortcuts": "Atajos",
  "settingsPageSources": "Fuentes",
  "shortcutsSubtitle": "Teclado y ratón",
  "sourcesSubtitle": "De dónde proceden los datos",
  "shortcutsHint": "Las mismas teclas funcionan en el widget y en la aplicación.",
  "shortcutsGroupGeneral": "GENERAL",
  "shortcutsGroupNavigation": "DESPLAZAMIENTO",
  "shortcutsGroupForecast": "LLUVIA, RADAR Y VIENTO",
  "shortcutsGroupSearch": "BÚSQUEDA DE LUGAR",
  "shortcutsGroupSettings": "AJUSTES",
  "shortcutsGroupMouse": "BARRA DE MENÚ",
  "shortcutClose": "Cerrar la búsqueda, los ajustes o la lista y después el panel",
  "shortcutSwitchPanel": "Panel siguiente / anterior de la barra (widget)",
  "shortcutSettings": "Abrir ajustes",
  "shortcutRefresh": "Actualizar ahora",
  "shortcutSearch": "Buscar un lugar",
  "shortcutScroll": "Desplazar",
  "shortcutPage": "Desplazar una página",
  "shortcutJump": "Ir al principio / al final",
  "shortcutScrollDaily": "Desplazar el pronóstico diario",
  "shortcutViews": "Vista lluvia / radar / viento",
  "shortcutRadarStep": "Radar: imagen anterior / siguiente",
  "shortcutRadarPlay": "Radar: reproducir / pausar",
  "shortcutZoom": "Mapa: acercar / alejar",
  "shortcutZoomReset": "Mapa: zoom predeterminado",
  "shortcutSearchSelect": "Elegir un resultado",
  "shortcutSearchSection": "Cambiar entre resultados y favoritos",
  "shortcutSearchPick": "Mostrar el lugar elegido",
  "shortcutSearchFavorite": "Añadir / quitar favorito",
  "shortcutSearchCancel": "Cancelar la búsqueda",
  "shortcutSettingsPages": "Página de ajustes anterior / siguiente",
  "shortcutSettingsClose": "Cerrar ajustes",
  "mouseLeft": "Clic izquierdo",
  "mouseMiddle": "Clic central",
  "mouseRight": "Clic derecho",
  "shortcutMouseToggle": "Abrir / cerrar el panel del tiempo",
  "shortcutMouseRefresh": "Actualizar ahora",
  "shortcutMouseNotify": "El tiempo como notificación",
  "sourcesHint": "Las fuentes se eligen según el lugar y, si una falla, se pasa automáticamente a la siguiente.",
  "sourceInUse": "EN USO",
  "sourceNotInUse": "sin usar",
  "sourceGroupForecast": "Tiempo actual y pronóstico",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (el mejor modelo nacional de cada región), con MET Norway como respaldo. En Noruega, Suecia, Finlandia y Dinamarca MET Norway va primero, respaldado por su modelo MET Nordic de 1 km. En la zona del DWD, DWD MOSMIX (vía Bright Sky) afina temperatura, lluvia y símbolos.",
  "sourceCoverage": "COBERTURA",
  "sourceGroupForecastCoverage": "Mundial. MET Norway primero en NO, SE, FI, DK. DWD MOSMIX solo en la zona del DWD (aprox. 46,5–55,5° N, 5–16° E, también fuera de Alemania).",
  "sourceGroupUvCoverage": "Mundial.",
  "sourceGroupNowcastCoverage": "Mundial. Valores de lluvia de MOSMIX y cantidad del radar del DWD solo en la zona del DWD.",
  "sourceGroupRadarCoverage": "Zona del DWD (aprox. 46,5–55,5° N, 5–16° E) · EE. UU. incl. Alaska, Hawái, Puerto Rico y Guam (NWS) · Canadá (ECCC) · en el resto RainViewer (últimas dos horas) · último recurso: precipitación del modelo de Open-Meteo o MET Norway.",
  "sourceGroupWindCoverage": "Mundial.",
  "sourceGroupWarningsCoverage": "Alemania: DWD, con MeteoAlarm como respaldo · MeteoAlarm en 39 países: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · EE. UU.: NWS · Canadá: ECCC · sin avisos en el resto.",
  "sourceGroupLocationCoverage": "Mundial.",
  "sourceGroupMapCoverage": "Mundial. Nombres de lugares de tres servidores Overpass por turno: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Mundial; reflejada al sur del ecuador.",
  "sourceGroupUv": "Índice UV",
  "sourceGroupUvDetails": "Pronóstico UV horario y diario de Open-Meteo.",
  "sourceGroupNowcast": "Lluvia en las próximas dos horas",
  "sourceGroupNowcastDetails": "Eje de tiempo de 15 minutos del pronóstico. En la zona del DWD las próximas dos horas se construyen con el nowcast del radar del DWD vía Bright Sky: lluvia que ya cae, desplazada a lo largo de su trayectoria. Las cantidades y el inicio de la lluvia son la media sobre 3 × 3 km alrededor del lugar. La probabilidad combina qué parte del entorno muestra mojada el radar –unos 1 km ahora, ampliándose a 10 km en dos horas por la creciente incertidumbre– con la probabilidad de DWD MOSMIX, que pesa más cuanto más adelante, ya que el radar no puede prever chubascos que aún no se han formado. El pronóstico por horas toma estos valores para las horas que cubren. Más allá del radar, y en el resto, todos los valores proceden del pronóstico.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Imágenes de radar del servicio oficial regional; RainViewer lo sustituye en el resto y cuando este falla. Sin ningún radar, el mapa muestra la precipitación del modelo.",
  "sourceGroupWind": "Mapa de viento",
  "sourceGroupWindDetails": "Cuadrícula de Open-Meteo de 35 puntos sobre el área del mapa; si no, el viento pronosticado en el lugar. El mapa de viento muestra el viento a 10 m del suelo.",
  "sourceGroupDrift": "Flecha de desplazamiento de la lluvia",
  "sourceGroupDriftDetails": "Hacia dónde se desplaza la lluvia del radar, para la imagen mostrada. En la zona del DWD el movimiento se sigue en el propio radar, comparando el patrón de lluvia con el de 15 minutos después. En el resto, o con poca lluvia que seguir, se usa el viento del modelo a unos 3 km (700 hPa); si no, el viento en superficie. La lluvia se mueve con el viento a varios kilómetros de altura, que a menudo sopla de otra dirección que el viento cerca del suelo del mapa de viento; en días de chubascos, varias decenas de grados.",
  "sourceGroupDriftCoverage": "Seguimiento por radar en la zona del DWD (aprox. 46,5–55,5° N, 5–16° E) · viento de 700 hPa en todo el mundo.",
  "sourceGroupWarnings": "Avisos meteorológicos",
  "sourceGroupWarningsDetails": "Avisos oficiales para el lugar: DWD vía Bright Sky, el canal europeo MeteoAlarm (su API JSON si el canal falla), el Servicio Meteorológico Nacional de EE. UU. o Environment and Climate Change Canada.",
  "sourceGroupLocation": "Lugar",
  "sourceGroupLocationDetails": "Detección automática por dirección IP: ipwho.is, después ipapi.co y después GeoJS. Para un lugar elegido, el nombre, el condado y el país se consultan una vez vía Nominatim (OpenStreetMap). Búsqueda de lugares: Open-Meteo Geocoding.",
  "sourceGroupMap": "Fondo del mapa y nombres",
  "sourceGroupMapDetails": "Fondo satelital: DWD GeoServer Blue Marble. Nombres de ciudades: OpenStreetMap vía la API Overpass, en caché durante 30 días.",
  "sourceGroupMoon": "Fase lunar",
  "sourceGroupMoonDetails": "Calculada localmente (Meeus); reflejada para lugares al sur del ecuador.",
  "sourceLocalCalculation": "CÁLCULO LOCAL",
  "sourceRefreshInfo": "Se actualiza cada {minutes} min, el radar del DWD cada 5 min, compartido entre el widget y la aplicación. Última actualización: {updated}.",
  "barPosition": "Posición en la barra",
  "barPositionLeft": "Izquierda",
  "barPositionCenter": "Centro",
  "barPositionRight": "Derecha",
  "barPositionTop": "Arriba",
  "barPositionBottom": "Abajo",
  "barPositionHint": "Mueve el widget dentro de la barra de Omarchy.",
  "barPositionMissing": "El widget no está en la barra.",
  "showAlways": "Siempre",
  "showOnHover": "Al pasar el ratón",
  "menubarHoverHint": "Las entradas con «Al pasar el ratón» aparecen mientras el puntero está sobre el tiempo en la barra.",
  "barBehavior": "Comportamiento",
  "openWidgetOnHover": "Abrir el widget al pasar el ratón",
  "openWidgetOnHoverHint": "Abre el widget cuando el puntero se detiene sobre el tiempo en la barra y lo cierra al alejarse. Un clic lo mantiene abierto.",
  "rainIntensity": "Intensidad de la lluvia",
  "showWhenRelevant": "Cuando sea relevante",
  "menubarRelevantCurrentHint": "«Cuando sea relevante» muestra una entrada solo si destaca: sensación térmica a 3° de la temperatura, viento desde 20 km/h, UV desde 6.",
  "menubarRelevantRainHint": "«Cuando sea relevante»: probabilidad desde 30 %, intensidad mientras llueve, inicio de la lluvia dentro de dos horas. El inicio de la lluvia y la intensidad ocupan el lugar de la probabilidad.",
  "menubarRelevantAirHint": "«Cuando sea relevante»: calidad del aire desde «mala», polen en nivel alto.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Otras unidades al pasar el ratón",
  "hoverUnitSystemOff": "Desactivado",
  "hoverUnitSystemHint": "Mientras el puntero está sobre el widget, la barra cambia a este sistema de unidades. Kelvin solo afecta a las temperaturas.",
  "restoreOrder": "Restablecer el orden",
  "sunNext": "Próximo evento solar",
  "sunrise": "Amanecer",
  "sunset": "Atardecer",
  "moonPhase": "Fase lunar",
  "moon": "Luna"
})

addCatalogEntries("fr", {
  "settingsPageDisplay": "Affichage",
  "settingsPageShortcuts": "Raccourcis",
  "settingsPageSources": "Sources",
  "shortcutsSubtitle": "Clavier et souris",
  "sourcesSubtitle": "D’où viennent les données",
  "shortcutsHint": "Les mêmes touches fonctionnent dans le widget et dans l’application.",
  "shortcutsGroupGeneral": "GÉNÉRAL",
  "shortcutsGroupNavigation": "DÉFILEMENT",
  "shortcutsGroupForecast": "PLUIE, RADAR ET VENT",
  "shortcutsGroupSearch": "RECHERCHE DE LIEU",
  "shortcutsGroupSettings": "PARAMÈTRES",
  "shortcutsGroupMouse": "BARRE DE MENUS",
  "shortcutClose": "Fermer la recherche, les paramètres ou la liste, puis le panneau",
  "shortcutSwitchPanel": "Panneau suivant / précédent de la barre (widget)",
  "shortcutSettings": "Ouvrir les paramètres",
  "shortcutRefresh": "Actualiser maintenant",
  "shortcutSearch": "Rechercher un lieu",
  "shortcutScroll": "Faire défiler",
  "shortcutPage": "Défiler d’une page",
  "shortcutJump": "Aller au début / à la fin",
  "shortcutScrollDaily": "Faire défiler les prévisions quotidiennes",
  "shortcutViews": "Vue pluie / radar / vent",
  "shortcutRadarStep": "Radar : image précédente / suivante",
  "shortcutRadarPlay": "Radar : lecture / pause",
  "shortcutZoom": "Carte : zoom avant / arrière",
  "shortcutZoomReset": "Carte : zoom par défaut",
  "shortcutSearchSelect": "Choisir un résultat",
  "shortcutSearchSection": "Basculer entre résultats et favoris",
  "shortcutSearchPick": "Afficher le lieu choisi",
  "shortcutSearchFavorite": "Ajouter / retirer un favori",
  "shortcutSearchCancel": "Annuler la recherche",
  "shortcutSettingsPages": "Page de paramètres précédente / suivante",
  "shortcutSettingsClose": "Fermer les paramètres",
  "mouseLeft": "Clic gauche",
  "mouseMiddle": "Clic milieu",
  "mouseRight": "Clic droit",
  "shortcutMouseToggle": "Ouvrir / fermer le panneau météo",
  "shortcutMouseRefresh": "Actualiser maintenant",
  "shortcutMouseNotify": "Météo en notification",
  "sourcesHint": "Les sources sont choisies selon le lieu ; si l’une échoue, la suivante prend automatiquement le relais.",
  "sourceInUse": "UTILISÉE",
  "sourceNotInUse": "inutilisée",
  "sourceGroupForecast": "Météo actuelle et prévisions",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (le meilleur modèle national par région), avec MET Norway en secours. En Norvège, Suède, Finlande et Danemark, MET Norway passe en premier grâce à son modèle MET Nordic à 1 km. Dans la zone DWD, DWD MOSMIX (via Bright Sky) affine température, pluie et symboles.",
  "sourceCoverage": "COUVERTURE",
  "sourceGroupForecastCoverage": "Mondiale. MET Norway en premier en NO, SE, FI, DK. DWD MOSMIX seulement dans la zone DWD (env. 46,5–55,5° N, 5–16° E, aussi au-delà de l’Allemagne).",
  "sourceGroupUvCoverage": "Mondiale.",
  "sourceGroupNowcastCoverage": "Mondiale. Valeurs de pluie MOSMIX et cumul du radar DWD seulement dans la zone DWD.",
  "sourceGroupRadarCoverage": "Zone DWD (env. 46,5–55,5° N, 5–16° E) · États-Unis y compris Alaska, Hawaï, Porto Rico et Guam (NWS) · Canada (ECCC) · ailleurs RainViewer (deux dernières heures) · en dernier recours : précipitations du modèle Open-Meteo ou MET Norway.",
  "sourceGroupWindCoverage": "Mondiale.",
  "sourceGroupWarningsCoverage": "Allemagne : DWD, MeteoAlarm en secours · MeteoAlarm dans 39 pays : AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · États-Unis : NWS · Canada : ECCC · aucune alerte ailleurs.",
  "sourceGroupLocationCoverage": "Mondiale.",
  "sourceGroupMapCoverage": "Mondiale. Noms de lieux fournis tour à tour par trois serveurs Overpass : overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Mondiale ; inversée au sud de l’équateur.",
  "sourceGroupUv": "Indice UV",
  "sourceGroupUvDetails": "Prévision UV horaire et quotidienne d’Open-Meteo.",
  "sourceGroupNowcast": "Pluie dans les deux prochaines heures",
  "sourceGroupNowcastDetails": "Axe temporel de 15 minutes issu des prévisions. Dans la zone DWD, les deux prochaines heures sont construites à partir de la prévision immédiate du radar DWD via Bright Sky : la pluie qui tombe déjà, déplacée le long de sa trajectoire. Les cumuls et le début de la pluie sont la moyenne sur 3 × 3 km autour du lieu. La probabilité combine la part des environs que le radar montre mouillée – environ 1 km maintenant, élargie à 10 km dans deux heures pour l’incertitude croissante – avec la probabilité de DWD MOSMIX, qui pèse d’autant plus que l’échéance est lointaine, car le radar ne peut pas prévoir les averses qui ne se sont pas encore formées. La prévision horaire reprend ces valeurs pour les heures qu’elles couvrent. Au-delà du radar, et ailleurs, toutes les valeurs viennent des prévisions.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Images radar du service officiel régional ; RainViewer prend le relais ailleurs et en cas de panne. Sans aucun radar, la carte affiche les précipitations du modèle.",
  "sourceGroupWind": "Carte des vents",
  "sourceGroupWindDetails": "Grille Open-Meteo de 35 points sur l’étendue de la carte ; sinon le vent prévu au lieu. La carte des vents montre le vent à 10 m du sol.",
  "sourceGroupDrift": "Flèche de déplacement de la pluie",
  "sourceGroupDriftDetails": "Direction dans laquelle se déplace la pluie du radar, pour l’image affichée. Dans la zone DWD, le mouvement est suivi dans le radar lui-même en comparant le motif de pluie avec celui 15 minutes plus tard. Ailleurs, ou s’il y a trop peu de pluie à suivre, le vent du modèle vers 3 km (700 hPa) est utilisé, sinon le vent au sol. La pluie se déplace avec le vent à quelques kilomètres d’altitude, qui souffle souvent d’une autre direction que le vent près du sol de la carte des vents ; les jours d’averses, de plusieurs dizaines de degrés.",
  "sourceGroupDriftCoverage": "Suivi radar dans la zone DWD (env. 46,5–55,5° N, 5–16° E) · vent à 700 hPa dans le monde entier.",
  "sourceGroupWarnings": "Alertes météo",
  "sourceGroupWarningsDetails": "Alertes officielles pour le lieu : DWD via Bright Sky, le flux européen MeteoAlarm (son API JSON si le flux échoue), le National Weather Service américain ou Environnement et Changement climatique Canada.",
  "sourceGroupLocation": "Lieu",
  "sourceGroupLocationDetails": "Détection automatique par adresse IP : ipwho.is, puis ipapi.co, puis GeoJS. Pour un lieu choisi, le nom, le département et le pays sont recherchés une fois via Nominatim (OpenStreetMap). Recherche de lieu : Open-Meteo Geocoding.",
  "sourceGroupMap": "Fond de carte et noms",
  "sourceGroupMapDetails": "Fond satellite : DWD GeoServer Blue Marble. Noms de villes : OpenStreetMap via l’API Overpass, en cache pendant 30 jours.",
  "sourceGroupMoon": "Phase de la Lune",
  "sourceGroupMoonDetails": "Calculée localement (Meeus) ; inversée pour les lieux au sud de l’équateur.",
  "sourceLocalCalculation": "CALCUL LOCAL",
  "sourceRefreshInfo": "Actualisation toutes les {minutes} min, le radar DWD toutes les 5 min, partagée entre le widget et l’application. Dernière mise à jour : {updated}.",
  "barPosition": "Position dans la barre",
  "barPositionLeft": "Gauche",
  "barPositionCenter": "Centre",
  "barPositionRight": "Droite",
  "barPositionTop": "Haut",
  "barPositionBottom": "Bas",
  "barPositionHint": "Déplace le widget dans la barre d’Omarchy.",
  "barPositionMissing": "Le widget n’est pas dans la barre.",
  "showAlways": "Toujours",
  "showOnHover": "Au survol",
  "menubarHoverHint": "Les éléments « Au survol » apparaissent tant que le pointeur survole la météo dans la barre.",
  "barBehavior": "Comportement",
  "openWidgetOnHover": "Ouvrir le widget au survol",
  "openWidgetOnHoverHint": "Ouvre le widget quand le pointeur survole la météo dans la barre et le ferme dès qu’il s’éloigne. Un clic le garde ouvert.",
  "rainIntensity": "Intensité de la pluie",
  "showWhenRelevant": "Si pertinent",
  "menubarRelevantCurrentHint": "« Si pertinent » n’affiche un élément que s’il se démarque : ressenti à 3° de la température, vent à partir de 20 km/h, UV à partir de 6.",
  "menubarRelevantRainHint": "« Si pertinent » : probabilité à partir de 30 %, intensité tant qu’il pleut, début de pluie dans les deux heures. Le début de pluie et l’intensité prennent la place de la probabilité.",
  "menubarRelevantAirHint": "« Si pertinent » : qualité de l’air à partir de « mauvaise », pollen à un niveau élevé.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Autres unités au survol",
  "hoverUnitSystemOff": "Désactivé",
  "hoverUnitSystemHint": "Tant que le pointeur survole le widget, la barre passe à ce système d’unités. Kelvin ne change que les températures.",
  "restoreOrder": "Rétablir l’ordre",
  "sunNext": "Prochain événement solaire",
  "sunrise": "Lever du soleil",
  "sunset": "Coucher du soleil",
  "moonPhase": "Phase de la Lune",
  "moon": "Lune"
})

addCatalogEntries("pt", {
  "settingsPageDisplay": "Exibição",
  "settingsPageShortcuts": "Atalhos",
  "settingsPageSources": "Fontes",
  "shortcutsSubtitle": "Teclado e mouse",
  "sourcesSubtitle": "De onde vêm os dados",
  "shortcutsHint": "As mesmas teclas funcionam no widget e no aplicativo.",
  "shortcutsGroupGeneral": "GERAL",
  "shortcutsGroupNavigation": "ROLAGEM",
  "shortcutsGroupForecast": "CHUVA, RADAR E VENTO",
  "shortcutsGroupSearch": "BUSCA DE LOCAL",
  "shortcutsGroupSettings": "CONFIGURAÇÕES",
  "shortcutsGroupMouse": "BARRA DE MENU",
  "shortcutClose": "Fechar a busca, as configurações ou a lista e depois o painel",
  "shortcutSwitchPanel": "Painel seguinte / anterior da barra (widget)",
  "shortcutSettings": "Abrir configurações",
  "shortcutRefresh": "Atualizar agora",
  "shortcutSearch": "Buscar um local",
  "shortcutScroll": "Rolar",
  "shortcutPage": "Rolar uma página",
  "shortcutJump": "Ir para o início / fim",
  "shortcutScrollDaily": "Rolar a previsão diária",
  "shortcutViews": "Visualização chuva / radar / vento",
  "shortcutRadarStep": "Radar: imagem anterior / seguinte",
  "shortcutRadarPlay": "Radar: reproduzir / pausar",
  "shortcutZoom": "Mapa: aproximar / afastar",
  "shortcutZoomReset": "Mapa: zoom padrão",
  "shortcutSearchSelect": "Escolher um resultado",
  "shortcutSearchSection": "Alternar entre resultados e favoritos",
  "shortcutSearchPick": "Mostrar o local escolhido",
  "shortcutSearchFavorite": "Adicionar / remover favorito",
  "shortcutSearchCancel": "Cancelar a busca",
  "shortcutSettingsPages": "Página de configurações anterior / seguinte",
  "shortcutSettingsClose": "Fechar configurações",
  "mouseLeft": "Clique esquerdo",
  "mouseMiddle": "Clique do meio",
  "mouseRight": "Clique direito",
  "shortcutMouseToggle": "Abrir / fechar o painel do tempo",
  "shortcutMouseRefresh": "Atualizar agora",
  "shortcutMouseNotify": "Tempo como notificação",
  "sourcesHint": "As fontes são escolhidas conforme o local e, se uma falhar, a próxima assume automaticamente.",
  "sourceInUse": "EM USO",
  "sourceNotInUse": "sem uso",
  "sourceGroupForecast": "Tempo atual e previsão",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (o melhor modelo nacional de cada região), com MET Norway como reserva. Na Noruega, Suécia, Finlândia e Dinamarca o MET Norway vem primeiro, apoiado pelo seu modelo MET Nordic de 1 km. Na área do DWD, o DWD MOSMIX (via Bright Sky) refina temperatura, chuva e símbolos.",
  "sourceCoverage": "COBERTURA",
  "sourceGroupForecastCoverage": "Mundial. MET Norway primeiro em NO, SE, FI, DK. DWD MOSMIX só na área do DWD (cerca de 46,5–55,5° N, 5–16° E, também além da Alemanha).",
  "sourceGroupUvCoverage": "Mundial.",
  "sourceGroupNowcastCoverage": "Mundial. Valores de chuva do MOSMIX e volume do radar do DWD só na área do DWD.",
  "sourceGroupRadarCoverage": "Área do DWD (cerca de 46,5–55,5° N, 5–16° E) · EUA incl. Alasca, Havaí, Porto Rico e Guam (NWS) · Canadá (ECCC) · no resto RainViewer (últimas duas horas) · último recurso: precipitação do modelo do Open-Meteo ou do MET Norway.",
  "sourceGroupWindCoverage": "Mundial.",
  "sourceGroupWarningsCoverage": "Alemanha: DWD, com MeteoAlarm como reserva · MeteoAlarm em 39 países: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · EUA: NWS · Canadá: ECCC · sem alertas no resto.",
  "sourceGroupLocationCoverage": "Mundial.",
  "sourceGroupMapCoverage": "Mundial. Nomes de lugares de três servidores Overpass, um após o outro: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Mundial; espelhada ao sul do equador.",
  "sourceGroupUv": "Índice UV",
  "sourceGroupUvDetails": "Previsão UV horária e diária do Open-Meteo.",
  "sourceGroupNowcast": "Chuva nas próximas duas horas",
  "sourceGroupNowcastDetails": "Eixo de tempo de 15 minutos da previsão. Na área do DWD as próximas duas horas são construídas a partir do nowcast do radar do DWD via Bright Sky: chuva que já está caindo, deslocada ao longo de sua trajetória. Os volumes e o início da chuva são a média sobre 3 × 3 km ao redor do local. A probabilidade combina quanto do entorno o radar mostra molhado – cerca de 1 km agora, ampliando para 10 km em duas horas pela incerteza crescente – com a probabilidade do DWD MOSMIX, que pesa mais quanto mais à frente, pois o radar não consegue prever pancadas que ainda não se formaram. A previsão por hora usa esses valores nas horas que eles cobrem. Além do radar, e no resto, todos os valores vêm da previsão.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Imagens de radar do serviço oficial regional; o RainViewer assume no resto e quando ele falha. Sem nenhum radar, o mapa mostra a precipitação do modelo.",
  "sourceGroupWind": "Mapa de vento",
  "sourceGroupWindDetails": "Grade do Open-Meteo com 35 pontos sobre a área do mapa; caso contrário, o vento previsto no local. O mapa de vento mostra o vento a 10 m do solo.",
  "sourceGroupDrift": "Seta de deslocamento da chuva",
  "sourceGroupDriftDetails": "Para onde a chuva do radar está se deslocando, na imagem exibida. Na área do DWD, o movimento é acompanhado no próprio radar, comparando o padrão de chuva com o de 15 minutos depois. No resto, ou com pouca chuva para acompanhar, usa-se o vento do modelo a cerca de 3 km (700 hPa); caso contrário, o vento de superfície. A chuva se move com o vento a alguns quilômetros de altura, que muitas vezes sopra de outra direção que o vento perto do solo do mapa de vento; em dias de pancadas, várias dezenas de graus.",
  "sourceGroupDriftCoverage": "Acompanhamento por radar na área do DWD (cerca de 46,5–55,5° N, 5–16° E) · vento de 700 hPa no mundo todo.",
  "sourceGroupWarnings": "Alertas meteorológicos",
  "sourceGroupWarningsDetails": "Alertas oficiais para o local: DWD via Bright Sky, o feed europeu MeteoAlarm (sua API JSON quando o feed falha), o Serviço Meteorológico Nacional dos EUA ou o Environment and Climate Change Canada.",
  "sourceGroupLocation": "Local",
  "sourceGroupLocationDetails": "Detecção automática pelo endereço IP: ipwho.is, depois ipapi.co, depois GeoJS. Para um local escolhido, nome, condado e país são consultados uma vez via Nominatim (OpenStreetMap). Busca de locais: Open-Meteo Geocoding.",
  "sourceGroupMap": "Fundo do mapa e nomes",
  "sourceGroupMapDetails": "Fundo de satélite: DWD GeoServer Blue Marble. Nomes de cidades: OpenStreetMap via API Overpass, em cache por 30 dias.",
  "sourceGroupMoon": "Fase da Lua",
  "sourceGroupMoonDetails": "Calculada localmente (Meeus); espelhada para locais ao sul do equador.",
  "sourceLocalCalculation": "CÁLCULO LOCAL",
  "sourceRefreshInfo": "Atualizado a cada {minutes} min, o radar do DWD a cada 5 min, compartilhado entre widget e aplicativo. Última atualização: {updated}.",
  "barPosition": "Posição na barra",
  "barPositionLeft": "Esquerda",
  "barPositionCenter": "Centro",
  "barPositionRight": "Direita",
  "barPositionTop": "Topo",
  "barPositionBottom": "Base",
  "barPositionHint": "Move o widget dentro da barra do Omarchy.",
  "barPositionMissing": "O widget não está na barra.",
  "showAlways": "Sempre",
  "showOnHover": "Ao passar o mouse",
  "menubarHoverHint": "Itens com “Ao passar o mouse” aparecem enquanto o ponteiro está sobre o clima na barra.",
  "barBehavior": "Comportamento",
  "openWidgetOnHover": "Abrir o widget ao passar o mouse",
  "openWidgetOnHoverHint": "Abre o widget quando o ponteiro para sobre o clima na barra e o fecha quando ele se afasta. Um clique o mantém aberto.",
  "rainIntensity": "Intensidade da chuva",
  "showWhenRelevant": "Quando relevante",
  "menubarRelevantCurrentHint": "“Quando relevante” mostra um item apenas se ele se destacar: sensação a 3° da temperatura, vento a partir de 20 km/h, UV a partir de 6.",
  "menubarRelevantRainHint": "“Quando relevante”: probabilidade a partir de 30 %, intensidade enquanto chove, início da chuva em até duas horas. O início da chuva e a intensidade ocupam o lugar da probabilidade.",
  "menubarRelevantAirHint": "“Quando relevante”: qualidade do ar a partir de “ruim”, pólen em nível alto.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Outras unidades ao passar o mouse",
  "hoverUnitSystemOff": "Desligado",
  "hoverUnitSystemHint": "Enquanto o ponteiro está sobre o widget, a barra muda para este sistema de unidades. Kelvin afeta apenas as temperaturas.",
  "restoreOrder": "Restaurar a ordem",
  "sunNext": "Próximo evento solar",
  "sunrise": "Nascer do sol",
  "sunset": "Pôr do sol",
  "moonPhase": "Fase da lua",
  "moon": "Lua"
})

addCatalogEntries("ru", {
  "settingsPageDisplay": "Отображение",
  "settingsPageShortcuts": "Сочетания клавиш",
  "settingsPageSources": "Источники",
  "shortcutsSubtitle": "Клавиатура и мышь",
  "sourcesSubtitle": "Откуда берутся данные",
  "shortcutsHint": "Одни и те же клавиши работают в виджете и в приложении.",
  "shortcutsGroupGeneral": "ОБЩИЕ",
  "shortcutsGroupNavigation": "ПРОКРУТКА",
  "shortcutsGroupForecast": "ДОЖДЬ, РАДАР И ВЕТЕР",
  "shortcutsGroupSearch": "ПОИСК МЕСТА",
  "shortcutsGroupSettings": "НАСТРОЙКИ",
  "shortcutsGroupMouse": "СТРОКА МЕНЮ",
  "shortcutClose": "Закрыть поиск, настройки или список, затем панель",
  "shortcutSwitchPanel": "Следующая / предыдущая панель строки (виджет)",
  "shortcutSettings": "Открыть настройки",
  "shortcutRefresh": "Обновить сейчас",
  "shortcutSearch": "Найти место",
  "shortcutScroll": "Прокрутка",
  "shortcutPage": "Прокрутить на страницу",
  "shortcutJump": "В начало / в конец",
  "shortcutScrollDaily": "Прокрутить прогноз по дням",
  "shortcutViews": "Вид дождь / радар / ветер",
  "shortcutRadarStep": "Радар: предыдущий / следующий кадр",
  "shortcutRadarPlay": "Радар: воспроизвести / пауза",
  "shortcutZoom": "Карта: приблизить / отдалить",
  "shortcutZoomReset": "Карта: масштаб по умолчанию",
  "shortcutSearchSelect": "Выбрать результат",
  "shortcutSearchSection": "Переключиться между результатами и избранным",
  "shortcutSearchPick": "Показать выбранное место",
  "shortcutSearchFavorite": "Добавить / удалить избранное",
  "shortcutSearchCancel": "Отменить поиск",
  "shortcutSettingsPages": "Предыдущая / следующая страница настроек",
  "shortcutSettingsClose": "Закрыть настройки",
  "mouseLeft": "Левый клик",
  "mouseMiddle": "Средний клик",
  "mouseRight": "Правый клик",
  "shortcutMouseToggle": "Открыть / закрыть панель погоды",
  "shortcutMouseRefresh": "Обновить сейчас",
  "shortcutMouseNotify": "Погода в уведомлении",
  "sourcesHint": "Источники выбираются по месту; если один не отвечает, автоматически подключается следующий.",
  "sourceInUse": "ИСПОЛЬЗУЕТСЯ",
  "sourceNotInUse": "не используется",
  "sourceGroupForecast": "Текущая погода и прогноз",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (лучшая национальная модель для региона), резерв — MET Norway. В Норвегии, Швеции, Финляндии и Дании первым идёт MET Norway на основе собственной модели MET Nordic с шагом 1 км. В зоне DWD модель DWD MOSMIX (через Bright Sky) уточняет температуру, осадки и значки.",
  "sourceCoverage": "ОХВАТ",
  "sourceGroupForecastCoverage": "Весь мир. MET Norway первым в NO, SE, FI, DK. DWD MOSMIX только в зоне DWD (примерно 46,5–55,5° с. ш., 5–16° в. д., в том числе за пределами Германии).",
  "sourceGroupUvCoverage": "Весь мир.",
  "sourceGroupNowcastCoverage": "Весь мир. Значения осадков MOSMIX и количество по радару DWD только в зоне DWD.",
  "sourceGroupRadarCoverage": "Зона DWD (примерно 46,5–55,5° с. ш., 5–16° в. д.) · США, включая Аляску, Гавайи, Пуэрто-Рико и Гуам (NWS) · Канада (ECCC) · в остальных местах RainViewer (последние два часа) · в крайнем случае: осадки по модели Open-Meteo или MET Norway.",
  "sourceGroupWindCoverage": "Весь мир.",
  "sourceGroupWarningsCoverage": "Германия: DWD, резерв — MeteoAlarm · MeteoAlarm в 39 странах: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · США: NWS · Канада: ECCC · в других местах предупреждений нет.",
  "sourceGroupLocationCoverage": "Весь мир.",
  "sourceGroupMapCoverage": "Весь мир. Названия мест поочерёдно с трёх серверов Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Весь мир; зеркально к югу от экватора.",
  "sourceGroupUv": "УФ-индекс",
  "sourceGroupUvDetails": "Почасовой и суточный прогноз УФ от Open-Meteo.",
  "sourceGroupNowcast": "Дождь в ближайшие два часа",
  "sourceGroupNowcastDetails": "Шкала времени с шагом 15 минут из прогноза. В зоне DWD ближайшие два часа строятся по наукасту радара DWD через Bright Sky: уже выпадающие осадки, смещённые по их траектории. Количество осадков и время их начала — среднее по площади 3 × 3 км вокруг места. Вероятность объединяет долю окрестностей, которую радар показывает мокрой (сейчас около 1 км, через два часа до 10 км из-за растущей неопределённости), с вероятностью DWD MOSMIX, которая весит тем больше, чем дальше вперёд, ведь ливни, которые ещё не сформировались, радар предвидеть не может. Почасовой прогноз берёт эти значения для охваченных ими часов. За пределами радара и в других местах все значения берутся из прогноза.",
  "sourceGroupRadar": "Радар",
  "sourceGroupRadarDetails": "Радарные снимки официальной региональной службы; в других местах и при её сбое используется RainViewer. Без радара карта показывает осадки по модели.",
  "sourceGroupWind": "Карта ветра",
  "sourceGroupWindDetails": "Сетка Open-Meteo из 35 точек на области карты; иначе прогнозируемый ветер в месте. Карта ветра показывает ветер на высоте 10 м.",
  "sourceGroupDrift": "Стрелка смещения осадков",
  "sourceGroupDriftDetails": "Куда смещаются осадки на радаре — для показанного кадра. В зоне DWD движение отслеживается по самому радару: картина осадков сравнивается с картиной через 15 минут. В других местах или при слишком слабых осадках используется модельный ветер на высоте около 3 км (700 гПа), иначе приземный ветер. Осадки движутся с ветром на высоте нескольких километров, а он часто дует с другого направления, чем приземный ветер на карте ветра, — в дни с ливнями на несколько десятков градусов.",
  "sourceGroupDriftCoverage": "Отслеживание по радару в зоне DWD (примерно 46,5–55,5° с. ш., 5–16° в. д.) · ветер 700 гПа по всему миру.",
  "sourceGroupWarnings": "Предупреждения о погоде",
  "sourceGroupWarningsDetails": "Официальные предупреждения для места: DWD через Bright Sky, европейская лента MeteoAlarm (её JSON API, если лента недоступна), Национальная метеослужба США или Environment and Climate Change Canada.",
  "sourceGroupLocation": "Место",
  "sourceGroupLocationDetails": "Автоопределение по IP-адресу: ipwho.is, затем ipapi.co, затем GeoJS. Для выбранного места название, район и страна однократно определяются через Nominatim (OpenStreetMap). Поиск мест: Open-Meteo Geocoding.",
  "sourceGroupMap": "Фон карты и подписи",
  "sourceGroupMapDetails": "Спутниковый фон: DWD GeoServer Blue Marble. Названия городов: OpenStreetMap через Overpass API, кэшируются на 30 дней.",
  "sourceGroupMoon": "Фаза Луны",
  "sourceGroupMoonDetails": "Рассчитывается локально (Меус); зеркально для мест к югу от экватора.",
  "sourceLocalCalculation": "ЛОКАЛЬНЫЙ РАСЧЁТ",
  "sourceRefreshInfo": "Обновление каждые {minutes} мин, радар DWD каждые 5 мин, общее для виджета и приложения. Последнее обновление: {updated}.",
  "barPosition": "Положение на панели",
  "barPositionLeft": "Слева",
  "barPositionCenter": "По центру",
  "barPositionRight": "Справа",
  "barPositionTop": "Сверху",
  "barPositionBottom": "Снизу",
  "barPositionHint": "Перемещает виджет на панели Omarchy.",
  "barPositionMissing": "Виджета нет на панели.",
  "showAlways": "Всегда",
  "showOnHover": "При наведении",
  "menubarHoverHint": "Элементы «При наведении» появляются, пока указатель находится над погодой на панели.",
  "barBehavior": "Поведение",
  "openWidgetOnHover": "Открывать виджет при наведении",
  "openWidgetOnHoverHint": "Открывает виджет, когда указатель задерживается над погодой на панели, и закрывает, когда он уходит. Щелчок оставляет виджет открытым.",
  "rainIntensity": "Интенсивность дождя",
  "showWhenRelevant": "При значимости",
  "menubarRelevantCurrentHint": "«При значимости» показывает элемент, только когда он выделяется: ощущаемая температура на 3° от фактической, ветер от 20 км/ч, УФ от 6.",
  "menubarRelevantRainHint": "«При значимости»: вероятность от 30 %, интенсивность пока идёт дождь, начало дождя в ближайшие два часа. Начало дождя и интенсивность занимают место вероятности.",
  "menubarRelevantAirHint": "«При значимости»: качество воздуха от «плохого», высокий уровень пыльцы.",
  "kelvinUnits": "Кельвин",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Другие единицы при наведении",
  "hoverUnitSystemOff": "Выключено",
  "hoverUnitSystemHint": "Пока указатель находится над виджетом, панель переходит на эту систему единиц. Кельвин меняет только температуры.",
  "restoreOrder": "Сбросить порядок",
  "sunNext": "Ближайшее событие солнца",
  "sunrise": "Восход",
  "sunset": "Закат",
  "moonPhase": "Фаза Луны",
  "moon": "Луна"
})

addCatalogEntries("uk", {
  "settingsPageDisplay": "Відображення",
  "settingsPageShortcuts": "Комбінації клавіш",
  "settingsPageSources": "Джерела",
  "shortcutsSubtitle": "Клавіатура й миша",
  "sourcesSubtitle": "Звідки беруться дані",
  "shortcutsHint": "Ті самі клавіші працюють у віджеті та в застосунку.",
  "shortcutsGroupGeneral": "ЗАГАЛЬНІ",
  "shortcutsGroupNavigation": "ПРОКРУЧУВАННЯ",
  "shortcutsGroupForecast": "ДОЩ, РАДАР І ВІТЕР",
  "shortcutsGroupSearch": "ПОШУК МІСЦЯ",
  "shortcutsGroupSettings": "НАЛАШТУВАННЯ",
  "shortcutsGroupMouse": "ПАНЕЛЬ МЕНЮ",
  "shortcutClose": "Закрити пошук, налаштування або список, потім панель",
  "shortcutSwitchPanel": "Наступна / попередня панель смуги (віджет)",
  "shortcutSettings": "Відкрити налаштування",
  "shortcutRefresh": "Оновити зараз",
  "shortcutSearch": "Знайти місце",
  "shortcutScroll": "Прокручування",
  "shortcutPage": "Прокрутити на сторінку",
  "shortcutJump": "На початок / в кінець",
  "shortcutScrollDaily": "Прокрутити прогноз на дні",
  "shortcutViews": "Вигляд дощ / радар / вітер",
  "shortcutRadarStep": "Радар: попередній / наступний кадр",
  "shortcutRadarPlay": "Радар: відтворити / пауза",
  "shortcutZoom": "Мапа: наблизити / віддалити",
  "shortcutZoomReset": "Мапа: типовий масштаб",
  "shortcutSearchSelect": "Вибрати результат",
  "shortcutSearchSection": "Перемкнутися між результатами й обраним",
  "shortcutSearchPick": "Показати вибране місце",
  "shortcutSearchFavorite": "Додати / вилучити обране",
  "shortcutSearchCancel": "Скасувати пошук",
  "shortcutSettingsPages": "Попередня / наступна сторінка налаштувань",
  "shortcutSettingsClose": "Закрити налаштування",
  "mouseLeft": "Лівий клік",
  "mouseMiddle": "Середній клік",
  "mouseRight": "Правий клік",
  "shortcutMouseToggle": "Відкрити / закрити панель погоди",
  "shortcutMouseRefresh": "Оновити зараз",
  "shortcutMouseNotify": "Погода як сповіщення",
  "sourcesHint": "Джерела добираються за місцем; якщо одне не відповідає, автоматично вмикається наступне.",
  "sourceInUse": "ВИКОРИСТОВУЄТЬСЯ",
  "sourceNotInUse": "не використовується",
  "sourceGroupForecast": "Поточна погода й прогноз",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (найкраща національна модель для регіону), резерв — MET Norway. У Норвегії, Швеції, Фінляндії та Данії першим іде MET Norway на основі власної моделі MET Nordic із кроком 1 км. У зоні DWD модель DWD MOSMIX (через Bright Sky) уточнює температуру, опади й значки.",
  "sourceCoverage": "ОХОПЛЕННЯ",
  "sourceGroupForecastCoverage": "Увесь світ. MET Norway першим у NO, SE, FI, DK. DWD MOSMIX лише в зоні DWD (приблизно 46,5–55,5° пн. ш., 5–16° сх. д., зокрема й поза Німеччиною).",
  "sourceGroupUvCoverage": "Увесь світ.",
  "sourceGroupNowcastCoverage": "Увесь світ. Значення опадів MOSMIX і кількість за радаром DWD лише в зоні DWD.",
  "sourceGroupRadarCoverage": "Зона DWD (приблизно 46,5–55,5° пн. ш., 5–16° сх. д.) · США разом з Аляскою, Гаваями, Пуерто-Рико та Гуамом (NWS) · Канада (ECCC) · деінде RainViewer (останні дві години) · в крайньому разі: опади за моделлю Open-Meteo або MET Norway.",
  "sourceGroupWindCoverage": "Увесь світ.",
  "sourceGroupWarningsCoverage": "Німеччина: DWD, резерв — MeteoAlarm · MeteoAlarm у 39 країнах: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · США: NWS · Канада: ECCC · деінде попереджень немає.",
  "sourceGroupLocationCoverage": "Увесь світ.",
  "sourceGroupMapCoverage": "Увесь світ. Назви місць по черзі з трьох серверів Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Увесь світ; дзеркально на південь від екватора.",
  "sourceGroupUv": "УФ-індекс",
  "sourceGroupUvDetails": "Погодинний і добовий прогноз УФ від Open-Meteo.",
  "sourceGroupNowcast": "Дощ у найближчі дві години",
  "sourceGroupNowcastDetails": "Шкала часу з кроком 15 хвилин із прогнозу. У зоні DWD найближчі дві години будуються за наукастом радара DWD через Bright Sky: опади, що вже випадають, зміщені вздовж їхньої траєкторії. Кількість опадів і час їх початку — середнє за площею 3 × 3 км навколо місця. Імовірність поєднує частку околиць, яку радар показує мокрою (зараз близько 1 км, за дві години до 10 км через зростання невизначеності), з імовірністю DWD MOSMIX, яка важить тим більше, чим далі вперед, адже зливи, які ще не сформувалися, радар передбачити не може. Погодинний прогноз бере ці значення для годин, які вони охоплюють. Поза радаром і деінде всі значення беруться з прогнозу.",
  "sourceGroupRadar": "Радар",
  "sourceGroupRadarDetails": "Радарні знімки офіційної регіональної служби; деінде та в разі її збою використовується RainViewer. Без радара мапа показує опади за моделлю.",
  "sourceGroupWind": "Мапа вітру",
  "sourceGroupWindDetails": "Сітка Open-Meteo з 35 точок на області мапи; інакше прогнозований вітер у місці. Мапа вітру показує вітер на висоті 10 м.",
  "sourceGroupDrift": "Стрілка зміщення опадів",
  "sourceGroupDriftDetails": "Куди зміщуються опади на радарі — для показаного кадру. У зоні DWD рух відстежується за самим радаром: картина опадів порівнюється з картиною через 15 хвилин. Деінде або за надто слабких опадів використовується модельний вітер на висоті близько 3 км (700 гПа), інакше приземний вітер. Опади рухаються з вітром на висоті кількох кілометрів, а він часто дме з іншого напрямку, ніж приземний вітер на мапі вітру, — у дні зі зливами на кілька десятків градусів.",
  "sourceGroupDriftCoverage": "Відстеження за радаром у зоні DWD (приблизно 46,5–55,5° пн. ш., 5–16° сх. д.) · вітер 700 гПа в усьому світі.",
  "sourceGroupWarnings": "Попередження про погоду",
  "sourceGroupWarningsDetails": "Офіційні попередження для місця: DWD через Bright Sky, європейська стрічка MeteoAlarm (її JSON API, якщо стрічка недоступна), Національна метеослужба США або Environment and Climate Change Canada.",
  "sourceGroupLocation": "Місце",
  "sourceGroupLocationDetails": "Автовизначення за IP-адресою: ipwho.is, потім ipapi.co, потім GeoJS. Для вибраного місця назва, район і країна визначаються один раз через Nominatim (OpenStreetMap). Пошук місць: Open-Meteo Geocoding.",
  "sourceGroupMap": "Тло мапи й підписи",
  "sourceGroupMapDetails": "Супутникове тло: DWD GeoServer Blue Marble. Назви міст: OpenStreetMap через Overpass API, кешуються на 30 днів.",
  "sourceGroupMoon": "Фаза Місяця",
  "sourceGroupMoonDetails": "Обчислюється локально (Меус); дзеркально для місць на південь від екватора.",
  "sourceLocalCalculation": "ЛОКАЛЬНИЙ РОЗРАХУНОК",
  "sourceRefreshInfo": "Оновлення кожні {minutes} хв, радар DWD кожні 5 хв, спільне для віджета й застосунку. Останнє оновлення: {updated}.",
  "barPosition": "Розташування на панелі",
  "barPositionLeft": "Ліворуч",
  "barPositionCenter": "По центру",
  "barPositionRight": "Праворуч",
  "barPositionTop": "Угорі",
  "barPositionBottom": "Унизу",
  "barPositionHint": "Переміщує віджет на панелі Omarchy.",
  "barPositionMissing": "Віджета немає на панелі.",
  "showAlways": "Завжди",
  "showOnHover": "При наведенні",
  "menubarHoverHint": "Елементи «При наведенні» з’являються, поки вказівник над погодою на панелі.",
  "barBehavior": "Поведінка",
  "openWidgetOnHover": "Відкривати віджет при наведенні",
  "openWidgetOnHoverHint": "Відкриває віджет, коли вказівник затримується над погодою на панелі, і закриває, коли він відходить. Клацання залишає віджет відкритим.",
  "rainIntensity": "Інтенсивність дощу",
  "showWhenRelevant": "Коли важливо",
  "menubarRelevantCurrentHint": "«Коли важливо» показує запис, лише коли він виділяється: відчутна температура за 3° від фактичної, вітер від 20 км/год, УФ від 6.",
  "menubarRelevantRainHint": "«Коли важливо»: ймовірність від 30 %, інтенсивність поки йде дощ, початок дощу протягом двох годин. Початок дощу та інтенсивність займають місце ймовірності.",
  "menubarRelevantAirHint": "«Коли важливо»: якість повітря від «поганої», високий рівень пилку.",
  "kelvinUnits": "Кельвін",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Інші одиниці при наведенні",
  "hoverUnitSystemOff": "Вимкнено",
  "hoverUnitSystemHint": "Поки вказівник над віджетом, панель переходить на цю систему одиниць. Кельвін змінює лише температури.",
  "restoreOrder": "Скинути порядок",
  "sunNext": "Найближча подія сонця",
  "sunrise": "Схід сонця",
  "sunset": "Захід сонця",
  "moonPhase": "Фаза Місяця",
  "moon": "Місяць"
})

addCatalogEntries("pl", {
  "settingsPageDisplay": "Wygląd",
  "settingsPageShortcuts": "Skróty",
  "settingsPageSources": "Źródła",
  "shortcutsSubtitle": "Klawiatura i mysz",
  "sourcesSubtitle": "Skąd pochodzą dane",
  "shortcutsHint": "Te same klawisze działają w widżecie i w aplikacji.",
  "shortcutsGroupGeneral": "OGÓLNE",
  "shortcutsGroupNavigation": "PRZEWIJANIE",
  "shortcutsGroupForecast": "DESZCZ, RADAR I WIATR",
  "shortcutsGroupSearch": "WYSZUKIWANIE MIEJSCA",
  "shortcutsGroupSettings": "USTAWIENIA",
  "shortcutsGroupMouse": "PASEK MENU",
  "shortcutClose": "Zamknij wyszukiwanie, ustawienia lub listę, potem panel",
  "shortcutSwitchPanel": "Następny / poprzedni panel paska (widżet)",
  "shortcutSettings": "Otwórz ustawienia",
  "shortcutRefresh": "Odśwież teraz",
  "shortcutSearch": "Szukaj miejsca",
  "shortcutScroll": "Przewijanie",
  "shortcutPage": "Przewiń o stronę",
  "shortcutJump": "Na początek / koniec",
  "shortcutScrollDaily": "Przewiń prognozę dzienną",
  "shortcutViews": "Widok deszcz / radar / wiatr",
  "shortcutRadarStep": "Radar: poprzedni / następny obraz",
  "shortcutRadarPlay": "Radar: odtwórz / pauza",
  "shortcutZoom": "Mapa: przybliż / oddal",
  "shortcutZoomReset": "Mapa: domyślne powiększenie",
  "shortcutSearchSelect": "Wybierz wynik",
  "shortcutSearchSection": "Przełącz między wynikami a ulubionymi",
  "shortcutSearchPick": "Pokaż wybrane miejsce",
  "shortcutSearchFavorite": "Dodaj / usuń ulubione",
  "shortcutSearchCancel": "Anuluj wyszukiwanie",
  "shortcutSettingsPages": "Poprzednia / następna strona ustawień",
  "shortcutSettingsClose": "Zamknij ustawienia",
  "mouseLeft": "Lewy klik",
  "mouseMiddle": "Środkowy klik",
  "mouseRight": "Prawy klik",
  "shortcutMouseToggle": "Otwórz / zamknij panel pogody",
  "shortcutMouseRefresh": "Odśwież teraz",
  "shortcutMouseNotify": "Pogoda jako powiadomienie",
  "sourcesHint": "Źródła są dobierane do miejsca; gdy któreś zawiedzie, automatycznie przejmuje następne.",
  "sourceInUse": "UŻYWANE",
  "sourceNotInUse": "nieużywane",
  "sourceGroupForecast": "Bieżąca pogoda i prognoza",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (najlepszy model krajowy dla regionu), z MET Norway jako zapasem. W Norwegii, Szwecji, Finlandii i Danii pierwszeństwo ma MET Norway, oparte na własnym modelu MET Nordic 1 km. W obszarze DWD DWD MOSMIX (przez Bright Sky) uściśla temperaturę, opady i symbole.",
  "sourceCoverage": "ZASIĘG",
  "sourceGroupForecastCoverage": "Cały świat. MET Norway najpierw w NO, SE, FI, DK. DWD MOSMIX tylko w obszarze DWD (ok. 46,5–55,5° N, 5–16° E, także poza Niemcami).",
  "sourceGroupUvCoverage": "Cały świat.",
  "sourceGroupNowcastCoverage": "Cały świat. Wartości opadów MOSMIX i ilość z radaru DWD tylko w obszarze DWD.",
  "sourceGroupRadarCoverage": "Obszar DWD (ok. 46,5–55,5° N, 5–16° E) · USA z Alaską, Hawajami, Portoryko i Guam (NWS) · Kanada (ECCC) · gdzie indziej RainViewer (ostatnie dwie godziny) · w ostateczności: opady z modelu Open-Meteo lub MET Norway.",
  "sourceGroupWindCoverage": "Cały świat.",
  "sourceGroupWarningsCoverage": "Niemcy: DWD, MeteoAlarm jako zapas · MeteoAlarm w 39 krajach: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Kanada: ECCC · poza tym brak ostrzeżeń.",
  "sourceGroupLocationCoverage": "Cały świat.",
  "sourceGroupMapCoverage": "Cały świat. Nazwy miejsc kolejno z trzech serwerów Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Cały świat; odbita na południe od równika.",
  "sourceGroupUv": "Indeks UV",
  "sourceGroupUvDetails": "Godzinowa i dzienna prognoza UV z Open-Meteo.",
  "sourceGroupNowcast": "Deszcz w ciągu dwóch godzin",
  "sourceGroupNowcastDetails": "15-minutowa oś czasu z prognozy. W obszarze DWD najbliższe dwie godziny powstają z nowcastu radaru DWD przez Bright Sky: deszcz, który już pada, przesunięty wzdłuż swojej trasy. Ilości i początek deszczu to średnia z obszaru 3 × 3 km wokół miejsca. Prawdopodobieństwo łączy to, jaką część otoczenia radar pokazuje jako mokrą – teraz ok. 1 km, za dwie godziny do 10 km ze względu na rosnącą niepewność – z prawdopodobieństwem DWD MOSMIX, które liczy się tym bardziej, im dalej w przyszłość, bo radar nie przewidzi opadów, które dopiero się utworzą. Prognoza godzinowa przejmuje te wartości dla godzin, które obejmują. Poza radarem i gdzie indziej wszystkie wartości pochodzą z prognozy.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Obrazy radarowe z oficjalnej służby regionalnej; RainViewer zastępuje ją gdzie indziej i w razie awarii. Bez radaru mapa pokazuje opady z modelu.",
  "sourceGroupWind": "Mapa wiatru",
  "sourceGroupWindDetails": "Siatka Open-Meteo z 35 punktów na obszarze mapy; w przeciwnym razie prognozowany wiatr w miejscu. Mapa wiatru pokazuje wiatr na wysokości 10 m.",
  "sourceGroupDrift": "Strzałka przemieszczania opadów",
  "sourceGroupDriftDetails": "Dokąd przemieszczają się opady na radarze – dla wyświetlanej klatki. Na obszarze DWD ruch jest śledzony w samym radarze przez porównanie układu opadów z układem 15 minut później. Gdzie indziej lub przy zbyt małych opadach używany jest wiatr modelowy na wysokości ok. 3 km (700 hPa), a w ostateczności wiatr przy ziemi. Opady przemieszczają się z wiatrem na wysokości kilku kilometrów, który często wieje z innego kierunku niż wiatr przy ziemi na mapie wiatru – w dni z przelotnymi opadami nawet o kilkadziesiąt stopni.",
  "sourceGroupDriftCoverage": "Śledzenie radarowe na obszarze DWD (ok. 46,5–55,5° N, 5–16° E) · wiatr na 700 hPa na całym świecie.",
  "sourceGroupWarnings": "Ostrzeżenia pogodowe",
  "sourceGroupWarningsDetails": "Oficjalne ostrzeżenia dla miejsca: DWD przez Bright Sky, europejski kanał MeteoAlarm (jego API JSON, gdy kanał zawiedzie), amerykańska National Weather Service lub Environment and Climate Change Canada.",
  "sourceGroupLocation": "Miejsce",
  "sourceGroupLocationDetails": "Automatyczne wykrywanie po adresie IP: ipwho.is, potem ipapi.co, potem GeoJS. Dla wybranego miejsca nazwa, powiat i kraj są ustalane raz przez Nominatim (OpenStreetMap). Wyszukiwanie miejsc: Open-Meteo Geocoding.",
  "sourceGroupMap": "Tło mapy i nazwy",
  "sourceGroupMapDetails": "Tło satelitarne: DWD GeoServer Blue Marble. Nazwy miast: OpenStreetMap przez API Overpass, przechowywane 30 dni.",
  "sourceGroupMoon": "Faza Księżyca",
  "sourceGroupMoonDetails": "Obliczana lokalnie (Meeus); odbita dla miejsc na południe od równika.",
  "sourceLocalCalculation": "OBLICZENIE LOKALNE",
  "sourceRefreshInfo": "Odświeżanie co {minutes} min, radar DWD co 5 min, wspólne dla widżetu i aplikacji. Ostatnia aktualizacja: {updated}.",
  "barPosition": "Położenie na pasku",
  "barPositionLeft": "Z lewej",
  "barPositionCenter": "Pośrodku",
  "barPositionRight": "Z prawej",
  "barPositionTop": "U góry",
  "barPositionBottom": "U dołu",
  "barPositionHint": "Przenosi widżet w obrębie paska Omarchy.",
  "barPositionMissing": "Widżetu nie ma na pasku.",
  "showAlways": "Zawsze",
  "showOnHover": "Po najechaniu",
  "menubarHoverHint": "Elementy „Po najechaniu” pojawiają się, gdy wskaźnik znajduje się nad pogodą na pasku.",
  "barBehavior": "Zachowanie",
  "openWidgetOnHover": "Otwieraj widżet po najechaniu",
  "openWidgetOnHoverHint": "Otwiera widżet, gdy wskaźnik zatrzyma się nad pogodą na pasku, i zamyka go, gdy się oddali. Kliknięcie pozostawia go otwartym.",
  "rainIntensity": "Natężenie deszczu",
  "showWhenRelevant": "Gdy istotne",
  "menubarRelevantCurrentHint": "„Gdy istotne” pokazuje pozycję tylko wtedy, gdy się wyróżnia: temperatura odczuwalna 3° od rzeczywistej, wiatr od 20 km/h, UV od 6.",
  "menubarRelevantRainHint": "„Gdy istotne”: prawdopodobieństwo od 30 %, natężenie gdy pada, początek deszczu w ciągu dwóch godzin. Początek deszczu i natężenie zajmują miejsce prawdopodobieństwa.",
  "menubarRelevantAirHint": "„Gdy istotne”: jakość powietrza od „złej”, pyłki na wysokim poziomie.",
  "kelvinUnits": "Kelwin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Inne jednostki po najechaniu",
  "hoverUnitSystemOff": "Wyłączone",
  "hoverUnitSystemHint": "Gdy wskaźnik spoczywa na widżecie, pasek przełącza się na ten układ jednostek. Kelwin zmienia tylko temperatury.",
  "restoreOrder": "Przywróć kolejność",
  "sunNext": "Najbliższe zdarzenie słońca",
  "sunrise": "Wschód słońca",
  "sunset": "Zachód słońca",
  "moonPhase": "Faza Księżyca",
  "moon": "Księżyc"
})

addCatalogEntries("it", {
  "settingsPageDisplay": "Visualizzazione",
  "settingsPageShortcuts": "Scorciatoie",
  "settingsPageSources": "Fonti",
  "shortcutsSubtitle": "Tastiera e mouse",
  "sourcesSubtitle": "Da dove provengono i dati",
  "shortcutsHint": "Gli stessi tasti funzionano nel widget e nell’app.",
  "shortcutsGroupGeneral": "GENERALI",
  "shortcutsGroupNavigation": "SCORRIMENTO",
  "shortcutsGroupForecast": "PIOGGIA, RADAR E VENTO",
  "shortcutsGroupSearch": "RICERCA LUOGO",
  "shortcutsGroupSettings": "IMPOSTAZIONI",
  "shortcutsGroupMouse": "BARRA DEI MENU",
  "shortcutClose": "Chiudi ricerca, impostazioni o elenco, poi il pannello",
  "shortcutSwitchPanel": "Pannello successivo / precedente della barra (widget)",
  "shortcutSettings": "Apri impostazioni",
  "shortcutRefresh": "Aggiorna ora",
  "shortcutSearch": "Cerca un luogo",
  "shortcutScroll": "Scorri",
  "shortcutPage": "Scorri di una pagina",
  "shortcutJump": "Vai all’inizio / alla fine",
  "shortcutScrollDaily": "Scorri le previsioni giornaliere",
  "shortcutViews": "Vista pioggia / radar / vento",
  "shortcutRadarStep": "Radar: immagine precedente / successiva",
  "shortcutRadarPlay": "Radar: riproduci / pausa",
  "shortcutZoom": "Mappa: ingrandisci / riduci",
  "shortcutZoomReset": "Mappa: zoom predefinito",
  "shortcutSearchSelect": "Scegli un risultato",
  "shortcutSearchSection": "Passa tra risultati e preferiti",
  "shortcutSearchPick": "Mostra il luogo scelto",
  "shortcutSearchFavorite": "Aggiungi / rimuovi preferito",
  "shortcutSearchCancel": "Annulla la ricerca",
  "shortcutSettingsPages": "Pagina delle impostazioni precedente / successiva",
  "shortcutSettingsClose": "Chiudi impostazioni",
  "mouseLeft": "Clic sinistro",
  "mouseMiddle": "Clic centrale",
  "mouseRight": "Clic destro",
  "shortcutMouseToggle": "Apri / chiudi il pannello meteo",
  "shortcutMouseRefresh": "Aggiorna ora",
  "shortcutMouseNotify": "Meteo come notifica",
  "sourcesHint": "Le fonti sono scelte in base al luogo; se una non risponde, subentra automaticamente la successiva.",
  "sourceInUse": "IN USO",
  "sourceNotInUse": "non in uso",
  "sourceGroupForecast": "Meteo attuale e previsioni",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (il miglior modello nazionale per regione), con MET Norway come riserva. In Norvegia, Svezia, Finlandia e Danimarca MET Norway ha la precedenza, grazie al suo modello MET Nordic a 1 km. Nell’area DWD, DWD MOSMIX (tramite Bright Sky) affina temperatura, pioggia e simboli.",
  "sourceCoverage": "COPERTURA",
  "sourceGroupForecastCoverage": "Mondiale. MET Norway per primo in NO, SE, FI, DK. DWD MOSMIX solo nell’area DWD (circa 46,5–55,5° N, 5–16° E, anche oltre la Germania).",
  "sourceGroupUvCoverage": "Mondiale.",
  "sourceGroupNowcastCoverage": "Mondiale. Valori di pioggia MOSMIX e quantità del radar DWD solo nell’area DWD.",
  "sourceGroupRadarCoverage": "Area DWD (circa 46,5–55,5° N, 5–16° E) · USA incl. Alaska, Hawaii, Porto Rico e Guam (NWS) · Canada (ECCC) · altrove RainViewer (ultime due ore) · come ultima risorsa: precipitazione del modello Open-Meteo o MET Norway.",
  "sourceGroupWindCoverage": "Mondiale.",
  "sourceGroupWarningsCoverage": "Germania: DWD, con MeteoAlarm come riserva · MeteoAlarm in 39 paesi: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Canada: ECCC · nessuna allerta altrove.",
  "sourceGroupLocationCoverage": "Mondiale.",
  "sourceGroupMapCoverage": "Mondiale. Nomi dei luoghi da tre server Overpass a turno: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Mondiale; speculare a sud dell’equatore.",
  "sourceGroupUv": "Indice UV",
  "sourceGroupUvDetails": "Previsione UV oraria e giornaliera di Open-Meteo.",
  "sourceGroupNowcast": "Pioggia nelle prossime due ore",
  "sourceGroupNowcastDetails": "Asse temporale di 15 minuti dalle previsioni. Nell’area DWD le prossime due ore sono costruite dal nowcast del radar DWD tramite Bright Sky: pioggia che sta già cadendo, spostata lungo la sua traiettoria. Quantità e inizio della pioggia sono la media su 3 × 3 km intorno al luogo. La probabilità combina quanta parte dei dintorni il radar mostra bagnata – circa 1 km ora, che si allarga a 10 km in due ore per la crescente incertezza – con la probabilità di DWD MOSMIX, che conta di più quanto più avanti si guarda, perché il radar non può prevedere rovesci che devono ancora formarsi. La previsione oraria usa questi valori per le ore che coprono. Oltre il radar, e altrove, tutti i valori vengono dalle previsioni.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Immagini radar del servizio ufficiale regionale; RainViewer subentra altrove e quando questo non risponde. Senza alcun radar la mappa mostra la precipitazione del modello.",
  "sourceGroupWind": "Mappa del vento",
  "sourceGroupWindDetails": "Griglia Open-Meteo di 35 punti sull’area della mappa; altrimenti il vento previsto nel luogo. La mappa del vento mostra il vento a 10 m dal suolo.",
  "sourceGroupDrift": "Freccia di spostamento della pioggia",
  "sourceGroupDriftDetails": "Dove si sta spostando la pioggia del radar, per il fotogramma mostrato. Nell’area DWD il movimento viene seguito nel radar stesso, confrontando la distribuzione della pioggia con quella di 15 minuti dopo. Altrove, o con troppa poca pioggia da seguire, si usa il vento del modello a circa 3 km (700 hPa), altrimenti il vento al suolo. La pioggia si sposta con il vento a qualche chilometro di quota, che spesso soffia da una direzione diversa dal vento vicino al suolo della mappa del vento; nei giorni di rovesci, di diverse decine di gradi.",
  "sourceGroupDriftCoverage": "Tracciamento radar nell’area DWD (circa 46,5–55,5° N, 5–16° E) · vento a 700 hPa in tutto il mondo.",
  "sourceGroupWarnings": "Allerte meteo",
  "sourceGroupWarningsDetails": "Allerte ufficiali per il luogo: DWD tramite Bright Sky, il feed europeo MeteoAlarm (la sua API JSON se il feed non risponde), il National Weather Service statunitense o Environment and Climate Change Canada.",
  "sourceGroupLocation": "Luogo",
  "sourceGroupLocationDetails": "Rilevamento automatico tramite indirizzo IP: ipwho.is, poi ipapi.co, poi GeoJS. Per un luogo scelto, nome, provincia e paese vengono cercati una volta tramite Nominatim (OpenStreetMap). Ricerca dei luoghi: Open-Meteo Geocoding.",
  "sourceGroupMap": "Sfondo della mappa e nomi",
  "sourceGroupMapDetails": "Sfondo satellitare: DWD GeoServer Blue Marble. Nomi delle città: OpenStreetMap tramite API Overpass, in cache per 30 giorni.",
  "sourceGroupMoon": "Fase lunare",
  "sourceGroupMoonDetails": "Calcolata localmente (Meeus); speculare per i luoghi a sud dell’equatore.",
  "sourceLocalCalculation": "CALCOLO LOCALE",
  "sourceRefreshInfo": "Aggiornamento ogni {minutes} min, il radar DWD ogni 5 min, condiviso tra widget e app. Ultimo aggiornamento: {updated}.",
  "barPosition": "Posizione nella barra",
  "barPositionLeft": "Sinistra",
  "barPositionCenter": "Centro",
  "barPositionRight": "Destra",
  "barPositionTop": "In alto",
  "barPositionBottom": "In basso",
  "barPositionHint": "Sposta il widget nella barra di Omarchy.",
  "barPositionMissing": "Il widget non è nella barra.",
  "showAlways": "Sempre",
  "showOnHover": "Al passaggio",
  "menubarHoverHint": "Le voci «Al passaggio» compaiono mentre il puntatore è sul meteo nella barra.",
  "barBehavior": "Comportamento",
  "openWidgetOnHover": "Apri il widget al passaggio del mouse",
  "openWidgetOnHoverHint": "Apre il widget quando il puntatore si ferma sul meteo nella barra e lo chiude quando si allontana. Un clic lo tiene aperto.",
  "rainIntensity": "Intensità della pioggia",
  "showWhenRelevant": "Quando rilevante",
  "menubarRelevantCurrentHint": "«Quando rilevante» mostra una voce solo se si distingue: percepita a 3° dalla temperatura, vento da 20 km/h, UV da 6.",
  "menubarRelevantRainHint": "«Quando rilevante»: probabilità dal 30 %, intensità mentre piove, inizio della pioggia entro due ore. L’inizio della pioggia e l’intensità prendono il posto della probabilità.",
  "menubarRelevantAirHint": "«Quando rilevante»: qualità dell’aria da «scarsa», polline a livello alto.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Altre unità al passaggio",
  "hoverUnitSystemOff": "Disattivato",
  "hoverUnitSystemHint": "Mentre il puntatore è sul widget, la barra passa a questo sistema di unità. Kelvin cambia solo le temperature.",
  "restoreOrder": "Ripristina l’ordine",
  "sunNext": "Prossimo evento solare",
  "sunrise": "Alba",
  "sunset": "Tramonto",
  "moonPhase": "Fase lunare",
  "moon": "Luna"
})

addCatalogEntries("nl", {
  "settingsPageDisplay": "Weergave",
  "settingsPageShortcuts": "Sneltoetsen",
  "settingsPageSources": "Bronnen",
  "shortcutsSubtitle": "Toetsenbord en muis",
  "sourcesSubtitle": "Waar de gegevens vandaan komen",
  "shortcutsHint": "Dezelfde toetsen werken in de widget en in de app.",
  "shortcutsGroupGeneral": "ALGEMEEN",
  "shortcutsGroupNavigation": "SCROLLEN",
  "shortcutsGroupForecast": "REGEN, RADAR EN WIND",
  "shortcutsGroupSearch": "PLAATS ZOEKEN",
  "shortcutsGroupSettings": "INSTELLINGEN",
  "shortcutsGroupMouse": "MENUBALK",
  "shortcutClose": "Zoeken, instellingen of lijst sluiten, daarna het paneel",
  "shortcutSwitchPanel": "Volgend / vorig paneel in de balk (widget)",
  "shortcutSettings": "Instellingen openen",
  "shortcutRefresh": "Nu verversen",
  "shortcutSearch": "Plaats zoeken",
  "shortcutScroll": "Scrollen",
  "shortcutPage": "Een pagina scrollen",
  "shortcutJump": "Naar begin / einde",
  "shortcutScrollDaily": "Dagverwachting scrollen",
  "shortcutViews": "Weergave regen / radar / wind",
  "shortcutRadarStep": "Radar: vorig / volgend beeld",
  "shortcutRadarPlay": "Radar: afspelen / pauzeren",
  "shortcutZoom": "Kaart: in- / uitzoomen",
  "shortcutZoomReset": "Kaart: standaardzoom",
  "shortcutSearchSelect": "Resultaat kiezen",
  "shortcutSearchSection": "Wisselen tussen resultaten en favorieten",
  "shortcutSearchPick": "Gekozen plaats tonen",
  "shortcutSearchFavorite": "Favoriet toevoegen / verwijderen",
  "shortcutSearchCancel": "Zoeken annuleren",
  "shortcutSettingsPages": "Vorige / volgende instellingenpagina",
  "shortcutSettingsClose": "Instellingen sluiten",
  "mouseLeft": "Linksklik",
  "mouseMiddle": "Middelklik",
  "mouseRight": "Rechtsklik",
  "shortcutMouseToggle": "Weerpaneel openen / sluiten",
  "shortcutMouseRefresh": "Nu verversen",
  "shortcutMouseNotify": "Weer als melding",
  "sourcesHint": "Bronnen worden per plaats gekozen; valt er een uit, dan neemt de volgende het automatisch over.",
  "sourceInUse": "IN GEBRUIK",
  "sourceNotInUse": "niet in gebruik",
  "sourceGroupForecast": "Actueel weer en verwachting",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (het beste nationale model per regio), met MET Norway als reserve. In Noorwegen, Zweden, Finland en Denemarken gaat MET Norway voor, gesteund door zijn MET Nordic-model van 1 km. In het DWD-gebied verfijnt DWD MOSMIX (via Bright Sky) temperatuur, regen en symbolen.",
  "sourceCoverage": "DEKKING",
  "sourceGroupForecastCoverage": "Wereldwijd. MET Norway eerst in NO, SE, FI, DK. DWD MOSMIX alleen in het DWD-gebied (ca. 46,5–55,5° N, 5–16° O, ook buiten Duitsland).",
  "sourceGroupUvCoverage": "Wereldwijd.",
  "sourceGroupNowcastCoverage": "Wereldwijd. MOSMIX-regenwaarden en de DWD-radarhoeveelheid alleen in het DWD-gebied.",
  "sourceGroupRadarCoverage": "DWD-gebied (ca. 46,5–55,5° N, 5–16° O) · VS incl. Alaska, Hawaï, Puerto Rico en Guam (NWS) · Canada (ECCC) · elders RainViewer (laatste twee uur) · als laatste redmiddel: modelneerslag van Open-Meteo of MET Norway.",
  "sourceGroupWindCoverage": "Wereldwijd.",
  "sourceGroupWarningsCoverage": "Duitsland: DWD, MeteoAlarm als reserve · MeteoAlarm in 39 landen: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · VS: NWS · Canada: ECCC · elders geen waarschuwingen.",
  "sourceGroupLocationCoverage": "Wereldwijd.",
  "sourceGroupMapCoverage": "Wereldwijd. Plaatsnamen om beurten van drie Overpass-servers: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Wereldwijd; gespiegeld ten zuiden van de evenaar.",
  "sourceGroupUv": "UV-index",
  "sourceGroupUvDetails": "UV-verwachting per uur en per dag van Open-Meteo.",
  "sourceGroupNowcast": "Regen in de komende twee uur",
  "sourceGroupNowcastDetails": "Tijdas van 15 minuten uit de verwachting. In het DWD-gebied worden de komende twee uur opgebouwd uit de nowcast van de DWD-radar via Bright Sky: regen die al valt, verplaatst langs zijn baan. Hoeveelheden en het begin van de regen zijn het gemiddelde over 3 × 3 km rond de plaats. De kans combineert hoeveel van de omgeving de radar nat toont – nu ongeveer 1 km, over twee uur 10 km vanwege de groeiende onzekerheid – met de kans uit DWD MOSMIX, die zwaarder weegt naarmate het verder vooruit is, omdat de radar buien die nog moeten ontstaan niet kan voorzien. De uurverwachting neemt deze waarden over voor de uren die ze dekken. Voorbij de radar, en elders, komen alle waarden uit de verwachting.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarbeelden van de officiële regionale dienst; RainViewer springt elders en bij uitval in. Zonder radar toont de kaart modelneerslag.",
  "sourceGroupWind": "Windkaart",
  "sourceGroupWindDetails": "Open-Meteo-raster van 35 punten over het kaartgebied; anders de verwachte wind op de plaats. De windkaart toont de wind op 10 m hoogte.",
  "sourceGroupDrift": "Pijl voor regenverplaatsing",
  "sourceGroupDriftDetails": "Waarheen de regen op de radar trekt, voor het getoonde beeld. In het DWD-gebied wordt de beweging in de radar zelf gevolgd door het regenpatroon te vergelijken met dat van 15 minuten later. Elders, of bij te weinig regen om te volgen, wordt de modelwind op ongeveer 3 km (700 hPa) gebruikt, anders de wind aan de grond. Regen trekt mee met de wind op enkele kilometers hoogte, die vaak uit een andere richting waait dan de wind bij de grond op de windkaart – op buiige dagen tientallen graden.",
  "sourceGroupDriftCoverage": "Radarvolging in het DWD-gebied (ca. 46,5–55,5° N, 5–16° O) · 700 hPa-wind wereldwijd.",
  "sourceGroupWarnings": "Weerwaarschuwingen",
  "sourceGroupWarningsDetails": "Officiële waarschuwingen voor de plaats: DWD via Bright Sky, de Europese MeteoAlarm-feed (de JSON-API als de feed uitvalt), de Amerikaanse National Weather Service of Environment and Climate Change Canada.",
  "sourceGroupLocation": "Plaats",
  "sourceGroupLocationDetails": "Automatische detectie via IP-adres: ipwho.is, dan ipapi.co, dan GeoJS. Voor een gekozen plaats worden naam, regio en land eenmalig opgezocht via Nominatim (OpenStreetMap). Plaatsen zoeken: Open-Meteo Geocoding.",
  "sourceGroupMap": "Kaartachtergrond en namen",
  "sourceGroupMapDetails": "Satellietachtergrond: DWD GeoServer Blue Marble. Plaatsnamen: OpenStreetMap via de Overpass-API, 30 dagen in cache.",
  "sourceGroupMoon": "Maanfase",
  "sourceGroupMoonDetails": "Lokaal berekend (Meeus); gespiegeld voor plaatsen ten zuiden van de evenaar.",
  "sourceLocalCalculation": "LOKALE BEREKENING",
  "sourceRefreshInfo": "Elke {minutes} min ververst, de DWD-radar elke 5 min, gedeeld tussen widget en app. Laatste update: {updated}.",
  "barPosition": "Positie in de balk",
  "barPositionLeft": "Links",
  "barPositionCenter": "Midden",
  "barPositionRight": "Rechts",
  "barPositionTop": "Boven",
  "barPositionBottom": "Onder",
  "barPositionHint": "Verplaatst de widget binnen de balk van Omarchy.",
  "barPositionMissing": "De widget staat niet in de balk.",
  "showAlways": "Altijd",
  "showOnHover": "Bij aanwijzen",
  "menubarHoverHint": "Items met ‘Bij aanwijzen’ verschijnen zolang de aanwijzer op het weer in de balk staat.",
  "barBehavior": "Gedrag",
  "openWidgetOnHover": "Widget openen bij aanwijzen",
  "openWidgetOnHoverHint": "Opent de widget wanneer de aanwijzer op het weer in de balk rust en sluit hem zodra de aanwijzer weggaat. Een klik houdt hem open.",
  "rainIntensity": "Regenintensiteit",
  "showWhenRelevant": "Als het opvalt",
  "menubarRelevantCurrentHint": "‘Als het opvalt’ toont een item alleen als het opvalt: gevoelstemperatuur 3° van de temperatuur, wind vanaf 20 km/u, UV vanaf 6.",
  "menubarRelevantRainHint": "‘Als het opvalt’: kans vanaf 30 %, intensiteit zolang het regent, begin van de regen binnen twee uur. Het begin van de regen en de intensiteit nemen de plaats van de kans in.",
  "menubarRelevantAirHint": "‘Als het opvalt’: luchtkwaliteit vanaf ‘slecht’, pollen op een hoog niveau.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Andere eenheden bij aanwijzen",
  "hoverUnitSystemOff": "Uit",
  "hoverUnitSystemHint": "Zolang de aanwijzer op de widget rust, schakelt de balk over op dit eenhedenstelsel. Kelvin verandert alleen temperaturen.",
  "restoreOrder": "Volgorde herstellen",
  "sunNext": "Eerstvolgende zonnestand",
  "sunrise": "Zonsopkomst",
  "sunset": "Zonsondergang",
  "moonPhase": "Maanfase",
  "moon": "Maan"
})

addCatalogEntries("tr", {
  "settingsPageDisplay": "Görünüm",
  "settingsPageShortcuts": "Kısayollar",
  "settingsPageSources": "Kaynaklar",
  "shortcutsSubtitle": "Klavye ve fare",
  "sourcesSubtitle": "Verilerin nereden geldiği",
  "shortcutsHint": "Aynı tuşlar bileşende ve uygulamada çalışır.",
  "shortcutsGroupGeneral": "GENEL",
  "shortcutsGroupNavigation": "KAYDIRMA",
  "shortcutsGroupForecast": "YAĞMUR, RADAR VE RÜZGÂR",
  "shortcutsGroupSearch": "YER ARAMA",
  "shortcutsGroupSettings": "AYARLAR",
  "shortcutsGroupMouse": "MENÜ ÇUBUĞU",
  "shortcutClose": "Aramayı, ayarları veya listeyi, ardından paneli kapat",
  "shortcutSwitchPanel": "Çubuktaki sonraki / önceki panel (bileşen)",
  "shortcutSettings": "Ayarları aç",
  "shortcutRefresh": "Şimdi yenile",
  "shortcutSearch": "Yer ara",
  "shortcutScroll": "Kaydır",
  "shortcutPage": "Bir sayfa kaydır",
  "shortcutJump": "Başa / sona git",
  "shortcutScrollDaily": "Günlük tahmini kaydır",
  "shortcutViews": "Yağmur / radar / rüzgâr görünümü",
  "shortcutRadarStep": "Radar: önceki / sonraki kare",
  "shortcutRadarPlay": "Radar: oynat / duraklat",
  "shortcutZoom": "Harita: yakınlaştır / uzaklaştır",
  "shortcutZoomReset": "Harita: varsayılan yakınlaştırma",
  "shortcutSearchSelect": "Bir sonuç seç",
  "shortcutSearchSection": "Sonuçlar ve favoriler arasında geçiş yap",
  "shortcutSearchPick": "Seçilen yeri göster",
  "shortcutSearchFavorite": "Favori ekle / kaldır",
  "shortcutSearchCancel": "Aramayı iptal et",
  "shortcutSettingsPages": "Önceki / sonraki ayarlar sayfası",
  "shortcutSettingsClose": "Ayarları kapat",
  "mouseLeft": "Sol tık",
  "mouseMiddle": "Orta tık",
  "mouseRight": "Sağ tık",
  "shortcutMouseToggle": "Hava durumu panelini aç / kapat",
  "shortcutMouseRefresh": "Şimdi yenile",
  "shortcutMouseNotify": "Hava durumunu bildirim olarak göster",
  "sourcesHint": "Kaynaklar yere göre seçilir; biri yanıt vermezse sıradaki otomatik olarak devreye girer.",
  "sourceInUse": "KULLANIMDA",
  "sourceNotInUse": "kullanılmıyor",
  "sourceGroupForecast": "Güncel hava ve tahmin",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (her bölge için en iyi ulusal model), yedek olarak MET Norway. Norveç, İsveç, Finlandiya ve Danimarka'da 1 km'lik MET Nordic modeline dayanan MET Norway önce gelir. DWD bölgesinde DWD MOSMIX (Bright Sky üzerinden) sıcaklığı, yağışı ve simgeleri iyileştirir.",
  "sourceCoverage": "KAPSAM",
  "sourceGroupForecastCoverage": "Dünya geneli. NO, SE, FI, DK'de önce MET Norway. DWD MOSMIX yalnızca DWD bölgesinde (yaklaşık 46,5–55,5° K, 5–16° D; Almanya dışı dahil).",
  "sourceGroupUvCoverage": "Dünya geneli.",
  "sourceGroupNowcastCoverage": "Dünya geneli. MOSMIX yağış değerleri ve DWD radar miktarı yalnızca DWD bölgesinde.",
  "sourceGroupRadarCoverage": "DWD bölgesi (yaklaşık 46,5–55,5° K, 5–16° D) · Alaska, Hawaii, Porto Riko ve Guam dahil ABD (NWS) · Kanada (ECCC) · diğer her yerde RainViewer (son iki saat) · son çare: Open-Meteo veya MET Norway model yağışı.",
  "sourceGroupWindCoverage": "Dünya geneli.",
  "sourceGroupWarningsCoverage": "Almanya: DWD, yedek olarak MeteoAlarm · 39 ülkede MeteoAlarm: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · ABD: NWS · Kanada: ECCC · başka hiçbir yerde uyarı yok.",
  "sourceGroupLocationCoverage": "Dünya geneli.",
  "sourceGroupMapCoverage": "Dünya geneli. Yer adları sırayla üç Overpass sunucusundan: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Dünya geneli; ekvatorun güneyinde ayna görüntüsü.",
  "sourceGroupUv": "UV indeksi",
  "sourceGroupUvDetails": "Open-Meteo'dan saatlik ve günlük UV tahmini.",
  "sourceGroupNowcast": "Önümüzdeki iki saatteki yağış",
  "sourceGroupNowcastDetails": "Tahminden 15 dakikalık zaman ekseni. DWD bölgesinde önümüzdeki iki saat, Bright Sky üzerinden DWD radar anlık tahmininden oluşturulur: hâlihazırda düşen yağış, izlediği yol boyunca ilerletilir. Miktarlar ve yağışın başlangıcı, yerin çevresindeki 3 × 3 km'nin ortalamasıdır. Olasılık, radarın çevrenin ne kadarını ıslak gösterdiğini – şimdi yaklaşık 1 km, artan belirsizlik nedeniyle iki saat sonra 10 km – DWD MOSMIX olasılığıyla birleştirir; bu olasılık ileriye gidildikçe daha çok ağırlık taşır, çünkü radar henüz oluşmamış sağanakları öngöremez. Saatlik tahmin, kapsadıkları saatler için bu değerleri kullanır. Radarın ötesinde ve diğer yerlerde tüm değerler tahminden gelir.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Resmî bölgesel servisten radar görüntüleri; diğer yerlerde ve servis yanıt vermediğinde RainViewer devreye girer. Hiç radar yoksa harita model yağışını gösterir.",
  "sourceGroupWind": "Rüzgâr haritası",
  "sourceGroupWindDetails": "Harita alanı üzerinde 35 noktalı Open-Meteo ızgarası; aksi hâlde yerdeki tahmini rüzgâr. Rüzgâr haritası yerden 10 m yükseklikteki rüzgârı gösterir.",
  "sourceGroupDrift": "Yağış hareket oku",
  "sourceGroupDriftDetails": "Radardaki yağışın, gösterilen karede nereye doğru ilerlediği. DWD bölgesinde hareket radarın kendisinden izlenir: yağış deseni 15 dakika sonrakiyle karşılaştırılır. Başka yerlerde ya da izlenecek yağış çok azsa yaklaşık 3 km'deki (700 hPa) model rüzgârı, o da yoksa yer rüzgârı kullanılır. Yağış birkaç kilometre yükseklikteki rüzgârla hareket eder; bu rüzgâr çoğu zaman rüzgâr haritasındaki yere yakın rüzgârdan farklı bir yönden eser, sağanaklı günlerde onlarca derece.",
  "sourceGroupDriftCoverage": "DWD bölgesinde radar izleme (yaklaşık 46,5–55,5° K, 5–16° D) · dünya genelinde 700 hPa rüzgârı.",
  "sourceGroupWarnings": "Hava uyarıları",
  "sourceGroupWarningsDetails": "Yer için resmî uyarılar: Bright Sky üzerinden DWD, Avrupa MeteoAlarm akışı (akış yanıt vermezse JSON API'si), ABD Ulusal Hava Servisi veya Environment and Climate Change Canada.",
  "sourceGroupLocation": "Yer",
  "sourceGroupLocationDetails": "IP adresiyle otomatik algılama: ipwho.is, ardından ipapi.co, ardından GeoJS. Seçilen bir yer için ad, ilçe ve ülke bir kez Nominatim (OpenStreetMap) üzerinden alınır. Yer arama: Open-Meteo Geocoding.",
  "sourceGroupMap": "Harita arka planı ve adlar",
  "sourceGroupMapDetails": "Uydu arka planı: DWD GeoServer Blue Marble. Şehir adları: Overpass API üzerinden OpenStreetMap, 30 gün önbellekte.",
  "sourceGroupMoon": "Ay evresi",
  "sourceGroupMoonDetails": "Yerel olarak hesaplanır (Meeus); ekvatorun güneyindeki yerler için ayna görüntüsü.",
  "sourceLocalCalculation": "YEREL HESAPLAMA",
  "sourceRefreshInfo": "Her {minutes} dakikada bir yenilenir, DWD radarı her 5 dakikada bir; bileşen ve uygulama arasında paylaşılır. Son güncelleme: {updated}.",
  "barPosition": "Çubuktaki konum",
  "barPositionLeft": "Sol",
  "barPositionCenter": "Orta",
  "barPositionRight": "Sağ",
  "barPositionTop": "Üst",
  "barPositionBottom": "Alt",
  "barPositionHint": "Bileşeni Omarchy çubuğunda taşır.",
  "barPositionMissing": "Bileşen çubukta değil.",
  "showAlways": "Her zaman",
  "showOnHover": "Üzerine gelince",
  "menubarHoverHint": "“Üzerine gelince” öğeleri, işaretçi çubuktaki hava durumunun üzerindeyken görünür.",
  "barBehavior": "Davranış",
  "openWidgetOnHover": "Üzerine gelince bileşeni aç",
  "openWidgetOnHoverHint": "İşaretçi çubuktaki hava durumunun üzerinde durduğunda bileşeni açar, işaretçi ayrıldığında kapatır. Tıklamak açık tutar.",
  "rainIntensity": "Yağış şiddeti",
  "showWhenRelevant": "Önemliyken",
  "menubarRelevantCurrentHint": "“Önemliyken” bir öğeyi yalnızca dikkat çektiğinde gösterir: hissedilen sıcaklık 3° farklıysa, rüzgâr 20 km/sa’ten, UV 6’dan itibaren.",
  "menubarRelevantRainHint": "“Önemliyken”: olasılık %30’dan, yağış sürerken şiddet, iki saat içindeki yağış başlangıcı. Yağış başlangıcı ve şiddet, olasılığın yerini alır.",
  "menubarRelevantAirHint": "“Önemliyken”: hava kalitesi “kötü”den itibaren, polen yüksek düzeyde.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Üzerine gelince başka birimler",
  "hoverUnitSystemOff": "Kapalı",
  "hoverUnitSystemHint": "İşaretçi bileşenin üzerindeyken çubuk bu birim sistemine geçer. Kelvin yalnızca sıcaklıkları değiştirir.",
  "restoreOrder": "Sırayı sıfırla",
  "sunNext": "Sıradaki güneş olayı",
  "sunrise": "Gün doğumu",
  "sunset": "Gün batımı",
  "moonPhase": "Ay evresi",
  "moon": "Ay"
})

addCatalogEntries("cs", {
  "settingsPageDisplay": "Zobrazení",
  "settingsPageShortcuts": "Zkratky",
  "settingsPageSources": "Zdroje",
  "shortcutsSubtitle": "Klávesnice a myš",
  "sourcesSubtitle": "Odkud data pocházejí",
  "shortcutsHint": "Stejné klávesy fungují ve widgetu i v aplikaci.",
  "shortcutsGroupGeneral": "OBECNÉ",
  "shortcutsGroupNavigation": "POSOUVÁNÍ",
  "shortcutsGroupForecast": "DÉŠŤ, RADAR A VÍTR",
  "shortcutsGroupSearch": "HLEDÁNÍ MÍSTA",
  "shortcutsGroupSettings": "NASTAVENÍ",
  "shortcutsGroupMouse": "PANEL NABÍDKY",
  "shortcutClose": "Zavřít hledání, nastavení nebo seznam, pak panel",
  "shortcutSwitchPanel": "Další / předchozí panel lišty (widget)",
  "shortcutSettings": "Otevřít nastavení",
  "shortcutRefresh": "Aktualizovat nyní",
  "shortcutSearch": "Hledat místo",
  "shortcutScroll": "Posouvat",
  "shortcutPage": "Posunout o stránku",
  "shortcutJump": "Na začátek / konec",
  "shortcutScrollDaily": "Posouvat denní předpověď",
  "shortcutViews": "Zobrazení déšť / radar / vítr",
  "shortcutRadarStep": "Radar: předchozí / další snímek",
  "shortcutRadarPlay": "Radar: přehrát / pozastavit",
  "shortcutZoom": "Mapa: přiblížit / oddálit",
  "shortcutZoomReset": "Mapa: výchozí přiblížení",
  "shortcutSearchSelect": "Vybrat výsledek",
  "shortcutSearchSection": "Přepnout mezi výsledky a oblíbenými",
  "shortcutSearchPick": "Zobrazit vybrané místo",
  "shortcutSearchFavorite": "Přidat / odebrat oblíbené",
  "shortcutSearchCancel": "Zrušit hledání",
  "shortcutSettingsPages": "Předchozí / další stránka nastavení",
  "shortcutSettingsClose": "Zavřít nastavení",
  "mouseLeft": "Levé kliknutí",
  "mouseMiddle": "Prostřední kliknutí",
  "mouseRight": "Pravé kliknutí",
  "shortcutMouseToggle": "Otevřít / zavřít panel počasí",
  "shortcutMouseRefresh": "Aktualizovat nyní",
  "shortcutMouseNotify": "Počasí jako oznámení",
  "sourcesHint": "Zdroje se volí podle místa; když některý selže, automaticky převezme další.",
  "sourceInUse": "POUŽÍVÁ SE",
  "sourceNotInUse": "nepoužívá se",
  "sourceGroupForecast": "Aktuální počasí a předpověď",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (nejlepší národní model pro danou oblast), záložně MET Norway. V Norsku, Švédsku, Finsku a Dánsku má přednost MET Norway s vlastním modelem MET Nordic s rozlišením 1 km. V oblasti DWD zpřesňuje DWD MOSMIX (přes Bright Sky) teplotu, srážky a symboly.",
  "sourceCoverage": "POKRYTÍ",
  "sourceGroupForecastCoverage": "Celosvětově. MET Norway jako první v NO, SE, FI, DK. DWD MOSMIX jen v oblasti DWD (asi 46,5–55,5° s. š., 5–16° v. d., i mimo Německo).",
  "sourceGroupUvCoverage": "Celosvětově.",
  "sourceGroupNowcastCoverage": "Celosvětově. Srážkové hodnoty MOSMIX a úhrn z radaru DWD jen v oblasti DWD.",
  "sourceGroupRadarCoverage": "Oblast DWD (asi 46,5–55,5° s. š., 5–16° v. d.) · USA vč. Aljašky, Havaje, Portorika a Guamu (NWS) · Kanada (ECCC) · jinde RainViewer (poslední dvě hodiny) · nakonec: srážky z modelu Open-Meteo nebo MET Norway.",
  "sourceGroupWindCoverage": "Celosvětově.",
  "sourceGroupWarningsCoverage": "Německo: DWD, záložně MeteoAlarm · MeteoAlarm ve 39 zemích: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Kanada: ECCC · jinde žádná varování.",
  "sourceGroupLocationCoverage": "Celosvětově.",
  "sourceGroupMapCoverage": "Celosvětově. Názvy míst postupně ze tří serverů Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Celosvětově; na jih od rovníku zrcadlově.",
  "sourceGroupUv": "UV index",
  "sourceGroupUvDetails": "Hodinová a denní předpověď UV z Open-Meteo.",
  "sourceGroupNowcast": "Déšť v příštích dvou hodinách",
  "sourceGroupNowcastDetails": "Časová osa po 15 minutách z předpovědi. V oblasti DWD se příští dvě hodiny skládají z nowcastu radaru DWD přes Bright Sky: déšť, který už padá, posunutý podél své dráhy. Úhrny a začátek deště jsou průměrem plochy 3 × 3 km kolem místa. Pravděpodobnost spojuje, jakou část okolí radar ukazuje mokrou – teď asi 1 km, za dvě hodiny 10 km kvůli rostoucí nejistotě – s pravděpodobností z DWD MOSMIX, která má tím větší váhu, čím dál dopředu, protože přeháňky, které teprve vzniknou, radar předvídat nedokáže. Hodinová předpověď přebírá tyto hodnoty pro hodiny, které pokrývají. Za hranicí radaru a jinde pocházejí všechny hodnoty z předpovědi.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarové snímky od oficiální regionální služby; RainViewer ji nahrazuje jinde a při výpadku. Bez radaru mapa ukazuje srážky z modelu.",
  "sourceGroupWind": "Mapa větru",
  "sourceGroupWindDetails": "Síť Open-Meteo s 35 body přes výřez mapy; jinak předpovídaný vítr v místě. Mapa větru ukazuje vítr ve výšce 10 m.",
  "sourceGroupDrift": "Šipka postupu srážek",
  "sourceGroupDriftDetails": "Kam se srážky na radaru přesouvají – pro zobrazený snímek. V oblasti DWD se pohyb sleduje přímo v radaru porovnáním rozložení srážek s tím o 15 minut později. Jinde, nebo při příliš malých srážkách, se použije modelový vítr ve výšce asi 3 km (700 hPa), jinak přízemní vítr. Srážky se pohybují s větrem v několika kilometrech výšky, který často vane z jiného směru než přízemní vítr na mapě větru – ve dnech s přeháňkami o několik desítek stupňů.",
  "sourceGroupDriftCoverage": "Sledování radarem v oblasti DWD (asi 46,5–55,5° s. š., 5–16° v. d.) · vítr 700 hPa celosvětově.",
  "sourceGroupWarnings": "Meteorologická varování",
  "sourceGroupWarningsDetails": "Oficiální varování pro místo: DWD přes Bright Sky, evropský kanál MeteoAlarm (při výpadku jeho JSON API), americká National Weather Service nebo Environment and Climate Change Canada.",
  "sourceGroupLocation": "Místo",
  "sourceGroupLocationDetails": "Automatické zjištění podle IP adresy: ipwho.is, pak ipapi.co, pak GeoJS. U zvoleného místa se název, okres a země zjistí jednou přes Nominatim (OpenStreetMap). Hledání míst: Open-Meteo Geocoding.",
  "sourceGroupMap": "Podklad mapy a názvy",
  "sourceGroupMapDetails": "Satelitní podklad: DWD GeoServer Blue Marble. Názvy měst: OpenStreetMap přes Overpass API, uložené na 30 dní.",
  "sourceGroupMoon": "Fáze Měsíce",
  "sourceGroupMoonDetails": "Počítána lokálně (Meeus); pro místa jižně od rovníku zrcadlově.",
  "sourceLocalCalculation": "MÍSTNÍ VÝPOČET",
  "sourceRefreshInfo": "Aktualizace každých {minutes} min, radar DWD každých 5 min, společně pro widget a aplikaci. Poslední aktualizace: {updated}.",
  "barPosition": "Umístění na liště",
  "barPositionLeft": "Vlevo",
  "barPositionCenter": "Uprostřed",
  "barPositionRight": "Vpravo",
  "barPositionTop": "Nahoře",
  "barPositionBottom": "Dole",
  "barPositionHint": "Přesune widget v rámci lišty Omarchy.",
  "barPositionMissing": "Widget není na liště.",
  "showAlways": "Vždy",
  "showOnHover": "Při najetí",
  "menubarHoverHint": "Položky „Při najetí“ se zobrazí, dokud je ukazatel nad počasím v liště.",
  "barBehavior": "Chování",
  "openWidgetOnHover": "Otevřít widget při najetí",
  "openWidgetOnHoverHint": "Otevře widget, když se ukazatel zastaví nad počasím v liště, a zavře ho, jakmile se vzdálí. Kliknutím zůstane otevřený.",
  "rainIntensity": "Intenzita deště",
  "showWhenRelevant": "Když je to důležité",
  "menubarRelevantCurrentHint": "„Když je to důležité“ zobrazí položku jen tehdy, když vyčnívá: pocitová teplota 3° od skutečné, vítr od 20 km/h, UV od 6.",
  "menubarRelevantRainHint": "„Když je to důležité“: pravděpodobnost od 30 %, intenzita po dobu deště, začátek deště do dvou hodin. Začátek deště a intenzita zaujmou místo pravděpodobnosti.",
  "menubarRelevantAirHint": "„Když je to důležité“: kvalita ovzduší od „špatné“, pyl na vysoké úrovni.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Jiné jednotky při najetí",
  "hoverUnitSystemOff": "Vypnuto",
  "hoverUnitSystemHint": "Dokud ukazatel spočívá na widgetu, lišta přejde na tuto soustavu jednotek. Kelvin mění jen teploty.",
  "restoreOrder": "Obnovit pořadí",
  "sunNext": "Nejbližší událost slunce",
  "sunrise": "Východ slunce",
  "sunset": "Západ slunce",
  "moonPhase": "Fáze Měsíce",
  "moon": "Měsíc"
})

addCatalogEntries("sv", {
  "settingsPageDisplay": "Visning",
  "settingsPageShortcuts": "Kortkommandon",
  "settingsPageSources": "Källor",
  "shortcutsSubtitle": "Tangentbord och mus",
  "sourcesSubtitle": "Var data kommer ifrån",
  "shortcutsHint": "Samma tangenter fungerar i widgeten och i appen.",
  "shortcutsGroupGeneral": "ALLMÄNT",
  "shortcutsGroupNavigation": "RULLNING",
  "shortcutsGroupForecast": "REGN, RADAR OCH VIND",
  "shortcutsGroupSearch": "PLATSSÖKNING",
  "shortcutsGroupSettings": "INSTÄLLNINGAR",
  "shortcutsGroupMouse": "MENYRAD",
  "shortcutClose": "Stäng sökning, inställningar eller lista, sedan panelen",
  "shortcutSwitchPanel": "Nästa / föregående panel i fältet (widget)",
  "shortcutSettings": "Öppna inställningar",
  "shortcutRefresh": "Uppdatera nu",
  "shortcutSearch": "Sök en plats",
  "shortcutScroll": "Rulla",
  "shortcutPage": "Rulla en sida",
  "shortcutJump": "Till början / slutet",
  "shortcutScrollDaily": "Rulla dagsprognosen",
  "shortcutViews": "Vy regn / radar / vind",
  "shortcutRadarStep": "Radar: föregående / nästa bild",
  "shortcutRadarPlay": "Radar: spela upp / pausa",
  "shortcutZoom": "Karta: zooma in / ut",
  "shortcutZoomReset": "Karta: standardzoom",
  "shortcutSearchSelect": "Välj ett resultat",
  "shortcutSearchSection": "Växla mellan resultat och favoriter",
  "shortcutSearchPick": "Visa vald plats",
  "shortcutSearchFavorite": "Lägg till / ta bort favorit",
  "shortcutSearchCancel": "Avbryt sökningen",
  "shortcutSettingsPages": "Föregående / nästa inställningssida",
  "shortcutSettingsClose": "Stäng inställningar",
  "mouseLeft": "Vänsterklick",
  "mouseMiddle": "Mittenklick",
  "mouseRight": "Högerklick",
  "shortcutMouseToggle": "Öppna / stäng väderpanelen",
  "shortcutMouseRefresh": "Uppdatera nu",
  "shortcutMouseNotify": "Väder som avisering",
  "sourcesHint": "Källor väljs per plats; om en slutar svara tar nästa över automatiskt.",
  "sourceInUse": "ANVÄNDS",
  "sourceNotInUse": "används inte",
  "sourceGroupForecast": "Aktuellt väder och prognos",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (bästa nationella modell per region), med MET Norway som reserv. I Norge, Sverige, Finland och Danmark går MET Norway först, med sin egen MET Nordic-modell på 1 km. I DWD-området förfinar DWD MOSMIX (via Bright Sky) temperatur, regn och symboler.",
  "sourceCoverage": "TÄCKNING",
  "sourceGroupForecastCoverage": "Hela världen. MET Norway först i NO, SE, FI, DK. DWD MOSMIX bara i DWD-området (ca 46,5–55,5° N, 5–16° O, även utanför Tyskland).",
  "sourceGroupUvCoverage": "Hela världen.",
  "sourceGroupNowcastCoverage": "Hela världen. Regnvärden från MOSMIX och mängden från DWD-radarn bara i DWD-området.",
  "sourceGroupRadarCoverage": "DWD-området (ca 46,5–55,5° N, 5–16° O) · USA inkl. Alaska, Hawaii, Puerto Rico och Guam (NWS) · Kanada (ECCC) · annars RainViewer (senaste två timmarna) · i sista hand: modellnederbörd från Open-Meteo eller MET Norway.",
  "sourceGroupWindCoverage": "Hela världen.",
  "sourceGroupWarningsCoverage": "Tyskland: DWD, MeteoAlarm som reserv · MeteoAlarm i 39 länder: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Kanada: ECCC · inga varningar på andra håll.",
  "sourceGroupLocationCoverage": "Hela världen.",
  "sourceGroupMapCoverage": "Hela världen. Ortnamn i tur och ordning från tre Overpass-servrar: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Hela världen; spegelvänd söder om ekvatorn.",
  "sourceGroupUv": "UV-index",
  "sourceGroupUvDetails": "UV-prognos per timme och dag från Open-Meteo.",
  "sourceGroupNowcast": "Regn de närmaste två timmarna",
  "sourceGroupNowcastDetails": "Tidsaxel på 15 minuter från prognosen. I DWD-området byggs de kommande två timmarna av DWD-radarns nowcast via Bright Sky: regn som redan faller, förflyttat längs sin bana. Mängderna och när regnet börjar är medelvärdet över 3 × 3 km runt platsen. Sannolikheten kombinerar hur stor del av omgivningen radarn visar blöt – nu ungefär 1 km, om två timmar 10 km för den växande osäkerheten – med sannolikheten från DWD MOSMIX, som väger tyngre ju längre fram det gäller, eftersom radarn inte kan förutse skurar som ännu inte har bildats. Timprognosen tar dessa värden för de timmar de täcker. Bortom radarn, och annars, kommer alla värden från prognosen.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarbilder från den officiella regionala tjänsten; RainViewer tar över på andra håll och vid avbrott. Utan radar visar kartan modellnederbörd.",
  "sourceGroupWind": "Vindkarta",
  "sourceGroupWindDetails": "Open-Meteo-rutnät med 35 punkter över kartans yta; annars prognosvinden på platsen. Vindkartan visar vinden 10 m över marken.",
  "sourceGroupDrift": "Pil för regnets förflyttning",
  "sourceGroupDriftDetails": "Vart regnet på radarn är på väg, för bilden som visas. Inom DWD-området följs rörelsen i själva radarn genom att regnmönstret jämförs med det 15 minuter senare. Annars, eller när det finns för lite regn att följa, används modellvinden på ungefär 3 km (700 hPa), i sista hand vinden vid marken. Regn rör sig med vinden några kilometer upp, som ofta blåser från ett annat håll än vinden nära marken på vindkartan – under skurdagar med flera tiotals grader.",
  "sourceGroupDriftCoverage": "Radarspårning inom DWD-området (ca 46,5–55,5° N, 5–16° O) · 700 hPa-vind i hela världen.",
  "sourceGroupWarnings": "Vädervarningar",
  "sourceGroupWarningsDetails": "Officiella varningar för platsen: DWD via Bright Sky, det europeiska MeteoAlarm-flödet (dess JSON-API om flödet slutar svara), amerikanska National Weather Service eller Environment and Climate Change Canada.",
  "sourceGroupLocation": "Plats",
  "sourceGroupLocationDetails": "Automatisk identifiering via IP-adress: ipwho.is, sedan ipapi.co, sedan GeoJS. För en vald plats hämtas namn, län och land en gång via Nominatim (OpenStreetMap). Platssökning: Open-Meteo Geocoding.",
  "sourceGroupMap": "Kartbakgrund och namn",
  "sourceGroupMapDetails": "Satellitbakgrund: DWD GeoServer Blue Marble. Stadsnamn: OpenStreetMap via Overpass-API:t, cachade i 30 dagar.",
  "sourceGroupMoon": "Månfas",
  "sourceGroupMoonDetails": "Beräknas lokalt (Meeus); spegelvänd för platser söder om ekvatorn.",
  "sourceLocalCalculation": "LOKAL BERÄKNING",
  "sourceRefreshInfo": "Uppdateras var {minutes}:e min, DWD-radarn var 5:e min, gemensamt för widget och app. Senaste uppdatering: {updated}.",
  "barPosition": "Placering i fältet",
  "barPositionLeft": "Vänster",
  "barPositionCenter": "Mitten",
  "barPositionRight": "Höger",
  "barPositionTop": "Överst",
  "barPositionBottom": "Nederst",
  "barPositionHint": "Flyttar widgeten i Omarchys fält.",
  "barPositionMissing": "Widgeten finns inte i fältet.",
  "showAlways": "Alltid",
  "showOnHover": "Vid hovring",
  "menubarHoverHint": "Poster med ”Vid hovring” visas medan pekaren vilar på vädret i fältet.",
  "barBehavior": "Beteende",
  "openWidgetOnHover": "Öppna widgeten vid hovring",
  "openWidgetOnHoverHint": "Öppnar widgeten när pekaren vilar på vädret i fältet och stänger den när pekaren flyttas bort. Ett klick håller den öppen.",
  "rainIntensity": "Regnintensitet",
  "showWhenRelevant": "När det märks",
  "menubarRelevantCurrentHint": "”När det märks” visar en post bara när den sticker ut: känns som 3° från temperaturen, vind från 20 km/h, UV från 6.",
  "menubarRelevantRainHint": "”När det märks”: sannolikhet från 30 %, intensitet medan det regnar, regnstart inom två timmar. Regnstarten och intensiteten tar sannolikhetens plats.",
  "menubarRelevantAirHint": "”När det märks”: luftkvalitet från ”dålig”, pollen på hög nivå.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Andra enheter vid hovring",
  "hoverUnitSystemOff": "Av",
  "hoverUnitSystemHint": "Medan pekaren vilar på widgeten byter fältet till detta enhetssystem. Kelvin ändrar bara temperaturer.",
  "restoreOrder": "Återställ ordningen",
  "sunNext": "Nästa solhändelse",
  "sunrise": "Soluppgång",
  "sunset": "Solnedgång",
  "moonPhase": "Månfas",
  "moon": "Måne"
})

addCatalogEntries("fi", {
  "settingsPageDisplay": "Näkymä",
  "settingsPageShortcuts": "Pikanäppäimet",
  "settingsPageSources": "Lähteet",
  "shortcutsSubtitle": "Näppäimistö ja hiiri",
  "sourcesSubtitle": "Mistä tiedot tulevat",
  "shortcutsHint": "Samat näppäimet toimivat pienoissovelluksessa ja sovelluksessa.",
  "shortcutsGroupGeneral": "YLEISET",
  "shortcutsGroupNavigation": "VIERITYS",
  "shortcutsGroupForecast": "SADE, TUTKA JA TUULI",
  "shortcutsGroupSearch": "PAIKKAHAKU",
  "shortcutsGroupSettings": "ASETUKSET",
  "shortcutsGroupMouse": "VALIKKORIVI",
  "shortcutClose": "Sulje haku, asetukset tai luettelo, sitten paneeli",
  "shortcutSwitchPanel": "Palkin seuraava / edellinen paneeli (pienoissovellus)",
  "shortcutSettings": "Avaa asetukset",
  "shortcutRefresh": "Päivitä nyt",
  "shortcutSearch": "Hae paikkaa",
  "shortcutScroll": "Vieritä",
  "shortcutPage": "Vieritä sivu",
  "shortcutJump": "Alkuun / loppuun",
  "shortcutScrollDaily": "Vieritä päiväennustetta",
  "shortcutViews": "Näkymä sade / tutka / tuuli",
  "shortcutRadarStep": "Tutka: edellinen / seuraava kuva",
  "shortcutRadarPlay": "Tutka: toista / tauko",
  "shortcutZoom": "Kartta: lähennä / loitonna",
  "shortcutZoomReset": "Kartta: oletuszoomaus",
  "shortcutSearchSelect": "Valitse tulos",
  "shortcutSearchSection": "Vaihda tulosten ja suosikkien välillä",
  "shortcutSearchPick": "Näytä valittu paikka",
  "shortcutSearchFavorite": "Lisää / poista suosikki",
  "shortcutSearchCancel": "Peru haku",
  "shortcutSettingsPages": "Edellinen / seuraava asetussivu",
  "shortcutSettingsClose": "Sulje asetukset",
  "mouseLeft": "Vasen napsautus",
  "mouseMiddle": "Keskinapsautus",
  "mouseRight": "Oikea napsautus",
  "shortcutMouseToggle": "Avaa / sulje sääpaneeli",
  "shortcutMouseRefresh": "Päivitä nyt",
  "shortcutMouseNotify": "Sää ilmoituksena",
  "sourcesHint": "Lähteet valitaan paikan mukaan; jos yksi ei vastaa, seuraava ottaa automaattisesti vastuun.",
  "sourceInUse": "KÄYTÖSSÄ",
  "sourceNotInUse": "ei käytössä",
  "sourceGroupForecast": "Nykyinen sää ja ennuste",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (alueen paras kansallinen malli), varalla MET Norway. Norjassa, Ruotsissa, Suomessa ja Tanskassa MET Norway on ensisijainen oman 1 km:n MET Nordic -mallinsa ansiosta. DWD-alueella DWD MOSMIX (Bright Skyn kautta) tarkentaa lämpötilaa, sadetta ja symboleja.",
  "sourceCoverage": "KATTAVUUS",
  "sourceGroupForecastCoverage": "Koko maailma. MET Norway ensin maissa NO, SE, FI, DK. DWD MOSMIX vain DWD-alueella (n. 46,5–55,5° N, 5–16° E, myös Saksan ulkopuolella).",
  "sourceGroupUvCoverage": "Koko maailma.",
  "sourceGroupNowcastCoverage": "Koko maailma. MOSMIX-sadearvot ja DWD-tutkan sademäärä vain DWD-alueella.",
  "sourceGroupRadarCoverage": "DWD-alue (n. 46,5–55,5° N, 5–16° E) · Yhdysvallat sekä Alaska, Havaiji, Puerto Rico ja Guam (NWS) · Kanada (ECCC) · muualla RainViewer (kaksi viime tuntia) · viimeisenä keinona: Open-Meteon tai MET Norwayn mallisade.",
  "sourceGroupWindCoverage": "Koko maailma.",
  "sourceGroupWarningsCoverage": "Saksa: DWD, varalla MeteoAlarm · MeteoAlarm 39 maassa: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · Yhdysvallat: NWS · Kanada: ECCC · muualla ei varoituksia.",
  "sourceGroupLocationCoverage": "Koko maailma.",
  "sourceGroupMapCoverage": "Koko maailma. Paikannimet vuorotellen kolmelta Overpass-palvelimelta: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Koko maailma; peilattuna päiväntasaajan eteläpuolella.",
  "sourceGroupUv": "UV-indeksi",
  "sourceGroupUvDetails": "Open-Meteon tunti- ja päiväkohtainen UV-ennuste.",
  "sourceGroupNowcast": "Sade seuraavien kahden tunnin aikana",
  "sourceGroupNowcastDetails": "Ennusteen 15 minuutin aika-akseli. DWD-alueella seuraavat kaksi tuntia muodostetaan DWD-tutkan nowcastista Bright Skyn kautta: jo satava sade siirrettynä kulkureittiään pitkin. Sademäärät ja sateen alkaminen ovat keskiarvo 3 × 3 km:n alueelta paikan ympäriltä. Todennäköisyys yhdistää sen, kuinka suuren osan ympäristöstä tutka näyttää märkänä – nyt noin 1 km, kahden tunnin päästä 10 km kasvavan epävarmuuden vuoksi – DWD MOSMIXin todennäköisyyteen, jonka paino kasvaa mitä pidemmälle eteenpäin mennään, sillä tutka ei voi ennakoida kuuroja, jotka eivät ole vielä syntyneet. Tuntiennuste käyttää näitä arvoja niille tunneille, jotka ne kattavat. Tutkan ulottumattomissa ja muualla kaikki arvot tulevat ennusteesta.",
  "sourceGroupRadar": "Tutka",
  "sourceGroupRadarDetails": "Tutkakuvat viralliselta alueelliselta palvelulta; RainViewer korvaa sen muualla ja katkosten aikana. Ilman tutkaa kartta näyttää mallin sateen.",
  "sourceGroupWind": "Tuulikartta",
  "sourceGroupWindDetails": "Open-Meteon 35 pisteen ruudukko kartan alueella; muuten paikan ennustettu tuuli. Tuulikartta näyttää tuulen 10 metrin korkeudella.",
  "sourceGroupDrift": "Sateen liikkeen nuoli",
  "sourceGroupDriftDetails": "Mihin tutkan sade on liikkumassa näytetyssä kuvassa. DWD-alueella liikettä seurataan itse tutkasta vertaamalla sadekuviota 15 minuuttia myöhempään. Muualla, tai jos seurattavaa sadetta on liian vähän, käytetään mallin tuulta noin 3 km:n korkeudella (700 hPa), muuten pintatuulta. Sade liikkuu muutaman kilometrin korkeudella puhaltavan tuulen mukana, ja se puhaltaa usein eri suunnasta kuin tuulikartan maanpintaa lähellä oleva tuuli – kuuropäivinä kymmeniä asteita.",
  "sourceGroupDriftCoverage": "Tutkaseuranta DWD-alueella (n. 46,5–55,5° N, 5–16° E) · 700 hPa:n tuuli koko maailmassa.",
  "sourceGroupWarnings": "Säävaroitukset",
  "sourceGroupWarningsDetails": "Paikan viralliset varoitukset: DWD Bright Skyn kautta, eurooppalainen MeteoAlarm-syöte (sen JSON-rajapinta, jos syöte ei vastaa), Yhdysvaltain National Weather Service tai Environment and Climate Change Canada.",
  "sourceGroupLocation": "Paikka",
  "sourceGroupLocationDetails": "Automaattinen tunnistus IP-osoitteen perusteella: ipwho.is, sitten ipapi.co, sitten GeoJS. Valitulle paikalle nimi, maakunta ja maa haetaan kerran Nominatimin (OpenStreetMap) kautta. Paikkahaku: Open-Meteo Geocoding.",
  "sourceGroupMap": "Kartan tausta ja nimet",
  "sourceGroupMapDetails": "Satelliittitausta: DWD GeoServer Blue Marble. Kaupunkien nimet: OpenStreetMap Overpass-rajapinnan kautta, välimuistissa 30 päivää.",
  "sourceGroupMoon": "Kuun vaihe",
  "sourceGroupMoonDetails": "Lasketaan paikallisesti (Meeus); peilattuna päiväntasaajan eteläpuolisille paikoille.",
  "sourceLocalCalculation": "PAIKALLINEN LASKENTA",
  "sourceRefreshInfo": "Päivitys {minutes} min välein, DWD-tutka 5 min välein, yhteinen pienoissovellukselle ja sovellukselle. Viimeisin päivitys: {updated}.",
  "barPosition": "Sijainti palkissa",
  "barPositionLeft": "Vasen",
  "barPositionCenter": "Keskellä",
  "barPositionRight": "Oikea",
  "barPositionTop": "Ylhäällä",
  "barPositionBottom": "Alhaalla",
  "barPositionHint": "Siirtää pienoissovellusta Omarchyn palkissa.",
  "barPositionMissing": "Pienoissovellus ei ole palkissa.",
  "showAlways": "Aina",
  "showOnHover": "Osoitettaessa",
  "menubarHoverHint": "”Osoitettaessa”-kohteet näkyvät, kun osoitin on palkin sään päällä.",
  "barBehavior": "Toiminta",
  "openWidgetOnHover": "Avaa pienoissovellus osoitettaessa",
  "openWidgetOnHoverHint": "Avaa pienoissovelluksen, kun osoitin pysähtyy palkin sään päälle, ja sulkee sen, kun osoitin siirtyy pois. Napsautus pitää sen auki.",
  "rainIntensity": "Sateen voimakkuus",
  "showWhenRelevant": "Kun on oleellista",
  "menubarRelevantCurrentHint": "”Kun on oleellista” näyttää kohteen vain, kun se erottuu: tuntuu kuin 3° lämpötilasta, tuuli 20 km/h alkaen, UV 6 alkaen.",
  "menubarRelevantRainHint": "”Kun on oleellista”: todennäköisyys 30 %:sta, voimakkuus sateen ajan, sateen alku kahden tunnin sisällä. Sateen alku ja voimakkuus vievät todennäköisyyden paikan.",
  "menubarRelevantAirHint": "”Kun on oleellista”: ilmanlaatu ”huonosta” alkaen, siitepöly korkealla tasolla.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Muut yksiköt osoitettaessa",
  "hoverUnitSystemOff": "Pois",
  "hoverUnitSystemHint": "Kun osoitin on pienoissovelluksen päällä, palkki vaihtaa tähän yksikköjärjestelmään. Kelvin muuttaa vain lämpötilat.",
  "restoreOrder": "Palauta järjestys",
  "sunNext": "Seuraava auringon tapahtuma",
  "sunrise": "Auringonnousu",
  "sunset": "Auringonlasku",
  "moonPhase": "Kuun vaihe",
  "moon": "Kuu"
})

addCatalogEntries("nb", {
  "settingsPageDisplay": "Visning",
  "settingsPageShortcuts": "Hurtigtaster",
  "settingsPageSources": "Kilder",
  "shortcutsSubtitle": "Tastatur og mus",
  "sourcesSubtitle": "Hvor dataene kommer fra",
  "shortcutsHint": "De samme tastene virker i miniprogrammet og i appen.",
  "shortcutsGroupGeneral": "GENERELT",
  "shortcutsGroupNavigation": "RULLING",
  "shortcutsGroupForecast": "REGN, RADAR OG VIND",
  "shortcutsGroupSearch": "STEDSSØK",
  "shortcutsGroupSettings": "INNSTILLINGER",
  "shortcutsGroupMouse": "MENYLINJE",
  "shortcutClose": "Lukk søk, innstillinger eller liste, deretter panelet",
  "shortcutSwitchPanel": "Neste / forrige panel i linjen (miniprogram)",
  "shortcutSettings": "Åpne innstillinger",
  "shortcutRefresh": "Oppdater nå",
  "shortcutSearch": "Søk etter et sted",
  "shortcutScroll": "Rull",
  "shortcutPage": "Rull en side",
  "shortcutJump": "Til start / slutt",
  "shortcutScrollDaily": "Rull dagsvarselet",
  "shortcutViews": "Visning regn / radar / vind",
  "shortcutRadarStep": "Radar: forrige / neste bilde",
  "shortcutRadarPlay": "Radar: spill av / pause",
  "shortcutZoom": "Kart: zoom inn / ut",
  "shortcutZoomReset": "Kart: standardzoom",
  "shortcutSearchSelect": "Velg et resultat",
  "shortcutSearchSection": "Bytt mellom resultater og favoritter",
  "shortcutSearchPick": "Vis valgt sted",
  "shortcutSearchFavorite": "Legg til / fjern favoritt",
  "shortcutSearchCancel": "Avbryt søket",
  "shortcutSettingsPages": "Forrige / neste innstillingsside",
  "shortcutSettingsClose": "Lukk innstillinger",
  "mouseLeft": "Venstreklikk",
  "mouseMiddle": "Midtklikk",
  "mouseRight": "Høyreklikk",
  "shortcutMouseToggle": "Åpne / lukk værpanelet",
  "shortcutMouseRefresh": "Oppdater nå",
  "shortcutMouseNotify": "Været som varsel",
  "sourcesHint": "Kildene velges etter sted; svikter én, tar den neste over automatisk.",
  "sourceInUse": "I BRUK",
  "sourceNotInUse": "ikke i bruk",
  "sourceGroupForecast": "Været nå og varsel",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (den beste nasjonale modellen per region), med MET Norway som reserve. I Norge, Sverige, Finland og Danmark kommer MET Norway først, støttet av sin MET Nordic-modell på 1 km. I DWD-området finjusterer DWD MOSMIX (via Bright Sky) temperatur, regn og symboler.",
  "sourceCoverage": "DEKNING",
  "sourceGroupForecastCoverage": "Hele verden. MET Norway først i NO, SE, FI, DK. DWD MOSMIX bare i DWD-området (ca. 46,5–55,5° N, 5–16° Ø, også utenfor Tyskland).",
  "sourceGroupUvCoverage": "Hele verden.",
  "sourceGroupNowcastCoverage": "Hele verden. Regnverdier fra MOSMIX og mengden fra DWD-radaren bare i DWD-området.",
  "sourceGroupRadarCoverage": "DWD-området (ca. 46,5–55,5° N, 5–16° Ø) · USA inkl. Alaska, Hawaii, Puerto Rico og Guam (NWS) · Canada (ECCC) · ellers RainViewer (de siste to timene) · som siste utvei: modellnedbør fra Open-Meteo eller MET Norway.",
  "sourceGroupWindCoverage": "Hele verden.",
  "sourceGroupWarningsCoverage": "Tyskland: DWD, MeteoAlarm som reserve · MeteoAlarm i 39 land: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Canada: ECCC · ingen farevarsler andre steder.",
  "sourceGroupLocationCoverage": "Hele verden.",
  "sourceGroupMapCoverage": "Hele verden. Stedsnavn etter tur fra tre Overpass-servere: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Hele verden; speilvendt sør for ekvator.",
  "sourceGroupUv": "UV-indeks",
  "sourceGroupUvDetails": "UV-varsel per time og dag fra Open-Meteo.",
  "sourceGroupNowcast": "Regn de neste to timene",
  "sourceGroupNowcastDetails": "Tidsakse på 15 minutter fra varselet. I DWD-området bygges de neste to timene av DWD-radarens nowcast via Bright Sky: regn som allerede faller, flyttet langs banen sin. Mengdene og når regnet begynner er gjennomsnittet over 3 × 3 km rundt stedet. Sannsynligheten kombinerer hvor mye av omgivelsene radaren viser vått – nå omtrent 1 km, om to timer 10 km for den økende usikkerheten – med sannsynligheten fra DWD MOSMIX, som teller mer jo lenger frem det gjelder, fordi radaren ikke kan forutse byger som ennå ikke har dannet seg. Timevarselet bruker disse verdiene for timene de dekker. Utover radaren, og ellers, kommer alle verdier fra varselet.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarbilder fra den offisielle regionale tjenesten; RainViewer tar over andre steder og ved brudd. Uten radar viser kartet modellnedbør.",
  "sourceGroupWind": "Vindkart",
  "sourceGroupWindDetails": "Open-Meteo-rutenett med 35 punkter over kartutsnittet; ellers varslet vind på stedet. Vindkartet viser vinden 10 m over bakken.",
  "sourceGroupDrift": "Pil for regnets forflytning",
  "sourceGroupDriftDetails": "Hvor regnet på radaren er på vei, for bildet som vises. I DWD-området følges bevegelsen i selve radaren ved å sammenligne regnmønsteret med det 15 minutter senere. Ellers, eller når det er for lite regn å følge, brukes modellvinden på omtrent 3 km (700 hPa), i siste instans vinden ved bakken. Regn beveger seg med vinden noen kilometer opp, som ofte blåser fra en annen retning enn vinden nær bakken på vindkartet – på bygedager med flere titalls grader.",
  "sourceGroupDriftCoverage": "Radarsporing i DWD-området (ca. 46,5–55,5° N, 5–16° Ø) · 700 hPa-vind i hele verden.",
  "sourceGroupWarnings": "Farevarsler",
  "sourceGroupWarningsDetails": "Offisielle farevarsler for stedet: DWD via Bright Sky, den europeiske MeteoAlarm-strømmen (JSON-API-et hvis strømmen svikter), amerikanske National Weather Service eller Environment and Climate Change Canada.",
  "sourceGroupLocation": "Sted",
  "sourceGroupLocationDetails": "Automatisk gjenkjenning via IP-adresse: ipwho.is, så ipapi.co, så GeoJS. For et valgt sted slås navn, fylke og land opp én gang via Nominatim (OpenStreetMap). Stedssøk: Open-Meteo Geocoding.",
  "sourceGroupMap": "Kartbakgrunn og navn",
  "sourceGroupMapDetails": "Satellittbakgrunn: DWD GeoServer Blue Marble. Bynavn: OpenStreetMap via Overpass-API-et, bufret i 30 dager.",
  "sourceGroupMoon": "Månefase",
  "sourceGroupMoonDetails": "Beregnet lokalt (Meeus); speilvendt for steder sør for ekvator.",
  "sourceLocalCalculation": "LOKAL BEREGNING",
  "sourceRefreshInfo": "Oppdateres hver {minutes}. min, DWD-radaren hver 5. min, felles for miniprogram og app. Siste oppdatering: {updated}.",
  "barPosition": "Plassering i linjen",
  "barPositionLeft": "Venstre",
  "barPositionCenter": "Midten",
  "barPositionRight": "Høyre",
  "barPositionTop": "Øverst",
  "barPositionBottom": "Nederst",
  "barPositionHint": "Flytter miniprogrammet i Omarchy-linjen.",
  "barPositionMissing": "Miniprogrammet er ikke i linjen.",
  "showAlways": "Alltid",
  "showOnHover": "Ved peking",
  "menubarHoverHint": "Oppføringer med «Ved peking» vises mens pekeren hviler på været i linjen.",
  "barBehavior": "Oppførsel",
  "openWidgetOnHover": "Åpne miniprogrammet ved peking",
  "openWidgetOnHoverHint": "Åpner miniprogrammet når pekeren hviler på været i linjen, og lukker det når pekeren flyttes bort. Et klikk holder det åpent.",
  "rainIntensity": "Regnintensitet",
  "showWhenRelevant": "Når det merkes",
  "menubarRelevantCurrentHint": "«Når det merkes» viser en oppføring bare når den skiller seg ut: føles som 3° fra temperaturen, vind fra 20 km/t, UV fra 6.",
  "menubarRelevantRainHint": "«Når det merkes»: sannsynlighet fra 30 %, intensitet mens det regner, regnstart innen to timer. Regnstarten og intensiteten tar sannsynlighetens plass.",
  "menubarRelevantAirHint": "«Når det merkes»: luftkvalitet fra «dårlig», pollen på høyt nivå.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Andre enheter ved peking",
  "hoverUnitSystemOff": "Av",
  "hoverUnitSystemHint": "Mens pekeren hviler på miniprogrammet, bytter linjen til dette enhetssystemet. Kelvin endrer bare temperaturer.",
  "restoreOrder": "Tilbakestill rekkefølgen",
  "sunNext": "Neste solhendelse",
  "sunrise": "Soloppgang",
  "sunset": "Solnedgang",
  "moonPhase": "Månefase",
  "moon": "Måne"
})

addCatalogEntries("da", {
  "settingsPageDisplay": "Visning",
  "settingsPageShortcuts": "Genveje",
  "settingsPageSources": "Kilder",
  "shortcutsSubtitle": "Tastatur og mus",
  "sourcesSubtitle": "Hvor dataene kommer fra",
  "shortcutsHint": "De samme taster virker i widgetten og i appen.",
  "shortcutsGroupGeneral": "GENERELT",
  "shortcutsGroupNavigation": "RULNING",
  "shortcutsGroupForecast": "REGN, RADAR OG VIND",
  "shortcutsGroupSearch": "STEDSSØGNING",
  "shortcutsGroupSettings": "INDSTILLINGER",
  "shortcutsGroupMouse": "MENULINJE",
  "shortcutClose": "Luk søgning, indstillinger eller liste, derefter panelet",
  "shortcutSwitchPanel": "Næste / forrige panel i linjen (widget)",
  "shortcutSettings": "Åbn indstillinger",
  "shortcutRefresh": "Opdater nu",
  "shortcutSearch": "Søg efter et sted",
  "shortcutScroll": "Rul",
  "shortcutPage": "Rul en side",
  "shortcutJump": "Til start / slut",
  "shortcutScrollDaily": "Rul dagsprognosen",
  "shortcutViews": "Visning regn / radar / vind",
  "shortcutRadarStep": "Radar: forrige / næste billede",
  "shortcutRadarPlay": "Radar: afspil / pause",
  "shortcutZoom": "Kort: zoom ind / ud",
  "shortcutZoomReset": "Kort: standardzoom",
  "shortcutSearchSelect": "Vælg et resultat",
  "shortcutSearchSection": "Skift mellem resultater og favoritter",
  "shortcutSearchPick": "Vis det valgte sted",
  "shortcutSearchFavorite": "Tilføj / fjern favorit",
  "shortcutSearchCancel": "Annuller søgningen",
  "shortcutSettingsPages": "Forrige / næste indstillingsside",
  "shortcutSettingsClose": "Luk indstillinger",
  "mouseLeft": "Venstreklik",
  "mouseMiddle": "Midterklik",
  "mouseRight": "Højreklik",
  "shortcutMouseToggle": "Åbn / luk vejrpanelet",
  "shortcutMouseRefresh": "Opdater nu",
  "shortcutMouseNotify": "Vejret som notifikation",
  "sourcesHint": "Kilderne vælges efter sted; svigter en, tager den næste automatisk over.",
  "sourceInUse": "I BRUG",
  "sourceNotInUse": "ikke i brug",
  "sourceGroupForecast": "Aktuelt vejr og prognose",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (den bedste nationale model pr. region), med MET Norway som reserve. I Norge, Sverige, Finland og Danmark kommer MET Norway først, bakket op af sin MET Nordic-model på 1 km. I DWD-området forfiner DWD MOSMIX (via Bright Sky) temperatur, regn og symboler.",
  "sourceCoverage": "DÆKNING",
  "sourceGroupForecastCoverage": "Hele verden. MET Norway først i NO, SE, FI, DK. DWD MOSMIX kun i DWD-området (ca. 46,5–55,5° N, 5–16° Ø, også uden for Tyskland).",
  "sourceGroupUvCoverage": "Hele verden.",
  "sourceGroupNowcastCoverage": "Hele verden. Regnværdier fra MOSMIX og mængden fra DWD-radaren kun i DWD-området.",
  "sourceGroupRadarCoverage": "DWD-området (ca. 46,5–55,5° N, 5–16° Ø) · USA inkl. Alaska, Hawaii, Puerto Rico og Guam (NWS) · Canada (ECCC) · ellers RainViewer (de sidste to timer) · som sidste udvej: modelnedbør fra Open-Meteo eller MET Norway.",
  "sourceGroupWindCoverage": "Hele verden.",
  "sourceGroupWarningsCoverage": "Tyskland: DWD, MeteoAlarm som reserve · MeteoAlarm i 39 lande: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Canada: ECCC · ingen varsler andre steder.",
  "sourceGroupLocationCoverage": "Hele verden.",
  "sourceGroupMapCoverage": "Hele verden. Stednavne skiftevis fra tre Overpass-servere: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Hele verden; spejlvendt syd for ækvator.",
  "sourceGroupUv": "UV-indeks",
  "sourceGroupUvDetails": "UV-prognose pr. time og dag fra Open-Meteo.",
  "sourceGroupNowcast": "Regn de næste to timer",
  "sourceGroupNowcastDetails": "Tidsakse på 15 minutter fra prognosen. I DWD-området bygges de næste to timer af DWD-radarens nowcast via Bright Sky: regn, der allerede falder, flyttet langs sin bane. Mængderne og regnens start er gennemsnittet over 3 × 3 km omkring stedet. Sandsynligheden kombinerer, hvor meget af omgivelserne radaren viser vådt – nu omkring 1 km, om to timer 10 km for den voksende usikkerhed – med sandsynligheden fra DWD MOSMIX, som vejer tungere, jo længere frem det gælder, fordi radaren ikke kan forudse byger, der endnu ikke er dannet. Timeprognosen bruger disse værdier for de timer, de dækker. Ud over radaren, og andre steder, kommer alle værdier fra prognosen.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarbilleder fra den officielle regionale tjeneste; RainViewer tager over andre steder og ved nedbrud. Uden radar viser kortet modelnedbør.",
  "sourceGroupWind": "Vindkort",
  "sourceGroupWindDetails": "Open-Meteo-gitter med 35 punkter over kortudsnittet; ellers prognosevinden på stedet. Vindkortet viser vinden 10 m over jorden.",
  "sourceGroupDrift": "Pil for regnets forskydning",
  "sourceGroupDriftDetails": "Hvor regnet på radaren er på vej hen, for det viste billede. I DWD-området følges bevægelsen i selve radaren ved at sammenligne regnmønsteret med det 15 minutter senere. Andre steder, eller når der er for lidt regn at følge, bruges modelvinden i omkring 3 km højde (700 hPa), ellers vinden ved jorden. Regn bevæger sig med vinden nogle kilometer oppe, som ofte blæser fra en anden retning end vinden tæt ved jorden på vindkortet – på bygedage med flere titals grader.",
  "sourceGroupDriftCoverage": "Radarsporing i DWD-området (ca. 46,5–55,5° N, 5–16° Ø) · 700 hPa-vind i hele verden.",
  "sourceGroupWarnings": "Vejrvarsler",
  "sourceGroupWarningsDetails": "Officielle varsler for stedet: DWD via Bright Sky, det europæiske MeteoAlarm-feed (dets JSON-API, hvis feedet svigter), amerikanske National Weather Service eller Environment and Climate Change Canada.",
  "sourceGroupLocation": "Sted",
  "sourceGroupLocationDetails": "Automatisk registrering via IP-adresse: ipwho.is, derefter ipapi.co, derefter GeoJS. For et valgt sted slås navn, region og land op én gang via Nominatim (OpenStreetMap). Stedssøgning: Open-Meteo Geocoding.",
  "sourceGroupMap": "Kortbaggrund og navne",
  "sourceGroupMapDetails": "Satellitbaggrund: DWD GeoServer Blue Marble. Bynavne: OpenStreetMap via Overpass-API'et, gemt i 30 dage.",
  "sourceGroupMoon": "Månefase",
  "sourceGroupMoonDetails": "Beregnet lokalt (Meeus); spejlvendt for steder syd for ækvator.",
  "sourceLocalCalculation": "LOKAL BEREGNING",
  "sourceRefreshInfo": "Opdateres hver {minutes}. min, DWD-radaren hver 5. min, fælles for widget og app. Seneste opdatering: {updated}.",
  "barPosition": "Placering i linjen",
  "barPositionLeft": "Venstre",
  "barPositionCenter": "Midten",
  "barPositionRight": "Højre",
  "barPositionTop": "Øverst",
  "barPositionBottom": "Nederst",
  "barPositionHint": "Flytter widgetten i Omarchys linje.",
  "barPositionMissing": "Widgetten er ikke i linjen.",
  "showAlways": "Altid",
  "showOnHover": "Ved peg",
  "menubarHoverHint": "Punkter med »Ved peg« vises, mens markøren hviler på vejret i linjen.",
  "barBehavior": "Adfærd",
  "openWidgetOnHover": "Åbn widgetten ved peg",
  "openWidgetOnHoverHint": "Åbner widgetten, når markøren hviler på vejret i linjen, og lukker den, når markøren flyttes væk. Et klik holder den åben.",
  "rainIntensity": "Regnintensitet",
  "showWhenRelevant": "Når det er relevant",
  "menubarRelevantCurrentHint": "»Når det er relevant« viser et punkt kun, når det skiller sig ud: føles som 3° fra temperaturen, vind fra 20 km/t, UV fra 6.",
  "menubarRelevantRainHint": "»Når det er relevant«: sandsynlighed fra 30 %, intensitet mens det regner, regnstart inden for to timer. Regnstarten og intensiteten tager sandsynlighedens plads.",
  "menubarRelevantAirHint": "»Når det er relevant«: luftkvalitet fra »dårlig«, pollen på højt niveau.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Andre enheder ved peg",
  "hoverUnitSystemOff": "Fra",
  "hoverUnitSystemHint": "Mens markøren hviler på widgetten, skifter linjen til dette enhedssystem. Kelvin ændrer kun temperaturer.",
  "restoreOrder": "Nulstil rækkefølgen",
  "sunNext": "Næste solhændelse",
  "sunrise": "Solopgang",
  "sunset": "Solnedgang",
  "moonPhase": "Månefase",
  "moon": "Måne"
})

addCatalogEntries("ro", {
  "settingsPageDisplay": "Afișare",
  "settingsPageShortcuts": "Scurtături",
  "settingsPageSources": "Surse",
  "shortcutsSubtitle": "Tastatură și mouse",
  "sourcesSubtitle": "De unde provin datele",
  "shortcutsHint": "Aceleași taste funcționează în widget și în aplicație.",
  "shortcutsGroupGeneral": "GENERAL",
  "shortcutsGroupNavigation": "DERULARE",
  "shortcutsGroupForecast": "PLOAIE, RADAR ȘI VÂNT",
  "shortcutsGroupSearch": "CĂUTARE LOC",
  "shortcutsGroupSettings": "SETĂRI",
  "shortcutsGroupMouse": "BARĂ DE MENIU",
  "shortcutClose": "Închide căutarea, setările sau lista, apoi panoul",
  "shortcutSwitchPanel": "Panoul următor / anterior din bară (widget)",
  "shortcutSettings": "Deschide setările",
  "shortcutRefresh": "Actualizează acum",
  "shortcutSearch": "Caută un loc",
  "shortcutScroll": "Derulare",
  "shortcutPage": "Derulare cu o pagină",
  "shortcutJump": "Salt la început / sfârșit",
  "shortcutScrollDaily": "Derulează prognoza zilnică",
  "shortcutViews": "Vizualizare ploaie / radar / vânt",
  "shortcutRadarStep": "Radar: imaginea anterioară / următoare",
  "shortcutRadarPlay": "Radar: redare / pauză",
  "shortcutZoom": "Hartă: mărire / micșorare",
  "shortcutZoomReset": "Hartă: zoom implicit",
  "shortcutSearchSelect": "Alege un rezultat",
  "shortcutSearchSection": "Comută între rezultate și favorite",
  "shortcutSearchPick": "Afișează locul ales",
  "shortcutSearchFavorite": "Adaugă / elimină favorit",
  "shortcutSearchCancel": "Anulează căutarea",
  "shortcutSettingsPages": "Pagina de setări anterioară / următoare",
  "shortcutSettingsClose": "Închide setările",
  "mouseLeft": "Clic stânga",
  "mouseMiddle": "Clic mijloc",
  "mouseRight": "Clic dreapta",
  "shortcutMouseToggle": "Deschide / închide panoul meteo",
  "shortcutMouseRefresh": "Actualizează acum",
  "shortcutMouseNotify": "Vremea ca notificare",
  "sourcesHint": "Sursele sunt alese în funcție de loc; dacă una nu răspunde, următoarea preia automat.",
  "sourceInUse": "ÎN UZ",
  "sourceNotInUse": "neutilizată",
  "sourceGroupForecast": "Vremea actuală și prognoza",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (cel mai bun model național pe regiune), cu MET Norway ca rezervă. În Norvegia, Suedia, Finlanda și Danemarca MET Norway are prioritate, sprijinit de modelul său MET Nordic de 1 km. În zona DWD, DWD MOSMIX (prin Bright Sky) rafinează temperatura, ploaia și simbolurile.",
  "sourceCoverage": "ACOPERIRE",
  "sourceGroupForecastCoverage": "Global. MET Norway primul în NO, SE, FI, DK. DWD MOSMIX doar în zona DWD (aprox. 46,5–55,5° N, 5–16° E, și dincolo de Germania).",
  "sourceGroupUvCoverage": "Global.",
  "sourceGroupNowcastCoverage": "Global. Valorile de ploaie MOSMIX și cantitatea radarului DWD doar în zona DWD.",
  "sourceGroupRadarCoverage": "Zona DWD (aprox. 46,5–55,5° N, 5–16° E) · SUA incl. Alaska, Hawaii, Puerto Rico și Guam (NWS) · Canada (ECCC) · în rest RainViewer (ultimele două ore) · ultimă soluție: precipitațiile modelului Open-Meteo sau MET Norway.",
  "sourceGroupWindCoverage": "Global.",
  "sourceGroupWarningsCoverage": "Germania: DWD, MeteoAlarm ca rezervă · MeteoAlarm în 39 de țări: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · SUA: NWS · Canada: ECCC · nicio avertizare în rest.",
  "sourceGroupLocationCoverage": "Global.",
  "sourceGroupMapCoverage": "Global. Numele locurilor de la trei servere Overpass, pe rând: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Global; în oglindă la sud de ecuator.",
  "sourceGroupUv": "Indice UV",
  "sourceGroupUvDetails": "Prognoza UV orară și zilnică de la Open-Meteo.",
  "sourceGroupNowcast": "Ploaie în următoarele două ore",
  "sourceGroupNowcastDetails": "Axă de timp de 15 minute din prognoză. În zona DWD următoarele două ore sunt construite din nowcastul radarului DWD prin Bright Sky: ploaia care deja cade, deplasată pe traiectoria ei. Cantitățile și începutul ploii sunt media pe 3 × 3 km în jurul locului. Probabilitatea combină cât din împrejurimi arată radarul ca fiind ud – acum circa 1 km, peste două ore 10 km din cauza incertitudinii în creștere – cu probabilitatea DWD MOSMIX, care contează cu atât mai mult cu cât se privește mai departe, fiindcă radarul nu poate prevedea aversele care încă nu s-au format. Prognoza orară preia aceste valori pentru orele pe care le acoperă. Dincolo de radar, și în rest, toate valorile vin din prognoză.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Imagini radar de la serviciul oficial regional; RainViewer preia în rest și când acesta nu răspunde. Fără niciun radar, harta arată precipitațiile modelului.",
  "sourceGroupWind": "Harta vântului",
  "sourceGroupWindDetails": "Grilă Open-Meteo de 35 de puncte peste zona hărții; altfel vântul prognozat în loc. Harta vântului arată vântul la 10 m de sol.",
  "sourceGroupDrift": "Săgeata de deplasare a ploii",
  "sourceGroupDriftDetails": "Încotro se deplasează ploaia de pe radar, pentru cadrul afișat. În zona DWD mișcarea este urmărită în radarul însuși, comparând distribuția ploii cu cea de peste 15 minute. În rest, sau când ploaia e prea slabă pentru a fi urmărită, se folosește vântul modelului la circa 3 km (700 hPa), altfel vântul de la sol. Ploaia se deplasează cu vântul de la câțiva kilometri altitudine, care bate adesea din altă direcție decât vântul de lângă sol de pe harta vântului – în zilele cu averse, cu câteva zeci de grade.",
  "sourceGroupDriftCoverage": "Urmărire radar în zona DWD (aprox. 46,5–55,5° N, 5–16° E) · vânt la 700 hPa la nivel global.",
  "sourceGroupWarnings": "Avertizări meteo",
  "sourceGroupWarningsDetails": "Avertizări oficiale pentru loc: DWD prin Bright Sky, fluxul european MeteoAlarm (API-ul său JSON când fluxul nu răspunde), National Weather Service din SUA sau Environment and Climate Change Canada.",
  "sourceGroupLocation": "Loc",
  "sourceGroupLocationDetails": "Detectare automată după adresa IP: ipwho.is, apoi ipapi.co, apoi GeoJS. Pentru un loc ales, numele, județul și țara sunt căutate o singură dată prin Nominatim (OpenStreetMap). Căutare locuri: Open-Meteo Geocoding.",
  "sourceGroupMap": "Fundalul hărții și nume",
  "sourceGroupMapDetails": "Fundal din satelit: DWD GeoServer Blue Marble. Nume de orașe: OpenStreetMap prin API-ul Overpass, păstrate 30 de zile.",
  "sourceGroupMoon": "Faza Lunii",
  "sourceGroupMoonDetails": "Calculată local (Meeus); în oglindă pentru locurile de la sud de ecuator.",
  "sourceLocalCalculation": "CALCUL LOCAL",
  "sourceRefreshInfo": "Actualizare la fiecare {minutes} min, radarul DWD la fiecare 5 min, comună pentru widget și aplicație. Ultima actualizare: {updated}.",
  "barPosition": "Poziția în bară",
  "barPositionLeft": "Stânga",
  "barPositionCenter": "Centru",
  "barPositionRight": "Dreapta",
  "barPositionTop": "Sus",
  "barPositionBottom": "Jos",
  "barPositionHint": "Mută widgetul în bara Omarchy.",
  "barPositionMissing": "Widgetul nu este în bară.",
  "showAlways": "Mereu",
  "showOnHover": "La trecere",
  "menubarHoverHint": "Elementele „La trecere” apar cât timp cursorul stă pe vremea din bară.",
  "barBehavior": "Comportament",
  "openWidgetOnHover": "Deschide widgetul la trecerea cursorului",
  "openWidgetOnHoverHint": "Deschide widgetul când cursorul stă pe vremea din bară și îl închide când cursorul se îndepărtează. Un clic îl menține deschis.",
  "rainIntensity": "Intensitatea ploii",
  "showWhenRelevant": "Când contează",
  "menubarRelevantCurrentHint": "„Când contează” arată un element doar când iese în evidență: temperatura resimțită la 3° de cea reală, vânt de la 20 km/h, UV de la 6.",
  "menubarRelevantRainHint": "„Când contează”: probabilitate de la 30 %, intensitate cât plouă, începutul ploii în două ore. Începutul ploii și intensitatea iau locul probabilității.",
  "menubarRelevantAirHint": "„Când contează”: calitatea aerului de la „slabă”, polen la nivel ridicat.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Alte unități la trecerea cursorului",
  "hoverUnitSystemOff": "Oprit",
  "hoverUnitSystemHint": "Cât timp cursorul stă pe widget, bara trece la acest sistem de unități. Kelvin schimbă doar temperaturile.",
  "restoreOrder": "Restabilește ordinea",
  "sunNext": "Următorul eveniment solar",
  "sunrise": "Răsărit",
  "sunset": "Apus",
  "moonPhase": "Faza lunii",
  "moon": "Luna"
})

addCatalogEntries("hu", {
  "settingsPageDisplay": "Megjelenítés",
  "settingsPageShortcuts": "Billentyűparancsok",
  "settingsPageSources": "Források",
  "shortcutsSubtitle": "Billentyűzet és egér",
  "sourcesSubtitle": "Honnan származnak az adatok",
  "shortcutsHint": "Ugyanazok a billentyűk működnek a minialkalmazásban és az alkalmazásban.",
  "shortcutsGroupGeneral": "ÁLTALÁNOS",
  "shortcutsGroupNavigation": "GÖRGETÉS",
  "shortcutsGroupForecast": "ESŐ, RADAR ÉS SZÉL",
  "shortcutsGroupSearch": "HELYKERESÉS",
  "shortcutsGroupSettings": "BEÁLLÍTÁSOK",
  "shortcutsGroupMouse": "MENÜSÁV",
  "shortcutClose": "Keresés, beállítások vagy lista bezárása, majd a panelé",
  "shortcutSwitchPanel": "A sáv következő / előző panelje (minialkalmazás)",
  "shortcutSettings": "Beállítások megnyitása",
  "shortcutRefresh": "Frissítés most",
  "shortcutSearch": "Hely keresése",
  "shortcutScroll": "Görgetés",
  "shortcutPage": "Görgetés egy oldalnyit",
  "shortcutJump": "Ugrás az elejére / végére",
  "shortcutScrollDaily": "Napi előrejelzés görgetése",
  "shortcutViews": "Nézet: eső / radar / szél",
  "shortcutRadarStep": "Radar: előző / következő kép",
  "shortcutRadarPlay": "Radar: lejátszás / szünet",
  "shortcutZoom": "Térkép: nagyítás / kicsinyítés",
  "shortcutZoomReset": "Térkép: alapértelmezett nagyítás",
  "shortcutSearchSelect": "Találat kiválasztása",
  "shortcutSearchSection": "Váltás a találatok és a kedvencek között",
  "shortcutSearchPick": "A kiválasztott hely megjelenítése",
  "shortcutSearchFavorite": "Kedvenc hozzáadása / eltávolítása",
  "shortcutSearchCancel": "Keresés megszakítása",
  "shortcutSettingsPages": "Előző / következő beállításoldal",
  "shortcutSettingsClose": "Beállítások bezárása",
  "mouseLeft": "Bal kattintás",
  "mouseMiddle": "Középső kattintás",
  "mouseRight": "Jobb kattintás",
  "shortcutMouseToggle": "Időjárás-panel megnyitása / bezárása",
  "shortcutMouseRefresh": "Frissítés most",
  "shortcutMouseNotify": "Időjárás értesítésként",
  "sourcesHint": "A források helyenként kerülnek kiválasztásra; ha egy nem válaszol, automatikusan a következő lép a helyébe.",
  "sourceInUse": "HASZNÁLATBAN",
  "sourceNotInUse": "nincs használatban",
  "sourceGroupForecast": "Aktuális időjárás és előrejelzés",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (régiónként a legjobb nemzeti modell), tartalékként MET Norway. Norvégiában, Svédországban, Finnországban és Dániában a MET Norway az első, saját 1 km-es MET Nordic modelljével. A DWD-területen a DWD MOSMIX (Bright Skyon keresztül) pontosítja a hőmérsékletet, a csapadékot és a szimbólumokat.",
  "sourceCoverage": "LEFEDETTSÉG",
  "sourceGroupForecastCoverage": "Világszerte. MET Norway az első ezekben: NO, SE, FI, DK. DWD MOSMIX csak a DWD-területen (kb. é. sz. 46,5–55,5°, k. h. 5–16°, Németországon túl is).",
  "sourceGroupUvCoverage": "Világszerte.",
  "sourceGroupNowcastCoverage": "Világszerte. MOSMIX-csapadékértékek és a DWD-radar mennyisége csak a DWD-területen.",
  "sourceGroupRadarCoverage": "DWD-terület (kb. é. sz. 46,5–55,5°, k. h. 5–16°) · USA Alaszkával, Hawaiijal, Puerto Ricóval és Guammal (NWS) · Kanada (ECCC) · máshol RainViewer (az utolsó két óra) · végső esetben: az Open-Meteo vagy a MET Norway modellcsapadéka.",
  "sourceGroupWindCoverage": "Világszerte.",
  "sourceGroupWarningsCoverage": "Németország: DWD, tartalékként MeteoAlarm · MeteoAlarm 39 országban: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · USA: NWS · Kanada: ECCC · máshol nincsenek figyelmeztetések.",
  "sourceGroupLocationCoverage": "Világszerte.",
  "sourceGroupMapCoverage": "Világszerte. Helynevek felváltva három Overpass-szerverről: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Világszerte; az Egyenlítőtől délre tükrözve.",
  "sourceGroupUv": "UV-index",
  "sourceGroupUvDetails": "Az Open-Meteo óránkénti és napi UV-előrejelzése.",
  "sourceGroupNowcast": "Eső a következő két órában",
  "sourceGroupNowcastDetails": "15 perces időtengely az előrejelzésből. A DWD-területen a következő két óra a DWD-radar Bright Skyon keresztül kapott nowcastjából áll össze: a már hulló csapadék a pályája mentén továbbléptetve. A mennyiségek és az eső kezdete a hely körüli 3 × 3 km átlaga. A valószínűség azt, hogy a radar a környék mekkora részét mutatja nedvesnek – most kb. 1 km, két óra múlva a növekvő bizonytalanság miatt 10 km –, a DWD MOSMIX valószínűségével kapcsolja össze, amely annál többet számít, minél távolabbi az időpont, hiszen a még ki sem alakult záporokat a radar nem láthatja előre. Az óránkénti előrejelzés ezeket az értékeket veszi át az általuk lefedett órákra. A radaron túl és máshol minden érték az előrejelzésből származik.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Radarképek a hivatalos regionális szolgálattól; máshol és kiesés esetén a RainViewer lép be. Radar nélkül a térkép a modell csapadékát mutatja.",
  "sourceGroupWind": "Széltérkép",
  "sourceGroupWindDetails": "35 pontos Open-Meteo-rács a térkép területén; egyébként a hely előrejelzett szele. A széltérkép a 10 m magasan fújó szelet mutatja.",
  "sourceGroupDrift": "Csapadékmozgás-nyíl",
  "sourceGroupDriftDetails": "Merre halad a radaron látható csapadék a megjelenített képen. A DWD-területen a mozgást magából a radarból követjük: a csapadék mintázatát a 15 perccel későbbivel vetjük össze. Máshol, vagy ha túl kevés a követhető csapadék, a modell kb. 3 km-es (700 hPa) szelét használjuk, egyébként a talajszelet. A csapadék a néhány kilométer magasan fújó széllel mozog, amely gyakran más irányból fúj, mint a széltérkép talaj közeli szele – záporos napokon több tíz fokkal.",
  "sourceGroupDriftCoverage": "Radaros követés a DWD-területen (kb. é. sz. 46,5–55,5°, k. h. 5–16°) · 700 hPa-os szél világszerte.",
  "sourceGroupWarnings": "Időjárási figyelmeztetések",
  "sourceGroupWarningsDetails": "Hivatalos figyelmeztetések a helyre: DWD Bright Skyon keresztül, az európai MeteoAlarm-hírfolyam (kiesés esetén annak JSON API-ja), az amerikai National Weather Service vagy az Environment and Climate Change Canada.",
  "sourceGroupLocation": "Hely",
  "sourceGroupLocationDetails": "Automatikus felismerés IP-cím alapján: ipwho.is, majd ipapi.co, majd GeoJS. Kiválasztott helynél a név, a megye és az ország egyszer kerül lekérdezésre a Nominatimon (OpenStreetMap) keresztül. Helykeresés: Open-Meteo Geocoding.",
  "sourceGroupMap": "Térképháttér és feliratok",
  "sourceGroupMapDetails": "Műholdas háttér: DWD GeoServer Blue Marble. Városnevek: OpenStreetMap az Overpass API-n keresztül, 30 napig gyorsítótárazva.",
  "sourceGroupMoon": "Holdfázis",
  "sourceGroupMoonDetails": "Helyben számolva (Meeus); az Egyenlítőtől délre fekvő helyeken tükrözve.",
  "sourceLocalCalculation": "HELYI SZÁMÍTÁS",
  "sourceRefreshInfo": "Frissítés {minutes} percenként, a DWD-radar 5 percenként, közösen a minialkalmazás és az alkalmazás számára. Utolsó frissítés: {updated}.",
  "barPosition": "Hely a sávban",
  "barPositionLeft": "Bal",
  "barPositionCenter": "Közép",
  "barPositionRight": "Jobb",
  "barPositionTop": "Fent",
  "barPositionBottom": "Lent",
  "barPositionHint": "Áthelyezi a minialkalmazást az Omarchy sávjában.",
  "barPositionMissing": "A minialkalmazás nincs a sávban.",
  "showAlways": "Mindig",
  "showOnHover": "Rámutatáskor",
  "menubarHoverHint": "A „Rámutatáskor” elemek akkor jelennek meg, amikor a mutató a sáv időjárásán áll.",
  "barBehavior": "Viselkedés",
  "openWidgetOnHover": "Minialkalmazás megnyitása rámutatáskor",
  "openWidgetOnHoverHint": "Megnyitja a minialkalmazást, amikor a mutató a sáv időjárásán áll, és bezárja, amikor elmozdul. Kattintással nyitva marad.",
  "rainIntensity": "Eső intenzitása",
  "showWhenRelevant": "Ha fontos",
  "menubarRelevantCurrentHint": "A „Ha fontos” csak akkor mutat egy elemet, ha kitűnik: a hőérzet 3°-kal tér el, a szél 20 km/h-tól, az UV 6-tól.",
  "menubarRelevantRainHint": "„Ha fontos”: valószínűség 30%-tól, intenzitás amíg esik, esőkezdet két órán belül. Az esőkezdet és az intenzitás a valószínűség helyére lép.",
  "menubarRelevantAirHint": "„Ha fontos”: levegőminőség a „rossz” szinttől, pollen magas szinten.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Más mértékegységek rámutatáskor",
  "hoverUnitSystemOff": "Ki",
  "hoverUnitSystemHint": "Amíg a mutató a minialkalmazáson áll, a sáv erre a mértékegységrendszerre vált. A Kelvin csak a hőmérsékleteket érinti.",
  "restoreOrder": "Sorrend visszaállítása",
  "sunNext": "Következő napesemény",
  "sunrise": "Napkelte",
  "sunset": "Napnyugta",
  "moonPhase": "Holdfázis",
  "moon": "Hold"
})

addCatalogEntries("el", {
  "settingsPageDisplay": "Προβολή",
  "settingsPageShortcuts": "Συντομεύσεις",
  "settingsPageSources": "Πηγές",
  "shortcutsSubtitle": "Πληκτρολόγιο και ποντίκι",
  "sourcesSubtitle": "Από πού προέρχονται τα δεδομένα",
  "shortcutsHint": "Τα ίδια πλήκτρα λειτουργούν στο γραφικό στοιχείο και στην εφαρμογή.",
  "shortcutsGroupGeneral": "ΓΕΝΙΚΑ",
  "shortcutsGroupNavigation": "ΚΥΛΙΣΗ",
  "shortcutsGroupForecast": "ΒΡΟΧΗ, ΡΑΝΤΑΡ ΚΑΙ ΑΝΕΜΟΣ",
  "shortcutsGroupSearch": "ΑΝΑΖΗΤΗΣΗ ΤΟΠΟΘΕΣΙΑΣ",
  "shortcutsGroupSettings": "ΡΥΘΜΙΣΕΙΣ",
  "shortcutsGroupMouse": "ΓΡΑΜΜΗ ΜΕΝΟΥ",
  "shortcutClose": "Κλείσιμο αναζήτησης, ρυθμίσεων ή λίστας και μετά του πάνελ",
  "shortcutSwitchPanel": "Επόμενο / προηγούμενο πάνελ της γραμμής (γραφικό στοιχείο)",
  "shortcutSettings": "Άνοιγμα ρυθμίσεων",
  "shortcutRefresh": "Ανανέωση τώρα",
  "shortcutSearch": "Αναζήτηση τοποθεσίας",
  "shortcutScroll": "Κύλιση",
  "shortcutPage": "Κύλιση κατά μία σελίδα",
  "shortcutJump": "Στην αρχή / στο τέλος",
  "shortcutScrollDaily": "Κύλιση ημερήσιας πρόγνωσης",
  "shortcutViews": "Προβολή βροχή / ραντάρ / άνεμος",
  "shortcutRadarStep": "Ραντάρ: προηγούμενη / επόμενη εικόνα",
  "shortcutRadarPlay": "Ραντάρ: αναπαραγωγή / παύση",
  "shortcutZoom": "Χάρτης: μεγέθυνση / σμίκρυνση",
  "shortcutZoomReset": "Χάρτης: προεπιλεγμένη μεγέθυνση",
  "shortcutSearchSelect": "Επιλογή αποτελέσματος",
  "shortcutSearchSection": "Εναλλαγή μεταξύ αποτελεσμάτων και αγαπημένων",
  "shortcutSearchPick": "Εμφάνιση επιλεγμένης τοποθεσίας",
  "shortcutSearchFavorite": "Προσθήκη / αφαίρεση αγαπημένου",
  "shortcutSearchCancel": "Ακύρωση αναζήτησης",
  "shortcutSettingsPages": "Προηγούμενη / επόμενη σελίδα ρυθμίσεων",
  "shortcutSettingsClose": "Κλείσιμο ρυθμίσεων",
  "mouseLeft": "Αριστερό κλικ",
  "mouseMiddle": "Μεσαίο κλικ",
  "mouseRight": "Δεξί κλικ",
  "shortcutMouseToggle": "Άνοιγμα / κλείσιμο πάνελ καιρού",
  "shortcutMouseRefresh": "Ανανέωση τώρα",
  "shortcutMouseNotify": "Ο καιρός ως ειδοποίηση",
  "sourcesHint": "Οι πηγές επιλέγονται ανά τοποθεσία· αν μία δεν απαντά, αναλαμβάνει αυτόματα η επόμενη.",
  "sourceInUse": "ΣΕ ΧΡΗΣΗ",
  "sourceNotInUse": "εκτός χρήσης",
  "sourceGroupForecast": "Τρέχων καιρός και πρόγνωση",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (το καλύτερο εθνικό μοντέλο ανά περιοχή), με εφεδρεία το MET Norway. Σε Νορβηγία, Σουηδία, Φινλανδία και Δανία προηγείται το MET Norway, με το δικό του μοντέλο MET Nordic 1 km. Στην περιοχή του DWD, το DWD MOSMIX (μέσω Bright Sky) βελτιώνει θερμοκρασία, βροχή και σύμβολα.",
  "sourceCoverage": "ΚΑΛΥΨΗ",
  "sourceGroupForecastCoverage": "Παγκοσμίως. Πρώτα MET Norway σε NO, SE, FI, DK. DWD MOSMIX μόνο στην περιοχή του DWD (περίπου 46,5–55,5° Β, 5–16° Α, και εκτός Γερμανίας).",
  "sourceGroupUvCoverage": "Παγκοσμίως.",
  "sourceGroupNowcastCoverage": "Παγκοσμίως. Τιμές βροχής MOSMIX και ποσότητα από το ραντάρ του DWD μόνο στην περιοχή του DWD.",
  "sourceGroupRadarCoverage": "Περιοχή DWD (περίπου 46,5–55,5° Β, 5–16° Α) · ΗΠΑ μαζί με Αλάσκα, Χαβάη, Πουέρτο Ρίκο και Γκουάμ (NWS) · Καναδάς (ECCC) · αλλού RainViewer (τελευταίες δύο ώρες) · ως έσχατη λύση: υετός μοντέλου από Open-Meteo ή MET Norway.",
  "sourceGroupWindCoverage": "Παγκοσμίως.",
  "sourceGroupWarningsCoverage": "Γερμανία: DWD, με εφεδρεία το MeteoAlarm · MeteoAlarm σε 39 χώρες: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · ΗΠΑ: NWS · Καναδάς: ECCC · αλλού καμία προειδοποίηση.",
  "sourceGroupLocationCoverage": "Παγκοσμίως.",
  "sourceGroupMapCoverage": "Παγκοσμίως. Ονόματα τοποθεσιών εναλλάξ από τρεις διακομιστές Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Παγκοσμίως· κατοπτρισμένη νότια του ισημερινού.",
  "sourceGroupUv": "Δείκτης UV",
  "sourceGroupUvDetails": "Ωριαία και ημερήσια πρόγνωση UV από το Open-Meteo.",
  "sourceGroupNowcast": "Βροχή τις επόμενες δύο ώρες",
  "sourceGroupNowcastDetails": "Άξονας χρόνου 15 λεπτών από την πρόγνωση. Στην περιοχή του DWD οι επόμενες δύο ώρες σχηματίζονται από την άμεση πρόγνωση του ραντάρ του DWD μέσω Bright Sky: βροχή που ήδη πέφτει, μετατοπισμένη κατά μήκος της πορείας της. Οι ποσότητες και η έναρξη της βροχής είναι ο μέσος όρος σε 3 × 3 km γύρω από την τοποθεσία. Η πιθανότητα συνδυάζει πόσο από την περιοχή δείχνει βρεγμένο το ραντάρ – τώρα περίπου 1 km, σε δύο ώρες 10 km λόγω της αυξανόμενης αβεβαιότητας – με την πιθανότητα του DWD MOSMIX, που μετράει περισσότερο όσο πιο μακριά στο μέλλον, αφού μπόρες που δεν έχουν ακόμη σχηματιστεί δεν μπορεί να τις προβλέψει το ραντάρ. Η ωριαία πρόγνωση παίρνει αυτές τις τιμές για τις ώρες που καλύπτουν. Πέρα από το ραντάρ, και αλλού, όλες οι τιμές προέρχονται από την πρόγνωση.",
  "sourceGroupRadar": "Ραντάρ",
  "sourceGroupRadarDetails": "Εικόνες ραντάρ από την επίσημη περιφερειακή υπηρεσία· το RainViewer την αντικαθιστά αλλού και σε περίπτωση βλάβης. Χωρίς ραντάρ ο χάρτης δείχνει τον υετό του μοντέλου.",
  "sourceGroupWind": "Χάρτης ανέμου",
  "sourceGroupWindDetails": "Πλέγμα Open-Meteo 35 σημείων στην έκταση του χάρτη· διαφορετικά ο προβλεπόμενος άνεμος στην τοποθεσία. Ο χάρτης ανέμου δείχνει τον άνεμο στα 10 m από το έδαφος.",
  "sourceGroupDrift": "Βέλος μετατόπισης βροχής",
  "sourceGroupDriftDetails": "Προς τα πού κινείται η βροχή του ραντάρ, για το καρέ που εμφανίζεται. Στην περιοχή DWD η κίνηση παρακολουθείται στο ίδιο το ραντάρ, συγκρίνοντας την κατανομή της βροχής με εκείνη 15 λεπτά αργότερα. Αλλού, ή όταν η βροχή είναι πολύ λίγη για παρακολούθηση, χρησιμοποιείται ο άνεμος του μοντέλου σε περίπου 3 km (700 hPa), αλλιώς ο άνεμος επιφανείας. Η βροχή κινείται με τον άνεμο σε ύψος μερικών χιλιομέτρων, που συχνά πνέει από άλλη κατεύθυνση από τον άνεμο κοντά στο έδαφος του χάρτη ανέμου – σε μέρες με μπόρες κατά αρκετές δεκάδες μοίρες.",
  "sourceGroupDriftCoverage": "Παρακολούθηση με ραντάρ στην περιοχή DWD (περίπου 46,5–55,5° Β, 5–16° Α) · άνεμος 700 hPa παγκοσμίως.",
  "sourceGroupWarnings": "Προειδοποιήσεις καιρού",
  "sourceGroupWarningsDetails": "Επίσημες προειδοποιήσεις για την τοποθεσία: DWD μέσω Bright Sky, η ευρωπαϊκή ροή MeteoAlarm (το JSON API της όταν η ροή αποτυγχάνει), η Εθνική Μετεωρολογική Υπηρεσία των ΗΠΑ ή η Environment and Climate Change Canada.",
  "sourceGroupLocation": "Τοποθεσία",
  "sourceGroupLocationDetails": "Αυτόματος εντοπισμός μέσω διεύθυνσης IP: ipwho.is, μετά ipapi.co, μετά GeoJS. Για επιλεγμένη τοποθεσία, όνομα, περιφερειακή ενότητα και χώρα αναζητούνται μία φορά μέσω Nominatim (OpenStreetMap). Αναζήτηση τοποθεσιών: Open-Meteo Geocoding.",
  "sourceGroupMap": "Φόντο χάρτη και ονόματα",
  "sourceGroupMapDetails": "Δορυφορικό φόντο: DWD GeoServer Blue Marble. Ονόματα πόλεων: OpenStreetMap μέσω του Overpass API, αποθηκευμένα για 30 ημέρες.",
  "sourceGroupMoon": "Φάση της Σελήνης",
  "sourceGroupMoonDetails": "Υπολογίζεται τοπικά (Meeus)· κατοπτρισμένη για τοποθεσίες νότια του ισημερινού.",
  "sourceLocalCalculation": "ΤΟΠΙΚΟΣ ΥΠΟΛΟΓΙΣΜΟΣ",
  "sourceRefreshInfo": "Ανανέωση κάθε {minutes} λεπτά, το ραντάρ του DWD κάθε 5 λεπτά, κοινή για γραφικό στοιχείο και εφαρμογή. Τελευταία ενημέρωση: {updated}.",
  "barPosition": "Θέση στη γραμμή",
  "barPositionLeft": "Αριστερά",
  "barPositionCenter": "Κέντρο",
  "barPositionRight": "Δεξιά",
  "barPositionTop": "Πάνω",
  "barPositionBottom": "Κάτω",
  "barPositionHint": "Μετακινεί το γραφικό στοιχείο μέσα στη γραμμή του Omarchy.",
  "barPositionMissing": "Το γραφικό στοιχείο δεν βρίσκεται στη γραμμή.",
  "showAlways": "Πάντα",
  "showOnHover": "Στο πέρασμα",
  "menubarHoverHint": "Τα στοιχεία «Στο πέρασμα» εμφανίζονται όσο ο δείκτης βρίσκεται πάνω στον καιρό της γραμμής.",
  "barBehavior": "Συμπεριφορά",
  "openWidgetOnHover": "Άνοιγμα γραφικού στοιχείου στο πέρασμα",
  "openWidgetOnHoverHint": "Ανοίγει το γραφικό στοιχείο όταν ο δείκτης σταθεί πάνω στον καιρό της γραμμής και το κλείνει όταν απομακρυνθεί. Ένα κλικ το κρατά ανοιχτό.",
  "rainIntensity": "Ένταση βροχής",
  "showWhenRelevant": "Όταν ξεχωρίζει",
  "menubarRelevantCurrentHint": "Το «Όταν ξεχωρίζει» δείχνει μια καταχώριση μόνο όταν ξεχωρίζει: αίσθηση 3° από τη θερμοκρασία, άνεμος από 20 χλμ/ώρα, UV από 6.",
  "menubarRelevantRainHint": "«Όταν ξεχωρίζει»: πιθανότητα από 30 %, ένταση όσο βρέχει, έναρξη βροχής μέσα σε δύο ώρες. Η έναρξη της βροχής και η ένταση παίρνουν τη θέση της πιθανότητας.",
  "menubarRelevantAirHint": "«Όταν ξεχωρίζει»: ποιότητα αέρα από «κακή», γύρη σε υψηλό επίπεδο.",
  "kelvinUnits": "Κέλβιν",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Άλλες μονάδες στο πέρασμα",
  "hoverUnitSystemOff": "Ανενεργό",
  "hoverUnitSystemHint": "Όσο ο δείκτης βρίσκεται πάνω στο γραφικό στοιχείο, η γραμμή αλλάζει σε αυτό το σύστημα μονάδων. Το Κέλβιν αλλάζει μόνο τις θερμοκρασίες.",
  "restoreOrder": "Επαναφορά σειράς",
  "sunNext": "Επόμενο ηλιακό συμβάν",
  "sunrise": "Ανατολή",
  "sunset": "Δύση",
  "moonPhase": "Φάση σελήνης",
  "moon": "Σελήνη"
})

addCatalogEntries("zh_CN", {
  "settingsPageDisplay": "显示",
  "settingsPageShortcuts": "快捷键",
  "settingsPageSources": "数据来源",
  "shortcutsSubtitle": "键盘和鼠标",
  "sourcesSubtitle": "数据从何而来",
  "shortcutsHint": "同样的按键在小组件和应用中都有效。",
  "shortcutsGroupGeneral": "通用",
  "shortcutsGroupNavigation": "滚动",
  "shortcutsGroupForecast": "降雨、雷达和风",
  "shortcutsGroupSearch": "地点搜索",
  "shortcutsGroupSettings": "设置",
  "shortcutsGroupMouse": "菜单栏",
  "shortcutClose": "关闭搜索、设置或列表，然后关闭面板",
  "shortcutSwitchPanel": "栏中的下一个 / 上一个面板（小组件）",
  "shortcutSettings": "打开设置",
  "shortcutRefresh": "立即刷新",
  "shortcutSearch": "搜索地点",
  "shortcutScroll": "滚动",
  "shortcutPage": "滚动一页",
  "shortcutJump": "跳到开头 / 结尾",
  "shortcutScrollDaily": "滚动每日预报",
  "shortcutViews": "降雨 / 雷达 / 风 视图",
  "shortcutRadarStep": "雷达：上一帧 / 下一帧",
  "shortcutRadarPlay": "雷达：播放 / 暂停",
  "shortcutZoom": "地图：放大 / 缩小",
  "shortcutZoomReset": "地图：默认缩放",
  "shortcutSearchSelect": "选择结果",
  "shortcutSearchSection": "在结果和收藏之间切换",
  "shortcutSearchPick": "显示所选地点",
  "shortcutSearchFavorite": "添加 / 移除收藏",
  "shortcutSearchCancel": "取消搜索",
  "shortcutSettingsPages": "上一个 / 下一个设置页面",
  "shortcutSettingsClose": "关闭设置",
  "mouseLeft": "左键单击",
  "mouseMiddle": "中键单击",
  "mouseRight": "右键单击",
  "shortcutMouseToggle": "打开 / 关闭天气面板",
  "shortcutMouseRefresh": "立即刷新",
  "shortcutMouseNotify": "以通知显示天气",
  "sourcesHint": "数据来源按地点选择；某个来源失效时会自动切换到下一个。",
  "sourceInUse": "使用中",
  "sourceNotInUse": "未使用",
  "sourceGroupForecast": "当前天气和预报",
  "sourceGroupForecastDetails": "Open-Meteo Best Match（各地区最佳的国家模式），MET Norway 作为备用。在挪威、瑞典、芬兰和丹麦优先使用 MET Norway，其背后是 1 公里分辨率的 MET Nordic 模式。在 DWD 区域内，DWD MOSMIX（经由 Bright Sky）会细化气温、降雨和天气符号。",
  "sourceCoverage": "覆盖范围",
  "sourceGroupForecastCoverage": "全球。在 NO、SE、FI、DK 优先使用 MET Norway。DWD MOSMIX 仅限 DWD 区域（约北纬 46.5–55.5°、东经 5–16°，也包括德国以外地区）。",
  "sourceGroupUvCoverage": "全球。",
  "sourceGroupNowcastCoverage": "全球。MOSMIX 降雨值和 DWD 雷达降水量仅限 DWD 区域。",
  "sourceGroupRadarCoverage": "DWD 区域（约北纬 46.5–55.5°、东经 5–16°）· 美国，含阿拉斯加、夏威夷、波多黎各和关岛（NWS）· 加拿大（ECCC）· 其他地区使用 RainViewer（过去两小时）· 最后手段：Open-Meteo 或 MET Norway 的模式降水。",
  "sourceGroupWindCoverage": "全球。",
  "sourceGroupWarningsCoverage": "德国：DWD，MeteoAlarm 作为备用 · MeteoAlarm 覆盖 39 个国家：AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · 美国：NWS · 加拿大：ECCC · 其他地区无预警。",
  "sourceGroupLocationCoverage": "全球。",
  "sourceGroupMapCoverage": "全球。地名轮流来自三台 Overpass 服务器：overpass-api.de、overpass.private.coffee、maps.mail.ru。",
  "sourceGroupMoonCoverage": "全球；赤道以南镜像显示。",
  "sourceGroupUv": "紫外线指数",
  "sourceGroupUvDetails": "Open-Meteo 的逐小时和逐日紫外线预报。",
  "sourceGroupNowcast": "未来两小时降雨",
  "sourceGroupNowcastDetails": "预报中的 15 分钟时间轴。在 DWD 区域内，未来两小时由经由 Bright Sky 的 DWD 雷达临近预报构成：正在下的雨沿其移动路径向前推算。降雨量和开始下雨的时间取该地周围 3 × 3 公里的平均值。降雨概率综合了雷达显示周边有多大范围在下雨（现在约 1 公里，两小时后因不确定性增加扩大到 10 公里）和 DWD MOSMIX 的概率；越往后，后者权重越大，因为尚未形成的阵雨雷达无法预见。逐小时预报在其覆盖的小时内采用这些数值。超出雷达范围以及其他地区，所有数值均来自预报。",
  "sourceGroupRadar": "雷达",
  "sourceGroupRadarDetails": "雷达图像来自官方地区服务；在其他地区或其失效时由 RainViewer 接替。没有任何雷达时，地图显示模式降水。",
  "sourceGroupWind": "风场地图",
  "sourceGroupWindDetails": "覆盖地图范围的 35 点 Open-Meteo 网格；否则使用该地点的预报风。风场地图显示离地 10 米的风。",
  "sourceGroupDrift": "降水移动箭头",
  "sourceGroupDriftDetails": "雷达上的降水正在向哪里移动，对应当前显示的画面。在 DWD 区域，通过将降水分布与 15 分钟后的分布比较，直接从雷达跟踪移动。其他地区，或可跟踪的降水太少时，使用约 3 公里高度（700 hPa）的模式风，否则使用地面风。降水随几公里高空的风移动，这股风的方向常与风场地图上近地面的风不同，阵雨天气时可相差几十度。",
  "sourceGroupDriftCoverage": "DWD 区域雷达跟踪（约北纬 46.5–55.5°、东经 5–16°）· 全球 700 hPa 风。",
  "sourceGroupWarnings": "天气预警",
  "sourceGroupWarningsDetails": "该地点的官方预警：经由 Bright Sky 的 DWD、欧洲 MeteoAlarm 数据源（数据源失效时使用其 JSON API）、美国国家气象局或加拿大环境与气候变化部（ECCC）。",
  "sourceGroupLocation": "地点",
  "sourceGroupLocationDetails": "按 IP 地址自动检测：ipwho.is，然后 ipapi.co，然后 GeoJS。对于已选择的地点，名称、所属地区和国家通过 Nominatim（OpenStreetMap）查询一次。地点搜索：Open-Meteo Geocoding。",
  "sourceGroupMap": "地图背景和地名",
  "sourceGroupMapDetails": "卫星背景：DWD GeoServer Blue Marble。城市名称：经由 Overpass API 的 OpenStreetMap，缓存 30 天。",
  "sourceGroupMoon": "月相",
  "sourceGroupMoonDetails": "本地计算（Meeus）；赤道以南的地点镜像显示。",
  "sourceLocalCalculation": "本地计算",
  "sourceRefreshInfo": "每 {minutes} 分钟刷新一次，DWD 雷达每 5 分钟一次，小组件和应用共享。上次更新：{updated}。",
  "barPosition": "在栏中的位置",
  "barPositionLeft": "左侧",
  "barPositionCenter": "居中",
  "barPositionRight": "右侧",
  "barPositionTop": "顶部",
  "barPositionBottom": "底部",
  "barPositionHint": "在 Omarchy 栏中移动小组件。",
  "barPositionMissing": "小组件不在栏中。",
  "showAlways": "始终",
  "showOnHover": "悬停时",
  "menubarHoverHint": "设为“悬停时”的项目在指针停留在栏中天气上时显示。",
  "barBehavior": "行为",
  "openWidgetOnHover": "悬停时打开小组件",
  "openWidgetOnHoverHint": "指针停留在栏中天气上时打开小组件，移开后关闭。单击可保持打开。",
  "rainIntensity": "降雨强度",
  "showWhenRelevant": "重要时",
  "menubarRelevantCurrentHint": "“重要时”只在数值突出时显示：体感与气温相差 3°、风速从 20 km/h 起、紫外线从 6 起。",
  "menubarRelevantRainHint": "“重要时”：概率从 30 % 起、下雨时显示强度、两小时内的降雨开始时间。降雨开始时间和强度会取代概率。",
  "menubarRelevantAirHint": "“重要时”：空气质量从“差”起、花粉为高水平。",
  "kelvinUnits": "开尔文",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "悬停时换用其他单位",
  "hoverUnitSystemOff": "关闭",
  "hoverUnitSystemHint": "指针停留在小组件上时，栏中切换到该单位制。开尔文只影响温度。",
  "restoreOrder": "恢复顺序",
  "sunNext": "下一次日出/日落",
  "sunrise": "日出",
  "sunset": "日落",
  "moonPhase": "月相",
  "moon": "月亮"
})

addCatalogEntries("zh_TW", {
  "settingsPageDisplay": "顯示",
  "settingsPageShortcuts": "快速鍵",
  "settingsPageSources": "資料來源",
  "shortcutsSubtitle": "鍵盤與滑鼠",
  "sourcesSubtitle": "資料從何而來",
  "shortcutsHint": "相同的按鍵在小工具與應用程式中都能使用。",
  "shortcutsGroupGeneral": "一般",
  "shortcutsGroupNavigation": "捲動",
  "shortcutsGroupForecast": "降雨、雷達與風",
  "shortcutsGroupSearch": "地點搜尋",
  "shortcutsGroupSettings": "設定",
  "shortcutsGroupMouse": "選單列",
  "shortcutClose": "關閉搜尋、設定或清單，接著關閉面板",
  "shortcutSwitchPanel": "列上的下一個 / 上一個面板（小工具）",
  "shortcutSettings": "開啟設定",
  "shortcutRefresh": "立即重新整理",
  "shortcutSearch": "搜尋地點",
  "shortcutScroll": "捲動",
  "shortcutPage": "捲動一頁",
  "shortcutJump": "跳到開頭 / 結尾",
  "shortcutScrollDaily": "捲動每日預報",
  "shortcutViews": "降雨 / 雷達 / 風 檢視",
  "shortcutRadarStep": "雷達：上一張 / 下一張",
  "shortcutRadarPlay": "雷達：播放 / 暫停",
  "shortcutZoom": "地圖：放大 / 縮小",
  "shortcutZoomReset": "地圖：預設縮放",
  "shortcutSearchSelect": "選擇結果",
  "shortcutSearchSection": "在結果與我的最愛之間切換",
  "shortcutSearchPick": "顯示所選地點",
  "shortcutSearchFavorite": "加入 / 移除我的最愛",
  "shortcutSearchCancel": "取消搜尋",
  "shortcutSettingsPages": "上一個 / 下一個設定頁面",
  "shortcutSettingsClose": "關閉設定",
  "mouseLeft": "左鍵點按",
  "mouseMiddle": "中鍵點按",
  "mouseRight": "右鍵點按",
  "shortcutMouseToggle": "開啟 / 關閉天氣面板",
  "shortcutMouseRefresh": "立即重新整理",
  "shortcutMouseNotify": "以通知顯示天氣",
  "sourcesHint": "資料來源依地點選擇；某個來源失效時會自動改用下一個。",
  "sourceInUse": "使用中",
  "sourceNotInUse": "未使用",
  "sourceGroupForecast": "目前天氣與預報",
  "sourceGroupForecastDetails": "Open-Meteo Best Match（各地區最佳的國家模式），MET Norway 作為備援。在挪威、瑞典、芬蘭和丹麥優先使用 MET Norway，其背後是 1 公里解析度的 MET Nordic 模式。在 DWD 區域內，DWD MOSMIX（經由 Bright Sky）會細化氣溫、降雨與天氣符號。",
  "sourceCoverage": "涵蓋範圍",
  "sourceGroupForecastCoverage": "全球。在 NO、SE、FI、DK 優先使用 MET Norway。DWD MOSMIX 僅限 DWD 區域（約北緯 46.5–55.5°、東經 5–16°，也包含德國以外地區）。",
  "sourceGroupUvCoverage": "全球。",
  "sourceGroupNowcastCoverage": "全球。MOSMIX 降雨值與 DWD 雷達雨量僅限 DWD 區域。",
  "sourceGroupRadarCoverage": "DWD 區域（約北緯 46.5–55.5°、東經 5–16°）· 美國，含阿拉斯加、夏威夷、波多黎各與關島（NWS）· 加拿大（ECCC）· 其他地區使用 RainViewer（過去兩小時）· 最後手段：Open-Meteo 或 MET Norway 的模式降水。",
  "sourceGroupWindCoverage": "全球。",
  "sourceGroupWarningsCoverage": "德國：DWD，MeteoAlarm 作為備援 · MeteoAlarm 涵蓋 39 個國家：AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · 美國：NWS · 加拿大：ECCC · 其他地區無警報。",
  "sourceGroupLocationCoverage": "全球。",
  "sourceGroupMapCoverage": "全球。地名輪流取自三台 Overpass 伺服器：overpass-api.de、overpass.private.coffee、maps.mail.ru。",
  "sourceGroupMoonCoverage": "全球；赤道以南鏡像顯示。",
  "sourceGroupUv": "紫外線指數",
  "sourceGroupUvDetails": "Open-Meteo 的逐時與逐日紫外線預報。",
  "sourceGroupNowcast": "未來兩小時降雨",
  "sourceGroupNowcastDetails": "預報中的 15 分鐘時間軸。在 DWD 區域內，未來兩小時由經由 Bright Sky 的 DWD 雷達即時預報構成：正在下的雨沿其移動路徑向前推算。雨量與開始下雨的時間取該地周圍 3 × 3 公里的平均值。降雨機率綜合了雷達顯示周邊有多大範圍在下雨（現在約 1 公里，兩小時後因不確定性增加擴大到 10 公里）與 DWD MOSMIX 的機率；越往後，後者權重越大，因為尚未形成的陣雨雷達無法預見。逐時預報在其涵蓋的小時內採用這些數值。超出雷達範圍以及其他地區，所有數值均來自預報。",
  "sourceGroupRadar": "雷達",
  "sourceGroupRadarDetails": "雷達影像來自官方區域服務；在其他地區或服務失效時由 RainViewer 接手。完全沒有雷達時，地圖顯示模式降水。",
  "sourceGroupWind": "風場地圖",
  "sourceGroupWindDetails": "涵蓋地圖範圍的 35 點 Open-Meteo 網格；否則使用該地點的預報風。風場地圖顯示離地 10 公尺的風。",
  "sourceGroupDrift": "降水移動箭頭",
  "sourceGroupDriftDetails": "雷達上的降水正往哪裡移動，對應目前顯示的畫面。在 DWD 區域，透過比較降水分布與 15 分鐘後的分布，直接從雷達追蹤移動。其他地區，或可追蹤的降水太少時，使用約 3 公里高度（700 hPa）的模式風，否則使用地面風。降水隨幾公里高空的風移動，這股風的方向常與風場地圖上近地面的風不同，陣雨天氣時可相差幾十度。",
  "sourceGroupDriftCoverage": "DWD 區域雷達追蹤（約北緯 46.5–55.5°、東經 5–16°）· 全球 700 hPa 風。",
  "sourceGroupWarnings": "天氣警報",
  "sourceGroupWarningsDetails": "該地點的官方警報：經由 Bright Sky 的 DWD、歐洲 MeteoAlarm 資料來源（失效時改用其 JSON API）、美國國家氣象局或加拿大環境與氣候變遷部（ECCC）。",
  "sourceGroupLocation": "地點",
  "sourceGroupLocationDetails": "依 IP 位址自動偵測：ipwho.is，接著 ipapi.co，再來 GeoJS。對於已選擇的地點，名稱、所屬地區與國家會透過 Nominatim（OpenStreetMap）查詢一次。地點搜尋：Open-Meteo Geocoding。",
  "sourceGroupMap": "地圖背景與地名",
  "sourceGroupMapDetails": "衛星背景：DWD GeoServer Blue Marble。城市名稱：經由 Overpass API 的 OpenStreetMap，快取 30 天。",
  "sourceGroupMoon": "月相",
  "sourceGroupMoonDetails": "本機計算（Meeus）；赤道以南的地點鏡像顯示。",
  "sourceLocalCalculation": "本機計算",
  "sourceRefreshInfo": "每 {minutes} 分鐘重新整理一次，DWD 雷達每 5 分鐘一次，小工具與應用程式共用。上次更新：{updated}。",
  "barPosition": "在列中的位置",
  "barPositionLeft": "左側",
  "barPositionCenter": "置中",
  "barPositionRight": "右側",
  "barPositionTop": "頂部",
  "barPositionBottom": "底部",
  "barPositionHint": "在 Omarchy 列中移動小工具。",
  "barPositionMissing": "小工具不在列中。",
  "showAlways": "永遠",
  "showOnHover": "滑過時",
  "menubarHoverHint": "設為「滑過時」的項目會在指標停留於列中天氣上時顯示。",
  "barBehavior": "行為",
  "openWidgetOnHover": "滑過時開啟小工具",
  "openWidgetOnHoverHint": "指標停留於列中天氣上時開啟小工具，移開後關閉。按一下可保持開啟。",
  "rainIntensity": "降雨強度",
  "showWhenRelevant": "重要時",
  "menubarRelevantCurrentHint": "「重要時」只在數值突出時顯示：體感與氣溫相差 3°、風速從 20 km/h 起、紫外線從 6 起。",
  "menubarRelevantRainHint": "「重要時」：機率從 30 % 起、下雨時顯示強度、兩小時內的降雨開始時間。降雨開始時間與強度會取代機率。",
  "menubarRelevantAirHint": "「重要時」：空氣品質從「差」起、花粉為高濃度。",
  "kelvinUnits": "克耳文",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "滑過時改用其他單位",
  "hoverUnitSystemOff": "關閉",
  "hoverUnitSystemHint": "指標停留於小工具上時，列中切換為此單位制。克耳文只影響溫度。",
  "restoreOrder": "還原順序",
  "sunNext": "下一次日出／日落",
  "sunrise": "日出",
  "sunset": "日落",
  "moonPhase": "月相",
  "moon": "月亮"
})

addCatalogEntries("ja", {
  "settingsPageDisplay": "表示",
  "settingsPageShortcuts": "ショートカット",
  "settingsPageSources": "データソース",
  "shortcutsSubtitle": "キーボードとマウス",
  "sourcesSubtitle": "データの提供元",
  "shortcutsHint": "ウィジェットとアプリで同じキーが使えます。",
  "shortcutsGroupGeneral": "一般",
  "shortcutsGroupNavigation": "スクロール",
  "shortcutsGroupForecast": "雨・レーダー・風",
  "shortcutsGroupSearch": "場所の検索",
  "shortcutsGroupSettings": "設定",
  "shortcutsGroupMouse": "メニューバー",
  "shortcutClose": "検索・設定・リストを閉じ、次にパネルを閉じる",
  "shortcutSwitchPanel": "バーの次 / 前のパネル（ウィジェット）",
  "shortcutSettings": "設定を開く",
  "shortcutRefresh": "今すぐ更新",
  "shortcutSearch": "場所を検索",
  "shortcutScroll": "スクロール",
  "shortcutPage": "1ページ分スクロール",
  "shortcutJump": "先頭 / 末尾へ移動",
  "shortcutScrollDaily": "日ごとの予報をスクロール",
  "shortcutViews": "雨 / レーダー / 風 の表示",
  "shortcutRadarStep": "レーダー：前 / 次の画像",
  "shortcutRadarPlay": "レーダー：再生 / 一時停止",
  "shortcutZoom": "地図：拡大 / 縮小",
  "shortcutZoomReset": "地図：既定の縮尺",
  "shortcutSearchSelect": "結果を選ぶ",
  "shortcutSearchSection": "結果とお気に入りを切り替え",
  "shortcutSearchPick": "選んだ場所を表示",
  "shortcutSearchFavorite": "お気に入りに追加 / 削除",
  "shortcutSearchCancel": "検索をキャンセル",
  "shortcutSettingsPages": "前 / 次の設定ページ",
  "shortcutSettingsClose": "設定を閉じる",
  "mouseLeft": "左クリック",
  "mouseMiddle": "中クリック",
  "mouseRight": "右クリック",
  "shortcutMouseToggle": "天気パネルを開く / 閉じる",
  "shortcutMouseRefresh": "今すぐ更新",
  "shortcutMouseNotify": "天気を通知で表示",
  "sourcesHint": "データソースは場所ごとに選ばれ、応答しない場合は自動的に次のソースに切り替わります。",
  "sourceInUse": "使用中",
  "sourceNotInUse": "未使用",
  "sourceGroupForecast": "現在の天気と予報",
  "sourceGroupForecastDetails": "Open-Meteo Best Match（地域ごとに最適な各国の気象モデル）、予備は MET Norway。ノルウェー、スウェーデン、フィンランド、デンマークでは、1 km 格子の MET Nordic モデルを持つ MET Norway を優先します。DWD 領域では DWD MOSMIX（Bright Sky 経由）が気温・雨・天気記号を補正します。",
  "sourceCoverage": "対象範囲",
  "sourceGroupForecastCoverage": "全世界。NO、SE、FI、DK では MET Norway を優先。DWD MOSMIX は DWD 領域のみ（北緯約 46.5–55.5°、東経 5–16°、ドイツ国外も含む）。",
  "sourceGroupUvCoverage": "全世界。",
  "sourceGroupNowcastCoverage": "全世界。MOSMIX の雨の値と DWD レーダーの降水量は DWD 領域のみ。",
  "sourceGroupRadarCoverage": "DWD 領域（北緯約 46.5–55.5°、東経 5–16°）· アラスカ、ハワイ、プエルトリコ、グアムを含む米国（NWS）· カナダ（ECCC）· その他の地域は RainViewer（過去2時間）· 最終手段：Open-Meteo または MET Norway のモデル降水量。",
  "sourceGroupWindCoverage": "全世界。",
  "sourceGroupWarningsCoverage": "ドイツ：DWD、予備は MeteoAlarm · MeteoAlarm は 39 か国：AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · 米国：NWS · カナダ：ECCC · その他の地域では警報なし。",
  "sourceGroupLocationCoverage": "全世界。",
  "sourceGroupMapCoverage": "全世界。地名は 3 台の Overpass サーバーから順に取得：overpass-api.de、overpass.private.coffee、maps.mail.ru。",
  "sourceGroupMoonCoverage": "全世界。赤道より南では左右反転。",
  "sourceGroupUv": "UV指数",
  "sourceGroupUvDetails": "Open-Meteo の1時間ごと・日ごとの UV 予報。",
  "sourceGroupNowcast": "今後2時間の雨",
  "sourceGroupNowcastDetails": "予報の15分刻みの時間軸。DWD 領域では、次の2時間を Bright Sky 経由の DWD レーダーのナウキャストから組み立てます。すでに降っている雨を、その進路に沿って進めたものです。降水量と雨の降り始めは、その場所の周囲 3 × 3 km の平均です。降水確率は、レーダーが周囲のどれだけを雨と示しているか（現在は約 1 km、不確かさが増すため2時間後には 10 km まで広げます）と DWD MOSMIX の確率を組み合わせたもので、先になるほど後者の比重が大きくなります。まだ発生していないにわか雨はレーダーでは予測できないためです。1時間ごとの予報は、これらの値が及ぶ時間帯でこの値を使います。レーダーの範囲外やその他の地域では、すべての値が予報から取得されます。",
  "sourceGroupRadar": "レーダー",
  "sourceGroupRadarDetails": "公式の地域サービスのレーダー画像。その他の地域や障害時は RainViewer が代わります。レーダーがまったくない場合、地図にはモデル降水量を表示します。",
  "sourceGroupWind": "風の地図",
  "sourceGroupWindDetails": "地図範囲をカバーする 35 地点の Open-Meteo グリッド。なければその場所の予報風。風の地図は地上 10 m の風を表示します。",
  "sourceGroupDrift": "降水の移動矢印",
  "sourceGroupDriftDetails": "表示中のコマで、レーダー上の降水がどこへ移動しているか。DWD 領域では、降水の分布を 15 分後の分布と比べ、レーダー自体から移動を追跡します。その他の地域や追跡できる降水が少ない場合は、高度約 3 km（700 hPa）のモデル風を、それもなければ地上風を使います。降水は数キロ上空の風に流されて動き、その風は風の地図に表示される地表付近の風と向きが違うことがよくあり、にわか雨の日には数十度ずれます。",
  "sourceGroupDriftCoverage": "DWD 領域ではレーダー追跡（北緯約 46.5–55.5°、東経 5–16°）· 700 hPa の風は全世界。",
  "sourceGroupWarnings": "気象警報",
  "sourceGroupWarningsDetails": "その場所の公式警報：Bright Sky 経由の DWD、欧州の MeteoAlarm フィード（フィードが応答しない場合はその JSON API）、米国国立気象局、またはカナダ環境・気候変動省（ECCC）。",
  "sourceGroupLocation": "場所",
  "sourceGroupLocationDetails": "IP アドレスによる自動検出：ipwho.is、次に ipapi.co、次に GeoJS。選択した場所の名前・郡・国は Nominatim（OpenStreetMap）で一度だけ取得します。場所の検索：Open-Meteo Geocoding。",
  "sourceGroupMap": "地図の背景と地名",
  "sourceGroupMapDetails": "衛星背景：DWD GeoServer Blue Marble。都市名：Overpass API 経由の OpenStreetMap、30 日間キャッシュ。",
  "sourceGroupMoon": "月の満ち欠け",
  "sourceGroupMoonDetails": "ローカルで計算（Meeus）。赤道より南の場所では左右反転。",
  "sourceLocalCalculation": "ローカル計算",
  "sourceRefreshInfo": "{minutes} 分ごとに更新（DWD レーダーは 5 分ごと）、ウィジェットとアプリで共有。最終更新：{updated}。",
  "barPosition": "バー内の位置",
  "barPositionLeft": "左",
  "barPositionCenter": "中央",
  "barPositionRight": "右",
  "barPositionTop": "上",
  "barPositionBottom": "下",
  "barPositionHint": "Omarchy のバー内でウィジェットを移動します。",
  "barPositionMissing": "ウィジェットはバーにありません。",
  "showAlways": "常に",
  "showOnHover": "ホバー時",
  "menubarHoverHint": "「ホバー時」の項目は、ポインターがバーの天気の上にある間だけ表示されます。",
  "barBehavior": "動作",
  "openWidgetOnHover": "ホバーでウィジェットを開く",
  "openWidgetOnHoverHint": "ポインターがバーの天気の上に留まるとウィジェットを開き、離れると閉じます。クリックすると開いたままになります。",
  "rainIntensity": "雨の強さ",
  "showWhenRelevant": "目立つとき",
  "menubarRelevantCurrentHint": "「目立つとき」は値が目立つ場合だけ表示します。体感が気温と3°違う、風速20 km/h以上、UV6以上。",
  "menubarRelevantRainHint": "「目立つとき」: 降水確率30 %以上、雨の間は強さ、2時間以内の降り出し。降り出しと強さは確率の場所を使います。",
  "menubarRelevantAirHint": "「目立つとき」: 大気質が「悪い」以上、花粉が多いとき。",
  "kelvinUnits": "ケルビン",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "ホバー時は別の単位",
  "hoverUnitSystemOff": "オフ",
  "hoverUnitSystemHint": "ポインターがウィジェットの上にある間、バーはこの単位系に切り替わります。ケルビンは気温だけに効きます。",
  "restoreOrder": "並び順を戻す",
  "sunNext": "次の日の出・日の入り",
  "sunrise": "日の出",
  "sunset": "日の入り",
  "moonPhase": "月齢",
  "moon": "月"
})

addCatalogEntries("ko", {
  "settingsPageDisplay": "표시",
  "settingsPageShortcuts": "단축키",
  "settingsPageSources": "데이터 출처",
  "shortcutsSubtitle": "키보드와 마우스",
  "sourcesSubtitle": "데이터를 가져오는 곳",
  "shortcutsHint": "위젯과 앱에서 같은 키를 사용할 수 있습니다.",
  "shortcutsGroupGeneral": "일반",
  "shortcutsGroupNavigation": "스크롤",
  "shortcutsGroupForecast": "비, 레이더, 바람",
  "shortcutsGroupSearch": "장소 검색",
  "shortcutsGroupSettings": "설정",
  "shortcutsGroupMouse": "메뉴 막대",
  "shortcutClose": "검색, 설정 또는 목록을 닫고, 다음에 패널 닫기",
  "shortcutSwitchPanel": "막대의 다음 / 이전 패널(위젯)",
  "shortcutSettings": "설정 열기",
  "shortcutRefresh": "지금 새로 고침",
  "shortcutSearch": "장소 검색",
  "shortcutScroll": "스크롤",
  "shortcutPage": "한 페이지씩 스크롤",
  "shortcutJump": "처음 / 끝으로 이동",
  "shortcutScrollDaily": "일별 예보 스크롤",
  "shortcutViews": "비 / 레이더 / 바람 보기",
  "shortcutRadarStep": "레이더: 이전 / 다음 이미지",
  "shortcutRadarPlay": "레이더: 재생 / 일시 정지",
  "shortcutZoom": "지도: 확대 / 축소",
  "shortcutZoomReset": "지도: 기본 배율",
  "shortcutSearchSelect": "결과 선택",
  "shortcutSearchSection": "결과와 즐겨찾기 사이 전환",
  "shortcutSearchPick": "선택한 장소 보기",
  "shortcutSearchFavorite": "즐겨찾기 추가 / 삭제",
  "shortcutSearchCancel": "검색 취소",
  "shortcutSettingsPages": "이전 / 다음 설정 페이지",
  "shortcutSettingsClose": "설정 닫기",
  "mouseLeft": "왼쪽 클릭",
  "mouseMiddle": "가운데 클릭",
  "mouseRight": "오른쪽 클릭",
  "shortcutMouseToggle": "날씨 패널 열기 / 닫기",
  "shortcutMouseRefresh": "지금 새로 고침",
  "shortcutMouseNotify": "날씨를 알림으로 표시",
  "sourcesHint": "데이터 출처는 장소마다 선택되며, 하나가 응답하지 않으면 자동으로 다음 출처로 넘어갑니다.",
  "sourceInUse": "사용 중",
  "sourceNotInUse": "사용 안 함",
  "sourceGroupForecast": "현재 날씨와 예보",
  "sourceGroupForecastDetails": "Open-Meteo Best Match(지역별 최적의 국가 모델), 예비로 MET Norway. 노르웨이, 스웨덴, 핀란드, 덴마크에서는 1km 해상도의 MET Nordic 모델을 갖춘 MET Norway가 우선합니다. DWD 영역에서는 DWD MOSMIX(Bright Sky 경유)가 기온, 비, 날씨 기호를 보정합니다.",
  "sourceCoverage": "적용 범위",
  "sourceGroupForecastCoverage": "전 세계. NO, SE, FI, DK에서는 MET Norway 우선. DWD MOSMIX는 DWD 영역에서만(약 북위 46.5–55.5°, 동경 5–16°, 독일 밖 포함).",
  "sourceGroupUvCoverage": "전 세계.",
  "sourceGroupNowcastCoverage": "전 세계. MOSMIX 강수 값과 DWD 레이더 강수량은 DWD 영역에서만.",
  "sourceGroupRadarCoverage": "DWD 영역(약 북위 46.5–55.5°, 동경 5–16°) · 알래스카, 하와이, 푸에르토리코, 괌을 포함한 미국(NWS) · 캐나다(ECCC) · 그 밖의 지역은 RainViewer(지난 2시간) · 최후 수단: Open-Meteo 또는 MET Norway의 모델 강수.",
  "sourceGroupWindCoverage": "전 세계.",
  "sourceGroupWarningsCoverage": "독일: DWD, 예비로 MeteoAlarm · MeteoAlarm 39개국: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · 미국: NWS · 캐나다: ECCC · 그 밖의 지역은 특보 없음.",
  "sourceGroupLocationCoverage": "전 세계.",
  "sourceGroupMapCoverage": "전 세계. 지명은 세 개의 Overpass 서버에서 차례로 가져옴: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "전 세계. 적도 남쪽에서는 좌우 반전.",
  "sourceGroupUv": "자외선 지수",
  "sourceGroupUvDetails": "Open-Meteo의 시간별·일별 자외선 예보.",
  "sourceGroupNowcast": "앞으로 2시간 동안의 비",
  "sourceGroupNowcastDetails": "예보의 15분 간격 시간축. DWD 영역에서는 앞으로 2시간을 Bright Sky를 거친 DWD 레이더 초단기 예측으로 구성합니다. 이미 내리고 있는 비를 이동 경로를 따라 옮긴 값입니다. 강수량과 비 시작 시각은 장소 주변 3 × 3km의 평균입니다. 강수 확률은 레이더가 주변의 얼마만큼을 비로 보여 주는지(지금은 약 1km, 불확실성이 커지므로 2시간 뒤에는 10km까지)와 DWD MOSMIX 확률을 결합하며, 먼 시각일수록 후자의 비중이 커집니다. 아직 생기지 않은 소나기는 레이더가 예측할 수 없기 때문입니다. 시간별 예보는 이 값이 포함하는 시간에 이 값을 사용합니다. 레이더 범위를 넘어서거나 그 밖의 지역에서는 모든 값을 예보에서 가져옵니다.",
  "sourceGroupRadar": "레이더",
  "sourceGroupRadarDetails": "공식 지역 기관의 레이더 영상. 그 밖의 지역이나 장애 시에는 RainViewer가 대신합니다. 레이더가 전혀 없으면 지도에 모델 강수를 표시합니다.",
  "sourceGroupWind": "바람 지도",
  "sourceGroupWindDetails": "지도 범위를 덮는 35개 지점의 Open-Meteo 격자. 없으면 해당 장소의 예보 바람. 바람 지도는 지상 10m 높이의 바람을 보여 줍니다.",
  "sourceGroupDrift": "강수 이동 화살표",
  "sourceGroupDriftDetails": "표시 중인 프레임에서 레이더의 강수가 어디로 이동하는지 보여 줍니다. DWD 영역에서는 강수 분포를 15분 뒤의 분포와 비교해 레이더 자체에서 이동을 추적합니다. 그 밖의 지역이나 추적할 강수가 너무 적을 때는 약 3km 고도(700hPa)의 모델 바람을, 그마저 없으면 지상풍을 사용합니다. 강수는 수 킬로미터 상공의 바람을 따라 움직이며, 이 바람은 바람 지도의 지면 근처 바람과 방향이 다른 경우가 많고 소나기가 잦은 날에는 수십 도까지 차이 납니다.",
  "sourceGroupDriftCoverage": "DWD 영역 레이더 추적(약 북위 46.5–55.5°, 동경 5–16°) · 전 세계 700hPa 바람.",
  "sourceGroupWarnings": "기상 특보",
  "sourceGroupWarningsDetails": "해당 장소의 공식 특보: Bright Sky를 거친 DWD, 유럽 MeteoAlarm 피드(피드 장애 시 JSON API), 미국 국립기상청 또는 캐나다 환경기후변화부(ECCC).",
  "sourceGroupLocation": "장소",
  "sourceGroupLocationDetails": "IP 주소로 자동 감지: ipwho.is, 다음 ipapi.co, 다음 GeoJS. 선택한 장소의 이름, 군, 국가는 Nominatim(OpenStreetMap)으로 한 번 조회합니다. 장소 검색: Open-Meteo Geocoding.",
  "sourceGroupMap": "지도 배경과 지명",
  "sourceGroupMapDetails": "위성 배경: DWD GeoServer Blue Marble. 도시 이름: Overpass API를 거친 OpenStreetMap, 30일간 캐시.",
  "sourceGroupMoon": "달의 위상",
  "sourceGroupMoonDetails": "로컬에서 계산(Meeus). 적도 남쪽 장소에서는 좌우 반전.",
  "sourceLocalCalculation": "로컬 계산",
  "sourceRefreshInfo": "{minutes}분마다 새로 고침(DWD 레이더는 5분마다), 위젯과 앱이 공유. 마지막 업데이트: {updated}.",
  "barPosition": "막대 내 위치",
  "barPositionLeft": "왼쪽",
  "barPositionCenter": "가운데",
  "barPositionRight": "오른쪽",
  "barPositionTop": "위",
  "barPositionBottom": "아래",
  "barPositionHint": "Omarchy 막대 안에서 위젯을 옮깁니다.",
  "barPositionMissing": "위젯이 막대에 없습니다.",
  "showAlways": "항상",
  "showOnHover": "마우스를 올리면",
  "menubarHoverHint": "‘마우스를 올리면’ 항목은 포인터가 막대의 날씨 위에 있는 동안 표시됩니다.",
  "barBehavior": "동작",
  "openWidgetOnHover": "마우스를 올리면 위젯 열기",
  "openWidgetOnHoverHint": "포인터가 막대의 날씨 위에 머무르면 위젯을 열고, 벗어나면 닫습니다. 클릭하면 열린 상태로 유지됩니다.",
  "rainIntensity": "강우 강도",
  "showWhenRelevant": "눈에 띌 때",
  "menubarRelevantCurrentHint": "‘눈에 띌 때’는 값이 두드러질 때만 표시합니다. 체감이 기온과 3° 차이, 바람 20 km/h 이상, 자외선 6 이상.",
  "menubarRelevantRainHint": "‘눈에 띌 때’: 확률 30 % 이상, 비가 오는 동안 강도, 두 시간 이내 강우 시작. 강우 시작과 강도가 확률 자리를 차지합니다.",
  "menubarRelevantAirHint": "‘눈에 띌 때’: 대기질 ‘나쁨’ 이상, 꽃가루 높음.",
  "kelvinUnits": "켈빈",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "마우스를 올리면 다른 단위",
  "hoverUnitSystemOff": "끔",
  "hoverUnitSystemHint": "포인터가 위젯 위에 있는 동안 막대가 이 단위계로 바뀝니다. 켈빈은 기온에만 적용됩니다.",
  "restoreOrder": "순서 되돌리기",
  "sunNext": "다음 일출·일몰",
  "sunrise": "일출",
  "sunset": "일몰",
  "moonPhase": "달의 위상",
  "moon": "달"
})

addCatalogEntries("ar", {
  "settingsPageDisplay": "العرض",
  "settingsPageShortcuts": "الاختصارات",
  "settingsPageSources": "المصادر",
  "shortcutsSubtitle": "لوحة المفاتيح والفأرة",
  "sourcesSubtitle": "من أين تأتي البيانات",
  "shortcutsHint": "تعمل المفاتيح نفسها في الأداة وفي التطبيق.",
  "shortcutsGroupGeneral": "عام",
  "shortcutsGroupNavigation": "التمرير",
  "shortcutsGroupForecast": "المطر والرادار والرياح",
  "shortcutsGroupSearch": "البحث عن مكان",
  "shortcutsGroupSettings": "الإعدادات",
  "shortcutsGroupMouse": "شريط القوائم",
  "shortcutClose": "إغلاق البحث أو الإعدادات أو القائمة، ثم اللوحة",
  "shortcutSwitchPanel": "اللوحة التالية / السابقة في الشريط (الأداة)",
  "shortcutSettings": "فتح الإعدادات",
  "shortcutRefresh": "التحديث الآن",
  "shortcutSearch": "البحث عن مكان",
  "shortcutScroll": "تمرير",
  "shortcutPage": "تمرير صفحة",
  "shortcutJump": "الانتقال إلى البداية / النهاية",
  "shortcutScrollDaily": "تمرير التوقعات اليومية",
  "shortcutViews": "عرض المطر / الرادار / الرياح",
  "shortcutRadarStep": "الرادار: الصورة السابقة / التالية",
  "shortcutRadarPlay": "الرادار: تشغيل / إيقاف مؤقت",
  "shortcutZoom": "الخريطة: تكبير / تصغير",
  "shortcutZoomReset": "الخريطة: التكبير الافتراضي",
  "shortcutSearchSelect": "اختيار نتيجة",
  "shortcutSearchSection": "التبديل بين النتائج والمفضلة",
  "shortcutSearchPick": "عرض المكان المختار",
  "shortcutSearchFavorite": "إضافة إلى المفضلة / إزالة منها",
  "shortcutSearchCancel": "إلغاء البحث",
  "shortcutSettingsPages": "صفحة الإعدادات السابقة / التالية",
  "shortcutSettingsClose": "إغلاق الإعدادات",
  "mouseLeft": "نقرة يسرى",
  "mouseMiddle": "نقرة وسطى",
  "mouseRight": "نقرة يمنى",
  "shortcutMouseToggle": "فتح / إغلاق لوحة الطقس",
  "shortcutMouseRefresh": "التحديث الآن",
  "shortcutMouseNotify": "الطقس كإشعار",
  "sourcesHint": "تُختار المصادر حسب المكان؛ وإذا تعطّل أحدها يتولى المصدر التالي تلقائيًا.",
  "sourceInUse": "قيد الاستخدام",
  "sourceNotInUse": "غير مستخدم",
  "sourceGroupForecast": "الطقس الحالي والتوقعات",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (أفضل نموذج وطني لكل منطقة)، مع MET Norway بديلًا. في النرويج والسويد وفنلندا والدنمارك يأتي MET Norway أولًا مدعومًا بنموذج MET Nordic بدقة 1 كم. وفي منطقة DWD يحسّن DWD MOSMIX (عبر Bright Sky) درجة الحرارة والمطر والرموز.",
  "sourceCoverage": "التغطية",
  "sourceGroupForecastCoverage": "عالمية. MET Norway أولًا في NO وSE وFI وDK. DWD MOSMIX في منطقة DWD فقط (نحو 46.5–55.5° شمالًا و5–16° شرقًا، وخارج ألمانيا أيضًا).",
  "sourceGroupUvCoverage": "عالمية.",
  "sourceGroupNowcastCoverage": "عالمية. قيم المطر من MOSMIX وكمية رادار DWD في منطقة DWD فقط.",
  "sourceGroupRadarCoverage": "منطقة DWD (نحو 46.5–55.5° شمالًا و5–16° شرقًا) · الولايات المتحدة بما فيها ألاسكا وهاواي وبورتوريكو وغوام (NWS) · كندا (ECCC) · وفي غير ذلك RainViewer (آخر ساعتين) · وكملاذ أخير: هطول النموذج من Open-Meteo أو MET Norway.",
  "sourceGroupWindCoverage": "عالمية.",
  "sourceGroupWarningsCoverage": "ألمانيا: DWD، مع MeteoAlarm بديلًا · MeteoAlarm في 39 دولة: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · الولايات المتحدة: NWS · كندا: ECCC · لا تحذيرات في أي مكان آخر.",
  "sourceGroupLocationCoverage": "عالمية.",
  "sourceGroupMapCoverage": "عالمية. أسماء الأماكن من ثلاثة خوادم Overpass بالتناوب: overpass-api.de وoverpass.private.coffee وmaps.mail.ru.",
  "sourceGroupMoonCoverage": "عالمية؛ معكوسة جنوب خط الاستواء.",
  "sourceGroupUv": "مؤشر الأشعة فوق البنفسجية",
  "sourceGroupUvDetails": "توقعات الأشعة فوق البنفسجية الساعية واليومية من Open-Meteo.",
  "sourceGroupNowcast": "المطر خلال الساعتين القادمتين",
  "sourceGroupNowcastDetails": "محور زمني كل 15 دقيقة من التوقعات. في منطقة DWD تُبنى الساعتان القادمتان من التنبؤ الآني لرادار DWD عبر Bright Sky: مطر يهطل بالفعل، مُحرَّك على امتداد مساره. الكميات وبداية المطر هي المتوسط على مساحة 3 × 3 كم حول المكان. أما الاحتمال فيجمع بين مقدار ما يُظهره الرادار مبتلًا من المحيط – نحو 1 كم الآن، يتسع إلى 10 كم بعد ساعتين لتزايد عدم اليقين – واحتمال DWD MOSMIX الذي يزداد وزنه كلما ابتعد الوقت، لأن الرادار لا يستطيع توقع الزخات التي لم تتكون بعد. ويأخذ التوقع الساعي هذه القيم للساعات التي تغطيها. وبعد مدى الرادار، وفي غير ذلك، تأتي كل القيم من التوقعات.",
  "sourceGroupRadar": "الرادار",
  "sourceGroupRadarDetails": "صور رادار من الخدمة الإقليمية الرسمية؛ ويحل RainViewer محلها في غيرها وعند تعطّلها. ومن دون أي رادار تعرض الخريطة هطول النموذج.",
  "sourceGroupWind": "خريطة الرياح",
  "sourceGroupWindDetails": "شبكة Open-Meteo من 35 نقطة فوق نطاق الخريطة؛ وإلا فالرياح المتوقعة في المكان. تعرض خريطة الرياح الرياح على ارتفاع 10 م فوق الأرض.",
  "sourceGroupDrift": "سهم انجراف المطر",
  "sourceGroupDriftDetails": "الاتجاه الذي يتحرك إليه المطر على الرادار، للصورة المعروضة. في منطقة DWD تُتتبَّع الحركة من الرادار نفسه بمقارنة نمط المطر بنمطه بعد 15 دقيقة. وفي غير ذلك، أو عندما يكون المطر أقل من أن يُتتبَّع، تُستخدم رياح النموذج على ارتفاع 3 كم تقريبًا (700 هكتوباسكال)، وإلا فالرياح السطحية. يتحرك المطر مع الرياح على ارتفاع بضعة كيلومترات، وكثيرًا ما تهب من اتجاه يختلف عن الرياح القريبة من الأرض في خريطة الرياح، وفي أيام الزخات بعشرات الدرجات.",
  "sourceGroupDriftCoverage": "تتبع بالرادار في منطقة DWD (نحو 46.5–55.5° شمالًا و5–16° شرقًا) · رياح 700 هكتوباسكال عالميًا.",
  "sourceGroupWarnings": "تحذيرات الطقس",
  "sourceGroupWarningsDetails": "التحذيرات الرسمية للمكان: DWD عبر Bright Sky، أو موجز MeteoAlarm الأوروبي (وواجهة JSON الخاصة به عند تعطّل الموجز)، أو خدمة الطقس الوطنية الأمريكية، أو Environment and Climate Change Canada.",
  "sourceGroupLocation": "المكان",
  "sourceGroupLocationDetails": "الكشف التلقائي بعنوان IP: ipwho.is ثم ipapi.co ثم GeoJS. للمكان المختار يُستعلم عن الاسم والمقاطعة والدولة مرة واحدة عبر Nominatim (OpenStreetMap). البحث عن الأماكن: Open-Meteo Geocoding.",
  "sourceGroupMap": "خلفية الخريطة والأسماء",
  "sourceGroupMapDetails": "خلفية الأقمار الصناعية: DWD GeoServer Blue Marble. أسماء المدن: OpenStreetMap عبر واجهة Overpass، مخزنة مؤقتًا لمدة 30 يومًا.",
  "sourceGroupMoon": "طور القمر",
  "sourceGroupMoonDetails": "يُحسب محليًا (Meeus)؛ معكوس للأماكن الواقعة جنوب خط الاستواء.",
  "sourceLocalCalculation": "حساب محلي",
  "sourceRefreshInfo": "يُحدَّث كل {minutes} دقيقة، ورادار DWD كل 5 دقائق، ويُشارك بين الأداة والتطبيق. آخر تحديث: {updated}.",
  "barPosition": "الموضع في الشريط",
  "barPositionLeft": "يسار",
  "barPositionCenter": "وسط",
  "barPositionRight": "يمين",
  "barPositionTop": "أعلى",
  "barPositionBottom": "أسفل",
  "barPositionHint": "ينقل الأداة داخل شريط Omarchy.",
  "barPositionMissing": "الأداة ليست في الشريط.",
  "showAlways": "دائمًا",
  "showOnHover": "عند التمرير",
  "menubarHoverHint": "تظهر العناصر المضبوطة على «عند التمرير» ما دام المؤشر فوق الطقس في الشريط.",
  "barBehavior": "السلوك",
  "openWidgetOnHover": "فتح الأداة عند التمرير",
  "openWidgetOnHoverHint": "يفتح الأداة عندما يستقر المؤشر فوق الطقس في الشريط ويغلقها عند ابتعاده. النقر يبقيها مفتوحة.",
  "rainIntensity": "شدة المطر",
  "showWhenRelevant": "عند الأهمية",
  "menubarRelevantCurrentHint": "«عند الأهمية» يعرض العنصر فقط عندما يكون لافتًا: الإحساس يبعد 3° عن الحرارة، الرياح من 20 كم/س، الأشعة من 6.",
  "menubarRelevantRainHint": "«عند الأهمية»: الاحتمال من 30 %، الشدة أثناء المطر، بدء المطر خلال ساعتين. يحل بدء المطر والشدة محل الاحتمال.",
  "menubarRelevantAirHint": "«عند الأهمية»: جودة الهواء من «سيئة»، حبوب اللقاح بمستوى مرتفع.",
  "kelvinUnits": "كلفن",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "وحدات أخرى عند التمرير",
  "hoverUnitSystemOff": "معطّل",
  "hoverUnitSystemHint": "ما دام المؤشر فوق الأداة، يتحول الشريط إلى نظام الوحدات هذا. كلفن يغيّر درجات الحرارة فقط.",
  "restoreOrder": "استعادة الترتيب",
  "sunNext": "الحدث الشمسي التالي",
  "sunrise": "الشروق",
  "sunset": "الغروب",
  "moonPhase": "طور القمر",
  "moon": "القمر"
})

addCatalogEntries("he", {
  "settingsPageDisplay": "תצוגה",
  "settingsPageShortcuts": "קיצורי מקלדת",
  "settingsPageSources": "מקורות",
  "shortcutsSubtitle": "מקלדת ועכבר",
  "sourcesSubtitle": "מאין מגיעים הנתונים",
  "shortcutsHint": "אותם מקשים פועלים ביישומון וביישום.",
  "shortcutsGroupGeneral": "כללי",
  "shortcutsGroupNavigation": "גלילה",
  "shortcutsGroupForecast": "גשם, מכ״ם ורוח",
  "shortcutsGroupSearch": "חיפוש מקום",
  "shortcutsGroupSettings": "הגדרות",
  "shortcutsGroupMouse": "שורת תפריטים",
  "shortcutClose": "סגירת החיפוש, ההגדרות או הרשימה, ואז הלוח",
  "shortcutSwitchPanel": "הלוח הבא / הקודם בשורה (יישומון)",
  "shortcutSettings": "פתיחת ההגדרות",
  "shortcutRefresh": "רענון עכשיו",
  "shortcutSearch": "חיפוש מקום",
  "shortcutScroll": "גלילה",
  "shortcutPage": "גלילה בעמוד",
  "shortcutJump": "מעבר להתחלה / לסוף",
  "shortcutScrollDaily": "גלילת התחזית היומית",
  "shortcutViews": "תצוגת גשם / מכ״ם / רוח",
  "shortcutRadarStep": "מכ״ם: תמונה קודמת / הבאה",
  "shortcutRadarPlay": "מכ״ם: הפעלה / השהיה",
  "shortcutZoom": "מפה: התקרבות / התרחקות",
  "shortcutZoomReset": "מפה: זום ברירת מחדל",
  "shortcutSearchSelect": "בחירת תוצאה",
  "shortcutSearchSection": "מעבר בין תוצאות למועדפים",
  "shortcutSearchPick": "הצגת המקום שנבחר",
  "shortcutSearchFavorite": "הוספה / הסרה של מועדף",
  "shortcutSearchCancel": "ביטול החיפוש",
  "shortcutSettingsPages": "עמוד הגדרות קודם / הבא",
  "shortcutSettingsClose": "סגירת ההגדרות",
  "mouseLeft": "לחיצה שמאלית",
  "mouseMiddle": "לחיצה אמצעית",
  "mouseRight": "לחיצה ימנית",
  "shortcutMouseToggle": "פתיחה / סגירה של לוח מזג האוויר",
  "shortcutMouseRefresh": "רענון עכשיו",
  "shortcutMouseNotify": "מזג האוויר כהתראה",
  "sourcesHint": "המקורות נבחרים לפי המקום; אם אחד נכשל, הבא בתור נכנס אוטומטית.",
  "sourceInUse": "בשימוש",
  "sourceNotInUse": "לא בשימוש",
  "sourceGroupForecast": "מזג האוויר הנוכחי ותחזית",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (המודל הלאומי הטוב ביותר לכל אזור), עם MET Norway כגיבוי. בנורווגיה, שוודיה, פינלנד ודנמרק MET Norway קודם, בזכות מודל MET Nordic שלו ברזולוציה של 1 ק״מ. באזור DWD, ‏DWD MOSMIX (דרך Bright Sky) מדייק טמפרטורה, גשם וסמלים.",
  "sourceCoverage": "כיסוי",
  "sourceGroupForecastCoverage": "עולמי. MET Norway קודם ב-NO‏, SE‏, FI‏, DK. ‏DWD MOSMIX רק באזור DWD (בערך 46.5–55.5° צפון, 5–16° מזרח, גם מחוץ לגרמניה).",
  "sourceGroupUvCoverage": "עולמי.",
  "sourceGroupNowcastCoverage": "עולמי. ערכי הגשם של MOSMIX וכמות מכ״ם DWD רק באזור DWD.",
  "sourceGroupRadarCoverage": "אזור DWD (בערך 46.5–55.5° צפון, 5–16° מזרח) · ארה״ב כולל אלסקה, הוואי, פוארטו ריקו וגואם (NWS) · קנדה (ECCC) · בכל מקום אחר RainViewer (השעתיים האחרונות) · כמוצא אחרון: משקעי מודל מ-Open-Meteo או MET Norway.",
  "sourceGroupWindCoverage": "עולמי.",
  "sourceGroupWarningsCoverage": "גרמניה: DWD, עם MeteoAlarm כגיבוי · MeteoAlarm ב-39 מדינות: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · ארה״ב: NWS · קנדה: ECCC · אין אזהרות בשום מקום אחר.",
  "sourceGroupLocationCoverage": "עולמי.",
  "sourceGroupMapCoverage": "עולמי. שמות מקומות לסירוגין משלושה שרתי Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "עולמי; משוקף מדרום לקו המשווה.",
  "sourceGroupUv": "מדד UV",
  "sourceGroupUvDetails": "תחזית UV שעתית ויומית מ-Open-Meteo.",
  "sourceGroupNowcast": "גשם בשעתיים הקרובות",
  "sourceGroupNowcastDetails": "ציר זמן של 15 דקות מהתחזית. באזור DWD שתי השעות הבאות נבנות מהתחזית המיידית של מכ״ם DWD דרך Bright Sky: גשם שכבר יורד, מוזז לאורך מסלולו. הכמויות ותחילת הגשם הן הממוצע על פני 3 × 3 ק״מ סביב המקום. ההסתברות משלבת כמה מהסביבה המכ״ם מראה רטובה – כעת כ-1 ק״מ, ובעוד שעתיים 10 ק״מ בשל אי-הוודאות הגוברת – עם ההסתברות של DWD MOSMIX, שמשקלה גדל ככל שמתרחקים בזמן, כי ממטרים שטרם נוצרו המכ״ם אינו יכול לחזות. התחזית השעתית מאמצת ערכים אלה לשעות שהם מכסים. מעבר למכ״ם, ובמקומות אחרים, כל הערכים מגיעים מהתחזית.",
  "sourceGroupRadar": "מכ״ם",
  "sourceGroupRadarDetails": "תמונות מכ״ם מהשירות האזורי הרשמי; RainViewer מחליף אותו במקומות אחרים ובזמן תקלה. ללא מכ״ם כלל, המפה מציגה משקעי מודל.",
  "sourceGroupWind": "מפת רוח",
  "sourceGroupWindDetails": "רשת Open-Meteo של 35 נקודות על פני שטח המפה; אחרת הרוח החזויה במקום. מפת הרוח מציגה את הרוח בגובה 10 מ׳ מעל הקרקע.",
  "sourceGroupDrift": "חץ תנועת הגשם",
  "sourceGroupDriftDetails": "לאן נע הגשם שבמכ״ם, עבור התמונה המוצגת. באזור DWD התנועה נמדדת מהמכ״ם עצמו, בהשוואת דפוס הגשם לדפוס שלו 15 דקות מאוחר יותר. במקומות אחרים, או כשיש מעט מדי גשם למעקב, משמשת רוח המודל בגובה של כ-3 ק״מ (700 hPa), ואחרת רוח הקרקע. הגשם נע עם הרוח בגובה של כמה קילומטרים, שנושבת לעיתים קרובות מכיוון אחר מהרוח הקרובה לקרקע שבמפת הרוח – בימים של ממטרים בעשרות מעלות.",
  "sourceGroupDriftCoverage": "מעקב מכ״ם באזור DWD (בערך 46.5–55.5° צפון, 5–16° מזרח) · רוח 700 hPa בכל העולם.",
  "sourceGroupWarnings": "אזהרות מזג אוויר",
  "sourceGroupWarningsDetails": "אזהרות רשמיות למקום: DWD דרך Bright Sky, הערוץ האירופי של MeteoAlarm (ממשק ה-JSON שלו כשהערוץ נכשל), שירות מזג האוויר הלאומי של ארה״ב או Environment and Climate Change Canada.",
  "sourceGroupLocation": "מקום",
  "sourceGroupLocationDetails": "זיהוי אוטומטי לפי כתובת IP: ‏ipwho.is, אחר כך ipapi.co, ואז GeoJS. למקום שנבחר, השם, המחוז והמדינה נשלפים פעם אחת דרך Nominatim (OpenStreetMap). חיפוש מקומות: Open-Meteo Geocoding.",
  "sourceGroupMap": "רקע המפה ושמות",
  "sourceGroupMapDetails": "רקע לוויין: DWD GeoServer Blue Marble. שמות ערים: OpenStreetMap דרך ממשק Overpass, שמורים במטמון 30 יום.",
  "sourceGroupMoon": "מופע הירח",
  "sourceGroupMoonDetails": "מחושב מקומית (Meeus); משוקף למקומות מדרום לקו המשווה.",
  "sourceLocalCalculation": "חישוב מקומי",
  "sourceRefreshInfo": "מתרענן כל {minutes} דק׳, מכ״ם DWD כל 5 דק׳, משותף ליישומון וליישום. עדכון אחרון: {updated}.",
  "barPosition": "מיקום בסרגל",
  "barPositionLeft": "שמאל",
  "barPositionCenter": "מרכז",
  "barPositionRight": "ימין",
  "barPositionTop": "למעלה",
  "barPositionBottom": "למטה",
  "barPositionHint": "מעביר את היישומון בתוך הסרגל של Omarchy.",
  "barPositionMissing": "היישומון אינו בסרגל.",
  "showAlways": "תמיד",
  "showOnHover": "במעבר עכבר",
  "menubarHoverHint": "פריטים שהוגדרו „במעבר עכבר” מופיעים כל עוד הסמן נמצא מעל מזג האוויר בסרגל.",
  "barBehavior": "התנהגות",
  "openWidgetOnHover": "פתיחת היישומון במעבר עכבר",
  "openWidgetOnHoverHint": "פותח את היישומון כשהסמן נח מעל מזג האוויר בסרגל וסוגר אותו כשהוא מתרחק. לחיצה משאירה אותו פתוח.",
  "rainIntensity": "עוצמת הגשם",
  "showWhenRelevant": "כשזה בולט",
  "menubarRelevantCurrentHint": "„כשזה בולט” מציג פריט רק כשהוא בולט: תחושה במרחק 3° מהטמפרטורה, רוח מ‑20 קמ״ש, UV מ‑6.",
  "menubarRelevantRainHint": "„כשזה בולט”: סיכוי מ‑30 %, עוצמה כל עוד יורד גשם, תחילת גשם בתוך שעתיים. תחילת הגשם והעוצמה תופסות את מקום הסיכוי.",
  "menubarRelevantAirHint": "„כשזה בולט”: איכות אוויר מ„גרועה”, אבקנים ברמה גבוהה.",
  "kelvinUnits": "קלווין",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "יחידות אחרות במעבר עכבר",
  "hoverUnitSystemOff": "כבוי",
  "hoverUnitSystemHint": "כל עוד הסמן נח על היישומון, הסרגל עובר למערכת היחידות הזו. קלווין משנה רק טמפרטורות.",
  "restoreOrder": "שחזור הסדר",
  "sunNext": "אירוע השמש הבא",
  "sunrise": "זריחה",
  "sunset": "שקיעה",
  "moonPhase": "מופע הירח",
  "moon": "ירח"
})

addCatalogEntries("fa", {
  "settingsPageDisplay": "نمایش",
  "settingsPageShortcuts": "میان‌برها",
  "settingsPageSources": "منابع",
  "shortcutsSubtitle": "صفحه‌کلید و ماوس",
  "sourcesSubtitle": "داده‌ها از کجا می‌آیند",
  "shortcutsHint": "همین کلیدها در ویجت و در برنامه کار می‌کنند.",
  "shortcutsGroupGeneral": "عمومی",
  "shortcutsGroupNavigation": "پیمایش",
  "shortcutsGroupForecast": "باران، رادار و باد",
  "shortcutsGroupSearch": "جست‌وجوی مکان",
  "shortcutsGroupSettings": "تنظیمات",
  "shortcutsGroupMouse": "نوار منو",
  "shortcutClose": "بستن جست‌وجو، تنظیمات یا فهرست، سپس پنل",
  "shortcutSwitchPanel": "پنل بعدی / قبلی نوار (ویجت)",
  "shortcutSettings": "باز کردن تنظیمات",
  "shortcutRefresh": "به‌روزرسانی اکنون",
  "shortcutSearch": "جست‌وجوی مکان",
  "shortcutScroll": "پیمایش",
  "shortcutPage": "پیمایش یک صفحه",
  "shortcutJump": "رفتن به ابتدا / انتها",
  "shortcutScrollDaily": "پیمایش پیش‌بینی روزانه",
  "shortcutViews": "نمای باران / رادار / باد",
  "shortcutRadarStep": "رادار: تصویر قبلی / بعدی",
  "shortcutRadarPlay": "رادار: پخش / مکث",
  "shortcutZoom": "نقشه: بزرگ‌نمایی / کوچک‌نمایی",
  "shortcutZoomReset": "نقشه: بزرگ‌نمایی پیش‌فرض",
  "shortcutSearchSelect": "انتخاب نتیجه",
  "shortcutSearchSection": "جابه‌جایی میان نتایج و برگزیده‌ها",
  "shortcutSearchPick": "نمایش مکان انتخاب‌شده",
  "shortcutSearchFavorite": "افزودن / حذف برگزیده",
  "shortcutSearchCancel": "لغو جست‌وجو",
  "shortcutSettingsPages": "صفحهٔ تنظیمات قبلی / بعدی",
  "shortcutSettingsClose": "بستن تنظیمات",
  "mouseLeft": "کلیک چپ",
  "mouseMiddle": "کلیک وسط",
  "mouseRight": "کلیک راست",
  "shortcutMouseToggle": "باز / بسته کردن پنل آب‌وهوا",
  "shortcutMouseRefresh": "به‌روزرسانی اکنون",
  "shortcutMouseNotify": "آب‌وهوا به‌صورت اعلان",
  "sourcesHint": "منابع بر اساس مکان انتخاب می‌شوند؛ اگر یکی از کار بیفتد، منبع بعدی خودکار جایگزین می‌شود.",
  "sourceInUse": "در حال استفاده",
  "sourceNotInUse": "بدون استفاده",
  "sourceGroupForecast": "آب‌وهوای کنونی و پیش‌بینی",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (بهترین مدل ملی هر منطقه)، با MET Norway به‌عنوان پشتیبان. در نروژ، سوئد، فنلاند و دانمارک MET Norway در اولویت است و مدل MET Nordic با تفکیک 1 کیلومتر پشتوانهٔ آن است. در محدودهٔ DWD، ‏DWD MOSMIX (از طریق Bright Sky) دما، باران و نمادها را دقیق‌تر می‌کند.",
  "sourceCoverage": "پوشش",
  "sourceGroupForecastCoverage": "سراسر جهان. در NO، SE، FI و DK اول MET Norway. ‏DWD MOSMIX فقط در محدودهٔ DWD (حدود 46٫5–55٫5 درجهٔ شمالی و 5–16 درجهٔ شرقی، فراتر از آلمان هم).",
  "sourceGroupUvCoverage": "سراسر جهان.",
  "sourceGroupNowcastCoverage": "سراسر جهان. مقادیر باران MOSMIX و مقدار رادار DWD فقط در محدودهٔ DWD.",
  "sourceGroupRadarCoverage": "محدودهٔ DWD (حدود 46٫5–55٫5 درجهٔ شمالی و 5–16 درجهٔ شرقی) · آمریکا شامل آلاسکا، هاوایی، پورتوریکو و گوام (NWS) · کانادا (ECCC) · در جاهای دیگر RainViewer (دو ساعت گذشته) · آخرین راه: بارش مدل از Open-Meteo یا MET Norway.",
  "sourceGroupWindCoverage": "سراسر جهان.",
  "sourceGroupWarningsCoverage": "آلمان: DWD، با MeteoAlarm به‌عنوان پشتیبان · MeteoAlarm در 39 کشور: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · آمریکا: NWS · کانادا: ECCC · در جای دیگر هشداری نیست.",
  "sourceGroupLocationCoverage": "سراسر جهان.",
  "sourceGroupMapCoverage": "سراسر جهان. نام مکان‌ها به نوبت از سه سرور Overpass: ‏overpass-api.de، overpass.private.coffee، maps.mail.ru.",
  "sourceGroupMoonCoverage": "سراسر جهان؛ در جنوب استوا قرینه.",
  "sourceGroupUv": "شاخص فرابنفش",
  "sourceGroupUvDetails": "پیش‌بینی ساعتی و روزانهٔ فرابنفش از Open-Meteo.",
  "sourceGroupNowcast": "باران در دو ساعت آینده",
  "sourceGroupNowcastDetails": "محور زمانی 15 دقیقه‌ای از پیش‌بینی. در محدودهٔ DWD دو ساعت آینده از پیش‌بینی کوتاه‌مدت رادار DWD از طریق Bright Sky ساخته می‌شود: بارانی که هم‌اکنون می‌بارد، در امتداد مسیرش جابه‌جا شده. مقدار باران و زمان شروع آن میانگین 3 × 3 کیلومتر پیرامون مکان است. احتمال بارش ترکیبی است از اینکه رادار چه بخشی از پیرامون را خیس نشان می‌دهد – اکنون حدود 1 کیلومتر و دو ساعت بعد به‌خاطر افزایش عدم قطعیت 10 کیلومتر – با احتمال DWD MOSMIX که هرچه دورتر در زمان، وزن بیشتری دارد، زیرا رادار نمی‌تواند رگبارهایی را که هنوز شکل نگرفته‌اند پیش‌بینی کند. پیش‌بینی ساعتی برای ساعت‌هایی که این مقادیر پوشش می‌دهند از همین‌ها استفاده می‌کند. فراتر از رادار و در جاهای دیگر، همهٔ مقادیر از پیش‌بینی می‌آید.",
  "sourceGroupRadar": "رادار",
  "sourceGroupRadarDetails": "تصاویر رادار از سرویس رسمی منطقه‌ای؛ در جاهای دیگر و هنگام از کار افتادن آن، RainViewer جایگزین می‌شود. بدون هیچ راداری، نقشه بارش مدل را نشان می‌دهد.",
  "sourceGroupWind": "نقشهٔ باد",
  "sourceGroupWindDetails": "شبکهٔ 35 نقطه‌ای Open-Meteo روی گسترهٔ نقشه؛ در غیر این صورت باد پیش‌بینی‌شده در مکان. نقشهٔ باد، باد را در ارتفاع 10 متری از زمین نشان می‌دهد.",
  "sourceGroupDrift": "پیکان جابه‌جایی باران",
  "sourceGroupDriftDetails": "بارانِ روی رادار در تصویر نمایش‌داده‌شده به کدام سو می‌رود. در محدودهٔ DWD حرکت از خود رادار دنبال می‌شود: الگوی باران با الگوی 15 دقیقه بعد مقایسه می‌شود. در جاهای دیگر، یا وقتی باران برای دنبال کردن خیلی کم است، باد مدل در ارتفاع حدود 3 کیلومتر (700 هکتوپاسکال) و در غیر این صورت باد سطحی به کار می‌رود. باران با باد چند کیلومتر بالاتر حرکت می‌کند که اغلب از جهتی متفاوت با باد نزدیک زمین در نقشهٔ باد می‌وزد؛ در روزهای رگباری تا چند ده درجه.",
  "sourceGroupDriftCoverage": "رهگیری راداری در محدودهٔ DWD (حدود 46٫5–55٫5 درجهٔ شمالی و 5–16 درجهٔ شرقی) · باد 700 هکتوپاسکال در سراسر جهان.",
  "sourceGroupWarnings": "هشدارهای آب‌وهوایی",
  "sourceGroupWarningsDetails": "هشدارهای رسمی برای مکان: DWD از طریق Bright Sky، خوراک اروپایی MeteoAlarm (رابط JSON آن هنگام از کار افتادن خوراک)، سرویس ملی هواشناسی آمریکا یا Environment and Climate Change Canada.",
  "sourceGroupLocation": "مکان",
  "sourceGroupLocationDetails": "تشخیص خودکار با نشانی IP: ‏ipwho.is، سپس ipapi.co، سپس GeoJS. برای مکان انتخاب‌شده نام، شهرستان و کشور یک بار از طریق Nominatim (OpenStreetMap) پرس‌وجو می‌شود. جست‌وجوی مکان: Open-Meteo Geocoding.",
  "sourceGroupMap": "پس‌زمینهٔ نقشه و نام‌ها",
  "sourceGroupMapDetails": "پس‌زمینهٔ ماهواره‌ای: DWD GeoServer Blue Marble. نام شهرها: OpenStreetMap از طریق رابط Overpass، با نگهداری 30 روزه.",
  "sourceGroupMoon": "اهلهٔ ماه",
  "sourceGroupMoonDetails": "محاسبهٔ محلی (Meeus)؛ برای مکان‌های جنوب استوا قرینه.",
  "sourceLocalCalculation": "محاسبهٔ محلی",
  "sourceRefreshInfo": "هر {minutes} دقیقه به‌روز می‌شود و رادار DWD هر 5 دقیقه؛ میان ویجت و برنامه مشترک است. آخرین به‌روزرسانی: {updated}.",
  "barPosition": "جای در نوار",
  "barPositionLeft": "چپ",
  "barPositionCenter": "وسط",
  "barPositionRight": "راست",
  "barPositionTop": "بالا",
  "barPositionBottom": "پایین",
  "barPositionHint": "ویجت را درون نوار Omarchy جابه‌جا می‌کند.",
  "barPositionMissing": "ویجت در نوار نیست.",
  "showAlways": "همیشه",
  "showOnHover": "هنگام نگه‌داشتن نشانگر",
  "menubarHoverHint": "موارد «هنگام نگه‌داشتن نشانگر» تا وقتی نشانگر روی آب‌وهوای نوار است نمایش داده می‌شوند.",
  "barBehavior": "رفتار",
  "openWidgetOnHover": "باز کردن ویجت با نگه‌داشتن نشانگر",
  "openWidgetOnHoverHint": "وقتی نشانگر روی آب‌وهوای نوار بماند ویجت را باز می‌کند و با دور شدن آن را می‌بندد. با کلیک باز می‌ماند.",
  "rainIntensity": "شدت باران",
  "showWhenRelevant": "هنگام اهمیت",
  "menubarRelevantCurrentHint": "«هنگام اهمیت» یک مورد را تنها وقتی نشان می‌دهد که برجسته باشد: دمای احساسی ۳° دورتر از دما، باد از ۲۰ کیلومتر بر ساعت، UV از ۶.",
  "menubarRelevantRainHint": "«هنگام اهمیت»: احتمال از ۳۰ ٪، شدت تا وقتی باران می‌بارد، آغاز باران تا دو ساعت آینده. آغاز باران و شدت جای احتمال را می‌گیرند.",
  "menubarRelevantAirHint": "«هنگام اهمیت»: کیفیت هوا از «بد»، گرده در سطح بالا.",
  "kelvinUnits": "کلوین",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "واحدهای دیگر هنگام نگه‌داشتن نشانگر",
  "hoverUnitSystemOff": "خاموش",
  "hoverUnitSystemHint": "تا وقتی نشانگر روی ویجت بماند، نوار به این نظام واحدها تغییر می‌کند. کلوین فقط دما را تغییر می‌دهد.",
  "restoreOrder": "بازگرداندن ترتیب",
  "sunNext": "رویداد بعدی خورشید",
  "sunrise": "طلوع آفتاب",
  "sunset": "غروب آفتاب",
  "moonPhase": "فاز ماه",
  "moon": "ماه"
})

addCatalogEntries("hi", {
  "settingsPageDisplay": "प्रदर्शन",
  "settingsPageShortcuts": "शॉर्टकट",
  "settingsPageSources": "स्रोत",
  "shortcutsSubtitle": "कीबोर्ड और माउस",
  "sourcesSubtitle": "डेटा कहाँ से आता है",
  "shortcutsHint": "विजेट और ऐप में वही कुंजियाँ काम करती हैं।",
  "shortcutsGroupGeneral": "सामान्य",
  "shortcutsGroupNavigation": "स्क्रॉल",
  "shortcutsGroupForecast": "बारिश, रडार और हवा",
  "shortcutsGroupSearch": "स्थान खोज",
  "shortcutsGroupSettings": "सेटिंग्स",
  "shortcutsGroupMouse": "मेन्यू बार",
  "shortcutClose": "खोज, सेटिंग्स या सूची बंद करें, फिर पैनल",
  "shortcutSwitchPanel": "बार का अगला / पिछला पैनल (विजेट)",
  "shortcutSettings": "सेटिंग्स खोलें",
  "shortcutRefresh": "अभी रीफ़्रेश करें",
  "shortcutSearch": "स्थान खोजें",
  "shortcutScroll": "स्क्रॉल करें",
  "shortcutPage": "एक पेज स्क्रॉल करें",
  "shortcutJump": "शुरुआत / अंत पर जाएँ",
  "shortcutScrollDaily": "दैनिक पूर्वानुमान स्क्रॉल करें",
  "shortcutViews": "बारिश / रडार / हवा दृश्य",
  "shortcutRadarStep": "रडार: पिछली / अगली छवि",
  "shortcutRadarPlay": "रडार: चलाएँ / रोकें",
  "shortcutZoom": "मानचित्र: ज़ूम इन / आउट",
  "shortcutZoomReset": "मानचित्र: डिफ़ॉल्ट ज़ूम",
  "shortcutSearchSelect": "परिणाम चुनें",
  "shortcutSearchSection": "परिणामों और पसंदीदा के बीच बदलें",
  "shortcutSearchPick": "चुना गया स्थान दिखाएँ",
  "shortcutSearchFavorite": "पसंदीदा जोड़ें / हटाएँ",
  "shortcutSearchCancel": "खोज रद्द करें",
  "shortcutSettingsPages": "पिछला / अगला सेटिंग्स पेज",
  "shortcutSettingsClose": "सेटिंग्स बंद करें",
  "mouseLeft": "बायाँ क्लिक",
  "mouseMiddle": "मध्य क्लिक",
  "mouseRight": "दायाँ क्लिक",
  "shortcutMouseToggle": "मौसम पैनल खोलें / बंद करें",
  "shortcutMouseRefresh": "अभी रीफ़्रेश करें",
  "shortcutMouseNotify": "मौसम सूचना के रूप में",
  "sourcesHint": "स्रोत स्थान के अनुसार चुने जाते हैं; कोई विफल हो तो अगला स्रोत अपने-आप काम संभाल लेता है।",
  "sourceInUse": "उपयोग में",
  "sourceNotInUse": "उपयोग में नहीं",
  "sourceGroupForecast": "वर्तमान मौसम और पूर्वानुमान",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (हर क्षेत्र का सर्वश्रेष्ठ राष्ट्रीय मॉडल), बैकअप के रूप में MET Norway. नॉर्वे, स्वीडन, फ़िनलैंड और डेनमार्क में MET Norway पहले आता है, जिसके पीछे उसका 1 किमी का MET Nordic मॉडल है। DWD क्षेत्र में DWD MOSMIX (Bright Sky के ज़रिए) तापमान, बारिश और प्रतीकों को और सटीक बनाता है।",
  "sourceCoverage": "कवरेज",
  "sourceGroupForecastCoverage": "विश्वव्यापी। NO, SE, FI, DK में पहले MET Norway. DWD MOSMIX केवल DWD क्षेत्र में (लगभग 46.5–55.5° उ., 5–16° पू., जर्मनी के बाहर भी)।",
  "sourceGroupUvCoverage": "विश्वव्यापी।",
  "sourceGroupNowcastCoverage": "विश्वव्यापी। MOSMIX के बारिश मान और DWD रडार की मात्रा केवल DWD क्षेत्र में।",
  "sourceGroupRadarCoverage": "DWD क्षेत्र (लगभग 46.5–55.5° उ., 5–16° पू.) · अमेरिका, अलास्का, हवाई, प्यूर्टो रिको और गुआम सहित (NWS) · कनाडा (ECCC) · बाकी जगह RainViewer (पिछले दो घंटे) · अंतिम विकल्प: Open-Meteo या MET Norway का मॉडल वर्षण।",
  "sourceGroupWindCoverage": "विश्वव्यापी।",
  "sourceGroupWarningsCoverage": "जर्मनी: DWD, बैकअप के रूप में MeteoAlarm · 39 देशों में MeteoAlarm: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · अमेरिका: NWS · कनाडा: ECCC · और कहीं चेतावनियाँ नहीं।",
  "sourceGroupLocationCoverage": "विश्वव्यापी।",
  "sourceGroupMapCoverage": "विश्वव्यापी। स्थानों के नाम बारी-बारी से तीन Overpass सर्वरों से: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "विश्वव्यापी; भूमध्य रेखा के दक्षिण में दर्पण-प्रतिबिंबित।",
  "sourceGroupUv": "यूवी सूचकांक",
  "sourceGroupUvDetails": "Open-Meteo का प्रति घंटा और दैनिक यूवी पूर्वानुमान।",
  "sourceGroupNowcast": "अगले दो घंटों में बारिश",
  "sourceGroupNowcastDetails": "पूर्वानुमान से 15 मिनट की समय-रेखा। DWD क्षेत्र में अगले दो घंटे Bright Sky के ज़रिए DWD रडार नाउकास्ट से बनते हैं: पहले से हो रही बारिश, उसके मार्ग पर आगे बढ़ाई गई। मात्रा और बारिश शुरू होने का समय स्थान के आसपास 3 × 3 किमी का औसत है। संभावना इस बात को, कि रडार आसपास का कितना हिस्सा गीला दिखाता है – अभी लगभग 1 किमी, बढ़ती अनिश्चितता के कारण दो घंटे में 10 किमी तक – DWD MOSMIX की संभावना से जोड़ती है, जिसका महत्व समय जितना आगे हो उतना बढ़ता है, क्योंकि जो बौछारें अभी बनी ही नहीं हैं, उन्हें रडार पहले से नहीं देख सकता। घंटेवार पूर्वानुमान इन्हीं मानों को उन घंटों के लिए लेता है जिन्हें ये कवर करते हैं। रडार से आगे, और अन्य जगहों पर, सभी मान पूर्वानुमान से आते हैं।",
  "sourceGroupRadar": "रडार",
  "sourceGroupRadarDetails": "आधिकारिक क्षेत्रीय सेवा की रडार छवियाँ; अन्य जगहों पर और उसके विफल होने पर RainViewer काम संभालता है। किसी भी रडार के बिना मानचित्र मॉडल वर्षण दिखाता है।",
  "sourceGroupWind": "हवा का मानचित्र",
  "sourceGroupWindDetails": "मानचित्र क्षेत्र पर 35 बिंदुओं का Open-Meteo ग्रिड; अन्यथा स्थान पर पूर्वानुमानित हवा। हवा का मानचित्र ज़मीन से 10 मीटर ऊपर की हवा दिखाता है।",
  "sourceGroupDrift": "वर्षा के खिसकने का तीर",
  "sourceGroupDriftDetails": "दिखाए गए फ़्रेम में रडार पर वर्षा किस ओर बढ़ रही है। DWD क्षेत्र में गति रडार से ही ट्रैक की जाती है: वर्षा के पैटर्न की तुलना 15 मिनट बाद के पैटर्न से की जाती है। अन्य जगहों पर, या ट्रैक करने लायक वर्षा बहुत कम होने पर, लगभग 3 किमी ऊँचाई (700 hPa) की मॉडल हवा, और वह भी न हो तो सतही हवा ली जाती है। वर्षा कुछ किलोमीटर ऊपर की हवा के साथ चलती है, जो अक्सर हवा के मानचित्र की ज़मीन के पास की हवा से अलग दिशा से बहती है – बौछारों वाले दिनों में कई दसियों डिग्री तक।",
  "sourceGroupDriftCoverage": "DWD क्षेत्र में रडार ट्रैकिंग (लगभग 46.5–55.5° उ., 5–16° पू.) · विश्वभर में 700 hPa हवा।",
  "sourceGroupWarnings": "मौसम चेतावनियाँ",
  "sourceGroupWarningsDetails": "स्थान के लिए आधिकारिक चेतावनियाँ: Bright Sky के ज़रिए DWD, यूरोपीय MeteoAlarm फ़ीड (फ़ीड विफल होने पर उसका JSON API), अमेरिकी राष्ट्रीय मौसम सेवा या Environment and Climate Change Canada.",
  "sourceGroupLocation": "स्थान",
  "sourceGroupLocationDetails": "IP पते से स्वचालित पहचान: ipwho.is, फिर ipapi.co, फिर GeoJS. चुने गए स्थान का नाम, ज़िला और देश एक बार Nominatim (OpenStreetMap) से देखा जाता है। स्थान खोज: Open-Meteo Geocoding.",
  "sourceGroupMap": "मानचित्र पृष्ठभूमि और नाम",
  "sourceGroupMapDetails": "उपग्रह पृष्ठभूमि: DWD GeoServer Blue Marble. शहरों के नाम: Overpass API के ज़रिए OpenStreetMap, 30 दिन के लिए कैश।",
  "sourceGroupMoon": "चंद्र कला",
  "sourceGroupMoonDetails": "स्थानीय रूप से गणना (Meeus); भूमध्य रेखा के दक्षिण के स्थानों के लिए दर्पण-प्रतिबिंबित।",
  "sourceLocalCalculation": "स्थानीय गणना",
  "sourceRefreshInfo": "हर {minutes} मिनट में रीफ़्रेश, DWD रडार हर 5 मिनट में, विजेट और ऐप के बीच साझा। अंतिम अपडेट: {updated}.",
  "barPosition": "बार में स्थान",
  "barPositionLeft": "बाएँ",
  "barPositionCenter": "बीच में",
  "barPositionRight": "दाएँ",
  "barPositionTop": "ऊपर",
  "barPositionBottom": "नीचे",
  "barPositionHint": "विजेट को Omarchy बार के भीतर खिसकाता है।",
  "barPositionMissing": "विजेट बार में नहीं है।",
  "showAlways": "हमेशा",
  "showOnHover": "होवर करने पर",
  "menubarHoverHint": "“होवर करने पर” वाली प्रविष्टियाँ तब दिखती हैं जब पॉइंटर बार में मौसम पर हो।",
  "barBehavior": "व्यवहार",
  "openWidgetOnHover": "होवर करने पर विजेट खोलें",
  "openWidgetOnHoverHint": "पॉइंटर बार में मौसम पर रुकने पर विजेट खोलता है और हटने पर बंद करता है। क्लिक करने से यह खुला रहता है।",
  "rainIntensity": "बारिश की तीव्रता",
  "showWhenRelevant": "जब अहम हो",
  "menubarRelevantCurrentHint": "“जब अहम हो” किसी प्रविष्टि को तभी दिखाता है जब वह अलग दिखे: महसूस तापमान 3° का अंतर, हवा 20 किमी/घंटा से, UV 6 से।",
  "menubarRelevantRainHint": "“जब अहम हो”: संभावना 30 % से, बारिश के दौरान तीव्रता, दो घंटे के भीतर बारिश की शुरुआत। बारिश की शुरुआत और तीव्रता संभावना की जगह लेती हैं।",
  "menubarRelevantAirHint": "“जब अहम हो”: वायु गुणवत्ता “खराब” से, पराग उच्च स्तर पर।",
  "kelvinUnits": "केल्विन",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "होवर करने पर दूसरी इकाइयाँ",
  "hoverUnitSystemOff": "बंद",
  "hoverUnitSystemHint": "जब तक पॉइंटर विजेट पर रहता है, बार इस इकाई प्रणाली में बदल जाता है। केल्विन केवल तापमान बदलता है।",
  "restoreOrder": "क्रम पुनर्स्थापित करें",
  "sunNext": "अगली सूर्य घटना",
  "sunrise": "सूर्योदय",
  "sunset": "सूर्यास्त",
  "moonPhase": "चंद्र कला",
  "moon": "चंद्रमा"
})

addCatalogEntries("id", {
  "settingsPageDisplay": "Tampilan",
  "settingsPageShortcuts": "Pintasan",
  "settingsPageSources": "Sumber",
  "shortcutsSubtitle": "Papan ketik dan tetikus",
  "sourcesSubtitle": "Asal data",
  "shortcutsHint": "Tombol yang sama berfungsi di widget dan di aplikasi.",
  "shortcutsGroupGeneral": "UMUM",
  "shortcutsGroupNavigation": "GULIR",
  "shortcutsGroupForecast": "HUJAN, RADAR, DAN ANGIN",
  "shortcutsGroupSearch": "PENCARIAN TEMPAT",
  "shortcutsGroupSettings": "PENGATURAN",
  "shortcutsGroupMouse": "BILAH MENU",
  "shortcutClose": "Tutup pencarian, pengaturan, atau daftar, lalu panel",
  "shortcutSwitchPanel": "Panel bilah berikutnya / sebelumnya (widget)",
  "shortcutSettings": "Buka pengaturan",
  "shortcutRefresh": "Segarkan sekarang",
  "shortcutSearch": "Cari tempat",
  "shortcutScroll": "Gulir",
  "shortcutPage": "Gulir satu halaman",
  "shortcutJump": "Ke awal / akhir",
  "shortcutScrollDaily": "Gulir prakiraan harian",
  "shortcutViews": "Tampilan hujan / radar / angin",
  "shortcutRadarStep": "Radar: gambar sebelumnya / berikutnya",
  "shortcutRadarPlay": "Radar: putar / jeda",
  "shortcutZoom": "Peta: perbesar / perkecil",
  "shortcutZoomReset": "Peta: zoom bawaan",
  "shortcutSearchSelect": "Pilih hasil",
  "shortcutSearchSection": "Beralih antara hasil dan favorit",
  "shortcutSearchPick": "Tampilkan tempat yang dipilih",
  "shortcutSearchFavorite": "Tambah / hapus favorit",
  "shortcutSearchCancel": "Batalkan pencarian",
  "shortcutSettingsPages": "Halaman pengaturan sebelumnya / berikutnya",
  "shortcutSettingsClose": "Tutup pengaturan",
  "mouseLeft": "Klik kiri",
  "mouseMiddle": "Klik tengah",
  "mouseRight": "Klik kanan",
  "shortcutMouseToggle": "Buka / tutup panel cuaca",
  "shortcutMouseRefresh": "Segarkan sekarang",
  "shortcutMouseNotify": "Cuaca sebagai notifikasi",
  "sourcesHint": "Sumber dipilih per tempat; jika satu gagal, sumber berikutnya otomatis mengambil alih.",
  "sourceInUse": "DIGUNAKAN",
  "sourceNotInUse": "tidak digunakan",
  "sourceGroupForecast": "Cuaca saat ini dan prakiraan",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (model nasional terbaik per wilayah), dengan MET Norway sebagai cadangan. Di Norwegia, Swedia, Finlandia, dan Denmark MET Norway didahulukan, didukung model MET Nordic 1 km miliknya. Di wilayah DWD, DWD MOSMIX (melalui Bright Sky) menyempurnakan suhu, hujan, dan simbol.",
  "sourceCoverage": "CAKUPAN",
  "sourceGroupForecastCoverage": "Seluruh dunia. MET Norway didahulukan di NO, SE, FI, DK. DWD MOSMIX hanya di wilayah DWD (sekitar 46,5–55,5° LU, 5–16° BT, juga di luar Jerman).",
  "sourceGroupUvCoverage": "Seluruh dunia.",
  "sourceGroupNowcastCoverage": "Seluruh dunia. Nilai hujan MOSMIX dan jumlah dari radar DWD hanya di wilayah DWD.",
  "sourceGroupRadarCoverage": "Wilayah DWD (sekitar 46,5–55,5° LU, 5–16° BT) · AS termasuk Alaska, Hawaii, Puerto Riko, dan Guam (NWS) · Kanada (ECCC) · di tempat lain RainViewer (dua jam terakhir) · pilihan terakhir: presipitasi model dari Open-Meteo atau MET Norway.",
  "sourceGroupWindCoverage": "Seluruh dunia.",
  "sourceGroupWarningsCoverage": "Jerman: DWD, dengan MeteoAlarm sebagai cadangan · MeteoAlarm di 39 negara: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · AS: NWS · Kanada: ECCC · tidak ada peringatan di tempat lain.",
  "sourceGroupLocationCoverage": "Seluruh dunia.",
  "sourceGroupMapCoverage": "Seluruh dunia. Nama tempat bergantian dari tiga server Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Seluruh dunia; dicerminkan di selatan khatulistiwa.",
  "sourceGroupUv": "Indeks UV",
  "sourceGroupUvDetails": "Prakiraan UV per jam dan harian dari Open-Meteo.",
  "sourceGroupNowcast": "Hujan dalam dua jam ke depan",
  "sourceGroupNowcastDetails": "Sumbu waktu 15 menit dari prakiraan. Di wilayah DWD dua jam ke depan disusun dari nowcast radar DWD melalui Bright Sky: hujan yang sudah turun, digeser mengikuti lintasannya. Jumlah dan waktu mulainya hujan adalah rata-rata 3 × 3 km di sekitar tempat itu. Peluang hujan menggabungkan seberapa luas sekitar yang ditunjukkan radar basah – sekarang sekitar 1 km, melebar hingga 10 km dalam dua jam karena ketidakpastian yang bertambah – dengan peluang dari DWD MOSMIX, yang makin berbobot makin jauh ke depan, karena radar tidak dapat memperkirakan hujan lokal yang belum terbentuk. Prakiraan per jam memakai nilai ini untuk jam-jam yang dicakupnya. Di luar jangkauan radar, dan di tempat lain, semua nilai berasal dari prakiraan.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Gambar radar dari layanan resmi regional; RainViewer menggantikannya di tempat lain dan saat layanan itu gagal. Tanpa radar, peta menampilkan presipitasi model.",
  "sourceGroupWind": "Peta angin",
  "sourceGroupWindDetails": "Kisi Open-Meteo 35 titik di atas area peta; jika tidak, angin prakiraan di tempat itu. Peta angin menampilkan angin 10 m di atas permukaan tanah.",
  "sourceGroupDrift": "Panah pergerakan hujan",
  "sourceGroupDriftDetails": "Ke mana hujan di radar bergerak, untuk bingkai yang ditampilkan. Di wilayah DWD, gerakannya dilacak dari radar itu sendiri dengan membandingkan pola hujan dengan pola 15 menit kemudian. Di tempat lain, atau jika hujan terlalu sedikit untuk dilacak, dipakai angin model pada ketinggian sekitar 3 km (700 hPa), jika tidak angin permukaan. Hujan bergerak bersama angin beberapa kilometer di atas, yang sering bertiup dari arah berbeda dengan angin dekat permukaan di peta angin – pada hari hujan lokal bisa berselisih puluhan derajat.",
  "sourceGroupDriftCoverage": "Pelacakan radar di wilayah DWD (sekitar 46,5–55,5° LU, 5–16° BT) · angin 700 hPa di seluruh dunia.",
  "sourceGroupWarnings": "Peringatan cuaca",
  "sourceGroupWarningsDetails": "Peringatan resmi untuk tempat itu: DWD melalui Bright Sky, umpan MeteoAlarm Eropa (API JSON-nya jika umpan gagal), National Weather Service AS, atau Environment and Climate Change Canada.",
  "sourceGroupLocation": "Tempat",
  "sourceGroupLocationDetails": "Deteksi otomatis berdasarkan alamat IP: ipwho.is, lalu ipapi.co, lalu GeoJS. Untuk tempat yang dipilih, nama, kabupaten, dan negara dicari sekali melalui Nominatim (OpenStreetMap). Pencarian tempat: Open-Meteo Geocoding.",
  "sourceGroupMap": "Latar peta dan nama",
  "sourceGroupMapDetails": "Latar satelit: DWD GeoServer Blue Marble. Nama kota: OpenStreetMap melalui API Overpass, disimpan selama 30 hari.",
  "sourceGroupMoon": "Fase bulan",
  "sourceGroupMoonDetails": "Dihitung secara lokal (Meeus); dicerminkan untuk tempat di selatan khatulistiwa.",
  "sourceLocalCalculation": "PERHITUNGAN LOKAL",
  "sourceRefreshInfo": "Diperbarui setiap {minutes} menit, radar DWD setiap 5 menit, dibagikan antara widget dan aplikasi. Pembaruan terakhir: {updated}.",
  "barPosition": "Posisi di bilah",
  "barPositionLeft": "Kiri",
  "barPositionCenter": "Tengah",
  "barPositionRight": "Kanan",
  "barPositionTop": "Atas",
  "barPositionBottom": "Bawah",
  "barPositionHint": "Memindahkan widget di dalam bilah Omarchy.",
  "barPositionMissing": "Widget tidak ada di bilah.",
  "showAlways": "Selalu",
  "showOnHover": "Saat diarahkan",
  "menubarHoverHint": "Entri “Saat diarahkan” muncul selama penunjuk berada di atas cuaca pada bilah.",
  "barBehavior": "Perilaku",
  "openWidgetOnHover": "Buka widget saat diarahkan",
  "openWidgetOnHoverHint": "Membuka widget saat penunjuk berhenti di atas cuaca pada bilah dan menutupnya saat penunjuk menjauh. Klik membuatnya tetap terbuka.",
  "rainIntensity": "Intensitas hujan",
  "showWhenRelevant": "Saat menonjol",
  "menubarRelevantCurrentHint": "“Saat menonjol” hanya menampilkan entri bila nilainya menonjol: terasa 3° dari suhu, angin dari 20 km/jam, UV dari 6.",
  "menubarRelevantRainHint": "“Saat menonjol”: peluang dari 30 %, intensitas selama hujan, awal hujan dalam dua jam. Awal hujan dan intensitas menggantikan peluang.",
  "menubarRelevantAirHint": "“Saat menonjol”: kualitas udara dari “buruk”, serbuk sari pada tingkat tinggi.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Satuan lain saat diarahkan",
  "hoverUnitSystemOff": "Mati",
  "hoverUnitSystemHint": "Selama penunjuk berada di atas widget, bilah beralih ke sistem satuan ini. Kelvin hanya mengubah suhu.",
  "restoreOrder": "Pulihkan urutan",
  "sunNext": "Peristiwa matahari berikutnya",
  "sunrise": "Matahari terbit",
  "sunset": "Matahari terbenam",
  "moonPhase": "Fase bulan",
  "moon": "Bulan"
})

addCatalogEntries("vi", {
  "settingsPageDisplay": "Hiển thị",
  "settingsPageShortcuts": "Phím tắt",
  "settingsPageSources": "Nguồn dữ liệu",
  "shortcutsSubtitle": "Bàn phím và chuột",
  "sourcesSubtitle": "Dữ liệu đến từ đâu",
  "shortcutsHint": "Cùng các phím này hoạt động trong tiện ích và trong ứng dụng.",
  "shortcutsGroupGeneral": "CHUNG",
  "shortcutsGroupNavigation": "CUỘN",
  "shortcutsGroupForecast": "MƯA, RADAR VÀ GIÓ",
  "shortcutsGroupSearch": "TÌM ĐỊA ĐIỂM",
  "shortcutsGroupSettings": "CÀI ĐẶT",
  "shortcutsGroupMouse": "THANH MENU",
  "shortcutClose": "Đóng tìm kiếm, cài đặt hoặc danh sách, sau đó đóng bảng",
  "shortcutSwitchPanel": "Bảng tiếp theo / trước đó trên thanh (tiện ích)",
  "shortcutSettings": "Mở cài đặt",
  "shortcutRefresh": "Làm mới ngay",
  "shortcutSearch": "Tìm địa điểm",
  "shortcutScroll": "Cuộn",
  "shortcutPage": "Cuộn một trang",
  "shortcutJump": "Về đầu / cuối",
  "shortcutScrollDaily": "Cuộn dự báo theo ngày",
  "shortcutViews": "Chế độ xem mưa / radar / gió",
  "shortcutRadarStep": "Radar: ảnh trước / sau",
  "shortcutRadarPlay": "Radar: phát / tạm dừng",
  "shortcutZoom": "Bản đồ: phóng to / thu nhỏ",
  "shortcutZoomReset": "Bản đồ: mức thu phóng mặc định",
  "shortcutSearchSelect": "Chọn kết quả",
  "shortcutSearchSection": "Chuyển giữa kết quả và mục yêu thích",
  "shortcutSearchPick": "Hiển thị địa điểm đã chọn",
  "shortcutSearchFavorite": "Thêm / xóa mục yêu thích",
  "shortcutSearchCancel": "Hủy tìm kiếm",
  "shortcutSettingsPages": "Trang cài đặt trước / sau",
  "shortcutSettingsClose": "Đóng cài đặt",
  "mouseLeft": "Nhấp chuột trái",
  "mouseMiddle": "Nhấp chuột giữa",
  "mouseRight": "Nhấp chuột phải",
  "shortcutMouseToggle": "Mở / đóng bảng thời tiết",
  "shortcutMouseRefresh": "Làm mới ngay",
  "shortcutMouseNotify": "Thời tiết dưới dạng thông báo",
  "sourcesHint": "Nguồn được chọn theo từng địa điểm; nếu một nguồn không phản hồi, nguồn tiếp theo tự động thay thế.",
  "sourceInUse": "ĐANG DÙNG",
  "sourceNotInUse": "không dùng",
  "sourceGroupForecast": "Thời tiết hiện tại và dự báo",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (mô hình quốc gia tốt nhất cho từng khu vực), dự phòng là MET Norway. Tại Na Uy, Thụy Điển, Phần Lan và Đan Mạch, MET Norway được ưu tiên nhờ mô hình MET Nordic độ phân giải 1 km. Trong vùng DWD, DWD MOSMIX (qua Bright Sky) tinh chỉnh nhiệt độ, mưa và biểu tượng.",
  "sourceCoverage": "PHẠM VI",
  "sourceGroupForecastCoverage": "Toàn cầu. MET Norway được ưu tiên ở NO, SE, FI, DK. DWD MOSMIX chỉ trong vùng DWD (khoảng 46,5–55,5° B, 5–16° Đ, cả ngoài nước Đức).",
  "sourceGroupUvCoverage": "Toàn cầu.",
  "sourceGroupNowcastCoverage": "Toàn cầu. Giá trị mưa MOSMIX và lượng mưa từ radar DWD chỉ trong vùng DWD.",
  "sourceGroupRadarCoverage": "Vùng DWD (khoảng 46,5–55,5° B, 5–16° Đ) · Hoa Kỳ gồm Alaska, Hawaii, Puerto Rico và Guam (NWS) · Canada (ECCC) · nơi khác dùng RainViewer (hai giờ qua) · cuối cùng: lượng mưa mô hình từ Open-Meteo hoặc MET Norway.",
  "sourceGroupWindCoverage": "Toàn cầu.",
  "sourceGroupWarningsCoverage": "Đức: DWD, dự phòng là MeteoAlarm · MeteoAlarm tại 39 quốc gia: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · Hoa Kỳ: NWS · Canada: ECCC · nơi khác không có cảnh báo.",
  "sourceGroupLocationCoverage": "Toàn cầu.",
  "sourceGroupMapCoverage": "Toàn cầu. Tên địa điểm lần lượt từ ba máy chủ Overpass: overpass-api.de, overpass.private.coffee, maps.mail.ru.",
  "sourceGroupMoonCoverage": "Toàn cầu; lật gương ở phía nam xích đạo.",
  "sourceGroupUv": "Chỉ số UV",
  "sourceGroupUvDetails": "Dự báo UV theo giờ và theo ngày của Open-Meteo.",
  "sourceGroupNowcast": "Mưa trong hai giờ tới",
  "sourceGroupNowcastDetails": "Trục thời gian 15 phút từ dự báo. Trong vùng DWD, hai giờ tới được xây dựng từ dự báo tức thời của radar DWD qua Bright Sky: mưa đang rơi, được dịch chuyển theo đường đi của nó. Lượng mưa và thời điểm bắt đầu mưa là trung bình trên 3 × 3 km quanh địa điểm. Xác suất mưa kết hợp mức độ vùng xung quanh mà radar cho thấy đang mưa – hiện khoảng 1 km, mở rộng tới 10 km sau hai giờ vì độ bất định tăng dần – với xác suất của DWD MOSMIX, có trọng số càng lớn khi càng xa về sau, vì radar không thể thấy trước những cơn mưa rào chưa hình thành. Dự báo theo giờ dùng các giá trị này cho những giờ chúng bao phủ. Ngoài phạm vi radar, và ở nơi khác, mọi giá trị đều lấy từ dự báo.",
  "sourceGroupRadar": "Radar",
  "sourceGroupRadarDetails": "Ảnh radar từ cơ quan chính thức của khu vực; RainViewer thay thế ở nơi khác và khi dịch vụ đó gặp sự cố. Không có radar nào thì bản đồ hiển thị lượng mưa mô hình.",
  "sourceGroupWind": "Bản đồ gió",
  "sourceGroupWindDetails": "Lưới Open-Meteo gồm 35 điểm trên phạm vi bản đồ; nếu không thì gió dự báo tại địa điểm. Bản đồ gió hiển thị gió ở độ cao 10 m so với mặt đất.",
  "sourceGroupDrift": "Mũi tên di chuyển của mưa",
  "sourceGroupDriftDetails": "Mưa trên radar đang di chuyển về đâu, theo khung hình đang hiển thị. Trong vùng DWD, chuyển động được theo dõi ngay trên radar bằng cách so sánh dạng phân bố mưa với dạng 15 phút sau. Ở nơi khác, hoặc khi mưa quá ít để theo dõi, dùng gió mô hình ở độ cao khoảng 3 km (700 hPa), nếu không thì gió bề mặt. Mưa di chuyển theo gió ở độ cao vài kilômét, gió này thường thổi từ hướng khác với gió gần mặt đất trên bản đồ gió – vào những ngày mưa rào có thể lệch vài chục độ.",
  "sourceGroupDriftCoverage": "Theo dõi bằng radar trong vùng DWD (khoảng 46,5–55,5° B, 5–16° Đ) · gió 700 hPa trên toàn cầu.",
  "sourceGroupWarnings": "Cảnh báo thời tiết",
  "sourceGroupWarningsDetails": "Cảnh báo chính thức cho địa điểm: DWD qua Bright Sky, nguồn cấp MeteoAlarm châu Âu (API JSON của nó khi nguồn cấp lỗi), Cơ quan Thời tiết Quốc gia Hoa Kỳ hoặc Environment and Climate Change Canada.",
  "sourceGroupLocation": "Địa điểm",
  "sourceGroupLocationDetails": "Tự động phát hiện theo địa chỉ IP: ipwho.is, sau đó ipapi.co, rồi GeoJS. Với địa điểm đã chọn, tên, quận/huyện và quốc gia được tra một lần qua Nominatim (OpenStreetMap). Tìm địa điểm: Open-Meteo Geocoding.",
  "sourceGroupMap": "Nền bản đồ và tên",
  "sourceGroupMapDetails": "Nền vệ tinh: DWD GeoServer Blue Marble. Tên thành phố: OpenStreetMap qua API Overpass, lưu đệm 30 ngày.",
  "sourceGroupMoon": "Tuần trăng",
  "sourceGroupMoonDetails": "Tính cục bộ (Meeus); lật gương cho địa điểm ở phía nam xích đạo.",
  "sourceLocalCalculation": "TÍNH CỤC BỘ",
  "sourceRefreshInfo": "Làm mới mỗi {minutes} phút, radar DWD mỗi 5 phút, dùng chung cho tiện ích và ứng dụng. Cập nhật lần cuối: {updated}.",
  "barPosition": "Vị trí trên thanh",
  "barPositionLeft": "Trái",
  "barPositionCenter": "Giữa",
  "barPositionRight": "Phải",
  "barPositionTop": "Trên",
  "barPositionBottom": "Dưới",
  "barPositionHint": "Di chuyển tiện ích trong thanh Omarchy.",
  "barPositionMissing": "Tiện ích không có trên thanh.",
  "showAlways": "Luôn luôn",
  "showOnHover": "Khi rê chuột",
  "menubarHoverHint": "Các mục “Khi rê chuột” hiện ra khi con trỏ nằm trên thời tiết ở thanh.",
  "barBehavior": "Hành vi",
  "openWidgetOnHover": "Mở tiện ích khi rê chuột",
  "openWidgetOnHoverHint": "Mở tiện ích khi con trỏ dừng trên thời tiết ở thanh và đóng lại khi con trỏ rời đi. Nhấp chuột để giữ mở.",
  "rainIntensity": "Cường độ mưa",
  "showWhenRelevant": "Khi đáng chú ý",
  "menubarRelevantCurrentHint": "“Khi đáng chú ý” chỉ hiện một mục khi nó nổi bật: cảm giác lệch 3° so với nhiệt độ, gió từ 20 km/h, UV từ 6.",
  "menubarRelevantRainHint": "“Khi đáng chú ý”: xác suất từ 30 %, cường độ khi đang mưa, thời điểm mưa trong hai giờ tới. Thời điểm mưa và cường độ thay chỗ của xác suất.",
  "menubarRelevantAirHint": "“Khi đáng chú ý”: chất lượng không khí từ “kém”, phấn hoa ở mức cao.",
  "kelvinUnits": "Kelvin",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "Đơn vị khác khi rê chuột",
  "hoverUnitSystemOff": "Tắt",
  "hoverUnitSystemHint": "Khi con trỏ còn trên tiện ích, thanh chuyển sang hệ đơn vị này. Kelvin chỉ đổi nhiệt độ.",
  "restoreOrder": "Khôi phục thứ tự",
  "sunNext": "Sự kiện mặt trời kế tiếp",
  "sunrise": "Mặt trời mọc",
  "sunset": "Mặt trời lặn",
  "moonPhase": "Pha Mặt Trăng",
  "moon": "Trăng"
})

addCatalogEntries("th", {
  "settingsPageDisplay": "การแสดงผล",
  "settingsPageShortcuts": "ปุ่มลัด",
  "settingsPageSources": "แหล่งข้อมูล",
  "shortcutsSubtitle": "แป้นพิมพ์และเมาส์",
  "sourcesSubtitle": "ข้อมูลมาจากที่ใด",
  "shortcutsHint": "ปุ่มชุดเดียวกันใช้ได้ทั้งในวิดเจ็ตและในแอป",
  "shortcutsGroupGeneral": "ทั่วไป",
  "shortcutsGroupNavigation": "การเลื่อน",
  "shortcutsGroupForecast": "ฝน เรดาร์ และลม",
  "shortcutsGroupSearch": "ค้นหาสถานที่",
  "shortcutsGroupSettings": "การตั้งค่า",
  "shortcutsGroupMouse": "แถบเมนู",
  "shortcutClose": "ปิดการค้นหา การตั้งค่า หรือรายการ แล้วจึงปิดแผง",
  "shortcutSwitchPanel": "แผงถัดไป / ก่อนหน้าในแถบ (วิดเจ็ต)",
  "shortcutSettings": "เปิดการตั้งค่า",
  "shortcutRefresh": "รีเฟรชตอนนี้",
  "shortcutSearch": "ค้นหาสถานที่",
  "shortcutScroll": "เลื่อน",
  "shortcutPage": "เลื่อนหนึ่งหน้า",
  "shortcutJump": "ไปที่ต้น / ท้าย",
  "shortcutScrollDaily": "เลื่อนพยากรณ์รายวัน",
  "shortcutViews": "มุมมองฝน / เรดาร์ / ลม",
  "shortcutRadarStep": "เรดาร์: ภาพก่อนหน้า / ถัดไป",
  "shortcutRadarPlay": "เรดาร์: เล่น / หยุดชั่วคราว",
  "shortcutZoom": "แผนที่: ซูมเข้า / ซูมออก",
  "shortcutZoomReset": "แผนที่: ระดับซูมเริ่มต้น",
  "shortcutSearchSelect": "เลือกผลลัพธ์",
  "shortcutSearchSection": "สลับระหว่างผลลัพธ์กับรายการโปรด",
  "shortcutSearchPick": "แสดงสถานที่ที่เลือก",
  "shortcutSearchFavorite": "เพิ่ม / ลบรายการโปรด",
  "shortcutSearchCancel": "ยกเลิกการค้นหา",
  "shortcutSettingsPages": "หน้าการตั้งค่าก่อนหน้า / ถัดไป",
  "shortcutSettingsClose": "ปิดการตั้งค่า",
  "mouseLeft": "คลิกซ้าย",
  "mouseMiddle": "คลิกกลาง",
  "mouseRight": "คลิกขวา",
  "shortcutMouseToggle": "เปิด / ปิดแผงสภาพอากาศ",
  "shortcutMouseRefresh": "รีเฟรชตอนนี้",
  "shortcutMouseNotify": "แสดงสภาพอากาศเป็นการแจ้งเตือน",
  "sourcesHint": "แหล่งข้อมูลถูกเลือกตามสถานที่ หากแหล่งหนึ่งล้มเหลว แหล่งถัดไปจะทำงานแทนโดยอัตโนมัติ",
  "sourceInUse": "กำลังใช้",
  "sourceNotInUse": "ไม่ได้ใช้",
  "sourceGroupForecast": "สภาพอากาศปัจจุบันและพยากรณ์",
  "sourceGroupForecastDetails": "Open-Meteo Best Match (แบบจำลองระดับชาติที่ดีที่สุดของแต่ละภูมิภาค) โดยมี MET Norway เป็นแหล่งสำรอง ในนอร์เวย์ สวีเดน ฟินแลนด์ และเดนมาร์ก MET Norway จะมาก่อน โดยใช้แบบจำลอง MET Nordic ความละเอียด 1 กม. ของตนเอง ในพื้นที่ DWD นั้น DWD MOSMIX (ผ่าน Bright Sky) จะปรับอุณหภูมิ ฝน และสัญลักษณ์ให้แม่นยำขึ้น",
  "sourceCoverage": "ขอบเขต",
  "sourceGroupForecastCoverage": "ทั่วโลก ใช้ MET Norway ก่อนใน NO, SE, FI, DK ส่วน DWD MOSMIX เฉพาะในพื้นที่ DWD (ประมาณ 46.5–55.5° เหนือ, 5–16° ตะวันออก รวมถึงนอกเยอรมนีด้วย)",
  "sourceGroupUvCoverage": "ทั่วโลก",
  "sourceGroupNowcastCoverage": "ทั่วโลก ค่าฝนจาก MOSMIX และปริมาณจากเรดาร์ DWD เฉพาะในพื้นที่ DWD",
  "sourceGroupRadarCoverage": "พื้นที่ DWD (ประมาณ 46.5–55.5° เหนือ, 5–16° ตะวันออก) · สหรัฐฯ รวมอะแลสกา ฮาวาย เปอร์โตริโก และกวม (NWS) · แคนาดา (ECCC) · ที่อื่นใช้ RainViewer (สองชั่วโมงที่ผ่านมา) · ทางเลือกสุดท้าย: หยาดน้ำฟ้าจากแบบจำลองของ Open-Meteo หรือ MET Norway",
  "sourceGroupWindCoverage": "ทั่วโลก",
  "sourceGroupWarningsCoverage": "เยอรมนี: DWD โดยมี MeteoAlarm สำรอง · MeteoAlarm ใน 39 ประเทศ: AD, AT, BA, BE, BG, CH, CY, CZ, DE, DK, EE, ES, FI, FR, GB, GR, HR, HU, IE, IL, IS, IT, LT, LU, LV, MD, ME, MK, MT, NL, NO, PL, PT, RO, RS, SE, SI, SK, UA · สหรัฐฯ: NWS · แคนาดา: ECCC · ที่อื่นไม่มีคำเตือน",
  "sourceGroupLocationCoverage": "ทั่วโลก",
  "sourceGroupMapCoverage": "ทั่วโลก ชื่อสถานที่มาจากเซิร์ฟเวอร์ Overpass สามแห่งตามลำดับ: overpass-api.de, overpass.private.coffee, maps.mail.ru",
  "sourceGroupMoonCoverage": "ทั่วโลก กลับด้านเมื่ออยู่ใต้เส้นศูนย์สูตร",
  "sourceGroupUv": "ดัชนี UV",
  "sourceGroupUvDetails": "พยากรณ์ UV รายชั่วโมงและรายวันจาก Open-Meteo",
  "sourceGroupNowcast": "ฝนในสองชั่วโมงข้างหน้า",
  "sourceGroupNowcastDetails": "แกนเวลาทุก 15 นาทีจากพยากรณ์ ในพื้นที่ DWD สองชั่วโมงข้างหน้าสร้างจากการพยากรณ์ระยะสั้นของเรดาร์ DWD ผ่าน Bright Sky คือฝนที่กำลังตกอยู่แล้วซึ่งถูกเลื่อนไปตามเส้นทางการเคลื่อนตัว ปริมาณฝนและเวลาที่ฝนเริ่มตกเป็นค่าเฉลี่ยบนพื้นที่ 3 × 3 กม. รอบสถานที่ โอกาสเกิดฝนรวมสัดส่วนพื้นที่โดยรอบที่เรดาร์แสดงว่ามีฝน (ตอนนี้ราว 1 กม. และขยายเป็น 10 กม. ในสองชั่วโมงเพราะความไม่แน่นอนที่เพิ่มขึ้น) เข้ากับโอกาสจาก DWD MOSMIX ซึ่งมีน้ำหนักมากขึ้นเมื่อมองไกลออกไป เพราะเรดาร์ไม่สามารถคาดการณ์ฝนที่ยังไม่ก่อตัว พยากรณ์รายชั่วโมงใช้ค่าเหล่านี้สำหรับชั่วโมงที่ครอบคลุม นอกเหนือระยะเรดาร์และที่อื่น ค่าทั้งหมดมาจากพยากรณ์",
  "sourceGroupRadar": "เรดาร์",
  "sourceGroupRadarDetails": "ภาพเรดาร์จากหน่วยงานทางการระดับภูมิภาค RainViewer ทำงานแทนในพื้นที่อื่นและเมื่อบริการนั้นล้มเหลว หากไม่มีเรดาร์เลย แผนที่จะแสดงหยาดน้ำฟ้าจากแบบจำลอง",
  "sourceGroupWind": "แผนที่ลม",
  "sourceGroupWindDetails": "กริด Open-Meteo 35 จุดครอบคลุมพื้นที่แผนที่ มิฉะนั้นใช้ลมพยากรณ์ ณ สถานที่ แผนที่ลมแสดงลมที่ความสูง 10 เมตรจากพื้น",
  "sourceGroupDrift": "ลูกศรทิศการเคลื่อนตัวของฝน",
  "sourceGroupDriftDetails": "ฝนบนเรดาร์กำลังเคลื่อนไปทางใด สำหรับภาพที่แสดงอยู่ ในพื้นที่ DWD จะติดตามการเคลื่อนที่จากเรดาร์โดยตรง โดยเทียบรูปแบบฝนกับรูปแบบในอีก 15 นาทีต่อมา ที่อื่น หรือเมื่อฝนน้อยเกินกว่าจะติดตามได้ จะใช้ลมจากแบบจำลองที่ความสูงราว 3 กม. (700 hPa) มิฉะนั้นใช้ลมผิวพื้น ฝนเคลื่อนตัวไปตามลมที่ระดับสูงหลายกิโลเมตร ซึ่งมักพัดมาจากทิศต่างจากลมใกล้พื้นบนแผนที่ลม ในวันที่มีฝนตกเป็นช่วง ๆ อาจต่างกันหลายสิบองศา",
  "sourceGroupDriftCoverage": "ติดตามด้วยเรดาร์ในพื้นที่ DWD (ประมาณ 46.5–55.5° เหนือ, 5–16° ตะวันออก) · ลมระดับ 700 hPa ทั่วโลก",
  "sourceGroupWarnings": "คำเตือนสภาพอากาศ",
  "sourceGroupWarningsDetails": "คำเตือนทางการสำหรับสถานที่: DWD ผ่าน Bright Sky, ฟีด MeteoAlarm ของยุโรป (ใช้ JSON API ของฟีดเมื่อฟีดล้มเหลว), กรมอุตุนิยมวิทยาแห่งชาติสหรัฐฯ หรือ Environment and Climate Change Canada",
  "sourceGroupLocation": "สถานที่",
  "sourceGroupLocationDetails": "ตรวจหาอัตโนมัติจากที่อยู่ IP: ipwho.is, จากนั้น ipapi.co, แล้วจึง GeoJS สำหรับสถานที่ที่เลือก ชื่อ อำเภอ และประเทศจะถูกค้นหาหนึ่งครั้งผ่าน Nominatim (OpenStreetMap) การค้นหาสถานที่: Open-Meteo Geocoding",
  "sourceGroupMap": "พื้นหลังแผนที่และชื่อ",
  "sourceGroupMapDetails": "พื้นหลังดาวเทียม: DWD GeoServer Blue Marble ชื่อเมือง: OpenStreetMap ผ่าน Overpass API แคชไว้ 30 วัน",
  "sourceGroupMoon": "ข้างขึ้นข้างแรม",
  "sourceGroupMoonDetails": "คำนวณในเครื่อง (Meeus) กลับด้านสำหรับสถานที่ใต้เส้นศูนย์สูตร",
  "sourceLocalCalculation": "คำนวณในเครื่อง",
  "sourceRefreshInfo": "รีเฟรชทุก {minutes} นาที เรดาร์ DWD ทุก 5 นาที ใช้ร่วมกันระหว่างวิดเจ็ตและแอป อัปเดตล่าสุด: {updated}",
  "barPosition": "ตำแหน่งในแถบ",
  "barPositionLeft": "ซ้าย",
  "barPositionCenter": "กลาง",
  "barPositionRight": "ขวา",
  "barPositionTop": "บน",
  "barPositionBottom": "ล่าง",
  "barPositionHint": "ย้ายวิดเจ็ตภายในแถบของ Omarchy",
  "barPositionMissing": "วิดเจ็ตไม่ได้อยู่ในแถบ",
  "showAlways": "เสมอ",
  "showOnHover": "เมื่อชี้",
  "menubarHoverHint": "รายการ “เมื่อชี้” จะแสดงขณะที่ตัวชี้อยู่บนสภาพอากาศในแถบ",
  "barBehavior": "การทำงาน",
  "openWidgetOnHover": "เปิดวิดเจ็ตเมื่อชี้",
  "openWidgetOnHoverHint": "เปิดวิดเจ็ตเมื่อตัวชี้หยุดบนสภาพอากาศในแถบ และปิดเมื่อตัวชี้ออกไป คลิกเพื่อให้เปิดค้างไว้",
  "rainIntensity": "ความแรงของฝน",
  "showWhenRelevant": "เมื่อสำคัญ",
  "menubarRelevantCurrentHint": "“เมื่อสำคัญ” จะแสดงรายการเฉพาะเมื่อค่าโดดเด่น เช่น อุณหภูมิที่รู้สึกต่างจากจริง 3° ลมตั้งแต่ 20 กม./ชม. ยูวีตั้งแต่ 6",
  "menubarRelevantRainHint": "“เมื่อสำคัญ”: โอกาสตั้งแต่ 30 % ความแรงขณะฝนตก และเวลาที่ฝนจะเริ่มภายในสองชั่วโมง เวลาเริ่มฝนและความแรงจะแทนที่โอกาส",
  "menubarRelevantAirHint": "“เมื่อสำคัญ”: คุณภาพอากาศตั้งแต่ “แย่” และละอองเกสรระดับสูง",
  "kelvinUnits": "เคลวิน",
  "kelvinUnitsSummary": "K · mm · km/h · km",
  "hoverUnitSystem": "ใช้หน่วยอื่นเมื่อชี้",
  "hoverUnitSystemOff": "ปิด",
  "hoverUnitSystemHint": "ขณะที่ตัวชี้อยู่บนวิดเจ็ต แถบจะเปลี่ยนไปใช้ระบบหน่วยนี้ เคลวินมีผลกับอุณหภูมิเท่านั้น",
  "restoreOrder": "คืนค่าลำดับ",
  "sunNext": "เหตุการณ์ดวงอาทิตย์ถัดไป",
  "sunrise": "ดวงอาทิตย์ขึ้น",
  "sunset": "ดวงอาทิตย์ตก",
  "moonPhase": "ข้างขึ้นข้างแรม",
  "moon": "ดวงจันทร์"
})

// Restore-defaults button on the display settings page.
addCatalogEntries("es", {
  "restoreDefaults": "Restaurar valores predeterminados",
  "restoreDefaultsConfirm": "Haz clic de nuevo para restablecer",
  "defaultsActive": "Valores predeterminados activos"
})
addCatalogEntries("fr", {
  "restoreDefaults": "Rétablir les valeurs par défaut",
  "restoreDefaultsConfirm": "Cliquez à nouveau pour réinitialiser",
  "defaultsActive": "Valeurs par défaut actives"
})
addCatalogEntries("pt", {
  "restoreDefaults": "Restaurar predefinições",
  "restoreDefaultsConfirm": "Clique novamente para repor",
  "defaultsActive": "Predefinições ativas"
})
addCatalogEntries("ru", {
  "restoreDefaults": "Восстановить настройки по умолчанию",
  "restoreDefaultsConfirm": "Нажмите ещё раз для сброса",
  "defaultsActive": "Используются настройки по умолчанию"
})
addCatalogEntries("uk", {
  "restoreDefaults": "Відновити типові налаштування",
  "restoreDefaultsConfirm": "Натисніть ще раз для скидання",
  "defaultsActive": "Використовуються типові налаштування"
})
addCatalogEntries("pl", {
  "restoreDefaults": "Przywróć ustawienia domyślne",
  "restoreDefaultsConfirm": "Kliknij ponownie, aby zresetować",
  "defaultsActive": "Aktywne ustawienia domyślne"
})
addCatalogEntries("it", {
  "restoreDefaults": "Ripristina impostazioni predefinite",
  "restoreDefaultsConfirm": "Fai clic di nuovo per ripristinare",
  "defaultsActive": "Impostazioni predefinite attive"
})
addCatalogEntries("nl", {
  "restoreDefaults": "Standaardwaarden herstellen",
  "restoreDefaultsConfirm": "Klik nogmaals om te resetten",
  "defaultsActive": "Standaardwaarden actief"
})
addCatalogEntries("tr", {
  "restoreDefaults": "Varsayılanları geri yükle",
  "restoreDefaultsConfirm": "Sıfırlamak için tekrar tıklayın",
  "defaultsActive": "Varsayılan ayarlar etkin"
})
addCatalogEntries("cs", {
  "restoreDefaults": "Obnovit výchozí nastavení",
  "restoreDefaultsConfirm": "Klikněte znovu pro obnovení",
  "defaultsActive": "Výchozí nastavení je aktivní"
})
addCatalogEntries("sv", {
  "restoreDefaults": "Återställ standardvärden",
  "restoreDefaultsConfirm": "Klicka igen för att återställa",
  "defaultsActive": "Standardvärden aktiva"
})
addCatalogEntries("fi", {
  "restoreDefaults": "Palauta oletusasetukset",
  "restoreDefaultsConfirm": "Palauta napsauttamalla uudelleen",
  "defaultsActive": "Oletusasetukset käytössä"
})
addCatalogEntries("nb", {
  "restoreDefaults": "Gjenopprett standardverdier",
  "restoreDefaultsConfirm": "Klikk igjen for å tilbakestille",
  "defaultsActive": "Standardverdier er aktive"
})
addCatalogEntries("da", {
  "restoreDefaults": "Gendan standardindstillinger",
  "restoreDefaultsConfirm": "Klik igen for at nulstille",
  "defaultsActive": "Standardindstillinger er aktive"
})
addCatalogEntries("ro", {
  "restoreDefaults": "Restabilește valorile implicite",
  "restoreDefaultsConfirm": "Dă clic din nou pentru resetare",
  "defaultsActive": "Valori implicite active"
})
addCatalogEntries("hu", {
  "restoreDefaults": "Alapértékek visszaállítása",
  "restoreDefaultsConfirm": "Kattints újra a visszaállításhoz",
  "defaultsActive": "Alapértékek érvényben"
})
addCatalogEntries("el", {
  "restoreDefaults": "Επαναφορά προεπιλογών",
  "restoreDefaultsConfirm": "Κάντε ξανά κλικ για επαναφορά",
  "defaultsActive": "Ενεργές προεπιλογές"
})
addCatalogEntries("zh_CN", {
  "restoreDefaults": "恢复默认设置",
  "restoreDefaultsConfirm": "再次点击以重置",
  "defaultsActive": "已使用默认设置"
})
addCatalogEntries("zh_TW", {
  "restoreDefaults": "還原預設值",
  "restoreDefaultsConfirm": "再按一下以重設",
  "defaultsActive": "已使用預設值"
})
addCatalogEntries("ja", {
  "restoreDefaults": "デフォルトに戻す",
  "restoreDefaultsConfirm": "もう一度クリックでリセット",
  "defaultsActive": "デフォルト設定を使用中"
})
addCatalogEntries("ko", {
  "restoreDefaults": "기본값 복원",
  "restoreDefaultsConfirm": "다시 클릭하면 초기화됩니다",
  "defaultsActive": "기본 설정 사용 중"
})
addCatalogEntries("ar", {
  "restoreDefaults": "استعادة الإعدادات الافتراضية",
  "restoreDefaultsConfirm": "انقر مرة أخرى لإعادة التعيين",
  "defaultsActive": "الإعدادات الافتراضية مفعّلة"
})
addCatalogEntries("he", {
  "restoreDefaults": "שחזור ברירות המחדל",
  "restoreDefaultsConfirm": "לחצו שוב לאיפוס",
  "defaultsActive": "ברירות המחדל פעילות"
})
addCatalogEntries("fa", {
  "restoreDefaults": "بازگرداندن تنظیمات پیش‌فرض",
  "restoreDefaultsConfirm": "برای بازنشانی دوباره کلیک کنید",
  "defaultsActive": "تنظیمات پیش‌فرض فعال است"
})
addCatalogEntries("hi", {
  "restoreDefaults": "डिफ़ॉल्ट सेटिंग्स बहाल करें",
  "restoreDefaultsConfirm": "रीसेट करने के लिए फिर से क्लिक करें",
  "defaultsActive": "डिफ़ॉल्ट सेटिंग्स सक्रिय हैं"
})
addCatalogEntries("id", {
  "restoreDefaults": "Pulihkan pengaturan bawaan",
  "restoreDefaultsConfirm": "Klik lagi untuk mengatur ulang",
  "defaultsActive": "Pengaturan bawaan aktif"
})
addCatalogEntries("vi", {
  "restoreDefaults": "Khôi phục mặc định",
  "restoreDefaultsConfirm": "Nhấp lần nữa để đặt lại",
  "defaultsActive": "Đang dùng cài đặt mặc định"
})
addCatalogEntries("th", {
  "restoreDefaults": "คืนค่าเริ่มต้น",
  "restoreDefaultsConfirm": "คลิกอีกครั้งเพื่อรีเซ็ต",
  "defaultsActive": "ใช้ค่าเริ่มต้นอยู่"
})

// Current-location row, automatic units and severe weather notifications.
addCatalogEntries("es", {
  "useCurrentLocation": "Ubicación actual",
  "autoUnits": "Automático",
  "autoUnitsSummary": "Según ubicación",
  "notifySevereWarnings": "Notificaciones de tiempo severo",
  "notifySevereWarningsHint": "Notificación de escritorio para avisos severos y extremos en la ubicación mostrada."
})
addCatalogEntries("fr", {
  "useCurrentLocation": "Position actuelle",
  "autoUnits": "Automatique",
  "autoUnitsSummary": "Selon le lieu",
  "notifySevereWarnings": "Notifications d’intempéries",
  "notifySevereWarningsHint": "Notification de bureau pour les alertes sévères et extrêmes du lieu affiché."
})
addCatalogEntries("pt", {
  "useCurrentLocation": "Localização atual",
  "autoUnits": "Automático",
  "autoUnitsSummary": "Conforme o local",
  "notifySevereWarnings": "Notificações de tempo severo",
  "notifySevereWarningsHint": "Notificação na área de trabalho para alertas severos e extremos no local exibido."
})
addCatalogEntries("ru", {
  "useCurrentLocation": "Текущее местоположение",
  "autoUnits": "Автоматически",
  "autoUnitsSummary": "По местоположению",
  "notifySevereWarnings": "Уведомления об опасной погоде",
  "notifySevereWarningsHint": "Уведомление на рабочем столе о сильных и экстремальных предупреждениях для показанного места."
})
addCatalogEntries("uk", {
  "useCurrentLocation": "Поточне розташування",
  "autoUnits": "Автоматично",
  "autoUnitsSummary": "За розташуванням",
  "notifySevereWarnings": "Сповіщення про небезпечну погоду",
  "notifySevereWarningsHint": "Сповіщення на робочому столі про сильні та екстремальні попередження для показаного місця."
})
addCatalogEntries("pl", {
  "useCurrentLocation": "Bieżące położenie",
  "autoUnits": "Automatycznie",
  "autoUnitsSummary": "Według położenia",
  "notifySevereWarnings": "Powiadomienia o groźnej pogodzie",
  "notifySevereWarningsHint": "Powiadomienie na pulpicie o ostrzeżeniach wysokiego i ekstremalnego stopnia dla pokazanego miejsca."
})
addCatalogEntries("it", {
  "useCurrentLocation": "Posizione attuale",
  "autoUnits": "Automatico",
  "autoUnitsSummary": "In base al luogo",
  "notifySevereWarnings": "Notifiche di maltempo",
  "notifySevereWarningsHint": "Notifica sul desktop per avvisi gravi ed estremi nella posizione mostrata."
})
addCatalogEntries("nl", {
  "useCurrentLocation": "Huidige locatie",
  "autoUnits": "Automatisch",
  "autoUnitsSummary": "Op basis van locatie",
  "notifySevereWarnings": "Meldingen bij noodweer",
  "notifySevereWarningsHint": "Bureaubladmelding bij zware en extreme waarschuwingen voor de getoonde locatie."
})
addCatalogEntries("tr", {
  "useCurrentLocation": "Geçerli konum",
  "autoUnits": "Otomatik",
  "autoUnitsSummary": "Konuma göre",
  "notifySevereWarnings": "Şiddetli hava bildirimleri",
  "notifySevereWarningsHint": "Gösterilen konum için şiddetli ve aşırı uyarılarda masaüstü bildirimi."
})
addCatalogEntries("cs", {
  "useCurrentLocation": "Aktuální poloha",
  "autoUnits": "Automaticky",
  "autoUnitsSummary": "Podle polohy",
  "notifySevereWarnings": "Oznámení o nebezpečném počasí",
  "notifySevereWarningsHint": "Oznámení na ploše při vysokých a extrémních výstrahách pro zobrazené místo."
})
addCatalogEntries("sv", {
  "useCurrentLocation": "Aktuell plats",
  "autoUnits": "Automatiskt",
  "autoUnitsSummary": "Efter plats",
  "notifySevereWarnings": "Aviseringar om svårt väder",
  "notifySevereWarningsHint": "Skrivbordsavisering vid allvarliga och extrema varningar för den visade platsen."
})
addCatalogEntries("fi", {
  "useCurrentLocation": "Nykyinen sijainti",
  "autoUnits": "Automaattinen",
  "autoUnitsSummary": "Sijainnin mukaan",
  "notifySevereWarnings": "Vaarallisen sään ilmoitukset",
  "notifySevereWarningsHint": "Työpöytäilmoitus vakavista ja äärimmäisistä varoituksista näytetylle sijainnille."
})
addCatalogEntries("nb", {
  "useCurrentLocation": "Nåværende sted",
  "autoUnits": "Automatisk",
  "autoUnitsSummary": "Etter sted",
  "notifySevereWarnings": "Varsler om ekstremvær",
  "notifySevereWarningsHint": "Skrivebordsvarsel ved alvorlige og ekstreme farevarsler for det viste stedet."
})
addCatalogEntries("da", {
  "useCurrentLocation": "Nuværende placering",
  "autoUnits": "Automatisk",
  "autoUnitsSummary": "Efter placering",
  "notifySevereWarnings": "Notifikationer om voldsomt vejr",
  "notifySevereWarningsHint": "Skrivebordsnotifikation ved alvorlige og ekstreme varsler for den viste placering."
})
addCatalogEntries("ro", {
  "useCurrentLocation": "Locația curentă",
  "autoUnits": "Automat",
  "autoUnitsSummary": "După locație",
  "notifySevereWarnings": "Notificări pentru vreme severă",
  "notifySevereWarningsHint": "Notificare pe desktop pentru avertizări severe și extreme la locația afișată."
})
addCatalogEntries("hu", {
  "useCurrentLocation": "Jelenlegi hely",
  "autoUnits": "Automatikus",
  "autoUnitsSummary": "Hely szerint",
  "notifySevereWarnings": "Értesítés veszélyes időjárásról",
  "notifySevereWarningsHint": "Asztali értesítés a megjelenített hely súlyos és szélsőséges figyelmeztetéseiről."
})
addCatalogEntries("el", {
  "useCurrentLocation": "Τρέχουσα τοποθεσία",
  "autoUnits": "Αυτόματα",
  "autoUnitsSummary": "Ανάλογα με την τοποθεσία",
  "notifySevereWarnings": "Ειδοποιήσεις για έντονα καιρικά φαινόμενα",
  "notifySevereWarningsHint": "Ειδοποίηση επιφάνειας εργασίας για σοβαρές και ακραίες προειδοποιήσεις στην εμφανιζόμενη τοποθεσία."
})
addCatalogEntries("zh_CN", {
  "useCurrentLocation": "当前位置",
  "autoUnits": "自动",
  "autoUnitsSummary": "按位置",
  "notifySevereWarnings": "恶劣天气通知",
  "notifySevereWarningsHint": "当显示的位置有严重或极端预警时发送桌面通知。"
})
addCatalogEntries("zh_TW", {
  "useCurrentLocation": "目前位置",
  "autoUnits": "自動",
  "autoUnitsSummary": "依位置",
  "notifySevereWarnings": "惡劣天氣通知",
  "notifySevereWarningsHint": "顯示的位置有嚴重或極端警報時傳送桌面通知。"
})
addCatalogEntries("ja", {
  "useCurrentLocation": "現在地",
  "autoUnits": "自動",
  "autoUnitsSummary": "場所に応じて",
  "notifySevereWarnings": "荒天の通知",
  "notifySevereWarningsHint": "表示中の場所に重大・極端な警報が出たときにデスクトップ通知を表示します。"
})
addCatalogEntries("ko", {
  "useCurrentLocation": "현재 위치",
  "autoUnits": "자동",
  "autoUnitsSummary": "위치에 따라",
  "notifySevereWarnings": "악천후 알림",
  "notifySevereWarningsHint": "표시된 위치에 심각 또는 극한 경보가 있으면 데스크톱 알림을 보냅니다."
})
addCatalogEntries("ar", {
  "useCurrentLocation": "الموقع الحالي",
  "autoUnits": "تلقائي",
  "autoUnitsSummary": "حسب الموقع",
  "notifySevereWarnings": "إشعارات الطقس القاسي",
  "notifySevereWarningsHint": "إشعار على سطح المكتب للتحذيرات الشديدة والقصوى في الموقع المعروض."
})
addCatalogEntries("he", {
  "useCurrentLocation": "המיקום הנוכחי",
  "autoUnits": "אוטומטי",
  "autoUnitsSummary": "לפי מיקום",
  "notifySevereWarnings": "התראות על מזג אוויר קיצוני",
  "notifySevereWarningsHint": "התראה בשולחן העבודה על אזהרות חמורות וקיצוניות במיקום המוצג."
})
addCatalogEntries("fa", {
  "useCurrentLocation": "مکان فعلی",
  "autoUnits": "خودکار",
  "autoUnitsSummary": "بر اساس مکان",
  "notifySevereWarnings": "اعلان‌های هوای نامساعد",
  "notifySevereWarningsHint": "اعلان دسکتاپ برای هشدارهای شدید و بسیار شدید در مکان نمایش‌داده‌شده."
})
addCatalogEntries("hi", {
  "useCurrentLocation": "वर्तमान स्थान",
  "autoUnits": "स्वचालित",
  "autoUnitsSummary": "स्थान के अनुसार",
  "notifySevereWarnings": "गंभीर मौसम सूचनाएँ",
  "notifySevereWarningsHint": "दिखाए गए स्थान के लिए गंभीर और चरम चेतावनियों पर डेस्कटॉप सूचना।"
})
addCatalogEntries("id", {
  "useCurrentLocation": "Lokasi saat ini",
  "autoUnits": "Otomatis",
  "autoUnitsSummary": "Sesuai lokasi",
  "notifySevereWarnings": "Notifikasi cuaca ekstrem",
  "notifySevereWarningsHint": "Notifikasi desktop untuk peringatan berat dan ekstrem di lokasi yang ditampilkan."
})
addCatalogEntries("vi", {
  "useCurrentLocation": "Vị trí hiện tại",
  "autoUnits": "Tự động",
  "autoUnitsSummary": "Theo vị trí",
  "notifySevereWarnings": "Thông báo thời tiết nguy hiểm",
  "notifySevereWarningsHint": "Thông báo trên màn hình khi có cảnh báo nghiêm trọng hoặc cực đoan tại vị trí đang hiển thị."
})
addCatalogEntries("th", {
  "useCurrentLocation": "ตำแหน่งปัจจุบัน",
  "autoUnits": "อัตโนมัติ",
  "autoUnitsSummary": "ตามตำแหน่ง",
  "notifySevereWarnings": "การแจ้งเตือนสภาพอากาศรุนแรง",
  "notifySevereWarningsHint": "แจ้งเตือนบนเดสก์ท็อปเมื่อมีคำเตือนระดับรุนแรงหรือรุนแรงมากสำหรับตำแหน่งที่แสดง"
})

// Upcoming rain: menu bar time, chart label and notifications.
addCatalogEntries("es", {
  "rainStartTime": "Inicio de la lluvia",
  "rainFromTime": "desde {time}",
  "rainFromTotal": "Lluvia desde las {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Lluvia desde las {time}",
  "upToRate": "hasta {rate}",
  "notifyRainSoon": "Notificaciones de lluvia",
  "notifyRainSoonHint": "Notificación cuando se espera lluvia en los próximos 30 minutos en la ubicación mostrada."
})
addCatalogEntries("fr", {
  "rainStartTime": "Début de la pluie",
  "rainFromTime": "dès {time}",
  "rainFromTotal": "Pluie dès {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Pluie dès {time}",
  "upToRate": "jusqu’à {rate}",
  "notifyRainSoon": "Notifications de pluie",
  "notifyRainSoonHint": "Notification lorsque de la pluie est attendue dans les 30 minutes au lieu affiché."
})
addCatalogEntries("pt", {
  "rainStartTime": "Início da chuva",
  "rainFromTime": "a partir das {time}",
  "rainFromTotal": "Chuva a partir das {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Chuva a partir das {time}",
  "upToRate": "até {rate}",
  "notifyRainSoon": "Notificações de chuva",
  "notifyRainSoonHint": "Notificação quando se espera chuva nos próximos 30 minutos no local exibido."
})
addCatalogEntries("ru", {
  "rainStartTime": "Начало дождя",
  "rainFromTime": "с {time}",
  "rainFromTotal": "Дождь с {time} · {amount} {unit} / 2 ч",
  "rainNotificationTitle": "Дождь с {time}",
  "upToRate": "до {rate}",
  "notifyRainSoon": "Уведомления о дожде",
  "notifyRainSoonHint": "Уведомление, если в показанном месте в ближайшие 30 минут ожидается дождь."
})
addCatalogEntries("uk", {
  "rainStartTime": "Початок дощу",
  "rainFromTime": "з {time}",
  "rainFromTotal": "Дощ з {time} · {amount} {unit} / 2 год",
  "rainNotificationTitle": "Дощ з {time}",
  "upToRate": "до {rate}",
  "notifyRainSoon": "Сповіщення про дощ",
  "notifyRainSoonHint": "Сповіщення, якщо в показаному місці протягом 30 хвилин очікується дощ."
})
addCatalogEntries("pl", {
  "rainStartTime": "Początek deszczu",
  "rainFromTime": "od {time}",
  "rainFromTotal": "Deszcz od {time} · {amount} {unit} / 2 godz.",
  "rainNotificationTitle": "Deszcz od {time}",
  "upToRate": "do {rate}",
  "notifyRainSoon": "Powiadomienia o deszczu",
  "notifyRainSoonHint": "Powiadomienie, gdy w pokazanym miejscu w ciągu 30 minut spodziewany jest deszcz."
})
addCatalogEntries("it", {
  "rainStartTime": "Inizio della pioggia",
  "rainFromTime": "dalle {time}",
  "rainFromTotal": "Pioggia dalle {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Pioggia dalle {time}",
  "upToRate": "fino a {rate}",
  "notifyRainSoon": "Notifiche di pioggia",
  "notifyRainSoonHint": "Notifica quando è attesa pioggia entro 30 minuti nella posizione mostrata."
})
addCatalogEntries("nl", {
  "rainStartTime": "Begin van regen",
  "rainFromTime": "vanaf {time}",
  "rainFromTotal": "Regen vanaf {time} · {amount} {unit} / 2 u",
  "rainNotificationTitle": "Regen vanaf {time}",
  "upToRate": "tot {rate}",
  "notifyRainSoon": "Regenmeldingen",
  "notifyRainSoonHint": "Melding wanneer binnen 30 minuten regen wordt verwacht op de getoonde locatie."
})
addCatalogEntries("tr", {
  "rainStartTime": "Yağış başlangıcı",
  "rainFromTime": "{time} itibarıyla",
  "rainFromTotal": "{time} itibarıyla yağış · {amount} {unit} / 2 sa",
  "rainNotificationTitle": "{time} itibarıyla yağış",
  "upToRate": "en fazla {rate}",
  "notifyRainSoon": "Yağış bildirimleri",
  "notifyRainSoonHint": "Gösterilen konumda 30 dakika içinde yağış beklendiğinde bildirim."
})
addCatalogEntries("cs", {
  "rainStartTime": "Začátek deště",
  "rainFromTime": "od {time}",
  "rainFromTotal": "Déšť od {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Déšť od {time}",
  "upToRate": "až {rate}",
  "notifyRainSoon": "Oznámení o dešti",
  "notifyRainSoonHint": "Oznámení, když se na zobrazeném místě do 30 minut očekává déšť."
})
addCatalogEntries("sv", {
  "rainStartTime": "Regnstart",
  "rainFromTime": "från {time}",
  "rainFromTotal": "Regn från {time} · {amount} {unit} / 2 tim",
  "rainNotificationTitle": "Regn från {time}",
  "upToRate": "upp till {rate}",
  "notifyRainSoon": "Regnaviseringar",
  "notifyRainSoonHint": "Avisering när regn väntas inom 30 minuter på den visade platsen."
})
addCatalogEntries("fi", {
  "rainStartTime": "Sateen alku",
  "rainFromTime": "klo {time} alkaen",
  "rainFromTotal": "Sadetta klo {time} alkaen · {amount} {unit} / 2 t",
  "rainNotificationTitle": "Sadetta klo {time} alkaen",
  "upToRate": "enintään {rate}",
  "notifyRainSoon": "Sadeilmoitukset",
  "notifyRainSoonHint": "Ilmoitus, kun näytetylle sijainnille odotetaan sadetta 30 minuutin sisällä."
})
addCatalogEntries("nb", {
  "rainStartTime": "Regnstart",
  "rainFromTime": "fra {time}",
  "rainFromTotal": "Regn fra {time} · {amount} {unit} / 2 t",
  "rainNotificationTitle": "Regn fra {time}",
  "upToRate": "opptil {rate}",
  "notifyRainSoon": "Regnvarsler",
  "notifyRainSoonHint": "Varsel når det ventes regn innen 30 minutter på det viste stedet."
})
addCatalogEntries("da", {
  "rainStartTime": "Regnstart",
  "rainFromTime": "fra {time}",
  "rainFromTotal": "Regn fra {time} · {amount} {unit} / 2 t",
  "rainNotificationTitle": "Regn fra {time}",
  "upToRate": "op til {rate}",
  "notifyRainSoon": "Regnnotifikationer",
  "notifyRainSoonHint": "Notifikation, når der ventes regn inden for 30 minutter på den viste placering."
})
addCatalogEntries("ro", {
  "rainStartTime": "Începutul ploii",
  "rainFromTime": "de la {time}",
  "rainFromTotal": "Ploaie de la {time} · {amount} {unit} / 2 h",
  "rainNotificationTitle": "Ploaie de la {time}",
  "upToRate": "până la {rate}",
  "notifyRainSoon": "Notificări de ploaie",
  "notifyRainSoonHint": "Notificare când se așteaptă ploaie în următoarele 30 de minute la locația afișată."
})
addCatalogEntries("hu", {
  "rainStartTime": "Eső kezdete",
  "rainFromTime": "{time}-tól",
  "rainFromTotal": "Eső {time}-tól · {amount} {unit} / 2 ó",
  "rainNotificationTitle": "Eső {time}-tól",
  "upToRate": "legfeljebb {rate}",
  "notifyRainSoon": "Esőértesítések",
  "notifyRainSoonHint": "Értesítés, ha a megjelenített helyen 30 percen belül eső várható."
})
addCatalogEntries("el", {
  "rainStartTime": "Έναρξη βροχής",
  "rainFromTime": "από {time}",
  "rainFromTotal": "Βροχή από {time} · {amount} {unit} / 2 ώρ.",
  "rainNotificationTitle": "Βροχή από {time}",
  "upToRate": "έως {rate}",
  "notifyRainSoon": "Ειδοποιήσεις βροχής",
  "notifyRainSoonHint": "Ειδοποίηση όταν αναμένεται βροχή εντός 30 λεπτών στην εμφανιζόμενη τοποθεσία."
})
addCatalogEntries("zh_CN", {
  "rainStartTime": "降雨开始时间",
  "rainFromTime": "{time} 起",
  "rainFromTotal": "{time} 起有雨 · {amount} {unit} / 2 小时",
  "rainNotificationTitle": "{time} 起有雨",
  "upToRate": "最高 {rate}",
  "notifyRainSoon": "降雨通知",
  "notifyRainSoonHint": "当显示的位置预计 30 分钟内降雨时发送通知。"
})
addCatalogEntries("zh_TW", {
  "rainStartTime": "降雨開始時間",
  "rainFromTime": "{time} 起",
  "rainFromTotal": "{time} 起有雨 · {amount} {unit} / 2 小時",
  "rainNotificationTitle": "{time} 起有雨",
  "upToRate": "最高 {rate}",
  "notifyRainSoon": "降雨通知",
  "notifyRainSoonHint": "顯示的位置預計 30 分鐘內降雨時傳送通知。"
})
addCatalogEntries("ja", {
  "rainStartTime": "雨の降り始め",
  "rainFromTime": "{time}から",
  "rainFromTotal": "{time}から雨 · {amount} {unit} / 2時間",
  "rainNotificationTitle": "{time}から雨",
  "upToRate": "最大 {rate}",
  "notifyRainSoon": "雨の通知",
  "notifyRainSoonHint": "表示中の場所で30分以内に雨が予想されるときに通知します。"
})
addCatalogEntries("ko", {
  "rainStartTime": "비 시작 시간",
  "rainFromTime": "{time}부터",
  "rainFromTotal": "{time}부터 비 · {amount} {unit} / 2시간",
  "rainNotificationTitle": "{time}부터 비",
  "upToRate": "최대 {rate}",
  "notifyRainSoon": "비 알림",
  "notifyRainSoonHint": "표시된 위치에 30분 이내 비가 예상되면 알림을 보냅니다."
})
addCatalogEntries("ar", {
  "rainStartTime": "بدء المطر",
  "rainFromTime": "من {time}",
  "rainFromTotal": "مطر من {time} · {amount} {unit} / ساعتين",
  "rainNotificationTitle": "مطر من {time}",
  "upToRate": "حتى {rate}",
  "notifyRainSoon": "إشعارات المطر",
  "notifyRainSoonHint": "إشعار عند توقع هطول المطر خلال 30 دقيقة في الموقع المعروض."
})
addCatalogEntries("he", {
  "rainStartTime": "תחילת גשם",
  "rainFromTime": "מ-{time}",
  "rainFromTotal": "גשם מ-{time} · {amount} {unit} / שעתיים",
  "rainNotificationTitle": "גשם מ-{time}",
  "upToRate": "עד {rate}",
  "notifyRainSoon": "התראות גשם",
  "notifyRainSoonHint": "התראה כשצפוי גשם בתוך 30 דקות במיקום המוצג."
})
addCatalogEntries("fa", {
  "rainStartTime": "شروع باران",
  "rainFromTime": "از {time}",
  "rainFromTotal": "باران از {time} · {amount} {unit} / 2 ساعت",
  "rainNotificationTitle": "باران از {time}",
  "upToRate": "تا {rate}",
  "notifyRainSoon": "اعلان‌های باران",
  "notifyRainSoonHint": "اعلان هنگامی که در مکان نمایش‌داده‌شده ظرف 30 دقیقه باران پیش‌بینی می‌شود."
})
addCatalogEntries("hi", {
  "rainStartTime": "बारिश शुरू होने का समय",
  "rainFromTime": "{time} से",
  "rainFromTotal": "{time} से बारिश · {amount} {unit} / 2 घंटे",
  "rainNotificationTitle": "{time} से बारिश",
  "upToRate": "{rate} तक",
  "notifyRainSoon": "बारिश की सूचनाएँ",
  "notifyRainSoonHint": "दिखाए गए स्थान पर 30 मिनट के भीतर बारिश की संभावना होने पर सूचना।"
})
addCatalogEntries("id", {
  "rainStartTime": "Waktu mulai hujan",
  "rainFromTime": "mulai {time}",
  "rainFromTotal": "Hujan mulai {time} · {amount} {unit} / 2 jam",
  "rainNotificationTitle": "Hujan mulai {time}",
  "upToRate": "hingga {rate}",
  "notifyRainSoon": "Notifikasi hujan",
  "notifyRainSoonHint": "Notifikasi saat hujan diperkirakan turun dalam 30 menit di lokasi yang ditampilkan."
})
addCatalogEntries("vi", {
  "rainStartTime": "Giờ bắt đầu mưa",
  "rainFromTime": "từ {time}",
  "rainFromTotal": "Mưa từ {time} · {amount} {unit} / 2 giờ",
  "rainNotificationTitle": "Mưa từ {time}",
  "upToRate": "tối đa {rate}",
  "notifyRainSoon": "Thông báo mưa",
  "notifyRainSoonHint": "Thông báo khi dự kiến có mưa trong vòng 30 phút tại vị trí đang hiển thị."
})
addCatalogEntries("th", {
  "rainStartTime": "เวลาเริ่มฝนตก",
  "rainFromTime": "ตั้งแต่ {time}",
  "rainFromTotal": "ฝนตกตั้งแต่ {time} · {amount} {unit} / 2 ชม.",
  "rainNotificationTitle": "ฝนตกตั้งแต่ {time}",
  "upToRate": "สูงสุด {rate}",
  "notifyRainSoon": "การแจ้งเตือนฝน",
  "notifyRainSoonHint": "แจ้งเตือนเมื่อคาดว่าจะมีฝนภายใน 30 นาทีที่ตำแหน่งที่แสดง"
})

// Air quality and pollen.
addCatalogEntries("es", {
  "airQualityPollen": "Calidad del aire y polen",
  "airQualityIndex": "Índice de calidad del aire",
  "pollen": "Polen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), actualizado cada hora. Polen solo en Europa.",
  "aqiGood": "buena",
  "aqiFair": "aceptable",
  "aqiModerate": "moderada",
  "aqiPoor": "mala",
  "aqiVeryPoor": "muy mala",
  "aqiExtremelyPoor": "extremadamente mala",
  "aqiUnhealthySensitive": "dañina para grupos sensibles",
  "aqiUnhealthy": "dañina",
  "aqiVeryUnhealthy": "muy dañina",
  "aqiHazardous": "peligrosa",
  "pollenAlder": "Aliso",
  "pollenBirch": "Abedul",
  "pollenGrass": "Gramíneas",
  "pollenMugwort": "Artemisa",
  "pollenOlive": "Olivo",
  "pollenRagweed": "Ambrosía",
  "pollenLow": "bajo",
  "pollenModerate": "moderado",
  "pollenHigh": "alto",
  "pollenNone": "sin polen relevante",
  "pollenUnavailable": "sin datos de polen para esta región",
  "sourceGroupAirQuality": "Calidad del aire y polen",
  "sourceGroupAirQualityDetails": "Índice europeo de calidad del aire (AQI de EE. UU. en Estados Unidos), PM2,5, PM10, ozono y polen del modelo Copernicus CAMS; se consulta como máximo cada hora mientras la sección está activada.",
  "sourceGroupAirQualityCoverage": "Calidad del aire en todo el mundo; polen solo en Europa."
})
addCatalogEntries("fr", {
  "airQualityPollen": "Qualité de l’air et pollens",
  "airQualityIndex": "Indice de qualité de l’air",
  "pollen": "Pollens",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), mis à jour toutes les heures. Pollens en Europe uniquement.",
  "aqiGood": "bonne",
  "aqiFair": "moyenne",
  "aqiModerate": "dégradée",
  "aqiPoor": "mauvaise",
  "aqiVeryPoor": "très mauvaise",
  "aqiExtremelyPoor": "extrêmement mauvaise",
  "aqiUnhealthySensitive": "mauvaise pour les personnes sensibles",
  "aqiUnhealthy": "mauvaise pour la santé",
  "aqiVeryUnhealthy": "très mauvaise pour la santé",
  "aqiHazardous": "dangereuse",
  "pollenAlder": "Aulne",
  "pollenBirch": "Bouleau",
  "pollenGrass": "Graminées",
  "pollenMugwort": "Armoise",
  "pollenOlive": "Olivier",
  "pollenRagweed": "Ambroisie",
  "pollenLow": "faible",
  "pollenModerate": "moyen",
  "pollenHigh": "élevé",
  "pollenNone": "pas de pollens notables",
  "pollenUnavailable": "pas de données polliniques pour cette région",
  "sourceGroupAirQuality": "Qualité de l’air et pollens",
  "sourceGroupAirQualityDetails": "Indice européen de qualité de l’air (AQI américain aux États-Unis), PM2,5, PM10, ozone et pollens du modèle Copernicus CAMS, récupérés au plus une fois par heure lorsque la section est activée.",
  "sourceGroupAirQualityCoverage": "Qualité de l’air dans le monde entier ; pollens en Europe uniquement."
})
addCatalogEntries("pt", {
  "airQualityPollen": "Qualidade do ar e pólen",
  "airQualityIndex": "Índice de qualidade do ar",
  "pollen": "Pólen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), atualizado a cada hora. Pólen apenas na Europa.",
  "aqiGood": "boa",
  "aqiFair": "razoável",
  "aqiModerate": "moderada",
  "aqiPoor": "ruim",
  "aqiVeryPoor": "muito ruim",
  "aqiExtremelyPoor": "extremamente ruim",
  "aqiUnhealthySensitive": "insalubre para grupos sensíveis",
  "aqiUnhealthy": "insalubre",
  "aqiVeryUnhealthy": "muito insalubre",
  "aqiHazardous": "perigosa",
  "pollenAlder": "Amieiro",
  "pollenBirch": "Bétula",
  "pollenGrass": "Gramíneas",
  "pollenMugwort": "Artemísia",
  "pollenOlive": "Oliveira",
  "pollenRagweed": "Ambrósia",
  "pollenLow": "baixo",
  "pollenModerate": "moderado",
  "pollenHigh": "alto",
  "pollenNone": "sem pólen relevante",
  "pollenUnavailable": "sem dados de pólen para esta região",
  "sourceGroupAirQuality": "Qualidade do ar e pólen",
  "sourceGroupAirQualityDetails": "Índice europeu de qualidade do ar (AQI dos EUA nos Estados Unidos), PM2,5, PM10, ozônio e pólen do modelo Copernicus CAMS, obtidos no máximo a cada hora enquanto a seção está ativada.",
  "sourceGroupAirQualityCoverage": "Qualidade do ar no mundo todo; pólen apenas na Europa."
})
addCatalogEntries("ru", {
  "airQualityPollen": "Качество воздуха и пыльца",
  "airQualityIndex": "Индекс качества воздуха",
  "pollen": "Пыльца",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), обновление раз в час. Пыльца только в Европе.",
  "aqiGood": "хорошее",
  "aqiFair": "удовлетворительное",
  "aqiModerate": "умеренное",
  "aqiPoor": "плохое",
  "aqiVeryPoor": "очень плохое",
  "aqiExtremelyPoor": "крайне плохое",
  "aqiUnhealthySensitive": "вредно для чувствительных групп",
  "aqiUnhealthy": "вредно",
  "aqiVeryUnhealthy": "очень вредно",
  "aqiHazardous": "опасно",
  "pollenAlder": "Ольха",
  "pollenBirch": "Берёза",
  "pollenGrass": "Злаки",
  "pollenMugwort": "Полынь",
  "pollenOlive": "Олива",
  "pollenRagweed": "Амброзия",
  "pollenLow": "низкий",
  "pollenModerate": "средний",
  "pollenHigh": "высокий",
  "pollenNone": "заметной пыльцы нет",
  "pollenUnavailable": "нет данных о пыльце для этого региона",
  "sourceGroupAirQuality": "Качество воздуха и пыльца",
  "sourceGroupAirQualityDetails": "Европейский индекс качества воздуха (в США — US AQI), PM2,5, PM10, озон и пыльца по модели Copernicus CAMS; запрашивается не чаще раза в час, пока раздел включён.",
  "sourceGroupAirQualityCoverage": "Качество воздуха — по всему миру, пыльца — только в Европе."
})
addCatalogEntries("uk", {
  "airQualityPollen": "Якість повітря та пилок",
  "airQualityIndex": "Індекс якості повітря",
  "pollen": "Пилок",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), оновлення щогодини. Пилок лише в Європі.",
  "aqiGood": "добра",
  "aqiFair": "задовільна",
  "aqiModerate": "помірна",
  "aqiPoor": "погана",
  "aqiVeryPoor": "дуже погана",
  "aqiExtremelyPoor": "надзвичайно погана",
  "aqiUnhealthySensitive": "шкідлива для чутливих груп",
  "aqiUnhealthy": "шкідлива",
  "aqiVeryUnhealthy": "дуже шкідлива",
  "aqiHazardous": "небезпечна",
  "pollenAlder": "Вільха",
  "pollenBirch": "Береза",
  "pollenGrass": "Злаки",
  "pollenMugwort": "Полин",
  "pollenOlive": "Оливка",
  "pollenRagweed": "Амброзія",
  "pollenLow": "низький",
  "pollenModerate": "середній",
  "pollenHigh": "високий",
  "pollenNone": "помітного пилку немає",
  "pollenUnavailable": "немає даних про пилок для цього регіону",
  "sourceGroupAirQuality": "Якість повітря та пилок",
  "sourceGroupAirQualityDetails": "Європейський індекс якості повітря (у США — US AQI), PM2,5, PM10, озон і пилок за моделлю Copernicus CAMS; запитується не частіше разу на годину, поки розділ увімкнено.",
  "sourceGroupAirQualityCoverage": "Якість повітря — у всьому світі, пилок — лише в Європі."
})
addCatalogEntries("pl", {
  "airQualityPollen": "Jakość powietrza i pyłki",
  "airQualityIndex": "Indeks jakości powietrza",
  "pollen": "Pyłki",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), aktualizacja co godzinę. Pyłki tylko w Europie.",
  "aqiGood": "dobra",
  "aqiFair": "zadowalająca",
  "aqiModerate": "umiarkowana",
  "aqiPoor": "zła",
  "aqiVeryPoor": "bardzo zła",
  "aqiExtremelyPoor": "skrajnie zła",
  "aqiUnhealthySensitive": "szkodliwa dla wrażliwych",
  "aqiUnhealthy": "szkodliwa",
  "aqiVeryUnhealthy": "bardzo szkodliwa",
  "aqiHazardous": "niebezpieczna",
  "pollenAlder": "Olcha",
  "pollenBirch": "Brzoza",
  "pollenGrass": "Trawy",
  "pollenMugwort": "Bylica",
  "pollenOlive": "Oliwka",
  "pollenRagweed": "Ambrozja",
  "pollenLow": "niskie",
  "pollenModerate": "średnie",
  "pollenHigh": "wysokie",
  "pollenNone": "brak istotnych pyłków",
  "pollenUnavailable": "brak danych o pyłkach dla tego regionu",
  "sourceGroupAirQuality": "Jakość powietrza i pyłki",
  "sourceGroupAirQualityDetails": "Europejski indeks jakości powietrza (w USA US AQI), PM2,5, PM10, ozon i pyłki z modelu Copernicus CAMS, pobierane najwyżej co godzinę, gdy sekcja jest włączona.",
  "sourceGroupAirQualityCoverage": "Jakość powietrza na całym świecie; pyłki tylko w Europie."
})
addCatalogEntries("it", {
  "airQualityPollen": "Qualità dell’aria e pollini",
  "airQualityIndex": "Indice di qualità dell’aria",
  "pollen": "Pollini",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), aggiornato ogni ora. Pollini solo in Europa.",
  "aqiGood": "buona",
  "aqiFair": "discreta",
  "aqiModerate": "moderata",
  "aqiPoor": "scarsa",
  "aqiVeryPoor": "molto scarsa",
  "aqiExtremelyPoor": "pessima",
  "aqiUnhealthySensitive": "malsana per i gruppi sensibili",
  "aqiUnhealthy": "malsana",
  "aqiVeryUnhealthy": "molto malsana",
  "aqiHazardous": "pericolosa",
  "pollenAlder": "Ontano",
  "pollenBirch": "Betulla",
  "pollenGrass": "Graminacee",
  "pollenMugwort": "Artemisia",
  "pollenOlive": "Olivo",
  "pollenRagweed": "Ambrosia",
  "pollenLow": "basso",
  "pollenModerate": "medio",
  "pollenHigh": "alto",
  "pollenNone": "nessun polline rilevante",
  "pollenUnavailable": "nessun dato sui pollini per questa regione",
  "sourceGroupAirQuality": "Qualità dell’aria e pollini",
  "sourceGroupAirQualityDetails": "Indice europeo di qualità dell’aria (AQI statunitense negli Stati Uniti), PM2,5, PM10, ozono e pollini dal modello Copernicus CAMS, richiesti al massimo ogni ora mentre la sezione è attiva.",
  "sourceGroupAirQualityCoverage": "Qualità dell’aria in tutto il mondo; pollini solo in Europa."
})
addCatalogEntries("nl", {
  "airQualityPollen": "Luchtkwaliteit & pollen",
  "airQualityIndex": "Luchtkwaliteitsindex",
  "pollen": "Pollen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), elk uur bijgewerkt. Pollen alleen in Europa.",
  "aqiGood": "goed",
  "aqiFair": "redelijk",
  "aqiModerate": "matig",
  "aqiPoor": "slecht",
  "aqiVeryPoor": "zeer slecht",
  "aqiExtremelyPoor": "extreem slecht",
  "aqiUnhealthySensitive": "ongezond voor gevoelige groepen",
  "aqiUnhealthy": "ongezond",
  "aqiVeryUnhealthy": "zeer ongezond",
  "aqiHazardous": "gevaarlijk",
  "pollenAlder": "Els",
  "pollenBirch": "Berk",
  "pollenGrass": "Grassen",
  "pollenMugwort": "Bijvoet",
  "pollenOlive": "Olijf",
  "pollenRagweed": "Ambrosia",
  "pollenLow": "laag",
  "pollenModerate": "matig",
  "pollenHigh": "hoog",
  "pollenNone": "geen noemenswaardige pollen",
  "pollenUnavailable": "geen pollengegevens voor deze regio",
  "sourceGroupAirQuality": "Luchtkwaliteit & pollen",
  "sourceGroupAirQualityDetails": "Europese luchtkwaliteitsindex (in de VS de US AQI), PM2,5, PM10, ozon en pollen uit het Copernicus CAMS-model, hooguit elk uur opgehaald zolang het onderdeel aan staat.",
  "sourceGroupAirQualityCoverage": "Luchtkwaliteit wereldwijd; pollen alleen in Europa."
})
addCatalogEntries("tr", {
  "airQualityPollen": "Hava kalitesi ve polen",
  "airQualityIndex": "Hava kalitesi indeksi",
  "pollen": "Polen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), saatlik güncellenir. Polen yalnızca Avrupa'da.",
  "aqiGood": "iyi",
  "aqiFair": "orta",
  "aqiModerate": "vasat",
  "aqiPoor": "kötü",
  "aqiVeryPoor": "çok kötü",
  "aqiExtremelyPoor": "son derece kötü",
  "aqiUnhealthySensitive": "hassas gruplar için sağlıksız",
  "aqiUnhealthy": "sağlıksız",
  "aqiVeryUnhealthy": "çok sağlıksız",
  "aqiHazardous": "tehlikeli",
  "pollenAlder": "Kızılağaç",
  "pollenBirch": "Huş",
  "pollenGrass": "Çimen",
  "pollenMugwort": "Pelin",
  "pollenOlive": "Zeytin",
  "pollenRagweed": "Ambrosia",
  "pollenLow": "düşük",
  "pollenModerate": "orta",
  "pollenHigh": "yüksek",
  "pollenNone": "kayda değer polen yok",
  "pollenUnavailable": "bu bölge için polen verisi yok",
  "sourceGroupAirQuality": "Hava kalitesi ve polen",
  "sourceGroupAirQualityDetails": "Copernicus CAMS modelinden Avrupa hava kalitesi indeksi (ABD'de US AQI), PM2,5, PM10, ozon ve polen; bölüm açıkken en fazla saatte bir alınır.",
  "sourceGroupAirQualityCoverage": "Hava kalitesi dünya genelinde; polen yalnızca Avrupa'da."
})
addCatalogEntries("cs", {
  "airQualityPollen": "Kvalita ovzduší a pyl",
  "airQualityIndex": "Index kvality ovzduší",
  "pollen": "Pyl",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), aktualizace každou hodinu. Pyl jen v Evropě.",
  "aqiGood": "dobrá",
  "aqiFair": "přijatelná",
  "aqiModerate": "mírná",
  "aqiPoor": "špatná",
  "aqiVeryPoor": "velmi špatná",
  "aqiExtremelyPoor": "extrémně špatná",
  "aqiUnhealthySensitive": "nezdravá pro citlivé skupiny",
  "aqiUnhealthy": "nezdravá",
  "aqiVeryUnhealthy": "velmi nezdravá",
  "aqiHazardous": "nebezpečná",
  "pollenAlder": "Olše",
  "pollenBirch": "Bříza",
  "pollenGrass": "Trávy",
  "pollenMugwort": "Pelyněk",
  "pollenOlive": "Olivovník",
  "pollenRagweed": "Ambrozie",
  "pollenLow": "nízký",
  "pollenModerate": "střední",
  "pollenHigh": "vysoký",
  "pollenNone": "žádný významný pyl",
  "pollenUnavailable": "pro tuto oblast nejsou pylová data",
  "sourceGroupAirQuality": "Kvalita ovzduší a pyl",
  "sourceGroupAirQualityDetails": "Evropský index kvality ovzduší (v USA US AQI), PM2,5, PM10, ozon a pyl z modelu Copernicus CAMS, načítané nejvýše jednou za hodinu, když je sekce zapnutá.",
  "sourceGroupAirQualityCoverage": "Kvalita ovzduší celosvětově; pyl jen v Evropě."
})
addCatalogEntries("sv", {
  "airQualityPollen": "Luftkvalitet och pollen",
  "airQualityIndex": "Luftkvalitetsindex",
  "pollen": "Pollen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), uppdateras varje timme. Pollen endast i Europa.",
  "aqiGood": "god",
  "aqiFair": "godtagbar",
  "aqiModerate": "måttlig",
  "aqiPoor": "dålig",
  "aqiVeryPoor": "mycket dålig",
  "aqiExtremelyPoor": "extremt dålig",
  "aqiUnhealthySensitive": "ohälsosam för känsliga grupper",
  "aqiUnhealthy": "ohälsosam",
  "aqiVeryUnhealthy": "mycket ohälsosam",
  "aqiHazardous": "farlig",
  "pollenAlder": "Al",
  "pollenBirch": "Björk",
  "pollenGrass": "Gräs",
  "pollenMugwort": "Gråbo",
  "pollenOlive": "Olivträd",
  "pollenRagweed": "Malörtsambrosia",
  "pollenLow": "låg",
  "pollenModerate": "måttlig",
  "pollenHigh": "hög",
  "pollenNone": "inga nämnvärda pollen",
  "pollenUnavailable": "inga pollendata för den här regionen",
  "sourceGroupAirQuality": "Luftkvalitet och pollen",
  "sourceGroupAirQualityDetails": "Europeiskt luftkvalitetsindex (US AQI i USA), PM2,5, PM10, ozon och pollen från Copernicus CAMS-modellen, hämtas högst en gång i timmen när avsnittet är på.",
  "sourceGroupAirQualityCoverage": "Luftkvalitet i hela världen; pollen endast i Europa."
})
addCatalogEntries("fi", {
  "airQualityPollen": "Ilmanlaatu ja siitepöly",
  "airQualityIndex": "Ilmanlaatuindeksi",
  "pollen": "Siitepöly",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), päivittyy tunneittain. Siitepöly vain Euroopassa.",
  "aqiGood": "hyvä",
  "aqiFair": "tyydyttävä",
  "aqiModerate": "kohtalainen",
  "aqiPoor": "huono",
  "aqiVeryPoor": "erittäin huono",
  "aqiExtremelyPoor": "äärimmäisen huono",
  "aqiUnhealthySensitive": "epäterveellinen herkille ryhmille",
  "aqiUnhealthy": "epäterveellinen",
  "aqiVeryUnhealthy": "erittäin epäterveellinen",
  "aqiHazardous": "vaarallinen",
  "pollenAlder": "Leppä",
  "pollenBirch": "Koivu",
  "pollenGrass": "Heinä",
  "pollenMugwort": "Pujo",
  "pollenOlive": "Oliivi",
  "pollenRagweed": "Tuoksukki",
  "pollenLow": "vähän",
  "pollenModerate": "kohtalaisesti",
  "pollenHigh": "runsaasti",
  "pollenNone": "ei merkittävää siitepölyä",
  "pollenUnavailable": "tälle alueelle ei ole siitepölytietoja",
  "sourceGroupAirQuality": "Ilmanlaatu ja siitepöly",
  "sourceGroupAirQualityDetails": "Eurooppalainen ilmanlaatuindeksi (Yhdysvalloissa US AQI), PM2,5, PM10, otsoni ja siitepöly Copernicus CAMS -mallista; haetaan enintään kerran tunnissa, kun osio on päällä.",
  "sourceGroupAirQualityCoverage": "Ilmanlaatu maailmanlaajuisesti; siitepöly vain Euroopassa."
})
addCatalogEntries("nb", {
  "airQualityPollen": "Luftkvalitet og pollen",
  "airQualityIndex": "Luftkvalitetsindeks",
  "pollen": "Pollen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), oppdateres hver time. Pollen bare i Europa.",
  "aqiGood": "god",
  "aqiFair": "grei",
  "aqiModerate": "moderat",
  "aqiPoor": "dårlig",
  "aqiVeryPoor": "svært dårlig",
  "aqiExtremelyPoor": "ekstremt dårlig",
  "aqiUnhealthySensitive": "usunn for sårbare grupper",
  "aqiUnhealthy": "usunn",
  "aqiVeryUnhealthy": "svært usunn",
  "aqiHazardous": "farlig",
  "pollenAlder": "Or",
  "pollenBirch": "Bjørk",
  "pollenGrass": "Gress",
  "pollenMugwort": "Burot",
  "pollenOlive": "Oliven",
  "pollenRagweed": "Ambrosia",
  "pollenLow": "lav",
  "pollenModerate": "moderat",
  "pollenHigh": "høy",
  "pollenNone": "ingen nevneverdig pollen",
  "pollenUnavailable": "ingen pollendata for denne regionen",
  "sourceGroupAirQuality": "Luftkvalitet og pollen",
  "sourceGroupAirQualityDetails": "Europeisk luftkvalitetsindeks (US AQI i USA), PM2,5, PM10, ozon og pollen fra Copernicus CAMS-modellen, hentet høyst én gang i timen mens delen er slått på.",
  "sourceGroupAirQualityCoverage": "Luftkvalitet over hele verden; pollen bare i Europa."
})
addCatalogEntries("da", {
  "airQualityPollen": "Luftkvalitet og pollen",
  "airQualityIndex": "Luftkvalitetsindeks",
  "pollen": "Pollen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), opdateres hver time. Pollen kun i Europa.",
  "aqiGood": "god",
  "aqiFair": "rimelig",
  "aqiModerate": "moderat",
  "aqiPoor": "dårlig",
  "aqiVeryPoor": "meget dårlig",
  "aqiExtremelyPoor": "ekstremt dårlig",
  "aqiUnhealthySensitive": "usund for følsomme grupper",
  "aqiUnhealthy": "usund",
  "aqiVeryUnhealthy": "meget usund",
  "aqiHazardous": "farlig",
  "pollenAlder": "El",
  "pollenBirch": "Birk",
  "pollenGrass": "Græs",
  "pollenMugwort": "Bynke",
  "pollenOlive": "Oliven",
  "pollenRagweed": "Ambrosie",
  "pollenLow": "lav",
  "pollenModerate": "moderat",
  "pollenHigh": "høj",
  "pollenNone": "ingen nævneværdig pollen",
  "pollenUnavailable": "ingen pollendata for denne region",
  "sourceGroupAirQuality": "Luftkvalitet og pollen",
  "sourceGroupAirQualityDetails": "Europæisk luftkvalitetsindeks (US AQI i USA), PM2,5, PM10, ozon og pollen fra Copernicus CAMS-modellen, hentet højst én gang i timen, mens sektionen er slået til.",
  "sourceGroupAirQualityCoverage": "Luftkvalitet i hele verden; pollen kun i Europa."
})
addCatalogEntries("ro", {
  "airQualityPollen": "Calitatea aerului și polen",
  "airQualityIndex": "Indicele calității aerului",
  "pollen": "Polen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), actualizat din oră în oră. Polen doar în Europa.",
  "aqiGood": "bună",
  "aqiFair": "acceptabilă",
  "aqiModerate": "moderată",
  "aqiPoor": "slabă",
  "aqiVeryPoor": "foarte slabă",
  "aqiExtremelyPoor": "extrem de slabă",
  "aqiUnhealthySensitive": "nesănătoasă pentru grupuri sensibile",
  "aqiUnhealthy": "nesănătoasă",
  "aqiVeryUnhealthy": "foarte nesănătoasă",
  "aqiHazardous": "periculoasă",
  "pollenAlder": "Arin",
  "pollenBirch": "Mesteacăn",
  "pollenGrass": "Graminee",
  "pollenMugwort": "Pelin",
  "pollenOlive": "Măslin",
  "pollenRagweed": "Ambrozie",
  "pollenLow": "scăzut",
  "pollenModerate": "moderat",
  "pollenHigh": "ridicat",
  "pollenNone": "fără polen semnificativ",
  "pollenUnavailable": "fără date despre polen pentru această regiune",
  "sourceGroupAirQuality": "Calitatea aerului și polen",
  "sourceGroupAirQualityDetails": "Indicele european al calității aerului (US AQI în SUA), PM2,5, PM10, ozon și polen din modelul Copernicus CAMS, preluate cel mult o dată pe oră cât timp secțiunea este activă.",
  "sourceGroupAirQualityCoverage": "Calitatea aerului în toată lumea; polen doar în Europa."
})
addCatalogEntries("hu", {
  "airQualityPollen": "Levegőminőség és pollen",
  "airQualityIndex": "Levegőminőségi index",
  "pollen": "Pollen",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), óránként frissül. Pollen csak Európában.",
  "aqiGood": "jó",
  "aqiFair": "megfelelő",
  "aqiModerate": "mérsékelt",
  "aqiPoor": "rossz",
  "aqiVeryPoor": "nagyon rossz",
  "aqiExtremelyPoor": "rendkívül rossz",
  "aqiUnhealthySensitive": "egészségtelen az érzékenyeknek",
  "aqiUnhealthy": "egészségtelen",
  "aqiVeryUnhealthy": "nagyon egészségtelen",
  "aqiHazardous": "veszélyes",
  "pollenAlder": "Éger",
  "pollenBirch": "Nyír",
  "pollenGrass": "Fűfélék",
  "pollenMugwort": "Üröm",
  "pollenOlive": "Olajfa",
  "pollenRagweed": "Parlagfű",
  "pollenLow": "alacsony",
  "pollenModerate": "közepes",
  "pollenHigh": "magas",
  "pollenNone": "nincs számottevő pollen",
  "pollenUnavailable": "ehhez a régióhoz nincs pollenadat",
  "sourceGroupAirQuality": "Levegőminőség és pollen",
  "sourceGroupAirQualityDetails": "Európai levegőminőségi index (az USA-ban US AQI), PM2,5, PM10, ózon és pollen a Copernicus CAMS modellből; legfeljebb óránként lekérve, amíg a szakasz be van kapcsolva.",
  "sourceGroupAirQualityCoverage": "Levegőminőség világszerte; pollen csak Európában."
})
addCatalogEntries("el", {
  "airQualityPollen": "Ποιότητα αέρα και γύρη",
  "airQualityIndex": "Δείκτης ποιότητας αέρα",
  "pollen": "Γύρη",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), ενημέρωση κάθε ώρα. Γύρη μόνο στην Ευρώπη.",
  "aqiGood": "καλή",
  "aqiFair": "αποδεκτή",
  "aqiModerate": "μέτρια",
  "aqiPoor": "κακή",
  "aqiVeryPoor": "πολύ κακή",
  "aqiExtremelyPoor": "εξαιρετικά κακή",
  "aqiUnhealthySensitive": "ανθυγιεινή για ευαίσθητες ομάδες",
  "aqiUnhealthy": "ανθυγιεινή",
  "aqiVeryUnhealthy": "πολύ ανθυγιεινή",
  "aqiHazardous": "επικίνδυνη",
  "pollenAlder": "Σκλήθρο",
  "pollenBirch": "Σημύδα",
  "pollenGrass": "Αγρωστώδη",
  "pollenMugwort": "Αρτεμισία",
  "pollenOlive": "Ελιά",
  "pollenRagweed": "Αμβροσία",
  "pollenLow": "χαμηλή",
  "pollenModerate": "μέτρια",
  "pollenHigh": "υψηλή",
  "pollenNone": "καμία αξιόλογη γύρη",
  "pollenUnavailable": "δεν υπάρχουν δεδομένα γύρης για αυτή την περιοχή",
  "sourceGroupAirQuality": "Ποιότητα αέρα και γύρη",
  "sourceGroupAirQualityDetails": "Ευρωπαϊκός δείκτης ποιότητας αέρα (US AQI στις ΗΠΑ), PM2,5, PM10, όζον και γύρη από το μοντέλο Copernicus CAMS, με λήψη το πολύ μία φορά την ώρα όσο η ενότητα είναι ενεργή.",
  "sourceGroupAirQualityCoverage": "Ποιότητα αέρα παγκοσμίως· γύρη μόνο στην Ευρώπη."
})
addCatalogEntries("zh_CN", {
  "airQualityPollen": "空气质量与花粉",
  "airQualityIndex": "空气质量指数",
  "pollen": "花粉",
  "airQualityHint": "Open-Meteo（Copernicus CAMS），每小时更新。花粉仅限欧洲。",
  "aqiGood": "良好",
  "aqiFair": "尚可",
  "aqiModerate": "中等",
  "aqiPoor": "较差",
  "aqiVeryPoor": "很差",
  "aqiExtremelyPoor": "极差",
  "aqiUnhealthySensitive": "对敏感人群不健康",
  "aqiUnhealthy": "不健康",
  "aqiVeryUnhealthy": "非常不健康",
  "aqiHazardous": "危险",
  "pollenAlder": "桤木",
  "pollenBirch": "桦树",
  "pollenGrass": "禾草",
  "pollenMugwort": "艾蒿",
  "pollenOlive": "橄榄",
  "pollenRagweed": "豚草",
  "pollenLow": "低",
  "pollenModerate": "中",
  "pollenHigh": "高",
  "pollenNone": "无明显花粉",
  "pollenUnavailable": "该地区没有花粉数据",
  "sourceGroupAirQuality": "空气质量与花粉",
  "sourceGroupAirQualityDetails": "来自 Copernicus CAMS 模型的欧洲空气质量指数（美国为 US AQI）、PM2.5、PM10、臭氧和花粉；开启此部分时最多每小时获取一次。",
  "sourceGroupAirQualityCoverage": "空气质量覆盖全球；花粉仅限欧洲。"
})
addCatalogEntries("zh_TW", {
  "airQualityPollen": "空氣品質與花粉",
  "airQualityIndex": "空氣品質指數",
  "pollen": "花粉",
  "airQualityHint": "Open-Meteo（Copernicus CAMS），每小時更新。花粉僅限歐洲。",
  "aqiGood": "良好",
  "aqiFair": "尚可",
  "aqiModerate": "普通",
  "aqiPoor": "不良",
  "aqiVeryPoor": "很差",
  "aqiExtremelyPoor": "極差",
  "aqiUnhealthySensitive": "對敏感族群不健康",
  "aqiUnhealthy": "不健康",
  "aqiVeryUnhealthy": "非常不健康",
  "aqiHazardous": "危害",
  "pollenAlder": "榿木",
  "pollenBirch": "樺樹",
  "pollenGrass": "禾草",
  "pollenMugwort": "艾草",
  "pollenOlive": "橄欖",
  "pollenRagweed": "豚草",
  "pollenLow": "低",
  "pollenModerate": "中",
  "pollenHigh": "高",
  "pollenNone": "無明顯花粉",
  "pollenUnavailable": "此地區沒有花粉資料",
  "sourceGroupAirQuality": "空氣品質與花粉",
  "sourceGroupAirQualityDetails": "來自 Copernicus CAMS 模型的歐洲空氣品質指數（美國為 US AQI）、PM2.5、PM10、臭氧與花粉；開啟此區塊時最多每小時取得一次。",
  "sourceGroupAirQualityCoverage": "空氣品質涵蓋全球；花粉僅限歐洲。"
})
addCatalogEntries("ja", {
  "airQualityPollen": "大気質と花粉",
  "airQualityIndex": "大気質指数",
  "pollen": "花粉",
  "airQualityHint": "Open-Meteo（Copernicus CAMS）、1時間ごとに更新。花粉はヨーロッパのみ。",
  "aqiGood": "良い",
  "aqiFair": "まずまず",
  "aqiModerate": "普通",
  "aqiPoor": "悪い",
  "aqiVeryPoor": "非常に悪い",
  "aqiExtremelyPoor": "極めて悪い",
  "aqiUnhealthySensitive": "敏感な人には不健康",
  "aqiUnhealthy": "不健康",
  "aqiVeryUnhealthy": "非常に不健康",
  "aqiHazardous": "危険",
  "pollenAlder": "ハンノキ",
  "pollenBirch": "シラカバ",
  "pollenGrass": "イネ科",
  "pollenMugwort": "ヨモギ",
  "pollenOlive": "オリーブ",
  "pollenRagweed": "ブタクサ",
  "pollenLow": "少ない",
  "pollenModerate": "やや多い",
  "pollenHigh": "多い",
  "pollenNone": "目立った花粉なし",
  "pollenUnavailable": "この地域の花粉データはありません",
  "sourceGroupAirQuality": "大気質と花粉",
  "sourceGroupAirQualityDetails": "Copernicus CAMS モデルによる欧州大気質指数（米国では US AQI）、PM2.5、PM10、オゾン、花粉。このセクションがオンの間、最大1時間に1回取得します。",
  "sourceGroupAirQualityCoverage": "大気質は全世界、花粉はヨーロッパのみ。"
})
addCatalogEntries("ko", {
  "airQualityPollen": "대기질 및 꽃가루",
  "airQualityIndex": "대기질 지수",
  "pollen": "꽃가루",
  "airQualityHint": "Open-Meteo(Copernicus CAMS), 매시간 업데이트. 꽃가루는 유럽만 제공.",
  "aqiGood": "좋음",
  "aqiFair": "보통",
  "aqiModerate": "다소 나쁨",
  "aqiPoor": "나쁨",
  "aqiVeryPoor": "매우 나쁨",
  "aqiExtremelyPoor": "극히 나쁨",
  "aqiUnhealthySensitive": "민감군에 해로움",
  "aqiUnhealthy": "해로움",
  "aqiVeryUnhealthy": "매우 해로움",
  "aqiHazardous": "위험",
  "pollenAlder": "오리나무",
  "pollenBirch": "자작나무",
  "pollenGrass": "잔디",
  "pollenMugwort": "쑥",
  "pollenOlive": "올리브",
  "pollenRagweed": "돼지풀",
  "pollenLow": "낮음",
  "pollenModerate": "보통",
  "pollenHigh": "높음",
  "pollenNone": "눈에 띄는 꽃가루 없음",
  "pollenUnavailable": "이 지역의 꽃가루 데이터 없음",
  "sourceGroupAirQuality": "대기질 및 꽃가루",
  "sourceGroupAirQualityDetails": "Copernicus CAMS 모델의 유럽 대기질 지수(미국은 US AQI), PM2.5, PM10, 오존, 꽃가루. 이 섹션이 켜져 있을 때 최대 한 시간에 한 번 가져옵니다.",
  "sourceGroupAirQualityCoverage": "대기질은 전 세계, 꽃가루는 유럽만."
})
addCatalogEntries("ar", {
  "airQualityPollen": "جودة الهواء وحبوب اللقاح",
  "airQualityIndex": "مؤشر جودة الهواء",
  "pollen": "حبوب اللقاح",
  "airQualityHint": "Open-Meteo (Copernicus CAMS)، تحديث كل ساعة. حبوب اللقاح في أوروبا فقط.",
  "aqiGood": "جيدة",
  "aqiFair": "مقبولة",
  "aqiModerate": "متوسطة",
  "aqiPoor": "رديئة",
  "aqiVeryPoor": "رديئة جدًا",
  "aqiExtremelyPoor": "رديئة للغاية",
  "aqiUnhealthySensitive": "غير صحية للفئات الحساسة",
  "aqiUnhealthy": "غير صحية",
  "aqiVeryUnhealthy": "غير صحية جدًا",
  "aqiHazardous": "خطرة",
  "pollenAlder": "الجار",
  "pollenBirch": "البتولا",
  "pollenGrass": "الأعشاب",
  "pollenMugwort": "الشيح",
  "pollenOlive": "الزيتون",
  "pollenRagweed": "الأمبروسيا",
  "pollenLow": "منخفض",
  "pollenModerate": "متوسط",
  "pollenHigh": "مرتفع",
  "pollenNone": "لا حبوب لقاح تُذكر",
  "pollenUnavailable": "لا توجد بيانات حبوب لقاح لهذه المنطقة",
  "sourceGroupAirQuality": "جودة الهواء وحبوب اللقاح",
  "sourceGroupAirQualityDetails": "مؤشر جودة الهواء الأوروبي (US AQI في الولايات المتحدة) وPM2.5 وPM10 والأوزون وحبوب اللقاح من نموذج Copernicus CAMS، تُجلب مرة كل ساعة على الأكثر ما دام القسم مفعّلًا.",
  "sourceGroupAirQualityCoverage": "جودة الهواء في جميع أنحاء العالم؛ حبوب اللقاح في أوروبا فقط."
})
addCatalogEntries("he", {
  "airQualityPollen": "איכות אוויר ואבקנים",
  "airQualityIndex": "מדד איכות אוויר",
  "pollen": "אבקנים",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), מתעדכן כל שעה. אבקנים באירופה בלבד.",
  "aqiGood": "טובה",
  "aqiFair": "סבירה",
  "aqiModerate": "בינונית",
  "aqiPoor": "ירודה",
  "aqiVeryPoor": "ירודה מאוד",
  "aqiExtremelyPoor": "ירודה במיוחד",
  "aqiUnhealthySensitive": "לא בריאה לקבוצות רגישות",
  "aqiUnhealthy": "לא בריאה",
  "aqiVeryUnhealthy": "לא בריאה מאוד",
  "aqiHazardous": "מסוכנת",
  "pollenAlder": "אלמון",
  "pollenBirch": "שדר",
  "pollenGrass": "עשבים",
  "pollenMugwort": "לענה",
  "pollenOlive": "זית",
  "pollenRagweed": "אמברוסיה",
  "pollenLow": "נמוך",
  "pollenModerate": "בינוני",
  "pollenHigh": "גבוה",
  "pollenNone": "אין אבקנים משמעותיים",
  "pollenUnavailable": "אין נתוני אבקנים לאזור זה",
  "sourceGroupAirQuality": "איכות אוויר ואבקנים",
  "sourceGroupAirQualityDetails": "מדד איכות האוויר האירופי (US AQI בארצות הברית), PM2.5, PM10, אוזון ואבקנים ממודל Copernicus CAMS, נטענים לכל היותר פעם בשעה כשהקטע מופעל.",
  "sourceGroupAirQualityCoverage": "איכות אוויר בכל העולם; אבקנים באירופה בלבד."
})
addCatalogEntries("fa", {
  "airQualityPollen": "کیفیت هوا و گرده",
  "airQualityIndex": "شاخص کیفیت هوا",
  "pollen": "گرده",
  "airQualityHint": "Open-Meteo (Copernicus CAMS)، به‌روزرسانی ساعتی. گرده فقط در اروپا.",
  "aqiGood": "خوب",
  "aqiFair": "قابل قبول",
  "aqiModerate": "متوسط",
  "aqiPoor": "ضعیف",
  "aqiVeryPoor": "خیلی ضعیف",
  "aqiExtremelyPoor": "بسیار ضعیف",
  "aqiUnhealthySensitive": "ناسالم برای گروه‌های حساس",
  "aqiUnhealthy": "ناسالم",
  "aqiVeryUnhealthy": "بسیار ناسالم",
  "aqiHazardous": "خطرناک",
  "pollenAlder": "توسکا",
  "pollenBirch": "غان",
  "pollenGrass": "گندمیان",
  "pollenMugwort": "درمنه",
  "pollenOlive": "زیتون",
  "pollenRagweed": "آمبروزیا",
  "pollenLow": "کم",
  "pollenModerate": "متوسط",
  "pollenHigh": "زیاد",
  "pollenNone": "گرده قابل توجهی نیست",
  "pollenUnavailable": "برای این منطقه داده گرده وجود ندارد",
  "sourceGroupAirQuality": "کیفیت هوا و گرده",
  "sourceGroupAirQualityDetails": "شاخص کیفیت هوای اروپا (در آمریکا US AQI)، PM2.5، PM10، ازن و گرده از مدل Copernicus CAMS؛ تا وقتی این بخش روشن است حداکثر ساعتی یک بار دریافت می‌شود.",
  "sourceGroupAirQualityCoverage": "کیفیت هوا در سراسر جهان؛ گرده فقط در اروپا."
})
addCatalogEntries("hi", {
  "airQualityPollen": "वायु गुणवत्ता और पराग",
  "airQualityIndex": "वायु गुणवत्ता सूचकांक",
  "pollen": "पराग",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), हर घंटे अपडेट। पराग केवल यूरोप में।",
  "aqiGood": "अच्छी",
  "aqiFair": "ठीक",
  "aqiModerate": "मध्यम",
  "aqiPoor": "खराब",
  "aqiVeryPoor": "बहुत खराब",
  "aqiExtremelyPoor": "अत्यधिक खराब",
  "aqiUnhealthySensitive": "संवेदनशील समूहों के लिए अस्वास्थ्यकर",
  "aqiUnhealthy": "अस्वास्थ्यकर",
  "aqiVeryUnhealthy": "बहुत अस्वास्थ्यकर",
  "aqiHazardous": "खतरनाक",
  "pollenAlder": "एल्डर",
  "pollenBirch": "भोजपत्र",
  "pollenGrass": "घास",
  "pollenMugwort": "नागदौना",
  "pollenOlive": "जैतून",
  "pollenRagweed": "रैगवीड",
  "pollenLow": "कम",
  "pollenModerate": "मध्यम",
  "pollenHigh": "अधिक",
  "pollenNone": "कोई उल्लेखनीय पराग नहीं",
  "pollenUnavailable": "इस क्षेत्र के लिए पराग डेटा नहीं है",
  "sourceGroupAirQuality": "वायु गुणवत्ता और पराग",
  "sourceGroupAirQualityDetails": "Copernicus CAMS मॉडल से यूरोपीय वायु गुणवत्ता सूचकांक (अमेरिका में US AQI), PM2.5, PM10, ओज़ोन और पराग; अनुभाग चालू रहने पर अधिकतम हर घंटे एक बार लिया जाता है।",
  "sourceGroupAirQualityCoverage": "वायु गुणवत्ता दुनिया भर में; पराग केवल यूरोप में।"
})
addCatalogEntries("id", {
  "airQualityPollen": "Kualitas udara & serbuk sari",
  "airQualityIndex": "Indeks kualitas udara",
  "pollen": "Serbuk sari",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), diperbarui setiap jam. Serbuk sari hanya di Eropa.",
  "aqiGood": "baik",
  "aqiFair": "cukup",
  "aqiModerate": "sedang",
  "aqiPoor": "buruk",
  "aqiVeryPoor": "sangat buruk",
  "aqiExtremelyPoor": "ekstrem buruk",
  "aqiUnhealthySensitive": "tidak sehat bagi kelompok sensitif",
  "aqiUnhealthy": "tidak sehat",
  "aqiVeryUnhealthy": "sangat tidak sehat",
  "aqiHazardous": "berbahaya",
  "pollenAlder": "Alder",
  "pollenBirch": "Birch",
  "pollenGrass": "Rumput",
  "pollenMugwort": "Mugwort",
  "pollenOlive": "Zaitun",
  "pollenRagweed": "Ragweed",
  "pollenLow": "rendah",
  "pollenModerate": "sedang",
  "pollenHigh": "tinggi",
  "pollenNone": "tidak ada serbuk sari berarti",
  "pollenUnavailable": "tidak ada data serbuk sari untuk wilayah ini",
  "sourceGroupAirQuality": "Kualitas udara & serbuk sari",
  "sourceGroupAirQualityDetails": "Indeks kualitas udara Eropa (US AQI di Amerika Serikat), PM2,5, PM10, ozon, dan serbuk sari dari model Copernicus CAMS, diambil paling sering sekali per jam selama bagian ini aktif.",
  "sourceGroupAirQualityCoverage": "Kualitas udara di seluruh dunia; serbuk sari hanya di Eropa."
})
addCatalogEntries("vi", {
  "airQualityPollen": "Chất lượng không khí & phấn hoa",
  "airQualityIndex": "Chỉ số chất lượng không khí",
  "pollen": "Phấn hoa",
  "airQualityHint": "Open-Meteo (Copernicus CAMS), cập nhật mỗi giờ. Phấn hoa chỉ ở châu Âu.",
  "aqiGood": "tốt",
  "aqiFair": "khá",
  "aqiModerate": "trung bình",
  "aqiPoor": "kém",
  "aqiVeryPoor": "rất kém",
  "aqiExtremelyPoor": "cực kỳ kém",
  "aqiUnhealthySensitive": "không tốt cho nhóm nhạy cảm",
  "aqiUnhealthy": "không tốt",
  "aqiVeryUnhealthy": "rất không tốt",
  "aqiHazardous": "nguy hại",
  "pollenAlder": "Tống quán sủ",
  "pollenBirch": "Bạch dương",
  "pollenGrass": "Cỏ",
  "pollenMugwort": "Ngải cứu",
  "pollenOlive": "Ô liu",
  "pollenRagweed": "Cỏ phấn hương",
  "pollenLow": "thấp",
  "pollenModerate": "trung bình",
  "pollenHigh": "cao",
  "pollenNone": "không có phấn hoa đáng kể",
  "pollenUnavailable": "không có dữ liệu phấn hoa cho khu vực này",
  "sourceGroupAirQuality": "Chất lượng không khí & phấn hoa",
  "sourceGroupAirQualityDetails": "Chỉ số chất lượng không khí châu Âu (US AQI tại Hoa Kỳ), PM2,5, PM10, ozon và phấn hoa từ mô hình Copernicus CAMS, lấy tối đa mỗi giờ một lần khi mục này được bật.",
  "sourceGroupAirQualityCoverage": "Chất lượng không khí trên toàn thế giới; phấn hoa chỉ ở châu Âu."
})
addCatalogEntries("th", {
  "airQualityPollen": "คุณภาพอากาศและละอองเกสร",
  "airQualityIndex": "ดัชนีคุณภาพอากาศ",
  "pollen": "ละอองเกสร",
  "airQualityHint": "Open-Meteo (Copernicus CAMS) อัปเดตทุกชั่วโมง ละอองเกสรเฉพาะยุโรป",
  "aqiGood": "ดี",
  "aqiFair": "พอใช้",
  "aqiModerate": "ปานกลาง",
  "aqiPoor": "แย่",
  "aqiVeryPoor": "แย่มาก",
  "aqiExtremelyPoor": "แย่ที่สุด",
  "aqiUnhealthySensitive": "ไม่ดีต่อกลุ่มเสี่ยง",
  "aqiUnhealthy": "ไม่ดีต่อสุขภาพ",
  "aqiVeryUnhealthy": "ไม่ดีต่อสุขภาพมาก",
  "aqiHazardous": "อันตราย",
  "pollenAlder": "ออลเดอร์",
  "pollenBirch": "เบิร์ช",
  "pollenGrass": "หญ้า",
  "pollenMugwort": "มักเวิร์ต",
  "pollenOlive": "มะกอก",
  "pollenRagweed": "แร็กวีด",
  "pollenLow": "ต่ำ",
  "pollenModerate": "ปานกลาง",
  "pollenHigh": "สูง",
  "pollenNone": "ไม่มีละอองเกสรที่น่ากังวล",
  "pollenUnavailable": "ไม่มีข้อมูลละอองเกสรสำหรับภูมิภาคนี้",
  "sourceGroupAirQuality": "คุณภาพอากาศและละอองเกสร",
  "sourceGroupAirQualityDetails": "ดัชนีคุณภาพอากาศยุโรป (US AQI ในสหรัฐอเมริกา) PM2.5 PM10 โอโซน และละอองเกสรจากแบบจำลอง Copernicus CAMS ดึงข้อมูลอย่างมากชั่วโมงละครั้งขณะเปิดส่วนนี้",
  "sourceGroupAirQualityCoverage": "คุณภาพอากาศทั่วโลก ละอองเกสรเฉพาะยุโรป"
})

// Air quality status texts and the menu bar hint.
addCatalogEntries("es", {
  "airQualityAlert": "Aire malo y polen alto",
  "airQualityLoading": "Cargando calidad del aire…",
  "airQualityUnavailable": "No se pudieron obtener datos",
  "airQualityNoData": "No hay datos para este lugar"
})
addCatalogEntries("fr", {
  "airQualityAlert": "Air mauvais et pollens élevés",
  "airQualityLoading": "Chargement de la qualité de l’air…",
  "airQualityUnavailable": "Impossible de récupérer les données",
  "airQualityNoData": "Aucune donnée pour ce lieu"
})
addCatalogEntries("pt", {
  "airQualityAlert": "Ar ruim e pólen alto",
  "airQualityLoading": "Carregando a qualidade do ar…",
  "airQualityUnavailable": "Não foi possível obter dados",
  "airQualityNoData": "Não há dados para este local"
})
addCatalogEntries("ru", {
  "airQualityAlert": "Плохой воздух и много пыльцы",
  "airQualityLoading": "Загрузка качества воздуха…",
  "airQualityUnavailable": "Не удалось получить данные",
  "airQualityNoData": "Нет данных для этого места"
})
addCatalogEntries("uk", {
  "airQualityAlert": "Погане повітря й багато пилку",
  "airQualityLoading": "Завантаження якості повітря…",
  "airQualityUnavailable": "Не вдалося отримати дані",
  "airQualityNoData": "Немає даних для цього місця"
})
addCatalogEntries("pl", {
  "airQualityAlert": "Złe powietrze i dużo pyłków",
  "airQualityLoading": "Wczytywanie jakości powietrza…",
  "airQualityUnavailable": "Nie udało się pobrać danych",
  "airQualityNoData": "Brak danych dla tego miejsca"
})
addCatalogEntries("it", {
  "airQualityAlert": "Aria scadente e pollini alti",
  "airQualityLoading": "Caricamento qualità dell’aria…",
  "airQualityUnavailable": "Impossibile recuperare i dati",
  "airQualityNoData": "Nessun dato per questo luogo"
})
addCatalogEntries("nl", {
  "airQualityAlert": "Slechte lucht & veel pollen",
  "airQualityLoading": "Luchtkwaliteit laden…",
  "airQualityUnavailable": "Gegevens konden niet worden opgehaald",
  "airQualityNoData": "Geen gegevens voor deze plaats"
})
addCatalogEntries("tr", {
  "airQualityAlert": "Kötü hava kalitesi ve yüksek polen",
  "airQualityLoading": "Hava kalitesi yükleniyor…",
  "airQualityUnavailable": "Veri alınamadı",
  "airQualityNoData": "Bu konum için veri yok"
})
addCatalogEntries("cs", {
  "airQualityAlert": "Špatný vzduch a hodně pylu",
  "airQualityLoading": "Načítání kvality ovzduší…",
  "airQualityUnavailable": "Data nelze načíst",
  "airQualityNoData": "Pro toto místo nejsou data"
})
addCatalogEntries("sv", {
  "airQualityAlert": "Dålig luft & mycket pollen",
  "airQualityLoading": "Läser in luftkvalitet…",
  "airQualityUnavailable": "Det gick inte att hämta data",
  "airQualityNoData": "Inga data för den här platsen"
})
addCatalogEntries("fi", {
  "airQualityAlert": "Huono ilma ja runsaasti siitepölyä",
  "airQualityLoading": "Ladataan ilmanlaatua…",
  "airQualityUnavailable": "Tietoja ei voitu hakea",
  "airQualityNoData": "Tälle paikalle ei ole tietoja"
})
addCatalogEntries("nb", {
  "airQualityAlert": "Dårlig luft og mye pollen",
  "airQualityLoading": "Laster inn luftkvalitet…",
  "airQualityUnavailable": "Kunne ikke hente data",
  "airQualityNoData": "Ingen data for dette stedet"
})
addCatalogEntries("da", {
  "airQualityAlert": "Dårlig luft og meget pollen",
  "airQualityLoading": "Indlæser luftkvalitet…",
  "airQualityUnavailable": "Data kunne ikke hentes",
  "airQualityNoData": "Ingen data for dette sted"
})
addCatalogEntries("ro", {
  "airQualityAlert": "Aer slab și polen ridicat",
  "airQualityLoading": "Se încarcă calitatea aerului…",
  "airQualityUnavailable": "Datele nu au putut fi preluate",
  "airQualityNoData": "Nu există date pentru acest loc"
})
addCatalogEntries("hu", {
  "airQualityAlert": "Rossz levegő és sok pollen",
  "airQualityLoading": "Levegőminőség betöltése…",
  "airQualityUnavailable": "Nem sikerült adatot lekérni",
  "airQualityNoData": "Ehhez a helyhez nincs adat"
})
addCatalogEntries("el", {
  "airQualityAlert": "Κακός αέρας και πολλή γύρη",
  "airQualityLoading": "Φόρτωση ποιότητας αέρα…",
  "airQualityUnavailable": "Δεν ήταν δυνατή η λήψη δεδομένων",
  "airQualityNoData": "Δεν υπάρχουν δεδομένα για αυτό το μέρος"
})
addCatalogEntries("zh_CN", {
  "airQualityAlert": "空气差和花粉多",
  "airQualityLoading": "正在加载空气质量…",
  "airQualityUnavailable": "无法获取数据",
  "airQualityNoData": "该地点没有数据"
})
addCatalogEntries("zh_TW", {
  "airQualityAlert": "空氣差與花粉多",
  "airQualityLoading": "正在載入空氣品質…",
  "airQualityUnavailable": "無法取得資料",
  "airQualityNoData": "此地點沒有資料"
})
addCatalogEntries("ja", {
  "airQualityAlert": "大気が悪い・花粉が多い",
  "airQualityLoading": "大気質を読み込み中…",
  "airQualityUnavailable": "データを取得できませんでした",
  "airQualityNoData": "この場所のデータはありません"
})
addCatalogEntries("ko", {
  "airQualityAlert": "나쁜 대기질 및 많은 꽃가루",
  "airQualityLoading": "대기질 불러오는 중…",
  "airQualityUnavailable": "데이터를 가져올 수 없음",
  "airQualityNoData": "이 장소의 데이터 없음"
})
addCatalogEntries("ar", {
  "airQualityAlert": "هواء رديء وحبوب لقاح مرتفعة",
  "airQualityLoading": "جارٍ تحميل جودة الهواء…",
  "airQualityUnavailable": "تعذّر جلب البيانات",
  "airQualityNoData": "لا توجد بيانات لهذا المكان"
})
addCatalogEntries("he", {
  "airQualityAlert": "אוויר ירוד ואבקנים גבוהים",
  "airQualityLoading": "טוען איכות אוויר…",
  "airQualityUnavailable": "לא ניתן היה לטעון נתונים",
  "airQualityNoData": "אין נתונים למקום זה"
})
addCatalogEntries("fa", {
  "airQualityAlert": "هوای ناسالم و گرده زیاد",
  "airQualityLoading": "در حال بارگیری کیفیت هوا…",
  "airQualityUnavailable": "دریافت داده ممکن نشد",
  "airQualityNoData": "برای این مکان داده‌ای وجود ندارد"
})
addCatalogEntries("hi", {
  "airQualityAlert": "खराब हवा और अधिक पराग",
  "airQualityLoading": "वायु गुणवत्ता लोड हो रही है…",
  "airQualityUnavailable": "डेटा प्राप्त नहीं किया जा सका",
  "airQualityNoData": "इस स्थान के लिए कोई डेटा नहीं"
})
addCatalogEntries("id", {
  "airQualityAlert": "Udara buruk & serbuk sari tinggi",
  "airQualityLoading": "Memuat kualitas udara…",
  "airQualityUnavailable": "Data tidak dapat diambil",
  "airQualityNoData": "Tidak ada data untuk tempat ini"
})
addCatalogEntries("vi", {
  "airQualityAlert": "Không khí kém & phấn hoa cao",
  "airQualityLoading": "Đang tải chất lượng không khí…",
  "airQualityUnavailable": "Không thể lấy dữ liệu",
  "airQualityNoData": "Không có dữ liệu cho địa điểm này"
})
addCatalogEntries("th", {
  "airQualityAlert": "อากาศแย่และละอองเกสรสูง",
  "airQualityLoading": "กำลังโหลดคุณภาพอากาศ…",
  "airQualityUnavailable": "ดึงข้อมูลไม่ได้",
  "airQualityNoData": "ไม่มีข้อมูลสำหรับสถานที่นี้"
})

// Air quality colour indicator setting.
addCatalogEntries("es", { "airQualityColor": "Indicador de color" })
addCatalogEntries("fr", { "airQualityColor": "Indicateur de couleur" })
addCatalogEntries("pt", { "airQualityColor": "Indicador de cor" })
addCatalogEntries("ru", { "airQualityColor": "Цветовой индикатор" })
addCatalogEntries("uk", { "airQualityColor": "Кольоровий індикатор" })
addCatalogEntries("pl", { "airQualityColor": "Wskaźnik koloru" })
addCatalogEntries("it", { "airQualityColor": "Indicatore colorato" })
addCatalogEntries("nl", { "airQualityColor": "Kleurindicator" })
addCatalogEntries("tr", { "airQualityColor": "Renk göstergesi" })
addCatalogEntries("cs", { "airQualityColor": "Barevný indikátor" })
addCatalogEntries("sv", { "airQualityColor": "Färgindikator" })
addCatalogEntries("fi", { "airQualityColor": "Väri-ilmaisin" })
addCatalogEntries("nb", { "airQualityColor": "Fargeindikator" })
addCatalogEntries("da", { "airQualityColor": "Farveindikator" })
addCatalogEntries("ro", { "airQualityColor": "Indicator de culoare" })
addCatalogEntries("hu", { "airQualityColor": "Színjelző" })
addCatalogEntries("el", { "airQualityColor": "Χρωματική ένδειξη" })
addCatalogEntries("zh_CN", { "airQualityColor": "颜色指示" })
addCatalogEntries("zh_TW", { "airQualityColor": "顏色指示" })
addCatalogEntries("ja", { "airQualityColor": "色インジケーター" })
addCatalogEntries("ko", { "airQualityColor": "색상 표시" })
addCatalogEntries("ar", { "airQualityColor": "مؤشر اللون" })
addCatalogEntries("he", { "airQualityColor": "מחוון צבע" })
addCatalogEntries("fa", { "airQualityColor": "نشانگر رنگ" })
addCatalogEntries("hi", { "airQualityColor": "रंग संकेतक" })
addCatalogEntries("id", { "airQualityColor": "Indikator warna" })
addCatalogEntries("vi", { "airQualityColor": "Chỉ báo màu" })
addCatalogEntries("th", { "airQualityColor": "ตัวบ่งชี้สี" })

// Open the app from the widget.
addCatalogEntries("es", {"openInApp": "Abrir en la aplicación", "shortcutOpenApp": "Abrir la aplicación (widget)", "shortcutMouseOpenApp": "Símbolo o temperatura en el widget: abrir la aplicación"})
addCatalogEntries("fr", {"openInApp": "Ouvrir dans l’application", "shortcutOpenApp": "Ouvrir l’application (widget)", "shortcutMouseOpenApp": "Symbole ou température dans le widget : ouvrir l’application"})
addCatalogEntries("pt", {"openInApp": "Abrir no aplicativo", "shortcutOpenApp": "Abrir o aplicativo (widget)", "shortcutMouseOpenApp": "Símbolo ou temperatura no widget: abrir o aplicativo"})
addCatalogEntries("ru", {"openInApp": "Открыть в приложении", "shortcutOpenApp": "Открыть приложение (виджет)", "shortcutMouseOpenApp": "Значок или температура в виджете: открыть приложение"})
addCatalogEntries("uk", {"openInApp": "Відкрити в застосунку", "shortcutOpenApp": "Відкрити застосунок (віджет)", "shortcutMouseOpenApp": "Значок або температура у віджеті: відкрити застосунок"})
addCatalogEntries("pl", {"openInApp": "Otwórz w aplikacji", "shortcutOpenApp": "Otwórz aplikację (widżet)", "shortcutMouseOpenApp": "Symbol lub temperatura w widżecie: otwórz aplikację"})
addCatalogEntries("it", {"openInApp": "Apri nell’app", "shortcutOpenApp": "Apri l’app (widget)", "shortcutMouseOpenApp": "Simbolo o temperatura nel widget: apri l’app"})
addCatalogEntries("nl", {"openInApp": "Openen in app", "shortcutOpenApp": "App openen (widget)", "shortcutMouseOpenApp": "Symbool of temperatuur in de widget: app openen"})
addCatalogEntries("tr", {"openInApp": "Uygulamada aç", "shortcutOpenApp": "Uygulamayı aç (widget)", "shortcutMouseOpenApp": "Widget'taki simge veya sıcaklık: uygulamayı aç"})
addCatalogEntries("cs", {"openInApp": "Otevřít v aplikaci", "shortcutOpenApp": "Otevřít aplikaci (widget)", "shortcutMouseOpenApp": "Symbol nebo teplota ve widgetu: otevřít aplikaci"})
addCatalogEntries("sv", {"openInApp": "Öppna i appen", "shortcutOpenApp": "Öppna appen (widget)", "shortcutMouseOpenApp": "Symbol eller temperatur i widgeten: öppna appen"})
addCatalogEntries("fi", {"openInApp": "Avaa sovelluksessa", "shortcutOpenApp": "Avaa sovellus (widget)", "shortcutMouseOpenApp": "Widgetin symboli tai lämpötila: avaa sovellus"})
addCatalogEntries("nb", {"openInApp": "Åpne i appen", "shortcutOpenApp": "Åpne appen (widget)", "shortcutMouseOpenApp": "Symbol eller temperatur i widgeten: åpne appen"})
addCatalogEntries("da", {"openInApp": "Åbn i appen", "shortcutOpenApp": "Åbn appen (widget)", "shortcutMouseOpenApp": "Symbol eller temperatur i widgetten: åbn appen"})
addCatalogEntries("ro", {"openInApp": "Deschide în aplicație", "shortcutOpenApp": "Deschide aplicația (widget)", "shortcutMouseOpenApp": "Simbolul sau temperatura din widget: deschide aplicația"})
addCatalogEntries("hu", {"openInApp": "Megnyitás az alkalmazásban", "shortcutOpenApp": "Alkalmazás megnyitása (widget)", "shortcutMouseOpenApp": "Szimbólum vagy hőmérséklet a widgetben: alkalmazás megnyitása"})
addCatalogEntries("el", {"openInApp": "Άνοιγμα στην εφαρμογή", "shortcutOpenApp": "Άνοιγμα της εφαρμογής (widget)", "shortcutMouseOpenApp": "Σύμβολο ή θερμοκρασία στο widget: άνοιγμα της εφαρμογής"})
addCatalogEntries("zh_CN", {"openInApp": "在应用中打开", "shortcutOpenApp": "打开应用（小组件）", "shortcutMouseOpenApp": "小组件中的图标或温度：打开应用"})
addCatalogEntries("zh_TW", {"openInApp": "在應用程式中開啟", "shortcutOpenApp": "開啟應用程式（小工具）", "shortcutMouseOpenApp": "小工具中的圖示或溫度：開啟應用程式"})
addCatalogEntries("ja", {"openInApp": "アプリで開く", "shortcutOpenApp": "アプリを開く（ウィジェット）", "shortcutMouseOpenApp": "ウィジェットの記号または気温：アプリを開く"})
addCatalogEntries("ko", {"openInApp": "앱에서 열기", "shortcutOpenApp": "앱 열기(위젯)", "shortcutMouseOpenApp": "위젯의 기호 또는 기온: 앱 열기"})
addCatalogEntries("ar", {"openInApp": "فتح في التطبيق", "shortcutOpenApp": "فتح التطبيق (الأداة)", "shortcutMouseOpenApp": "الرمز أو درجة الحرارة في الأداة: فتح التطبيق"})
addCatalogEntries("he", {"openInApp": "פתיחה ביישום", "shortcutOpenApp": "פתיחת היישום (יישומון)", "shortcutMouseOpenApp": "סמל או טמפרטורה ביישומון: פתיחת היישום"})
addCatalogEntries("fa", {"openInApp": "باز کردن در برنامه", "shortcutOpenApp": "باز کردن برنامه (ابزارک)", "shortcutMouseOpenApp": "نماد یا دما در ابزارک: باز کردن برنامه"})
addCatalogEntries("hi", {"openInApp": "ऐप में खोलें", "shortcutOpenApp": "ऐप खोलें (विजेट)", "shortcutMouseOpenApp": "विजेट में चिह्न या तापमान: ऐप खोलें"})
addCatalogEntries("id", {"openInApp": "Buka di aplikasi", "shortcutOpenApp": "Buka aplikasi (widget)", "shortcutMouseOpenApp": "Simbol atau suhu di widget: buka aplikasi"})
addCatalogEntries("vi", {"openInApp": "Mở trong ứng dụng", "shortcutOpenApp": "Mở ứng dụng (tiện ích)", "shortcutMouseOpenApp": "Biểu tượng hoặc nhiệt độ trong tiện ích: mở ứng dụng"})
addCatalogEntries("th", {"openInApp": "เปิดในแอป", "shortcutOpenApp": "เปิดแอป (วิดเจ็ต)", "shortcutMouseOpenApp": "สัญลักษณ์หรืออุณหภูมิในวิดเจ็ต: เปิดแอป"})

// Language picker.
addCatalogEntries("es", {"language": "Idioma", "languageAuto": "Automático ({language})"})
addCatalogEntries("fr", {"language": "Langue", "languageAuto": "Automatique ({language})"})
addCatalogEntries("pt", {"language": "Idioma", "languageAuto": "Automático ({language})"})
addCatalogEntries("ru", {"language": "Язык", "languageAuto": "Автоматически ({language})"})
addCatalogEntries("uk", {"language": "Мова", "languageAuto": "Автоматично ({language})"})
addCatalogEntries("pl", {"language": "Język", "languageAuto": "Automatycznie ({language})"})
addCatalogEntries("it", {"language": "Lingua", "languageAuto": "Automatica ({language})"})
addCatalogEntries("nl", {"language": "Taal", "languageAuto": "Automatisch ({language})"})
addCatalogEntries("tr", {"language": "Dil", "languageAuto": "Otomatik ({language})"})
addCatalogEntries("cs", {"language": "Jazyk", "languageAuto": "Automaticky ({language})"})
addCatalogEntries("sv", {"language": "Språk", "languageAuto": "Automatiskt ({language})"})
addCatalogEntries("fi", {"language": "Kieli", "languageAuto": "Automaattinen ({language})"})
addCatalogEntries("nb", {"language": "Språk", "languageAuto": "Automatisk ({language})"})
addCatalogEntries("da", {"language": "Sprog", "languageAuto": "Automatisk ({language})"})
addCatalogEntries("ro", {"language": "Limbă", "languageAuto": "Automat ({language})"})
addCatalogEntries("hu", {"language": "Nyelv", "languageAuto": "Automatikus ({language})"})
addCatalogEntries("el", {"language": "Γλώσσα", "languageAuto": "Αυτόματα ({language})"})
addCatalogEntries("zh_CN", {"language": "语言", "languageAuto": "自动（{language}）"})
addCatalogEntries("zh_TW", {"language": "語言", "languageAuto": "自動（{language}）"})
addCatalogEntries("ja", {"language": "言語", "languageAuto": "自動（{language}）"})
addCatalogEntries("ko", {"language": "언어", "languageAuto": "자동({language})"})
addCatalogEntries("ar", {"language": "اللغة", "languageAuto": "تلقائي ({language})"})
addCatalogEntries("he", {"language": "שפה", "languageAuto": "אוטומטי ({language})"})
addCatalogEntries("fa", {"language": "زبان", "languageAuto": "خودکار ({language})"})
addCatalogEntries("hi", {"language": "भाषा", "languageAuto": "स्वचालित ({language})"})
addCatalogEntries("id", {"language": "Bahasa", "languageAuto": "Otomatis ({language})"})
addCatalogEntries("vi", {"language": "Ngôn ngữ", "languageAuto": "Tự động ({language})"})
addCatalogEntries("th", {"language": "ภาษา", "languageAuto": "อัตโนมัติ ({language})"})

// App launcher entry switch in the general settings.
addCatalogEntries("es", {"appLauncherEntry": "Mostrar en el lanzador de aplicaciones", "appLauncherEntryHint": "Añade la aplicación More Weather al lanzador. Si se elimina el plugin, la entrada se borra sola la próxima vez que se abra."})
addCatalogEntries("fr", {"appLauncherEntry": "Afficher dans le lanceur d’applications", "appLauncherEntryHint": "Ajoute l’application More Weather au lanceur. Si le plugin est supprimé, l’entrée s’efface d’elle-même à sa prochaine ouverture."})
addCatalogEntries("pt", {"appLauncherEntry": "Mostrar no lançador de aplicativos", "appLauncherEntryHint": "Adiciona o app More Weather ao lançador. Se o plugin for removido, a entrada se apaga sozinha na próxima vez que for aberta."})
addCatalogEntries("ru", {"appLauncherEntry": "Показывать в меню приложений", "appLauncherEntryHint": "Добавляет приложение More Weather в меню приложений. Если плагин удалён, запись удалит себя при следующем открытии."})
addCatalogEntries("uk", {"appLauncherEntry": "Показувати в меню застосунків", "appLauncherEntryHint": "Додає застосунок More Weather до меню застосунків. Якщо плагін видалено, запис видалить себе під час наступного відкриття."})
addCatalogEntries("pl", {"appLauncherEntry": "Pokaż w programie uruchamiającym", "appLauncherEntryHint": "Dodaje aplikację More Weather do programu uruchamiającego. Po usunięciu wtyczki wpis usunie się sam przy następnym otwarciu."})
addCatalogEntries("it", {"appLauncherEntry": "Mostra nel launcher delle app", "appLauncherEntryHint": "Aggiunge l’app More Weather al launcher. Se il plugin viene rimosso, la voce si elimina da sola alla successiva apertura."})
addCatalogEntries("nl", {"appLauncherEntry": "Tonen in de app-starter", "appLauncherEntryHint": "Voegt de More Weather-app toe aan de app-starter. Als de plug-in is verwijderd, verwijdert het item zichzelf bij de volgende keer openen."})
addCatalogEntries("tr", {"appLauncherEntry": "Uygulama başlatıcıda göster", "appLauncherEntryHint": "More Weather uygulamasını başlatıcıya ekler. Eklenti kaldırılırsa girdi bir sonraki açılışta kendini siler."})
addCatalogEntries("cs", {"appLauncherEntry": "Zobrazit ve spouštěči aplikací", "appLauncherEntryHint": "Přidá aplikaci More Weather do spouštěče. Pokud je plugin odebrán, položka se při dalším otevření sama smaže."})
addCatalogEntries("sv", {"appLauncherEntry": "Visa i appstartaren", "appLauncherEntryHint": "Lägger till More Weather-appen i appstartaren. Om pluginet tas bort raderar posten sig själv nästa gång den öppnas."})
addCatalogEntries("fi", {"appLauncherEntry": "Näytä sovelluskäynnistimessä", "appLauncherEntryHint": "Lisää More Weather -sovelluksen käynnistimeen. Jos laajennus poistetaan, merkintä poistaa itsensä, kun se avataan seuraavan kerran."})
addCatalogEntries("nb", {"appLauncherEntry": "Vis i appstarteren", "appLauncherEntryHint": "Legger More Weather-appen til i appstarteren. Hvis programtillegget fjernes, sletter oppføringen seg selv neste gang den åpnes."})
addCatalogEntries("da", {"appLauncherEntry": "Vis i appstarteren", "appLauncherEntryHint": "Tilføjer More Weather-appen til appstarteren. Hvis pluginet fjernes, sletter posten sig selv, næste gang den åbnes."})
addCatalogEntries("ro", {"appLauncherEntry": "Afișează în lansatorul de aplicații", "appLauncherEntryHint": "Adaugă aplicația More Weather în lansator. Dacă pluginul este eliminat, intrarea se șterge singură la următoarea deschidere."})
addCatalogEntries("hu", {"appLauncherEntry": "Megjelenítés az alkalmazásindítóban", "appLauncherEntryHint": "Hozzáadja a More Weather alkalmazást az indítóhoz. Ha a bővítményt eltávolítják, a bejegyzés a következő megnyitáskor törli magát."})
addCatalogEntries("el", {"appLauncherEntry": "Εμφάνιση στην εκκίνηση εφαρμογών", "appLauncherEntryHint": "Προσθέτει την εφαρμογή More Weather στην εκκίνηση εφαρμογών. Αν αφαιρεθεί το πρόσθετο, η καταχώριση διαγράφεται μόνη της στο επόμενο άνοιγμα."})
addCatalogEntries("zh_CN", {"appLauncherEntry": "在应用启动器中显示", "appLauncherEntryHint": "将 More Weather 应用添加到应用启动器。如果插件已被移除，该条目会在下次打开时自行删除。"})
addCatalogEntries("zh_TW", {"appLauncherEntry": "在應用程式啟動器中顯示", "appLauncherEntryHint": "將 More Weather 應用程式加入啟動器。如果外掛已移除，此項目會在下次開啟時自行刪除。"})
addCatalogEntries("ja", {"appLauncherEntry": "アプリランチャーに表示", "appLauncherEntryHint": "More Weather アプリをランチャーに追加します。プラグインを削除した場合、次に開いたときに項目が自動で削除されます。"})
addCatalogEntries("ko", {"appLauncherEntry": "앱 실행기에 표시", "appLauncherEntryHint": "More Weather 앱을 앱 실행기에 추가합니다. 플러그인이 제거되면 다음에 열 때 항목이 스스로 삭제됩니다."})
addCatalogEntries("ar", {"appLauncherEntry": "إظهار في مشغّل التطبيقات", "appLauncherEntryHint": "يضيف تطبيق More Weather إلى مشغّل التطبيقات. إذا أُزيلت الإضافة، يحذف الإدخال نفسه عند فتحه في المرة التالية."})
addCatalogEntries("he", {"appLauncherEntry": "הצגה במפעיל היישומים", "appLauncherEntryHint": "מוסיף את היישום More Weather למפעיל היישומים. אם התוסף הוסר, הרשומה תמחק את עצמה בפתיחה הבאה."})
addCatalogEntries("fa", {"appLauncherEntry": "نمایش در اجراکننده برنامه‌ها", "appLauncherEntryHint": "برنامه More Weather را به اجراکننده برنامه‌ها اضافه می‌کند. اگر افزونه حذف شود، این مورد دفعه بعد که باز شود خودش را پاک می‌کند."})
addCatalogEntries("hi", {"appLauncherEntry": "ऐप लॉन्चर में दिखाएँ", "appLauncherEntryHint": "More Weather ऐप को ऐप लॉन्चर में जोड़ता है। प्लगइन हटाए जाने पर प्रविष्टि अगली बार खोलने पर स्वयं हट जाती है।"})
addCatalogEntries("id", {"appLauncherEntry": "Tampilkan di peluncur aplikasi", "appLauncherEntryHint": "Menambahkan aplikasi More Weather ke peluncur aplikasi. Jika plugin dihapus, entri akan menghapus dirinya saat dibuka berikutnya."})
addCatalogEntries("vi", {"appLauncherEntry": "Hiển thị trong trình khởi chạy ứng dụng", "appLauncherEntryHint": "Thêm ứng dụng More Weather vào trình khởi chạy. Nếu plugin bị gỡ, mục này sẽ tự xóa vào lần mở tiếp theo."})
addCatalogEntries("th", {"appLauncherEntry": "แสดงในตัวเปิดแอป", "appLauncherEntryHint": "เพิ่มแอป More Weather ลงในตัวเปิดแอป หากลบปลั๊กอินแล้ว รายการจะลบตัวเองเมื่อเปิดครั้งถัดไป"})

// Notifications card title.
addCatalogEntries("es", { "notifications": "Notificaciones" })
addCatalogEntries("fr", { "notifications": "Notifications" })
addCatalogEntries("pt", { "notifications": "Notificações" })
addCatalogEntries("ru", { "notifications": "Уведомления" })
addCatalogEntries("uk", { "notifications": "Сповіщення" })
addCatalogEntries("pl", { "notifications": "Powiadomienia" })
addCatalogEntries("it", { "notifications": "Notifiche" })
addCatalogEntries("nl", { "notifications": "Meldingen" })
addCatalogEntries("tr", { "notifications": "Bildirimler" })
addCatalogEntries("cs", { "notifications": "Oznámení" })
addCatalogEntries("sv", { "notifications": "Aviseringar" })
addCatalogEntries("fi", { "notifications": "Ilmoitukset" })
addCatalogEntries("nb", { "notifications": "Varsler" })
addCatalogEntries("da", { "notifications": "Notifikationer" })
addCatalogEntries("ro", { "notifications": "Notificări" })
addCatalogEntries("hu", { "notifications": "Értesítések" })
addCatalogEntries("el", { "notifications": "Ειδοποιήσεις" })
addCatalogEntries("zh_CN", { "notifications": "通知" })
addCatalogEntries("zh_TW", { "notifications": "通知" })
addCatalogEntries("ja", { "notifications": "通知" })
addCatalogEntries("ko", { "notifications": "알림" })
addCatalogEntries("ar", { "notifications": "الإشعارات" })
addCatalogEntries("he", { "notifications": "התראות" })
addCatalogEntries("fa", { "notifications": "اعلان‌ها" })
addCatalogEntries("hi", { "notifications": "सूचनाएँ" })
addCatalogEntries("id", { "notifications": "Notifikasi" })
addCatalogEntries("vi", { "notifications": "Thông báo" })
addCatalogEntries("th", { "notifications": "การแจ้งเตือน" })

// Sections in the window or as tabs (2.5): short tab and settings labels.
addCatalogEntries("en", {
  "airTab": "Air",
  "tabs": "Tabs",
  "tabsHint": "Sections set to “as tab” share one strip, in their order. Keys 1–9 pick them the same way.",
  "showAs": "Show",
  "placementWindow": "In window",
  "placementTab": "As tab",
  "defaultTab": "Opens on",
  "shortcutViews": "Tab 1–9 in their order"
})
addCatalogEntries("de", {
  "airTab": "Luft",
  "tabs": "Tabs",
  "tabsHint": "Rubriken „als Tab“ teilen sich eine Leiste, in ihrer Reihenfolge. Die Tasten 1–9 wählen sie genauso.",
  "showAs": "Anzeige",
  "placementWindow": "Im Fenster",
  "placementTab": "Als Tab",
  "defaultTab": "Öffnet mit",
  "shortcutViews": "Tab 1–9 in ihrer Reihenfolge"
})
addCatalogEntries("es", {
  "airTab": "Aire",
  "tabs": "Pestañas",
  "tabsHint": "Las secciones «como pestaña» comparten una barra, en su orden. Las teclas 1–9 las eligen igual.",
  "showAs": "Mostrar",
  "placementWindow": "En la ventana",
  "placementTab": "Como pestaña",
  "defaultTab": "Abre con",
  "shortcutViews": "Pestaña 1–9 en su orden"
})
addCatalogEntries("fr", {
  "airTab": "Air",
  "tabs": "Onglets",
  "tabsHint": "Les sections « en onglet » partagent une barre, dans leur ordre. Les touches 1–9 les choisissent de même.",
  "showAs": "Affichage",
  "placementWindow": "Dans la fenêtre",
  "placementTab": "En onglet",
  "defaultTab": "S’ouvre sur",
  "shortcutViews": "Onglet 1–9 dans leur ordre"
})
addCatalogEntries("pt", {
  "airTab": "Ar",
  "tabs": "Abas",
  "tabsHint": "As seções “como aba” compartilham uma barra, na sua ordem. As teclas 1–9 as escolhem da mesma forma.",
  "showAs": "Mostrar",
  "placementWindow": "Na janela",
  "placementTab": "Como aba",
  "defaultTab": "Abre em",
  "shortcutViews": "Aba 1–9 na sua ordem"
})
addCatalogEntries("ru", {
  "airTab": "Воздух",
  "tabs": "Вкладки",
  "tabsHint": "Разделы «вкладкой» делят одну панель в своём порядке. Клавиши 1–9 выбирают их так же.",
  "showAs": "Показ",
  "placementWindow": "В окне",
  "placementTab": "Вкладкой",
  "defaultTab": "Открывать",
  "shortcutViews": "Вкладка 1–9 по порядку"
})
addCatalogEntries("uk", {
  "airTab": "Повітря",
  "tabs": "Вкладки",
  "tabsHint": "Розділи «вкладкою» ділять одну панель у своєму порядку. Клавіші 1–9 обирають їх так само.",
  "showAs": "Показ",
  "placementWindow": "У вікні",
  "placementTab": "Вкладкою",
  "defaultTab": "Відкривати",
  "shortcutViews": "Вкладка 1–9 за порядком"
})
addCatalogEntries("pl", {
  "airTab": "Powietrze",
  "tabs": "Karty",
  "tabsHint": "Sekcje „jako karta” dzielą jeden pasek, w swojej kolejności. Klawisze 1–9 wybierają je tak samo.",
  "showAs": "Pokaż",
  "placementWindow": "W oknie",
  "placementTab": "Jako karta",
  "defaultTab": "Otwiera się na",
  "shortcutViews": "Karta 1–9 w kolejności"
})
addCatalogEntries("it", {
  "airTab": "Aria",
  "tabs": "Schede",
  "tabsHint": "Le sezioni «come scheda» condividono una barra, nel loro ordine. I tasti 1–9 le scelgono allo stesso modo.",
  "showAs": "Mostra",
  "placementWindow": "Nella finestra",
  "placementTab": "Come scheda",
  "defaultTab": "Apre su",
  "shortcutViews": "Scheda 1–9 nel loro ordine"
})
addCatalogEntries("nl", {
  "airTab": "Lucht",
  "tabs": "Tabbladen",
  "tabsHint": "Secties „als tabblad” delen één balk, in hun volgorde. De toetsen 1–9 kiezen ze net zo.",
  "showAs": "Tonen",
  "placementWindow": "In venster",
  "placementTab": "Als tabblad",
  "defaultTab": "Opent op",
  "shortcutViews": "Tabblad 1–9 in volgorde"
})
addCatalogEntries("tr", {
  "airTab": "Hava",
  "tabs": "Sekmeler",
  "tabsHint": "“Sekme olarak” bölümler sıralarıyla tek bir çubuğu paylaşır. 1–9 tuşları onları aynı şekilde seçer.",
  "showAs": "Göster",
  "placementWindow": "Pencerede",
  "placementTab": "Sekme olarak",
  "defaultTab": "Açılış",
  "shortcutViews": "Sekme 1–9 sırayla"
})
addCatalogEntries("cs", {
  "airTab": "Vzduch",
  "tabs": "Karty",
  "tabsHint": "Sekce „jako karta“ sdílejí jednu lištu ve svém pořadí. Klávesy 1–9 je vybírají stejně.",
  "showAs": "Zobrazit",
  "placementWindow": "V okně",
  "placementTab": "Jako karta",
  "defaultTab": "Otevře se na",
  "shortcutViews": "Karta 1–9 v pořadí"
})
addCatalogEntries("sv", {
  "airTab": "Luft",
  "tabs": "Flikar",
  "tabsHint": "Avsnitt ”som flik” delar en list, i sin ordning. Tangenterna 1–9 väljer dem likadant.",
  "showAs": "Visa",
  "placementWindow": "I fönstret",
  "placementTab": "Som flik",
  "defaultTab": "Öppnas på",
  "shortcutViews": "Flik 1–9 i ordning"
})
addCatalogEntries("fi", {
  "airTab": "Ilma",
  "tabs": "Välilehdet",
  "tabsHint": "”Välilehtenä” näytettävät osiot jakavat yhden palkin järjestyksessään. Näppäimet 1–9 valitsevat ne samoin.",
  "showAs": "Näytä",
  "placementWindow": "Ikkunassa",
  "placementTab": "Välilehtenä",
  "defaultTab": "Avautuu",
  "shortcutViews": "Välilehti 1–9 järjestyksessä"
})
addCatalogEntries("nb", {
  "airTab": "Luft",
  "tabs": "Faner",
  "tabsHint": "Seksjoner «som fane» deler én linje, i sin rekkefølge. Tastene 1–9 velger dem på samme måte.",
  "showAs": "Vis",
  "placementWindow": "I vinduet",
  "placementTab": "Som fane",
  "defaultTab": "Åpner på",
  "shortcutViews": "Fane 1–9 i rekkefølge"
})
addCatalogEntries("da", {
  "airTab": "Luft",
  "tabs": "Faner",
  "tabsHint": "Sektioner »som fane« deler én bjælke, i deres rækkefølge. Tasterne 1–9 vælger dem på samme måde.",
  "showAs": "Vis",
  "placementWindow": "I vinduet",
  "placementTab": "Som fane",
  "defaultTab": "Åbner på",
  "shortcutViews": "Fane 1–9 i rækkefølge"
})
addCatalogEntries("ro", {
  "airTab": "Aer",
  "tabs": "File",
  "tabsHint": "Secțiunile „ca filă” împart o bară, în ordinea lor. Tastele 1–9 le aleg la fel.",
  "showAs": "Afișare",
  "placementWindow": "În fereastră",
  "placementTab": "Ca filă",
  "defaultTab": "Se deschide pe",
  "shortcutViews": "Fila 1–9 în ordine"
})
addCatalogEntries("hu", {
  "airTab": "Levegő",
  "tabs": "Lapok",
  "tabsHint": "A „lapként” megjelenő részek egy sávon osztoznak, sorrendjükben. Az 1–9 billentyűk ugyanígy választanak.",
  "showAs": "Megjelenítés",
  "placementWindow": "Az ablakban",
  "placementTab": "Lapként",
  "defaultTab": "Nyitáskor",
  "shortcutViews": "1–9. lap sorrendben"
})
addCatalogEntries("el", {
  "airTab": "Αέρας",
  "tabs": "Καρτέλες",
  "tabsHint": "Οι ενότητες «ως καρτέλα» μοιράζονται μία γραμμή, με τη σειρά τους. Τα πλήκτρα 1–9 τις επιλέγουν το ίδιο.",
  "showAs": "Εμφάνιση",
  "placementWindow": "Στο παράθυρο",
  "placementTab": "Ως καρτέλα",
  "defaultTab": "Ανοίγει σε",
  "shortcutViews": "Καρτέλα 1–9 με τη σειρά"
})
addCatalogEntries("zh_CN", {
  "airTab": "空气",
  "tabs": "标签页",
  "tabsHint": "设为“标签页”的栏目按顺序共用一个标签栏，按键 1–9 同样依次选择。",
  "showAs": "显示",
  "placementWindow": "在窗口中",
  "placementTab": "作为标签页",
  "defaultTab": "打开时显示",
  "shortcutViews": "按顺序切换标签页 1–9"
})
addCatalogEntries("zh_TW", {
  "airTab": "空氣",
  "tabs": "分頁",
  "tabsHint": "設為「分頁」的欄目依順序共用一個分頁列，按鍵 1–9 同樣依序選擇。",
  "showAs": "顯示",
  "placementWindow": "在視窗中",
  "placementTab": "作為分頁",
  "defaultTab": "開啟時顯示",
  "shortcutViews": "依順序切換分頁 1–9"
})
addCatalogEntries("ja", {
  "airTab": "大気",
  "tabs": "タブ",
  "tabsHint": "「タブ」に設定したセクションは順番どおり1つのタブバーを共有します。1–9キーも同じ順で選びます。",
  "showAs": "表示",
  "placementWindow": "ウィンドウ内",
  "placementTab": "タブ",
  "defaultTab": "最初に開く",
  "shortcutViews": "タブ 1–9（並び順）"
})
addCatalogEntries("ko", {
  "airTab": "공기",
  "tabs": "탭",
  "tabsHint": "‘탭’으로 설정한 섹션은 순서대로 하나의 탭 막대를 공유합니다. 1–9 키도 같은 순서로 선택합니다.",
  "showAs": "표시",
  "placementWindow": "창에",
  "placementTab": "탭으로",
  "defaultTab": "처음 열 탭",
  "shortcutViews": "순서대로 탭 1–9"
})
addCatalogEntries("ar", {
  "airTab": "الهواء",
  "tabs": "علامات التبويب",
  "tabsHint": "الأقسام المعروضة «كعلامة تبويب» تتشارك شريطًا واحدًا بترتيبها. المفاتيح 1–9 تختارها بالطريقة نفسها.",
  "showAs": "العرض",
  "placementWindow": "في النافذة",
  "placementTab": "كعلامة تبويب",
  "defaultTab": "يفتح على",
  "shortcutViews": "علامة التبويب 1–9 بالترتيب"
})
addCatalogEntries("he", {
  "airTab": "אוויר",
  "tabs": "לשוניות",
  "tabsHint": "מקטעים „כלשונית” חולקים סרגל אחד, לפי הסדר שלהם. המקשים 1–9 בוחרים בהם באותו אופן.",
  "showAs": "הצגה",
  "placementWindow": "בחלון",
  "placementTab": "כלשונית",
  "defaultTab": "נפתח על",
  "shortcutViews": "לשונית 1–9 לפי הסדר"
})
addCatalogEntries("fa", {
  "airTab": "هوا",
  "tabs": "زبانه‌ها",
  "tabsHint": "بخش‌های «به‌صورت زبانه» به ترتیب خود یک نوار مشترک دارند. کلیدهای ۱–۹ آن‌ها را به همین ترتیب انتخاب می‌کنند.",
  "showAs": "نمایش",
  "placementWindow": "در پنجره",
  "placementTab": "به‌صورت زبانه",
  "defaultTab": "باز شدن با",
  "shortcutViews": "زبانهٔ ۱–۹ به ترتیب"
})
addCatalogEntries("hi", {
  "airTab": "हवा",
  "tabs": "टैब",
  "tabsHint": "“टैब के रूप में” सेट किए गए अनुभाग अपने क्रम में एक पट्टी साझा करते हैं। कुंजियाँ 1–9 उन्हें उसी तरह चुनती हैं।",
  "showAs": "दिखाएँ",
  "placementWindow": "विंडो में",
  "placementTab": "टैब के रूप में",
  "defaultTab": "इससे खुलता है",
  "shortcutViews": "क्रम में टैब 1–9"
})
addCatalogEntries("id", {
  "airTab": "Udara",
  "tabs": "Tab",
  "tabsHint": "Bagian “sebagai tab” berbagi satu bilah, sesuai urutannya. Tombol 1–9 memilihnya dengan cara yang sama.",
  "showAs": "Tampilkan",
  "placementWindow": "Di jendela",
  "placementTab": "Sebagai tab",
  "defaultTab": "Dibuka di",
  "shortcutViews": "Tab 1–9 sesuai urutan"
})
addCatalogEntries("vi", {
  "airTab": "Không khí",
  "tabs": "Thẻ",
  "tabsHint": "Các mục “dạng thẻ” dùng chung một thanh theo thứ tự của chúng. Phím 1–9 chọn chúng theo cách tương tự.",
  "showAs": "Hiển thị",
  "placementWindow": "Trong cửa sổ",
  "placementTab": "Dạng thẻ",
  "defaultTab": "Mở ở",
  "shortcutViews": "Thẻ 1–9 theo thứ tự"
})
addCatalogEntries("th", {
  "airTab": "อากาศ",
  "tabs": "แท็บ",
  "tabsHint": "ส่วนที่ตั้งเป็น “แท็บ” ใช้แถบเดียวกันตามลำดับ ปุ่ม 1–9 เลือกได้เช่นเดียวกัน",
  "showAs": "แสดง",
  "placementWindow": "ในหน้าต่าง",
  "placementTab": "เป็นแท็บ",
  "defaultTab": "เปิดที่",
  "shortcutViews": "แท็บ 1–9 ตามลำดับ"
})

// Movable current weather, section explanations (2.5).
addCatalogEntries("en", {
  "displaySettingsHint": "Choose what the selected view shows; the arrows set the order.",
  "displaySectionsHint": "Each section appears in the window or as a tab. Tabs share one strip where the first tabbed section stands.",
  "currentWeatherHint": "Always shown, in the window: it holds the place, refresh and settings. Warnings appear right below it.",
  "shortcutsGroupForecast": "TABS & MAPS"
})
addCatalogEntries("de", {
  "displaySettingsHint": "Lege fest, was die ausgewählte Ansicht zeigt; die Pfeile bestimmen die Reihenfolge.",
  "displaySectionsHint": "Jede Rubrik erscheint im Fenster oder als Tab. Tabs teilen sich eine Leiste an der Stelle der ersten Tab-Rubrik.",
  "currentWeatherHint": "Immer sichtbar, im Fenster: Hier liegen Ort, Aktualisieren und Einstellungen. Warnungen erscheinen direkt darunter.",
  "shortcutsGroupForecast": "TABS & KARTEN"
})
addCatalogEntries("es", {
  "displaySettingsHint": "Elige qué muestra la vista seleccionada; las flechas fijan el orden.",
  "displaySectionsHint": "Cada sección aparece en la ventana o como pestaña. Las pestañas comparten una barra donde está la primera sección en pestaña.",
  "currentWeatherHint": "Siempre visible, en la ventana: contiene el lugar, la actualización y los ajustes. Los avisos aparecen justo debajo.",
  "shortcutsGroupForecast": "PESTAÑAS Y MAPAS"
})
addCatalogEntries("fr", {
  "displaySettingsHint": "Choisissez ce qu’affiche la vue sélectionnée ; les flèches fixent l’ordre.",
  "displaySectionsHint": "Chaque section s’affiche dans la fenêtre ou en onglet. Les onglets partagent une barre à la place de la première section en onglet.",
  "currentWeatherHint": "Toujours affiché, dans la fenêtre : il contient le lieu, l’actualisation et les réglages. Les alertes apparaissent juste en dessous.",
  "shortcutsGroupForecast": "ONGLETS ET CARTES"
})
addCatalogEntries("pt", {
  "displaySettingsHint": "Escolha o que a visualização selecionada mostra; as setas definem a ordem.",
  "displaySectionsHint": "Cada seção aparece na janela ou como aba. As abas compartilham uma barra onde fica a primeira seção em aba.",
  "currentWeatherHint": "Sempre visível, na janela: contém o local, a atualização e as configurações. Os alertas aparecem logo abaixo.",
  "shortcutsGroupForecast": "ABAS E MAPAS"
})
addCatalogEntries("ru", {
  "displaySettingsHint": "Выберите, что показывает выбранный вид; стрелки задают порядок.",
  "displaySectionsHint": "Каждый раздел показывается в окне или вкладкой. Вкладки делят одну панель на месте первого раздела-вкладки.",
  "currentWeatherHint": "Всегда видно, в окне: здесь место, обновление и настройки. Предупреждения — сразу под ним.",
  "shortcutsGroupForecast": "ВКЛАДКИ И КАРТЫ"
})
addCatalogEntries("uk", {
  "displaySettingsHint": "Виберіть, що показує вибраний вигляд; стрілки задають порядок.",
  "displaySectionsHint": "Кожен розділ показується у вікні або вкладкою. Вкладки ділять одну панель на місці першого розділу-вкладки.",
  "currentWeatherHint": "Завжди видно, у вікні: тут місце, оновлення та налаштування. Попередження — одразу під ним.",
  "shortcutsGroupForecast": "ВКЛАДКИ Й МАПИ"
})
addCatalogEntries("pl", {
  "displaySettingsHint": "Wybierz, co pokazuje wybrany widok; strzałki ustalają kolejność.",
  "displaySectionsHint": "Każda sekcja pojawia się w oknie lub jako karta. Karty dzielą jeden pasek w miejscu pierwszej sekcji jako karta.",
  "currentWeatherHint": "Zawsze widoczne, w oknie: zawiera miejsce, odświeżanie i ustawienia. Ostrzeżenia pojawiają się tuż pod nim.",
  "shortcutsGroupForecast": "KARTY I MAPY"
})
addCatalogEntries("it", {
  "displaySettingsHint": "Scegli cosa mostra la vista selezionata; le frecce fissano l’ordine.",
  "displaySectionsHint": "Ogni sezione appare nella finestra o come scheda. Le schede condividono una barra dove sta la prima sezione a scheda.",
  "currentWeatherHint": "Sempre visibile, nella finestra: contiene il luogo, l’aggiornamento e le impostazioni. Gli avvisi compaiono subito sotto.",
  "shortcutsGroupForecast": "SCHEDE E MAPPE"
})
addCatalogEntries("nl", {
  "displaySettingsHint": "Kies wat de gekozen weergave toont; de pijlen bepalen de volgorde.",
  "displaySectionsHint": "Elke sectie verschijnt in het venster of als tabblad. Tabbladen delen één balk op de plek van de eerste sectie als tabblad.",
  "currentWeatherHint": "Altijd zichtbaar, in het venster: hier staan plaats, verversen en instellingen. Waarschuwingen staan er direct onder.",
  "shortcutsGroupForecast": "TABBLADEN & KAARTEN"
})
addCatalogEntries("tr", {
  "displaySettingsHint": "Seçili görünümün neyi gösterdiğini seçin; oklar sırayı belirler.",
  "displaySectionsHint": "Her bölüm pencerede ya da sekme olarak görünür. Sekmeler, ilk sekme bölümünün yerinde tek bir çubuğu paylaşır.",
  "currentWeatherHint": "Her zaman görünür, pencerede: konum, yenileme ve ayarlar buradadır. Uyarılar hemen altında görünür.",
  "shortcutsGroupForecast": "SEKMELER VE HARİTALAR"
})
addCatalogEntries("cs", {
  "displaySettingsHint": "Vyberte, co zvolený pohled ukazuje; šipky určují pořadí.",
  "displaySectionsHint": "Každá sekce se zobrazí v okně nebo jako karta. Karty sdílejí jednu lištu v místě první sekce jako karta.",
  "currentWeatherHint": "Vždy viditelné, v okně: obsahuje místo, obnovení a nastavení. Výstrahy jsou hned pod ním.",
  "shortcutsGroupForecast": "KARTY A MAPY"
})
addCatalogEntries("sv", {
  "displaySettingsHint": "Välj vad den valda vyn visar; pilarna bestämmer ordningen.",
  "displaySectionsHint": "Varje avsnitt visas i fönstret eller som flik. Flikarna delar en list där det första flikavsnittet står.",
  "currentWeatherHint": "Alltid synligt, i fönstret: här finns plats, uppdatering och inställningar. Varningar visas direkt under.",
  "shortcutsGroupForecast": "FLIKAR & KARTOR"
})
addCatalogEntries("fi", {
  "displaySettingsHint": "Valitse, mitä valittu näkymä näyttää; nuolet määräävät järjestyksen.",
  "displaySectionsHint": "Jokainen osio näkyy ikkunassa tai välilehtenä. Välilehdet jakavat yhden palkin ensimmäisen välilehtiosion kohdalla.",
  "currentWeatherHint": "Aina näkyvissä, ikkunassa: siinä ovat paikka, päivitys ja asetukset. Varoitukset näkyvät heti sen alla.",
  "shortcutsGroupForecast": "VÄLILEHDET JA KARTAT"
})
addCatalogEntries("nb", {
  "displaySettingsHint": "Velg hva den valgte visningen viser; pilene bestemmer rekkefølgen.",
  "displaySectionsHint": "Hver seksjon vises i vinduet eller som fane. Fanene deler én linje der den første faneseksjonen står.",
  "currentWeatherHint": "Alltid synlig, i vinduet: her er sted, oppdatering og innstillinger. Farevarsler vises rett under.",
  "shortcutsGroupForecast": "FANER OG KART"
})
addCatalogEntries("da", {
  "displaySettingsHint": "Vælg, hvad den valgte visning viser; pilene bestemmer rækkefølgen.",
  "displaySectionsHint": "Hver sektion vises i vinduet eller som fane. Fanerne deler én bjælke, hvor den første fanesektion står.",
  "currentWeatherHint": "Altid synlig, i vinduet: her er sted, opdatering og indstillinger. Varsler vises lige nedenunder.",
  "shortcutsGroupForecast": "FANER OG KORT"
})
addCatalogEntries("ro", {
  "displaySettingsHint": "Alege ce arată vizualizarea selectată; săgețile stabilesc ordinea.",
  "displaySectionsHint": "Fiecare secțiune apare în fereastră sau ca filă. Filele împart o bară în locul primei secțiuni ca filă.",
  "currentWeatherHint": "Mereu vizibil, în fereastră: conține locul, actualizarea și setările. Avertizările apar imediat dedesubt.",
  "shortcutsGroupForecast": "FILE ȘI HĂRȚI"
})
addCatalogEntries("hu", {
  "displaySettingsHint": "Válaszd ki, mit mutat a kijelölt nézet; a nyilak adják a sorrendet.",
  "displaySectionsHint": "Minden rész az ablakban vagy lapként jelenik meg. A lapok egy sávon osztoznak az első lapként megjelenő rész helyén.",
  "currentWeatherHint": "Mindig látható, az ablakban: itt van a hely, a frissítés és a beállítások. A figyelmeztetések közvetlenül alatta jelennek meg.",
  "shortcutsGroupForecast": "LAPOK ÉS TÉRKÉPEK"
})
addCatalogEntries("el", {
  "displaySettingsHint": "Επιλέξτε τι δείχνει η επιλεγμένη προβολή· τα βέλη ορίζουν τη σειρά.",
  "displaySectionsHint": "Κάθε ενότητα εμφανίζεται στο παράθυρο ή ως καρτέλα. Οι καρτέλες μοιράζονται μία γραμμή στη θέση της πρώτης ενότητας-καρτέλας.",
  "currentWeatherHint": "Πάντα ορατό, στο παράθυρο: περιέχει τοποθεσία, ανανέωση και ρυθμίσεις. Οι προειδοποιήσεις εμφανίζονται ακριβώς από κάτω.",
  "shortcutsGroupForecast": "ΚΑΡΤΕΛΕΣ ΚΑΙ ΧΑΡΤΕΣ"
})
addCatalogEntries("zh_CN", {
  "displaySettingsHint": "选择所选视图显示的内容；箭头调整顺序。",
  "displaySectionsHint": "每个栏目可显示在窗口中或作为标签页。标签页共用一个标签栏，位于第一个标签页栏目处。",
  "currentWeatherHint": "始终显示在窗口中：包含地点、刷新和设置。预警紧随其下。",
  "shortcutsGroupForecast": "标签页与地图"
})
addCatalogEntries("zh_TW", {
  "displaySettingsHint": "選擇所選檢視顯示的內容；箭頭調整順序。",
  "displaySectionsHint": "每個欄目可顯示在視窗中或作為分頁。分頁共用一個分頁列，位於第一個分頁欄目處。",
  "currentWeatherHint": "一律顯示在視窗中：包含地點、重新整理和設定。警報緊接其下。",
  "shortcutsGroupForecast": "分頁與地圖"
})
addCatalogEntries("ja", {
  "displaySettingsHint": "選択したビューに表示する内容を選びます。矢印で順番を変えられます。",
  "displaySectionsHint": "各セクションはウィンドウ内またはタブとして表示されます。タブは最初のタブセクションの位置で1つのタブバーを共有します。",
  "currentWeatherHint": "常にウィンドウ内に表示：場所、更新、設定があります。警報はそのすぐ下に表示されます。",
  "shortcutsGroupForecast": "タブと地図"
})
addCatalogEntries("ko", {
  "displaySettingsHint": "선택한 보기에 표시할 항목을 고릅니다. 화살표로 순서를 정합니다.",
  "displaySectionsHint": "각 섹션은 창 안이나 탭으로 표시됩니다. 탭은 첫 번째 탭 섹션 자리에서 하나의 탭 막대를 공유합니다.",
  "currentWeatherHint": "항상 창 안에 표시: 위치, 새로 고침, 설정이 있습니다. 경보는 바로 아래에 표시됩니다.",
  "shortcutsGroupForecast": "탭 및 지도"
})
addCatalogEntries("ar", {
  "displaySettingsHint": "اختر ما يعرضه العرض المحدد؛ الأسهم تحدد الترتيب.",
  "displaySectionsHint": "يظهر كل قسم في النافذة أو كعلامة تبويب. تتشارك علامات التبويب شريطًا واحدًا في مكان أول قسم معروض كعلامة تبويب.",
  "currentWeatherHint": "يظهر دائمًا في النافذة: يضم الموقع والتحديث والإعدادات. تظهر التحذيرات أسفله مباشرة.",
  "shortcutsGroupForecast": "علامات التبويب والخرائط"
})
addCatalogEntries("he", {
  "displaySettingsHint": "בחרו מה התצוגה הנבחרת מציגה; החצים קובעים את הסדר.",
  "displaySectionsHint": "כל מקטע מוצג בחלון או כלשונית. הלשוניות חולקות סרגל אחד במקום המקטע הראשון שמוצג כלשונית.",
  "currentWeatherHint": "תמיד מוצג, בחלון: כולל מיקום, רענון והגדרות. האזהרות מופיעות מיד מתחתיו.",
  "shortcutsGroupForecast": "לשוניות ומפות"
})
addCatalogEntries("fa", {
  "displaySettingsHint": "انتخاب کنید نمای انتخاب‌شده چه چیزی نشان دهد؛ پیکان‌ها ترتیب را تعیین می‌کنند.",
  "displaySectionsHint": "هر بخش در پنجره یا به‌صورت زبانه نمایش داده می‌شود. زبانه‌ها یک نوار مشترک در جای نخستین بخش زبانه‌ای دارند.",
  "currentWeatherHint": "همیشه در پنجره نمایش داده می‌شود: مکان، به‌روزرسانی و تنظیمات اینجاست. هشدارها درست زیر آن می‌آیند.",
  "shortcutsGroupForecast": "زبانه‌ها و نقشه‌ها"
})
addCatalogEntries("hi", {
  "displaySettingsHint": "चुनें कि चयनित दृश्य क्या दिखाए; तीर क्रम तय करते हैं।",
  "displaySectionsHint": "हर अनुभाग विंडो में या टैब के रूप में दिखता है। टैब पहले टैब-अनुभाग की जगह एक पट्टी साझा करते हैं।",
  "currentWeatherHint": "हमेशा विंडो में दिखता है: इसमें स्थान, रीफ़्रेश और सेटिंग्स हैं। चेतावनियाँ ठीक इसके नीचे दिखती हैं।",
  "shortcutsGroupForecast": "टैब और मानचित्र"
})
addCatalogEntries("id", {
  "displaySettingsHint": "Pilih apa yang ditampilkan tampilan terpilih; panah menentukan urutan.",
  "displaySectionsHint": "Setiap bagian tampil di jendela atau sebagai tab. Tab berbagi satu bilah di tempat bagian tab pertama.",
  "currentWeatherHint": "Selalu tampil, di jendela: berisi lokasi, penyegaran, dan pengaturan. Peringatan muncul tepat di bawahnya.",
  "shortcutsGroupForecast": "TAB & PETA"
})
addCatalogEntries("vi", {
  "displaySettingsHint": "Chọn nội dung chế độ xem đã chọn hiển thị; mũi tên đặt thứ tự.",
  "displaySectionsHint": "Mỗi mục hiển thị trong cửa sổ hoặc dạng thẻ. Các thẻ dùng chung một thanh tại vị trí của mục dạng thẻ đầu tiên.",
  "currentWeatherHint": "Luôn hiển thị trong cửa sổ: chứa địa điểm, làm mới và cài đặt. Cảnh báo hiện ngay bên dưới.",
  "shortcutsGroupForecast": "THẺ & BẢN ĐỒ"
})
addCatalogEntries("th", {
  "displaySettingsHint": "เลือกสิ่งที่มุมมองที่เลือกแสดง ลูกศรใช้กำหนดลำดับ",
  "displaySectionsHint": "แต่ละส่วนแสดงในหน้าต่างหรือเป็นแท็บ แท็บใช้แถบเดียวกันที่ตำแหน่งของส่วนแท็บแรก",
  "currentWeatherHint": "แสดงในหน้าต่างเสมอ: มีตำแหน่ง รีเฟรช และการตั้งค่า คำเตือนแสดงอยู่ด้านล่างทันที",
  "shortcutsGroupForecast": "แท็บและแผนที่"
})

// Settings by keyboard (2.5).
addCatalogEntries("en", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab switch pages · Esc closes",
  "settingsKeysHint": "Keyboard: 1–3 pick the view · ↑↓ go to a setting · ←→ change it or pick the column · Space switches · ⇧↑↓ moves the entry",
  "shortcutSettingsSurface": "Menu bar / widget / app settings",
  "shortcutSettingsMove": "Previous / next setting",
  "shortcutSettingsChange": "Change the value or pick the switch column",
  "shortcutSettingsToggle": "Switch, open the list or press the button",
  "shortcutSettingsReorder": "Move the entry up / down"
})
addCatalogEntries("de", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab wechseln die Seite · Esc schließt",
  "settingsKeysHint": "Tastatur: 1–3 wählen die Ansicht · ↑↓ zur Einstellung · ←→ ändern oder Spalte wählen · Leertaste schaltet · ⇧↑↓ verschiebt den Eintrag",
  "shortcutSettingsSurface": "Einstellungen für Menüleiste / Widget / App",
  "shortcutSettingsMove": "Vorherige / nächste Einstellung",
  "shortcutSettingsChange": "Wert ändern oder Schalterspalte wählen",
  "shortcutSettingsToggle": "Umschalten, Liste öffnen oder Knopf drücken",
  "shortcutSettingsReorder": "Eintrag nach oben / unten verschieben"
})
addCatalogEntries("es", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab cambian de página · Esc cierra",
  "settingsKeysHint": "Teclado: 1–3 eligen la vista · ↑↓ ir a un ajuste · ←→ cambiarlo o elegir la columna · Espacio conmuta · ⇧↑↓ mueve la entrada",
  "shortcutSettingsSurface": "Ajustes de barra / widget / aplicación",
  "shortcutSettingsMove": "Ajuste anterior / siguiente",
  "shortcutSettingsChange": "Cambiar el valor o elegir la columna",
  "shortcutSettingsToggle": "Conmutar, abrir la lista o pulsar el botón",
  "shortcutSettingsReorder": "Mover la entrada arriba / abajo"
})
addCatalogEntries("fr", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab changent de page · Échap ferme",
  "settingsKeysHint": "Clavier : 1–3 choisissent la vue · ↑↓ vers un réglage · ←→ le modifient ou choisissent la colonne · Espace bascule · ⇧↑↓ déplace l’entrée",
  "shortcutSettingsSurface": "Réglages barre / widget / application",
  "shortcutSettingsMove": "Réglage précédent / suivant",
  "shortcutSettingsChange": "Modifier la valeur ou choisir la colonne",
  "shortcutSettingsToggle": "Basculer, ouvrir la liste ou appuyer sur le bouton",
  "shortcutSettingsReorder": "Déplacer l’entrée vers le haut / bas"
})
addCatalogEntries("pt", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab mudam de página · Esc fecha",
  "settingsKeysHint": "Teclado: 1–3 escolhem a visualização · ↑↓ ir a uma opção · ←→ alterá-la ou escolher a coluna · Espaço alterna · ⇧↑↓ move a entrada",
  "shortcutSettingsSurface": "Configurações de barra / widget / app",
  "shortcutSettingsMove": "Opção anterior / seguinte",
  "shortcutSettingsChange": "Alterar o valor ou escolher a coluna",
  "shortcutSettingsToggle": "Alternar, abrir a lista ou apertar o botão",
  "shortcutSettingsReorder": "Mover a entrada para cima / baixo"
})
addCatalogEntries("ru", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab — смена страницы · Esc — закрыть",
  "settingsKeysHint": "Клавиатура: 1–3 — вид · ↑↓ — к настройке · ←→ — изменить или выбрать столбец · Пробел — переключить · ⇧↑↓ — переместить",
  "shortcutSettingsSurface": "Настройки панели / виджета / приложения",
  "shortcutSettingsMove": "Предыдущая / следующая настройка",
  "shortcutSettingsChange": "Изменить значение или выбрать столбец",
  "shortcutSettingsToggle": "Переключить, открыть список или нажать кнопку",
  "shortcutSettingsReorder": "Переместить пункт вверх / вниз"
})
addCatalogEntries("uk", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab — зміна сторінки · Esc — закрити",
  "settingsKeysHint": "Клавіатура: 1–3 — вигляд · ↑↓ — до налаштування · ←→ — змінити або вибрати стовпець · Пробіл — перемкнути · ⇧↑↓ — перемістити",
  "shortcutSettingsSurface": "Налаштування панелі / віджета / застосунку",
  "shortcutSettingsMove": "Попереднє / наступне налаштування",
  "shortcutSettingsChange": "Змінити значення або вибрати стовпець",
  "shortcutSettingsToggle": "Перемкнути, відкрити список або натиснути кнопку",
  "shortcutSettingsReorder": "Перемістити пункт угору / вниз"
})
addCatalogEntries("pl", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab zmieniają stronę · Esc zamyka",
  "settingsKeysHint": "Klawiatura: 1–3 wybierają widok · ↑↓ do ustawienia · ←→ zmiana lub wybór kolumny · Spacja przełącza · ⇧↑↓ przesuwa wpis",
  "shortcutSettingsSurface": "Ustawienia paska / widżetu / aplikacji",
  "shortcutSettingsMove": "Poprzednie / następne ustawienie",
  "shortcutSettingsChange": "Zmień wartość lub wybierz kolumnę",
  "shortcutSettingsToggle": "Przełącz, otwórz listę lub naciśnij przycisk",
  "shortcutSettingsReorder": "Przesuń wpis w górę / w dół"
})
addCatalogEntries("it", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab cambiano pagina · Esc chiude",
  "settingsKeysHint": "Tastiera: 1–3 scelgono la vista · ↑↓ a un’impostazione · ←→ la cambiano o scelgono la colonna · Spazio commuta · ⇧↑↓ sposta la voce",
  "shortcutSettingsSurface": "Impostazioni barra / widget / app",
  "shortcutSettingsMove": "Impostazione precedente / successiva",
  "shortcutSettingsChange": "Cambia il valore o scegli la colonna",
  "shortcutSettingsToggle": "Commuta, apri l’elenco o premi il pulsante",
  "shortcutSettingsReorder": "Sposta la voce su / giù"
})
addCatalogEntries("nl", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab wisselen van pagina · Esc sluit",
  "settingsKeysHint": "Toetsenbord: 1–3 kiezen de weergave · ↑↓ naar een instelling · ←→ wijzigen of kolom kiezen · Spatie schakelt · ⇧↑↓ verplaatst het item",
  "shortcutSettingsSurface": "Instellingen balk / widget / app",
  "shortcutSettingsMove": "Vorige / volgende instelling",
  "shortcutSettingsChange": "Waarde wijzigen of kolom kiezen",
  "shortcutSettingsToggle": "Schakelen, lijst openen of knop indrukken",
  "shortcutSettingsReorder": "Item omhoog / omlaag verplaatsen"
})
addCatalogEntries("tr", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab sayfa değiştirir · Esc kapatır",
  "settingsKeysHint": "Klavye: 1–3 görünümü seçer · ↑↓ ayara gider · ←→ değiştirir veya sütun seçer · Boşluk açar/kapatır · ⇧↑↓ girdiyi taşır",
  "shortcutSettingsSurface": "Çubuk / widget / uygulama ayarları",
  "shortcutSettingsMove": "Önceki / sonraki ayar",
  "shortcutSettingsChange": "Değeri değiştir veya sütun seç",
  "shortcutSettingsToggle": "Aç/kapat, listeyi aç veya düğmeye bas",
  "shortcutSettingsReorder": "Girdiyi yukarı / aşağı taşı"
})
addCatalogEntries("cs", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab mění stránku · Esc zavře",
  "settingsKeysHint": "Klávesnice: 1–3 volí pohled · ↑↓ na nastavení · ←→ změna nebo volba sloupce · Mezerník přepíná · ⇧↑↓ přesouvá položku",
  "shortcutSettingsSurface": "Nastavení lišty / widgetu / aplikace",
  "shortcutSettingsMove": "Předchozí / další nastavení",
  "shortcutSettingsChange": "Změnit hodnotu nebo zvolit sloupec",
  "shortcutSettingsToggle": "Přepnout, otevřít seznam nebo stisknout tlačítko",
  "shortcutSettingsReorder": "Posunout položku nahoru / dolů"
})
addCatalogEntries("sv", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab byter sida · Esc stänger",
  "settingsKeysHint": "Tangentbord: 1–3 väljer vy · ↑↓ till en inställning · ←→ ändrar eller väljer kolumn · Mellanslag växlar · ⇧↑↓ flyttar posten",
  "shortcutSettingsSurface": "Inställningar för list / widget / app",
  "shortcutSettingsMove": "Föregående / nästa inställning",
  "shortcutSettingsChange": "Ändra värdet eller välj kolumn",
  "shortcutSettingsToggle": "Växla, öppna listan eller tryck på knappen",
  "shortcutSettingsReorder": "Flytta posten upp / ned"
})
addCatalogEntries("fi", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab vaihtavat sivua · Esc sulkee",
  "settingsKeysHint": "Näppäimistö: 1–3 valitsee näkymän · ↑↓ asetukseen · ←→ muuttaa tai valitsee sarakkeen · Välilyönti vaihtaa · ⇧↑↓ siirtää kohdetta",
  "shortcutSettingsSurface": "Palkin / pienoisohjelman / sovelluksen asetukset",
  "shortcutSettingsMove": "Edellinen / seuraava asetus",
  "shortcutSettingsChange": "Muuta arvoa tai valitse sarake",
  "shortcutSettingsToggle": "Vaihda, avaa luettelo tai paina painiketta",
  "shortcutSettingsReorder": "Siirrä kohdetta ylös / alas"
})
addCatalogEntries("nb", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab bytter side · Esc lukker",
  "settingsKeysHint": "Tastatur: 1–3 velger visning · ↑↓ til en innstilling · ←→ endrer eller velger kolonne · Mellomrom slår av/på · ⇧↑↓ flytter oppføringen",
  "shortcutSettingsSurface": "Innstillinger for linje / widget / app",
  "shortcutSettingsMove": "Forrige / neste innstilling",
  "shortcutSettingsChange": "Endre verdien eller velg kolonne",
  "shortcutSettingsToggle": "Slå av/på, åpne listen eller trykk på knappen",
  "shortcutSettingsReorder": "Flytt oppføringen opp / ned"
})
addCatalogEntries("da", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab skifter side · Esc lukker",
  "settingsKeysHint": "Tastatur: 1–3 vælger visning · ↑↓ til en indstilling · ←→ ændrer eller vælger kolonne · Mellemrum slår til/fra · ⇧↑↓ flytter posten",
  "shortcutSettingsSurface": "Indstillinger for bjælke / widget / app",
  "shortcutSettingsMove": "Forrige / næste indstilling",
  "shortcutSettingsChange": "Ændr værdien eller vælg kolonne",
  "shortcutSettingsToggle": "Slå til/fra, åbn listen eller tryk på knappen",
  "shortcutSettingsReorder": "Flyt posten op / ned"
})
addCatalogEntries("ro", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab schimbă pagina · Esc închide",
  "settingsKeysHint": "Tastatură: 1–3 aleg vizualizarea · ↑↓ la o setare · ←→ o modifică sau aleg coloana · Spațiu comută · ⇧↑↓ mută intrarea",
  "shortcutSettingsSurface": "Setări bară / widget / aplicație",
  "shortcutSettingsMove": "Setarea anterioară / următoare",
  "shortcutSettingsChange": "Modifică valoarea sau alege coloana",
  "shortcutSettingsToggle": "Comută, deschide lista sau apasă butonul",
  "shortcutSettingsReorder": "Mută intrarea în sus / în jos"
})
addCatalogEntries("hu", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab lapoz · Esc bezár",
  "settingsKeysHint": "Billentyűzet: 1–3 nézetet választ · ↑↓ beállításhoz lép · ←→ módosít vagy oszlopot választ · Szóköz kapcsol · ⇧↑↓ mozgatja a tételt",
  "shortcutSettingsSurface": "Sáv / widget / alkalmazás beállításai",
  "shortcutSettingsMove": "Előző / következő beállítás",
  "shortcutSettingsChange": "Érték módosítása vagy oszlop választása",
  "shortcutSettingsToggle": "Kapcsolás, lista megnyitása vagy gomb megnyomása",
  "shortcutSettingsReorder": "Tétel mozgatása fel / le"
})
addCatalogEntries("el", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab αλλάζουν σελίδα · Esc κλείνει",
  "settingsKeysHint": "Πληκτρολόγιο: 1–3 επιλέγουν προβολή · ↑↓ σε ρύθμιση · ←→ αλλαγή ή επιλογή στήλης · Διάστημα εναλλάσσει · ⇧↑↓ μετακινεί την καταχώριση",
  "shortcutSettingsSurface": "Ρυθμίσεις γραμμής / widget / εφαρμογής",
  "shortcutSettingsMove": "Προηγούμενη / επόμενη ρύθμιση",
  "shortcutSettingsChange": "Αλλαγή τιμής ή επιλογή στήλης",
  "shortcutSettingsToggle": "Εναλλαγή, άνοιγμα λίστας ή πάτημα κουμπιού",
  "shortcutSettingsReorder": "Μετακίνηση καταχώρισης πάνω / κάτω"
})
addCatalogEntries("zh_CN", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab 切换页面 · Esc 关闭",
  "settingsKeysHint": "键盘：1–3 选择视图 · ↑↓ 移到设置项 · ←→ 更改或选择列 · 空格切换 · ⇧↑↓ 移动条目",
  "shortcutSettingsSurface": "菜单栏 / 小组件 / 应用设置",
  "shortcutSettingsMove": "上一个 / 下一个设置项",
  "shortcutSettingsChange": "更改数值或选择开关列",
  "shortcutSettingsToggle": "切换、打开列表或按下按钮",
  "shortcutSettingsReorder": "上移 / 下移条目"
})
addCatalogEntries("zh_TW", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab 切換頁面 · Esc 關閉",
  "settingsKeysHint": "鍵盤：1–3 選擇檢視 · ↑↓ 移到設定項 · ←→ 變更或選擇欄 · 空白鍵切換 · ⇧↑↓ 移動項目",
  "shortcutSettingsSurface": "選單列 / 小工具 / 應用程式設定",
  "shortcutSettingsMove": "上一個 / 下一個設定項",
  "shortcutSettingsChange": "變更數值或選擇開關欄",
  "shortcutSettingsToggle": "切換、開啟清單或按下按鈕",
  "shortcutSettingsReorder": "上移 / 下移項目"
})
addCatalogEntries("ja", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab でページ切替 · Esc で閉じる",
  "settingsKeysHint": "キーボード：1–3 で表示先を選択 · ↑↓ で設定へ移動 · ←→ で変更・列の選択 · Space で切替 · ⇧↑↓ で項目を移動",
  "shortcutSettingsSurface": "メニューバー / ウィジェット / アプリの設定",
  "shortcutSettingsMove": "前 / 次の設定",
  "shortcutSettingsChange": "値を変更、またはスイッチ列を選択",
  "shortcutSettingsToggle": "切替、リストを開く、またはボタンを押す",
  "shortcutSettingsReorder": "項目を上 / 下へ移動"
})
addCatalogEntries("ko", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab 페이지 전환 · Esc 닫기",
  "settingsKeysHint": "키보드: 1–3 보기 선택 · ↑↓ 설정으로 이동 · ←→ 변경 또는 열 선택 · Space 전환 · ⇧↑↓ 항목 이동",
  "shortcutSettingsSurface": "메뉴 막대 / 위젯 / 앱 설정",
  "shortcutSettingsMove": "이전 / 다음 설정",
  "shortcutSettingsChange": "값 변경 또는 스위치 열 선택",
  "shortcutSettingsToggle": "전환, 목록 열기 또는 버튼 누르기",
  "shortcutSettingsReorder": "항목을 위 / 아래로 이동"
})
addCatalogEntries("ar", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab لتبديل الصفحة · Esc للإغلاق",
  "settingsKeysHint": "لوحة المفاتيح: 1–3 لاختيار العرض · ↑↓ للانتقال إلى إعداد · ←→ للتغيير أو اختيار العمود · المسافة للتبديل · ⇧↑↓ لنقل العنصر",
  "shortcutSettingsSurface": "إعدادات الشريط / الأداة / التطبيق",
  "shortcutSettingsMove": "الإعداد السابق / التالي",
  "shortcutSettingsChange": "تغيير القيمة أو اختيار العمود",
  "shortcutSettingsToggle": "تبديل أو فتح القائمة أو ضغط الزر",
  "shortcutSettingsReorder": "نقل العنصر لأعلى / لأسفل"
})
addCatalogEntries("he", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab מחליפים עמוד · Esc סוגר",
  "settingsKeysHint": "מקלדת: 1–3 בוחרים תצוגה · ↑↓ להגדרה · ←→ שינוי או בחירת עמודה · רווח מחליף · ⇧↑↓ מזיז את הפריט",
  "shortcutSettingsSurface": "הגדרות סרגל / וידג׳ט / אפליקציה",
  "shortcutSettingsMove": "הגדרה קודמת / הבאה",
  "shortcutSettingsChange": "שינוי הערך או בחירת עמודה",
  "shortcutSettingsToggle": "החלפה, פתיחת רשימה או לחיצה על כפתור",
  "shortcutSettingsReorder": "הזזת הפריט למעלה / למטה"
})
addCatalogEntries("fa", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab صفحه را عوض می‌کنند · Esc می‌بندد",
  "settingsKeysHint": "صفحه‌کلید: ۱–۳ انتخاب نما · ↑↓ رفتن به تنظیم · ←→ تغییر یا انتخاب ستون · فاصله تغییر وضعیت · ⇧↑↓ جابه‌جایی مورد",
  "shortcutSettingsSurface": "تنظیمات نوار / ابزارک / برنامه",
  "shortcutSettingsMove": "تنظیم قبلی / بعدی",
  "shortcutSettingsChange": "تغییر مقدار یا انتخاب ستون",
  "shortcutSettingsToggle": "تغییر وضعیت، باز کردن فهرست یا زدن دکمه",
  "shortcutSettingsReorder": "جابه‌جایی مورد به بالا / پایین"
})
addCatalogEntries("hi", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab पेज बदलते हैं · Esc बंद करता है",
  "settingsKeysHint": "कीबोर्ड: 1–3 दृश्य चुनें · ↑↓ सेटिंग पर जाएँ · ←→ बदलें या कॉलम चुनें · Space टॉगल · ⇧↑↓ प्रविष्टि खिसकाएँ",
  "shortcutSettingsSurface": "मेनू बार / विजेट / ऐप सेटिंग्स",
  "shortcutSettingsMove": "पिछली / अगली सेटिंग",
  "shortcutSettingsChange": "मान बदलें या स्विच कॉलम चुनें",
  "shortcutSettingsToggle": "टॉगल करें, सूची खोलें या बटन दबाएँ",
  "shortcutSettingsReorder": "प्रविष्टि ऊपर / नीचे खिसकाएँ"
})
addCatalogEntries("id", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab ganti halaman · Esc menutup",
  "settingsKeysHint": "Keyboard: 1–3 pilih tampilan · ↑↓ ke pengaturan · ←→ ubah atau pilih kolom · Spasi mengalihkan · ⇧↑↓ memindahkan entri",
  "shortcutSettingsSurface": "Pengaturan bilah / widget / aplikasi",
  "shortcutSettingsMove": "Pengaturan sebelumnya / berikutnya",
  "shortcutSettingsChange": "Ubah nilai atau pilih kolom",
  "shortcutSettingsToggle": "Alihkan, buka daftar, atau tekan tombol",
  "shortcutSettingsReorder": "Pindahkan entri ke atas / bawah"
})
addCatalogEntries("vi", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab chuyển trang · Esc đóng",
  "settingsKeysHint": "Bàn phím: 1–3 chọn chế độ xem · ↑↓ tới cài đặt · ←→ thay đổi hoặc chọn cột · Space bật/tắt · ⇧↑↓ di chuyển mục",
  "shortcutSettingsSurface": "Cài đặt thanh / tiện ích / ứng dụng",
  "shortcutSettingsMove": "Cài đặt trước / sau",
  "shortcutSettingsChange": "Đổi giá trị hoặc chọn cột",
  "shortcutSettingsToggle": "Bật/tắt, mở danh sách hoặc nhấn nút",
  "shortcutSettingsReorder": "Di chuyển mục lên / xuống"
})
addCatalogEntries("th", {
  "settingsPagesKeysHint": "Tab / ⇧ Tab เปลี่ยนหน้า · Esc ปิด",
  "settingsKeysHint": "แป้นพิมพ์: 1–3 เลือกมุมมอง · ↑↓ ไปยังการตั้งค่า · ←→ เปลี่ยนค่าหรือเลือกคอลัมน์ · Space สลับ · ⇧↑↓ ย้ายรายการ",
  "shortcutSettingsSurface": "การตั้งค่าแถบ / วิดเจ็ต / แอป",
  "shortcutSettingsMove": "การตั้งค่าก่อนหน้า / ถัดไป",
  "shortcutSettingsChange": "เปลี่ยนค่าหรือเลือกคอลัมน์สวิตช์",
  "shortcutSettingsToggle": "สลับ เปิดรายการ หรือกดปุ่ม",
  "shortcutSettingsReorder": "ย้ายรายการขึ้น / ลง"
})

// Data sources added in 2.5 (MeteoSwiss, regional radar nowcasts, FMI radar,
// warnings for Australia, New Zealand and Japan): sentences and list entries
// added to the translated source texts rather than retranslating them.
function amendCatalogEntry(language, key, change) {
  var table = catalog[language]
  if (table && typeof table[key] === "string") table[key] = change(table[key])
}

var sourceAdditions = {
  "en": [
    "In Switzerland and Liechtenstein MeteoSwiss ICON-CH (1–2 km) leads for the first five days; Best Match covers the rest.",
    "Radar amounts also come from MET Norway's nowcast in Norway, Sweden, Finland and Denmark (every 5 minutes) and from GeoSphere Austria's INCA nowcast in Austria (1 km, every 15 minutes).",
    "Radar amounts also in NO, SE, FI, DK (MET Norway) and AT (GeoSphere Austria).",
    "Also the Australian Bureau of Meteorology (per state), New Zealand's MetService and the Japan Meteorological Agency (per municipality)."
  ],
  "de": [
    "In der Schweiz und in Liechtenstein führt MeteoSwiss ICON-CH (1–2 km) die ersten fünf Tage; Best Match deckt den Rest ab.",
    "Radarmengen kommen außerdem aus dem Nowcast von MET Norway in Norwegen, Schweden, Finnland und Dänemark (alle 5 Minuten) und aus dem INCA-Nowcast von GeoSphere Austria in Österreich (1 km, alle 15 Minuten).",
    "Radarmengen auch in NO, SE, FI, DK (MET Norway) und AT (GeoSphere Austria).",
    "Außerdem das australische Bureau of Meteorology (je Bundesstaat), MetService in Neuseeland und die Japan Meteorological Agency (je Gemeinde)."
  ],
  "es": [
    "En Suiza y Liechtenstein manda MeteoSwiss ICON-CH (1–2 km) los primeros cinco días; Best Match cubre el resto.",
    "Las cantidades de radar también proceden del nowcast de MET Norway en Noruega, Suecia, Finlandia y Dinamarca (cada 5 minutos) y del nowcast INCA de GeoSphere Austria en Austria (1 km, cada 15 minutos).",
    "Cantidades de radar también en NO, SE, FI, DK (MET Norway) y AT (GeoSphere Austria).",
    "También el Bureau of Meteorology de Australia (por estado), MetService de Nueva Zelanda y la Agencia Meteorológica de Japón (por municipio)."
  ],
  "fr": [
    "En Suisse et au Liechtenstein, MeteoSwiss ICON-CH (1–2 km) prime les cinq premiers jours ; Best Match couvre le reste.",
    "Les cumuls radar viennent aussi du nowcast de MET Norway en Norvège, Suède, Finlande et Danemark (toutes les 5 minutes) et du nowcast INCA de GeoSphere Austria en Autriche (1 km, toutes les 15 minutes).",
    "Cumuls radar aussi en NO, SE, FI, DK (MET Norway) et AT (GeoSphere Austria).",
    "Aussi le Bureau of Meteorology australien (par État), MetService en Nouvelle-Zélande et l’Agence météorologique du Japon (par commune)."
  ],
  "pt": [
    "Na Suíça e no Liechtenstein, o MeteoSwiss ICON-CH (1–2 km) lidera nos primeiros cinco dias; o Best Match cobre o resto.",
    "As quantidades de radar também vêm do nowcast do MET Norway na Noruega, Suécia, Finlândia e Dinamarca (a cada 5 minutos) e do nowcast INCA da GeoSphere Austria na Áustria (1 km, a cada 15 minutos).",
    "Quantidades de radar também em NO, SE, FI, DK (MET Norway) e AT (GeoSphere Austria).",
    "Também o Bureau of Meteorology da Austrália (por estado), a MetService da Nova Zelândia e a Agência Meteorológica do Japão (por município)."
  ],
  "ru": [
    "В Швейцарии и Лихтенштейне первые пять дней ведёт MeteoSwiss ICON-CH (1–2 км); остальное — Best Match.",
    "Радарные количества также берутся из наукаста MET Norway в Норвегии, Швеции, Финляндии и Дании (каждые 5 минут) и из наукаста INCA GeoSphere Austria в Австрии (1 км, каждые 15 минут).",
    "Радарные количества также в NO, SE, FI, DK (MET Norway) и AT (GeoSphere Austria).",
    "Также Бюро метеорологии Австралии (по штатам), MetService Новой Зеландии и Японское метеорологическое агентство (по муниципалитетам)."
  ],
  "uk": [
    "У Швейцарії та Ліхтенштейні перші п’ять днів веде MeteoSwiss ICON-CH (1–2 км); решту — Best Match.",
    "Радарні кількості також надходять із наукасту MET Norway у Норвегії, Швеції, Фінляндії та Данії (кожні 5 хвилин) і з наукасту INCA GeoSphere Austria в Австрії (1 км, кожні 15 хвилин).",
    "Радарні кількості також у NO, SE, FI, DK (MET Norway) і AT (GeoSphere Austria).",
    "Також Бюро метеорології Австралії (за штатами), MetService Нової Зеландії та Японське метеорологічне агентство (за муніципалітетами)."
  ],
  "pl": [
    "W Szwajcarii i Liechtensteinie przez pierwsze pięć dni prowadzi MeteoSwiss ICON-CH (1–2 km); resztę pokrywa Best Match.",
    "Ilości radarowe pochodzą też z nowcastu MET Norway w Norwegii, Szwecji, Finlandii i Danii (co 5 minut) oraz z nowcastu INCA GeoSphere Austria w Austrii (1 km, co 15 minut).",
    "Ilości radarowe także w NO, SE, FI, DK (MET Norway) i AT (GeoSphere Austria).",
    "Także australijskie Bureau of Meteorology (według stanów), MetService w Nowej Zelandii i Japońska Agencja Meteorologiczna (według gmin)."
  ],
  "it": [
    "In Svizzera e Liechtenstein MeteoSwiss ICON-CH (1–2 km) guida i primi cinque giorni; Best Match copre il resto.",
    "Le quantità radar provengono anche dal nowcast di MET Norway in Norvegia, Svezia, Finlandia e Danimarca (ogni 5 minuti) e dal nowcast INCA di GeoSphere Austria in Austria (1 km, ogni 15 minuti).",
    "Quantità radar anche in NO, SE, FI, DK (MET Norway) e AT (GeoSphere Austria).",
    "Anche il Bureau of Meteorology australiano (per stato), MetService in Nuova Zelanda e l’Agenzia meteorologica giapponese (per comune)."
  ],
  "nl": [
    "In Zwitserland en Liechtenstein leidt MeteoSwiss ICON-CH (1–2 km) de eerste vijf dagen; Best Match dekt de rest.",
    "Radarhoeveelheden komen ook uit de nowcast van MET Norway in Noorwegen, Zweden, Finland en Denemarken (elke 5 minuten) en uit de INCA-nowcast van GeoSphere Austria in Oostenrijk (1 km, elke 15 minuten).",
    "Radarhoeveelheden ook in NO, SE, FI, DK (MET Norway) en AT (GeoSphere Austria).",
    "Ook het Australische Bureau of Meteorology (per staat), MetService in Nieuw-Zeeland en het Japanse meteorologisch instituut (per gemeente)."
  ],
  "tr": [
    "İsviçre ve Lihtenştayn'da ilk beş gün MeteoSwiss ICON-CH (1–2 km) öncülük eder; gerisini Best Match kapsar.",
    "Radar miktarları ayrıca Norveç, İsveç, Finlandiya ve Danimarka'da MET Norway'in anlık tahmininden (5 dakikada bir) ve Avusturya'da GeoSphere Austria'nın INCA anlık tahmininden (1 km, 15 dakikada bir) gelir.",
    "Radar miktarları ayrıca NO, SE, FI, DK (MET Norway) ve AT (GeoSphere Austria) için.",
    "Ayrıca Avustralya Meteoroloji Bürosu (eyalet bazında), Yeni Zelanda MetService ve Japonya Meteoroloji Ajansı (belediye bazında)."
  ],
  "cs": [
    "Ve Švýcarsku a Lichtenštejnsku vede prvních pět dní MeteoSwiss ICON-CH (1–2 km); zbytek pokrývá Best Match.",
    "Radarové úhrny pocházejí také z nowcastu MET Norway v Norsku, Švédsku, Finsku a Dánsku (každých 5 minut) a z nowcastu INCA GeoSphere Austria v Rakousku (1 km, každých 15 minut).",
    "Radarové úhrny také v NO, SE, FI, DK (MET Norway) a AT (GeoSphere Austria).",
    "Také australský Bureau of Meteorology (po státech), novozélandská MetService a Japonská meteorologická agentura (po obcích)."
  ],
  "sv": [
    "I Schweiz och Liechtenstein leder MeteoSwiss ICON-CH (1–2 km) de första fem dagarna; Best Match täcker resten.",
    "Radarmängder kommer också från MET Norways nowcast i Norge, Sverige, Finland och Danmark (var 5:e minut) och från GeoSphere Austrias INCA-nowcast i Österrike (1 km, var 15:e minut).",
    "Radarmängder även i NO, SE, FI, DK (MET Norway) och AT (GeoSphere Austria).",
    "Även australiska Bureau of Meteorology (per delstat), Nya Zeelands MetService och Japans meteorologiska myndighet (per kommun)."
  ],
  "fi": [
    "Sveitsissä ja Liechtensteinissa MeteoSwiss ICON-CH (1–2 km) johtaa viisi ensimmäistä päivää; Best Match kattaa loput.",
    "Tutkamäärät tulevat myös MET Norwayn nowcastista Norjassa, Ruotsissa, Suomessa ja Tanskassa (5 minuutin välein) sekä GeoSphere Austrian INCA-nowcastista Itävallassa (1 km, 15 minuutin välein).",
    "Tutkamäärät myös NO, SE, FI, DK (MET Norway) ja AT (GeoSphere Austria).",
    "Lisäksi Australian Bureau of Meteorology (osavaltioittain), Uuden-Seelannin MetService ja Japanin ilmatieteen virasto (kunnittain)."
  ],
  "nb": [
    "I Sveits og Liechtenstein leder MeteoSwiss ICON-CH (1–2 km) de første fem dagene; Best Match dekker resten.",
    "Radarmengder kommer også fra MET Norways nowcast i Norge, Sverige, Finland og Danmark (hvert 5. minutt) og fra GeoSphere Austrias INCA-nowcast i Østerrike (1 km, hvert 15. minutt).",
    "Radarmengder også i NO, SE, FI, DK (MET Norway) og AT (GeoSphere Austria).",
    "Også australske Bureau of Meteorology (per delstat), New Zealands MetService og Japans meteorologiske byrå (per kommune)."
  ],
  "da": [
    "I Schweiz og Liechtenstein fører MeteoSwiss ICON-CH (1–2 km) de første fem dage; Best Match dækker resten.",
    "Radarmængder kommer også fra MET Norways nowcast i Norge, Sverige, Finland og Danmark (hvert 5. minut) og fra GeoSphere Austrias INCA-nowcast i Østrig (1 km, hvert 15. minut).",
    "Radarmængder også i NO, SE, FI, DK (MET Norway) og AT (GeoSphere Austria).",
    "Også australske Bureau of Meteorology (pr. delstat), New Zealands MetService og Japans meteorologiske institut (pr. kommune)."
  ],
  "ro": [
    "În Elveția și Liechtenstein, MeteoSwiss ICON-CH (1–2 km) conduce primele cinci zile; Best Match acoperă restul.",
    "Cantitățile radar provin și din nowcastul MET Norway în Norvegia, Suedia, Finlanda și Danemarca (la fiecare 5 minute) și din nowcastul INCA al GeoSphere Austria în Austria (1 km, la fiecare 15 minute).",
    "Cantități radar și în NO, SE, FI, DK (MET Norway) și AT (GeoSphere Austria).",
    "De asemenea Bureau of Meteorology din Australia (pe state), MetService din Noua Zeelandă și Agenția Meteorologică a Japoniei (pe municipii)."
  ],
  "hu": [
    "Svájcban és Liechtensteinben az első öt napban a MeteoSwiss ICON-CH (1–2 km) vezet; a többit a Best Match fedi le.",
    "A radaros mennyiségek a MET Norway nowcastjából is származnak Norvégiában, Svédországban, Finnországban és Dániában (5 percenként), valamint a GeoSphere Austria INCA nowcastjából Ausztriában (1 km, 15 percenként).",
    "Radaros mennyiségek NO, SE, FI, DK (MET Norway) és AT (GeoSphere Austria) területén is.",
    "Továbbá az ausztrál Bureau of Meteorology (államonként), az új-zélandi MetService és a Japán Meteorológiai Ügynökség (településenként)."
  ],
  "el": [
    "Στην Ελβετία και το Λιχτενστάιν προηγείται το MeteoSwiss ICON-CH (1–2 km) τις πρώτες πέντε ημέρες· το Best Match καλύπτει τις υπόλοιπες.",
    "Οι ποσότητες ραντάρ προέρχονται επίσης από το nowcast της MET Norway σε Νορβηγία, Σουηδία, Φινλανδία και Δανία (ανά 5 λεπτά) και από το nowcast INCA της GeoSphere Austria στην Αυστρία (1 km, ανά 15 λεπτά).",
    "Ποσότητες ραντάρ επίσης σε NO, SE, FI, DK (MET Norway) και AT (GeoSphere Austria).",
    "Επίσης το Bureau of Meteorology της Αυστραλίας (ανά πολιτεία), η MetService της Νέας Ζηλανδίας και η Μετεωρολογική Υπηρεσία της Ιαπωνίας (ανά δήμο)."
  ],
  "zh_CN": [
    "在瑞士和列支敦士登，前五天以 MeteoSwiss ICON-CH（1–2 公里）为主，其余由 Best Match 补足。",
    "雷达降水量还来自挪威、瑞典、芬兰和丹麦的 MET Norway 临近预报（每 5 分钟）以及奥地利的 GeoSphere Austria INCA 临近预报（1 公里，每 15 分钟）。",
    "雷达降水量也覆盖 NO、SE、FI、DK（MET Norway）和 AT（GeoSphere Austria）。",
    "另有澳大利亚气象局（按州）、新西兰 MetService 和日本气象厅（按市町村）。"
  ],
  "zh_TW": [
    "在瑞士和列支敦斯登，前五天以 MeteoSwiss ICON-CH（1–2 公里）為主，其餘由 Best Match 補足。",
    "雷達降水量也來自挪威、瑞典、芬蘭和丹麥的 MET Norway 即時預報（每 5 分鐘）以及奧地利的 GeoSphere Austria INCA 即時預報（1 公里，每 15 分鐘）。",
    "雷達降水量也涵蓋 NO、SE、FI、DK（MET Norway）和 AT（GeoSphere Austria）。",
    "另有澳洲氣象局（按州）、紐西蘭 MetService 和日本氣象廳（按市町村）。"
  ],
  "ja": [
    "スイスとリヒテンシュタインでは最初の5日間を MeteoSwiss ICON-CH（1–2 km）が担い、残りを Best Match が補います。",
    "レーダー雨量は、ノルウェー・スウェーデン・フィンランド・デンマークでは MET Norway のナウキャスト（5分ごと）、オーストリアでは GeoSphere Austria の INCA ナウキャスト（1 km、15分ごと）からも取得します。",
    "レーダー雨量は NO・SE・FI・DK（MET Norway）と AT（GeoSphere Austria）にも対応。",
    "ほかにオーストラリア気象局（州ごと）、ニュージーランドの MetService、気象庁（市町村ごと）。"
  ],
  "ko": [
    "스위스와 리히텐슈타인에서는 처음 5일 동안 MeteoSwiss ICON-CH(1–2 km)가 우선하고 나머지는 Best Match가 채웁니다.",
    "레이더 강수량은 노르웨이·스웨덴·핀란드·덴마크에서는 MET Norway 초단기 예보(5분마다), 오스트리아에서는 GeoSphere Austria INCA 초단기 예보(1 km, 15분마다)에서도 가져옵니다.",
    "레이더 강수량은 NO, SE, FI, DK(MET Norway)와 AT(GeoSphere Austria)에서도 제공됩니다.",
    "또한 호주 기상청(주별), 뉴질랜드 MetService, 일본 기상청(시정촌별)."
  ],
  "ar": [
    "في سويسرا وليختنشتاين يتصدر MeteoSwiss ICON-CH (1–2 كم) الأيام الخمسة الأولى، ويغطي Best Match الباقي.",
    "تأتي كميات الرادار أيضًا من التنبؤ الآني لـ MET Norway في النرويج والسويد وفنلندا والدنمارك (كل 5 دقائق) ومن تنبؤ INCA الآني لـ GeoSphere Austria في النمسا (1 كم، كل 15 دقيقة).",
    "كميات الرادار متاحة أيضًا في NO وSE وFI وDK (MET Norway) وAT (GeoSphere Austria).",
    "وكذلك مكتب الأرصاد الجوية الأسترالي (حسب الولاية) وMetService في نيوزيلندا ووكالة الأرصاد الجوية اليابانية (حسب البلدية)."
  ],
  "he": [
    "בשווייץ ובליכטנשטיין מוביל MeteoSwiss ICON-CH (1–2 ק״מ) בחמשת הימים הראשונים; Best Match משלים את השאר.",
    "כמויות המכ״ם מגיעות גם מתחזית ה-nowcast של MET Norway בנורווגיה, שוודיה, פינלנד ודנמרק (כל 5 דקות) ומתחזית ה-INCA של GeoSphere Austria באוסטריה (1 ק״מ, כל 15 דקות).",
    "כמויות מכ״ם גם ב-NO, SE, FI, DK (MET Norway) וב-AT (GeoSphere Austria).",
    "וגם הלשכה המטאורולוגית של אוסטרליה (לפי מדינה), MetService בניו זילנד והסוכנות המטאורולוגית של יפן (לפי רשות מקומית)."
  ],
  "fa": [
    "در سوئیس و لیختن‌اشتاین، MeteoSwiss ICON-CH (۱–۲ کیلومتر) پنج روز نخست را پیش می‌برد و Best Match بقیه را پوشش می‌دهد.",
    "مقادیر رادار همچنین از پیش‌بینی آنی MET Norway در نروژ، سوئد، فنلاند و دانمارک (هر ۵ دقیقه) و از پیش‌بینی آنی INCA ژئوسفر اتریش در اتریش (۱ کیلومتر، هر ۱۵ دقیقه) می‌آید.",
    "مقادیر رادار همچنین در NO، SE، FI، DK (MET Norway) و AT (GeoSphere Austria).",
    "همچنین اداره هواشناسی استرالیا (به تفکیک ایالت)، MetService نیوزیلند و سازمان هواشناسی ژاپن (به تفکیک شهرداری)."
  ],
  "hi": [
    "स्विट्ज़रलैंड और लिकटेंस्टाइन में पहले पाँच दिन MeteoSwiss ICON-CH (1–2 किमी) आगे रहता है; बाकी Best Match से।",
    "रडार वर्षा मात्रा नॉर्वे, स्वीडन, फ़िनलैंड और डेनमार्क में MET Norway के नाउकास्ट (हर 5 मिनट) और ऑस्ट्रिया में GeoSphere Austria के INCA नाउकास्ट (1 किमी, हर 15 मिनट) से भी आती है।",
    "रडार मात्रा NO, SE, FI, DK (MET Norway) और AT (GeoSphere Austria) में भी।",
    "साथ ही ऑस्ट्रेलियाई मौसम ब्यूरो (राज्यवार), न्यूज़ीलैंड की MetService और जापान मौसम विज्ञान एजेंसी (नगरपालिका-वार)।"
  ],
  "id": [
    "Di Swiss dan Liechtenstein, MeteoSwiss ICON-CH (1–2 km) memimpin untuk lima hari pertama; Best Match mengisi sisanya.",
    "Jumlah radar juga berasal dari nowcast MET Norway di Norwegia, Swedia, Finlandia, dan Denmark (setiap 5 menit) serta dari nowcast INCA GeoSphere Austria di Austria (1 km, setiap 15 menit).",
    "Jumlah radar juga di NO, SE, FI, DK (MET Norway) dan AT (GeoSphere Austria).",
    "Juga Bureau of Meteorology Australia (per negara bagian), MetService Selandia Baru, dan Badan Meteorologi Jepang (per kotamadya)."
  ],
  "vi": [
    "Tại Thụy Sĩ và Liechtenstein, MeteoSwiss ICON-CH (1–2 km) dẫn đầu trong năm ngày đầu; Best Match bổ sung phần còn lại.",
    "Lượng mưa radar cũng lấy từ nowcast của MET Norway ở Na Uy, Thụy Điển, Phần Lan và Đan Mạch (mỗi 5 phút) và từ nowcast INCA của GeoSphere Austria ở Áo (1 km, mỗi 15 phút).",
    "Lượng mưa radar cũng có ở NO, SE, FI, DK (MET Norway) và AT (GeoSphere Austria).",
    "Ngoài ra còn Cục Khí tượng Úc (theo bang), MetService của New Zealand và Cơ quan Khí tượng Nhật Bản (theo đô thị)."
  ],
  "th": [
    "ในสวิตเซอร์แลนด์และลิกเตนสไตน์ ใช้ MeteoSwiss ICON-CH (1–2 กม.) เป็นหลักในห้าวันแรก และ Best Match ครอบคลุมส่วนที่เหลือ",
    "ปริมาณจากเรดาร์ยังมาจาก nowcast ของ MET Norway ในนอร์เวย์ สวีเดน ฟินแลนด์ และเดนมาร์ก (ทุก 5 นาที) และจาก nowcast INCA ของ GeoSphere Austria ในออสเตรีย (1 กม. ทุก 15 นาที)",
    "ปริมาณจากเรดาร์ยังมีใน NO, SE, FI, DK (MET Norway) และ AT (GeoSphere Austria)",
    "รวมถึงสำนักอุตุนิยมวิทยาออสเตรเลีย (รายรัฐ) MetService ของนิวซีแลนด์ และสำนักงานอุตุนิยมวิทยาญี่ปุ่น (รายเทศบาล)"
  ]
}

function withListEntry(text, entry, before) {
  // CJK texts set the separator without a space before it.
  var parts = String(text).split(/\s*·\s*/)
  var index = Math.max(0, parts.length - before)
  parts.splice(index, 0, entry)
  return parts.join(" · ")
}

for (var sourceLanguage in sourceAdditions) {
  var additions = sourceAdditions[sourceLanguage]
  amendCatalogEntry(sourceLanguage, "sourceGroupForecastDetails", function(text) { return text + " " + additions[0] })
  amendCatalogEntry(sourceLanguage, "sourceGroupForecastCoverage", function(text) { return text + " · CH, LI: MeteoSwiss ICON-CH" })
  amendCatalogEntry(sourceLanguage, "sourceGroupNowcastDetails", function(text) { return text + " " + additions[1] })
  amendCatalogEntry(sourceLanguage, "sourceGroupNowcastCoverage", function(text) { return text + " " + additions[2] })
  // Radar: Finland and the Netherlands before RainViewer and the model.
  amendCatalogEntry(sourceLanguage, "sourceGroupRadarCoverage", function(text) {
    return withListEntry(withListEntry(withListEntry(text, "FI (FMI)", 2), "NL (KNMI)", 2), "JP (JMA)", 2)
  })
  // Buienradar (the KNMI radar) for the Netherlands and Belgium; brand and
  // country codes read the same in every language.
  amendCatalogEntry(sourceLanguage, "sourceGroupNowcastDetails", function(text) { return text + " NL, BE: Buienradar (KNMI radar). JP: JMA (radar nowcast, 1 h)." })
  amendCatalogEntry(sourceLanguage, "sourceGroupNowcastCoverage", function(text) { return text + " NL, BE: Buienradar. JP: JMA." })
  amendCatalogEntry(sourceLanguage, "sourceGroupWarningsDetails", function(text) { return text + " " + additions[3] })
  // Warnings: the new countries before the closing "none elsewhere".
  amendCatalogEntry(sourceLanguage, "sourceGroupWarningsCoverage",
    function(text) { return withListEntry(text, "AU: BOM · NZ: MetService · JP: JMA", 1) })
}

addCatalogEntries("en", {
  "sourceKnmiRadar": "KNMI · OFFICIAL RADAR",
  "sourceJmaRadar": "JMA · OFFICIAL RADAR",
  "sourceBuienradarNowcast": "BUIENRADAR",
  "sourceJmaNowcast": "JMA NOWCAST",
  "sourceMeteoSwiss": "METEOSWISS · ICON-CH",
  "sourceMetNowcast": "MET NORWAY NOWCAST",
  "sourceGeoSphereNowcast": "GEOSPHERE AUSTRIA · INCA",
  "sourceFmiRadar": "FMI · OFFICIAL RADAR",
  "sourceBomWarnings": "BOM WARNINGS",
  "sourceMetServiceWarnings": "METSERVICE WARNINGS",
  "sourceJmaWarnings": "JMA WARNINGS"
})
addCatalogEntries("de", {
  "sourceKnmiRadar": "KNMI · AMTLICHES RADAR",
  "sourceJmaRadar": "JMA · AMTLICHES RADAR",
  "sourceBuienradarNowcast": "BUIENRADAR",
  "sourceJmaNowcast": "JMA-NOWCAST",
  "sourceMeteoSwiss": "METEOSCHWEIZ · ICON-CH",
  "sourceMetNowcast": "MET NORWAY NOWCAST",
  "sourceGeoSphereNowcast": "GEOSPHERE AUSTRIA · INCA",
  "sourceFmiRadar": "FMI · AMTLICHES RADAR",
  "sourceBomWarnings": "BOM-WARNUNGEN",
  "sourceMetServiceWarnings": "METSERVICE-WARNUNGEN",
  "sourceJmaWarnings": "JMA-WARNUNGEN"
})

// Warnings beyond the dedicated services (2.5): INMET, SMN and the official
// CAP feeds of the Alert Hub register replace the closing "none elsewhere".
var warningAdditions = {
  "en": [
    "Everywhere else the official CAP warning feeds of the country's alerting authorities registered with the WMO (via the Alert Hub register); Brazil's INMET and Argentina's SMN directly.",
    "BR: INMET · AR: SMN · elsewhere the official CAP feeds registered with the WMO, where the country publishes one (about 115 countries today)."
  ],
  "de": [
    "Überall sonst die amtlichen CAP-Warnfeeds der bei der WMO registrierten Warnbehörden des Landes (über das Alert-Hub-Register); INMET in Brasilien und SMN in Argentinien direkt.",
    "BR: INMET · AR: SMN · sonst die bei der WMO registrierten amtlichen CAP-Feeds, sofern das Land einen veröffentlicht (derzeit etwa 115 Länder)."
  ],
  "es": [
    "En el resto, los canales CAP oficiales de las autoridades de alerta del país registradas en la OMM (a través del registro Alert Hub); INMET de Brasil y SMN de Argentina directamente.",
    "BR: INMET · AR: SMN · en el resto, los canales CAP oficiales registrados en la OMM, si el país publica uno (hoy unos 115 países)."
  ],
  "fr": [
    "Ailleurs, les flux CAP officiels des autorités d’alerte du pays enregistrées auprès de l’OMM (via le registre Alert Hub) ; l’INMET au Brésil et le SMN en Argentine directement.",
    "BR : INMET · AR : SMN · ailleurs, les flux CAP officiels enregistrés auprès de l’OMM, si le pays en publie un (environ 115 pays aujourd’hui)."
  ],
  "pt": [
    "No restante, os feeds CAP oficiais das autoridades de alerta do país registradas na OMM (pelo registro Alert Hub); o INMET no Brasil e o SMN na Argentina diretamente.",
    "BR: INMET · AR: SMN · no restante, os feeds CAP oficiais registrados na OMM, se o país publicar um (hoje cerca de 115 países)."
  ],
  "ru": [
    "В остальных странах — официальные CAP-ленты национальных служб оповещения, зарегистрированных в ВМО (через реестр Alert Hub); INMET в Бразилии и SMN в Аргентине напрямую.",
    "BR: INMET · AR: SMN · в остальных странах — официальные CAP-ленты, зарегистрированные в ВМО, если страна их публикует (сейчас около 115 стран)."
  ],
  "uk": [
    "В інших країнах — офіційні CAP-стрічки національних служб оповіщення, зареєстрованих у ВМО (через реєстр Alert Hub); INMET у Бразилії та SMN в Аргентині напряму.",
    "BR: INMET · AR: SMN · в інших країнах — офіційні CAP-стрічки, зареєстровані у ВМО, якщо країна їх публікує (зараз близько 115 країн)."
  ],
  "pl": [
    "Gdzie indziej oficjalne kanały CAP krajowych służb ostrzegawczych zarejestrowanych w WMO (przez rejestr Alert Hub); INMET w Brazylii i SMN w Argentynie bezpośrednio.",
    "BR: INMET · AR: SMN · gdzie indziej oficjalne kanały CAP zarejestrowane w WMO, jeśli kraj taki publikuje (obecnie ok. 115 krajów)."
  ],
  "it": [
    "Altrove i feed CAP ufficiali delle autorità di allerta del paese registrate presso l’OMM (tramite il registro Alert Hub); l’INMET in Brasile e lo SMN in Argentina direttamente.",
    "BR: INMET · AR: SMN · altrove i feed CAP ufficiali registrati presso l’OMM, se il paese ne pubblica uno (oggi circa 115 paesi)."
  ],
  "nl": [
    "Elders de officiële CAP-feeds van de bij de WMO geregistreerde waarschuwingsinstanties van het land (via het Alert Hub-register); INMET in Brazilië en SMN in Argentinië rechtstreeks.",
    "BR: INMET · AR: SMN · elders de bij de WMO geregistreerde officiële CAP-feeds, als het land er een publiceert (nu ongeveer 115 landen)."
  ],
  "tr": [
    "Diğer her yerde, ülkenin DMÖ'ye kayıtlı uyarı kurumlarının resmî CAP akışları (Alert Hub kaydı üzerinden); Brezilya'da INMET ve Arjantin'de SMN doğrudan.",
    "BR: INMET · AR: SMN · diğer yerlerde, ülke yayımlıyorsa DMÖ'ye kayıtlı resmî CAP akışları (bugün yaklaşık 115 ülke)."
  ],
  "cs": [
    "Jinde oficiální CAP kanály výstražných orgánů země registrovaných u WMO (přes registr Alert Hub); INMET v Brazílii a SMN v Argentině přímo.",
    "BR: INMET · AR: SMN · jinde oficiální CAP kanály registrované u WMO, pokud je země zveřejňuje (dnes asi 115 zemí)."
  ],
  "sv": [
    "Överallt annars de officiella CAP-flödena från landets varningsmyndigheter registrerade hos WMO (via Alert Hub-registret); INMET i Brasilien och SMN i Argentina direkt.",
    "BR: INMET · AR: SMN · annars de officiella CAP-flöden som är registrerade hos WMO, om landet publicerar ett (i dag cirka 115 länder)."
  ],
  "fi": [
    "Muualla maan WMO:hon rekisteröityjen varoitusviranomaisten viralliset CAP-syötteet (Alert Hub -rekisterin kautta); Brasiliassa INMET ja Argentiinassa SMN suoraan.",
    "BR: INMET · AR: SMN · muualla WMO:hon rekisteröidyt viralliset CAP-syötteet, jos maa julkaisee sellaisen (nyt noin 115 maata)."
  ],
  "nb": [
    "Ellers de offisielle CAP-strømmene fra landets varslingsmyndigheter registrert hos WMO (via Alert Hub-registeret); INMET i Brasil og SMN i Argentina direkte.",
    "BR: INMET · AR: SMN · ellers de offisielle CAP-strømmene registrert hos WMO, der landet publiserer en (i dag rundt 115 land)."
  ],
  "da": [
    "Andre steder de officielle CAP-feeds fra landets varslingsmyndigheder registreret hos WMO (via Alert Hub-registret); INMET i Brasilien og SMN i Argentina direkte.",
    "BR: INMET · AR: SMN · andre steder de officielle CAP-feeds registreret hos WMO, hvis landet udgiver et (i dag omkring 115 lande)."
  ],
  "ro": [
    "În rest, fluxurile CAP oficiale ale autorităților de avertizare din țară înregistrate la OMM (prin registrul Alert Hub); INMET în Brazilia și SMN în Argentina direct.",
    "BR: INMET · AR: SMN · în rest, fluxurile CAP oficiale înregistrate la OMM, dacă țara publică unul (azi circa 115 țări)."
  ],
  "hu": [
    "Máshol az ország WMO-nál regisztrált riasztó hatóságainak hivatalos CAP-hírcsatornái (az Alert Hub nyilvántartáson keresztül); Brazíliában az INMET, Argentínában az SMN közvetlenül.",
    "BR: INMET · AR: SMN · máshol a WMO-nál regisztrált hivatalos CAP-csatornák, ha az ország közzétesz ilyet (ma kb. 115 ország)."
  ],
  "el": [
    "Αλλού οι επίσημες ροές CAP των αρχών προειδοποίησης της χώρας που είναι καταχωρισμένες στον ΠΜΟ (μέσω του μητρώου Alert Hub)· το INMET στη Βραζιλία και το SMN στην Αργεντινή απευθείας.",
    "BR: INMET · AR: SMN · αλλού οι επίσημες ροές CAP που είναι καταχωρισμένες στον ΠΜΟ, εφόσον η χώρα δημοσιεύει (σήμερα περίπου 115 χώρες)."
  ],
  "zh_CN": [
    "其他地区使用该国在世界气象组织登记的预警机构的官方 CAP 预警源（通过 Alert Hub 登记册）；巴西 INMET 和阿根廷 SMN 直接获取。",
    "BR：INMET · AR：SMN · 其他地区：该国发布的、在世界气象组织登记的官方 CAP 预警源（目前约 115 个国家）。"
  ],
  "zh_TW": [
    "其他地區使用該國在世界氣象組織登記的警報機構之官方 CAP 警報來源（透過 Alert Hub 登記冊）；巴西 INMET 與阿根廷 SMN 直接取得。",
    "BR：INMET · AR：SMN · 其他地區：該國發布、在世界氣象組織登記的官方 CAP 來源（目前約 115 國）。"
  ],
  "ja": [
    "その他の国では、WMO に登録されたその国の警報機関の公式 CAP フィード（Alert Hub 登録簿経由）。ブラジルの INMET とアルゼンチンの SMN は直接取得します。",
    "BR：INMET · AR：SMN · その他は、その国が公開している WMO 登録の公式 CAP フィード（現在約 115 か国）。"
  ],
  "ko": [
    "그 밖의 지역은 WMO에 등록된 해당 국가 경보 기관의 공식 CAP 피드(Alert Hub 등록부 경유)를 사용하며, 브라질 INMET과 아르헨티나 SMN은 직접 가져옵니다.",
    "BR: INMET · AR: SMN · 그 밖에는 해당 국가가 게시하는 WMO 등록 공식 CAP 피드(현재 약 115개국)."
  ],
  "ar": [
    "وفي غير ذلك، خلاصات CAP الرسمية لجهات الإنذار في البلد المسجلة لدى المنظمة العالمية للأرصاد الجوية (عبر سجل Alert Hub)؛ وINMET في البرازيل وSMN في الأرجنتين مباشرة.",
    "BR: INMET · AR: SMN · وفي غير ذلك خلاصات CAP الرسمية المسجلة لدى المنظمة، إن نشر البلد واحدة (نحو 115 بلدًا حاليًا)."
  ],
  "he": [
    "בכל מקום אחר, ערוצי ה-CAP הרשמיים של רשויות ההתרעה במדינה הרשומות בארגון המטאורולוגי העולמי (דרך מרשם Alert Hub); INMET בברזיל ו-SMN בארגנטינה ישירות.",
    "BR: INMET · AR: SMN · במקומות אחרים ערוצי ה-CAP הרשמיים הרשומים ב-WMO, אם המדינה מפרסמת כזה (כיום כ-115 מדינות)."
  ],
  "fa": [
    "در جاهای دیگر، خوراک‌های رسمی CAP مراجع هشدار کشور که در سازمان جهانی هواشناسی ثبت شده‌اند (از طریق فهرست Alert Hub)؛ INMET در برزیل و SMN در آرژانتین مستقیم.",
    "BR: INMET · AR: SMN · در جاهای دیگر خوراک‌های رسمی CAP ثبت‌شده در WMO، اگر کشور یکی منتشر کند (اکنون حدود ۱۱۵ کشور)."
  ],
  "hi": [
    "अन्य जगहों पर देश के WMO में पंजीकृत चेतावनी प्राधिकरणों के आधिकारिक CAP फ़ीड (Alert Hub रजिस्टर के ज़रिए); ब्राज़ील का INMET और अर्जेंटीना का SMN सीधे।",
    "BR: INMET · AR: SMN · अन्यत्र WMO में पंजीकृत आधिकारिक CAP फ़ीड, यदि देश कोई प्रकाशित करता है (अभी लगभग 115 देश)।"
  ],
  "id": [
    "Di tempat lain, umpan CAP resmi dari otoritas peringatan negara yang terdaftar di WMO (melalui register Alert Hub); INMET di Brasil dan SMN di Argentina secara langsung.",
    "BR: INMET · AR: SMN · di tempat lain umpan CAP resmi yang terdaftar di WMO, jika negara menerbitkannya (kini sekitar 115 negara)."
  ],
  "vi": [
    "Ở nơi khác, các nguồn CAP chính thức của cơ quan cảnh báo trong nước đã đăng ký với WMO (qua sổ đăng ký Alert Hub); INMET ở Brazil và SMN ở Argentina lấy trực tiếp.",
    "BR: INMET · AR: SMN · nơi khác dùng nguồn CAP chính thức đăng ký với WMO, nếu quốc gia có công bố (hiện khoảng 115 quốc gia)."
  ],
  "th": [
    "ที่อื่นใช้ฟีด CAP อย่างเป็นทางการของหน่วยงานเตือนภัยของประเทศที่ขึ้นทะเบียนกับ WMO (ผ่านทะเบียน Alert Hub) ส่วน INMET ของบราซิลและ SMN ของอาร์เจนตินาดึงโดยตรง",
    "BR: INMET · AR: SMN · ที่อื่นใช้ฟีด CAP ทางการที่ขึ้นทะเบียนกับ WMO หากประเทศนั้นเผยแพร่ (ปัจจุบันราว 115 ประเทศ)"
  ]
}

for (var warningLanguage in warningAdditions) {
  var warningTexts = warningAdditions[warningLanguage]
  amendCatalogEntry(warningLanguage, "sourceGroupWarningsDetails", function(text) { return text + " " + warningTexts[0] })
  amendCatalogEntry(warningLanguage, "sourceGroupWarningsCoverage", function(text) {
    var parts = String(text).split(/\s*·\s*/)
    parts[parts.length - 1] = warningTexts[1]
    return parts.join(" · ")
  })
}

addCatalogEntries("en", {
  "sourceInmetWarnings": "INMET WARNINGS",
  "sourceSmnWarnings": "SMN WARNINGS",
  "sourceAlertHubWarnings": "OFFICIAL CAP WARNINGS"
})
addCatalogEntries("de", {
  "sourceInmetWarnings": "INMET-WARNUNGEN",
  "sourceSmnWarnings": "SMN-WARNUNGEN",
  "sourceAlertHubWarnings": "AMTLICHE CAP-WARNUNGEN"
})

// My places (2.5).
addCatalogEntries("en", {
  "myPlaces": "My places",
  "favoritesHint": "Your favourites (+ in the place search), one per line. A click shows the place; their weather is renewed about every 30 minutes.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Show favourite 1–9",
  "shortcutFavoriteStep": "Previous / next favourite"
})
addCatalogEntries("de", {
  "myPlaces": "Meine Orte",
  "favoritesHint": "Deine Favoriten (+ in der Ortssuche), einer pro Zeile. Ein Klick zeigt den Ort; ihr Wetter wird etwa alle 30 Minuten erneuert.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Favorit 1–9 anzeigen",
  "shortcutFavoriteStep": "Vorheriger / nächster Favorit"
})
addCatalogEntries("es", {
  "myPlaces": "Mis lugares",
  "favoritesHint": "Tus favoritos (+ en la búsqueda de lugares), uno por línea. Un clic muestra el lugar; su tiempo se renueva cada 30 minutos aprox.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Mostrar favorito 1–9",
  "shortcutFavoriteStep": "Favorito anterior / siguiente"
})
addCatalogEntries("fr", {
  "myPlaces": "Mes lieux",
  "favoritesHint": "Vos favoris (+ dans la recherche de lieu), un par ligne. Un clic affiche le lieu ; leur météo est renouvelée env. toutes les 30 minutes.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Afficher le favori 1–9",
  "shortcutFavoriteStep": "Favori précédent / suivant"
})
addCatalogEntries("pt", {
  "myPlaces": "Meus locais",
  "favoritesHint": "Seus favoritos (+ na busca de locais), um por linha. Um clique mostra o local; o tempo deles é renovado a cada 30 minutos aprox.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Mostrar favorito 1–9",
  "shortcutFavoriteStep": "Favorito anterior / seguinte"
})
addCatalogEntries("ru", {
  "myPlaces": "Мои места",
  "favoritesHint": "Ваше избранное (+ в поиске места), по одному в строке. Щелчок показывает место; погода обновляется примерно каждые 30 минут.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Показать избранное 1–9",
  "shortcutFavoriteStep": "Предыдущее / следующее избранное"
})
addCatalogEntries("uk", {
  "myPlaces": "Мої місця",
  "favoritesHint": "Ваші обрані (+ у пошуку місця), по одному в рядку. Клацання показує місце; погода оновлюється приблизно кожні 30 хвилин.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Показати обране 1–9",
  "shortcutFavoriteStep": "Попереднє / наступне обране"
})
addCatalogEntries("pl", {
  "myPlaces": "Moje miejsca",
  "favoritesHint": "Twoje ulubione (+ w wyszukiwaniu miejsc), po jednym w wierszu. Kliknięcie pokazuje miejsce; pogoda odświeża się co ok. 30 minut.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Pokaż ulubione 1–9",
  "shortcutFavoriteStep": "Poprzednie / następne ulubione"
})
addCatalogEntries("it", {
  "myPlaces": "I miei luoghi",
  "favoritesHint": "I tuoi preferiti (+ nella ricerca del luogo), uno per riga. Un clic mostra il luogo; il loro meteo si rinnova ogni 30 minuti circa.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Mostra preferito 1–9",
  "shortcutFavoriteStep": "Preferito precedente / successivo"
})
addCatalogEntries("nl", {
  "myPlaces": "Mijn plaatsen",
  "favoritesHint": "Je favorieten (+ in het zoeken naar plaatsen), één per regel. Een klik toont de plaats; hun weer wordt ongeveer elke 30 minuten ververst.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Favoriet 1–9 tonen",
  "shortcutFavoriteStep": "Vorige / volgende favoriet"
})
addCatalogEntries("tr", {
  "myPlaces": "Yerlerim",
  "favoritesHint": "Favorilerin (yer aramasında +), her satırda bir tane. Tıklamak yeri gösterir; hava durumları yaklaşık 30 dakikada bir yenilenir.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Favori 1–9'u göster",
  "shortcutFavoriteStep": "Önceki / sonraki favori"
})
addCatalogEntries("cs", {
  "myPlaces": "Moje místa",
  "favoritesHint": "Vaše oblíbená (+ ve vyhledávání místa), jedno na řádek. Kliknutí zobrazí místo; počasí se obnovuje asi každých 30 minut.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Zobrazit oblíbené 1–9",
  "shortcutFavoriteStep": "Předchozí / další oblíbené"
})
addCatalogEntries("sv", {
  "myPlaces": "Mina platser",
  "favoritesHint": "Dina favoriter (+ i platssökningen), en per rad. Ett klick visar platsen; vädret förnyas ungefär var 30:e minut.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Visa favorit 1–9",
  "shortcutFavoriteStep": "Föregående / nästa favorit"
})
addCatalogEntries("fi", {
  "myPlaces": "Omat paikat",
  "favoritesHint": "Suosikkisi (+ paikkahaussa), yksi per rivi. Napsautus näyttää paikan; sää päivittyy noin 30 minuutin välein.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Näytä suosikki 1–9",
  "shortcutFavoriteStep": "Edellinen / seuraava suosikki"
})
addCatalogEntries("nb", {
  "myPlaces": "Mine steder",
  "favoritesHint": "Favorittene dine (+ i stedssøket), én per linje. Et klikk viser stedet; været fornyes omtrent hvert 30. minutt.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Vis favoritt 1–9",
  "shortcutFavoriteStep": "Forrige / neste favoritt"
})
addCatalogEntries("da", {
  "myPlaces": "Mine steder",
  "favoritesHint": "Dine favoritter (+ i stedsøgningen), én pr. linje. Et klik viser stedet; vejret fornyes cirka hvert 30. minut.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Vis favorit 1–9",
  "shortcutFavoriteStep": "Forrige / næste favorit"
})
addCatalogEntries("ro", {
  "myPlaces": "Locurile mele",
  "favoritesHint": "Favoritele tale (+ în căutarea locului), câte unul pe rând. Un clic afișează locul; vremea lor se reînnoiește cam la 30 de minute.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Arată favoritul 1–9",
  "shortcutFavoriteStep": "Favoritul anterior / următor"
})
addCatalogEntries("hu", {
  "myPlaces": "Helyeim",
  "favoritesHint": "A kedvenceid (+ a helykeresésben), soronként egy. Egy kattintás megjeleníti a helyet; az időjárásuk kb. 30 percenként frissül.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "1–9. kedvenc megjelenítése",
  "shortcutFavoriteStep": "Előző / következő kedvenc"
})
addCatalogEntries("el", {
  "myPlaces": "Οι τοποθεσίες μου",
  "favoritesHint": "Τα αγαπημένα σου (+ στην αναζήτηση τοποθεσίας), ένα ανά γραμμή. Ένα κλικ δείχνει την τοποθεσία· ο καιρός ανανεώνεται περίπου κάθε 30 λεπτά.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Εμφάνιση αγαπημένου 1–9",
  "shortcutFavoriteStep": "Προηγούμενο / επόμενο αγαπημένο"
})
addCatalogEntries("zh_CN", {
  "myPlaces": "我的地点",
  "favoritesHint": "你的收藏（地点搜索中的 +），每行一个。点击即显示该地点；天气约每 30 分钟更新。",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "显示收藏 1–9",
  "shortcutFavoriteStep": "上一个 / 下一个收藏"
})
addCatalogEntries("zh_TW", {
  "myPlaces": "我的地點",
  "favoritesHint": "你的收藏（地點搜尋中的 +），每行一個。點擊即顯示該地點；天氣約每 30 分鐘更新。",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "顯示收藏 1–9",
  "shortcutFavoriteStep": "上一個 / 下一個收藏"
})
addCatalogEntries("ja", {
  "myPlaces": "マイ地点",
  "favoritesHint": "お気に入り（地点検索の +）を1行に1つ表示。クリックでその地点を表示します。天気は約30分ごとに更新されます。",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "お気に入り 1–9 を表示",
  "shortcutFavoriteStep": "前 / 次のお気に入り"
})
addCatalogEntries("ko", {
  "myPlaces": "내 장소",
  "favoritesHint": "즐겨찾기(장소 검색의 +)를 한 줄에 하나씩 표시합니다. 클릭하면 해당 장소를 보여 주며, 날씨는 약 30분마다 갱신됩니다.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "즐겨찾기 1–9 표시",
  "shortcutFavoriteStep": "이전 / 다음 즐겨찾기"
})
addCatalogEntries("ar", {
  "myPlaces": "أماكني",
  "favoritesHint": "مفضلاتك (+ في البحث عن مكان)، واحدة في كل سطر. النقر يعرض المكان؛ ويتجدد طقسها كل 30 دقيقة تقريبًا.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "عرض المفضلة 1–9",
  "shortcutFavoriteStep": "المفضلة السابقة / التالية"
})
addCatalogEntries("he", {
  "myPlaces": "המקומות שלי",
  "favoritesHint": "המועדפים שלך (+ בחיפוש מקום), אחד בכל שורה. לחיצה מציגה את המקום; מזג האוויר שלהם מתחדש בערך כל 30 דקות.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "הצגת מועדף 1–9",
  "shortcutFavoriteStep": "מועדף קודם / הבא"
})
addCatalogEntries("fa", {
  "myPlaces": "مکان‌های من",
  "favoritesHint": "علاقه‌مندی‌های شما (+ در جست‌وجوی مکان)، هر کدام در یک سطر. با کلیک مکان نمایش داده می‌شود؛ هوای آن‌ها حدود هر ۳۰ دقیقه تازه می‌شود.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "نمایش علاقه‌مندی ۱–۹",
  "shortcutFavoriteStep": "علاقه‌مندی قبلی / بعدی"
})
addCatalogEntries("hi", {
  "myPlaces": "मेरी जगहें",
  "favoritesHint": "आपके पसंदीदा (स्थान खोज में +), हर पंक्ति में एक। क्लिक करने पर वह जगह दिखती है; उनका मौसम लगभग हर 30 मिनट में ताज़ा होता है।",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "पसंदीदा 1–9 दिखाएँ",
  "shortcutFavoriteStep": "पिछला / अगला पसंदीदा"
})
addCatalogEntries("id", {
  "myPlaces": "Tempat saya",
  "favoritesHint": "Favorit Anda (+ di pencarian tempat), satu per baris. Klik untuk menampilkan tempat; cuacanya diperbarui sekitar setiap 30 menit.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Tampilkan favorit 1–9",
  "shortcutFavoriteStep": "Favorit sebelumnya / berikutnya"
})
addCatalogEntries("vi", {
  "myPlaces": "Địa điểm của tôi",
  "favoritesHint": "Các mục yêu thích (+ trong tìm kiếm địa điểm), mỗi dòng một mục. Nhấp để hiển thị địa điểm; thời tiết được làm mới khoảng mỗi 30 phút.",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "Hiện mục yêu thích 1–9",
  "shortcutFavoriteStep": "Mục yêu thích trước / sau"
})
addCatalogEntries("th", {
  "myPlaces": "สถานที่ของฉัน",
  "favoritesHint": "รายการโปรดของคุณ (+ ในการค้นหาสถานที่) บรรทัดละหนึ่งแห่ง คลิกเพื่อแสดงสถานที่ สภาพอากาศจะอัปเดตราวทุก 30 นาที",
  "favoritesKeysHint": "Alt 1–9 · Alt ← →",
  "shortcutFavoriteJump": "แสดงรายการโปรด 1–9",
  "shortcutFavoriteStep": "รายการโปรดก่อนหน้า / ถัดไป"
})

// Tab strip as its own entry (2.5): the section hint describes it.
addCatalogEntries("en", { "displaySectionsHint": "Each section appears in the window or as a tab. The tab strip moves like a section; the tabbed sections are listed under it and set the order of the tabs." })
addCatalogEntries("de", { "displaySectionsHint": "Jede Rubrik erscheint im Fenster oder als Tab. Die Tab-Leiste wird wie eine Rubrik verschoben; die Tab-Rubriken stehen darunter und bestimmen die Reihenfolge der Tabs." })
addCatalogEntries("es", { "displaySectionsHint": "Cada sección aparece en la ventana o como pestaña. La barra de pestañas se mueve como una sección; las secciones en pestaña se listan debajo y fijan el orden de las pestañas." })
addCatalogEntries("fr", { "displaySectionsHint": "Chaque section s’affiche dans la fenêtre ou en onglet. La barre d’onglets se déplace comme une section ; les sections en onglet sont listées dessous et fixent l’ordre des onglets." })
addCatalogEntries("pt", { "displaySectionsHint": "Cada seção aparece na janela ou como aba. A barra de abas se move como uma seção; as seções em aba ficam listadas abaixo dela e definem a ordem das abas." })
addCatalogEntries("ru", { "displaySectionsHint": "Каждый раздел показывается в окне или вкладкой. Панель вкладок перемещается как раздел; разделы-вкладки перечислены под ней и задают порядок вкладок." })
addCatalogEntries("uk", { "displaySectionsHint": "Кожен розділ показується у вікні або вкладкою. Панель вкладок переміщується як розділ; розділи-вкладки перелічено під нею, вони задають порядок вкладок." })
addCatalogEntries("pl", { "displaySectionsHint": "Każda sekcja pojawia się w oknie lub jako karta. Pasek kart przesuwa się jak sekcja; sekcje jako karty są wymienione pod nim i ustalają kolejność kart." })
addCatalogEntries("it", { "displaySectionsHint": "Ogni sezione appare nella finestra o come scheda. La barra delle schede si sposta come una sezione; le sezioni a scheda sono elencate sotto e fissano l’ordine delle schede." })
addCatalogEntries("nl", { "displaySectionsHint": "Elke sectie verschijnt in het venster of als tabblad. De tabbladbalk verplaats je als een sectie; de secties als tabblad staan eronder en bepalen de volgorde van de tabbladen." })
addCatalogEntries("tr", { "displaySectionsHint": "Her bölüm pencerede ya da sekme olarak görünür. Sekme çubuğu bir bölüm gibi taşınır; sekme bölümleri onun altında listelenir ve sekmelerin sırasını belirler." })
addCatalogEntries("cs", { "displaySectionsHint": "Každá sekce se zobrazí v okně nebo jako karta. Lišta karet se přesouvá jako sekce; sekce jako karty jsou uvedeny pod ní a určují pořadí karet." })
addCatalogEntries("sv", { "displaySectionsHint": "Varje avsnitt visas i fönstret eller som flik. Fliklisten flyttas som ett avsnitt; flikavsnitten listas under den och bestämmer flikarnas ordning." })
addCatalogEntries("fi", { "displaySectionsHint": "Jokainen osio näkyy ikkunassa tai välilehtenä. Välilehtipalkkia siirretään kuin osiota; välilehtiosiot luetellaan sen alla ja ne määräävät välilehtien järjestyksen." })
addCatalogEntries("nb", { "displaySectionsHint": "Hver seksjon vises i vinduet eller som fane. Fanelinjen flyttes som en seksjon; faneseksjonene står under den og bestemmer fanenes rekkefølge." })
addCatalogEntries("da", { "displaySectionsHint": "Hver sektion vises i vinduet eller som fane. Fanebjælken flyttes som en sektion; fanesektionerne står under den og bestemmer fanernes rækkefølge." })
addCatalogEntries("ro", { "displaySectionsHint": "Fiecare secțiune apare în fereastră sau ca filă. Bara de file se mută ca o secțiune; secțiunile ca filă sunt listate sub ea și stabilesc ordinea filelor." })
addCatalogEntries("hu", { "displaySectionsHint": "Minden rész az ablakban vagy lapként jelenik meg. A lapsáv úgy mozgatható, mint egy rész; a lapként megjelenő részek alatta szerepelnek, és ezek adják a lapok sorrendjét." })
addCatalogEntries("el", { "displaySectionsHint": "Κάθε ενότητα εμφανίζεται στο παράθυρο ή ως καρτέλα. Η γραμμή καρτελών μετακινείται σαν ενότητα· οι ενότητες-καρτέλες παρατίθενται από κάτω και ορίζουν τη σειρά των καρτελών." })
addCatalogEntries("zh_CN", { "displaySectionsHint": "每个栏目可显示在窗口中或作为标签页。标签栏可像栏目一样移动；标签页栏目列在其下方，并决定标签页的顺序。" })
addCatalogEntries("zh_TW", { "displaySectionsHint": "每個欄目可顯示在視窗中或作為分頁。分頁列可像欄目一樣移動；分頁欄目列在其下方，並決定分頁的順序。" })
addCatalogEntries("ja", { "displaySectionsHint": "各セクションはウィンドウ内またはタブとして表示されます。タブバーはセクションと同様に移動でき、タブのセクションはその下に並び、タブの順番を決めます。" })
addCatalogEntries("ko", { "displaySectionsHint": "각 섹션은 창 안이나 탭으로 표시됩니다. 탭 막대는 섹션처럼 이동하며, 탭 섹션은 그 아래에 나열되어 탭 순서를 정합니다." })
addCatalogEntries("ar", { "displaySectionsHint": "يظهر كل قسم في النافذة أو كعلامة تبويب. يُنقل شريط علامات التبويب كأي قسم؛ وتُدرج أقسام علامات التبويب تحته وتحدد ترتيبها." })
addCatalogEntries("he", { "displaySectionsHint": "כל מקטע מוצג בחלון או כלשונית. סרגל הלשוניות זז כמו מקטע; מקטעי הלשוניות מופיעים מתחתיו וקובעים את סדר הלשוניות." })
addCatalogEntries("fa", { "displaySectionsHint": "هر بخش در پنجره یا به‌صورت زبانه نمایش داده می‌شود. نوار زبانه‌ها مانند یک بخش جابه‌جا می‌شود؛ بخش‌های زبانه‌ای زیر آن فهرست می‌شوند و ترتیب زبانه‌ها را تعیین می‌کنند." })
addCatalogEntries("hi", { "displaySectionsHint": "हर अनुभाग विंडो में या टैब के रूप में दिखता है। टैब पट्टी एक अनुभाग की तरह खिसकाई जाती है; टैब वाले अनुभाग उसके नीचे सूचीबद्ध होते हैं और टैब का क्रम तय करते हैं।" })
addCatalogEntries("id", { "displaySectionsHint": "Setiap bagian tampil di jendela atau sebagai tab. Bilah tab dipindahkan seperti bagian; bagian tab tercantum di bawahnya dan menentukan urutan tab." })
addCatalogEntries("vi", { "displaySectionsHint": "Mỗi mục hiển thị trong cửa sổ hoặc dạng thẻ. Thanh thẻ được di chuyển như một mục; các mục dạng thẻ được liệt kê bên dưới và quyết định thứ tự thẻ." })
addCatalogEntries("th", { "displaySectionsHint": "แต่ละส่วนแสดงในหน้าต่างหรือเป็นแท็บ แถบแท็บย้ายได้เหมือนส่วนหนึ่ง ส่วนที่เป็นแท็บจะแสดงอยู่ใต้แถบและกำหนดลำดับแท็บ" })

// Weather extras (2.5): yesterday, moon, day length, wind unit, updates,
// weather-service link, distance rings.
addCatalogEntries("en", {
  "yesterdayShort": "vs. yesterday",
  "fullMoon": "Full moon",
  "newMoon": "New moon",
  "moonToday": "today",
  "moonTomorrow": "tomorrow",
  "moonInDays": "in {days} days",
  "openAtService": "Open at the weather service ({service})",
  "windUnit": "Wind unit",
  "windUnitAuto": "Automatic ({unit})",
  "windUnitKnots": "Knots",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Updates",
  "refreshDefault": "Default (every {minutes} min)",
  "refreshEvery": "every {minutes} min",
  "refreshIntervalHint": "How often the forecast is reloaded; radar and nowcast keep their own pace. MET Norway asks for no more than every 10 minutes.",
  "compareYesterday": "Compared with yesterday",
  "nextFullNewMoon": "Next full or new moon",
  "serviceLinkButton": "\"Open at the weather service\" button",
  "dayLength": "Day length",
  "radarRings": "Distance rings",
  "shortcutServiceLink": "Open the place at the weather service"
})
addCatalogEntries("de", {
  "yesterdayShort": "zu gestern",
  "fullMoon": "Vollmond",
  "newMoon": "Neumond",
  "moonToday": "heute",
  "moonTomorrow": "morgen",
  "moonInDays": "in {days} Tagen",
  "openAtService": "Beim Wetterdienst öffnen ({service})",
  "windUnit": "Windeinheit",
  "windUnitAuto": "Automatisch ({unit})",
  "windUnitKnots": "Knoten",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Aktualisierung",
  "refreshDefault": "Standard (alle {minutes} min)",
  "refreshEvery": "alle {minutes} min",
  "refreshIntervalHint": "Wie oft die Vorhersage neu geladen wird; Radar und Nowcast haben ihren eigenen Takt. MET Norway bittet um höchstens alle 10 Minuten.",
  "compareYesterday": "Vergleich mit gestern",
  "nextFullNewMoon": "Nächster Voll- oder Neumond",
  "serviceLinkButton": "Knopf „Beim Wetterdienst öffnen“",
  "dayLength": "Tageslänge",
  "radarRings": "Entfernungsringe",
  "shortcutServiceLink": "Ort beim Wetterdienst öffnen"
})
addCatalogEntries("es", {
  "yesterdayShort": "vs. ayer",
  "fullMoon": "Luna llena",
  "newMoon": "Luna nueva",
  "moonToday": "hoy",
  "moonTomorrow": "mañana",
  "moonInDays": "en {days} días",
  "openAtService": "Abrir en el servicio meteorológico ({service})",
  "windUnit": "Unidad de viento",
  "windUnitAuto": "Automática ({unit})",
  "windUnitKnots": "Nudos",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Actualización",
  "refreshDefault": "Predeterminado (cada {minutes} min)",
  "refreshEvery": "cada {minutes} min",
  "refreshIntervalHint": "Con qué frecuencia se recarga la previsión; radar y nowcast siguen su propio ritmo. MET Norway pide no más de cada 10 minutos.",
  "compareYesterday": "Comparación con ayer",
  "nextFullNewMoon": "Próxima luna llena o nueva",
  "serviceLinkButton": "Botón «Abrir en el servicio meteorológico»",
  "dayLength": "Duración del día",
  "radarRings": "Anillos de distancia",
  "shortcutServiceLink": "Abrir el lugar en el servicio meteorológico"
})
addCatalogEntries("fr", {
  "yesterdayShort": "vs hier",
  "fullMoon": "Pleine lune",
  "newMoon": "Nouvelle lune",
  "moonToday": "aujourd’hui",
  "moonTomorrow": "demain",
  "moonInDays": "dans {days} jours",
  "openAtService": "Ouvrir au service météo ({service})",
  "windUnit": "Unité du vent",
  "windUnitAuto": "Automatique ({unit})",
  "windUnitKnots": "Nœuds",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Actualisation",
  "refreshDefault": "Par défaut (toutes les {minutes} min)",
  "refreshEvery": "toutes les {minutes} min",
  "refreshIntervalHint": "Fréquence de rechargement de la prévision ; radar et nowcast gardent leur propre rythme. MET Norway demande au plus toutes les 10 minutes.",
  "compareYesterday": "Comparaison avec hier",
  "nextFullNewMoon": "Prochaine pleine ou nouvelle lune",
  "serviceLinkButton": "Bouton « Ouvrir au service météo »",
  "dayLength": "Durée du jour",
  "radarRings": "Cercles de distance",
  "shortcutServiceLink": "Ouvrir le lieu au service météo"
})
addCatalogEntries("pt", {
  "yesterdayShort": "vs. ontem",
  "fullMoon": "Lua cheia",
  "newMoon": "Lua nova",
  "moonToday": "hoje",
  "moonTomorrow": "amanhã",
  "moonInDays": "em {days} dias",
  "openAtService": "Abrir no serviço meteorológico ({service})",
  "windUnit": "Unidade do vento",
  "windUnitAuto": "Automática ({unit})",
  "windUnitKnots": "Nós",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Atualização",
  "refreshDefault": "Padrão (a cada {minutes} min)",
  "refreshEvery": "a cada {minutes} min",
  "refreshIntervalHint": "Com que frequência a previsão é recarregada; radar e nowcast seguem seu próprio ritmo. A MET Norway pede no máximo a cada 10 minutos.",
  "compareYesterday": "Comparação com ontem",
  "nextFullNewMoon": "Próxima lua cheia ou nova",
  "serviceLinkButton": "Botão “Abrir no serviço meteorológico”",
  "dayLength": "Duração do dia",
  "radarRings": "Anéis de distância",
  "shortcutServiceLink": "Abrir o local no serviço meteorológico"
})
addCatalogEntries("ru", {
  "yesterdayShort": "к вчера",
  "fullMoon": "Полнолуние",
  "newMoon": "Новолуние",
  "moonToday": "сегодня",
  "moonTomorrow": "завтра",
  "moonInDays": "через {days} дн.",
  "openAtService": "Открыть в метеослужбе ({service})",
  "windUnit": "Единица ветра",
  "windUnitAuto": "Автоматически ({unit})",
  "windUnitKnots": "Узлы",
  "windUnitBeaufort": "Бофорт",
  "refreshInterval": "Обновление",
  "refreshDefault": "По умолчанию (каждые {minutes} мин)",
  "refreshEvery": "каждые {minutes} мин",
  "refreshIntervalHint": "Как часто перезагружается прогноз; радар и наукаст идут в своём темпе. MET Norway просит не чаще раза в 10 минут.",
  "compareYesterday": "Сравнение со вчера",
  "nextFullNewMoon": "Ближайшее полнолуние или новолуние",
  "serviceLinkButton": "Кнопка «Открыть в метеослужбе»",
  "dayLength": "Долгота дня",
  "radarRings": "Кольца расстояний",
  "shortcutServiceLink": "Открыть место в метеослужбе"
})
addCatalogEntries("uk", {
  "yesterdayShort": "до вчора",
  "fullMoon": "Повня",
  "newMoon": "Молодик",
  "moonToday": "сьогодні",
  "moonTomorrow": "завтра",
  "moonInDays": "через {days} дн.",
  "openAtService": "Відкрити в метеослужбі ({service})",
  "windUnit": "Одиниця вітру",
  "windUnitAuto": "Автоматично ({unit})",
  "windUnitKnots": "Вузли",
  "windUnitBeaufort": "Бофорт",
  "refreshInterval": "Оновлення",
  "refreshDefault": "Типово (кожні {minutes} хв)",
  "refreshEvery": "кожні {minutes} хв",
  "refreshIntervalHint": "Як часто перезавантажується прогноз; радар і наукаст мають власний темп. MET Norway просить не частіше ніж раз на 10 хвилин.",
  "compareYesterday": "Порівняння з учора",
  "nextFullNewMoon": "Найближча повня чи молодик",
  "serviceLinkButton": "Кнопка «Відкрити в метеослужбі»",
  "dayLength": "Тривалість дня",
  "radarRings": "Кільця відстані",
  "shortcutServiceLink": "Відкрити місце в метеослужбі"
})
addCatalogEntries("pl", {
  "yesterdayShort": "vs wczoraj",
  "fullMoon": "Pełnia",
  "newMoon": "Nów",
  "moonToday": "dziś",
  "moonTomorrow": "jutro",
  "moonInDays": "za {days} dni",
  "openAtService": "Otwórz w serwisie pogodowym ({service})",
  "windUnit": "Jednostka wiatru",
  "windUnitAuto": "Automatycznie ({unit})",
  "windUnitKnots": "Węzły",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Odświeżanie",
  "refreshDefault": "Domyślnie (co {minutes} min)",
  "refreshEvery": "co {minutes} min",
  "refreshIntervalHint": "Jak często prognoza jest odświeżana; radar i nowcast mają własny rytm. MET Norway prosi o nie częściej niż co 10 minut.",
  "compareYesterday": "Porównanie z wczoraj",
  "nextFullNewMoon": "Najbliższa pełnia lub nów",
  "serviceLinkButton": "Przycisk „Otwórz w serwisie pogodowym”",
  "dayLength": "Długość dnia",
  "radarRings": "Pierścienie odległości",
  "shortcutServiceLink": "Otwórz miejsce w serwisie pogodowym"
})
addCatalogEntries("it", {
  "yesterdayShort": "vs ieri",
  "fullMoon": "Luna piena",
  "newMoon": "Luna nuova",
  "moonToday": "oggi",
  "moonTomorrow": "domani",
  "moonInDays": "tra {days} giorni",
  "openAtService": "Apri nel servizio meteo ({service})",
  "windUnit": "Unità del vento",
  "windUnitAuto": "Automatica ({unit})",
  "windUnitKnots": "Nodi",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Aggiornamento",
  "refreshDefault": "Predefinito (ogni {minutes} min)",
  "refreshEvery": "ogni {minutes} min",
  "refreshIntervalHint": "Ogni quanto si ricarica la previsione; radar e nowcast seguono il loro ritmo. MET Norway chiede non più di ogni 10 minuti.",
  "compareYesterday": "Confronto con ieri",
  "nextFullNewMoon": "Prossima luna piena o nuova",
  "serviceLinkButton": "Pulsante «Apri nel servizio meteo»",
  "dayLength": "Durata del giorno",
  "radarRings": "Anelli di distanza",
  "shortcutServiceLink": "Apri il luogo nel servizio meteo"
})
addCatalogEntries("nl", {
  "yesterdayShort": "t.o.v. gisteren",
  "fullMoon": "Volle maan",
  "newMoon": "Nieuwe maan",
  "moonToday": "vandaag",
  "moonTomorrow": "morgen",
  "moonInDays": "over {days} dagen",
  "openAtService": "Openen bij de weerdienst ({service})",
  "windUnit": "Windeenheid",
  "windUnitAuto": "Automatisch ({unit})",
  "windUnitKnots": "Knopen",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Verversen",
  "refreshDefault": "Standaard (elke {minutes} min)",
  "refreshEvery": "elke {minutes} min",
  "refreshIntervalHint": "Hoe vaak de verwachting opnieuw wordt geladen; radar en nowcast hebben hun eigen ritme. MET Norway vraagt om hoogstens elke 10 minuten.",
  "compareYesterday": "Vergelijking met gisteren",
  "nextFullNewMoon": "Volgende volle of nieuwe maan",
  "serviceLinkButton": "Knop „Openen bij de weerdienst”",
  "dayLength": "Daglengte",
  "radarRings": "Afstandsringen",
  "shortcutServiceLink": "Plaats openen bij de weerdienst"
})
addCatalogEntries("tr", {
  "yesterdayShort": "düne göre",
  "fullMoon": "Dolunay",
  "newMoon": "Yeni ay",
  "moonToday": "bugün",
  "moonTomorrow": "yarın",
  "moonInDays": "{days} gün sonra",
  "openAtService": "Meteoroloji servisinde aç ({service})",
  "windUnit": "Rüzgâr birimi",
  "windUnitAuto": "Otomatik ({unit})",
  "windUnitKnots": "Knot",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Güncelleme",
  "refreshDefault": "Varsayılan ({minutes} dk'da bir)",
  "refreshEvery": "{minutes} dk'da bir",
  "refreshIntervalHint": "Tahminin ne sıklıkla yeniden yüklendiği; radar ve anlık tahmin kendi temposundadır. MET Norway en fazla 10 dakikada bir istiyor.",
  "compareYesterday": "Dünle karşılaştırma",
  "nextFullNewMoon": "Sonraki dolunay veya yeni ay",
  "serviceLinkButton": "“Meteoroloji servisinde aç” düğmesi",
  "dayLength": "Gün uzunluğu",
  "radarRings": "Mesafe halkaları",
  "shortcutServiceLink": "Yeri meteoroloji servisinde aç"
})
addCatalogEntries("cs", {
  "yesterdayShort": "oproti včerejšku",
  "fullMoon": "Úplněk",
  "newMoon": "Nov",
  "moonToday": "dnes",
  "moonTomorrow": "zítra",
  "moonInDays": "za {days} dní",
  "openAtService": "Otevřít u meteorologické služby ({service})",
  "windUnit": "Jednotka větru",
  "windUnitAuto": "Automaticky ({unit})",
  "windUnitKnots": "Uzly",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Aktualizace",
  "refreshDefault": "Výchozí (každých {minutes} min)",
  "refreshEvery": "každých {minutes} min",
  "refreshIntervalHint": "Jak často se předpověď načítá znovu; radar a nowcast mají vlastní tempo. MET Norway žádá nejvýše každých 10 minut.",
  "compareYesterday": "Srovnání se včerejškem",
  "nextFullNewMoon": "Příští úplněk nebo nov",
  "serviceLinkButton": "Tlačítko „Otevřít u meteorologické služby“",
  "dayLength": "Délka dne",
  "radarRings": "Vzdálenostní kruhy",
  "shortcutServiceLink": "Otevřít místo u meteorologické služby"
})
addCatalogEntries("sv", {
  "yesterdayShort": "mot igår",
  "fullMoon": "Fullmåne",
  "newMoon": "Nymåne",
  "moonToday": "idag",
  "moonTomorrow": "imorgon",
  "moonInDays": "om {days} dagar",
  "openAtService": "Öppna hos vädertjänsten ({service})",
  "windUnit": "Vindenhet",
  "windUnitAuto": "Automatisk ({unit})",
  "windUnitKnots": "Knop",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Uppdatering",
  "refreshDefault": "Standard (var {minutes}:e min)",
  "refreshEvery": "var {minutes}:e min",
  "refreshIntervalHint": "Hur ofta prognosen laddas om; radar och nowcast har egen takt. MET Norway ber om högst var 10:e minut.",
  "compareYesterday": "Jämfört med igår",
  "nextFullNewMoon": "Nästa fullmåne eller nymåne",
  "serviceLinkButton": "Knappen ”Öppna hos vädertjänsten”",
  "dayLength": "Daglängd",
  "radarRings": "Avståndsringar",
  "shortcutServiceLink": "Öppna platsen hos vädertjänsten"
})
addCatalogEntries("fi", {
  "yesterdayShort": "eiliseen",
  "fullMoon": "Täysikuu",
  "newMoon": "Uusikuu",
  "moonToday": "tänään",
  "moonTomorrow": "huomenna",
  "moonInDays": "{days} päivän päästä",
  "openAtService": "Avaa sääpalvelussa ({service})",
  "windUnit": "Tuulen yksikkö",
  "windUnitAuto": "Automaattinen ({unit})",
  "windUnitKnots": "Solmut",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Päivitys",
  "refreshDefault": "Oletus ({minutes} min välein)",
  "refreshEvery": "{minutes} min välein",
  "refreshIntervalHint": "Kuinka usein ennuste ladataan uudelleen; tutka ja nowcast kulkevat omaan tahtiinsa. MET Norway pyytää enintään 10 minuutin välein.",
  "compareYesterday": "Vertailu eiliseen",
  "nextFullNewMoon": "Seuraava täysikuu tai uusikuu",
  "serviceLinkButton": "Painike ”Avaa sääpalvelussa”",
  "dayLength": "Päivän pituus",
  "radarRings": "Etäisyysrenkaat",
  "shortcutServiceLink": "Avaa paikka sääpalvelussa"
})
addCatalogEntries("nb", {
  "yesterdayShort": "mot i går",
  "fullMoon": "Fullmåne",
  "newMoon": "Nymåne",
  "moonToday": "i dag",
  "moonTomorrow": "i morgen",
  "moonInDays": "om {days} dager",
  "openAtService": "Åpne hos værtjenesten ({service})",
  "windUnit": "Vindenhet",
  "windUnitAuto": "Automatisk ({unit})",
  "windUnitKnots": "Knop",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Oppdatering",
  "refreshDefault": "Standard (hvert {minutes}. min)",
  "refreshEvery": "hvert {minutes}. min",
  "refreshIntervalHint": "Hvor ofte varselet lastes på nytt; radar og nowcast har sin egen takt. MET Norway ber om høyst hvert 10. minutt.",
  "compareYesterday": "Sammenlignet med i går",
  "nextFullNewMoon": "Neste fullmåne eller nymåne",
  "serviceLinkButton": "Knappen «Åpne hos værtjenesten»",
  "dayLength": "Daglengde",
  "radarRings": "Avstandsringer",
  "shortcutServiceLink": "Åpne stedet hos værtjenesten"
})
addCatalogEntries("da", {
  "yesterdayShort": "mod i går",
  "fullMoon": "Fuldmåne",
  "newMoon": "Nymåne",
  "moonToday": "i dag",
  "moonTomorrow": "i morgen",
  "moonInDays": "om {days} dage",
  "openAtService": "Åbn hos vejrtjenesten ({service})",
  "windUnit": "Vindenhed",
  "windUnitAuto": "Automatisk ({unit})",
  "windUnitKnots": "Knob",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Opdatering",
  "refreshDefault": "Standard (hvert {minutes}. min)",
  "refreshEvery": "hvert {minutes}. min",
  "refreshIntervalHint": "Hvor ofte udsigten genindlæses; radar og nowcast har deres egen takt. MET Norway beder om højst hvert 10. minut.",
  "compareYesterday": "Sammenlignet med i går",
  "nextFullNewMoon": "Næste fuldmåne eller nymåne",
  "serviceLinkButton": "Knappen »Åbn hos vejrtjenesten«",
  "dayLength": "Daglængde",
  "radarRings": "Afstandsringe",
  "shortcutServiceLink": "Åbn stedet hos vejrtjenesten"
})
addCatalogEntries("ro", {
  "yesterdayShort": "față de ieri",
  "fullMoon": "Lună plină",
  "newMoon": "Lună nouă",
  "moonToday": "azi",
  "moonTomorrow": "mâine",
  "moonInDays": "peste {days} zile",
  "openAtService": "Deschide la serviciul meteo ({service})",
  "windUnit": "Unitatea vântului",
  "windUnitAuto": "Automat ({unit})",
  "windUnitKnots": "Noduri",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Actualizare",
  "refreshDefault": "Implicit (la fiecare {minutes} min)",
  "refreshEvery": "la fiecare {minutes} min",
  "refreshIntervalHint": "Cât de des se reîncarcă prognoza; radarul și nowcastul au ritmul lor. MET Norway cere cel mult la fiecare 10 minute.",
  "compareYesterday": "Comparație cu ieri",
  "nextFullNewMoon": "Următoarea lună plină sau nouă",
  "serviceLinkButton": "Butonul „Deschide la serviciul meteo”",
  "dayLength": "Durata zilei",
  "radarRings": "Cercuri de distanță",
  "shortcutServiceLink": "Deschide locul la serviciul meteo"
})
addCatalogEntries("hu", {
  "yesterdayShort": "tegnaphoz",
  "fullMoon": "Telihold",
  "newMoon": "Újhold",
  "moonToday": "ma",
  "moonTomorrow": "holnap",
  "moonInDays": "{days} nap múlva",
  "openAtService": "Megnyitás az időjárás-szolgálatnál ({service})",
  "windUnit": "Szél mértékegysége",
  "windUnitAuto": "Automatikus ({unit})",
  "windUnitKnots": "Csomó",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Frissítés",
  "refreshDefault": "Alapértelmezett ({minutes} percenként)",
  "refreshEvery": "{minutes} percenként",
  "refreshIntervalHint": "Milyen gyakran töltődik újra az előrejelzés; a radar és a nowcast saját ütemben halad. A MET Norway legfeljebb 10 percenkénti lekérést kér.",
  "compareYesterday": "Összehasonlítás a tegnappal",
  "nextFullNewMoon": "Következő telihold vagy újhold",
  "serviceLinkButton": "„Megnyitás az időjárás-szolgálatnál” gomb",
  "dayLength": "Nappal hossza",
  "radarRings": "Távolsággyűrűk",
  "shortcutServiceLink": "Hely megnyitása az időjárás-szolgálatnál"
})
addCatalogEntries("el", {
  "yesterdayShort": "σε σχέση με χθες",
  "fullMoon": "Πανσέληνος",
  "newMoon": "Νέα σελήνη",
  "moonToday": "σήμερα",
  "moonTomorrow": "αύριο",
  "moonInDays": "σε {days} ημέρες",
  "openAtService": "Άνοιγμα στη μετεωρολογική υπηρεσία ({service})",
  "windUnit": "Μονάδα ανέμου",
  "windUnitAuto": "Αυτόματα ({unit})",
  "windUnitKnots": "Κόμβοι",
  "windUnitBeaufort": "Μποφόρ",
  "refreshInterval": "Ενημέρωση",
  "refreshDefault": "Προεπιλογή (κάθε {minutes} λεπτά)",
  "refreshEvery": "κάθε {minutes} λεπτά",
  "refreshIntervalHint": "Πόσο συχνά φορτώνεται ξανά η πρόγνωση· ραντάρ και nowcast έχουν δικό τους ρυθμό. Η MET Norway ζητά το πολύ κάθε 10 λεπτά.",
  "compareYesterday": "Σύγκριση με χθες",
  "nextFullNewMoon": "Επόμενη πανσέληνος ή νέα σελήνη",
  "serviceLinkButton": "Κουμπί «Άνοιγμα στη μετεωρολογική υπηρεσία»",
  "dayLength": "Διάρκεια ημέρας",
  "radarRings": "Δακτύλιοι απόστασης",
  "shortcutServiceLink": "Άνοιγμα της τοποθεσίας στη μετεωρολογική υπηρεσία"
})
addCatalogEntries("zh_CN", {
  "yesterdayShort": "较昨日",
  "fullMoon": "满月",
  "newMoon": "新月",
  "moonToday": "今天",
  "moonTomorrow": "明天",
  "moonInDays": "{days} 天后",
  "openAtService": "在气象服务中打开（{service}）",
  "windUnit": "风速单位",
  "windUnitAuto": "自动（{unit}）",
  "windUnitKnots": "节",
  "windUnitBeaufort": "蒲福",
  "refreshInterval": "更新",
  "refreshDefault": "默认（每 {minutes} 分钟）",
  "refreshEvery": "每 {minutes} 分钟",
  "refreshIntervalHint": "预报重新加载的频率；雷达和临近预报有各自的节奏。MET Norway 要求最多每 10 分钟一次。",
  "compareYesterday": "与昨日比较",
  "nextFullNewMoon": "下一次满月或新月",
  "serviceLinkButton": "“在气象服务中打开”按钮",
  "dayLength": "昼长",
  "radarRings": "距离圈",
  "shortcutServiceLink": "在气象服务中打开该地点"
})
addCatalogEntries("zh_TW", {
  "yesterdayShort": "較昨日",
  "fullMoon": "滿月",
  "newMoon": "新月",
  "moonToday": "今天",
  "moonTomorrow": "明天",
  "moonInDays": "{days} 天後",
  "openAtService": "在氣象服務中開啟（{service}）",
  "windUnit": "風速單位",
  "windUnitAuto": "自動（{unit}）",
  "windUnitKnots": "節",
  "windUnitBeaufort": "蒲福",
  "refreshInterval": "更新",
  "refreshDefault": "預設（每 {minutes} 分鐘）",
  "refreshEvery": "每 {minutes} 分鐘",
  "refreshIntervalHint": "預報重新載入的頻率；雷達與即時預報有各自的節奏。MET Norway 要求最多每 10 分鐘一次。",
  "compareYesterday": "與昨日比較",
  "nextFullNewMoon": "下一次滿月或新月",
  "serviceLinkButton": "「在氣象服務中開啟」按鈕",
  "dayLength": "晝長",
  "radarRings": "距離圈",
  "shortcutServiceLink": "在氣象服務中開啟該地點"
})
addCatalogEntries("ja", {
  "yesterdayShort": "昨日比",
  "fullMoon": "満月",
  "newMoon": "新月",
  "moonToday": "今日",
  "moonTomorrow": "明日",
  "moonInDays": "{days} 日後",
  "openAtService": "気象サービスで開く（{service}）",
  "windUnit": "風速の単位",
  "windUnitAuto": "自動（{unit}）",
  "windUnitKnots": "ノット",
  "windUnitBeaufort": "ビューフォート",
  "refreshInterval": "更新",
  "refreshDefault": "既定（{minutes} 分ごと）",
  "refreshEvery": "{minutes} 分ごと",
  "refreshIntervalHint": "予報を再読み込みする頻度。レーダーとナウキャストは独自の間隔です。MET Norway は 10 分以上の間隔を求めています。",
  "compareYesterday": "昨日との比較",
  "nextFullNewMoon": "次の満月または新月",
  "serviceLinkButton": "「気象サービスで開く」ボタン",
  "dayLength": "日の長さ",
  "radarRings": "距離リング",
  "shortcutServiceLink": "この地点を気象サービスで開く"
})
addCatalogEntries("ko", {
  "yesterdayShort": "어제 대비",
  "fullMoon": "보름달",
  "newMoon": "삭(초승달 전)",
  "moonToday": "오늘",
  "moonTomorrow": "내일",
  "moonInDays": "{days}일 후",
  "openAtService": "기상 서비스에서 열기({service})",
  "windUnit": "풍속 단위",
  "windUnitAuto": "자동({unit})",
  "windUnitKnots": "노트",
  "windUnitBeaufort": "보퍼트",
  "refreshInterval": "업데이트",
  "refreshDefault": "기본값({minutes}분마다)",
  "refreshEvery": "{minutes}분마다",
  "refreshIntervalHint": "예보를 다시 불러오는 주기입니다. 레이더와 초단기 예보는 자체 주기를 따릅니다. MET Norway는 최소 10분 간격을 요청합니다.",
  "compareYesterday": "어제와 비교",
  "nextFullNewMoon": "다음 보름달 또는 삭",
  "serviceLinkButton": "‘기상 서비스에서 열기’ 버튼",
  "dayLength": "낮의 길이",
  "radarRings": "거리 원",
  "shortcutServiceLink": "이 장소를 기상 서비스에서 열기"
})
addCatalogEntries("ar", {
  "yesterdayShort": "مقارنة بالأمس",
  "fullMoon": "بدر",
  "newMoon": "محاق",
  "moonToday": "اليوم",
  "moonTomorrow": "غدًا",
  "moonInDays": "بعد {days} أيام",
  "openAtService": "فتح في خدمة الأرصاد ({service})",
  "windUnit": "وحدة الرياح",
  "windUnitAuto": "تلقائي ({unit})",
  "windUnitKnots": "عقدة",
  "windUnitBeaufort": "بوفورت",
  "refreshInterval": "التحديث",
  "refreshDefault": "الافتراضي (كل {minutes} دقيقة)",
  "refreshEvery": "كل {minutes} دقيقة",
  "refreshIntervalHint": "عدد مرات إعادة تحميل التوقعات؛ للرادار والتنبؤ الآني إيقاعهما الخاص. تطلب MET Norway ألا يزيد ذلك عن مرة كل 10 دقائق.",
  "compareYesterday": "مقارنة بالأمس",
  "nextFullNewMoon": "البدر أو المحاق القادم",
  "serviceLinkButton": "زر «فتح في خدمة الأرصاد»",
  "dayLength": "طول النهار",
  "radarRings": "حلقات المسافة",
  "shortcutServiceLink": "فتح المكان في خدمة الأرصاد"
})
addCatalogEntries("he", {
  "yesterdayShort": "לעומת אתמול",
  "fullMoon": "ירח מלא",
  "newMoon": "מולד",
  "moonToday": "היום",
  "moonTomorrow": "מחר",
  "moonInDays": "בעוד {days} ימים",
  "openAtService": "פתיחה בשירות המטאורולוגי ({service})",
  "windUnit": "יחידת רוח",
  "windUnitAuto": "אוטומטי ({unit})",
  "windUnitKnots": "קשרים",
  "windUnitBeaufort": "בופור",
  "refreshInterval": "עדכון",
  "refreshDefault": "ברירת מחדל (כל {minutes} דק׳)",
  "refreshEvery": "כל {minutes} דק׳",
  "refreshIntervalHint": "באיזו תדירות התחזית נטענת מחדש; למכ״ם ול-nowcast קצב משלהם. MET Norway מבקשת לא יותר מפעם ב-10 דקות.",
  "compareYesterday": "השוואה לאתמול",
  "nextFullNewMoon": "הירח המלא או המולד הבא",
  "serviceLinkButton": "כפתור „פתיחה בשירות המטאורולוגי”",
  "dayLength": "אורך היום",
  "radarRings": "טבעות מרחק",
  "shortcutServiceLink": "פתיחת המקום בשירות המטאורולוגי"
})
addCatalogEntries("fa", {
  "yesterdayShort": "نسبت به دیروز",
  "fullMoon": "ماه کامل",
  "newMoon": "ماه نو",
  "moonToday": "امروز",
  "moonTomorrow": "فردا",
  "moonInDays": "{days} روز دیگر",
  "openAtService": "باز کردن در سرویس هواشناسی ({service})",
  "windUnit": "واحد باد",
  "windUnitAuto": "خودکار ({unit})",
  "windUnitKnots": "گره",
  "windUnitBeaufort": "بوفورت",
  "refreshInterval": "به‌روزرسانی",
  "refreshDefault": "پیش‌فرض (هر {minutes} دقیقه)",
  "refreshEvery": "هر {minutes} دقیقه",
  "refreshIntervalHint": "هر چند وقت پیش‌بینی دوباره بارگیری شود؛ رادار و پیش‌بینی آنی ریتم خودشان را دارند. MET Norway درخواست می‌کند حداکثر هر ۱۰ دقیقه باشد.",
  "compareYesterday": "مقایسه با دیروز",
  "nextFullNewMoon": "ماه کامل یا ماه نوی بعدی",
  "serviceLinkButton": "دکمهٔ «باز کردن در سرویس هواشناسی»",
  "dayLength": "طول روز",
  "radarRings": "حلقه‌های فاصله",
  "shortcutServiceLink": "باز کردن مکان در سرویس هواشناسی"
})
addCatalogEntries("hi", {
  "yesterdayShort": "कल की तुलना में",
  "fullMoon": "पूर्णिमा",
  "newMoon": "अमावस्या",
  "moonToday": "आज",
  "moonTomorrow": "कल",
  "moonInDays": "{days} दिन में",
  "openAtService": "मौसम सेवा पर खोलें ({service})",
  "windUnit": "हवा की इकाई",
  "windUnitAuto": "स्वचालित ({unit})",
  "windUnitKnots": "नॉट",
  "windUnitBeaufort": "ब्यूफ़ोर्ट",
  "refreshInterval": "अपडेट",
  "refreshDefault": "डिफ़ॉल्ट (हर {minutes} मिनट)",
  "refreshEvery": "हर {minutes} मिनट",
  "refreshIntervalHint": "पूर्वानुमान कितनी बार फिर से लोड हो; रडार और नाउकास्ट अपनी गति से चलते हैं। MET Norway अधिकतम हर 10 मिनट का अनुरोध करता है।",
  "compareYesterday": "कल से तुलना",
  "nextFullNewMoon": "अगली पूर्णिमा या अमावस्या",
  "serviceLinkButton": "“मौसम सेवा पर खोलें” बटन",
  "dayLength": "दिन की लंबाई",
  "radarRings": "दूरी के वृत्त",
  "shortcutServiceLink": "स्थान को मौसम सेवा पर खोलें"
})
addCatalogEntries("id", {
  "yesterdayShort": "vs kemarin",
  "fullMoon": "Bulan purnama",
  "newMoon": "Bulan baru",
  "moonToday": "hari ini",
  "moonTomorrow": "besok",
  "moonInDays": "dalam {days} hari",
  "openAtService": "Buka di layanan cuaca ({service})",
  "windUnit": "Satuan angin",
  "windUnitAuto": "Otomatis ({unit})",
  "windUnitKnots": "Knot",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Pembaruan",
  "refreshDefault": "Bawaan (setiap {minutes} mnt)",
  "refreshEvery": "setiap {minutes} mnt",
  "refreshIntervalHint": "Seberapa sering prakiraan dimuat ulang; radar dan nowcast punya ritme sendiri. MET Norway meminta paling sering setiap 10 menit.",
  "compareYesterday": "Dibandingkan kemarin",
  "nextFullNewMoon": "Purnama atau bulan baru berikutnya",
  "serviceLinkButton": "Tombol “Buka di layanan cuaca”",
  "dayLength": "Lama siang",
  "radarRings": "Cincin jarak",
  "shortcutServiceLink": "Buka tempat di layanan cuaca"
})
addCatalogEntries("vi", {
  "yesterdayShort": "so với hôm qua",
  "fullMoon": "Trăng tròn",
  "newMoon": "Trăng non",
  "moonToday": "hôm nay",
  "moonTomorrow": "ngày mai",
  "moonInDays": "sau {days} ngày",
  "openAtService": "Mở tại dịch vụ thời tiết ({service})",
  "windUnit": "Đơn vị gió",
  "windUnitAuto": "Tự động ({unit})",
  "windUnitKnots": "Hải lý/giờ",
  "windUnitBeaufort": "Beaufort",
  "refreshInterval": "Cập nhật",
  "refreshDefault": "Mặc định (mỗi {minutes} phút)",
  "refreshEvery": "mỗi {minutes} phút",
  "refreshIntervalHint": "Tần suất tải lại dự báo; radar và nowcast có nhịp riêng. MET Norway yêu cầu không quá mỗi 10 phút.",
  "compareYesterday": "So với hôm qua",
  "nextFullNewMoon": "Trăng tròn hoặc trăng non tiếp theo",
  "serviceLinkButton": "Nút “Mở tại dịch vụ thời tiết”",
  "dayLength": "Độ dài ngày",
  "radarRings": "Vòng khoảng cách",
  "shortcutServiceLink": "Mở địa điểm tại dịch vụ thời tiết"
})
addCatalogEntries("th", {
  "yesterdayShort": "เทียบเมื่อวาน",
  "fullMoon": "จันทร์เต็มดวง",
  "newMoon": "จันทร์ดับ",
  "moonToday": "วันนี้",
  "moonTomorrow": "พรุ่งนี้",
  "moonInDays": "อีก {days} วัน",
  "openAtService": "เปิดที่บริการอุตุนิยมวิทยา ({service})",
  "windUnit": "หน่วยลม",
  "windUnitAuto": "อัตโนมัติ ({unit})",
  "windUnitKnots": "นอต",
  "windUnitBeaufort": "โบฟอร์ต",
  "refreshInterval": "การอัปเดต",
  "refreshDefault": "ค่าเริ่มต้น (ทุก {minutes} นาที)",
  "refreshEvery": "ทุก {minutes} นาที",
  "refreshIntervalHint": "ความถี่ในการโหลดพยากรณ์ใหม่ เรดาร์และ nowcast มีจังหวะของตัวเอง MET Norway ขอให้ไม่ถี่กว่าทุก 10 นาที",
  "compareYesterday": "เทียบกับเมื่อวาน",
  "nextFullNewMoon": "จันทร์เต็มดวงหรือจันทร์ดับครั้งถัดไป",
  "serviceLinkButton": "ปุ่ม “เปิดที่บริการอุตุนิยมวิทยา”",
  "dayLength": "ความยาวกลางวัน",
  "radarRings": "วงระยะทาง",
  "shortcutServiceLink": "เปิดสถานที่ที่บริการอุตุนิยมวิทยา"
})

// Day length change as its own entry (2.5).
addCatalogEntries("en", { "dayLengthChange": "Change in day length" })
addCatalogEntries("de", { "dayLengthChange": "Änderung der Tageslänge" })
addCatalogEntries("es", { "dayLengthChange": "Cambio de la duración del día" })
addCatalogEntries("fr", { "dayLengthChange": "Variation de la durée du jour" })
addCatalogEntries("pt", { "dayLengthChange": "Variação da duração do dia" })
addCatalogEntries("ru", { "dayLengthChange": "Изменение долготы дня" })
addCatalogEntries("uk", { "dayLengthChange": "Зміна тривалості дня" })
addCatalogEntries("pl", { "dayLengthChange": "Zmiana długości dnia" })
addCatalogEntries("it", { "dayLengthChange": "Variazione della durata del giorno" })
addCatalogEntries("nl", { "dayLengthChange": "Verandering van de daglengte" })
addCatalogEntries("tr", { "dayLengthChange": "Gün uzunluğundaki değişim" })
addCatalogEntries("cs", { "dayLengthChange": "Změna délky dne" })
addCatalogEntries("sv", { "dayLengthChange": "Förändring av daglängden" })
addCatalogEntries("fi", { "dayLengthChange": "Päivän pituuden muutos" })
addCatalogEntries("nb", { "dayLengthChange": "Endring i daglengden" })
addCatalogEntries("da", { "dayLengthChange": "Ændring i daglængden" })
addCatalogEntries("ro", { "dayLengthChange": "Variația duratei zilei" })
addCatalogEntries("hu", { "dayLengthChange": "A nappal hosszának változása" })
addCatalogEntries("el", { "dayLengthChange": "Μεταβολή της διάρκειας ημέρας" })
addCatalogEntries("zh_CN", { "dayLengthChange": "昼长变化" })
addCatalogEntries("zh_TW", { "dayLengthChange": "晝長變化" })
addCatalogEntries("ja", { "dayLengthChange": "日の長さの変化" })
addCatalogEntries("ko", { "dayLengthChange": "낮 길이 변화" })
addCatalogEntries("ar", { "dayLengthChange": "تغيّر طول النهار" })
addCatalogEntries("he", { "dayLengthChange": "שינוי באורך היום" })
addCatalogEntries("fa", { "dayLengthChange": "تغییر طول روز" })
addCatalogEntries("hi", { "dayLengthChange": "दिन की लंबाई में बदलाव" })
addCatalogEntries("id", { "dayLengthChange": "Perubahan lama siang" })
addCatalogEntries("vi", { "dayLengthChange": "Thay đổi độ dài ngày" })
addCatalogEntries("th", { "dayLengthChange": "การเปลี่ยนแปลงความยาวกลางวัน" })

// General settings page and separate radar interval (2.5).
addCatalogEntries("en", {
  "settingsPageGeneral": "General",
  "generalSubtitle": "For the menu bar, widget and app",
  "settingsGeneralKeysHint": "Keyboard: ↑↓ go to a setting · ←→ change it · Space / Enter open the list",
  "refreshForecast": "Forecast",
  "refreshRadar": "Radar and rain nowcast",
  "radarRefreshAuto": "Every new measurement (about 5 min)",
  "refreshIntervalHint": "The forecast changes slowly; radar and nowcast bring new measurements about every 5 minutes, and a longer interval saves data. MET Norway asks for no more than every 10 minutes."
})
addCatalogEntries("de", {
  "settingsPageGeneral": "Allgemein",
  "generalSubtitle": "Für Menüleiste, Widget und App",
  "settingsGeneralKeysHint": "Tastatur: ↑↓ zur Einstellung · ←→ ändern · Leertaste / Enter öffnet die Liste",
  "refreshForecast": "Vorhersage",
  "refreshRadar": "Radar und Regen-Nowcast",
  "radarRefreshAuto": "Jede neue Messung (ca. 5 min)",
  "refreshIntervalHint": "Die Vorhersage ändert sich langsam; Radar und Nowcast liefern etwa alle 5 Minuten neue Messungen, ein längeres Intervall spart Daten. MET Norway bittet um höchstens alle 10 Minuten."
})
addCatalogEntries("es", {
  "settingsPageGeneral": "General",
  "generalSubtitle": "Para la barra, el widget y la aplicación",
  "settingsGeneralKeysHint": "Teclado: ↑↓ ir a un ajuste · ←→ cambiarlo · Espacio / Intro abre la lista",
  "refreshForecast": "Previsión",
  "refreshRadar": "Radar y nowcast de lluvia",
  "radarRefreshAuto": "Cada nueva medición (unos 5 min)",
  "refreshIntervalHint": "La previsión cambia despacio; radar y nowcast traen mediciones nuevas cada 5 minutos aprox., y un intervalo mayor ahorra datos. MET Norway pide no más de cada 10 minutos."
})
addCatalogEntries("fr", {
  "settingsPageGeneral": "Général",
  "generalSubtitle": "Pour la barre, le widget et l’application",
  "settingsGeneralKeysHint": "Clavier : ↑↓ vers un réglage · ←→ le modifier · Espace / Entrée ouvre la liste",
  "refreshForecast": "Prévision",
  "refreshRadar": "Radar et nowcast de pluie",
  "radarRefreshAuto": "Chaque nouvelle mesure (env. 5 min)",
  "refreshIntervalHint": "La prévision évolue lentement ; radar et nowcast apportent de nouvelles mesures env. toutes les 5 minutes, un intervalle plus long économise des données. MET Norway demande au plus toutes les 10 minutes."
})
addCatalogEntries("pt", {
  "settingsPageGeneral": "Geral",
  "generalSubtitle": "Para a barra, o widget e o app",
  "settingsGeneralKeysHint": "Teclado: ↑↓ ir a uma opção · ←→ alterá-la · Espaço / Enter abre a lista",
  "refreshForecast": "Previsão",
  "refreshRadar": "Radar e nowcast de chuva",
  "radarRefreshAuto": "Cada nova medição (cerca de 5 min)",
  "refreshIntervalHint": "A previsão muda devagar; radar e nowcast trazem medições novas a cada 5 minutos aprox., e um intervalo maior economiza dados. A MET Norway pede no máximo a cada 10 minutos."
})
addCatalogEntries("ru", {
  "settingsPageGeneral": "Общие",
  "generalSubtitle": "Для панели, виджета и приложения",
  "settingsGeneralKeysHint": "Клавиатура: ↑↓ — к настройке · ←→ — изменить · Пробел / Enter — открыть список",
  "refreshForecast": "Прогноз",
  "refreshRadar": "Радар и наукаст осадков",
  "radarRefreshAuto": "Каждое новое измерение (около 5 мин)",
  "refreshIntervalHint": "Прогноз меняется медленно; радар и наукаст дают новые измерения примерно каждые 5 минут, более длинный интервал экономит данные. MET Norway просит не чаще раза в 10 минут."
})
addCatalogEntries("uk", {
  "settingsPageGeneral": "Загальні",
  "generalSubtitle": "Для панелі, віджета й застосунку",
  "settingsGeneralKeysHint": "Клавіатура: ↑↓ — до налаштування · ←→ — змінити · Пробіл / Enter — відкрити список",
  "refreshForecast": "Прогноз",
  "refreshRadar": "Радар і наукаст опадів",
  "radarRefreshAuto": "Кожне нове вимірювання (близько 5 хв)",
  "refreshIntervalHint": "Прогноз змінюється повільно; радар і наукаст дають нові вимірювання приблизно кожні 5 хвилин, довший інтервал заощаджує дані. MET Norway просить не частіше ніж раз на 10 хвилин."
})
addCatalogEntries("pl", {
  "settingsPageGeneral": "Ogólne",
  "generalSubtitle": "Dla paska, widżetu i aplikacji",
  "settingsGeneralKeysHint": "Klawiatura: ↑↓ do ustawienia · ←→ zmiana · Spacja / Enter otwiera listę",
  "refreshForecast": "Prognoza",
  "refreshRadar": "Radar i nowcast opadów",
  "radarRefreshAuto": "Każdy nowy pomiar (ok. 5 min)",
  "refreshIntervalHint": "Prognoza zmienia się powoli; radar i nowcast dają nowe pomiary mniej więcej co 5 minut, dłuższy odstęp oszczędza dane. MET Norway prosi o nie częściej niż co 10 minut."
})
addCatalogEntries("it", {
  "settingsPageGeneral": "Generali",
  "generalSubtitle": "Per barra, widget e app",
  "settingsGeneralKeysHint": "Tastiera: ↑↓ a un’impostazione · ←→ cambiarla · Spazio / Invio apre l’elenco",
  "refreshForecast": "Previsione",
  "refreshRadar": "Radar e nowcast della pioggia",
  "radarRefreshAuto": "Ogni nuova misura (circa 5 min)",
  "refreshIntervalHint": "La previsione cambia lentamente; radar e nowcast portano nuove misure circa ogni 5 minuti, un intervallo più lungo risparmia dati. MET Norway chiede non più di ogni 10 minuti."
})
addCatalogEntries("nl", {
  "settingsPageGeneral": "Algemeen",
  "generalSubtitle": "Voor balk, widget en app",
  "settingsGeneralKeysHint": "Toetsenbord: ↑↓ naar een instelling · ←→ wijzigen · Spatie / Enter opent de lijst",
  "refreshForecast": "Verwachting",
  "refreshRadar": "Radar en regen-nowcast",
  "radarRefreshAuto": "Elke nieuwe meting (ca. 5 min)",
  "refreshIntervalHint": "De verwachting verandert langzaam; radar en nowcast leveren ongeveer elke 5 minuten nieuwe metingen, een langer interval spaart data. MET Norway vraagt om hoogstens elke 10 minuten."
})
addCatalogEntries("tr", {
  "settingsPageGeneral": "Genel",
  "generalSubtitle": "Çubuk, widget ve uygulama için",
  "settingsGeneralKeysHint": "Klavye: ↑↓ ayara git · ←→ değiştir · Boşluk / Enter listeyi açar",
  "refreshForecast": "Tahmin",
  "refreshRadar": "Radar ve yağış anlık tahmini",
  "radarRefreshAuto": "Her yeni ölçüm (yaklaşık 5 dk)",
  "refreshIntervalHint": "Tahmin yavaş değişir; radar ve anlık tahmin yaklaşık 5 dakikada bir yeni ölçüm getirir, daha uzun aralık veri tasarrufu sağlar. MET Norway en fazla 10 dakikada bir istiyor."
})
addCatalogEntries("cs", {
  "settingsPageGeneral": "Obecné",
  "generalSubtitle": "Pro lištu, widget a aplikaci",
  "settingsGeneralKeysHint": "Klávesnice: ↑↓ na nastavení · ←→ změnit · Mezerník / Enter otevře seznam",
  "refreshForecast": "Předpověď",
  "refreshRadar": "Radar a nowcast srážek",
  "radarRefreshAuto": "Každé nové měření (asi 5 min)",
  "refreshIntervalHint": "Předpověď se mění pomalu; radar a nowcast přinášejí nová měření asi každých 5 minut, delší interval šetří data. MET Norway žádá nejvýše každých 10 minut."
})
addCatalogEntries("sv", {
  "settingsPageGeneral": "Allmänt",
  "generalSubtitle": "För listen, widgeten och appen",
  "settingsGeneralKeysHint": "Tangentbord: ↑↓ till en inställning · ←→ ändra · Mellanslag / Enter öppnar listan",
  "refreshForecast": "Prognos",
  "refreshRadar": "Radar och regn-nowcast",
  "radarRefreshAuto": "Varje ny mätning (ca 5 min)",
  "refreshIntervalHint": "Prognosen ändras långsamt; radar och nowcast ger nya mätningar ungefär var 5:e minut, ett längre intervall sparar data. MET Norway ber om högst var 10:e minut."
})
addCatalogEntries("fi", {
  "settingsPageGeneral": "Yleiset",
  "generalSubtitle": "Palkille, pienoisohjelmalle ja sovellukselle",
  "settingsGeneralKeysHint": "Näppäimistö: ↑↓ asetukseen · ←→ muuta · Välilyönti / Enter avaa luettelon",
  "refreshForecast": "Ennuste",
  "refreshRadar": "Tutka ja sadenowcast",
  "radarRefreshAuto": "Jokainen uusi mittaus (n. 5 min)",
  "refreshIntervalHint": "Ennuste muuttuu hitaasti; tutka ja nowcast tuovat uusia mittauksia noin 5 minuutin välein, pidempi väli säästää dataa. MET Norway pyytää enintään 10 minuutin välein."
})
addCatalogEntries("nb", {
  "settingsPageGeneral": "Generelt",
  "generalSubtitle": "For linjen, widgeten og appen",
  "settingsGeneralKeysHint": "Tastatur: ↑↓ til en innstilling · ←→ endre · Mellomrom / Enter åpner listen",
  "refreshForecast": "Varsel",
  "refreshRadar": "Radar og regn-nowcast",
  "radarRefreshAuto": "Hver ny måling (ca. 5 min)",
  "refreshIntervalHint": "Varselet endrer seg sakte; radar og nowcast gir nye målinger omtrent hvert 5. minutt, et lengre intervall sparer data. MET Norway ber om høyst hvert 10. minutt."
})
addCatalogEntries("da", {
  "settingsPageGeneral": "Generelt",
  "generalSubtitle": "Til bjælken, widgetten og appen",
  "settingsGeneralKeysHint": "Tastatur: ↑↓ til en indstilling · ←→ ændr · Mellemrum / Enter åbner listen",
  "refreshForecast": "Udsigt",
  "refreshRadar": "Radar og regn-nowcast",
  "radarRefreshAuto": "Hver ny måling (ca. 5 min)",
  "refreshIntervalHint": "Udsigten ændrer sig langsomt; radar og nowcast giver nye målinger omtrent hvert 5. minut, et længere interval sparer data. MET Norway beder om højst hvert 10. minut."
})
addCatalogEntries("ro", {
  "settingsPageGeneral": "General",
  "generalSubtitle": "Pentru bară, widget și aplicație",
  "settingsGeneralKeysHint": "Tastatură: ↑↓ la o setare · ←→ modifică · Spațiu / Enter deschide lista",
  "refreshForecast": "Prognoză",
  "refreshRadar": "Radar și nowcast de ploaie",
  "radarRefreshAuto": "Fiecare măsurătoare nouă (circa 5 min)",
  "refreshIntervalHint": "Prognoza se schimbă încet; radarul și nowcastul aduc măsurători noi cam la 5 minute, un interval mai lung economisește date. MET Norway cere cel mult la fiecare 10 minute."
})
addCatalogEntries("hu", {
  "settingsPageGeneral": "Általános",
  "generalSubtitle": "A sávhoz, a widgethez és az alkalmazáshoz",
  "settingsGeneralKeysHint": "Billentyűzet: ↑↓ beállításhoz · ←→ módosít · Szóköz / Enter megnyitja a listát",
  "refreshForecast": "Előrejelzés",
  "refreshRadar": "Radar és csapadék-nowcast",
  "radarRefreshAuto": "Minden új mérés (kb. 5 perc)",
  "refreshIntervalHint": "Az előrejelzés lassan változik; a radar és a nowcast kb. 5 percenként hoz új méréseket, a hosszabb időköz adatot takarít meg. A MET Norway legfeljebb 10 percenkénti lekérést kér."
})
addCatalogEntries("el", {
  "settingsPageGeneral": "Γενικά",
  "generalSubtitle": "Για γραμμή, widget και εφαρμογή",
  "settingsGeneralKeysHint": "Πληκτρολόγιο: ↑↓ σε ρύθμιση · ←→ αλλαγή · Διάστημα / Enter ανοίγει τη λίστα",
  "refreshForecast": "Πρόγνωση",
  "refreshRadar": "Ραντάρ και nowcast βροχής",
  "radarRefreshAuto": "Κάθε νέα μέτρηση (περίπου 5 λεπτά)",
  "refreshIntervalHint": "Η πρόγνωση αλλάζει αργά· ραντάρ και nowcast φέρνουν νέες μετρήσεις περίπου κάθε 5 λεπτά, και μεγαλύτερο διάστημα εξοικονομεί δεδομένα. Η MET Norway ζητά το πολύ κάθε 10 λεπτά."
})
addCatalogEntries("zh_CN", {
  "settingsPageGeneral": "通用",
  "generalSubtitle": "适用于菜单栏、小组件和应用",
  "settingsGeneralKeysHint": "键盘：↑↓ 移到设置项 · ←→ 更改 · 空格 / 回车打开列表",
  "refreshForecast": "预报",
  "refreshRadar": "雷达和降雨临近预报",
  "radarRefreshAuto": "每次新测量（约 5 分钟）",
  "refreshIntervalHint": "预报变化较慢；雷达和临近预报约每 5 分钟带来新测量，间隔更长可节省流量。MET Norway 要求最多每 10 分钟一次。"
})
addCatalogEntries("zh_TW", {
  "settingsPageGeneral": "一般",
  "generalSubtitle": "適用於選單列、小工具與應用程式",
  "settingsGeneralKeysHint": "鍵盤：↑↓ 移到設定項 · ←→ 變更 · 空白鍵 / Enter 開啟清單",
  "refreshForecast": "預報",
  "refreshRadar": "雷達與降雨即時預報",
  "radarRefreshAuto": "每次新測量（約 5 分鐘）",
  "refreshIntervalHint": "預報變化較慢；雷達與即時預報約每 5 分鐘帶來新測量，間隔較長可節省流量。MET Norway 要求最多每 10 分鐘一次。"
})
addCatalogEntries("ja", {
  "settingsPageGeneral": "一般",
  "generalSubtitle": "メニューバー、ウィジェット、アプリ共通",
  "settingsGeneralKeysHint": "キーボード：↑↓ で設定へ · ←→ で変更 · Space / Enter でリストを開く",
  "refreshForecast": "予報",
  "refreshRadar": "レーダーと降水ナウキャスト",
  "radarRefreshAuto": "新しい観測ごと（約5分）",
  "refreshIntervalHint": "予報はゆっくり変わります。レーダーとナウキャストは約5分ごとに新しい観測を届け、長めの間隔ならデータを節約できます。MET Norway は 10 分以上の間隔を求めています。"
})
addCatalogEntries("ko", {
  "settingsPageGeneral": "일반",
  "generalSubtitle": "메뉴 막대, 위젯, 앱 공통",
  "settingsGeneralKeysHint": "키보드: ↑↓ 설정으로 이동 · ←→ 변경 · Space / Enter 목록 열기",
  "refreshForecast": "예보",
  "refreshRadar": "레이더 및 강수 초단기 예보",
  "radarRefreshAuto": "새 관측마다(약 5분)",
  "refreshIntervalHint": "예보는 천천히 바뀝니다. 레이더와 초단기 예보는 약 5분마다 새 관측을 제공하며, 간격을 늘리면 데이터를 절약합니다. MET Norway는 최소 10분 간격을 요청합니다."
})
addCatalogEntries("ar", {
  "settingsPageGeneral": "عام",
  "generalSubtitle": "للشريط والأداة والتطبيق",
  "settingsGeneralKeysHint": "لوحة المفاتيح: ↑↓ إلى إعداد · ←→ للتغيير · المسافة / Enter لفتح القائمة",
  "refreshForecast": "التوقعات",
  "refreshRadar": "الرادار والتنبؤ الآني بالمطر",
  "radarRefreshAuto": "كل قياس جديد (نحو 5 دقائق)",
  "refreshIntervalHint": "تتغير التوقعات ببطء؛ يأتي الرادار والتنبؤ الآني بقياسات جديدة كل 5 دقائق تقريبًا، والفاصل الأطول يوفر البيانات. تطلب MET Norway ألا يزيد ذلك عن مرة كل 10 دقائق."
})
addCatalogEntries("he", {
  "settingsPageGeneral": "כללי",
  "generalSubtitle": "לסרגל, לווידג׳ט ולאפליקציה",
  "settingsGeneralKeysHint": "מקלדת: ↑↓ להגדרה · ←→ שינוי · רווח / Enter פותח את הרשימה",
  "refreshForecast": "תחזית",
  "refreshRadar": "מכ״ם ו-nowcast גשם",
  "radarRefreshAuto": "כל מדידה חדשה (כ-5 דק׳)",
  "refreshIntervalHint": "התחזית משתנה לאט; המכ״ם וה-nowcast מביאים מדידות חדשות בערך כל 5 דקות, ומרווח ארוך יותר חוסך נתונים. MET Norway מבקשת לא יותר מפעם ב-10 דקות."
})
addCatalogEntries("fa", {
  "settingsPageGeneral": "عمومی",
  "generalSubtitle": "برای نوار، ابزارک و برنامه",
  "settingsGeneralKeysHint": "صفحه‌کلید: ↑↓ رفتن به تنظیم · ←→ تغییر · فاصله / Enter باز کردن فهرست",
  "refreshForecast": "پیش‌بینی",
  "refreshRadar": "رادار و پیش‌بینی آنی باران",
  "radarRefreshAuto": "هر اندازه‌گیری تازه (حدود ۵ دقیقه)",
  "refreshIntervalHint": "پیش‌بینی آهسته تغییر می‌کند؛ رادار و پیش‌بینی آنی حدود هر ۵ دقیقه اندازه‌گیری تازه می‌آورند و فاصلهٔ طولانی‌تر داده صرفه‌جویی می‌کند. MET Norway درخواست می‌کند حداکثر هر ۱۰ دقیقه باشد."
})
addCatalogEntries("hi", {
  "settingsPageGeneral": "सामान्य",
  "generalSubtitle": "मेनू बार, विजेट और ऐप के लिए",
  "settingsGeneralKeysHint": "कीबोर्ड: ↑↓ सेटिंग पर जाएँ · ←→ बदलें · Space / Enter सूची खोलें",
  "refreshForecast": "पूर्वानुमान",
  "refreshRadar": "रडार और बारिश नाउकास्ट",
  "radarRefreshAuto": "हर नया मापन (लगभग 5 मिनट)",
  "refreshIntervalHint": "पूर्वानुमान धीरे बदलता है; रडार और नाउकास्ट लगभग हर 5 मिनट में नए मापन लाते हैं, लंबा अंतराल डेटा बचाता है। MET Norway अधिकतम हर 10 मिनट का अनुरोध करता है।"
})
addCatalogEntries("id", {
  "settingsPageGeneral": "Umum",
  "generalSubtitle": "Untuk bilah, widget, dan aplikasi",
  "settingsGeneralKeysHint": "Keyboard: ↑↓ ke pengaturan · ←→ ubah · Spasi / Enter buka daftar",
  "refreshForecast": "Prakiraan",
  "refreshRadar": "Radar dan nowcast hujan",
  "radarRefreshAuto": "Setiap pengukuran baru (sekitar 5 mnt)",
  "refreshIntervalHint": "Prakiraan berubah lambat; radar dan nowcast membawa pengukuran baru sekitar setiap 5 menit, dan interval lebih lama menghemat data. MET Norway meminta paling sering setiap 10 menit."
})
addCatalogEntries("vi", {
  "settingsPageGeneral": "Chung",
  "generalSubtitle": "Cho thanh, tiện ích và ứng dụng",
  "settingsGeneralKeysHint": "Bàn phím: ↑↓ tới cài đặt · ←→ thay đổi · Space / Enter mở danh sách",
  "refreshForecast": "Dự báo",
  "refreshRadar": "Radar và nowcast mưa",
  "radarRefreshAuto": "Mỗi lần đo mới (khoảng 5 phút)",
  "refreshIntervalHint": "Dự báo thay đổi chậm; radar và nowcast mang lại số đo mới khoảng mỗi 5 phút, khoảng dài hơn giúp tiết kiệm dữ liệu. MET Norway yêu cầu không quá mỗi 10 phút."
})
addCatalogEntries("th", {
  "settingsPageGeneral": "ทั่วไป",
  "generalSubtitle": "สำหรับแถบ วิดเจ็ต และแอป",
  "settingsGeneralKeysHint": "แป้นพิมพ์: ↑↓ ไปยังการตั้งค่า · ←→ เปลี่ยน · Space / Enter เปิดรายการ",
  "refreshForecast": "พยากรณ์",
  "refreshRadar": "เรดาร์และ nowcast ฝน",
  "radarRefreshAuto": "ทุกการวัดใหม่ (ราว 5 นาที)",
  "refreshIntervalHint": "พยากรณ์เปลี่ยนช้า เรดาร์และ nowcast ให้ค่าวัดใหม่ราวทุก 5 นาที ช่วงที่นานขึ้นช่วยประหยัดข้อมูล MET Norway ขอให้ไม่ถี่กว่าทุก 10 นาที"
})

// Colour accents (2.5).
addCatalogEntries("en", {
  "colorAccents": "Colour accents",
  "colorAccentsHint": "Temperatures by warmth, rain chance by height, UV and strong wind by level, and the week's temperature bars in colour, from the current Omarchy theme's palette.",
  "temperatureBar": "Temperature bar (week)"
})
addCatalogEntries("de", {
  "colorAccents": "Farbakzente",
  "colorAccentsHint": "Temperaturen nach Wärme, Regenwahrscheinlichkeit nach Höhe, UV und starker Wind nach Stufe sowie die Temperaturbalken der Woche farbig – in den Farben des aktuellen Omarchy-Themes.",
  "temperatureBar": "Temperaturbalken (Woche)"
})
addCatalogEntries("es", {
  "colorAccents": "Acentos de color",
  "colorAccentsHint": "Temperaturas según el calor, probabilidad de lluvia según su valor, UV y viento fuerte según el nivel, y las barras de temperatura de la semana en color, con la paleta del tema de Omarchy actual.",
  "temperatureBar": "Barra de temperatura (semana)"
})
addCatalogEntries("fr", {
  "colorAccents": "Accents de couleur",
  "colorAccentsHint": "Températures selon la chaleur, probabilité de pluie selon sa valeur, UV et vent fort selon le niveau, et barres de température de la semaine en couleur, dans la palette du thème Omarchy actuel.",
  "temperatureBar": "Barre de température (semaine)"
})
addCatalogEntries("pt", {
  "colorAccents": "Destaques de cor",
  "colorAccentsHint": "Temperaturas pelo calor, probabilidade de chuva pelo valor, UV e vento forte pelo nível e as barras de temperatura da semana em cor, com a paleta do tema Omarchy atual.",
  "temperatureBar": "Barra de temperatura (semana)"
})
addCatalogEntries("ru", {
  "colorAccents": "Цветовые акценты",
  "colorAccentsHint": "Температура по теплу, вероятность осадков по величине, УФ и сильный ветер по уровню и температурные полосы недели — в цветах текущей темы Omarchy.",
  "temperatureBar": "Полоса температуры (неделя)"
})
addCatalogEntries("uk", {
  "colorAccents": "Кольорові акценти",
  "colorAccentsHint": "Температура за теплом, імовірність опадів за величиною, УФ і сильний вітер за рівнем і температурні смуги тижня — у кольорах поточної теми Omarchy.",
  "temperatureBar": "Смуга температури (тиждень)"
})
addCatalogEntries("pl", {
  "colorAccents": "Akcenty kolorystyczne",
  "colorAccentsHint": "Temperatury według ciepła, szansa opadów według wartości, UV i silny wiatr według poziomu oraz paski temperatury tygodnia w kolorze, z palety bieżącego motywu Omarchy.",
  "temperatureBar": "Pasek temperatury (tydzień)"
})
addCatalogEntries("it", {
  "colorAccents": "Accenti di colore",
  "colorAccentsHint": "Temperature secondo il calore, probabilità di pioggia secondo il valore, UV e vento forte secondo il livello e le barre di temperatura della settimana a colori, con la palette del tema Omarchy attuale.",
  "temperatureBar": "Barra della temperatura (settimana)"
})
addCatalogEntries("nl", {
  "colorAccents": "Kleuraccenten",
  "colorAccentsHint": "Temperaturen naar warmte, regenkans naar hoogte, UV en harde wind naar niveau en de temperatuurbalken van de week in kleur, uit het palet van het huidige Omarchy-thema.",
  "temperatureBar": "Temperatuurbalk (week)"
})
addCatalogEntries("tr", {
  "colorAccents": "Renk vurguları",
  "colorAccentsHint": "Sıcaklıklar ısıya, yağış olasılığı değerine, UV ve kuvvetli rüzgâr seviyesine göre ve haftanın sıcaklık çubukları renkli; mevcut Omarchy temasının paletiyle.",
  "temperatureBar": "Sıcaklık çubuğu (hafta)"
})
addCatalogEntries("cs", {
  "colorAccents": "Barevné akcenty",
  "colorAccentsHint": "Teploty podle tepla, pravděpodobnost srážek podle výše, UV a silný vítr podle stupně a teplotní pruhy týdne barevně – v paletě aktuálního motivu Omarchy.",
  "temperatureBar": "Teplotní pruh (týden)"
})
addCatalogEntries("sv", {
  "colorAccents": "Färgaccenter",
  "colorAccentsHint": "Temperaturer efter värme, regnrisk efter nivå, UV och hård vind efter styrka samt veckans temperaturstaplar i färg, ur paletten för det aktuella Omarchy-temat.",
  "temperatureBar": "Temperaturstapel (vecka)"
})
addCatalogEntries("fi", {
  "colorAccents": "Väriaksentit",
  "colorAccentsHint": "Lämpötilat lämmön, sateen todennäköisyys arvon, UV ja kova tuuli tason mukaan sekä viikon lämpötilapalkit värillisinä – nykyisen Omarchy-teeman paletista.",
  "temperatureBar": "Lämpötilapalkki (viikko)"
})
addCatalogEntries("nb", {
  "colorAccents": "Fargeaksenter",
  "colorAccentsHint": "Temperaturer etter varme, regnsjanse etter nivå, UV og sterk vind etter styrke og ukens temperaturstolper i farger, fra paletten til det gjeldende Omarchy-temaet.",
  "temperatureBar": "Temperaturstolpe (uke)"
})
addCatalogEntries("da", {
  "colorAccents": "Farveaccenter",
  "colorAccentsHint": "Temperaturer efter varme, regnchance efter niveau, UV og hård vind efter styrke samt ugens temperaturbjælker i farve, fra paletten i det aktuelle Omarchy-tema.",
  "temperatureBar": "Temperaturbjælke (uge)"
})
addCatalogEntries("ro", {
  "colorAccents": "Accente de culoare",
  "colorAccentsHint": "Temperaturi după căldură, probabilitatea ploii după valoare, UV și vânt puternic după nivel și barele de temperatură ale săptămânii colorate, din paleta temei Omarchy curente.",
  "temperatureBar": "Bară de temperatură (săptămână)"
})
addCatalogEntries("hu", {
  "colorAccents": "Színkiemelések",
  "colorAccentsHint": "Hőmérséklet a meleg szerint, csapadékesély az érték szerint, UV és erős szél a fokozat szerint, valamint a hét hőmérséklet-sávjai színesen, az aktuális Omarchy-téma palettájából.",
  "temperatureBar": "Hőmérsékletsáv (hét)"
})
addCatalogEntries("el", {
  "colorAccents": "Χρωματικές πινελιές",
  "colorAccentsHint": "Θερμοκρασίες κατά θερμότητα, πιθανότητα βροχής κατά τιμή, UV και ισχυρός άνεμος κατά επίπεδο και οι μπάρες θερμοκρασίας της εβδομάδας σε χρώμα, από την παλέτα του τρέχοντος θέματος Omarchy.",
  "temperatureBar": "Μπάρα θερμοκρασίας (εβδομάδα)"
})
addCatalogEntries("zh_CN", {
  "colorAccents": "色彩强调",
  "colorAccentsHint": "按冷暖着色温度，按高低着色降雨概率，按等级着色紫外线和强风，并以彩色显示一周温度条，颜色取自当前 Omarchy 主题。",
  "temperatureBar": "温度条（一周）"
})
addCatalogEntries("zh_TW", {
  "colorAccents": "色彩強調",
  "colorAccentsHint": "依冷暖著色溫度，依高低著色降雨機率，依等級著色紫外線與強風，並以彩色顯示一週溫度條，顏色取自目前的 Omarchy 主題。",
  "temperatureBar": "溫度條（一週）"
})
addCatalogEntries("ja", {
  "colorAccents": "カラーアクセント",
  "colorAccentsHint": "気温は暖かさ、降水確率は高さ、UV と強風は段階に応じて色分けし、週の気温バーもカラー表示します。色は現在の Omarchy テーマから取ります。",
  "temperatureBar": "気温バー（週）"
})
addCatalogEntries("ko", {
  "colorAccents": "색상 강조",
  "colorAccentsHint": "기온은 따뜻함, 강수 확률은 높이, 자외선과 강풍은 단계에 따라 색을 입히고, 주간 기온 막대도 색으로 표시합니다. 색상은 현재 Omarchy 테마에서 가져옵니다.",
  "temperatureBar": "기온 막대(주간)"
})
addCatalogEntries("ar", {
  "colorAccents": "لمسات لونية",
  "colorAccentsHint": "تلوين درجات الحرارة حسب الدفء، واحتمال المطر حسب قيمته، والأشعة فوق البنفسجية والرياح القوية حسب المستوى، وأشرطة حرارة الأسبوع، بألوان سمة Omarchy الحالية.",
  "temperatureBar": "شريط الحرارة (الأسبوع)"
})
addCatalogEntries("he", {
  "colorAccents": "הדגשות צבע",
  "colorAccentsHint": "טמפרטורות לפי חום, סיכוי לגשם לפי גובהו, UV ורוח חזקה לפי דרגה ופסי הטמפרטורה של השבוע בצבע, מפלטת ערכת Omarchy הנוכחית.",
  "temperatureBar": "פס טמפרטורה (שבוע)"
})
addCatalogEntries("fa", {
  "colorAccents": "تأکیدهای رنگی",
  "colorAccentsHint": "دما بر اساس گرما، احتمال باران بر اساس مقدار، فرابنفش و باد شدید بر اساس سطح و نوارهای دمای هفته به‌صورت رنگی، با رنگ‌های پوستهٔ فعلی Omarchy.",
  "temperatureBar": "نوار دما (هفته)"
})
addCatalogEntries("hi", {
  "colorAccents": "रंग उभार",
  "colorAccentsHint": "तापमान गर्मी के अनुसार, बारिश की संभावना मान के अनुसार, UV और तेज़ हवा स्तर के अनुसार और सप्ताह की तापमान पट्टियाँ रंग में — मौजूदा Omarchy थीम के रंगों से।",
  "temperatureBar": "तापमान पट्टी (सप्ताह)"
})
addCatalogEntries("id", {
  "colorAccents": "Aksen warna",
  "colorAccentsHint": "Suhu menurut kehangatan, peluang hujan menurut nilainya, UV dan angin kencang menurut tingkat, serta batang suhu minggu ini berwarna, dari palet tema Omarchy saat ini.",
  "temperatureBar": "Batang suhu (minggu)"
})
addCatalogEntries("vi", {
  "colorAccents": "Điểm nhấn màu",
  "colorAccentsHint": "Nhiệt độ theo độ ấm, khả năng mưa theo mức, UV và gió mạnh theo cấp, cùng thanh nhiệt độ của tuần được tô màu, theo bảng màu của chủ đề Omarchy hiện tại.",
  "temperatureBar": "Thanh nhiệt độ (tuần)"
})
addCatalogEntries("th", {
  "colorAccents": "สีเน้น",
  "colorAccentsHint": "ลงสีอุณหภูมิตามความอุ่น โอกาสฝนตามค่า UV และลมแรงตามระดับ และแถบอุณหภูมิประจำสัปดาห์ ด้วยชุดสีของธีม Omarchy ปัจจุบัน",
  "temperatureBar": "แถบอุณหภูมิ (สัปดาห์)"
})

// Hour cursor (2.5).
addCatalogEntries("en", {
  "heroAtTime": "at {time}",
  "hourCursorHint": "⇧ ← → another hour · ⌫ now",
  "shortcutHourCursor": "Show another hour in the current weather",
  "shortcutHourCursorReset": "Back to now"
})
addCatalogEntries("de", {
  "heroAtTime": "um {time}",
  "hourCursorHint": "⇧ ← → andere Stunde · ⌫ jetzt",
  "shortcutHourCursor": "Andere Stunde im aktuellen Wetter zeigen",
  "shortcutHourCursorReset": "Zurück zu jetzt"
})
addCatalogEntries("es", {
  "heroAtTime": "a las {time}",
  "hourCursorHint": "⇧ ← → otra hora · ⌫ ahora",
  "shortcutHourCursor": "Mostrar otra hora en el tiempo actual",
  "shortcutHourCursorReset": "Volver a ahora"
})
addCatalogEntries("fr", {
  "heroAtTime": "à {time}",
  "hourCursorHint": "⇧ ← → autre heure · ⌫ maintenant",
  "shortcutHourCursor": "Afficher une autre heure dans la météo actuelle",
  "shortcutHourCursorReset": "Revenir à maintenant"
})
addCatalogEntries("pt", {
  "heroAtTime": "às {time}",
  "hourCursorHint": "⇧ ← → outra hora · ⌫ agora",
  "shortcutHourCursor": "Mostrar outra hora no tempo atual",
  "shortcutHourCursorReset": "Voltar para agora"
})
addCatalogEntries("ru", {
  "heroAtTime": "в {time}",
  "hourCursorHint": "⇧ ← → другой час · ⌫ сейчас",
  "shortcutHourCursor": "Показать другой час в текущей погоде",
  "shortcutHourCursorReset": "Вернуться к «сейчас»"
})
addCatalogEntries("uk", {
  "heroAtTime": "о {time}",
  "hourCursorHint": "⇧ ← → інша година · ⌫ зараз",
  "shortcutHourCursor": "Показати іншу годину в поточній погоді",
  "shortcutHourCursorReset": "Повернутися до «зараз»"
})
addCatalogEntries("pl", {
  "heroAtTime": "o {time}",
  "hourCursorHint": "⇧ ← → inna godzina · ⌫ teraz",
  "shortcutHourCursor": "Pokaż inną godzinę w bieżącej pogodzie",
  "shortcutHourCursorReset": "Wróć do teraz"
})
addCatalogEntries("it", {
  "heroAtTime": "alle {time}",
  "hourCursorHint": "⇧ ← → altra ora · ⌫ ora",
  "shortcutHourCursor": "Mostra un’altra ora nel meteo attuale",
  "shortcutHourCursorReset": "Torna ad adesso"
})
addCatalogEntries("nl", {
  "heroAtTime": "om {time}",
  "hourCursorHint": "⇧ ← → ander uur · ⌫ nu",
  "shortcutHourCursor": "Een ander uur tonen in het huidige weer",
  "shortcutHourCursorReset": "Terug naar nu"
})
addCatalogEntries("tr", {
  "heroAtTime": "saat {time}",
  "hourCursorHint": "⇧ ← → başka saat · ⌫ şimdi",
  "shortcutHourCursor": "Güncel havada başka bir saati göster",
  "shortcutHourCursorReset": "Şimdiye dön"
})
addCatalogEntries("cs", {
  "heroAtTime": "v {time}",
  "hourCursorHint": "⇧ ← → jiná hodina · ⌫ teď",
  "shortcutHourCursor": "Zobrazit jinou hodinu v aktuálním počasí",
  "shortcutHourCursorReset": "Zpět na teď"
})
addCatalogEntries("sv", {
  "heroAtTime": "kl. {time}",
  "hourCursorHint": "⇧ ← → annan timme · ⌫ nu",
  "shortcutHourCursor": "Visa en annan timme i aktuellt väder",
  "shortcutHourCursorReset": "Tillbaka till nu"
})
addCatalogEntries("fi", {
  "heroAtTime": "klo {time}",
  "hourCursorHint": "⇧ ← → toinen tunti · ⌫ nyt",
  "shortcutHourCursor": "Näytä toinen tunti nykyisessä säässä",
  "shortcutHourCursorReset": "Takaisin nykyhetkeen"
})
addCatalogEntries("nb", {
  "heroAtTime": "kl. {time}",
  "hourCursorHint": "⇧ ← → annen time · ⌫ nå",
  "shortcutHourCursor": "Vis en annen time i været nå",
  "shortcutHourCursorReset": "Tilbake til nå"
})
addCatalogEntries("da", {
  "heroAtTime": "kl. {time}",
  "hourCursorHint": "⇧ ← → anden time · ⌫ nu",
  "shortcutHourCursor": "Vis en anden time i det aktuelle vejr",
  "shortcutHourCursorReset": "Tilbage til nu"
})
addCatalogEntries("ro", {
  "heroAtTime": "la {time}",
  "hourCursorHint": "⇧ ← → altă oră · ⌫ acum",
  "shortcutHourCursor": "Arată altă oră în vremea actuală",
  "shortcutHourCursorReset": "Înapoi la acum"
})
addCatalogEntries("hu", {
  "heroAtTime": "{time}-kor",
  "hourCursorHint": "⇧ ← → másik óra · ⌫ most",
  "shortcutHourCursor": "Másik óra megjelenítése az aktuális időjárásban",
  "shortcutHourCursorReset": "Vissza a mosthoz"
})
addCatalogEntries("el", {
  "heroAtTime": "στις {time}",
  "hourCursorHint": "⇧ ← → άλλη ώρα · ⌫ τώρα",
  "shortcutHourCursor": "Εμφάνιση άλλης ώρας στον τρέχοντα καιρό",
  "shortcutHourCursorReset": "Επιστροφή στο τώρα"
})
addCatalogEntries("zh_CN", {
  "heroAtTime": "{time}",
  "hourCursorHint": "⇧ ← → 其他时刻 · ⌫ 现在",
  "shortcutHourCursor": "在当前天气中显示其他时刻",
  "shortcutHourCursorReset": "回到现在"
})
addCatalogEntries("zh_TW", {
  "heroAtTime": "{time}",
  "hourCursorHint": "⇧ ← → 其他時刻 · ⌫ 現在",
  "shortcutHourCursor": "在目前天氣中顯示其他時刻",
  "shortcutHourCursorReset": "回到現在"
})
addCatalogEntries("ja", {
  "heroAtTime": "{time}",
  "hourCursorHint": "⇧ ← → 別の時刻 · ⌫ 現在",
  "shortcutHourCursor": "現在の天気に別の時刻を表示",
  "shortcutHourCursorReset": "現在に戻る"
})
addCatalogEntries("ko", {
  "heroAtTime": "{time}",
  "hourCursorHint": "⇧ ← → 다른 시간 · ⌫ 지금",
  "shortcutHourCursor": "현재 날씨에 다른 시간 표시",
  "shortcutHourCursorReset": "지금으로 돌아가기"
})
addCatalogEntries("ar", {
  "heroAtTime": "عند {time}",
  "hourCursorHint": "⇧ ← → ساعة أخرى · ⌫ الآن",
  "shortcutHourCursor": "عرض ساعة أخرى في الطقس الحالي",
  "shortcutHourCursorReset": "العودة إلى الآن"
})
addCatalogEntries("he", {
  "heroAtTime": "ב-{time}",
  "hourCursorHint": "⇧ ← → שעה אחרת · ⌫ עכשיו",
  "shortcutHourCursor": "הצגת שעה אחרת במזג האוויר הנוכחי",
  "shortcutHourCursorReset": "חזרה לעכשיו"
})
addCatalogEntries("fa", {
  "heroAtTime": "ساعت {time}",
  "hourCursorHint": "⇧ ← → ساعت دیگر · ⌫ اکنون",
  "shortcutHourCursor": "نمایش ساعت دیگری در هوای کنونی",
  "shortcutHourCursorReset": "بازگشت به اکنون"
})
addCatalogEntries("hi", {
  "heroAtTime": "{time} पर",
  "hourCursorHint": "⇧ ← → दूसरा घंटा · ⌫ अभी",
  "shortcutHourCursor": "वर्तमान मौसम में दूसरा घंटा दिखाएँ",
  "shortcutHourCursorReset": "अभी पर लौटें"
})
addCatalogEntries("id", {
  "heroAtTime": "pukul {time}",
  "hourCursorHint": "⇧ ← → jam lain · ⌫ sekarang",
  "shortcutHourCursor": "Tampilkan jam lain di cuaca saat ini",
  "shortcutHourCursorReset": "Kembali ke sekarang"
})
addCatalogEntries("vi", {
  "heroAtTime": "lúc {time}",
  "hourCursorHint": "⇧ ← → giờ khác · ⌫ bây giờ",
  "shortcutHourCursor": "Hiện giờ khác trong thời tiết hiện tại",
  "shortcutHourCursorReset": "Quay về bây giờ"
})
addCatalogEntries("th", {
  "heroAtTime": "เวลา {time}",
  "hourCursorHint": "⇧ ← → ชั่วโมงอื่น · ⌫ ตอนนี้",
  "shortcutHourCursor": "แสดงชั่วโมงอื่นในสภาพอากาศปัจจุบัน",
  "shortcutHourCursorReset": "กลับไปตอนนี้"
})

// Temperature curve (2.5).
addCatalogEntries("en", {
  "temperatureCurve": "Temperature curve"
})
addCatalogEntries("de", {
  "temperatureCurve": "Temperaturkurve"
})
addCatalogEntries("es", {
  "temperatureCurve": "Curva de temperatura"
})
addCatalogEntries("fr", {
  "temperatureCurve": "Courbe de température"
})
addCatalogEntries("pt", {
  "temperatureCurve": "Curva de temperatura"
})
addCatalogEntries("ru", {
  "temperatureCurve": "Кривая температуры"
})
addCatalogEntries("uk", {
  "temperatureCurve": "Крива температури"
})
addCatalogEntries("pl", {
  "temperatureCurve": "Krzywa temperatury"
})
addCatalogEntries("it", {
  "temperatureCurve": "Curva della temperatura"
})
addCatalogEntries("nl", {
  "temperatureCurve": "Temperatuurcurve"
})
addCatalogEntries("tr", {
  "temperatureCurve": "Sıcaklık eğrisi"
})
addCatalogEntries("cs", {
  "temperatureCurve": "Teplotní křivka"
})
addCatalogEntries("sv", {
  "temperatureCurve": "Temperaturkurva"
})
addCatalogEntries("fi", {
  "temperatureCurve": "Lämpötilakäyrä"
})
addCatalogEntries("nb", {
  "temperatureCurve": "Temperaturkurve"
})
addCatalogEntries("da", {
  "temperatureCurve": "Temperaturkurve"
})
addCatalogEntries("ro", {
  "temperatureCurve": "Curba temperaturii"
})
addCatalogEntries("hu", {
  "temperatureCurve": "Hőmérsékleti görbe"
})
addCatalogEntries("el", {
  "temperatureCurve": "Καμπύλη θερμοκρασίας"
})
addCatalogEntries("ja", {
  "temperatureCurve": "気温グラフ"
})
addCatalogEntries("ko", {
  "temperatureCurve": "기온 곡선"
})
addCatalogEntries("ar", {
  "temperatureCurve": "منحنى درجة الحرارة"
})
addCatalogEntries("he", {
  "temperatureCurve": "עקומת טמפרטורה"
})
addCatalogEntries("fa", {
  "temperatureCurve": "منحنی دما"
})
addCatalogEntries("hi", {
  "temperatureCurve": "तापमान वक्र"
})
addCatalogEntries("id", {
  "temperatureCurve": "Kurva suhu"
})
addCatalogEntries("vi", {
  "temperatureCurve": "Đường cong nhiệt độ"
})
addCatalogEntries("th", {
  "temperatureCurve": "กราฟอุณหภูมิ"
})
addCatalogEntries("zh_CN", {
  "temperatureCurve": "气温曲线"
})
addCatalogEntries("zh_TW", {
  "temperatureCurve": "氣溫曲線"
})
// Rain notification threshold and radius (2.5).
addCatalogEntries("en", {
  "notifyRainSoonHint": "Notification when rain is on its way to the shown location.",
  "rainAlertThreshold": "From which strength",
  "rainAlertAny": "Any rain",
  "rainAlertModerate": "Moderate or more (over {rate})",
  "rainAlertHeavy": "Heavy only (over {rate})",
  "rainAlertRadius": "Radius",
  "rainAlertRadiusOption": "{distance} · {lead} ahead",
  "rainAlertHint": "Rain moves at about 50 km/h, so the radius sets how far ahead the rain nowcast is read. A wider radius warns earlier but is less certain. Stronger rain is announced again."
})
addCatalogEntries("de", {
  "notifyRainSoonHint": "Benachrichtigung, wenn am angezeigten Ort Regen im Anzug ist.",
  "rainAlertThreshold": "Ab welcher Stärke",
  "rainAlertAny": "Jeder Regen",
  "rainAlertModerate": "Ab mittel (über {rate})",
  "rainAlertHeavy": "Nur stark (über {rate})",
  "rainAlertRadius": "Umkreis",
  "rainAlertRadiusOption": "{distance} · {lead} Vorlauf",
  "rainAlertHint": "Regen zieht mit etwa 50 km/h, daher bestimmt der Umkreis, wie weit die Regenvorhersage vorausgelesen wird. Ein größerer Umkreis warnt früher, ist aber unsicherer. Stärkerer Regen wird erneut gemeldet."
})
addCatalogEntries("es", {
  "notifyRainSoonHint": "Notificación cuando se acerca lluvia al lugar mostrado.",
  "rainAlertThreshold": "A partir de qué intensidad",
  "rainAlertAny": "Cualquier lluvia",
  "rainAlertModerate": "Moderada o más (más de {rate})",
  "rainAlertHeavy": "Solo fuerte (más de {rate})",
  "rainAlertRadius": "Radio",
  "rainAlertRadiusOption": "{distance} · {lead} de antelación",
  "rainAlertHint": "La lluvia se desplaza a unos 50 km/h, así que el radio fija hasta dónde se lee la predicción inmediata. Un radio mayor avisa antes, pero con menos certeza. La lluvia más fuerte se vuelve a avisar."
})
addCatalogEntries("fr", {
  "notifyRainSoonHint": "Notification quand de la pluie approche du lieu affiché.",
  "rainAlertThreshold": "À partir de quelle intensité",
  "rainAlertAny": "Toute pluie",
  "rainAlertModerate": "Modérée ou plus (plus de {rate})",
  "rainAlertHeavy": "Forte seulement (plus de {rate})",
  "rainAlertRadius": "Rayon",
  "rainAlertRadiusOption": "{distance} · {lead} d'avance",
  "rainAlertHint": "La pluie se déplace à environ 50 km/h : le rayon fixe jusqu'où la prévision immédiate est lue. Un rayon plus grand prévient plus tôt, mais avec moins de certitude. Une pluie plus forte est signalée à nouveau."
})
addCatalogEntries("pt", {
  "notifyRainSoonHint": "Notificação quando a chuva se aproxima do local mostrado.",
  "rainAlertThreshold": "A partir de que intensidade",
  "rainAlertAny": "Qualquer chuva",
  "rainAlertModerate": "Moderada ou mais (acima de {rate})",
  "rainAlertHeavy": "Só forte (acima de {rate})",
  "rainAlertRadius": "Raio",
  "rainAlertRadiusOption": "{distance} · {lead} de antecedência",
  "rainAlertHint": "A chuva desloca-se a cerca de 50 km/h, por isso o raio define até onde a previsão imediata é lida. Um raio maior avisa mais cedo, mas com menos certeza. Chuva mais forte é avisada de novo."
})
addCatalogEntries("ru", {
  "notifyRainSoonHint": "Уведомление, когда к показанному месту приближается дождь.",
  "rainAlertThreshold": "С какой силы",
  "rainAlertAny": "Любой дождь",
  "rainAlertModerate": "Умеренный и сильнее (более {rate})",
  "rainAlertHeavy": "Только сильный (более {rate})",
  "rainAlertRadius": "Радиус",
  "rainAlertRadiusOption": "{distance} · за {lead}",
  "rainAlertHint": "Дождь движется примерно со скоростью 50 км/ч, поэтому радиус задаёт, насколько вперёд читается краткосрочный прогноз. Больший радиус предупреждает раньше, но менее надёжно. О более сильном дожде сообщается снова."
})
addCatalogEntries("uk", {
  "notifyRainSoonHint": "Сповіщення, коли до показаного місця наближається дощ.",
  "rainAlertThreshold": "З якої сили",
  "rainAlertAny": "Будь-який дощ",
  "rainAlertModerate": "Помірний і сильніший (понад {rate})",
  "rainAlertHeavy": "Лише сильний (понад {rate})",
  "rainAlertRadius": "Радіус",
  "rainAlertRadiusOption": "{distance} · за {lead}",
  "rainAlertHint": "Дощ рухається приблизно зі швидкістю 50 км/год, тож радіус визначає, наскільки вперед читається короткостроковий прогноз. Більший радіус попереджає раніше, але менш надійно. Про сильніший дощ повідомляється знову."
})
addCatalogEntries("pl", {
  "notifyRainSoonHint": "Powiadomienie, gdy do pokazanego miejsca zbliża się deszcz.",
  "rainAlertThreshold": "Od jakiej intensywności",
  "rainAlertAny": "Każdy deszcz",
  "rainAlertModerate": "Umiarkowany i silniejszy (ponad {rate})",
  "rainAlertHeavy": "Tylko silny (ponad {rate})",
  "rainAlertRadius": "Promień",
  "rainAlertRadiusOption": "{distance} · {lead} wcześniej",
  "rainAlertHint": "Deszcz przesuwa się z prędkością ok. 50 km/h, więc promień określa, jak daleko naprzód czytana jest prognoza krótkoterminowa. Większy promień ostrzega wcześniej, ale mniej pewnie. Silniejszy deszcz jest zgłaszany ponownie."
})
addCatalogEntries("it", {
  "notifyRainSoonHint": "Notifica quando la pioggia si avvicina al luogo mostrato.",
  "rainAlertThreshold": "Da quale intensità",
  "rainAlertAny": "Qualsiasi pioggia",
  "rainAlertModerate": "Moderata o più (oltre {rate})",
  "rainAlertHeavy": "Solo forte (oltre {rate})",
  "rainAlertRadius": "Raggio",
  "rainAlertRadiusOption": "{distance} · {lead} di anticipo",
  "rainAlertHint": "La pioggia si sposta a circa 50 km/h, quindi il raggio stabilisce fin dove viene letta la previsione a brevissimo termine. Un raggio più ampio avvisa prima, ma con meno certezza. La pioggia più forte viene segnalata di nuovo."
})
addCatalogEntries("nl", {
  "notifyRainSoonHint": "Melding wanneer er regen op komst is voor de getoonde plaats.",
  "rainAlertThreshold": "Vanaf welke sterkte",
  "rainAlertAny": "Elke regen",
  "rainAlertModerate": "Matig of meer (boven {rate})",
  "rainAlertHeavy": "Alleen zwaar (boven {rate})",
  "rainAlertRadius": "Straal",
  "rainAlertRadiusOption": "{distance} · {lead} vooruit",
  "rainAlertHint": "Regen trekt met ongeveer 50 km/u, dus de straal bepaalt hoe ver vooruit de neerslagverwachting wordt gelezen. Een grotere straal waarschuwt eerder, maar is minder zeker. Zwaardere regen wordt opnieuw gemeld."
})
addCatalogEntries("tr", {
  "notifyRainSoonHint": "Gösterilen konuma yağmur yaklaşırken bildirim.",
  "rainAlertThreshold": "Hangi şiddetten itibaren",
  "rainAlertAny": "Her yağmur",
  "rainAlertModerate": "Orta ve üzeri ({rate} üzeri)",
  "rainAlertHeavy": "Yalnızca şiddetli ({rate} üzeri)",
  "rainAlertRadius": "Yarıçap",
  "rainAlertRadiusOption": "{distance} · {lead} önceden",
  "rainAlertHint": "Yağmur yaklaşık 50 km/sa hızla ilerler; yarıçap, anlık tahminin ne kadar ileriye okunacağını belirler. Daha geniş yarıçap daha erken uyarır ama daha az kesindir. Daha şiddetli yağmur yeniden bildirilir."
})
addCatalogEntries("cs", {
  "notifyRainSoonHint": "Upozornění, když se k zobrazenému místu blíží déšť.",
  "rainAlertThreshold": "Od jaké intenzity",
  "rainAlertAny": "Jakýkoli déšť",
  "rainAlertModerate": "Mírný a silnější (nad {rate})",
  "rainAlertHeavy": "Jen silný (nad {rate})",
  "rainAlertRadius": "Okruh",
  "rainAlertRadiusOption": "{distance} · {lead} předem",
  "rainAlertHint": "Déšť se posouvá rychlostí asi 50 km/h, takže okruh určuje, jak daleko dopředu se čte krátkodobá předpověď. Větší okruh varuje dříve, ale méně jistě. Silnější déšť je ohlášen znovu."
})
addCatalogEntries("sv", {
  "notifyRainSoonHint": "Avisering när regn är på väg till den visade platsen.",
  "rainAlertThreshold": "Från vilken styrka",
  "rainAlertAny": "Allt regn",
  "rainAlertModerate": "Måttligt eller mer (över {rate})",
  "rainAlertHeavy": "Bara kraftigt (över {rate})",
  "rainAlertRadius": "Radie",
  "rainAlertRadiusOption": "{distance} · {lead} i förväg",
  "rainAlertHint": "Regn rör sig med ungefär 50 km/h, så radien avgör hur långt fram korttidsprognosen läses. En större radie varnar tidigare men är osäkrare. Kraftigare regn aviseras igen."
})
addCatalogEntries("fi", {
  "notifyRainSoonHint": "Ilmoitus, kun sade lähestyy näytettyä paikkaa.",
  "rainAlertThreshold": "Mistä voimakkuudesta alkaen",
  "rainAlertAny": "Kaikki sade",
  "rainAlertModerate": "Kohtalainen tai voimakkaampi (yli {rate})",
  "rainAlertHeavy": "Vain voimakas (yli {rate})",
  "rainAlertRadius": "Säde",
  "rainAlertRadiusOption": "{distance} · {lead} etukäteen",
  "rainAlertHint": "Sade liikkuu noin 50 km/h, joten säde määrää, kuinka pitkälle eteenpäin lyhyen aikavälin ennustetta luetaan. Suurempi säde varoittaa aiemmin mutta epävarmemmin. Voimakkaammasta sateesta ilmoitetaan uudelleen."
})
addCatalogEntries("nb", {
  "notifyRainSoonHint": "Varsel når regn er på vei til det viste stedet.",
  "rainAlertThreshold": "Fra hvilken styrke",
  "rainAlertAny": "All nedbør",
  "rainAlertModerate": "Moderat eller mer (over {rate})",
  "rainAlertHeavy": "Bare kraftig (over {rate})",
  "rainAlertRadius": "Radius",
  "rainAlertRadiusOption": "{distance} · {lead} i forveien",
  "rainAlertHint": "Regn beveger seg med omtrent 50 km/t, så radiusen bestemmer hvor langt fram korttidsvarselet leses. En større radius varsler tidligere, men er mer usikker. Kraftigere regn varsles på nytt."
})
addCatalogEntries("da", {
  "notifyRainSoonHint": "Notifikation, når regn er på vej mod det viste sted.",
  "rainAlertThreshold": "Fra hvilken styrke",
  "rainAlertAny": "Al regn",
  "rainAlertModerate": "Moderat eller mere (over {rate})",
  "rainAlertHeavy": "Kun kraftig (over {rate})",
  "rainAlertRadius": "Radius",
  "rainAlertRadiusOption": "{distance} · {lead} i forvejen",
  "rainAlertHint": "Regn bevæger sig med omkring 50 km/t, så radius afgør, hvor langt frem korttidsprognosen læses. En større radius advarer tidligere, men er mere usikker. Kraftigere regn meldes igen."
})
addCatalogEntries("ro", {
  "notifyRainSoonHint": "Notificare când ploaia se apropie de locul afișat.",
  "rainAlertThreshold": "De la ce intensitate",
  "rainAlertAny": "Orice ploaie",
  "rainAlertModerate": "Moderată sau mai mult (peste {rate})",
  "rainAlertHeavy": "Doar puternică (peste {rate})",
  "rainAlertRadius": "Rază",
  "rainAlertRadiusOption": "{distance} · cu {lead} înainte",
  "rainAlertHint": "Ploaia se deplasează cu circa 50 km/h, deci raza stabilește cât de departe în viitor se citește prognoza imediată. O rază mai mare avertizează mai devreme, dar mai puțin sigur. Ploaia mai puternică este semnalată din nou."
})
addCatalogEntries("hu", {
  "notifyRainSoonHint": "Értesítés, ha eső közeledik a megjelenített helyhez.",
  "rainAlertThreshold": "Milyen erősségtől",
  "rainAlertAny": "Bármilyen eső",
  "rainAlertModerate": "Mérsékelt vagy erősebb ({rate} felett)",
  "rainAlertHeavy": "Csak erős ({rate} felett)",
  "rainAlertRadius": "Sugár",
  "rainAlertRadiusOption": "{distance} · {lead} előre",
  "rainAlertHint": "Az eső kb. 50 km/h sebességgel halad, így a sugár határozza meg, meddig olvassuk előre a rövid távú előrejelzést. Nagyobb sugár korábban figyelmeztet, de bizonytalanabb. Az erősebb esőt újra jelezzük."
})
addCatalogEntries("el", {
  "notifyRainSoonHint": "Ειδοποίηση όταν πλησιάζει βροχή στην εμφανιζόμενη τοποθεσία.",
  "rainAlertThreshold": "Από ποια ένταση",
  "rainAlertAny": "Κάθε βροχή",
  "rainAlertModerate": "Μέτρια ή περισσότερο (πάνω από {rate})",
  "rainAlertHeavy": "Μόνο ισχυρή (πάνω από {rate})",
  "rainAlertRadius": "Ακτίνα",
  "rainAlertRadiusOption": "{distance} · {lead} νωρίτερα",
  "rainAlertHint": "Η βροχή κινείται με περίπου 50 km/h, οπότε η ακτίνα ορίζει πόσο μπροστά διαβάζεται η βραχυπρόθεσμη πρόγνωση. Μεγαλύτερη ακτίνα προειδοποιεί νωρίτερα αλλά με λιγότερη βεβαιότητα. Η ισχυρότερη βροχή αναφέρεται ξανά."
})
addCatalogEntries("ja", {
  "notifyRainSoonHint": "表示中の場所に雨が近づくと通知します。",
  "rainAlertThreshold": "通知する強さ",
  "rainAlertAny": "すべての雨",
  "rainAlertModerate": "並以上（{rate}超）",
  "rainAlertHeavy": "強い雨のみ（{rate}超）",
  "rainAlertRadius": "範囲",
  "rainAlertRadiusOption": "{distance} · {lead}前",
  "rainAlertHint": "雨は時速約50 kmで移動するため、範囲によって降水ナウキャストをどこまで先読みするかが決まります。範囲が広いほど早く知らせますが、確実性は下がります。雨が強まると再度通知します。"
})
addCatalogEntries("ko", {
  "notifyRainSoonHint": "표시된 위치로 비가 다가오면 알립니다.",
  "rainAlertThreshold": "알림 강도",
  "rainAlertAny": "모든 비",
  "rainAlertModerate": "보통 이상({rate} 초과)",
  "rainAlertHeavy": "강한 비만({rate} 초과)",
  "rainAlertRadius": "반경",
  "rainAlertRadiusOption": "{distance} · {lead} 전",
  "rainAlertHint": "비는 시속 약 50 km로 이동하므로 반경에 따라 초단기 예보를 얼마나 앞서 읽을지가 정해집니다. 반경이 넓을수록 더 일찍 알리지만 불확실성이 커집니다. 비가 더 강해지면 다시 알립니다."
})
addCatalogEntries("ar", {
  "notifyRainSoonHint": "إشعار عند اقتراب المطر من الموقع المعروض.",
  "rainAlertThreshold": "من أي شدة",
  "rainAlertAny": "أي مطر",
  "rainAlertModerate": "معتدل أو أكثر (أكثر من {rate})",
  "rainAlertHeavy": "غزير فقط (أكثر من {rate})",
  "rainAlertRadius": "نصف القطر",
  "rainAlertRadiusOption": "{distance} · قبل {lead}",
  "rainAlertHint": "يتحرك المطر بنحو 50 كم/س، لذا يحدد نصف القطر إلى أي مدى تُقرأ التنبؤات الآنية مسبقًا. نصف القطر الأكبر ينبه أبكر لكن بدقة أقل. يُبلَّغ عن المطر الأشد مرة أخرى."
})
addCatalogEntries("he", {
  "notifyRainSoonHint": "התראה כשגשם מתקרב למיקום המוצג.",
  "rainAlertThreshold": "מאיזו עוצמה",
  "rainAlertAny": "כל גשם",
  "rainAlertModerate": "בינוני ומעלה (מעל {rate})",
  "rainAlertHeavy": "חזק בלבד (מעל {rate})",
  "rainAlertRadius": "רדיוס",
  "rainAlertRadiusOption": "{distance} · {lead} מראש",
  "rainAlertHint": "גשם נע בכ־50 קמ״ש, ולכן הרדיוס קובע עד כמה קדימה נקראת תחזית הטווח המיידי. רדיוס גדול יותר מתריע מוקדם יותר אך בוודאות נמוכה יותר. גשם חזק יותר מדווח שוב."
})
addCatalogEntries("fa", {
  "notifyRainSoonHint": "اعلان هنگامی که باران به مکان نمایش‌داده‌شده نزدیک می‌شود.",
  "rainAlertThreshold": "از چه شدتی",
  "rainAlertAny": "هر بارانی",
  "rainAlertModerate": "متوسط یا بیشتر (بیش از {rate})",
  "rainAlertHeavy": "فقط شدید (بیش از {rate})",
  "rainAlertRadius": "شعاع",
  "rainAlertRadiusOption": "{distance} · {lead} زودتر",
  "rainAlertHint": "باران با سرعت حدود ۵۰ کیلومتر بر ساعت حرکت می‌کند، پس شعاع تعیین می‌کند پیش‌بینی کوتاه‌مدت تا چه اندازه جلوتر خوانده شود. شعاع بزرگ‌تر زودتر هشدار می‌دهد اما با اطمینان کمتر. باران شدیدتر دوباره اعلام می‌شود."
})
addCatalogEntries("hi", {
  "notifyRainSoonHint": "दिखाए गए स्थान की ओर बारिश आने पर सूचना।",
  "rainAlertThreshold": "किस तीव्रता से",
  "rainAlertAny": "कोई भी बारिश",
  "rainAlertModerate": "मध्यम या अधिक ({rate} से अधिक)",
  "rainAlertHeavy": "केवल भारी ({rate} से अधिक)",
  "rainAlertRadius": "दायरा",
  "rainAlertRadiusOption": "{distance} · {lead} पहले",
  "rainAlertHint": "बारिश लगभग 50 किमी/घंटा से चलती है, इसलिए दायरा तय करता है कि तात्कालिक पूर्वानुमान कितना आगे तक पढ़ा जाए। बड़ा दायरा पहले चेतावनी देता है, पर कम निश्चित होता है। तेज़ बारिश की सूचना फिर से दी जाती है।"
})
addCatalogEntries("id", {
  "notifyRainSoonHint": "Notifikasi saat hujan mendekati lokasi yang ditampilkan.",
  "rainAlertThreshold": "Mulai intensitas apa",
  "rainAlertAny": "Semua hujan",
  "rainAlertModerate": "Sedang atau lebih (di atas {rate})",
  "rainAlertHeavy": "Hanya lebat (di atas {rate})",
  "rainAlertRadius": "Radius",
  "rainAlertRadiusOption": "{distance} · {lead} sebelumnya",
  "rainAlertHint": "Hujan bergerak sekitar 50 km/jam, jadi radius menentukan seberapa jauh prakiraan jangka sangat pendek dibaca ke depan. Radius lebih besar memperingatkan lebih awal, tetapi kurang pasti. Hujan yang lebih lebat diberitahukan lagi."
})
addCatalogEntries("vi", {
  "notifyRainSoonHint": "Thông báo khi mưa đang đến gần vị trí được hiển thị.",
  "rainAlertThreshold": "Từ cường độ nào",
  "rainAlertAny": "Mọi cơn mưa",
  "rainAlertModerate": "Vừa trở lên (trên {rate})",
  "rainAlertHeavy": "Chỉ mưa to (trên {rate})",
  "rainAlertRadius": "Bán kính",
  "rainAlertRadiusOption": "{distance} · trước {lead}",
  "rainAlertHint": "Mưa di chuyển khoảng 50 km/h, nên bán kính quyết định dự báo cực ngắn được đọc trước bao xa. Bán kính lớn hơn cảnh báo sớm hơn nhưng kém chắc chắn hơn. Mưa mạnh hơn sẽ được báo lại."
})
addCatalogEntries("th", {
  "notifyRainSoonHint": "แจ้งเตือนเมื่อฝนกำลังเข้าใกล้ตำแหน่งที่แสดง",
  "rainAlertThreshold": "ตั้งแต่ความแรงระดับใด",
  "rainAlertAny": "ฝนทุกระดับ",
  "rainAlertModerate": "ปานกลางขึ้นไป (มากกว่า {rate})",
  "rainAlertHeavy": "เฉพาะฝนหนัก (มากกว่า {rate})",
  "rainAlertRadius": "รัศมี",
  "rainAlertRadiusOption": "{distance} · ล่วงหน้า {lead}",
  "rainAlertHint": "ฝนเคลื่อนที่ราว 50 กม./ชม. รัศมีจึงกำหนดว่าจะอ่านการพยากรณ์ระยะสั้นมากล่วงหน้าไกลเท่าใด รัศมีกว้างขึ้นเตือนได้เร็วขึ้นแต่แม่นยำน้อยลง ฝนที่แรงขึ้นจะแจ้งเตือนอีกครั้ง"
})
addCatalogEntries("zh_CN", {
  "notifyRainSoonHint": "有雨接近所显示的地点时发出通知。",
  "rainAlertThreshold": "从何种强度起",
  "rainAlertAny": "任何降雨",
  "rainAlertModerate": "中雨及以上（超过 {rate}）",
  "rainAlertHeavy": "仅大雨（超过 {rate}）",
  "rainAlertRadius": "半径",
  "rainAlertRadiusOption": "{distance} · 提前 {lead}",
  "rainAlertHint": "降雨移动速度约为 50 公里/小时，因此半径决定临近预报向前读取多远。半径越大提醒越早，但越不确定。雨势增强时会再次通知。"
})
addCatalogEntries("zh_TW", {
  "notifyRainSoonHint": "有雨接近所顯示的地點時發出通知。",
  "rainAlertThreshold": "從何種強度起",
  "rainAlertAny": "任何降雨",
  "rainAlertModerate": "中雨以上（超過 {rate}）",
  "rainAlertHeavy": "僅大雨（超過 {rate}）",
  "rainAlertRadius": "半徑",
  "rainAlertRadiusOption": "{distance} · 提前 {lead}",
  "rainAlertHint": "降雨移動速度約為每小時 50 公里，因此半徑決定即時預報向前讀取多遠。半徑越大提醒越早，但越不確定。雨勢增強時會再次通知。"
})
// The air quality dot among the colour accents (2.5).
amendCatalogEntry("en", "colorAccentsHint", function(text) { return text + " The air quality colour dot follows this switch too." })
amendCatalogEntry("de", "colorAccentsHint", function(text) { return text + " Auch der Farbpunkt der Luftqualität folgt diesem Schalter." })
amendCatalogEntry("es", "colorAccentsHint", function(text) { return text + " El punto de color de la calidad del aire también sigue este interruptor." })
amendCatalogEntry("fr", "colorAccentsHint", function(text) { return text + " La pastille de couleur de la qualité de l'air suit aussi ce réglage." })
amendCatalogEntry("pt", "colorAccentsHint", function(text) { return text + " O ponto de cor da qualidade do ar também segue este interruptor." })
amendCatalogEntry("ru", "colorAccentsHint", function(text) { return text + " Цветная точка качества воздуха тоже следует этому переключателю." })
amendCatalogEntry("uk", "colorAccentsHint", function(text) { return text + " Кольорова точка якості повітря також підкоряється цьому перемикачу." })
amendCatalogEntry("pl", "colorAccentsHint", function(text) { return text + " Kolorowa kropka jakości powietrza również zależy od tego przełącznika." })
amendCatalogEntry("it", "colorAccentsHint", function(text) { return text + " Anche il punto colorato della qualità dell'aria segue questo interruttore." })
amendCatalogEntry("nl", "colorAccentsHint", function(text) { return text + " Ook de kleurstip van de luchtkwaliteit volgt deze schakelaar." })
amendCatalogEntry("tr", "colorAccentsHint", function(text) { return text + " Hava kalitesi renk noktası da bu anahtara uyar." })
amendCatalogEntry("cs", "colorAccentsHint", function(text) { return text + " Barevná tečka kvality ovzduší se také řídí tímto přepínačem." })
amendCatalogEntry("sv", "colorAccentsHint", function(text) { return text + " Luftkvalitetens färgpunkt följer också den här brytaren." })
amendCatalogEntry("fi", "colorAccentsHint", function(text) { return text + " Myös ilmanlaadun väripiste noudattaa tätä kytkintä." })
amendCatalogEntry("nb", "colorAccentsHint", function(text) { return text + " Fargeprikken for luftkvalitet følger også denne bryteren." })
amendCatalogEntry("da", "colorAccentsHint", function(text) { return text + " Farveprikken for luftkvalitet følger også denne kontakt." })
amendCatalogEntry("ro", "colorAccentsHint", function(text) { return text + " Și punctul colorat al calității aerului urmează acest comutator." })
amendCatalogEntry("hu", "colorAccentsHint", function(text) { return text + " A levegőminőség színes pöttye is ezt a kapcsolót követi." })
amendCatalogEntry("el", "colorAccentsHint", function(text) { return text + " Και η χρωματιστή κουκκίδα της ποιότητας αέρα ακολουθεί αυτόν τον διακόπτη." })
amendCatalogEntry("ja", "colorAccentsHint", function(text) { return text + "大気質の色の点もこのスイッチに従います。" })
amendCatalogEntry("ko", "colorAccentsHint", function(text) { return text + " 대기질 색 점도 이 스위치를 따릅니다." })
amendCatalogEntry("ar", "colorAccentsHint", function(text) { return text + " تتبع نقطة لون جودة الهواء هذا المفتاح أيضًا." })
amendCatalogEntry("he", "colorAccentsHint", function(text) { return text + " גם נקודת הצבע של איכות האוויר כפופה למתג הזה." })
amendCatalogEntry("fa", "colorAccentsHint", function(text) { return text + " نقطهٔ رنگی کیفیت هوا نیز از این کلید پیروی می‌کند." })
amendCatalogEntry("hi", "colorAccentsHint", function(text) { return text + " वायु गुणवत्ता का रंगीन बिंदु भी इसी स्विच का पालन करता है।" })
amendCatalogEntry("id", "colorAccentsHint", function(text) { return text + " Titik warna kualitas udara juga mengikuti sakelar ini." })
amendCatalogEntry("vi", "colorAccentsHint", function(text) { return text + " Chấm màu chất lượng không khí cũng theo công tắc này." })
amendCatalogEntry("th", "colorAccentsHint", function(text) { return text + "จุดสีคุณภาพอากาศก็เป็นไปตามสวิตช์นี้ด้วย" })
amendCatalogEntry("zh_CN", "colorAccentsHint", function(text) { return text + "空气质量色点也受此开关控制。" })
amendCatalogEntry("zh_TW", "colorAccentsHint", function(text) { return text + "空氣品質色點也受此開關控制。" })
// Drawn map, pan and zoom (2.5).
addCatalogEntries("en", {
  "mapStyle": "Map style",
  "mapStyleDrawn": "Drawn (theme colours)",
  "mapStyleSatellite": "Satellite",
  "mapStyleHint": "Radar and wind maps. The drawn map comes with the plugin (Natural Earth) and follows the theme; the satellite picture is loaded from DWD for every view.",
  "mouseDrag": "Drag",
  "mouseWheel": "Mouse wheel",
  "shortcutMapPan": "Map: move",
  "shortcutMapWheel": "Map: zoom towards the pointer",
  "shortcutZoomReset": "Map: back to the place, default zoom"
})
addCatalogEntries("de", {
  "mapStyle": "Kartenstil",
  "mapStyleDrawn": "Gezeichnet (Theme-Farben)",
  "mapStyleSatellite": "Satellit",
  "mapStyleHint": "Radar- und Windkarte. Die gezeichnete Karte liegt dem Plugin bei (Natural Earth) und folgt dem Theme; das Satellitenbild wird für jeden Ausschnitt vom DWD geladen.",
  "mouseDrag": "Ziehen",
  "mouseWheel": "Mausrad",
  "shortcutMapPan": "Karte: verschieben",
  "shortcutMapWheel": "Karte: zum Mauszeiger zoomen",
  "shortcutZoomReset": "Karte: zurück zum Ort, Standard-Zoom"
})
addCatalogEntries("es", {
  "mapStyle": "Estilo de mapa",
  "mapStyleDrawn": "Dibujado (colores del tema)",
  "mapStyleSatellite": "Satélite",
  "mapStyleHint": "Mapas de radar y viento. El mapa dibujado viene con el plugin (Natural Earth) y sigue el tema; la imagen de satélite se carga del DWD para cada vista.",
  "mouseDrag": "Arrastrar",
  "mouseWheel": "Rueda del ratón",
  "shortcutMapPan": "Mapa: mover",
  "shortcutMapWheel": "Mapa: zoom hacia el puntero",
  "shortcutZoomReset": "Mapa: volver al lugar, zoom predeterminado"
})
addCatalogEntries("fr", {
  "mapStyle": "Style de carte",
  "mapStyleDrawn": "Dessinée (couleurs du thème)",
  "mapStyleSatellite": "Satellite",
  "mapStyleHint": "Cartes radar et vent. La carte dessinée est fournie avec le plugin (Natural Earth) et suit le thème ; l'image satellite est chargée depuis le DWD pour chaque vue.",
  "mouseDrag": "Glisser",
  "mouseWheel": "Molette",
  "shortcutMapPan": "Carte : déplacer",
  "shortcutMapWheel": "Carte : zoomer vers le pointeur",
  "shortcutZoomReset": "Carte : retour au lieu, zoom par défaut"
})
addCatalogEntries("pt", {
  "mapStyle": "Estilo do mapa",
  "mapStyleDrawn": "Desenhado (cores do tema)",
  "mapStyleSatellite": "Satélite",
  "mapStyleHint": "Mapas de radar e vento. O mapa desenhado vem com o plugin (Natural Earth) e segue o tema; a imagem de satélite é carregada do DWD para cada vista.",
  "mouseDrag": "Arrastar",
  "mouseWheel": "Roda do rato",
  "shortcutMapPan": "Mapa: mover",
  "shortcutMapWheel": "Mapa: zoom em direção ao ponteiro",
  "shortcutZoomReset": "Mapa: voltar ao local, zoom padrão"
})
addCatalogEntries("ru", {
  "mapStyle": "Стиль карты",
  "mapStyleDrawn": "Нарисованная (цвета темы)",
  "mapStyleSatellite": "Спутник",
  "mapStyleHint": "Карты радара и ветра. Нарисованная карта входит в плагин (Natural Earth) и следует теме; спутниковый снимок загружается с DWD для каждого вида.",
  "mouseDrag": "Перетаскивание",
  "mouseWheel": "Колесо мыши",
  "shortcutMapPan": "Карта: сдвинуть",
  "shortcutMapWheel": "Карта: масштаб к указателю",
  "shortcutZoomReset": "Карта: к месту, обычный масштаб"
})
addCatalogEntries("uk", {
  "mapStyle": "Стиль карти",
  "mapStyleDrawn": "Намальована (кольори теми)",
  "mapStyleSatellite": "Супутник",
  "mapStyleHint": "Карти радара й вітру. Намальована карта входить до плагіна (Natural Earth) і слідує темі; супутниковий знімок завантажується з DWD для кожного вигляду.",
  "mouseDrag": "Перетягування",
  "mouseWheel": "Коліщатко миші",
  "shortcutMapPan": "Карта: зсунути",
  "shortcutMapWheel": "Карта: масштаб до вказівника",
  "shortcutZoomReset": "Карта: до місця, звичайний масштаб"
})
addCatalogEntries("pl", {
  "mapStyle": "Styl mapy",
  "mapStyleDrawn": "Rysowana (kolory motywu)",
  "mapStyleSatellite": "Satelita",
  "mapStyleHint": "Mapy radaru i wiatru. Rysowana mapa jest częścią wtyczki (Natural Earth) i podąża za motywem; obraz satelitarny jest pobierany z DWD dla każdego widoku.",
  "mouseDrag": "Przeciąganie",
  "mouseWheel": "Kółko myszy",
  "shortcutMapPan": "Mapa: przesuń",
  "shortcutMapWheel": "Mapa: powiększ w stronę kursora",
  "shortcutZoomReset": "Mapa: powrót do miejsca, domyślne powiększenie"
})
addCatalogEntries("it", {
  "mapStyle": "Stile della mappa",
  "mapStyleDrawn": "Disegnata (colori del tema)",
  "mapStyleSatellite": "Satellite",
  "mapStyleHint": "Mappe radar e vento. La mappa disegnata è inclusa nel plugin (Natural Earth) e segue il tema; l'immagine satellitare viene caricata dal DWD per ogni vista.",
  "mouseDrag": "Trascina",
  "mouseWheel": "Rotella del mouse",
  "shortcutMapPan": "Mappa: sposta",
  "shortcutMapWheel": "Mappa: zoom verso il puntatore",
  "shortcutZoomReset": "Mappa: torna al luogo, zoom predefinito"
})
addCatalogEntries("nl", {
  "mapStyle": "Kaartstijl",
  "mapStyleDrawn": "Getekend (themakleuren)",
  "mapStyleSatellite": "Satelliet",
  "mapStyleHint": "Radar- en windkaart. De getekende kaart zit bij de plugin (Natural Earth) en volgt het thema; het satellietbeeld wordt voor elk beeld bij de DWD geladen.",
  "mouseDrag": "Slepen",
  "mouseWheel": "Muiswiel",
  "shortcutMapPan": "Kaart: verschuiven",
  "shortcutMapWheel": "Kaart: naar de aanwijzer zoomen",
  "shortcutZoomReset": "Kaart: terug naar de plaats, standaardzoom"
})
addCatalogEntries("tr", {
  "mapStyle": "Harita stili",
  "mapStyleDrawn": "Çizim (tema renkleri)",
  "mapStyleSatellite": "Uydu",
  "mapStyleHint": "Radar ve rüzgâr haritaları. Çizim harita eklentiyle gelir (Natural Earth) ve temayı izler; uydu görüntüsü her görünüm için DWD'den yüklenir.",
  "mouseDrag": "Sürükle",
  "mouseWheel": "Fare tekerleği",
  "shortcutMapPan": "Harita: kaydır",
  "shortcutMapWheel": "Harita: imlece doğru yakınlaştır",
  "shortcutZoomReset": "Harita: konuma dön, varsayılan yakınlaştırma"
})
addCatalogEntries("cs", {
  "mapStyle": "Styl mapy",
  "mapStyleDrawn": "Kreslená (barvy motivu)",
  "mapStyleSatellite": "Satelit",
  "mapStyleHint": "Mapy radaru a větru. Kreslená mapa je součástí pluginu (Natural Earth) a řídí se motivem; satelitní snímek se pro každý výřez načítá z DWD.",
  "mouseDrag": "Tažení",
  "mouseWheel": "Kolečko myši",
  "shortcutMapPan": "Mapa: posunout",
  "shortcutMapWheel": "Mapa: přiblížit ke kurzoru",
  "shortcutZoomReset": "Mapa: zpět na místo, výchozí přiblížení"
})
addCatalogEntries("sv", {
  "mapStyle": "Kartstil",
  "mapStyleDrawn": "Ritad (temafärger)",
  "mapStyleSatellite": "Satellit",
  "mapStyleHint": "Radar- och vindkartor. Den ritade kartan följer med pluginet (Natural Earth) och följer temat; satellitbilden laddas från DWD för varje vy.",
  "mouseDrag": "Dra",
  "mouseWheel": "Mushjul",
  "shortcutMapPan": "Karta: flytta",
  "shortcutMapWheel": "Karta: zooma mot pekaren",
  "shortcutZoomReset": "Karta: tillbaka till platsen, standardzoom"
})
addCatalogEntries("fi", {
  "mapStyle": "Kartan tyyli",
  "mapStyleDrawn": "Piirretty (teeman värit)",
  "mapStyleSatellite": "Satelliitti",
  "mapStyleHint": "Tutka- ja tuulikartat. Piirretty kartta tulee lisäosan mukana (Natural Earth) ja seuraa teemaa; satelliittikuva ladataan DWD:ltä jokaiselle näkymälle.",
  "mouseDrag": "Vedä",
  "mouseWheel": "Hiiren rulla",
  "shortcutMapPan": "Kartta: siirrä",
  "shortcutMapWheel": "Kartta: zoomaa osoitinta kohti",
  "shortcutZoomReset": "Kartta: takaisin paikkaan, oletuszoomaus"
})
addCatalogEntries("nb", {
  "mapStyle": "Kartstil",
  "mapStyleDrawn": "Tegnet (temafarger)",
  "mapStyleSatellite": "Satellitt",
  "mapStyleHint": "Radar- og vindkart. Det tegnede kartet følger med utvidelsen (Natural Earth) og følger temaet; satellittbildet lastes fra DWD for hver visning.",
  "mouseDrag": "Dra",
  "mouseWheel": "Musehjul",
  "shortcutMapPan": "Kart: flytt",
  "shortcutMapWheel": "Kart: zoom mot pekeren",
  "shortcutZoomReset": "Kart: tilbake til stedet, standardzoom"
})
addCatalogEntries("da", {
  "mapStyle": "Kortstil",
  "mapStyleDrawn": "Tegnet (temafarver)",
  "mapStyleSatellite": "Satellit",
  "mapStyleHint": "Radar- og vindkort. Det tegnede kort følger med pluginet (Natural Earth) og følger temaet; satellitbilledet hentes fra DWD for hver visning.",
  "mouseDrag": "Træk",
  "mouseWheel": "Musehjul",
  "shortcutMapPan": "Kort: flyt",
  "shortcutMapWheel": "Kort: zoom mod markøren",
  "shortcutZoomReset": "Kort: tilbage til stedet, standardzoom"
})
addCatalogEntries("ro", {
  "mapStyle": "Stilul hărții",
  "mapStyleDrawn": "Desenată (culorile temei)",
  "mapStyleSatellite": "Satelit",
  "mapStyleHint": "Hărți radar și vânt. Harta desenată vine cu pluginul (Natural Earth) și urmează tema; imaginea din satelit se încarcă de la DWD pentru fiecare vedere.",
  "mouseDrag": "Trage",
  "mouseWheel": "Rotița mouse-ului",
  "shortcutMapPan": "Hartă: mută",
  "shortcutMapWheel": "Hartă: zoom spre cursor",
  "shortcutZoomReset": "Hartă: înapoi la loc, zoom implicit"
})
addCatalogEntries("hu", {
  "mapStyle": "Térképstílus",
  "mapStyleDrawn": "Rajzolt (téma színei)",
  "mapStyleSatellite": "Műhold",
  "mapStyleHint": "Radar- és széltérkép. A rajzolt térkép a bővítmény része (Natural Earth), és követi a témát; a műholdkép minden nézethez a DWD-től töltődik le.",
  "mouseDrag": "Húzás",
  "mouseWheel": "Egérgörgő",
  "shortcutMapPan": "Térkép: mozgatás",
  "shortcutMapWheel": "Térkép: nagyítás a mutató felé",
  "shortcutZoomReset": "Térkép: vissza a helyre, alapnagyítás"
})
addCatalogEntries("el", {
  "mapStyle": "Στυλ χάρτη",
  "mapStyleDrawn": "Σχεδιασμένος (χρώματα θέματος)",
  "mapStyleSatellite": "Δορυφόρος",
  "mapStyleHint": "Χάρτες ραντάρ και ανέμου. Ο σχεδιασμένος χάρτης συνοδεύει το πρόσθετο (Natural Earth) και ακολουθεί το θέμα· η δορυφορική εικόνα φορτώνεται από το DWD για κάθε προβολή.",
  "mouseDrag": "Σύρσιμο",
  "mouseWheel": "Ροδέλα ποντικιού",
  "shortcutMapPan": "Χάρτης: μετακίνηση",
  "shortcutMapWheel": "Χάρτης: ζουμ προς τον δείκτη",
  "shortcutZoomReset": "Χάρτης: πίσω στο μέρος, προεπιλεγμένο ζουμ"
})
addCatalogEntries("ja", {
  "mapStyle": "地図のスタイル",
  "mapStyleDrawn": "描画（テーマの色）",
  "mapStyleSatellite": "衛星",
  "mapStyleHint": "レーダーと風の地図。描画地図はプラグインに同梱（Natural Earth）され、テーマに合わせます。衛星画像は表示範囲ごとに DWD から読み込みます。",
  "mouseDrag": "ドラッグ",
  "mouseWheel": "マウスホイール",
  "shortcutMapPan": "地図：移動",
  "shortcutMapWheel": "地図：ポインターに向けてズーム",
  "shortcutZoomReset": "地図：場所に戻り標準ズーム"
})
addCatalogEntries("ko", {
  "mapStyle": "지도 스타일",
  "mapStyleDrawn": "그린 지도(테마 색)",
  "mapStyleSatellite": "위성",
  "mapStyleHint": "레이더와 바람 지도. 그린 지도는 플러그인에 포함되며(Natural Earth) 테마를 따릅니다. 위성 사진은 보기마다 DWD에서 불러옵니다.",
  "mouseDrag": "드래그",
  "mouseWheel": "마우스 휠",
  "shortcutMapPan": "지도: 이동",
  "shortcutMapWheel": "지도: 포인터 쪽으로 확대/축소",
  "shortcutZoomReset": "지도: 장소로 돌아가기, 기본 확대"
})
addCatalogEntries("ar", {
  "mapStyle": "نمط الخريطة",
  "mapStyleDrawn": "مرسومة (ألوان السمة)",
  "mapStyleSatellite": "قمر صناعي",
  "mapStyleHint": "خرائط الرادار والرياح. الخريطة المرسومة مضمّنة في الإضافة (Natural Earth) وتتبع السمة؛ تُحمَّل صورة القمر الصناعي من DWD لكل عرض.",
  "mouseDrag": "سحب",
  "mouseWheel": "عجلة الفأرة",
  "shortcutMapPan": "الخريطة: تحريك",
  "shortcutMapWheel": "الخريطة: تكبير نحو المؤشر",
  "shortcutZoomReset": "الخريطة: العودة إلى المكان، التكبير الافتراضي"
})
addCatalogEntries("he", {
  "mapStyle": "סגנון מפה",
  "mapStyleDrawn": "מצוירת (צבעי ערכת הנושא)",
  "mapStyleSatellite": "לוויין",
  "mapStyleHint": "מפות מכ״ם ורוח. המפה המצוירת מגיעה עם התוסף (Natural Earth) ועוקבת אחר ערכת הנושא; תמונת הלוויין נטענת מ־DWD לכל תצוגה.",
  "mouseDrag": "גרירה",
  "mouseWheel": "גלגלת העכבר",
  "shortcutMapPan": "מפה: הזזה",
  "shortcutMapWheel": "מפה: זום לכיוון הסמן",
  "shortcutZoomReset": "מפה: חזרה למקום, זום ברירת מחדל"
})
addCatalogEntries("fa", {
  "mapStyle": "سبک نقشه",
  "mapStyleDrawn": "ترسیمی (رنگ‌های پوسته)",
  "mapStyleSatellite": "ماهواره",
  "mapStyleHint": "نقشه‌های رادار و باد. نقشهٔ ترسیمی همراه افزونه است (Natural Earth) و از پوسته پیروی می‌کند؛ تصویر ماهواره‌ای برای هر نما از DWD بارگیری می‌شود.",
  "mouseDrag": "کشیدن",
  "mouseWheel": "چرخ موس",
  "shortcutMapPan": "نقشه: جابه‌جایی",
  "shortcutMapWheel": "نقشه: بزرگ‌نمایی به سمت نشانگر",
  "shortcutZoomReset": "نقشه: بازگشت به مکان، بزرگ‌نمایی پیش‌فرض"
})
addCatalogEntries("hi", {
  "mapStyle": "मानचित्र शैली",
  "mapStyleDrawn": "रेखांकित (थीम के रंग)",
  "mapStyleSatellite": "उपग्रह",
  "mapStyleHint": "रडार और हवा के मानचित्र। रेखांकित मानचित्र प्लगइन के साथ आता है (Natural Earth) और थीम का अनुसरण करता है; उपग्रह चित्र हर दृश्य के लिए DWD से लोड होता है।",
  "mouseDrag": "खींचें",
  "mouseWheel": "माउस व्हील",
  "shortcutMapPan": "मानचित्र: खिसकाएँ",
  "shortcutMapWheel": "मानचित्र: पॉइंटर की ओर ज़ूम",
  "shortcutZoomReset": "मानचित्र: स्थान पर वापस, मानक ज़ूम"
})
addCatalogEntries("id", {
  "mapStyle": "Gaya peta",
  "mapStyleDrawn": "Digambar (warna tema)",
  "mapStyleSatellite": "Satelit",
  "mapStyleHint": "Peta radar dan angin. Peta gambar disertakan dengan plugin (Natural Earth) dan mengikuti tema; gambar satelit dimuat dari DWD untuk setiap tampilan.",
  "mouseDrag": "Seret",
  "mouseWheel": "Roda tetikus",
  "shortcutMapPan": "Peta: geser",
  "shortcutMapWheel": "Peta: zoom ke arah penunjuk",
  "shortcutZoomReset": "Peta: kembali ke lokasi, zoom bawaan"
})
addCatalogEntries("vi", {
  "mapStyle": "Kiểu bản đồ",
  "mapStyleDrawn": "Vẽ (màu chủ đề)",
  "mapStyleSatellite": "Vệ tinh",
  "mapStyleHint": "Bản đồ radar và gió. Bản đồ vẽ đi kèm plugin (Natural Earth) và theo chủ đề; ảnh vệ tinh được tải từ DWD cho mỗi khung nhìn.",
  "mouseDrag": "Kéo",
  "mouseWheel": "Con lăn chuột",
  "shortcutMapPan": "Bản đồ: di chuyển",
  "shortcutMapWheel": "Bản đồ: thu phóng về phía con trỏ",
  "shortcutZoomReset": "Bản đồ: về vị trí, thu phóng mặc định"
})
addCatalogEntries("th", {
  "mapStyle": "รูปแบบแผนที่",
  "mapStyleDrawn": "วาด (สีธีม)",
  "mapStyleSatellite": "ดาวเทียม",
  "mapStyleHint": "แผนที่เรดาร์และลม แผนที่วาดมาพร้อมปลั๊กอิน (Natural Earth) และเป็นไปตามธีม ส่วนภาพดาวเทียมโหลดจาก DWD ทุกครั้งที่เปลี่ยนมุมมอง",
  "mouseDrag": "ลาก",
  "mouseWheel": "ล้อเมาส์",
  "shortcutMapPan": "แผนที่: เลื่อน",
  "shortcutMapWheel": "แผนที่: ซูมไปทางตัวชี้",
  "shortcutZoomReset": "แผนที่: กลับไปที่ตำแหน่ง ซูมมาตรฐาน"
})
addCatalogEntries("zh_CN", {
  "mapStyle": "地图样式",
  "mapStyleDrawn": "绘制（主题颜色）",
  "mapStyleSatellite": "卫星",
  "mapStyleHint": "雷达和风场地图。绘制地图随插件提供（Natural Earth）并跟随主题；卫星图像按每个视图从 DWD 加载。",
  "mouseDrag": "拖动",
  "mouseWheel": "鼠标滚轮",
  "shortcutMapPan": "地图：移动",
  "shortcutMapWheel": "地图：朝指针缩放",
  "shortcutZoomReset": "地图：回到地点，默认缩放"
})
addCatalogEntries("zh_TW", {
  "mapStyle": "地圖樣式",
  "mapStyleDrawn": "繪製（主題顏色）",
  "mapStyleSatellite": "衛星",
  "mapStyleHint": "雷達與風場地圖。繪製地圖隨外掛提供（Natural Earth）並跟隨主題；衛星影像依每個檢視從 DWD 載入。",
  "mouseDrag": "拖曳",
  "mouseWheel": "滑鼠滾輪",
  "shortcutMapPan": "地圖：移動",
  "shortcutMapWheel": "地圖：朝指標縮放",
  "shortcutZoomReset": "地圖：回到地點，預設縮放"
})
// Wheel with modifiers on the maps, the daily strip and the timeline (2.5).
addCatalogEntries("en", {
  "mapZoomHint": "Ctrl + wheel to zoom",
  "ctrlWheel": "Ctrl + wheel",
  "shiftWheel": "Shift + wheel",
  "shortcutSidewaysWheel": "Daily forecast and radar timeline: sideways (touchpad: swipe sideways)"
})
addCatalogEntries("de", {
  "mapZoomHint": "Strg + Mausrad zum Zoomen",
  "ctrlWheel": "Strg + Mausrad",
  "shiftWheel": "Umschalt + Mausrad",
  "shortcutSidewaysWheel": "Tagesvorhersage und Radar-Zeitleiste: seitwärts (Touchpad: seitlich wischen)"
})
addCatalogEntries("es", {
  "mapZoomHint": "Ctrl + rueda para hacer zoom",
  "ctrlWheel": "Ctrl + rueda",
  "shiftWheel": "Mayús + rueda",
  "shortcutSidewaysWheel": "Pronóstico diario y línea de tiempo del radar: en horizontal (touchpad: deslizar de lado)"
})
addCatalogEntries("fr", {
  "mapZoomHint": "Ctrl + molette pour zoomer",
  "ctrlWheel": "Ctrl + molette",
  "shiftWheel": "Maj + molette",
  "shortcutSidewaysWheel": "Prévisions quotidiennes et frise du radar : latéralement (pavé tactile : glisser de côté)"
})
addCatalogEntries("pt", {
  "mapZoomHint": "Ctrl + roda para ampliar",
  "ctrlWheel": "Ctrl + roda",
  "shiftWheel": "Shift + roda",
  "shortcutSidewaysWheel": "Previsão diária e linha do tempo do radar: na horizontal (touchpad: deslizar para o lado)"
})
addCatalogEntries("ru", {
  "mapZoomHint": "Ctrl + колесо для масштаба",
  "ctrlWheel": "Ctrl + колесо",
  "shiftWheel": "Shift + колесо",
  "shortcutSidewaysWheel": "Прогноз по дням и шкала радара: вбок (тачпад: провести вбок)"
})
addCatalogEntries("uk", {
  "mapZoomHint": "Ctrl + коліщатко для масштабу",
  "ctrlWheel": "Ctrl + коліщатко",
  "shiftWheel": "Shift + коліщатко",
  "shortcutSidewaysWheel": "Прогноз по днях і шкала радара: убік (тачпад: провести вбік)"
})
addCatalogEntries("pl", {
  "mapZoomHint": "Ctrl + kółko, aby powiększyć",
  "ctrlWheel": "Ctrl + kółko",
  "shiftWheel": "Shift + kółko",
  "shortcutSidewaysWheel": "Prognoza dzienna i oś czasu radaru: w bok (touchpad: przesuń w bok)"
})
addCatalogEntries("it", {
  "mapZoomHint": "Ctrl + rotella per lo zoom",
  "ctrlWheel": "Ctrl + rotella",
  "shiftWheel": "Maiusc + rotella",
  "shortcutSidewaysWheel": "Previsioni giornaliere e linea temporale del radar: di lato (touchpad: scorri di lato)"
})
addCatalogEntries("nl", {
  "mapZoomHint": "Ctrl + muiswiel om te zoomen",
  "ctrlWheel": "Ctrl + muiswiel",
  "shiftWheel": "Shift + muiswiel",
  "shortcutSidewaysWheel": "Dagverwachting en radartijdlijn: zijwaarts (touchpad: zijwaarts vegen)"
})
addCatalogEntries("tr", {
  "mapZoomHint": "Yakınlaştırmak için Ctrl + tekerlek",
  "ctrlWheel": "Ctrl + tekerlek",
  "shiftWheel": "Shift + tekerlek",
  "shortcutSidewaysWheel": "Günlük tahmin ve radar zaman çizelgesi: yana (dokunmatik yüzey: yana kaydır)"
})
addCatalogEntries("cs", {
  "mapZoomHint": "Ctrl + kolečko pro přiblížení",
  "ctrlWheel": "Ctrl + kolečko",
  "shiftWheel": "Shift + kolečko",
  "shortcutSidewaysWheel": "Denní předpověď a časová osa radaru: do stran (touchpad: přejetí do strany)"
})
addCatalogEntries("sv", {
  "mapZoomHint": "Ctrl + hjul för att zooma",
  "ctrlWheel": "Ctrl + hjul",
  "shiftWheel": "Skift + hjul",
  "shortcutSidewaysWheel": "Dygnsprognos och radarns tidslinje: i sidled (styrplatta: svep i sidled)"
})
addCatalogEntries("fi", {
  "mapZoomHint": "Ctrl + rulla zoomaa",
  "ctrlWheel": "Ctrl + rulla",
  "shiftWheel": "Vaihto + rulla",
  "shortcutSidewaysWheel": "Päiväennuste ja tutkan aikajana: sivuttain (kosketuslevy: pyyhkäise sivulle)"
})
addCatalogEntries("nb", {
  "mapZoomHint": "Ctrl + hjul for å zoome",
  "ctrlWheel": "Ctrl + hjul",
  "shiftWheel": "Shift + hjul",
  "shortcutSidewaysWheel": "Døgnvarsel og radarens tidslinje: sidelengs (styreplate: sveip sidelengs)"
})
addCatalogEntries("da", {
  "mapZoomHint": "Ctrl + hjul for at zoome",
  "ctrlWheel": "Ctrl + hjul",
  "shiftWheel": "Skift + hjul",
  "shortcutSidewaysWheel": "Døgnprognose og radarens tidslinje: sidelæns (pegeplade: stryg sidelæns)"
})
addCatalogEntries("ro", {
  "mapZoomHint": "Ctrl + rotiță pentru zoom",
  "ctrlWheel": "Ctrl + rotiță",
  "shiftWheel": "Shift + rotiță",
  "shortcutSidewaysWheel": "Prognoza zilnică și cronologia radarului: lateral (touchpad: glisare laterală)"
})
addCatalogEntries("hu", {
  "mapZoomHint": "Ctrl + görgő a nagyításhoz",
  "ctrlWheel": "Ctrl + görgő",
  "shiftWheel": "Shift + görgő",
  "shortcutSidewaysWheel": "Napi előrejelzés és radar idővonal: oldalra (érintőpad: oldalra húzás)"
})
addCatalogEntries("el", {
  "mapZoomHint": "Ctrl + ροδέλα για ζουμ",
  "ctrlWheel": "Ctrl + ροδέλα",
  "shiftWheel": "Shift + ροδέλα",
  "shortcutSidewaysWheel": "Ημερήσια πρόγνωση και χρονολόγιο ραντάρ: πλάγια (επιφάνεια αφής: σύρσιμο στο πλάι)"
})
addCatalogEntries("ja", {
  "mapZoomHint": "Ctrl + ホイールでズーム",
  "ctrlWheel": "Ctrl + ホイール",
  "shiftWheel": "Shift + ホイール",
  "shortcutSidewaysWheel": "日ごとの予報とレーダーのタイムライン：横方向（タッチパッド：横にスワイプ）"
})
addCatalogEntries("ko", {
  "mapZoomHint": "Ctrl + 휠로 확대/축소",
  "ctrlWheel": "Ctrl + 휠",
  "shiftWheel": "Shift + 휠",
  "shortcutSidewaysWheel": "일별 예보와 레이더 타임라인: 가로로 (터치패드: 옆으로 쓸기)"
})
addCatalogEntries("ar", {
  "mapZoomHint": "Ctrl + العجلة للتكبير",
  "ctrlWheel": "Ctrl + العجلة",
  "shiftWheel": "Shift + العجلة",
  "shortcutSidewaysWheel": "التوقعات اليومية والخط الزمني للرادار: جانبيًا (لوحة اللمس: اسحب جانبيًا)"
})
addCatalogEntries("he", {
  "mapZoomHint": "Ctrl + גלגלת לזום",
  "ctrlWheel": "Ctrl + גלגלת",
  "shiftWheel": "Shift + גלגלת",
  "shortcutSidewaysWheel": "תחזית יומית וציר הזמן של המכ״ם: לצדדים (משטח מגע: החלקה הצידה)"
})
addCatalogEntries("fa", {
  "mapZoomHint": "Ctrl + چرخ برای بزرگ‌نمایی",
  "ctrlWheel": "Ctrl + چرخ",
  "shiftWheel": "Shift + چرخ",
  "shortcutSidewaysWheel": "پیش‌بینی روزانه و نوار زمانی رادار: به پهلو (صفحهٔ لمسی: کشیدن به پهلو)"
})
addCatalogEntries("hi", {
  "mapZoomHint": "ज़ूम के लिए Ctrl + व्हील",
  "ctrlWheel": "Ctrl + व्हील",
  "shiftWheel": "Shift + व्हील",
  "shortcutSidewaysWheel": "दैनिक पूर्वानुमान और रडार टाइमलाइन: बगल में (टचपैड: बगल में स्वाइप)"
})
addCatalogEntries("id", {
  "mapZoomHint": "Ctrl + roda untuk zoom",
  "ctrlWheel": "Ctrl + roda",
  "shiftWheel": "Shift + roda",
  "shortcutSidewaysWheel": "Prakiraan harian dan linimasa radar: ke samping (touchpad: usap ke samping)"
})
addCatalogEntries("vi", {
  "mapZoomHint": "Ctrl + con lăn để thu phóng",
  "ctrlWheel": "Ctrl + con lăn",
  "shiftWheel": "Shift + con lăn",
  "shortcutSidewaysWheel": "Dự báo theo ngày và dòng thời gian radar: sang ngang (touchpad: vuốt ngang)"
})
addCatalogEntries("th", {
  "mapZoomHint": "Ctrl + ล้อเมาส์เพื่อซูม",
  "ctrlWheel": "Ctrl + ล้อเมาส์",
  "shiftWheel": "Shift + ล้อเมาส์",
  "shortcutSidewaysWheel": "พยากรณ์รายวันและไทม์ไลน์เรดาร์: เลื่อนด้านข้าง (ทัชแพด: ปัดด้านข้าง)"
})
addCatalogEntries("zh_CN", {
  "mapZoomHint": "Ctrl + 滚轮缩放",
  "ctrlWheel": "Ctrl + 滚轮",
  "shiftWheel": "Shift + 滚轮",
  "shortcutSidewaysWheel": "每日预报和雷达时间轴：横向（触控板：左右滑动）"
})
addCatalogEntries("zh_TW", {
  "mapZoomHint": "Ctrl + 滾輪縮放",
  "ctrlWheel": "Ctrl + 滾輪",
  "shiftWheel": "Shift + 滾輪",
  "shortcutSidewaysWheel": "每日預報與雷達時間軸：橫向（觸控板：左右滑動）"
})
// Ctrl + arrows move the map (2.5): the Ctrl key's name as in "ctrlWheel".
Object.keys(catalog).forEach(function(language) {
  var wheel = catalog[language].ctrlWheel || catalog.en.ctrlWheel
  var key = String(wheel).split(" + ")[0] || "Ctrl"
  catalog[language].ctrlArrows = key + " ← → ↑ ↓"
})
// Wind map heights and its processor note (2.5).
addCatalogEntries("en", {
  "windMapSummaryAloft": "{location} · {speed} {unit} from {direction}",
  "windCpuHint": "The animated wind map takes about a fifth of a processor core while it is on screen (Qt draws it in software), and nothing while the tab or the window is hidden. Its height (10 m up to 10 km) is chosen at the map's top left.",
  "shortcutWindLevel": "Wind map: higher / lower"
})
addCatalogEntries("de", {
  "windMapSummaryAloft": "{location} · {speed} {unit} aus {direction}",
  "windCpuHint": "Die animierte Windkarte braucht etwa ein Fünftel eines Prozessorkerns, solange sie zu sehen ist (Qt zeichnet sie in Software), und nichts, solange Tab oder Fenster verborgen sind. Die Höhe (10 m bis 10 km) wird oben links auf der Karte gewählt.",
  "shortcutWindLevel": "Windkarte: höher / tiefer"
})
addCatalogEntries("es", {
  "windMapSummaryAloft": "{location} · {speed} {unit} del {direction}",
  "windCpuHint": "El mapa de viento animado usa aproximadamente una quinta parte de un núcleo del procesador mientras está visible (Qt lo dibuja por software), y nada mientras la pestaña o la ventana están ocultas. La altura (de 10 m a 10 km) se elige arriba a la izquierda del mapa.",
  "shortcutWindLevel": "Mapa de viento: más alto / más bajo"
})
addCatalogEntries("fr", {
  "windMapSummaryAloft": "{location} · {speed} {unit} de {direction}",
  "windCpuHint": "La carte du vent animée utilise environ un cinquième d'un cœur de processeur tant qu'elle est affichée (Qt la dessine en logiciel), et rien quand l'onglet ou la fenêtre est masqué. L'altitude (de 10 m à 10 km) se choisit en haut à gauche de la carte.",
  "shortcutWindLevel": "Carte du vent : plus haut / plus bas"
})
addCatalogEntries("pt", {
  "windMapSummaryAloft": "{location} · {speed} {unit} de {direction}",
  "windCpuHint": "O mapa de vento animado usa cerca de um quinto de um núcleo do processador enquanto está visível (o Qt desenha-o em software), e nada enquanto o separador ou a janela estão ocultos. A altura (de 10 m a 10 km) escolhe-se no canto superior esquerdo do mapa.",
  "shortcutWindLevel": "Mapa de vento: mais alto / mais baixo"
})
addCatalogEntries("ru", {
  "windMapSummaryAloft": "{location} · {speed} {unit}, {direction}",
  "windCpuHint": "Анимированная карта ветра занимает примерно пятую часть ядра процессора, пока она видна (Qt рисует её программно), и ничего, пока вкладка или окно скрыты. Высота (от 10 м до 10 км) выбирается слева вверху на карте.",
  "shortcutWindLevel": "Карта ветра: выше / ниже"
})
addCatalogEntries("uk", {
  "windMapSummaryAloft": "{location} · {speed} {unit}, {direction}",
  "windCpuHint": "Анімована карта вітру займає приблизно п'яту частину ядра процесора, поки її видно (Qt малює її програмно), і нічого, поки вкладку чи вікно приховано. Висоту (від 10 м до 10 км) вибирають угорі ліворуч на карті.",
  "shortcutWindLevel": "Карта вітру: вище / нижче"
})
addCatalogEntries("pl", {
  "windMapSummaryAloft": "{location} · {speed} {unit} z {direction}",
  "windCpuHint": "Animowana mapa wiatru zajmuje około jednej piątej rdzenia procesora, gdy jest widoczna (Qt rysuje ją programowo), i nic, gdy karta lub okno są ukryte. Wysokość (od 10 m do 10 km) wybiera się w lewym górnym rogu mapy.",
  "shortcutWindLevel": "Mapa wiatru: wyżej / niżej"
})
addCatalogEntries("it", {
  "windMapSummaryAloft": "{location} · {speed} {unit} da {direction}",
  "windCpuHint": "La mappa del vento animata usa circa un quinto di un core del processore finché è visibile (Qt la disegna via software), e nulla mentre la scheda o la finestra sono nascoste. L'altezza (da 10 m a 10 km) si sceglie in alto a sinistra sulla mappa.",
  "shortcutWindLevel": "Mappa del vento: più in alto / più in basso"
})
addCatalogEntries("nl", {
  "windMapSummaryAloft": "{location} · {speed} {unit} uit {direction}",
  "windCpuHint": "De geanimeerde windkaart gebruikt ongeveer een vijfde van een processorkern zolang ze zichtbaar is (Qt tekent haar in software), en niets zolang het tabblad of venster verborgen is. De hoogte (10 m tot 10 km) kies je linksboven op de kaart.",
  "shortcutWindLevel": "Windkaart: hoger / lager"
})
addCatalogEntries("tr", {
  "windMapSummaryAloft": "{location} · {direction} yönünden {speed} {unit}",
  "windCpuHint": "Hareketli rüzgâr haritası görünür olduğu sürece bir işlemci çekirdeğinin yaklaşık beşte birini kullanır (Qt onu yazılımla çizer); sekme veya pencere gizliyken hiç kullanmaz. Yükseklik (10 m ile 10 km arası) haritanın sol üstünden seçilir.",
  "shortcutWindLevel": "Rüzgâr haritası: daha yüksek / daha alçak"
})
addCatalogEntries("cs", {
  "windMapSummaryAloft": "{location} · {speed} {unit} od {direction}",
  "windCpuHint": "Animovaná mapa větru zabírá asi pětinu jádra procesoru, dokud je vidět (Qt ji kreslí softwarově), a nic, když je karta nebo okno skryté. Výšku (10 m až 10 km) zvolíte vlevo nahoře na mapě.",
  "shortcutWindLevel": "Mapa větru: výš / níž"
})
addCatalogEntries("sv", {
  "windMapSummaryAloft": "{location} · {speed} {unit} från {direction}",
  "windCpuHint": "Den animerade vindkartan använder ungefär en femtedel av en processorkärna medan den syns (Qt ritar den i mjukvara), och inget medan fliken eller fönstret är dolt. Höjden (10 m till 10 km) väljs uppe till vänster på kartan.",
  "shortcutWindLevel": "Vindkarta: högre / lägre"
})
addCatalogEntries("fi", {
  "windMapSummaryAloft": "{location} · {speed} {unit} suunnasta {direction}",
  "windCpuHint": "Animoitu tuulikartta vie noin viidenneksen prosessoriytimestä näkyvissä ollessaan (Qt piirtää sen ohjelmallisesti), eikä mitään, kun välilehti tai ikkuna on piilossa. Korkeus (10 m – 10 km) valitaan kartan vasemmasta yläkulmasta.",
  "shortcutWindLevel": "Tuulikartta: ylemmäs / alemmas"
})
addCatalogEntries("nb", {
  "windMapSummaryAloft": "{location} · {speed} {unit} fra {direction}",
  "windCpuHint": "Det animerte vindkartet bruker omtrent en femtedel av en prosessorkjerne mens det vises (Qt tegner det i programvare), og ingenting mens fanen eller vinduet er skjult. Høyden (10 m til 10 km) velges øverst til venstre på kartet.",
  "shortcutWindLevel": "Vindkart: høyere / lavere"
})
addCatalogEntries("da", {
  "windMapSummaryAloft": "{location} · {speed} {unit} fra {direction}",
  "windCpuHint": "Det animerede vindkort bruger omkring en femtedel af en processorkerne, mens det vises (Qt tegner det i software), og intet, mens fanen eller vinduet er skjult. Højden (10 m til 10 km) vælges øverst til venstre på kortet.",
  "shortcutWindLevel": "Vindkort: højere / lavere"
})
addCatalogEntries("ro", {
  "windMapSummaryAloft": "{location} · {speed} {unit} din {direction}",
  "windCpuHint": "Harta animată a vântului folosește aproximativ o cincime dintr-un nucleu de procesor cât timp este vizibilă (Qt o desenează software), și nimic cât timp fila sau fereastra sunt ascunse. Înălțimea (10 m până la 10 km) se alege din stânga sus a hărții.",
  "shortcutWindLevel": "Harta vântului: mai sus / mai jos"
})
addCatalogEntries("hu", {
  "windMapSummaryAloft": "{location} · {speed} {unit}, {direction} felől",
  "windCpuHint": "Az animált széltérkép látható állapotban egy processzormag nagyjából ötödét használja (a Qt szoftveresen rajzolja), rejtett lap vagy ablak esetén semmit. A magasság (10 m-től 10 km-ig) a térkép bal felső sarkában választható.",
  "shortcutWindLevel": "Széltérkép: magasabban / alacsonyabban"
})
addCatalogEntries("el", {
  "windMapSummaryAloft": "{location} · {speed} {unit} από {direction}",
  "windCpuHint": "Ο κινούμενος χάρτης ανέμου χρησιμοποιεί περίπου το ένα πέμπτο ενός πυρήνα επεξεργαστή όσο είναι ορατός (το Qt τον σχεδιάζει μέσω λογισμικού) και τίποτα όσο η καρτέλα ή το παράθυρο είναι κρυφά. Το ύψος (10 m έως 10 km) επιλέγεται πάνω αριστερά στον χάρτη.",
  "shortcutWindLevel": "Χάρτης ανέμου: ψηλότερα / χαμηλότερα"
})
addCatalogEntries("ja", {
  "windMapSummaryAloft": "{location} · {direction}の風 {speed} {unit}",
  "windCpuHint": "アニメーションする風の地図は、表示中は CPU コア約 5 分の 1 を使います（Qt がソフトウェアで描画するため）。タブやウィンドウが隠れている間は使いません。高さ（10 m〜10 km）は地図の左上で選びます。",
  "shortcutWindLevel": "風の地図：上の層 / 下の層"
})
addCatalogEntries("ko", {
  "windMapSummaryAloft": "{location} · {direction}풍 {speed} {unit}",
  "windCpuHint": "움직이는 바람 지도는 화면에 보이는 동안 CPU 코어의 약 5분의 1을 사용합니다(Qt가 소프트웨어로 그림). 탭이나 창이 숨겨지면 사용하지 않습니다. 높이(10 m~10 km)는 지도 왼쪽 위에서 고릅니다.",
  "shortcutWindLevel": "바람 지도: 더 높이 / 더 낮게"
})
addCatalogEntries("ar", {
  "windMapSummaryAloft": "{location} · {speed} {unit} من {direction}",
  "windCpuHint": "تستهلك خريطة الرياح المتحركة نحو خُمس نواة معالج ما دامت ظاهرة (يرسمها Qt برمجيًا)، ولا شيء عندما يكون التبويب أو النافذة مخفيًا. يُختار الارتفاع (من 10 م إلى 10 كم) أعلى يسار الخريطة.",
  "shortcutWindLevel": "خريطة الرياح: أعلى / أدنى"
})
addCatalogEntries("he", {
  "windMapSummaryAloft": "{location} · {speed} {unit} מ{direction}",
  "windCpuHint": "מפת הרוח המונפשת צורכת כחמישית מליבת מעבד כל עוד היא מוצגת (Qt מצייר אותה בתוכנה), ולא כלום כשהלשונית או החלון מוסתרים. הגובה (‎10 מ׳ עד 10 ק״מ) נבחר בפינה השמאלית העליונה של המפה.",
  "shortcutWindLevel": "מפת רוח: גבוה יותר / נמוך יותר"
})
addCatalogEntries("fa", {
  "windMapSummaryAloft": "{location} · {speed} {unit} از {direction}",
  "windCpuHint": "نقشهٔ متحرک باد تا وقتی دیده می‌شود حدود یک‌پنجم یک هستهٔ پردازنده را مصرف می‌کند (Qt آن را نرم‌افزاری رسم می‌کند) و وقتی زبانه یا پنجره پنهان است هیچ. ارتفاع (۱۰ متر تا ۱۰ کیلومتر) در بالا-چپ نقشه انتخاب می‌شود.",
  "shortcutWindLevel": "نقشهٔ باد: بالاتر / پایین‌تر"
})
addCatalogEntries("hi", {
  "windMapSummaryAloft": "{location} · {direction} से {speed} {unit}",
  "windCpuHint": "एनिमेटेड हवा का मानचित्र दिखते रहने तक प्रोसेसर कोर का लगभग पाँचवाँ हिस्सा लेता है (Qt इसे सॉफ़्टवेयर में बनाता है), और टैब या विंडो छिपी होने पर कुछ नहीं। ऊँचाई (10 मी से 10 किमी) मानचित्र के ऊपर बाईं ओर चुनी जाती है।",
  "shortcutWindLevel": "हवा का मानचित्र: ऊपर / नीचे"
})
addCatalogEntries("id", {
  "windMapSummaryAloft": "{location} · {speed} {unit} dari {direction}",
  "windCpuHint": "Peta angin beranimasi memakai sekitar seperlima inti prosesor selama terlihat (Qt menggambarnya secara perangkat lunak), dan tidak sama sekali saat tab atau jendela tersembunyi. Ketinggian (10 m hingga 10 km) dipilih di kiri atas peta.",
  "shortcutWindLevel": "Peta angin: lebih tinggi / lebih rendah"
})
addCatalogEntries("vi", {
  "windMapSummaryAloft": "{location} · {speed} {unit} hướng {direction}",
  "windCpuHint": "Bản đồ gió động dùng khoảng một phần năm lõi CPU khi đang hiển thị (Qt vẽ bằng phần mềm), và không dùng khi thẻ hoặc cửa sổ bị ẩn. Độ cao (10 m đến 10 km) được chọn ở góc trên bên trái bản đồ.",
  "shortcutWindLevel": "Bản đồ gió: cao hơn / thấp hơn"
})
addCatalogEntries("th", {
  "windMapSummaryAloft": "{location} · {speed} {unit} จาก{direction}",
  "windCpuHint": "แผนที่ลมแบบเคลื่อนไหวใช้ประมาณหนึ่งในห้าของคอร์ซีพียูขณะแสดงอยู่ (Qt วาดด้วยซอฟต์แวร์) และไม่ใช้เลยเมื่อแท็บหรือหน้าต่างถูกซ่อน เลือกความสูง (10 ม. ถึง 10 กม.) ที่มุมซ้ายบนของแผนที่",
  "shortcutWindLevel": "แผนที่ลม: สูงขึ้น / ต่ำลง"
})
addCatalogEntries("zh_CN", {
  "windMapSummaryAloft": "{location} · {direction}风 {speed} {unit}",
  "windCpuHint": "动态风场地图在显示时约占一个处理器核心的五分之一（Qt 以软件方式绘制），标签页或窗口隐藏时不占用。高度（10 米至 10 千米）在地图左上角选择。",
  "shortcutWindLevel": "风场地图：升高 / 降低"
})
addCatalogEntries("zh_TW", {
  "windMapSummaryAloft": "{location} · {direction}風 {speed} {unit}",
  "windCpuHint": "動態風場地圖在顯示時約佔一個處理器核心的五分之一（Qt 以軟體方式繪製），分頁或視窗隱藏時不佔用。高度（10 公尺至 10 公里）在地圖左上角選擇。",
  "shortcutWindLevel": "風場地圖：升高 / 降低"
})
// Export and import of the settings (2.5).
addCatalogEntries("en", {
  "settingsTransfer": "Export and import",
  "settingsTransferFile": "File",
  "settingsExport": "Export",
  "settingsImport": "Import",
  "settingsImportConfirm": "Really import?",
  "settingsExported": "Exported to {path}.",
  "settingsExportFailed": "Could not write {path}.",
  "settingsBackupFailed": "Could not save the current settings to {path}; nothing was imported.",
  "settingsImportMissing": "{path} could not be read.",
  "settingsImportInvalid": "{path} is not a More Weather settings file.",
  "settingsImported": "Imported from {path}. The previous settings are in {backup}.",
  "settingsTransferHint": "The general settings, the menu bar, widget and app display and your places, in one file. Before an import the current settings are saved to {backup}, so it can be undone by importing that file."
})
addCatalogEntries("de", {
  "settingsTransfer": "Exportieren und importieren",
  "settingsTransferFile": "Datei",
  "settingsExport": "Exportieren",
  "settingsImport": "Importieren",
  "settingsImportConfirm": "Wirklich importieren?",
  "settingsExported": "Exportiert nach {path}.",
  "settingsExportFailed": "{path} konnte nicht geschrieben werden.",
  "settingsBackupFailed": "Die aktuellen Einstellungen konnten nicht nach {path} gesichert werden; es wurde nichts importiert.",
  "settingsImportMissing": "{path} konnte nicht gelesen werden.",
  "settingsImportInvalid": "{path} ist keine Einstellungsdatei von More Weather.",
  "settingsImported": "Importiert aus {path}. Die bisherigen Einstellungen liegen in {backup}.",
  "settingsTransferHint": "Die allgemeinen Einstellungen, die Anzeige von Menüleiste, Widget und App sowie deine Orte in einer Datei. Vor einem Import werden die aktuellen Einstellungen nach {backup} gesichert; ein Import dieser Datei macht ihn rückgängig."
})
addCatalogEntries("es", {
  "settingsTransfer": "Exportar e importar",
  "settingsTransferFile": "Archivo",
  "settingsExport": "Exportar",
  "settingsImport": "Importar",
  "settingsImportConfirm": "¿Importar de verdad?",
  "settingsExported": "Exportado a {path}.",
  "settingsExportFailed": "No se pudo escribir {path}.",
  "settingsBackupFailed": "No se pudieron guardar los ajustes actuales en {path}; no se importó nada.",
  "settingsImportMissing": "No se pudo leer {path}.",
  "settingsImportInvalid": "{path} no es un archivo de ajustes de More Weather.",
  "settingsImported": "Importado de {path}. Los ajustes anteriores están en {backup}.",
  "settingsTransferHint": "Los ajustes generales, la presentación de la barra de menús, el widget y la app, y tus lugares, en un archivo. Antes de importar, los ajustes actuales se guardan en {backup}; importar ese archivo lo deshace."
})
addCatalogEntries("fr", {
  "settingsTransfer": "Exporter et importer",
  "settingsTransferFile": "Fichier",
  "settingsExport": "Exporter",
  "settingsImport": "Importer",
  "settingsImportConfirm": "Vraiment importer ?",
  "settingsExported": "Exporté vers {path}.",
  "settingsExportFailed": "Impossible d'écrire {path}.",
  "settingsBackupFailed": "Impossible d'enregistrer les réglages actuels dans {path} ; rien n'a été importé.",
  "settingsImportMissing": "Impossible de lire {path}.",
  "settingsImportInvalid": "{path} n'est pas un fichier de réglages de More Weather.",
  "settingsImported": "Importé depuis {path}. Les réglages précédents sont dans {backup}.",
  "settingsTransferHint": "Les réglages généraux, l'affichage de la barre de menus, du widget et de l'app, et vos lieux, dans un seul fichier. Avant une importation, les réglages actuels sont enregistrés dans {backup} ; importer ce fichier l'annule."
})
addCatalogEntries("pt", {
  "settingsTransfer": "Exportar e importar",
  "settingsTransferFile": "Ficheiro",
  "settingsExport": "Exportar",
  "settingsImport": "Importar",
  "settingsImportConfirm": "Importar mesmo?",
  "settingsExported": "Exportado para {path}.",
  "settingsExportFailed": "Não foi possível escrever {path}.",
  "settingsBackupFailed": "Não foi possível guardar as definições atuais em {path}; nada foi importado.",
  "settingsImportMissing": "Não foi possível ler {path}.",
  "settingsImportInvalid": "{path} não é um ficheiro de definições do More Weather.",
  "settingsImported": "Importado de {path}. As definições anteriores estão em {backup}.",
  "settingsTransferHint": "As definições gerais, a apresentação da barra de menus, do widget e da app, e os seus locais, num ficheiro. Antes de importar, as definições atuais são guardadas em {backup}; importar esse ficheiro desfaz a importação."
})
addCatalogEntries("ru", {
  "settingsTransfer": "Экспорт и импорт",
  "settingsTransferFile": "Файл",
  "settingsExport": "Экспортировать",
  "settingsImport": "Импортировать",
  "settingsImportConfirm": "Точно импортировать?",
  "settingsExported": "Экспортировано в {path}.",
  "settingsExportFailed": "Не удалось записать {path}.",
  "settingsBackupFailed": "Не удалось сохранить текущие настройки в {path}; ничего не импортировано.",
  "settingsImportMissing": "Не удалось прочитать {path}.",
  "settingsImportInvalid": "{path} — не файл настроек More Weather.",
  "settingsImported": "Импортировано из {path}. Прежние настройки — в {backup}.",
  "settingsTransferHint": "Общие настройки, отображение в панели, виджете и приложении и ваши места — в одном файле. Перед импортом текущие настройки сохраняются в {backup}; импорт этого файла отменяет изменения."
})
addCatalogEntries("uk", {
  "settingsTransfer": "Експорт та імпорт",
  "settingsTransferFile": "Файл",
  "settingsExport": "Експортувати",
  "settingsImport": "Імпортувати",
  "settingsImportConfirm": "Справді імпортувати?",
  "settingsExported": "Експортовано до {path}.",
  "settingsExportFailed": "Не вдалося записати {path}.",
  "settingsBackupFailed": "Не вдалося зберегти поточні налаштування до {path}; нічого не імпортовано.",
  "settingsImportMissing": "Не вдалося прочитати {path}.",
  "settingsImportInvalid": "{path} — не файл налаштувань More Weather.",
  "settingsImported": "Імпортовано з {path}. Попередні налаштування — у {backup}.",
  "settingsTransferHint": "Загальні налаштування, відображення в панелі, віджеті й застосунку та ваші місця — в одному файлі. Перед імпортом поточні налаштування зберігаються до {backup}; імпорт цього файла скасовує зміни."
})
addCatalogEntries("pl", {
  "settingsTransfer": "Eksport i import",
  "settingsTransferFile": "Plik",
  "settingsExport": "Eksportuj",
  "settingsImport": "Importuj",
  "settingsImportConfirm": "Na pewno importować?",
  "settingsExported": "Wyeksportowano do {path}.",
  "settingsExportFailed": "Nie udało się zapisać {path}.",
  "settingsBackupFailed": "Nie udało się zapisać bieżących ustawień do {path}; nic nie zaimportowano.",
  "settingsImportMissing": "Nie udało się odczytać {path}.",
  "settingsImportInvalid": "{path} nie jest plikiem ustawień More Weather.",
  "settingsImported": "Zaimportowano z {path}. Poprzednie ustawienia są w {backup}.",
  "settingsTransferHint": "Ustawienia ogólne, wygląd paska menu, widżetu i aplikacji oraz twoje miejsca w jednym pliku. Przed importem bieżące ustawienia są zapisywane do {backup}; zaimportowanie tego pliku cofa zmiany."
})
addCatalogEntries("it", {
  "settingsTransfer": "Esporta e importa",
  "settingsTransferFile": "File",
  "settingsExport": "Esporta",
  "settingsImport": "Importa",
  "settingsImportConfirm": "Importare davvero?",
  "settingsExported": "Esportato in {path}.",
  "settingsExportFailed": "Impossibile scrivere {path}.",
  "settingsBackupFailed": "Impossibile salvare le impostazioni attuali in {path}; non è stato importato nulla.",
  "settingsImportMissing": "Impossibile leggere {path}.",
  "settingsImportInvalid": "{path} non è un file di impostazioni di More Weather.",
  "settingsImported": "Importato da {path}. Le impostazioni precedenti sono in {backup}.",
  "settingsTransferHint": "Le impostazioni generali, la visualizzazione di barra dei menu, widget e app e i tuoi luoghi, in un unico file. Prima di un'importazione le impostazioni attuali vengono salvate in {backup}; importare quel file la annulla."
})
addCatalogEntries("nl", {
  "settingsTransfer": "Exporteren en importeren",
  "settingsTransferFile": "Bestand",
  "settingsExport": "Exporteren",
  "settingsImport": "Importeren",
  "settingsImportConfirm": "Echt importeren?",
  "settingsExported": "Geëxporteerd naar {path}.",
  "settingsExportFailed": "{path} kon niet worden geschreven.",
  "settingsBackupFailed": "De huidige instellingen konden niet in {path} worden opgeslagen; er is niets geïmporteerd.",
  "settingsImportMissing": "{path} kon niet worden gelezen.",
  "settingsImportInvalid": "{path} is geen instellingenbestand van More Weather.",
  "settingsImported": "Geïmporteerd uit {path}. De vorige instellingen staan in {backup}.",
  "settingsTransferHint": "De algemene instellingen, de weergave van menubalk, widget en app en je plaatsen in één bestand. Voor een import worden de huidige instellingen in {backup} opgeslagen; dat bestand importeren maakt het ongedaan."
})
addCatalogEntries("tr", {
  "settingsTransfer": "Dışa ve içe aktar",
  "settingsTransferFile": "Dosya",
  "settingsExport": "Dışa aktar",
  "settingsImport": "İçe aktar",
  "settingsImportConfirm": "Gerçekten içe aktarılsın mı?",
  "settingsExported": "{path} konumuna aktarıldı.",
  "settingsExportFailed": "{path} yazılamadı.",
  "settingsBackupFailed": "Geçerli ayarlar {path} konumuna kaydedilemedi; hiçbir şey içe aktarılmadı.",
  "settingsImportMissing": "{path} okunamadı.",
  "settingsImportInvalid": "{path} bir More Weather ayar dosyası değil.",
  "settingsImported": "{path} içinden aktarıldı. Önceki ayarlar {backup} içinde.",
  "settingsTransferHint": "Genel ayarlar, menü çubuğu, widget ve uygulama görünümü ile yerleriniz tek dosyada. İçe aktarmadan önce geçerli ayarlar {backup} konumuna kaydedilir; bu dosyayı içe aktarmak işlemi geri alır."
})
addCatalogEntries("cs", {
  "settingsTransfer": "Export a import",
  "settingsTransferFile": "Soubor",
  "settingsExport": "Exportovat",
  "settingsImport": "Importovat",
  "settingsImportConfirm": "Opravdu importovat?",
  "settingsExported": "Exportováno do {path}.",
  "settingsExportFailed": "{path} nelze zapsat.",
  "settingsBackupFailed": "Současná nastavení nelze uložit do {path}; nic nebylo importováno.",
  "settingsImportMissing": "{path} nelze přečíst.",
  "settingsImportInvalid": "{path} není soubor nastavení More Weather.",
  "settingsImported": "Importováno z {path}. Předchozí nastavení jsou v {backup}.",
  "settingsTransferHint": "Obecná nastavení, zobrazení v liště, widgetu a aplikaci a vaše místa v jednom souboru. Před importem se současná nastavení uloží do {backup}; import tohoto souboru jej vrátí."
})
addCatalogEntries("sv", {
  "settingsTransfer": "Exportera och importera",
  "settingsTransferFile": "Fil",
  "settingsExport": "Exportera",
  "settingsImport": "Importera",
  "settingsImportConfirm": "Verkligen importera?",
  "settingsExported": "Exporterat till {path}.",
  "settingsExportFailed": "Kunde inte skriva {path}.",
  "settingsBackupFailed": "Kunde inte spara de aktuella inställningarna i {path}; inget importerades.",
  "settingsImportMissing": "{path} kunde inte läsas.",
  "settingsImportInvalid": "{path} är ingen inställningsfil för More Weather.",
  "settingsImported": "Importerat från {path}. De tidigare inställningarna finns i {backup}.",
  "settingsTransferHint": "De allmänna inställningarna, visningen i menyraden, widgeten och appen samt dina platser i en fil. Före en import sparas de aktuella inställningarna i {backup}; att importera den filen ångrar det."
})
addCatalogEntries("fi", {
  "settingsTransfer": "Vienti ja tuonti",
  "settingsTransferFile": "Tiedosto",
  "settingsExport": "Vie",
  "settingsImport": "Tuo",
  "settingsImportConfirm": "Tuodaanko varmasti?",
  "settingsExported": "Viety tiedostoon {path}.",
  "settingsExportFailed": "Tiedostoa {path} ei voitu kirjoittaa.",
  "settingsBackupFailed": "Nykyisiä asetuksia ei voitu tallentaa tiedostoon {path}; mitään ei tuotu.",
  "settingsImportMissing": "Tiedostoa {path} ei voitu lukea.",
  "settingsImportInvalid": "{path} ei ole More Weatherin asetustiedosto.",
  "settingsImported": "Tuotu tiedostosta {path}. Aiemmat asetukset ovat tiedostossa {backup}.",
  "settingsTransferHint": "Yleiset asetukset, valikkopalkin, widgetin ja sovelluksen näkymä sekä paikkasi yhdessä tiedostossa. Ennen tuontia nykyiset asetukset tallennetaan tiedostoon {backup}; sen tuominen peruu muutoksen."
})
addCatalogEntries("nb", {
  "settingsTransfer": "Eksporter og importer",
  "settingsTransferFile": "Fil",
  "settingsExport": "Eksporter",
  "settingsImport": "Importer",
  "settingsImportConfirm": "Vil du virkelig importere?",
  "settingsExported": "Eksportert til {path}.",
  "settingsExportFailed": "Kunne ikke skrive {path}.",
  "settingsBackupFailed": "Kunne ikke lagre gjeldende innstillinger i {path}; ingenting ble importert.",
  "settingsImportMissing": "{path} kunne ikke leses.",
  "settingsImportInvalid": "{path} er ikke en innstillingsfil for More Weather.",
  "settingsImported": "Importert fra {path}. De forrige innstillingene ligger i {backup}.",
  "settingsTransferHint": "De generelle innstillingene, visningen i menylinjen, widgeten og appen og stedene dine i én fil. Før en import lagres gjeldende innstillinger i {backup}; å importere den filen angrer det."
})
addCatalogEntries("da", {
  "settingsTransfer": "Eksportér og importér",
  "settingsTransferFile": "Fil",
  "settingsExport": "Eksportér",
  "settingsImport": "Importér",
  "settingsImportConfirm": "Vil du virkelig importere?",
  "settingsExported": "Eksporteret til {path}.",
  "settingsExportFailed": "{path} kunne ikke skrives.",
  "settingsBackupFailed": "De aktuelle indstillinger kunne ikke gemmes i {path}; intet blev importeret.",
  "settingsImportMissing": "{path} kunne ikke læses.",
  "settingsImportInvalid": "{path} er ikke en indstillingsfil fra More Weather.",
  "settingsImported": "Importeret fra {path}. De tidligere indstillinger ligger i {backup}.",
  "settingsTransferHint": "De generelle indstillinger, visningen i menulinjen, widgetten og appen samt dine steder i én fil. Før en import gemmes de aktuelle indstillinger i {backup}; at importere den fil fortryder det."
})
addCatalogEntries("ro", {
  "settingsTransfer": "Export și import",
  "settingsTransferFile": "Fișier",
  "settingsExport": "Exportă",
  "settingsImport": "Importă",
  "settingsImportConfirm": "Sigur importați?",
  "settingsExported": "Exportat în {path}.",
  "settingsExportFailed": "{path} nu a putut fi scris.",
  "settingsBackupFailed": "Setările actuale nu au putut fi salvate în {path}; nu s-a importat nimic.",
  "settingsImportMissing": "{path} nu a putut fi citit.",
  "settingsImportInvalid": "{path} nu este un fișier de setări More Weather.",
  "settingsImported": "Importat din {path}. Setările anterioare sunt în {backup}.",
  "settingsTransferHint": "Setările generale, afișarea în bara de meniu, widget și aplicație și locurile tale, într-un singur fișier. Înainte de import, setările actuale sunt salvate în {backup}; importul acelui fișier anulează operațiunea."
})
addCatalogEntries("hu", {
  "settingsTransfer": "Exportálás és importálás",
  "settingsTransferFile": "Fájl",
  "settingsExport": "Exportálás",
  "settingsImport": "Importálás",
  "settingsImportConfirm": "Biztosan importálja?",
  "settingsExported": "Exportálva ide: {path}.",
  "settingsExportFailed": "A(z) {path} nem írható.",
  "settingsBackupFailed": "A jelenlegi beállítások nem menthetők ide: {path}; semmi sem lett importálva.",
  "settingsImportMissing": "A(z) {path} nem olvasható.",
  "settingsImportInvalid": "A(z) {path} nem More Weather beállításfájl.",
  "settingsImported": "Importálva innen: {path}. A korábbi beállítások itt vannak: {backup}.",
  "settingsTransferHint": "Az általános beállítások, a menüsor, a widget és az alkalmazás megjelenítése és a helyeid egy fájlban. Importálás előtt a jelenlegi beállítások ide mentődnek: {backup}; ennek a fájlnak az importálása visszavonja a változást."
})
addCatalogEntries("el", {
  "settingsTransfer": "Εξαγωγή και εισαγωγή",
  "settingsTransferFile": "Αρχείο",
  "settingsExport": "Εξαγωγή",
  "settingsImport": "Εισαγωγή",
  "settingsImportConfirm": "Σίγουρα εισαγωγή;",
  "settingsExported": "Εξήχθη στο {path}.",
  "settingsExportFailed": "Δεν ήταν δυνατή η εγγραφή του {path}.",
  "settingsBackupFailed": "Δεν ήταν δυνατή η αποθήκευση των τρεχουσών ρυθμίσεων στο {path}· δεν εισήχθη τίποτα.",
  "settingsImportMissing": "Δεν ήταν δυνατή η ανάγνωση του {path}.",
  "settingsImportInvalid": "Το {path} δεν είναι αρχείο ρυθμίσεων του More Weather.",
  "settingsImported": "Εισήχθη από το {path}. Οι προηγούμενες ρυθμίσεις βρίσκονται στο {backup}.",
  "settingsTransferHint": "Οι γενικές ρυθμίσεις, η εμφάνιση στη γραμμή μενού, στο widget και στην εφαρμογή και οι τοποθεσίες σας σε ένα αρχείο. Πριν από μια εισαγωγή οι τρέχουσες ρυθμίσεις αποθηκεύονται στο {backup}· η εισαγωγή αυτού του αρχείου την αναιρεί."
})
addCatalogEntries("ja", {
  "settingsTransfer": "エクスポートとインポート",
  "settingsTransferFile": "ファイル",
  "settingsExport": "エクスポート",
  "settingsImport": "インポート",
  "settingsImportConfirm": "本当にインポートしますか？",
  "settingsExported": "{path} にエクスポートしました。",
  "settingsExportFailed": "{path} に書き込めませんでした。",
  "settingsBackupFailed": "現在の設定を {path} に保存できなかったため、何もインポートしていません。",
  "settingsImportMissing": "{path} を読み込めませんでした。",
  "settingsImportInvalid": "{path} は More Weather の設定ファイルではありません。",
  "settingsImported": "{path} からインポートしました。以前の設定は {backup} にあります。",
  "settingsTransferHint": "全般設定、メニューバー・ウィジェット・アプリの表示、保存した場所を 1 つのファイルにまとめます。インポート前に現在の設定を {backup} に保存するので、そのファイルをインポートすれば元に戻せます。"
})
addCatalogEntries("ko", {
  "settingsTransfer": "내보내기 및 가져오기",
  "settingsTransferFile": "파일",
  "settingsExport": "내보내기",
  "settingsImport": "가져오기",
  "settingsImportConfirm": "정말 가져올까요?",
  "settingsExported": "{path}(으)로 내보냈습니다.",
  "settingsExportFailed": "{path}에 쓸 수 없습니다.",
  "settingsBackupFailed": "현재 설정을 {path}에 저장할 수 없어 아무것도 가져오지 않았습니다.",
  "settingsImportMissing": "{path}을(를) 읽을 수 없습니다.",
  "settingsImportInvalid": "{path}은(는) More Weather 설정 파일이 아닙니다.",
  "settingsImported": "{path}에서 가져왔습니다. 이전 설정은 {backup}에 있습니다.",
  "settingsTransferHint": "일반 설정, 메뉴 막대·위젯·앱 표시와 저장한 장소를 한 파일에 담습니다. 가져오기 전에 현재 설정을 {backup}에 저장하므로 그 파일을 가져오면 되돌릴 수 있습니다."
})
addCatalogEntries("ar", {
  "settingsTransfer": "التصدير والاستيراد",
  "settingsTransferFile": "الملف",
  "settingsExport": "تصدير",
  "settingsImport": "استيراد",
  "settingsImportConfirm": "هل تريد الاستيراد فعلًا؟",
  "settingsExported": "تم التصدير إلى {path}.",
  "settingsExportFailed": "تعذّرت كتابة {path}.",
  "settingsBackupFailed": "تعذّر حفظ الإعدادات الحالية في {path}؛ لم يُستورد شيء.",
  "settingsImportMissing": "تعذّرت قراءة {path}.",
  "settingsImportInvalid": "{path} ليس ملف إعدادات لـ More Weather.",
  "settingsImported": "تم الاستيراد من {path}. الإعدادات السابقة موجودة في {backup}.",
  "settingsTransferHint": "الإعدادات العامة وعرض شريط القوائم والأداة والتطبيق وأماكنك في ملف واحد. قبل الاستيراد تُحفظ الإعدادات الحالية في {backup}؛ واستيراد ذلك الملف يتراجع عنه."
})
addCatalogEntries("he", {
  "settingsTransfer": "ייצוא וייבוא",
  "settingsTransferFile": "קובץ",
  "settingsExport": "ייצוא",
  "settingsImport": "ייבוא",
  "settingsImportConfirm": "לייבא באמת?",
  "settingsExported": "יוצא אל {path}.",
  "settingsExportFailed": "לא ניתן לכתוב את {path}.",
  "settingsBackupFailed": "לא ניתן היה לשמור את ההגדרות הנוכחיות ב־{path}; שום דבר לא יובא.",
  "settingsImportMissing": "לא ניתן לקרוא את {path}.",
  "settingsImportInvalid": "{path} אינו קובץ הגדרות של More Weather.",
  "settingsImported": "יובא מ־{path}. ההגדרות הקודמות נמצאות ב־{backup}.",
  "settingsTransferHint": "ההגדרות הכלליות, התצוגה בשורת התפריטים, בווידג׳ט ובאפליקציה והמקומות שלך — בקובץ אחד. לפני ייבוא ההגדרות הנוכחיות נשמרות ב־{backup}; ייבוא הקובץ הזה מבטל אותו."
})
addCatalogEntries("fa", {
  "settingsTransfer": "برون‌بری و درون‌بری",
  "settingsTransferFile": "پرونده",
  "settingsExport": "برون‌بری",
  "settingsImport": "درون‌بری",
  "settingsImportConfirm": "واقعاً درون‌بری شود؟",
  "settingsExported": "به {path} برون‌بری شد.",
  "settingsExportFailed": "نوشتن {path} ممکن نشد.",
  "settingsBackupFailed": "ذخیرهٔ تنظیمات کنونی در {path} ممکن نشد؛ چیزی درون‌بری نشد.",
  "settingsImportMissing": "خواندن {path} ممکن نشد.",
  "settingsImportInvalid": "{path} پروندهٔ تنظیمات More Weather نیست.",
  "settingsImported": "از {path} درون‌بری شد. تنظیمات پیشین در {backup} است.",
  "settingsTransferHint": "تنظیمات کلی، نمایش نوار منو، ابزارک و برنامه و مکان‌های شما در یک پرونده. پیش از درون‌بری، تنظیمات کنونی در {backup} ذخیره می‌شود؛ درون‌بری همان پرونده آن را برمی‌گرداند."
})
addCatalogEntries("hi", {
  "settingsTransfer": "निर्यात और आयात",
  "settingsTransferFile": "फ़ाइल",
  "settingsExport": "निर्यात करें",
  "settingsImport": "आयात करें",
  "settingsImportConfirm": "सच में आयात करें?",
  "settingsExported": "{path} में निर्यात किया गया।",
  "settingsExportFailed": "{path} लिखी नहीं जा सकी।",
  "settingsBackupFailed": "मौजूदा सेटिंग्स {path} में सहेजी नहीं जा सकीं; कुछ भी आयात नहीं हुआ।",
  "settingsImportMissing": "{path} पढ़ी नहीं जा सकी।",
  "settingsImportInvalid": "{path} More Weather की सेटिंग्स फ़ाइल नहीं है।",
  "settingsImported": "{path} से आयात किया गया। पिछली सेटिंग्स {backup} में हैं।",
  "settingsTransferHint": "सामान्य सेटिंग्स, मेनू बार, विजेट और ऐप का प्रदर्शन और आपके स्थान एक फ़ाइल में। आयात से पहले मौजूदा सेटिंग्स {backup} में सहेजी जाती हैं; उस फ़ाइल को आयात करने से बदलाव वापस हो जाता है।"
})
addCatalogEntries("id", {
  "settingsTransfer": "Ekspor dan impor",
  "settingsTransferFile": "Berkas",
  "settingsExport": "Ekspor",
  "settingsImport": "Impor",
  "settingsImportConfirm": "Yakin mengimpor?",
  "settingsExported": "Diekspor ke {path}.",
  "settingsExportFailed": "{path} tidak dapat ditulis.",
  "settingsBackupFailed": "Pengaturan saat ini tidak dapat disimpan ke {path}; tidak ada yang diimpor.",
  "settingsImportMissing": "{path} tidak dapat dibaca.",
  "settingsImportInvalid": "{path} bukan berkas pengaturan More Weather.",
  "settingsImported": "Diimpor dari {path}. Pengaturan sebelumnya ada di {backup}.",
  "settingsTransferHint": "Pengaturan umum, tampilan bilah menu, widget dan aplikasi, serta tempat Anda dalam satu berkas. Sebelum impor, pengaturan saat ini disimpan ke {backup}; mengimpor berkas itu membatalkannya."
})
addCatalogEntries("vi", {
  "settingsTransfer": "Xuất và nhập",
  "settingsTransferFile": "Tệp",
  "settingsExport": "Xuất",
  "settingsImport": "Nhập",
  "settingsImportConfirm": "Thật sự nhập?",
  "settingsExported": "Đã xuất ra {path}.",
  "settingsExportFailed": "Không thể ghi {path}.",
  "settingsBackupFailed": "Không thể lưu cài đặt hiện tại vào {path}; không có gì được nhập.",
  "settingsImportMissing": "Không thể đọc {path}.",
  "settingsImportInvalid": "{path} không phải là tệp cài đặt của More Weather.",
  "settingsImported": "Đã nhập từ {path}. Cài đặt trước đó nằm trong {backup}.",
  "settingsTransferHint": "Cài đặt chung, hiển thị trên thanh menu, widget và ứng dụng cùng các địa điểm của bạn trong một tệp. Trước khi nhập, cài đặt hiện tại được lưu vào {backup}; nhập tệp đó sẽ hoàn tác."
})
addCatalogEntries("th", {
  "settingsTransfer": "ส่งออกและนำเข้า",
  "settingsTransferFile": "ไฟล์",
  "settingsExport": "ส่งออก",
  "settingsImport": "นำเข้า",
  "settingsImportConfirm": "นำเข้าจริงหรือ?",
  "settingsExported": "ส่งออกไปยัง {path} แล้ว",
  "settingsExportFailed": "เขียน {path} ไม่ได้",
  "settingsBackupFailed": "บันทึกการตั้งค่าปัจจุบันไปยัง {path} ไม่ได้ จึงไม่ได้นำเข้าอะไร",
  "settingsImportMissing": "อ่าน {path} ไม่ได้",
  "settingsImportInvalid": "{path} ไม่ใช่ไฟล์การตั้งค่าของ More Weather",
  "settingsImported": "นำเข้าจาก {path} แล้ว การตั้งค่าเดิมอยู่ใน {backup}",
  "settingsTransferHint": "การตั้งค่าทั่วไป การแสดงผลในแถบเมนู วิดเจ็ต และแอป รวมถึงสถานที่ของคุณในไฟล์เดียว ก่อนนำเข้าจะบันทึกการตั้งค่าปัจจุบันไว้ที่ {backup} การนำเข้าไฟล์นั้นจะย้อนกลับได้"
})
addCatalogEntries("zh_CN", {
  "settingsTransfer": "导出和导入",
  "settingsTransferFile": "文件",
  "settingsExport": "导出",
  "settingsImport": "导入",
  "settingsImportConfirm": "确定要导入吗？",
  "settingsExported": "已导出到 {path}。",
  "settingsExportFailed": "无法写入 {path}。",
  "settingsBackupFailed": "无法将当前设置保存到 {path}，未导入任何内容。",
  "settingsImportMissing": "无法读取 {path}。",
  "settingsImportInvalid": "{path} 不是 More Weather 的设置文件。",
  "settingsImported": "已从 {path} 导入。之前的设置保存在 {backup}。",
  "settingsTransferHint": "常规设置、菜单栏、小组件和应用的显示以及你的地点，保存在一个文件中。导入前会把当前设置保存到 {backup}，导入该文件即可撤销。"
})
addCatalogEntries("zh_TW", {
  "settingsTransfer": "匯出與匯入",
  "settingsTransferFile": "檔案",
  "settingsExport": "匯出",
  "settingsImport": "匯入",
  "settingsImportConfirm": "確定要匯入嗎？",
  "settingsExported": "已匯出至 {path}。",
  "settingsExportFailed": "無法寫入 {path}。",
  "settingsBackupFailed": "無法將目前設定儲存至 {path}，未匯入任何內容。",
  "settingsImportMissing": "無法讀取 {path}。",
  "settingsImportInvalid": "{path} 不是 More Weather 的設定檔。",
  "settingsImported": "已從 {path} 匯入。先前的設定存於 {backup}。",
  "settingsTransferHint": "一般設定、選單列、小工具與應用程式的顯示以及你的地點，存在一個檔案中。匯入前會把目前設定儲存至 {backup}，匯入該檔案即可復原。"
})
// Each language in its own name, for the language picker.
var languageNames = {
  "en": "English",
  "de": "Deutsch",
  "es": "Español",
  "fr": "Français",
  "pt": "Português",
  "ru": "Русский",
  "uk": "Українська",
  "pl": "Polski",
  "it": "Italiano",
  "nl": "Nederlands",
  "tr": "Türkçe",
  "cs": "Čeština",
  "sv": "Svenska",
  "fi": "Suomi",
  "nb": "Norsk bokmål",
  "da": "Dansk",
  "ro": "Română",
  "hu": "Magyar",
  "el": "Ελληνικά",
  "zh_CN": "简体中文",
  "zh_TW": "繁體中文",
  "ja": "日本語",
  "ko": "한국어",
  "ar": "العربية",
  "he": "עברית",
  "fa": "فارسی",
  "hi": "हिन्दी",
  "id": "Bahasa Indonesia",
  "vi": "Tiếng Việt",
  "th": "ไทย"
}

function languageName(language) {
  return languageNames[language] || language
}

// "auto" or a supported language code; anything else resolves to "auto".
function resolvedLanguage(choice, localeName) {
  var chosen = String(choice || "auto")
  return chosen !== "auto" && languageMeta[chosen] ? chosen : languageForLocale(localeName)
}

function languageForLocale(localeName) {
  var normalized = String(localeName || "").toLowerCase().replace(/-/g, "_")
  var base = normalized.split(/[_.@]/)[0]
  if (base === "zh") {
    if (normalized.indexOf("tw") >= 0 || normalized.indexOf("hk") >= 0
        || normalized.indexOf("mo") >= 0 || normalized.indexOf("hant") >= 0) return "zh_TW"
    return "zh_CN"
  }
  // Accept legacy libc/Java aliases as well as Norwegian locale variants.
  if (base === "iw") base = "he"
  if (base === "in") base = "id"
  if (base === "no" || base === "nn") base = "nb"
  return catalog[base] ? base : "en"
}

function localeName(language) {
  var meta = languageMeta[language] || languageMeta.en
  return meta.locale
}

// External services generally accept the ISO 639 base language, while the UI
// keeps region-aware catalogue IDs for Chinese.
function serviceLanguage(language) {
  return String(language || "en").split("_")[0]
}

function isRightToLeft(language) {
  return !!(languageMeta[language] && languageMeta[language].rtl)
}

function supportedLanguages() {
  return Object.keys(languageMeta)
}

function text(language, key, values) {
  var languageCatalog = catalog[language] || catalog.en
  var value = languageCatalog[key]
  if (value === undefined) value = catalog.en[key]
  if (value === undefined) return key

  var replacements = values || {}
  return String(value).replace(/\{([^}]+)\}/g, function(match, name) {
    return replacements[name] === undefined ? match : String(replacements[name])
  })
}

function directionNames(language) {
  var meta = languageMeta[language] || languageMeta.en
  return meta.directions
}
