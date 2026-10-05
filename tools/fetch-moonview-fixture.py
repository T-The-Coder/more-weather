#!/usr/bin/env python3
"""Fetches tests/fixtures/moonview-reference.json for tests/moon-view.test.mjs:
the Moon as seen from Berlin and Sydney on three dates, from

- JPL Horizons (https://ssd.jpl.nasa.gov/api/horizons.api): observer
  tables, geodetic site, quantities 4 (apparent azimuth and elevation,
  airless), 10 (illuminated fraction), 13 (angular diameter), 20 (range)
  and 27 (PsAng, the position angle of the extended Sun→Moon vector; the
  bright limb lies opposite, at PsAng − 180°), every 3 hours;
- the USNO (https://aa.usno.navy.mil/api/rstt/oneday): the Moon's rise and
  set (upper limb, standard refraction) in UTC.

Run from the repository root: python3 tools/fetch-moonview-fixture.py
"""
import json
import os
import urllib.parse
import urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
PLACES = {"berlin": (52.52, 13.405, 0.034), "sydney": (-33.8688, 151.2093, 0.003)}
DATES = ["2026-03-03", "2026-06-15", "2026-10-05"]


def horizons(lat, lon, alt, date):
    params = {
        "format": "json", "COMMAND": "'301'", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'", "EPHEM_TYPE": "'OBSERVER'",
        "CENTER": "'coord@399'", "COORD_TYPE": "'GEODETIC'", "SITE_COORD": "'%s,%s,%s'" % (lon, lat, alt),
        "START_TIME": "'%s 00:00'" % date, "STOP_TIME": "'%s 23:59'" % date, "STEP_SIZE": "'3 h'",
        "QUANTITIES": "'4,10,13,20,27'", "CSV_FORMAT": "'YES'", "ANG_FORMAT": "'DEG'", "TIME_DIGITS": "'MINUTES'",
        "APPARENT": "'AIRLESS'", "RANGE_UNITS": "'KM'", "EXTRA_PREC": "'YES'",
    }
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(params)
    text = json.load(urllib.request.urlopen(url))["result"]
    lines = text.split("$$SOE")[1].split("$$EOE")[0].strip().splitlines()
    rows = []
    for line in lines:
        f = [x.strip() for x in line.split(",")]
        # date, solar flag, lunar flag, azi, elev, illu%, ang-diam (arcsec), delta (km), deldot, PsAng, PsAMV
        rows.append({"utc": f[0], "azimuth": float(f[3]), "altitude": float(f[4]), "illuminated": float(f[5]) / 100,
                     "angularDiameterArcsec": float(f[6]), "distanceKm": float(f[7]), "psAng": float(f[9])})
    return rows


def usno(lat, lon, date):
    url = "https://aa.usno.navy.mil/api/rstt/oneday?date=%s&coords=%s,%s&tz=0" % (date, lat, lon)
    data = json.load(urllib.request.urlopen(url))["properties"]["data"]
    return {m["phen"]: m["time"] for m in data["moondata"] if m["phen"] in ("Rise", "Set")}


def main():
    out = {"source": "JPL Horizons API (observer tables, airless) and USNO rstt/oneday API (UTC), retrieved 2026-10-05 "
                     "by tools/fetch-moonview-fixture.py", "places": {}}
    for name, (lat, lon, alt) in PLACES.items():
        place = {"lat": lat, "lon": lon, "dates": {}}
        for date in DATES:
            place["dates"][date] = {"horizons": horizons(lat, lon, alt, date), "usno": usno(lat, lon, date)}
        out["places"][name] = place
    with open(os.path.join(ROOT, "tests", "fixtures", "moonview-reference.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, indent=1)


if __name__ == "__main__":
    main()
