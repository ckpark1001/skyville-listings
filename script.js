/**
 * 스카이빌 원룸 임대 홍보 페이지 — 공용 렌더링 스크립트.
 * listings/{listing-id}/listing.json 을 fetch 하여 모든 섹션을 렌더링한다.
 * 새 호실을 추가할 때는 <body data-listing-id="..."> 값과
 * listings/{새-id}/listing.json + photos/ 만 바꾸면 이 스크립트는 그대로 재사용된다.
 */
(function () {
  "use strict";

  // 배포 전 네이버 클라우드 플랫폼 콘솔에서 발급받은 Client ID로 교체한다.
  // 비어 있으면 지도 스크립트를 로드하지 않고 주소 텍스트만 표시한다(Edge Case 대응).
  const NAVER_MAP_CLIENT_ID = "";

  const LISTING_ID = document.body.dataset.listingId || "skyville-401";
  const LISTING_JSON_PATH = `./listings/${LISTING_ID}/listing.json`;
  const LISTING_BASE_PATH = `./listings/${LISTING_ID}/`;

  const SECTION_TITLES = {
    room: "방 & 옵션",
    kitchen: "주방",
    bathroom: "화장실",
    security: "보안",
    amenities: "건물 편의시설",
    location: "입지 및 주변환경",
    fees: "관리비 포함 항목",
    trust: "신뢰 요소",
  };

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  let revealObserver = null;
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function registerReveal(el) {
    el.setAttribute("data-reveal", "");
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      // reduced-motion이거나 IntersectionObserver 미지원 시 즉시 최종 상태로 표시
      el.classList.add("is-visible");
    }
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([key, value]) => {
        if (key === "class") node.className = value;
        else if (key === "html") node.innerHTML = value;
        else if (key.startsWith("on") && typeof value === "function") {
          node.addEventListener(key.slice(2).toLowerCase(), value);
        } else node.setAttribute(key, value);
      });
    }
    (children || []).forEach((child) => {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function resolvePhotoSrc(src) {
    // listing.json 안의 상대 경로(photos/xxx.webp)를 listing 폴더 기준 경로로 해석
    return LISTING_BASE_PATH + src.replace(/^\.?\/?/, "");
  }

  function renderPhoto(photo, { eager = false } = {}) {
    if (!photo || !photo.src) return null;
    const ratio = photo.aspectRatio || "4/3";
    const wrap = el("div", {
      class: "info-section__photo-wrap",
      style: `aspect-ratio:${ratio}`,
    });
    const img = el("img", {
      class: "info-section__photo",
      src: resolvePhotoSrc(photo.src),
      alt: photo.alt || "",
      loading: eager ? "eager" : "lazy",
      style: `aspect-ratio:${ratio}`,
    });
    wrap.appendChild(img);
    return wrap;
  }

  function renderHero(data) {
    const hero = document.getElementById("hero");
    hero.innerHTML = "";
    hero.setAttribute("aria-label", data.title || "매물 소개");

    if (data.heroPhoto) {
      const photoWrap = el("div", { class: "hero__photo-wrap" });
      const img = el("img", {
        class: "hero__photo",
        src: resolvePhotoSrc(data.heroPhoto.src),
        alt: data.heroPhoto.alt || "",
        loading: "eager",
        style: `aspect-ratio:${data.heroPhoto.aspectRatio || "4/3"}`,
      });
      photoWrap.appendChild(img);
      hero.appendChild(photoWrap);
    }

    hero.appendChild(el("h1", { id: "hero-title", class: "hero__title" }, [data.title]));
    if (data.subtitle) {
      hero.appendChild(el("p", { class: "hero__subtitle" }, [data.subtitle]));
    }
    if (data.heroLead) {
      hero.appendChild(el("p", { class: "hero__lead" }, [data.heroLead]));
    }
  }

  function renderSummary(data) {
    const root = document.getElementById("summary");
    root.innerHTML = "";
    const s = data.summary || {};

    const fields = [
      ["보증금", s.deposit],
      ["월세", s.monthlyRent],
      ["관리비", s.maintenanceFee],
      ["주차비", s.parkingFee],
      ["층수", s.floor],
      ["면적", s.areaPyeong],
      ["입주가능일", s.moveInDate],
      ["전세대출", s.loanEligibility],
    ].filter(([, value]) => value);

    const dl = el("dl", { class: "summary-card__grid" });
    fields.forEach(([label, value]) => {
      const item = el("div", { class: "summary-card__item" }, [
        el("dt", null, [label]),
        el("dd", null, [value]),
      ]);
      dl.appendChild(item);
    });
    root.appendChild(dl);
    registerReveal(root);
  }

  function renderKeywordList(keywords, className) {
    if (!keywords || !keywords.length) return null;
    const ul = el(
      "ul",
      { class: className },
      keywords.map((k) => el("li", null, [k]))
    );
    return ul;
  }

  function renderMap(container, locationData) {
    const mapBox = el("div", { class: "map-container", id: "naver-map" });
    container.appendChild(mapBox);
    container.appendChild(
      el("p", { class: "map-address" }, [`주소: ${locationData.address}`])
    );

    if (!NAVER_MAP_CLIENT_ID || !locationData.map) {
      return; // Client ID 미설정 시 주소 텍스트만 노출하고 지도는 생략 (Edge Case)
    }

    const scriptId = "naver-maps-sdk";
    function initMap() {
      if (!window.naver || !window.naver.maps) return;
      const center = new naver.maps.LatLng(locationData.map.lat, locationData.map.lng);
      const map = new naver.maps.Map(mapBox, { center, zoom: 16 });
      new naver.maps.Marker({ position: center, map });
    }

    if (window.naver && window.naver.maps) {
      initMap();
      return;
    }

    if (document.getElementById(scriptId)) return;

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_MAP_CLIENT_ID}`;
    script.defer = true;
    script.onload = initMap;
    script.onerror = function () {
      // 네트워크 차단 등으로 스크립트 로드 실패 시 지도만 비고 주소 텍스트/나머지 콘텐츠는 그대로 유지
      mapBox.setAttribute("aria-hidden", "true");
    };
    document.head.appendChild(script);
  }

  function renderSectionBlock(section, data) {
    const sectionEl = el("section", {
      class: "info-section",
      "aria-labelledby": `section-${section.key}-title`,
    });
    const inner = el("div", { class: "info-section__inner" });

    const media = el("div", { class: "info-section__media" });
    (section.photos || []).forEach((photo) => {
      const rendered = renderPhoto(photo);
      if (rendered) media.appendChild(rendered);
    });

    const body = el("div", { class: "info-section__body" });
    body.appendChild(
      el("h2", { id: `section-${section.key}-title`, class: "info-section__heading" }, [
        section.heading || SECTION_TITLES[section.key] || "",
      ])
    );
    (section.body || []).forEach((paragraph) => {
      body.appendChild(el("p", { class: "info-section__paragraph" }, [paragraph]));
    });

    if (section.key === "location") {
      renderMap(body, data.location || {});
    }

    const keywordClass =
      section.key === "trust" ? "trust-badges" : "info-section__keywords";
    const keywordList = renderKeywordList(section.keywords, keywordClass);
    if (keywordList) body.appendChild(keywordList);

    inner.appendChild(media);
    inner.appendChild(body);
    sectionEl.appendChild(inner);
    registerReveal(sectionEl);
    return sectionEl;
  }

  function renderSections(data) {
    const root = document.getElementById("sections-root");
    root.innerHTML = "";
    (data.sections || []).forEach((section) => {
      root.appendChild(renderSectionBlock(section, data));
    });
  }

  function handleCtaAction(action, data) {
    if (action === "kakao-copy") {
      copyKakaoId(data.contact && data.contact.kakaoId);
    } else if (action === "tel") {
      window.location.href = `tel:${(data.contact && data.contact.phone) || ""}`;
    } else if (action === "mailto") {
      window.location.href = `mailto:${(data.contact && data.contact.email) || ""}`;
    }
  }

  function renderFinalCta(data) {
    const root = document.getElementById("final-cta");
    root.innerHTML = "";
    const cta = data.finalCta || {};
    const contact = data.contact || {};

    root.appendChild(
      el("h2", { id: "final-cta-title", class: "final-cta__title" }, [cta.heading || ""])
    );
    if (cta.message) {
      root.appendChild(el("p", { class: "final-cta__message" }, [cta.message]));
    }

    const buttonRow = el("div", { class: "final-cta__buttons" });
    (cta.buttons || []).forEach((btn) => {
      const actionClass = btn.action === "kakao-copy" ? "btn--kakao" : "btn--primary";
      const button = el(
        "button",
        {
          type: "button",
          class: `btn ${actionClass}`,
          onClick: () => handleCtaAction(btn.action, data),
        },
        [btn.label]
      );
      buttonRow.appendChild(button);
    });
    root.appendChild(buttonRow);

    const contactList = el("ul", { class: "final-cta__contact-list" }, [
      contact.kakaoId ? el("li", null, [`카카오톡 ${contact.kakaoId}`]) : null,
      contact.phone
        ? el("li", null, [el("a", { href: `tel:${contact.phone}` }, [`전화/문자 ${contact.phone}`])])
        : null,
      contact.email
        ? el("li", null, [el("a", { href: `mailto:${contact.email}` }, [contact.email])])
        : null,
    ]);
    root.appendChild(contactList);
    registerReveal(root);
  }

  function renderFooter(data) {
    const footer = document.getElementById("site-footer");
    footer.innerHTML = "";
    if (data.footerNotice) {
      footer.appendChild(el("p", null, [data.footerNotice]));
    }
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      toast.hidden = true;
    }, 2200);
  }

  function copyKakaoId(kakaoId) {
    if (!kakaoId) return;
    const done = () => showToast(`카카오톡 ID(${kakaoId})가 복사되었습니다`);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(kakaoId).then(done, () => fallbackCopy(kakaoId, done));
    } else {
      fallbackCopy(kakaoId, done);
    }
  }

  function fallbackCopy(text, done) {
    const input = document.createElement("input");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      done();
    } catch (err) {
      showToast(`카카오톡 ID: ${text} (직접 복사해 주세요)`);
    }
    document.body.removeChild(input);
  }

  function wireStickyCta(data) {
    const contact = data.contact || {};
    const kakaoBtn = document.getElementById("sticky-kakao-btn");
    const telLink = document.getElementById("sticky-tel-link");

    kakaoBtn.addEventListener("click", () => copyKakaoId(contact.kakaoId));
    if (contact.phone) {
      telLink.href = `tel:${contact.phone}`;
    }
  }

  function renderAll(data) {
    renderHero(data);
    renderSummary(data);
    renderSections(data);
    renderFinalCta(data);
    renderFooter(data);
    wireStickyCta(data);
    document.title = `${data.title || "스카이빌"} | ${data.subtitle || ""}`;
  }

  function renderError() {
    const hero = document.getElementById("hero");
    hero.innerHTML =
      '<p class="hero__loading">매물 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>';
  }

  fetch(LISTING_JSON_PATH)
    .then((res) => {
      if (!res.ok) throw new Error(`listing.json fetch failed: ${res.status}`);
      return res.json();
    })
    .then(renderAll)
    .catch((err) => {
      console.error(err);
      renderError();
    });
})();
