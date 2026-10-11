import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../nwa-data-proxy-worker.js';

const PROD_ORIGIN = 'https://northwestatlas.com';
const WORKER = 'https://proxy.test.internal';

let upstreamCalls = [];

function makeCtx() {
  const pending = [];
  return {
    waitUntil: (promise) => pending.push(Promise.resolve(promise).catch(() => {})),
    pending,
  };
}

function makeRequest(path, { origin = PROD_ORIGIN, method = 'GET' } = {}) {
  const headers = new Headers();
  if (origin) headers.set('Origin', origin);
  return new Request(`${WORKER}${path}`, { method, headers });
}

function stubUpstream({ status = 200, body = '{"chart":1}', headers = {}, error = null } = {}) {
  upstreamCalls = [];
  globalThis.fetch = async (url, init) => {
    upstreamCalls.push({ url, init });
    if (error) throw error;
    return new Response(body, { status, headers });
  };
}

function stubCache({ hit = false } = {}) {
  globalThis.caches = {
    default: {
      match: async () => (hit ? new Response('<rss/>', { status: 200, headers: { 'content-type': 'application/rss+xml' } }) : undefined),
      put: async () => {},
    },
  };
}

const handle = (request, env = {}) => worker.fetch(request, env, makeCtx());

test.beforeEach(() => {
  stubUpstream();
  stubCache();
});

