(function () {
  "use strict";

  /*
   * DataFast analytics loader.
   *
   * Site ID: dfid_NTpqL3UvEcyztHwuRevmA
   * Domain:  solvurax.com
   */

  var ANALYTICS_SITE_ID = "dfid_NTpqL3UvEcyztHwuRevmA";
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
