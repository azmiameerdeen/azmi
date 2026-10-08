# Mohamad Azmi — Portfolio & Writing

Personal site of **Mohamad Azmi Bin Seeni Ameerdeen**, Assistant Manager – IT/OT Infrastructure & Security, with 12+ years in Linux, virtualization, cloud, and cybersecurity.

**[Live → azmiameerdeen.github.io/azmi](https://azmiameerdeen.github.io/azmi/)**

## Features

- Charcoal, warm-white and electric-lime editorial design
- Animated orbital hero illustration with a pause/resume control
- Featured Ops Workflow case study, capability cards and career timeline
- Subtle section entrances and hover interactions
- Shared article design and RSS feed
- Responsive layouts for desktop, tablet and mobile
- Skip link, visible keyboard focus, and accessible mobile navigation
- Content and contact links work without JavaScript
- Reduced-motion support; animations pause in background tabs
- Content-Security-Policy and SRI on third-party CSS
- Vanilla HTML, CSS and JavaScript; no build step

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
