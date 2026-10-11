# North West Atlas — public platform

North West Atlas is an institutional advisory practice: AI-sector systemic-risk research, real assets
and transition, cross-border legal architecture and enforcement, structured impact capital. Site
content is informational and is not investment, legal or tax advice; the full framework is in
`disclosures.html`.

This repository is that practice's public surface, and it ships exactly two artifacts.

1. **The static site** — 12 HTML pages at the repository root, published by GitHub Pages from `main` at
   [northwestatlas.com](https://northwestatlas.com) (see `CNAME`). They cover the positioning and
   research pages plus two interactive products: the NWA Toolkit (market-risk monitoring and portfolio
   stress testing) and the Contagion Engine scenario environment.
2. **`nwa-data-proxy-worker.js`** — the CORS relay those two pages call for Yahoo Finance charts and
   AI-press RSS, deployed separately to Cloudflare Workers as `nwabcorp-cors-proxy`.

No framework, no build step, no bundler, no CSS preprocessor: the pages are the product.

## Layout

```
index.html              landing page (RU-first, EN toggle)
index-en.html, .htm     English entry point; the .htm copy is a deliberate legacy duplicate
toolkit.html            NWA AI Market Risk Toolkit — the interactive product surface
contagion.html          Contagion engine; unindexed by design
enforcement.html        asset-recovery and enforcement practice page
research.html           long-form research article
disclosures.html        privacy.html        terms.html        legal/institutional disclosures
404.html                GitHub Pages error page
nwa-smoke-test.html     operator checklist for a live deploy (noindex, Disallow, no-store)

fonts/                  subset WOFF2 + nwa-fonts.css (the single @font-face consumer)
styles/nwa-mobile-2026.css  mobile-layer overrides
scripts/verify.py       release checks, run by CI (see below)
scripts/*.test.mjs      node:test suite for the Worker
scripts/test_verify.py  unittest suite for the release checker
.github/workflows/      verify.yml — the single required status check
_headers                Pages security headers and cache policy (GitHub Pages has no server config)
manifest.json           PWA manifest
robots.txt sitemap.xml  indexing contract
wrangler.jsonc          Worker deployment config
```

Inline `<style>` and `<script>` blocks are the architecture, not an oversight: each page is
self-contained and cacheable as one document. `toolkit.html` carries ~55 KB of CSS and ~90 KB of JS
inline, which is why the CSP allows `'unsafe-inline'` (see *Known gaps*).

## Run it locally

Any static server works; `python3 -m http.server` keeps relative paths and `_headers`-less defaults:

```sh
python3 -m http.server 8788        # then open http://127.0.0.1:8788/index.html
```

The interactive pages fetch the *deployed* Worker (their `CONFIG.NWA_DATA_BASE` points at
`nwabcorp-cors-proxy.…workers.dev`), so charts and feeds need network access even in local review; a
fully offline checkout renders them empty by design. Loopback origins are always accepted by the relay,
so `http://127.0.0.1:8788` works against production without configuration. To exercise the relay itself:

```sh
npm ci
npm run worker:dev                 # http://localhost:8787, uses wrangler.jsonc vars
```

Checks need Python 3 with the standard library only; the Worker tooling needs Node. Verified on
Python 3.11.2, Node 22.22.3 and wrangler 4.149.0 (`package.json` declares `engines.node >=20`, which is
the floor `node --test` and `Response` streams require — it is a declared floor, not a tested one).

## Checks

```sh
npm test                            # both suites below
npm run verify                      # static release checks
npm run test:worker                 # node --test scripts/worker.test.mjs
npm run test:site                   # python -m unittest discover -s scripts -p 'test_*.py'
npm run check:worker                # node --check on the Worker
npx wrangler deploy --dry-run       # validates wrangler.jsonc and bundles the Worker
```

`scripts/verify.py` is the gate CI runs. Twelve checks, all machine-checkable invariants of this
particular site — not generic linting:

| Check | What it guarantees |
| --- | --- |
| required files | the 21 assets Pages and the Worker deploy (favicon, `_headers`, CNAME, fonts CSS, mobile CSS, Worker, `wrangler.jsonc`, every page) exist |
| local references | every `href`/`src`/`url()`/preload/canonical/`og:image` that points at a repository file resolves |
| manifest & sitemap | `<loc>` uses https, resolves to a shipped file, and every manifest icon exists |
| page metadata | `<title>`, `lang`, viewport on every content page |
| duplicate ids | no id collision inside a page (parsed, so encoded data-URI ids don't count) |
| canonicals | indexable pages carry a canonical that points at themselves |
| open graph | indexable pages have `og:image`, and declared `og:image:width/height` match the real PNG header |
| third-party resources | scripts/styles/images load only from the pinned allow-list, and every third-party script has an SRI `integrity` attribute |
| indexability | `robots.txt`, `sitemap.xml` and the page's `robots` meta agree — no `noindex` page advertised in the sitemap, no `Disallow` without `noindex` |
| font sources | no TTF/OTF/EOT in the public bundle; WOFF2 subsets only (policy in `fonts/LICENSES.md`) |
| claims | banned-phrase tripwire for certification language that has no document in `evidence/` |
| secrets | private-key blocks, cloud key ids, tokens and credential-shaped assignments |

A crash inside the checker exits `2`, so a broken gate can never read as a green release. Intentional
test fixtures may silence the secret scanner with a `verify:allow-secret` marker on the line — visible
in review, which is the point.

## Data relay (Cloudflare Worker)

`GET /` with one of:

| Query | Behaviour |
| --- | --- |
| `?health=1` | liveness, version, no-store |
| `?quote=NVDA&interval=1m&range=1d` | Yahoo chart JSON; `NDX/GSPC/SPX/VIX/DJI/DXY` map through `TICKER_MAP` |
| `?daily=NVDA&range=1mo` | same, `interval=1d` forced |
| `?feed=techcrunch\|verge-ai\|wired-ai\|venturebeat-ai` \| `?feed=market-<SYMBOL>` | curated RSS/XML |
| `?url=<encoded>` | legacy passthrough kept for older builds; same allow-list, same https-only rule |

Three independent gates: the target host must be in `ALLOWED_HOSTS`; its path must be in
`ALLOWED_PATH_PREFIXES` with an `https` scheme; and a browser reader must come from an Origin in
`NWA_ALLOWED_ORIGINS` (plus any loopback origin, always) to receive CORS headers at all.

**What the Origin list is not: authorization.** It decides whether *a browser on someone else's site*
can read the response. A request with no `Origin` header — curl, a cron job, a spreadsheet import — is
served in full, and that is deliberate: every byte the relay returns is public upstream data, and some
consumers are non-browser by nature. Containing abuse therefore rests on input validation, the short
caches and the size cap, not on CORS.

Upstream calls: 8 s `AbortSignal.timeout`; `try/catch` mapping timeout and refusal to a JSON `502`
(`no-store`) instead of faulting the isolate; client cookies and authorization headers are never
forwarded. Responses are read through `readCappedBody`, which counts bytes *actually received* against
2 MB — a `Content-Length` check alone would bound nothing, since the header can be absent (chunked) or
false. That is why responses are buffered rather than streamed: for payloads of this size the honest cap
is worth more than streaming. Charts cache 30 s, feeds 300 s, keyed by target, `Vary: Origin`.

`?url=<encoded>` is accepted for builds older than the current pages. Nothing in this repository uses it
(verified by grep across all HTML/JS: only `?quote=`, `?daily=` and `?feed=` are called), and it is the
widest surface left in the relay because its query string is caller-controlled — see *Known gaps*.

Configuration lives in `wrangler.jsonc` (`vars`) — non-secret only. Anything secret goes through
`wrangler secret put`.

Deploy path: `npm run worker:dry-run`, then `npm run worker:deploy`. GitHub Pages never touches the
Worker; pushing `main` does not redeploy it.

## Release model

1. Branch off `main`, open a PR into `main`.
2. GitHub Actions `verify` (`.github/workflows/verify.yml`) runs the checker and both suites; it is
   the check to make required in *Settings → Branches* (plus *Restrict push to admin merges* if the
   owner wants PR-only writes to `main`).
3. Merge → GitHub Pages serves `main`; the Worker is deployed separately by `npm run worker:deploy`.
4. After a production deploy, open `nwa-smoke-test.html` on the live host: the operator page asserts
   the header set, the Worker `?health=1` round-trip, font loading and the console-error counter.

Rolling back is asymmetric, and that is the point: a site change reverts through `main` (Pages republishes),
while the Worker rolls back with `npx wrangler deployments list` (find the previous version id) and
`npx wrangler rollback <version-id>` — both verified present in wrangler 4.149.0, and both need a
Cloudflare login. History lives there, so a bad relay release never requires touching `main`. An Origin that turns out to be a legitimate consumer is a config fix in `wrangler.jsonc`, not a
rollback.

Linear project `northwestatlas` is the work queue; PRs referencing `Closes NOR-<id>` move cards.

## Conventions that are intentional — do not "clean up"

- **`index-en.htm` and `index-en.html`** are both required. `.htm` is the historic short link people
  have shared; `.html` is what GitHub Pages probes for a directory request. Deleting either breaks one.
- **Unindexed pages by design.** `privacy.html`, `terms.html`, `disclosures.html`,
  `index-en.html/.htm` and `404.html` declare `noindex, follow`; `research.html`, `contagion.html`,
  `nwa-smoke-test.html` declare `noindex, nofollow`. None of them appear in `sitemap.xml`, which
  advertises exactly `/`, `toolkit.html` and `enforcement.html` (all three indexable, all three with a
  self-referencing canonical). `contagion.html` and `nwa-smoke-test.html` are additionally `Disallow`ed
  in `robots.txt`. `verify.py` fails if any of these three signals drift apart — so if the owner decides
  `research.html` *should* be public, the change is: flip its `robots` meta to `index, follow`, add a
  canonical, and add the `<loc>` back.
- **`_headers` is the only header mechanism** GitHub Pages offers; the per-page
  `<meta http-equiv="Content-Security-Policy">` blocks on `toolkit.html` and `contagion.html` narrow it
  further for those documents. Edit both when changing CSP, and the checker cannot see that pairing.
- **Inline CSS/JS per page** as described above.
- **Six pinned CDN libraries on two hosts** — `cdn.jsdelivr.net`: chart.js 4.4.0, luxon 3.3.0,
  chartjs-adapter-luxon 1.3.1, chartjs-plugin-zoom 2.0.1 (all in `toolkit.html`);
  `cdnjs.cloudflare.com`: html2canvas 1.4.1 and jsPDF 2.5.1 (`toolkit.html` and `contagion.html`,
  loaded from a frozen JS config). Each carries an `integrity` hash, which `verify.py` requires of any
  third-party script. `unpkg.com` used to be allowed by the CSP while nothing loaded from it; it is gone
  now, and the checker fails if an unlisted host appears.

## Known gaps (tracked in Linear, not hidden here)

- CSP still needs `'unsafe-inline'` for `script-src`, which weakens the SRI story. Removing it means
  extracting inline scripts per page — a real refactor of the highest-traffic document, not a sweep.
- CDN assets are not self-hosted, so availability depends on jsDelivr and cdnjs.
- `og-image-enhanced.png` is 1440×736. The declared dimensions now match the file; the Open Graph
  recommendation is 1200×630, so a re-export is still open.
- Unreferenced assets remain at the root, kept pending owner decisions rather than deleted on
  assumption: `logo-nwa.png` (765×475 brand master), the six partner logos
  (`rosteh`, `rost`, `veb-rf`, `rshb-inteh`, `minpromtorg`, `ros-eximbank` — publicly served, though no
  page claims a relationship with them), and five `placeholder.*` files left over from a UI kit.
- `fonts/NWA-SuisseMono-400.woff2` needs a licence confirmation; see `fonts/LICENSES.md`.
- **The relay has no rate limiting and accepts caller-chosen query strings on `?url=` targets.**
  Consequences, in order of likelihood: (a) an unauthenticated client can spend this Worker's request
  quota — the plan's daily limit is a dashboard fact, not a repository fact, so treat it as the budget;
  (b) unique `?url=` query strings multiply cache keys, so each one is a cache miss and a real upstream
  call, and `range=5y&interval=1m` is a heavy thing to ask Yahoo for on our behalf. Not fixed in the
  audit PR because any cap is a behaviour change for consumers nobody has enumerated yet (see the
  runbook order in the PR). Options, cheapest first: drop `?url=` once the older builds are confirmed
  gone; rebuild the cache key from the validated parameters only; then a per-client-IP limit. Tracked in
  Linear alongside the deploy task.
- Institutional claims on the pages (jurisdiction, licence number, AUA figures) must each resolve to a
  document under `evidence/` before they can be called verified. This repository contains no such
  folder yet, so those statements are unverified by anything in CI.

## Checks that could not be performed here

- No deployment of the Worker from this environment: `wrangler deploy --dry-run` (bundle + binding
  validation) is the extent of it, and it passes.
- No real browser rendering, Lighthouse run, or visual regression: page layout was reviewed by reading
  markup and CSS, not by screenshot diff.
- Branch protection settings live in repository *Settings* and are only verifiable there; CI itself is
  green on this branch.
- The upstream data providers' own rate limits were not probed, and neither was this account's Workers
  request quota — both are dashboard facts. Likewise, consumers of the relay outside this repository
  cannot be enumerated from the code: only from live traffic logs.
