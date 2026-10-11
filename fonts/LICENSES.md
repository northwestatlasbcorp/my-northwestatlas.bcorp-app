# Font licences

The public bundle ships **subset WOFF2 only**, built from licensed upstream sources and shipped with
the licence text next to the files. Source binaries (`*.ttf`, `*.otf`) are not in this repository: they
added ~3.8 MB to every clone and to every visitor's directory listing, and nothing in the site
referenced them. `fonts/nwa-fonts.css` is the single consumer and lists only WOFF2.

**Every face in the bundle is under the SIL Open Font License 1.1.** The licence text and the
per-family copyright notices are in [`fonts/OFL.txt`](OFL.txt). This table is the audit record; the
values below were read out of the shipped binaries, not copied from a download page.

The two families whose licences reserve a name are **shipped under our own family names** - `NWA Mono`
and `NWA Serif` - because these files are Modified Versions in OFL terms and because what a reservation
covers is the name's individual words, not only the whole phrase. Read
[Reserved Font Names and subsetting](#reserved-font-names-and-subsetting-ofl-condition-3) before renaming
anything back.

The table is machine-read: `scripts/verify.py` requires **one row per file**, backticked, with the
exact filename - grouped rows ("-400, -500" style) cannot be checked, and an unchecked licence record
is how the Suisse face survived as long as it did. The `Family` column is read by the same checker, which
refuses a bundled file whose recorded internal family, whose CSS family or whose file name reuses an
upstream Reserved Font Name *or an individual word of one* (OFL-FAQ 5.4).

## What is shipped

| File | Family (`name` ID 1) | Style | CSS weight | Font version | Glyphs | Bytes | Licence | Upstream face | Records kept in file |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NWA-Serif-200.woff2` | NWA Serif | Regular | 200 | 1.203 | 223 | 36,936 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 10, ID 14 |
| `NWA-Serif-300.woff2` | NWA Serif | Regular | 300 | 1.203 | 223 | 36,936 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 10, ID 14 |
| `NWA-Serif-400.woff2` | NWA Serif | Regular | 400 | 1.203 | 239 | 30,672 | SIL OFL 1.1 | Playfair Display, RFN "Playfair Display" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-400-italic.woff2` | EB Garamond | Italic | italic | 1.001 | 380 | 70,020 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-400.woff2` | EB Garamond | Regular | 400 | 1.001 | 383 | 65,660 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-500-italic.woff2` | EB Garamond Medium | Italic | italic | 1.001 | 380 | 76,012 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-EBGaramond-500.woff2` | EB Garamond Medium | Regular | 500 | 1.001 | 383 | 71,100 | SIL OFL 1.1 | EB Garamond, no RFN declared | ID 0, ID 5, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-Mono-300.woff2` | NWA Mono Light | Regular (preferred family/subfamily: NWA Mono Light) | 300 | 2.3 | 248 | 17,084 | SIL OFL 1.1 | IBM Plex Mono, RFN "Plex" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |
| `NWA-Mono-400.woff2` | NWA Mono | Regular | 400 | 2.3 | 248 | 16,940 | SIL OFL 1.1 | IBM Plex Mono, RFN "Plex" | ID 0, ID 5, ID 7, ID 8, ID 9, ID 11, ID 12, ID 13, ID 14 |

Total webfont payload: **421,360 bytes** (411.5 KiB) across 9 files. `index.html` preloads three of them
- `NWA-Serif-300.woff2`, `NWA-EBGaramond-400.woff2`, `NWA-Mono-300.woff2` - which is 119,680 bytes on the
first-paint path. The second rename is the whole difference: +208 bytes in the bundle and +100 bytes on
the first paint, because a longer family name is longer once it is written into the `name` table. Nothing
that renders changed - only the `name` table and the `head` checksum differ from the previous build, and
the three faces rasterise pixel-for-pixel identically at 18, 40 and 96 px.

ID 10 in the five renamed files is not upstream data: it is the provenance note added on 2026-10-11
(`NWA Serif is a subset of Playfair Display (Version 1.203) …`, `NWA Mono is a subset of IBM Plex Mono
(Version 2.3) …`), so that a file explains its own origin after the rename - including, in the display
files, why the name had to be changed twice. The OFL-FAQ recommends recording what changed;
`scripts/check_font_names.py` looks for it.

Two properties of these files are worth keeping in view:

- `NWA-Serif-200.woff2` and `NWA-Serif-300.woff2` are **byte-identical** to each other, after the rename
  as before it (the third row of the change log records the check): one outline is shipped twice, so the
  200 and the 300 request render the same master, and both files are the *variable* upstream build (they
  carry `fvar`, `gvar`, `STAT`, `HVAR`) rather than a static ExtraLight instance. Nothing breaks, but the
  display face has no real 200 weight and 36 KB is duplicated. Left as is: repairing it means a
  re-subset, which is a typography change, not a licence fix.
- `NWA-Serif-200.woff2` and `NWA-Serif-300.woff2` carry no ID 7, 8, 9, 11, 12 or 13 records at all -
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
   presents either of them - or an individual word of either - as its own name: the `name` records, the
   CSS families and the file names are `NWA Mono` and `NWA Serif`. EB Garamond declares no Reserved Font
   Name upstream, so its files keep the upstream family name - not an exception, there is simply nothing
   reserved.
4. **No endorsement.** The copyright holders' names appear only as attribution for the fonts: ID 0, 7,
   8 and 9 in the files, the notices in `fonts/OFL.txt`, and this record.
5. **No re-licensing.** The faces stay under OFL 1.1. Documents produced with them (including the
   exported PDF and PNG of the Toolkit and the Contagion Engine) carry no further obligation.

## Reserved Font Names and subsetting (OFL condition 3)

Condition 3 reads, in full: *"No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This
restriction only applies to the primary font name as presented to the users."* The sentence that follows
the restriction is its own limit: the reserved name is the **primary font name as presented to the
users**, which is why the rename is applied to every `name` record through which a font is called by -
IDs 1, 2, 3, 4, 6, 16, 17 and 25 - and not to ID 0, 7, 8, 9, 11, 12, 13 or 14, which are the copyright,
trademark, notice, manufacturer and licence fields. Condition 4 asks for the author's name in
acknowledgements, so leaving those records alone is required, not merely permitted. Two earlier revisions
of this file quoted *"still displayed to users as part of the software"*, *"traditional author accent"*
and *"original parts of the Font Software"* as if they came from OFL 1.1; they do not - they are wording
from OFL 1.0 and from secondary commentary, and the `grep` for each of them in `fonts/OFL.txt` returns
nothing. The quotation above is the file in this repository.

So the question is not whether the design was altered - it was not - but **whether these files are
Modified Versions at all**. They are, on the licence's own definition, for two independent reasons:

- the licence defines a Modified Version as *"any derivative made by adding to, deleting, or
  substituting -- in part or in whole -- any of the components of the Original Version, by changing
  formats or by porting the Font Software to a new environment"*, and the preamble says the fonts may be
  redistributed *"provided that any reserved names are not used by derivative works"*. Our files are
  subset: 248 cmap entries against a much larger IBM Plex Mono, 223-239 against Playfair Display.
  OFL-FAQ 2.6 states the consequence for web delivery directly: *"Removing any parts of the font when
  delivering a web font to a browser, including unused glyphs and smart font code, is considered
  modification. This is permitted by the OFL but would not normally allow the use of RFNs."*
- the same definition covers a derivative made *"by changing formats"*. The FAQ allows a WOFF/WOFF2
  build to escape that only when *"the original font data remains unchanged except for WOFF
  compression"* **and** WOFF metadata is *"either omitted altogether or present and includes, unaltered,
  the contents of all equivalent metadata in the original font"*. A re-encoded subset whose name table
  has lost records (see the two files above) does not meet that bar.

OFL-FAQ 2.2 draws the conclusion for a format change: where *"[t]he original font data or metadata is
changed, or the WOFF-specific metadata is incomplete, the font must be considered a Modified Version, the
OFL restrictions would apply and the name of the font must be changed: any RFNs cannot be used"*. `NWA
Mono` and `NWA Serif` follow that instruction, and the upstream `name` records that carry attribution are
left byte-for-byte alone, exactly as condition 3 permits.

### The one exception the FAQ does grant, and why these files do not qualify

It is worth stating the allowance precisely, because it is the only place in the FAQ where a webfont may
keep a reserved name, and it is narrower than "we only converted the format". OFL-FAQ 2.2: *"You are
allowed to create, use and distribute a WOFF version of an OFL font without changing the font name, but
only if the original font data remains unchanged except for WOFF compression, and WOFF-specific metadata
is either omitted altogether or present and includes, unaltered, the contents of all equivalent metadata
in the original font."* OFL-FAQ 2.7 extends that to optimization of any kind: *"If a webfont is optimized
only in ways that preserve Functional Equivalence (see 2.8), then it may use RFNs, as it reasonably
represents the Original Version"*. Functional Equivalence requires that the result *"Preserves original
author, project and license metadata"*, including at a minimum copyright and authorship, the licence as
stated in the Original Version, **any RFN declarations**, and a link back to the original project. The
same entry adds that *"Some newer subsetting technologies may be able to subset in a way that allows users
to effectively have access to the complete font, including smart font behaviour"* - and the
"Webfonts and Reserved Font Names" page that expands on it records the converse explicitly: *"Removal,
abbreviation or replacement of metadata may be in violation of the terms of the OFL, and even when OFL
terms are met, the font would not meet the requirements for FE, so the font would need to be considered a
Modified Version for which RFN restrictions apply."*

Our nine files fail that test on two independent counts, which is why the bundle is renamed rather than
argued about:

- **the two variable display files are missing attribution records.** `NWA-Serif-200.woff2` and
  `NWA-Serif-300.woff2` carry ID 0, 1, 2, 3, 4, 5, 6, 10, 14 and the axis records 256-270, and nothing
  else: ID 7, 8, 9, 11, 12, 13 and 16, 17, 25 - trademark, notice, manufacturer, licence description and
  the typographic family pair - are absent from the binaries we inherited, and their provenance is
  unrecorded, so it cannot be established that the removal was ever complete or accurate. 2.2.2
  anticipates exactly this: *"most WOFF conversion tools and online services do not meet the two
  requirements listed above, and so their output must be considered a Modified Version."*
- **no file in the bundle is functionally complete.** Each face covers 223 to 248 codepoints where the
  upstream builds cover thousands. The variable axes do survive in the 200 and 300 files (`fvar`, `gvar`,
  `STAT`, `HVAR` are present), so the *behaviour* is largely there, and the 400 file plus both mono files
  keep the attribution set that ID 0, 5, 7, 8, 9, 11, 12, 13, 14 make up. What no file preserves is
  completeness: a reader of these files cannot reach the font the upstream project distributes, which is
  the requirement 2.7 and its "Functional Equivalence" page set ("whether the resulting font preserves the
  completeness, behavior, quality and metadata of the original").

So there is an exception in the FAQ, it is documented, and it is not available to this bundle: for the two
variable files on both counts, for the other seven on completeness alone. That is a stronger position than
"the licence grants nothing", and it is why the metadata fields were left exactly as they were found - an
FE argument has to be made with the original records intact, and dropping them forecloses the argument.
`scripts/check_font_names.py` therefore requires the attribution record condition 2 expects (ID 0) and our
own provenance note (ID 10) in every file we built, and it compares **every platform's copy** of each
presenting record rather than the one this system happens to prefer, because a rename that fixes the Windows
record and leaves the Macintosh twin behind is the failure mode to watch for.

### An individual word of a reserved name is reserved too

Renaming `Playfair Display` to `NWA Display` was not enough, and the reason is in the FAQ rather than in
the licence body. OFL-FAQ 5.4 is unambiguous about the scope of a reservation: *"You may not use
individual words from the Reserved Font Names, but you would be allowed to use parts of words, as long as
you do not use any word from the Reserved Font Names entirely."* A subset that presented itself as
`NWA Display` used the word `Display`, and `Display` is one of the two words the Playfair notice reserves
in ID 0 of our own files. That is why the display faces were renamed again on 2026-10-11 to `NWA Serif`,
which is neither the full phrase nor a word of it.

Three consequences, and the limits of this reasoning:

- 5.1 describes a reservation as covering names *"or portions of font names"*, and 5.5 advises authors to
  declare a single distinctive word (`Foobar Sans` -> reserve `Foobar`) precisely so that generic terms
  stay free. Our Playfair files carry the two-word declaration `Playfair Display`, so **both** words are
  covered by 5.4. 5.5 is advice to the declaring author about what to reserve; it is not permission for a
  third party to read somebody else's declaration down to whichever word looks generic. Only IBM (for
  `Plex`) and Claus Eggers Sørensen (for `Playfair Display`) can narrow what they declared.
- Because the rule is about declared names, it must not become a ban on vocabulary. The checker does not
  hold a list of typographic terms: `Serif`, `Sans`, `Text`, `Caption` and the like are unrestricted,
  because no licence in this bundle reserves them, while `Display` is restricted *only* because
  `"Playfair Display"` is the reservation these particular files ship with. Rename a face and the word
  becomes free again - it is the collision that is policed, not the dictionary.
- The other half of 5.4 is equally binding on us, in the authors' favour: *parts* of words are allowed. A
  near-homophone (`Playfard`) is therefore not a licence violation, and the checker does not pretend
  otherwise; OFL-FAQ 5.2 asks a renaming project to *avoid names that "reuse almost all the same letters
  in the same order, or sound like the original"*, but that is guidance to whoever chooses a name, not a
  property a gate can decide for a family it has never seen. The same reading is why the name tables of
  `IBM Plex Mono` files are left alone: their reservation is the single word `Plex`, and `NWA Mono`
  contains neither it nor a fragment of it.

**What would legitimately put the upstream names back**: explicit written permission from the copyright
holder - IBM for `"Plex"`, Claus Eggers Sørensen for `"Playfair Display"`. It is also the only route to
keeping a *word* of a reservation: an author re-declaration that narrowed `Playfair Display` to
`Playfair` alone would free `Display` (and OFL-FAQ 5.5 recommends exactly that style), but it is an act of
the copyright holder, not of a downstream user. The FAQ describes the mechanism for parties trusted with
separate written agreements, and says plainly that *"there should be a separate agreement in writing
between the two parties"*; the RFN cannot be removed by whoever redistributes the font. Two data points
that the route exists and that we are not on it:

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

**Four arguments that were tried in this repository and do not hold**, recorded so they are not revived:

- *"the font is not sold separately"* - that is condition 1, which says nothing about condition 3;
- *"the outline data is untouched"* - condition 3 is not about outlines, and a subset is a Modified
  Version on the licence's own definition;
- *"we kept the full reserved phrase out of the name, only the words inside it overlap"* - 5.4 forbids
  the individual words too, and this is the correction that produced `NWA Serif`;
- *"a WOFF2 container is the same font, so the name may stay"* - 2.2 says the opposite whenever the font
  data or the metadata changed, and the provenance of these files cannot be checked, because all nine
  arrived in one tree at `3672e9f` with no build note.

A revision of this file dated the same day earlier made the first two claims and asserted that the
reserved names were used "only for the unmodified upstream outlines"; both were withdrawn in favour of the
renames recorded above.

**Where interpretation genuinely remains open** - the parts a lawyer or the rightsholder would settle,
stated plainly rather than argued away:

- The restriction is on the primary font name *as presented to the users*. Whether a `@font-face`
  family string is presented at all is a real question: a browser never shows it, while an installed font
  announces itself in every menu - and, for a webfont whose family is reused in a `ctx.font` canvas string
  or in a PDF print-out, it arguably is. That is the strongest argument for keeping an upstream name in a
  web subset, and it is an argument about exposure, not a clause of the licence: the FAQ's only concession
  to web delivery is the Functional Equivalence test above (2.2, 2.7, 2.8), which is about metadata and
  completeness rather than about how visible the name is, and 2.6 counts subsetting as modification
  instead of excusing it.
- Whether `Plex` is one word or the abbreviation of `IBM Plex Mono` cuts the other way for us, not for
  the checker. 5.4 is about *individual words*, and `NWA Mono` matches no declared word of the IBM
  reservation, so the mono files keep the shorter name they were given in the first rename. `NWA Plex
  Mono` would fail the same rule; nothing here claims a right to that name.
- Playfair's upstream repository now declares *"Copyright 2005–2023 The Playfair Project Authors"* with
  **no** Reserved Font Name line, while the OFL text distributed via Google Fonts and ID 0 of our own
  files both state *"with Reserved Font Name "Playfair Display""*. We read the reservation as standing -
  it is the more protective reading and our files assert it themselves - but only the author's word ends
  the question. The same divergence runs the other way for EB Garamond, whose upstream declares nothing
  reserved and whose name is therefore kept.
- The provenance of these particular subsets is not recorded in this repository: all nine files arrived
  in one tree at `3672e9f` with no build note, so it cannot be established whether their name tables
  were ever complete. That is a reason not to rely on the "compression only" exemption, not a violation
  by itself.

Renaming costs one line of CSS per face and settles the questions that have no third-party answer; that
asymmetry is why the bundle is renamed rather than argued about. Nothing here asserts that the previous
state infringed IBM's or the Playfair authors' rights - only that keeping the names, or keeping a word of
them, was not defensible from the licence text and FAQ as they read here, which is the standard this
repository holds itself to.

## Changed and removed from the bundle

| Date | File | Family | Why |
| --- | --- | --- | --- |
| 2026-10-11 | `NWA-Serif-200.woff2`, `NWA-Serif-300.woff2`, `NWA-Serif-400.woff2` (were `NWA-Display-200.woff2`, `NWA-Display-300.woff2`, `NWA-Display-400.woff2` earlier the same day) | NWA Serif (were NWA Display, before that Playfair Display) | **OFL condition 3 read together with OFL-FAQ 5.4.** The first rename removed the full reserved phrase `"Playfair Display"` but kept the individual word `Display`, and 5.4 states that *"you may not use individual words from the Reserved Font Names"*. Name records ID 1, 3, 4, 6 (and ID 25 in the 400 file) were rewritten and the ID 10 note now names the clause; ID 0, 2, 5, 7, 8, 9, 11, 12, 13, 14 are untouched - ID 2 already read `Regular`. Nothing that renders moved: the only tables that differ from the previous build are `name` and the `head` checksum that the name table feeds, while `hmtx`, `cmap`, `OS/2`, `GSUB`, `GPOS`, `GDEF`, `fvar`, `gvar`, `STAT` and `HVAR` are byte-identical, the glyph counts (315/315/469), units per em (1000), `usWeightClass` (400), ascender/descender (1082/-251) and every per-codepoint advance match, and all 223/223/239 covered codepoints rasterise pixel-for-pixel identically at 18, 40 and 96 px (offline fontTools+Pillow control, not a browser check). `NWA-Serif-200.woff2` and `NWA-Serif-300.woff2` are still byte-identical to each other. Payload 421,152 -> 421,360 B (+208 B, all of it the longer name strings); the first-paint preload grows by 100 B. The mono files keep their shorter `NWA Mono` name, because the IBM reservation is the single word `"Plex"`, which that name does not contain. `scripts/verify.py` and `scripts/check_font_names.py` now match words, not only whole phrases, so this regression cannot come back silently. |
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
  `fonts/nwa-fonts.css`, recorded as the internal family of a shipped file, or carried in one of the file
  names - and no *individual word* of such a name appears as a whole word of any of those either, which is
  the rule OFL-FAQ 5.4 states (`check_font_reserved_names`). The rule is scoped to what these licences
  actually declare, so ordinary typographical terms that nobody here reserves (`Serif`, `Sans`, `Text`,
  `Caption`) stay free, and a fragment of a reserved word is not policed because 5.4 allows parts of
  words; a reserved phrase with its space deleted *is* caught, because removing a space is not a rename.
  Every reservation the notice declares must be covered by the map. `RESERVED_NAME_EXCEPTIONS` is the only
  way through, and it is for an unmodified upstream file or documented written permission.

This gate is dependency-free, so it reads the audit record, the CSS and the file names rather than
parsing WOFF2. The deep control that reads the binaries is the same rule applied at the source:
`scripts/check_font_names.py`.

```sh
npm run check:fonts                    # or: python3 scripts/check_font_names.py
# needs fontTools + brotli; exits 1 on a violation, 2 when the dependency is missing (never 0)
# --quiet prints findings only; --fonts DIR checks another directory (used on pre-rename copies)
```

CI runs this on every pull request as the `check-fonts` job in `.github/workflows/verify.yml`, with
`fonttools==4.66.1` and `brotli==1.2.0` pinned - the versions this audit was performed with - while the
dependency-free gate above keeps its own pip-free job.

It parses every `fonts/*.woff2`, compares each user-facing `name` record and each file name against the
reservations in `fonts/OFL.txt` using `rfn_findings` from `scripts/verify.py` - shared code, not a second
opinion copy-pasted, so the two controls cannot drift - and reports the attribution records condition 2
expects, so a future re-subset that forgets the rename, or drops ID 0 along with the rest of the metadata,
fails loudly instead of shipping. Run against the pre-rename binaries it reports the `Display` collisions
it was written for; run against this tree it prints PASS.

A licence is a release gate here, not a note.

## Re-subsetting recipe

Subsetting is a build-time step, deliberately not part of the release gate:

```sh
# from a licensed source checkout, keeping latin + cyrillic coverage
pyftsubset EBGaramond-Regular.ttf \
  --unicodes="U+0020-007E,U+0400-04FF,U+2018-201F,U+2022,U+2026,U+2013-2014" \
  --flavor=woff2 --output-file=fonts/NWA-EBGaramond-400.woff2
```

Then decide the name. A subset is a Modified Version, so the presented name must avoid the reservation
**and every individual word of it** - OFL-FAQ 5.4 - which is why the display files are `NWA Serif` and not
`NWA Display`. Keep every `name` record upstream if you want the option of arguing Functional
Equivalence under 2.7 one day - and rewrite each record on **every** platform, since a rename that updates
only the Windows copy leaves the Macintosh twin presenting the old family. For a family
whose licence reserves a name (IBM Plex and Playfair - not EB Garamond), set the presented names to the NWA
family and record the provenance, leaving the attribution records alone:

```py
from fontTools.ttLib import TTFont
f = TTFont("fonts/NWA-Serif-200.woff2")
for r in f["name"].names:                            # rewrite in place; setName would leave a twin behind
    if r.nameID in (1, 2, 3, 4, 6, 16, 17, 25):      # the records through which a font is called by
        s = (str(r).replace("Playfair Display", "NWA Serif").replace("PlayfairDisplay", "NWASerif")
             .replace("Playfair", "NWA").replace("Display", "Serif"))
        assert "Playfair" not in s and "Display" not in s, (r.nameID, s)   # never trust a sweep
        r.string = s
f["name"].setName("NWA Serif is a subset of Playfair Display (Version 1.203) … renamed for OFL condition"
                  " 3 and OFL-FAQ 5.4.", nameID=10, platformID=3, platEncID=1, langID=0x409)
f.flavor = "woff2"                                   # the container this bundle ships
f.save("fonts/NWA-Serif-200.woff2")                  #   straight from a font whose flavour is set
```

`setName` is deliberately absent above: it *adds* a record for one platform and leaves the Windows twin of
an existing ID untouched, so a rename done that way still presents the old name on some systems - exactly
the drift the ID 10 note exists to prevent. Enumerate `f["name"].names` and rewrite every record of the
ID, then read the saved file back and assert the result: that re-read is what a browser effectively does
with its own copy of the family string, and it is the only place a half-renamed face shows up. Renaming the file on disk is part of the
same change: the gate treats `fonts/*.woff2` basenames as a presented name, so the old `NWA-Display-*`
spelling has to disappear with it.

Write output into `fonts/` only, keep sources under the ignored `fonts/_build/`, re-verify the coverage of
every character the pages actually render in mono or display - including the `ctx.font` strings in
`contagion.html` and `toolkit.html`, which set the family name for the canvas export - update the table
above, and run `python3 scripts/verify.py` plus `scripts/check_font_names.py`.
