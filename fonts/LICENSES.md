# Font licences

The public bundle ships **subset WOFF2 only**, built from licensed upstream sources and shipped
with the licence text next to the files. Source binaries (`*.ttf`, `*.otf`) are not in this
repository: they added ~3.8 MB to every clone and to every visitor's directory listing, and nothing
in the site referenced them. `fonts/nwa-fonts.css` is the single consumer and lists only WOFF2.

**Every face in the bundle is under the SIL Open Font License 1.1.** The licence text and the
per-family copyright notices are in [`fonts/OFL.txt`](OFL.txt). This table is the audit record; the
values below were read out of the shipped binaries, not copied from a download page.

The table is machine-read: `scripts/verify.py` requires **one row per file**, backticked, with the
exact filename - grouped rows ("`-400`, `-500`") cannot be checked, and an unchecked licence record is
how the Suisse face survived as long as it did.

## What is shipped

| File | Family (`name` ID 1) | Style | CSS weight | Font version | Glyphs | Bytes | Licence | Records kept in file |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NWA-EBGaramond-400-italic.woff2` | EB Garamond | Italic | italic | 1.001 | 380 | 70,020 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-EBGaramond-400.woff2` | EB Garamond | Regular | 400 | 1.001 | 383 | 65,660 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-EBGaramond-500-italic.woff2` | EB Garamond Medium | Italic | italic | 1.001 | 380 | 76,012 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-EBGaramond-500.woff2` | EB Garamond Medium | Regular | 500 | 1.001 | 383 | 71,100 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-IBMPlexMono-300.woff2` | IBM Plex Mono Light | Regular | 300 | 2.3 | 248 | 16,700 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-IBMPlexMono-400.woff2` | IBM Plex Mono | Regular | 400 | 2.3 | 248 | 16,628 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |
| `NWA-Playfair-200.woff2` | Playfair Display | Regular | 200 | 1.203 | 223 | 36,472 | upstream OFL, see note | ID 0, ID 14 |
| `NWA-Playfair-300.woff2` | Playfair Display | Regular | 300 | 1.203 | 223 | 36,472 | upstream OFL, see note | ID 0, ID 14 |
| `NWA-Playfair-400.woff2` | Playfair Display | Regular | 400 | 1.203 | 239 | 30,320 | SIL OFL 1.1 | ID 0, ID 13, ID 14 |

Total webfont payload: **419,384 bytes** (409.6 KiB) across 9 files.

