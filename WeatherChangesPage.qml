import QtQuick
import Quickshell.Io
import qs.Commons
import "Changelog.js" as Changelog

// Settings page "What's new": the plugin's own CHANGELOG.md (read when the
// page opens, Changelog.parse), one card per version, newest first; the
// first three open, older ones behind "Show older versions".
Column {
  id: changesPage
  required property var panel
  property bool kbFocused: false
  property bool showOlder: false
  width: parent ? parent.width : 0
  spacing: Style.space(12)

  readonly property int shownCount: 3
  property var versions: []
  property bool loaded: false
  property bool missing: false
  property string installedVersion: ""

  function pluginFile(name) {
    return decodeURIComponent(String(Qt.resolvedUrl(name)).replace(/^file:\/\//, ""))
  }

  // Read again each time the page opens (the plugin may have been updated).
  onVisibleChanged: if (visible) reload()
  Component.onCompleted: if (visible) reload()
  function reload() {
    loaded = false
    missing = false
    logFile.path = ""
    logFile.path = pluginFile("CHANGELOG.md")
    manifestFile.path = ""
    manifestFile.path = pluginFile("manifest.json")
  }

  FileView {
    id: logFile
    printErrors: false
    onLoaded: {
      changesPage.versions = Changelog.parse(text())
      changesPage.missing = changesPage.versions.length === 0
      changesPage.loaded = true
    }
    onLoadFailed: {
      changesPage.versions = []
      changesPage.missing = true
      changesPage.loaded = true
    }
  }
  FileView {
    id: manifestFile
    printErrors: false
    onLoaded: {
      try {
        changesPage.installedVersion = String(JSON.parse(text()).version || "")
      } catch (error) {
        console.warn("more-weather: manifest.json unreadable:", error)
      }
    }
  }

  readonly property var shownVersions: showOlder ? versions : versions.slice(0, shownCount)
  readonly property bool hasOlder: versions.length > shownCount && !showOlder

  // The log stays English.
  Text {
    textFormat: Text.PlainText
    visible: changesPage.panel.interfaceLanguage !== "en"
    width: parent.width
    text: changesPage.panel.i18n("changesEnglishNote")
    color: changesPage.panel.mutedText
    font.family: changesPage.panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    wrapMode: Text.WordWrap
  }

  Text {
    textFormat: Text.PlainText
    visible: changesPage.loaded && changesPage.missing
    width: parent.width
    text: changesPage.panel.i18n("changesNone")
    color: changesPage.panel.mutedText
    font.family: changesPage.panel.fontFamily
    font.pixelSize: Style.font.bodySmall
    wrapMode: Text.WordWrap
  }

  Repeater {
    model: changesPage.shownVersions

    Rectangle {
      id: versionCard
      required property var modelData
      readonly property bool installed: !modelData.unreleased && modelData.version === changesPage.installedVersion
      width: changesPage.width
      height: versionContent.implicitHeight + Style.space(20)
      radius: Style.cornerRadius
      color: "transparent"
      border.color: changesPage.panel.subtleText
      border.width: Style.spacing.hairline

      Column {
        id: versionContent
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Style.space(10)
        spacing: Style.space(6)

        Item {
          width: parent.width
          height: versionTitle.implicitHeight

          Text {
            id: versionTitle
            textFormat: Text.PlainText
            anchors.left: parent.left
            anchors.right: installedTag.left
            anchors.rightMargin: Style.space(8)
            text: versionCard.modelData.unreleased ? changesPage.panel.i18n("changesUnreleased")
              : versionCard.modelData.version + (versionCard.modelData.date ? " · " + versionCard.modelData.date : "")
            color: changesPage.panel.foreground
            font.family: changesPage.panel.fontFamily
            font.pixelSize: Style.font.bodySmall
            font.bold: true
            elide: Text.ElideRight
          }
          Text {
            id: installedTag
            textFormat: Text.PlainText
            anchors.right: parent.right
            anchors.verticalCenter: versionTitle.verticalCenter
            visible: versionCard.installed
            width: visible ? implicitWidth : 0
            text: changesPage.panel.upperLabel(changesPage.panel.i18n("changesCurrent"))
            color: Color.accent
            font.family: changesPage.panel.fontFamily
            font.pixelSize: Style.font.caption
            font.bold: true
          }
        }

        Repeater {
          model: versionCard.modelData.items

          Column {
            id: changeItem
            required property var modelData
            width: versionContent.width
            spacing: Style.space(2)

            Text {
              textFormat: Text.PlainText
              visible: changeItem.modelData.title !== ""
              width: parent.width
              text: changeItem.modelData.title
              color: changesPage.panel.foreground
              font.family: changesPage.panel.fontFamily
              font.pixelSize: Style.font.bodySmall
              wrapMode: Text.WordWrap
            }
            Text {
              textFormat: Text.PlainText
              visible: changeItem.modelData.text !== ""
              width: parent.width
              text: changeItem.modelData.text
              color: changesPage.panel.mutedText
              font.family: changesPage.panel.fontFamily
              font.pixelSize: Style.font.caption
              wrapMode: Text.WordWrap
            }
          }
        }
      }
    }
  }

  WeatherButton {
    id: olderButton
    visible: changesPage.hasOlder
    panel: changesPage.panel
    label: changesPage.panel.i18n("changesShowOlder")
    kbFocused: changesPage.kbFocused
    onActivated: changesPage.showOlder = true
  }
  function pressOlder() { if (hasOlder) olderButton.press() }
}
