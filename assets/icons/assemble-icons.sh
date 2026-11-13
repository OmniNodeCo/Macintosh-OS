#!/bin/bash
set -e
REPO=/home/user/Macintosh-OS
RY=/home/user/iconsrc/ryos-main/public/resources/classic-mac-icon-catalogs
OS9=/home/user/iconsrc/MacOS9-icons-master/png
TA=/home/user/iconsrc/Classic-Mac-icons-main/png
SEVEN=/home/user/iconsrc/SevenIcons-master/SevenIcons
SHEET1=/home/user/Macintosh-OS/image-search/susan-kare-original-macintosh-1984-icons-1.jpg
SHEET3=/home/user/Macintosh-OS/image-search/susan-kare-original-macintosh-1984-icons-3.gif
IC=$REPO/assets/icons
mkdir -p $IC/system-1.0 $IC/system-7.0 $IC/mac-os-8.0 $IC/mac-os-9.0

# ---------- helpers ----------
# resize official color icon to 32x32 with transparency preserved
to32() { convert "$1" -resize 32x32 -unsharp 0x1 "$2"; }
# threshold official color icon to clean 1-bit for the mono museum systems
to32mono() { convert "$1" -resize 32x32 -colorspace Gray -level 15%,85% -threshold 42% -transparent white "$2"; }
# crop a cell from a photo sheet: white->transparent, threshold B/W, fit 32
slice() { # file cropW cropH offX offY out
  convert "$1" -crop "$2x$3+$4+$5" +repage -colorspace Gray -level 10%,90% -threshold 45% -transparent white -trim +repage -resize 32x32 "$6";
}

# ---------- 1) Kare-era B/W (system-1.0) from thomasareed recreations ----------
T1=$IC/system-1.0
to32 "$TA/Floppy.png" $T1/floppy.png
to32 "$TA/Trash.png" $T1/trash.png
to32 "$TA/Trash - full.png" $T1/trashFull.png
to32 "$TA/Text file.png" $T1/doc.png
to32 "$TA/Text file.png" $T1/docText.png
to32 "$TA/Paint file.png" $T1/docPaint.png
to32 "$TA/Draw file.png" $T1/draw.png
to32 "$TA/MacPaint.png" $T1/macpaint.png
to32 "$TA/MacDraw.png" $T1/macwrite.png
to32 "$TA/StyleWriter.png" $T1/printer.png
to32 "$TA/Alert.png" $T1/caution.png
to32 "$TA/Stop.png" $T1/stop.png
to32 "$TA/Watch.png" $T1/watch.png
to32 "$TA/Happy Mac.png" $T1/happyMac.png
to32 "$TA/Font suitcase.png" $T1/suitcase.png
to32 "$TA/Chooser.png" $T1/chooser.png
to32 "$TA/Sound.png" $T1/sound.png
to32 "$TA/bomb.png" $T1/bomb.png
to32 "$TA/SimpleText.png" $T1/simpletext.png

# si.edu grid slices (official Kare art renders): printer-doc + scrapbook
SW=$(identify -format %w "$SHEET3"); SH=$(identify -format %h "$SHEET3")
CW=$((SW/4)); CH=$((SH/5))
slice "$SHEET3" $((CW*8/10)) $((CH*8/10)) $((CW*2+CW/10)) $((CH*4+CH/10)) $T1/printdoc.png
slice "$SHEET3" $((CW*8/10)) $((CH*8/10)) $((CW*2+CW/10)) $((CH*2+CH/10)) $T1/scrapbook.png

# gaps: threshold official System 7.5.3 icons into 1-bit (same metaphors, mono)
to32mono "$RY/system-7/system/system-generic-folder-system.png" $T1/folder.png
to32mono "$RY/system-7/system/system-generic-folder-system.png" $T1/folderOpen.png
to32mono "$RY/system-7/system/system-resource-3982-system.png" $T1/systemfolder.png
to32mono "$RY/system-7/system/system-generic-application-system.png" $T1/app.png
to32mono "$RY/system-7/system/system-generic-control-panel-system.png" $T1/controlpanel.png
to32mono "$RY/system-7/system/system-generic-extension-system.png" $T1/extension.png
to32mono "$RY/system-7/system/system-resource-16385-system.png" $T1/clock.png
to32mono "$RY/system-7/system/system-resource-16522-system.png" $T1/bomb2.png
to32mono "$RY/system-7/control-panels/memory-calendar-control-panels.png" $T1/cdevMemory.png
to32mono "$RY/system-7/control-panels/keyboard-calendar-control-panels.png" $T1/cdevKeyboard.png
to32mono "$RY/system-7/control-panels/sound-calendar-control-panels.png" $T1/cdevSound.png
to32mono "$RY/system-7/system/system-clipboard-system.png" $T1/scrapbook2.png
to32mono "$OS9/72.png" $T1/keycaps.png
to32mono "$OS9/76.png" $T1/notepad.png
to32mono "$OS9/77.png" $T1/scrapbook3.png

