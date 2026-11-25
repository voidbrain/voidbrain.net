# voidbrain.net

Daniele's personal site, rebuilt as one static page. It has three states, **work**, **play** and **sleep**, each a full-screen cyberpunk poster with a 3D model of Daniele at its centre and animated, interactive HUD pieces around it: charts, a Game of Life, a breathing topographic map, an FPV artificial horizon, a wire cube, a terminal (decorative, no real data). It replaces the 2012 PHP site at the same address and keeps every old folder and URL working. How it works: [docs/DESIGN.md](docs/DESIGN.md).

Status (2026-11-24): the three posters, the animated HUD pieces, a placeholder 3D figure and the legacy path rules are built and tested locally. Waiting on the owner: the real 3D model (F-004) and how the site is deployed (F-007); see the [backlog](docs/BACKLOG.md). Code: <https://github.com/voidbrain/voidbrain.net>.

## Run it

Use Node 24 (`nvm use`, from `.nvmrc`).

```bash
npm ci
npm start                    # dev server at http://localhost:4200/
npm test -- --watch=false    # unit tests (Vitest)
npm run build                # static files in dist/voidbrain-net/browser/
npm run test:legacy          # after the build: old URLs and folders on a real Apache
```

## Deploying

The build goes to the voidbrain.net host over FTP with explicit TLS (FTPS), from GitHub Actions, started by hand (Actions → workflow → Run workflow). Credentials are repository secrets (`FTP_HOST`, `FTP_USER`, `FTP_PASSWORD`); the site folder is the repository variable `FTP_DIR`. Nothing is ever deleted on the server.

1. **Deploy**, mode `check`: logs in, verifies the certificate, finds the site folder and says whether `old/` exists. Set `FTP_DIR` to the folder it names.
2. **Copy the old site into old/**, mode `size`, then `copy` (type `copy` to confirm): once, before the first upload.
3. **Deploy**, mode `dry-run`, then `upload`. `upload` refuses until the copy is marked complete (`old/.copy-complete`), and runs only from `main`, as does `copy`.

Details and the checks after the upload: [deploy steps](docs/DESIGN.md#deploy-steps). The logic is in [`tools/ftps.sh`](tools/ftps.sh).

## Where things are

```
src/app/          the shell (state, hash, switcher, keys, swipe)
src/app/core/     framework-free logic: states, page text, poses, HUD value generators
src/app/poster/   one state's poster
src/app/hud/      the animated HUD pieces and their shared clock
src/app/figure/   the three.js self-model (lazy)
src/styles.scss   global styles and design tokens
public/           copied as-is to the docroot: .htaccess, old/.htaccess, 404, robots, sitemap
docs/             design, style guide, backlog, audits, agent procedures
tools/            harness checks (copied; do not edit) and test-legacy-paths.mjs (ours)
```

## Working on it

- [AGENTS.md](AGENTS.md): how to work in this repository (for people and coding agents), with per-area rules in [docs/agents/areas.md](docs/agents/areas.md).
- [docs/BACKLOG.md](docs/BACKLOG.md): current bugs and features, with their status and next action ([rules](docs/BACKLOG-RULES.md)).
- [docs/STYLE-GUIDE.md](docs/STYLE-GUIDE.md): how the site looks and talks.
- [docs/DESIGN.md](docs/DESIGN.md): the three states, legacy paths, the self-model asset.
