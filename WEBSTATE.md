# WEBSTATE

## Scope
- This file tracks web-specific work under `docs/Website/`.
- Keep all paths in this file relative to `docs/Website/` so the folder can move intact.

## Current Files
- `index.html`: landing page for Digital Fabric website.
- `agentic-digital-thread-3d.html`: flagship spatial digital-thread command center with a live Three.js scene, mode controls, and synchronized precision panels.
- `mendix-nx-architecture.html`: Mendix + NX architecture presentation.
- `teamcenter-mcp-architecture.html`: Teamcenter MCP architecture presentation.
- `teamcenter-graph-experience.html`: Teamcenter graph architecture and routing reference deck.
- `teamcenter-graph-motion-study.html`: cinematic graph materialization narrative study.
- `alpine-digital-thread.html`: digital-thread story page with a sticky cinematic product stage and rescue-UAV scenario.
- `framer-scroll-study.html`: ambient motion-study page now carrying real platform-architecture content across five themed beats.
- `styles/fabric.css`: shared design tokens and utility styles.

## Current Direction
- Visual tone: dark, technical, premium â€” slightly warmer and more vibrant than the original cold palette.
- UX goal: architecture diagrams should be understandable at a glance, then reveal more detail in-place without forcing page scanning.
- Interaction goal: prefer embedded diagram interactions over floating detached overlays.
- Content goal: clearly distinguish validated reference architectures from clearly labeled experience-lab pages.
- Indexing goal: all catalog entries use sequential numbering (01-10), with one global nav model (Home, Mini Sites, References, NX MCP, About) used across the homepage and section pages.

