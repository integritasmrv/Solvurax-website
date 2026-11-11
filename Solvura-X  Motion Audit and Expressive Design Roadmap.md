# Solvura-X: Motion Audit and Expressive Design Roadmap

Audit date: 5 November 2026. Scope: the public solvurax.com experience, its delivered JavaScript/CSS, and the earlier Lightswind pilot. This document is advice and an implementation handoff, not an authorization to deploy changes.

## Confirmed scope: preserve the hero and add all five components

The user's latest instruction is to **keep the current hero video unchanged** and include all five selected components. This scope supersedes earlier suggestions to replace, redesign or overlay the hero, and supersedes the earlier presentation of Scroll Stack and Sticky Scroll Reveal as mutually exclusive choices across the entire site. Both are now in scope, assigned to different content sections.

The implementation placements below are proposed defaults for OpenCode. All five components are selected for inclusion; none should be silently omitted as an “alternative.” Production deployment remains a separate step after preview verification.

### Protected hero

Preserve the current video asset, poster, crop, positioning, dimensions, loading strategy, playback controls/attributes and existing reduced-motion behaviour. Also preserve its existing copy, actions, overlay treatment and immediate visual composition so that this phase does not indirectly redesign the hero.

Do not replace the video with a globe, map, shader or new image. Do not add a map, particle field, animated grid or data panel over it. The previously identified invisible hero-grid defect remains an audit finding, but activating that background is outside this phase: fixing it would introduce a new visible hero treatment. Put new visual impact below the existing hero and on the relevant inner pages.

### Selected component placement

| Selected component | Placement | Required result | Scope boundary |
|---|---|---|---|
| **Aceternity Container Scroll Animation** | Homepage service-card section, below the existing hero | A clearly visible 3D turning entrance using the existing service content. Adapt the component's scroll mapping to the service-card grid or its containing panel; keep card order, links and readable final states. | This is not a ready-made guarantee that four independent grid cards will work unchanged. Build an owned `SxScrollTurnCard`/section wrapper and verify the adaptation. Do not introduce a second hero. |
| **React Bits Scroll Stack** | Approach page, existing six-stage operating sequence | Stack the existing Define, Collect, Check, Structure, Coordinate and Reconcile cards as the visitor scrolls. Preserve the approved stage copy and sequence. | Replace or enhance that page's existing process presentation, not a duplicate six-step section. Do not add nested wheel scrolling or apply a second scroll transform to the same cards. |
| **Magic UI Animated Beam** | Homepage integrity/provenance section | Connect clearly labelled evidence, checks and counterpart-access nodes with animated paths. Keep independent verification/issuance distinct from Solvura-X's role. | New labels or diagrams must remain factual and approved; animations must not imply live transactions or unverified integrations. |
| **Aceternity World Map** | Investors page, a dedicated market-connections section | An Africa-focused map showing approved geographic relationships with animated lines and labelled locations. Keep the existing market text as readable supporting content. | Not in the hero. Do not show unconfirmed active corridors as operational; use “illustrative” where appropriate. Avoid running the existing marquee and the new map as competing animations in the same viewport. |
| **Aceternity Sticky Scroll Reveal** | Developers page, MRV/data-interoperability explanation | A persistent visual changes as the visitor reads the existing technical narrative, with the terminal illustration retained as supporting material where appropriate. | Not another presentation of the six Approach stages. Reuse approved developer content; any new chapter copy or claimed capability needs review. |

### Shared implementation and acceptance rules

1. Use all five selected sources through owned, typed wrappers. Record each source version, licence and adaptation; avoid installing an entire library just to obtain one effect.
2. Keep one primary scroll controller per scene. Container Scroll, Scroll Stack and Sticky Scroll must not independently transform or pin the same elements.
3. Use the document's ordinary scroll. Avoid nested scrollbars and reconcile any existing section-snapping routine before adding scrubbed or sticky sections.
4. Each scene must have an explicit height and stable measuring element, avoiding the zero-height/paint-clipping problem found during the audit.
5. Provide mobile layouts without long pinned sequences, and static readable versions for reduced motion. Preserve server-rendered content, keyboard access and semantic reading order.
6. Animate scroll progress, not a fixed timer, for the turn and stack effects. They must visibly track scrolling and settle without clipping or disappearing text.
7. Confirm the World Map's geographic data, selected coordinates and meaning of each route. Confirm that the provenance diagram accurately separates preparation/coordination from third-party verification and issuance.
8. Capture a before/after hero check at desktop and mobile, including the video asset URL and relevant settings, to prove the hero remains unchanged.
9. Provide a preview with all five placements, plus a component-by-component implementation report: source, route, wrapper, dependencies, mobile fallback, motion fallback, outstanding content approvals and performance measurements.
10. Keep separate feature flags for the five new placements so an individual scene can be rolled back without affecting the existing hero or the other scenes.

