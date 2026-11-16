/* Google Maps fotosuratlari uchun muallif ko'rsatkichi (atributsiya) — /api/place-photo rasmlariga qo'shiladi */
(function () {
  var memo = {};
  function meta(src) {
    var u = src.replace(/([?&])w=\d+/, "$1") + (src.indexOf("?") > -1 ? "&" : "?") + "meta=1";
    if (!memo[u]) memo[u] = fetch(u).then(function (r) { return r.json(); }).catch(function () { return { ok: false }; });
    return memo[u];
  }
  function tag(img) {
    if (img.dataset.utbCredit) return;
    img.dataset.utbCredit = "1";
    var box = img.parentElement;
    if (!box || box.offsetWidth < 120) {
      meta(img.getAttribute("src")).then(function (m) { if (m.ok && m.authors && m.authors[0]) img.title = "📷 " + m.authors[0].name + " · Google Maps"; });
      return;
    }
    meta(img.getAttribute("src")).then(function (m) {
      if (!m.ok || !m.authors || !m.authors[0]) return;
      if (getComputedStyle(box).position === "static") box.style.position = "relative";
      var a = m.authors[0];
      var el = document.createElement(a.uri ? "a" : "span");
      el.className = "utb-photo-credit";
      el.textContent = "📷 " + a.name + " · Google Maps";
      if (a.uri) { el.href = a.uri; el.target = "_blank"; el.rel = "noopener noreferrer"; }
      box.appendChild(el);
    });
  }
  function scan() { document.querySelectorAll('img[src*="/api/place-photo"]').forEach(tag); }
  var pending = false;
  new MutationObserver(function () { if (pending) return; pending = true; setTimeout(function () { pending = false; scan(); }, 250); })
    .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["src"] });
  document.addEventListener("DOMContentLoaded", scan);
})();