## Implemented So Far
- Landing page has animated grid hero, reveal-on-scroll cards, presentation catalog, and about section.
- Landing page now includes mouse-follow lighting, sticky section behavior, and subtle parallax card motion.
- Landing page motion was rebalanced into a subtler hero-first depth treatment: the hero carries the zoom-like transition, while catalog and cards now move more lightly so the page feels cinematic without becoming floaty.
- Landing page information hierarchy was reworked so the eye has a clearer reading path: the hero now surfaces quick orientation signals, the catalog explicitly separates live references from in-development studies, and the two live decks are presented as the primary entry points instead of sharing equal weight with planned topics.
- Mendix presentation has 5 pages: overview, three-plane architecture, AWS infra, end-to-end flow, release trains.
- Teamcenter presentation has 5 pages: overview, SOA architecture, supply chain intelligence, change flow, BOM/3D.
- Diagram text readability improved with text halo and reduced connector prominence.
- Animated flow paths in Mendix are reordered behind nodes to reduce label collisions.
- Both presentation decks now use inline per-diagram focus panels with local Fit / Zoom controls and node click-to-zoom.
- Mendix deck now uses a guided architecture walkthrough on the three-plane page and step-driven camera motion on the walkthrough pages.
- Diagram inspector content now uses horizontal card space on wide screens instead of always pushing extra content below the diagram.
- Mendix deck now has an executive-ready Level 0 architecture section that lists the paid products and AWS services involved.
- Mendix step/scenario controls were rewired with explicit JS listeners instead of depending on inline state expressions.
- Mendix end-to-end flow and release-train walkthrough pages were redrawn as left-to-right technical diagrams while preserving the existing node and flow IDs used by the walkthrough logic.
- Mendix walkthrough pages now use a diagram-first layout: the SVG stage stays primary, the inline focus panel no longer steals horizontal space from the diagram, and Fit/background resets restore local diagram context instead of feeling like a whole-page reset.
- Mendix Diagram 01 now uses a two-state deck with a slide-style switch between the executive snapshot and the guided walkthrough, so the page no longer stacks both views and forces immediate scroll.
- Mendix walkthroughs now keep the whole diagram in frame by default and rely on stronger glow/highlight states plus concise beat copy underneath the diagram instead of aggressive camera moves.
- Mendix page chrome and stage sizing were tightened again so headers, padding, and diagram cards waste less vertical space and the architecture stage lands higher on the page.
- Release-train walkthrough side-panel content now frames each scenario as a deployment story, and the interactive split is pinned so the diagram card stays aligned with the scenario panel instead of dropping below it.
- Walkthrough storytelling is now more dynamic on the release-train page: the scenario summary updates by step, and walkthrough zoom framing now includes active flow paths so both ends of a highlighted connection stay visible more often during camera moves.
- The latest layout correction makes the diagram pages literal instead of interpretive: full-width stage first at the top, title and explanatory copy underneath, and stretched diagram cards so they no longer shrink left in vertical layouts.
- Mendix walkthrough pages now use animated in-diagram tour popups for the active step, so the explanation is anchored inside the SVG stage like a product tour instead of sitting in detached beat/info cards below it.
- Mendix popup cards were softened and normalized into friendlier, title-cased tour language so the walkthrough UI reads more like a guided product tour than a debug panel.
- Teamcenter interaction styling now follows the same calmer focus model: stronger highlight treatment, explicit clear-focus control, and no surprise node auto-zoom by default.
- Teamcenter diagram pages now use the same stage-first reading pattern as Mendix: full-width diagram first, concise editorial story panel underneath, then title/context below the stage.
- Teamcenter node exploration now uses the same anchored in-diagram popup card pattern as Mendix instead of the older below-diagram focus panel, so both decks share one interaction language.
- Landing page now includes a dedicated NX MCP story section covering verified benchmark work, generated design families, and a live NX-exported cargo ship benchmark asset.
- The NX MCP section now also calls out the tested operational behavior directly: benchmark scripts create fresh parts by design, existing-part workflows already exist through open/save operations, the current default save path is under `%USERPROFILE%`, and handler reload is real but narrower than full DLL hot swap.
- NX MCP has now been promoted from the quieter research pipeline into the live references area on the homepage, so the catalog reflects that it is a current, evidence-backed study rather than a future topic.
- Landing page now explicitly separates validated references, one clearly labeled experience-lab scene, and the quieter research pipeline.
- Mendix and Teamcenter focus cards now have more stage breathing room, scrollable card bodies, and edge-aware placement logic so popups are less likely to clip or cover the active node.
- Mendix end-to-end and release-train diagrams now route key connectors through open lanes instead of across intermediate nodes, making arrow direction easier to follow.
- Mendix and Teamcenter copy is now more explicit about reference-architecture framing versus benchmark-scenario framing so the pages read as grounded representations instead of product claims.
- Added `alpine-digital-thread.html`, a scroll-driven premium experiment that uses a snowy mountain as the anchor for a closed-loop Siemens engineering-change digital thread with a human in the loop.
- The alpine experiment has now been rebuilt around a sticky cinematic product stage instead of the earlier WebGL mountain orbit, with the mountain reduced to environmental framing and the rescue UAV plus digital thread restored as the main focus.
- The alpine experiment is now anchored to a concrete product example as well: an alpine rescue UAV moving through field issue intake, configured-product context, NX redesign, Simcenter verification, Teamcenter/Polarion change control, Tecnomatix/Opcenter handoff, and operational feedback.
- Alpine scroll behavior now synchronizes two side rails inside the stage: the left rail tracks the Siemens digital thread, while the right rail tracks the product iteration loop for the same rescue-UAV change.
- The rebuilt alpine scene now uses DOM/SVG motion instead of the earlier Three.js/WebGL stack, so the interaction is easier to tune, lighter on dependencies, and friendlier to reduced-motion fallbacks.
- The stage copy, rail buttons, and chapter stack now share one interaction model: scroll or keyboard/button jumps drive the same active beat, and the sticky stage updates focus, tools, human gate, and agent work in place.
- Added `framer-scroll-study.html` as a separate experience-lab page: a pure motion study with a sticky stage, a polished glass-like 3D object, sparse ambient beat labels, and a softer scroll rhythm with no dedicated business story.
- The framer study now uses local DOM/SVG/CSS/JS only, with continuous interpolation between ambient beats so the page feels more like a relaxed premium landing page than a storyboard.
- The framer study was then refined against GitHub Framer Motion patterns as well: longer beat sections create more scroll runway, the right-column cards were softened into lighter floating chips, and the orbit now carries a masked path glow so the motion system feels more focused and less busy.
- The framer motion study was rebuilt from generic camera-direction beats into five meaningful Digital Fabric platform beats: Foundation (governed infrastructure), Connection (tool bridges), Intelligence (embedded decisions), Orchestration (closed-loop execution), and Evolution (continuous improvement).
- The framer monolith focal object now contains an SVG node-connection graph inside its window element, replacing the empty glass visual.
- Design tokens across fabric.css and mendix-nx-architecture.html were warmed up: text2/text3 are slightly brighter, accent colors (teal, purple, amber, blue, coral) are more vibrant, and background grays carry a barely perceptible warmer tint.
- Homepage catalog numbering is sequential with the graph module split into two live entries: 01 Mendix, 02 Teamcenter MCP, 03 NX MCP, 04 Agentic Thread 3D, 05 Teamcenter Graph, 06-07 Experience Lab, 08-10 planned studies.
- Hero signal cards were rewritten for clarity: "3 References" instead of "3 LIVE", explicit "68 MCP operations" callout, "Interactive" instead of all-caps "INTERACTIVE".
- NX MCP tool count updated from 60 to 68 across the homepage to match the actual MCP server surface.
- Topbar navigation is now unified as five links across pages: References, Graph Experience, NX MCP, Experience Lab, About.
- Footer links updated to match the topbar structure.
- Homepage now has a dedicated `Mini Site Directory` section near the top that lists every mini-site with explicit representation labels (`Live Reference`, `Experience Lab`, or `Home Section`) so entry points are unambiguous.
- Global nav links are now standardized everywhere to: Home, Mini Sites, References, NX MCP, About.
- Deck hub-bars no longer hide global links on mid-width layouts; they wrap and stay visible, with compact behavior only on smaller screens.
- Full credibility sweep completed across all primary pages; content validated for correct Siemens product names, plausible technical claims, and properly qualified benchmark data.
- Added `agentic-digital-thread-3d.html` as a true spatial explorable layer: seven thread platforms, animated inter-zone routes, selectable packets/edges, and mode switching for Story / Explore / X-ray / Prompt.
- The new spatial page now follows the intended UX split: 3D center for orientation + progression, right-side precision panel for scenario, data flow, architecture, prompt, and approval details.
- The spatial page is model-driven (`ThreadStage` + `ThreadConnection` structure) so new scenario variants can be added without rewriting rendering behavior.
- Homepage graph module now leads with the new 3D command-center experience and keeps the graph architecture deck as the technical deep-dive companion.
- Unified global nav links were applied across topbars and deck hub-bars so every page now routes through the same site structure: References, Graph Experience, NX MCP, Experience Lab, About.
- Responsive nav handling was added across topbar pages (wrap/center behavior), and the 3D page includes an explicit mobile note that desktop gives best free-camera fidelity while mobile retains stage/panel inspection.
- Homepage outbound routing now explicitly covers all major section pages (including the graph motion study), and each section page has return navigation to the homepage anchors.
- `serve.ps1` now supports `-BindHost` so the static site can be exposed on LAN without any API key requirement.

