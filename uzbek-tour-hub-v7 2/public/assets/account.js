/* ==========================================================================
   Uzbek Tour Hub — Hisob va profil moduli (account.js)
   - Sarlavhada profil ikonkasi (kirish / ro'yxatdan o'tish / avatar)
   - Kirish va ro'yxatdan o'tish oynasi
   - Profil paneli: bronlarim, ma'lumotlarni tahrirlash, xavfsizlik
   Backend: /api/auth/* (netlify/functions/account.mjs)
   ========================================================================== */
(function () {
  "use strict";

  /* ---------------------------- Tarjimalar ---------------------------- */
  var T = {
    uz: {
      signIn: "Kirish", join: "Ro'yxatdan o'tish", profile: "Profil", myAccount: "Mening hisobim",
      welcomeBack: "Xush kelibsiz!", loginSub: "Bronlaringiz va profilingizga kirish uchun hisobingizga kiring.",
      createAcc: "Hisob yarating", registerSub: "Bepul a'zolik: bronlar tarixi, tezkor band qilish va shaxsiy tavsiyalar.",
      name: "To'liq ism", email: "Email", password: "Parol", country: "Mamlakat / shahar", contact: "WhatsApp yoki Telegram",
      pwHint: "Kamida 8 belgi, harf va raqam", show: "Ko'rsatish", hide: "Yashirish",
      doLogin: "Kirish", doRegister: "Hisob yaratish", noAcc: "Hisobingiz yo'qmi?", haveAcc: "Hisobingiz bormi?",
      tabBookings: "Bronlarim", tabProfile: "Ma'lumotlar", tabSecurity: "Xavfsizlik",
      memberSince: "A'zo bo'lgan sana", vipPass: "UZBEK TOUR HUB · A'ZOLIK KARTASI",
      noBookings: "Hozircha bronlar yo'q", noBookingsSub: "Tarixiy sayohatlar yoki gidlar bo'limidan o'zingizga mos turni tanlang.",
      browseTours: "Turlarni ko'rish", findGuide: "Gid tanlash",
      tour: "Tur", guide: "Gid", pending: "Ko'rib chiqilmoqda", confirmed: "Tasdiqlangan", cancelled: "Bekor qilingan",
      date: "Sana", people: "kishi", hours: "soat", total: "Jami",
      save: "Saqlash", saved: "Ma'lumotlar saqlandi", curPw: "Joriy parol", newPw: "Yangi parol", changePw: "Parolni almashtirish",
      pwChanged: "Parol almashtirildi. Boshqa qurilmalardagi sessiyalar yopildi.",
      logout: "Chiqish", loggedOut: "Hisobdan chiqdingiz", deleteAcc: "Hisobni o'chirish",
      deleteWarn: "Hisob va barcha bronlar tarixi butunlay o'chiriladi. Tasdiqlash uchun parolingizni kiriting.",
      deleted: "Hisob o'chirildi", welcome: "Xush kelibsiz, ", created: "Hisob yaratildi! Xush kelibsiz, ",
      netErr: "Server bilan aloqa yo'q. Internetni tekshirib, qayta urinib ko'ring.",
      close: "Yopish", stats: "ta bron", secureNote: "Parolingiz shifrlangan holda saqlanadi.",
      quickBook: "Saqlangan ma'lumotlaringiz bron formalarida avtomatik to'ldiriladi."
    },
    ru: {
      signIn: "Войти", join: "Регистрация", profile: "Профиль", myAccount: "Мой аккаунт",
      welcomeBack: "С возвращением!", loginSub: "Войдите, чтобы увидеть свои бронирования и профиль.",
      createAcc: "Создайте аккаунт", registerSub: "Бесплатно: история бронирований, быстрое оформление и персональные советы.",
      name: "Полное имя", email: "Email", password: "Пароль", country: "Страна / город", contact: "WhatsApp или Telegram",
      pwHint: "Минимум 8 символов, буквы и цифры", show: "Показать", hide: "Скрыть",
      doLogin: "Войти", doRegister: "Создать аккаунт", noAcc: "Нет аккаунта?", haveAcc: "Уже есть аккаунт?",
      tabBookings: "Мои брони", tabProfile: "Данные", tabSecurity: "Безопасность",
      memberSince: "Участник с", vipPass: "UZBEK TOUR HUB · КАРТА УЧАСТНИКА",
      noBookings: "Пока нет бронирований", noBookingsSub: "Выберите тур в разделе исторических маршрутов или гидов.",
      browseTours: "Смотреть туры", findGuide: "Выбрать гида",
      tour: "Тур", guide: "Гид", pending: "На рассмотрении", confirmed: "Подтверждено", cancelled: "Отменено",
      date: "Дата", people: "чел.", hours: "ч", total: "Итого",
      save: "Сохранить", saved: "Данные сохранены", curPw: "Текущий пароль", newPw: "Новый пароль", changePw: "Сменить пароль",
      pwChanged: "Пароль изменён. Сессии на других устройствах закрыты.",
      logout: "Выйти", loggedOut: "Вы вышли из аккаунта", deleteAcc: "Удалить аккаунт",
      deleteWarn: "Аккаунт и вся история бронирований будут удалены навсегда. Введите пароль для подтверждения.",
      deleted: "Аккаунт удалён", welcome: "Добро пожаловать, ", created: "Аккаунт создан! Добро пожаловать, ",
      netErr: "Нет связи с сервером. Проверьте интернет и попробуйте снова.",
      close: "Закрыть", stats: "брони", secureNote: "Пароль хранится в зашифрованном виде.",
      quickBook: "Ваши данные будут автоматически подставляться в формы бронирования."
    },
    en: {
      signIn: "Sign in", join: "Sign up", profile: "Profile", myAccount: "My account",
      welcomeBack: "Welcome back!", loginSub: "Sign in to see your bookings and profile.",
      createAcc: "Create your account", registerSub: "Free membership: booking history, faster checkout and personal tips.",
      name: "Full name", email: "Email", password: "Password", country: "Country / city", contact: "WhatsApp or Telegram",
      pwHint: "At least 8 characters, letters and numbers", show: "Show", hide: "Hide",
      doLogin: "Sign in", doRegister: "Create account", noAcc: "No account yet?", haveAcc: "Already a member?",
      tabBookings: "My bookings", tabProfile: "Details", tabSecurity: "Security",
      memberSince: "Member since", vipPass: "UZBEK TOUR HUB · MEMBER CARD",
      noBookings: "No bookings yet", noBookingsSub: "Pick a tour from the historic trips or guides sections.",
      browseTours: "Browse tours", findGuide: "Find a guide",
      tour: "Tour", guide: "Guide", pending: "Under review", confirmed: "Confirmed", cancelled: "Cancelled",
      date: "Date", people: "people", hours: "h", total: "Total",
      save: "Save", saved: "Details saved", curPw: "Current password", newPw: "New password", changePw: "Change password",
      pwChanged: "Password changed. Sessions on other devices were signed out.",
      logout: "Sign out", loggedOut: "You have signed out", deleteAcc: "Delete account",
      deleteWarn: "Your account and booking history will be deleted permanently. Enter your password to confirm.",
      deleted: "Account deleted", welcome: "Welcome, ", created: "Account created! Welcome, ",
      netErr: "Can't reach the server. Check your connection and try again.",
      close: "Close", stats: "bookings", secureNote: "Your password is stored encrypted.",
      quickBook: "Your saved details will be filled into booking forms automatically."
    }
  };
  function lang() { try { var l = localStorage.getItem("uzbek_tour_hub_lang"); return T[l] ? l : "uz"; } catch (e) { return "uz"; } }
  function t(k) { return (T[lang()] || T.uz)[k] || T.uz[k] || k; }

  /* ---------------------------- Yordamchilar ---------------------------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function initials(n) { var p = String(n || "?").trim().split(/\s+/); return ((p[0] || "?")[0] + (p[1] ? p[1][0] : "")).toUpperCase(); }
  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
    if (isNaN(d)) return esc(iso);
    var M = {
      uz: ["yan", "fev", "mar", "apr", "may", "iyun", "iyul", "avg", "sen", "okt", "noy", "dek"],
      ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
      en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }[lang()];
    return d.getDate() + " " + M[d.getMonth()] + " " + d.getFullYear();
  }
  function api(path, method, body) {
    return fetch("/api/auth/" + path, {
      method: method || "GET",
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok || j.ok === false) throw new Error(j.error || t("netErr"));
        return j;
      });
    }, function () { throw new Error(t("netErr")); });
  }

  var state = { user: null, ready: false };

  function syncLocal(u) {
    try {
      if (u) localStorage.setItem("uzbek_tour_hub_user", JSON.stringify({ name: u.name, email: u.email, country: u.country, contact: u.contact }));
      else localStorage.removeItem("uzbek_tour_hub_user");
    } catch (e) {}
  }
  function setUser(u) {
    state.user = u || null;
    syncLocal(state.user);
    renderButtons();
    if (isOpen(profileEl)) renderProfile();
  }
  function refresh() {
    return api("me").then(function (j) { state.ready = true; setUser(j.user); return j.user; })
      .catch(function () { state.ready = true; renderButtons(); return state.user; });
  }

  /* ---------------------------- Toast ---------------------------- */
  var toastWrap;
  function toast(msg, kind) {
    if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.className = "utb-toasts"; toastWrap.setAttribute("aria-live", "polite"); document.body.appendChild(toastWrap); }
    var el = document.createElement("div");
    el.className = "utb-toast " + (kind || "ok");
    el.innerHTML = '<i class="fas ' + (kind === "err" ? "fa-circle-exclamation" : "fa-circle-check") + '"></i><span></span>';
    el.querySelector("span").textContent = msg;
    toastWrap.appendChild(el);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 400); }, 3600);
  }

  /* ---------------------------- Sarlavha tugmalari ---------------------------- */
  function buttonHTML(compact) {
    var u = state.user;
    if (!u) {
      return '<span class="utb-acc-ico"><i class="fas fa-user"></i></span>' + (compact ? "" : '<span class="utb-acc-label">' + esc(t("signIn")) + "</span>");
    }
    var first = String(u.name || "").split(/\s+/)[0];
    return '<span class="utb-avatar">' + esc(initials(u.name)) + '<i class="utb-dot"></i></span>' +
      (compact ? "" : '<span class="utb-acc-label">' + esc(first) + "</span>");
  }
  function makeButton(compact) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "utb-acc-btn" + (compact ? " compact" : "");
    b.setAttribute("data-utb-acc", compact ? "m" : "d");
    b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); state.user ? openProfile() : openAuth("login"); });
    return b;
  }
  function renderButtons() {
    document.querySelectorAll(".utb-acc-btn").forEach(function (b) {
      var compact = b.classList.contains("compact");
      b.innerHTML = buttonHTML(compact);
      b.classList.toggle("in", !!state.user);
      b.setAttribute("aria-label", state.user ? t("myAccount") : t("signIn"));
      b.title = state.user ? t("myAccount") : t("signIn");
    });
    document.documentElement.classList.toggle("utb-logged-in", !!state.user);
  }
  function inject() {
    var added = false;
    var nav = document.querySelector(".main-container > nav.nav-bar");
    if (nav && !nav.querySelector(".utb-acc-btn")) { nav.appendChild(makeButton(false)); added = true; }
    var mob = document.querySelector('.main-container > .md\\:hidden.sticky > div');
    if (mob && !mob.querySelector(".utb-acc-btn")) {
      var menuBtn = mob.querySelector('button[aria-label="Toggle navigation menu"]');
      mob.insertBefore(makeButton(true), menuBtn || null); added = true;
    }
    if (added) renderButtons();
  }

  /* Saytdagi mavjud "Ro'yxatdan o'tish / A'zo bo'lish" tugmalarini yangi oynaga yo'naltiramiz */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("button");
    if (!btn || btn.closest(".utb-root")) return;
    var isReg = btn.classList.contains("hero-register-btn") || btn.classList.contains("register-nav") || btn.querySelector(".fa-user-plus");
    if (!isReg) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    state.user ? openProfile() : openAuth("register");
  }, true);

  /* ---------------------------- Oyna (modal) asoslari ---------------------------- */
  var authEl, profileEl, lastFocus;
  function isOpen(el) { return el && el.classList.contains("open"); }
  function openLayer(el) {
    lastFocus = document.activeElement;
    el.classList.add("open");
    document.documentElement.classList.add("utb-lock");
    setTimeout(function () { var f = el.querySelector("input:not([type=hidden]):not([tabindex='-1']), button.utb-primary"); f && f.focus({ preventScroll: true }); }, 60);
  }
  function closeLayer(el) {
    if (!isOpen(el)) return;
    el.classList.remove("open");
    if (!isOpen(authEl) && !isOpen(profileEl)) document.documentElement.classList.remove("utb-lock");
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { if (isOpen(authEl)) closeLayer(authEl); else if (isOpen(profileEl)) closeLayer(profileEl); }
    if (e.key === "Tab") {
      var el = isOpen(authEl) ? authEl : isOpen(profileEl) ? profileEl : null;
      if (!el) return;
      var f = [].filter.call(el.querySelectorAll("button, input, select, a[href]"), function (x) { return !x.disabled && x.offsetParent !== null && x.tabIndex !== -1; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  function setBusy(form, busy) {
    form.classList.toggle("busy", busy);
    form.querySelectorAll("button, input").forEach(function (x) { x.disabled = busy; });
  }
  function showErr(form, msg) {
    var box = form.querySelector(".utb-err");
    box.textContent = msg || "";
    box.hidden = !msg;
  }
  function pwField(id, label, autocomplete, hint) {
    return '<label class="utb-field"><span>' + esc(label) + '</span><div class="utb-pw">' +
      '<input id="' + id + '" name="' + id + '" type="password" autocomplete="' + autocomplete + '" required minlength="8" maxlength="128">' +
      '<button type="button" class="utb-eye" aria-label="' + esc(t("show")) + '"><i class="fas fa-eye"></i></button></div>' +
      (hint ? '<small>' + esc(hint) + "</small>" : "") + "</label>";
  }
  function field(id, label, type, autocomplete, value, req, max) {
    return '<label class="utb-field"><span>' + esc(label) + '</span><input id="' + id + '" name="' + id + '" type="' + type +
      '" autocomplete="' + autocomplete + '" maxlength="' + (max || 80) + '" value="' + esc(value || "") + '"' + (req ? " required" : "") + "></label>";
  }
  function wireEyes(root) {
    root.querySelectorAll(".utb-eye").forEach(function (b) {
      b.onclick = function () {
        var i = b.parentNode.querySelector("input"); var show = i.type === "password";
        i.type = show ? "text" : "password";
        b.innerHTML = '<i class="fas ' + (show ? "fa-eye-slash" : "fa-eye") + '"></i>';
        b.setAttribute("aria-label", show ? t("hide") : t("show"));
      };
    });
  }

  /* ---------------------------- Kirish / ro'yxatdan o'tish ---------------------------- */
  var authMode = "login";
  function buildAuth() {
    authEl = document.createElement("div");
    authEl.className = "utb-root utb-overlay";
    authEl.setAttribute("role", "dialog");
    authEl.setAttribute("aria-modal", "true");
    authEl.setAttribute("aria-labelledby", "utbAuthTitle");
    authEl.addEventListener("mousedown", function (e) { if (e.target === authEl) closeLayer(authEl); });
    document.body.appendChild(authEl);
  }
  function renderAuth() {
    var reg = authMode === "register";
    authEl.innerHTML =
      '<div class="utb-card utb-auth">' +
        '<div class="utb-auth-art" aria-hidden="true"><div class="utb-star"></div>' +
          '<div class="utb-art-txt"><b>Uzbek Tour Hub</b><span>Samarqand · Buxoro · Xiva · Qo\'qon</span></div></div>' +
        '<div class="utb-auth-body">' +
          '<button type="button" class="utb-x" aria-label="' + esc(t("close")) + '"><i class="fas fa-xmark"></i></button>' +
          '<div class="utb-tabs" role="tablist">' +
            '<button type="button" role="tab" data-mode="login" aria-selected="' + !reg + '" class="' + (!reg ? "on" : "") + '">' + esc(t("signIn")) + "</button>" +
            '<button type="button" role="tab" data-mode="register" aria-selected="' + reg + '" class="' + (reg ? "on" : "") + '">' + esc(t("join")) + "</button>" +
            '<i class="utb-tab-ink" style="transform:translateX(' + (reg ? "100%" : "0") + ')"></i>' +
          "</div>" +
          '<h2 id="utbAuthTitle">' + esc(reg ? t("createAcc") : t("welcomeBack")) + "</h2>" +
          '<p class="utb-sub">' + esc(reg ? t("registerSub") : t("loginSub")) + "</p>" +
          '<form novalidate>' +
            '<div class="utb-err" role="alert" hidden></div>' +
            (reg ? field("utbName", t("name"), "text", "name", "", true, 80) : "") +
            field("utbEmail", t("email"), "email", "email", "", true, 254) +
            pwField("utbPass", t("password"), reg ? "new-password" : "current-password", reg ? t("pwHint") : "") +
            (reg ? '<div class="utb-row2">' + field("utbContact", t("contact"), "tel", "tel", "", false, 60) + field("utbCountry", t("country"), "text", "country-name", "", false, 80) + "</div>" : "") +
            '<input type="text" name="website" class="utb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<button type="submit" class="utb-primary"><span>' + esc(reg ? t("doRegister") : t("doLogin")) + '</span><i class="fas fa-arrow-right"></i></button>' +
            '<p class="utb-switch">' + esc(reg ? t("haveAcc") : t("noAcc")) + ' <button type="button" data-mode="' + (reg ? "login" : "register") + '">' + esc(reg ? t("signIn") : t("join")) + "</button></p>" +
            '<p class="utb-secure"><i class="fas fa-lock"></i> ' + esc(t("secureNote")) + "</p>" +
          "</form>" +
        "</div>" +
      "</div>";
    authEl.querySelector(".utb-x").onclick = function () { closeLayer(authEl); };
    authEl.querySelectorAll("[data-mode]").forEach(function (b) { b.onclick = function () { authMode = b.getAttribute("data-mode"); renderAuth(); var f = authEl.querySelector("input"); f && f.focus(); }; });
    wireEyes(authEl);
    var form = authEl.querySelector("form");
    form.onsubmit = function (e) {
      e.preventDefault();
      var v = function (id) { var x = form.querySelector("#" + id); return x ? x.value.trim() : ""; };
      var body = { email: v("utbEmail"), password: form.querySelector("#utbPass").value, website: form.website.value };
      if (reg) { body.name = v("utbName"); body.contact = v("utbContact"); body.country = v("utbCountry"); }
      if (reg && body.name.length < 2) return showErr(form, t("name") + " ?");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return showErr(form, t("email") + " ?");
      if (body.password.length < 8) return showErr(form, t("pwHint"));
      showErr(form, ""); setBusy(form, true);
      api(reg ? "register" : "login", "POST", body).then(function (j) {
        setUser(j.user);
        closeLayer(authEl);
        toast((reg ? t("created") : t("welcome")) + (j.user ? String(j.user.name).split(/\s+/)[0] : "") + "!");
      }).catch(function (err) { showErr(form, err.message); })
        .then(function () { setBusy(form, false); });
    };
  }
  function openAuth(mode) { authMode = mode || "login"; renderAuth(); openLayer(authEl); }

  /* ---------------------------- Profil paneli ---------------------------- */
  var profileTab = "bookings";
  function buildProfile() {
    profileEl = document.createElement("div");
    profileEl.className = "utb-root utb-overlay utb-drawer-wrap";
    profileEl.setAttribute("role", "dialog");
    profileEl.setAttribute("aria-modal", "true");
    profileEl.setAttribute("aria-label", t("myAccount"));
    profileEl.addEventListener("mousedown", function (e) { if (e.target === profileEl) closeLayer(profileEl); });
    document.body.appendChild(profileEl);
  }
  function bookingCard(b) {
    var isGuide = b.type === "guide";
    var st = b.status || "pending";
    var meta = [];
    if (b.date) meta.push('<span><i class="far fa-calendar"></i> ' + fmtDate(b.date) + "</span>");
    if (b.travelers) meta.push('<span><i class="fas fa-user-group"></i> ' + b.travelers + " " + esc(t("people")) + "</span>");
    if (b.hours) meta.push('<span><i class="far fa-clock"></i> ' + b.hours + " " + esc(t("hours")) + "</span>");
    return '<article class="utb-bk ' + (isGuide ? "g" : "t") + '">' +
      '<div class="utb-bk-ico"><i class="fas ' + (isGuide ? "fa-person-hiking" : "fa-landmark") + '"></i></div>' +
      '<div class="utb-bk-main">' +
        '<div class="utb-bk-top"><span class="utb-bk-type">' + esc(isGuide ? t("guide") : t("tour")) + " · " + esc(b.id || "") + '</span><span class="utb-st ' + esc(st) + '">' + esc(t(st)) + "</span></div>" +
        "<h4>" + esc(b.title || "—") + "</h4>" +
        (b.topic ? '<p class="utb-bk-topic">' + esc(b.topic) + "</p>" : "") +
        '<div class="utb-bk-meta">' + meta.join("") + "</div>" +
      "</div>" +
      (b.total != null ? '<div class="utb-bk-total"><small>' + esc(t("total")) + "</small><b>$" + esc(b.total) + "</b></div>" : "") +
      "</article>";
  }
  function renderProfile() {
    var u = state.user;
    if (!u) { closeLayer(profileEl); return; }
    var bookings = u.bookings || [];
    var body = "";
    if (profileTab === "bookings") {
      body = bookings.length
        ? '<div class="utb-bk-list">' + bookings.map(bookingCard).join("") + "</div>"
        : '<div class="utb-empty"><div class="utb-empty-ico"><i class="fas fa-suitcase-rolling"></i></div><h4>' + esc(t("noBookings")) + "</h4><p>" + esc(t("noBookingsSub")) + '</p><div class="utb-empty-actions"><button type="button" class="utb-primary sm" data-go="historic"><i class="fas fa-landmark"></i> ' + esc(t("browseTours")) + '</button><button type="button" class="utb-ghost sm" data-go="guides-sec"><i class="fas fa-person-hiking"></i> ' + esc(t("findGuide")) + "</button></div></div>";
    } else if (profileTab === "profile") {
      body = '<form class="utb-form" data-f="profile" novalidate><div class="utb-err" role="alert" hidden></div>' +
        field("pName", t("name"), "text", "name", u.name, true, 80) +
        '<label class="utb-field"><span>' + esc(t("email")) + '</span><input type="email" value="' + esc(u.email) + '" disabled></label>' +
        field("pContact", t("contact"), "tel", "tel", u.contact, false, 60) +
        field("pCountry", t("country"), "text", "country-name", u.country, false, 80) +
        '<p class="utb-note"><i class="fas fa-bolt"></i> ' + esc(t("quickBook")) + "</p>" +
        '<button type="submit" class="utb-primary"><span>' + esc(t("save")) + '</span><i class="fas fa-check"></i></button></form>';
    } else {
      body = '<form class="utb-form" data-f="password" novalidate><h4 class="utb-h4"><i class="fas fa-key"></i> ' + esc(t("changePw")) + '</h4><div class="utb-err" role="alert" hidden></div>' +
        pwField("pCur", t("curPw"), "current-password") + pwField("pNew", t("newPw"), "new-password", t("pwHint")) +
        '<button type="submit" class="utb-primary"><span>' + esc(t("changePw")) + "</span></button></form>" +
        '<div class="utb-sep"></div>' +
        '<button type="button" class="utb-ghost wide" data-act="logout"><i class="fas fa-arrow-right-from-bracket"></i> ' + esc(t("logout")) + "</button>" +
        '<details class="utb-danger"><summary><i class="fas fa-triangle-exclamation"></i> ' + esc(t("deleteAcc")) + '</summary>' +
        '<form class="utb-form" data-f="delete" novalidate><p>' + esc(t("deleteWarn")) + '</p><div class="utb-err" role="alert" hidden></div>' +
        pwField("pDel", t("password"), "current-password") +
        '<button type="submit" class="utb-dangerbtn">' + esc(t("deleteAcc")) + "</button></form></details>";
    }
    profileEl.innerHTML =
      '<aside class="utb-drawer">' +
        '<header class="utb-dh">' +
          '<button type="button" class="utb-x" aria-label="' + esc(t("close")) + '"><i class="fas fa-xmark"></i></button>' +
          '<div class="utb-pass">' +
            '<div class="utb-pass-top"><span>' + esc(t("vipPass")) + '</span><i class="fas fa-crown"></i></div>' +
            '<div class="utb-pass-mid"><div class="utb-avatar xl">' + esc(initials(u.name)) + "</div>" +
              '<div><h3>' + esc(u.name) + "</h3><p>" + esc(u.email) + "</p></div></div>" +
            '<div class="utb-pass-bot"><div><small>ID</small><b>' + esc(u.memberId || "—") + "</b></div>" +
              "<div><small>" + esc(t("memberSince")) + "</small><b>" + fmtDate(u.createdAt) + "</b></div>" +
              "<div><small>" + esc(t("tabBookings")) + "</small><b>" + bookings.length + "</b></div></div>" +
          "</div>" +
          '<nav class="utb-ptabs" role="tablist">' +
            [["bookings", "fa-suitcase", t("tabBookings")], ["profile", "fa-id-card", t("tabProfile")], ["security", "fa-shield-halved", t("tabSecurity")]].map(function (x) {
              return '<button type="button" role="tab" aria-selected="' + (profileTab === x[0]) + '" data-tab="' + x[0] + '" class="' + (profileTab === x[0] ? "on" : "") + '"><i class="fas ' + x[1] + '"></i> ' + esc(x[2]) + "</button>";
            }).join("") +
          "</nav>" +
        "</header>" +
        '<div class="utb-dbody">' + body + "</div>" +
      "</aside>";

    profileEl.querySelector(".utb-x").onclick = function () { closeLayer(profileEl); };
    profileEl.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { profileTab = b.getAttribute("data-tab"); renderProfile(); }; });
    profileEl.querySelectorAll("[data-go]").forEach(function (b) {
      b.onclick = function () {
        closeLayer(profileEl);
        var el = document.getElementById(b.getAttribute("data-go"));
        el && el.scrollIntoView({ behavior: "smooth", block: "start" });
      };
    });
    wireEyes(profileEl);
    var lo = profileEl.querySelector('[data-act="logout"]');
    if (lo) lo.onclick = function () {
      lo.disabled = true;
      api("logout", "POST", {}).catch(function () {}).then(function () { setUser(null); closeLayer(profileEl); toast(t("loggedOut")); });
    };
    profileEl.querySelectorAll("form[data-f]").forEach(function (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var kind = form.getAttribute("data-f");
        var q = function (id) { var x = form.querySelector("#" + id); return x ? x.value : ""; };
        var req;
        if (kind === "profile") req = api("me", "PATCH", { name: q("pName").trim(), contact: q("pContact").trim(), country: q("pCountry").trim() });
        else if (kind === "password") req = api("password", "POST", { current: q("pCur"), next: q("pNew") });
        else req = api("me", "DELETE", { password: q("pDel") });
        showErr(form, ""); setBusy(form, true);
        req.then(function (j) {
          if (kind === "profile") { setUser(j.user); toast(t("saved")); }
          else if (kind === "password") { toast(t("pwChanged")); renderProfile(); }
          else { setUser(null); closeLayer(profileEl); toast(t("deleted")); }
        }).catch(function (err) { showErr(form, err.message); setBusy(form, false); });
      };
    });
  }
  function openProfile(tab) {
    if (tab) profileTab = tab;
    renderProfile(); openLayer(profileEl);
    refresh(); // eng so'nggi bronlarni yuklash
  }

  /* ---------------------------- Ishga tushirish ---------------------------- */
  // Bron muvaffaqiyatli bo'lganda profil ma'lumotlarini yangilaymiz (bridge.js signal beradi)
  window.addEventListener("utb:booked", function () { if (state.user) refresh(); });
  // Til almashtirilganda matnlarni qayta chizamiz
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".lang-btn, [data-lang], button")) {
      var before = lang();
      setTimeout(function () { if (lang() !== before) { renderButtons(); if (isOpen(profileEl)) renderProfile(); if (isOpen(authEl)) renderAuth(); } }, 50);
    }
  });

  window.UTBAccount = { open: function () { state.user ? openProfile() : openAuth("login"); }, openAuth: openAuth, openProfile: openProfile, get user() { return state.user; } };

  function start() {
    buildAuth(); buildProfile();
    inject();
    // React sarlavhani qayta chizsa, tugmani qayta qo'shamiz
    var root = document.getElementById("root");
    var pending = false;
    if (root) new MutationObserver(function () {
      if (pending) return; pending = true;
      requestAnimationFrame(function () { pending = false; inject(); });
    })
      .observe(root, { childList: true, subtree: true });
    refresh();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 0); });
  else setTimeout(start, 0);
})();
