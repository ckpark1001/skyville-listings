# Implementation Plan: 스카이빌 원룸 임대 홍보 단일 페이지

**Branch**: `001-skyvill-rental-listing` | **Date**: 2026-09-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-skyvill-rental-listing/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

서울 성북구 보문동 "스카이빌" 원룸 매물을 소개하는 단일 페이지 정적 웹사이트를 순수
HTML/CSS/Vanilla JS로 구현한다. `index.html`이 `listings/{listing-id}/listing.json`을
`fetch()`로 읽어 히어로부터 footer까지 모든 섹션을 렌더링하는 공용 템플릿 역할을 하며,
다른 호실을 추가할 때는 새 `listings/{새-id}/listing.json`과 `photos/` 폴더만 추가하면
코드 변경 없이 재사용된다. 스크롤 인터랙션은 IntersectionObserver 기반의 짧은
fade-up(opacity + translateY, 300~450ms)만 사용하고 pin/scroll-snap/휠 가로채기 등
장식적 전환은 배제한다. 지도는 네이버지도 JavaScript API로, 문의는 `tel:`/`mailto:`/
카카오톡 ID 복사로 구현하며 GitHub Pages에 빌드 과정 없이 그대로 배포한다.

## Technical Context

**Language/Version**: HTML5 · CSS3 · Vanilla JavaScript (ES2020+, 트랜스파일/번들 없음)

**Primary Dependencies**: 네이버지도 JavaScript API v3(지도 렌더링 전용), Pretendard 웹폰트
(jsDelivr CDN, 라이선스 확인된 오픈소스 배포) — 그 외 프레임워크/애니메이션 라이브러리 없음

**Storage**: 정적 JSON 파일(`listings/{listing-id}/listing.json`), 서버 저장소·DB 없음

**Testing**: 자동화 유닛/통합 테스트 프레임워크 없음(빌드가 없는 정적 마크업 프로젝트). 대신
`quickstart.md`에 정의된 수동 브라우저 QA 체크리스트(키보드 내비게이션, `prefers-reduced-motion`
토글, Lighthouse 접근성/성능 점검, 이미지 로드 확인, 지도/연락처 동작 확인)로 검증한다.

**Target Platform**: 최신 evergreen 데스크톱/모바일 브라우저(Chrome, Safari, Edge, 모바일
Safari/Chrome) 위 GitHub Pages 정적 호스팅

**Project Type**: 단일 정적 웹페이지(프론트/백엔드 분리 없음)

**Performance Goals**: 레이아웃 이동 없는 이미지/지도 로딩(CLS ≈ 0), 히어로 대표 사진만
즉시 로딩하고 나머지는 `loading="lazy"`, fade-up 애니메이션은 60fps 유지 가능한
transform/opacity 전용 트랜지션(300~450ms)

**Constraints**: 빌드 과정 없음 · 서버/DB/인증 없음 · 허용된 외부 리소스는 네이버지도 SDK와
폰트 CDN뿐 · 모든 경로는 상대 경로(`./listings/...`) · scroll-snap/휠 이벤트 가로채기/강제
`scrollTo`/섹션별 pin 금지 · `prefers-reduced-motion` 대응 필수

