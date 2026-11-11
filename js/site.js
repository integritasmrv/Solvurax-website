(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ─── Theme toggle ──────────────────────────────────────────── */
  var root = document.documentElement;
  var toggle = document.getElementById("theme-toggle");

  if (toggle) {
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
  }

  /* ─── Scroll reveal (IntersectionObserver) ──────────────────── */
  var revealEls = document.querySelectorAll("[data-reveal]");

  if (revealEls.length && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    /* Fallback: show everything */
    revealEls.forEach(function (el) {
      el.setAttribute("data-reveal", "visible");
    });
  }

  /* ─── Number counting animation ─────────────────────────────── */
  var countEls = document.querySelectorAll("[data-count]");

  if (countEls.length && "IntersectionObserver" in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    countEls.forEach(function (el) {
      countObserver.observe(el);
    });
  } else {
    /* Fallback: show final values */
    countEls.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (!isNaN(target)) {
        el.textContent = formatNumber(target, el.getAttribute("data-prefix"), el.getAttribute("data-suffix"));
      }
    });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;

    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1200;
    var start = 0;
    var startTime = null;

    /* Check for reduced motion preference */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = prefix + formatNumber(target) + suffix;
      return;
    }

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);

      /* Ease-out cubic */
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);

      el.textContent = prefix + formatNumber(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /* ─── Container Scroll Turn (service grid) ───────────────────────
     Adapted from Aceternity UI "Container Scroll Animation"
     (https://ui.aceternity.com/components/container-scroll-animation).
     Licence: free for personal and commercial use; the component itself
     must not be redistributed as a standalone asset or marketplace item.
     The demo's framed-hero motion is remapped onto the existing service
     grid, so card order, links and final readable states are unchanged. */
  /** @typedef {{ containerScrollTurn: boolean, scrollStack: boolean, animatedBeam: boolean, worldMap: boolean, stickyScroll: boolean }} SXFlags */

  /** @type {SXFlags} */
var SX_FLAGS = {
  containerScrollTurn: true,
  scrollStack: true,
  animatedBeam: true,
  worldMap: true,
  stickyScroll: true
};

  function initStickyScroll() {
    if (!SX_FLAGS.stickyScroll) return;
    var root = document.querySelector("[data-sx-sticky]");
    if (!root) return;

    var items = Array.prototype.slice.call(
      root.querySelectorAll("[data-sx-sticky-item]")
    );
    if (!items.length) return;

    var railMarks = Array.prototype.slice.call(
      root.querySelectorAll(".sx-sticky__rail li")
    );
    var indexLabel = root.querySelector("[data-sx-sticky-index]");

    function setActive(index) {
      items.forEach(function (item, i) {
        item.classList.toggle("sx-sticky__item--active", i === index);
      });
      railMarks.forEach(function (mark, i) {
        mark.classList.toggle("sx-sticky__rail--active", i === index);
      });
      if (indexLabel) {
        indexLabel.textContent = String(index + 1).padStart(2, "0");
      }
    }

    setActive(0);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var observer = new IntersectionObserver(
      function (entries) {
        var best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (!best) return;
        var index = items.indexOf(best.target);
        if (index !== -1) setActive(index);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function initContainerScrollTurn() {
    if (!SX_FLAGS.containerScrollTurn) {
      return;
    }

    var reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var turnEls = document.querySelectorAll("[data-sx-turn]");

    if (!turnEls.length || reduced) {
      return;
    }

    var MAX_ROT = 18;
    var START_SCALE = 1.06;
    var MAX_LIFT = 28;
    var ticking = false;

    function clamp01(value) {
      return Math.min(1, Math.max(0, value));
    }

    function update(el) {
      var card = el.querySelector(".sx-turn__card");
      if (!card) {
        return;
      }

      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var progress = clamp01((vh - rect.top) / (rect.height + vh * 0.5));
      var eased = 1 - Math.pow(1 - progress, 3);

      card.style.setProperty("--sx-turn-rot", (MAX_ROT * (1 - eased)).toFixed(2));
      card.style.setProperty(
        "--sx-turn-scale",
        (START_SCALE + (1 - START_SCALE) * eased).toFixed(4)
      );
      card.style.setProperty(
        "--sx-turn-lift",
        (MAX_LIFT * (1 - eased)).toFixed(2) + "px"
      );
    }

    function onScroll() {
      if (ticking) {
        return;
      }
      ticking = true;
      requestAnimationFrame(function () {
        turnEls.forEach(update);
        ticking = false;
      });
    }

    turnEls.forEach(function (el) {
      el.classList.add("sx-turn--active");
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  initContainerScrollTurn();
  initScrollStack();
  initAnimatedBeam();
  initWorldMap();
  initStickyScroll();

  function initScrollStack() {
    if (!SX_FLAGS.scrollStack) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var stacks = document.querySelectorAll("[data-sx-stack]");
    if (!stacks.length) return;
    var MAX_SHRINK = 0.04;
    var ticking = false;

    function clamp01(value) {
      return Math.min(1, Math.max(0, value));
    }

    function update() {
      var vh = window.innerHeight || 1;
      stacks.forEach(function (stack) {
        var items = stack.querySelectorAll("[data-sx-stack-item]");
        items.forEach(function (item) {
          var rect = item.getBoundingClientRect();
          var progress = clamp01((vh * 0.5 - rect.top) / (vh * 0.5));
          var scale = 1 - MAX_SHRINK * progress;
          item.style.setProperty("--sx-stack-scale", scale.toFixed(4));
          if (progress > 0.01) {
            item.classList.add("sx-stack--active");
          } else {
            item.classList.remove("sx-stack--active");
          }
        });
      });
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
  }

  function initAnimatedBeam() {
    if (!SX_FLAGS.animatedBeam) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var beams = document.querySelectorAll("[data-sx-beam]");
    if (!beams.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("sx-beam--active", entry.isIntersecting);
        });
      },
      { threshold: 0.2 }
    );

    beams.forEach(function (beam) {
      observer.observe(beam);
    });
  }

  function initWorldMap() {
    if (!SX_FLAGS.worldMap) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var map = document.querySelector("[data-sx-map]");
    if (!map) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          map.classList.add("sx-map--active");
        } else {
          map.classList.remove("sx-map--active");
        }
      });
    }, { threshold: 0.2 });

    observer.observe(map);
  }
})();
