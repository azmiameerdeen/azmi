// Matrix code-rain background
(function () {
  const canvas = document.getElementById("matrix");
  const ctx = canvas.getContext("2d");
  const chars = "アカサタナハマヤラワ01アイウエオカキクケコサシスセソタチツテト";
  const fontSize = 15;
  let columns, drops;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    ctx.fillStyle = "rgba(5, 8, 15, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22d3ee";
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  setInterval(draw, 50);
})();

// Typing effect
(function () {
  const roles = [
    "Assistant Manager — IT/OT Infrastructure & Security",
    "IT Security Infrastructure Specialist",
    "Linux Engineer",
    "Systems Administrator",
    "Cybersecurity Enthusiast",
    "Cloud & Virtualization Specialist"
  ];
  const el = document.getElementById("typed");
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const current = roles[roleIndex];
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

// Navbar scroll state
(function () {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  });
})();

// Mobile nav toggle
(function () {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );
})();

// Scroll reveal
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
})();

// Animated counters
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const stat = entry.target;
        observer.unobserve(stat);
        const target = parseInt(stat.dataset.count, 10);
        const suffix = stat.dataset.suffix || "";
        const num = stat.querySelector(".num");
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const timer = setInterval(() => {
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
  document.querySelectorAll(".stat").forEach((el) => observer.observe(el));
})();

// Skill bars animation
(function () {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fill = entry.target;
        observer.unobserve(fill);
        fill.style.width = fill.dataset.width + "%";
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll(".bar-fill").forEach((el) => observer.observe(el));
})();

// 3D tilt on project cards
(function () {
  const cards = document.querySelectorAll(".tilt");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg)";
    });
  });
})();

// Scroll progress bar
(function () {
  const bar = document.getElementById("scrollProgress");
  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    bar.style.width = scrolled * 100 + "%";
  });
})();

// Back to top
(function () {
  const btn = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    btn.classList.toggle("show", window.scrollY > 500);
  });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();

// Cursor glow follow
(function () {
  const glow = document.getElementById("cursorGlow");
  let x = -500, y = -500, tx = -500, ty = -500;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    glow.style.opacity = 1;
  });
  window.addEventListener("mouseleave", () => { glow.style.opacity = 0; });
  function loop() {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.left = x + "px";
    glow.style.top = y + "px";
    requestAnimationFrame(loop);
  }
  loop();
})();

// Magnetic buttons
(function () {
  const btns = document.querySelectorAll(".btn");
  btns.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
})();

// Parallax on hero terminal
(function () {
  const term = document.querySelector(".hero-terminal");
  if (!term) return;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      term.style.setProperty("--par", y * 0.08 + "px");
      term.style.translate = "0 " + y * 0.08 + "px";
    }
  });
})();

// Active nav link on scroll
(function () {
  const sections = document.querySelectorAll("section[id], header[id]");
  const links = document.querySelectorAll(".nav-link");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((s) => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach((l) => {
      l.classList.toggle("active", l.getAttribute("href") === "#" + current);
    });
  });
})();

// Stagger reveal delays within groups
(function () {
  document.querySelectorAll(".skills-grid, .projects-grid, .certs-grid, .timeline, .contact-links").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((el, i) => {
      el.setAttribute("data-delay", (i % 5) + 1);
      el.style.transitionDelay = ((i % 5) * 0.08) + "s";
    });
  });
})();

// Visitor counter (free API, no database)
(function () {
  const el = document.getElementById("visitCount");
  if (!el) return;
  fetch("https://api.counterapi.dev/v1/azmi-blog/visits/up")
    .then((r) => r.json())
    .then((d) => {
      el.textContent = (d && d.count !== undefined) ? d.count : "—";
    })
    .catch(() => {
      el.textContent = "—";
    });
})();
