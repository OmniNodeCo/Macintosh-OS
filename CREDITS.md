# Credits

**Macintosh-OS** is a fan-made, non-commercial homage to the classic Apple
Macintosh and its system software: System 1.0 (1984), System 2.0 (1985),
System 3.0 (1986), System 6.0 (1988), System 7.0 (1991), Mac OS 8.0 (1997)
and Mac OS 9.0 (1999), each booting side by side. It is not affiliated
with, endorsed by, or sponsored by Apple Inc.

---

## 1. The system and the ideas

The behaviour and the look of this museum are modelled on the systems
themselves and the design language their teams invented: the menu bar that
belongs to the active application, windows with striped/ridged title bars,
desk accessories, the Trash, aliases, spring-loaded folders, contextual
menus — and a computer that says *hello* when you switch it on.

Credit and thanks for those ideas go to the people who built the original
Macintosh and its software, and in particular to **Susan Kare**, whose
1984 icon artwork, Chicago bitmap face and design vocabulary gave the
Macintosh its voice.

### Written and web sources consulted

- Apple Computer, Inc., *Macintosh* documentation (1984–1999): the
  owner's guides, Inside Macintosh, and the system software manuals.
- Susan Kare's icon work (1984), as rendered and published by the
  Smithsonian (invention.si.edu) and Milanote's "susan-kare-icons" sheet.
- EveryMac technical listings (Power Macintosh 8600/200; Power Macintosh
  G4 350 "Yikes!" PCI Graphics).
- Wikipedia: Macintosh System 1–7; Mac OS 8; Mac OS 9; Power Mac G4;
  Copland; HFS Plus; Sherlock (software); Keychain.
- MacTech 15.11 (November 1999) and contemporary Mac press for Mac OS 9
  feature descriptions.

---

## 2. The icons — official Apple artwork, per era

The icon sets in `assets/icons/` are **official Apple icon artwork** of
each system's era (requested explicitly for this museum), at 32 × 32,
converted from the sources below. Apple's icon artwork is the property of
Apple Inc., used here for study and nostalgia.

### 2.1 Original 1984 artwork — Susan Kare (`assets/icons/system-1.0/`)

Used by System 1.0, 2.0, 3.0 and 6.0. Source: **faithful renderings of
Susan Kare's original Macintosh icon artwork**, from
[github.com/thomasareed/Classic-Mac-icons](https://github.com/thomasareed/Classic-Mac-icons)
(a fan repository recreating the 1984 Finder/System icons pixel for
pixel: floppy, Trash, MacWrite, MacPaint, document, happy Macintosh and
friends). The Scrapbook clipping is sliced from a render sheet of Kare's
original artwork published by the **Smithsonian** (invention.si.edu),
recovered via a Milanote gallery render. One-bit conversions (threshold)
are ours.

### 2.2 System 7 official icons (`assets/icons/system-7.0/`)

Extracted by the **ryos** project ([github.com/bearz314/ryos](https://github.com/bearz314/ryos))
from Apple's own **Macintosh System 7.5.3** HFS disk image
([Internet Archive](https://archive.org/details/AppleMacintoshSystem753)):
the `icl8` 32 × 32 icon art pulled from the image's resource forks,
with per-file provenance in the project's `catalog.json`. Thresholded
to one bit for this museum's 512 × 342 screens (the way they looked on
the monochrome machines of the era).

### 2.3 Mac OS 8 official icons (`assets/icons/mac-os-8.0/`)

Extracted the same way (ryos, `catalog.json` provenance) from Apple's
**Mac OS 8.1 retail CD** image ("Mac OS 8 Version 8.1, 691-1912-A",
[Internet Archive](https://archive.org/details/MacOS_8_Version_8.1_691-1912-A_Apple_Computer_Inc._1998)).
Platinum gold folders, grey Trash, the Finder platinum palette.

### 2.4 Mac OS 9 official icons (`assets/icons/mac-os-9.0/`)

The 512 × 512 originals from
[github.com/bearz314/MacOS9-icons](https://github.com/bearz314/MacOS9-icons),
extracted from Mac OS 9 system software (documented at
blog.warmwolf.com, May 2020): Sherlock's folder, the Zip disk, the
suitcase and friends. Downscaled to 32 × 32 here.

### 2.5 Icons still drawn in code

A handful of icons remain drawn in code for this clone where no clean
official bitmap exists at this size: the Calculator, Puzzle, launcher
panel, credits icon, locked-name badge, MiniFinder/MultiFinder cubes,
MacroMaker, the alias-arrow badge, and the black Apple logo of 1984–88.
Aliases wear the museum's arrow badge over the official folder art, the
way the Finder drew them.

---

## 3. The typeface

Everything the museum renders is set in **MacPixelChicago**, an original
bitmap typeface made for this project (see `fonts/` and the `Bitmap`
class in each system). It is *not* Apple's Chicago, Charcoal or Geneva —
those are Apple's; ours imitates their spirit at 12 pixels.

## 4. Sound

All sounds are **synthesised in Web Audio** at run time: the startup
chime, the beep, the boing, the disk click. No Apple sounds are
included.

## 5. Code

All code in this repository was written for this project (MIT licence,
see `LICENSE`). The drawing routines, the Finder behaviours, the window
manager and the file system are original work reverse-engineered from
era documentation and behaviour, not decompiled from Apple software.

## 6. What is deliberately *not* here

- Apple's ROM images, ROM artwork, boot chimes and system fonts.
- Apple's application code of any kind.
- The Finder's exact look at the pixel level — this museum keeps its own
  drawing style for chrome while using the official icon art above.
- Submenus (the museum's menus are flat), protected memory and
  multitasking beyond the cooperative kind the era had. Mac OS 9 here is
  honestly cooperative and honestly crashable.

## 7. Trademarks

Mac, Macintosh, Mac OS, Finder, Sherlock, Keychain, MultiFinder,
MacPaint, MacWrite, Platinum, and the happy Macintosh are trademarks of
**Apple Inc.** This project is an homage for study and nostalgia, not an
Apple product, and claims no ownership of the artwork credited in §2.
