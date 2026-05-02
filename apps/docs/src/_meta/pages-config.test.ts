/**
 * Cloudflare Pages config meta-gates.
 *
 * Locks the contract between `apps/docs/wrangler.jsonc` and the deploy
 * workflow (`--project-name`, `working-directory`, build output). Each
 * Phase 2 P1 task adds new assertions to this file as artefacts land.
 *
 * Source-of-truth: files under `apps/docs/public/` and
 * `apps/docs/wrangler.jsonc`. The build step copies `public/*` to
 * `dist/*` verbatim, so the public-folder assertions are sufficient.
 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  findMissingArtefacts,
  REQUIRED_PAGES_ARTEFACTS
} from '../../scripts/verify-dist-pages-artefacts.mjs';

// __dirname here = apps/docs/src/_meta. Walk up to apps/docs.
const DOCS_ROOT = join(__dirname, '..', '..');
const PUBLIC_ROOT = join(DOCS_ROOT, 'public');

/**
 * Parse a Cloudflare Pages `_headers` file into `{ pattern: { name: value } }`.
 * Spec: https://developers.cloudflare.com/pages/configuration/headers/
 *
 * - First non-indented, non-comment line in a block is the URL pattern.
 * - Subsequent indented lines are `Name: value` pairs.
 * - Blank line ends a block. `#` starts a comment line.
 */
function parseHeadersFile(
  input: string
): Record<string, Record<string, string>> {
  const blocks: Record<string, Record<string, string>> = {};
  let current: string | null = null;
  for (const rawLine of input.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line.trim() === '' || line.trim().startsWith('#')) {
      if (line.trim() === '') current = null;
      continue;
    }
    const isIndented = /^\s/.test(line);
    if (!isIndented) {
      current = line.trim();
      blocks[current] ??= {};
      continue;
    }
    if (current === null) continue;
    const trimmed = line.trim();
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const name = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    blocks[current][name] = value;
  }
  return blocks;
}

/**
 * Strip `//` line comments from JSONC, ignoring matches inside double-quoted strings.
 * Sufficient for our wrangler.jsonc — we never use block comments there.
 */
function stripJsoncLineComments(input: string): string {
  let out = '';
  let inString = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (inString) {
      out += ch;
      if (ch === '\\' && next !== undefined) {
        out += next;
        i++;
        continue;
      }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < input.length && input[i] !== '\n') i++;
      if (i < input.length) out += '\n';
      continue;
    }
    out += ch;
  }
  return out;
}

