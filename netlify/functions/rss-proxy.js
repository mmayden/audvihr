/**
 * rss-proxy — Netlify serverless function that proxies MMA RSS feeds server-side,
 * bypassing browser CORS restrictions.
 *
 * Security: strict allowlist — only the two configured RSS feed URLs are permitted.
 * An unrecognised or missing `url` query param returns 403 immediately, preventing
 * this function from being used as an open proxy (SSRF risk).
 *
 * Path: /api/rss-proxy (declared via config.path; takes precedence over the
 * netlify.toml `/*` SPA redirect rule).
 *
 * Query params:
 *   url {string} — must be one of ALLOWED_URLS exactly (no prefix/suffix matching)
 */

const ALLOWED_URLS = new Set([
  'https://www.mmafighting.com/rss/current',
  'https://mmajunkie.usatoday.com/feed',
]);

/** 512 KB — comfortably larger than any RSS feed, blocks runaway upstream responses. */
const MAX_RESPONSE_BYTES = 512 * 1024;

export default async (request) => {
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !ALLOWED_URLS.has(url)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Audwihr-RSS-Proxy/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: 502 });
    }

    const text = await upstream.text();

    if (text.length > MAX_RESPONSE_BYTES) {
      return new Response('Upstream response too large', { status: 502 });
    }

    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        // 30 min browser cache — matches the app's sessionStorage cache TTL
        'Cache-Control': 'public, max-age=1800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Upstream unreachable', { status: 502 });
  }
};

/** Netlify Functions v2 path config — serves at /api/rss-proxy directly. */
export const config = { path: '/api/rss-proxy' };
