#!/usr/bin/env node
// Frontmatter guard for content/posts/<slug>/index.md.
//
// This mirrors the zod schema in kyle-server's packages/blog-site/src/
// content.config.ts. The build is the hard gate; this hook exists so a typo
// fails at commit time instead of showing up as a silently missing post ten
// minutes later. No runtime dependencies on purpose - it runs from a bare
// checkout, and node strips the types itself (node >= 22.18; this repo runs
// on node 24).

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** A frontmatter value is a scalar or, for `tags`, a list. */
type FieldValue = string | string[];
type Fields = Record<string, FieldValue>;

const REQUIRED = ['title', 'date', 'summary', 'tags'] as const;
const OPTIONAL = ['updated', 'cover', 'draft', 'lang'] as const;
const KNOWN: ReadonlySet<string> = new Set<string>([...REQUIRED, ...OPTIONAL]);
// Array-typed fields that may be written as an empty YAML block sequence
// (a bare `key:` line followed by no `- item` lines), which we treat as `[]`.
const ARRAY_FIELDS: ReadonlySet<string> = new Set(['tags']);
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Minimal frontmatter reader: `key: value` pairs, `[a, b]` arrays, and
 *  YAML block sequences (`key:` followed by `- item` lines). */
function parseFrontmatter(raw: string): {
  fields: Fields | null;
  body: string;
} {
  if (!raw.startsWith('---\n')) return { fields: null, body: raw };
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return { fields: null, body: raw };

  const fields: Fields = {};
  const lines = raw.slice(4, end).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const rawValue = line.slice(colon + 1).trim();

    if (rawValue === '') {
      // Possible YAML block sequence: a `key:` line followed by `- item` lines.
      const items: string[] = [];
      let j = i + 1;
      while (j < lines.length && /^\s*-(\s|$)/.test(lines[j])) {
        items.push(lines[j].replace(/^\s*-\s*/, '').trim());
        j++;
      }
      if (items.length > 0 || ARRAY_FIELDS.has(key)) {
        fields[key] = items;
        i = j - 1;
        continue;
      }
    }

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      fields[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '');
    } else {
      fields[key] = rawValue;
    }
  }
  return { fields, body: raw.slice(end + 4) };
}

/**
 * Returns `body` with fenced code blocks removed, so headings can be
 * checked against prose only. A line-based scan, not a regex, because a
 * regex like /```[\s\S]*?```/ gets fenced code wrong in two ways: it never
 * closes on a truly unterminated fence (leaving everything after it
 * unstripped instead of treating it as still-fenced), and it closes early
 * on a fence opened with four-or-more backticks that embeds a literal
 * triple-backtick span (the entire reason longer fences exist).
 *
 * Follows the CommonMark rule: a fence opens on a line whose first
 * non-whitespace run is three or more backticks, and only a *closing*
 * line - backticks only, nothing else but whitespace - whose run is at
 * least as long as the opener's closes it. A fence left open at end of
 * input simply never closes, so everything after it counts as fenced.
 */
function stripFencedCode(body: string): string {
  const lines = body.split('\n');
  const kept: string[] = [];
  let fenceLength = 0; // 0 = not currently inside a fence

  for (const line of lines) {
    if (fenceLength === 0) {
      const open = /^\s*(`{3,})/.exec(line);
      if (open) {
        fenceLength = open[1].length;
      } else {
        kept.push(line);
      }
      continue;
    }

    const close = /^\s*(`{3,})\s*$/.exec(line);
    if (close && close[1].length >= fenceLength) {
      fenceLength = 0;
    }
    // Every line strictly inside the fence - including its own open/close
    // delimiter lines - is never a candidate for the h1 check.
  }

  return kept.join('\n');
}

/** True if `value` is `YYYY-MM-DD` for a date that actually exists on the
 *  calendar (rejects e.g. 2024-02-30 and 2024-13-45, which `new Date()`
 *  would otherwise silently normalize instead of rejecting). */
function isRealCalendarDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

export function validatePosts(root: string): string[] {
  const errors: string[] = [];
  if (!existsSync(root)) return [`content directory missing: ${root}`];

  const slugs = readdirSync(root).filter((name) =>
    statSync(join(root, name)).isDirectory(),
  );

  const seen = new Set<string>();
  for (const slug of slugs) {
    const file = join(slug, 'index.md');
    const path = join(root, file);
    const at = (msg: string): number => errors.push(`${file}: ${msg}`);

    if (!KEBAB.test(slug))
      at(`directory name "${slug}" must be lowercase kebab-case`);
    if (seen.has(slug)) at(`duplicate slug "${slug}"`);
    seen.add(slug);

    if (!existsSync(path)) {
      at('missing index.md');
      continue;
    }

    const { fields, body } = parseFrontmatter(readFileSync(path, 'utf8'));
    if (fields === null) {
      at('missing or unterminated frontmatter block');
      continue;
    }

    for (const key of REQUIRED) {
      if (fields[key] === undefined || fields[key] === '')
        at(`missing required key: ${key}`);
    }
    for (const key of Object.keys(fields)) {
      if (!KNOWN.has(key)) at(`unknown frontmatter key: ${key}`);
    }

    for (const key of ['date', 'updated'] as const) {
      const value = fields[key];
      if (value === undefined) continue;
      // A date written as a YAML list is already wrong; report it as a
      // format error rather than letting String() flatten it into
      // something that could accidentally pass the ISO test.
      if (typeof value !== 'string' || !ISO_DATE.test(value)) {
        at(`${key} must be YYYY-MM-DD, got "${String(value)}"`);
      } else if (!isRealCalendarDate(value)) {
        at(`${key} is not a real calendar date: "${value}"`);
      }
    }

    const tags = fields.tags;
    if (tags !== undefined) {
      if (!Array.isArray(tags)) {
        at('tags must be an array, e.g. tags: [ethereum, dev-tools]');
      } else {
        for (const tag of tags) {
          if (!KEBAB.test(tag)) at(`tag "${tag}" must be lowercase kebab-case`);
        }
      }
    }

    const lang = fields.lang;
    if (lang !== undefined && (typeof lang !== 'string' || !['ko', 'en'].includes(lang))) {
      at(`lang must be ko or en, got "${String(lang)}"`);
    }

    const draft = fields.draft;
    if (
      draft !== undefined &&
      (typeof draft !== 'string' || !['true', 'false'].includes(draft))
    ) {
      at(`draft must be true or false, got "${String(draft)}"`);
    }

    const cover = fields.cover;
    if (cover !== undefined) {
      const rel = String(cover).replace(/^\.\//, '');
      if (!existsSync(join(root, slug, rel)))
        at(`cover file not found: ${String(cover)}`);
    }

    // Strip fenced code blocks before checking for a stray h1 - a shell
    // comment like `# install deps` inside a ```sh fence is not a heading.
    const prose = stripFencedCode(body);
    if (/^# /m.test(prose)) {
      at('body must not contain an h1 (# ) - the title comes from frontmatter');
    }
  }

  return errors;
}

const isMain = process.argv[1]?.endsWith('validate-frontmatter.ts') === true;
if (isMain) {
  const root = process.argv[2] ?? 'content/posts';
  const errors = validatePosts(root);
  if (errors.length > 0) {
    console.error('frontmatter validation failed:');
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  console.log('frontmatter OK');
}
