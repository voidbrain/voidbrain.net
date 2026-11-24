# voidbrain.net area notes

Detailed rules and lessons for each part of the project, kept out of AGENTS.md so that file stays short. Read the section of the area you change before you change it; AGENTS.md applies to every task. Keep this file current like AGENTS.md: a change that alters a rule here updates it in the same PR.

Reviewers: `mechanical-reviewer` and `design-reviewer` (`.claude/agents/`) review any area; neither edits code.

## Core logic

- Code: `src/app/core/` (planned contents: the state model, F-003; the legacy path map, F-002; seeded generators for the animated HUD values, F-005).
- Plain TypeScript only: no `@angular/*` import (ESLint `no-restricted-imports` and `check:conventions`, `conventions.pureDirs` in `.harness.json`). Components call into it; it never calls into components.
- Every exported function has a spec next to it (`*.spec.ts`), run by `npm test`.

## UI shell and posters

- Code: `src/app/` outside `core/`; global styles in `src/styles.scss`.
- Read [docs/STYLE-GUIDE.md](../STYLE-GUIDE.md) first, and [Angular conventions](angular.md).
- Components stay thin: state and generated values come from `src/app/core/`. Generators are seeded and pure (a seed and a time in, values out), so a spec can check them; the component owns only the animation clock. One component per HUD element (chart, calendar strip, QR block, terminal), each keyboard-operable with an accessible name.
- three.js code (F-004) lives in its own component, created outside Angular's change detection (`afterNextRender`), disposed in `DestroyRef.onDestroy`, and pauses its render loop when the tab is hidden or the state is off-screen. three.js is imported only there and lazy-loaded (`@defer`), so the first paint does not wait for it.

## Legacy hosting

- Code: `public/.htaccess` (planned, F-002) and everything else in `public/`, which the build copies to the Apache docroot next to the old site's folders.
- The rules and the redirect table are in [design](../DESIGN.md), "Legacy paths". Change the three places together (`.htaccess`, `src/app/core/legacy-paths.ts`, the DESIGN table): impact row `legacy-paths`.
- Never add a `public/` entry named like a legacy folder (list in DESIGN). Never remove a pass-through line without the owner's confirmation that the folder is gone from the server.
- The old site's `.htaccess` used `${lc:…}` (a `RewriteMap` that shared hosting does not define) and PHP rewrites; neither carries over.
