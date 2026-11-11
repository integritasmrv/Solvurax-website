(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  if (!toggle) {
    return;
  }

  var storageKey = "solvura-x-theme";

  function validTheme(theme) {
    return theme === "obsidian" || theme === "flyleaf";
  }

  /* with nothing stored, keep the theme the page itself opens with
     (the site of record always fell back to "obsidian"). */
  function pageTheme() {
    var current = root.getAttribute("data-theme");
    return validTheme(current) ? current : "obsidian";
  }

  function getStoredTheme() {
    try {
      var stored = window.localStorage.getItem(storageKey);
      return validTheme(stored) ? stored : pageTheme();
    } catch (error) {
      return pageTheme();
    }
  }

  function setTheme(theme, remember) {
    if (!validTheme(theme)) {
      theme = "obsidian";
    }

    root.setAttribute("data-theme", theme);

    var isFlyleaf = theme === "flyleaf";
    toggle.setAttribute("aria-pressed", String(isFlyleaf));
    toggle.textContent = isFlyleaf ? "Theme: Light" : "Theme: Dark";

    /* one logo image per page; the file for the current ground is the only one fetched */
    var logo = document.getElementById("site-logo");
    if (logo) {
      var want = logo.getAttribute(isFlyleaf ? "data-logo-light" : "data-logo-dark");
      if (want && logo.getAttribute("src") !== want) {
        logo.setAttribute("src", want);
      }
    }

    if (remember) {
      try {
        window.localStorage.setItem(storageKey, theme);
      } catch (error) {
      }
    }

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        window.getComputedStyle(document.body).backgroundColor
      );
    }
  }

  setTheme(getStoredTheme(), false);

  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme");
    setTheme(current === "flyleaf" ? "obsidian" : "flyleaf", true);
  });
}());
