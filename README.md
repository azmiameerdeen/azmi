# Mohamad Azmi — Portfolio & Writing

Personal site of **Mohamad Azmi Bin Seeni Ameerdeen**, Assistant Manager – IT/OT Infrastructure & Security, with 12+ years in Linux, virtualization, cloud, and cybersecurity.

**[Live → azmiameerdeen.github.io/azmi](https://azmiameerdeen.github.io/azmi/)**

## Features

- Dark terminal-themed design with neon cyan/green accents
- Matrix-style code-rain canvas background, paused when the tab is hidden
- Animated typewriter role cycling, scroll-reveal, counter animations
- 3D tilt project cards, floating effects, cursor glow — all skipped on touch
- Long-form writing section with per-post pages and an RSS feed
- Responsive — desktop, tablet, mobile, no horizontal overflow at 375px
- Accessible: skip link, visible focus rings, `main` landmark, AA/AAA colour contrast
- Degrades without JavaScript and honours `prefers-reduced-motion`
- Email obfuscated in the markup as a scraper speed bump
- Content-Security-Policy + Subresource Integrity (SRI) on third-party CSS
- No frameworks — vanilla HTML, CSS, and JavaScript

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

Two limits are worth stating plainly rather than overselling:

- **CSP is delivered via `<meta>`.** GitHub Pages cannot set response headers, so the policy is in a
  meta tag. That covers `script-src`, `style-src`, `img-src` and friends, but browsers **ignore
  `frame-ancestors` when it arrives that way** — it has been removed rather than left in as a claim
  that does nothing. Real clickjacking protection needs a host that can send headers
  (Cloudflare Pages `_headers`, Netlify, or an nginx front end).
- **Email obfuscation is a speed bump, not a control.** The address is stored reversed and assembled
  in JavaScript, which stops scrapers that do not execute JS and nothing else. The same address is
  public on LinkedIn.

## Structure

```
.
├── index.html                     # Single-page portfolio
├── posts/
│   └── automated-patch-management.html # Long-form post
├── assets/
│   ├── css/
│   │   ├── style.css              # Theme, animations, print fallback
│   │   └── noscript.css           # Loaded via <noscript>; unhides JS-gated content
│   ├── js/
│   │   └── main.js                # Code-rain, typing, scroll UI, reveals, email decode
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
