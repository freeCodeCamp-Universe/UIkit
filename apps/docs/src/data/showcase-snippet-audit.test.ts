// Audit every showcase React snippet against exported uikit Props interfaces.
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(here, '..', '..');
const repoRoot = resolve(appRoot, '..', '..');
const uikitSrc = resolve(repoRoot, 'packages', 'uikit', 'src');
const showcaseDir = resolve(appRoot, 'src', 'showcase');

interface ComponentInfo {
  /** Exported component name. */
  name: string;
  /** Absolute path to source `.tsx`. */
  sourceFile: string;
}

/** Collect uppercase-named exports across packages/uikit/src — picks up co-located subcomponents. */
function discoverComponents(): Map<string, ComponentInfo> {
  const map = new Map<string, ComponentInfo>();
  const stack: string[] = [uikitSrc];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        stack.push(resolve(dir, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.tsx')) continue;
      if (entry.name.endsWith('.test.tsx')) continue;
      const first = entry.name.charAt(0);
      if (first !== first.toUpperCase()) continue;
      const fileName = entry.name.replace(/\.tsx$/, '');
      const sourceFile = resolve(dir, entry.name);
      map.set(fileName, { name: fileName, sourceFile });
      const src = readFileSync(sourceFile, 'utf8');
      for (const re of [
        /export\s+const\s+([A-Z][A-Za-z0-9]*)\s*[=:]/g,
        /export\s+function\s+([A-Z][A-Za-z0-9]*)\s*\(/g,
        /export\s+\{\s*([^}]+)\s*\}/g
      ]) {
        let m: RegExpExecArray | null;
        while ((m = re.exec(src)) !== null) {
          const captured = m[1];
          for (const piece of captured.split(',')) {
            const name = piece
              .trim()
              .split(/\s+as\s+/)[0]
              .trim();
            if (/^[A-Z][A-Za-z0-9]*$/.test(name) && !map.has(name)) {
              map.set(name, { name, sourceFile });
            }
          }
        }
      }
    }
  }
  return map;
}

/** Returns explicit prop names + a flag set when the interface extends *HTMLAttributes (DOM-flexible). */
function readProps(
  sourceFile: string,
  componentName: string
): { explicit: Set<string>; htmlFlexible: boolean } {
  const src = readFileSync(sourceFile, 'utf8');
  const ast = ts.createSourceFile(
    sourceFile,
    src,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  const targetNames = [`${componentName}Props`, `${componentName}OwnProps`];
  const explicit = new Set<string>();
  let htmlFlexible = false;

  function walk(node: ts.Node): void {
    if (
      ts.isInterfaceDeclaration(node) &&
      targetNames.includes(node.name.text)
    ) {
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && ts.isIdentifier(member.name)) {
          explicit.add(member.name.text);
        }
      }
      for (const heritage of node.heritageClauses ?? []) {
        for (const type of heritage.types) {
          const text = type.getText();
          if (
            text.includes('HTMLAttributes') ||
            text.includes('SVGAttributes') ||
            text.includes('DOMAttributes')
          ) {
            htmlFlexible = true;
          }
        }
      }
    }
    if (
      ts.isTypeAliasDeclaration(node) &&
      targetNames.includes(node.name.text)
    ) {
      const visit = (t: ts.Node): void => {
        if (ts.isTypeLiteralNode(t)) {
          for (const m of t.members) {
            if (ts.isPropertySignature(m) && ts.isIdentifier(m.name)) {
              explicit.add(m.name.text);
            }
          }
        }
        ts.forEachChild(t, visit);
      };
      visit(node.type);
      // Type-alias unions: can't statically resolve every member, so accept any prop.
      htmlFlexible = true;
    }
    ts.forEachChild(node, walk);
  }
  walk(ast);
  return { explicit, htmlFlexible };
}

/** Pull each `code={\`...\`}` payload from a React `<Code slot='react'>`. */
function extractReactSnippets(astroSrc: string): string[] {
  const out: string[] = [];
  const reactBlockRe =
    /<Code\s+slot=['"]react['"][\s\S]*?code=\{`([\s\S]*?)`\}/g;
  let m: RegExpExecArray | null;
  while ((m = reactBlockRe.exec(astroSrc)) !== null) {
    out.push(m[1]);
  }
  return out;
}

/** Yield `[tagName, [propName, ...]]` from a JSX-like string. Accepts member-access tags (`Modal.Body`). */
function extractJsxTagsAndProps(jsx: string): Array<{
  tag: string;
  props: string[];
}> {
  const hits: Array<{ tag: string; props: string[] }> = [];
  const tagRe = /<([A-Z][A-Za-z0-9]*(?:\.[A-Z][A-Za-z0-9]*)*)\b([\s\S]*?)\/?>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(jsx)) !== null) {
    const tag = m[1];
    const rest = m[2] ?? '';
    const props: string[] = [];
    let i = 0;
    while (i < rest.length) {
      while (i < rest.length && /\s/.test(rest[i])) i++;
      if (i >= rest.length) break;
      const nameStart = i;
      while (i < rest.length && /[A-Za-z0-9_-]/.test(rest[i])) i++;
      const name = rest.slice(nameStart, i);
      if (!name) {
        i++;
        continue;
      }
      props.push(name);
      if (rest[i] === '=') {
        i++;
        if (rest[i] === '{') {
          let depth = 1;
          i++;
          while (i < rest.length && depth > 0) {
            if (rest[i] === '{') depth++;
            else if (rest[i] === '}') depth--;
            i++;
          }
        } else if (rest[i] === '"' || rest[i] === "'") {
          const q = rest[i];
          i++;
          while (i < rest.length && rest[i] !== q) i++;
          i++;
        } else {
          while (i < rest.length && !/\s/.test(rest[i])) i++;
        }
      }
    }
    hits.push({ tag, props });
  }
  return hits;
}