**Scale/Scope**: 단일 호실("스카이빌") 기준 단일 페이지 1개, 11개 정보 섹션 + sticky CTA바 +
footer. 향후 호실 추가 시 `listings/{새-id}/` 폴더만 늘어나는 구조로 확장.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 원칙 | 적용 여부 | 판정 |
|---|---|---|
| I. 정적 사이트 전용, 서버리스 | 서버/DB/로그인 없이 `index.html` + `listing.json` fetch만 사용 | PASS |
| II. DESIGN.md 우선 | 색상/타이포/spacing 토큰은 `DESIGN.md`에서 그대로 채택, 원본 미수정 | PASS (Research 항목에서 폰트 대체 근거 기록) |
| III. GitHub Pages 상대 경로 | 모든 경로 `./listings/...` 상대 경로로 구성, `.nojekyll` 포함 | PASS |
| IV. 접근성·모션 민감도 | semantic HTML, 키보드 내비게이션, `prefers-reduced-motion`에서 애니메이션 생략 | PASS |
| V. 실제 서술형 콘텐츠 | 각 블록 소제목+본문 1~2문단 원문 그대로 렌더링, 캡션화 금지 | PASS |
| VI. 실제 촬영 사진만 사용 | `photos/` 폴더의 제공 원본만 사용, placeholder/hotlink 금지 | PASS |
| VII. 단일 데이터 소스·재사용 템플릿 | `listings/{id}/listing.json` 단일 소스, 폴더 교체만으로 재사용 | PASS |
| VIII. 정확한 위치·마스킹 없는 연락처 | 네이버지도 고정 좌표, 카톡ID/전화/이메일 원문 노출 + 클릭 연결 | PASS |
| IX. 반응형 인터랙션 규칙 | 모바일 sticky CTA 바, 데스크톱 fade-up만 허용, 강제 전환 금지 | PASS |
| Technology & Deployment Constraints | React/Vue/Next.js/GSAP/서버 프레임워크 미사용, 빌드 없음 | PASS |
| Content Integrity Requirements | footer 고지 문구 원문 유지 | PASS |

위반 사항 없음 — Complexity Tracking 테이블은 작성하지 않는다.

**Post-Design Re-check (Phase 1 완료 후)**: `research.md`의 폰트 대체 결정(Cereal VF →
Pretendard, 원칙 II 근거 명시), `data-model.md`/`contracts/listing-data.schema.json`의
상대 경로 전용 사진 경로 강제(원칙 III·VI), 섹션 스키마의 소제목+본문 1~2문단+사진 1~3장
필수화(원칙 V)를 반영해도 위 표의 판정은 변하지 않는다. 재확인 결과 PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-skyvill-rental-listing/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── listing-data.schema.json
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
./
├── index.html            # 모든 섹션을 렌더링하는 단일 공용 템플릿 페이지
├── styles.css             # DESIGN.md 토큰 기반 스타일, fade-up 트랜지션, sticky CTA 바
├── script.js              # listing.json fetch, 섹션 렌더링, IntersectionObserver fade-up,
│                          # 네이버지도 초기화, 카톡ID 복사 / tel: / mailto: 핸들러
├── DESIGN.md               # 디자인 브리프 (읽기 전용, 수정하지 않음)
├── .nojekyll               # GitHub Pages에서 Jekyll 처리를 건너뛰기 위한 빈 파일
└── listings/
    └── skyville-401/
        ├── listing.json       # 매물 데이터 단일 소스 (주소/가격/옵션/연락처/섹션 콘텐츠/사진 경로)
        └── photos/
            ├── hero-1.jpg (또는 .webp)
            ├── room-wide-1.jpg
            ├── kitchen-1.jpg
            ├── bathroom-1.jpg
            ├── doorlock-1.jpg
            ├── elevator-1.jpg
            ├── parking-1.jpg
            ├── corridor-1.jpg
            ├── stream-night-1.jpg
            └── ... (섹션별 실제 제공 사진)
```

**Structure Decision**: 별도의 `src/`, `frontend/`, `backend/` 분리 없이 저장소 루트에
정적 파일 3종(`index.html`, `styles.css`, `script.js`)과 `listings/{listing-id}/`
데이터 폴더만 두는 단일 정적 사이트 구조를 채택한다. `index.html`은 매물별 고유 마크업을
갖지 않고 `listing.json`을 읽어 동적으로 섹션을 채우는 공용 템플릿이므로, 새 호실 추가는
`listings/` 아래 폴더 하나를 더 두는 것으로 끝난다(코드 변경 0건 — SC-006 충족).

## Complexity Tracking

> Constitution Check에 위반 사항이 없으므로 이 섹션은 작성하지 않는다.
