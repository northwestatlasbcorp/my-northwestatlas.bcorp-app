// NWA Yahoo/RSS CORS Proxy — Cloudflare Worker
// Free-tier friendly, no paid market-data API required.
// Deploy this worker to: https://nwa-cors-proxy.ceo-northwestatlas-bcorp.workers.dev/
// Expected client format: /?url=<encoded target URL>

const ALLOWED_HOSTS = new Set([
  'query1.finance.yahoo.com',
  'query2.finance.yahoo.com',
  'techcrunch.com',
  'www.wired.com',
  'wired.com',
  'www.theverge.com',
  'theverge.com'
]);

const ALLOWED_PATH_PREFIXES = [
  '/v8/finance/chart/',
  '/tag/artificial-intelligence/feed/',
  '/feed/tag/ai/latest/rss',
  '/rss/ai-artificial-intelligence/index.xml'
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
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function isAllowedTarget(target) {
  if (!['https:', 'http:'].includes(target.protocol)) return false;
  if (!ALLOWED_HOSTS.has(target.hostname)) return false;
  return ALLOWED_PATH_PREFIXES.some(prefix => target.pathname.startsWith(prefix));
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed' }, 405);
    }

    const reqUrl = new URL(request.url);
    const raw = reqUrl.searchParams.get('url');
    if (!raw) return json({ error: 'Missing url parameter' }, 400);

    let target;
    try {
      target = new URL(raw);
    } catch {
      return json({ error: 'Invalid target URL' }, 400);
    }

    if (!isAllowedTarget(target)) {
      return json({ error: 'Target host/path not allowed', host: target.hostname, path: target.pathname }, 403);
    }

    const cache = caches.default;
    const cacheKey = new Request(target.toString(), { method: 'GET' });
    const cached = await cache.match(cacheKey);
    if (cached) {
      const h = new Headers(cached.headers);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => h.set(k, v));
      h.set('X-NWA-Cache', 'HIT');
      return new Response(cached.body, { status: cached.status, headers: h });
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: {
        'Accept': request.headers.get('Accept') || 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 NWA-Toolkit/5.3'
      },
      cf: {
        cacheTtl: target.hostname.includes('finance.yahoo.com') ? 30 : 300,
        cacheEverything: true
      }
    });

    const headers = new Headers(upstream.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
    headers.set('X-NWA-Cache', 'MISS');
    headers.set('Vary', 'Accept-Encoding');

    // Keep Yahoo quotes short-lived; RSS can be cached a bit longer.
    headers.set('Cache-Control', target.hostname.includes('finance.yahoo.com')
      ? 'public, max-age=30, s-maxage=30'
      : 'public, max-age=300, s-maxage=300');

    const response = new Response(upstream.body, { status: upstream.status, headers });
    if (upstream.ok) ctx.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }
};
