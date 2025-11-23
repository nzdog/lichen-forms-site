# Lichen Protocol — Founder Forms Portal

A simple static site hosting internal forms for founders walking the Lichen Protocol.

## Pages

- **index.html** — Landing page with links to all forms
- **intake.html** — Founder intake form (pre-session)
- **followup-24h.html** — 24-hour follow-up form
- **followup-7d.html** — 7-day follow-up form
- **thankyou-*.html** — Confirmation pages for each form

## Run Locally

```bash
cd lichen-forms-site
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000)

## Structure

```
lichen-forms-site/
  index.html
  intake.html
  followup-24h.html
  followup-7d.html
  thankyou-intake.html
  thankyou-24h.html
  thankyou-7d.html
  assets/
    styles.css
  README.md
```

## Deployment

This site is designed to be deployed to Netlify at a subdomain like `forms.lichenprotocol.com`.

Form submissions will later be handled via Netlify Functions connected to the Notion API.

## Notes

- Static HTML + CSS only (no JavaScript required yet)
- Mobile-first responsive design
- Styling based on the Lichen Protocol design system
