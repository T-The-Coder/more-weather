#!/usr/bin/env python3
"""Install the synthetic catalogue only in the throwaway UI harness copy.

Production catalogue selection and URL construction remain byte-for-byte base
behaviour. A stable fixture avoids real-time catalogue refreshes replacing a
picture halfway through the long offline interaction test.
"""
from pathlib import Path
import sys

panel = Path(sys.argv[1]) / 'Panel.qml'
text = panel.read_text()
needle = '  readonly property var computedRadarFrames: officialRadarFrames.length > 0'
assert text.count(needle) == 1
text = text.replace(needle, '''  property var radarFixtureFrames: []
  readonly property var computedRadarFrames: radarFixtureFrames.length
    ? radarFixtureFrames : officialRadarFrames.length > 0''')
panel.write_text(text)
