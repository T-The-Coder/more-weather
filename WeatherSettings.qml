import QtQuick
import qs.Commons
import qs.Ui
import "I18n.js" as I18n
import "Model.js" as Model
import "SettingsSearch.js" as SettingsSearch

// Per-surface display settings (menu bar, app, widget). Created on demand
// while settings are open.
Rectangle {
  id: settingsView
  required property var panel
  anchors.fill: parent
  z: 100
  color: Color.popups.background

  MouseArea { anchors.fill: parent }

  // Menu bar entries have two switch columns, "Always" and "Hover"; both
  // columns take the width of the longer heading.
  TextMetrics {
    id: alwaysHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showAlways")
  }
  TextMetrics {
    id: onHoverHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showOnHover")
  }
  TextMetrics {
    id: relevantHeadingMetrics
    font.family: panel.fontFamily
    font.pixelSize: Style.font.caption
    text: panel.i18n("showWhenRelevant")
  }
  readonly property real switchColumnWidth: Math.max(Style.space(40),
    alwaysHeadingMetrics.advanceWidth + Style.space(6),
    relevantHeadingMetrics.advanceWidth + Style.space(6),
    onHoverHeadingMetrics.advanceWidth + Style.space(6))

  // Menu bar: cards in the order the entries appear in the bar; the first
  // card's switch shows or hides the whole bar entry. Widget and app: the
  // sections in their order. The keyboard walks the same list.
  readonly property var displayCards: panel.settingsOrderedCards(panel.settingsTargetSurface === "menubar" ? [
    // One list, in the order the bar draws it: the entries come from
    // different corners of the forecast, but they share one row.
    {
      title: panel.i18n("menubar"),
      masterKey: "showCurrent",
      options: [
        { key: "currentWeatherSymbol", title: panel.i18n("weatherSymbol"), hover: true },
        { key: "currentLocation", title: panel.i18n("location"), hover: true },
        { key: "currentTemperature", title: panel.i18n("temperature"), hover: true },
        { key: "currentFeelsLike", title: panel.i18n("feelsLikeTemperature"), hover: true, relevant: true },
        { key: "currentWind", title: panel.i18n("wind"), hover: true, relevant: true },
        { key: "currentHumidity", title: panel.i18n("humidity"), hover: true },
        { key: "currentPressure", title: panel.i18n("pressure"), hover: true, relevant: true },
        { key: "currentUv", title: panel.i18n("uvIndex"), hover: true, relevant: true },
        { key: "currentDayRange", title: panel.i18n("temperatureRange"), hover: true },
        { key: "currentPrecipitation", title: panel.i18n("rainProbability"), hover: true, relevant: true },
        { key: "currentRainIntensity", title: panel.i18n("rainIntensity"), hover: true, relevant: true },
        { key: "currentRainAmount", title: panel.i18n("rainAmount"), hover: true, relevant: true },
        { key: "currentRainStart", title: panel.i18n("rainStartTime"), hover: true, relevant: true },
        { key: "currentSunrise", title: panel.i18n("sunrise"), hover: true, relevant: true },
        { key: "currentSunset", title: panel.i18n("sunset"), hover: true, relevant: true },
        { key: "currentSunNext", title: panel.i18n("sunNext"), hover: true, relevant: true },
        { key: "currentMoon", title: panel.i18n("moonPhase"), hover: true, relevant: true },
        { key: "currentAirQuality", title: panel.i18n("airQualityIndex"), hover: true, relevant: true },
        { key: "currentAirQualityColor", title: panel.i18n("airQualityColor"), hover: true, relevant: true },
        { key: "currentPollen", title: panel.i18n("pollen"), hover: true, relevant: true },
        { key: "currentWarnings", title: panel.i18n("weatherWarnings"), hover: true }
      ],
      hint: panel.i18n("menubarRelevantCurrentHint") + " " + panel.i18n("menubarRelevantRainHint")
        + " " + panel.i18n("menubarRelevantAirHint") + " " + panel.i18n("menubarRelevantPressureHint"),
      hasDefaultTab: false
    },
    {
      title: panel.i18n("barBehavior"),
      masterKey: "",
      options: [
        { key: "boldOnHover", title: panel.i18n("boldOnHover"), accentsBelow: true },
        { key: "hoverTooltip", title: panel.i18n("hoverTooltip") },
        { key: "openWidgetOnHover", title: panel.i18n("openWidgetOnHover") }
      ],
      hint: panel.i18n("hoverTooltipHint") + " " + panel.i18n("openWidgetOnHoverHint"),
      hasHoverUnit: true,
      hasDefaultTab: false
    }

  ] : [
    // Same order as the sections in the view. The current weather can
    // move but not be hidden or become a tab (it holds place, refresh
    // and settings), so its card has no master switch.
    {
      title: panel.i18n("currentWeather"),
      masterKey: "",
      sectionKey: "current",
      fixedSection: true,
      hint: panel.i18n("currentWeatherHint"),
      options: [
        { key: "heroSymbol", title: panel.i18n("weatherSymbol") },
        { key: "heroTemperature", title: panel.i18n("temperature") },
        { key: "heroFeelsLike", title: panel.i18n("feelsLikeTemperature") },
        { key: "heroWind", title: panel.i18n("wind") },
        { key: "heroHumidity", title: panel.i18n("humidity") },
        { key: "heroPressure", title: panel.i18n("pressure") },
        { key: "heroMoon", title: panel.i18n("moonPhase") },
        { key: "heroYesterday", title: panel.i18n("compareYesterday") },
        { key: "heroMoonNext", title: panel.i18n("nextFullNewMoon") },
        { key: "heroServiceLink", title: panel.i18n("serviceLinkButton") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.i18n("myPlaces"),
      masterKey: "showFavorites",
      sectionKey: "favorites",
      hint: panel.i18n("favoritesHint"),
      options: [
        { key: "favoritesSymbol", title: panel.i18n("weatherSymbol") },
        { key: "favoritesTemperature", title: panel.i18n("temperature") },
        { key: "favoritesFeelsLike", title: panel.i18n("feelsLikeTemperature") },
        { key: "favoritesWind", title: panel.i18n("wind") },
        { key: "favoritesHumidity", title: panel.i18n("humidity") },
        { key: "favoritesMoon", title: panel.i18n("moonPhase") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.i18n("airQualityPollen"),
      masterKey: "showAirQuality",
      sectionKey: "airQuality",
      options: [
        { key: "airQualityIndex", title: panel.i18n("airQualityIndex") },
        { key: "airQualityPollen", title: panel.i18n("pollen") }
      ],
      hint: panel.i18n("airQualityHint"),
      hasDefaultTab: false
    },
    {
      title: panel.i18n("hourly"),
      masterKey: "showHourly",
      sectionKey: "hourly",
      options: [
        { key: "hourlyTime", title: panel.i18n("time") },
        { key: "hourlyIcon", title: panel.i18n("weatherSymbol") },
        { key: "hourlyTemperature", title: panel.i18n("temperature") },
        { key: "hourlyTemperatureCurve", title: panel.i18n("temperatureCurve") },
        { key: "hourlyRainProbability", title: panel.i18n("rainProbability") },
        { key: "hourlyRainAmount", title: panel.i18n("rainAmount") },
        { key: "hourlyUv", title: panel.i18n("uvIndex") },
        { key: "hourlyPressure", title: panel.i18n("pressure") },
        { key: "hourlyWind", title: panel.i18n("wind") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.i18n("daily"),
      masterKey: "showDaily",
      sectionKey: "daily",
      options: [
        { key: "dailyDayName", title: panel.i18n("weekday") },
        { key: "dailyIcon", title: panel.i18n("weatherSymbol") },
        { key: "dailyTemperature", title: panel.i18n("temperatureRange") },
        { key: "dailyTemperatureBar", title: panel.i18n("temperatureBar") },
        { key: "dailyTemperatureCurve", title: panel.i18n("temperatureCurve") },
        { key: "dailyRainProbability", title: panel.i18n("rainProbability") },
        { key: "dailyRainAmount", title: panel.i18n("rainAmount") },
        { key: "dailyUv", title: panel.i18n("uvIndex") },
        { key: "dailyPressure", title: panel.i18n("pressure") },
        { key: "dailyWind", title: panel.i18n("wind") },
        { key: "dailySunEvents", title: panel.i18n("sunriseSunset") },
        { key: "dailySunNext", title: panel.i18n("sunNext") },
        { key: "dailyMoon", title: panel.i18n("moonPhase") },
        { key: "dailyDayLength", title: panel.i18n("dayLength") },
        { key: "dailyDayLengthChange", title: panel.i18n("dayLengthChange") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.i18n("rain"),
      masterKey: "showRain",
      sectionKey: "rain",
      options: [
        { key: "forecastIntensity", title: panel.i18n("intensity") },
        { key: "forecastProbability", title: panel.i18n("probability") },
        { key: "forecastTotal", title: panel.i18n("twoHourTotal") }
      ],
      hasDefaultTab: false
    },
    {
      title: panel.i18n("radar"),
      masterKey: "showRadar",
      sectionKey: "radar",
      options: [
        { key: "radarRings", title: panel.i18n("radarRings") }
      ],
      hasMapStyle: true,
      hasDefaultTab: false
    },
    {
      title: panel.i18n("wind"),
      masterKey: "showWind",
      sectionKey: "wind",
      options: [],
      hint: panel.i18n("windCpuHint"),
      hasDefaultTab: false
    },
    {
      title: panel.i18n("globe"),
      masterKey: "showGlobe",
      sectionKey: "globe",
      // In three sections (muted sub-headings): the sky, the layers, time.
      options: [
        { key: "globeStyle", choiceOnly: true, section: "sectionSky" },
        { key: "globeNight", title: panel.i18n("optionNight") },
        { key: "globeMoon", title: panel.i18n("moon"), choicesBelow: ["globeMoonStyle"] },
        { key: "globeMarkers", title: panel.i18n("globeMarkers") },
        { key: "globeAutoRotate", title: panel.i18n("optionGlobeAutoRotate") },
        // The colour layers in the order they are drawn, then the overlays.
        { key: "globeTemperature", title: panel.i18n("globeWashTemperature"), section: "sectionLayers" },
        { key: "globeSst", title: panel.i18n("globeWashSst") },
        { key: "globeCloud", title: panel.i18n("globeWashCloud") },
        { key: "globePrecipitation", title: panel.i18n("globeWashPrecipitation") },
        { key: "globeWind", title: panel.i18n("globeWashWind"), choicesBelow: ["globeWindMode", "globeWindLevel"] },
        { key: "globeIsobars", title: panel.i18n("globeIsobars") },
        { key: "globeStorms", title: panel.i18n("globeStorms") },
        { key: "globeNumbers", title: panel.i18n("globeNumbers") },
        { key: "globeTimeline", title: panel.i18n("globeTimeline"), section: "sectionTime" }
      ],
      hint: panel.i18n("chipsHint") + " " + panel.i18n("globeSoloHint") + " " + panel.i18n("globeHint") + " " + panel.i18n("globeZoomHint") + " "
        + panel.i18n("optionNightHint") + " " + panel.i18n("optionGlobeAutoRotateHint") + " " + panel.i18n("motionHint") + " "
        + panel.i18n("globeMapHint") + " " + panel.i18n("globeCombineHint") + " " + panel.i18n("globeLayersHint") + " "
        + panel.i18n("globeTimelineHint") + " " + panel.i18n("globeWashHint"),
      hasDefaultTab: false
    },
    // The tab strip: moved like a section (its place in the window), with
    // the tabbed sections' cards indented under it and which tab opens first.
    {
      title: panel.i18n("tabs"),
      masterKey: "",
      sectionKey: "tabs",
      fixedSection: true,
      options: [],
      hint: panel.i18n("tabsHint"),
      hasDefaultTab: true
    }
  ])

  // ---- Keyboard. One flat list of what can be set on the display page, in
  //      the order it is drawn; ↑↓ walk it, ←→ change the value or the
  //      column, Space / Enter switch or open, ⇧↑↓ move an entry.
  property string focusId: ""
  property int focusColumn: 0
  onFocusIdChanged: focusColumn = 0

  readonly property var unitOptions: [
    { value: "auto", label: panel.i18n("autoUnits") + " (" + panel.i18n(panel.useImperial ? "imperialUnits" : "metricUnits") + ")" },
    { value: "metric", label: panel.i18n("metricUnits") + " · " + panel.i18n("metricUnitsSummary") },
    { value: "imperial", label: panel.i18n("imperialUnits") + " · " + panel.i18n("imperialUnitsSummary") },
    { value: "kelvin", label: panel.i18n("kelvinUnits") + " · " + panel.i18n("kelvinUnitsSummary") }
  ]
  readonly property var languageOptions: [{ value: "auto", label: panel.i18n("languageAuto",
      { language: I18n.languageName(I18n.languageForLocale(panel.localeName)) }) }]
    .concat(I18n.supportedLanguages().map(function(code) {
      return { value: code, label: I18n.languageName(code) }
    }))
  readonly property var barPositionOptions: [
    { value: "left", label: panel.i18n(panel.barPlacement.verticalBar ? "barPositionTop" : "barPositionLeft") },
    { value: "center", label: panel.i18n("barPositionCenter") },
    { value: "right", label: panel.i18n(panel.barPlacement.verticalBar ? "barPositionBottom" : "barPositionRight") }
  ]
  readonly property var hoverUnitOptions: [
    { value: "", label: panel.i18n("hoverUnitSystemOff") },
    { value: "metric", label: panel.i18n("metricUnits") + " · " + panel.i18n("metricUnitsSummary") },
    { value: "imperial", label: panel.i18n("imperialUnits") + " · " + panel.i18n("imperialUnitsSummary") },
    { value: "kelvin", label: panel.i18n("kelvinUnits") + " · " + panel.i18n("kelvinUnitsSummary") }
  ]
  readonly property var windUnitOptions: [
    { value: "auto", label: panel.i18n("windUnitAuto", { unit: Model.windValue(0, Model.windUnitFor("auto", panel.useImperial)).unit }) },
    { value: "kmh", label: "km/h" },
    { value: "ms", label: "m/s" },
    { value: "mph", label: "mph" },
    { value: "kn", label: panel.i18n("windUnitKnots") + " (kn)" },
    { value: "bft", label: panel.i18n("windUnitBeaufort") + " (Bft)" }
  ]
  readonly property var refreshOptions: [
    { value: "0", label: panel.i18n("refreshDefault", { minutes: panel.setting("refreshMinutes", 15) }) }
  ].concat(panel.displayOptionsStore.refreshChoices.map(function(minutes) {
    return { value: String(minutes), label: panel.i18n("refreshEvery", { minutes: minutes }) }
  }))
  readonly property var radarRefreshOptions: [
    { value: "0", label: panel.i18n("radarRefreshAuto") }
  ].concat(panel.displayOptionsStore.radarChoices.map(function(minutes) {
    return { value: String(minutes), label: panel.i18n("refreshEvery", { minutes: minutes }) }
  }))
  readonly property var rainThresholdOptions: [
    { value: "any", label: panel.i18n("rainAlertAny") },
    { value: "moderate", label: panel.i18n("rainAlertModerate", { rate: panel.precipitationText(0.5, true) }) },
    { value: "heavy", label: panel.i18n("rainAlertHeavy", { rate: panel.precipitationText(4, true) }) }
  ]
  readonly property var rainRadiusOptions: panel.displayOptionsStore.generalChoices.rainAlertRadius.values.map(function(km) {
    var minutes = Math.round(Number(km) / 50 * 60)
    var distance = panel.useImperial ? Math.round(Number(km) * 0.621371) + " mi" : km + " km"
    var lead = minutes < 60 ? minutes + " min" : panel.localizedNumber(minutes / 60) + " h"
    return { value: km, label: panel.i18n("rainAlertRadiusOption", { distance: distance, lead: lead }) }
  })
  readonly property var mapStyleOptions: [
    { value: "drawn", label: panel.i18n("mapStyleDrawn") },
    { value: "satellite", label: panel.i18n("mapStyleSatellite") }
  ]
  property var mapStyleDropdown: null
  // The globe's turning by itself: after how many seconds, one turn in how
  // many minutes (as in More Time).
  readonly property var motionDelayOptions: ["5", "10", "30"].map(function(n) {
    return { value: n, label: panel.i18n("secondsShort", { seconds: n }) }
  })
  readonly property var motionSpeedOptions: ["1", "2", "4", "8"].map(function(n) {
    return { value: n, label: panel.i18n("minutesShort", { minutes: n }) }
  })
  readonly property var motionFpsOptions: ["8", "15", "24", "30"].map(function(n) {
    return { value: n, label: n }
  })
  // The wind's heights (the Globe card's wind row).
  readonly property var globeWindLevelOptions: Model.WIND_LEVELS.map(function(level) {
    return { value: level.id, label: panel.windLevelText(level) }
  })

  // ---- General choices as rows: a label and a dropdown storing a general
  //      option (Motion on the General page; the rain notification's
  //      threshold and radius on the Notifications page). Each row's
  //      dropdown is kept by its id for the keyboard (dropdownSpec).
  property var generalDropdowns: ({})
  readonly property var generalChoiceSpecs: ({
    motionDelay: { title: "motionDelay", fallback: "10", options: motionDelayOptions },
    motionSpeed: { title: "motionSpeed", fallback: "4", options: motionSpeedOptions },
    motionFps: { title: "motionFps", fallback: "15", options: motionFpsOptions },
    rainThreshold: { key: "rainAlertThreshold", title: "rainAlertThreshold", fallback: "any", options: rainThresholdOptions },
    rainRadius: { key: "rainAlertRadius", title: "rainAlertRadius", fallback: "25", options: rainRadiusOptions }
  })
  Component {
    id: generalChoiceRow

    // Label above, dropdown below: as the language and the units.
    Column {
      id: generalRow
      property string choiceId: ""
      readonly property var choiceSpec: settingsView.generalChoiceSpecs[choiceId] || ({ title: "", fallback: "", options: [] })
      readonly property string settingKey: choiceSpec.key || choiceId
      width: parent ? parent.width : 0
      spacing: Style.space(8)

      Text {
        textFormat: Text.PlainText
        width: parent.width
        text: generalRow.choiceSpec.title ? panel.i18n(generalRow.choiceSpec.title) : ""
        color: panel.foreground
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        elide: Text.ElideRight
      }

      Dropdown {
        id: generalDropdown
        width: Math.min(parent.width, Style.space(280))
        showLabel: false
        fontFamily: panel.fontFamily
        hasCursor: settingsView.focusId === generalRow.choiceId
        onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
        onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
        value: String(panel.generalSetting(generalRow.settingKey, generalRow.choiceSpec.fallback))
        options: generalRow.choiceSpec.options
        onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting(generalRow.settingKey, value) }
      }
      function register() {
        var items = Object.assign({}, settingsView.generalDropdowns)
        items[choiceId] = generalDropdown
        settingsView.generalDropdowns = items
      }
      onChoiceIdChanged: register()
      onVisibleChanged: if (visible && choiceId !== "") register()
    }
  }
  // Choices below a switch or on their own (globeMoonStyle, globeStyle):
  // their options, setting key and default.
  readonly property var choiceSpecs: ({
    globeMoonStyle: { title: "optionMoonStyle", fallback: "space", options: [
      { value: "space", label: panel.i18n("moonStyleSpace") }, { value: "earth", label: panel.i18n("moonStyleEarth") }] },
    globeWindMode: { title: "globeWindMode", fallback: "lines", options: [
      { value: "lines", label: panel.i18n("globeWindLines") }, { value: "colour", label: panel.i18n("globeWindColour") },
      { value: "both", label: panel.i18n("globeWindBoth") }] },
    globeWindLevel: { title: "globeWindHeight", fallback: "10m", options: globeWindLevelOptions },
    globeStyle: { title: "optionMapStyle", fallback: "globe", options: [
      { value: "globe", label: panel.i18n("mapStyleGlobe") }, { value: "map", label: panel.i18n("mapStyleFlat") }] }
  })
  property var choiceDropdowns: ({})
  Component {
    id: choiceRow

    Item {
      id: choiceItem
      property string choiceId: ""
      readonly property var choiceSpec: settingsView.choiceSpecs[choiceId] || ({ title: "", fallback: "", options: [] })
      width: parent ? parent.width : 0
      height: Style.space(40)

      Text {
        textFormat: Text.PlainText
        anchors.left: parent.left
        anchors.leftMargin: Style.space(12)
        anchors.right: choiceDropdown.left
        anchors.rightMargin: Style.space(8)
        anchors.verticalCenter: parent.verticalCenter
        text: choiceItem.choiceSpec.title ? panel.i18n(choiceItem.choiceSpec.title) : ""
        color: panel.foreground
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        elide: Text.ElideRight
      }

      Dropdown {
        id: choiceDropdown
        anchors.right: parent.right
        anchors.verticalCenter: parent.verticalCenter
        width: Style.space(220)
        showLabel: false
        fontFamily: panel.fontFamily
        hasCursor: settingsView.focusId === choiceItem.choiceId
        onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
        onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
        value: String(panel.settingsDisplaySetting(choiceItem.choiceId, choiceItem.choiceSpec.fallback))
        options: choiceItem.choiceSpec.options
        onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting(choiceItem.choiceId, value) }
      }
      // Kept for the keyboard; a row shown again (its page after a
      // search, which drew its own) takes its place back.
      function register() {
        var items = Object.assign({}, settingsView.choiceDropdowns)
        items[choiceId] = choiceDropdown
        settingsView.choiceDropdowns = items
      }
      onChoiceIdChanged: register()
      onVisibleChanged: if (visible && choiceId !== "") register()
    }
  }

  readonly property bool barPositionUsable: panel.barPlacement.section !== "" && !panel.barPlacement.busy
  // Set by the hover-unit dropdown, which sits inside a card delegate.
  property var hoverUnitDropdown: null
  // "Colour the values" in the menu bar, below "Bold while hovered".
  readonly property var barAccentsOptions: [
    { value: "off", label: panel.i18n("menubarAccents_off") },
    { value: "hover", label: panel.i18n("menubarAccents_hover") },
    { value: "always", label: panel.i18n("menubarAccents_always") }
  ]
  property var barAccentsDropdown: null

  // A heading inside the General card. Inline components do not see the
  // file's ids, so the panel comes in.
  component GeneralHeading: Text {
    textFormat: Text.PlainText
    property var panel: null
    property string textKey: ""
    text: panel ? panel.upperLabel(panel.i18n(textKey)) : ""
    color: panel ? panel.foreground : "transparent"
    font.family: panel ? panel.fontFamily : ""
    font.pixelSize: Style.font.bodySmall
    font.bold: true
    font.letterSpacing: 1
  }

  Component {
    id: barAccentsRow

    Column {
      readonly property alias dropdown: barAccentsDropdownItem

      Item {
        width: parent.width
        height: Style.space(40)

        Text {
          textFormat: Text.PlainText
          anchors.left: parent.left
          anchors.leftMargin: Style.space(12)
          anchors.right: barAccentsDropdownItem.left
          anchors.rightMargin: Style.space(8)
          anchors.verticalCenter: parent.verticalCenter
          text: panel.i18n("menubarAccents")
          color: panel.foreground
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
          elide: Text.ElideRight
        }

        Dropdown {
          id: barAccentsDropdownItem
          anchors.right: parent.right
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(150)
          showLabel: false
          fontFamily: panel.fontFamily
          hasCursor: settingsView.focusId === "barAccents"
          onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
          onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
          value: String(panel.settingsDisplaySetting("menubarAccents", "hover"))
          options: settingsView.barAccentsOptions
          onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("menubarAccents", value) }
        }
      }

      Text {
        textFormat: Text.PlainText
        x: Style.space(12)
        width: parent.width - Style.space(24)
        bottomPadding: Style.space(6)
        text: panel.i18n("menubarAccentsHint")
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }
    }
  }

  function cardRowsEnabled(card) {
    var enabled = card.masterKey === "" || panel.settingsDisplaySetting(card.masterKey, true)
    return enabled && (!card.dependsOn || panel.settingsDisplaySetting(card.dependsOn, true))
  }

  // ---- Search across every page (SettingsSearch.matches): an index built
  //      from the same tables that draw the cards and pages; each entry
  //      found by its text in the interface language and in English.
  property string searchQuery: ""
  readonly property bool searching: searchQuery.trim() !== ""
  readonly property var reverseCatalog: {
    var catalog = I18n.catalog[panel.interfaceLanguage] || {}
    var map = {}
    // By lower case, so the cards' upper-case titles are found too.
    for (var key in catalog) if (typeof catalog[key] === "string") map[catalog[key].toLowerCase()] = key
    return map
  }
  function englishOf(text) {
    var key = reverseCatalog[String(text).toLowerCase()]
    return key ? I18n.text("en", key) : ""
  }
  function entry(page, card, section, title, kind, extra) {
    var result = { page: page, card: card, section: section, title: title, kind: kind,
      texts: [title, englishOf(title), card, englishOf(card), section, englishOf(section)] }
    for (var k in extra) result[k] = extra[k]
    return result
  }
  readonly property var searchEntries: {
    var list = []
    var t = function(key) { return panel.i18n(key) }
    var general = t("settingsPageGeneral")
    var g = function(sectionKey, titleKey, kind, extra) {
      list.push(entry(general, t(sectionKey), "", t(titleKey), kind, extra))
    }
    g("generalSectionLanguage", "language", "jump", { focusId: "language", target: "general" })
    g("generalSectionLanguage", "unitSystem", "jump", { focusId: "unit", target: "general" })
    g("generalSectionLanguage", "windUnit", "jump", { focusId: "windUnit", target: "general" })
    g("generalSectionUpdates", "refreshForecast", "jump", { focusId: "refresh", target: "general" })
    g("generalSectionUpdates", "refreshRadar", "jump", { focusId: "radarRefresh", target: "general" })
    g("generalSectionLook", "colorAccents", "generalSwitch", { key: "colorAccents" })
    g("motionSection", "motionDelay", "generalChoice", { choiceId: "motionDelay" })
    g("motionSection", "motionSpeed", "generalChoice", { choiceId: "motionSpeed" })
    g("motionSection", "motionFps", "generalChoice", { choiceId: "motionFps" })
    g("generalSectionApp", "barPosition", "jump", { focusId: "barPosition", target: "general" })
    g("generalSectionApp", "appLauncherEntry", "jump", { focusId: "launcher", target: "general" })
    g("generalSectionApp", "showHints", "generalSwitch", { key: "showHints" })
    g("generalSectionBackup", "settingsExport", "jump", { focusId: "exportSettings", target: "general" })
    g("generalSectionBackup", "settingsImport", "jump", { focusId: "importSettings", target: "general" })
    g("generalSectionBackup", "importCitiesFromTime", "jump", { focusId: "importCities", target: "general" })
    var notificationsPage = t("settingsPageNotifications")
    list.push(entry(notificationsPage, t("notifications"), "", t("notifySevereWarnings"), "generalSwitch", { key: "notifySevereWarnings" }))
    list.push(entry(notificationsPage, t("notifications"), "", t("notifyRainSoon"), "generalSwitch", { key: "notifyRainSoon" }))
    list.push(entry(notificationsPage, t("notifications"), "", t("rainAlertThreshold"), "generalChoice", { choiceId: "rainThreshold" }))
    list.push(entry(notificationsPage, t("notifications"), "", t("rainAlertRadius"), "generalChoice", { choiceId: "rainRadius" }))
    // Display: the cards of the view picked (menu bar, widget or app).
    var surfaceName = t(panel.settingsTargetSurface === "menubar" ? "menubar"
      : (panel.settingsTargetSurface === "widget" ? "widget" : "app"))
    var display = t("settingsPageDisplay")
    for (var c = 0; c < displayCards.length; c++) {
      var card = displayCards[c]
      var cardTitle = String(card.title || "")
      var section = ""
      if (card.masterKey !== "") list.push(entry(display, cardTitle, "", cardTitle, "displaySwitch", { key: card.masterKey, surface: surfaceName }))
      var options = card.options || []
      for (var o = 0; o < options.length; o++) {
        var option = options[o]
        if (option.section) section = t(option.section)
        if (option.choiceOnly) {
          var spec = choiceSpecs[option.key]
          list.push(entry(display, cardTitle, section, spec ? t(spec.title) : option.key, "displayChoice",
            { choiceId: option.key, surface: surfaceName }))
          continue
        }
        list.push(entry(display, cardTitle, section, String(option.title || ""), "displaySwitch",
          { key: option.key, relevant: !!option.relevant, hover: !!option.hover, surface: surfaceName }))
        var below = option.choicesBelow || []
        for (var b = 0; b < below.length; b++) {
          var belowSpec = choiceSpecs[below[b]]
          list.push(entry(display, cardTitle, section, belowSpec ? t(belowSpec.title) : below[b], "displayChoice",
            { choiceId: below[b], surface: surfaceName }))
        }
      }
    }
    return list
  }
  readonly property var searchResults: searching ? SettingsSearch.matches(searchQuery, searchEntries) : []
  // Grouped under "Page › Card › Section".
  readonly property var searchGroups: SettingsSearch.grouped(searchResults.map(function(r) {
    var path = [r.page, r.card, r.section].filter(function(part) { return part !== "" }).join(" › ")
    return Object.assign({ heading: path + (r.surface ? " · " + r.surface : "") }, r)
  }))
  function jumpTo(row) {
    searchQuery = ""
    panel.settingsPage = row.target
    focusId = row.focusId
    panel.restoreKeyFocus()
  }

  Component {
    id: resultDisplaySwitch

    WeatherSwitchRow {
      property var row: ({})
      panel: settingsView.panel
      width: parent ? parent.width : 0
      settingKey: row.key || ""
      title: row.title || ""
      relevantKey: row.relevant ? row.key + "WhenRelevant" : ""
      hoverKey: row.hover ? row.key + "OnHover" : ""
      columnWidth: settingsView.switchColumnWidth
      kbFocused: !!row.key && settingsView.focusId === "switch:" + row.key
      kbColumn: settingsView.focusColumn
      onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
    }
  }
  Component {
    id: resultGeneralSwitch

    WeatherSwitchRow {
      property var row: ({})
      panel: settingsView.panel
      width: parent ? parent.width : 0
      title: row.title || ""
      indented: false
      switchState: !!row.key && panel.generalSetting(row.key, true) !== false
      kbFocused: !!row.key && settingsView.focusId === row.key
      onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
      onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting(row.key, value) }
    }
  }
  Component {
    id: resultJump

    Rectangle {
      id: jumpRow
      property var row: ({})
      width: parent ? parent.width : 0
      height: Style.space(36)
      radius: Style.cornerRadius
      readonly property bool kbFocused: settingsView.focusId === "jump:" + (row.focusId || "")
      onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
      color: jumpMouse.containsMouse || kbFocused ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

      Text {
        textFormat: Text.PlainText
        anchors.left: parent.left
        anchors.leftMargin: Style.space(12)
        anchors.verticalCenter: parent.verticalCenter
        text: (jumpRow.row.title || "") + "  →"
        color: panel.foreground
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
      }
      MouseArea {
        id: jumpMouse
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: settingsView.jumpTo(jumpRow.row)
      }
    }
  }

  // The keyboard's list while searching: the rows found, each as on its
  // page (a switch, a choice) or a jump to it.
  function resultFocusItem(r) {
    if (r.kind === "displaySwitch")
      return { id: "switch:" + r.key, type: "switch", key: r.key, relevantKey: r.relevant ? r.key + "WhenRelevant" : "",
        hoverKey: r.hover ? r.key + "OnHover" : "", orderListKey: "", orderEntry: "" }
    if (r.kind === "generalSwitch") return { id: r.key, type: "generalSwitch", key: r.key }
    if (r.kind === "displayChoice" || r.kind === "generalChoice") return { id: r.choiceId, type: "dropdown" }
    return { id: "jump:" + r.focusId, type: "jump", row: r }
  }
  // ↓ or Enter in the search field: to the first row found.
  function enterResults() {
    if (!searchResults.length) return
    panel.restoreKeyFocus()
    focusColumn = 0
    focusId = resultFocusItem(searchResults[0]).id
  }

  readonly property var focusItems: {
    if (searching) return searchResults.map(resultFocusItem)
    if (panel.settingsPage === "general") {
      // Language and format, updates, look, motion, app, back up and restore.
      var general = [
        { id: "language", type: "dropdown" },
        { id: "unit", type: "dropdown" },
        { id: "windUnit", type: "dropdown" },
        { id: "refresh", type: "dropdown" },
        { id: "radarRefresh", type: "dropdown" },
        { id: "colorAccents", type: "accents" },
        { id: "motionDelay", type: "dropdown" },
        { id: "motionSpeed", type: "dropdown" },
        { id: "motionFps", type: "dropdown" }
      ]
      if (barPositionUsable) general.push({ id: "barPosition", type: "dropdown" })
      general.push({ id: "launcher", type: "launcher" }, { id: "showHints", type: "generalSwitch", key: "showHints" },
        { id: "transferPath", type: "path" }, { id: "exportSettings", type: "button" },
        { id: "importSettings", type: "button" })
      if (panel.cityImport.available) general.push({ id: "importCities", type: "button" })
      if (!panel.displayOptionsStore.generalIsDefault()) general.push({ id: "restoreGeneral", type: "button" })
      return general
    }
    if (panel.settingsPage === "notifications") {
      var notifications = [{ id: "notifySevereWarnings", type: "generalSwitch", key: "notifySevereWarnings" },
        { id: "notifyRainSoon", type: "generalSwitch", key: "notifyRainSoon" }]
      if (panel.notifyRainSoon) notifications.push({ id: "rainThreshold", type: "dropdown" }, { id: "rainRadius", type: "dropdown" })
      return notifications
    }
    if (panel.settingsPage !== "display") return []
    var items = []
    var menubar = panel.settingsTargetSurface === "menubar"
    for (var c = 0; c < displayCards.length; c++) {
      var card = displayCards[c]
      if (card.masterKey !== "" || card.fixedSection) {
        items.push({
          id: "master:" + (card.sectionKey || card.masterKey), type: "switch",
          key: card.fixedSection ? "" : card.masterKey,
          orderListKey: menubar ? "" : (card.fixedSection ? "sectionOrder" : panel.sectionOrderListFor(card.sectionKey)),
          orderEntry: card.fixedSection ? card.sectionKey : panel.orderKeyForSetting(card.masterKey)
        })
      }
      if (cardRowsEnabled(card)) {
        var options = panel.settingsOrderedOptions(card.options)
        for (var o = 0; o < options.length; o++) {
          var option = options[o]
          // A choice of its own in the list (the globe's shape).
          if (option.choiceOnly) {
            items.push({ id: option.key, type: "dropdown" })
            continue
          }
          items.push({
            id: "switch:" + option.key, type: "switch", key: option.key,
            relevantKey: option.relevant ? option.key + "WhenRelevant" : "",
            hoverKey: option.hover ? option.key + "OnHover" : "",
            orderListKey: panel.orderListKeyForSetting(option.key),
            orderEntry: panel.orderKeyForSetting(option.key)
          })
          if (option.accentsBelow) items.push({ id: "barAccents", type: "dropdown" })
          if (option.choicesBelow && panel.settingsDisplaySetting(option.key, true) === true)
            for (var cb = 0; cb < option.choicesBelow.length; cb++) items.push({ id: option.choicesBelow[cb], type: "dropdown" })
        }
        if (card.hasHoverUnit) items.push({ id: "hoverUnit", type: "dropdown" })
        if (card.hasMapStyle) items.push({ id: "mapStyle", type: "dropdown" })
      }
      if (card.sectionKey && !card.fixedSection && panel.settingsDisplaySetting(card.masterKey, true))
        items.push({ id: "placement:" + card.sectionKey, type: "placement", key: card.sectionKey + "AsTab" })
      if (card.hasDefaultTab && panel.settingsTabs.length > 0) items.push({ id: "defaultTab", type: "defaultTab" })
    }
    if (!panel.settingsOrderIsDefault) items.push({ id: "restoreOrder", type: "button" })
    if (!panel.displayOptionsStore.settingsDisplayIsDefault()) items.push({ id: "restoreDefaults", type: "button" })
    if (!menubar) items.push({ id: "copyTo", type: "button" })
    return items
  }
  readonly property var focusItem: {
    for (var i = 0; i < focusItems.length; i++) if (focusItems[i].id === focusId) return focusItems[i]
    return null
  }
  // Where the cursor was in the list, so it can stay near when its item
  // goes (the reset buttons disappear once they are used).
  property int focusIndex: -1
  onFocusItemChanged: {
    if (focusItem) {
      focusIndex = focusItems.indexOf(focusItem)
    } else if (focusId !== "" && focusIndex >= 0 && focusItems.length > 0) {
      // From the event loop: setting focusId here would re-enter focusItem.
      var neighbour = focusItems[Math.min(focusIndex, focusItems.length - 1)].id
      panel.defer(function() { if (!settingsView.focusItem) settingsView.focusId = neighbour })
    }
  }

  // Columns of a menu bar row: "Always", "Relevant" (if it has a rule),
  // "Hover". Other rows have the one switch.
  function switchColumns(item) {
    var columns = []
    if (item.key !== "") columns.push(item.key)
    if (item.hoverKey !== undefined && item.hoverKey !== "") {
      columns.push(item.relevantKey || "")
      columns.push(item.hoverKey)
    }
    return columns
  }

  function moveFocus(delta) {
    if (!focusItems.length) return
    var index = -1
    for (var i = 0; i < focusItems.length; i++) if (focusItems[i].id === focusId) index = i
    var next = index < 0 ? (delta > 0 ? 0 : focusItems.length - 1)
      : Math.max(0, Math.min(focusItems.length - 1, index + delta))
    focusId = focusItems[next].id
  }

  // Each dropdown the keyboard reaches: its options, current value, how a
  // new value is stored, and the item that opens its list.
  function dropdownSpec(id) {
    var store = panel.displayOptionsStore
    function general(key, fallback, numeric) {
      return {
        value: String(panel.generalSetting(key, fallback)),
        set: function(value) { store.setGeneralSetting(key, numeric ? Number(value) : value) }
      }
    }
    function display(key, fallback) {
      return {
        value: String(panel.settingsDisplaySetting(key, fallback)),
        set: function(value) { store.setSettingsDisplaySetting(key, value) }
      }
    }
    function spec(options, item, access) {
      return { options: options, item: item, value: access.value, set: access.set }
    }
    if (id === "unit") return spec(unitOptions, unitDropdown,
      { value: panel.settingsUnitSystem, set: function(value) { store.setGeneralSetting("unitSystem", value) } })
    if (id === "language") return spec(languageOptions, languageDropdown, general("language", "auto"))
    if (id === "barPosition") return spec(barPositionOptions, barPositionDropdown,
      { value: panel.barPlacement.section, set: function(value) { panel.barPlacement.moveTo(value) } })
    if (id === "windUnit") return spec(windUnitOptions, windUnitDropdown, general("windUnit", "auto"))
    if (id === "refresh") return spec(refreshOptions, refreshDropdown, general("refreshMinutes", 0, true))
    if (id === "radarRefresh") return spec(radarRefreshOptions, radarRefreshDropdown, general("radarMinutes", 0, true))
    // The general choices drawn as rows (Motion, the rain notification).
    var choice = generalChoiceSpecs[id]
    if (choice) return spec(choice.options, generalDropdowns[id] || null, general(choice.key || id, choice.fallback))
    if (id === "mapStyle") return spec(mapStyleOptions, mapStyleDropdown, display("mapStyle", "drawn"))
    if (id === "barAccents") return spec(barAccentsOptions, barAccentsDropdown, display("menubarAccents", "hover"))
    if (choiceSpecs[id]) return spec(choiceSpecs[id].options, choiceDropdowns[id] || null, display(id, choiceSpecs[id].fallback))
    return spec(hoverUnitOptions, hoverUnitDropdown, display("hoverUnitSystem", ""))
  }

  function stepDropdown(id, delta) {
    var dropdown = dropdownSpec(id)
    var index = 0
    for (var i = 0; i < dropdown.options.length; i++) if (dropdown.options[i].value === dropdown.value) index = i
    var next = Math.max(0, Math.min(dropdown.options.length - 1, index + delta))
    if (next !== index) dropdown.set(dropdown.options[next].value)
  }

  function openDropdown(id) {
    var dropdown = dropdownSpec(id).item
    if (dropdown) dropdown.open()
  }

  function changeValue(item, delta) {
    if (item.type === "dropdown") stepDropdown(item.id, delta)
    else if (item.type === "switch") {
      var columns = switchColumns(item)
      var next = focusColumn + delta
      // Rows without a "Relevant" rule skip that column.
      if (next === 1 && columns[1] === "") next += delta
      if (next >= 0 && next < columns.length) focusColumn = next
    } else if (item.type === "placement") {
      panel.displayOptionsStore.setSettingsDisplaySetting(item.key, delta > 0)
    } else if (item.type === "defaultTab") {
      var tabs = panel.settingsTabs
      var index = Math.max(0, tabs.indexOf(panel.settingsDefaultTab))
      var target = Math.max(0, Math.min(tabs.length - 1, index + delta))
      if (target !== index) panel.displayOptionsStore.setSettingsDisplaySetting("defaultTab", tabs[target])
    }
  }

  function activate(item) {
    if (item.type === "dropdown") openDropdown(item.id)
    else if (item.type === "accents") {
      panel.displayOptionsStore.setGeneralSetting("colorAccents", !panel.colorAccents)
    } else if (item.type === "jump") {
      jumpTo(item.row)
    } else if (item.type === "generalSwitch") {
      panel.displayOptionsStore.setGeneralSetting(item.key, !(panel.generalSetting(item.key, true) !== false))
    } else if (item.type === "launcher") {
      if (!panel.appLauncherEntry.busy) panel.appLauncherEntry.setInstalled(!panel.appLauncherEntry.installed)
    } else if (item.type === "switch") {
      var key = switchColumns(item)[focusColumn] || ""
      if (key === "") return
      var fallback = key === item.key
      panel.displayOptionsStore.setSettingsDisplaySetting(key,
        !(panel.settingsDisplaySetting(key, fallback) === true))
    } else if (item.type === "placement") {
      panel.displayOptionsStore.setSettingsDisplaySetting(item.key,
        !(panel.settingsDisplaySetting(item.key, false) === true))
    } else if (item.type === "defaultTab") {
      changeValue(item, 1)
    } else if (item.type === "path") {
      transferPathField.forceActiveFocus()
    } else if (item.id === "exportSettings") {
      exportButton.press()
    } else if (item.id === "importSettings") {
      importButton.press()
    } else if (item.id === "importCities") {
      importCitiesButton.press()
    } else if (item.id === "restoreGeneral") {
      restoreGeneralButton.press()
    } else if (item.id === "restoreOrder") {
      restoreOrderButton.press()
    } else if (item.id === "restoreDefaults") {
      restoreDefaultsButton.press()
    } else if (item.id === "copyTo") {
      copyToButton.press()
    }
  }

  function reorder(item, delta) {
    if (!item || !item.orderListKey || !item.orderEntry) return
    panel.displayOptionsStore.moveSettingsDisplayEntry(item.orderListKey, item.orderEntry, delta)
  }

  // Keeps the focused setting on screen; called by each control as it
  // takes the keyboard focus.
  function ensureVisible(target) {
    if (!target) return
    panel.defer(function() {
      var top = target.mapToItem(settingsColumn, 0, 0).y - Style.space(8)
      var bottom = top + target.height + Style.space(16)
      var maximum = Math.max(0, settingsFlick.contentHeight - settingsFlick.height)
      if (top < settingsFlick.contentY) settingsFlick.contentY = Math.max(0, top)
      else if (bottom > settingsFlick.contentY + settingsFlick.height)
        settingsFlick.contentY = Math.min(maximum, bottom - settingsFlick.height)
    })
  }

  function scrollBy(delta) {
    var maximum = Math.max(0, settingsFlick.contentHeight - settingsFlick.height)
    settingsFlick.contentY = Math.max(0, Math.min(maximum, settingsFlick.contentY + delta))
  }

  // Returns true when the key was used.
  function handleKey(event) {
    var control = !!(event.modifiers & Qt.ControlModifier)
    var alternate = !!(event.modifiers & (Qt.AltModifier | Qt.MetaModifier))
    if (control || alternate) return false
    var shift = !!(event.modifiers & Qt.ShiftModifier)
    var text = String(event.text || "")
    var key = event.key

    // / searches in all the settings.
    if (text === "/") {
      searchField.forceActiveFocus()
      return true
    }
    if (key === Qt.Key_Tab || key === Qt.Key_Backtab) {
      panel.stepSettingsPage(shift || key === Qt.Key_Backtab ? -1 : 1)
      focusId = ""
      settingsFlick.contentY = 0
      return true
    }
    if (key === Qt.Key_PageDown || key === Qt.Key_PageUp) {
      scrollBy((key === Qt.Key_PageDown ? 1 : -1) * settingsFlick.height * 0.9)
      return true
    }
    if (key === Qt.Key_Home || key === Qt.Key_End) {
      scrollBy(key === Qt.Key_Home ? -settingsFlick.contentHeight : settingsFlick.contentHeight)
      return true
    }

    var down = key === Qt.Key_Down || text === "j" || text === "J"
    var up = key === Qt.Key_Up || text === "k" || text === "K"
    // Pages without settings just scroll.
    if (panel.settingsPage !== "display" && panel.settingsPage !== "general" && panel.settingsPage !== "notifications") {
      if (down || up) {
        scrollBy((down ? 1 : -1) * Style.space(48))
        return true
      }
      // What's new: Enter opens the older versions.
      if (panel.settingsPage === "changes" && changesPage.hasOlder
          && (key === Qt.Key_Return || key === Qt.Key_Enter || key === Qt.Key_Space)) {
        changesPage.pressOlder()
        return true
      }
      return false
    }

    if (panel.settingsPage === "display" && (text === "1" || text === "2" || text === "3")) {
      panel.settingsTargetSurface = ["menubar", "widget", "app"][Number(text) - 1]
      focusId = ""
      return true
    }
    if (down || up) {
      var moveEntry = shift || text === "J" || text === "K"
      if (moveEntry) reorder(focusItem, down ? 1 : -1)
      else moveFocus(down ? 1 : -1)
      return true
    }
    var left = key === Qt.Key_Left || text === "h"
    var right = key === Qt.Key_Right || text === "l"
    if (left || right) {
      if (focusItem) changeValue(focusItem, right ? 1 : -1)
      return true
    }
    if (key === Qt.Key_Space || key === Qt.Key_Return || key === Qt.Key_Enter) {
      if (focusItem) activate(focusItem)
      else moveFocus(1)
      return true
    }
    return false
  }

  Flickable {
    id: settingsFlick
    anchors.fill: parent
    anchors.margins: Style.space(4)
    z: 1
    contentWidth: width
    contentHeight: settingsColumn.implicitHeight
    clip: true
    boundsBehavior: Flickable.StopAtBounds
    interactive: contentHeight > height

    Column {
      id: settingsColumn
      width: parent.width
      spacing: Style.space(12)

      Item {
        width: parent.width
        height: Style.space(48)

        Column {
          anchors.left: parent.left
          anchors.verticalCenter: parent.verticalCenter
          spacing: Style.space(2)

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("settings")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.title
            font.bold: true
          }

          Text {
            textFormat: Text.PlainText
            text: panel.settingsPage === "shortcuts" ? panel.i18n("shortcutsSubtitle")
              : panel.settingsPage === "notifications" ? panel.i18n("notificationsSubtitle")
              : panel.settingsPage === "changes" ? panel.i18n("changesSubtitle")
              : (panel.settingsPage === "general" ? panel.i18n("generalSubtitle")
              : (panel.settingsPage === "sources" ? panel.i18n("sourcesSubtitle")
                : (panel.settingsTargetSurface === "app" ? panel.i18n("appSettings")
                  : (panel.settingsTargetSurface === "widget"
                    ? panel.i18n("widgetSettings") : panel.i18n("menubarSettings")))))
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
          }
        }

        Rectangle {
          anchors.right: parent.right
          anchors.verticalCenter: parent.verticalCenter
          width: Style.space(28)
          height: width
          radius: Style.cornerRadius
          color: closeSettingsMouse.containsMouse
            ? Style.hoverFillFor(panel.foreground, Color.accent)
            : "transparent"

          Text {
            textFormat: Text.PlainText
            anchors.centerIn: parent
            text: "✕"
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.body
          }

          MouseArea {
            id: closeSettingsMouse
            anchors.fill: parent
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            onClicked: panel.settingsOpen = false
          }
        }
      }

      // Search in all the settings (/ goes here; Esc clears, then leaves).
      TextField {
        id: searchField
        width: parent.width
        placeholderText: panel.i18n("settingsSearch")
        foreground: panel.foreground
        font.family: panel.fontFamily
        text: settingsView.searchQuery
        onTextChanged: if (text !== settingsView.searchQuery) settingsView.searchQuery = text
        onAccepted: settingsView.enterResults()
        Keys.onDownPressed: settingsView.enterResults()
        Keys.onEscapePressed: function(event) {
          if (text !== "") settingsView.searchQuery = ""
          else panel.restoreKeyFocus()
          event.accepted = true
        }
      }

      // Settings pages, styled like the rain / radar / wind tabs so they read
      // as navigation rather than as another option to choose.
      // Pages, styled like the view's tabs so they read as navigation. They
      // share the popup's width as in More Time (narrower than 96 when
      // needed, never narrower than the name); names too long for one line
      // (German, Finnish …) break into centred lines, filled greedily.
      Item {
        id: pageMeasure
        visible: false
        width: 0
        height: 0
        Repeater {
          id: pageMeasureRepeater
          model: panel.settingsPages
          Text {
            textFormat: Text.PlainText
            required property string modelData
            text: panel.upperLabel(panel.settingsPageName(modelData))
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: true
            font.letterSpacing: 1
          }
        }
      }
      readonly property var settingsPageLines: {
        var pages = panel.settingsPages
        var gap = Style.space(5)
        var avail = settingsColumn.width
        var labels = []
        for (var i = 0; i < pages.length; i++) {
          var measured = pageMeasureRepeater.count === pages.length ? pageMeasureRepeater.itemAt(i) : null
          // Read again when the language changes.
          labels.push((measured ? measured.implicitWidth : 0) + 0 * panel.interfaceLanguage.length)
        }
        function widthIn(label, count) {
          return Math.max(label + Style.space(12), Math.min(Style.space(96),
            Math.max(label + Style.space(20), (avail - gap * (count - 1)) / count)))
        }
        // A line's width with its pages at the widths they take there
        // (roomy), or at the least they need (the name and 12).
        function lineWidth(indices, roomy) {
          var total = gap * (indices.length - 1)
          for (var k = 0; k < indices.length; k++)
            total += roomy ? widthIn(labels[indices[k]], indices.length) : labels[indices[k]] + Style.space(12)
          return total
        }
        // Lines break only where even the least widths do not fit.
        var lines = []
        var line = []
        for (var p = 0; p < pages.length; p++) {
          if (line.length && lineWidth(line.concat([p]), false) > avail) {
            lines.push(line)
            line = []
          }
          line.push(p)
        }
        if (line.length) lines.push(line)
        return lines.map(function(indices) {
          var roomy = lineWidth(indices, true) <= avail
          // Tight: the least widths and the room left shared equally.
          var spare = roomy ? 0 : (avail - lineWidth(indices, false)) / indices.length
          return indices.map(function(index) {
            return { key: pages[index], width: roomy ? widthIn(labels[index], indices.length)
              : labels[index] + Style.space(12) + spare }
          })
        })
      }
      Column {
        id: settingsPageRow
        width: parent.width
        spacing: Style.space(5)

        Repeater {
          model: settingsColumn.settingsPageLines

          Row {
            required property var modelData
            anchors.horizontalCenter: parent.horizontalCenter
            spacing: Style.space(5)

            Repeater {
              model: parent.modelData

              Rectangle {
                required property var modelData
                readonly property bool selected: panel.settingsPage === modelData.key
                width: modelData.width
                height: Style.space(28)
                radius: Style.cornerRadius
                color: selected || pageMouse.containsMouse
                  ? Style.hoverFillFor(panel.foreground, Color.accent) : "transparent"

                Text {
                  textFormat: Text.PlainText
                  id: pageLabel
                  anchors.centerIn: parent
                  text: panel.upperLabel(panel.settingsPageName(parent.modelData.key))
                  color: parent.selected
                    ? Style.hoverStateColor(panel.foreground, Color.accent)
                    : panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  font.bold: parent.selected
                  font.letterSpacing: 1
                }

                MouseArea {
                  id: pageMouse
                  anchors.fill: parent
                  hoverEnabled: true
                  cursorShape: Qt.PointingHandCursor
                  onClicked: panel.settingsPage = parent.modelData.key
                }
              }
            }
          }
        }
      }

      // Where the keys act, in muted type: pages here, the rest below the
      // view picker.
      Text {
        textFormat: Text.PlainText
        width: parent.width
        horizontalAlignment: Text.AlignHCenter
        visible: panel.showHints
        text: panel.keepSeparators(panel.i18n("settingsPagesKeysHint"))
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      // What the search found, grouped by page, card and section; each row
      // works as on its page (switches and choices), the rest open their
      // page at the row.
      Column {
        visible: settingsView.searching
        width: parent.width
        spacing: Style.space(12)

        Text {
          textFormat: Text.PlainText
          visible: settingsView.searchGroups.length === 0
          text: panel.i18n("settingsSearchNone")
          color: panel.mutedText
          font.family: panel.fontFamily
          font.pixelSize: Style.font.bodySmall
        }

        Repeater {
          model: settingsView.searchGroups

          // A card per group, as on the pages (and in More Time's search).
          Rectangle {
            id: resultCard
            required property var modelData
            width: parent.width
            height: resultGroup.implicitHeight + Style.space(20)
            radius: Style.cornerRadius
            color: "transparent"
            border.color: panel.subtleText
            border.width: Style.spacing.hairline

            Column {
              id: resultGroup
              readonly property var modelData: resultCard.modelData
              anchors.left: parent.left
              anchors.right: parent.right
              anchors.top: parent.top
              anchors.margins: Style.space(10)
              spacing: Style.space(2)

              Text {
                textFormat: Text.PlainText
                width: parent.width
                bottomPadding: Style.space(4)
                text: resultGroup.modelData.heading
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                font.letterSpacing: 1
                elide: Text.ElideRight
              }

              Repeater {
                model: resultGroup.modelData.items

                Loader {
                  id: resultRow
                  required property var modelData
                  width: resultGroup.width
                  sourceComponent: modelData.kind === "displaySwitch" ? resultDisplaySwitch
                    : (modelData.kind === "generalSwitch" ? resultGeneralSwitch
                    : (modelData.kind === "displayChoice" ? choiceRow
                    : (modelData.kind === "generalChoice" ? generalChoiceRow : resultJump)))
                  onLoaded: {
                    if (modelData.kind === "displayChoice" || modelData.kind === "generalChoice") item.choiceId = modelData.choiceId
                    else item.row = modelData
                  }
                }
              }
            }
          }
        }
      }

      WeatherShortcutsPage {
        visible: panel.settingsPage === "shortcuts" && !settingsView.searching
        panel: settingsView.panel
      }

      WeatherSourcesPage {
        visible: panel.settingsPage === "sources" && !settingsView.searching
        panel: settingsView.panel
      }

      // What's new: the plugin's change log.
      WeatherChangesPage {
        id: changesPage
        visible: panel.settingsPage === "changes" && !settingsView.searching
        panel: settingsView.panel
        // The one control: "Show older versions", taken by Enter.
        kbFocused: visible && hasOlder
      }

      // Keys on this page, in muted type where they act.
      Text {
        textFormat: Text.PlainText
        visible: panel.settingsPage === "general" && !settingsView.searching && panel.showHints
        width: parent.width
        text: panel.keepSeparators(panel.i18n("settingsGeneralKeysHint"))
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      // Applies to the menu bar, the widget and the app alike.
      Rectangle {
        visible: panel.settingsPage === "general" && !settingsView.searching
        width: settingsColumn.width
        height: generalSettingsContent.implicitHeight + Style.space(20)
        radius: Style.cornerRadius
        color: "transparent"
        border.color: panel.subtleText
        border.width: Style.spacing.hairline

        Column {
          id: generalSettingsContent
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.top: parent.top
          anchors.margins: Style.space(10)
          spacing: Style.space(8)

          GeneralHeading { panel: settingsView.panel; textKey: "generalSectionLanguage" }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("language")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: languageDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "language"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("language", "auto"))
            options: settingsView.languageOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("language", value) }
          }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("unitSystem")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // Same control as the language below; "Automatic" names the result.
          Dropdown {
            id: unitDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "unit"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: panel.settingsUnitSystem
            options: settingsView.unitOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("unitSystem", value) }
          }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("windUnit")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // Wind on its own: km/h, m/s, mph, knots or Beaufort.
          Dropdown {
            id: windUnitDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "windUnit"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("windUnit", "auto"))
            options: settingsView.windUnitOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("windUnit", value) }
          }

          // Updates: the forecast, and radar with the rain nowcast, apart.
          GeneralHeading { panel: settingsView.panel; textKey: "generalSectionUpdates"; topPadding: Style.space(6) }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("refreshForecast")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: refreshDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "refresh"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("refreshMinutes", 0))
            options: settingsView.refreshOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("refreshMinutes", Number(value)) }
          }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("refreshRadar")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          Dropdown {
            id: radarRefreshDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            hasCursor: settingsView.focusId === "radarRefresh"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: String(panel.generalSetting("radarMinutes", 0))
            options: settingsView.radarRefreshOptions
            onChanged: function(value) { panel.displayOptionsStore.setGeneralSetting("radarMinutes", Number(value)) }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("refreshIntervalHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          GeneralHeading { panel: settingsView.panel; textKey: "generalSectionLook"; topPadding: Style.space(6) }

          // Colour accents across the views, from the theme's palette.
          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "colorAccents"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("colorAccents")
            switchState: panel.colorAccents
            indented: false
            onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting("colorAccents", value) }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("colorAccentsHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Motion: wherever a view turns by itself (the globe).
          GeneralHeading { panel: settingsView.panel; textKey: "motionSection"; topPadding: Style.space(6) }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("motionHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          Repeater {
            model: ["motionDelay", "motionSpeed", "motionFps"]

            Loader {
              required property string modelData
              width: generalSettingsContent.width
              sourceComponent: generalChoiceRow
              onLoaded: item.choiceId = modelData
            }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("optionRotateFpsHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          GeneralHeading { panel: settingsView.panel; textKey: "generalSectionApp"; topPadding: Style.space(6) }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("barPosition")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          // The widget's section in Omarchy's bar, moved by Omarchy itself.
          Dropdown {
            id: barPositionDropdown
            width: Math.min(parent.width, Style.space(280))
            showLabel: false
            fontFamily: panel.fontFamily
            enabled: settingsView.barPositionUsable
            opacity: enabled ? 1 : 0.5
            hasCursor: settingsView.focusId === "barPosition"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
            value: panel.barPlacement.section
            options: settingsView.barPositionOptions
            onChanged: function(value) { panel.barPlacement.moveTo(value) }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n(panel.barPlacement.section !== "" ? "barPositionHint" : "barPositionMissing")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Adds the standalone app to the app launcher. Off by default: the
          // plugin writes nothing outside its own settings without consent.
          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "launcher"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("appLauncherEntry")
            switchState: panel.appLauncherEntry.installed
            indented: false
            rowEnabled: !panel.appLauncherEntry.busy
            onToggled: function(value) { panel.appLauncherEntry.setInstalled(value) }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("appLauncherEntryHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // The lines that explain keys and gestures in the views.
          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "showHints"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("showHints")
            switchState: panel.showHints
            indented: false
            onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting("showHints", value) }
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("showHintsHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WordWrap
          }

          // Export and import of the settings and places (WeatherSettingsTransfer).
          GeneralHeading { panel: settingsView.panel; textKey: "generalSectionBackup"; topPadding: Style.space(6) }

          Text {
            textFormat: Text.PlainText
            text: panel.i18n("settingsTransferFile")
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.bodySmall
          }

          TextField {
            id: transferPathField
            width: Math.min(parent.width, Style.space(460))
            text: panel.settingsTransfer.shown(panel.settingsTransfer.defaultPath)
            foreground: panel.foreground
            font.family: panel.fontFamily
            hasCursor: settingsView.focusId === "transferPath"
            onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
            // Enter or Esc hand the keys back to the settings.
            onAccepted: panel.restoreKeyFocus()
            Keys.onEscapePressed: panel.restoreKeyFocus()
          }

          Row {
            spacing: Style.space(10)

            WeatherButton {
              id: exportButton
              panel: settingsView.panel
              enabled: !panel.settingsTransfer.busy
              label: panel.i18n("settingsExport")
              kbFocused: settingsView.focusId === "exportSettings"
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              onActivated: panel.settingsTransfer.exportTo(transferPathField.text)
            }

            WeatherButton {
              id: importButton
              panel: settingsView.panel
              enabled: !panel.settingsTransfer.busy
              label: panel.i18n("settingsImport")
              confirmLabel: panel.i18n("settingsImportConfirm")
              kbFocused: settingsView.focusId === "importSettings"
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              onActivated: panel.settingsTransfer.importFrom(transferPathField.text)
            }
          }

          // What the last export or import did, and where.
          Text {
            textFormat: Text.PlainText
            readonly property var status: panel.settingsTransfer.status
            visible: status !== null
            width: parent.width
            text: status ? panel.i18n(status.key, { path: panel.settingsTransfer.shown(status.path),
              backup: panel.settingsTransfer.shown(panel.settingsTransfer.backupPath) }) : ""
            color: status && status.error ? panel.warningColorForSeverity("severe") : panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.WrapAnywhere
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("settingsTransferHint", { backup: panel.settingsTransfer.shown(panel.settingsTransfer.backupPath) })
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          // Places: More Time's world clock cities as saved places.

          WeatherButton {
            id: importCitiesButton
            panel: settingsView.panel
            enabled: panel.cityImport.available
            label: panel.i18n("importCitiesFromTime")
            kbFocused: settingsView.focusId === "importCities"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            onActivated: panel.cityImport.run()
          }

          // How the last import went.
          Text {
            textFormat: Text.PlainText
            readonly property var status: panel.cityImport.status
            visible: status !== null
            width: parent.width
            text: status ? panel.i18n("importCitiesResult", { added: status.added, existing: status.existing }) : ""
            color: panel.foreground
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n(panel.cityImport.available ? "importCitiesHint" : "importCitiesMissing")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          // Only while a general option differs from its default.
          WeatherButton {
            id: restoreGeneralButton
            visible: !panel.displayOptionsStore.generalIsDefault()
            panel: settingsView.panel
            label: panel.i18n("restoreGeneralDefaults")
            confirmLabel: panel.i18n("restoreDefaultsConfirm")
            kbFocused: settingsView.focusId === "restoreGeneral"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            onActivated: panel.displayOptionsStore.restoreGeneralDefaults()
          }
        }
      }

      // ---- Notifications: what More Weather tells you about (general
      //      options, for the bar and the app alike).
      Rectangle {
        visible: panel.settingsPage === "notifications" && !settingsView.searching
        width: settingsColumn.width
        height: notificationsContent.implicitHeight + Style.space(20)
        radius: Style.cornerRadius
        color: "transparent"
        border.color: panel.subtleText
        border.width: Style.spacing.hairline

        Column {
          id: notificationsContent
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.top: parent.top
          anchors.margins: Style.space(10)
          spacing: Style.space(8)

          GeneralHeading { panel: settingsView.panel; textKey: "notifications" }

          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "notifySevereWarnings"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("notifySevereWarnings")
            switchState: panel.notifySevereWarnings
            indented: false
            onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting("notifySevereWarnings", value) }
          }
          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("notifySevereWarningsHint")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }

          WeatherSwitchRow {
            panel: settingsView.panel
            kbFocused: settingsView.focusId === "notifyRainSoon"
            onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
            title: panel.i18n("notifyRainSoon")
            switchState: panel.notifyRainSoon
            indented: false
            onToggled: function(value) { panel.displayOptionsStore.setGeneralSetting("notifyRainSoon", value) }
          }
          // From which strength, and how far around the place, which sets
          // how far ahead the nowcast is read.
          Repeater {
            model: panel.notifyRainSoon ? ["rainThreshold", "rainRadius"] : []

            Loader {
              required property string modelData
              width: notificationsContent.width
              sourceComponent: generalChoiceRow
              onLoaded: item.choiceId = modelData
            }
          }
          Text {
            textFormat: Text.PlainText
            width: parent.width
            text: panel.i18n("notifyRainSoonHint") + (panel.notifyRainSoon ? " " + panel.i18n("rainAlertHint") : "")
            color: panel.mutedText
            font.family: panel.fontFamily
            font.pixelSize: Style.font.caption
            wrapMode: Text.Wrap
          }
        }
      }

      // Which part the cards below configure: the bar entry, its popup, or
      // the full app. Underlined tabs, so they read as a sub-level of the
      // page tabs above.
      Item {
        id: settingsSurfaceRow
        visible: panel.settingsPage === "display" && !settingsView.searching
        width: parent.width
        height: Style.space(34)

        Rectangle {
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.bottom: parent.bottom
          height: Style.spacing.hairline
          color: panel.subtleText
        }

        Row {
          anchors.fill: parent

          Repeater {
            model: [
              { surface: "menubar", title: panel.i18n("menubar") },
              { surface: "widget", title: panel.i18n("widget") },
              { surface: "app", title: panel.i18n("app") }
            ]

            Item {
              required property var modelData
              readonly property bool selected: panel.settingsTargetSurface === modelData.surface
              width: settingsSurfaceRow.width / 3
              height: settingsSurfaceRow.height

              Text {
                textFormat: Text.PlainText
                anchors.centerIn: parent
                text: parent.modelData.title
                color: parent.selected || surfaceTabMouse.containsMouse
                  ? Style.hoverStateColor(panel.foreground, Color.accent)
                  : panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
                font.bold: parent.selected
              }

              Rectangle {
                visible: parent.selected
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                height: Style.space(2)
                color: Color.accent
              }

              MouseArea {
                id: surfaceTabMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: panel.settingsTargetSurface = parent.modelData.surface
              }
            }
          }
        }
      }

      Text {
        textFormat: Text.PlainText
        visible: panel.settingsPage === "display" && !settingsView.searching && panel.showHints
        width: parent.width
        text: panel.keepSeparators(panel.i18n("settingsKeysHint"))
        color: panel.hintText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.caption
        wrapMode: Text.WordWrap
      }

      Text {
        textFormat: Text.PlainText
        visible: panel.settingsPage === "display" && !settingsView.searching
        width: parent.width
        text: panel.i18n("displaySettingsHint")
          + (panel.settingsTargetSurface === "menubar" ? " " + panel.i18n("menubarHoverHint")
            : " " + panel.i18n("displaySectionsHint"))
        color: panel.mutedText
        font.family: panel.fontFamily
        font.pixelSize: Style.font.bodySmall
        wrapMode: Text.WordWrap
      }

      Repeater {
        model: settingsView.displayCards

        Rectangle {
          id: settingsCard
          required property var modelData
          visible: panel.settingsPage === "display" && !settingsView.searching
          property var groupData: modelData
          // Cards that only apply while another switch is on (dependsOn).
          readonly property bool cardEnabled: !groupData.dependsOn
            || panel.settingsDisplaySetting(groupData.dependsOn, true)
          // Tabbed sections sit indented under the tab card.
          x: groupData.inTabs ? Style.space(18) : 0
          width: settingsColumn.width - x
          height: settingsCardContent.implicitHeight + Style.space(20)
          radius: Style.cornerRadius
          color: "transparent"
          border.color: panel.subtleText
          border.width: Style.spacing.hairline

          Column {
            id: settingsCardContent
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.margins: Style.space(10)
            spacing: 0

            WeatherSwitchRow {
              visible: settingsCard.groupData.masterKey !== "" || !!settingsCard.groupData.fixedSection
              panel: settingsView.panel
              width: parent.width
              settingKey: settingsCard.groupData.masterKey
              title: panel.upperLabel(settingsCard.groupData.title)
              emphasized: true
              showSwitch: !settingsCard.groupData.fixedSection
              kbFocused: settingsView.focusId === "master:"
                + (settingsCard.groupData.sectionKey || settingsCard.groupData.masterKey)
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              orderListKey: panel.settingsTargetSurface === "menubar" ? ""
                : (settingsCard.groupData.fixedSection ? "sectionOrder"
                  : panel.sectionOrderListFor(settingsCard.groupData.sectionKey))
              orderEntry: settingsCard.groupData.fixedSection ? settingsCard.groupData.sectionKey
                : panel.orderKeyForSetting(settingsCard.groupData.masterKey)
            }

            Text {
              textFormat: Text.PlainText
              visible: settingsCard.groupData.masterKey === "" && !settingsCard.groupData.fixedSection
              opacity: settingsCard.cardEnabled ? 1 : 0.42
              width: parent.width
              height: Style.space(34)
              verticalAlignment: Text.AlignVCenter
              text: panel.upperLabel(settingsCard.groupData.title)
              color: panel.foreground
              font.family: panel.fontFamily
              font.pixelSize: Style.font.bodySmall
              font.bold: true
              font.letterSpacing: 1
              elide: Text.ElideRight
            }

            Text {
              textFormat: Text.PlainText
              visible: !!settingsCard.groupData.hint
              width: parent.width
              text: settingsCard.groupData.hint || ""
              bottomPadding: settingsCard.groupData.options.length > 0 ? Style.space(8) : 0
              color: panel.mutedText
              font.family: panel.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }

            Rectangle {
              visible: settingsCard.groupData.options.length > 0
              width: parent.width
              height: Style.spacing.hairline
              color: panel.foreground
              opacity: 0.12
            }

            // Column headings over the "Always" and "Hover" switches.
            Item {
              readonly property bool hasHoverColumn: {
                var options = settingsCard.groupData.options
                for (var i = 0; i < options.length; i++) if (options[i].hover) return true
                return false
              }
              visible: hasHoverColumn
              width: parent.width
              height: visible ? Style.space(24) : 0
              opacity: settingsCard.cardEnabled
                && (settingsCard.groupData.masterKey === ""
                  || panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true)) ? 1 : 0.42

              Row {
                anchors.right: parent.right
                anchors.bottom: parent.bottom

                Repeater {
                  model: [panel.i18n("showAlways"), panel.i18n("showWhenRelevant"), panel.i18n("showOnHover")]

                  Text {
                    textFormat: Text.PlainText
                    required property string modelData
                    width: settingsView.switchColumnWidth
                    horizontalAlignment: Text.AlignHCenter
                    text: modelData
                    color: panel.mutedText
                    font.family: panel.fontFamily
                    font.pixelSize: Style.font.caption
                    elide: Text.ElideRight
                  }
                }
              }
            }

            Repeater {
              model: panel.settingsOrderedOptions(settingsCard.groupData.options)

              // A switch row; "Bold while hovered" carries the bar's
              // colour choice right under it.
              Column {
                id: optionBlock
                required property var modelData
                width: settingsCardContent.width

                // A section's sub-heading inside a long card (the globe's
                // sky, layers and time).
                Text {
                  textFormat: Text.PlainText
                  visible: !!optionBlock.modelData.section
                  x: Style.space(12)
                  topPadding: Style.space(8)
                  bottomPadding: Style.space(2)
                  text: optionBlock.modelData.section ? panel.upperLabel(panel.i18n(optionBlock.modelData.section)) : ""
                  color: panel.mutedText
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.caption
                  font.letterSpacing: 1
                }
                // A choice standing in the list on its own (the shape).
                Loader {
                  width: parent.width
                  active: !!optionBlock.modelData.choiceOnly
                  sourceComponent: choiceRow
                  onLoaded: item.choiceId = optionBlock.modelData.key
                }

                WeatherSwitchRow {
                  visible: !optionBlock.modelData.choiceOnly
                  panel: settingsView.panel
                  readonly property var modelData: optionBlock.modelData
                  width: settingsCardContent.width
                  settingKey: modelData.key
                  title: modelData.title
                  relevantKey: modelData.relevant ? modelData.key + "WhenRelevant" : ""
                  orderListKey: panel.orderListKeyForSetting(modelData.key)
                  orderEntry: panel.orderKeyForSetting(modelData.key)
                  hoverKey: modelData.hover ? modelData.key + "OnHover" : ""
                  kbFocused: settingsView.focusId === "switch:" + modelData.key
                  kbColumn: settingsView.focusColumn
                  onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
                  columnWidth: settingsView.switchColumnWidth
                  rowEnabled: (settingsCard.groupData.masterKey === ""
                    || panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true))
                    && settingsCard.cardEnabled
                }

                // "Colour the values", created for that one row only.
                Loader {
                  width: parent.width
                  active: !!optionBlock.modelData.accentsBelow
                  sourceComponent: barAccentsRow
                  onLoaded: settingsView.barAccentsDropdown = item.dropdown
                }
                // Choices that belong to the switch above (the moon's style,
                // the wind's mode and height), shown while that switch is on.
                Repeater {
                  model: optionBlock.modelData.choicesBelow || []

                  Loader {
                    required property string modelData
                    width: optionBlock.width
                    active: panel.settingsDisplaySetting(optionBlock.modelData.key, true) === true
                    sourceComponent: choiceRow
                    onLoaded: item.choiceId = modelData
                  }
                }
              }
            }

            // In the scrolling window or as a tab of the shared strip.
            Item {
              id: placementItem
              visible: !!settingsCard.groupData.sectionKey && !settingsCard.groupData.fixedSection
              readonly property string placementKey: (settingsCard.groupData.sectionKey || "") + "AsTab"
              readonly property bool asTab: visible
                && panel.settingsDisplaySetting(placementKey, false) === true
              readonly property bool kbFocused: visible
                && settingsView.focusId === "placement:" + settingsCard.groupData.sectionKey
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              width: parent.width
              height: visible ? Style.space(40) : 0
              opacity: visible && panel.settingsDisplaySetting(settingsCard.groupData.masterKey, true) ? 1 : 0.42

              Rectangle {
                visible: placementItem.kbFocused
                anchors.fill: parent
                radius: Style.cornerRadius
                color: "transparent"
                border.color: Color.accent
                border.width: Style.spacing.hairline
              }

              Row {
                id: placementRow
                anchors.left: parent.left
                anchors.leftMargin: Style.space(12)
                anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                spacing: Style.space(5)

                Text {
                  textFormat: Text.PlainText
                  id: placementLabel
                  anchors.verticalCenter: parent.verticalCenter
                  width: Math.min(implicitWidth + Style.space(8), placementRow.width * 0.4)
                  text: panel.i18n("showAs")
                  color: panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.bodySmall
                  elide: Text.ElideRight
                }

                Repeater {
                  model: [false, true]

                  Rectangle {
                    required property bool modelData
                    readonly property bool selected: modelData === placementItem.asTab
                    width: (placementRow.width - placementLabel.width - placementRow.spacing * 2) / 2
                    height: Style.space(28)
                    radius: Style.cornerRadius
                    color: selected
                      ? Style.selectedFillFor(panel.foreground, Color.accent)
                      : (placementMouse.containsMouse
                        ? Style.hoverFillFor(panel.foreground, Color.accent)
                        : "transparent")
                    border.color: panel.subtleText
                    border.width: Style.spacing.hairline

                    Text {
                      textFormat: Text.PlainText
                      anchors.centerIn: parent
                      width: Math.min(implicitWidth, parent.width - Style.space(8))
                      text: panel.i18n(parent.modelData ? "placementTab" : "placementWindow")
                      color: parent.selected
                        ? Style.selectedStateColor(panel.foreground, Color.accent)
                        : panel.foreground
                      font.family: panel.fontFamily
                      font.pixelSize: Style.font.caption
                      font.bold: parent.selected
                      elide: Text.ElideRight
                    }

                    MouseArea {
                      id: placementMouse
                      anchors.fill: parent
                      hoverEnabled: true
                      cursorShape: Qt.PointingHandCursor
                      onClicked: panel.displayOptionsStore.setSettingsDisplaySetting(
                        placementItem.placementKey, parent.modelData)
                    }
                  }
                }
              }
            }

            // Second unit system for the bar, shown while the pointer rests
            // on the widget.
            Column {
              visible: !!settingsCard.groupData.hasHoverUnit
              width: parent.width
              topPadding: Style.space(8)
              leftPadding: Style.space(12)
              spacing: Style.space(6)

              Text {
                textFormat: Text.PlainText
                text: panel.i18n("hoverUnitSystem")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "hoverUnit"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasHoverUnit) settingsView.hoverUnitDropdown = this
                value: panel.settingsHoverUnitSystem
                options: settingsView.hoverUnitOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("hoverUnitSystem", value) }
              }

              Text {
                textFormat: Text.PlainText
                width: parent.width - Style.space(12)
                text: panel.i18n("hoverUnitSystemHint")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }

            // Radar and wind maps: drawn in the theme's colours or satellite.
            Column {
              visible: !!settingsCard.groupData.hasMapStyle
              width: parent.width
              topPadding: Style.space(8)
              leftPadding: Style.space(12)
              spacing: Style.space(6)

              Text {
                textFormat: Text.PlainText
                text: panel.i18n("mapStyle")
                color: panel.foreground
                font.family: panel.fontFamily
                font.pixelSize: Style.font.bodySmall
              }

              Dropdown {
                width: Math.min(settingsCardContent.width - Style.space(12), Style.space(260))
                showLabel: false
                fontFamily: panel.fontFamily
                hasCursor: settingsView.focusId === "mapStyle"
                onHasCursorChanged: if (hasCursor) settingsView.ensureVisible(this)
                onPopupOpenChanged: if (!popupOpen) panel.restoreKeyFocus()
                Component.onCompleted: if (settingsCard.groupData.hasMapStyle) settingsView.mapStyleDropdown = this
                value: String(panel.settingsDisplaySetting("mapStyle", "drawn"))
                options: settingsView.mapStyleOptions
                onChanged: function(value) { panel.displayOptionsStore.setSettingsDisplaySetting("mapStyle", value) }
              }

              Text {
                textFormat: Text.PlainText
                width: parent.width - Style.space(12)
                text: panel.i18n("mapStyleHint")
                color: panel.mutedText
                font.family: panel.fontFamily
                font.pixelSize: Style.font.caption
                wrapMode: Text.WordWrap
              }
            }


            Item {
              id: defaultTabItem
              visible: settingsCard.groupData.hasDefaultTab
              readonly property bool kbFocused: visible && settingsView.focusId === "defaultTab"
              onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
              width: parent.width
              height: visible ? Style.space(66) : 0
              opacity: panel.settingsTabs.length > 0 ? 1 : 0.42

              Rectangle {
                visible: defaultTabItem.kbFocused
                anchors.fill: parent
                radius: Style.cornerRadius
                color: "transparent"
                border.color: Color.accent
                border.width: Style.spacing.hairline
              }

              Column {
                anchors.left: parent.left
                anchors.leftMargin: Style.space(12)
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.topMargin: Style.space(6)
                spacing: Style.space(6)

                Text {
                  textFormat: Text.PlainText
                  text: panel.i18n("defaultTab")
                  color: panel.foreground
                  font.family: panel.fontFamily
                  font.pixelSize: Style.font.bodySmall
                }

                Row {
                  id: defaultTabRow
                  width: parent.width
                  spacing: Style.space(5)

                  Repeater {
                    model: panel.settingsTabs

                    Rectangle {
                      required property string modelData
                      readonly property int count: Math.max(1, panel.settingsTabs.length)
                      width: (defaultTabRow.width - defaultTabRow.spacing * (count - 1)) / count
                      height: Style.space(28)
                      radius: Style.cornerRadius
                      color: modelData === panel.settingsDefaultTab
                        ? Style.selectedFillFor(panel.foreground, Color.accent)
                        : (defaultTabMouse.containsMouse
                          ? Style.hoverFillFor(panel.foreground, Color.accent)
                          : "transparent")
                      border.color: panel.subtleText
                      border.width: Style.spacing.hairline

                      Text {
                        textFormat: Text.PlainText
                        anchors.centerIn: parent
                        width: Math.min(implicitWidth, parent.width - Style.space(6))
                        text: panel.sectionTabLabel(modelData)
                        color: modelData === panel.settingsDefaultTab
                          ? Style.selectedStateColor(panel.foreground, Color.accent)
                          : panel.foreground
                        font.family: panel.fontFamily
                        font.pixelSize: Style.font.caption
                        font.bold: modelData === panel.settingsDefaultTab
                        elide: Text.ElideRight
                      }

                      MouseArea {
                        id: defaultTabMouse
                        anchors.fill: parent
                        enabled: parent.enabled
                        hoverEnabled: true
                        cursorShape: enabled ? Qt.PointingHandCursor : Qt.ArrowCursor
                        onClicked: panel.displayOptionsStore.setSettingsDisplaySetting("defaultTab", modelData)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      // The resets side by side (order only, every switch), and the copy
      // to the other view.
      Row {
        visible: panel.settingsPage === "display" && !settingsView.searching
        anchors.horizontalCenter: parent.horizontalCenter
        spacing: Style.space(10)

      // Order only: one press, since nothing switches off with it.
      WeatherButton {
        id: restoreOrderButton
        panel: settingsView.panel
        width: Math.min((settingsColumn.width - Style.space(20)) / 3, implicitWidth)
        label: panel.i18n("restoreOrder")
        enabled: !panel.settingsOrderIsDefault
        kbFocused: settingsView.focusId === "restoreOrder"
        onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
        onActivated: panel.displayOptionsStore.restoreSettingsDisplayOrder()
      }

      // Two-step reset: the first press arms it, a second one within a few
      // seconds restores the selected view's factory defaults.
      WeatherButton {
        id: restoreDefaultsButton
        readonly property bool isDefault: panel.displayOptionsStore.settingsDisplayIsDefault()
        panel: settingsView.panel
        width: Math.min((settingsColumn.width - Style.space(20)) / 3, implicitWidth)
        label: panel.i18n(isDefault ? "defaultsActive" : "restoreDefaults")
        confirmLabel: panel.i18n("restoreDefaultsConfirm")
        enabled: !isDefault
        kbFocused: settingsView.focusId === "restoreDefaults"
        onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
        onIsDefaultChanged: if (isDefault) armed = false
        onActivated: panel.displayOptionsStore.restoreSettingsDisplayDefaults()

        Connections {
          target: panel
          function onSettingsTargetSurfaceChanged() { restoreDefaultsButton.armed = false }
        }
      }

      // Two-step copy of this view's settings to the other one (widget ↔
      // app).
      WeatherButton {
        id: copyToButton
        visible: panel.settingsTargetSurface !== "menubar"
        panel: settingsView.panel
        width: Math.min((settingsColumn.width - Style.space(20)) / 3, implicitWidth)
        label: panel.i18n(panel.settingsTargetSurface === "app" ? "copyToWidget" : "copyToApp")
        confirmLabel: panel.i18n("copyConfirm")
        kbFocused: settingsView.focusId === "copyTo"
        onKbFocusedChanged: if (kbFocused) settingsView.ensureVisible(this)
        onActivated: panel.displayOptionsStore.copySettingsDisplayToOther()

        Connections {
          target: panel
          function onSettingsTargetSurfaceChanged() { copyToButton.armed = false }
        }
      }
      }

      Item {
        width: parent.width
        height: Style.space(4)
      }
    }
  }

  // The wheel scrolls a fixed step: Flickable's own wheel handling crawled.
  // Touchpads keep their pixel deltas, scaled up like the page's
  // (Panel.wheelPixels).
  MouseArea {
    anchors.fill: settingsFlick
    z: 2
    acceptedButtons: Qt.NoButton
    onWheel: function(wheel) {
      settingsView.scrollBy(-panel.wheelPixels(wheel, false))
      wheel.accepted = true
    }
  }
}
