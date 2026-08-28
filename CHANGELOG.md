# Release changelog

## Polished static release — 2026-08-28

### Reliability
- Added aliases for historic EN and case-variant Toolkit routes.
- Replaced the missing monograph PDF embed/download with a deliberate request-access experience.
- Added the previously missing manifest, ICO favicon, sitemap, robots directives, and Toolkit Open Graph image target.

### Security and data integrity
- Added deployable Cloudflare Pages response headers in `_headers`.
- Removed non-authoritative generic CORS proxy fallbacks from the Toolkit.
- Removed a redundant proxy retry path in the Contagion Engine; it now retries the intended NWA data layer and falls back to labelled local cache.

### Institutional 2026 posture
- Reframed the public correspondence section away from client acquisition and toward selective, confidential institutional communication.
- Removed animated market-canvas and synthetic cursor effects from the public homepage; information, typography, material contrast, and restraint now carry the authority.
- Tightened entrance timing and removed blur-led reveals so the first experience feels composed rather than theatrical.

### Typography and first paint
- Converted supplied typefaces to local WOFF2 with Unicode subsetting; active pages no longer request Google Fonts.
- Added a controlled first-paint gate and opacity reveal after core NWA fonts load, avoiding fallback-type flash.
- Added immutable one-year cache policy for hashed-stable WOFF2 font assets on Cloudflare Pages.

### UX, SEO, and accessibility
- Added canonical/social metadata to core secondary pages.
- Added visible keyboard focus and motion-reduction defaults.
- Updated public Toolkit labels to version 5.4 consistently.

### Content safety
- Changed the unsupported isolated footer statement `B Corp Certified` to `B Corp Standards`. No other legal, certification, regulatory, performance, or business claims were independently changed or verified.
