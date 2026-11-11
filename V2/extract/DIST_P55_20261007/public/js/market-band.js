(function () {
  "use strict";

  /* carbon market band: third-party prices in a sandboxed frame made here only, following the site theme,
     with a Hide prices / Show prices control remembered on this browser */
  var band = document.getElementById("market-band");
  var slot = document.getElementById("market-band-slot");
  var toggle = document.getElementById("market-band-toggle");
  if (!band || !slot || !toggle) {
    return;
  }
  var root = document.documentElement;
  var storageKey = "solvura-x-market-band";

  function stored() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return null;
    }
  }

  function remember(value) {
    try {
      window.localStorage.setItem(storageKey, value);
    } catch (error) {
    }
  }

  /* the strip scrolls; visitors who ask for less motion get the same lines standing still */
  var still = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function wanted() {
    var theme = root.getAttribute("data-theme") === "flyleaf" ? "light" : "dark";
    return band.getAttribute((still && still.matches ? "data-still-" : "data-src-") + theme);
  }

  /* a fresh frame each time: the two addresses differ only after "#", which alone would not reload the widget */
  function load(force) {
    var old = slot.querySelector("iframe");
    var src = wanted();
    if (!src || (old && !force && old.getAttribute("src") === src)) {
      return;
    }
    var frame = document.createElement("iframe");
    frame.className = "market-band-frame";
    frame.title = "Carbon market prices by TradingView";
    frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
    frame.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("src", src);
    if (old) {
      slot.replaceChild(frame, old);
    } else {
      slot.appendChild(frame);
    }
  }

  function unload() {
    var old = slot.querySelector("iframe");
    if (old) {
      slot.removeChild(old);
    }
  }

  var preference = stored();
  var show = preference ? preference === "shown" : band.getAttribute("data-load") !== "click";

  function render() {
    band.classList.toggle("is-hidden", !show);
    toggle.setAttribute("aria-expanded", String(show));
    toggle.textContent = show ? "Hide prices" : "Show prices";
    if (show) {
      load(false);
    } else {
      unload();
    }
  }

  render();

  toggle.addEventListener("click", function () {
    show = !show;
    remember(show ? "shown" : "hidden");
    render();
  });

  if (window.MutationObserver) {
    new MutationObserver(function () {
      if (show) {
        load(false);
      }
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }

  if (still && still.addEventListener) {
    still.addEventListener("change", function () {
      if (show) {
        load(false);
      }
    });
  }

  /* the widget lays out its tickers for the width it loads at: reload when the width band changes */
  var widthBand = Math.floor(window.innerWidth / 240);
  var timer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      var now = Math.floor(window.innerWidth / 240);
      if (now !== widthBand) {
        widthBand = now;
        if (show) {
          load(true);
        }
      }
    }, 400);
  });
}());
