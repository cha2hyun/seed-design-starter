# Changelog

이 프로젝트의 주목할 만한 변경은 이 파일에 기록합니다. 형식은
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)를 따르고, 버전은
[SemVer](https://semver.org/)와 `package.json`을 따릅니다.

## [0.3.0] - 2026-08-10

앱 셸을 SEED Contents Layout에 맞추고, 헤더·사이드 네비·푸터로 탐색 영역을
나눴습니다. `feat` 커밋이 있어 minor로 올렸습니다.

### Added

- md 이상에서 노출되는 Side Navigation과, md 미만에서 헤더로 접히는 모바일 메뉴
- SEED `block:footer-01` 기반 앱 푸터 (공개 GitHub 저장소 링크)
- Query·Router를 하나의 TanStack Devtools 셸에 모은 개발 도구
- `layout="iconOnly"` 자식이 SEED `Icon` 래퍼인지 검사하는 ESLint 규칙

### Changed

- Contents Layout 셸을 커머스 상한(1280px)과 breakpoint 마진·거터에 맞춤
- 언어·색상 모드 전환을 설정 페이지가 아니라 헤더로 이동
- Lucide 아이콘을 `Icon*` 카탈로그로 모아 직접 `lucide-react` import를 금지
- 상품 목록을 `1 / md:2 / lg:3` 반응형 그리드로 표시

## [0.2.0] - 2026-08-07

`develop`에 쌓인 통합·락인·에이전트 워크플로 변경의 첫 릴리스입니다. `feat` 커밋이 있어
minor로 올렸습니다.

### Added

- `config/brand.config.json`으로 제품 brand 색을 고정하고 `pnpm brand:sync`로
  `global.css`에 반영
- `develop` 통합 브랜치와 에이전트 주도 커밋·PR·리뷰 루프 (훅·커맨드·문서)
- `env/` 기반 Vite 환경변수 (`VITE_*`)와 `config/`로 모은 툴링 설정
- `main` 머지 시 `v*` 태그와 GitHub Release를 만드는 `release` 워크플로

### Changed

- 앱 아이콘을 `lucide-react`로 통일하고 Karrot/Daangn 아이콘 패키지를 금지
- `pnpm verify`를 CI와 동일한 단계로 맞춤

### Fixed

- Cursor MCP가 데스크톱 PATH에서 Node를 못 찾는 문제를 `.cursor/mcp-node.sh`로 해결
- MCP transport 선언과 seed-docs 룰이 실제 도구 표면에 맞도록 수정

### Removed

- 사용하지 않던 seed-figma MCP 서버 선언

## [0.1.0] - 2026-08-07

초기 스타터: Vite + React + TypeScript, SEED 락인, Feature-Sliced Design, i18n, AI 툴링.
