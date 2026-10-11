## What changes

- One reviewable thing per PR. Link the Linear issue: `Closes NWA-<id>` (GitHub → Linear sync is on, so this also moves the board).
- Say what a visitor or operator would notice, and what breaks if this does not ship.

## Checks run here

- [ ] `python3 scripts/verify.py` — repository release checks
- [ ] `python3 -m unittest discover -s scripts -p 'test_*.py'` — if the checker or site metadata changed
- [ ] `node --test scripts/worker.test.mjs` — if `nwa-data-proxy-worker.js` changed
- [ ] `node --check nwa-data-proxy-worker.js`
- [ ] `npx wrangler deploy --dry-run` — if `wrangler.jsonc`, `_headers`, or Worker config changed

List any check that could not run locally and why. Do not describe an unverified check as passing.

## Guardrails

- No secrets in code, logs, config, or screenshots. `verify:allow-secret` markers require an explicit reviewer OK.
- Regulatory, certification, partner, and fund-size claims need a document in `evidence/`. Unverified claims are removed, not softened.
- Public bundle stays lean: subset WOFF2 in `fonts/`, no TTF/OTF sources, no unreferenced assets.
- Indexing signals must agree: `robots.txt`, `sitemap.xml`, and the page's `robots` meta.
- `index-en.htm` and `index-en.html` are a deliberate duplicate (legacy short link plus the Pages default lookup). Do not "fix" it.

## Limits

What was not covered, what a reviewer should look at with fresh eyes, and the follow-up task filed in Linear.
