**English** | [한국어](README.ko.md)

# blog

The source of the posts published at `https://jungho.dev/blog`. One post is one folder of Markdown and images under `content/posts/`. The site itself is built elsewhere (the frontmatter check in `scripts/validate-frontmatter.ts` mirrors the content schema of the `kyle-server` repo). A cron job in the deployment container pulls this repo every ten minutes and rebuilds the site when a new commit arrives.

The rules for writing a post, the frontmatter keys and archiving are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Run

Node 22.18 or later is required, because scripts and tests are TypeScript that node runs directly. The package manager is yarn 1.

```
yarn                # install dependencies and git hooks
yarn validate       # check the frontmatter of every post in content/posts
yarn typecheck      # tsc --noEmit
yarn test           # node --test over __tests__/*.test.ts
```

`git commit` runs `yarn validate` and `yarn typecheck` (pre-commit hook) and checks the commit message with commitlint (conventional commits).

## Layout

Paths are counted from the repo root.

```
.husky/                    git hooks: commit-msg runs commitlint, pre-commit runs validate and typecheck
__tests__/                 node tests for scripts/validate-frontmatter.ts and scripts/cron-update-blog.sh
content/                   everything that is published
  posts/                   one folder per post; the folder name is the URL slug
    <slug>/                index.md with frontmatter, plus the post's cover and images
cron/                      the crontab file installed in the container
notion/                    curl scripts that call the Notion API (pages, blocks, users); the key is read from an untracked api_key.txt
scripts/                   validate-frontmatter.ts, cron-update-blog.sh (pull and rebuild when HEAD changed), cron-init.sh (install the crontab)
.commitlintrc              commitlint config, conventional commits
CONTRIBUTING.md            how to write, archive and publish a post
git.sh                     sets the local git user name and email for this clone
init.sh                    first-time setup of the yarn project and the husky hooks
```
