(function () {
  "use strict";

  /*
   * DataFast analytics loader.
   *
   * Replace ANALYTICS_SITE_ID with the real website ID from the DataFast
   * dashboard (Dashboard -> New website -> "dfid_..."). While the placeholder
   * is still present this loader is a no-op, so the site can be deployed
   * safely without emitting any analytics traffic.
   */

  var ANALYTICS_SITE_ID = "dfid_REPLACE_WITH_REAL_SITE_ID";
  var ANALYTICS_DOMAIN = "solvurax.com";
  var SCRIPT_SRC = "https://datafa.st/js/script.js";

  if (ANALYTICS_SITE_ID.indexOf("REPLACE_WITH_REAL_SITE_ID") !== -1) {
    return;
  }

  var script = document.createElement("script");
  script.defer = true;
  script.src = SCRIPT_SRC;
  script.setAttribute("data-website-id", ANALYTICS_SITE_ID);
  script.setAttribute("data-domain", ANALYTICS_DOMAIN);
  (document.head || document.documentElement).appendChild(script);
})();
