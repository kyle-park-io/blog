# Writing a post

One post is one directory: `content/posts/<slug>/index.md`. The directory name
is the URL — `content/posts/ethereum-event-object` is served at
`https://jungho.dev/blog/ethereum-event-object`. Slugs are lowercase
kebab-case and must not change after publishing; changing one breaks every
link to the post.

Images live next to the post and are referenced relatively:

    content/posts/my-post/
      index.md
      cover.webp
      diagram.webp

    ![구조도](./diagram.webp)

## Frontmatter

| Key       | Required | Rule                                                                               |
| --------- | -------- | ----------------------------------------------------------------------------------- |
| `title`   | yes      | Do **not** repeat it as `# ` in the body                                           |
| `date`    | yes      | `YYYY-MM-DD`, written by hand. Editing a post never reorders the list              |
| `updated` | no       | `YYYY-MM-DD`. Shown as "수정: …"; does not affect ordering                         |
| `summary` | yes      | One sentence. Used on the list page, in `<meta description>`, and in link previews |
| `tags`    | yes      | Lowercase kebab-case array. `[]` is allowed                                        |
| `cover`   | no       | `./cover.webp`. The file must exist                                                |
| `draft`   | no       | `true` hides it from the published site                                            |
| `lang`    | no       | `ko` (default) or `en`                                                             |

Example:

    ---
    title: 이더리움 이벤트 객체
    date: 2023-12-01
    summary: ethers.js 이벤트 페이로드 구조를 해부합니다.
    tags: [ethereum, ethers]
    lang: ko
    ---

## Publishing

`git commit` runs `yarn run validate`, which fails on a bad slug, a missing
key, a malformed date, an uppercase tag, a missing cover file, or an `# ` in
the body. After `git push`, the site's cron picks the change up within ten
minutes, rebuilds, and swaps the output in. No deploy is needed.

If a post does not appear, the build rejected it — the previous version of the
site stays up on purpose. Check the pod logs for the astro build output.