describe('wrangler.jsonc — Cloudflare Pages config', () => {
  const raw = readFileSync(join(DOCS_ROOT, 'wrangler.jsonc'), 'utf8');
  const config = JSON.parse(stripJsoncLineComments(raw)) as Record<
    string,
    unknown
  >;

  it('declares the canonical Pages project name', () => {
    // Must match `--project-name=fcc-design` in deploy-docs.yml.
    expect(config.name).toBe('fcc-design');
  });

  it('points at Astro `dist/` as the build output', () => {
    expect(config.pages_build_output_dir).toBe('./dist');
  });

  it('pins a `compatibility_date` in yyyy-mm-dd form', () => {
    expect(config.compatibility_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('declares no Functions bindings (SSG only)', () => {
    // Reject bindings that imply Pages Functions / Workers runtime.
    // Re-evaluate when SSR / edge work is in scope.
    const forbidden = [
      'kv_namespaces',
      'd1_databases',
      'r2_buckets',
      'queues',
      'durable_objects',
      'analytics_engine_datasets',
      'hyperdrive',
      'vectorize',
      'ai',
      'browser',
      'services',
      'mtls_certificates',
      'send_email',
      'dispatch_namespaces',
      'unsafe',
      'vars'
    ];
    for (const key of forbidden) {
      expect(
        config[key],
        `${key} present — SSG site should not need it`
      ).toBeUndefined();
    }
  });
});

describe('public/_headers — Cloudflare Pages headers', () => {
  const raw = readFileSync(join(PUBLIC_ROOT, '_headers'), 'utf8');
  const blocks = parseHeadersFile(raw);

  describe('global security headers under `/*`', () => {
    const globals = blocks['/*'];

    it('block exists', () => {
      expect(globals, 'no `/*` block in _headers').toBeDefined();
    });

    it('declares HSTS with includeSubDomains + preload', () => {
      expect(globals['Strict-Transport-Security']).toMatch(
        /max-age=\d+;\s*includeSubDomains;\s*preload/
      );
    });

    it('disables MIME sniffing', () => {
      expect(globals['X-Content-Type-Options']).toBe('nosniff');
    });

    it('denies framing (clickjacking guard)', () => {
      expect(globals['X-Frame-Options']).toBe('DENY');
    });

    it('sets a strict referrer policy', () => {
      expect(globals['Referrer-Policy']).toBe(
        'strict-origin-when-cross-origin'
      );
    });

    it('opts out of the obvious Permissions-Policy features', () => {
      const policy = globals['Permissions-Policy'] ?? '';
      const requiredOptOut = [
        'accelerometer',
        'camera',
        'geolocation',
        'gyroscope',
        'microphone',
        'payment',
        'usb',
        'interest-cohort'
      ];
      for (const feature of requiredOptOut) {
        expect(policy, `Permissions-Policy missing ${feature}=()`).toMatch(
          new RegExp(`${feature}=\\(\\)`)
        );
      }
    });

    it('ships CSP in Report-Only mode for the first deploy window', () => {
      // Promote to enforce-mode in a separate, explicit follow-up commit
      // only after observed violations = 0 for >= 7 days. See ADR-0007.
      const csp = globals['Content-Security-Policy-Report-Only'];
      expect(csp, 'CSP-Report-Only header missing').toBeTruthy();
      expect(globals['Content-Security-Policy']).toBeUndefined();
      // Sanity-check the directive baseline.
      for (const directive of [
        "default-src 'self'",
        "script-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'"
      ]) {
        expect(csp).toContain(directive);
      }
    });
  });

  describe('cache rules', () => {
    it('immutable-caches Astro hashed assets for one year', () => {
      expect(blocks['/_astro/*']?.['Cache-Control']).toBe(
        'public, max-age=31536000, immutable'
      );
    });

    it('immutable-caches `/assets/*` for one year', () => {
      expect(blocks['/assets/*']?.['Cache-Control']).toBe(
        'public, max-age=31536000, immutable'
      );
    });

    it('caches brand + uikit folders for one day', () => {
      expect(blocks['/brand/*']?.['Cache-Control']).toBe(
        'public, max-age=86400'
      );
      expect(blocks['/uikit/*']?.['Cache-Control']).toBe(
        'public, max-age=86400'
      );
    });
  });

  describe('preview-URL hardening', () => {
    it('keeps `*.pages.dev` previews out of search engines', () => {
      const projectPreview = blocks['https://:project.pages.dev/*'];
      const versionPreview = blocks['https://:version.:project.pages.dev/*'];
      expect(projectPreview?.['X-Robots-Tag']).toBe('noindex');
      expect(versionPreview?.['X-Robots-Tag']).toBe('noindex');
    });
  });
});

describe('public/_redirects — Cloudflare Pages redirects', () => {
  const path = join(PUBLIC_ROOT, '_redirects');

  it('file exists (CF Pages parses it during deploy)', () => {
    expect(() => readFileSync(path, 'utf8')).not.toThrow();
  });

  it('every non-comment, non-blank line matches `[source] [destination] [code?]`', () => {
    // Spec: https://developers.cloudflare.com/pages/configuration/redirects/
    const raw = readFileSync(path, 'utf8');
    const ruleLine = /^\S+\s+\S+(?:\s+\d{3})?\s*$/;
    const offenders: Array<{ line: number; text: string }> = [];
    raw.split('\n').forEach((rawLine, idx) => {
      const line = rawLine.replace(/\r$/, '');
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) return;
      if (!ruleLine.test(line)) {
        offenders.push({ line: idx + 1, text: line });
      }
    });
    expect(
      offenders,
      `malformed _redirects rule(s):\n${offenders
        .map(o => `  L${o.line}: ${o.text}`)
        .join('\n')}`
    ).toEqual([]);
  });
});

describe('public/robots.txt — crawler directives', () => {
  const raw = readFileSync(join(PUBLIC_ROOT, 'robots.txt'), 'utf8');

  it('declares a wildcard User-agent rule', () => {
    expect(raw).toMatch(/^User-agent:\s*\*\s*$/m);
  });

  it('points crawlers at the absolute sitemap URL', () => {
    // Sitemap directive must be absolute per https://www.rfc-editor.org/rfc/rfc9309#name-sitemap
    expect(raw).toMatch(
      /^Sitemap:\s*https:\/\/design\.freecodecamp\.org\/sitemap-index\.xml\s*$/m
    );
  });
});

describe('verify-dist-pages-artefacts.mjs — post-build gate', () => {
  it('declares the canonical Cloudflare Pages artefact list', () => {
    // Order is documentation-only, but presence locks the contract.
    expect([...REQUIRED_PAGES_ARTEFACTS].sort()).toEqual([
      '_headers',
      '_redirects',
      'favicon.svg',
      'robots.txt',
      'sitemap-0.xml',
      'sitemap-index.xml'
    ]);
  });

  it('reports every artefact as missing when the dist dir is empty', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'fcc-pages-empty-'));
    expect(findMissingArtefacts(tmp)).toEqual([...REQUIRED_PAGES_ARTEFACTS]);
  });

  it('reports zero missing when every artefact exists', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'fcc-pages-full-'));
    for (const name of REQUIRED_PAGES_ARTEFACTS) {
      writeFileSync(join(tmp, name), '');
    }
    expect(findMissingArtefacts(tmp)).toEqual([]);
  });

  it('reports the gap when a single artefact is absent', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'fcc-pages-gap-'));
    for (const name of REQUIRED_PAGES_ARTEFACTS) {
      if (name === '_headers') continue;
      writeFileSync(join(tmp, name), '');
    }
    expect(findMissingArtefacts(tmp)).toEqual(['_headers']);
  });

  it('agrees that every artefact already lives under apps/docs/public/ at source', () => {
    // This is the source-of-truth half of the contract: build copies
    // public/ verbatim. If anything goes missing here, the post-build
    // CLI gate also fails.
    const sourceMissing = findMissingArtefacts(PUBLIC_ROOT).filter(
      // Sitemap files are emitted by `@astrojs/sitemap` at build time, not
      // tracked in `public/`; skip them in the source-of-truth check.
      name => !name.startsWith('sitemap')
    );
    expect(sourceMissing).toEqual([]);
  });
});
