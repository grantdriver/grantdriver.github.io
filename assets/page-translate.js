/* Page translate (2026-11-06; English-restore + speech language fix 2026-11-10).
   Google Translate element + language select. No API key.
   Read-aloud reads the page text, so after translate it speaks the new language; the speech voice/lang is
   switched here to match the chosen language (the read-aloud bar itself asks for en-US).
   Choosing English clears the googtrans cookie (every domain variant) and reloads, which always
   restores the original English page (Google's own widget cannot switch back to the source language). */
(function () {
  if (window.__pageTranslateInit) return;
  window.__pageTranslateInit = true;

  var LANGS = [
    { code: "", label: "English" },
    { code: "es", label: "Español" },
    { code: "ru", label: "Русский" },
    { code: "uk", label: "Українська" },
    { code: "pa", label: "ਪੰਜਾਬੀ" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "ar", label: "العربية" },
    { code: "zh-CN", label: "中文" }
  ];
  var SPEECH = { es: "es-ES", ru: "ru-RU", uk: "uk-UA", pa: "pa-IN", vi: "vi-VN", ar: "ar-SA", "zh-CN": "zh-CN" };
  var active = "";   // "" = English (original page)

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".goog-te-banner-frame,.skiptranslate,iframe.goog-te-menu-frame{display:none!important}",
      "body{top:0!important}",
      "#page-lang{font:inherit;border:0;border-radius:999px;padding:8px 12px;background:#dbe5f5;color:#0b1f4d;cursor:pointer;max-width:11rem}",
      "label.page-lang-wrap{display:inline-flex;align-items:center;gap:6px;margin:0}",
      ".ra-bar #page-lang{padding:8px 6px;max-width:11rem}",
      ".topbar .page-lang-wrap{display:none!important}",
      "@media print{.page-lang-wrap,#google_translate_element{display:none!important}}"
    ].join("");
    document.head.appendChild(s);
  }

  function ensureSelect() {
    var existing = document.getElementById("page-lang");
    if (existing) return existing;
    var bar = document.querySelector(".ra-bar") || document.querySelector(".topbar");
    if (!bar) return null;
    var lab = document.createElement("label");
    lab.className = "page-lang-wrap notranslate";
    lab.setAttribute("data-ra-skip", "");
    lab.setAttribute("translate", "no");
    lab.innerHTML = "<span aria-hidden='true'>🌐</span>";
    var sel = document.createElement("select");
    sel.id = "page-lang";
    sel.className = "notranslate";
    sel.setAttribute("data-ra-skip", "");
    sel.setAttribute("translate", "no");
    sel.setAttribute("aria-label", "Translate this page");
    LANGS.forEach(function (L) {
      var o = document.createElement("option");
      o.value = L.code;
      o.textContent = L.label;
      sel.appendChild(o);
    });
    lab.appendChild(sel);
    bar.appendChild(lab);
    if (!document.getElementById("google_translate_element")) {
      var d = document.createElement("div");
      d.id = "google_translate_element";
      d.style.display = "none";
      d.setAttribute("aria-hidden", "true");
      document.body.appendChild(d);
    }
    return sel;
  }

  function known(code) {
    for (var i = 1; i < LANGS.length; i++) if (LANGS[i].code === code) return true;
    return false;
  }

  function currentLangFromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/;]+\/([^;]+)/);
    var c = m ? decodeURIComponent(m[1]) : "";
    return known(c) ? c : "";
  }

  // Every domain the googtrans cookie may have been set on: host-only, host, .host, and each parent domain.
  function cookieDomains() {
    var h = location.hostname, parts = h.split("."), out = ["", h, "." + h];
    for (var i = 1; i < parts.length - 1; i++) { var d = parts.slice(i).join("."); out.push(d, "." + d); }
    return out;
  }

  function writeCookie(value, expire) {
    cookieDomains().forEach(function (d) {
      document.cookie = "googtrans=" + value + "; path=/" + (d ? "; domain=" + d : "") +
        (expire ? "; expires=Thu, 01 Jan 1970 00:00:00 GMT" : "") + "; SameSite=Lax";
    });
  }

  function stopSpeech() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }

  // Speech follows the current page language.
  function pickVoice(lang) {
    var want = (SPEECH[lang] || lang).toLowerCase().replace("_", "-"), base = want.split("-")[0];
    var vs = [];
    try { vs = window.speechSynthesis.getVoices() || []; } catch (e) {}
    var norm = function (v) { return (v.lang || "").toLowerCase().replace("_", "-"); };
    return vs.filter(function (v) { return norm(v) === want; })[0] ||
           vs.filter(function (v) { return norm(v).split("-")[0] === base; })[0] || null;
  }
  function patchSpeech() {
    var s = window.speechSynthesis;
    if (!s || s.__ptPatched) return;
    var orig = s.speak;
    s.speak = function (u) {
      try {
        if (u && active) {
          u.lang = SPEECH[active] || active;
          var v = pickVoice(active);
          u.voice = v;                       // null = browser picks a voice for u.lang
          if (v) u.lang = v.lang;
        } else if (u && (!u.lang || !/^en/i.test(u.lang))) {
          u.lang = "en-US";
        }
      } catch (e) {}
      return orig.call(s, u);
    };
    s.__ptPatched = true;
  }

  function setCombo(lang) {
    var combo = document.querySelector(".goog-te-combo");
    if (!combo) return false;
    var ok = false;
    for (var i = 0; i < combo.options.length; i++) if (combo.options[i].value === lang) ok = true;
    if (!ok) return false;
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
    return true;
  }

  function applyLang(lang) {
    stopSpeech();
    if (!known(lang)) lang = "";
    if (!lang) {
      // Back to English: drop the cookie everywhere and reload the original page.
      active = "";
      writeCookie("", true);
      document.documentElement.lang = "en";
      location.reload();
      return;
    }
    active = lang;
    writeCookie("/en/" + lang, false);
    if (setCombo(lang)) return;
    // Google's widget not ready yet: wait briefly, then fall back to a reload (cookie makes it translate on load).
    var tries = 0, t = setInterval(function () {
      if (setCombo(lang)) { clearInterval(t); return; }
      if (++tries > 15) { clearInterval(t); location.reload(); }
    }, 200);
  }

  window.googleTranslateElementInit = function () {
    try {
      new google.translate.TranslateElement({
        pageLanguage: "en",
        includedLanguages: "en,es,ru,uk,pa,vi,ar,zh-CN",
        autoDisplay: false
      }, "google_translate_element");
    } catch (e) {}
    var sel = document.getElementById("page-lang");
    if (sel) sel.value = active;
  };

  function boot() {
    css();
    patchSpeech();
    active = currentLangFromCookie();
    var sel = ensureSelect();
    if (sel) {
      sel.value = active;
      sel.addEventListener("change", function () { applyLang(sel.value); });
    }
    if (!document.getElementById("page-translate-gt")) {
      var s = document.createElement("script");
      s.id = "page-translate-gt";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }

  // Back/forward cache: re-sync the menu with the cookie when a page is shown again.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    var sel = document.getElementById("page-lang"), c = currentLangFromCookie();
    if (c !== active) location.reload(); else if (sel) sel.value = active;
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
