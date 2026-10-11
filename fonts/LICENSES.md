# Font licences

The public bundle ships **subset WOFF2 only**, built from licensed upstream sources and shipped with
the licence text next to the files. Source binaries (`*.ttf`, `*.otf`) are not in this repository: they
added ~3.8 MB to every clone and to every visitor's directory listing, and nothing in the site
referenced them. `fonts/nwa-fonts.css` is the single consumer and lists only WOFF2.

**Every face in the bundle is under the SIL Open Font License 1.1.** The licence text and the
per-family copyright notices are in [`fonts/OFL.txt`](OFL.txt). This table is the audit record; the
values below were read out of the shipped binaries, not copied from a download page.

The two families whose licences reserve a name are **shipped under our own family names** -
`NWA Mono` and `NWA Display` - because these files are Modified Versions in OFL terms. Read
[Reserved Font Names and subsetting](#reserved-font-names-and-subsetting-ofl-condition-3) before
renaming anything back.

The table is machine-read: `scripts/verify.py` requires **one row per file**, backticked, with the
exact filename - grouped rows ("-400, -500" style) cannot be checked, and an unchecked licence record
is how the Suisse face survived as long as it did. The `Family` column is read by the same checker,
which refuses a bundled file whose recorded internal family presents an upstream Reserved Font Name.

## What is shipped

| File | Family (`name` ID 1) | Style | CSS weight | Font version | Glyphs | Bytes | Licence | Upstream face | Records kept in file |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NWA-Display-200.woff2` | NWA Display | Regular | 200 | 1.203 | 223 | 36,836 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 10, ID 14 |
| `NWA-Display-300.woff2` | NWA Display | Regular | 300 | 1.203 | 223 | 36,836 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 10, ID 14 |
| `NWA-Display-400.woff2` | NWA Display | Regular | 400 | 1.203 | 239 | 30,664 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-400-italic.woff2` | EB Garamond | Italic | italic | 1.001 | 380 | 70,020 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-400.woff2` | EB Garamond | Regular | 400 | 1.001 | 383 | 65,660 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-500-italic.woff2` | EB Garamond Medium | Italic | italic | 1.001 | 380 | 76,012 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-500.woff2` | EB Garamond Medium | Regular | 500 | 1.001 | 383 | 71,100 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-Mono-300.woff2` | NWA Mono Light | Regular (preferred family/subfamily: NWA Mono Light) | 300 | 2.3 | 248 | 17,084 | SIL OFL 1.1 | IBM Plex Mono, RFN "Plex" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-Mono-400.woff2` | NWA Mono | Regular | 400 | 2.3 | 248 | 16,940 | SIL OFL 1.1 | IBM Plex Mono, RFN "Plex" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |

Total webfont payload: **421,152 bytes** (411.3 KiB) across 9 files. `index.html` preloads three of
them - `NWA-Display-300.woff2`, `NWA-EBGaramond-400.woff2`, `NWA-Mono-300.woff2` - which is 119,580
bytes on the first-paint path.

ID 10 in the five renamed files is not upstream data: it is the provenance note added on 2026-10-11
(`NWA Mono is a subset of IBM Plex Mono (Version 2.3) …`), so that a file explains its own origin after
the rename. The OFL-FAQ recommends recording what changed; `scripts/check_font_names.py` looks for it.

Two properties of these files are worth keeping in view:

- `NWA-Display-200.woff2` and `NWA-Display-300.woff2` are **byte-identical** (same MD5): one outline is
  shipped twice, so the 200 and the 300 request render the same master, and both files are the
  *variable* upstream build (they carry `fvar`, `gvar`, `STAT`, `HVAR`) rather than a static ExtraLight
  instance. Nothing breaks, but the display face has no real 200 weight and 36 KB is duplicated. Left as
  is: repairing it means a re-subset, which is a typography change, not a licence fix.
- `NWA-Display-200.woff2` and `NWA-Display-300.woff2` carry no ID 7, 8, 9, 11, 12 or 13 records at all -
  the trademark, notice, manufacturer and licence-header fields were dropped by whoever built these
  subsets. That is not itself a breach (condition 2 accepts the notice either in machine-readable fields
  *or* as a stand-alone text file, and `fonts/OFL.txt` is that file), but it does mean the binary cannot
  be pointed at as the place the notice lives. A re-subset should keep ID 0 and ID 14 regardless, as
  the last column records.

## Conditions we have to keep meeting

SIL OFL 1.1 grants use, study, copy, merge, embed, modify, redistribute and sale, subject to five
conditions. In this repository they are met as follows - the wording of the licence is in
`fonts/OFL.txt`, which is the file that satisfies condition 2.

1. **Not sold by itself.** The fonts are part of a website, never offered as a font product. This is a
   condition we satisfy; it is **not** an exception to condition 3, and nothing below rests on it.
2. **Copyright notice + licence text accompany the fonts.** `fonts/OFL.txt` carries the OFL text and
   every upstream copyright line verbatim. Inside the binaries the records that do exist are unmodified
   (ID 0 in all nine files; ID 7/8/9/13/14 where the subset retained them - per file, in the table).
3. **Reserved Font Names.** `"Plex"` and `"Playfair Display"` are reserved, and no file we built
   presents either as its family name: the `name` records and the CSS families are `NWA Mono` and
   `NWA Display`. EB Garamond declares no Reserved Font Name upstream, so its files keep the upstream
   family name - not an exception, there is simply nothing reserved.
4. **No endorsement.** The copyright holders' names appear only as attribution for the fonts: ID 0, 7,
   8 and 9 in the files, the notices in `fonts/OFL.txt`, and this record.
5. **No re-licensing.** The faces stay under OFL 1.1. Documents produced with them (including the
   exported PDF and PNG of the Toolkit and the Contagion Engine) carry no further obligation.

## Reserved Font Names and subsetting (OFL condition 3)

Condition 3 reads: *"No Modified Version of the Font Software may use the Reserved Font Name(s) unless
explicit written permission is granted by the corresponding Copyright Holder"*, and it defines that use
as the name *"still displayed to users as part of the software, or in any material describing or
concerning such Modified Version"* - while not requiring that the "traditional author accent" (the
upstream name in author, copyright, licence and trademark records) be removed. So the question is not
whether the design was altered - it was not - but **whether these files are Modified Versions at all**.
They are, on the licence's own definition, for two independent reasons:

- a Modified Version is anything produced *"by adding to, deleting, or substituting … any of the
  original parts of the Font Software"*. Our files are subset: 248 cmap entries against a much larger
  IBM Plex Mono, 223-239 against Playfair Display. The OFL-FAQ is explicit that *"removing any parts of
  the font when delivering a web font to a browser, including unused glyphs and smart font code, is
  considered modification by the OFL"*.
- the same definition covers a derivative made *"by changing formats"*. The FAQ allows a WOFF/WOFF2
  build to escape that only when *"the original font data remains unchanged except for WOFF
  compression"* **and** WOFF metadata is *"either omitted altogether or present and includes, unaltered,
  the contents of all equivalent metadata in the original font"*. A re-encoded subset whose name table
  has lost records (see the two files above) does not meet that bar.

The FAQ then draws the conclusion for us: such a build *"would not normally allow the use of RFNs"*, and
*"you need to change the internal names of the font to your own font name when making your modified
version even if it is just a small change"*, recommending a name corresponding to the domain or the web
application. `NWA Mono` and `NWA Display` follow that recommendation, and the upstream `name` records
that carry attribution are left byte-for-byte alone, exactly as condition 3 permits.

**What would legitimately put the upstream names back**: explicit written permission from the copyright
holder - IBM for `"Plex"`, Claus Eggers Sørensen for `"Playfair Display"`. That is the only escape
clause in condition 3, and the mechanism the FAQ describes for parties trusted with separate written
agreements. Two data points that the route exists and that we are not on it:

- the Google Fonts contributor guide says Google must rename RFN families because it *"distributes a
  subsetted version [so] the font is not legally considered the same as the original one"*, and that
  keeping a name needs *"a legal agreement between the authors and Google"*, evidenced by mail from
  someone with legal authority, after which the family is added to FontBakery's exception list. That
  permission is Google's by its own terms and does not travel to a third-party site - and `Plex` is not
  in the published exception list at all.
- `IBM/plex` issue #726 asked IBM in writing for *"Permission to distribute IBM Plex in a compressed
  container under the Reserved Font Name 'Plex'"*; it was opened on 2026-09-18 and closed on
  2026-10-09 by the requester without an IBM answer. Font Squirrel, for the same reason, states that the
  Plex licence *"does not allow us to redistribute derivative versions of these webfonts without
  wholesale name changes inside and out of the font"*.

**Two arguments that were tried in this repository and do not hold**, recorded so they are not revived:
*"the font is not sold separately"* (that is condition 1) and *"the outline data is untouched"*
(condition 3 is not about outlines). A revision of this file dated the same day earlier made both claims
and asserted that the reserved names were used "only for the unmodified upstream outlines"; both were
withdrawn in favour of the renames recorded above.

**Where interpretation genuinely remains open** - the parts a lawyer or the rightsholder would settle,
stated plainly rather than argued away:

- The FAQ frames the reserved name as the one a user sees in a font menu or in material about the
  software. A `@font-face` family string is not surfaced by browsers the way an installed font's name
  is. That is the strongest argument for keeping upstream names in web subsets, and it is an argument
  about exposure, not a clause of the licence: nothing in OFL 1.1 or the FAQ grants it.
- Playfair's upstream repository now declares *"Copyright 2005–2023 The Playfair Project Authors"* with
  **no** Reserved Font Name line, while the OFL text distributed via Google Fonts and ID 0 of our own
  files both state *"with Reserved Font Name "Playfair Display""*. We read the reservation as standing -
  it is the more protective reading and our files assert it themselves - but only the author's word ends
  the question.
- The provenance of these particular subsets is not recorded in this repository: all nine files arrived
  in one tree at `3672e9f` with no build note, so it cannot be established whether their name tables
  were ever complete. That is a reason not to rely on the "compression only" exemption, not a violation
  by itself.

Renaming costs one line of CSS per face and settles all three questions; that asymmetry is why the
bundle is renamed rather than argued about. Nothing here asserts that the previous state infringed
IBM's or the Playfair authors' rights - only that keeping the names was not defensible from the licence
text, which is the standard this repository holds itself to.

## Changed and removed from the bundle

| Date | File | Family | Why |
| --- | --- | --- | --- |
| 2026-10-11 | `NWA-Mono-300.woff2`, `NWA-Mono-400.woff2` (were `NWA-IBMPlexMono-300.woff2`, `NWA-IBMPlexMono-400.woff2`) and `NWA-Display-200.woff2`, `NWA-Display-300.woff2`, `NWA-Display-400.woff2` (were `NWA-Playfair-200.woff2`, `NWA-Playfair-300.woff2`, `NWA-Playfair-400.woff2`) | NWA Mono, NWA Display (were IBM Plex Mono, Playfair Display) | **OFL condition 3.** These five files are Modified Versions - subset, re-encoded, in two cases with an incomplete name table - and a Modified Version may not use a Reserved Font Name without written permission from the copyright holder, which nobody here holds. The `name` records through which a font is presented (ID 1, 2, 3, 4, 6, 16, 17, 25) now carry the NWA names and ID 10 records the provenance; ID 0, 5, 7, 8, 9, 11, 12, 13, 14 are byte-for-byte untouched, as is everything that renders: only the `name` table and the checksum it feeds differ, `glyf`, `hmtx`, `cmap`, `OS/2`, `GSUB`/`GPOS`/`GDEF` and Playfair's `fvar`/`gvar`/`STAT`/`HVAR` are identical, and all five faces rasterise pixel-for-pixel identically at 18/40/96 px (offline fontTools+Pillow control, not a browser check). Payload +1,768 B; first-paint preload +748 B. EB Garamond is untouched: its upstream declares no Reserved Font Name, so `EB Garamond` is the lawful name for those files. |
| 2026-10-11 | `NWA-SuisseMono-400.woff2` | Suisse Int'l Mono (Swiss Typefaces Sàrl, v2.100) | **Commercial font with no licence in this repository.** The subset's own `name` records read `Copyright (c) 2013 Swiss Typefaces Sàrl. All rights reserved.` and, for the licence field, `Please refer to the license you accepted when purchasing.` No commercial web/embedding licence is held (owner decision, 2026-10-11), so the face cannot be part of a public commercial build. Monospace roles moved to the already-bundled OFL mono, which was already the stack of every other page: the commercial face actually painted on `index.html` alone (its `--mono` listed it first), while `contagion.html` (`--mono`) and `disclosures.html`, `privacy.html`, `terms.html`, `toolkit.html`, `research.html` (`--font-mono`) already resolved to it, most of those rules at weight 300. On the other eight documents Suisse survived only as a `doc.fonts.load` entry in the first-paint gate - a face those pages never applied, which is how an unused licence gap can sit in a repo unnoticed. |
| 2026-10-11 | `wila-milita.regular.otf` | Wila Milita | Embedded licence read "Free for personal use only.", which does not cover a commercial advisory site. Zero references in the repository; removed rather than licensed around. |

## Enforcement

`python3 scripts/verify.py` fails the build unless:

- no `*.ttf` / `*.otf` / `*.eot` appears anywhere in the bundle (`check_font_source_binaries`);
- every `fonts/*.woff2` present is named in a row of the table above, and every file named in the
  table exists on disk - so a font cannot be added or removed without editing this record;
- no row of the table records an *unresolved* licence ("not in this repository", "unconfirmed",
  "pending"): that is precisely the state the Suisse face sat in for months (`check_font_licences`);
- no Reserved Font Name listed in `OFL_RESERVED_FONT_NAMES` is used as a family name in
  `fonts/nwa-fonts.css` or recorded as the internal family of a shipped file, and every reservation the
  notice declares is covered by that map (`check_font_reserved_names`). `RESERVED_NAME_EXCEPTIONS` is
  the only way through, and it is for an unmodified upstream file or documented written permission.

This gate is dependency-free, so it reads the audit record and the CSS rather than parsing WOFF2. The
deep control that reads the binaries is `scripts/check_font_names.py`:

```sh
npm run check:fonts                    # or: python3 scripts/check_font_names.py
# needs fontTools + brotli; exits 1 on a violation, 2 when the dependency is missing (never 0)
```

It parses every `fonts/*.woff2`, compares each user-facing `name` record against the reservations in
`fonts/OFL.txt`, and reports the attribution records condition 2 expects, so a future re-subset that
forgets the rename - or drops ID 0 along with the rest of the metadata - fails loudly instead of
shipping.

A licence is a release gate here, not a note.

## Re-subsetting recipe

Subsetting is a build-time step, deliberately not part of the release gate:

```sh
# from a licensed source checkout, keeping latin + cyrillic coverage
pyftsubset EBGaramond-Regular.ttf \
  --unicodes="U+0020-007E,U+0400-04FF,U+2018-201F,U+2022,U+2026,U+2013-2014" \
  --flavor=woff2 --output-file=fonts/NWA-EBGaramond-400.woff2
```

Then, for a family whose licence reserves a name (IBM Plex and Playfair - not EB Garamond), set the
presented names to the NWA family and record the provenance, leaving the attribution records alone:

```py
from fontTools.ttLib import TTFont
f = TTFont("fonts/NWA-Mono-300.woff2")
for r in f["name"].names:
    if r.nameID in (1, 2, 3, 4, 6, 16, 17, 25):      # what a user can see the font called by
        r.string = str(r).replace("IBM Plex Mono", "NWA Mono").replace("IBMPlexMono", "NWAMono")
f["name"].setName("NWA Mono is a subset of IBM Plex Mono (Version 2.3) … renamed for OFL condition 3.",
                  nameID=10, platformID=3, platEncID=1, langID=0x409)
f.flavor = "woff2"
f.save("fonts/NWA-Mono-300.woff2")
```

Write output into `fonts/` only, keep sources under the ignored `fonts/_build/`, re-verify the coverage
of every character the pages actually render in mono - including the `ctx.font` strings in
`contagion.html`, which set the family name for the canvas export - update the table above, and run
`python3 scripts/verify.py` plus `scripts/check_font_names.py`.
