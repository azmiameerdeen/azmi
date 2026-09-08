/*
 * azmi@linux — site behaviour
 *
 * Conventions used throughout:
 *  - Motion is gated on prefers-reduced-motion. CSS collapses animation
 *    durations; anything JS-driven (canvas, typewriter, parallax) opts out here.
 *  - Scroll work runs from ONE passive listener batched into a rAF, rather than
 *    six independent listeners each doing layout reads.
 *  - Nothing that reveals content may depend on an animation completing.
 */

var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// ---------------------------------------------------------------------------
// Matrix code-rain background
// ---------------------------------------------------------------------------
(function () {
  var canvas = document.getElementById("matrix");
  if (!canvas || reduceMotion.matches) return;

  var ctx = canvas.getContext("2d");
  var chars = "アカサタナハマヤラワ01アイウエオカキクケコサシスセソタチツテト";
  var fontSize = 15;
  var columns, drops, dpr;
  var lastFrame = 0;
  var running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.floor(window.innerWidth / fontSize);
    drops = new Array(columns);
    for (var i = 0; i < columns; i++) {
      // Random start, so a resize doesn't snap every column back to the top.
      drops[i] = Math.random() * (window.innerHeight / fontSize);
    }
  }

  // Mobile browsers fire resize on every address-bar show/hide.
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  function draw(now) {
    if (!running) return;
    requestAnimationFrame(draw);
    if (now - lastFrame < 50) return; // ~20fps is plenty for rain
    lastFrame = now;

    ctx.fillStyle = "rgba(5, 8, 15, 0.08)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#22d3ee";
    ctx.font = fontSize + "px monospace";

    for (var i = 0; i < drops.length; i++) {
      var text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  // A background tab should not keep burning a canvas loop.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      requestAnimationFrame(draw);
    }
  });

  resize();
  requestAnimationFrame(draw);
})();

// ---------------------------------------------------------------------------
// Typing effect
// ---------------------------------------------------------------------------
(function () {
  var el = document.getElementById("typed");
  if (!el) return;

  var roles = [
    "Assistant Manager — IT/OT Infrastructure & Security",
    "IT Security Infrastructure Specialist",
    "Linux Engineer",
    "Systems Administrator",
    "Cloud & Virtualization Specialist"
  ];

  // Reduced motion: state the role, don't perform it.
  if (reduceMotion.matches) {
    el.textContent = roles[0];
    var caret = document.querySelector(".hero-subtitle .cursor");
    if (caret) caret.style.display = "none";
    return;
  }

  var roleIndex = 0;
  var charIndex = 0;
  var deleting = false;

  function type() {
    var current = roles[roleIndex];
    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(type, 1800);
        return;
      }
      setTimeout(type, 70);
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
      setTimeout(type, 40);
    }
  }
  type();
})();

// ---------------------------------------------------------------------------
// Scroll-driven UI — navbar state, progress bar, back-to-top, active link.
// One passive listener, one rAF, one layout read per frame.
// ---------------------------------------------------------------------------
(function () {
  var nav = document.getElementById("navbar");
  var bar = document.getElementById("scrollProgress");
  var toTop = document.getElementById("backToTop");
  var sections = document.querySelectorAll("section[id], header[id]");
  var links = document.querySelectorAll(".nav-link");
  var ticking = false;
  var lastActive = "";

  function update() {
    ticking = false;
    var doc = document.documentElement;
    var y = window.scrollY;

    if (nav) nav.classList.toggle("scrolled", y > 40);
    if (toTop) toTop.classList.toggle("show", y > 500);

    if (bar) {
      var range = doc.scrollHeight - doc.clientHeight;
      bar.style.width = (range > 0 ? (y / range) * 100 : 0) + "%";
    }

    var current = "";
    for (var i = 0; i < sections.length; i++) {
      if (y >= sections[i].offsetTop - 120) current = sections[i].id;
    }
    if (current !== lastActive) {
      lastActive = current;
      for (var j = 0; j < links.length; j++) {
        var on = links[j].getAttribute("href") === "#" + current;
        links[j].classList.toggle("active", on);
        if (on) {
          links[j].setAttribute("aria-current", "true");
        } else {
          links[j].removeAttribute("aria-current");
        }
      }
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true }
  );

  update();
})();

// ---------------------------------------------------------------------------
// Mobile nav — toggle, Escape, outside click, focus return
// ---------------------------------------------------------------------------
(function () {
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  function setOpen(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!links.classList.contains("open"));
  });

  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("click", function (e) {
    if (!links.classList.contains("open")) return;
    if (!links.contains(e.target) && e.target !== toggle) setOpen(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) {
      setOpen(false);
      toggle.focus();
    }
  });
})();

// ---------------------------------------------------------------------------
// Scroll reveal
// ---------------------------------------------------------------------------
(function () {
  var targets = document.querySelectorAll(".reveal");

  function showAll() {
    for (var i = 0; i < targets.length; i++) targets[i].classList.add("visible");
  }

  // No IntersectionObserver, or motion is unwanted: show everything up front.
  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    showAll();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  for (var i = 0; i < targets.length; i++) observer.observe(targets[i]);

  // Safety net. Browsers throttle IntersectionObserver delivery while a tab is
  // in the background, so a page opened in a background tab — or deep-linked and
  // scrolled before the observer had a chance to report — can end up with
  // on-screen blocks still at opacity 0. Sweep whatever is in view.
  function sweep() {
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) targets[i].classList.add("visible");
    }
  }

  window.addEventListener("load", function () {
    setTimeout(sweep, 400);
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) setTimeout(sweep, 100);
  });
})();

