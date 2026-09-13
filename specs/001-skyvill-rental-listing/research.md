# Phase 0 Research: 스카이빌 원룸 임대 홍보 단일 페이지

기술 스택은 사용자 입력에서 이미 확정되어 제공되었으므로 (정적 HTML/CSS/Vanilla JS,
네이버지도 JS API, GitHub Pages, 빌드 없음), Technical Context에 `NEEDS CLARIFICATION`
항목은 없다. 아래는 구현 방식을 확정하기 위해 검토한 결정 사항이다.

## 1. 스크롤 등장 애니메이션 구현 방식

- **Decision**: 하나의 공용 `IntersectionObserver` 인스턴스(threshold ≈ 0.15,
  rootMargin으로 약간의 조기 트리거)를 사용해 `[data-reveal]` 요소를 관찰하고, 뷰포트
  진입 시 `is-visible` 클래스를 추가한다. CSS는 `opacity 0→1`, `transform:
  translateY(12px)→translateY(0)`만 `transition: 300~450ms ease-out`으로 애니메이션한다.
  한 번 나타난 요소는 `unobserve()`로 관찰을 해제해 재트리거·재계산 비용을 없앤다.
- **Rationale**: GSAP/ScrollTrigger 같은 라이브러리 없이 순수 JS만으로 "은은한 fade-up"을
  구현할 수 있는 가장 단순하고 성능 비용이 낮은 방법이다. `transform`/`opacity`만 애니메이션하므로
  레이아웃/페인트 재계산이 없다(Constitution IV·IX, 성능 원칙 충족).
- **Alternatives considered**: `scroll` 이벤트 + `getBoundingClientRect()` 폴링(폐기 —
  스크롤마다 강제 리플로우 위험), CSS `@scroll-timeline`/`animation-timeline`(폐기 — 브라우저
  지원 범위가 target platform보다 좁음), GSAP ScrollTrigger(폐기 — 요구사항에서 명시적으로 금지).

## 2. `prefers-reduced-motion` 처리

- **Decision**: 스크립트 초기화 시 `matchMedia('(prefers-reduced-motion: reduce)').matches`를
  확인한다. `true`이면 IntersectionObserver를 아예 등록하지 않고 모든 `[data-reveal]` 요소에
  `is-visible`(또는 동등한 "즉시 최종 상태") 클래스를 처음부터 부여한다. CSS 트랜지션 자체도
  해당 미디어 쿼리 안에서 `transition: none`으로 무력화한다.
- **Rationale**: JS와 CSS 양쪽에서 동일한 조건을 이중으로 가드해, 스크립트 로드 지연이나 CSS
  캐스케이드 순서와 무관하게 reduced-motion 사용자가 항상 완전한 콘텐츠를 즉시 보게 한다
  (Constitution IV).
- **Alternatives considered**: CSS `@media (prefers-reduced-motion: reduce)`만으로 처리(폐기 —
  JS가 여전히 `is-visible` 부여를 지연시키면 스크린리더/키보드 포커스 타이밍에 불일치가 생길 수
  있음). 단일 가드만 적용(폐기 — 이중 가드가 더 안전하고 비용이 거의 없음).

## 3. 폰트 전략: DESIGN.md의 Cereal VF → Pretendard 대체

- **Decision**: `DESIGN.md`가 정의한 타이포그래피 스케일(크기/굵기/행간/자간 토큰)은 그대로
  따르되, 폰트 패밀리만 사용자 지정대로 `Pretendard`(jsDelivr CDN, 오픈소스 라이선스 배포본)를
  우선 사용하고, 로드 실패 시 `-apple-system, "Noto Sans KR", system-ui, sans-serif` 순으로
  대체한다.
- **Rationale**: `DESIGN.md` 원본이 지정한 "Airbnb Cereal VF"는 Airbnb 라이선스 전용 상용
  폰트로 이 프로젝트에서 합법적으로 사용할 수 없고, 애초에 한글 글리프를 지원하지 않는다.
  `DESIGN.md` 자체도 "Note on Font Substitutes"에서 대체 폰트 사용을 전제하고 있으므로(가장
  가까운 대체로 Inter를 제시), 한국어 콘텐츠에는 Inter보다 국문 가독성이 검증된 Pretendard가
  더 적합한 대체 선택이다. 타이포 스케일(크기/굵기/행간)은 `DESIGN.md` 값을 그대로 유지하므로
  Constitution II(디자인 브리프 우선)를 위반하지 않는다 — 브리프의 "정신"(모던하고 절제된
  산세리프, 절제된 굵기)을 따르되 라이선스·언어 제약상 불가능한 특정 서체명만 대체한다.
