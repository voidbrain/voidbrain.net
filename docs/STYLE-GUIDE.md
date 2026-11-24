# voidbrain.net style guide

How the site looks and talks, and how this repository's documents are written. Read it before changing UI (templates, component styles, global styles, user-facing text). The values live in code: CSS custom properties on `:root` in [`src/styles.scss`](../src/styles.scss). When this guide and the code disagree, the code is what ships: fix whichever is wrong and record the discrepancy in the backlog if it is not fixed in the same change.

**Current state (2026-11-24):** the code ships no tokens yet. `src/styles.scss` is empty and the page is still the Angular welcome screen, whose own `--…` colours in `src/app/app.html` are scaffold leftovers, not tokens: they are removed with the welcome screen (F-003). The tokens and type below the art direction are planned in F-006; until then this guide states the rules they must follow.

## Art direction

voidbrain.net is Daniele's personal site: a developer who flies FPV. The look is **anti-design / retro-futurist cyberpunk poster**: each of the three states (work, play, sleep; see [design](DESIGN.md)) is one full-screen poster.

What makes the posters (from the owner's reference board, three cyberpunk posters):

- **One flat, loud ground per poster**: safety orange, acid green, or paper white. Black does all the drawing on top of it; one accent at most (lime on the white poster).
- **A central figure**, here the 3D self-model, cropped at the shoulders, with a prop that tells the state (FPV goggles in play).
- **Distorted display type**: a wide, glitchy, stretched or blackletter-tech headline at the top, a second one at the bottom, often running past the edge.
- **HUD furniture around the figure**: date strips, numbered calendar boxes, wireframe spheres and grids, a QR code, arrows, hazard stripes, barcodes, small monospaced captions, a terminal snippet, a pixel smiley. Each piece here is an animated, interactive component (F-005), not decoration baked into an image. Its values are generated, never real data ([design](DESIGN.md#hud-components)).
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

No colour tokens ship yet (F-006). When they do, they are defined on `:root` in `src/styles.scss`, one set per state, and listed here:

| Token | Value | Use |
|---|---|---|
| — | — | none defined yet (F-006) |

- Use tokens (`var(--…)`), never a new literal colour. A new colour is a new token, added here in the same change.
- Change fill and foreground as a pair, and check contrast (WCAG AA: 4.5:1 for text, 3:1 for large text and UI parts). Black on orange, acid green and white all pass; small lime text on white does not.

### Type

No web fonts are loaded yet; the browser default applies. Planned (F-006): one display face for the distorted headlines and one monospaced face for HUD captions and the terminal, both self-hosted under `public/assets/fonts/` with a licence that allows web use.

### Spacing and layout

Not defined yet (F-006). Each state fills the viewport (`100dvh`); the layout must work from 360 px wide phones to wide desktops without horizontal scrolling.

### States and motion

- Hover, active, selected, disabled and focus each have one treatment. Focus is always visible on every ground colour.
- Respect `prefers-reduced-motion`: the state switch becomes a cut, the model stops idling, glitch effects stop.

## Components

None yet beyond the scaffolded root component. Each shared component (state switcher, chart, calendar strip, QR block, terminal) gets an entry here when it is added: what it is for, its source file, its variants.

## Accessibility

- Every interactive element is reachable and operable by keyboard, with a visible focus and an accessible name.
- Colour never carries meaning alone. Text meets WCAG AA contrast on its real background.
- The 3D model has a text alternative describing the pose; HUD charts are decorative: one accessible name each ("animated signal chart, decorative"), their generated values are not read out.
- Images that carry meaning have alt text; decorative ones have `alt=""`.

## Assets

- Everything in `public/` is copied to the server's docroot. Never name a file or folder there like a legacy folder (`img`, `js`, `fonts`, `style`, …): see [design](DESIGN.md), "Legacy paths". Use `public/assets/` and `public/models/`.
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
