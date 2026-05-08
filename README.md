# Alora Labs — Website

Boutique creative & marketing studio based in Oakville, Ontario.

## Overview

Static HTML/CSS/JS website for Alora Labs studio. No build system or bundler required — open any `.html` file directly in a browser, or serve with any static host.

## Pages

| File | Page |
|---|---|
| `index.html` | Home |
| `about.html` | About |
| `services.html` | Services |
| `portfolio.html` | Portfolio |
| `contact.html` | Contact |
| `kimberly-capone.html` | Case Study — Kimberly Capone Interior Design |
| `forma-vintage.html` | Case Study — Forma Vintage |
| `generations-marketplace.html` | Case Study — Generations Marketplace |
| `gillet-psychology.html` | Case Study — Gillet Psychology |
| `h3c.html` | Case Study — H3C Healthcare Communications |
| `alora-labs-brand.html` | Case Study — Alora Labs |

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- [GSAP 3](https://gsap.com/) + ScrollTrigger — animations & parallax
- [Lenis](https://lenis.darkroom.engineering/) — smooth scroll
- [Formspree](https://formspree.io/) — pricing guide email form

## Structure

```
/
├── index.html
├── styles.css          # Global design system & shared styles
├── pages.css           # Page-specific styles (services, about, etc.)
├── case-study.css      # Shared case study template styles
├── animations.js       # GSAP animations, cursor, grain, transitions
├── script.js           # UI interactions (nav, announcement banner)
├── case-study.js       # Case study parallax + scroll animations
├── contact-form.js     # Contact form handling
├── Images/             # All images
└── favicon_io/         # Favicon assets
```

## Deployment

Deploy to any static host (Netlify, Vercel, GitHub Pages, etc.). No build step needed — upload all files as-is.
