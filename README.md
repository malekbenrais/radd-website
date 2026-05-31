# Radd رِدّ — Website

Marketing site for **Radd**, the WhatsApp AI receptionist for Gulf clinics & med spas.
Static site (HTML/CSS/JS) — no build step. Arabic-first (RTL) with an English toggle.

## Run locally
```bash
python -m http.server 5500
# open http://127.0.0.1:5500/
```

## Structure
```
index.html            # homepage (all sections, bilingual via data-en/data-ar)
css/styles.css        # design system "Gulf Emerald"
js/main.js            # language toggle, animations, demo, email form
blog/                 # 6 SEO articles (bilingual)
assets/favicon.svg
robots.txt, sitemap.xml
netlify.toml / vercel.json   # deploy configs (static)
```

## Leads / contact form
Submissions are emailed via **FormSubmit** to the address set in `js/main.js`
(`LEAD_EMAIL`). The first submission triggers a one-time confirmation email —
click it once to activate. To change the address, edit `LEAD_EMAIL`.

## WhatsApp number
Set `WHATSAPP_NUMBER` in `js/main.js` (international format, no `+`).

## Deploy
- **Netlify:** connect this repo, or `netlify deploy --prod` (publish dir `.`).
- **Vercel:** import this repo, or `vercel --prod`.

## Custom domain
After connecting a domain, replace `REPLACE-WITH-YOUR-DOMAIN` in
`robots.txt` and `sitemap.xml` with the real domain.