/** Framework attrs accepted on every component without declaration. */
const FRAMEWORK_ATTRS = new Set<string>([
  'key',
  'ref',
  'children',
  'className',
  'style',
  'id'
]);

function isFrameworkAttr(name: string): boolean {
  if (FRAMEWORK_ATTRS.has(name)) return true;
  if (name.startsWith('aria-')) return true;
  if (name.startsWith('data-')) return true;
  if (name.startsWith('on') && name[2] === name[2]?.toUpperCase()) return true;
  return false;
}

const components = discoverComponents();

/** `Modal.Body` → `Modal`. Subcomponents inherit parent source. */
function rootTag(tag: string): string {
  return tag.split('.')[0];
}

const showcaseFiles = readdirSync(showcaseDir).filter(f =>
  f.endsWith('.astro')
);

test('every showcase React snippet uses tags exported from uikit', () => {
  const violations: string[] = [];
  for (const file of showcaseFiles) {
    const src = readFileSync(resolve(showcaseDir, file), 'utf8');
    const snippets = extractReactSnippets(src);
    for (const snippet of snippets) {
      for (const { tag } of extractJsxTagsAndProps(snippet)) {
        if (tag === 'Fragment') continue;
        const root = rootTag(tag);
        if (!components.has(root)) {
          violations.push(
            `${file}: <${tag}> not exported from @freecodecamp/uikit`
          );
        }
      }
    }
  }
  assert.deepEqual(
    violations,
    [],
    `unknown JSX tags in showcase React snippets:\n  ${violations.join('\n  ')}`
  );
});

test('every showcase React snippet uses ONLY declared props', () => {
  const violations: string[] = [];
  for (const file of showcaseFiles) {
    const src = readFileSync(resolve(showcaseDir, file), 'utf8');
    const snippets = extractReactSnippets(src);
    for (const snippet of snippets) {
      for (const { tag, props } of extractJsxTagsAndProps(snippet)) {
        if (tag === 'Fragment') continue;
        // Subcomponents (Modal.Body) validate against root source only — accept any prop.
        const isMember = tag.includes('.');
        const root = rootTag(tag);
        const info = components.get(root);
        if (!info) continue;
        if (isMember) continue;
        const { explicit, htmlFlexible } = readProps(info.sourceFile, tag);
        for (const prop of props) {
          if (isFrameworkAttr(prop)) continue;
          if (explicit.has(prop)) continue;
          if (htmlFlexible) continue;
          violations.push(
            `${file}: <${tag} ${prop}=...> — not declared on ${tag}Props`
          );
        }
      }
    }
  }
  assert.deepEqual(
    violations,
    [],
    `unknown props in showcase React snippets:\n  ${violations.join('\n  ')}`
  );
});

test('discoverComponents finds the obvious primitives + actions', () => {
  for (const required of ['Button', 'Heading', 'Text', 'Modal', 'Tabs']) {
    assert.ok(
      components.has(required),
      `discoverComponents missed ${required} — audit would silently no-op`
    );
  }
  assert.ok(
    components.size >= 30,
    `expected 30+ components, found ${components.size}`
  );
});

for (const file of showcaseFiles) {
  test(`showcase audit — ${basename(file)}`, () => {
    const src = readFileSync(resolve(showcaseDir, file), 'utf8');
    const snippets = extractReactSnippets(src);
    if (!snippets.length) return;
    for (const snippet of snippets) {
      for (const { tag, props } of extractJsxTagsAndProps(snippet)) {
        if (tag === 'Fragment') continue;
        const isMember = tag.includes('.');
        const root = rootTag(tag);
        const info = components.get(root);
        assert.ok(
          info,
          `<${tag}> in ${file} is not an exported uikit component`
        );
        if (!info) continue;
        if (isMember) continue;
        const { explicit, htmlFlexible } = readProps(info.sourceFile, tag);
        for (const prop of props) {
          if (isFrameworkAttr(prop)) continue;
          if (htmlFlexible) continue;
          assert.ok(
            explicit.has(prop),
            `<${tag} ${prop}=...> in ${file} — not on ${tag}Props`
          );
        }
      }
    }
  });
}
