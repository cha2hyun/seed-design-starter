# Contributing

이 레포는 **AI 에이전트가 브랜치를 만들고, 커밋하고, PR을 열고, 리뷰까지 하는 것**을 기본 동작으로
가정합니다. 그래서 규칙이 문서에만 있지 않고 husky·commitlint·ESLint·CI에 실행 가능한 형태로
들어가 있습니다. 사람이 기여할 때도 같은 규칙을 씁니다.

훅이 실패하면 그 자리에서 다음에 실행할 명령까지 알려줍니다. 에이전트는 문서를 다시 읽는 대신
stderr만 읽고 복구하면 됩니다.

---

## 브랜치 모델

| 브랜치          | 역할                                             | 직접 커밋 |
| --------------- | ------------------------------------------------ | --------- |
| `main`          | 릴리스 브랜치. `develop`에서 머지만 받습니다.    | 불가      |
| `develop`       | 통합 브랜치. 기본 작업 대상입니다.               | 가능      |
| `<type>/<요약>` | 작업 브랜치. `develop`에서 따고 PR로 되돌립니다. | 가능      |

작은 변경은 `develop`에 바로 커밋해도 됩니다. 리뷰가 필요할 만큼의 변경, 되돌릴 여지가 있는
변경, 여러 커밋으로 나뉘는 변경은 작업 브랜치를 파서 PR로 올립니다. PR의 base는 `develop`입니다.

