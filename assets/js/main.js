/**
 * Mohamad Azmi — Executive IT/OT Infrastructure & Security Portfolio
 * Dynamic Interactive Systems, Telemetry & Cyber Defense Deck
 */

(() => {
  'use strict';

  // Motion preference detection
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = motionQuery.matches;
  motionQuery.addEventListener('change', e => { isReducedMotion = e.matches; });

  /* ==========================================================================
     01. Interactive Cyber Constellation & Lattice Canvas
     ========================================================================== */
  const initCyberCanvas = () => {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || isReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animationFrameId;
    let isVisible = true;

    // Node particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 75);
    const particles = [];
    const mouse = { x: -1000, y: -1000, radius: 140 };

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = (Math.random() - 0.5) * 0.45;
        this.radius = Math.random() * 1.6 + 0.8;
        this.baseColor = Math.random() > 0.3 ? 'rgba(6, 182, 212,' : 'rgba(16, 185, 129,';
        this.alpha = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Subtle mouse repulsion
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const angle = Math.atan2(dy, dx);
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= Math.cos(angle) * force * 1.5;
          this.y -= Math.sin(angle) * force * 1.5;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${this.baseColor}${this.alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const connect = () => {
      const maxDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = (1 - dist / maxDistance) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      if (!isVisible) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connect();

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
      if (isVisible) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animate);
      }
    });

    animate();
  };

  /* ==========================================================================
     02. Typewriter Effect (Hero Title)
     ========================================================================== */
  const initTypewriter = () => {
    const el = document.getElementById('typewriterText');
    if (!el) return;

    const phrases = [
      'Linux Systems Engineering & Hardening',
      'IT/OT Infrastructure & Zero-Downtime Ops',
      'Ansible Fleet Automation (121 Nodes)',
      'ISO 27001 Compliance & CAB Governance',
      'Enterprise Virtualization & Cloud Estates',
      'FortiGate Firewalls & SOC Incident Defense'
    ];

    if (isReducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 65;
    const deletingSpeed = 35;
    const pauseEnd = 2400;
    const pauseStart = 400;

    const type = () => {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        el.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        el.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      let timeout = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentPhrase.length) {
        timeout = pauseEnd;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        timeout = pauseStart;
      }

      setTimeout(type, timeout);
    };

    setTimeout(type, 600);
  };

  /* ==========================================================================
     03. Topology Map Layer Switcher & Node Inspector
     ========================================================================== */
  const initTopology = () => {
    const heroDeck = document.querySelector('.hero-deck');
    const layerButtons = document.querySelectorAll('.layer-btn');
    const tooltipTitle = document.getElementById('tooltipTitle');
    const tooltipDesc = document.getElementById('tooltipDesc');
    const nodes = document.querySelectorAll('.node-group, .core-group');

    const telemetryData = {
      core: {
        title: 'Core Orchestration & CAB Governance',
        desc: 'Change Advisory Board approval gates, Ansible automation engine & ISO 27001 audit logging.'
      },
      linux: {
        title: 'Linux & Unix Production Clusters',
        desc: 'RHEL 7/8 TOS production servers, Debian, SLES, AIX 7.1-7.3 with SELinux & kernel hardening.'
      },
      virt: {
        title: 'Hypervisors & HCI Infrastructure',
        desc: 'VMware vSphere clusters, Nutanix HCI, Proxmox VE, Hyper-V with hardened golden VM templates.'
      },
      cloud: {
        title: 'Enterprise Hybrid Cloud & Edge',
        desc: 'Azure, AWS, Alibaba Cloud, IP ServerOne & Cloudflare CDN/WAF distributed perimeter defense.'
      },
      ot: {
        title: 'OT Networks & Port Logistics Systems',
        desc: 'Terminal Operating Systems (TOS), industrial CCTV media streams, segregated SCADA/OT network zones.'
      },
      sec: {
        title: 'Cyber Defense & Network Perimeter',
        desc: 'FortiGate HA firewalls, FortiADC L4/L7 load balancers, SOC-as-a-Service, Wazuh SIEM & Trend Micro Vision One.'
      }
    };

    const layerCaptions = {
      infra: {
        title: '01 // IT/OT INFRASTRUCTURE TOPOLOGY',
        desc: 'Physical, virtual & cloud fabrics connected with redundant failover across Westports estate.'
      },
      security: {
        title: '02 // ZERO-TRUST DEFENSE & GOVERNANCE',
        desc: 'FortiGate perimeter, isolated OT demilitarized zones, SIEM threat ingestion & ISO 27001 CAB rigor.'
      },
      automation: {
        title: '03 // FLEET AUTOMATION & ORCHESTRATION',
        desc: '121 production Linux servers orchestrated with scheduled playbooks, dry-run guards & real-time telemetry.'
      }
    };

    if (layerButtons.length > 0 && heroDeck) {
      layerButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const layer = btn.getAttribute('data-layer');
          heroDeck.setAttribute('data-layer', layer);

          layerButtons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          if (layerCaptions[layer] && tooltipTitle && tooltipDesc) {
            tooltipTitle.textContent = layerCaptions[layer].title;
            tooltipDesc.textContent = layerCaptions[layer].desc;
          }
        });
      });
    }

    nodes.forEach(node => {
      node.addEventListener('mouseenter', () => {
        const key = node.getAttribute('data-node');
        if (key && telemetryData[key] && tooltipTitle && tooltipDesc) {
          tooltipTitle.textContent = telemetryData[key].title;
          tooltipDesc.textContent = telemetryData[key].desc;
        }
      });
    });
  };

  /* ==========================================================================
     04. Mini Terminal Drawer
     ========================================================================== */
  const initTerminal = () => {
    const screen = document.getElementById('terminalScreen');
    const cmdPills = document.querySelectorAll('.cmd-pill');
    if (!screen || cmdPills.length === 0) return;

    const commandOutputs = {
      'specs': [
        '<span class="t-prompt">azmi@westports-core:~$</span> cat specs.json',
        '<span class="t-res">{</span>',
        '<span class="t-res">&nbsp;&nbsp;"estate": "Westports IT/OT Production",</span>',
        '<span class="t-res">&nbsp;&nbsp;"automated_nodes": 121,</span>',
        '<span class="t-res">&nbsp;&nbsp;"compliance": "ISO/IEC 27001 Certified",</span>',
        '<span class="t-res ok">&nbsp;&nbsp;"patch_status": "UP-TO-DATE (Zero Outage)"</span>',
        '<span class="t-res">}</span>'
      ],
      'uptime': [
        '<span class="t-prompt">azmi@westports-core:~$</span> uptime',
        '<span class="t-res ok">12:52:00 up 12+ years in production, load average: 0.12, 0.08, 0.05</span>',
        '<span class="t-res">0 critical incidents unmitigated. Systems nominal.</span>'
      ],
      'ansible': [
        '<span class="t-prompt">azmi@westports-core:~$</span> ansible-playbook patch_fleet.yml --check',
        '<span class="t-res">[PLAY: Patch Cycle Validation - 121 Hosts]</span>',
        '<span class="t-res">TASK [Gathering Facts] ................................. ok: [121/121]</span>',
        '<span class="t-res">TASK [Verify Disk /tmp & /var Space] ................... ok: [121/121]</span>',
        '<span class="t-res ok">PLAY RECAP: 121 nodes verified safe. Dry-run PASS. Mutex locked.</span>'
      ],
      'whoami': [
        '<span class="t-prompt">azmi@westports-core:~$</span> whoami --details',
        '<span class="t-res">Mohamad Azmi Bin Seeni Ameerdeen</span>',
        '<span class="t-res">Role: Assistant Manager — IT/OT Infrastructure & Security</span>',
        '<span class="t-res">Entity: Westports Malaysia · Klang, Selangor</span>',
        '<span class="t-res ok">Access Clearance: CAB Member / Root System Architect</span>'
      ],
      'cab': [
        '<span class="t-prompt">azmi@westports-core:~$</span> cab-review --status',
        '<span class="t-res">[CHANGE ADVISORY BOARD REGISTER]</span>',
        '<span class="t-res">CR-2026-8814: RHEL Kernel Patch & FortiGate Policy Cutover</span>',
        '<span class="t-res ok">STATUS: APPROVED & SIGNED (Rollback Plan Validated)</span>'
      ]
    };

    cmdPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const cmdKey = pill.getAttribute('data-cmd');
        if (commandOutputs[cmdKey]) {
          screen.innerHTML = commandOutputs[cmdKey].join('<br>');
        }
      });
    });
  };

  /* ==========================================================================
     05. Dynamic Metric Counters (Count-up on Scroll)
     ========================================================================== */
  const initCounters = () => {
    const counterElements = document.querySelectorAll('.metric-value[data-target]');
    if (counterElements.length === 0) return;

    let hasCounted = false;

    const countUp = el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const isFloat = target % 1 !== 0;
      const duration = 1600; // ms
      const startTime = performance.now();

      const updateNumber = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = target * ease;

        el.textContent = isFloat ? currentVal.toFixed(1) : Math.floor(currentVal);

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = isFloat ? target.toFixed(1) : target;
        }
      };

      requestAnimationFrame(updateNumber);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasCounted) {
          hasCounted = true;
          counterElements.forEach(el => countUp(el));
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    const metricsSection = document.querySelector('.metrics-section');
    if (metricsSection) {
      observer.observe(metricsSection);
    }
  };

  /* ==========================================================================
     06. Project Category Filter
     ========================================================================== */
  const initProjectFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('.project-card');
    if (filterButtons.length === 0 || projectCards.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter || category.includes(filter)) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  };

  /* ==========================================================================
     07. Live Skill Search & Highlight
     ========================================================================== */
  const initSkillSearch = () => {
    const searchInput = document.getElementById('skillSearch');
    const skillCards = document.querySelectorAll('.skill-card');
    const chips = document.querySelectorAll('.tech-chip');
    if (!searchInput) return;

    searchInput.addEventListener('input', e => {
      const query = e.target.value.trim().toLowerCase();

      // Filter chips
      chips.forEach(chip => {
        const text = chip.textContent.toLowerCase();
        if (query && text.includes(query)) {
          chip.classList.add('highlighted');
        } else {
          chip.classList.remove('highlighted');
        }
      });

      // Filter skill cards
      skillCards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        if (!query || cardText.includes(query)) {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        } else {
          card.style.opacity = '0.35';
          card.style.transform = 'scale(0.98)';
        }
      });
    });
  };

  /* ==========================================================================
     08. Live Malaysia Timezone Clock
     ========================================================================== */
  const initLiveClock = () => {
    const clockEl = document.getElementById('liveClock');
    if (!clockEl) return;

    const updateTime = () => {
      const now = new Date();
      // Format to Asia/Kuala_Lumpur
      const options = {
        timeZone: 'Asia/Kuala_Lumpur',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      try {
        const timeString = new Intl.DateTimeFormat('en-GB', options).format(now);
        clockEl.textContent = `${timeString} MYT (UTC+8)`;
      } catch (err) {
        clockEl.textContent = 'UTC+8 (Klang, MY)';
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  };

  /* ==========================================================================
     09. Copy Email to Clipboard & Toast
     ========================================================================== */
  const initCopyEmail = () => {
    const copyBtns = document.querySelectorAll('.copy-email-btn');
    const toast = document.getElementById('toastNotice');
    const toastText = document.getElementById('toastText');
    const email = 'zryanbear@gmail.com';

    let toastTimer;

    const showToast = msg => {
      if (!toast) return;
      if (toastText) toastText.textContent = msg;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3500);
    };

    copyBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied ${email} to clipboard!`);
        }).catch(() => {
          // Fallback
          showToast(`Contact: ${email}`);
        });
      });
    });
  };

  /* ==========================================================================
     10. Card Mouse Spotlight / Glow Tracking
     ========================================================================== */
  const initSpotlightTracking = () => {
    if (isReducedMotion) return;
    const cards = document.querySelectorAll('.project-card, .metric-card, .featured-case, .writing-card, .skill-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  };

  /* ==========================================================================
     11. Scroll Spy, Navbar State & Back-to-Top
     ========================================================================== */
  const initScrollUI = () => {
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('header[id], section[id]');

    let ticking = false;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

      // Update scroll progress bar
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      // Navbar state
      if (navbar) {
        navbar.classList.toggle('scrolled', scrollY > 30);
      }

      // Back-to-top button
      if (backToTop) {
        backToTop.classList.toggle('show', scrollY > 600);
      }

      // Scroll spy for navigation
      let currentSectionId = '';
      sections.forEach(sec => {
        const top = sec.offsetTop - 180;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    }, { passive: true });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: isReducedMotion ? 'auto' : 'smooth'
        });
      });
    }

    // Run once on load
    onScroll();
  };

  /* ==========================================================================
     12. Mobile Menu Navigation Drawer
     ========================================================================== */
  const initMobileMenu = () => {
    const toggleBtn = document.getElementById('navToggle');
    const menu = document.getElementById('navMenu');
    if (!toggleBtn || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    toggleBtn.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking nav links
    menu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Close on click outside
    document.addEventListener('click', e => {
      if (!e.target.closest('.navbar')) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  };

  /* ==========================================================================
     13. Scroll Reveal Animation Observer
     ========================================================================== */
  const initRevealObserver = () => {
    if (isReducedMotion) {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1
    });

    reveals.forEach(el => observer.observe(el));
  };

  /* ==========================================================================
     Initialization
     ========================================================================== */
  window.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initTypewriter();
    initTopology();
    initTerminal();
    initCounters();
    initProjectFilters();
    initSkillSearch();
    initLiveClock();
    initCopyEmail();
    initSpotlightTracking();
    initScrollUI();
    initMobileMenu();
    initRevealObserver();
  });
})();
