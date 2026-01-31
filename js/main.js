// ============================
// Beauty Picks — FINAL JS (Fixed)
// Search + Filter + Sort + Featured + Modal + Toast + Click Tracking
// Front-end only (localStorage)
// ============================

const PRODUCTS = [
  {
    id: "bp_serum_c",
    name: "سيروم فيتامين C",
    desc: "يساعد على توحيد اللون وزيادة النضارة. مناسب لروتين الصباح مع واقي شمس.",
    img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=1400&q=60",
    category: "skincare",
    skin: ["oily", "combo", "dry"],
    rating: 4.7,
    featured: true,
    link: "#",
  },
  {
    id: "bp_gentle_cleanser",
    name: "غسول لطيف للبشرة الحساسة",
    desc: "تنضيف يومي بدون تهييج. مناسب للحساسية والاحمرار.",
    img: "https://images.unsplash.com/photo-1620916566393-3cc5a1d8b1d5?auto=format&fit=crop&w=1400&q=60",
    category: "skincare",
    skin: ["sensitive", "dry"],
    rating: 4.6,
    featured: true,
    link: "#",
  },
  {
    id: "bp_face_roller",
    name: "أداة تدليك للوجه (Roller)",
    desc: "روتين بسيط يساعد يقلل الانتفاخ ويهدي البشرة. استخدمها مع سيروم.",
    img: "https://images.unsplash.com/photo-1556228578-567ba41b2c3d?auto=format&fit=crop&w=1400&q=60",
    category: "devices",
    skin: ["all"],
    rating: 4.4,
    featured: false,
    link: "#",
  },
  {
    id: "bp_led_mask",
    name: "ماسك LED للبشرة",
    desc: "تقنية ضوء لتحسين مظهر البشرة (مش بديل لطبيب جلدية).",
    img: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=1400&q=60",
    category: "devices",
    skin: ["all"],
    rating: 4.3,
    featured: true,
    link: "#",
  },
  {
    id: "bp_hair_serum",
    name: "سيروم شعر ضد الهيشان",
    desc: "ترطيب ولمعان وتقليل الهيشان للشعر الجاف والمتقصف.",
    img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=60",
    category: "haircare",
    skin: ["all"],
    rating: 4.5,
    featured: false,
    link: "#",
  },
  {
    id: "bp_daily_vitamins",
    name: "مكمل فيتامينات يومي",
    desc: "يدعم الطاقة والمناعة. اتبع الجرعة المكتوبة واستشر طبيبك لو عندك حالة صحية.",
    img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1400&q=60",
    category: "supplements",
    skin: ["all"],
    rating: 4.2,
    featured: false,
    link: "#",
  },
];

// ====== Mappings ======
const CATEGORY_LABEL = {
  skincare: "عناية بالبشرة",
  haircare: "عناية بالشعر",
  devices: "أجهزة",
  supplements: "مكملات",
};
const SKIN_LABEL = {
  all: "كل الأنواع",
  oily: "دهنية",
  dry: "جافة",
  sensitive: "حساسة",
  combo: "مختلطة",
};

// ====== LocalStorage keys ======
const LS_TOTAL_CLICKS = "bp_total_clicks";
const LS_PRODUCT_CLICKS = "bp_product_clicks"; // JSON map

// ====== State ======
const state = {
  search: "",
  category: "all",
  skin: "all",
  sort: "featured",
};

// ====== Elements ======
const productsEl = document.getElementById("products");
const featuredEl = document.getElementById("featuredProducts");
const emptyStateEl = document.getElementById("emptyState");

const countProductsEl = document.getElementById("countProducts");
const countClicksEl = document.getElementById("countClicks");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const categorySelect = document.getElementById("categorySelect");
const skinSelect = document.getElementById("skinSelect");
const sortSelect = document.getElementById("sortSelect");

const resetClicksBtn = document.getElementById("resetClicksBtn");
const copySiteBtn = document.getElementById("copySiteBtn");

const toastEl = document.getElementById("toast");

// Modal
const modalBack = document.getElementById("modalBack");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalStars = document.getElementById("modalStars");
const modalDesc = document.getElementById("modalDesc");
const modalBadges = document.getElementById("modalBadges");
const modalClicks = document.getElementById("modalClicks");
const modalId = document.getElementById("modalId");
const modalBuyBtn = document.getElementById("modalBuyBtn");
const modalCopyBtn = document.getElementById("modalCopyBtn");
const modalCopyLinkBtn = document.getElementById("modalCopyLinkBtn");

