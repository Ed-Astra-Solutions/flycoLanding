# flycoLanding

Landing page for **FLYCO Corporate & Brand Retreats** — Flyco Business Pte. Ltd. & I Quadrant Travel Pte. Ltd., Singapore Travel Licence No. TA03759.

Live: <https://flyco.edastra.in/>

## Contents

| Path | What it is |
| --- | --- |
| `index.html` | The entire landing page — markup, CSS and JS inline, no build step |
| `dark.html` | `/dark` route — redirects to `/?theme=dark`, the dark presentation build |
| `assets/` | Favicons, app icons, social share card, wordmark |
| `site.webmanifest` | PWA manifest (name, icons, brand colours) |
| `robots.txt`, `sitemap.xml` | Crawler directives |
| `CNAME` | Custom domain for GitHub Pages |

## Hosting

GitHub Pages, served from the `main` branch root. Push to `main` and the site redeploys.
DNS: `flyco.edastra.in` is a CNAME to `edtech-hub.github.io`.

## Editing

Open `index.html` and edit directly. Brand tokens live in the `:root` block at the top of the
`<style>` tag (`--gold`, `--ink`, `--sand`, fonts, spacing).

## Themes

Light is the default and the canonical build. The dark build is the same page with a
`data-theme="dark"` attribute on `<html>`; it is driven entirely by token overrides in the
`DARK THEME` block near the end of the `<style>` tag, so copy and markup are never duplicated.

- `/dark` (or `/?theme=dark`) — dark build, for client presentation
- `/` — light build
- The sun/moon button in the header flips between them and rewrites `?theme=` in the URL

`dark.html` is `noindex`; only the light page is canonical for search.

Social preview: `assets/og-image.jpg` (1200×630). If the headline copy changes, regenerate or
replace that image and keep the `og:image` dimensions in sync.

Photography is served from the FLYCO Shopify CDN; brand marks are derived from the flycotravel.com logo.
