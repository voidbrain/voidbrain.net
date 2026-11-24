# voidbrain.net design

How the site works, for someone changing it. The rules live in code; this document describes them and names where each one is. Numbers and tables that the code owns are linked, not copied. Anything below marked **planned** is not built yet and is owned by the backlog record named next to it.

| What | Source of truth |
|---|---|
| The page shell: state, URL hash, switcher, keys, swipe | [`src/app/app.ts`](../src/app/app.ts), [`src/app/app.html`](../src/app/app.html) |
| States, their order and hash parsing | [`src/app/core/states.ts`](../src/app/core/states.ts) |
| The page text per state | [`src/app/core/content.ts`](../src/app/core/content.ts) |
| The poster layout | [`src/app/poster/`](../src/app/poster/), layout and tokens in [`src/styles.scss`](../src/styles.scss) |
| HUD value generators | [`src/app/core/hud.ts`](../src/app/core/hud.ts); components in [`src/app/hud/`](../src/app/hud/) |
| Self-model poses | [`src/app/core/pose.ts`](../src/app/core/pose.ts); the three.js figure in [`src/app/figure/self-model.ts`](../src/app/figure/self-model.ts) |
| Legacy path rules | [`public/.htaccess`](../public/.htaccess), [`public/old/.htaccess`](../public/old/.htaccess), tested by [`tools/test-legacy-paths.mjs`](../tools/test-legacy-paths.mjs) |

## The idea

voidbrain.net is **one static page** (Angular, built to plain files) that replaces the old PHP site at the same host. The page has **three states**, each a full-screen poster in the anti-design / cyberpunk style of the reference posters (see [style guide](STYLE-GUIDE.md), "Art direction"). The pairing of state and palette was left to the agent by the owner on 2026-11-24 (F-003):

| State | What it shows | Ground | Display face | Figure | Self-model pose |
|---|---|---|---|---|---|
| **work** | the developer: about, career timeline, stack | acid green | Black Ops One (stencil) | right, middle | head tilted towards a screen, glasses |
| **play** | FPV freestyle, maker projects, sports | safety orange (the visor poster) | Rubik Glitch | left, high | FPV goggles with an antenna, follows the pointer |
| **sleep** | quiet: the Douglas Adams quote, links, the old site | paper white, green slab and marks | Major Mono Display (thin) | left, low | asleep, head tilted, sleep mask |

The text comes from the 2012 site, the earlier Angular attempt and Daniele's CV, **made fuzzy** on the owner's request (2026-11-24): no employer or client names, no exact dates, no town ("now →", "~10 yrs", "R&D lab", "Agency"). The play projects are invented and cryptic on purpose (NN_01 Latent drift…), and sleep's block is a made-up REM log; a paragraph can start with a link (sleep's "Leave a message after the beep" opens an e-mail to info@voidbrain.net). Decorative fillers (logs, lorem) are generated. Contact and personal details beyond the public links stay out ([AGENTS](../AGENTS.md), "Privacy"; a spec checks it).