# ---------- 2) System 7.0: official System 7.5.3 suite, reduced to 1 bit ----------
T7=$IC/system-7.0
to32mono "$RY/system-7/system/system-generic-folder-system.png" $T7/folder.png
to32mono "$RY/system-7/system/system-generic-folder-system.png" $T7/folderOpen.png
to32mono "$RY/system-7/system/system-resource-3982-system.png" $T7/systemfolder.png
to32mono "$RY/system-7/system/system-generic-application-system.png" $T7/app.png
to32mono "$RY/system-7/system/system-generic-document-system.png" $T7/doc.png
to32mono "$RY/system-7/system/system-generic-document-system.png" $T7/docText.png
to32mono "$RY/system-7/system/system-generic-control-panel-system.png" $T7/controlpanel.png
to32mono "$RY/system-7/system/system-generic-extension-system.png" $T7/extension.png
to32mono "$RY/system-7/system/system-trash-system.png" $T7/trash.png
to32mono "$RY/system-7/system/system-trash-system.png" $T7/trashFull.png
to32mono "$RY/system-7/system/system-apple-menu-system.png" $T7/apple.png
to32mono "$RY/system-7/system/system-resource-16385-system.png" $T7/clock.png
to32mono "$RY/system-7/system/system-clipboard-system.png" $T1/clip.png
to32mono "$RY/system-7/system/system-folder-alias-system.png" $T7/aliasFolder.png
to32mono "$RY/system-7/system/system-document-alias-system.png" $T7/aliasDoc.png
to32mono "$RY/system-7/system/system-application-alias-system.png" $T7/aliasApp.png
to32mono "$RY/system-7/control-panels/memory-calendar-control-panels.png" $T7/cdevMemory.png
to32mono "$RY/system-7/control-panels/keyboard-calendar-control-panels.png" $T7/cdevKeyboard.png
to32mono "$RY/system-7/control-panels/sound-calendar-control-panels.png" $T7/cdevSound.png
to32mono "$RY/system-7/control-panels/date-and-time-clock-control-panels.png" $T7/cdevStartup.png
to32mono "$RY/system-7/system/system-resource-16522-system.png" $T7/bomb.png
to32mono "$OS9/25.png" $T7/floppy.png
to32mono "$OS9/1.png" $T7/harddisk.png
to32mono "$OS9/4.png" $T7/cd.png
to32mono "$OS9/85.png" $T7/printer.png
to32mono "$OS9/72.png" $T7/keycaps.png
to32mono "$OS9/76.png" $T7/notepad.png
to32mono "$OS9/77.png" $T7/scrapbook.png
to32mono "$TA/Text file.png" $T7/docPaint.png
to32mono "$TA/Paint file.png" $T7/docPaint.png
to32mono "$TA/MacPaint.png" $T7/macpaint.png
to32mono "$TA/MacDraw.png" $T7/macwrite.png
to32mono "$TA/Happy Mac.png" $T7/happyMac.png

