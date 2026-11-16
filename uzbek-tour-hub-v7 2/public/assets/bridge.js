/* Uzbek Tour Hub — backend ko'prigi: bron va ro'yxatdan o'tish so'rovlarini /api/booking ga yuboradi */
(function () {
  var busy = false;
  var MSG = {
    uz: { busy: "So'rov yuborilmoqda, kuting…", fail: "Bronni yuborib bo'lmadi. Internetni tekshirib, qayta urinib ko'ring." },
    ru: { busy: "Запрос отправляется…", fail: "Не удалось отправить заявку. Проверьте интернет и попробуйте снова." },
    en: { busy: "Sending your request…", fail: "Could not send your request. Check your connection and try again." }
  };
  function lang() {
    try { var l = localStorage.getItem("uzbek_tour_hub_lang"); return MSG[l] ? l : "uz"; } catch (e) { return "uz"; }
  }
  function user() {
    try { return JSON.parse(localStorage.getItem("uzbek_tour_hub_user") || "null"); } catch (e) { return null; }
  }
  window.__utb = function (type, data) {
    var L = MSG[lang()];
    if (busy) return Promise.reject(new Error(L.busy));
    busy = true;
    document.documentElement.classList.add("utb-sending");
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { ctrl && ctrl.abort(); }, 15000);
    return fetch("/api/booking", {
      credentials: "same-origin",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: type, data: data, user: type === "register" ? null : user(), lang: lang() }),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (!r.ok || !j.ok) {
            var acc = window.UTBAccount;
            if (r.status === 503 && acc && !acc.user) setTimeout(function () { acc.openAuth("login"); }, 400);
            var err = new Error(j.error || L.fail); err.server = true; throw err;
          }
          try { window.dispatchEvent(new CustomEvent("utb:booked", { detail: j })); } catch (e) {}
          return j;
        });
      })
      .catch(function (e) {
        throw new Error(e && e.server ? e.message : L.fail);
      })
      .finally(function () {
        clearTimeout(timer);
        busy = false;
        document.documentElement.classList.remove("utb-sending");
      });
  };
})();
