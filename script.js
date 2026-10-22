/* Progressive enhancement: the English page remains usable without JavaScript. */
(() => {
  "use strict";
  const root = document.documentElement;
  const header = document.getElementById("site-header");
  const nav = document.getElementById("main-nav");
  const menu = document.getElementById("menu-toggle");
  const themeButton = document.getElementById("theme-toggle");
  const languageButtons = [...document.querySelectorAll("[data-lang]")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const projects = [...document.querySelectorAll(".project-card")];
  const status = document.getElementById("status-message");
  const supported = ["en", "fa", "de"];
  let dictionary = {};
  let language = "en";

  const readPreference = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const savePreference = (key, value) => {
    try { localStorage.setItem(key, value); } catch { /* Storage may be disabled. */ }
  };
  const storedTheme = readPreference("portfolio-theme");
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = ["light", "dark"].includes(storedTheme) ? storedTheme : (systemDark ? "dark" : "light");

  function setTheme(mode, persist = true) {
    root.dataset.theme = mode;
    themeButton.setAttribute("aria-label", mode === "dark" ? "Switch to light theme" : "Switch to dark theme");
    themeButton.setAttribute("title", mode === "dark" ? "Light mode" : "Dark mode");
    if (persist) savePreference("portfolio-theme", mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = mode === "dark" ? "#090e1a" : "#f6f8fc";
  }
  setTheme(initialTheme, false);
  themeButton.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    updateControlLabels();
  });
  if (!["light", "dark"].includes(storedTheme) && window.matchMedia) {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      if (!readPreference("portfolio-theme")) setTheme(event.matches ? "dark" : "light", false);
    };
    if (media.addEventListener) media.addEventListener("change", handleChange);
  }

  function updateControlLabels() {
    const copy = dictionary[language] || {};
    const isDark = root.dataset.theme === "dark";
    themeButton.setAttribute("aria-label", isDark ? (copy.switchLight || "Switch to light theme") : (copy.switchDark || "Switch to dark theme"));
    themeButton.title = isDark ? (copy.switchLight || "Switch to light theme") : (copy.switchDark || "Switch to dark theme");
    menu.setAttribute("aria-label", nav.classList.contains("open") ? (copy.closeMenu || "Close menu") : (copy.openMenu || "Open menu"));
    nav.setAttribute("aria-label", copy.navLabel || "Main navigation");
    document.querySelector(".language-switch").setAttribute("aria-label", copy.languageLabel || "Website language");
    document.querySelector(".filters").setAttribute("aria-label", copy.filterLabel || "Filter projects");
  }

  function applyLanguage(next, updateUrl = false, announce = false) {
    if (!supported.includes(next)) return;
    const copy = dictionary[next];
    if (!copy) return;
    language = next;
    root.lang = next;
    root.dir = next === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;
      if (typeof copy[key] === "string") element.textContent = copy[key];
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;
      if (typeof copy[key] === "string") element.setAttribute("aria-label", copy[key]);
    });
    languageButtons.forEach((button) => {
      const active = button.dataset.lang === next;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (copy.metaTitle) {
      document.title = copy.metaTitle;
      document.querySelector('meta[property="og:title"]').content = copy.metaTitle;
      document.querySelector('meta[name="twitter:title"]').content = copy.metaTitle;
    }
    if (copy.metaDescription) {
      document.querySelector('meta[name="description"]').content = copy.metaDescription;
      document.querySelector('meta[property="og:description"]').content = copy.metaDescription;
      document.querySelector('meta[name="twitter:description"]').content = copy.metaDescription;
    }
    document.querySelector('meta[property="og:locale"]').content =
      next === "fa" ? "fa_IR" : next === "de" ? "de_DE" : "en_US";
    updateControlLabels();
    savePreference("portfolio-language", next);
    if (updateUrl) {
      // Shareable deep links work on any static host without a server-side router.
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("lang", next);
        window.history.replaceState(null, "", url.pathname + url.search + url.hash);
      } catch (error) {
        console.warn("Could not update the language URL", error);
      }
    }
    if (announce) status.textContent = copy.languageChanged || "Language updated";
  }
  languageButtons.forEach((button) => button.addEventListener("click", () => {
    if (!dictionary[button.dataset.lang]) {
      status.textContent = "Translations are unavailable. English content is still accessible.";
      return;
    }
    applyLanguage(button.dataset.lang, true, true);
  }));
  const preferredLanguage = readPreference("portfolio-language");
  const browserLanguage = (navigator.language || "en").split("-")[0].toLowerCase();
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  const initialLanguage = supported.includes(urlLanguage) ? urlLanguage
    : supported.includes(preferredLanguage) ? preferredLanguage
    : supported.includes(browserLanguage) ? browserLanguage : "en";

  fetch("./languages.json")
    .then((response) => { if (!response.ok) throw new Error("Translation request failed"); return response.json(); })
    .then((data) => {
      if (!data || supported.some((lang) => !data[lang] || typeof data[lang].navHome !== "string")) throw new Error("Invalid translation data");
      dictionary = data;
      applyLanguage(initialLanguage);
    })
    .catch((error) => {
      console.warn("Portfolio translations could not be loaded:", error);
      status.textContent = "Translations are unavailable. English content is still accessible.";
    });

  const setMenu = (open, restoreFocus = false) => {
    nav.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    updateControlLabels();
    if (!open && restoreFocus) menu.focus();
  };
  menu.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) setMenu(false, true);
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target) && nav.classList.contains("open")) setMenu(false);
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 900) setMenu(false); }, {passive:true});

  filterButtons.forEach((button) => button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visible = 0;
    projects.forEach((project) => {
      const show = filter === "all" || project.dataset.category === filter;
      project.hidden = !show;
      if (show) visible++;
    });
    filterButtons.forEach((control) => {
      const active = control === button;
      control.classList.toggle("active", active);
      control.setAttribute("aria-pressed", String(active));
    });
    const copy = dictionary[language] || {};
    status.textContent = (copy.filterResult || "{count} projects shown").replace("{count}", String(visible));
  }));

  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
  let scheduled = false;
  const updateActiveSection = () => {
    const current = [...sections].reverse().find((section) => section.getBoundingClientRect().top <= 160) || sections[0];
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === "#" + current.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    header.classList.toggle("scrolled", window.scrollY > 12);
    scheduled = false;
  };
  window.addEventListener("scroll", () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(updateActiveSection); }
  }, {passive:true});
  updateActiveSection();
  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
