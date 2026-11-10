/* Page translate (2026-11-06): Google Translate element + language select. No API key.
   Read-aloud reads .ln textContent, so after translate it speaks the new language. */
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

  function currentLangFromCookie() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^\/]+\/([^;]+)/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function stopSpeech() {
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }

  function setCombo(lang) {
    var combo = document.querySelector(".goog-te-combo");
    if (!combo) return false;
    combo.value = lang;
    combo.dispatchEvent(new Event("change"));
    return true;
  }

  function applyLang(lang) {
    stopSpeech();
    if (!lang) {
      // Reset to English
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + location.hostname;
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + location.hostname;
      if (!setCombo("")) location.reload();
      return;
    }
    if (!setCombo(lang)) {
      document.cookie = "googtrans=/en/" + lang + "; path=/";
      location.reload();
    }
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
    if (sel) {
      var cur = currentLangFromCookie();
      if (cur) sel.value = cur;
    }
  };

  function boot() {
    css();
    var sel = ensureSelect();
    if (sel) {
      sel.addEventListener("change", function () { applyLang(sel.value); });
      var cur = currentLangFromCookie();
      if (cur) sel.value = cur;
    }
    if (!document.getElementById("page-translate-gt")) {
      var s = document.createElement("script");
      s.id = "page-translate-gt";
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      s.async = true;
      document.body.appendChild(s);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