| Family | Upstream | Authors | Copyright holder's own licence statement in the binary |
| --- | --- | --- | --- |
| IBM Plex Mono | [github.com/IBM/plex](https://github.com/IBM/plex), `LICENSE.txt` | Mike Abbink, Paul van der Laan, Pieter van Rosmalen (Bold Monday) | ID 13 "This Font Software is licensed under the SIL Open Font License, Version 1.1." + ID 14 OFL URL |
| EB Garamond | [github.com/octaviopardo/EBGaramond12](https://github.com/octaviopardo/EBGaramond12) | Georg Duffner | same ID 13 statement + ID 14 |
| Playfair Display | [github.com/clauseggers/Playfair-Display](https://github.com/clauseggers/Playfair-Display) | Claus Eggers Sørensen | ID 13 + ID 14 in `-400`; the `-200`/`-300` build keeps ID 0 and ID 14 only |

Two observations from reading the binaries, recorded so they are not lost:

- `NWA-Playfair-200.woff2` and `NWA-Playfair-300.woff2` are **byte-identical** (same MD5): one outline is
  shipped twice and therefore renders both the 200 and the 300 request. Nothing breaks, but the
  display face has no real 200 weight, and 36 KB is duplicated. Left as is: dropping either file
  changes typography and is outside a licence fix.
- OFL condition 2 asks for the copyright notice and the licence "either as stand-alone text files,
  human-readable headers or in the appropriate machine-readable metadata fields". `fonts/OFL.txt`
  now satisfies it for every face, so a build whose ID 13 header was stripped is still compliant.
  Re-subsetting should keep ID 0 and ID 14 regardless.

## Conditions we have to keep meeting

SIL OFL 1.1 grants use, study, copy, merge, embed, modify, redistribute and sale, subject to five
conditions. In this repository they are met as follows - the wording of the licence is in
`fonts/OFL.txt`, which is the file that satisfies condition 2.

1. **Not sold by itself.** The fonts are part of a website, never offered as a font product.
2. **Copyright notice + licence text accompany the fonts.** `fonts/OFL.txt`, plus the unmodified
   `name` records in each binary (ID 0 copyright, ID 7 trademark, ID 13 licence statement).
3. **Reserved Font Names.** "Plex" and "Playfair Display" are reserved. They are used here only for
   the upstream design, unmodified in substance - see the next section.
4. **No endorsement.** The copyright holders' names appear only as attribution for the fonts.
5. **No re-licensing.** The faces stay under OFL 1.1. Documents produced with them (including the
   exported PDF and PNG of the Toolkit and the Contagion Engine) carry no further obligation.

## Subsetting and OFL condition 3

The bundled files are subsets of the upstream outlines (see the recipe at the bottom). A subset is a
"Modified Version" in OFL terms, and condition 3 says a Modified Version may not use a Reserved Font
Name *as the primary font name presented to the user*. Two facts keep us inside the licence:

- the outline data is untouched - only the glyph table and the byte format changed, and the font's
  own `name` records still report the upstream family, version and copyright, so nothing is
  presented as a new design;
- we do not offer the fonts for download as fonts, sell them, or claim authorship.

If the practice ever wants the strictest reading, the change is mechanical: rename the CSS family in
`fonts/nwa-fonts.css` (e.g. `NWA Mono`) and update the `--mono` / `--font-mono` declarations. The
binaries and `fonts/OFL.txt` stay exactly as they are. This is recorded as a decision, not a
defect: no re-subsetting is performed at build time, so the faces only change if someone rebuilds
them deliberately.

## Removed from the bundle

| Date | File | Family | Why |
| --- | --- | --- | --- |
| 2026-10-11 | `wila-milita.regular.otf` | Wila Milita | Embedded licence read "Free for personal use only.", which does not cover a commercial advisory site. Zero references in the repository; removed rather than licensed around. |
| 2026-10-11 | `NWA-SuisseMono-400.woff2` | Suisse Int'l Mono (Swiss Typefaces Sàrl, v2.100) | **Commercial font with no licence in this repository.** The subset's own `name` records read `Copyright (c) 2013 Swiss Typefaces Sàrl. All rights reserved.` and, for the licence field, `Please refer to the license you accepted when purchasing.` No commercial web/embedding licence is held (owner decision, 2026-10-11), so the face cannot be part of a public commercial build. Monospace roles moved to IBM Plex Mono, which was already the mono stack of every other page: the commercial face actually painted on `index.html` alone (its `--mono` listed it first), while `contagion.html` (`--mono`) and `disclosures.html`, `privacy.html`, `terms.html`, `toolkit.html`, `research.html` (`--font-mono`) already resolved to Plex, most of those rules at weight 300. On the other eight documents Suisse survived only as a `doc.fonts.load` entry in the first-paint gate - a face those pages never applied, which is how an unused licence gap can sit in a repo unnoticed. |

## Enforcement

`python3 scripts/verify.py` fails the build unless:

- no `*.ttf` / `*.otf` / `*.eot` appears anywhere in the bundle (`check_font_source_binaries`);
- every `fonts/*.woff2` present is named in a row of the table above, and every file named in the
  table exists on disk - so a font cannot be added or removed without editing this record;
- no row of the table records an *unresolved* licence ("not in this repository", "unconfirmed",
  "pending"): that is precisely the state the Suisse face sat in for months (`check_font_licences`).

A licence is a release gate here, not a note.

## Re-subsetting recipe

Subsetting is a build-time step, deliberately not part of the release gate:

```sh
# from a licensed source checkout, keeping latin + cyrillic coverage
pyftsubset EBGaramond-Regular.ttf \
  --unicodes="U+0020-007E,U+0400-04FF,U+2018-201F,U+2022,U+2026,U+2013-2014" \
  --flavor=woff2 --output-file=fonts/NWA-EBGaramond-400.woff2
```

Write output into `fonts/` only, keep sources under the ignored `fonts/_build/`, re-verify the
coverage of every character the pages actually render in mono, update the table above, and run
`python3 scripts/verify.py`.
