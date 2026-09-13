# Phase 1 Data Model: 스카이빌 원룸 임대 홍보 단일 페이지

이 프로젝트에는 데이터베이스가 없다. 아래 엔티티는 모두 `listings/{listing-id}/listing.json`
파일 하나에 담기는 정적 데이터 구조를 설명한다. 상세 JSON 형식은
[`contracts/listing-data.schema.json`](./contracts/listing-data.schema.json)을 참고한다.

## Listing (매물)

한 호실을 나타내는 최상위 엔티티. `listings/{listing-id}/` 폴더 하나가 매물 하나에 대응한다.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 폴더명과 동일한 매물 식별자 (예: `skyville-401`) |
| `title` | string | 매물명 (예: "스카이빌") |
| `subtitle` | string | 히어로 부제 |
| `heroLead` | string | 히어로 리드문 (원문 그대로, 축약 금지) |
| `heroPhoto` | Photo | 즉시 로딩되는 히어로 대표 사진 1장 |
| `summary` | Summary | 핵심 요약 스펙 |
| `sections` | SectionBlock[] | 방&옵션/주방/화장실/보안/편의시설/입지/관리비/신뢰요소 등 순서대로 나열된 정보 블록 배열 |
| `location` | Location | 주소 및 지도 좌표 |
| `contact` | Contact | 카카오톡/전화/이메일 연락처 |
| `finalCta` | FinalCta | 마지막 CTA 섹션 콘텐츠 |
| `footerNotice` | string | footer 고지 문구 (원문 그대로) |

**검증 규칙**:
- `sections` 배열의 각 항목은 최소 1장 이상 최대 3장 이하의 사진을 가져야 한다(FR-003).
- `heroLead`, `sections[].body` 등 서술형 문자열 필드는 빈 문자열일 수 없다(FR-010 — 본문
  생략 금지).
- `footerNotice`는 항상 렌더링되어야 하며 편집기가 임의로 비울 수 없다(Constitution
  Content Integrity Requirements).

## SectionBlock (정보 블록)

방&옵션, 주방, 화장실, 보안, 건물 편의시설, 입지 및 주변환경, 관리비 포함 항목, 신뢰 요소
섹션이 공통으로 따르는 구조.

| 필드 | 타입 | 설명 |
|---|---|---|
| `key` | string | 섹션 식별자 (예: `room`, `kitchen`, `bathroom`, `security`, `amenities`, `location`, `fees`, `trust`) |
| `heading` | string | 소제목 한 줄 |
| `body` | string[] | 본문 문단 배열(1~2개), 각 원소가 한 문단 |
| `photos` | Photo[] | 관련 사진 1~3장 |
| `keywords` | string[] | 짧은 정보 키워드/배지 텍스트 (선택) |
| `specs` | KeyValue[] | 가격/면적 등 짧은 스펙 값 (선택, 요약 카드/신뢰 요소 등에서 사용) |

## Photo (사진)

| 필드 | 타입 | 설명 |
|---|---|---|
| `src` | string | `listings/{id}/photos/` 아래 상대 경로 (예: `photos/room-wide-1.jpg`) |
| `alt` | string | 구체적인 대체 텍스트 (예: "스카이빌 방 전체 전경") |
| `aspectRatio` | string | 레이아웃 이동 방지를 위한 고정 비율 (기본 `4/3`) |

**검증 규칙**: `src`는 반드시 상대 경로여야 하며 `http(s)://` 절대 URL이나 외부 hotlink를
포함할 수 없다(Constitution VI, FR-011).

## Summary (핵심 요약 스펙)

| 필드 | 타입 | 설명 |
|---|---|---|
| `deposit` | string | 보증금 (예: "8,500만 원") |
| `monthlyRent` | string | 월세 (예: "32만 원") |
| `maintenanceFee` | string | 관리비 (예: "8만 원, 별도") |
| `parkingFee` | string | 주차비 안내 (예: "별도") |
| `floor` | string | 층수/총 층수 (예: "4층 / 총 7층") |
| `areaPyeong` | string | 면적 (예: "약 6평") |
| `moveInDate` | string | 입주 가능일 (예: "2026년 8월 21일 (일정 협의 가능)") |
| `loanEligibility` | string | 전세대출 가능 여부 (예: "LH·SH·중기청 가능") |

## Location (위치 정보)

| 필드 | 타입 | 설명 |
|---|---|---|
| `address` | string | 정확한 주소 (서울특별시 성북구 보문동2가 82) — 그대로 노출 |
| `map.lat` | number | 네이버지도 표시용 위도 (사전 확인된 고정값) |
| `map.lng` | number | 네이버지도 표시용 경도 (사전 확인된 고정값) |
| `neighborhoodNote` | string | 성북천/동네 등 주변환경 설명 (SectionBlock.body와 별개로 지도 캡션에 쓰일 경우) |

## Contact (연락처)

| 필드 | 타입 | 설명 |
|---|---|---|
| `kakaoId` | string | 카카오톡 상담 ID (`ckpark1001`), 마스킹 없이 노출 + 복사 버튼 |
| `phone` | string | 전화번호 (`010-8222-7661`), `tel:` 링크 |
| `email` | string | 이메일 (`ckpark1001@naver.com`), `mailto:` 링크 |

## FinalCta (마지막 CTA)

| 필드 | 타입 | 설명 |
|---|---|---|
| `heading` | string | "지금 바로 문의해 보세요" |
| `message` | string | CTA 안내 문장 |
| `buttons` | { label: string, action: 'kakao-copy'\|'tel'\|'mailto' }[] | 버튼 라벨과 동작 종류 |

## 관계 요약

```
Listing 1 ─┬─ 1 Summary
           ├─ 1 Location
           ├─ 1 Contact
           ├─ 1 FinalCta
           ├─ 1 heroPhoto (Photo)
           └─ N SectionBlock ── N Photo
```

모든 관계는 하나의 `listing.json` 파일 내부의 중첩 구조로 표현되며, 별도 조인이나 참조 테이블이
필요 없다. 상태 전이(status transition)는 없다 — 이 데이터는 편집자가 배포 전에 직접
갱신하는 정적 콘텐츠다.
