/**
 * rss-proxy — Vercel serverless function that proxies MMA RSS feeds server-side,
 * bypassing browser CORS restrictions.
 *
 * Security: strict allowlist — only the two configured RSS feed URLs are permitted.
 * An unrecognised or missing `url` query param returns 403 immediately, preventing
 * this function from being used as an open proxy (SSRF risk).
 *
 * Path: /api/rss-proxy (auto-routed by Vercel from the api/ directory).
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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const url = req.query.url;

  if (!url || !ALLOWED_URLS.has(url)) {
    res.status(403).send('Forbidden');
    return;
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
      res.status(502).send(`Upstream error: ${upstream.status}`);
      return;
    }

    const text = await upstream.text();

    if (text.length > MAX_RESPONSE_BYTES) {
      res.status(502).send('Upstream response too large');
      return;
    }

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    // 30 min browser cache — matches the app's sessionStorage cache TTL
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(text);
  } catch {
    res.status(502).send('Upstream unreachable');
  }
}
