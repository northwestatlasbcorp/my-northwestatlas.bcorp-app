// NWA Data Proxy — Cloudflare Worker
// Free-tier friendly market-data and intelligence feed layer.
// Preferred client formats:
//   /?quote=NVDA&interval=1m&range=1d
//   /?daily=NVDA&range=1mo
//   /?feed=techcrunch | verge-ai | wired-ai | venturebeat-ai | market-NVDA
// Legacy format still supported:
//   /?url=<encoded allowlisted target URL>

const VERSION = 'NWA-DATA-PROXY-1.1.0';
const NWA_CHART_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';

const TICKER_MAP = Object.freeze({
  NDX: '^NDX',
  GSPC: '^GSPC',
  SPX: '^GSPC',
  VIX: '^VIX',
  DJI: '^DJI',
  DXY: 'DX-Y.NYB'
});

const FEEDS = Object.freeze({
  'techcrunch': 'https://techcrunch.com/tag/artificial-intelligence/feed/',
  'verge-ai': 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'wired-ai': 'https://www.wired.com/feed/tag/ai/latest/rss',
  'venturebeat-ai': 'https://feeds.feedburner.com/venturebeat/SZYF'
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
  'feeds.feedburner.com'
]);

const ALLOWED_PATH_PREFIXES = [
  '/v8/finance/chart/',
  '/rss/2.0/headline',
  '/tag/artificial-intelligence/feed/',
  '/feed/tag/ai/latest/rss',
  '/rss/ai-artificial-intelligence/index.xml',
  '/venturebeat/SZYF'
];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400'
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-NWA-Version': VERSION }
  });
}

function isAllowedTarget(target) {
  if (!['https:', 'http:'].includes(target.protocol)) return false;
  if (!ALLOWED_HOSTS.has(target.hostname)) return false;
  return ALLOWED_PATH_PREFIXES.some(prefix => target.pathname.startsWith(prefix));
}

function buildChartTarget(reqUrl, mode) {
  const rawSymbol = reqUrl.searchParams.get(mode) || reqUrl.searchParams.get('symbol');
  if (!rawSymbol || !/^[A-Za-z0-9.^=-]{1,16}$/.test(rawSymbol)) return null;
  const symbol = TICKER_MAP[rawSymbol.toUpperCase()] || rawSymbol.toUpperCase();
  const interval = mode === 'daily' ? '1d' : (reqUrl.searchParams.get('interval') || '1m');
  const range = reqUrl.searchParams.get('range') || (mode === 'daily' ? '1mo' : '1d');
  const allowedIntervals = new Set(['1m', '5m', '15m', '1h', '1d']);
  const allowedRanges = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y']);
  if (!allowedIntervals.has(interval) || !allowedRanges.has(range)) return null;
  return new URL(`${NWA_CHART_BASE}${encodeURIComponent(symbol)}?interval=${interval}&range=${range}&includePrePost=false&events=div%2Csplit`);
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

async function proxyTarget(target, request, ctx) {
  if (!isAllowedTarget(target)) return json({ error: 'Target not allowed' }, 403);

  const cache = caches.default;
  const cacheKey = new Request(target.toString(), { method: 'GET' });
  const cached = await cache.match(cacheKey);
  if (cached) {
    const h = new Headers(cached.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => h.set(k, v));
    h.set('X-NWA-Cache', 'HIT');
    h.set('X-NWA-Version', VERSION);
    return new Response(cached.body, { status: cached.status, headers: h });
  }

  const isChart = target.pathname.startsWith('/v8/finance/chart/');
  const upstream = await fetch(target.toString(), {
    method: 'GET',
    headers: {
      'Accept': request.headers.get('Accept') || 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0 NWA-Data-Layer/1.0'
    },
    cf: { cacheTtl: isChart ? 30 : 300, cacheEverything: true }
  });

  const headers = new Headers(upstream.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  headers.set('X-NWA-Cache', 'MISS');
  headers.set('X-NWA-Version', VERSION);
  headers.set('Vary', 'Accept-Encoding');
  headers.set('Cache-Control', isChart ? 'public, max-age=30, s-maxage=30' : 'public, max-age=300, s-maxage=300');

  const response = new Response(upstream.body, { status: upstream.status, headers });
  if (upstream.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
    if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

    const reqUrl = new URL(request.url);
    if (reqUrl.searchParams.has('health')) {
      return json({ ok: true, version: VERSION, endpoints: ['quote', 'daily', 'feed'], ts: new Date().toISOString() }, 200);
    }
    let target = null;

    if (reqUrl.searchParams.has('quote')) target = buildChartTarget(reqUrl, 'quote');
    else if (reqUrl.searchParams.has('daily')) target = buildChartTarget(reqUrl, 'daily');
    else if (reqUrl.searchParams.has('feed')) target = buildFeedTarget(reqUrl);
    else if (reqUrl.searchParams.has('url')) {
      try { target = new URL(reqUrl.searchParams.get('url')); } catch { return json({ error: 'Invalid target URL' }, 400); }
    }

    if (!target) return json({ error: 'Missing or invalid NWA data request' }, 400);
    return proxyTarget(target, request, ctx);
  }
};
