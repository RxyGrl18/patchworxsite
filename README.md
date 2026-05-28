# Patch Worx Launch Site

The Patch Worx beta launch site, ready to deploy as a static site.

## Quick start

This is a static site. Just serve the folder.

### GitHub Pages

1. Push this folder to a GitHub repo.
2. In **Settings → Pages**, set the source to your main branch / root.
3. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Custom domain (patchworx.studio)

Once GitHub Pages is enabled:

1. In **Settings → Pages**, under **Custom domain**, enter `patchworx.studio`.
2. At your DNS provider, add these records pointing to GitHub Pages:
   - `A` → `185.199.108.153`
   - `A` → `185.199.109.153`
   - `A` → `185.199.110.153`
   - `A` → `185.199.111.153`
   - `CNAME` (`www`) → `<your-username>.github.io`
3. Wait a few minutes for DNS to propagate, then re-tick **Enforce HTTPS**.

### Local preview

Open `index.html` directly in a browser, or run a tiny local server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## File layout

- `index.html` — the launch page
- `teaser.html` — the 15-second animated teaser, embedded in the hero and workspace sections via iframe
- `animations.jsx` + `scenes/` — the React/JSX source for the teaser animation
- `assets/` — Patch Worx logo files (icon + lockup PNGs)

## Wiring the waitlist form

The email signup forms are visual only. To capture real signups, replace the `<form onsubmit="…">` handlers in `index.html` with your provider's embed:

- ConvertKit / Kit
- Buttondown
- Mailchimp embed
- A simple Formspree endpoint

Search `index.html` for `hero-form` to find both forms (one in the hero, one in the final CTA).
