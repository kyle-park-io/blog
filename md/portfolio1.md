# 프로젝트 초기 개발 환경 설정 권장 사례

- GITHUB

[https://github.com/kyle-park-io/common-config](https://github.com/kyle-park-io/common-config)

# # 목차

---

# <서론>

# 1. 개발자가 새로운 회사(프로젝트)에 투입된다면

현업에서 개발자로서 처음 일을 시작하거나, 이직 후에 새로운 회사에서 일을 하게 되었다면 나는 크게 “기존의 프로젝트에 투입되어 개발을 이어서 진행하거나”, “새로운 프로젝트를 시작하게” 될 것이다.

내가 처음 시작하는 단계의 개발자이고 사내 프로젝트에 투입된다면 처음에는 당연히 모르는 것들 투성이일 것이고 시행착오를 겪으며 많은 것들을 배워나갈 것이다. 이런 상황에서 대부분의 사람들이 해줄 조언은 “주변의 동료들에게 묻고, 보고, 배우라” 는 것이고, 이는 확실히 옳은 말이라고 생각한다.

그렇게 시간이 흘렀고 이제는 어느 정도 초보 티를 벗었다고 해보자. 나는 다시 두 개의 상황에 직면했다.

- “기존의 프로젝트에 투입되기”
- “새로운 프로젝트를 시작하기”

이제는 나 스스로도 어느 정도 실력이 생겼다고 생각이 들고, 앞서 나에게 도움을 준 동료들처럼 나 역시 누군가에게 도움이 되는 존재가 되고 싶다. 그리고 무엇보다도 나는 프로젝트를 성공적으로 EXIT 시키고 싶은 마음이 가득하다!

# 2. 프로젝트 성공 요인

프로젝트가 성공하려면 우선, 훌륭한 Idea, BM이 필요할 것이다. 이 글은 개발자가 동료와 협업 시 도움이 될 수 있는 몇 가지 팁을 소개하는 글이니 훌륭한 Idea, BM 가 있다고 가정해보자.

초기 아이디제이션에 대한 빌드업은 완료가 되었고, 실제 구현을 들어가는 상황이다. 기간은 3개월로 잡았다. 내가 블록체인 개발자로 일을 하고 있으니 블록체인 프로젝트라고 하자. 프로젝트 팀은 러프하게 이 정도로 구성이 될 것이다.

- 기획팀
- 디자인팀
- 개발팀
    - 모바일
    - 프론트엔드
    - 백엔드
        - Smart Contract
        - API
        - Integration
        - QA
    - 데브옵스
- 영업팀

만약 내가 백엔드 API 개발팀에서 해당 개발을 진행한다고 해도 순수 개발이던, 후의 테스트던 어떤 경우던 간에 나의 팀원들하고만 소통하지 않는다. 다른 팀, 어쩌다 보면 다른 본부, 타 회사 사람들과도 소통해 일을 진행해야 하는 경우가 생길 것이다.

다양한 사람이 모인 곳에서, 이러한 소통이 원활하게 이루어지는 경우를 솔직하게 나는 많이 보지 못하였다. 이런 상황에 대한 해결책을 고민했을 때, 내가 생각한 가장 현실적인 방법은 엄격한 규칙을 세우고 이를 동료들과 함께 잘 따르는 것이다.

# 3. 규칙 정하기

유명한 기업 내 개발 팀은 보통 코딩 규칙이나 가이드라인을 따라 개발을 한다. 일관성을 유지하고 개발 속도를 높이며, 코드의 가독성과 유지 보수성 등을 높이는 데 도움이 되기 때문이다. 하지만 반대로 말하면, 아직도 많은 팀들이 이러한 규칙 없이 개발을 진행한다. 이전 회사의 나의 팀이 그러했다.

회사 코드의 커밋 메세지는 중구난방으로 쉽게 읽히기 힘들었으며, 각자의 개발 환경에 따른 의미 없는 커밋들이 생겨났다. 나의 코드를 설명하려, 동료의 코드를 물어보려 자리를 수시로 옮겨다니는 상황도 많았다. 이러한 문제를 해소시킬 수 있는 방법을 소개하는 프로젝트를 진행하면 어떨까? 라고 개인적인 생각이 들었고 이 글을 작성하게 되었다.

개발에 있어 규칙은 정말로 중요하다!

# 4. 초기 개발 환경 설정의 필요성

서론이 조금 길었다. 이 글은 “나, 그리고 팀이 따라야 할 개발 규칙을 코드 혹은 개발 환경에 녹이는 사례” 를 소개하는 글이다.

기존 프로젝트를 리팩토링 하거나, 새롭게 프로젝트를 진행하는 데 있어 참고하면 좋을 만한 컨텐츠들을 가지고 왔다. 이제부터 내가 현업에서 사용한 방법, 규칙 적용에 사용할 라이브러리, 각 라이브러리 사용 예제 등을 소개하며 글을 진행해 보겠다. 해당 글을 통해 독자는 협업에 있어 쉽게 깨질 수 있는 개발 규칙 등을 억제하는 방법을 몇 가지 얻어갈 수 있다.

---

# <본론>

※ 해당 글은 **TypeScript** 를 기반으로 설명합니다. 프로젝트들이 사용하는 여러 패키지(라이브러리) 들이 대부분의 경우 JS(TS) 로 구현되어 있기 때문입니다. 

※ IDE는 vscode를 기준으로 설명합니다.

# 1. 접근 방법

요즘 시대에 학습을 할 때 가장 효율적인 방법은 모범(유명) 사례 여러 개를 같이 분석하는 것이다. 개발자가 이러한 사례를 쉽고 빠르게 얻을 수 있는 곳은 깃허브 오픈 소스다.

그래서 나는 유명 오픈소스들을 10개 정도 모아놓고 공통으로 사용하는 라이브러리를 정리 및 학습하였었다. 예제로 두 개의 링크를 올리겠다. TS 웹 백엔드 프레임워크인 NestJS와 이더리움 네트워크 Ethereum 이다. 

- NestJS

[https://github.com/nestjs/nest](https://github.com/nestjs/nest)

- Ethereum

[https://github.com/ethereum/go-ethereum](https://github.com/ethereum/go-ethereum)

# 2. 개발 규칙

내 주위에 동료들은 각자 고유의 개발 환경을 구축하고 있다. IDE (vscode, IntelliJ 라인 등) 을 사용하거나 사용하지 않거나, 에디터 (Vim, Emacs, Notepad 등) 를 사용하거나 사용하지 않거나 말이다.

이러한 환경의 차이로 인해 실질적인 코드 변경이 아닌 자간 등의 수정이 커밋에 기록되는 건 팀적으로 좋은 상황이 아니다. 이러한 불상사를 막기 위해 보편적으로 적용할 수 있는 3가지 규칙을 소개한다.

## 1) 포맷팅

- 포맷팅(Formatting) : 코드의 스타일을 통일하는 과정

## 2) 린팅

- 린팅(Linting) :  문법 오류, 버그, 스타일 오류 등 잠재적인 문제점을 찾아내는 과정

## 3) 깃

- 깃(Git) : 버전 관리, 코드 관리 정책

## 4) 리뷰, TDD

- 코드 리뷰, TDD(테스트 코드) : 해당 내용은 개발론에서 기술하는 것이 더 자세한 설명이 될 것 같아 다른 글에서 설명하겠다.

다음으로 각 규칙들을 적용할 수 있는 유명 라이브러리 소개와 그 사용법을 기술한다.

# 3. 라이브러리 적용법

라이브러리를 명령어로 실행하거나 IDE 내의 확장 플러그인 등으로 실행시킬 수 있다. 기호에 맞게 선택을 하면 될 것이다. 사람들마다 사용하는 IDE 가 다를 수 있으니 명령어(혹은 스크립트) 를 먼저 숙지하는 게 어떨까 생각하는 바이다.

# 4. 라이브러리 소개

## 1) 포맷팅(Formatting)

### 1. EditorConfig ( Tool of maintaining consistent coding styles )
: 다양한 IDE, 에디터, os 에 공통 규칙을 적용하기

[EditorConfig](https://editorconfig.org/)

1. What is This? : 통일된 규칙을 적용할 수 있는 파일이다.
2. How to Use? : 파일로 적용을 할 수 있고, 플러그인이 필요한 환경이 있고, 필요없이 바로 적용 가능한 툴이 있다.
https://editorconfig.org/#pre-installed
    1. No Plugin Necessary
        1. Github
        2. JetBrains(IntelliJ)
        3. Vim
    2. Download a Plugin
        1. Vscode
        2. Emacs
        3. Notepad++
3. .editorconfig : 해당 파일에 규칙을 적고 사용할 수 있다.
4. Configuration Details? : 
    1. 속성 값 : 속성 값들은 플러그인에 따라 약간의 차이는 있을 수 있으나, 공식 홈페이지에 제시되어있는 값들 정도로 구성하여도 충분하다 생각한다.
    - indent_style : 들여쓰기 스타일
        - tab : 들여쓰기를 하드탭 “\t” 로 구현
        - space : 들여쓰기를 소프트탭(공백) “space” 로 구현
        - cf.) 하드탭 ? 소프트탭 ?
            - 들여쓰기를 나타내는 방법 들여쓰기가 10칸이라 가정해보자. 하드탭의 경우는 \t 하나로 표현이 가능하지만, 소프트탭(공백)의 경우 10칸이 소모되므로 하드탭 대비 메모리 사이즈가 조금 더 크다. 하지만 그 정도가 미미하기 때문에 요즘은 소프트탭을 더 많이 사용한다고 한다.
    - indent_size : 들여쓰기 사이즈(칸)
        - tab_width? : 하드탭을 사용하는 경우 tab_width 를 사용해 \t = 5 의 크기를 설정할 수 있다. 하지만, indent_size 값이 기본 값으로 하드탭에도 적용되기 때문에 보통은 사용할 필요가 없다고 공식 홈페이지에 기술되어 있다.
    - end_of_line : 줄바꿈 방식
        - lf : Unix(Linux) 스타일
        - cr : Macintosh 스타일
        - crlf : Windows 스타일
    - charset : 문자 인코딩 방식
        - utf-8 (utf8은 인식을 못할 수도 있다고 하니 주의할 것)
    - trim_trailing_whitespace : 마지막 줄 불필요한 공백 없애기
        - “}     “  ⇒  “}”
    - insert_final_newline : 파일 끝에 새 줄 추가하기
    - root : 루트 디렉토리 설정
5. Example
    
    ```bash
    # top-most EditorConfig file
    root = true
    
    # Unix-style newlines with a newline ending every file
    [*]
    indent_style = space or tab
    indent_size = 5
    tab_width = 5 (생략 가능)
    end_of_line = lf
    charset = utf-8
    trim_trailing_whitespace = true
    insert_final_newline = true
    
    [*.md] 마크다운 파일은 해당 설정이 필수적이라 기술함.
    trim_trailing_whitespace = false
    ```
    
    ⇒ 보편적인 값은 이렇게가 될 것이다. 나는 이 config 를 사용하고 있다.
    
6. (recommend) : 사용하다 보면 플러그인이 꺼져 있거나 등 제대로 적용이 안되는 상황이 있을 수 있다. 그래서 나는 특정 훅 실행 시점에 적용을 시킬 수 있는 방법을 두는 걸 추천한다. 내 개발 환경은 prettier 에 editorconfig 을 연동시키고, husky 에 prettier 실행 훅을 주고 있다.

### 2. prettier ( Opinionated Code Formatter )

[https://github.com/prettier/prettier](https://github.com/prettier/prettier)

1. What is This? : 강력한 코드 포매터
    1. supported languages?
    
    JavaScript · TypeScript · Flow · JSX · JSON
    CSS · SCSS · Less
    HTML · Vue · Angular
    GraphQL · Markdown · YAML
    
    ⇒ Wow!
    
2. How to Use? : 
    1. prettier 설치
        1. `yarn add --dev --exact prettier`
    2. .prettierrc
    3. .prettierignore
    4. yarn prettier . --write
3. Configuration Details
    1. 속성 값 : 자주 쓰이는 속성 값을 몇 개만 제시한다.
    2. printWidth : 한 줄 최대 문자 수
    3. tabWidth : 탭 사이즈
    4. useTabs : 탭 사용 유무
    5. semi : 세미콜론 사용 유무
    6. singleQuote : 따옴표(’), 쌍따옴표(”) 설정
    7. trailingComma : 마지막 항목 콤마(,) 유무 설정
    8. bracketSpacing : 객체 리터럴 사이 공백 유무
    9. arrowParens : 화살표 함수 매개변수 괄호 유무
4. Example
    
    ```json
    {
      "printWidth": 100,
      "tabWidth": 4,
      "useTabs": true,
      "semi": false,
      "singleQuote": true,
      "trailingComma": "all",
      "bracketSpacing": false,
      "arrowParens": "avoid"
    }
    ```
    
5. **editorconfig 와 중복되는 값이 있지 않나요?**
    1. 중복되는 값이 있을 수 있기 때문에 그 순서를 정하는 것이 중요하다.

## 2) 린팅

### 3. eslint

[https://github.com/eslint/eslint](https://github.com/eslint/eslint)

https://eslint.org/docs/latest/rules/

1. What is this? : JS 및 TS 코드 스타일, 규칙을 분석 도구
2. How to Use? : 
    1. eslint 설치
        1. `yarn create @eslint/config`
3. Example
eslint 는 규칙들이 굉장히 다양하기 때문에 레퍼런스를 참고하는 것을 추천한다.
    
    ```jsx
    module.exports = {
      env: {
        browser: true,
        es2021: true,
        node: true,
        jest: true,
      },
      root: true,
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'standard-with-typescript',
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      overrides: [
        {
          env: {
            node: true,
          },
          files: ['.eslintrc.{js,cjs}'],
          parserOptions: {
            sourceType: 'script',
          },
        },
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      rules: {
        // '@typescript-eslint/interface-name-prefix': 'off',
        // '@typescript-eslint/explicit-function-return-type': 'off',
        // '@typescript-eslint/explicit-module-boundary-types': 'off',
        // '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/method-signature-style': 'off',
        'import/no-absolute-path': 'off',
      },
      ignorePatterns: ['.eslintrc.js', '/**/*.config.ts'],
    };
    
    ```
    

## 3) 깃

### 4. commitlintrc ( Tool of maintaining conventional commit format )

[https://github.com/conventional-changelog/commitlint](https://github.com/conventional-changelog/commitlint)

1. What is This? : 커밋 규칙을 적용할 수 있는 툴이다.
2. How to Use? :
    1. commitlint 설치
        1. `yarn add --dev @commitlint/cli`
    2. 템플릿(패턴) 설치
    : 처음 커밋 메세지를 작성할 때 어떻게 작성해야 될지 모르는 경우가 보편적인 경우이기 때문에 이럴 땐 템플릿을 참고하는 것도 좋은 방법이다.
        1. `yarn add --dev @commitlint/config-conventional`
    3. .commitlintrc
3. Example
    
    ```json
    {
      "extends": [
        "@commitlint/config-conventional"
      ]
    }
    ```
    

### 5. husky ( Tool of liniting commit messages, code, and running test )

[https://github.com/typicode/husky](https://github.com/typicode/husky)

1. What is This? : Git Hook
2. How to Use? :
    1. husky 설치
        
        ```json
        yarn add --dev husky
        # Add pinst ONLY if your package is not private
        yarn add --dev pinst
        ```
        
    2. 실행
        1. npx husky init
3. recommend : husky 는 명령어 실행은 직접 해보고, 파일을 제공하니 각 훅(스크립트)를 확인하는 것이 더 이해에 용이할 듯 하다.

- Extra
    
    ### 6. lerna ( or yarn )
    
    [https://github.com/lerna/lerna](https://github.com/lerna/lerna)
    
    ### 7. circleci
    

---

# <결론>

## 1. 개발을 잘하자!

팀적으로 이러한 개발 규칙을 설정함으로써 더 훌륭한 코드와 능숙한 개발 진행을 얻을 수 있음을 기대한다.

## 2. 장점

- GPT
    
    ### 1. **코드 품질 향상 및 유지**
    
    - **오류 감소**: ESLint와 같은 정적 분석 도구를 사용하여 코드 작성 단계에서 오류와 잠재적인 버그를 조기에 발견하고 수정할 수 있습니다.
    - **일관된 코드 스타일**: Prettier와 ESLint를 통해 모든 팀원이 일관된 코드 스타일을 유지함으로써 코드의 가독성을 높이고 유지보수를 용이하게 합니다.
    
    ### 2. **효율적인 협업**
    
    - **코드 리뷰 시간 단축**: 일관된 스타일과 규칙을 통해 코드 리뷰 과정에서 스타일 관련 논의를 줄일 수 있습니다. 이는 코드 리뷰를 더 빠르고 효과적으로 만듭니다.
    - **커밋 메시지의 일관성**: Commitlint를 사용하여 커밋 메시지의 형식을 통일하면 코드 변경 이력을 더 쉽게 추적할 수 있습니다. 이는 협업 과정에서 변경사항을 명확히 이해하는 데 도움을 줍니다.
    - **공동 작업 환경 조성**: EditorConfig를 통해 모든 팀원이 동일한 코드 편집 환경을 사용하게 되므로, 편집기 설정으로 인한 불필요한 코드 변경을 방지할 수 있습니다.
    
    ### 3. **자동화와 개발 효율성 증가**
    
    - **자동 코드 포맷팅**: Prettier를 통해 코드를 자동으로 포맷팅하여 개발자들이 코딩 스타일에 신경 쓰지 않고 기능 개발에 집중할 수 있게 합니다.
    - **자동화된 검사 및 테스트**: Husky를 활용하여 Git 훅을 설정하면 커밋이나 푸시 전에 자동으로 테스트 및 코드 검사를 실행하여 코드 품질을 유지하고, 문제가 있는 코드가 코드베이스에 포함되지 않도록 합니다.
    
    ### 4. **팀의 일관성 유지 및 규칙 준수 강화**
    
    - **팀의 코드 규칙 준수**: ESLint와 Prettier, Commitlint는 팀의 코드 스타일 및 커밋 메시지 규칙을 강제하여 일관성을 유지합니다. 이는 프로젝트의 유지보수성을 높이고, 코드베이스의 품질을 장기적으로 보장합니다.
    - **새로운 팀원의 빠른 적응**: 명확한 규칙과 도구 설정이 있으면 새로운 팀원이 팀의 코딩 규칙과 스타일을 빠르게 배우고 적응할 수 있습니다.
    
    ### 5. **프로젝트 관리 및 확장성 향상**
    
    - **프로젝트의 장기적인 건강 유지**: 일관된 코드 스타일과 커밋 메시지 관리로 프로젝트의 복잡도가 증가해도 유지보수와 관리를 쉽게 할 수 있습니다.
    - **자동화된 릴리스 프로세스**: 일관된 커밋 메시지를 통해 자동화된 릴리스 도구와 연동이 쉬워져, 버전 관리와 릴리스 노트 생성 등이 자동화될 수 있습니다.
    
    ### 6. **개발자 경험 개선**
    
    - **스트레스 감소**: 개발자가 코드 스타일과 규칙을 수동으로 관리할 필요가 없어, 작업의 스트레스가 줄어들고, 창의적이고 생산적인 개발 작업에 집중할 수 있습니다.
    - **개발 환경 통일성**: EditorConfig를 사용하면 다양한 개발 환경에서도 동일한 코드 스타일과 규칙이 적용되어, 작업 환경에 대한 불만을 줄이고 일관된 개발 경험을 제공합니다.