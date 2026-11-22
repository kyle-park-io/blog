[English](README.md) | **한국어**

# blog

`https://jungho.dev/blog`에 올라가는 글의 원본입니다. 글 하나는 `content/posts/` 아래 Markdown과 이미지가 든 폴더 하나입니다. 사이트는 이 레포에서 빌드하지 않고, `scripts/validate-frontmatter.ts`의 frontmatter 검사는 `kyle-server` 레포의 콘텐츠 스키마를 따라 만들었습니다. 배포 컨테이너의 cron 작업이 10분마다 이 레포를 pull하고, 새 커밋이 있으면 사이트를 다시 빌드합니다.

글 쓰는 규칙, frontmatter 키, 보관 처리는 [CONTRIBUTING.md](CONTRIBUTING.md)에 있습니다.

## 실행

스크립트와 테스트가 node로 바로 실행되는 TypeScript이므로 Node 22.18 이상이 필요합니다. 패키지 관리자는 yarn 1입니다.

```
yarn                # 의존성과 git 훅 설치
yarn validate       # content/posts의 모든 글 frontmatter 검사
yarn typecheck      # tsc --noEmit
yarn test           # __tests__/*.test.ts를 node --test로 실행
```

`git commit`을 하면 pre-commit 훅이 `yarn validate`와 `yarn typecheck`를 실행하고, commitlint가 커밋 메시지(conventional commits)를 검사합니다.

## 구조

경로는 레포 맨 위 폴더에서 셉니다.

| 경로 | 설명 |
|---|---|
| [`.husky/`](.husky/) | git 훅: commit-msg는 commitlint, pre-commit은 validate와 typecheck를 실행 |
| [`__tests__/`](__tests__/) | scripts/validate-frontmatter.ts와 scripts/cron-update-blog.sh의 node 테스트 |
| [`content/`](content/) | 발행하는 모든 내용 |
| &emsp;&emsp;[`posts/`](content/posts/) | 글마다 폴더 하나. 폴더 이름이 URL 슬러그 |
| &emsp;&emsp;&emsp;&emsp;`<slug>/` | frontmatter가 붙은 index.md와 그 글의 표지, 이미지 |
| [`cron/`](cron/) | 컨테이너에 설치하는 crontab 파일 |
| [`notion/`](notion/) | Notion API를 부르는 curl 스크립트(페이지, 블록, 사용자). 키 파일은 git에 올리지 않는 api_key.txt |
| [`scripts/`](scripts/) | validate-frontmatter.ts, cron-update-blog.sh(HEAD가 바뀌면 pull하고 재빌드), cron-init.sh(crontab 설치) |
| [`.commitlintrc`](.commitlintrc) | commitlint 설정, conventional commits |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | 글을 쓰고, 보관하고, 발행하는 법 |
| [`git.sh`](git.sh) | 이 클론의 로컬 git 사용자 이름과 이메일 설정 |
| [`init.sh`](init.sh) | yarn 프로젝트와 husky 훅의 첫 설정 |
