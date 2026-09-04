#!/usr/bin/env node
// Frontmatter guard for content/posts/<slug>/index.md.
//
// This mirrors the zod schema in kyle-server's packages/blog-site/src/
// content.config.ts. The build is the hard gate; this hook exists so a typo
// fails at commit time instead of showing up as a silently missing post ten
// minutes later. No dependencies on purpose — it runs from a bare checkout.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED = ['title', 'date', 'summary', 'tags'];
const OPTIONAL = ['updated', 'cover', 'draft', 'lang'];
const KNOWN = new Set([...REQUIRED, ...OPTIONAL]);
// Array-typed fields that may be written as an empty YAML block sequence
// (a bare `key:` line followed by no `- item` lines), which we treat as `[]`.
const ARRAY_FIELDS = new Set(['tags']);
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Minimal frontmatter reader: `key: value` pairs, `[a, b]` arrays, and
 *  YAML block sequences (`key:` followed by `- item` lines). */
function parseFrontmatter(raw) {
  if (!raw.startsWith('---\n')) return { fields: null, body: raw };
  const end = raw.indexOf('\n---', 4);
  if (end === -1) return { fields: null, body: raw };

  const fields = {};
  const lines = raw.slice(4, end).split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue;
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();

    if (value === '') {
      // Possible YAML block sequence: a `key:` line followed by `- item` lines.
      const items = [];
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

    if (value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '');
    }
    fields[key] = value;
  }
  return { fields, body: raw.slice(end + 4) };
}

/** True if `value` is `YYYY-MM-DD` for a date that actually exists on the
 *  calendar (rejects e.g. 2024-02-30 and 2024-13-45, which `new Date()`
 *  would otherwise silently normalize instead of rejecting). */
function isRealCalendarDate(value) {
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

export function validatePosts(root) {
  const errors = [];
  if (!existsSync(root)) return [`content directory missing: ${root}`];

  const slugs = readdirSync(root).filter((name) =>
    statSync(join(root, name)).isDirectory(),
  );

  const seen = new Set();
  for (const slug of slugs) {
    const file = join(slug, 'index.md');
    const path = join(root, file);
    const at = (msg) => errors.push(`${file}: ${msg}`);

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

    for (const key of ['date', 'updated']) {
      const value = fields[key];
      if (value === undefined) continue;
      if (!ISO_DATE.test(value)) {
        at(`${key} must be YYYY-MM-DD, got "${value}"`);
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

    if (fields.lang !== undefined && !['ko', 'en'].includes(fields.lang)) {
      at(`lang must be ko or en, got "${fields.lang}"`);
    }

    if (
      fields.draft !== undefined &&
      !['true', 'false'].includes(fields.draft)
    ) {
      at(`draft must be true or false, got "${fields.draft}"`);
    }

    if (fields.cover !== undefined) {
      const rel = String(fields.cover).replace(/^\.\//, '');
      if (!existsSync(join(root, slug, rel)))
        at(`cover file not found: ${fields.cover}`);
    }

    // Strip fenced code blocks before checking for a stray h1 — a shell
    // comment like `# install deps` inside a ```sh fence is not a heading.
    const prose = body.replace(/```[\s\S]*?```/g, '');
    if (/^# /m.test(prose)) {
      at('body must not contain an h1 (# ) — the title comes from frontmatter');
    }
  }

  return errors;
}

const isMain = process.argv[1]?.endsWith('validate-frontmatter.mjs');
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
