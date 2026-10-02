import QtQuick
import qs.Commons
import qs.Ui

// The bar's popup around the panel's content (Panel.qml reparents its tree
// into contentHost). Loaded by URL and only in the bar: the app has its own
// window, and a layer-shell surface cannot exist offscreen, in tests.
KeyboardPanel {
  id: panel
  required property var weatherPanel
  readonly property Item contentHost: popupContentHost
  readonly property bool spanHovered: popupSpanHover.hovered
  readonly property bool anchorHovered: popupAnchorHover.hovered
  anchorItem: weatherPanel.anchorItem
  owner: weatherPanel.barIdentity
  bar: weatherPanel.bar
  open: !weatherPanel.standaloneMode && weatherPanel.opened
  centerOnBar: true
  focusTarget: weatherPanel.contentRoot
  contentWidth: panel.fittedContentWidth(Style.space(480))
  contentHeight: panel.fittedContentHeight(weatherPanel.settingsOpen
    ? Style.space(650)
    : weatherPanel.contentHeight)

  Item {
    id: popupContentHost
    anchors.fill: parent

    // The open popup covers the whole screen, bar included, so the bar
    // widget stops seeing the pointer. These zones follow it instead: one
    // over the widget's spot in the bar, one spanning widget and card.
    // They hold only HoverHandlers, which neither take clicks nor keep
    // hover from the content below.
    Item {
      id: popupHoverZones
      z: 1000
      // Window position of this host: the card, plus the content holder's
      // inset within it. Read off the chain so it follows the card's moves.
      readonly property point hostOrigin: {
        var holder = popupContentHost.parent
        var card = holder ? holder.parent : null
        return card ? Qt.point(card.x + holder.x, card.y + holder.y) : panel.cardOrigin
      }
      readonly property rect anchorRect: {
        if (panel.barPos === "bottom")
          return Qt.rect(panel.anchorScreenPos.x, panel.screenH - panel.barH, panel.anchorW, panel.barH)
        if (panel.barPos === "left")
          return Qt.rect(0, panel.anchorScreenPos.y, panel.barW, panel.anchorH)
        if (panel.barPos === "right")
          return Qt.rect(panel.screenW - panel.barW, panel.anchorScreenPos.y, panel.barW, panel.anchorH)
        return Qt.rect(panel.anchorScreenPos.x, 0, panel.anchorW, panel.barH)
      }
      readonly property rect spanRect: {
        var left = Math.min(anchorRect.x, panel.cardOrigin.x)
        var top = Math.min(anchorRect.y, panel.cardOrigin.y)
        var right = Math.max(anchorRect.x + anchorRect.width, panel.cardOrigin.x + panel.contentWidth)
        var bottom = Math.max(anchorRect.y + anchorRect.height, panel.cardOrigin.y + panel.contentHeight)
        return Qt.rect(left, top, right - left, bottom - top)
      }

      Item {
        x: popupHoverZones.spanRect.x - popupHoverZones.hostOrigin.x
        y: popupHoverZones.spanRect.y - popupHoverZones.hostOrigin.y
        width: popupHoverZones.spanRect.width
        height: popupHoverZones.spanRect.height
        HoverHandler { id: popupSpanHover }
      }

      Item {
        x: popupHoverZones.anchorRect.x - popupHoverZones.hostOrigin.x
        y: popupHoverZones.anchorRect.y - popupHoverZones.hostOrigin.y
        width: popupHoverZones.anchorRect.width
        height: popupHoverZones.anchorRect.height
        HoverHandler { id: popupAnchorHover }
      }
    }
  }
}
