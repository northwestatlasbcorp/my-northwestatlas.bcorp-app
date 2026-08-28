# Deployment notes

## Static hosting

This project has no transpilation or package-install requirement. Deploy the repository root as the static output.

The `_headers` file uses Cloudflare Pages syntax. It is intentionally included for a deployment platform that supports response headers. GitHub Pages ignores this file; test the returned headers in production with:

```bash
curl -sSI https://northwestatlas.com/
```

Expected hardening headers after a Cloudflare Pages deployment include:

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- `X-Frame-Options: DENY`

The CSP keeps inline scripts temporarily because the current static pages contain inline application code. Moving scripts into versioned external files would allow a tighter nonce/hash-based policy later.

The active pages load only the supplied local WOFF2 brand fonts through `fonts/nwa-fonts.css`; Google Fonts are not part of the visitor path. The controlled first-paint gate waits for the core faces and then fades in the finished composition. Test this behaviour with the browser cache disabled before release.

## Data Worker

`nwa-data-proxy-worker.js` is deliberately public and contains no secret. It only proxies an explicit list of Yahoo Finance and AI-news endpoints, validates ticker/range input, caches responses, and accepts only GET/OPTIONS requests.

Do not treat CORS as access control. Use Cloudflare rate limiting, analytics, and a custom Worker route if access needs to be restricted or the product introduces authenticated functionality.
