import QtQuick
import QtQuick.Templates as T
import Quickshell.Io
import qs.Commons
import qs.Ui

// Every text field of the plugin: one line of plain text, styled as the
// kit's TextField but built on TextEdit, read-only while it has no keyboard
// focus. Qt 6.11 and 6.12.0 read the clipboard payload for TextInput's
// canPaste; TextEdit only checks the offered formats, and a read-only field
// not even that. Use this instead of TextField, TextInput, TextEdit or
// TextArea (tests/text-fields.test.mjs).
//
// Qt's own paste never runs: Qt's Wayland clipboard receiver reads the
// offered text with a 1 s idle timeout and no byte limit, so an explicit
// paste into the shell could be stalled or flooded by a foreign clipboard
// owner. The paste keys (StandardKey.Paste) and the middle button (the
// primary selection) go to pasteBounded() instead, which reads the
// clipboard through wl-paste (wl-clipboard) for at most 1 s and 4 KiB and
// inserts that as typed text.
T.TextArea {
  id: field

  // TextField's API that TextEdit lacks (it has textEdited, emitted for
  // what the user types, and editingFinished).
  signal accepted()
  // Return and Enter, which TextInput lets through to the items around it:
  // a function(event) to hand them on to, after accepted().
  property var passKey: null
  // RegularExpressionValidator, IntValidator or DoubleValidator; a change
  // that it (or maximumLength, 0 for none) rejects is undone.
  property var validator: null
  property int maximumLength: 0
  readonly property bool acceptableInput: isAcceptable(text, true)

  // The kit's TextField (qs.Ui), drawn the same.
  property color foreground: Color.foreground
  property color accent: Color.accent
  property color selectionTint: Style.selectionFillFor(foreground, accent)
  property real horizontalPadding: Style.spacing.controlPaddingX
  property real verticalPadding: Style.spacing.inputPaddingY
  property bool hasCursor: false

  readonly property bool _focused: activeFocus
  readonly property bool _hot: hovered || hasCursor
  readonly property var _borderSpec: Border.controlSpec(_focused ? "focus" : (_hot ? "hover-cursor" : "normal"), foreground, accent)

  readOnly: !activeFocus
  wrapMode: TextEdit.NoWrap
  textFormat: TextEdit.PlainText
  activeFocusOnTab: true
  hoverEnabled: true
  selectByMouse: true
  verticalAlignment: TextEdit.AlignVCenter
  font.family: Style.font.family
  font.pixelSize: Style.font.body
  color: foreground
  selectionColor: selectionTint
  selectedTextColor: foreground
  placeholderTextColor: Qt.darker(foreground, 1.6)

  // TextEdit does not scroll by itself: the line moves left (_scroll) to
  // keep the cursor in view, and what passes the edges is clipped.
  property real _scroll: 0
  clip: true
  leftPadding: horizontalPadding + Border.left(_borderSpec) - _scroll
  rightPadding: horizontalPadding + Border.right(_borderSpec)
  topPadding: verticalPadding + Border.top(_borderSpec)
  bottomPadding: verticalPadding + Border.bottom(_borderSpec)
  // One line high, as TextInput: the font's height and the paddings.
  implicitWidth: Math.max(contentWidth + leftPadding + rightPadding, 200)
  implicitHeight: Math.ceil(lineMetrics.height) + topPadding + bottomPadding

  FontMetrics { id: lineMetrics; font: field.font }

  background: BorderSurface {
    color: Style.controlFill(field._focused, field._hot, field.foreground, field.accent)
    borderSpec: field._borderSpec
    radius: Style.cornerRadius
  }

  // The placeholder, as the kit's: muted, while the field is empty.
  Text {
    x: field.leftPadding
    y: field.topPadding
    width: field.width - field.leftPadding - field.rightPadding
    height: field.height - field.topPadding - field.bottomPadding
    visible: field.text.length === 0 && field.preeditText.length === 0
    text: field.placeholderText
    textFormat: Text.PlainText
    font: field.font
    color: field.placeholderTextColor
    verticalAlignment: Text.AlignVCenter
    elide: Text.ElideRight
  }

  // One line: Return and Enter accept instead of breaking it; Tab and
  // ⇧ Tab move the focus on, as from a TextField. keyFilter, a
  // function(event), sees every key before that and takes it by setting
  // event.accepted: a Keys.onPressed of the field itself runs only after
  // this type's own (and Keys.on<Key>Pressed before both).
  property var keyFilter: null
  Keys.onPressed: function(event) {
    if (keyFilter) keyFilter(event)
    if (event.accepted) return
    if (event.matches(StandardKey.Paste)) {
      event.accepted = true
      pasteBounded(false)
    } else if (event.key === Qt.Key_Return || event.key === Qt.Key_Enter) {
      if (acceptableInput) {
        accepted()
        editingFinished()
      }
      if (passKey) passKey(event)
      event.accepted = true
    } else if (event.key === Qt.Key_Tab || event.key === Qt.Key_Backtab) {
      var next = nextItemInFocusChain(event.key === Qt.Key_Tab)
      if (next && next !== field) next.forceActiveFocus(event.key === Qt.Key_Tab ? Qt.TabFocusReason : Qt.BacktabFocusReason)
      event.accepted = true
    }
  }

  // The middle button pastes the primary selection, bounded as well; the
  // press never reaches TextEdit, whose release would read it itself.
  MouseArea {
    anchors.fill: parent
    acceptedButtons: Qt.MiddleButton
    cursorShape: Qt.IBeamCursor
    onPressed: function(mouse) {
      mouse.accepted = true
      field.forceActiveFocus(Qt.MouseFocusReason)
    }
    onReleased: function(mouse) {
      if (field.readOnly) return
      field.cursorPosition = field.positionAt(mouse.x, mouse.y)
      field.pasteBounded(true)
    }
  }

  // ---- Bounded paste: wl-paste under `timeout`, its output cut by head,
  //      one at a time; nothing is inserted when it fails or the field has
  //      lost the focus meanwhile.
  readonly property int pasteMaxBytes: 4096
  readonly property int pasteSeconds: 1
  property Process _paste: Process {
    stdout: StdioCollector { id: pasteOut }
    // 0: all of it; 141: cut at pasteMaxBytes (wl-paste got SIGPIPE from
    // head). Anything else (124 timed out, 1 nothing to paste, 127 no
    // wl-paste) pastes nothing.
    onExited: function(exitCode) {
      if (exitCode !== 0 && exitCode !== 141) {
        console.debug("text field: nothing pasted, wl-paste exited with", exitCode)
        return
      }
      field._insertPasted(String(pasteOut.text || ""))
    }
  }
  // TextEdit's paste() for any caller, bounded the same way.
  function paste() { pasteBounded(false) }
  function pasteBounded(primary) {
    if (_paste.running || readOnly) return
    _paste.command = ["bash", "-c", "set -o pipefail; timeout " + pasteSeconds
      + " wl-paste --no-newline --type text" + (primary ? " --primary" : "")
      + " 2>/dev/null | head -c " + pasteMaxBytes]
    _paste.running = true
  }
  function _insertPasted(raw) {
    if (!activeFocus || readOnly) return
    var text = String(raw)
    var nul = text.indexOf("\u0000")
    if (nul >= 0) text = text.slice(0, nul)
    text = text.slice(0, pasteMaxBytes)
    if (text === "") return
    var at = cursorPosition
    if (selectedText !== "") {
      at = selectionStart
      remove(selectionStart, selectionEnd)
    }
    var before = field.text
    insert(at, text)
    // As typed: the change path (line breaks, maximumLength, validator)
    // has run; the cursor goes after what was kept.
    if (field.text !== before) {
      cursorPosition = Math.min(at + field.text.length - before.length, length)
      textEdited()
    }
  }

  function _keepCursorInView() {
    var inset = horizontalPadding + Border.left(_borderSpec)
    var view = Math.max(0, width - inset - rightPadding)
    var x = cursorRectangle.x - leftPadding
    var scroll = _scroll
    if (x < scroll) scroll = x
    else if (x + cursorRectangle.width > scroll + view) scroll = x + cursorRectangle.width - view
    _scroll = Math.max(0, Math.min(scroll, Math.max(0, contentWidth + cursorRectangle.width - view)))
  }
  onCursorRectangleChanged: _keepCursorInView()
  onWidthChanged: _keepCursorInView()

  // A change that is not allowed (a line break from a paste, too long, or
  // refused by the validator) is undone or trimmed.
  property string _lastText: ""
  property bool _fixing: false
  onTextChanged: {
    if (_fixing) return
    var clean = text.replace(new RegExp("[\\r\\n\\u2028\\u2029]+", "g"), "")
    if (!isAcceptable(clean, false)) clean = _lastText
    if (clean !== text) {
      var at = Math.min(cursorPosition, clean.length)
      _fixing = true
      text = clean
      cursorPosition = at
      _fixing = false
    }
    if (text === _lastText) return
    _lastText = text
    // A text set from outside puts the cursor at its end, as in TextInput.
    if (!activeFocus) cursorPosition = length
  }
  Component.onCompleted: _lastText = text

  // final: the whole text matches; otherwise a text on its way there
  // (empty, a sign, a number below the range) passes too, as in TextInput.
  function isAcceptable(value, final) {
    if (maximumLength > 0 && value.length > maximumLength) return false
    var v = validator
    if (!v) return true
    if (v.regularExpression !== undefined) {
      var re = v.regularExpression
      var source = re && re.source !== undefined ? re.source : String(re)
      var whole = new RegExp("^(?:" + source + ")$", re && re.flags ? re.flags.replace("g", "") : "")
      return whole.test(value) || (!final && value === "")
    }
    if (v.decimals !== undefined) {
      if (!/^[+-]?\d*([.,]\d*)?$/.test(value)) return false
      var parts = value.split(/[.,]/)
      if (parts.length > 1 && parts[1].length > v.decimals) return false
      return inRange(parseFloat(value.replace(",", ".")), v.bottom, v.top, value, final)
    }
    if (v.bottom !== undefined && v.top !== undefined) {
      if (!/^[+-]?\d*$/.test(value)) return false
      return inRange(parseInt(value, 10), v.bottom, v.top, value, final)
    }
    return true
  }
  function inRange(number, bottom, top, value, final) {
    if (/^-/.test(value) && bottom >= 0) return false
    if (isNaN(number)) return !final
    if (number > top && top >= 0) return false
    if (number < bottom && bottom < 0) return false
    return !final || (number >= bottom && number <= top)
  }

  // Qt moves the cursor to the end when a field turns editable, after a
  // click has placed it and after selectAll(): the place or the selection
  // it had while idle is restored, and the input method (fcitx and the
  // like) hears that the focused field now takes text.
  property int idleCursor: 0
  property int idleSelectionStart: 0
  property int idleSelectionEnd: 0
  onCursorPositionChanged: if (readOnly) idleCursor = cursorPosition
  onSelectionStartChanged: if (readOnly) idleSelectionStart = selectionStart
  onSelectionEndChanged: if (readOnly) idleSelectionEnd = selectionEnd
  onReadOnlyChanged: {
    if (readOnly) return
    if (idleSelectionEnd > idleSelectionStart) select(idleSelectionStart, idleSelectionEnd)
    else cursorPosition = Math.min(idleCursor, length)
    if (activeFocus) Qt.inputMethod.update(Qt.ImQueryAll)
  }
}