Each state is a **portrait poster sheet**, in the manner of a film poster (locandina), dense and overlapping (owner, 2026-11-24): a giant word behind the figure (outlined FULL STACK, a faint FPV, a green slab with zzz), the headline over the figure or down the right edge, the text packed in a broken grid, the timeline on a black block that may cover the figure, and on top of everything a layer of small white marks and symbols (green on the white poster) with a barcode. On screens 1100 px and wider the whole page is one screen with no page scrollbar: the sheet takes the height left by the bars, its width is 0.84 of that height, and every size inside it follows its width (`cqw`), so the poster scales as one picture; text keeps a readable minimum, and on a short window the sheet scrolls inside. Sleep is the exception: the owner kept it as it was, so its sheet keeps the earlier width (`min(860px, max(620px, 84dvh))`) and fixed sizes, and scrolls inside when it is taller than the screen. The two neighbouring states stand at the sides, as in the reference triptych, each with a big arrow and its name (◀ WORK, PLAY ▶), sleep with its symbols instead (ZZZ in Major Mono Display, owner's choice); clicking one switches to it. The foot lines are word lists with one colour per word (owner, 2026-11-24): work WEB · APP · AI · IOT and play FLY CRASH REPEAT in muted tones (ink, ink mixed into the ground at two strengths, outline; no white or neon), no animation; sleep keeps its single ink word. The bottom bar says "← → to switch" with a mouse and "swipe to switch" on touch screens; swipe was checked in Chrome's iPhone 13 and touch emulation. Narrower screens show the sheet alone, stacked: figure, then text. The layouts are container queries on the sheet in [`src/styles.scss`](../src/styles.scss).

How the page behaves:

- One state is shown at a time. The current state is in the URL hash (`/#work`, `/#play`, `/#sleep`; no hash or an unknown one opens work), so it can be linked and the back button works.
- Focus: the skip link focuses the poster heading without touching the hash; when the poster that holds focus is replaced, focus moves to the new heading. In-page anchors never change the state, only `#work`, `#play`, `#sleep` or no hash do.
- Switching slides the sheet in from the side it comes from (from the right going forward, from the left going back).
- Switching: the three buttons in the top bar, the ← → buttons in the bottom bar, the side sheets on wide screens, the arrow keys anywhere (unless a focused HUD piece uses them), and a horizontal swipe on touch screens. The figure blends to its new pose. With `prefers-reduced-motion` all of this is a cut.
- The self-model loads lazily (`@defer` on idle, or after 2.5 s at the latest), so the first paint never waits for three.js. Until then, or without WebGL, an ink silhouette stands in.

## HUD components

Decided by the owner on 2026-11-24 (F-005): **the HUD pieces are animated, with no real data.** Charts, the Game of Life, the terrain and the terminal show generated values; nothing is fetched and no data source is connected.

- Values come from seeded generators in `src/app/core/hud.ts` (sine sums, random walks, glyph grids, a QR-shaped pattern, sphere wireframes, fake log lines), so the same seed gives the same motion and a spec can check it. One shared clock (`src/app/hud/clock.ts`, about 30 ticks a second) drives them; it stops while the tab is hidden and with reduced motion.
- Labels never claim a real measurement: no "flights this year: 342" or "commits today". Captions are texture (`CPU_SIM`, `VTX_CH5`, `NULL_PAYLOAD`), not statistics.
- Interaction changes the animation, not information: hover or Space freezes, drag or arrow keys scrub or turn, Enter or a click reshuffles or prints the next line.
- For assistive technology each piece is one focusable group with `aria-roledescription="decorative animation"` and a label that names its keys ("CPU_SIM: animated signal chart, decorative. …"); the generated numbers are not read out. (A focusable `role="img"` with key actions was replaced after review: screen readers in browse mode swallow its keys.)
- With `prefers-reduced-motion` each piece shows one still frame.

The pieces: signal chart, wire sphere, wire cube, height map (terrain flown over), Game of Life, radar, glyph matrix, terminal log, fake QR. The calendar strip of the first version was dropped on the owner's request (2026-11-24); the Game of Life took its place in the orange poster.

## Legacy paths

The new page is deployed into the **same Apache docroot** as the old site. Decided by the owner on 2026-11-24 (F-002):

1. **Every old page redirects (301) to the home page `/`**, so search engines move their links to the new page: `/home`, `/about`, `/about/me`, `/about/work`, `/labs`, `/labs/<name>`, `/contacts`, any other path without an extension, any missing `.php`, the old query-string form (`/?url=about/me`) and the old entry points (`/index.php`, `/sitemap.php`).
2. **The old site keeps running under `/old/`** (for example `/old/about/work`), with its own routing rebased to `/old/` ([`public/old/.htaccess`](../public/old/.htaccess)). It is not indexed: `X-Robots-Tag: noindex` and `Disallow: /old/` in `robots.txt`.
3. **Folders the old rules excluded stay reachable, as they are**, with their own rules: `admin`, `cgi-bin`, `min`, `maiko`, `misc`, `include`, `extradry`, `hammer`, `js`, `laura`, `support`, `style`, `fonts`, `base`, `img`, `temp`, `templates`, `test`, `pasubio`, `cube`, `uBoard`/`uboard`, `inc`, plus `grover`, `summer2020`, `template` and `wip`, which exist on the server but were missing from the old list, and the files `BingSiteAuth.xml`, `googleba637e5c36f03a69.html`, `humans.txt`.
4. `/api/…` and `/old/api/…` answer `410 Gone`; a missing file with an extension gets the new [404 page](../public/404.html); dotfiles (`.git`, `.env`, …) are refused everywhere, inside legacy folders and `/old/` too (the dotfile rule runs before the pass-through).
5. Directory listing is left as the host has it today: `Options -Indexes` can answer 500 on hosts that do not allow `Options` in `.htaccess`, so it is checked on the live host first (F-007).

`npm run build && npm run test:legacy` checks all of it on a real Apache (macOS `httpd` locally, `apache2` in CI): 122 requests against the build, stub copies of every legacy folder, and a stub old site under `/old/`. The legacy folder list in the test is an outside fact (the server's listing on 2026-11-24): update it when the server changes.

### Deploy steps

On the server, once (F-007 decides how the upload happens):

1. Copy the whole current docroot into a new folder `old/`. With SSH, in the docroot: `mkdir old && rsync -a --exclude=/old ./ old/`. With FTP only: download the docroot and upload it again into `old/`. The old site then runs from `/old/` with its database settings unchanged.
2. Upload the contents of `dist/voidbrain-net/browser/` to the docroot **without deleting anything**. This adds `index.html`, the bundles, `media/`, `404.html`, `robots.txt`, `sitemap.xml`, `favicon.ico`, and replaces the root `.htaccess` and `old/.htaccess`.
3. Check: `/` shows the new page; `/about/work` redirects to `/`; `/old/about/work` shows the old page; `/grover/` and `/extradry/` work as before.
4. Optional, later: remove the old root `index.php` and `sitemap.php` (the rules already redirect them).

Constraints this places on the build (also in [AGENTS.md](../AGENTS.md), "Known pitfalls"): nothing in `public/` may have the name of a legacy folder (`test:legacy` fails otherwise), and Angular's own output folder `media/` is new to the server.

## Self-model asset

The figure is a procedural placeholder built in code (F-004): a faceted head, neck and shoulders, and one prop per state. A style test, off by default (owner, 2026-11-24): `?figure=manga` draws the placeholder as a manga ink drawing (halftone screentone, hatching, a thick outline), for example `/?figure=manga#play`. A second test with a scanned human head was tried and dropped (owner: not what was wanted). The reference posters are not used as a source: they are a licensed stock image. The real 3D model of Daniele is the owner's to make. The steps:

1. **Capture.** Make a head-and-shoulders scan, for example with a phone photogrammetry or LiDAR app (Polycam, Scaniverse, RealityScan), about 60–100 photos all around in soft, even light, a neutral expression. Or commission or sculpt a stylised model from photos.
2. **Clean up** in Blender: remove the background, close holes, reduce to about 50–80 k triangles, one material. Add the props as separate objects: glasses (work), FPV goggles (play), a sleep mask (sleep).
3. **Pose or blend shapes**: either three separate posed files, or one rigged model with three named poses `work`, `play`, `sleep`.
4. **Export** as glTF binary (`.glb`) with Draco compression, under 3 MB in total. Strip any location metadata from the source photos before they leave the phone; the photos themselves never enter the repository.
5. **Hand over**: put the `.glb` files in `public/models/` on a branch, or send them, and say whether the style is realistic or stylised.

Expected result: the model loads in <https://gltf-viewer.donmccurdy.com/> without errors, and its file size is under the limit above.

## Open decisions

The owner decides these; each is a 🧑 Decision in [the backlog](BACKLOG.md).

- **F-007**: how the build reaches the Apache host (FTP/SFTP upload by hand, or a CI deploy with a secret), and whether `main` gets branch protection with the `CI` workflow required. The code is on GitHub at `voidbrain/voidbrain.net` (owner, 2026-11-24); its earlier Angular attempt stays in the history and on the `gh-pages` branch.

## Tests

- Unit (Vitest, `npm test`): the state model and hash parsing, the HUD generators and their clock (frames advance, none are scheduled with reduced motion), the poses and their blending, the privacy of the page text, and, across the shell, the poster, the hash and the HUD pieces: opening a hash, buttons, arrow keys (and HUD pieces keeping their own arrows), hash changes, every HUD piece being a labelled, focusable decorative group, the skip link keeping the state, and focus moving to the new heading.
- Apache (`npm run test:legacy`): every legacy path rule, above.
- Not covered by an automated test: the three.js figure (needs WebGL) and the look of the posters. They were checked in Chrome on 2026-11-24 (desktop 1440 × 900 and iPhone 13 emulation: render, no horizontal scroll, no console errors, reduced motion stops the animation); the owner's visual check is in F-003 to F-005.