test('health endpoint reports version and never caches', async () => {
  const response = await handle(makeRequest('/?health=1'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const body = await response.json();
  assert.equal(body.ok, true);
  assert.match(body.version, /^NWA-DATA-PROXY-\d+\.\d+\.\d+$/);
});

test('non-GET is rejected with 405', async () => {
  const response = await handle(makeRequest('/?quote=NVDA', { method: 'POST' }));
  assert.equal(response.status, 405);
});

test('preflight answers 204 to an allowed origin and omits CORS for a stranger', async () => {
  const ok = await handle(makeRequest('/?health=1', { method: 'OPTIONS' }));
  assert.equal(ok.status, 204);
  assert.equal(ok.headers.get('Access-Control-Allow-Origin'), PROD_ORIGIN);

  const stranger = await handle(makeRequest('/?health=1', { method: 'OPTIONS', origin: 'https://evil.example' }));
  assert.equal(stranger.headers.get('Access-Control-Allow-Origin'), null);
});

test('a foreign origin gets no CORS header, so the browser cannot read the body', async () => {
  const response = await handle(makeRequest('/?quote=NVDA', { origin: 'https://scraper.example' }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  assert.equal(response.headers.get('Vary'), 'Origin');
});

test('a request without Origin (server-to-server) still works', async () => {
  const response = await handle(makeRequest('/?quote=NVDA', { origin: null }));
  assert.equal(response.status, 200);
  assert.equal(upstreamCalls.length, 1);
});

test('off-list hosts are refused before any upstream request', async () => {
  const blocked = await handle(makeRequest(`/?url=${encodeURIComponent('https://example.com/v8/finance/chart/AAPL')}`));
  assert.equal(blocked.status, 403);
  assert.equal(upstreamCalls.length, 0, 'a refused target must never reach the network');
});

test('plain-HTTP targets are refused even on an allow-listed host', async () => {
  const response = await handle(
    makeRequest(`/?url=${encodeURIComponent('http://query1.finance.yahoo.com/v8/finance/chart/AAPL')}`)
  );
  assert.equal(response.status, 403);
  assert.equal(upstreamCalls.length, 0);
});

test('allow-listed host with an unexpected path is refused', async () => {
  const response = await handle(
    makeRequest(`/?url=${encodeURIComponent('https://query1.finance.yahoo.com/v8/privacy/export')}`)
  );
  assert.equal(response.status, 403);
});

test('malformed symbol is rejected with 400', async () => {
  const response = await handle(makeRequest('/?quote=..%2F..%2Fetc'));
  assert.equal(response.status, 400);
});

test('unknown interval and range are rejected with 400', async () => {
  const interval = await handle(makeRequest('/?quote=NVDA&interval=9m'));
  assert.equal(interval.status, 400);
  const range = await handle(makeRequest('/?quote=NVDA&range=7y'));
  assert.equal(range.status, 400);
});

test('an unparseable legacy url parameter is a 400, not a crash', async () => {
  const response = await handle(makeRequest('/?url=not%20a%20url'));
  assert.equal(response.status, 400);
});

test('a valid quote maps through TICKER_MAP and is fetched over https', async () => {
  const response = await handle(makeRequest('/?quote=VIX&interval=1d&range=1mo'));
  assert.equal(response.status, 200);
  assert.equal(upstreamCalls.length, 1);
  const url = new URL(upstreamCalls[0].url);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.hostname, 'query1.finance.yahoo.com');
  assert.equal(url.pathname, '/v8/finance/chart/%5EVIX');
});

test('feed keys resolve to the curated endpoints', async () => {
  await handle(makeRequest('/?feed=techcrunch'));
  assert.equal(upstreamCalls[0].url, 'https://techcrunch.com/tag/artificial-intelligence/feed/');
  await handle(makeRequest('/?feed=market-SPY'));
  assert.match(upstreamCalls[1].url, /^https:\/\/feeds\.finance\.yahoo\.com\/rss\/2\.0\/headline\?region=US&lang=en-US&s=SPY$/);
});

test('cache hit is served without touching the network', async () => {
  stubCache({ hit: true });
  const response = await handle(makeRequest('/?feed=wired-ai'));
  assert.equal(response.headers.get('X-NWA-Cache'), 'HIT');
  assert.equal(upstreamCalls.length, 0);
});

test('upstream failure surfaces as a JSON 502 instead of a runtime error', async () => {
  stubUpstream({ error: Object.assign(new Error('socket hang up'), { name: 'Error' }) });
  const response = await handle(makeRequest('/?quote=NVDA'));
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.match((await response.json()).error, /Upstream/);
});

test('upstream timeout is reported as a timeout', async () => {
  stubUpstream({ error: Object.assign(new Error('timeout'), { name: 'TimeoutError' }) });
  const response = await handle(makeRequest('/?quote=NVDA'));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, 'Upstream timed out');
});

test('oversized upstream responses are refused', async () => {
  stubUpstream({ headers: { 'content-length': String(9 * 1024 * 1024) } });
  const response = await handle(makeRequest('/?feed=wired-ai'));
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, 'Upstream response too large');
});

test('outgoing upstream requests carry no client credentials', async () => {
  await handle(makeRequest('/?quote=NVDA'));
  const sentHeaders = new Headers(upstreamCalls[0].init.headers);
  assert.equal(sentHeaders.get('Cookie'), null);
  assert.equal(sentHeaders.get('Authorization'), null);
  assert.ok(sentHeaders.get('User-Agent').includes('NWA-Data-Layer'));
});

test('every upstream call is bounded by a timeout signal', async () => {
  await handle(makeRequest('/?quote=NVDA'));
  assert.ok(upstreamCalls[0].init.signal, 'fetch must be given an AbortSignal');
});

test('NWA_ALLOWED_ORIGINS extends the list for previews without a code change', async () => {
  const preview = 'https://main.abcd1234.pages.dev';
  const listed = await handle(makeRequest('/?quote=NVDA', { origin: preview }), { NWA_ALLOWED_ORIGINS: `${PROD_ORIGIN},${preview}` });
  assert.equal(listed.headers.get('Access-Control-Allow-Origin'), preview);

  const notListed = await handle(makeRequest('/?quote=NVDA', { origin: PROD_ORIGIN }), { NWA_ALLOWED_ORIGINS: preview });
  assert.equal(notListed.headers.get('Access-Control-Allow-Origin'), null, 'explicit config replaces the default list');
});
