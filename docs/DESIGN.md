# voidbrain.net design

How the site works, for someone changing it. The rules live in code; this document describes them and names where each one is. Numbers and tables that the code owns are linked, not copied. Anything below marked **planned** is not built yet and is owned by the backlog record named next to it.

| What | Source of truth |
|---|---|
| The page shell | [`src/app/app.ts`](../src/app/app.ts), [`src/app/app.html`](../src/app/app.html) (still the Angular welcome page: F-003) |
| States, their order and palette | planned: `src/app/core/states.ts` (F-003) |
| Legacy path map, client side | planned: `src/app/core/legacy-paths.ts` (F-002) |
| Legacy path rules, server side | planned: `public/.htaccess` (F-002) |
| Self-model | planned: `public/models/` (F-004) |

## The idea

voidbrain.net becomes **one static page** (Angular, built to plain files) that replaces the old PHP site at the same host. The page has **three states**, each a full-screen poster in the anti-design / cyberpunk style of the reference posters (see [style guide](STYLE-GUIDE.md), "Art direction"):

| State | What it shows | Poster palette (reference) | Self-model pose |
|---|---|---|---|
| **work** | Daniele at work: code, projects, skills | acid green on black | at the keyboard |
| **play** | FPV flying, labs, experiments | orange with black | wearing FPV goggles (the visor poster) |
| **sleep** | quiet / off-hours, contact | white paper with black and lime | eyes closed, headphones or mask |

The pairing of state and palette is a proposal; the owner decides it in F-003.

Planned behaviour (F-003):

- One state is shown at a time; switching animates between them (the model turns or morphs, the poster palette and type swap). The current state is in the URL hash (`/#work`, `/#play`, `/#sleep`), so it can be linked and the back button works.
- Switching works by pointer, keyboard (arrow keys and the three state buttons) and touch swipe. With `prefers-reduced-motion` the switch is a cut, not an animation.
- Every chart, gauge, calendar strip, QR block and terminal in a poster is a live component, not a picture: it reacts to hover, focus and drag, and shows real values where a source exists (F-005).
- The self-model is a 3D model of Daniele (F-004), rendered with three.js, one pose per state. Without WebGL, the page shows a still render of the same pose.

## Legacy paths

The new page is deployed into the **same Apache docroot** as the old site. Many old folders are not part of the PHP site (other projects, clients, tests) and must keep working exactly as they do now. The old site's `.htaccess` (in the `voidbrain` repository, `public/.htaccess`) lists the folders it never rewrote.

Planned rules (F-002), in order:

1. **Anything that exists on disk is served as it is**: a real file or folder (`-f` / `-d`). This covers every legacy folder, including ones the old list missed (`grover`, `summer2020`, `template`, `wip`).
2. **The old pass-through list stays explicit**, so a folder keeps working even if it is later emptied or moved behind an index file: `admin`, `cgi-bin`, `min`, `maiko`, `misc`, `include`, `extradry`, `hammer`, `js`, `laura`, `support`, `style`, `fonts`, `base`, `img`, `temp`, `templates`, `test`, `pasubio`, `cube`, `uBoard`, `uboard`, `inc`, and the files `BingSiteAuth.xml` and `googleba637e5c36f03a69.html`.
3. **Old content URLs redirect (301) to a state** of the new page:

   | Old path | New target |
   |---|---|
   | `/`, `/home` | `/` |
   | `/about`, `/about/me`, `/about/work` | `/#work` |
   | `/labs`, `/labs/<name>` | `/#play` |
   | `/contacts` | `/#sleep` (contact lives in the sleep poster) |
   | `/sitemap.xml` | the static `sitemap.xml` shipped with the page |
   | `/api/…` | `410 Gone` |
   | anything else that does not exist | the new page's `404` |

4. The old query-string form (`/?url=about`) maps the same way.

The targets in table 3 are a proposal for the owner to confirm in F-002.

Constraints this places on the build (also in [AGENTS.md](../AGENTS.md), "Known pitfalls"):

- Angular copies `public/` to the docroot. A file or folder in `public/` must never have the name of a legacy folder (`img`, `js`, `fonts`, `style`, …), or the deploy overwrites it. New assets go under names the old site never used (`assets/`, `models/`).
- The old `index.php` and `sitemap.php` stay on the server until the switch-over; `DirectoryIndex index.html index.php` makes the new page win at `/`.

## Self-model asset

The 3D model of Daniele is the owner's to make (F-004). The steps:

1. **Capture.** Make a head-and-shoulders scan, for example with a phone photogrammetry or LiDAR app (Polycam, Scaniverse, RealityScan), about 60–100 photos all around in soft, even light, a neutral expression. Or commission or sculpt a stylised model from photos.
2. **Clean up** in Blender: remove the background, close holes, reduce to about 50–80 k triangles, one material. Add the props as separate objects: FPV goggles (play), headphones or a sleep mask (sleep).
3. **Pose or blend shapes**: either three separate posed files, or one rigged model with three named poses `work`, `play`, `sleep`.
4. **Export** as glTF binary (`.glb`) with Draco compression, under 3 MB in total. Strip any location metadata from the source photos before they leave the phone; the photos themselves never enter the repository.
5. **Hand over**: put the `.glb` files in `public/models/` on a branch, or send them, and say whether the style is realistic or stylised.

Expected result: the model loads in <https://gltf-viewer.donmccurdy.com/> without errors, and its file size is under the limit above.

## Open decisions

The owner decides these; each is a 🧑 Decision in [the backlog](BACKLOG.md).

- **F-002**: confirm the legacy redirect targets above, and whether `/api/…` really has no remaining caller.
- **F-003**: which palette goes with which state; the page's text (the old site's copy is from 2012 and names a former employer).
- **F-005**: which charts show real data, and from where (for example FPV flight logs, GitHub activity, a sleep tracker), and which are decorative.
- **F-007**: how the build reaches the Apache host (FTP/SFTP upload by hand, a CI deploy with a secret, or another host), and whether the code gets a GitHub remote.

## Tests

The unit suite (Vitest, `npm test`) covers the app shell today. Planned: the legacy path map and the state model get their own specs in `src/app/core/` (F-002, F-003); the Apache rules are checked by hand against a copy of the legacy docroot (F-002).
