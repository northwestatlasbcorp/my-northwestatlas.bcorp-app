# Release and post-deploy verification

Companion to the *Release* section of the README. Everything here is an operator action;
CI cannot perform these steps.

## Release steps

1. Branch off `main`, open a PR into `main`.
2. CI (`.github/workflows/verify.yml`) runs two jobs on every PR:
   - `verify` — `scripts/verify.py` (stdlib-only) plus both test suites;
   - `check-fonts` — `scripts/check_font_names.py` with pinned `fonttools==4.66.1` / `brotli==1.2.0`.
   Both jobs are intended as required checks (*Settings → Branches*). Add
   *Restrict push* if `main` should accept PR merges only. Branch-protection state is
   visible only in repository Settings; CI cannot assert it.
3. Merge. GitHub Pages republishes `main` automatically (typically within minutes; CDN cache
   up to 10 minutes on top).
4. The Worker deploys separately and only by hand: `npm run worker:dry-run`, then
   `npm run worker:deploy`. Pushing `main` never redeploys it.

## Post-deploy checks

### Smoke test

Open `https://northwestatlas.com/nwa-smoke-test.html` on the live host. It runs six
`no-store` fetches and prints PASS/FAIL per row: Worker `?health=1`, `?quote=NVDA`,
`?daily=NDX`, `?feed=`, and the Toolkit and Contagion documents.

Scope: the smoke test asserts reachability and response shape only. Headers, fonts and
console state are the separate checks below.

### Fonts (DevTools console)

On `/toolkit.html`:

```js
document.fonts.check('400 1em "NWA Mono"')   // expect true
```

On `/`:

```js
getComputedStyle(document.querySelector('.footer-meta-row')).fontFamily
// expect it to start with "NWA Mono"
```

The first call is true whenever the face is declared; the second proves the page actually
uses it. Family names are the renamed subsets (`NWA Mono`, `NWA Serif`) — background in
`fonts/LICENSES.md`.

### Headers and console

- DevTools console: no errors, no CSP violation reports.
- Response headers: GitHub Pages serves a fixed set (see `docs/SECURITY.md`); there is
  nothing to verify beyond the meta-CSP being present in the document.

## Rollback

Rollback is split by artifact:

- **Site** — revert the commit on `main`; Pages republishes. No other action.
- **Worker** — `npx wrangler deployments list` (find the previous version id), then
  `npx wrangler rollback <version-id>`. Requires a Cloudflare login. Verified present in
  wrangler 4.149.0.

A mis-listed Origin is a config fix in `wrangler.jsonc` vars plus a redeploy, not a rollback.

## Work queue

Linear project `northwestatlas`; PRs referencing `Closes NOR-<id>` move the cards.