## Executive assessment

**Real integration work has happened, but the visible result remains much more restrained than the experience you now want.** The live site delivers named FX islands, lazy effect modules, heading reveals, card spotlights, a terminal illustration, market marquee, copy feedback and an access-step presentation; however, some major effects are disabled, unconnected or geometrically invisible ([homepage and deployed markup](https://solvurax.com/), [deployed FX configuration](https://solvurax.com/assets/hydrate-QOdbU672.js)).

Keep the useful foundation and preserve the current hero video. Add the five selected experiences in their assigned sections: homepage scroll-turn cards, the Approach stack, the provenance diagram, the Investors map and the Developers sticky reveal. Supporting motion should reinforce this system instead of competing with it.

The earlier pilot brief was deliberately conservative: flat geometry, no shadows, very low-opacity highlights and short entrance travel. Those were pilot constraints, not requirements that should prevent the more expressive result now requested. This roadmap proposes relaxing them while keeping readable content, controlled loading, reduced-motion alternatives and trustworthy presentation.

## Evidence and scope boundaries

- **Live inspection:** Desktop browsing at 1694×766, a mobile homepage check at 390×844, and a mobile reduced-motion check. The inspected pages were Home, Approach, Developers, Resources, Investors, Data room and Contact; their delivered route modules were also inspected ([Home](https://solvurax.com/), [Approach](https://solvurax.com/approach), [Developers](https://solvurax.com/developers), [Resources](https://solvurax.com/resources), [Investors](https://solvurax.com/investors), [Data room](https://solvurax.com/data-room), [Contact](https://solvurax.com/contact)).
- **Source boundary:** Findings about code refer to browser-delivered production bundles, not the private application repository. Repository availability was checked, but the relevant Solvura-X source checkout was not identified; commit history, branch state, CI results, implementation ownership and approval history remain unverified.
- **Not a full acceptance test:** No complete accessibility audit, Lighthouse run, frame-rate benchmark, no-JavaScript test or authenticated hub audit was performed in this review. “Live” below means observed in the public browser or traced to a rendered production component, not independently certified production quality.
- **Status precision:** An enabled flag or available chunk is not proof that an effect is mounted, visible or working. Conversely, an initially shown `fallback` can be the intended lazy-loading state, so it is not classified as a defect on its own.

## What is done, broken, disabled or missing

| Area | Current status | Evidence and interpretation | Next action |
|---|---|---|---|
| FX foundation | Deployed | Production has feature flags, lazy component loaders, scoped `[data-sx-fx]` utilities, fallback states and error fallback logic ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [stylesheet](https://solvurax.com/assets/index-B7Qh5HoR.css)). | Reuse this work; do not restart the component integration. |
| Hero video and heading entrance | Working in inspected normal-motion session | Video played and the hero heading reached its live state; production includes the hero-reveal loader ([homepage](https://solvurax.com/), [configuration](https://solvurax.com/assets/hydrate-QOdbU672.js)). | Preserve unchanged under the latest user instruction. |
| Section heading reveals | Working | Home headings and the Approach workflow heading entered `live` state during scrolling ([homepage](https://solvurax.com/), [Approach](https://solvurax.com/approach)). | Keep, but distinguish hero, section title and label treatments. |
| Service-card spotlight | Deployed, intentionally very subtle | All four cards reached `live`. Their code tracks the pointer and renders a 12%-tinted radial accent gradient; it contains no scroll-linked rotation ([service-card module](https://solvurax.com/assets/SxServiceCard.body-BtNtIJ9_.js)). | Add the requested scroll-turn wrapper; use spotlight only as the secondary hover treatment. |
| Pathway-card glow | Wired, extremely subtle | Rendered pathway cards use a pointer-driven glow. The source combines a 0.5 glow opacity with a coloured inner layer at 0.06 opacity, making the result very faint; there is no scroll rotation ([pathway-card module](https://solvurax.com/assets/SxPathwayCard.body-ZIGIXxA1.js)). | Increase contrast after visual testing; add image or diagram reveal instead of relying on barely visible glow. |
| Hero beam-grid background | Broken visual geometry | On desktop the FX wrapper measured 1320×0 and the canvas backing size was 1320×0, despite `data-fx-state="live"`. The zero-height wrapper reproduced on mobile. Source sizes the canvas from its parent ([homepage](https://solvurax.com/), [hero-grid module](https://solvurax.com/assets/SxHeroGrid.body-lVcI5n9g.js)). | Record the defect but do not activate a new visible hero overlay in this phase. |
| Developers interactive grid | Deployed but clipped by geometry | The FX wrapper measured 1320×0 with `contain: layout paint`, while its canvas measured 1320×766. The zero-height paint-containing ancestor prevents the intended background from being visible ([Developers](https://solvurax.com/developers), [route module](https://solvurax.com/assets/Developers-Cr7VFYbF.js)). | Give the decorative island the actual section bounds; remove inappropriate paint containment from the background wrapper. |
| Lightswind workflow timelines | Explicitly disabled | `home.workflow.timeline` and `approach.sequence` are false. The public workflow uses custom six-step controls instead of the timeline effect ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [Approach](https://solvurax.com/approach)). | Choose a scroll-led process scene; do not simply turn on a second duplicate workflow. |
| Thinking Gods-style scroll-turn cards | Not found in inspected production sections | Service cards have pointer spotlight only, pathway cards have glow only, and the inspected Approach steps do not use 3D rotation ([service code](https://solvurax.com/assets/SxServiceCard.body-BtNtIJ9_.js), [pathway code](https://solvurax.com/assets/SxPathwayCard.body-ZIGIXxA1.js), [Approach](https://solvurax.com/approach)). | Highest-priority new signature interaction. |
| Developers terminal | Working | The illustrative provenance record and terminal effect reached `live` ([Developers](https://solvurax.com/developers)). | Place it inside a wider explanatory graphic rather than treating it as the main visual feature. Keep “illustrative” unmistakable. |
| Calculator count-up | Configured but not integrated in inspected results | `resources.results` is enabled, but the Resources route renders formatted result text directly; browser inspection found no FX islands on that page ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [calculator module](https://solvurax.com/assets/Resources-DaCYwDNP.js)). | Wire the animation to display values without changing formulas, precision or final formatting. |
| Investor markets marquee | Working | `investors.markets` reached `live`, with the regional text and a visible pause control ([Investors](https://solvurax.com/investors), [route module](https://solvurax.com/assets/Investors-BJRlBgky.js)). | Upgrade to geographic storytelling; a moving list alone does not establish a distinctive visual identity. |
| Shiny labels | Disabled | `global.eyebrows` is false ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js)). | Low priority. A single scan/reveal treatment is more useful than enabling shimmer everywhere. |
| Loading skeletons | Available, production placement not established | The skeleton loader and enabled flag exist, but the inspected Resources module does not render skeletons. No site-wide coverage claim is justified by this audit ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [calculator module](https://solvurax.com/assets/Resources-DaCYwDNP.js)). | Document exact placements; use only for real loading, not artificial waiting. |
| Contact copy feedback | Mounted live | `contact.copy` renders a real labelled copy button and a polite live-status region ([Contact](https://solvurax.com/contact), [route module](https://solvurax.com/assets/Contact-DJ4COIRz.js)). | Retain; cross-browser clipboard behaviour remains a separate acceptance check. |
| Data-room steps and beam CTA | Working in inspected session | Both `dataroom.steps` and `dataroom.cta` reached `live`; the current CTA label is “Go to the private area” ([Data room](https://solvurax.com/data-room), [route module](https://solvurax.com/assets/DataRoom-HOhfKCfI.js)). | Keep the access explanation and improve the surrounding visual scene without changing the access workflow. |
| Hero beam CTA | Flag enabled, no matching homepage placement found | The config includes `home.hero.cta`, but the inspected homepage contains pathway chips rather than an instance with that FX ID ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [homepage](https://solvurax.com/)). | Keep the existing hero actions; do not add another hero CTA in this phase. |
| WebGL globe | Loader exists, no production use observed | A `globeLab` loader exists; no active globe was observed in the audited homepage. The earlier pilot deliberately kept it experimental ([configuration](https://solvurax.com/assets/hydrate-QOdbU672.js), [homepage](https://solvurax.com/)). | Remains outside the selected five-component scope. Use World Map on Investors, not a globe in the hero. |

### Useful work that should not be lost

Reduced-motion handling worked in the sampled mobile homepage test: all 12 inspected FX islands were `off`, the hero video had no assigned playback source, and the H1 remained readable. This is a good foundation, but it is not proof that every route and interaction has passed an accessibility audit ([homepage](https://solvurax.com/)).

The delivered CSS now scopes effect utilities to `[data-sx-fx]`, which was one of the important risks in the original integration discussion. Keep that separation when introducing sources from other libraries ([deployed stylesheet](https://solvurax.com/assets/index-B7Qh5HoR.css)).

## Why the site still feels restrained

My visual assessment is that the page changes too little as the visitor moves through it. Repeated rectangular text cards, repeated heading reveals and low-contrast hover decoration do not create the sense of depth and progression you liked in the reference.

There are four separate causes:

- **Invisible effects:** The two background integrations have zero-height containing wrappers. A component can be technically running while contributing nothing visible.
- **Wrong interaction for the desired result:** A mouse-following highlight does not make a card turn into view during scrolling. That requires a separate scroll-to-transform mapping.
- **Missing major sequences:** The richer workflow timelines are disabled, while the site has not yet gained a replacement scroll-led narrative.
- **Over-constrained art direction:** The first brief deliberately stripped out shadows, larger movement and more expressive styling. That protected the original P55 appearance, but it no longer matches the present request.

The live stylesheet still uses the old dark green accent `#58a62b` and 2px radius. That is a measured production fact, not a fresh endorsement of those values; reconcile the older P55 rules with the separate brand-alignment decisions before hard-coding another generation of effects ([current stylesheet](https://solvurax.com/assets/index-B7Qh5HoR.css)).

## Recommended direction: a visibly technical African carbon platform

The following is a design proposal, not a description of existing functionality. I would aim for **an editorial technology showcase with depth, moving data paths and geographic context**, rather than a generic SaaS template or a collection of unrelated animations.

### Hero: preserve the current video

The user has explicitly chosen to keep the existing hero video. Retain its current treatment and put the stronger technical visual identity in the sections immediately below it and on the inner pages.

Do not introduce the previously suggested split-layout hero, map overlay, WebGL globe or data panel. This phase should be demonstrably identical in the hero before and after implementation, apart from unavoidable differences between captured video frames.

Geographic paths must represent approved coverage or be labelled illustrative. Do not imply operational transactions, live issuance, registry partnerships or verified data flows merely because an animation makes them look plausible.

### Service cards: actual scroll-turn entrances

Implement an owned `SxScrollTurnCard` around the current content. A proposed desktop starting preset is `rotateX: -65deg → 0`, `translateY: 100px → 0`, `scale: 0.94 → 1`, with approximately 1200px perspective and the transform origin at the top edge.

Tie progress to scroll position rather than a timed on-entry animation. Keep the outer measuring wrapper untransformed and animate its inner card. For the homepage grid, stagger by row or pair; do not make all four narrow cards tumble simultaneously.

This is a deliberate exception to the earlier 21px travel limit. For small screens, use a shorter 20–30px entrance or a much smaller tilt; for reduced motion, show the fully readable final state.

### Approach: the main scroll-led sequence

Use React Bits Scroll Stack for the six existing stages on Approach. Use Aceternity Sticky Scroll Reveal separately on Developers, where it explains the technical narrative rather than repeating the same six-stage process.

As the user scrolls through Define, Collect, Check, Structure, Coordinate and Reconcile, let the cards stack and the active stage become visually prominent. Preserve ordinary document flow on short screens and keep every stage reachable by keyboard and anchor links.

### Integrity: animate the provenance chain

Create a diagram connecting source material, documentation, checks, transaction preparation and counterpart access. Animate paths and evidence packets between these nodes so the scene explains what the business does, rather than decorating a paragraph.

Keep independent verification and issuance visibly separate from Solvura-X's own role. Use labels rather than third-party logos unless those assets and implied relationships are approved.

### Markets and pathways: visual depth, not only text movement

Replace or supplement the regional marquee with a geographic coverage visual and animated paths. For the four audience pathways, use art-directed images or simple diagrams with masked reveals, a modest perspective response and a distinct focus/hover state.

The cards should look different because their content and composition differ, not because each imports a different animation library. A consistent treatment of edges, lighting, spacing and transition timing will feel more premium than maximum effect variety.

### Supporting effects

- **Section titles:** One reusable line-mask reveal, with stronger treatment reserved for two or three major statements.
- **CTA feedback:** A short border trace, directional arrow movement or magnetic response on pointer devices.
- **Calculated results:** Animate the display to the exact final value and optionally animate a meaningful visual comparison; never fabricate market activity or animate every intermediate number for screen readers.
- **Section navigation:** A thin progress track tied to real page sections, with active labels on longer pages.
- **Route changes:** A short transition after navigation resolves; no artificial loading screen.
- **Texture and lighting:** Allow restrained grain, soft edge light and real depth shadows where the agreed brand permits them.

## Selected additional free components

All five entries below are selected for the next implementation scope. Their documented behaviour informed the recommendations, but this document update does not mean they have been implemented or performance-tested in the live project.

| Candidate | What it adds | Recommended Solvura-X use | Selection advice |
|---|---|---|---|
| Aceternity Container Scroll Animation | A 3D rotation tied to scroll ([demo/docs](https://ui.aceternity.com/components/container-scroll-animation)). | Homepage service cards below the hero. | Adapt its motion to the existing content and layout, rather than copying its default framing. |
| React Bits Scroll Stack | Cards pin and accumulate into a dimmed stack while scrolling ([demo/docs](https://www.reactbits.dev/components/scroll-stack)). | Six-stage Approach process. | Use the documented free component, not the similarly named Pro version. Check scroll dependencies before adopting. |
| Magic UI Animated Beam | Animated light follows connector paths between referenced elements ([demo/docs](https://magicui.design/docs/components/animated-beam)). | Homepage provenance and integration diagram. | Use approved labels and accurately separate Solvura-X's role from third-party verification and issuance. |
| Aceternity World Map | Programmatic map with animated lines and dots connecting geographic coordinates ([demo/docs](https://ui.aceternity.com/components/world-map)). | Investors market-connections section, outside the hero. | Use approved coordinates and sourced geography; route animation does not imply a live transaction. |
| Aceternity Sticky Scroll Reveal | A visual panel remains sticky as explanatory text changes with scrolling ([demo/docs](https://ui.aceternity.com/components/sticky-scroll-reveal)). | Developers MRV/data-interoperability narrative. | A separate scene from the Approach stack; do not duplicate the six process stages. |

### Licence distinctions that matter

- **Magic UI:** The public repository describes the component library as free, open source and MIT. Retain notices and verify the exact file and dependencies when copying it ([repository](https://github.com/magicuidesign/magicui)).
- **React Bits:** Its licence is MIT plus Commons Clause, not unrestricted MIT. It permits commercial application/website use but prohibits selling, sublicensing or redistributing the components themselves, including bundles and ported versions; use within your own site is different from publishing a reusable component pack ([licence](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md)).
- **Aceternity:** The official catalogue identifies the listed components as free for personal and commercial projects. Its terms restrict redistribution and marketplace/template use; do not label the entire offering “MIT,” and inspect downloaded file-specific terms before reuse ([free catalogue](https://ui.aceternity.com/llms-full.txt), [licence](https://ui.aceternity.com/licence)).
- **Internal wrappers:** Keep your own integration API separate from vendored source and record provenance, licence, modifications and dependencies. Do not redistribute a public “Solvura-X component library” containing restricted third-party components without checking the rights.

There is no need to buy a Pro library for this direction. For the scroll-turn itself, a small original wrapper using the motion engine already shipped by the site may be simpler than adopting another component with its own scrolling system.

## Implementation priorities for OpenCode

### Repair before expansion

1. Fix non-hero background island geometry where it is part of the selected work. Anchor each background to a genuinely sized section and allocate a non-zero drawing area. Do not activate the currently invisible hero-grid overlay in this phase.
2. Distinguish decoration from content islands. `contain: layout paint` must not blindly clip a background, 3D transform, glow or sticky sequence.
3. Document misleading or disconnected flags and whether each has a real route placement. Leave the hero CTA unchanged. Calculator count-up and skeleton coverage remain follow-up fixes, not substitutes for the five selected additions.
4. Verify fallback/live layout parity. In this session, service cards measured approximately 370px before activation and 406px after activation; reproduce under controlled conditions and fix layout differences before claiming zero shift. This is an observed geometry difference, not a measured CLS score ([homepage](https://solvurax.com/)).
5. Review global scroll snapping before adding scrubbed scenes. The current delivered bundle includes a desktop section-settling routine using smooth programmatic scrolling; it is not the requested 3D card rotation and should not fight a new scroll-linked sequence ([delivered application](https://solvurax.com/assets/hydrate-QOdbU672.js)).

### Build the signature interaction first

Create a side-by-side preview of the current service cards and the new Container Scroll-based turning treatment. Show desktop, mobile and reduced-motion versions, then implement Scroll Stack separately on Approach with the existing six steps.

Acceptance must be visual as well as technical: the rotation should be obvious during a normal scroll, track the user's movement, settle without clipped corners, and preserve readable final content. A feature flag set to true is not an acceptance result.

### Introduce the other three selected scenes

Design the Animated Beam provenance diagram, Investors World Map and Developers Sticky Scroll Reveal as a coherent family. Use the final agreed Solvura-X palette, typography and a consistent vocabulary of paths, labels and evidence blocks.

Build all three in their assigned sections:

- **Home:** Animated Beam clarifies the provenance/integration story.
- **Investors:** World Map explains approved geographic relationships without replacing the hero video.
- **Developers:** Sticky Scroll Reveal connects approved technical explanations to changing visuals, retaining the terminal illustration where it adds value.

### Add supporting motion and measure

Reuse the same motion engine for entrances, turns, counts and transitions. Deduplicate `motion`/`framer-motion` dependencies rather than shipping parallel animation runtimes. Do not add GSAP, Lenis or a WebGL stack by default merely because an imported example uses them.

Preserve ordinary page scrolling and static HTML readability. Lazy-load expensive visuals, pause loops off-screen and in hidden tabs, expose pause controls for persistent movement, and provide static alternatives for reduced motion and constrained devices.

The earlier fixed bundle targets remain useful starting points, not proof of current compliance. Establish a new baseline and measure actual incremental download, interaction responsiveness, layout stability and frame cost for each proposed scene.

## Decisions to carry into the next brief

- **Visual ambition:** Stronger, more noticeable motion is now the goal. Do not use the earlier “minimal movement only” language to suppress the requested scroll-turn experience.
- **Brand precedence:** Resolve the old P55 sharp/lime defaults against the separate brand-alignment brief. Effects must use the agreed tokens, not choose their own palette and geometry.
- **Protected hero:** Preserve the current hero video and its treatment; do not replace it, redesign it or add an animated overlay.
- **Selected scenes:** Implement all five selected components in the distinct placements above. Scroll Stack and Sticky Scroll Reveal are both included, but not on the same content.
- **Trust boundary:** Diagrams and terminal output must not imply capabilities, live data, partnerships or operating maturity that have not been established.
- **Scope:** This audit does not change the live site or the hub. Production release, approved copy and authenticated access workflows remain separate decisions.

## Recommended outcome

Keep the current hero video and useful Lightswind integration. The next iteration should give visitors a clear, memorable progression beyond that hero: **turning service cards, a stacked Approach process, animated provenance connections, an Investors market map and a sticky Developers narrative**.

That would be a substantially more animated and distinctive Solvura-X experience without turning every screen into an effects showcase.
