# Font licences

The public bundle ships **subset WOFF2 only**, produced from the source files that were kept
alongside them until 2026-10-11. Source binaries (`*.ttf`, `*.otf`) are no longer in this
repository: they added ~3.8 MB to every clone and every visitor's directory listing, and nothing
in the site referenced them. `fonts/nwa-fonts.css` is the single consumer and lists only WOFF2.

## What is shipped

| File | Family | Weight | Licence | Source of licence text |
| --- | --- | --- | --- | --- |
| `NWA-EBGaramond-400.woff2`, `-400-italic`, `-500`, `-500-italic` | EB Garamond | 400, 500 | SIL Open Font License 1.1 | `license` name record of `EBGaramond-*.ttf` |
| `NWA-IBMPlexMono-300.woff2`, `-400.woff2` | IBM Plex Mono | 300, 400 | SIL Open Font License 1.1 | `license` name record of `IBMPlexMono-*.ttf` |
| `NWA-Playfair-200.woff2`, `-300`, `-400` | Playfair Display | 200, 300, 400 | SIL Open Font License 1.1 | `license` name record of `PlayfairDisplay-*.ttf` |
| `NWA-SuisseMono-400.woff2` | Suisse Intl Mono | 400 | **Commercial, terms not in this repository** | see open item below |

SIL OFL 1.1 permits embedding, subsetting and redistribution provided the font is not sold by
itself and the licence notice travels with it. Keep the upstream `OFL.txt` next to any future
source checkout and re-verify after every re-subsetting.

## Open item that needs the owner (tracked in Linear)

`Suisse_Intl_Mono.ttf` carried the notice: *"Please refer to the license you accepted when
purchasing."* The subset `NWA-SuisseMono-400.woff2` is still served to the public, so someone must
confirm the purchased web/embedding licence covers it. Until that is confirmed either:

- attach the purchased licence text to this directory, or
- replace the face with an OFL monospace (IBM Plex Mono is already bundled) and delete the subset.

## Removed on 2026-10-11

`wila-milita.regular.otf` — its embedded licence read *"Free for personal use only."*, which does not
cover an institutional advisory website. Zero references in the repository, removed rather than
licensed around. If the display face is required, buy a commercial licence first.

## Re-subsetting recipe

Subsetting is a build-time step, deliberately not part of the release gate:

```sh
# from a licensed source checkout, keeping latin + cyrillic coverage
pyftsubset EBGaramond-Regular.ttf \
  --unicodes="U+0020-007E,U+0400-04FF,U+2018-201F,U+2022,U+2026,U+2013-2014" \
  --flavor=woff2 --output-file=fonts/NWA-EBGaramond-400.woff2
```

Write output into `fonts/` only, keep sources under the ignored `fonts/_build/`, and re-run
`python3 scripts/verify.py` — it fails the build if a source binary lands in the bundle.
