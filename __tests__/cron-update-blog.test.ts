import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  chmodSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const SCRIPT = resolve('scripts/cron-update-blog.sh');

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

/**
 * A "remote" bare repo plus two clones: `author` (used to push new commits,
 * simulating someone merging a post) and `local` (stands in for /blog,
 * which is what cron-update-blog.sh actually operates on). A stub replaces
 * build-blog.sh so these tests exercise the pull/compare/decide logic in
 * cron-update-blog.sh itself, not astro's build.
 */
function sandbox() {
  const root = mkdtempSync(join(tmpdir(), 'cron-update-blog-'));
  const bare = join(root, 'origin.git');
  const author = join(root, 'author');
  const local = join(root, 'local');
  const blogDist = join(root, 'blog-dist');

  mkdirSync(bare, { recursive: true });
  git(bare, ['init', '-q', '--bare']);

  mkdirSync(author, { recursive: true });
  git(author, ['init', '-q']);
  git(author, ['config', 'user.email', 'author@example.com']);
  git(author, ['config', 'user.name', 'Author']);
  writeFileSync(join(author, 'content.txt'), 'v1\n');
  git(author, ['add', '.']);
  git(author, ['commit', '-q', '-m', 'v1']);
  git(author, ['branch', '-M', 'main']);
  git(author, ['remote', 'add', 'origin', bare]);
  git(author, ['push', '-q', 'origin', 'main']);

  execFileSync('git', ['clone', '-q', bare, local], {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  git(local, ['checkout', '-q', 'main']);

  // Stands in for build-blog.sh: records the commit it "built" into
  // LAST_BUILT_FILE (exactly what the real script does after a successful
  // swap) and counts how many times it actually ran.
  const buildStub = join(root, 'fake-build-blog.sh');
  const counter = join(root, 'build-count');
  writeFileSync(
    buildStub,
    [
      '#!/bin/sh',
      'set -eu',
      `echo x >> "${counter}"`,
      'git rev-parse HEAD > "$LAST_BUILT_FILE"',
    ].join('\n') + '\n',
  );
  chmodSync(buildStub, 0o755);

  return {
    root,
    bare,
    author,
    local,
    counter,
    env: {
      ...process.env,
      BLOG_REPO_DIR: local,
      BUILD_BLOG_SCRIPT: buildStub,
      BLOG_DIST: blogDist,
      LAST_BUILT_FILE: join(root, 'last-built'),
    },
  };
}

interface RunResult {
  ok: boolean;
  output: string;
}

const run = (env: NodeJS.ProcessEnv): RunResult => {
  try {
    return {
      ok: true,
      output: execFileSync('sh', [SCRIPT], {
        env,
        encoding: 'utf8',
        stdio: 'pipe',
      }),
    };
  } catch (err) {
    // execFileSync throws an Error carrying the child's captured streams.
    const failure = err as { stdout?: string; stderr?: string };
    return {
      ok: false,
      output: `${failure.stdout ?? ''}${failure.stderr ?? ''}`,
    };
  }
};

const buildCount = (box: { counter: string }): number => {
  if (!existsSync(box.counter)) return 0;
  return readFileSync(box.counter, 'utf8').split('\n').filter(Boolean).length;
};

test('a fresh checkout with no LAST_BUILT_FILE builds', () => {
  const box = sandbox();
  try {
    const result = run(box.env);
    assert.equal(result.ok, true);
    assert.equal(buildCount(box), 1);
    assert.ok(existsSync(box.env.LAST_BUILT_FILE));
  } finally {
    rmSync(box.root, { recursive: true, force: true });
  }
});

test('a second run with no new commits and a matching LAST_BUILT_FILE skips the build', () => {
  const box = sandbox();
  try {
    run(box.env);
    assert.equal(buildCount(box), 1);

    const result = run(box.env);
    assert.equal(result.ok, true);
    assert.match(result.output, /already built/);
    assert.equal(buildCount(box), 1, 'build must not run a second time');
  } finally {
    rmSync(box.root, { recursive: true, force: true });
  }
});

test('a new commit triggers a rebuild', () => {
  const box = sandbox();
  try {
    run(box.env);
    assert.equal(buildCount(box), 1);

    writeFileSync(join(box.author, 'content.txt'), 'v2\n');
    git(box.author, ['commit', '-q', '-am', 'v2']);
    git(box.author, ['push', '-q', 'origin', 'main']);

    const result = run(box.env);
    assert.equal(result.ok, true);
    assert.equal(buildCount(box), 2, 'a new commit must trigger a rebuild');
  } finally {
    rmSync(box.root, { recursive: true, force: true });
  }
});

test('a failed build is retried on the next tick instead of being skipped forever', () => {
  const box = sandbox();
  try {
    run(box.env);
    const staleSha = readFileSync(box.env.LAST_BUILT_FILE, 'utf8').trim();

    writeFileSync(join(box.author, 'content.txt'), 'v2\n');
    git(box.author, ['commit', '-q', '-am', 'v2']);
    git(box.author, ['push', '-q', 'origin', 'main']);

    // This tick's build fails: `git pull` still advances HEAD in `local`,
    // but the stub exits non-zero before touching LAST_BUILT_FILE -- this
    // is exactly the state a real failed build-blog.sh run leaves behind.
    const failingStub = join(box.root, 'failing-build-blog.sh');
    writeFileSync(failingStub, '#!/bin/sh\nexit 1\n');
    chmodSync(failingStub, 0o755);
    const failedResult = run({ ...box.env, BUILD_BLOG_SCRIPT: failingStub });
    assert.equal(failedResult.ok, false);
    assert.equal(
      readFileSync(box.env.LAST_BUILT_FILE, 'utf8').trim(),
      staleSha,
      'a failed build must not update LAST_BUILT_FILE',
    );

    // The old BEFORE/AFTER-only comparison would see this tick's pull as a
    // no-op (HEAD already advanced by the failed run) and skip forever.
    // Comparing against LAST_BUILT_FILE instead must retry it.
    const result = run(box.env);
    assert.equal(result.ok, true);
    assert.doesNotMatch(result.output, /already built/);
    assert.equal(buildCount(box), 2);
  } finally {
    rmSync(box.root, { recursive: true, force: true });
  }
});

test('a missing build-blog.sh falls back to the legacy BEFORE/AFTER comparison', () => {
  const box = sandbox();
  try {
    const env = {
      ...box.env,
      BUILD_BLOG_SCRIPT: join(box.root, 'does-not-exist.sh'),
    };
    const result = run(env);
    assert.equal(result.ok, true);
    assert.match(result.output, /no new commits/);
  } finally {
    rmSync(box.root, { recursive: true, force: true });
  }
});
