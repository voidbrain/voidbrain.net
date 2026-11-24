# Harness baseline audit, 2026-11-24

**Kind:** full (all eight areas), at first adoption of the harness.
**Baseline:** the uncommitted working tree on branch `harness/agent-harness`; the repository has no commits yet. The matching `.audit.json` manifest needs a full commit SHA, so it is written with the first commit (F-001).
**Template:** project-harness v10.9.0 (`75d59b9`), core + angular.
**Environment:** macOS, Node 24.19.0 (nvm), npm 11.17.0, Angular CLI 22.3.0.

## Scope and method

The project was scaffolded the same day with `ng new` (Angular 22.3, SCSS, no SSR, no router, prefix `vb`), so the code is the CLI's welcome page. The review covers the scaffold, the harness files added to it, and the inputs the next work depends on: the legacy PHP site in `../voidbrain` (its `public/.htaccess`, `index.php`, `sitemap.php`, the `pages` table in `docs/data/sql.sql`) and the earlier Angular attempt in `../voidrbain-new/voidbrain.net`. Neither sibling project was changed.

## Checks run

All on the working tree, 2026-11-24, Node 24.19.0:

| Command | Result |
|---|---|
| `npm run lint` | pass, all files |
| `npm run format:check` | pass, after one mechanical `npm run format` of 5 scaffold files |
| `npx ng test --watch=false` | pass, 2 of 2 tests |
| `npm run coverage` | lines 50.0 %, `app.config.ts` untested ([coverage](../agents/coverage.md)) |
| `npx tsc -p tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters` | pass |
| `npm run build` | pass, 123.64 kB initial (36.82 kB transferred) |
| `npm run check:backlog` | pass, 7 records |
| `npm run check:conventions` | pass, 5 files, no unused exports |
| `npm run check:tooling` | pass |
| `npm run check:rules` | pass |
| `npm run check:rule-load` | 1 warning: the audit trigger reads 5,284 tokens against a 5,000 budget (template-owned guides) |
| `npm run check:integrations` | pass, no selections |
| `node tools/impact-map.mjs` | 3 rows, 1 coupling, 1 outside |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm run check:freshness` | warnings only: no `main` commit yet, no audit manifest, maintenance receipt (written after this report) |

## Results by area

| Area | Result | Evidence | Limits |
|---|---|---|---|
| Code | checked | Scaffold read in full: root component, config, one spec. Lint and type check clean. | Welcome-page code only; nothing of the real site exists yet. |
| Logic | checked | No domain logic exists yet. The legacy URL rules to carry over were traced from the old `.htaccess` and `pages` table into [DESIGN](../DESIGN.md#legacy-paths). | The redirect targets are a proposal awaiting the owner (F-002). |
| Tests | checked | 2 Vitest tests pass; coverage table written. | No browser suite; CI has no e2e job until one exists. |
| Documentation | checked | README, AGENTS, areas, DESIGN, STYLE-GUIDE written against the scaffold; links checked. | Planned behaviour is marked "planned" with its record. |
| Harness | checked | 61 copied files byte-identical to v10.9.0; adapted files filled with no placeholders; `.harness.json` settings for pure dirs, coverage, impact rows. | Optional profiles not adopted (see `.harness.json` `note`). |
| Security | checked | No secrets in the tree; `npm audit` clean; install scripts allowed only for 4 build dependencies (`esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract`); push guard installed. | No deploy exists yet; `.htaccess` hardening is reviewed with F-002. |
| Delivery | checked | Build to `dist/voidbrain-net/browser/`; CI workflow adapted (Node from `.nvmrc`, PR + push to `main`). | No remote, so CI has never run; no deploy method (F-007). |
| Backlog | checked | F-001 to F-007 cover the harness, legacy paths, three states, self-model, HUD components, tokens and fonts, remote and deploy. | Four records wait on owner decisions. |

## Findings

1. **No remote, so CI never runs** (delivery). Owned by F-007; AGENTS says the owner merges until then.
2. **Legacy docroot collisions** (logic, delivery). The build copies `public/` over a docroot that already holds `img/`, `js/`, `fonts/`, `style/` and others; a same-named entry would overwrite a live folder. Recorded as a pitfall in AGENTS and as a check in F-002.
3. **Old `index.php` at `/`** (delivery). Without `DirectoryIndex index.html index.php` the old PHP site keeps answering at `/`. F-002.
4. **Old rewrite rules do not carry over** (logic). The old `.htaccess` depends on PHP (`?url=`, `adaptive-images.php`, `sitemap.php`) and on a `RewriteMap lc` that shared hosting does not define. F-002 replaces them with static rules.
5. **Reference artwork is a stock image** (security, licensing). The owner's reference posters carry an Adobe Stock watermark: mood reference only, never committed or shipped (style guide).
6. **Homebrew Node does not start on the owner's Mac** (environment, not this repository): `node` 25.8.2 cannot load `libllhttp.9.3.dylib`. Worked around with `.nvmrc` (Node 24) and noted in AGENTS. Fixing the Homebrew install (`brew reinstall node` or `brew link llhttp`) is the owner's machine, not a backlog record here.
7. **Scaffold install failed inside `ng new`** (delivery): npm 11.17 rejects the CLI's `--allow-scripts` flag in project installs. Resolved by a plain `npm install` and `npm approve-scripts` for the four build dependencies; noted as a pitfall.

## Deferred work and limits

- The `.audit.json` manifest, the backlog header's `main` SHA and the first CI run all follow the first commit and remote (F-001, F-007).
- The earlier Angular attempt's components were listed for porting (F-004, F-005), not reviewed line by line.
- No visual, accessibility or device check was possible: the page is the welcome screen.
