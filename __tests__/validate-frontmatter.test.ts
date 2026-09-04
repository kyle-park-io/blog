import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePosts } from '../scripts/validate-frontmatter.ts';

const withPosts = <T,>(
  posts: Record<string, string>,
  run: (root: string) => T,
): T => {
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

// --- Finding 1: the h1 check must not fire on code-fence content. ---

test('an h1-looking comment inside a fenced code block is not reported', () => {
  const withFence = `${valid}\n\`\`\`sh\n# install deps\nyarn install\n\`\`\`\n`;
  withPosts({ 'fenced-comment': withFence }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('a real h1 in the body is still reported even when the post also has a fence', () => {
  const withFence = `${valid}\n\`\`\`sh\n# install deps\n\`\`\`\n\n# 제목\n`;
  withPosts({ 'fence-plus-h1': withFence }, (root) => {
    assert.match(validatePosts(root)[0], /h1|# /);
  });
});

test('a fenced code block at the end of the file with no trailing newline is not reported', () => {
  const withFence = `${valid}\n\`\`\`sh\n# install deps\n\`\`\``;
  withPosts({ 'fenced-eof': withFence }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('an unterminated fence containing a # comment is not reported (gap A)', () => {
  // The fence never closes: everything after the opener, to the end of the
  // file, must be treated as still inside it.
  const unterminated = `${valid}\n\`\`\`sh\n# comment\nyarn install\n`;
  withPosts({ 'unterminated-fence': unterminated }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('a four-backtick fence with an embedded triple-backtick span is not reported (gap B)', () => {
  // The outer fence opens with 4 backticks and contains a literal ``` span
  // (e.g. documenting markdown syntax); only a closing run of >=4 backticks
  // may end it, so the embedded triple must not close it early.
  const nested = [
    valid,
    '',
    '````markdown',
    '```js',
    '# comment',
    '```',
    '````',
    '',
  ].join('\n');
  withPosts({ 'nested-fence': nested }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

// --- Finding 2: tags may be written as a YAML block sequence. ---

test('tags written as a YAML block sequence produce no errors', () => {
  const blockTags = valid.replace(
    'tags: [ethereum, dev-tools]',
    'tags:\n  - ethereum\n  - dev-tools',
  );
  withPosts({ 'block-tags': blockTags }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('an empty inline tag list produces no errors', () => {
  const emptyInline = valid.replace('tags: [ethereum, dev-tools]', 'tags: []');
  withPosts({ 'empty-inline-tags': emptyInline }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

test('an empty tags key with no block items produces no errors', () => {
  const emptyBlock = valid.replace('tags: [ethereum, dev-tools]', 'tags:');
  withPosts({ 'empty-block-tags': emptyBlock }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});

// --- Finding 3: date must be a real calendar date, not just YYYY-MM-DD shaped. ---

test('an impossible month is reported', () => {
  const bad = valid.replace('date: 2024-09-05', 'date: 2024-13-01');
  withPosts({ 'bad-month': bad }, (root) => {
    assert.match(validatePosts(root)[0], /date/);
  });
});

test('an impossible day is reported', () => {
  const bad = valid.replace('date: 2024-09-05', 'date: 2024-02-30');
  withPosts({ 'bad-day': bad }, (root) => {
    assert.match(validatePosts(root)[0], /date/);
  });
});

test('a valid leap day produces no errors', () => {
  const leap = valid.replace('date: 2024-09-05', 'date: 2024-02-29');
  withPosts({ 'leap-day': leap }, (root) => {
    assert.deepEqual(validatePosts(root), []);
  });
});
