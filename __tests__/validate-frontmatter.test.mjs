import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePosts } from '../scripts/validate-frontmatter.mjs';

const withPosts = (posts, run) => {
  const root = mkdtempSync(join(tmpdir(), 'blog-validate-'));
  for (const [slug, body] of Object.entries(posts)) {
    mkdirSync(join(root, slug), { recursive: true });
    writeFileSync(join(root, slug, 'index.md'), body);
  }
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const valid = `---
title: 제목
date: 2024-09-05
summary: 요약
tags: [ethereum, dev-tools]
lang: ko
---

본문
`;

test('a valid post produces no errors', () => {
  withPosts({ 'good-post': valid }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('a missing required key is reported with the file path', () => {
  const missing = valid.replace('summary: 요약\n', '');
  withPosts({ 'bad-post': missing }, (root) => {
    const errors = validatePosts(root);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /bad-post/);
    assert.match(errors[0], /summary/);
  });
});

test('a non-ISO date is reported', () => {
  const bad = valid.replace('date: 2024-09-05', 'date: 2024/09/05');
  withPosts({ 'bad-date': bad }, (root) => {
    assert.match(validatePosts(root)[0], /date/);
  });
});

test('an uppercase tag is reported', () => {
  const bad = valid.replace('tags: [ethereum, dev-tools]', 'tags: [Ethereum]');
  withPosts({ 'bad-tag': bad }, (root) => {
    assert.match(validatePosts(root)[0], /tag/i);
  });
});

test('a cover pointing at a missing file is reported', () => {
  const bad = valid.replace('lang: ko', 'lang: ko\ncover: ./nope.webp');
  withPosts({ 'bad-cover': bad }, (root) => {
    assert.match(validatePosts(root)[0], /nope\.webp/);
  });
});

test('a body that repeats the title as an h1 is reported', () => {
  const bad = `${valid}\n# 제목\n`;
  withPosts({ 'dup-title': bad }, (root) => {
    assert.match(validatePosts(root)[0], /h1|# /);
  });
});

test('an unknown frontmatter key is reported', () => {
  const bad = valid.replace('lang: ko', 'lang: ko\nauthor: 나');
  withPosts({ 'extra-key': bad }, (root) => {
    assert.match(validatePosts(root)[0], /author/);
  });
});
