# voidbrain.net

Daniele's personal site, rebuilt as one static page. It has three states, **work**, **play** and **sleep**, each a full-screen cyberpunk poster with a 3D model of Daniele at its centre and interactive HUD pieces around it: charts, calendar strips, a terminal. It replaces the 2012 PHP site at the same address and keeps every old folder and URL working. How it works: [docs/DESIGN.md](docs/DESIGN.md).

Status (2026-11-24): the project is an Angular 22.3 scaffold with the agent harness applied; the page is still the Angular welcome screen. The states, the 3D model, the HUD components and the legacy path rules are backlog records F-002 to F-007.

## Run it

Use Node 24 (`nvm use`, from `.nvmrc`).

```bash
npm ci
npm start                    # dev server at http://localhost:4200/
npm test -- --watch=false    # unit tests (Vitest)
npm run build                # static files in dist/voidbrain-net/browser/
```

## Deploying

The build output goes into the Apache docroot of voidbrain.net, next to the old site's folders, which stay where they are. The deploy method is not decided yet (F-007), and the rules for old URLs are not written yet (F-002): do not deploy before both are done. What must keep working, and where old URLs go: [legacy paths](docs/DESIGN.md#legacy-paths).

## Where things are

```
src/app/          the page: root component, later one component per poster and HUD piece
src/app/core/     framework-free logic (state model, legacy path map, chart data), planned
src/styles.scss   global styles and design tokens
public/           copied as-is to the docroot (never name anything like a legacy folder)
docs/             design, style guide, backlog, audits, agent procedures
tools/            harness checks (copied from the project harness; do not edit)
```

## Working on it

- [AGENTS.md](AGENTS.md): how to work in this repository (for people and coding agents), with per-area rules in [docs/agents/areas.md](docs/agents/areas.md).
- [docs/BACKLOG.md](docs/BACKLOG.md): current bugs and features, with their status and next action ([rules](docs/BACKLOG-RULES.md)).
- [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): how the site looks and talks.
- [docs/DESIGN.md](docs/DESIGN.md): the three states, legacy paths, the self-model asset.
