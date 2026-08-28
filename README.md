# North West Atlas — polished static release

A deployable static website for **North West Atlas B Corp**, with the public marketing site, research pages, NWA Toolkit, Contagion Engine, shared visual assets, and the Cloudflare Worker source for the market-data layer.

## What changed in this release

- repaired historic route handling (`index-en.html`, `index-en.htm`, and `Toolkit.html` now resolve safely);
- repaired the Toolkit social card by supplying a valid OG image;
- replaced the missing public monograph PDF experience with an intentional access-request flow — no fake or empty PDF is shipped;
- added `robots.txt`, `sitemap.xml`, `manifest.json`, `favicon.ico`, canonical/OG metadata for core secondary pages, and focus/reduced-motion refinements;
- removed generic third-party CORS proxy fallbacks: the NWA Cloudflare Worker is the only browser data layer;
- added a Cloudflare Pages `_headers` file for deployment-grade response headers;
- converted the supplied brand typefaces to local WOFF2 assets, removed Google Fonts from active pages, and added a controlled first-paint gate so fallback typography never flashes during the first visit;
- archived the obsolete alternate English page in `archive/` and made the historic public paths redirect to the current homepage;
- changed the isolated footer phrase `B Corp Certified` to `B Corp Standards` to avoid contradicting the legacy page. Verify all public legal, regulatory, performance, licensing, and certification statements with counsel before publishing.

## Local preview

No build step is required.

```bash
cd northwestatlas-polished
python3 -m http.server 8080
```

Open `http://localhost:8080` in a browser. Run the static release checks with:

```bash
python3 scripts/verify.py
```

## Deploy the site

### Recommended: Cloudflare Pages

Connect this folder/repository in Cloudflare Pages:

- Framework preset: **None**
- Build command: *(leave blank)*
- Build output directory: `/`

Cloudflare Pages honors the root `_headers` file. Configure `northwestatlas.com` as the custom domain and retain `CNAME` only if GitHub Pages remains in use elsewhere.

### GitHub Pages

GitHub Pages can serve these static files and the `CNAME`, but it **does not apply `_headers`**. If GitHub Pages is retained, set equivalent security headers at an upstream CDN/proxy such as Cloudflare.

## Deploy the market-data Worker

The Worker source is `nwa-data-proxy-worker.js`. From a machine with Cloudflare credentials and Wrangler installed:

```bash
npx wrangler deploy
```

Verify it after deployment:

```bash
curl 'https://nwabcorp-cors-proxy.ceo-northwestatlas-bcorp.workers.dev/?health=1'
```

The public toolkit expects that Worker URL. Keep its allowlist narrow, monitor errors, and add Cloudflare rate limiting before materially increasing traffic.

## Before production

1. Confirm every legal, regulatory, performance, AUA, recovery, jurisdictional, and B Corp-related statement against current primary documentation.
2. If a public monograph PDF is approved, add it at the project root as `NWA_Institutional_Capital_Survival_System.pdf`, then replace the request-access blocks in `research.html` with the approved download/viewer markup.
3. Confirm social cards after deploying (`og-image-enhanced.png` is now used for Toolkit as well).
4. Run `python3 scripts/verify.py`, test on mobile, and test keyboard-only navigation.
5. Test the first visit with browser cache disabled and a throttled mobile connection. The intended behavior is a short dark-to-content fade with final brand typography already in place — never a fallback-font swap.
