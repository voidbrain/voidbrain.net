# voidbrain.net area notes

Detailed rules and lessons for each part of the project, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR.

Reviewers: `mechanical-reviewer` and `design-reviewer` (`.claude/agents/`) review any area; neither edits code.

## Core logic

- Code: `src/app/core/`: `states.ts` (order, hash, swipe), `content.ts` (page text), `pose.ts` (self-model poses), `hud.ts` (seeded generators for the animated HUD values).
- Plain TypeScript only: no `@angular/*` import (ESLint `no-restricted-imports` and `check:conventions`, `conventions.pureDirs` in `.harness.json`). Components call into it; it never calls into components.
- Every exported function has a spec next to it (`*.spec.ts`), run by `npm test`.

## UI shell and posters

- Code: `src/app/` outside `core/`; global styles in `src/styles.scss`.
- Read [docs/STYLE-GUIDE.md](../STYLE-GUIDE.md) first, and [Angular conventions](angular.md).
- Components stay thin: state and generated values come from `src/app/core/`. Generators are seeded and pure (a seed and a time in, values out), so a spec can check them; the component owns only the animation clock. One component per HUD element (chart, calendar strip, QR block, terminal), each keyboard-operable with an accessible name.
- three.js code (F-004) lives in `figure/self-model.ts`, started in `afterNextRender`, disposed in `DestroyRef.onDestroy`, and pauses its render loop when the tab is hidden or the figure is off-screen. three.js is imported only there and lazy-loaded (`@defer (on idle; on timer(2500ms))`; headless browsers never report idle), so the first paint does not wait for it.
- Lesson: the canvas is created in code, so the component's scoped CSS never reached it; on a phone (pixel ratio 3) it sized the figure box, the box resized the canvas, and the page grew to millions of pixels wide. Fixed by inline canvas styles and an absolutely positioned host; checked in iPhone 13 emulation.
- Lesson: a keydown can target the document itself, which has no `closest()`; the shell checks `instanceof Element` (covered by the arrow-key test in `app.spec.ts`).

## Legacy hosting

- Code: `public/.htaccess`, `public/old/.htaccess` and everything else in `public/`, which the build copies to the Apache docroot next to the old site's folders. Test: `tools/test-legacy-paths.mjs` (`npm run build && npm run test:legacy`).
- The rules and the deploy steps are in [design](../DESIGN.md), "Legacy paths". Change the rule, its test case and the DESIGN text together: impact row `legacy-paths`. The test's `LEGACY_FOLDERS` is the server's listing (an outside fact); on macOS the stub folders are case-insensitive, so `uboard` and `uBoard` cannot both be stubbed.
- Lesson: a deliberately broken rule 6 (old pages served as the new page instead of a 301) fails 11 cases, so the test bites (mutation check, 2026-11-24).
- Never add a `public/` entry named like a legacy folder (list in DESIGN). Never remove a pass-through line without the owner's confirmation that the folder is gone from the server.
- The old site's `.htaccess` used `${lc:…}` (a `RewriteMap` that shared hosting does not define) and PHP rewrites; neither carries over.