// ---------------------------------------------------------------------------
// Animated counters
// ---------------------------------------------------------------------------
(function () {
  var stats = document.querySelectorAll(".stat");

  function fill(stat) {
    var num = stat.querySelector(".num");
    if (num) num.textContent = stat.dataset.count + (stat.dataset.suffix || "");
  }

  if (!("IntersectionObserver" in window) || reduceMotion.matches) {
    for (var i = 0; i < stats.length; i++) fill(stats[i]);
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var stat = entry.target;
        observer.unobserve(stat);
        var target = parseInt(stat.dataset.count, 10);
        var suffix = stat.dataset.suffix || "";
        var num = stat.querySelector(".num");
        var current = 0;
        var step = Math.max(1, Math.ceil(target / 60));
        var timer = setInterval(function () {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          num.textContent = current + suffix;
        }, 24);
      });
    },
    { threshold: 0.5 }
  );

  for (var j = 0; j < stats.length; j++) observer.observe(stats[j]);
})();

// ---------------------------------------------------------------------------
// Skill bars
// ---------------------------------------------------------------------------
(function () {
  var bars = document.querySelectorAll(".bar-fill");

  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < bars.length; i++) bars[i].style.width = bars[i].dataset.width + "%";
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        entry.target.style.width = entry.target.dataset.width + "%";
      });
    },
    { threshold: 0.4 }
  );

  for (var j = 0; j < bars.length; j++) observer.observe(bars[j]);
})();

// ---------------------------------------------------------------------------
// Pointer flourishes — tilt, cursor glow, magnetic buttons.
// All of it is hover-only decoration, so it is skipped on touch and on
// reduced motion. The magnetic effect also skips the keyboard path, since an
// inline transform would otherwise stomp the :hover and :focus-visible states.
// ---------------------------------------------------------------------------
(function () {
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!finePointer || reduceMotion.matches) return;

  document.querySelectorAll(".tilt").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        "perspective(800px) rotateY(" + x * 8 + "deg) rotateX(" + -y * 8 + "deg)";
    });
    card.addEventListener("mouseleave", function () {
      card.style.transform = "";
    });
  });

  document.querySelectorAll(".btn").forEach(function (btn) {
    btn.addEventListener("mousemove", function (e) {
      var r = btn.getBoundingClientRect();
      var x = e.clientX - r.left - r.width / 2;
      var y = e.clientY - r.top - r.height / 2;
      btn.style.transform = "translate(" + x * 0.15 + "px, " + y * 0.2 + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
    });
    btn.addEventListener("blur", function () {
      btn.style.transform = "";
    });
  });

  var glow = document.getElementById("cursorGlow");
  if (glow) {
    var x = -500, y = -500, tx = -500, ty = -500;
    window.addEventListener(
      "mousemove",
      function (e) {
        tx = e.clientX;
        ty = e.clientY;
        glow.style.opacity = 1;
      },
      { passive: true }
    );
    window.addEventListener("mouseleave", function () {
      glow.style.opacity = 0;
    });
    (function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      glow.style.left = x + "px";
      glow.style.top = y + "px";
      requestAnimationFrame(loop);
    })();
  }
})();

// ---------------------------------------------------------------------------
// Back to top
// ---------------------------------------------------------------------------
(function () {
  var btn = document.getElementById("backToTop");
  if (!btn) return;
  btn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion.matches ? "auto" : "smooth"
    });
    var logo = document.querySelector(".nav-logo");
    if (logo) logo.focus({ preventScroll: true });
  });
})();

// ---------------------------------------------------------------------------
// Hero terminal parallax
// ---------------------------------------------------------------------------
(function () {
  var term = document.querySelector(".hero-terminal");
  if (!term || reduceMotion.matches) return;
  var ticking = false;

  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var y = window.scrollY;
        if (y < window.innerHeight) term.style.translate = "0 " + y * 0.08 + "px";
      });
    },
    { passive: true }
  );
})();

// ---------------------------------------------------------------------------
// Obfuscated email
//
// The address is stored reversed so it is not sitting in the markup as plain
// text. This only stops scrapers that don't execute JS — it is a speed bump,
// not a control. The anchor ships with no href and hidden, so a JS-less visitor
// gets the <noscript> fallback rather than a dead link that jumps to the top.
// ---------------------------------------------------------------------------
(function () {
  function decode(s) {
    return s.split("").reverse().join("");
  }

  document.querySelectorAll("[data-e]").forEach(function (el) {
    var email = decode(el.getAttribute("data-e"));

    if (el.tagName === "A") {
      el.setAttribute("href", "mailto:" + email);
      el.hidden = false;
      var span = el.querySelector(".obf-email");
      if (span) span.textContent = email;
    } else {
      el.textContent = email;
    }
  });
})();

// ---------------------------------------------------------------------------
// Stagger reveal delays within groups
// ---------------------------------------------------------------------------
(function () {
  if (reduceMotion.matches) return;
  var groups = ".skills-grid, .projects-grid, .certs-grid, .timeline, .contact-links, .posts-list";
  document.querySelectorAll(groups).forEach(function (group) {
    group.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (i % 5) * 0.08 + "s";
    });
  });
})();
