# voidbrain.net style guide

How the site looks and talks, and how this repository's documents are written. Read it before changing UI (templates, component styles, global styles, user-facing text). The values live in code: CSS custom properties on `:root` in [`src/styles.scss`](../src/styles.scss). When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

**Current state (2026-11-24):** the tokens, fonts and components below ship in code (F-003, F-005, F-006). The only literal colours outside `src/styles.scss` are in the standalone [`public/404.html`](../public/404.html), which loads no app CSS and repeats `--vb-black`, `--vb-orange` and `--vb-acid` (coupling in `.harness.json`).

## Art direction

voidbrain.net is Daniele's personal site: a developer who flies FPV. The look is **anti-design / retro-futurist cyberpunk poster**: each of the three states (work, play, sleep; see [design](DESIGN.md)) is one full-screen poster.

What makes the posters (from the owner's reference board, three cyberpunk posters):

- **One flat, loud ground per poster**: safety orange, acid green, or paper white. Black does all the drawing on top of it; one accent at most (green on the white poster).
- **A top layer of small white text and symbols** (green on the white poster) over everything, the figure included: crosshairs, arrows, stars, short codes, a barcode.
- **A figure placed differently on each poster**, not too big, here the 3D self-model cropped at the shoulders, with a prop that tells the state (FPV goggles in play).
- **A different display face per poster**, dense, overlapping and often vertical: a headline over the figure or down the edge, a second one at the bottom, a giant word behind the figure.
- **HUD furniture around the figure**: height maps, a wire cube, a Game of Life, wireframe spheres and grids, a QR code, arrows, hazard stripes, barcodes, small monospaced captions, a terminal snippet, a pixel smiley. Each piece here is an animated, interactive component (F-005), not decoration baked into an image. Its values are generated, never real data ([design](DESIGN.md#hud-components)).
- **Japanese / tech micro-copy** in small sizes as texture, never as the only carrier of meaning.

Do:

- Keep one ground colour per state, edge to edge. Black on top, high contrast.
- Let type and furniture overlap the figure and the edges; the grid is deliberately broken, but every text stays readable.
- Make every HUD element respond (hover, focus, drag) and explain itself to a screen reader.

Don't:

- Copy the reference posters, their characters or their artwork. They are a watermarked stock image (Adobe Stock 623907234): mood reference only, never shipped or committed.
- Use gradients, glows or neon-on-dark "generic cyberpunk". The references are flat print colours.
- Put meaning only in Japanese text, colour or a QR code.
- Label generated HUD numbers as if they were real statistics.

## Documentation ownership

This guide governs the site's UI and repository writing; [Backlog rules](BACKLOG-RULES.md) govern tracking. Backlog status/priority emoji are documentation cues, not site icons. README describes capabilities; AGENTS directs implementation. User instructions take precedence.

## Content and voice

- **Voice:** first person, short, dry, a little playful (the old site opened with Douglas Adams: "We will be restoring normality as soon as we are sure what is normal anyway."). No exclamation marks, no emoji in the UI.
- **Headlines** may be all caps or stylised by the display face; body and labels are sentence case. Capitals come from the text style, never typed.
- **Language:** English. (The previous Angular attempt had English and Italian; a second language is not planned.)
- Dates as `2026-11-24` or `24 NOV 2026` in the HUD style; times 24-hour.

## Visual foundations

### Colour

Defined on `:root` in `src/styles.scss`. The palette is five print colours; each state maps them to four roles, set on `<html data-state="…">` by the shell.

| Token | Value | Use |
|---|---|---|
| `--vb-black` | `#0a0a0a` | ink: all text, lines and the figure |
| `--vb-acid` | `#a6ff00` | work ground |
| `--vb-orange` | `#ff5a1f` | play ground |
| `--vb-paper` | `#f2f0ea` | sleep ground |
| `--vb-green` | `#2fbf00` | sleep marks layer (decorative symbols only) |

| Role | work | play | sleep | Use |
|---|---|---|---|---|
| `--ground` | acid | orange | paper | poster and bar background, canvas lines, text on ink |
| `--ink` | black | black | black | text, borders, the figure, pressed buttons |
| `--accent` | black | black | black | tag chips, hover fill |
| `--on-accent` | acid | orange | acid | text on `--accent` |
| `--mark` | white | white | green | the decorative marks layer |
| `--font-display` | Anton | Rubik Glitch | Major Mono Display | headlines and the giant back word |

The roles come from one Sass mixin per state (`tone-work`, `tone-play`, `tone-sleep`), applied to `<html data-state>` and to every element with `data-tone` (the sheet and the side sheets). Behind the sheets the page is `--vb-black`; the sleep poster also uses `--vb-acid` as the slab behind its figure.

Contrast (WCAG 2): black on acid 16.0:1, on orange 6.3:1, on paper 17.4:1; the reverse pairs are the same. The marks layer is decorative (`aria-hidden`) and below text contrast on purpose (white on acid, green on paper): it never carries text a visitor needs, and on narrow screens it covers only the figure.

- Use tokens (`var(--…)`), never a new literal colour. A new colour is a new token, added here in the same change.
- Change fill and foreground as a pair, and check contrast (WCAG AA: 4.5:1 for text, 3:1 for large text and UI parts).

### Type

Self-hosted from `@fontsource` (SIL OFL 1.1), Latin subset only, registered in `angular.json` "styles"; the build puts the files in `media/`.

| Token | Face | Use |
|---|---|---|
| `--font-display` | per state: Anton 400 (work), Rubik Glitch 400 (play), Major Mono Display 400 (sleep) | headlines, the back word and the side sheets (`.display`, `.back`); decorative, `aria-hidden`, except the sleep quote |
| `--font-mono` | JetBrains Mono 400 and 700 | everything else: body, labels, HUD captions, terminal |

Sizes: `--text-xs` 0.6875rem (labels, captions), `--text-s` 0.8125rem (body; 0.75rem on wide sheets), `--text-m` 1rem (state title), `--text-l` 1.375rem. Display sizes are in `cqw` (per cent of the sheet width) and set per state in the layout, from 9cqw (foot lines) to 46cqw (the back word). Labels and titles are uppercase with 0.08–0.12em tracking, from CSS. The Japanese state word (仕事, 遊び, 睡眠) is vertical texture, `lang="ja"` and `aria-hidden`.

### Spacing and layout

Spacing: `--space-1` 4px, `--space-2` 8px, `--space-3` 12px, `--space-4` 16px, `--space-5` 24px, `--space-6` 40px; `--gutter` `clamp(12px, 2.4vw, 28px)`; `--line` 2px (every rule and frame); `--bar` 52px (top and bottom bars); `--figure-h` `min(40dvh, 340px)` (the figure on narrow sheets).

Layout: top bar, hazard stripe, the stage, hazard stripe, bottom bar. The stage holds the portrait sheet (from 1100 px: `min(860px, max(620px, 84dvh))` wide, the neighbouring states at its sides). On a sheet 600 px or wider, a six-column grid per state places the text and HUD around a smaller figure in a different place for each state; items overlap the figure on purpose, on solid fills (black timeline block, HUD frames on the ground colour, headlines with a ground-coloured outline). Narrower sheets stack: figure, headline, text, timeline, HUD, foot. No horizontal scroll from 360 px up (checked at 390 px).

### States and motion

- Hover, active, selected, disabled and focus each have one treatment. Focus is always visible on every ground colour.
- Switching state: each poster layer enters with a stepped glitch (`poster-in`, `--switch-time` 420ms, `steps()`), the bars step to the new colour, the figure blends its pose.
- Respect `prefers-reduced-motion`: the state switch becomes a cut, the model stops idling, the HUD shows still frames, the terminal cursor stops blinking.

## Components

| Component | Source | What it is, and its interactions |
|---|---|---|
| Shell | `src/app/app.ts` | Bars, switcher (`.switch`, `aria-pressed`), stage, live announcement of the state. |
| Poster | `src/app/poster/` | One state's headlines, back word (`.back`), vertical line (`.vert`), text, tags (`.tags`), timeline (`.entries`), links (`.links`), HUD pieces and the marks layer (`.marks`, `.barcode`). |
| Side sheets | `src/app/app.html` (`.side`) | The neighbouring states at the sides from 1100 px: their ground and back word. Click switches; out of the tab order and hidden from assistive technology, since the switcher does the same. |
| Self-model | `src/app/figure/self-model.ts` | three.js figure (F-004), lazy. Colours from `--ink`/`--ground`. |
| Signal chart | `src/app/hud/signal-chart.ts` | Animated line. Hover or Space freezes, drag or ← → scrubs. |
| Wire sphere | `src/app/hud/wire-sphere.ts` | Turning wireframe globe. Drag or arrow keys turn it. |
| Wire cube | `src/app/hud/wire-cube.ts` | Two nested cubes turning against each other. Drag or arrow keys turn them, Enter or click swaps the bold one. |
| Height map | `src/app/hud/height-map.ts` | Terrain ridge lines flowing towards the viewer. Hover or Space freezes, drag or ← → steers, ↑ ↓ change the peaks. |
| Game of Life | `src/app/hud/game-of-life.ts` | Conway's Life on a wrapping 20 × 12 board, 6 generations a second. Hover or Space freezes, click flips a cell, Enter (or a dead board) starts a new one. |
| Radar | `src/app/hud/radar.ts` | Turning sweep lighting generated contacts. Hover or Space freezes, ↑ ↓ change the range, Enter or click finds new contacts. |
| Glyph matrix | `src/app/hud/glyph-matrix.ts` | Flickering glyph block. Hover or Space freezes, Enter or click reshuffles. |
| Terminal log | `src/app/hud/terminal-log.ts` | Fake scrolling log with a blinking cursor. Hover pauses, Enter or click prints a line. |
| Fake QR | `src/app/hud/fake-qr.ts` | QR-shaped pattern that encodes nothing. Enter or click redraws. |

Every HUD piece is a `.hud` frame (2px ink border, caption row) with `role="group"`, `aria-roledescription="decorative animation"`, `tabindex="0"` and a label saying "decorative" plus its keys; its own arrow keys do not switch the state. Decorative only: see [design](DESIGN.md#hud-components).

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name.
- Colour never carries meaning alone. Text meets WCAG AA contrast on its real background.
- The 3D model has a text alternative describing the pose (`POSTERS[state].figure`); HUD charts are decorative: one accessible name each ("animated signal chart, decorative"), their generated values are not read out.
- Images that carry meaning have alt text; decorative ones have `alt=""`.

## Assets

- Everything in `public/` is copied to the server's docroot. Never name a file or folder there like a legacy folder (`img`, `js`, `fonts`, `style`, …): see [design](DESIGN.md), "Legacy paths"; `npm run test:legacy` fails on one. Use `public/assets/` and `public/models/`.
- Fonts come from npm (`@fontsource`, OFL), not from `public/`; the favicon is the old site's.
- 3D models: glTF binary (`.glb`), Draco-compressed, under 3 MB in total (F-004).
- Strip location metadata from any photo before it is committed. Raw scan photos never enter the repository.
- Fonts and images need a licence that allows web use; record the source next to the file.

## Writing in this repository

- Plain English, short sentences, active voice. Say what is, not what might be.
- Name things as the code names them: files, functions, commands in backticks, linked when they are paths.
- Dates are absolute (`2026-11-24`), never "yesterday" or "last week".
- One owner per fact: link to it rather than restating it. AGENTS for how to work, the backlog for status, this guide for look and voice, README for what the site does, [design](DESIGN.md) for how it works.

## Keeping it in step

A change that adds or alters a token, a text style, a shared component or the voice updates this guide in the same PR. A design doc that disagrees with the code becomes a backlog record.
