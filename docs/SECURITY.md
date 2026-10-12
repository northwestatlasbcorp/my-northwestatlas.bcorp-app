# Security posture

Current state, known weaknesses and the order in which to address them. Facts below are
split into what the repository proves and what lives outside it.

## Serving platform (GitHub Pages)

Verified 2026-10-12: DNS resolves to 185.199.108–111.153, the Pages API reports the custom
domain, HTTPS enforced.

GitHub Pages serves a fixed header set and ignores `_headers`. Consequences:

| Control | Status |
| --- | --- |
| Content-Security-Policy | per-page `<meta http-equiv>` tag (the only mechanism available) |
| `frame-ancestors` / `X-Frame-Options` | **absent** — cannot be set from a meta tag; no clickjacking protection on this host |
| `X-Content-Type-Options: nosniff` | absent |
| `Cache-Control` | fixed `max-age=600` on everything; fonts cannot get long-lived caching |

`_headers` in the repository is written for a header-capable host (Cloudflare Pages,
Netlify) and is inert until such a migration — an owner-level infrastructure decision.

## CSP

Every page carries a meta-CSP. The standard policy allows `'unsafe-inline'` for
`script-src` and `style-src` because each page inlines its CSS/JS by design
(`toolkit.html`: ~55 KB CSS, ~90 KB JS). `toolkit.html` and `contagion.html` carry
tailored policies; edit the pair together — `verify.py` does not check that pairing.

Removing `'unsafe-inline'` requires extracting inline scripts into files (or hashing
them), page by page. That is a refactor of the highest-traffic documents, tracked in
Linear; until then SRI on the six CDN scripts is the effective external-script control.

## Data relay (Cloudflare Worker)

Three request gates: target host must be in `ALLOWED_HOSTS`; target path must match
`ALLOWED_PATH_PREFIXES`, https only; CORS headers are emitted only for Origins in
`NWA_ALLOWED_ORIGINS` (loopback origins always allowed).

**CORS and access control.** The Origin allow-list controls browser access to responses;
it does not authenticate callers. Requests without an `Origin` header (curl, cron,
server-side fetch) are served in full — the relay returns public upstream data only.
Abuse mitigation therefore relies on input validation, response-size limits and caching,
not CORS.

Hardening already in place:

- 8 s upstream timeout; timeout/refusal map to JSON `502` with `no-store`.
- Client cookies and `Authorization` headers are never forwarded.
- Responses are buffered through `readCappedBody`: received bytes are counted against a
  2 MB cap. A `Content-Length` check alone would not bound chunked or mislabelled
  responses; buffering is the cost of enforcing the cap honestly.
- Caching: charts 30 s, feeds 300 s, keyed by target, `Vary: Origin`.
- Secrets never live in `wrangler.jsonc` (non-secret `vars` only); anything secret goes
  through `wrangler secret put`.

## Known weaknesses and mitigation order

1. **No rate limiting.** An unauthenticated client can spend the Worker's request quota.
   The plan's daily limit is a dashboard fact, not a repository fact — treat it as the
   budget.
2. **`?url=` legacy passthrough.** Same allow-lists as the structured routes, but the
   query string is caller-controlled: unique strings multiply cache keys (each one a real
   upstream call), and `range=5y&interval=1m` is a heavy upstream request. Nothing in this
   repository calls `?url=` (verified by grep: pages use `?quote=`, `?daily=`, `?feed=`
   only); external callers, if any, are visible only in live traffic logs.

Mitigation order, cheapest first:

1. Drop `?url=` once older external builds are confirmed gone (traffic logs).
2. Rebuild the cache key from validated parameters only, collapsing the key space.
3. Per-client-IP rate limit.

Each step changes behaviour for consumers that are not enumerable from the code, which is
why none of them shipped in the audit PR. Tracked in Linear.

## Claims verification

Institutional claims on the pages (jurisdiction, licence numbers, AUA figures) must each
resolve to a document under `evidence/` to count as verified. The folder does not exist
yet, so `verify.py`'s claims check currently acts as a tripwire for *new* certification
language only; existing statements are unverified by CI.
