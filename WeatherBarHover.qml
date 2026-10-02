import QtQuick

// The bar widget's hover, shared by the More plugins (tools/sync-shared.sh).
// Entries set to "Hover" show while the pointer rests on the widget
// (`panel.menubarHovered`, after short enter / leave delays), and the popup
// can open from hover alone (`panel.menubarOpenWidgetOnHover`) and then
// closes once the pointer has left it. Once the popup is open it covers the
// bar, so the panel's hover zones (`popupPointerInside` for the widget spot
// and the stretch from it to the card, `popupPointerOnAnchor` for the spot)
// stand in for the button.
QtObject {
  id: hover

  // In: the widget's panel (null until loaded), its bar button (for
  // `tooltipHovered`), whether the popup is open, and whether something in
  // the popup is being edited, which keeps a hover-opened popup open.
  property var panel: null
  property var button: null
  property bool opened: false
  property bool editingBlocksClose: false

  readonly property bool pointerOnWidget: !!button && button.tooltipHovered
  // On the widget or on its spot under the open popup, at once (no delay):
  // what bold and coloured values "while hovered" follow.
  readonly property bool hoverNow: !!panel
    && (pointerOnWidget || (opened && panel.popupPointerOnAnchor))
  // Opened by hover; a click on the widget turns it into a normal open.
  property bool openedByHover: false

  // Opened while the pointer was on the widget; holds until the popup's
  // zones have seen the pointer, since they only learn of it once it moves.
  property bool hoverLatched: false
  property bool popupZoneSeen: false
  // Closed with the pointer still on the widget: no reopening until it
  // has left.
  property bool hoverOpenBlocked: false
  readonly property bool pointerNear: pointerOnWidget || (opened && !!panel
    && (panel.popupPointerInside || (hoverLatched && !popupZoneSeen)))

  onPointerNearChanged: {
    if (pointerNear) {
      leaveTimer.stop()
      enterTimer.start()
    } else {
      enterTimer.stop()
      leaveTimer.start()
    }
  }
  onPointerOnWidgetChanged: if (!pointerOnWidget && !opened) hoverOpenBlocked = false
  onOpenedChanged: {
    if (opened) {
      hoverLatched = pointerOnWidget || (!!panel && panel.menubarHovered)
    } else {
      hoverOpenBlocked = pointerOnWidget
        || (!!panel && panel.popupPointerOnAnchor)
        || (hoverLatched && !popupZoneSeen)
      hoverLatched = false
      openedByHover = false
    }
    popupZoneSeen = false
  }

  property Connections popupZones: Connections {
    target: hover.panel
    ignoreUnknownSignals: true
    function onPopupPointerInsideChanged() {
      if (hover.panel.popupPointerInside) hover.popupZoneSeen = true
    }
  }

  property Timer enterTimer: Timer {
    interval: 120
    onTriggered: if (hover.panel) hover.panel.menubarHovered = true
  }

  property Timer leaveTimer: Timer {
    interval: 400
    onTriggered: {
      if (!hover.panel) return
      hover.panel.menubarHovered = false
      // A popup opened by hover closes again once the pointer has left it,
      // unless something in it is being edited.
      if (hover.openedByHover && hover.opened && hover.popupZoneSeen && !hover.editingBlocksClose)
        hover.panel.close()
    }
  }

  property Timer openTimer: Timer {
    interval: 250
    running: !!hover.panel && hover.panel.menubarOpenWidgetOnHover
      && hover.pointerOnWidget && !hover.opened && !hover.hoverOpenBlocked
    onTriggered: {
      if (!hover.panel || hover.opened) return
      hover.openedByHover = true
      // The hotkey path: the plain open() left the popup without pointer
      // events while it mapped under the pointer.
      hover.panel.openFromHotkey()
    }
  }
}
