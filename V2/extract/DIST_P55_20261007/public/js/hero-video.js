(function () {
  "use strict";


  var video = document.getElementById("hero-video");
  if (!video) {
    return;
  }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    return;
  }
  video.setAttribute("src", video.getAttribute("data-src"));
  var start = video.play();
  if (start && start.catch) {
    start.catch(function () {
    });
  }
}());
