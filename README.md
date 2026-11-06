# Mohamad Azmi — Portfolio & Writing

Personal site of **Mohamad Azmi Bin Seeni Ameerdeen**, Assistant Manager – IT/OT Infrastructure & Security at Westports Malaysia, with 12+ years in Linux engineering, virtualization, firewalls, Ansible automation and ISO 27001.

**[Live → azmiameerdeen.github.io/azmi](https://azmiameerdeen.github.io/azmi/)**

## Design

Dark, editorial and three-dimensional — large display type with serif-italic accents, a teal → indigo → violet aurora that drifts as you scroll, and depth wherever it carries meaning.

- **Fleet globe (hero)** — 121 nodes on a sphere, one per server under automated patching. Patch waves roll through it 20% at a time (`serial: 20%`), with packets travelling the lattice. Drag to rotate. It is an illustration, and its caption says so — not live data.
- **Isometric pipeline** — the Ops Workflow card shows the real run order (lint → dry run → concurrency guard → run & evidence) as a floating 3D stack that spreads apart on hover.
- **Pinned 3D gallery** — on wide screens the projects flow sideways as you scroll, curving like a coverflow. On phones it becomes a swipeable row.
- **Flow** — headings rise in word by word, the experience timeline draws itself as you scroll, the nav tucks away on the way down, and tech names drift in marquee rows.
- **Tilt & glare** — cards respond to the pointer with perspective tilt and a light sheen; the portrait's floating chips sit at different depths.

## Engineering notes

- **No frameworks, no build step, no trackers.** Vanilla HTML, CSS and JavaScript.
- **No third-party scripts or icon fonts.** Icons are an inline SVG sprite; the only external requests are Google Fonts.
- **Strict CSP.** `script-src 'self'`, no inline scripts or `style` attributes. JavaScript writes CSS custom properties through the CSSOM, which the policy allows.
- **Works without JavaScript.** `assets/js/boot.js` adds a `js` class in `<head>`; every hidden-until-revealed style is gated behind it, so without JS the page renders fully visible. `noscript.css` only tidies the canvas and mobile nav.
- **Honours `prefers-reduced-motion`.** Durations *and* delays collapse, the globe becomes a still frame, the gallery stops pinning and the marquee stops scrolling — content is never hidden.
- **Cheap to run.** One shared rAF-batched scroll listener; the globe pauses when off-screen or in a background tab.

## Tech stack

| Layer | Detail |
|---|---|
| Frontend | HTML5, CSS (3D transforms, custom properties), vanilla JavaScript, Canvas 2D |
| Fonts | Geist, Geist Mono, Instrument Serif (Google Fonts) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions (static deploy) |

## Local development

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
2. Add a `.post-card` to the `#writing` section of `index.html` (newest first).
3. Add an `<item>` to `feed.xml` and a `<url>` to `sitemap.xml`.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which publishes the repository root to GitHub Pages.

## Security notes

- **The CSP is delivered via `<meta>`.** GitHub Pages can't set response headers, so browsers ignore `frame-ancestors` from a meta tag — real clickjacking protection needs a host that can send headers.
- **Email obfuscation is a speed bump, not a control.** The address is stored reversed and assembled in JavaScript, which only stops scrapers that don't execute JS.
- **Nothing about employer internals is published.** No network topology, hostnames, ticket numbers or security-stack versions tied to a specific environment.

## Structure

```
.
├── index.html
├── posts/
│   └── automated-patch-management.html
├── assets/
│   ├── css/
│   │   ├── style.css       # Design system, sections, article page, print
│   │   └── noscript.css    # Loaded via <noscript>
│   ├── js/
│   │   ├── boot.js         # Adds the `js` class before first paint
│   │   └── main.js         # Globe, nav, reveals, tilt, gallery, timeline, email
│   └── images/
├── feed.xml · sitemap.xml · robots.txt
└── .github/workflows/deploy.yml
```
