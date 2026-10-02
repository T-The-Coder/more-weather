#!/usr/bin/env python3
"""Synthetic weather for the screenshot run (tests/ui-shots.sh).

Writes, under the throwaway HOME given as the only argument, the state files
More Weather reads at start: the place (Tórshavn), three favourites, and a
forecast "published" by another instance in the shared live file, so the
panel shows it as fresh data without any request. Every number is made up
but plausible for the Faroe Islands in autumn; the times are built around
the moment of the run, so the hour strip and the rain nowcast start now.
fixture-places.json holds forecasts for the favourites and an air quality
reading, which tests/ui/shell.qml hands to the panel.
"""
import json
import math
import os
import sys
import time
from datetime import datetime, timedelta, timezone

home = sys.argv[1]
settings = os.path.join(home, ".local/state/omarchy/settings")
os.makedirs(settings, exist_ok=True)
now = time.time()


def write(name, data, folder=settings):
    with open(os.path.join(folder, name), "w", encoding="utf-8") as out:
        json.dump(data, out, ensure_ascii=False)
        out.write("\n")


def wave(x, *phases):
    """A smooth, repeatable wobble in [-1, 1]."""
    return sum(math.sin(x * (0.37 + 0.11 * i) + p) for i, p in enumerate(phases)) / len(phases)


