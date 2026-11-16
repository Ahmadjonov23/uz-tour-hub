/* ==========================================================================
   Uzbek Tour Hub — Booking.com mehmonxonalar vidjeti (hotels.js)
   /api/hotels dan ma'lumot oladi:
     - jonli rejim (Booking.com Demand API sozlangan): real narxlar va mehmonxonalar ro'yxati
     - havola rejimi (sozlanmagan): Booking.com'dagi real qidiruv sahifasiga yo'naltirish
   Saytdagi namunaviy (to'qima) mehmonxonalar ro'yxati shu vidjet bilan almashtiriladi.
   ========================================================================== */
(function () {
  "use strict";

  var CITIES = [
    { k: "samarkand", img: "/images/registango.jpg", n: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" } },
    { k: "bukhara", img: "/images/bukharaher.jpg", n: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" } },
    { k: "khiva", img: "/images/khivaold.jpg", n: { uz: "Xiva", ru: "Хива", en: "Khiva" } },
    { k: "tashkent", img: "/images/tashkent.jpg", n: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" } },
    { k: "kokand", img: "/images/kokand.jpg", n: { uz: "Qo'qon", ru: "Коканд", en: "Kokand" } },
    { k: "fergana", img: "/images/fergana.jpg", n: { uz: "Farg'ona", ru: "Фергана", en: "Fergana" } },
    { k: "termez", img: "/images/termiz.jpg", n: { uz: "Termiz", ru: "Термез", en: "Termez" } }
  ];
  var T = {
    uz: {
      live: "Jonli narxlar · Booking.com", partner: "Booking.com bilan", checkin: "Kirish", checkout: "Chiqish", guests: "Mehmonlar",
      sort: "Saralash", popular: "Mashhur", cheap: "Arzonroq", rating: "Reyting", search: "Qidirish",
      perNight: "kechasi", total: "jami", nights: "kecha", book: "Band qilish", freeCancel: "Bepul bekor qilish", breakfast: "Nonushta",
      reviews: "sharh", updated: "Narxlar Booking.com'dan olindi", taxes: "Yakuniy narx va shartlar Booking.com sahifasida ko'rsatiladi.",
      ctaTitle: "{city}: real narxlar Booking.com'da", ctaSub: "{nights} kecha · {adults} kishi · {ci} — {co}. Mavjud mehmonxonalar va bugungi narxlar Booking.com'da ochiladi.",
      ctaBtn: "Booking.com'da narxlarni ko'rish", other: "Boshqa shaharlar:", empty: "Bu sanalarga bo'sh joy topilmadi. Sanalarni o'zgartirib ko'ring.",
      err: "Ma'lumotni yuklab bo'lmadi.", loading: "Booking.com'dan yuklanmoqda…", seeAll: "Barcha variantlar Booking.com'da",
      sc: ["", "Yomon", "Yomon", "Past", "Past", "O'rtacha", "Yaxshi", "Yaxshi", "Juda yaxshi", "Ajoyib", "A'lo"]
    },
    ru: {
      live: "Живые цены · Booking.com", partner: "Вместе с Booking.com", checkin: "Заезд", checkout: "Выезд", guests: "Гости",
      sort: "Сортировка", popular: "Популярные", cheap: "Дешевле", rating: "Рейтинг", search: "Найти",
      perNight: "за ночь", total: "всего", nights: "ноч.", book: "Забронировать", freeCancel: "Бесплатная отмена", breakfast: "Завтрак",
      reviews: "отзывов", updated: "Цены получены с Booking.com", taxes: "Итоговая цена и условия — на странице Booking.com.",
      ctaTitle: "{city}: реальные цены на Booking.com", ctaSub: "{nights} ноч. · {adults} чел. · {ci} — {co}. Доступные отели и актуальные цены откроются на Booking.com.",
      ctaBtn: "Смотреть цены на Booking.com", other: "Другие города:", empty: "На эти даты нет мест. Попробуйте другие даты.",
      err: "Не удалось загрузить данные.", loading: "Загрузка с Booking.com…", seeAll: "Все варианты на Booking.com",
      sc: ["", "Плохо", "Плохо", "Низко", "Низко", "Средне", "Хорошо", "Хорошо", "Очень хорошо", "Превосходно", "Исключительно"]
    },
    en: {
      live: "Live prices · Booking.com", partner: "With Booking.com", checkin: "Check-in", checkout: "Check-out", guests: "Guests",
      sort: "Sort", popular: "Popular", cheap: "Lowest price", rating: "Rating", search: "Search",
      perNight: "per night", total: "total", nights: "nights", book: "Book now", freeCancel: "Free cancellation", breakfast: "Breakfast",
      reviews: "reviews", updated: "Prices retrieved from Booking.com", taxes: "Final price and conditions are shown on Booking.com.",
      ctaTitle: "{city}: real prices on Booking.com", ctaSub: "{nights} nights · {adults} guests · {ci} — {co}. Available hotels and today's prices open on Booking.com.",
      ctaBtn: "See prices on Booking.com", other: "Other cities:", empty: "No availability for these dates. Try other dates.",
      err: "Could not load data.", loading: "Loading from Booking.com…", seeAll: "All options on Booking.com",
      sc: ["", "Poor", "Poor", "Low", "Low", "Average", "Good", "Good", "Very good", "Superb", "Exceptional"]
    }
  };
  function lang() { try { var l = localStorage.getItem("uzbek_tour_hub_lang"); return T[l] ? l : "uz"; } catch (e) { return "uz"; } }
  function t(k) { return T[lang()][k]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function iso(d) { var z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function money(v, cur) {
    try { return new Intl.NumberFormat(lang() === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: cur || "USD", maximumFractionDigits: 0 }).format(v); }
    catch (e) { return "$" + Math.round(v); }
  }
  function fmt(s, o) { return s.replace(/\{(\w+)\}/g, function (_, k) { return o[k]; }); }
  function safeUrl(u) { return /^https:\/\/([a-z0-9-]+\.)*booking\.com\//i.test(u || "") ? u : "#"; }
  function cityName(k) { var c = CITIES.filter(function (x) { return x.k === k; })[0]; return c ? c.n[lang()] : k; }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var st = { city: "samarkand", checkin: iso(addDays(today, 14)), checkout: iso(addDays(today, 16)), adults: 2, sort: "popularity", data: null, loading: false, error: null };
  var root, reqId = 0;

  function load() {
    var id = ++reqId;
    st.loading = true; st.error = null; render();
    var q = new URLSearchParams({ city: st.city, checkin: st.checkin, checkout: st.checkout, adults: st.adults, sort: st.sort, lang: lang() });
    fetch("/api/hotels?" + q).then(function (r) { return r.json(); }).then(function (j) {
      if (id !== reqId) return;
      if (!j.ok) throw new Error(j.error || t("err"));
      st.data = j; st.checkin = j.checkin; st.checkout = j.checkout;
    }).catch(function (e) { if (id === reqId) st.error = e.message || t("err"); })
      .then(function () { if (id === reqId) { st.loading = false; render(); } });
  }

  function controls() {
    return '<div class="hb-chips" role="tablist">' + CITIES.map(function (c) {
      return '<button type="button" role="tab" aria-selected="' + (st.city === c.k) + '" class="hb-chip' + (st.city === c.k ? " on" : "") + '" data-city="' + c.k + '">' + esc(c.n[lang()]) + "</button>";
    }).join("") + "</div>" +
      '<form class="hb-form">' +
        '<label><span>' + esc(t("checkin")) + '</span><input type="date" name="ci" value="' + st.checkin + '" min="' + iso(today) + '"></label>' +
        '<label><span>' + esc(t("checkout")) + '</span><input type="date" name="co" value="' + st.checkout + '" min="' + iso(addDays(new Date(st.checkin), 1)) + '"></label>' +
        '<label><span>' + esc(t("guests")) + '</span><select name="ad">' + [1, 2, 3, 4, 5, 6].map(function (n) { return "<option" + (n == st.adults ? " selected" : "") + ">" + n + "</option>"; }).join("") + "</select></label>" +
        '<label><span>' + esc(t("sort")) + '</span><select name="so">' +
          [["popularity", t("popular")], ["price", t("cheap")], ["review", t("rating")]].map(function (o) { return '<option value="' + o[0] + '"' + (st.sort === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") +
        "</select></label>" +
        '<button type="submit" class="hb-go"><i class="fas fa-magnifying-glass"></i><span>' + esc(t("search")) + "</span></button>" +
      "</form>";
  }

  function hotelCard(h, nights) {
    var score = h.reviewScore != null ? Number(h.reviewScore) : null;
    var stars = h.stars ? '<span class="hb-stars" aria-label="' + h.stars + ' stars">' + new Array(Math.round(h.stars) + 1).join("★") + "</span>" : "";
    var tags = [];
    if (h.freeCancellation) tags.push('<span class="hb-tag ok"><i class="fas fa-check"></i> ' + esc(t("freeCancel")) + "</span>");
    if (h.breakfast) tags.push('<span class="hb-tag"><i class="fas fa-mug-hot"></i> ' + esc(t("breakfast")) + "</span>");
    if (h.deal) tags.push('<span class="hb-tag deal">-' + esc(Math.round(h.deal)) + "%</span>");
    return '<article class="hb-card">' +
      '<div class="hb-ph">' + (h.photo ? '<img src="' + esc(h.photo) + '" alt="" loading="lazy" referrerpolicy="no-referrer">' : '<i class="fas fa-hotel"></i>') + "</div>" +
      '<div class="hb-info">' +
        "<h4>" + esc(h.name) + " " + stars + "</h4>" +
        (h.address ? '<p class="hb-addr"><i class="fas fa-location-dot"></i> ' + esc(h.address) + "</p>" : "") +
        (score ? '<div class="hb-score"><b>' + score.toFixed(1) + "</b><span>" + esc(t("sc")[Math.max(1, Math.min(10, Math.floor(score)))]) + (h.reviews ? " · " + Number(h.reviews).toLocaleString() + " " + esc(t("reviews")) : "") + "</span></div>" : "") +
        (tags.length ? '<div class="hb-tags">' + tags.join("") + "</div>" : "") +
      "</div>" +
      '<div class="hb-price"><small>' + esc(t("perNight")) + "</small><b>" + money(h.perNight, h.currency) + "</b>" +
        '<span>' + money(h.total, h.currency) + " " + esc(t("total")) + " · " + nights + " " + esc(t("nights")) + "</span>" +
        '<a class="hb-book" href="' + esc(safeUrl(h.url)) + '" target="_blank" rel="noopener noreferrer sponsored">' + esc(t("book")) + ' <i class="fas fa-arrow-up-right-from-square"></i></a>' +
      "</div></article>";
  }

  function results() {
    if (st.loading && !st.data) return '<div class="hb-skel">' + [1, 2, 3].map(function () { return '<div class="hb-sk"></div>'; }).join("") + '<p class="hb-muted">' + esc(t("loading")) + "</p></div>";
    if (st.error) return '<div class="hb-msg err"><i class="fas fa-circle-exclamation"></i> ' + esc(st.error) + "</div>";
    var d = st.data; if (!d) return "";
    var city = CITIES.filter(function (x) { return x.k === d.city; })[0] || CITIES[0];
    if (!d.live) {
      return '<a class="hb-cta" href="' + esc(safeUrl(d.searchUrl)) + '" target="_blank" rel="noopener noreferrer sponsored" style="--img:url(' + city.img + ')">' +
        '<div class="hb-cta-in"><span class="hb-bk-logo"><i class="fas fa-hotel"></i> Booking.com</span>' +
        "<h4>" + esc(fmt(t("ctaTitle"), { city: city.n[lang()] })) + "</h4>" +
        "<p>" + esc(fmt(t("ctaSub"), { nights: d.nights, adults: d.adults, ci: d.checkin, co: d.checkout })) + "</p>" +
        '<span class="hb-cta-btn">' + esc(t("ctaBtn")) + ' <i class="fas fa-arrow-up-right-from-square"></i></span></div></a>' +
        '<div class="hb-others"><span>' + esc(t("other")) + "</span>" + CITIES.filter(function (c) { return c.k !== d.city; }).map(function (c) {
          return '<button type="button" data-city="' + c.k + '">' + esc(c.n[lang()]) + "</button>";
        }).join("") + "</div>";
    }
    if (!d.hotels.length) return '<div class="hb-msg"><i class="fas fa-bed"></i> ' + esc(t("empty")) + '</div><a class="hb-all" href="' + esc(safeUrl(d.searchUrl)) + '" target="_blank" rel="noopener noreferrer sponsored">' + esc(t("seeAll")) + " ↗</a>";
    var when = d.fetchedAt ? new Date(d.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
    return '<div class="hb-list' + (st.loading ? " dim" : "") + '">' + d.hotels.map(function (h) { return hotelCard(h, d.nights); }).join("") + "</div>" +
      '<div class="hb-foot"><span><i class="fas fa-circle-info"></i> ' + esc(t("updated")) + (when ? " · " + when : "") + ". " + esc(t("taxes")) + "</span>" +
      '<a class="hb-all" href="' + esc(safeUrl(d.searchUrl)) + '" target="_blank" rel="noopener noreferrer sponsored">' + esc(t("seeAll")) + " ↗</a></div>";
  }

  function render() {
    if (!root) return;
    var live = st.data && st.data.live;
    root.innerHTML =
      '<div class="hb-head"><span class="hb-badge' + (live ? " live" : "") + '"><i class="hb-pulse"></i>' + esc(live ? t("live") : t("partner")) + "</span></div>" +
      controls() + '<div class="hb-results" aria-live="polite">' + results() + "</div>";
    root.querySelectorAll("[data-city]").forEach(function (b) { b.onclick = function () { st.city = b.getAttribute("data-city"); load(); }; });
    var f = root.querySelector(".hb-form");
    f.onsubmit = function (e) {
      e.preventDefault();
      st.checkin = f.ci.value || st.checkin; st.checkout = f.co.value || st.checkout;
      if (st.checkout <= st.checkin) st.checkout = iso(addDays(new Date(st.checkin), 2));
      st.adults = +f.ad.value; st.sort = f.so.value; load();
    };
    f.ci.onchange = function () { if (f.co.value <= f.ci.value) f.co.value = iso(addDays(new Date(f.ci.value), 2)); f.co.min = iso(addDays(new Date(f.ci.value), 1)); };
    f.so.onchange = function () { f.requestSubmit ? f.requestSubmit() : f.onsubmit(new Event("submit")); };
  }

  function mount() {
    var sec = document.getElementById("hotels-sec");
    if (!sec || sec.querySelector(".hb-root")) return;
    sec.classList.add("hb-host");
    root = document.createElement("div");
    root.className = "hb-root";
    var title = sec.querySelector(".section-title");
    title && title.nextSibling ? sec.insertBefore(root, title.nextSibling) : sec.appendChild(root);
    if (st.data) render(); else load();
  }

  var lastLang = lang();
  function start() {
    mount();
    var r = document.getElementById("root");
    var pending = false;
    if (r) new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () {
        pending = false; mount();
        if (lang() !== lastLang) { lastLang = lang(); load(); }
      });
    }).observe(r, { childList: true, subtree: true });
  }
  window.UTBHotels = { reload: load, setCity: function (c) { st.city = c; load(); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