- **Alternatives considered**: Inter만 사용(폐기 — 한글 지원 없음), 커스텀 폰트 파일 무단
  포함(폐기 — Constitution 및 사용자 지시 위반), 시스템 폰트만 사용(폐기 — `DESIGN.md`가
  지정한 절제된 sans-serif 톤에 가장 가까운 선택지가 Pretendard이므로 우선순위를 낮춤).

## 4. 네이버지도 초기화 및 좌표 처리

- **Decision**: 네이버지도 JS SDK `<script>` 태그를 `defer`로 로드하고, `window.onload` 이후
  콜백에서 지도 컨테이너(고정 높이 240px)에 `new naver.maps.Map(...)`을 초기화한다. 주소
  문자열은 화면에 텍스트로도 항상 노출하고, 지도 마커 좌표는 `listing.json`의 `map.lat`/`map.lng`
  고정값을 사용한다(런타임 지오코딩 API 호출 없음).
- **Rationale**: 런타임 지오코딩은 추가 API 키/쿼터/네트워크 실패 지점을 늘리고 좌표가 페이지
  로드마다 달라질 위험이 있다. 주소가 고정된 단일 매물 사이트에서는 좌표를 한 번 확인해
  데이터 파일에 고정하는 편이 더 안정적이고, 지도 스크립트 로드가 실패해도 주소 텍스트와
  나머지 콘텐츠는 영향받지 않는다(Edge Case 대응, Constitution VIII).
- **Alternatives considered**: 클라이언트에서 매번 Geocoding API 호출(폐기 — 실패 지점·쿼터
  비용 증가), Static Maps 이미지로 대체(폐기 — 사용자 요구사항이 명시적으로 JS API 지도를
  요구함).

## 5. 카카오톡 ID 복사 인터랙션

- **Decision**: 버튼 클릭 시 `navigator.clipboard.writeText('ckpark1001')`을 시도하고,
  성공 시 버튼 라벨/아리아 라이브 리전으로 "복사됨" 피드백을 짧게 노출한다. Clipboard API를
  사용할 수 없는 구형 환경에서는 임시 `<input>` + `document.execCommand('copy')` 폴백을
  사용한다.
- **Rationale**: 카카오 인증이나 딥링크 없이 "ID 노출 + 복사" 요구사항을 만족하는 가장 단순한
  방법이며, 실패 시에도 ID 텍스트 자체가 화면에 그대로 노출되어 있어(마스킹 없음, Constitution
  VIII) 사용자가 수동으로 복사할 수 있다.
- **Alternatives considered**: `kakaotalk://` 딥링크 시도(폐기 — 인증/앱설치 의존성이 생기고
  요구사항 범위 밖), 복사 버튼 없이 텍스트만 노출(폐기 — 사용자가 명시적으로 복사 버튼을 요구함).

## 6. `listing.json` 구조와 다중 호실 재사용

- **Decision**: 섹션 순서와 필드 이름을 고정한 단일 JSON 스키마(`contracts/listing-data.schema.json`
  참고)로 정의하고, `index.html`/`script.js`는 이 스키마 키만 참조한다. 어떤 섹션의 사진
  개수(1~3장)나 키워드 배열 길이가 달라져도 렌더링 로직이 그대로 동작하도록 배열 기반 구조로
  설계한다.
- **Rationale**: Constitution VII·FR-015·SC-006(코드 변경 0건으로 재사용)을 만족하려면 마크업이
  아니라 데이터가 콘텐츠를 결정해야 한다. 스키마를 고정하면 새 호실 추가 시 담당자가 무엇을
  채워야 하는지 명확해진다.
- **Alternatives considered**: 호실별로 별도 HTML 파일을 두는 방식(폐기 — 코드 중복 발생, 유지보수
  비용 증가 및 Constitution VII 위반).

## 7. GitHub Pages 배포 경로 및 `.nojekyll`

- **Decision**: 모든 자산 참조를 `./` 상대 경로로 작성하고, 저장소 루트에 빈 `.nojekyll`
  파일을 두어 GitHub Pages의 Jekyll 처리(밑줄로 시작하는 파일/폴더 무시 등)를 건너뛴다.
- **Rationale**: 프로젝트 페이지(`https://<user>.github.io/<repo>/`)든 사용자 페이지든 하위
  경로 여부와 무관하게 링크·이미지·`listing.json` fetch 경로가 깨지지 않아야 한다(Constitution III).
- **Alternatives considered**: 절대 경로(`/listings/...`) 사용(폐기 — 프로젝트 페이지의
  `/<repo>/` 하위 경로에서 깨짐, Constitution III 위반).

## 결론

모든 조사 항목이 구체적인 결정으로 해소되었으며, Technical Context에 남아있는
`NEEDS CLARIFICATION` 표시는 없다. Phase 1 설계로 진행한다.
