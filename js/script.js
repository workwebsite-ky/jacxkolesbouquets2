/* =====================================================================
   JACXKOLE'S BOUQUETS — Interactions
   Sticky header · mobile nav · scroll reveal · animated counters
   FAQ accordion · back-to-top · contact form (mailto fallback) · loader
   ===================================================================== */
(function () {
  "use strict";

  /* ---- Page loader: hide once the window has loaded ---- */
  window.addEventListener("load", function () {
    var loader = document.querySelector(".loader");
    if (loader) setTimeout(function () { loader.classList.add("done"); }, 350);
  });

  document.addEventListener("DOMContentLoaded", function () {

    /* ---- Sticky header state ---- */
    var header = document.querySelector(".site-header");
    var onScroll = function () {
      if (header) header.classList.toggle("scrolled", window.scrollY > 30);
      var toTop = document.querySelector(".to-top");
      if (toTop) toTop.classList.toggle("show", window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- Mobile nav toggle ---- */
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }

    /* ---- Scroll reveal via IntersectionObserver ---- */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---- Animated counters ---- */
    var counters = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window && counters.length) {
      var co = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, target = +el.getAttribute("data-count"),
              suffix = el.getAttribute("data-suffix") || "", start = 0,
              dur = 1400, t0 = null;
          var step = function (ts) {
            if (!t0) t0 = ts;
            var p = Math.min((ts - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(start + (target - start) * eased) + suffix;
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target + suffix;
          };
          requestAnimationFrame(step);
          co.unobserve(el);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { co.observe(el); });
    }

    /* ---- FAQ accordion ---- */
    document.querySelectorAll(".faq-q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.closest(".faq-item");
        var ans = item.querySelector(".faq-a");
        var open = item.classList.toggle("open");
        q.setAttribute("aria-expanded", open ? "true" : "false");
        ans.style.maxHeight = open ? ans.scrollHeight + "px" : 0;
      });
    });

    /* ---- Contact form → mailto fallback ---- */
    var form = document.querySelector("#quote-form");
    if (form) {
      var statusEl = form.querySelector(".form-status");

      function val(n) {
        var el = form.querySelector('[name="' + n + '"]');
        return el ? (el.value || "").trim() : "";
      }

      function mailtoFallback() {
        var subject = "New bouquet enquiry — " + (val("name") || "Website");
        var body =
          "Name: " + val("name") + "\n" +
          "Email: " + val("email") + "\n" +
          "Bouquet of interest: " + val("type") + "\n" +
          "Date needed: " + val("event") + "\n\n" +
          "Details / vision:\n" + val("message") + "\n";
        window.location.href =
          "mailto:Col3wrld@icloud.com?subject=" +
          encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      }

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();

        if (!val("name") || !val("email")) {
          if (statusEl) statusEl.textContent =
            "Please add your name and email so Ja\u2019Cole can reply.";
          return;
        }

        var keyEl = form.querySelector('[name="access_key"]');
        var key = keyEl ? keyEl.value.trim() : "";
        var configured = key && key.indexOf("YOUR_") !== 0;

        // If the Web3Forms key hasn't been added yet, open the email app instead.
        if (!configured) {
          if (statusEl) statusEl.textContent =
            "Opening your email app\u2026 if nothing happens, email Col3wrld@icloud.com directly.";
          mailtoFallback();
          return;
        }

        // Send straight to the inbox via Web3Forms.
        var btn = form.querySelector('button[type="submit"]');
        if (btn) btn.disabled = true;
        if (statusEl) statusEl.textContent = "Sending your request\u2026";

        var payload = {};
        new FormData(form).forEach(function (v, k) { payload[k] = v; });

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        })
          .then(function (r) { return r.json(); })
          .then(function (res) {
            if (res && res.success) {
              form.reset();
              if (statusEl) statusEl.textContent =
                "Thank you! Your request was sent to Ja\u2019Cole \u2014 she\u2019ll be in touch soon.";
            } else {
              if (statusEl) statusEl.textContent =
                "Couldn\u2019t send automatically \u2014 opening your email app instead\u2026";
              mailtoFallback();
            }
          })
          .catch(function () {
            if (statusEl) statusEl.textContent =
              "Couldn\u2019t send automatically \u2014 opening your email app instead\u2026";
            mailtoFallback();
          })
          .then(function () { if (btn) btn.disabled = false; });
      });
    }

    /* ---- Current year in footer ---- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  });
})();
