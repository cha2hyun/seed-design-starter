# seed-design-starter

Vite + React + TypeScript 스타터입니다. 당근의 디자인 시스템 [SEED](https://seed-design.io)에
**락인**되어 있고, [Feature-Sliced Design](https://feature-sliced.design)으로 구조를 잡았으며,
AI 에이전트가 바로 일할 수 있도록 MCP·룰·커맨드가 레포에 함께 들어 있습니다.

클론 → `pnpm bootstrap` → `/start` 한 번이면 누구나 같은 환경에서 시작합니다.

```bash
git clone https://github.com/cha2hyun/seed-design-starter.git
cd seed-design-starter
pnpm bootstrap
pnpm dev
```

Node 22 이상과 pnpm이 필요합니다. `.nvmrc`가 있으니 `nvm use`로 맞출 수 있어요.

---

## 무엇이 다른가: SEED 락인

`src/app/styles/global.css`가 `@theme { --*: initial; }`으로 **Tailwind 기본 테마를 통째로
삭제**한 뒤 SEED 토큰만 다시 채웁니다. 그래서 이런 클래스들은 에러가 아니라 **아무 CSS도 만들지
않습니다**.

```
bg-red-500   p-4   text-lg   rounded-md   shadow-md   max-w-3xl
```

대신 이렇게 씁니다.

| 용도       | SEED 토큰                                                   |
| ---------- | ----------------------------------------------------------- |
| 배경       | `bg-bg-layer-default`, `bg-bg-brand-solid`                  |
| 글자색     | `text-fg-neutral`, `text-fg-neutral-muted`                  |
| 테두리     | `border-stroke-neutral-muted`                               |
| 간격       | `p-x4`, `px-x5`, `gap-x3`, `mt-x2`                          |
| 위치       | `top-x2`, `inset-x0`                                        |
| 반경       | `rounded-r4`, `rounded-full`                                |
| 그림자     | `shadow-s1`, `shadow-s2`                                    |
| 타이포     | `t4-bold`, `t7-regular`, `screen-title`, `article-body`     |
| Breakpoint | `sm:` 480 · `md:` 768 · `lg:` 1280 · `xl:` 1440 (SEED 기준) |

락인은 세 겹입니다.

1. **CSS** — 기본 토큰이 존재하지 않으니 잘못된 클래스는 컴파일 결과가 비어 있습니다.
   SEED가 덮지 않는 `top-*`·`inset-*`·`space-*`·`translate-*`는 `global.css`에서 SEED
   dimension으로 다시 매핑했습니다.
2. **ESLint** — 조용한 실패를 시끄러운 에러로 바꿉니다. `.seed/tokens.json`에서 자동 생성한
   allowlist와 대조해 `p-4` 같은 클래스에 대안 토큰까지 제안합니다. 인라인 `style`, 추가 `.css`
   파일, `@seed-design/react` 직접 import도 함께 막습니다.
3. **회귀 테스트** — `pnpm verify:lockin`이 Tailwind를 실제로 컴파일해서, 비-SEED 유틸리티 27개가
   여전히 죽어 있고 SEED 유틸리티 25개가 살아 있는지 확인합니다. CI에서 돌아갑니다.

예외는 둘뿐이고 둘 다 의도적으로 번거롭습니다. 인라인 스타일은 바로 위에
`// seed-escape: <이유>` 주석이 있어야 하고, 새 토큰은 `global.css`의 프로젝트 `@theme` 블록에
사유와 함께 추가해야 합니다. 현재 그 블록에는 breakpoint, Pretendard 폰트 스택, 본문 최대 폭
하나뿐입니다.

---

## AI 에이전트와 함께 쓰기

`.cursor/`가 레포에 커밋되어 있어서, **클론만 하면 MCP 서버가 자동으로 잡힙니다.** 수동 설정은
없습니다. Cursor에서 열고 `/start`를 실행하세요.

> MCP 서버는 `.cursor/mcp-node.sh`를 거쳐 실행됩니다. Cursor는 데스크톱 환경에서 서버를 띄우는데
> 그 PATH가 `/usr/bin:/bin:/usr/sbin:/sbin`뿐이라, nvm·fnm·Volta·Homebrew로 설치한 Node는 보이지
> 않아 `npx`가 그냥 실패합니다. shim이 Node를 먼저 찾아줍니다.

| 파일                             | 역할                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `.cursor/mcp.json`               | `seed-docs` (인증 불필요)                                                     |
| `.cursor/rules/*.mdc`            | 프로젝트 · 락인 · FSD · i18n · MCP 사용법 · 코드 스타일 · git 워크플로         |
| `.cursor/rules/_generated-*.mdc` | 설치된 SEED 버전의 실제 토큰 목록 (자동 생성)                                  |
| `.cursor/commands/*.md`          | `/start` `/seed-sync` `/new-feature` `/audit-tokens` `/commit` `/pr` `/review` |
| `.cursor/skills/seed-design/`    | 당근 공식 SEED Agent Skill (vendoring)                                         |
| `AGENTS.md`                      | Cursor 외 에이전트용 동일 지침                                                 |
| `CONTRIBUTING.md`                | 브랜치 · 커밋 · PR · 리뷰 계약                                                 |

Cursor가 아니어도 됩니다. 이 프롬프트 하나로 충분해요.

> 이 레포는 SEED Design에 락인된 Vite + React 스타터야. `@seed-design/*`를 따르고, className을
> 쓰기 전에 `seed-docs` MCP로 토큰과 컴포넌트를 확인해. Tailwind 기본 토큰은 CSS가 아예 생성되지
> 않으니 절대 쓰지 마. 패키지 업데이트나 컴포넌트 추가는 SEED 정본을 MCP로 대조한 뒤에 진행하고,
> 작업이 끝나면 브랜치를 파서 커밋하고 PR을 열어. 규칙은 CONTRIBUTING.md에 있어.

### 에이전트가 코드를 올리는 방법

커밋 → PR → 리뷰를 에이전트가 돌린다는 전제로 규칙을 실행 가능한 형태로 박아뒀습니다. 훅이 막을
때는 **다음에 실행할 명령까지 함께 출력**하므로, 에이전트가 문서를 다시 읽지 않고 stderr만 보고
복구할 수 있습니다.

```bash
git switch develop                      # main은 릴리스 브랜치라 커밋 자체가 막힘
git switch -c feat/price-offer-toggle   # 리뷰가 필요한 변경이면 브랜치를 팜
pnpm verify                             # CI와 완전히 같은 명령
git commit                              # Conventional Commits 강제
git push -u origin HEAD                 # pre-push가 pnpm verify를 다시 실행
gh pr create --base develop             # PR 제목도 같은 규칙 (squash 머지용)
```

브랜치는 세 종류입니다. `main`은 릴리스 전용이라 `develop`에서 머지만 받고, `develop`은 통합
브랜치로 작은 변경은 바로 커밋해도 됩니다. 리뷰가 필요한 변경은 `<type>/<kebab-summary>`
브랜치를 따서 `develop`으로 PR을 올립니다.

강제되는 것들:

- **브랜치** — `develop` 또는 `<type>/<kebab-summary>`. `main` 직접 커밋은 pre-commit이 거부합니다.
- **커밋 메시지** — Conventional Commits. 제목 12–72자, `update`·`changes`·`wip` 같은
  빈 껍데기 제목은 커스텀 commitlint 규칙이 걸러냅니다. scope는 선택이지만 쓴다면 실제 존재하는
  영역이어야 합니다.
- **푸시 전 검사** — pre-push가 `pnpm verify`를 돌립니다. CI와 같은 명령이라 로컬이 초록이면
  PR도 초록입니다.
- **PR 제목** — `pr-title` 워크플로가 commitlint로 검사합니다.

`/commit` `/pr` `/review` 커맨드가 이 루프를 그대로 실행하고, `/review`에는 이 레포 전용 리뷰
기준(조용히 실패하는 락인 위반 → FSD 경계 → i18n 누락 → 생성 파일 drift 순)이 들어 있습니다.

### SEED 최신화

에이전트에게 `/seed-sync`를 시키면 npm 최신 버전 확인 → changelog 대조 → 업그레이드 →
`pnpm seed:sync` → `pnpm seed:compat` → `pnpm verify`까지 한 번에 처리합니다.

`pnpm seed:sync`는 설치된 패키지에서 `.seed/tokens.json`, 생성 룰 파일, `.seed/llms/` 문서 캐시를
다시 만듭니다. CI의 `pnpm seed:check`가 이 산출물이 낡았으면 빌드를 깨뜨리므로, AI가 보는 토큰
목록은 항상 실제 설치 버전과 일치합니다.

---

## 구조

```
src/
├── app/              진입점, providers, 라우트, 유일한 CSS
│   ├── providers/    QueryClient, Snackbar
│   ├── routes/       TanStack Router 파일 기반 라우트 (page만 조립)
│   └── styles/       global.css — 프로젝트 유일 스타일시트
├── pages/            home · product-detail · product-new · settings · not-found
├── widgets/          app-header · product-list
├── features/         color-mode · language · product-filter · create-product
├── entities/         product (types · api · queries · card)
└── shared/
    ├── api/ config/ lib/ ui/ i18n/
    └── seed/         @seed-design/cli 스니펫 (`seed-design/ui/*` 별칭)
```

import는 항상 아래 방향으로만 흐릅니다: `app → pages → widgets → features → entities → shared`.
슬라이스는 `index.ts` public API로만 접근하고, 이걸 `eslint-plugin-boundaries`와 `steiger`가
강제합니다.

블루프린트 앱은 중고거래 화면입니다. 목록(Query + 필터), 상세(라우트 loader 프리페치), 등록
폼(검증 + Snackbar), 설정(다크모드 + 언어 전환), 404까지 각 레이어의 사용 예시를 담고 있어요.

---

## 명령어

| 명령어               | 하는 일                                                |
| -------------------- | ------------------------------------------------------ |
| `pnpm bootstrap`     | 최초 실행: 설치 · 라우트 생성 · SEED 동기화 · 타입체크 |
| `pnpm dev`           | 개발 서버                                              |
| `pnpm build`         | 라우트 생성 → 타입체크 → 프로덕션 빌드                 |
| `pnpm verify`        | CI가 도는 모든 검사                                    |
| `pnpm verify:lockin` | 락인 회귀 테스트                                       |
| `pnpm lint` / `:fix` | ESLint (SEED 락인 + FSD 경계)                          |
| `pnpm lint:fsd`      | steiger로 FSD 구조 검사                                |
| `pnpm seed:add`      | SEED 스니펫 추가 — `pnpm seed:add ui:tabs`             |
| `pnpm seed:sync`     | 토큰 카탈로그 · 생성 룰 · 문서 캐시 재생성             |
| `pnpm seed:compat`   | 스니펫과 설치된 SEED 버전 호환성 검사                  |
| `pnpm seed:docs`     | 컴포넌트의 문서 · llms.txt · 스니펫 URL 출력           |

---

## 기타 결정들

**폰트** — Pretendard Variable dynamic subset을 `index.html`에서 `<link>`로 불러옵니다. SEED CSS는
`font-family`를 선언하지 않아서 충돌이 없고, `global.css`의 `--font-sans` 한 곳에서만 지정합니다.

**i18n** — i18next + react-i18next. 한국어가 키의 원본이고 `i18next.d.ts`가 이를 타입으로
끌어와서, 없는 키를 쓰면 컴파일 에러가 납니다. 문구 톤(`-요` 체, 동사형 버튼, 다음 행동을 알려주는
에러 메시지)은 `.cursor/rules/30-i18n.mdc`에 정리돼 있습니다.

**상태** — 서버 상태는 TanStack Query, 클라이언트 상태는 Zustand. 서로 복사하지 않습니다.
쿼리 키는 `src/shared/api/query-keys.ts` 한 곳에 모읍니다.

**Import 정렬** — Prettier `@trivago/prettier-plugin-sort-imports`의 그룹이 FSD 레이어 순서를
그대로 따릅니다. import 블록만 봐도 그 파일이 어느 레이어에 기대는지 드러납니다.

**훅 메시지** — husky 훅은 실패 원인만 알려주지 않고 다음에 칠 명령까지 출력합니다. 에이전트가
루프 중간에 문서를 다시 읽지 않아도 되게 하려는 의도예요.

**Git hooks** — pre-commit은 lint-staged, commit-msg는 Conventional Commits, pre-push는 타입체크와
전체 린트를 돌립니다.

---

## 라이선스

이 저장소의 코드는 [MIT](./LICENSE)입니다.

SEED Design 등 Apache-2.0 구성요소의 귀속 고지는 [NOTICE](./NOTICE)에,
라이선스 전문은 [licenses/Apache-2.0.txt](./licenses/Apache-2.0.txt)에 있습니다.
앱 아이콘은 `lucide-react`(ISC)를 쓰고, 당근 로고·상호·캐릭터 같은 브랜드 리소스는
NOTICE의 상표 안내를 따릅니다.
