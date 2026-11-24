# voidbrain.net backlog

Current work ledger, reviewed 24 November 2026 against main `0aa5941` (empty initial commit; this change on `harness/agent-harness`). [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Work items

Bugs (B-) and features (F-) in one list, in ID order; priority is in each record.

### F-001

**Apply the agent harness (v10.9.0)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Review [#1](https://github.com/voidbrain/voidbrain.net/pull/1) and its [baseline audit](audits/2026-11-24-harness-baseline.md), then merge it.

| | |
|---|---|
| **Issue** | The new project needs the shared harness: AGENTS, backlog, style guide, checks, lint, formatter and CI. |
| **Reproduce** | On `harness/agent-harness`: `nvm use`, `npm ci`, then the commands in the [baseline audit](audits/2026-11-24-harness-baseline.md), "Checks run". |
| **Check** | Every check in the audit passes locally; no `{{` placeholder or harness note remains; the first CI run on GitHub passes (after F-007). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** applied on 2026-11-24 to a fresh Angular 22.3 scaffold from template v10.9.0 (`75d59b9`); local checks recorded in the baseline audit. Committed on `harness/agent-harness` as `ea46ffa` on top of the empty `main` root `0aa5941`; the audit manifest names `ea46ffa` as its baseline. Copied files match v10.9.0 (`check-harness`). Before the merge, the adapted files get an independent fresh-context review (`design-reviewer`), as `check:freshness` asks for a branch that changes harness files; impact row `style-tokens` is satisfied (no tokens yet, the style guide says so) and the legacy-folder coupling is owned by F-002. Verified when the owner has merged it and the first CI run on GitHub (F-007) is green.

**Estimates:** Small remaining effort: owner review and merge, then one CI run. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) (harness `ea46ffa`, manifest `b9194fb`); [baseline audit](audits/2026-11-24-harness-baseline.md) |
| Opened | 2026-11-24 |
| Verification | Unit + lint + build · 2026-11-24 · local run passed (audit); CI · Pending (F-007) |
| Reviewed | 2026-11-24 |

</details>

---

### F-002

**Old URLs and legacy folders keep working**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />When the site is deployed (F-007), follow the [deploy steps](DESIGN.md#deploy-steps) and check their four URLs on voidbrain.net.

| | |
|---|---|
| **Issue** | The new single page is deployed into the same Apache docroot as the old PHP site: old page URLs must redirect home (search engines), the old site must stay reachable under `/old/`, and every folder the old rules excluded must keep being served as it is. |
| **Reproduce** | `npm run build && npm run test:legacy` (local Apache); on the live site, the [deploy steps](DESIGN.md#deploy-steps), step 3. |
| **Check** | Old page URLs (`/about/work`, `/labs/x`, `/contacts`, `/?url=about`, `/index.php`, any case or trailing slash) answer 301 to `/`; `/old/…` serves the old site, not indexed; every legacy folder and verification file answers as before; `/` serves the new page; `/api/…` is 410; a missing file gets the new 404; no `public/` entry shares a legacy name. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** owner decision 2026-11-24: all old pages redirect home, the old site moves to `/old/`, excluded folders stay reachable. Built: `public/.htaccess`, `public/old/.htaccess`, `robots.txt` (`Disallow: /old/`), `sitemap.xml`, `404.html`, and `tools/test-legacy-paths.mjs` (`npm run test:legacy`, also a CI step). The planned client-side path map was dropped: with every old page going home, the server does all of it. Verified when CI runs the Apache test (F-007) and the owner's live check after deploy passes.

**Estimates:** Small remaining effort: the deploy itself and the live check. Reassessed 2026-11-24 after implementation; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1); mutation check: a broken redirect rule fails 11 of the Apache cases |
| Opened | 2026-11-24 |
| Verification | Apache (macOS httpd 2.4.67) · 2026-11-24 · 119 requests passed; CI · Pending (F-007); Human (live) · Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-003

**Three-state page: work, play, sleep**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔺 P1 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Start the page as [Run it](../README.md#run-it) says and judge the three posters and their text.

| | |
|---|---|
| **Issue** | The page was the Angular welcome screen; it should show three full-screen poster states the visitor can switch between. |
| **Reproduce** | [Run it](../README.md#run-it), then open `http://localhost:4200/`, `/#work`, `/#play`, `/#sleep`; switch with the top buttons, the arrow keys, the ← → buttons and a swipe on a phone; repeat with reduced motion on. |
| **Check** | Each hash opens its state; switching updates the hash and the back button returns; keyboard, pointer and swipe all switch; with reduced motion the switch is a cut; the welcome screen is gone; unit tests cover the state model; no horizontal scroll from 360 px; the owner accepts the text and palettes. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** owner left the palettes to the agent and asked for text from the website and CV, with lorem/logs as filler (2026-11-24). Built: work = acid green (career, stack), play = orange (FPV, maker, projects), sleep = paper white with lime (quote, links, the old site); text in `src/app/core/content.ts` without contact or personal details (a spec checks). Next: the owner's look and text review; changes go into `content.ts` and the style guide.

**Estimates:** Small remaining effort: text and layout corrections after the owner's review. Reassessed 2026-11-24 after implementation; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) |
| Opened | 2026-11-24 |
| Verification | Unit · 2026-11-24 · 26 tests passed (state model, shell across hash, buttons, keys); Browser · 2026-11-24 · agent check in Chrome 1440 × 900 and iPhone 13 emulation: render, no overflow, click, arrow, back button, reduced motion; Human · Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-004

**3D self-model, one pose per state**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

🧑 **→ Human action required: Procedure**<br />Make and hand over the model, following [self-model asset](DESIGN.md#self-model-asset).

| | |
|---|---|
| **Issue** | Each poster's central figure should be a 3D model of Daniele, posed for work, play (with FPV goggles) and sleep; a procedural placeholder stands in until the real model exists. |
| **Reproduce** | [Self-model asset](DESIGN.md#self-model-asset) for making the model; then [Run it](../README.md#run-it) and switch states. |
| **Check** | The model loads lazily after first paint; each state shows its pose and switching blends between them; the head follows the pointer (not in sleep); the render loop pauses when the tab is hidden or off-screen; without WebGL a silhouette shows; models total under 3 MB; the page stays smooth on a mid-range phone. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** placeholder built 2026-11-24 in `src/app/figure/self-model.ts` (three.js r187, lazy chunk 549 kB, 115 kB transferred): faceted head, neck, shoulders, glasses (work), FPV goggles with antenna (play), sleep mask (sleep); poses and blending in `src/app/core/pose.ts` with specs. When the `.glb` arrives: load it with `GLTFLoader` + Draco, map its poses or props onto `POSES`, keep the placeholder as the no-model fallback, and check on a real phone.

**Estimates:** Medium remaining effort, about 2–3 agent hours for loading and posing the real model, after the owner's capture and cleanup. Reassessed 2026-11-24 after the placeholder; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) (placeholder) |
| Opened | 2026-11-24 |
| Verification | Browser · 2026-11-24 · placeholder renders in Chrome (SwiftShader) desktop and iPhone 13 emulation, no console errors; Real-device · Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-005

**Interactive HUD components and charts**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Part of the F-003 review: [Run it](../README.md#run-it), then hover, drag and Tab through the HUD pieces.

| | |
|---|---|
| **Issue** | The posters' furniture (calendar strips, wireframe spheres, charts, QR code, terminal, glyphs, hazard stripes) must be animated, interactive components, not pictures; their values are generated, with no real data (owner decision 2026-11-24). |
| **Reproduce** | [Run it](../README.md#run-it), in each state hover, focus (Tab) and drag every HUD piece; repeat with reduced motion on. |
| **Check** | Every piece animates and reacts to pointer and keyboard, with one accessible name marking it decorative; no label presents a generated number as a real statistic; nothing is fetched; generators have specs; nothing blocks the first paint; reduced motion shows a still frame. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** built 2026-11-24: signal chart, wire sphere, glyph matrix, terminal log, fake QR, calendar strip (`src/app/hud/`), one shared clock, generators in `src/app/core/hud.ts` with specs. Written new rather than ported: the earlier attempt's components were Angular 21 canvas code without keyboard support. Next: the owner's review with F-003.

**Estimates:** Small remaining effort: adjustments after the owner's review. Reassessed 2026-11-24 after implementation; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) |
| Opened | 2026-11-24 |
| Verification | Unit · 2026-11-24 · generator specs and the decorative-label test passed; Browser · 2026-11-24 · agent check: chart moves, and stops with reduced motion; Human · Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-006

**Design tokens and fonts for the three posters**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Part of the F-003 review: [Run it](../README.md#run-it) and look at the colours and type in all three states.

| | |
|---|---|
| **Issue** | The style guide's art direction had no tokens or fonts in code. |
| **Reproduce** | `src/styles.scss` and STYLE-GUIDE "Colour", "Type", "Spacing and layout". |
| **Check** | Each state has ground, ink and accent roles on `:root`, listed in the style guide; text pairs pass WCAG AA; a display face and a monospaced face are self-hosted with an open licence; no component uses a literal colour (404 page excepted, coupled). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** built 2026-11-24: five palette tokens and four roles per state, contrast 6.3:1 to 17.4:1 for every text pair (lime only as a fill), Rubik Glitch and JetBrains Mono from `@fontsource` (OFL-1.1, Latin subset), type, spacing and layout tokens, all listed in the style guide. Next: the owner's review with F-003.

**Estimates:** Small remaining effort: adjustments after the owner's review. Reassessed 2026-11-24 after implementation; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) |
| Opened | 2026-11-24 |
| Verification | Documentation · 2026-11-24 · tokens and contrast computed and listed; Browser · 2026-11-24 · agent screenshots of the three states; Human · Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-007

**Repository remote, CI and deploy to the Apache host**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🟡 Medium |

🧑 **→ Human action required: Decision**<br />Choose the upload method and the branch protection for `main`, in [design](DESIGN.md#open-decisions).

| | |
|---|---|
| **Issue** | The code now lives on GitHub, but `main` has no protection or required checks, and there is no way yet to put the build on the voidbrain.net host. |
| **Reproduce** | `gh api repos/voidbrain/voidbrain.net/branches/main --jq .protected` prints `false`; README "Deploying" names no upload method. |
| **Check** | `main` is protected with the `CI` workflow required; a PR runs CI green; the upload (manual script or CI job) puts `dist/voidbrain-net/browser/` on the host without deleting legacy folders, following the [deploy steps](DESIGN.md#deploy-steps), and the README says how. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** owner chose `https://github.com/voidbrain/voidbrain.net` on 2026-11-24. That repository held the earlier Angular attempt (`main` at `ca13761`, GitHub Pages from `gh-pages`), with history unrelated to this one; it is joined by a merge commit whose content is this project, opened as a PR, so nothing is force-pushed and the old history stays. Its old workflows (`gh-pages.yml`, `node.js.yml`) leave `main` with that merge; the `gh-pages` branch and its Pages site are untouched. Next: CI green on the PR, the owner merges, then the upload method and branch protection (owner settings).

**Estimates:** Medium remaining effort, about 2–3 agent hours for the upload script or job, plus the owner's settings. Reassessed 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | [#1](https://github.com/voidbrain/voidbrain.net/pull/1) (remote `origin` = `voidbrain/voidbrain.net`) |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

## Other changes

## How to use this file

| Status | Requirements | Next statuses and conditions | Priority cue |
|---|---|---|---|
| **🔴 Open** | Reproducible bug or agreed capability; scope and next action recorded. | - **Investigate** if cause/scope is uncertain<br>- **Implemented** when code is complete<br>- **Blocked** if a named dependency prevents progress<br>- **Closed** if cancelled/superseded, with reason. | Coloured |
| **🟠 Investigate** | Report and unanswered question recorded; next diagnostic identified. | - **Open** when scope/cause is established<br>- **Implemented** when fixed<br>- **Blocked** if evidence/dependency is unavailable<br>- **Closed** if duplicate/not reproducible after documented investigation, with reason. | Coloured |
| **🟡 Implemented** | Code exists; required verification remains pending. | - **Verified** when all acceptance checks pass (automated ones: the merged PR's green CI run)<br>- Open or Investigate if a check fails<br>- **Blocked** if a required check cannot proceed. | Coloured |
| **🟢 Verified** | All acceptance checks passed; date, method and evidence recorded, including human/device checks when required. | - **Closed** when no action remains and resolution is recorded<br>- **Open** or **Investigate** if new evidence invalidates verification. Do not leave completed items here indefinitely. | Coloured |
| **🟣 Blocked** | Specific blocker, affected work/check and resume condition recorded. | - Return to **Open**, **Investigate** or **Implemented** when unblocked<br>- **Verified** only after all checks pass<br>- **Closed** if cancelled/superseded, with reason. | Grey ◻️ |
| **🔵 Closed** | Resolution recorded and item archived. | - **Open** or **Investigate** if reopened by new evidence<br>Retain ID, original Opened date and historical closure record. | Grey ◻️ |

Follow [Backlog rules](BACKLOG-RULES.md) for updating records, reconciling PR/CI evidence, stale-state review, closure/archiving, human dependencies and table validation. Preserve stable IDs and existing user edits.

Each item shows its ID and title, a summary table (status with its colour, priority, effort size; with source-owned records also remaining time, Depends on, Unlocks and Procedures and Decisions, 🧑 where the record or one of its ready steps waits on that kind of human action), the human or next action, and Issue / Reproduce / Check. Expand the closed details for next actions, estimate rationale, PR history, dates and verification. Effort, from the remaining agent hours (owner time apart): 🟢 Small ≤1 h · 🟡 Medium ≤4 h · 🔴 Large ≤8 h · 🟣 Very large more; work still estimated in days: 🟢 Small ≤1 day · 🟡 Medium 2–3 days · 🔴 Large ≥4 days. Status and verification evidence describe progress; effort is an estimate of work still required. A `---` line ends every item.
