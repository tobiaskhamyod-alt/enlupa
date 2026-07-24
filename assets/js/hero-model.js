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

    function update() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = rect.height + vh;
      var passed = vh - rect.top;
      var progress = Math.min(1, Math.max(0, passed / total));
      model.cameraOrbit = (progress * 360).toFixed(1) + "deg 75deg 105%";
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }
})();
