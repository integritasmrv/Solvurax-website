# OpenCode Brief — Rebuild solvurax.com (design P55) on the hub.solvurax.com stack

Owner: Marc Clefas (Solvura-X) · Prepared: 28 Oct 2026 · Status: specification, not yet implemented · v4 — Marc's decisions of 28 Oct 2026 applied (§15); SEO/GEO stack integration added (§10b); target markets confirmed

## 1. Goal

Rebuild the new solvurax.com design (package `SX-WEB.zip` → `DIST_P55_20261007/`) in the same technology as hub.solvurax.com, so the public site and the investor hub share one codebase, one toolchain, one UI kit, one deployment pipeline and one backend API.

Hard rules:

1. **The P55 design is the visual and copy source of truth.** Reproduce layout, spacing, typography, colours, themes, copy, page list, forms and calculators exactly. Do not rewrite copy, rename pages or "improve" the design without explicit approval from Marc.
2. **Use the hub stack**, not a new framework. Use the same React, router, build, UI-kit and API conventions found in the hub repository.
3. **Landing pages must be real HTML at build time** (pre-rendered), not a client-only single-page app. Every page must show full content, title, description, Open Graph and JSON-LD with JavaScript disabled.
4. **Keep the public site and the hub separate products**: separate app, domain, routes and bundle. Share packages, not pages.
5. Stage every risky step: backup, branch, preview deployment, verification, then cutover with a rollback.
6. **solvurax.com joins the existing generic SEO/GEO stack from the first commit** (§10b). It is not a separate SEO setup. It is the `solvurax` tenant of the same stack already running for zenland.health, using the same AgentOps collections, workflows, tools, CI checks and approval rules.

## 2. What hub.solvurax.com runs today (observed from production, 28 Oct 2026)

Inspected from the public HTML, JS and CSS bundles and API responses. Confirm each item against the repository before building.

| Area | Observation |
|---|---|
| Framework | React **19.3.0** single-page app (`<div id="root">`, ES module entry `/assets/index-[hash].js`, shared `jsx-runtime-[hash].js` chunk) |
| Build | **Vite** (content-hashed assets, `modulepreload`, lazy route chunks such as `About-*.js`, `Opportunities-*.js`, `Room-*.js`, `HubConsole-*.js`); CSS output processed by **Lightning CSS** |
| Routing | **react-router** with declarative `<Routes>`; routes `/`, `/about`, `/opportunities`, `/invest/:slug`, `/invest/:slug/request-access`, `/invest/:slug/access-status`, `/invest/:slug/datarooms`, `/room/:roomId/...`, `/console`, `/design`, `*` |
| Data | **TanStack Query** (`QueryClient`, `useMutation`); same-origin JSON API under `/api/*` (`/api/entity`, `/api/opportunities`, `/api/ticker`, `/api/contact`, `/api/pageview`, `/api/engagement`, `/api/hub/:slug/access-request`, rooms/documents endpoints) |
| Design system | CSS layers `@layer reset` and `@layer astryx-base` (Astryx / Meta XDS base), plus the in-house **`ui-*` component kit** (`ui-header`, `ui-nav`, `ui-btn`, `ui-card`, `ui-badge`, `ui-field`, `ui-input`, `ui-select`, `ui-alert`, `ui-modal`, `ui-section`, `ui-container`, `ui-grid`, `ui-stack`, `ui-prose`, `ui-ticker-region`, `ui-skip`…) and `hub-*` page classes (`hub-page`, `hub-footer`, `hub-eyebrow`) |
| Theming | Entity-driven. The server injects `window.__BOOT__ = { entity: {...design_json} }` inline into `index.html`; `design_json.theme` (dark) and `design_json.themeAlt` (light) supply tokens `bg, surface, surfaceRaised, text, textMuted, accent, accentStrong, border, divider, inverse`; mode attribute `data-entity-theme="dark|light"`, persisted as `hub-theme` in localStorage |
| Fonts | IBM Plex Sans (body), Barlow Condensed (display), IBM Plex Mono (mono) |
| Hosting | Cloudflare-proxied (`cf-cache-status: DYNAMIC` for HTML/API, `immutable` 1-year cache for hashed assets); origin is the self-hosted server2 Compose deployment behind the reverse proxy |
| Gaps relevant here | Every HTML route returns the same shell with title "Investor Hub · Investor Platform" and no meta description/OG; `robots.txt` and `sitemap.xml` return the SPA HTML (SPA fallback catches them). This is acceptable for a gated hub but **not** for marketing landing pages — hence the pre-render requirement below. |

## 3. What the P55 design package contains

Verify integrity first: `sha256sum -c DIST_P55_20261007_SHA256.txt` must pass before any work.

