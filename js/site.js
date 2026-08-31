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

  function getStoredTheme() {
    try {
      var stored = window.localStorage.getItem(storageKey);
      return validTheme(stored) ? stored : "obsidian";
    } catch (error) {
      return "obsidian";
    }
  }

  function setTheme(theme) {
    if (!validTheme(theme)) {
      theme = "obsidian";
    }

    root.setAttribute("data-theme", theme);

    var isFlyleaf = theme === "flyleaf";
    toggle.setAttribute("aria-pressed", String(isFlyleaf));
    toggle.textContent = isFlyleaf ? "Theme: Flyleaf" : "Theme: Obsidian";

    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
    }

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute(
        "content",
        isFlyleaf ? "#EFE8D6" : "#001008"
      );
    }
  }

  setTheme(getStoredTheme());

  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme");
    setTheme(current === "flyleaf" ? "obsidian" : "flyleaf");
  });
}());
