import QtQuick
import qs.Ui

// Every text field of the plugin: the kit's TextField, read-only while it
// has no keyboard focus. Qt asks the clipboard whether it holds text for
// each editable field whenever it changes (QQuickTextInput's canPaste, only
// the offered formats, skipped when read-only); its data is read only by
// paste(), so only when you paste into the focused field. Use this instead
// of TextField, TextInput or TextEdit (tests/text-fields.test.mjs).
TextField {
  readOnly: !activeFocus

  // Qt moves the cursor to the end when a field turns editable, after a
  // click has placed it and after selectAll(): the place or the selection
  // it had while idle is restored.
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
  }
}
