import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  findCdnBundleProblems,
  findMissingArtefacts,
  REQUIRED_CDN_ARTEFACTS,
  REQUIRED_GENERATED_ARTEFACTS,
  REQUIRED_PAGES_ARTEFACTS
} from '../../scripts/verify-dist-pages-artefacts.mjs';

// __dirname here = apps/docs/src/_meta. Walk up to apps/docs.
const DOCS_ROOT = join(__dirname, '..', '..');
const PUBLIC_ROOT = join(DOCS_ROOT, 'public');

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

describe('public/_headers - Cloudflare Pages headers', () => {
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

describe('public/_redirects - Cloudflare Pages redirects', () => {
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

describe('public/robots.txt - crawler directives', () => {
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

describe('playwright.config.ts - snapshot path template', () => {
  it('encodes `{platform}` so macOS + Linux goldens coexist', () => {
    // Goldens diverge pixel-for-pixel between macOS + Linux Chromium
    // even at the same version. CI Ubuntu compares `*-linux.png`,
    // local macOS compares `*-darwin.png`. See ADR-0007 + the PH4
    // closeout note for the rationale.
    const config = readFileSync(
      join(DOCS_ROOT, 'playwright.config.ts'),
      'utf8'
    );
    expect(config).toMatch(
      /snapshotPathTemplate:\s*\n?\s*['"][^'"]*\{projectName\}-\{platform\}\{ext\}['"]/
    );
  });
});

describe('verify-dist-pages-artefacts.mjs - post-build gate', () => {
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

  it('declares the build-generated registry artefact list', () => {
    // These come from prerendered endpoints, not public/, so they live in
    // their own list - the public/ source-of-truth check must skip them.
    expect([...REQUIRED_GENERATED_ARTEFACTS].sort()).toEqual([
      'llms-full.txt',
      'llms.txt',
      'registry/index.json',
      'registry/starter.md',
      'registry/theme.md'
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

  it('declares the rolling, unversioned CDN bundle artefact list', () => {
    // See apps/docs/scripts/build-cdn-bundle.mjs - no version aliases.
    expect([...REQUIRED_CDN_ARTEFACTS].sort()).toEqual([
      'cdn/components.min.css',
      'cdn/manifest.json',
      'cdn/sprite.svg',
      'cdn/styles.min.css',
      'cdn/tokens.min.css',
      'cdn/uikit.global.js'
    ]);
  });

  it('reports a missing manifest as a single CDN bundle problem', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'fcc-cdn-empty-'));
    expect(findCdnBundleProblems(tmp)).toEqual(['cdn/manifest.json missing']);
  });
});