def forecast(lat, lon, offset_hours, base, spread, seed):
    """An Open-Meteo /v1/forecast answer (timezone=auto, local times)."""
    tz = timezone(timedelta(hours=offset_hours))
    local_now = datetime.fromtimestamp(now, tz)
    midnight = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    stamp = lambda moment: moment.strftime("%Y-%m-%dT%H:%M")
    sunrise_hour, sunset_hour = 7.8, 19.3

    hourly = {k: [] for k in ["time", "temperature_2m", "precipitation_probability", "precipitation",
                              "weather_code", "is_day", "wind_speed_10m", "uv_index", "apparent_temperature",
                              "relative_humidity_2m", "wind_speed_700hPa", "wind_direction_700hPa"]}
    for h in range(8 * 24):
        moment = midnight + timedelta(hours=h)
        day, hour = divmod(h, 24)
        daylight = sunrise_hour <= hour < sunset_hour
        temperature = base + 0.4 * day * wave(day, seed) + spread * math.sin((hour - 9) / 24 * 2 * math.pi) \
            + 0.6 * wave(h / 3, seed, 1.3)
        showers = max(0.0, wave(h / 2.2, seed + 0.7, 2.1, 0.4))
        rain = round(max(0.0, showers - 0.35) * 2.4, 1)
        probability = int(min(95, max(5, 20 + 80 * showers)))
        wind = 22 + 14 * (0.5 + 0.5 * wave(h / 5, seed + 2.2))
        hourly["time"].append(stamp(moment))
        hourly["temperature_2m"].append(round(temperature, 1))
        hourly["precipitation_probability"].append(probability)
        hourly["precipitation"].append(rain)
        hourly["weather_code"].append(80 if rain >= 0.8 else 61 if rain > 0 else 3 if showers > 0.15 else 2)
        hourly["is_day"].append(1 if daylight else 0)
        hourly["wind_speed_10m"].append(round(wind, 1))
        hourly["uv_index"].append(round(max(0.0, 1.6 * math.sin((hour - sunrise_hour) / (sunset_hour - sunrise_hour) * math.pi)), 1)
                                  if daylight else 0.0)
        hourly["apparent_temperature"].append(round(temperature - 2.5 - wind / 20, 1))
        hourly["relative_humidity_2m"].append(int(78 + 12 * showers))
        hourly["wind_speed_700hPa"].append(round(45 + 10 * wave(h / 7, seed), 1))
        hourly["wind_direction_700hPa"].append(int(250 + 20 * wave(h / 9, seed + 1)))

    daily = {k: [] for k in ["time", "weather_code", "temperature_2m_max", "temperature_2m_min",
                             "precipitation_probability_max", "precipitation_sum", "wind_speed_10m_max",
                             "sunrise", "sunset", "uv_index_max"]}
    for day in range(8):
        hours = range(day * 24, day * 24 + 24)
        date = midnight + timedelta(days=day)
        daily["time"].append(date.strftime("%Y-%m-%d"))
        codes = [hourly["weather_code"][h] for h in hours if 8 <= h % 24 <= 20]
        daily["weather_code"].append(max(codes))
        daily["temperature_2m_max"].append(max(hourly["temperature_2m"][h] for h in hours))
        daily["temperature_2m_min"].append(min(hourly["temperature_2m"][h] for h in hours))
        daily["precipitation_probability_max"].append(max(hourly["precipitation_probability"][h] for h in hours))
        daily["precipitation_sum"].append(round(sum(hourly["precipitation"][h] for h in hours), 1))
        daily["wind_speed_10m_max"].append(max(hourly["wind_speed_10m"][h] for h in hours))
        # The day shortens by about four minutes a day in October.
        daily["sunrise"].append(stamp(date + timedelta(hours=sunrise_hour, minutes=2 * day)))
        daily["sunset"].append(stamp(date + timedelta(hours=sunset_hour, minutes=-2 * day)))
        daily["uv_index_max"].append(max(hourly["uv_index"][h] for h in hours))

    # A shower arriving within the hour, for the rain chart.
    quarter = local_now.replace(minute=local_now.minute // 15 * 15, second=0, microsecond=0)
    shower = [0, 0, 0, 0.1, 0.4, 0.9, 1.2, 0.8, 0.4, 0.2, 0.1, 0, 0, 0, 0, 0]
    minutely = {"time": [stamp(quarter + timedelta(minutes=15 * i)) for i in range(16)],
                "precipitation": [round(v / 4, 2) for v in shower],
                "precipitation_probability": [int(min(90, 25 + 70 * v)) for v in shower],
                "wind_speed_10m": [round(28 + 3 * wave(i, seed), 1) for i in range(16)],
                "wind_direction_10m": [int(245 + 8 * wave(i, seed + 1)) for i in range(16)],
                "wind_gusts_10m": [round(46 + 6 * wave(i, seed + 2), 1) for i in range(16)]}

    h = local_now.hour
    current = {"time": stamp(quarter), "interval": 900,
               "temperature_2m": hourly["temperature_2m"][h],
               "apparent_temperature": hourly["apparent_temperature"][h],
               "relative_humidity_2m": hourly["relative_humidity_2m"][h],
               "wind_speed_10m": hourly["wind_speed_10m"][h],
               "weather_code": hourly["weather_code"][h],
               "is_day": hourly["is_day"][h]}
    return {"latitude": lat, "longitude": lon, "generationtime_ms": 0.5,
            "utc_offset_seconds": int(offset_hours * 3600), "timezone": "GMT", "timezone_abbreviation": "GMT",
            "elevation": 20.0, "current": current, "hourly": hourly, "minutely_15": minutely, "daily": daily}


torshavn = {"name": "Tórshavn", "latitude": 62.0107, "longitude": -6.7741}
favourites = [
    torshavn,
    {"name": "Klaksvík", "latitude": 62.2266, "longitude": -6.589},
    {"name": "Reykjavík", "latitude": 64.1466, "longitude": -21.9426},
    {"name": "Bergen", "latitude": 60.3913, "longitude": 5.3221},
]
# Summer time on the Faroes ends on the last Sunday of October; the run
# only needs a plausible offset, not the exact switch.
month = datetime.fromtimestamp(now, timezone.utc).month
faroe = 1 if 4 <= month <= 10 else 0

write("weather.json", torshavn)
write("more-weather-locations.json", favourites)
write("more-weather-general.json", {"language": "en"})
# More Time's world clock, for the import under Settings → General → Places:
# one city already a favourite, one without coordinates.
write("more-time-cities.json", [
    {"name": "Reykjavik", "country": "Iceland", "tz": "Atlantic/Reykjavik", "lat": 64.1355, "lon": -21.8954},
    {"name": "Tokyo", "country": "Japan", "tz": "Asia/Tokyo", "lat": 35.6895, "lon": 139.6917},
    {"name": "UTC", "country": "", "tz": "Etc/UTC", "lat": None, "lon": None},
    {"name": "Nairobi", "country": "Kenya", "tz": "Africa/Nairobi", "lat": -1.2833, "lon": 36.8167},
])
ms = int(now * 1000)
write("more-weather-live-shared.json", {
    "version": 1,
    "locationKey": "geo:%.4f,%.4f" % (torshavn["latitude"], torshavn["longitude"]),
    "publishedBy": "fixture", "publishedAt": ms, "fetchedAt": ms,
    "reports": {
        "dailyForecastReport": forecast(torshavn["latitude"], torshavn["longitude"], faroe, 9.0, 1.6, 0.3),
        "forecastProviderId": "open-meteo",
        "placeName": torshavn["name"],
        "providerCountry": "fo",
    },
})
write("fixture-places.json", {
    "places": [
        dict(place, report=forecast(place["latitude"], place["longitude"], offset, base, spread, seed))
        for place, offset, base, spread, seed in [
            (favourites[1], faroe, 8.4, 1.4, 1.1),
            (favourites[2], 0, 5.2, 2.0, 2.4),
            (favourites[3], faroe + 1, 11.3, 2.6, 3.7),
        ]
    ],
    "airQuality": {"current": {"time": datetime.fromtimestamp(now, timezone.utc).strftime("%Y-%m-%dT%H:00"),
                               "european_aqi": 17, "us_aqi": 21, "pm2_5": 3.8, "pm10": 9.6, "ozone": 64.0,
                               "birch_pollen": 0.0, "alder_pollen": 0.0, "grass_pollen": 4.2,
                               "olive_pollen": None, "mugwort_pollen": 0.3, "ragweed_pollen": None}},
}, folder=home)