릴리스는 아래 [릴리스](#릴리스)를 따릅니다. 요약하면 `develop`에서 버전을 올린 뒤
`develop` → `main` PR 하나로 처리합니다.

---

## 릴리스

`main`에 머지하는 것은 배포 가능한 버전을 찍는 일입니다. 버전·태그·GitHub Release가 함께
맞아야 하고, 기능 PR처럼 squash하지 않습니다.

### 버전

`package.json`의 `version`이 단일 출처입니다. [SemVer](https://semver.org/)를 쓰고, 직전
`v*` 태그(없으면 `main` 팁) 이후 Conventional Commits로 범프를 고릅니다.

| 커밋이 포함하면                         | 범프  |
| --------------------------------------- | ----- |
| `BREAKING CHANGE` 또는 `type!:`         | major |
| `feat` (breaking 없음)                  | minor |
| `fix` / `perf` / 그 외만               | patch |

태그는 항상 `v` 접두사입니다 (`v0.2.0`). `package.json`의 `0.2.0`과 짝입니다.

### 절차

1. `develop`에서 `pnpm verify`가 초록인지 확인합니다.
2. `package.json`의 `version`을 올립니다.
3. `CHANGELOG.md` 맨 위에 `## [X.Y.Z] - YYYY-MM-DD` 섹션을 추가합니다. 동작 변화 위주로
   쓰고, 커밋 나열을 그대로 붙이지 않습니다.
4. 커밋합니다.

   ```
   chore(repo): release vX.Y.Z
   ```

5. `develop`을 푸시한 뒤 base=`main`, head=`develop` PR을 엽니다. 제목은 커밋과 같습니다.
6. CI가 초록이면 **Create a merge commit**으로 머지합니다. squash·rebase는 쓰지 않습니다.
   `main`의 히스토리와 태그가 가리킬 커밋을 흐리지 않기 위함입니다.
7. `main` 푸시 시 `release` 워크플로가 `package.json` 버전을 읽어 `vX.Y.Z` 태그와 GitHub
   Release를 만듭니다. 태그가 이미 있으면 건너뜁니다.

버전을 올리지 않은 채 `main`에 머지하지 마세요. 태그가 이전 버전에 묶이거나, 워크플로가
이미 존재하는 태그를 보고 아무 것도 하지 않습니다.

### 핫픽스

가능하면 `develop`에 고치고 패치 릴리스를 냅니다. `main`만 급히 고쳐야 하면 `main`에서
브랜치를 따 `main`으로 PR한 뒤, 머지 커밋을 `develop`에 다시 머지해 분기되지 않게 합니다.

### 하지 말 것

- 기능 브랜치에서 `package.json` 버전만 미리 올리지 않습니다. 릴리스 커밋의 일입니다.
- `develop`에 `v*` 태그를 달지 않습니다. 태그는 `main` (워크플로)에서만 생깁니다.
- 릴리스 PR을 squash 머지하지 않습니다.

---

## 작업 루프

```
브랜치 → 변경 → pnpm verify → 커밋 → 푸시 → PR → 리뷰 → 머지
```

1. **브랜치를 만듭니다.** `develop`에서 땁니다. `main`에는 직접 커밋할 수 없습니다.

   ```bash
   git switch develop
   git switch -c feat/price-offer-toggle
   ```

2. **변경합니다.** `className`을 쓰기 전에 `seed-docs` MCP로 토큰과 컴포넌트를 확인하세요.
   자세한 규칙은 [AGENTS.md](./AGENTS.md)와 `.cursor/rules/`에 있습니다.

3. **`pnpm verify`를 통과시킵니다.** pre-push 훅과 CI가 **완전히 같은 명령**을 돌리므로, 여기서
   초록불이면 PR도 초록불입니다.

4. **커밋합니다.** 훅이 브랜치 이름, 스테이징된 파일, 커밋 메시지를 순서대로 검사합니다.

5. **PR을 엽니다.** 기능·수정 PR의 base는 `develop`입니다. 릴리스만 base를 `main`으로
   둡니다. 템플릿을 채웁니다. 체크박스는 장식이 아니라 리뷰어(사람이든 에이전트든)가 무엇을
   확인해야 하는지 알려주는 신호입니다.

6. **리뷰합니다.** 아래 [리뷰 기준](#리뷰-기준)을 그대로 적용합니다.

Cursor에서는 `/commit`, `/pr`, `/review` 커맨드가 이 단계들을 그대로 실행합니다.

---

## 브랜치 이름

```
<type>/<kebab-summary>
```

`type`은 Conventional Commits와 같은 집합입니다: `feat` `fix` `docs` `refactor` `perf` `test`
`build` `ci` `chore` `revert`. 요약은 소문자 kebab-case이고 슬래시를 더 넣지 않습니다.

```
feat/price-offer-toggle
fix/switch-label-alignment
chore/seed-2-2-0
```

pre-commit 훅이 강제합니다. 이름이 틀리면 `git branch -m <새이름>`으로 고치면 됩니다.

---

## 커밋 메시지

```
<type>(<scope>): <제목 — 명령형, 소문자 시작, 마침표 없음>

<본문 — 왜 필요했는지. 100컬럼에서 줄바꿈.>
```

`scope`는 선택이지만, 쓴다면 실제로 존재하는 영역이어야 합니다: `app` `pages` `widgets`
`features` `entities` `shared` `seed` `i18n` `styles` `ci` `deps` `ai` `repo`. 마땅한 게 없으면
지어내지 말고 생략하세요.

제목은 72자 이내, 12자 이상입니다. `update`, `changes`, `wip`, `apply feedback` 같은 제목은
commitlint가 거부합니다. `git log --oneline`을 훑는 사람이 무엇이 바뀌었는지 알 수 있어야 합니다.

```
feat(features): add a price-offer toggle to the listing form
fix(shared): stop formatRelativeTime rounding a fresh timestamp to "1 minute ago"
chore(seed): upgrade @seed-design/react to 2.2.0
```

본문은 **무엇을 했는지가 아니라 왜 했는지**를 씁니다. 무엇을 했는지는 diff가 이미 말해줍니다.
한 줄로 자명한 변경이면 본문을 생략해도 됩니다.

커밋은 한 가지 일만 합니다. 리팩터링과 기능 추가를 섞지 마세요. 리뷰어가 둘을 분리해서 볼 수
없게 됩니다.

---

## 풀 리퀘스트

PR 제목도 Conventional Commits를 따릅니다. squash 머지 시 제목이 그대로 커밋 메시지가 되고,
`pr-title` 워크플로가 이를 검사합니다.

본문은 [템플릿](./.github/PULL_REQUEST_TEMPLATE.md)을 채웁니다. 핵심은 세 가지입니다.

- **왜** 이 변경이 필요했는지 (링크나 이슈가 있으면 함께)
- **무엇이** 바뀌었는지 — 파일 나열이 아니라 동작의 변화로
- **어떻게 확인했는지** — 돌린 명령, 확인한 화면

PR 하나는 리뷰어가 한 번에 이해할 수 있는 크기여야 합니다. 여러 관심사가 섞였다면 나누세요.
Cursor의 `/split-to-prs`가 도와줍니다.

---

## 리뷰 기준

리뷰는 취향이 아니라 이 레포가 지키기로 한 것들을 확인하는 작업입니다. 순서대로 봅니다.

**1. 디자인 시스템**

- SEED 밖의 토큰이 들어왔는가. `bg-red-500`, `p-4` 같은 클래스는 CSS가 생성되지 않으므로
  화면은 조용히 깨집니다.
- 임의값(`p-[12px]`, `text-[#fff]`)이 있는가.
- 새 `.css` 파일이 생겼는가. `src/app/styles/global.css` 하나뿐이어야 합니다.
- 인라인 `style`에 `// seed-escape:` 사유가 붙어 있는가. 사유가 납득되는가.
- `global.css`의 프로젝트 `@theme` 블록에 토큰이 늘었다면, SEED에 정말 대응물이 없는지
  `get_rootage`로 확인했는가.

**2. 아키텍처**

- import가 아래 방향으로만 흐르는가: `app → pages → widgets → features → entities → shared`.
- 슬라이스를 `index.ts`로 접근하는가.
- 코드가 올바른 레이어에 있는가. 비즈니스 객체는 `entities`, 사용자 행동은 `features`,
  화면은 `pages`.

**3. i18n**

- 하드코딩된 사용자 대상 문자열이 없는가.
- 한국어와 영어 키가 둘 다 있는가. 영어가 빠지면 컴파일은 통과하고 런타임에 한국어가 노출됩니다.
- 한국어 문구가 `-요` 체이고, 에러 메시지가 다음 행동을 알려주는가.

**4. 생성 파일**

- `@seed-design/*` 버전이 바뀌었다면 `.seed/tokens.json`과
  `.cursor/rules/_generated-seed-tokens.mdc`가 함께 갱신되었는가.
- 라우트가 추가되었다면 `src/app/routeTree.gen.ts`가 반영되었는가. 손으로 고치지 않았는가.

**5. 타입**

- `any`, `as never`, 근거 없는 `as` 캐스팅이 있는가.
- 배열 인덱싱 결과의 `undefined`를 단언으로 지우지 않았는가.

**6. 범위**

- diff가 한 가지 일만 하는가.
- 설명을 위한 주석이 아니라, 코드가 말할 수 없는 제약을 적은 주석인가.

리뷰 결과는 "무엇이 왜 문제이고 대신 무엇을 하면 되는지"로 씁니다. 파일과 줄 번호를 함께
적으세요. 지적할 게 없으면 없다고 말하고, 억지로 만들어내지 않습니다.

---

## 훅이 막을 때

| 증상                         | 원인                          | 다음 명령                               |
| ---------------------------- | ----------------------------- | --------------------------------------- |
| `main is the release branch` | main에서 커밋 시도            | `git switch develop`                    |
| `Branch ... is neither`      | 브랜치 이름 규칙 위반         | `git branch -m <type>/<summary>`        |
| `seed-lockin/token-only`     | SEED 밖 토큰                  | 메시지가 제안하는 토큰으로 교체         |
| `boundaries/dependencies`    | FSD import 방향/공개 API 위반 | `index.ts`로 import하거나 코드를 이동   |
| commitlint 실패              | 커밋 메시지 형식              | 위 [커밋 메시지](#커밋-메시지) 형식으로 |
| `format:check` 실패          | 포매팅                        | `pnpm format`                           |
| `seed:check` 실패            | 토큰 카탈로그가 낡음          | `pnpm seed:sync` 후 커밋                |
| `verify:lockin` 실패         | 테마 리셋 회귀                | `src/app/styles/global.css` 확인        |

---

## 하지 말아야 할 것

- **`--no-verify`로 훅을 건너뛰지 않습니다.** 훅이 막는다면 막을 이유가 있는 것이고, 우회하면
  CI에서 똑같이 막힙니다.
- **`main`에 직접 커밋하거나 `main`·`develop`에 force push 하지 않습니다.**
- **릴리스 PR(`develop` → `main`)을 squash·rebase 머지하지 않습니다.** merge commit만 씁니다.
- **`seed-lockin/*` 규칙을 `eslint-disable`로 끄지 않습니다.** 정말 예외가 필요하면 문서화된
  탈출구(`// seed-escape:` 또는 `global.css`의 프로젝트 `@theme`)를 쓰세요.
- **생성 파일을 손으로 고치지 않습니다.** `src/app/routeTree.gen.ts`, `.seed/tokens.json`,
  `.cursor/rules/_generated-seed-tokens.mdc`는 스크립트가 만듭니다.
- **린트를 통과시키려고 타입을 느슨하게 만들지 않습니다.**
- **커밋 메시지에 도구 이야기를 쓰지 않습니다.** 무엇이 왜 바뀌었는지만 씁니다.
