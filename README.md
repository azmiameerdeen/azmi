# Mohamad Azmi — Portfolio

Personal portfolio and blog of **Mohamad Azmi Bin Seeni Ameerdeen**, Assistant Manager – IT/OT Infrastructure & Security with 12+ years of experience in Linux, virtualization, cloud, and cybersecurity.

**[Live → azmiameerdeen.github.io/azmi](https://azmiameerdeen.github.io/azmi/)**

## Features

- Dark terminal-themed design with neon cyan/green accents
- Matrix-style code-rain canvas background
- Animated typewriter role cycling, scroll-reveal, counter animations
- 3D tilt project cards, floating effects, cursor glow
- Responsive — desktop, tablet, mobile
- Email obfuscated against scraping bots
- Content-Security-Policy + Subresource Integrity (SRI) hardened
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

## Deployment

Pushes to `main` trigger a GitHub Actions workflow that deploys to GitHub Pages.

## Structure

```
.
├── index.html          # Single-page portfolio
├── assets/
│   ├── css/
│   │   └── style.css   # Dark theme + animations
│   ├── js/
│   │   └── main.js     # Code-rain, typing, scroll-reveal, email decode
│   └── images/
│       └── profile.jpg # Profile picture
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deploy action
└── README.md
```

## Contact

- **Email** — zryanbear@gmail.com
- **LinkedIn** — [linkedin.com/in/mohamadazmi](https://www.linkedin.com/in/mohamadazmi/)