// Guard: لو الصفحة مش index.html (about/privacy) مفيش عناصر
if (!productsEl || !featuredEl || !toastEl || !modalBack) {
  // صفحات about/privacy: مفيش JS مطلوب
  // (سيب الملف مربوط عادي لو حبيت — بس الأفضل ما تربطوش هناك)
} else {
  // ====== Utils ======
  function normalize(s) {
    return (s || "").toString().trim().toLowerCase();
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toastEl.hidden = true;
    }, 1300);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch {
        return false;
      }
    }
  }

  function starsText(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
  }

  function getTotalClicks() {
    const n = Number(localStorage.getItem(LS_TOTAL_CLICKS));
    return Number.isFinite(n) ? n : 0;
  }
  function setTotalClicks(n) {
    localStorage.setItem(LS_TOTAL_CLICKS, String(n));
    countClicksEl.textContent = String(n);
  }

  function getProductClicksMap() {
    try {
      const raw = localStorage.getItem(LS_PRODUCT_CLICKS);
      const obj = raw ? JSON.parse(raw) : {};
      return obj && typeof obj === "object" ? obj : {};
    } catch {
      return {};
    }
  }
  function setProductClicksMap(map) {
    localStorage.setItem(LS_PRODUCT_CLICKS, JSON.stringify(map));
  }
  function incProductClick(id) {
    const map = getProductClicksMap();
    map[id] = (Number(map[id]) || 0) + 1;
    setProductClicksMap(map);
    return map[id];
  }
  function getProductClicks(id) {
    const map = getProductClicksMap();
    return Number(map[id]) || 0;
  }

  // ====== Filters ======
  function matches(product) {
    const q = normalize(state.search);
    const okSearch =
      !q ||
      normalize(product.name).includes(q) ||
      normalize(product.desc).includes(q);

    const okCategory =
      state.category === "all" || product.category === state.category;

    const skinVal = state.skin;
    const skinArr = product.skin.includes("all") ? ["all"] : product.skin;
    const okSkin =
      skinVal === "all" || skinArr.includes("all") || skinArr.includes(skinVal);

    return okSearch && okCategory && okSkin;
  }

  // ====== Sorting ======
  function sortProducts(list) {
    const l = [...list];

    if (state.sort === "featured") {
      return l.sort((a, b) => {
        const af = a.featured ? 1 : 0;
        const bf = b.featured ? 1 : 0;
        if (bf !== af) return bf - af;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    if (state.sort === "rating_desc") {
      return l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    if (state.sort === "clicks_desc") {
      return l.sort((a, b) => getProductClicks(b.id) - getProductClicks(a.id));
    }

    if (state.sort === "name_asc") {
      return l.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    }

    if (state.sort === "name_desc") {
      return l.sort((a, b) => b.name.localeCompare(a.name, "ar"));
    }

    return l;
  }

  // ====== Card rendering ======
  function cardHTML(p) {
    const skinBadges = (p.skin.includes("all") ? ["all"] : p.skin)
      .map((k) => `<span class="badge">${SKIN_LABEL[k] || k}</span>`)
      .join("");

    const clicks = getProductClicks(p.id);

    return `
      <article class="card" data-id="${p.id}">
        <img class="card__img" src="${p.img}" alt="${p.name}">
        <div class="card__body">
          <h3 class="card__title">${p.name}</h3>
          <p class="card__desc">${p.desc}</p>

          <div class="badges">
            <span class="badge">${CATEGORY_LABEL[p.category] || p.category}</span>
            ${skinBadges}
          </div>

          <div class="card__bottom">
            <div class="card__left">
              <div class="stars" aria-label="تقييم">${starsText(p.rating || 0)}</div>
              <div class="small">ضغطات: <strong>${clicks}</strong></div>
            </div>

            <div class="card__actions">
              <a class="btn buyBtn" href="${p.link}" target="_blank" rel="noopener" data-action="buy">شاهد المنتج</a>
              <button class="linkBtn" type="button" data-action="details">تفاصيل</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  // ====== Render ======
  function render() {
    const featured = PRODUCTS.filter((p) => p.featured);
    featuredEl.innerHTML = sortProducts(featured).map(cardHTML).join("");

    const filtered = sortProducts(PRODUCTS.filter(matches));
    productsEl.innerHTML = filtered.map(cardHTML).join("");

    countProductsEl.textContent = String(filtered.length);
    emptyStateEl.hidden = filtered.length !== 0;
  }

  // ====== Chips sync ======
  function setActiveChip(val) {
    document
      .querySelectorAll(".chip")
      .forEach((ch) => ch.classList.remove("is-active"));
    const el = document.querySelector(`.chip[data-chip="${val}"]`);
    if (el) el.classList.add("is-active");
  }

  // ====== Modal ======
  let lastFocusEl = null;

  function openModal(p) {
    lastFocusEl = document.activeElement;

    modalImg.src = p.img;
    modalImg.alt = p.name;
    modalImg.onload = () => {
      // تمام
    };

    modalImg.onerror = () => {
      // fallback لو الصورة فشلت تحمل
      modalImg.src =
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=60";
    };

    modalTitle.textContent = p.name;
    modalDesc.textContent = p.desc;
    modalStars.textContent = starsText(p.rating || 0);

    modalBadges.innerHTML = `
      <span class="badge">${CATEGORY_LABEL[p.category] || p.category}</span>
      ${(p.skin.includes("all") ? ["all"] : p.skin)
        .map((k) => `<span class="badge">${SKIN_LABEL[k] || k}</span>`)
        .join("")}
    `;

    modalClicks.textContent = String(getProductClicks(p.id));
    modalId.textContent = p.id;

    modalBuyBtn.href = p.link || "#";
    modalBuyBtn.dataset.id = p.id;

    modalCopyBtn.dataset.name = p.name;
    modalCopyLinkBtn.dataset.link = p.link || "#";

    // ✅ مهم: نخليها تظهر بطريقة مؤكدة
    modalBack.hidden = false;
    document.body.style.overflow = "hidden";

    setTimeout(() => modalCloseBtn.focus(), 0);
  }

  function closeModal() {
    // ✅ مهم: نخليها تختفي بطريقة مؤكدة
    modalBack.hidden = true;
    document.body.style.overflow = "";

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
  }

  function findById(id) {
    return PRODUCTS.find((p) => p.id === id);
  }

  // ====== Click tracking ======
  function trackBuy(id) {
    setTotalClicks(getTotalClicks() + 1);
    const newCount = incProductClick(id);
    return newCount;
  }

  // ====== Events ======
  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.search = "";
    render();
    showToast("تم مسح البحث");
  });

  categorySelect.addEventListener("change", (e) => {
    state.category = e.target.value;
    render();
  });

  skinSelect.addEventListener("change", (e) => {
    state.skin = e.target.value;
    setActiveChip(e.target.value === "all" ? "all" : e.target.value);
    render();
  });

  sortSelect.addEventListener("change", (e) => {
    state.sort = e.target.value;
    render();
  });

  // Delegation
  document.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) {
      const val = chip.dataset.chip;
      setActiveChip(val);
      state.skin = val === "all" ? "all" : val;
      skinSelect.value = state.skin;
      render();
      return;
    }

    const card = e.target.closest(".card");
    if (!card) return;

    const id = card.dataset.id;
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.dataset.action;

    if (action === "details") {
      const p = findById(id);
      if (p) openModal(p);
      return;
    }

    if (action === "buy") {
      const newCount = trackBuy(id);
      showToast(`تم تسجيل الضغطة ✅ (ضغطات المنتج: ${newCount})`);
      return;
    }
  });

  // Modal controls
  modalCloseBtn.addEventListener("click", closeModal);
  modalBack.addEventListener("click", (e) => {
    if (e.target === modalBack) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    // ✅ Fix: اقفل فقط لو المودال مفتوح
    if (e.key === "Escape" && !modalBack.hidden) closeModal();
  });

  // Modal copy
  modalCopyBtn.addEventListener("click", async () => {
    const ok = await copyText(modalCopyBtn.dataset.name || "");
    showToast(ok ? "اتنسخ اسم المنتج ✅" : "فشل النسخ ❌");
  });

  modalCopyLinkBtn.addEventListener("click", async () => {
    const link = modalCopyLinkBtn.dataset.link || "";
    const ok = await copyText(link);
    showToast(ok ? "اتنسخ لينك المنتج ✅" : "فشل النسخ ❌");
  });

  // Buy from modal
  modalBuyBtn.addEventListener("click", () => {
    const id = modalBuyBtn.dataset.id;
    if (!id) return;
    const newCount = trackBuy(id);
    modalClicks.textContent = String(newCount);
    showToast(`تم تسجيل الضغطة ✅ (ضغطات المنتج: ${newCount})`);
  });

  // Reset clicks
  resetClicksBtn.addEventListener("click", () => {
    localStorage.setItem(LS_TOTAL_CLICKS, "0");
    localStorage.setItem(LS_PRODUCT_CLICKS, JSON.stringify({}));
    setTotalClicks(0);
    render();
    showToast("تم تصفير العدادات ✅");
  });

  // Copy site link
  copySiteBtn.addEventListener("click", async () => {
    const url = window.location.href;
    const ok = await copyText(url);
    showToast(ok ? "اتنسخ رابط الصفحة ✅" : "فشل النسخ ❌");
  });

  // ====== Init ======
  setTotalClicks(getTotalClicks());
  render();
}
