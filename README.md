# North West Atlas

### Institutional Intelligence · Capital Advisory · Cross-Border Architecture

> *Capital is a material, not a fluid.*

North West Atlas is an institutional advisory practice focused on the intersection of capital allocation, legal architecture, and long-term value preservation.

The public platform presents selected areas of research, analytical systems, and institutional frameworks.

## Mandate

- **Artificial Intelligence** — thematic research and systemic-risk monitoring across the AI economy.
- **Real Assets & Transition** — long-duration infrastructure, critical materials, and resilience-oriented capital allocation.
- **Legal Architecture** — cross-border strategy, asset tracing, and enforcement frameworks.
- **Impact Capital** — structured capital supporting measurable social and environmental outcomes.

## Public Systems

**[NWA Toolkit](https://northwestatlas.com/toolkit.html)**  
A market-risk research environment for AI-sector monitoring, scenario analysis, and portfolio stress testing.

**[Contagion Engine](https://northwestatlas.com/contagion.html)**  
A scenario environment for examining how defined market shocks may propagate across a selected universe of AI-sector companies.

**[Research](https://northwestatlas.com/research.html)**  
Selected frameworks and institutional research on capital preservation under structural uncertainty.

## Correspondence

Private and institutional correspondence may be directed to:

[info@northwestatlas.com](mailto:info@northwestatlas.com)

## Repository

The site is static HTML, published by GitHub Pages from `main` at [northwestatlas.com](https://northwestatlas.com). `nwa-data-proxy-worker.js` is a Cloudflare Worker relaying market data and press feeds for the Toolkit and Contagion pages; it deploys separately (`npm run worker:deploy`).

```sh
python3 -m http.server 8788    # local preview
npm ci && npm test             # release checks + test suites, same gates as CI
```

## Important Information

The information presented on this website is provided for informational purposes only. It does not constitute investment, legal, tax, accounting, or other professional advice; nor does it constitute an offer, solicitation, or recommendation in relation to any security, financial instrument, or investment product. Past performance is not indicative of future results.

For the complete framework, see [Institutional Disclosures](https://northwestatlas.com/disclosures.html).

© North West Atlas B Corp. All rights reserved.