# ---------- 3) Mac OS 8.0: official Platinum suite (Mac OS 8.1 CD + Finder) ----------
T8=$IC/mac-os-8.0
S8=$RY/mac-os-8
to32 "$S8/system/system-generic-folder-system.png" $T8/folder.png
to32 "$S8/system/system-generic-folder-system.png" $T8/folderOpen.png
to32 "$S8/system/system-resource-3982-system.png" $T8/systemfolder.png
to32 "$S8/system/system-generic-application-system.png" $T8/app.png
to32 "$S8/system/system-generic-document-system.png" $T8/doc.png
to32 "$S8/system/system-generic-document-system.png" $T8/docText.png
to32 "$S8/system/system-generic-control-panel-system.png" $T8/controlpanel.png
to32 "$S8/system/system-generic-extension-system.png" $T8/extension.png
to32 "$S8/finder/finder-resource-25013-finder.png" $T8/trash.png
to32 "$S8/finder/finder-resource-25013-finder.png" $T8/trashFull.png
to32 "$S8/system/system-apple-menu-system.png" $T8/apple.png
to32 "$S8/finder/finder-resource-25012-finder.png" $T8/clock.png
to32 "$S8/finder/finder-resource-25014-finder.png" $T8/printer.png
to32 "$S8/finder/finder-resource-25015-finder.png" $T8/stop.png
to32 "$S8/finder/finder-resource-7203-finder.png" $T8/caution.png
to32 "$S8/system/system-folder-alias-system.png" $T8/aliasFolder.png
to32 "$S8/system/system-document-alias-system.png" $T8/aliasDoc.png
to32 "$S8/system/system-application-alias-system.png" $T8/aliasApp.png
to32 "$S8/applications/simpletext-resource-128-applications.png" $T8/simpletext.png
to32 "$S8/control-panels/startup-disk-calendar-control-panels.png" $T8/cdevStartup.png
to32 "$S8/control-panels/appletalk-resource-128-control-panels.png" $T8/cdevMemory.png
to32 "$OS9/25.png" $T8/floppy.png
to32 "$OS9/1.png" $T8/harddisk.png
to32 "$OS9/4.png" $T8/cd.png
to32 "$OS9/72.png" $T8/keycaps.png
to32 "$OS9/76.png" $T8/notepad.png
to32 "$OS9/77.png" $T8/scrapbook.png
to32 "$OS9/26.png" $T8/note.png

# ---------- 4) Mac OS 9.0: official Mac OS 9 suite ----------
T9=$IC/mac-os-9.0
to32 "$OS9/1.png" $T9/harddisk.png
to32 "$OS9/2.png" $T9/extdisk.png
to32 "$OS9/25.png" $T9/floppy.png
to32 "$OS9/4.png" $T9/cd.png
to32 "$OS9/90.png" $T9/zip.png
to32 "$OS9/24.png" $T9/folder.png
to32 "$OS9/24.png" $T9/folderOpen.png
to32 "$OS9/32.png" $T9/systemfolder.png
to32 "$OS9/38.png" $T9/controlpanel.png
to32 "$OS9/79.png" $T9/doc.png
to32 "$OS9/92.png" $T9/docText.png
to32 "$OS9/7.png" $T9/trash.png
to32 "$OS9/6.png" $T9/trashFull.png
to32 "$OS9/72.png" $T9/keycaps.png
to32 "$OS9/76.png" $T9/notepad.png
to32 "$OS9/77.png" $T9/scrapbook.png
to32 "$OS9/85.png" $T9/printer.png
to32 "$OS9/20.png" $T9/clipboard.png
to32 "$OS9/41.png" $T9/suitcase.png
to32 "$OS9/64.png" $T9/mic.png
to32 "$OS9/50.png" $T9/ram.png
to32 "$OS9/26.png" $T9/note.png
to32 "$OS9/67.png" $T9/startdisk.png
to32 "$OS9/12.png" $T9/sherlockFolder.png
to32 "$S8/applications/simpletext-resource-128-applications.png" $T9/simpletext.png
to32 "$S8/system/system-generic-application-system.png" $T9/app.png
to32 "$S8/system/system-generic-extension-system.png" $T9/extension.png
to32 "$S8/system/system-apple-menu-system.png" $T9/apple.png
to32 "$S8/system/system-folder-alias-system.png" $T9/aliasFolder.png
to32 "$S8/system/system-document-alias-system.png" $T9/aliasDoc.png
to32 "$S8/system/system-application-alias-system.png" $T9/aliasApp.png
to32 "$S8/finder/finder-resource-25012-finder.png" $T9/clock.png
to32 "$S8/finder/finder-resource-7203-finder.png" $T9/caution.png
to32 "$TA/Happy Mac.png" $T9/happyMac.png

echo "counts:"; for d in system-1.0 system-7.0 mac-os-8.0 mac-os-9.0; do echo "$d $(ls $IC/$d | wc -l)"; done
