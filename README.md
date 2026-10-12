# North West Atlas — public platform

North West Atlas is an institutional advisory practice: AI-sector systemic-risk research,
real assets and transition, cross-border legal architecture and enforcement, structured
impact capital. Site content is informational and is not investment, legal or tax advice;
the full framework is in `disclosures.html`.

The repository ships two artifacts:

1. **The static site** — 12 HTML pages at the repository root, published by GitHub Pages
   from `main` at [northwestatlas.com](https://northwestatlas.com) (`CNAME`). Positioning
   and research pages plus two interactive products: the NWA Toolkit (market-risk
   monitoring, portfolio stress testing) and the Contagion Engine (scenario modeling).
2. **`nwa-data-proxy-worker.js`** — the CORS relay those two pages call for Yahoo Finance
   charts and AI-press RSS, deployed separately to Cloudflare Workers as
   `nwabcorp-cors-proxy`.

No framework, build step, bundler or preprocessor. Each page is a self-contained document
with inline CSS/JS; `toolkit.html` carries ~55 KB of CSS and ~90 KB of JS inline, which is
why the CSP allows `'unsafe-inline'` (see `docs/SECURITY.md`).

## Layout

```
index.html              landing page (RU-first, EN toggle)
index-en.html, .htm     English entry point; the .htm copy is a legacy duplicate (see below)
toolkit.html            NWA AI Market Risk Toolkit — interactive product surface
contagion.html          Contagion engine; unindexed by design
enforcement.html        asset-recovery and enforcement practice page
research.html           long-form research article
disclosures.html  privacy.html  terms.html   legal/institutional disclosures
404.html                GitHub Pages error page
nwa-smoke-test.html     operator checklist for a live deploy (noindex, Disallow, no-store)

fonts/                  subset WOFF2 + nwa-fonts.css; licences in fonts/LICENSES.md
styles/nwa-mobile-2026.css   mobile-layer overrides
scripts/verify.py       release checks, run by CI
scripts/*.test.mjs      node:test suite for the Worker
scripts/test_verify.py  unittest suite for the release checker
docs/                   RELEASE.md (deploy/rollback runbook), SECURITY.md (posture & gaps)
.github/workflows/      verify.yml — jobs `verify` and `check-fonts`
_headers                header/cache policy — inert on GitHub Pages; kept for a header-capable host
manifest.json           PWA manifest
robots.txt sitemap.xml  indexing contract
wrangler.jsonc          Worker deployment config
```

## Local development

```sh
python3 -m http.server 8788        # then open http://127.0.0.1:8788/index.html
```

The interactive pages fetch the *deployed* Worker (`CONFIG.NWA_DATA_BASE`), so charts and
feeds need network access even in local review; offline they render their empty states.
The relay always accepts loopback origins, so local pages work against production without
configuration.

Worker development:

```sh
npm ci
npm run worker:dev                 # http://localhost:8787, uses wrangler.jsonc vars
```

Toolchain: Python 3 with the standard library for the release checker; Node ≥ 20
(declared floor in `package.json`) for the Worker suite; `scripts/check_font_names.py`
additionally needs `fonttools` + `brotli` — CI pins `4.66.1`/`1.2.0` in the `check-fonts`
job, and the script exits `2` when the dependency is missing, failing the job rather than
passing silently. Verified on Python 3.11.2, Node 22.22.3, wrangler 4.149.0.

## Checks

```sh
npm test                            # both suites below
npm run verify                      # static release checks
npm run test:worker                 # node --test scripts/worker.test.mjs
npm run test:site                   # python -m unittest discover -s scripts -p 'test_*.py'
npm run check:worker                # node --check on the Worker
npm run check:fonts                 # reads fonts/*.woff2 name records (needs fonttools)
npx wrangler deploy --dry-run       # validates wrangler.jsonc and bundles the Worker
```

`scripts/verify.py` is the CI gate: fourteen machine-checkable invariants of this site,
not generic linting.

| Check | What it guarantees |
| --- | --- |
| required files | the 21 assets Pages and the Worker deploy exist |
| local references | every `href`/`src`/`url()`/preload/canonical/`og:image` pointing at a repository file resolves |
| manifest & sitemap | `<loc>` uses https and resolves; every manifest icon exists |
| page metadata | `<title>`, `lang`, viewport on every content page |
| duplicate ids | no id collision inside a page |
| canonicals | indexable pages carry a self-referencing canonical |
| open graph | indexable pages have `og:image`; declared dimensions match the PNG header |
| third-party resources | scripts/styles/images only from the pinned allow-list; every third-party script carries SRI `integrity` |
| indexability | `robots.txt`, `sitemap.xml` and per-page `robots` meta agree |
| font sources | WOFF2 subsets only; no TTF/OTF/EOT in the public bundle |
| font licences | every `fonts/*.woff2` has a resolved row in `fonts/LICENSES.md`; OFL faces ship with `fonts/OFL.txt` |
| font reserved names | no shipped family or file name uses an upstream Reserved Font Name or an individual word of one (OFL-FAQ 5.4); rationale and the exception mechanism in `fonts/LICENSES.md` |
| claims | tripwire for certification language without a document in `evidence/` |
| secrets | private-key blocks, cloud key ids, tokens, credential-shaped assignments |

A crash inside the checker exits `2`, so a broken gate cannot read as a green release.
Test fixtures may silence the secret scanner with a `verify:allow-secret` marker on the
line, which stays visible in review.

## Data relay (Cloudflare Worker)

`GET /` with one of:

| Query | Behaviour |
| --- | --- |
| `?health=1` | liveness, version, no-store |
| `?quote=NVDA&interval=1m&range=1d` | Yahoo chart JSON; `NDX/GSPC/SPX/VIX/DJI/DXY` map through `TICKER_MAP` |
| `?daily=NVDA&range=1mo` | same, `interval=1d` forced |
| `?feed=techcrunch\|verge-ai\|wired-ai\|venturebeat-ai` \| `?feed=market-<SYMBOL>` | curated RSS/XML |
| `?url=<encoded>` | legacy passthrough for older builds; same allow-list, https only |

Three request gates: target host in `ALLOWED_HOSTS`; target path in
`ALLOWED_PATH_PREFIXES`, https only; CORS headers only for Origins in
`NWA_ALLOWED_ORIGINS` (loopback always allowed).

**CORS and access control.** The Origin allow-list controls browser access to responses;
it does not authenticate callers. Requests without an `Origin` header remain available to
non-browser clients — the relay returns public upstream data only. Abuse mitigation
therefore relies on input validation, response-size limits and caching, not CORS
(details and mitigation order in `docs/SECURITY.md`).

Upstream calls: 8 s timeout, mapped to a JSON `502` (`no-store`) on failure; client
cookies and `Authorization` headers are not forwarded; responses are buffered with a 2 MB
cap counted on received bytes (`Content-Length` alone cannot bound chunked or mislabelled
responses). Charts cache 30 s, feeds 300 s, keyed by target, `Vary: Origin`.

Nothing in this repository calls `?url=`; the pages use `?quote=`, `?daily=` and `?feed=`
only. Configuration lives in `wrangler.jsonc` (`vars`, non-secret); secrets go through
`wrangler secret put`.

## Release

1. Branch off `main`, PR into `main`.
2. CI runs `verify` and `check-fonts` on every PR; both are intended as required checks.
3. Merge → GitHub Pages republishes `main`. The Worker deploys separately:
   `npm run worker:dry-run`, then `npm run worker:deploy`.
4. Post-deploy verification and rollback: `docs/RELEASE.md`.

Linear project `northwestatlas` is the work queue; PRs referencing `Closes NOR-<id>`
move the cards.

## Design decisions and compatibility constraints

The following conventions are intentional. Changes may affect existing URLs, indexing,
font licensing or deployment behaviour.

- **`index-en.htm` and `index-en.html`** are both required: `.htm` is the historic shared
  link, `.html` is what GitHub Pages probes for a directory request.
- **Unindexed pages.** `privacy.html`, `terms.html`, `disclosures.html`,
  `index-en.html/.htm` and `404.html` declare `noindex, follow`; `research.html`,
  `contagion.html`, `nwa-smoke-test.html` declare `noindex, nofollow`; the last two are
  also `Disallow`ed in `robots.txt`. `sitemap.xml` advertises exactly `/`, `toolkit.html`
  and `enforcement.html`. `verify.py` fails if these signals drift apart. Making a page
  public means flipping its `robots` meta, adding a canonical and a `<loc>` — in one change.
- **Headers.** GitHub Pages ignores `_headers`; the per-page `<meta http-equiv>` CSP is
  the active mechanism. `toolkit.html` and `contagion.html` carry tailored policies —
  change them as a pair; the checker does not verify that pairing.
- **Inline CSS/JS per page**, as described under *Layout*.
- **Fonts are local WOFF2 subsets, all SIL OFL 1.1**, no hosted font request at any point.
  `NWA Serif` (Playfair Display) and `NWA Mono` (IBM Plex Mono) are renamed subsets —
  OFL condition 3 does not allow a modified font to keep a Reserved Font Name. Rationale,
  open questions and the re-subsetting recipe: `fonts/LICENSES.md`. EB Garamond declares
  no reservation and keeps its upstream name.
- **Six pinned CDN libraries on two hosts** (`cdn.jsdelivr.net`: chart.js 4.4.0,
  luxon 3.3.0, chartjs-adapter-luxon 1.3.1, chartjs-plugin-zoom 2.0.1;
  `cdnjs.cloudflare.com`: html2canvas 1.4.1, jsPDF 2.5.1), each with an SRI `integrity`
  hash. `verify.py` fails if an unlisted third-party host appears.

## Known gaps

Confirmed, tracked in Linear:

- CSP still needs `'unsafe-inline'` for `script-src`; removing it means extracting inline
  scripts page by page (`docs/SECURITY.md`).
- GitHub Pages serves fixed headers: no `frame-ancestors`/`X-Frame-Options`, no `nosniff`,
  `Cache-Control: max-age=600` on everything. Closing this class needs a header-capable
  host; `_headers` is already written for one (`docs/SECURITY.md`).
- The relay has no rate limiting, and `?url=` accepts caller-chosen query strings.
  Mitigation order in `docs/SECURITY.md`.
- CDN assets are not self-hosted; availability depends on jsDelivr and cdnjs.
- `og-image-enhanced.png` is 1440×736; the Open Graph recommendation is 1200×630.
  Re-export open.
- `logo-nwa.png` (765×475 brand master) stays in the web root as the source for derived
  assets; its removal is a separate owner decision.

Unverified — outside this repository:

- Institutional claims on the pages (jurisdiction, licence numbers, AUA figures) have no
  `evidence/` documents yet; CI verifies none of them.
- The Workers request quota and upstream providers' rate limits are dashboard facts.
- External consumers of the relay are visible only in live traffic logs.

## Checks not performed in this environment

- Worker deployment: `wrangler deploy --dry-run` passes; no live deploy from here.
- Browser rendering, Lighthouse, visual regression: layout reviewed from markup and CSS
  only.
- Branch protection settings: visible only in repository *Settings*; CI is green on this
  branch.
