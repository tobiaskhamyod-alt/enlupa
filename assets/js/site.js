// Enlupa — geteiltes Verhalten für alle Seiten (Nav-Toggle, Reveals, Steps, Batterie-Scrollanzeige).

// ---- Batterie-Scrollanzeige: ein Snippet für alle 5 Seiten, Markup wird
// hier einmalig erzeugt statt in jeder Seite von Hand dupliziert. ----
function initBatteryIndicator(reduce) {
  var wrap = document.createElement("div");
  wrap.className = "battery-indicator" + (reduce ? " is-reduced" : "");
  wrap.setAttribute("role", "progressbar");
  wrap.setAttribute("aria-label", "Lesefortschritt der Seite");
  wrap.setAttribute("aria-valuemin", "0");
  wrap.setAttribute("aria-valuemax", "100");
  wrap.setAttribute("aria-valuenow", "0");
  wrap.innerHTML =
    '<svg viewBox="0 0 28 14" aria-hidden="true">' +
      '<defs><clipPath id="batteryClip"><rect x="1" y="1" width="24" height="12" rx="3"/></clipPath></defs>' +
      '<rect x="25.5" y="4.5" width="2" height="5" rx="1" class="battery-indicator__tip"></rect>' +
      '<rect x="1" y="1" width="0" height="12" class="battery-indicator__fill" clip-path="url(#batteryClip)"></rect>' +
      '<rect x="1" y="1" width="24" height="12" rx="3" class="battery-indicator__shell"></rect>' +
    '</svg>';
  document.body.appendChild(wrap);

  var fill = wrap.querySelector(".battery-indicator__fill");
  var ticking = false;

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var se = document.scrollingElement || doc;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, se.scrollTop / max)) : 0;
    fill.setAttribute("width", (p * 24).toFixed(2));
    wrap.setAttribute("aria-valuenow", String(Math.round(p * 100)));
  }

  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}

window.addEventListener("DOMContentLoaded", function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  initBatteryIndicator(reduce);

  // ---- Mobile-Nav Toggle ----
  var burger = document.getElementById("navBurger");
  var mobile = document.getElementById("navMobile");
  if (burger && mobile) {
    burger.addEventListener("click", function () {
      var open = mobile.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.classList.remove("is-open");
        burger.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- Aktiven Nav-Link markieren ----
  var here = document.body.getAttribute("data-page");
  if (here) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      if (a.getAttribute("data-nav") === here) a.classList.add("is-active");
    });
  }

  var g = window.gsap, ST = window.ScrollTrigger;

  if (!g || !ST || reduce) {
    document.querySelectorAll(".step").forEach(function (s) { s.classList.add("is-on"); });
    return;
  }

  g.registerPlugin(ST);

  g.utils.toArray(".reveal").forEach(function (el) {
    g.from(el, {
      y: 24, opacity: 0, duration: 0.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%", once: true }
    });
  });

  var stepEls = g.utils.toArray(".step");
  if (stepEls.length) {
    ST.create({
      trigger: ".steps",
      start: "top 75%",
      end: "bottom 60%",
      scrub: 0.6,
      onUpdate: function (self) {
        var p = self.progress;
        stepEls.forEach(function (el, i) {
          el.classList.toggle("is-on", p >= (i / stepEls.length) + 0.02);
        });
      }
    });
  }

  // ---- Preise: Count-up beim Reinscrollen, einmalig. Der Zielwert steht
  // als echter Text im Markup (SEO/No-JS-fest) und wird hier nur ausgelesen,
  // auf 0 gesetzt und wieder hochgezählt. ----
  g.utils.toArray(".price-tile__num").forEach(function (el) {
    var target = parseFloat(el.textContent);
    var counter = { val: 0 };
    el.textContent = "0";
    ST.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: function () {
        g.to(counter, {
          val: target, duration: 1.1, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(counter.val); }
        });
      }
    });
  });

  // Falls Web-Fonts oder Bilder nach dem ersten ScrollTrigger-Check noch
  // Layout verschieben, neu berechnen — sonst kann ein Trigger, dessen
  // Position sich verschoben hat, nie feuern und der Preis bliebe bei 0.
  window.addEventListener("load", function () { ST.refresh(); });
});
