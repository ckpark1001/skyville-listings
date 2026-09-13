---

description: "Task list template for feature implementation"
---

# Tasks: 스카이빌 원룸 임대 홍보 단일 페이지

**Input**: Design documents from `/specs/001-skyvill-rental-listing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/listing-data.schema.json, quickstart.md

**Tests**: 이 기능은 자동화 테스트 프레임워크를 사용하지 않는다(plan.md Technical Context —
빌드 없는 정적 마크업 프로젝트). 대신 `quickstart.md`의 수동 QA 체크리스트로 검증하며, 이는
아래 Polish 단계의 태스크로 포함되어 있다.

**Organization**: 태스크는 spec.md의 사용자 스토리(P1/P2/P3) 기준으로 그룹화되어 있다.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능(다른 파일, 미완료 태스크에 의존하지 않음)
- **[Story]**: 이 태스크가 속한 사용자 스토리(US1/US2/US3)
- 각 설명에 정확한 파일 경로 포함

## Path Conventions

단일 정적 사이트 구조(plan.md 참조) — 저장소 루트에 `index.html`/`styles.css`/`script.js`,
그 아래 `listings/skyville-401/listing.json`과 `listings/skyville-401/photos/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 파일/폴더 골격과 데이터·사진 원본 준비

- [X] T001 `plan.md` Project Structure대로 저장소 루트에 `index.html`, `styles.css`, `script.js`,
      `.nojekyll`, `listings/skyville-401/photos/` 골격을 생성한다(`DESIGN.md`는 이미 존재,
      수정하지 않음).
- [X] T002 [P] `styles.css`에 Pretendard 웹폰트(jsDelivr CDN) `@import`/`<link>`와
      `-apple-system, "Noto Sans KR", system-ui, sans-serif` 대체 스택을 `research.md` #3
      결정에 따라 등록한다.
- [X] T003 [P] `listings/skyville-401/listing.json`을 `contracts/listing-data.schema.json` 스키마에
      맞춰 생성하고, spec.md에 명시된 실제 문구(히어로 리드문, 각 섹션 소제목/본문/키워드,
      요약 스펙, 연락처, footer 고지)를 원문 그대로 채운다.
- [X] T004 [P] 제공된 실제 매물·현장 사진을 `listings/skyville-401/photos/`에
      `hero-1`, `room-wide-1`, `kitchen-1`, `bathroom-1`, `doorlock-1`, `elevator-1`,
      `parking-1`, `corridor-1`, `stream-night-1` 등 카테고리별 파일명으로 정리하고, 웹에
      적합한 포맷/용량으로 최적화한다(WebP 우선, JPG는 압축). placeholder·스톡 이미지 금지.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 사용자 스토리가 공유하는 렌더링 엔진과 접근성/성능 기반

**⚠️ CRITICAL**: 이 단계가 끝나기 전에는 어떤 사용자 스토리 작업도 시작할 수 없다.

- [X] T005 `index.html`에 semantic 골격(`header`, `main`, 섹션 컨테이너 자리, `footer`)을 만들고
      `styles.css`/`script.js`를 상대 경로(`./styles.css`, `./script.js`)로 연결한다.
- [X] T006 `script.js`에 `fetch('./listings/skyville-401/listing.json')` 데이터 로딩 함수를
      구현한다. 필드가 일부 누락되어도 페이지가 깨지지 않고 확보된 정보만 렌더링하도록
      방어적으로 처리한다(FR-004, Edge Case).
- [X] T007 `script.js`에 `SectionBlock`(소제목/본문 1~2문단/사진 1~3장/키워드/스펙)을 받아
      DOM에 렌더링하는 공용 함수를 구현한다 — 방/주방/화장실/보안/편의시설/입지/관리비/
      신뢰요소 8개 섹션이 모두 이 함수 하나를 재사용한다(Constitution VII, FR-015).
- [X] T008 [P] `script.js`에 `Photo` 렌더링 헬퍼를 구현한다: `aspect-ratio: 4/3` 고정,
      구체적 `alt` 텍스트, 기본 `loading="lazy"`, 히어로 대표 사진만 즉시 로딩 예외 처리
      (FR-011, 성능 원칙).
