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
    // Der Blickwinkel von schräg oben (60°) zeigt die bedruckte Oberseite mit
    // dem Enlupa-Logo bei JEDEM Drehwinkel — anders als eine seitliche Sicht
    // (90°), die zwischendurch nur die schmale Kante zeigt. Damit kann sich
    // die Powerbank beim Scrollen einmal ganz um die eigene Achse drehen,
    // ohne dass das Logo je aus dem Blick gerät.
    var PHI = 60;

    // Fortschritt 0 beim Laden (Hero ganz oben, Frontansicht mit Logo), 1
    // sobald der Hero komplett nach oben aus dem Viewport gescrollt ist.
    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(1, Math.max(0, -rect.top / rect.height));
      var theta = progress * 360;
      model.cameraOrbit = theta.toFixed(1) + "deg " + PHI + "deg 105%";
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }
})();
