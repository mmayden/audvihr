/**
 * security-headers.test.js — Validates that security headers in netlify.toml
 * and vercel.json are in sync and all required headers are present.
 *
 * Reads both deploy config files at test time and asserts:
 * 1. All required security headers exist in both configs
 * 2. Header values match between Netlify and Vercel
 * 3. CSP directives are identical
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');

/* ── Parse helpers ───────────────────────────────────────────────── */

/** Extract header key/value pairs from netlify.toml [headers.values] block. */
const parseNetlifyHeaders = (toml) => {
  const headers = {};
  // Match key = "value" lines inside [headers.values]
  const lines = toml.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s+([\w-]+)\s*=\s*"(.+)"\s*$/);
    if (m) headers[m[1]] = m[2];
  }
  return headers;
};

/** Extract header key/value pairs from vercel.json headers array. */
const parseVercelHeaders = (json) => {
  const headers = {};
  const config = JSON.parse(json);
  const globalHeaders = config.headers?.[0]?.headers ?? [];
  for (const h of globalHeaders) {
    headers[h.key] = h.value;
  }
  return headers;
};

/* ── Load configs ────────────────────────────────────────────────── */

const netlifyToml = readFileSync(resolve(ROOT, 'netlify.toml'), 'utf-8');
const vercelJson = readFileSync(resolve(ROOT, 'vercel.json'), 'utf-8');

const netlifyHeaders = parseNetlifyHeaders(netlifyToml);
const vercelHeaders = parseVercelHeaders(vercelJson);

/* ── Required headers (from CLAUDE.md security rules) ────────────── */

const REQUIRED_HEADERS = [
  'Content-Security-Policy',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
  'Strict-Transport-Security',
  'Cross-Origin-Opener-Policy',
  'Cross-Origin-Resource-Policy',
];

/* ── Required CSP directives ─────────────────────────────────────── */

const REQUIRED_CSP_DIRECTIVES = [
  'default-src',
  'script-src',
  'worker-src',
  'style-src',
  'font-src',
  'connect-src',
  'img-src',
  'frame-ancestors',
];

/** Parse CSP string into { directive: value } map. */
const parseCSP = (csp) => {
  const directives = {};
  for (const part of csp.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [directive, ...values] = trimmed.split(/\s+/);
    directives[directive] = values.join(' ');
  }
  return directives;
};

/* ── Tests ───────────────────────────────────────────────────────── */

describe('Security header parity (netlify.toml ↔ vercel.json)', () => {
  it.each(REQUIRED_HEADERS)('%s exists in netlify.toml', (header) => {
    expect(netlifyHeaders[header]).toBeDefined();
  });

  it.each(REQUIRED_HEADERS)('%s exists in vercel.json', (header) => {
    expect(vercelHeaders[header]).toBeDefined();
  });

  it.each(REQUIRED_HEADERS)('%s values match between configs', (header) => {
    expect(netlifyHeaders[header]).toBe(vercelHeaders[header]);
  });
});

describe('CSP directive completeness', () => {
  const netlifyCSP = parseCSP(netlifyHeaders['Content-Security-Policy'] ?? '');
  const vercelCSP = parseCSP(vercelHeaders['Content-Security-Policy'] ?? '');

  it.each(REQUIRED_CSP_DIRECTIVES)('%s directive present in netlify.toml CSP', (dir) => {
    expect(netlifyCSP[dir]).toBeDefined();
  });

  it.each(REQUIRED_CSP_DIRECTIVES)('%s directive present in vercel.json CSP', (dir) => {
    expect(vercelCSP[dir]).toBeDefined();
  });

  it('CSP strings are identical', () => {
    expect(netlifyHeaders['Content-Security-Policy']).toBe(vercelHeaders['Content-Security-Policy']);
  });
});

describe('CSP hardening', () => {
  const csp = netlifyHeaders['Content-Security-Policy'] ?? '';

  it('default-src is self only', () => {
    expect(csp).toContain("default-src 'self'");
  });

  it('script-src has no unsafe-inline or unsafe-eval', () => {
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('unsafe-eval');
  });

  it('frame-ancestors is none', () => {
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it('fonts are self-hosted (no external font domains)', () => {
    const directives = parseCSP(csp);
    expect(directives['font-src']).toBe("'self'");
    expect(directives['style-src']).toBe("'self'");
  });
});

describe('index.html security', () => {
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf-8');

  it('has noindex,nofollow robots meta', () => {
    expect(html).toContain('noindex');
    expect(html).toContain('nofollow');
  });

  it('has no external script/link tags without SRI', () => {
    // Match <script src="http..."> or <link href="http..."> that lack integrity
    const externalResources = html.match(/<(?:script|link)[^>]+(?:src|href)="https?:\/\/[^"]+"/g) ?? [];
    for (const tag of externalResources) {
      expect(tag).toContain('integrity');
    }
  });
});
