# Mohamad Azmi — Portfolio & Writing

Personal site of **Mohamad Azmi Bin Seeni Ameerdeen**, Assistant Manager – IT/OT Infrastructure & Security, with 12+ years in Linux, virtualization, cloud, and cybersecurity.

**[Live → azmiameerdeen.github.io/azmi](https://azmiameerdeen.github.io/azmi/)**

## Features

- **Executive Cyber-Defense Design:** Deep obsidian dark mode with electric cyan, emerald, and amber telemetry accents
- **Interactive Cyber Constellation:** Hardware-accelerated canvas particle lattice that subtly reacts to cursor proximity
- **Interactive Hero Mission Control:** Dynamic SVG topology diagram of Westports IT/OT architecture with live layer switching (Infrastructure, Cybersecurity, Automation) and packet flow animations
- **Interactive Mini-Terminal:** Integrated terminal drawer with instant command execution (`cat specs.json`, `uptime`, `ansible --check`, `whoami`, `cab --status`)
- **Animated Metrics Counters:** Scroll-triggered counting statistics for years of experience, automated nodes, credentials, and uptime
- **Ops Workflow Flagship Case Study:** Interactive 4-stage pipeline showcase with execution gating metrics
- **Interactive Project Filtering:** Category filter tabs for migration, network security, identity, and SIEM engagements
- **Real-Time Skill Search & Chip Cloud:** Live-filtering search bar across 50+ enterprise technology chips
- **Live Local Time Widget:** Malaysian timezone clock (`Asia/Kuala_Lumpur`) in executive personnel dossier
- **1-Click Copy with Toast Notification:** Seamless clipboard copying for contact channels with interactive feedback
- **Card Spotlight Tracking:** Dynamic `--mouse-x` and `--mouse-y` lighting gradients that follow cursor movement
- **Mobile Responsive Drawer:** Smooth frosted-glass navigation drawer with keyboard escape and outside-click support
- **Accessibility & Security First:** Full `prefers-reduced-motion` compliance, strict Content-Security-Policy (CSP), Schema.org Person JSON-LD, and noscript fallbacks
- **Vanilla Architecture:** Zero build tools or heavy framework dependencies; pure HTML5, modern CSS3, and vanilla JavaScript

## Tech Stack

| Layer | Detail |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (vanilla) |
| Fonts | Google Fonts (JetBrains Mono + Inter), Font Awesome 6.5 |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (static deploy) |

## Local Development

```bash
git clone https://github.com/azmiameerdeen/azmi.git
cd azmi
python3 -m http.server 8080
# open http://localhost:8080
```

## Adding a post

The writing section is static — there is no build step and nothing to install.

1. Copy an existing file in `posts/` to `posts/<slug>.html` and rewrite the body. Update the
   `<title>`, `description`, canonical URL, Open Graph tags, and the `BlogPosting` JSON-LD block.
2. Add a `.post-card` block to the top of the `#writing` section of `index.html` (newest first).
3. Add an `<item>` to `feed.xml` and a `<url>` to `sitemap.xml`.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which publishes the repository root to
GitHub Pages.

## Security notes

Hosting limitation:

- **CSP is delivered via `<meta>`.** GitHub Pages cannot set response headers, so the policy is in a
  meta tag. That covers `script-src`, `style-src`, `img-src` and friends, but browsers **ignore
  `frame-ancestors` when it arrives that way** — it has been removed rather than left in as a claim
  that does nothing. Real clickjacking protection needs a host that can send headers
  (Cloudflare Pages `_headers`, Netlify, or an nginx front end).

## Structure

```
.
├── index.html                     # Single-page portfolio
├── posts/
│   └── automated-patch-management.html # Long-form post
├── assets/
│   ├── css/
│   │   ├── style.css              # Theme, animations, print fallback
│   │   └── noscript.css           # Navigation fallback when JavaScript is off
│   ├── js/
│   │   └── main.js                # Navigation, scroll UI, motion controls
│   └── images/
│       ├── profile.jpg
│       └── favicon.svg
├── feed.xml                       # RSS
├── sitemap.xml
├── robots.txt
├── .github/workflows/deploy.yml   # GitHub Pages deploy action
└── README.md
```

## Contact

- **Email** — zryanbear@gmail.com
- **LinkedIn** — [linkedin.com/in/mohamadazmi](https://www.linkedin.com/in/mohamadazmi/)
- **GitHub** — [github.com/azmiameerdeen](https://github.com/azmiameerdeen)
