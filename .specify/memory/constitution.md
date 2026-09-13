<!--
Sync Impact Report
- Version change: (template, unratified) → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
  - Core Principles: I–IX (all new)
  - Technology & Deployment Constraints (new, replaces [SECTION_2_NAME])
  - Content Integrity Requirements (new, replaces [SECTION_3_NAME])
  - Governance (filled in)
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md — ⚠ pending manual review (verify Constitution Check
    gates reference these principles, not generic library/CLI/TDD placeholders)
  - .specify/templates/spec-template.md — ⚠ pending manual review
  - .specify/templates/tasks-template.md — ⚠ pending manual review
- Follow-up TODOs:
  - TODO(RATIFICATION_DATE): original adoption date unknown; set to first-draft date
    (2026-09-13) pending confirmation from project owner.
-->

# 스카이빌 원룸 홍보 사이트 Constitution

## Core Principles

### I. 정적 사이트 전용, 서버리스 (Static-Only, No Backend)
로그인, 애플리케이션 서버, 데이터베이스, API 서버를 구축하지 않는다. 이 프로젝트는 서울
성북구 보문동 "스카이빌" 원룸(오피스텔) 임대 홍보를 위한 단일 페이지(single-page) 정적
웹사이트로만 존재한다. 매물 정보는 오직 `listing.json` 정적 파일로 관리하며, 이를 읽어
렌더링하는 것 외의 서버 사이드 로직을 두지 않는다.
**근거**: 임대 홍보 사이트는 인증/저장 상태가 필요 없고, 서버 의존성을 배제해야 GitHub
Pages 같은 정적 호스팅에 그대로 배포할 수 있다.

### II. 디자인 브리프 우선 (DESIGN.md Fidelity)
프로젝트 루트의 `DESIGN.md`(디자인 브리프)를 UI 구현의 최우선 시각 기준으로 삼는다. 색상,
타이포그래피, 레이아웃, 톤앤매너 등 시각적 결정이 `DESIGN.md`와 충돌할 경우 `DESIGN.md`가
우선한다. `DESIGN.md` 원본 파일 자체는 수정하지 않는다 — 구현이 브리프를 따라가야 하며,
브리프를 구현에 맞춰 고치지 않는다.
**근거**: 디자인 브리프는 이해관계자가 합의한 시각적 계약이며, 구현 과정에서 임의로
바뀌면 그 합의가 무의미해진다.

### III. GitHub Pages 호환 상대 경로 (Portable Relative Paths)
모든 페이지 경로와 이미지 경로는 상대 경로(relative path)로 작성하여 GitHub Pages를
포함한 정적 호스팅 환경에서 별도 설정 없이 동작해야 한다. 절대 경로나 특정 호스트/포트에
의존하는 경로를 사용하지 않는다.
**근거**: 배포 환경(로컬, GitHub Pages, 서브패스 등)이 바뀌어도 링크와 이미지가 깨지지
않아야 한다.

### IV. 접근성과 모션 민감도 (Accessibility & Motion Sensitivity)
semantic HTML 요소를 사용하고 키보드만으로 모든 인터랙션(내비게이션, 링크, 문의 CTA
포함)에 도달하고 조작할 수 있어야 한다. `prefers-reduced-motion`을 존중하여, 해당 설정을
사용하는 사용자는 과도한 애니메이션 없이도 모든 콘텐츠를 온전히 확인할 수 있어야 한다.
**근거**: 홍보 사이트의 핵심 목적(정보 전달과 문의 연결)은 접근성 장벽 없이 모든
방문자에게 동일하게 달성되어야 한다.

### V. 사진만이 아닌 실제 서술형 콘텐츠 (Substantive Written Content)
사진을 나열하는 것으로 콘텐츠를 대신하지 않는다. 히어로 영역에는 실제 리드 문장을 두고,
방/옵션/보안/입지/주변환경 등 섹션별로 실질적인 설명 문단을 제공한다. 본문 텍스트는
사진 위에 얹힌 작은 캡션 수준으로 축소하지 않고, 읽기 좋은 글자 크기와 행간을 갖춘
독립적인 디자인 요소로 다룬다.
**근거**: 임대 결정에는 사진만으로 전달되지 않는 맥락(생활 동선, 보안, 입지 장점 등)이
필요하며, 캡션 수준의 텍스트는 이를 전달하지 못한다.

### VI. 실제 촬영 사진만 사용 (Authentic Photography Only)
사용하는 모든 사진은 실제로 촬영된 매물·현장 사진(제공된 원본 파일)만 사용한다. 온라인에서
대체 이미지를 검색하거나 내려받지 않는다. placeholder 이미지, 임의의 단색 박스, 외부
이미지 hotlink는 최종 결과물에 남기지 않는다.
**근거**: 임대 홍보의 신뢰성은 실제 매물 사진에 달려 있으며, 대체·가짜 이미지는 오인을
유발하고 신뢰를 훼손한다.