- [X] T009 [P] `script.js`에 단일 `IntersectionObserver` 인스턴스로 `[data-reveal]` 요소를
      감지해 `is-visible` 클래스를 부여하고 등장 후 `unobserve()`하는 fade-up 로직을
      구현한다(research.md #1).
- [X] T010 [P] `script.js`/`styles.css`에 `prefers-reduced-motion` 이중 가드를 구현한다: JS는
      `matchMedia` 확인 후 옵저버 등록 자체를 건너뛰고 모든 `[data-reveal]`에 `is-visible`을
      즉시 부여하며, CSS는 동일 미디어쿼리에서 `transition: none`을 적용한다(research.md #2,
      FR-009).
- [X] T011 [P] `styles.css`에 `DESIGN.md`의 색상/타이포그래피/spacing 토큰을 CSS 커스텀
      프로퍼티로 옮기고, fade-up 애니메이션은 `opacity`/`transform`만 사용하는 클래스
      (`.reveal`, `.reveal.is-visible`)로 정의한다(성능 원칙 — layout 속성 애니메이션 금지).
- [X] T012 `styles.css`에 반응형 레이아웃 골격을 구현한다: 모바일은 이미지 다음 본문이
      이어지는 세로 문서 흐름, 데스크톱은 본문 폭 32~44rem 제한과 섹션별 이미지/본문 좌우
      교차 배치, 데스크톱 본문 15~17px·line-height 1.6~1.75, WCAG AA 대비 확보.

**Checkpoint**: 공용 렌더링 엔진과 접근성/성능 기반이 준비되어 사용자 스토리 구현을 시작할
수 있다.

---

## Phase 3: User Story 1 - 언제든 문의로 연결되기 (Priority: P1) 🎯 MVP

**Goal**: 방문자가 페이지 어디에 있든 카카오톡/전화/이메일로 즉시 문의할 수 있게 한다.

**Independent Test**: 페이지를 열고 어느 스크롤 위치에서든 하단 sticky 바의 "카톡으로
문의하기"/"전화하기" 버튼을 탭해, 카카오톡 ID 복사와 `tel:` 연결이 각각 즉시 일어나는지
확인한다.

### Implementation for User Story 1

- [X] T013 [US1] `index.html`/`styles.css`에 `position: fixed` 하단 sticky CTA 바를
      구현한다(카톡 문의/전화 버튼). 리사이즈 시에도 CSS만으로 높이·레이아웃이 깨지지 않게
      한다(FR-007, 성능 원칙 — JS 재계산 최소화).
- [X] T014 [US1] `script.js`에 카카오톡 ID(`ckpark1001`) 복사 인터랙션을 구현한다:
      `navigator.clipboard.writeText` 우선 시도, 실패 시 `execCommand('copy')` 폴백, 복사
      완료 피드백(텍스트 변경 또는 `aria-live` 영역)을 제공한다(research.md #5).
- [X] T015 [US1] `script.js`에서 `listing.json`의 `contact.phone`/`contact.email` 값으로
      sticky 바와 마지막 CTA 섹션의 `tel:`/`mailto:` 링크를 생성한다(FR-006).
- [X] T016 [US1] 공용 렌더러(T007)를 사용하지 않는 `finalCta` 전용 렌더 함수를 `script.js`에
      구현해 마지막 CTA 섹션(제목/문장/버튼)을 `listing.json.finalCta`에서 렌더링한다.
- [X] T017 [US1] `script.js`/`index.html`에 `listing.json.footerNotice`("현재 사진은 같은 구조의
      다른 호실 사진입니다")를 footer에 원문 그대로 렌더링한다(Content Integrity
      Requirements — 항상 표시, 편집 금지).
- [X] T018 [US1] sticky CTA 바가 어떤 스크롤/리사이즈 상황에서도 가려지거나 사라지지 않도록
      QA하고 필요한 CSS `z-index`/safe-area 보정을 적용한다.
- [X] T019 [US1] sticky CTA 바와 마지막 CTA 버튼에 대해 키보드 Tab 이동·포커스 링·`aria-label`을
      점검하고 보완한다(FR-013).

**Checkpoint**: User Story 1이 독립적으로 완전히 동작하고 테스트 가능하다.

---

## Phase 4: User Story 2 - 핵심 조건을 빠르게 확인하기 (Priority: P2)

**Goal**: 방문자가 보증금/월세/관리비/면적/층수/입주일/전세대출 가능 여부를 페이지 상단에서
빠르게 스캔할 수 있게 한다.

**Independent Test**: 히어로와 핵심 요약 카드만 표시된 상태에서 7가지 핵심 값을 모두 10초
이내에 찾아 읽을 수 있는지 확인한다.

### Implementation for User Story 2

- [X] T020 [US2] `script.js`/`index.html`에 히어로 섹션(제목/부제/`heroLead`/`heroPhoto` 즉시
      로딩)을 `listing.json`에서 렌더링한다(FR-002).
- [X] T021 [US2] `script.js`/`index.html`에 핵심 요약 카드(보증금/월세/관리비/주차비/층수/
      면적/입주가능일/전세대출)를 `listing.json.summary`에서 스캔하기 쉬운 키-값 그리드로
      렌더링한다(FR-002, SC-003).
- [X] T022 [US2] `styles.css`에 히어로 제목 > 부제 > 리드문 > 요약값 사이의 타이포그래피
      위계를 `DESIGN.md` 스케일(T011의 토큰) 기준으로 적용한다.
- [X] T023 [US2] `quickstart.md` 시나리오 1을 기준으로 히어로+요약 카드만으로 SC-001/SC-003이
      충족되는지 수동 확인한다.

**Checkpoint**: User Story 1과 2가 함께 독립적으로 동작한다.

---

## Phase 5: User Story 3 - 사진과 설명으로 실제 생활을 상상하기 (Priority: P3)

**Goal**: 방/주방/화장실/보안/건물 편의시설/입지 및 주변환경/관리비/신뢰 요소 섹션의 실제
사진과 상세 설명으로 생활 모습을 구체적으로 그려보게 한다.

**Independent Test**: 각 섹션에서 소제목·제공된 본문 전체·실제 사진 1~3장·키워드가 모두
표시되는지 섹션별로 확인한다.

### Implementation for User Story 3

- [X] T024 [P] [US3] 공용 렌더러(T007)로 "방 & 옵션"(`room`) 섹션을 렌더링하고, 필요한
      키워드 배지 스타일을 `styles.css`에 추가한다.
- [X] T025 [P] [US3] "주방"(`kitchen`) 섹션을 렌더링하고 스타일을 확인·보완한다.
- [X] T026 [P] [US3] "화장실"(`bathroom`) 섹션을 렌더링하고 스타일을 확인·보완한다.
- [X] T027 [P] [US3] "보안"(`security`) 섹션을 렌더링하고 스타일을 확인·보완한다.
- [X] T028 [P] [US3] "건물 편의시설"(`amenities`) 섹션을 렌더링하고 스타일을 확인·보완한다.
- [X] T029 [US3] "입지 및 주변환경"(`location`) 섹션 본문과 지도 컨테이너(고정 높이 240px)를
      나란히 배치해 렌더링한다(FR-005).
- [X] T030 [US3] `index.html`/`script.js`에 네이버지도 JS API를 `defer` 로딩하고 스크립트
      로드 완료 후 `listing.json.location.map.lat/lng` 고정 좌표로 지도를 초기화한다. 스크립트
      로드 실패 시 주소 텍스트와 나머지 콘텐츠는 정상 동작해야 한다(research.md #4, Edge
      Case).
- [X] T031 [P] [US3] "관리비 포함 항목"(`fees`) 섹션을 렌더링하고 스타일을 확인·보완한다.
- [X] T032 [P] [US3] "신뢰 요소"(`trust`) 섹션을 렌더링하고 배지(융자 없음/LH·SH·중기청 가능/
      집주인 재직) 스타일을 `styles.css`에 추가한다.
- [X] T033 [US3] `styles.css`에서 섹션마다 이미지/본문 좌우 배치를 교차시키는 리듬을
      구현하되, 스펙/키워드의 스캔 가능성을 해치지 않게 한다(콘텐츠 레이아웃 원칙).
- [X] T034 [US3] T024~T032의 모든 섹션 요소에 `data-reveal` 속성을 부여해 T009/T010의
      fade-up·reduced-motion 로직이 적용되게 연결한다.

**Checkpoint**: 모든 사용자 스토리가 독립적으로 기능한다.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 여러 사용자 스토리에 걸친 검증과 마무리

- [X] T035 [P] Lighthouse Accessibility/Performance 감사를 실행하고 CLS·명도 대비(WCAG AA)
      이슈를 점검·보완한다.
- [X] T036 [P] 브라우저 Network 탭에서 모든 사진이 200으로 로드되고 외부 hotlink가 없는지
      확인한다(Constitution VI, FR-011).
- [X] T037 [P] `listings/skyville-401/listing.json`을
      `contracts/listing-data.schema.json`에 대해 유효성 검증한다.
- [X] T038 저장소 전체에서 `/listings/...`, `/photos/...` 같은 절대 경로가 없는지 검색하고
      모두 `./`로 시작하는 상대 경로인지 확인한다(FR-014).
- [X] T039 `quickstart.md`의 시나리오 1~8을 처음부터 끝까지 실행해 전체 기능을 검증한다
      (reduced-motion 에뮬레이션, 키보드 내비게이션, GitHub Pages 배포 경로 점검 포함).
- [X] T040 [P] `listings/skyville-401/`을 임시로 복제한 `listings/test-listing-2/`를 만들어
      데이터만 바꾼 뒤 코드 변경 없이 재사용되는지 확인하고(SC-006), 확인 후 임시 폴더를
      삭제한다.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료에 의존 — 모든 사용자 스토리를 막는다(BLOCKS)
- **User Stories (Phase 3+)**: 모두 Foundational 완료에 의존
  - 우선순위 순서(P1 → P2 → P3)로 순차 진행 권장. 인력이 있다면 병렬 진행 가능하나 세
    스토리 모두 `index.html`/`script.js`/`styles.css`를 공유하므로 병합 충돌에 주의한다.
- **Polish (Phase 6)**: 구현하기로 한 모든 사용자 스토리 완료에 의존

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 이후 시작 가능 — 다른 스토리에 의존하지 않음
- **User Story 2 (P2)**: Foundational 이후 시작 가능 — US1과 독립적으로 테스트 가능(같은
  페이지에 공존)
- **User Story 3 (P3)**: Foundational 이후 시작 가능 — US1/US2와 독립적으로 테스트 가능

### Parallel Opportunities

- Setup의 T002/T003/T004는 서로 다른 파일(스타일 CDN 링크, listing.json, 사진 파일)이므로 병렬
  가능
- Foundational의 T008/T009/T010/T011은 서로 다른 관심사(사진 헬퍼/옵저버/모션 가드/디자인
  토큰)이므로 병렬 가능
- User Story 3의 T024~T028, T031, T032는 서로 다른 섹션 콘텐츠이므로 병렬 가능(단, T029/T030
  지도 초기화와 T033/T034 전체 리듬·reveal 연결은 모든 섹션이 존재해야 하므로 이후 처리)
- Polish의 T035/T036/T037/T040은 서로 다른 검증 활동이므로 병렬 가능

---

## Parallel Example: User Story 3

```bash
# 서로 다른 섹션 콘텐츠를 병렬로 렌더링/스타일링:
Task: "공용 렌더러로 '방 & 옵션'(room) 섹션 렌더링 및 키워드 배지 스타일"
Task: "'주방'(kitchen) 섹션 렌더링 및 스타일 확인"
Task: "'화장실'(bathroom) 섹션 렌더링 및 스타일 확인"
Task: "'보안'(security) 섹션 렌더링 및 스타일 확인"
Task: "'건물 편의시설'(amenities) 섹션 렌더링 및 스타일 확인"
Task: "'관리비 포함 항목'(fees) 섹션 렌더링 및 스타일 확인"
Task: "'신뢰 요소'(trust) 섹션 렌더링 및 배지 스타일"
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (모든 스토리를 막는 필수 단계)
3. Phase 3: User Story 1 완료
4. **중단 후 검증**: sticky CTA 바 + footer 고지만으로 문의 전환 경로가 완전히 동작하는지
   확인한다.
5. 필요 시 이 상태로 배포/시연 가능(단, 히어로/요약/상세 섹션 없이는 콘텐츠 홍보 목적이
   불완전하므로 실제 배포 전 US2·US3까지 완료 권장)

### Incremental Delivery

1. Setup + Foundational 완료 → 렌더링 엔진 준비 완료
2. User Story 1 추가 → 독립 테스트 → 문의 전환 경로 확인
3. User Story 2 추가 → 독립 테스트 → 핵심 조건 스캔 가능 확인
4. User Story 3 추가 → 독립 테스트 → 전체 상세 콘텐츠 확인
5. Polish 단계로 `quickstart.md` 전체 시나리오 검증 후 GitHub Pages 배포

---

## Notes

- [P] 태스크 = 서로 다른 파일/관심사, 선행 의존성 없음
- [Story] 라벨은 태스크를 사용자 스토리에 매핑해 추적성을 제공한다
- 각 사용자 스토리는 독립적으로 완료·테스트 가능해야 한다
- 자동화 테스트가 없으므로, 각 체크포인트에서 `quickstart.md`의 해당 시나리오로 수동 검증한다
- 논리적 단위로 커밋하고, 체크포인트마다 스토리 단위로 검증을 멈춰 확인한다
- 피할 것: 모호한 태스크, 같은 파일에 대한 불필요한 동시 편집, 스토리 간 독립성을 깨는
  교차 의존성
