Solvura-X website - static site (deployable bundle)
====================================================

DEPLOY THE WHOLE FOLDER. Never upload the individual .html files on their own -
they need the styles/, js/, and assets/ folders sitting beside them, or the site
renders as plain unstyled text with no logo.

Cloudflare Pages - two ways:
  (a) Direct Upload: Cloudflare Pages > Create a project > Direct Upload >
      drag THIS ENTIRE FOLDER in. No build command. Output directory = the folder root.
  (b) GitHub: put ALL of these files at the root of a GitHub repo, then in
      Cloudflare Pages > Connect to Git, select the repo. Framework preset = None,
      Build command = (leave empty), Build output directory = / (root).

What's in here:
  index.html + 7 more pages (approach, developers, buyers, partners, investors, contact, legal)
  styles/   - tokens.css + site.css (the design)
  js/       - site.js (theme toggle; site works fully with JS off)
  assets/   - logo SVGs, favicon, og-image
  _headers  - security headers / CSP (Cloudflare Pages reads this automatically)
  _redirects, robots.txt, sitemap.xml

Notes:
  - Static site: no build step, no server code, no dependencies.
  - You may delete this README.txt before or after deploy; it is not part of the site.