## Known Gaps
- Homepage hierarchy is much clearer now, but typography/spacing may still need one more polish pass after real browser visual review.
- The popup-placement logic in diagram decks is stronger than before, but it still needs a browser pass across narrow and extra-wide viewports to confirm no new edge cases remain.
- Some diagrams may still need one more browser-tested pass for vertical fit and stage height, especially the tallest Mendix scenes.
- The rebuilt alpine experiment needs a real browser/performance pass to tune depth-motion feel, sticky-stage height, and narrow-screen rail behavior.
- Browser-side DOM or screenshot QA is still blocked by environment, so interaction verification remains code- and HTTP-based unless that access is restored.
- The warmed-up color tokens in fabric.css and mendix inline styles may need a visual QA pass to confirm the shifted tones feel cohesive across all primary pages.
- The spatial page now vendors Three.js and OrbitControls locally under `vendor/three/`, removing CDN dependency and avoiding external module-block issues.
- Mobile interaction on the spatial page is usable, but free-camera control quality remains best on desktop and needs real-device browser validation.

## Active UX Priorities
1. Run a browser visual pass across all primary pages to confirm the warmer theme looks cohesive.
2. Confirm the new popup placement model behaves correctly on narrow and extra-wide viewports.
3. Sweep for any remaining connector collisions after the latest Mendix reroute pass.
4. Apply the same clear reference-vs-experiment labeling to any future presentation pages from the start.

## Editing Notes
- Favor minimal file count growth; keep logic in current HTML files unless a shared script/style becomes clearly reusable.
- Preserve relative references within `docs/Website/`.
- When changing diagram interactions, ensure keyboard navigation and reduced-motion users still have a usable fallback.


