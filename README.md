# NAVI Baseline 1.0

A minimal, production-friendly starting point for the Navi app (Welcome → Strategy → Dashboard).

## What's inside
- **index.html** — static entry with header nav + footer
- **assets/css/styles.css** — clean, high-contrast, mobile-first
- **assets/js/app.js** — hash router + 3 pages wired
- **assets/js/data.js** — config: set `NOVA_OFFERS_URL` to enable the upgrade button

## Quick start
1. Unzip into your repo folder (e.g., `NAVI_1_0-Baseline/`).
2. Commit and push:
   ```bash
   git add .
   git commit -m "NAVI Baseline 1.0"
   git push origin main
   ```
3. Deploy on Vercel (static site). No build step required.

## Upgrade button
- On the Dashboard, the **Update My Plan** button links back to Nova’s Offers.
- To enable: set `NOVA_OFFERS_URL` in `assets/js/data.js` (e.g., `https://your-nova-site.com/offers`).

## Notes
- No Payhip embeds/scripts are included.
- Routing uses hash fragments, so no server rewrites are needed.
- Adjust copy and styling as you like — this scaffold is intentionally lean.
