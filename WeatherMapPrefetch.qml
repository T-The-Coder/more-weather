import QtQuick
import "Providers.js" as Providers

// Loads the radar frames and the basemap for the current map extent while
// the radar and wind views are hidden. The views create their Image items
// only when their tab is shown; with the same URLs held here they find the
// pictures already in Qt's pixmap cache and appear at once. Holding them
// matters: once a view is torn down, Qt keeps only about 2 MB of pictures
// nobody references, a few frames, and every other frame would be
// downloaded again on the next tab switch. The frame set
// follows panel.radarFrames, which is renewed hourly, on a manual refresh
// and on a location or zoom change.
Item {
  id: prefetch
  required property var panel
  visible: false

  // fillMode is part of Qt's pixmap cache key; it must match the views'
  // Images (PreserveAspectCrop), or they load their own copy. Frames use
  // WeatherRadarFrameImage, which sets it.
  Image {
    asynchronous: true
    cache: true
    fillMode: Image.PreserveAspectCrop
    source: Providers.calmContextMapUrl(prefetch.panel.mapBbox, 480, 250)
  }

  Repeater {
    model: prefetch.panel.radarFrames
    WeatherRadarFrameImage {
      frameUrl: prefetch.panel.radarFrameUrl(modelData)
      load: prefetch.panel.radarFrameLoadAllowed(index)
      onStatusChanged: if (status === Image.Ready) prefetch.panel.noteShownRadarFramePrefetched(index)
      Component.onCompleted: if (status === Image.Ready) prefetch.panel.noteShownRadarFramePrefetched(index)
      // Failures switch to the fallback source right away, so the map does
      // not first have to fail on screen.
      onFailed: prefetch.panel.updateRadarFrameStatus(index, Image.Error, modelData)
    }
  }

  // A renewed timeline waiting to replace the shown one. Loaded three
  // pictures at a time, from the frame for now on (earlier frames are never
  // shown); the panel switches once all of them are ready, so playback stays
  // smooth. These items keep the pictures referenced until the shown set has
  // taken them over.
  Repeater {
    model: prefetch.panel.pendingRadarFrames
    WeatherRadarFrameImage {
      readonly property int position: index - prefetch.panel.pendingRadarFirstIndex
      frameUrl: prefetch.panel.radarFrameUrl(modelData)
      load: position >= 0 && position < prefetch.panel.pendingRadarReadyCount + 3
      onStatusChanged: if (status === Image.Ready) prefetch.panel.pendingRadarFrameStatus(index, status)
      onFailed: prefetch.panel.pendingRadarFrameStatus(index, Image.Error)
      Component.onCompleted: if (status === Image.Ready) prefetch.panel.pendingRadarFrameStatus(index, status)
    }
  }
}
