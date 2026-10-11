// NWA Data Proxy — Cloudflare Worker
// Market-data and RSS relay for the NWA Toolkit and Contagion Engine.
//
// Endpoints:
//   /?health=1                      liveness + version
//   /?quote=NVDA&interval=1m&range=1d
//   /?daily=NVDA&range=1mo
//   /?feed=techcrunch | verge-ai | wired-ai | venturebeat-ai | market-NVDA
//   /?url=<encoded target>          legacy, kept for older builds; same allow-list applies
//
// Security model (three independent gates):
//   1. target host must be on ALLOWED_HOSTS
//   2. target path must be on ALLOWED_PATH_PREFIXES and the scheme must be https
//   3. cross-origin readers must come from an origin in NWA_ALLOWED_ORIGINS,
//      otherwise no CORS header is emitted and the browser blocks the response
//
// Configuration (Cloudflare dashboard or wrangler.jsonc `vars`, never committed secrets):
//   NWA_ALLOWED_ORIGINS  space- or comma-separated list, e.g.
//                        "https://northwestatlas.com https://preview.example.pages.dev"

const VERSION = 'NWA-DATA-PROXY-1.2.0';
const NWA_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://northwestatlas.com',
  'https://www.northwestatlas.com',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
];

const UPSTREAM_TIMEOUT_MS = 8000;
const MAX_UPSTREAM_BYTES = 2 * 1024 * 1024; // charts and feeds are small; this is a misuse guard

const TICKER_MAP = Object.freeze({
  NDX: '^NDX',
  GSPC: '^GSPC',
  SPX: '^GSPC',
  VIX: '^VIX',
  DJI: '^DJI',
  DXY: 'DX-Y.NYB',
});

const FEEDS = Object.freeze({
  'techcrunch': 'https://techcrunch.com/tag/artificial-intelligence/feed/',
  'verge-ai': 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'wired-ai': 'https://www.wired.com/feed/tag/ai/latest/rss',
  'venturebeat-ai': 'https://feeds.feedburner.com/venturebeat/SZYF',
});

const ALLOWED_HOSTS = new Set([
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'feeds.finance.yahoo.com',
  'techcrunch.com',
  'www.wired.com',
  'wired.com',
  'www.theverge.com',
  'theverge.com',
  'feeds.feedburner.com',
]);

const ALLOWED_PATH_PREFIXES = [
  '/v8/finance/chart/',
  '/rss/2.0/headline',
  '/tag/artificial-intelligence/feed/',
  '/feed/tag/ai/latest/rss',
  '/rss/ai-artificial-intelligence/index.xml',
  '/venturebeat/SZYF',
];

const SYMBOL_RE = /^[A-Za-z0-9.^=-]{1,16}$/;
const ALLOWED_INTERVALS = new Set(['1m', '5m', '15m', '1h', '1d']);
const ALLOWED_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y']);

function allowedOrigins(env) {
  const raw = (env && env.NWA_ALLOWED_ORIGINS) || '';
  const list = raw.split(/[\s,]+/).map((value) => value.trim().replace(/\/$/, '')).filter(Boolean);
  return new Set(list.length ? list : DEFAULT_ALLOWED_ORIGINS);
}

/**
 * CORS headers for this request. Returns an empty object when the caller's
 * Origin is not on the list: the request still succeeds for non-browser
 * clients, but a foreign page cannot read the body.
 */
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  if (!origin) return {};
  if (!allowedOrigins(env).has(origin.replace(/\/$/, ''))) return {};
  // Vary: Origin is mandatory here - the edge cache is keyed by URL, not by caller.
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...extra,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-NWA-Version': VERSION,
    },
  });
}

function isAllowedTarget(target) {
  if (target.protocol !== 'https:') return false; // no plain-HTTP relay
  if (!ALLOWED_HOSTS.has(target.hostname)) return false;
  return ALLOWED_PATH_PREFIXES.some((prefix) => target.pathname.startsWith(prefix));
}