| Item | Detail |
|---|---|
| Public pages (11) | `index`, `approach`, `developers`, `buyers`, `partners`, `investors`, `data-room`, `resources`, `contact`, `access`, `legal` |
| Private pages (2) | `/private/`, `/private/team/` — `no-store`, `noindex`, intended to sit behind Cloudflare Access |
| CSS | `styles/site.css` (tokens + layout), `pages.css`, calculator CSS (`carbon`, `irec`, `cbam`), `tools-disclaimer.css` |
| Themes | `html[data-theme="obsidian"]` (dark, default) and `html[data-theme="flyleaf"]` (light); key `solvura-x-theme` in localStorage; logo swaps between `sx-logo-on-dark.png` / `sx-logo-on-light.png` |
| Tokens | Fibonacci spacing `--s-8/13/21/34/55/89/144`; `--shell 1320px`, `--col 1180px`, `--prose 880px`, `--lead 1040px`; radius 2px; obsidian accent `#58A62B`, background `#050806/#070B09`; flyleaf accent `#10231A` with `#C6F04D` ink |
| Fonts | Self-hosted Libre Franklin (300/400/700/800) and Geist Mono (400/700), OFL licence included |
| JS (vanilla) | `site.js` (theme toggle), `hero-video.js` (lazy hero loop, honours reduced motion), `market-band.js` (TradingView ticker iframe with dark/light and hide toggle), `carbon-calculator.js`, `irec-calculator.js`, `cbam-calculator.js` |
| Media | `media/hero-loop.mp4` (7.9 MB), `media/hero-still.jpg` poster, `og-image.png`, favicons |
| Hero | Inline SVG globe (coastline, graticule, routes, nodes) styled via `--sphere/--land/--route/...` tokens |
| Backend | Cloudflare Pages Function `functions/api/one-pager-request.js`: same-origin form POST, strict validation, honeypot `website`, 4 KB body cap, 200 rows/day cap, one request per email per day, D1 binding `SX_REQUESTS_DB`, consent notice `2026-10-02`, 303 redirects to `#request-sent / #request-error / #request-offline` |
| Headers | `_headers`: HSTS preload, `X-Frame-Options DENY`, COOP/CORP, strict CSP (`script-src 'self'`, `frame-src https://www.tradingview-widget.com`, `font-src 'self'`), cache rules per folder |
| SEO | `sitemap.xml` (10 URLs with `.html`), `robots.txt`, canonical tags, Organization/WebSite JSON-LD |

## 4. Target architecture

```
repo (existing hub monorepo)
├── apps/
│   ├── hub/                 # existing investor hub (unchanged behaviour)
│   └── site-solvurax/       # NEW: solvurax.com public site
├── packages/
│   ├── ui/                  # existing ui-* kit (extract if it still lives inside apps/hub)
│   ├── tokens/              # NEW or extended: entity themes incl. "solvurax-public"
│   ├── api-client/          # shared fetch + TanStack Query helpers (extract from hub)
│   └── calculators/         # NEW: pure TS calculator logic + tests
└── services/dealroom-api/   # existing API: add public lead endpoint
```