### VII. 단일 데이터 소스와 재사용 가능한 템플릿 구조 (Single-Source Data & Reusable Template)
매물 데이터(주소, 가격, 옵션, 연락처 등)는 `listing.json` 한 곳에서만 관리한다. 다른 호실을
추가할 때는 이 JSON 파일과 해당 사진 폴더만 교체하면 동일한 템플릿을 그대로 재사용할 수
있는 구조를 유지한다. 최종 산출물은 `/listings/{매물명}/` 폴더 구조를 포함하여 GitHub
Pages에서 즉시 배포 가능해야 한다.
**근거**: 매물은 시간이 지나며 교체되거나 여러 건으로 늘어날 수 있으므로, 코드를 다시
작성하지 않고 데이터와 사진만 교체해 재사용할 수 있어야 유지보수 비용이 낮아진다.

### VIII. 정확한 위치와 마스킹 없는 연락처 노출 (Accurate Location & Unmasked Contact)
지도는 네이버지도(Naver Maps API)로 표시하고, 정확한 주소(서울특별시 성북구 보문동2가
82)를 그대로 노출한다. 카카오톡 상담 ID(`ckpark1001`), 전화번호(`010-8222-7661`),
이메일(`ckpark1001@naver.com`)은 마스킹 없이 그대로 노출하며, 클릭/탭으로 즉시 연결되도록
한다(전화는 `tel:`, 이메일은 `mailto:`, 카카오톡 ID는 복사 버튼 제공).
**근거**: 임대 문의는 즉시성이 중요하며, 마스킹되거나 한 단계를 더 거쳐야 하는 연락 수단은
문의 전환율을 낮춘다.

### IX. 반응형 인터랙션 규칙 (Responsive Interaction Patterns)
모바일 화면에서는 읽기 쉬운 세로 스크롤 흐름과 함께, 화면 하단에 고정된(sticky) 카톡/전화
문의 CTA 바를 제공한다. 데스크톱에서는 은은한 스크롤 등장 효과(fade-up 등)를 허용하되,
장면이 끊기거나 강제로 튀는 연출은 사용하지 않는다(원칙 IV의 `prefers-reduced-motion`
준수와 함께 적용).
**근거**: 방문자의 대다수는 모바일에서 접근하며, 문의 행동을 유도하는 CTA는 스크롤 위치와
무관하게 항상 접근 가능해야 한다.

## Technology & Deployment Constraints

불필요한 프레임워크와 서버 의존성을 추가하지 않는다. 순수 HTML/CSS/JS 또는 경량 정적
사이트 생성기(예: 빌드 후 정적 파일만 산출되는 도구)만 사용할 수 있다. 런타임에 서버
프로세스, 데이터베이스, 인증 서비스가 필요한 어떤 도구·라이브러리·프레임워크도 채택하지
않는다. 최종 결과물은 별도의 빌드 서버나 백엔드 없이 GitHub Pages에서 바로 배포 가능한
정적 파일 구조여야 한다.

## Content Integrity Requirements

원문에 포함된 고지 문구(예: "현재 사진은 같은 구조의 다른 호실 사진입니다")는 표기된
그대로 유지한다. 문구의 의미를 바꾸거나 임의로 삭제·완화하지 않는다. 이러한 고지는 법적·
신뢰 목적을 가지므로 편집자의 재량으로 수정할 수 없다.

## Governance

이 Constitution은 프로젝트의 다른 모든 관행(코딩 스타일 가이드, 임시 결정, 개별 PR 논의)에
우선한다. 이 문서와 충돌하는 결정은 이 문서를 먼저 개정한 뒤에만 적용할 수 있다.

**개정 절차**: Constitution 변경은 (1) 변경 제안과 근거를 명시하고, (2) 아래 버전 관리
정책에 따라 버전을 올리며, (3) `Sync Impact Report`를 문서 상단에 기록하는 방식으로만
이루어진다. 원칙의 삭제나 의미를 뒤집는 재정의는 MAJOR, 원칙 추가나 실질적 가이드 확장은
MINOR, 문구 명확화나 오탈자 수정은 PATCH로 처리한다.

**준수 검토**: 이 문서를 참조하는 `/speckit-plan`, `/speckit-tasks` 등의 워크플로 산출물은
매 기능 계획 시 Constitution Check 단계에서 위 원칙(특히 I, II, VI, VII, VIII)과의 충돌
여부를 확인해야 한다. 서버/DB/로그인 도입, `DESIGN.md` 원본 수정, 대체·placeholder 이미지
사용, `listing.json` 외 데이터 소스 도입 등은 이 Constitution 위반으로 간주하고 별도
개정 없이는 진행할 수 없다.

**Version**: 1.0.0 | **Ratified**: 2026-09-13 | **Last Amended**: 2026-09-13