function buildChartTarget(reqUrl, mode) {
  const rawSymbol = reqUrl.searchParams.get(mode) || reqUrl.searchParams.get('symbol');
  if (!rawSymbol || !SYMBOL_RE.test(rawSymbol)) return null;
  const symbol = TICKER_MAP[rawSymbol.toUpperCase()] || rawSymbol.toUpperCase();
  const interval = mode === 'daily' ? '1d' : (reqUrl.searchParams.get('interval') || '1m');
  const range = reqUrl.searchParams.get('range') || (mode === 'daily' ? '1mo' : '1d');
  if (!ALLOWED_INTERVALS.has(interval) || !ALLOWED_RANGES.has(range)) return null;
  return new URL(
    `${NWA_CHART_BASE}${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`
  );
}

function buildFeedTarget(reqUrl) {
  const key = reqUrl.searchParams.get('feed');
  if (!key) return null;
  if (key.startsWith('market-')) {
    const sym = key.slice(7).toUpperCase();
    if (!/^[A-Z0-9.=-]{1,12}$/.test(sym)) return null;
    return new URL(`https://feeds.finance.yahoo.com/rss/2.0/headline?region=US&lang=en-US&s=${encodeURIComponent(sym)}`);
  }
  return FEEDS[key] ? new URL(FEEDS[key]) : null;
}

async function proxyTarget(target, request, ctx, env) {
  if (!isAllowedTarget(target)) return json({ error: 'Target not allowed' }, 403, corsHeaders(request, env));

  const cors = corsHeaders(request, env);
  const cache = caches.default;
  const cacheKey = new Request(target.toString(), { method: 'GET' });

  const cached = await cache.match(cacheKey);
  if (cached) {
    const headers = new Headers(cached.headers);
    Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
    headers.set('X-NWA-Cache', 'HIT');
    headers.set('X-NWA-Version', VERSION);
    return new Response(cached.body, { status: cached.status, headers });
  }

  let upstream;
  try {
    upstream = await fetch(target.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Accept: request.headers.get('Accept') || 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 NWA-Data-Layer/1.0',
      },
      cf: { cacheTtl: target.pathname.startsWith('/v8/finance/chart/') ? 30 : 300, cacheEverything: true },
    });
  } catch (cause) {
    // A hanging or refusing upstream must surface as a clean JSON error, not a Worker runtime error.
    const timedOut = cause && (cause.name === 'TimeoutError' || cause.name === 'AbortError');
    return json({ error: timedOut ? 'Upstream timed out' : 'Upstream unreachable' }, 502, cors);
  }

  const declaredLength = Number(upstream.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_UPSTREAM_BYTES) {
    return json({ error: 'Upstream response too large' }, 502, cors);
  }

  const isChart = target.pathname.startsWith('/v8/finance/chart/');
  const headers = new Headers(upstream.headers);
  Object.entries(cors).forEach(([key, value]) => headers.set(key, value));
  headers.set('X-NWA-Cache', 'MISS');
  headers.set('X-NWA-Version', VERSION);
  headers.set('Vary', headers.get('Vary') ? `${headers.get('Vary')}, Origin` : 'Origin');
  headers.set('Cache-Control', isChart ? 'public, max-age=30, s-maxage=30' : 'public, max-age=300, s-maxage=300');

  const response = new Response(upstream.body, { status: upstream.status, headers });
  if (upstream.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405, cors);

    const reqUrl = new URL(request.url);
    if (reqUrl.searchParams.has('health')) {
      return json({ ok: true, version: VERSION, endpoints: ['quote', 'daily', 'feed'], ts: new Date().toISOString() }, 200, cors);
    }

    let target = null;
    if (reqUrl.searchParams.has('quote')) target = buildChartTarget(reqUrl, 'quote');
    else if (reqUrl.searchParams.has('daily')) target = buildChartTarget(reqUrl, 'daily');
    else if (reqUrl.searchParams.has('feed')) target = buildFeedTarget(reqUrl);
    else if (reqUrl.searchParams.has('url')) {
      try {
        target = new URL(reqUrl.searchParams.get('url'));
      } catch {
        return json({ error: 'Invalid target URL' }, 400, cors);
      }
    }

    if (!target) return json({ error: 'Missing or invalid NWA data request' }, 400, cors);
    return proxyTarget(target, request, ctx, env);
  },
};