- **Framework**: React 19.x (same version as the hub), TypeScript, Vite, react-router (same major as the hub).
- **Rendering**: React Router framework mode with `ssr: false` and `prerender` listing every public route, so the build emits one static HTML file per page that hydrates afterwards. React Router supports exactly this static-file mode ([React Router pre-rendering docs](https://reactrouter.com/how-to/pre-rendering)). If the hub uses library-mode routing and framework mode is undesirable, use an equivalent Vite pre-render step (`vite-react-ssg` or a `renderToString` script) — the requirement is static HTML per route, not a specific plugin.
- **No runtime `window.__BOOT__`** on the public site. The P55 CSP forbids inline scripts. Resolve entity branding at **build time** (typed config in the repo, optionally checked against `GET https://hub.solvurax.com/api/entity`), never injected inline at request time. JSON-LD blocks (`type="application/ld+json"`) are fine.
- **Interactivity as small hydrated components**: theme toggle, market band, hero video, calculators, forms, mobile nav. Content must not depend on them.
- **Data**: TanStack Query only where live data is needed (none for static pages; optional for the form status).

## 5. Design-token mapping (keep P55 look, use the hub mechanism)

The hub's Solvura-X entity theme (gold accent `#b8a26a`, IBM Plex/Barlow) differs from P55 (green `#58A62B`, Libre Franklin/Geist Mono). **Do not change the hub's look as part of this task.** Instead:

1. Add a theme set `solvurax-public` in `packages/tokens` with two modes, `obsidian` (dark) and `flyleaf` (light), carrying every P55 variable verbatim (`--bg-deep, --bg, --panel, --panel-hi, --line, --line-strong, --ink, --ink-strong, --head-ink, --muted, --accent, --accent-hover, --accent-ink, --accent-text, --label-*, --step`, globe tokens, spacing, widths, radius, fonts).
2. Map P55 tokens onto the `ui-*` kit's semantic variables (e.g. `--color-background ← --bg`, `--color-surface ← --panel`, `--color-text ← --ink`, `--color-border ← --line`, accent and focus outline ← `--accent`) so kit components render in P55 style without per-component overrides.
3. Keep the attribute contract: `<html data-theme="obsidian|flyleaf">`, storage key `solvura-x-theme`, default obsidian, logo swap, `meta[name=theme-color]` update. Set the initial theme without an inline script (default obsidian in HTML; external, render-blocking `theme-init.js` of a few lines if a flash must be avoided — it is `'self'` so CSP still holds).
4. Self-host Libre Franklin and Geist Mono (convert TTF → WOFF2, keep OFL.txt), `font-display: swap`, preload the two above-the-fold weights.
5. Put any rule that cannot be expressed through tokens in a `site-solvurax` CSS layer above `astryx-base`, never by editing kit internals.
6. If Marc later wants the hub aligned to P55, that becomes a separate, approved task: switch the hub's Solvura-X `design_json` to the same token set.

## 6. Component map (P55 → React)

| P55 markup | React component | Notes |
|---|---|---|
| `.skip-link` | `ui-skip` | Target `#main-content` |
| `.market-band` | `<MarketBand>` | Port `market-band.js`: TradingView iframes per theme, compact/still variants, "Hide prices" toggle with `aria-expanded`, credit link; lazy-load after first paint |
| `.topline` | `<TopLine>` | Decorative, `aria-hidden` |
| `.site-header`, `.wordmark`, `.site-nav`, `.theme-toggle` | `<SiteHeader>` built on `ui-header`/`ui-nav`/`ui-btn` | `aria-current="page"` from router; mobile menu via `ui-mobile-menu` if the kit has it, styled to P55 |
| `.hero`, `.hero-media`, `.hero-video` | `<Hero>` + `<HeroVideo>` | Poster in HTML, `src` set only after hydration and only without `prefers-reduced-motion`; `preload="none"`, muted, playsinline, loop |
| Inline SVG globe | `<Globe>` | Same SVG, same token classes (`g-sphere`, `g-land`, …) |
| `.entry-row`, `.entry-chip` | `<PathwayChips>` | |
| `.section-shell.section-rule`, `.eyebrow`, `.section-intro` | `<Section eyebrow="01 / Operating model">` on `ui-section` | |
| `.service-grid`, `.service-card`, `.card-label` | `<ServiceGrid>`, `<ServiceCard>` on `ui-card` | |
| `.workflow-list` | `<Workflow steps=[...]>` | Six steps, numbered `01–06` |
| `.split-intro`, `.prose-column` | `<SplitIntro>` | |
| `.pathway-grid`, `.pathway-card` | `<PathwayGrid>` | |
| `.differentiator` | `<Positioning>` | |
| `.request-form`, `.sx-field*`, `.form-status` | `<OnePagerForm>` on `ui-field/ui-input/ui-select/ui-alert` | See §8 |
| `.sx-tool*` | `<CarbonCalculator>`, `<IrecCalculator>`, `<CbamCalculator>` | See §7 |
| `.site-footer`, `.footer-nav`, team button | `<SiteFooter>` (not the hub's `hub-footer`) | |

Copy lives in typed content modules (`content/solvurax/*.ts`), transferred **verbatim** from the P55 HTML, including `nowrap` spans around "Solvura-X", "Solvura-X SARL" and "I-REC".

## 7. Calculators

1. Move the arithmetic from `carbon-calculator.js`, `irec-calculator.js` and `cbam-calculator.js` into pure TypeScript functions in `packages/calculators` (no DOM access).
2. Before porting, write **golden tests** against the original P55 scripts (run them in jsdom with a fixed input matrix) and require identical outputs, rounding and formatting from the TS versions.
3. Wrap each in a React component reproducing P55 markup, labels, formulas, results table (`is-total` rows), disclaimers and email affordance.
4. The calculators must still render their form and disclaimer as HTML without JavaScript, with a clear "requires JavaScript" note in place of results.

## 8. Data room and one-pager form

**Data room = the hub's data room (decided).** The public site does not host its own data room or access workflow. The `/data-room` page keeps the P55 explanatory content, and its access call-to-action links to the hub flow: `https://hub.solvurax.com/invest/solvurax-carbon-irec/request-access` (and `https://hub.solvurax.com/opportunities` for the listing). Registration, NDA, grants and document access stay entirely in the hub. Keep the link targets in one config file so new opportunities only need a config change. Only change the CTA's wording or position with Marc's approval.

**One-pager request form = stored on Marc's server2 (decided).** If the P55 one-pager form is kept on `/data-room`, it posts to the hub API rather than Cloudflare D1:

- Add `POST /api/public/one-pager-request` to the existing dealroom API on server2. Store rows in a PostgreSQL table `one_pager_requests` (`created_at, request_day, email, first_name, last_name, company, heard_from, consent_notice`, unique `(email, request_day)`).
- Feed new rows into the existing investor/contact flow as **unqualified leads** with source `solvurax.com/data-room`. They get no automatic data-room access and no outreach permission. Data-room access is only granted through the hub's request-access/NDA flow.
- Route the endpoint so the browser sees it as same-origin, as `https://solvurax.com/api/public/one-pager-request`, with the reverse proxy forwarding it to the dealroom API. This keeps the P55 `Origin`/`Sec-Fetch-Site` checks and `form-action 'self'` valid.
- Remove `functions/api/one-pager-request.js` and the D1 binding from the target deployment.

Preserve the P55 behaviour exactly:

- Progressive form POST that works without JavaScript.
- `Origin` and `Sec-Fetch-Site` same-origin checks; `application/x-www-form-urlencoded` only; 4 KB body limit.
- Honeypot `website`; field limits (email 254, names 100, company 150); `heard_from` allow-list; email pattern.
- 200/day cap, one request per email per day, consent notice `2026-10-02`.
- 303 redirects to `/data-room#request-sent|request-error|request-offline`, the same response security headers, and "offline" mode while storage is disabled.

With JavaScript, enhance the form into an in-page submission using TanStack Query `useMutation` and the same status messages.

Compliance gate: the P55 code stores nothing until the database is bound "after the CNDP declaration". Before enabling writes, confirm the Moroccan CNDP declaration covers storage on server2 and that processor. Ship with storage disabled (offline mode) until Marc confirms. A configuration flag such as `ONE_PAGER_STORAGE_ENABLED=false` controls this.

## 9. Routes, URLs and SEO

| P55 file | New route | Redirect |
|---|---|---|
| `index.html` | `/` | `/index`, `/index.html` → `/` (301) |
| `approach.html` | `/approach` | `/approach.html` → `/approach` (301) |
| `developers.html`, `buyers.html`, `partners.html`, `investors.html` | `/developers`, `/buyers`, `/partners`, `/investors` | `.html` → clean (301) |
| `data-room.html`, `resources.html`, `contact.html`, `access.html`, `legal.html` | `/data-room`, `/resources`, `/contact`, `/access`, `/legal` | `.html` → clean (301), keep hash anchors (`#workflow`, `#integrity`, `#market-band-note`, `#request-sent`…) |
| `private/`, `private/team/` | `/private`, `/private/team` | Behind Cloudflare Access; `no-store`, `X-Robots-Tag: noindex` |

Also map any URLs of the **current** live solvurax.com that are indexed to the closest new page (inventory them first) to avoid 404s.

Per page: unique `<title>` and meta description copied from P55, canonical to the clean URL, Open Graph (`og-image.png`), JSON-LD from P55. Generate `sitemap.xml` from the route list with clean URLs; serve real `robots.txt` (not the SPA fallback). Return a real 404 page with status 404.

## 10. Hosting, headers and caching

Decided: build `apps/site-solvurax` to static files and serve them from a small static container (Caddy or nginx) in the same server2 Compose project, behind the existing reverse proxy, with solvurax.com and www proxied through Cloudflare. The reverse proxy forwards `solvurax.com/api/public/*` only to the dealroom API; no other hub API paths are exposed on solvurax.com.

- `www` → apex: Cloudflare redirect rule (as in P55 runbook).
- Translate P55 `_headers` into the static server config: HSTS preload, nosniff, `X-Frame-Options DENY`, Referrer-Policy, Permissions-Policy, COOP/CORP and the P55 CSP. Extend the CSP only for Matomo (see §10a). Remove datafa.st from the new site.
- Cache: hashed `/assets/*` → `public, max-age=31536000, immutable` (as the hub does); HTML → `max-age=300, must-revalidate`; `/media/*` → 1 day; `/private/*` → `no-store`.
- Cloudflare Access policy for `/private/*` must be in place before the private pages are deployed.
- Keep the Cloudflare Pages deployment of P55 (or the current site) available as rollback until acceptance passes.

## 10a. Analytics — Matomo (decided)

Use Marc's existing production Matomo instance. Do not use datafa.st or any other tracker.

- Load the Matomo tracker as an **external file** (`matomo.js` from the Matomo host, or a self-hosted copy under `/js/`), with a small external `analytics.js` that configures it. Do not use the inline snippet; the CSP forbids inline scripts.
- Use a separate Matomo site ID for solvurax.com (do not reuse the hub's), with cross-domain linking to `hub.solvurax.com`. This attributes the journey from landing page to data-room request on the hub.
- Track page views, outbound clicks to the hub's request-access page as a goal, one-pager form outcomes (`sent / error / offline`) as events, and calculator use as events. Send no form field values and no email addresses.
- Privacy defaults: IP anonymisation, respect Do-Not-Track, cookieless mode (`disableCookies`) unless Marc approves a consent banner. Document the setting on `/legal` and in the CNDP file.
- CSP additions, limited to the Matomo host: `script-src`, `connect-src` and `img-src`.
- Exclude `/private/*` from tracking.

## 10b. SEO/GEO stack integration (from day one)

solvurax.com is onboarded as tenant `solvurax` of the generic multisite SEO/GEO stack that already runs for zenland.health. Reuse it exactly; do not install a second copy of any tool or invent a parallel workflow.

### Reference stack (reuse, do not rebuild)

| Layer | Component | Role for solvurax.com |
|---|---|---|
| Control plane | **Directus AgentOps** (existing instance) | Owns business, site, credential references, budgets, approvals, schedules, task runs and normalised findings (`seo_sites`, `seo_integrations`, `credential_refs`, `seo_audit_runs`, `seo_findings`, `seo_occurrences`, `seo_evidence`, `seo_actions`, `seo_verifications`, `budget_policies`, `usage_events`) |
| Orchestration | CrewAI `seo-supervisor` via LiteLLM; Windmill/Celery for deterministic jobs | Same workflows as Zenland (`seo.weekly_review`, per-deployment checks) |
| Deterministic crawl QA | **SiteOne Crawler** | Stateless job per run; CI gate on the preview build |
| Persistent search monitoring | **CrawlSEO** (+ Postgres) | Add the solvurax.com site record; GSC history, crawl history, Core Web Vitals, alerts |
| GEO workflow | **GeoLook** | New project slug `solvurax`, with its own question bank, facts, tickets and verification |
| First-party evidence MCP | **SEOMonster** (stdio inside the agent worker) | Separate tenant config and credentials: GSC, PageSpeed/CrUX, Cloudflare (read-only), IndexNow (approval-gated) |
| Audit / execution skills | Claude SEO, Marketing Skills; RankMeFast / Bisibility if active for Zenland | Same adapters, added as solvurax projects only where they already run for Zenland |
| Analytics | **Matomo** (decided, §10a) | Replaces GA4 for this tenant; read-only Matomo reporting token as the analytics evidence source |

Phase 0 must record which of these are actually live for Zenland today (versions, hosts, AgentOps collections). Integrate only with what exists. List anything missing in `docs/site-solvurax/seo-gaps.md` instead of silently installing it.

### Tenant onboarding (platform side)

1. **Tenant manifest** `tenants/solvurax.yaml` in the SEO/GEO platform repository, created if it does not exist yet. Same schema as `zenland.yaml`:

```yaml
apiVersion: pwriq.io/v1
kind: SeoGeoTenant
metadata:
  id: solvurax
  displayName: Solvura-X
  environment: production
spec:
  primaryUrl: https://solvurax.com
  canonicalHost: solvurax.com
  markets:                          # confirmed by Marc, 28 Oct 2026
    - { id: MA, name: Morocco, gscCountry: mar }
    - { id: AFRICA, name: Africa, gscCountries: [all African countries], focus: [SN, CI, NG, GH, KE, ZA, EG, TN, RW] }
    - { id: EU, name: Europe, gscCountries: [EU-27, che, nor, isl], focus: [bel, fra, deu, nld, esp, ita] }
    - { id: US, name: United States, gscCountry: usa }
    - { id: CA, name: Canada, gscCountry: can }
    - { id: GB, name: United Kingdom, gscCountry: gbr }
    - { id: MIDDLE_EAST, name: Middle East, gscCountries: [are, sau, qat, kwt, bhr, omn, jor] }
    - { id: TW, name: Taiwan, gscCountry: twn }
  locales: [en]
  timezone: Africa/Casablanca
  properties:
    gsc: sc-domain:solvurax.com
    analytics: { provider: matomo, siteId: secret://solvurax/matomo/site-id }
    cloudflareZone: solvurax.com
  repositories:
    website: <HUB_MONOREPO_GIT_URL>
    path: apps/site-solvurax
    defaultBranch: main
  crawl:
    requestsPerSecond: 2
    workers: 2
    maxPages: 500
    browserMode: true
    exclude: [/private/*, /api/*]
  geolook:
    slug: solvurax
    samplingMode: mixed
    automatedEngines: []
    manualEngines: [chatgpt, perplexity, google-aio]
  permissions:
    productionWrites: approval-required
    indexingWrites: approval-required
    cloudflareWrites: disabled
    publishingWrites: disabled
  retention: { rawDays: 365, reportsDays: 730 }
```

2. **AgentOps records**: business `Solvura-X`; `seo_sites` → `solvurax.com` (production) and `next.solvurax.com` (preview, never indexed); `credential_refs` that point only to vault paths (`vault://seo/solvurax/...`); `budget_policies` for the AI sampling and provider spend of this tenant alone; `agent_task` `seo.weekly_review@1.0.0` for solvurax.com, read-only, weekly, approval required before any implementation task.
3. **Credentials, scoped to this tenant only**: `solvurax-gsc-reader` (Search Console read-only), Matomo read-only token for the solvurax.com site ID, a Cloudflare read-only token restricted to the `solvurax.com` zone, and a separate IndexNow key. Bing Webmaster Tools: import from GSC.
4. **hub.solvurax.com is not an SEO target.** Register it in `seo_sites` with `indexable=false` and a monitoring-only check: gated hub and data-room content must never appear in search results, the sitemap or GeoLook facts.
5. **Isolation tests** (as for Zenland): a solvurax job cannot read Zenland secrets, evidence, GeoLook project or CrawlSEO data, and the reverse holds too.

### Site-side SEO/GEO contract (built into `apps/site-solvurax`)

Implement this the same way as the Zenland SEO component pattern, but as a shared package `packages/seo` so every future site in the monorepo uses it:

- **`<Seo>` helper** rendered into the pre-rendered HTML: `title`, `description`, canonical, robots directives, `hreflang` (single `en` plus `x-default` now; the structure is ready for more locales), Open Graph and Twitter tags, and one JSON-LD `@graph`.
- **One facts source**: `content/solvurax/entity.ts` holds legal name, address, contact paths, services, regions and identifiers. Page copy, footer, JSON-LD and GeoLook facts are all generated from it. It must match the hub's Solvura-X entity record; a CI check compares them with `GET https://hub.solvurax.com/api/entity`.
- **Stable entity IDs**: `https://solvurax.com/#organization`, `https://solvurax.com/#website`, `https://solvurax.com/<path>#webpage`, `https://solvurax.com/<path>#service`.
- **Schema map** (JSON-LD must describe only visible content):

| Page | Schema |
|---|---|
| `/` | `Organization` (keep the P55 `PostalAddress`), `WebSite`, `WebPage` |
| `/approach` | `WebPage`, `Service` items for the operating model, `BreadcrumbList` |
| `/developers`, `/buyers`, `/partners`, `/investors` | `WebPage` + `Service` with `audience`, `BreadcrumbList` |
| `/data-room` | `WebPage` + `BreadcrumbList`; no gated content in the markup |
| `/resources` | `WebPage`; each calculator as a `WebApplication` (`applicationCategory: BusinessApplication`, `isAccessibleForFree: true`) only if it matches the visible tool |
| `/contact` | `ContactPage` referencing `#organization` |
| `/access`, `/legal` | `WebPage` |
| `/private/*` | none, `noindex` |

  Do not add `Person` unless a public, verified leadership profile is visible on the page. Do not add `FAQPage` unless visible Q&A exists.
- **Answer-first GEO structure** inside the existing P55 copy: one clear H1 per page, descriptive H2s, definitions and process steps in semantic lists/tables, and visible "last reviewed" dates where P55 provides them. Copy changes for GEO go through `docs/site-solvurax/proposals.md` and need Marc's approval.
- **Crawlable calculators**: explanatory copy before and after each tool, accessible inputs, results not indexed as separate URLs, Matomo events for start/complete without input values. This is the same "tools as discovery assets" rule as Zenland.
- **`robots.txt`**: allow all; `Disallow: /private/` and `/api/`; `Sitemap:` line. AI search and answer crawlers (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Google-Extended, Applebot-Extended) are allowed unless Marc decides otherwise. Check that Cloudflare's "Block AI bots" / managed robots.txt settings for the zone do not override this, and record the setting in the tenant docs.
- **`llms.txt`** (optional, cheap): a short Markdown index of the public pages and the organisation facts, generated from `entity.ts` and the route list. It is a convenience for AI agents, not a ranking factor. Ship it only with Marc's approval.
- **`sitemap.xml`**: generated from the route list with clean URLs and `lastmod` from the last Git commit of each page's content module. Indexable 200 pages only.
- **IndexNow**: host the key file `/<key>.txt`. Submissions run only through the approved per-deployment workflow, never automatically from CI.
- **Verification**: GSC domain property via DNS TXT in Cloudflare (no HTML verification file in the repo); Bing via GSC import.

### CI and deployment gates (same as Zenland)

`pnpm --filter site-solvurax seo:test` runs on the built output and the preview, and is part of `test:all`:

- unique title and H1 per canonical page; description on every indexable page; exactly one canonical;
- valid `hreflang` (self + `x-default`); no `noindex`, redirected or 404 URL in the sitemap;
- JSON-LD parses, uses only known `@id`s, and its facts equal `entity.ts`; no facts on a page that are not visible;
- no hub or data-room URLs, document names or gated text in public HTML, sitemap or `llms.txt`;
- every internal link resolves; every legacy `.html` URL returns 301 to the clean URL;
- `robots.txt`, `sitemap.xml` and `llms.txt` (if enabled) return the correct content types.

Per-deployment sequence (unchanged platform runbook): SiteOne crawl of the preview → SEOMonster pre-deploy checks → human approval → production deploy → smoke tests → post-deploy SiteOne crawl → GSC sitemap resubmission / IndexNow **only if approved** → change-to-evidence link recorded in `seo_verifications`.

### Migration protection

1. **Before any code**: run a full read-only baseline of the current live solvurax.com (SiteOne full crawl, CrawlSEO site with GSC history, GeoLook prompt sample) and store it as run `solvurax/baseline-pre-p55`.
2. Build the redirect map from the baseline's URL inventory plus GSC pages that had impressions in the last 16 months. Every old URL gets a 301 to its nearest new page; no blanket redirect to `/`.
3. Run the same baseline against `next.solvurax.com` (behind Cloudflare Access; crawler given a service token) and compare before cutover.
4. After cutover: daily GSC coverage, 404 and redirect checks for 4 weeks, then the normal weekly cycle. Rerun the GeoLook prompt set at +2 and +6 weeks.
5. Success is measured as in the platform plan: indexation, impressions/clicks, AI citations and Matomo goals (hub request-access clicks, one-pager requests) are tracked separately. A passing schema check or crawl score is not an outcome.

### Market configuration

Target markets (decided): **Morocco, Africa, Europe, United States and Canada, United Kingdom, Middle East, Taiwan.**

- **Language stays English only for now** (`en` + `x-default`). Do not add country-specific `hreflang` variants (`en-US`, `en-GB`…) for identical English pages; that creates duplicates without benefit. `packages/seo` must support future locales; likely candidates are French (Morocco, francophone Africa, France/Belgium), German, Spanish, Arabic (Middle East, Morocco) and Traditional Chinese `zh-Hant-TW` (Taiwan). Each new locale needs Marc's approval and reviewed translations.
- **Reporting per market**: CrawlSEO/GSC and Matomo segments per market group (the `gscCountry` codes in the manifest). Weekly review findings carry a `market` tag. Any regression is reported per market, not only globally.
- **GeoLook sampling per market**: run the question bank with market context for each group (for example "…in Morocco", "…for EU buyers", "…for UK buyers", "…for US/Canadian corporate buyers", "…in the GCC", "…for Taiwanese exporters"). Budget the sampling per market inside the solvurax budget policy.
- **Structured data**: `Organization.areaServed` lists exactly these markets (`Country` for MA, US, CA, GB, TW; `Place`/region names for Africa, Europe and the Middle East). `Service.areaServed` only lists markets where that service is actually offered, per `entity.ts`. Never imply a local office, licence or registration where none exists.
- **Performance**: Cloudflare serves the static site at the edge in every market, so no extra hosting is needed. The Core Web Vitals budget (§11) must also be checked from Europe (Frankfurt/Paris), the US, UK, UAE and Taiwan locations in PageSpeed/CrUX or WebPageTest.
- **Market-specific GEO angles** (seed, for the question bank and later content proposals):
  - Morocco/Africa: Article 6 authorised supply, I-REC issuance, MRV and registry provenance, project-developer access.
  - US/Canada: voluntary carbon and I-REC procurement for corporate buyers, integrity and double-counting controls, due diligence on African supply.
  - Europe: EU CBAM for importers of African goods, EU ETS context, CSRD-driven procurement, corporate buyers of I-RECs and carbon credits.
  - UK: UK ETS/CBAM interaction, corporate net-zero procurement, intermediary due diligence.
  - Middle East: Article 6 bilateral deals and buyer programmes in the GCC, sovereign and corporate offtake.
  - Taiwan: CBAM exposure and I-REC/carbon procurement for exporters, Taiwan carbon fee context.

### GeoLook question bank for Solvura-X (seed, editable in GeoLook)

Due diligence on carbon/I-REC intermediaries in Africa; Article 6 authorised supply and corresponding adjustments; MRV interoperability and registry provenance; double-counting controls; CBAM exposure for Moroccan and African exporters; I-REC issuance and buying in Morocco/Africa; transaction structuring for nature-based and renewable projects; selecting a Rabat/Morocco-based environmental-market partner. Answers are checked against `entity.ts` facts. Claims about authorisations, partnerships or coverage must state the current status exactly and never overstate it.

## 11. Performance and accessibility budgets

- LCP < 2.0 s on mid-range mobile (4G); CLS < 0.05; JS for the home page ≤ 90 KB gzip (React runtime shared via one vendor chunk).
- Hero video: **keep `media/hero-loop.mp4` unchanged (decided).** It is already efficient: H.264 High, 1280×720, 29.97 fps, 22 s, about 2.9 Mbit/s, no audio track, and `faststart` (moov before mdat). A test re-encode at visually lossless quality (x264 veryslow, CRF 20, SSIM 0.993) produced a *larger* file (10.0 MB vs 7.9 MB). Smaller files therefore mean visible quality loss; do not re-encode. The video never blocks LCP: the poster `hero-still.jpg` is the LCP candidate, and the video loads only after hydration, only without `prefers-reduced-motion`. Optionally skip it when `navigator.connection.saveData` is true or on 2G/slow-2G connections.
- TradingView iframe loaded after first paint and only when visible.
- WCAG 2.2 AA: contrast in both themes, focus outlines (`3px solid var(--accent)`), skip link, landmarks, form errors linked with `aria-describedby`, reduced motion respected.

## 12. Delivery phases

**Phase 0 — Inventory (no changes)**
1. Verify the P55 checksum file.
2. Locate the hub repository, its package manager, Node version, React/react-router/Vite/TanStack versions, the `ui-*` kit location and the Astryx dependency; record them in `docs/site-solvurax/inventory.md`.
3. Inventory current live solvurax.com URLs, DNS, Cloudflare rules, analytics and where it is deployed today.
4. Inventory the live SEO/GEO stack for Zenland (§10b), create the `solvurax` tenant manifest, AgentOps records and scoped credentials, and run the read-only pre-migration baseline of the current solvurax.com.
5. Report conflicts with this brief before Phase 1.

**Phase 1 — Shared packages**
Extract (or confirm) `packages/ui`, `packages/tokens`, `packages/api-client`, and create `packages/seo` (§10b), without changing hub behaviour; hub visual snapshot tests must show zero diff.

**Phase 2 — Site skeleton**
Create `apps/site-solvurax` (React 19 + Vite + react-router pre-render), tokens `solvurax-public`, fonts, header, footer, theme toggle, skip link, 404, `<Seo>` helper, `entity.ts`, robots, sitemap, IndexNow key file, `seo:test` in CI.

**Phase 3 — Pages**
Build all 11 public pages and 2 private pages with verbatim content modules.

**Phase 4 — Interactive parts**
Market band, hero video, globe, mobile nav, calculators with golden tests.

**Phase 5 — Form and backend**
Implement the server2 endpoint (§8) in offline mode first, with contract tests for every validation and redirect case. Add the Data room CTAs to the hub and Matomo (§10a), and verify Matomo goals across both domains.

**Phase 6 — Hosting**
Static container, Compose service with health check, reverse-proxy host rule, headers, caching, Cloudflare Access for `/private`, preview hostname (e.g. `next.solvurax.com`, noindex).

**Phase 7 — Verification and cutover**
Run §13 and the SEO/GEO preview baseline (§10b) on the preview; Marc approves; switch solvurax.com; follow the per-deployment SEO sequence; keep rollback for 14 days; run 4 weeks of migration monitoring in AgentOps.

## 13. Acceptance criteria

1. **Visual parity**: Playwright screenshots of every page, both themes, at 1440×900, 1280×800 (laptop — full hero visible), 768×1024 and 390×844, compared with the P55 static files served locally; diffs ≤ 0.5 % of pixels, every remaining difference listed and approved.
2. **Copy parity**: automated text extraction of each P55 page equals the rendered page text (whitespace-normalised).
3. **No-JS**: with JavaScript disabled, every page shows full content, navigation, headings, footer, and the form submits.
4. **SEO**: each URL returns 200 with its own title, description, canonical, OG and JSON-LD in the raw HTML; `/robots.txt` and `/sitemap.xml` return the correct content types; old `.html` URLs return 301; unknown URLs return 404.
5. **Headers**: securityheaders-style check equals P55 `_headers`; CSP has no violations in the browser console on any page.
6. **Calculators**: golden tests pass; results identical to P55 for the full input matrix.
7. **Data room and analytics**: Data room CTAs open the hub's request-access page; Matomo records page views, the hub-click goal and form events, with no personal data in payloads.
8. **Form**: all validation, honeypot, cap, duplicate and redirect cases tested; no rows written while storage is disabled; secrets only in Compose secrets.
9. **Budgets**: §11 met on Lighthouse CI for `/`, `/approach`, `/resources`, `/data-room`.
10. **Hub unaffected**: hub E2E and visual tests unchanged; no shared-package change alters the hub's rendering.
11. **Rollback** documented and tested once on the preview.
12. **SEO/GEO stack**: `seo:test` passes; the solvurax tenant is live in AgentOps, CrawlSEO, GeoLook, SiteOne and SEOMonster with scoped credentials; cross-tenant negative tests with Zenland pass; pre-migration and preview baselines are stored; every baseline URL has a 301 or a live equivalent; the first `seo.weekly_review` run produces normalised findings with no write actions.

## 14. Do not

- Do not ship the public site as a client-only SPA or reuse the hub's `index.html` shell.
- Do not inject inline `<script>` boot data on the public site.
- Do not change hub routes, hub theming or hub copy in this task.
- Do not enable lead storage before the CNDP confirmation.
- Do not add tracking other than Matomo (§10a), and do not add third-party fonts or CDNs.
- Do not re-encode or replace the hero video.
- Do not build a separate data room on solvurax.com; all access goes through the hub.
- Do not install separate SEO/GEO tools or a solvurax-only workflow; use the shared stack and tenant model.
- Do not run GSC submissions, IndexNow, Cloudflare changes or content publishing without an AgentOps approval.
- Do not edit P55 copy, imagery or page structure; propose changes in `docs/site-solvurax/proposals.md` instead.

## 15. Decisions (confirmed by Marc, 28 Oct 2026)

| # | Topic | Decision |
|---|---|---|
| 1 | Hosting and form storage | Marc's server2: static site container plus the hub's dealroom API and PostgreSQL. No Cloudflare Pages Functions or D1. |
| 2 | Analytics | Matomo (existing instance), configured as in §10a. |
| 3 | Hero video | Keep the original file. Re-encoding would only shrink it with visible quality loss (§11). |
| 4 | Data room | Use the hub's data room. The solvurax.com `/data-room` page explains it and links to the hub's request-access flow (§8). |
| 5 | Hub theme | The hub keeps its own identity (gold accent, IBM Plex/Barlow). The P55 theme applies only to solvurax.com (§5). |

| 6 | Target markets | Morocco, Africa, Europe, US and Canada, UK, Middle East, Taiwan; English only for now (§10b Market configuration). |
| 7 | SEO/GEO | solvurax.com joins the existing generic SEO/GEO stack (the Zenland reference) as tenant `solvurax` from day one (§10b). |

Remaining confirmations:
- CNDP coverage for server2 storage, before enabling lead storage (§8).
- AI-crawler policy (default: allow) and whether to publish `llms.txt` (default: prepared, published after approval).
