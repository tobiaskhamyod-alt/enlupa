// Enlupa — 3D-Hero (nur Startseite). Lädt <model-viewer> nur bei WebGL-Support
// und ohne prefers-reduced-motion; sonst bleibt das statische Bild sichtbar.
(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function hasWebGL() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) {
      return false;
    }
  }

  if (reduceMotion || !window.customElements || !hasWebGL()) return;

  var img = document.getElementById("heroFallbackImg");
  var model = document.getElementById("heroModel");
  if (!img || !model) return;

  var script = document.createElement("script");
  script.type = "module";
  script.src = "assets/js/vendor/model-viewer.min.js";
  script.onload = function () {
    customElements.whenDefined("model-viewer").then(function () {
      img.style.display = "none";
      model.style.display = "block";
      setupScrollRotation();
    }).catch(function () {});
  };
  document.head.appendChild(script);

  function setupScrollRotation() {
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var ticking = false;
    // Blickwinkel-Bogen, in dem das Enlupa-Logo sichtbar bleibt (225°-315°,
    // 270° zeigt es flach von vorn). Eine volle 360°-Drehung würde die
    // Beschriftung die meiste Zeit vom Betrachter wegdrehen.
    var THETA_FROM = 225;
    var THETA_TO = 315;

    // Fortschritt 0 beim Laden (Hero ganz oben), 1 sobald der Hero komplett
    // nach oben aus dem Viewport gescrollt ist.
    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      var theta = THETA_FROM + progress * (THETA_TO - THETA_FROM);
      model.cameraOrbit = theta.toFixed(1) + "deg 80deg 105%";
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }
})();
