/*
 * Mohamad Azmi — site behaviour
 *
 *  - Every feature null-guards its elements, so this one file serves both the
 *    home page and the article pages.
 *  - Scroll-driven work shares ONE passive listener batched into a rAF.
 *  - Motion is gated on prefers-reduced-motion. CSS collapses durations;
 *    anything JS-driven (globe spin, patch waves, pinned gallery) opts out here.
 *  - No inline styles are written as attributes (the CSP forbids them);
 *    only CSS custom properties through the CSSOM.
 */
(function () {
  "use strict";

  var root = document.documentElement;
  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function reduced() { return mqReduce.matches; }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ------------------------------------------------------------------------
     Shared scroll / resize scheduler
     ------------------------------------------------------------------------ */
  var scrollFns = [];
  var resizeFns = [];
  var ticking = false;

  function runScroll() {
    ticking = false;
    var y = window.scrollY;
    for (var i = 0; i < scrollFns.length; i++) scrollFns[i](y);
  }
  function requestScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(runScroll);
    }
  }
  window.addEventListener("scroll", requestScroll, { passive: true });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      for (var i = 0; i < resizeFns.length; i++) resizeFns[i]();
      requestScroll();
    }, 120);
  });

  /* ------------------------------------------------------------------------
     1. Fleet globe — 121 nodes on a sphere, patched in waves of 20%.
     An illustration of `serial: 20%`, not live data; the caption says so.
     ------------------------------------------------------------------------ */
  function initFleet() {
    var canvas = $("#fleet");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var N = 121;
    var BATCH = Math.ceil(N * 0.2);
    var WAVES = Math.ceil(N / BATCH);
    var nodes = [];
    var golden = Math.PI * (3 - Math.sqrt(5));
    var i, j;

    for (i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(1 - y * y);
      var t = golden * i;
      nodes.push({
        x: Math.cos(t) * r, y: y, z: Math.sin(t) * r,
        hit: Infinity, from: 0, parent: -1, patched: false, resetAt: Infinity,
        sx: 0, sy: 0, d: 0, s: 1
      });
    }

    // Lattice: connect every node to its 4 nearest neighbours.
    var adj = nodes.map(function () { return []; });
    var edges = [];
    var seenEdge = {};
    for (i = 0; i < N; i++) {
      var dists = [];
      for (j = 0; j < N; j++) {
        if (i === j) continue;
        var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dz = nodes[i].z - nodes[j].z;
        dists.push([dx * dx + dy * dy + dz * dz, j]);
      }
      dists.sort(function (p, q) { return p[0] - q[0]; });
      for (var k = 0; k < 4; k++) {
        j = dists[k][1];
        var key = i < j ? i + "-" + j : j + "-" + i;
        if (!seenEdge[key]) {
          seenEdge[key] = true;
          edges.push([i, j]);
          adj[i].push(j);
          adj[j].push(i);
        }
      }
    }

    function sprite(rgb) {
      var c = document.createElement("canvas");
      c.width = c.height = 64;
      var g = c.getContext("2d");
      var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(" + rgb + ",1)");
      gr.addColorStop(0.16, "rgba(" + rgb + ",0.9)");
      gr.addColorStop(0.42, "rgba(" + rgb + ",0.2)");
      gr.addColorStop(1, "rgba(" + rgb + ",0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
      return c;
    }
    var SPR_IDLE = sprite("150,160,186");
    var SPR_DONE = sprite("94,234,212");
    var SPR_HOT = sprite("236,255,250");
    var SPR_SAT = sprite("196,161,255");

    var W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(rect.width * dpr));
      H = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = W;
      canvas.height = H;
      R = Math.min(W, H) * 0.33;
      cx = W / 2;
      cy = H / 2;
      if (!running) draw(performance.now());
    }

    // Camera
    var yaw = 0.6, vel = 0, pitch = 0.36, pitchTarget = 0.36;
    var hoverYaw = 0, hoverYawTarget = 0, hoverPitch = 0, hoverPitchTarget = 0;
    var cosY, sinY, cosP, sinP;
    var CAM = 3.2;

    function setCamera() {
      var yy = yaw + hoverYaw, pp = pitch + hoverPitch;
      cosY = Math.cos(yy); sinY = Math.sin(yy);
      cosP = Math.cos(pp); sinP = Math.sin(pp);
    }
    // Returns [screenX, screenY, depth 0(back)..1(front), scale]
    function project(x, y, z, out) {
      var x1 = x * cosY - z * sinY;
      var z1 = x * sinY + z * cosY;
      var y2 = y * cosP - z1 * sinP;
      var z2 = y * sinP + z1 * cosP;
      var s = CAM / (CAM + z2);
      out[0] = cx + x1 * R * s;
      out[1] = cy + y2 * R * s;
      out[2] = (1 - z2) / 2;
      out[3] = s;
      return out;
    }

    /* Patch-wave state machine */
    var phase = "idle", phaseUntil = 0, waveNo = 0, waveNodes = [];

    function patchedCount() {
      var c = 0;
      for (var n = 0; n < N; n++) if (nodes[n].patched) c++;
      return c;
    }

    function startWave(now) {
      var pending = [];
      for (var n = 0; n < N; n++) if (!nodes[n].patched && nodes[n].hit === Infinity) pending.push(n);
      if (!pending.length) return false;

      var seed = pending[Math.floor(Math.random() * pending.length)];
      var order = [], queue = [seed], seen = {};
      seen[seed] = true;
      nodes[seed].parent = -1;
      while (queue.length && order.length < BATCH) {
        var cur = queue.shift();
        if (!nodes[cur].patched && nodes[cur].hit === Infinity) order.push(cur);
        for (var a = 0; a < adj[cur].length; a++) {
          var nx = adj[cur][a];
          if (!seen[nx]) {
            seen[nx] = true;
            nodes[nx].parent = cur;
            queue.push(nx);
          }
        }
      }
      for (var o = 0; o < order.length; o++) {
        var nd = nodes[order[o]];
        nd.hit = now + 250 + o * 75;
        var p = nd.parent >= 0 ? nodes[nd.parent] : null;
        nd.from = p && p.hit !== Infinity && p.hit < nd.hit ? p.hit : nd.hit - 300;
      }
      waveNodes = order;
      waveNo++;
      phase = "wave";
      return true;
    }

    function step(now) {
      var n, nd;
      for (n = 0; n < N; n++) {
        nd = nodes[n];
        if (!nd.patched && now > nd.hit + 650) nd.patched = true;
        if (nd.resetAt !== Infinity && now >= nd.resetAt) {
          nd.patched = false;
          nd.hit = Infinity;
          nd.resetAt = Infinity;
        }
      }
      if (phase === "idle" && now >= phaseUntil) {
        if (!startWave(now)) phase = "hold";
      } else if (phase === "wave") {
        var last = waveNodes.length ? nodes[waveNodes[waveNodes.length - 1]].hit : now;
        if (now > last + 700) {
          if (patchedCount() >= N) {
            phase = "hold";
            phaseUntil = now + 2800;
          } else {
            phase = "idle";
            phaseUntil = now + 900;
          }
        }
      } else if (phase === "hold" && now >= phaseUntil) {
        // Next patch cycle: the fleet drifts back to "pending", top to bottom.
        for (n = 0; n < N; n++) nodes[n].resetAt = now + ((1 - nodes[n].y) / 2) * 1100;
        phase = "reset";
        phaseUntil = now + 1700;
      } else if (phase === "reset" && now >= phaseUntil) {
        waveNo = 0;
        phase = "idle";
        phaseUntil = now + 600;
      }
    }

    var P = [0, 0, 0, 0], Q = [0, 0, 0, 0];
    var drawOrder = nodes.map(function (_, n) { return n; });

    function drawRing(radius, tiltX, tiltZ, spin, rgb, alpha, satellite) {
      var segs = 96, prev = null, cxx = Math.cos(tiltX), sxx = Math.sin(tiltX), czz = Math.cos(tiltZ), szz = Math.sin(tiltZ);
      ctx.lineWidth = 1 * dpr;
      for (var s = 0; s <= segs; s++) {
        var a = (s / segs) * Math.PI * 2;
        var x = Math.cos(a) * radius, z = Math.sin(a) * radius;
        var y1 = -z * sxx, z1 = z * cxx;
        var x2 = x * czz - y1 * szz, y2 = x * szz + y1 * czz;
        project(x2, y2, z1, P);
        if (prev) {
          var depth = (P[2] + prev[2]) / 2;
          ctx.strokeStyle = "rgba(" + rgb + "," + (alpha * (0.15 + depth * 0.85)).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(prev[0], prev[1]);
          ctx.lineTo(P[0], P[1]);
          ctx.stroke();
        }
        prev = [P[0], P[1], P[2]];
      }
      if (satellite) {
        var sa = spin;
        var sx = Math.cos(sa) * radius, sz = Math.sin(sa) * radius;
        var sy1 = -sz * sxx, sz1 = sz * cxx;
        project(sx * czz - sy1 * szz, sx * szz + sy1 * czz, sz1, P);
        var size = (10 + P[2] * 10) * dpr;
        ctx.globalAlpha = 0.35 + P[2] * 0.65;
        ctx.drawImage(SPR_SAT, P[0] - size / 2, P[1] - size / 2, size, size);
        ctx.globalAlpha = 1;
      }
    }

    function draw(now) {
      setCamera();
      ctx.clearRect(0, 0, W, H);

      var n, nd;
      for (n = 0; n < N; n++) {
        nd = nodes[n];
        project(nd.x, nd.y, nd.z, P);
        nd.sx = P[0]; nd.sy = P[1]; nd.d = P[2]; nd.s = P[3];
      }

      // Orbit rings sit behind and in front of the sphere.
      var spin = now * 0.00018;
      drawRing(1.42, 1.15, 0.35, spin, "129,140,248", 0.32, true);
      drawRing(1.2, 1.45, -0.55, -spin * 1.4 + 2, "94,234,212", 0.22, true);

      // Lattice
      ctx.lineWidth = 1 * dpr;
      for (var e = 0; e < edges.length; e++) {
        var a = nodes[edges[e][0]], b = nodes[edges[e][1]];
        var depth = (a.d + b.d) / 2;
        var both = a.patched && b.patched;
        var alpha = (both ? 0.1 : 0.045) + depth * (both ? 0.32 : 0.16);
        ctx.strokeStyle = both ? "rgba(94,234,212," + alpha.toFixed(3) + ")" : "rgba(170,180,205," + alpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();
      }

      // Packets travelling along the wave's spanning tree
      for (var w = 0; w < waveNodes.length; w++) {
        nd = nodes[waveNodes[w]];
        if (nd.parent < 0 || now < nd.from || now > nd.hit) continue;
        var par = nodes[nd.parent];
        var tt = (now - nd.from) / Math.max(1, nd.hit - nd.from);
        var px = par.sx + (nd.sx - par.sx) * tt, py = par.sy + (nd.sy - par.sy) * tt;
        var ps = (9 + nd.d * 8) * dpr;
        ctx.strokeStyle = "rgba(94,234,212," + (0.25 + nd.d * 0.5).toFixed(3) + ")";
        ctx.lineWidth = 1.5 * dpr;
        ctx.beginPath();
        ctx.moveTo(par.sx, par.sy);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.drawImage(SPR_HOT, px - ps / 2, py - ps / 2, ps, ps);
      }

      // Nodes, back to front — additive blending so overlapping glows bloom
      ctx.globalCompositeOperation = "lighter";
      drawOrder.sort(function (p, q) { return nodes[p].d - nodes[q].d; });
      for (var o = 0; o < N; o++) {
        nd = nodes[drawOrder[o]];
        var dd = nd.d;
        var hot = now >= nd.hit && now <= nd.hit + 650;
        var base = (nd.patched || hot ? 18 : 11) * nd.s * dpr;
        var size = base * (0.7 + dd * 0.6);
        ctx.globalAlpha = 0.22 + dd * 0.78;
        if (hot) {
          var k2 = (now - nd.hit) / 650;
          ctx.drawImage(SPR_DONE, nd.sx - size, nd.sy - size, size * 2, size * 2);
          ctx.drawImage(SPR_HOT, nd.sx - size * 0.7, nd.sy - size * 0.7, size * 1.4, size * 1.4);
          ctx.strokeStyle = "rgba(94,234,212," + ((1 - k2) * 0.8).toFixed(3) + ")";
          ctx.lineWidth = 1.2 * dpr;
          ctx.beginPath();
          ctx.arc(nd.sx, nd.sy, size * (0.4 + k2 * 1.6), 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.drawImage(nd.patched ? SPR_DONE : SPR_IDLE, nd.sx - size / 2, nd.sy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // HUD
      var fs = Math.round(11 * dpr);
      ctx.font = "500 " + fs + "px 'Geist Mono', ui-monospace, monospace";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "rgba(160,168,185,0.85)";
      var pad = 14 * dpr;
      var done = patchedCount();
      ctx.fillText("serial: 20%", pad, pad + fs);
      var waveLabel = phase === "reset" || phase === "hold" && done >= N ? "cycle complete" : "wave " + Math.max(1, Math.min(waveNo, WAVES)) + "/" + WAVES;
      ctx.fillStyle = "rgba(94,234,212,0.9)";
      ctx.fillText(waveLabel, pad, pad + fs * 2.5);
      var label = "patched " + done + " / " + N;
      ctx.fillStyle = "rgba(160,168,185,0.85)";
      ctx.fillText(label, W - pad - ctx.measureText(label).width, H - pad);
    }

    /* Interaction */
    var dragging = false, lastX = 0, lastY = 0;
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      vel = 0;
      canvas.classList.add("is-dragging");
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      yaw += dx * 0.006;
      vel = dx * 0.006;
      pitchTarget = clamp(pitchTarget + dy * 0.004, -0.9, 0.9);
      if (!running) draw(performance.now());
    });
    function endDrag() {
      dragging = false;
      canvas.classList.remove("is-dragging");
    }
    canvas.addEventListener("pointerup", endDrag);
    canvas.addEventListener("pointercancel", endDrag);

    if (finePointer && !reduced()) {
      window.addEventListener("pointermove", function (e) {
        if (dragging) return;
        hoverYawTarget = (e.clientX / window.innerWidth - 0.5) * 0.5;
        hoverPitchTarget = (e.clientY / window.innerHeight - 0.5) * 0.3;
      }, { passive: true });
    }

    /* Loop — only while on screen and the tab is visible */
    var running = false, inView = true, last = 0;

    function frame(now) {
      if (!running) return;
      var dt = Math.min(64, now - (last || now));
      last = now;
      var f = dt / 16.67;

      if (!dragging) {
        yaw += (0.0022 * f) + vel;
        vel *= Math.pow(0.93, f);
      }
      pitch += (pitchTarget - pitch) * 0.06 * f;
      hoverYaw += (hoverYawTarget - hoverYaw) * 0.05 * f;
      hoverPitch += (hoverPitchTarget - hoverPitch) * 0.05 * f;

      step(now);
      draw(now);
      requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduced() || !inView || document.hidden) return;
      running = true;
      last = 0;
      requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      resizeFns.push(resize);
    }
    resize();

    if (reduced()) {
      // A still frame: fully patched fleet, no spin, no waves.
      for (i = 0; i < N; i++) nodes[i].patched = true;
      phase = "hold";
      phaseUntil = Infinity;
      draw(performance.now());
    } else {
      phaseUntil = performance.now() + 900;
      start();
    }
  }

  /* ------------------------------------------------------------------------
     2. Navigation — scrolled state, hide on scroll down, mobile menu,
        active section highlight
     ------------------------------------------------------------------------ */
  function initNav() {
    var nav = $("#nav");
    if (!nav) return;

    var toggle = $("#navToggle");
    var menu = $("#mobileMenu");
    var menuOpen = false;
    var lastY = window.scrollY;

    scrollFns.push(function (y) {
      nav.classList.toggle("is-scrolled", y > 40);
      if (menuOpen || y < 160) {
        nav.classList.remove("is-hidden");
      } else if (y > lastY + 6) {
        nav.classList.add("is-hidden");
      } else if (y < lastY - 6) {
        nav.classList.remove("is-hidden");
      }
      lastY = y;
    });
    nav.addEventListener("focusin", function () { nav.classList.remove("is-hidden"); });

    if (toggle && menu) {
      var links = $$("a", menu);

      var setMenu = function (open) {
        menuOpen = open;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        root.classList.toggle("menu-open", open);
        if (open) {
          menu.hidden = false;
          nav.classList.remove("is-hidden");
          requestAnimationFrame(function () {
            menu.classList.add("is-open");
            if (links[0]) links[0].focus({ preventScroll: true });
          });
        } else {
          menu.classList.remove("is-open");
          setTimeout(function () { if (!menuOpen) menu.hidden = true; }, 400);
        }
      };

      toggle.addEventListener("click", function () { setMenu(!menuOpen); });
      links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

      document.addEventListener("keydown", function (e) {
        if (!menuOpen) return;
        if (e.key === "Escape") {
          setMenu(false);
          toggle.focus();
        } else if (e.key === "Tab") {
          // Keep focus inside [toggle, ...links] while the menu covers the page.
          var ring = [toggle].concat(links);
          var idx = ring.indexOf(document.activeElement);
          if (e.shiftKey && idx <= 0) {
            e.preventDefault();
            ring[ring.length - 1].focus();
          } else if (!e.shiftKey && idx === ring.length - 1) {
            e.preventDefault();
            ring[0].focus();
          }
        }
      });

      resizeFns.push(function () { if (menuOpen && window.innerWidth > 960) setMenu(false); });
    }

    // Active link: whichever section crosses the middle of the viewport.
    var map = { work: "work", projects: "work", writing: "writing", experience: "experience", skills: "skills", about: "about", certifications: "about" };
    var navLinks = $$(".nav-link");
    if ("IntersectionObserver" in window && navLinks.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var target = map[entry.target.id] || "";
          navLinks.forEach(function (l) {
            var on = l.getAttribute("href") === "#" + target;
            l.classList.toggle("is-active", on);
            if (on) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current");
          });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $$("section[id]").forEach(function (s) { io.observe(s); });
    }
  }

  /* ------------------------------------------------------------------------
     3. Scroll progress + aurora drift
     ------------------------------------------------------------------------ */
  function initProgress() {
    var bar = $("#progress");
    scrollFns.push(function (y) {
      var range = root.scrollHeight - window.innerHeight;
      var p = range > 0 ? clamp(y / range, 0, 1) : 0;
      if (bar) bar.style.setProperty("--p", p.toFixed(4));
      root.style.setProperty("--sp", p.toFixed(4));
    });
  }

  /* ------------------------------------------------------------------------
     4. Split headings into words
     ------------------------------------------------------------------------ */
  function initSplit() {
    $$(".split").forEach(function (el) {
      var label = el.textContent.replace(/\s+/g, " ").trim();
      var idx = 0;
      var frag = document.createDocumentFragment();

      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(" "));
              return;
            }
            var w = document.createElement("span");
            w.className = "w";
            var inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", idx++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
        } else if (node.nodeType === 1) {
          // The italic accent stays whole so its gradient runs unbroken.
          node.style.setProperty("--i", idx++);
          frag.appendChild(node);
        }
      });

      var holder = document.createElement("span");
      holder.setAttribute("aria-hidden", "true");
      holder.appendChild(frag);
      el.textContent = "";
      el.appendChild(holder);
      el.setAttribute("aria-label", label);
    });
  }

  /* ------------------------------------------------------------------------
     5. Reveal on scroll (+ count-up numbers)
     ------------------------------------------------------------------------ */
  function countUp(el) {
    var counter = $(".count", el);
    if (!counter || counter.dataset.done) return;
    counter.dataset.done = "1";
    var to = parseInt(counter.dataset.to, 10);
    if (isNaN(to) || reduced()) return;
    var start = performance.now(), dur = 1600;
    (function tick(now) {
      var t = clamp((now - start) / dur, 0, 1);
      var eased = 1 - Math.pow(2, -10 * t);
      counter.textContent = Math.round(to * (t === 1 ? 1 : eased));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  function initReveal() {
    var targets = $$(".reveal, .split");

    // Stagger siblings inside grids and lists.
    [".numbers-grid", ".bento", ".certs", ".timeline"].forEach(function (sel) {
      $$(sel).forEach(function (group) {
        $$(".reveal", group).forEach(function (el, n) {
          el.style.setProperty("--delay", ((n % 6) * 70) + "ms");
        });
      });
    });

    function show(el) {
      el.classList.add("in");
      if (el.classList.contains("num")) countUp(el);
    }

    if (reduced() || !("IntersectionObserver" in window)) {
      targets.forEach(show);
      return;
    }

    // Counters start from zero only when JS will animate them.
    $$(".num .count").forEach(function (c) { c.textContent = "0"; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });

    // Browsers throttle IntersectionObserver in background tabs; sweep
    // whatever is already on screen once the page settles or regains focus.
    function sweep() {
      targets.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          show(el);
          io.unobserve(el);
        }
      });
    }
    window.addEventListener("load", function () { setTimeout(sweep, 500); });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) setTimeout(sweep, 120);
    });
  }

  /* ------------------------------------------------------------------------
     6. 3D tilt + glare
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (!finePointer || reduced()) return;
    $$("[data-tilt]").forEach(function (el) {
      var max = parseFloat(el.getAttribute("data-tilt-max")) || 6;
      var raf = 0, px = 0.5, py = 0.5;

      function apply() {
        raf = 0;
        el.style.setProperty("--rx", ((0.5 - py) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--ry", ((px - 0.5) * max * 2).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      }
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        px = clamp((e.clientX - r.left) / r.width, 0, 1);
        py = clamp((e.clientY - r.top) / r.height, 0, 1);
        el.classList.add("is-tilting");
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tilting");
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ------------------------------------------------------------------------
     7. Project gallery — pinned horizontal flow with a 3D coverflow curve
     ------------------------------------------------------------------------ */
  function initGallery() {
    var section = $("#projects");
    var pin = $("#galleryPin");
    var track = $("#galleryTrack");
    var viewport = $("#galleryViewport");
    if (!section || !pin || !track) return;

    var cards = $$(".g-card", track);
    var wide = window.matchMedia("(min-width: 1024px)");
    var enabled = false, dist = 0, pinTop = 0, trackLeft0 = 0, currentX = 0;
    var centers = [];

    function clearCards() {
      cards.forEach(function (c) {
        c.style.removeProperty("--tz");
        c.style.removeProperty("--cry");
        c.style.removeProperty("--co");
        c.style.removeProperty("--cg");
      });
    }

    function measure() {
      var want = wide.matches && !reduced();
      if (want !== enabled) {
        enabled = want;
        section.classList.toggle("is-pinned", enabled);
        if (viewport) viewport.tabIndex = enabled ? -1 : 0;
        if (!enabled) {
          track.style.removeProperty("--x");
          pin.style.removeProperty("--pin-h");
          clearCards();
          currentX = 0;
        }
      }
      if (!enabled) return;

      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      pin.style.setProperty("--pin-h", (window.innerHeight + dist) + "px");
      pinTop = pin.getBoundingClientRect().top + window.scrollY;
      trackLeft0 = track.getBoundingClientRect().left - currentX;
      // Card centres measured within the track, so the cards' own 3D transforms don't skew them.
      centers = cards.map(function (c) { return c.offsetLeft - track.offsetLeft + c.offsetWidth / 2; });
      update(window.scrollY);
    }

    function update(y) {
      if (!enabled) return;
      var p = dist > 0 ? clamp((y - pinTop) / dist, 0, 1) : 0;
      currentX = -p * dist;
      track.style.setProperty("--x", currentX.toFixed(1) + "px");

      var mid = window.innerWidth / 2;
      for (var i = 0; i < cards.length; i++) {
        var centre = trackLeft0 + centers[i] + currentX;
        var d = (centre - mid) / window.innerWidth;
        cards[i].style.setProperty("--cry", clamp(-d * 30, -34, 34).toFixed(2) + "deg");
        cards[i].style.setProperty("--tz", (-Math.abs(d) * 240).toFixed(1) + "px");
        cards[i].style.setProperty("--co", clamp(1 - Math.abs(d) * 0.7, 0.3, 1).toFixed(3));
        cards[i].style.setProperty("--cg", clamp(1 - Math.abs(d) * 3.2, 0, 1).toFixed(3));
      }
    }

    scrollFns.push(update);
    resizeFns.push(measure);
    if (wide.addEventListener) wide.addEventListener("change", measure);
    if (mqReduce.addEventListener) mqReduce.addEventListener("change", measure);
    window.addEventListener("load", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    // Anything that changes the page's size (late fonts, images, a viewport
    // change that fires no resize event) moves the pin, so re-measure.
    if ("ResizeObserver" in window) {
      var roTimer, lastW = 0, lastH = 0;
      new ResizeObserver(function () {
        var w = window.innerWidth, h = root.scrollHeight;
        if (w === lastW && h === lastH) return;
        lastW = w;
        lastH = h;
        clearTimeout(roTimer);
        roTimer = setTimeout(function () {
          measure();
          lastH = root.scrollHeight;
        }, 150);
      }).observe(document.body);
    }
    measure();
  }

  /* ------------------------------------------------------------------------
     8. Timeline line that draws itself
     ------------------------------------------------------------------------ */
  function initTimeline() {
    var wrap = $("#timeline");
    var fill = $("#tlFill");
    if (!wrap || !fill) return;
    var roles = $$(".role", wrap);

    if (reduced()) {
      wrap.style.setProperty("--tl", "1");
      roles.forEach(function (r) { r.classList.add("is-reached"); });
      return;
    }

    scrollFns.push(function () {
      var r = wrap.getBoundingClientRect();
      var line = window.innerHeight * 0.62;
      var p = clamp((line - r.top) / r.height, 0, 1);
      wrap.style.setProperty("--tl", p.toFixed(4));
      for (var i = 0; i < roles.length; i++) {
        roles[i].classList.toggle("is-reached", roles[i].getBoundingClientRect().top < line);
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. Email — assembled here so it never sits in the markup as plain text.
        A scraper speed bump, not a security control.
     ------------------------------------------------------------------------ */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-shown"); }, 2200);
  }

  function initEmail() {
    var link = $("#emailLink");
    var row = $("#emailRow");
    if (!link || !row) return;
    var email = link.getAttribute("data-e").split("").reverse().join("");
    link.setAttribute("href", "mailto:" + email);
    var text = $("#emailText");
    if (text) text.textContent = email;
    row.hidden = false;

    var copy = $("#copyEmail");
    if (copy) {
      copy.addEventListener("click", function () {
        var done = function () {
          copy.classList.add("is-copied");
          toast("Email address copied");
          setTimeout(function () { copy.classList.remove("is-copied"); }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(done, function () { toast(email); });
        } else {
          toast(email);
        }
      });
    }
  }

  /* ------------------------------------------------------------------------
     10. Local time in Klang, and the footer year
     ------------------------------------------------------------------------ */
  function initClock() {
    var el = $("#clock");
    if (el && window.Intl && Intl.DateTimeFormat) {
      var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit" });
      var tick = function () { el.textContent = fmt.format(new Date()) + " · MYT (UTC+8)"; };
      tick();
      setInterval(tick, 30000);
    }
    var year = $("#year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  /* ------------------------------------------------------------------------
     11. Starfield — twinkling, drifting stars with the odd shooting star.
         Parallax on pointer and scroll. A still frame under reduced motion.
     ------------------------------------------------------------------------ */
  function initSky() {
    var canvas = $("#sky");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var tints = ["255,255,255", "190,210,255", "150,240,225", "215,190,255"];
    var W = 0, H = 0, dpr = 1, stars = [];
    var px = 0, py = 0, tx = 0, ty = 0, sy = 0;
    var shoot = null, nextShoot = 0, running = false, last = 0, builtW = 0;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = canvas.width = Math.round(window.innerWidth * dpr);
      H = canvas.height = Math.round(window.innerHeight * dpr);
      // Phones fire resize every time the address bar slides in or out. Keep
      // the same stars unless the width really changed, or they'd re-shuffle.
      if (stars.length && window.innerWidth === builtW) {
        draw(performance.now());
        return;
      }
      builtW = window.innerWidth;
      var n = clamp(Math.round((window.innerWidth * window.innerHeight) / 9000), 40, 170);
      stars = [];
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75,
          r: 0.4 + Math.random() * 1.3, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.4,
          c: tints[i % tints.length]
        });
      }
      draw(performance.now());
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);
      var still = reduced();
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var tw = still ? 0.8 : 0.55 + 0.45 * Math.sin(now * 0.001 * s.s + s.p);
        var x = (((s.x * W + px * s.z * 34 * dpr) % W) + W) % W;
        var drift = still ? 0 : now * 0.004 * s.z * dpr;
        var y = (((s.y * H - sy * s.z * 0.12 * dpr - drift + py * s.z * 34 * dpr) % H) + H) % H;
        var r = s.r * s.z * dpr;
        ctx.fillStyle = "rgba(" + s.c + "," + (tw * (0.25 + s.z * 0.6)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fill();
        if (s.r > 1.3) {
          ctx.fillStyle = "rgba(" + s.c + "," + (tw * 0.1).toFixed(3) + ")";
          ctx.beginPath();
          ctx.arc(x, y, r * 4.5, 0, 6.2832);
          ctx.fill();
        }
      }
      if (shoot) {
        var t = (now - shoot.t0) / shoot.dur;
        if (t >= 1) {
          shoot = null;
        } else {
          var hx = shoot.x + shoot.dx * t, hy = shoot.y + shoot.dy * t;
          var len = 190 * dpr, m = Math.sqrt(shoot.dx * shoot.dx + shoot.dy * shoot.dy);
          var bx = hx - (shoot.dx / m) * len, by = hy - (shoot.dy / m) * len;
          var g = ctx.createLinearGradient(hx, hy, bx, by);
          g.addColorStop(0, "rgba(255,255,255," + (Math.sin(Math.PI * t) * 0.9).toFixed(3) + ")");
          g.addColorStop(0.3, "rgba(150,190,255," + (Math.sin(Math.PI * t) * 0.4).toFixed(3) + ")");
          g.addColorStop(1, "rgba(150,190,255,0)");
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.6 * dpr;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }
      }
    }

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (now - last < 33) return; // ~30fps is plenty for stars
      last = now;
      px += (tx - px) * 0.05;
      py += (ty - py) * 0.05;
      if (!shoot && now > nextShoot) {
        var dir = Math.random() < 0.5 ? 1 : -1;
        shoot = {
          t0: now, dur: 900 + Math.random() * 500,
          x: (0.15 + Math.random() * 0.7) * W, y: Math.random() * 0.4 * H,
          dx: dir * (0.25 + Math.random() * 0.2) * W, dy: (0.12 + Math.random() * 0.14) * H
        };
        nextShoot = now + 5000 + Math.random() * 7000;
      }
      draw(now);
    }
    function start() {
      if (running || reduced() || document.hidden) return;
      running = true;
      nextShoot = performance.now() + 2500;
      requestAnimationFrame(frame);
    }

    scrollFns.push(function (y) { sy = y; });
    resizeFns.push(build);
    if (finePointer) {
      window.addEventListener("pointermove", function (e) {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) running = false; else start();
    });
    build();
    start();
  }

  /* ------------------------------------------------------------------------
     12. Cursor light — a soft glow that trails the pointer behind the content
     ------------------------------------------------------------------------ */
  function initCursorGlow() {
    var el = $(".cursor-glow");
    if (!el || !finePointer || reduced()) return;
    var x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;

    function tick() {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.setProperty("--cx", x.toFixed(1) + "px");
      el.style.setProperty("--cy", y.toFixed(1) + "px");
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(tick) : 0;
    }
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!on) {
        on = true;
        x = tx;
        y = ty;
        el.classList.add("is-on");
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    root.addEventListener("pointerleave", function () {
      on = false;
      el.classList.remove("is-on");
    });
  }

  /* ------------------------------------------------------------------------
     13. Magnetic buttons — they lean a little toward the pointer
     ------------------------------------------------------------------------ */
  function initMagnetic() {
    if (!finePointer || reduced()) return;
    $$(".btn, .nav-cta").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.2).toFixed(1) + "px");
        el.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px");
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  /* ------------------------------------------------------------------------
     14. Section labels decode themselves as they scroll into view
     ------------------------------------------------------------------------ */
  function initScramble() {
    if (reduced() || !("IntersectionObserver" in window)) return;
    var glyphs = "01<>/\\_#%&*+=-";

    function run(node, txt) {
      var start = performance.now(), dur = 900;
      (function tick(now) {
        var t = clamp((now - start) / dur, 0, 1);
        var keep = Math.floor(t * txt.length);
        var out = txt.slice(0, keep);
        for (var i = keep; i < txt.length; i++) {
          out += txt[i] === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        node.textContent = t === 1 ? txt : out;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }

    var jobs = [];
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        for (var i = 0; i < jobs.length; i++) {
          if (jobs[i].el === entry.target) run(jobs[i].node, jobs[i].txt);
        }
      });
    }, { threshold: 0.6 });

    $$(".eyebrow").forEach(function (el) {
      var node = el.lastChild;
      if (node && node.nodeType === 3 && node.textContent.trim()) {
        jobs.push({ el: el, node: node, txt: node.textContent });
        io.observe(el);
      }
    });
  }

  /* ------------------------------------------------------------------------
     15. Hero recedes as you scroll away from it
     ------------------------------------------------------------------------ */
  function initHeroScroll() {
    var hero = $("#top");
    if (!hero || reduced()) return;
    scrollFns.push(function (y) {
      hero.style.setProperty("--hs", clamp(y / (window.innerHeight * 0.9), 0, 1).toFixed(3));
    });
  }

  initSplit();
  initFleet();
  initNav();
  initProgress();
  initReveal();
  initTilt();
  initGallery();
  initTimeline();
  initEmail();
  initClock();
  initSky();
  initCursorGlow();
  initMagnetic();
  initScramble();
  initHeroScroll();
  runScroll();
})();
