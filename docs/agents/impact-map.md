<!-- Written by tools/impact-map.mjs from the "impact" rows of .harness.json: change the rows, then run it. -->

# Impact map

What must follow a change, and what must run again after it (docs/agents/change-impact.md). `npm run check:freshness` lists, on every PR, the rows a branch sets off and the order to run them.

**More detail:** [Coverage](coverage.md) (unit test coverage per folder)

| Id | When these change | Made of (content) | This must follow | Command | Runs again after | Checked by |
|---|---|---|---|---|---|---|
| style-tokens | `src/styles.scss`, `src/styles/**` |  | Update the token, type and spacing tables in docs/STYLE-GUIDE.md in the same change. | `npm run format:check && npm run build` |  | Review: STYLE-GUIDE tables match the --tokens in src/styles.scss |
| legacy-paths | `public/.htaccess`, `src/app/core/legacy-paths.ts`, `src/app/core/legacy-paths.spec.ts` |  | Keep the legacy path table in docs/DESIGN.md, the Apache rules in public/.htaccess and the client-side map in agreement. | `npm test -- --watch=false` |  | legacy-paths.spec.ts (client map); Apache rules checked by hand against the legacy docroot (F-002) |
| states | `src/app/core/states.ts` |  | Update the states table in docs/DESIGN.md. | `npm test -- --watch=false` |  | Unit tests on the state model |

## Content dependencies

What each output is made of, besides code: change one of these and the output is out of date.

| Output | Made of | Redo with |
|---|---|---|
| (none listed) | | |

## Value couplings

A value that lives in more than one place: change it in one, change it in all. Best kept by one shared source, else by a test.

| Value | Where | Kept equal by |
|---|---|---|
| Legacy folders served as-is | `public/.htaccess` (pass-through folder list)<br>`docs/DESIGN.md` (Legacy paths table) | Review against the live docroot listing before each deploy (F-002) |

## Outside the repository

What can change an output with no commit here, and how we would notice.

| What | Affects | Noticed by |
|---|---|---|
| Legacy docroot on the Apache host (old PHP site folders: base, cube, extradry, grover, laura, pasubio, summer2020, uboard, …) | public/.htaccess pass-through list | Listing of the live docroot before deploy (F-002) |
