<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (docs/agents/change-impact.md). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Coverage](coverage.md) (unit test coverage per folder)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| style-tokens | `src/styles.scss`, `angular.json` |  | Update the token, type and spacing tables in docs/STYLE-GUIDE.md in the same change; keep public/404.html colours equal to the palette. | `npm run format:check && npm run build` |  | Review: STYLE-GUIDE tables match the --tokens in src/styles.scss |
| legacy-paths | `public/**`, `tools/test-legacy-paths.mjs` |  | Keep the Legacy paths section and deploy steps in docs/DESIGN.md in step with the Apache rules, and run the Apache test. | `npm run build && npm run test:legacy` |  | tools/test-legacy-paths.mjs (119 Apache requests, public/ names) locally and in CI |
| states | `src/app/core/states.ts`, `src/app/core/content.ts`, `src/app/core/pose.ts`, `src/app/poster/**` |  | Update the states table and behaviour in docs/DESIGN.md, and the components table in docs/STYLE-GUIDE.md if a HUD piece moves. | `npm test -- --watch=false` |  | states.spec.ts, pose.spec.ts (one pose and poster per state, privacy), app.spec.ts |
| hud | `src/app/hud/**`, `src/app/core/hud.ts` |  | Update DESIGN "HUD components" and the STYLE-GUIDE components table (interactions, labels). | `npm test -- --watch=false` |  | hud.spec.ts; app.spec.ts (every piece labelled decorative and focusable) |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| (none listed) | | |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| Legacy folders served as-is | `public/.htaccess` (rule 1 pass-through list)<br>`tools/test-legacy-paths.mjs` (LEGACY_FOLDERS, LEGACY_FILES)<br>`docs/DESIGN.md` (Legacy paths, point 3) | npm run test:legacy: every LEGACY_FOLDERS entry must answer as a legacy folder |
| Palette colours | `src/styles.scss` (--vb-* tokens)<br>`public/404.html` (literal #0a0a0a, #ff5a1f, #a6ff00 (no app CSS there))<br>`src/index.html` (theme-color #a6ff00)<br>`docs/STYLE-GUIDE.md` (Colour tables) | Review (impact row style-tokens) |
| Allowed docroot entries from public/ | `tools/test-legacy-paths.mjs` (ALLOWED_PUBLIC)<br>`AGENTS.md` (Known pitfalls, Legacy folders overwritten) | npm run test:legacy fails on an entry not in ALLOWED_PUBLIC |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| Legacy docroot on the Apache host (old site folders and verification files, listed 2026-11-24) | public/.htaccess pass-through list; LEGACY_FOLDERS in tools/test-legacy-paths.mjs | Listing of the live docroot before each deploy (DESIGN deploy steps) |
