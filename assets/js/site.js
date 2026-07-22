// Enlupa — geteiltes Verhalten für alle Seiten (Nav-Toggle, Reveals, Steps).
window.addEventListener("DOMContentLoaded", function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
});
