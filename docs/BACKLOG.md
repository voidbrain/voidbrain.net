# voidbrain.net backlog

Current work ledger, reviewed 24 November 2026 against main `0aa5941` (empty initial commit; this change on `harness/agent-harness`). [Rules](BACKLOG-RULES.md) · [Archive](archive/README.md) · [Reading the records](#how-to-use-this-file).

## Work items

Bugs (B-) and features (F-) in one list, in ID order; priority is in each record.

### F-001

**Apply the agent harness (v10.9.0)**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🟡 | 🔶 P2 | Implemented | 🟢 Small |

🧑 **→ Human action required: Procedure**<br />Review the `harness/agent-harness` branch and its [baseline audit](audits/2026-11-24-harness-baseline.md), then commit and merge it.

| | |
|---|---|
| **Issue** | The new project needs the shared harness: AGENTS, backlog, style guide, checks, lint, formatter and CI. |
| **Reproduce** | On `harness/agent-harness`: `nvm use`, `npm ci`, then the commands in the [baseline audit](audits/2026-11-24-harness-baseline.md), "Checks run". |
| **Check** | Every check in the audit passes locally; no `{{` placeholder or harness note remains; the first CI run on GitHub passes (after F-007). |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** applied on 2026-11-24 to a fresh Angular 22.3 scaffold from template v10.9.0 (`75d59b9`); local checks recorded in the baseline audit. After the first commit: write `docs/audits/2026-11-24-harness-baseline.audit.json` with that commit's SHA as baseline and set the header's `main` SHA. Verified when the owner has merged it and the first CI run on GitHub (F-007) is green.

**Estimates:** Small remaining effort: owner review, then one CI run. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | Branch `harness/agent-harness` (not committed yet); [baseline audit](audits/2026-11-24-harness-baseline.md) |
| Opened | 2026-11-24 |
| Verification | Unit + lint + build · 2026-11-24 · local run passed (audit); CI · Pending (F-007) |
| Reviewed | 2026-11-24 |

</details>

---

### F-002

**Old URLs and legacy folders keep working**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🟡 Medium |

🧑 **→ Human action required: Decision**<br />Confirm the redirect targets for old URLs in [legacy paths](DESIGN.md#legacy-paths).

| | |
|---|---|
| **Issue** | The new single page is deployed into the same Apache docroot as the old PHP site; old content URLs must redirect and every legacy folder must keep being served as it is. |
| **Reproduce** | Against a copy of the legacy docroot with the new build on top (the `voidbrain` repository's Docker setup serves `public/` on Apache): request `/`, `/home`, `/about/me`, `/labs/x`, `/contacts`, `/?url=about`, `/sitemap.xml`, `/api/x`, `/grover/`, `/extradry/`, `/uboard/`, `/BingSiteAuth.xml`, a missing path. |
| **Check** | Each old content URL answers 301 to its target in the DESIGN table; every legacy folder and file answers as it does today; `/` serves the new page, not `index.php`; a missing path gets the new 404; no file in `public/` shares a name with a legacy folder. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** after the owner confirms the targets, write `public/.htaccess` (pass-through for real files and folders and the old explicit list, `DirectoryIndex index.html index.php`, the 301 table, 410 for `/api/`, `ErrorDocument 404`), the client-side map `src/app/core/legacy-paths.ts` with a spec, a static `public/sitemap.xml`, and a 404 page. Check by hand on the Docker Apache with the legacy `public/` folder mounted, and record each URL's status code. Closes when the checks above pass and the owner confirms after deploy (F-007).

**Estimates:** Medium remaining effort, about 3 agent hours: rules, map and spec, plus the Apache check. Assumes the Docker setup in the `voidbrain` repository still starts. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-003

**Three-state page: work, play, sleep**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🔴 Large |

🧑 **→ Human action required: Decision**<br />Choose which palette goes with which state, and the page text, in [design](DESIGN.md#open-decisions).

| | |
|---|---|
| **Issue** | The page is still the Angular welcome screen; it should show three full-screen poster states the visitor can switch between. |
| **Reproduce** | `npm start`, open `http://localhost:4200/`, `/#work`, `/#play`, `/#sleep`; switch with the state buttons, arrow keys and a touch swipe; repeat with reduced motion on. |
| **Check** | Each hash opens its state; switching updates the hash and the back button returns; keyboard, pointer and swipe all switch; with reduced motion the switch is a cut; the welcome screen and its styles are gone; unit tests cover the state model; layout works from 360 px wide. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** state model in `src/app/core/states.ts` with spec (order, hash parsing, next/previous); a shell component with the three poster layouts using placeholder figures until F-004; remove the welcome screen. Then a browser check of the list above, with a screenshot of each state.

**Estimates:** Large remaining effort, about 6–8 agent hours: state model, three poster layouts and the switch animation. Depends on the palette decision; type and tokens come with F-006. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-004

**3D self-model, one pose per state**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🔴 Large |

🧑 **→ Human action required: Procedure**<br />Make and hand over the model, following [self-model asset](DESIGN.md#self-model-asset).

| | |
|---|---|
| **Issue** | Each poster's central figure should be a 3D model of Daniele, posed for work, play (with FPV goggles) and sleep, instead of the reference posters' drawn characters. |
| **Reproduce** | [Self-model asset](DESIGN.md#self-model-asset) for making the model; then `npm start` and switch states. |
| **Check** | The model loads lazily after first paint; each state shows its pose and switching animates between them; it responds to pointer (look-at or orbit within limits); the render loop pauses when the tab is hidden; without WebGL a still render shows; models total under 3 MB; the page keeps 60 fps on a mid-range phone. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** the agent can build the three.js component with a placeholder model (a low-poly head with goggles) now, so only the asset swap waits on the owner. Port what helps from the earlier attempt's `wireframe-*` components (`../voidrbain-new/voidbrain.net/src/app/components/`).

**Estimates:** Large remaining effort, about 6–8 agent hours for the component, loading, poses and fallback, not counting the owner's capture and cleanup. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-005

**Interactive HUD components and charts**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟣 Very large |

🧑 **→ Human action required: Decision**<br />Say which charts show real data and from where, in [design](DESIGN.md#open-decisions).

| | |
|---|---|
| **Issue** | The posters' furniture (calendar strips, wireframe spheres and grids, charts, QR code, terminal, arrows, hazard stripes) must be live components, not pictures. |
| **Reproduce** | `npm start`, in each state hover, focus (Tab) and drag every HUD piece. |
| **Check** | Every piece reacts to pointer and keyboard and has an accessible name; charts expose their values as text; real-data charts show current values from their agreed source; nothing blocks the first paint; reduced motion stops decorative animation. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** list the pieces per poster, port the reusable ones from the earlier attempt (`sinusoid-graph`, `random-flash-matrix`, `terminal`, `wireframe-sphere`, `wireframe-room`, `wireframe-fpv-plane`) to Angular 22 signals and the new tokens, and add data shaping in `src/app/core/` with specs. Real-data sources wait for the owner's choice.

**Estimates:** Very large remaining effort, about 10–14 agent hours across roughly a dozen components. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-006

**Design tokens and fonts for the three posters**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔶 P2 | Open | 🟡 Medium |

💻 **→ Human action required: No**<br />Propose the three palettes and two licensed fonts as tokens in `src/styles.scss`, with the style guide tables.

| | |
|---|---|
| **Issue** | The style guide's art direction has no tokens or fonts in code yet. |
| **Reproduce** | `src/styles.scss` is empty; STYLE-GUIDE "Colour" and "Type" list nothing. |
| **Check** | Each state has ground, ink and accent tokens on `:root`, listed in the style guide; text pairs pass WCAG AA; a display face and a monospaced face are self-hosted under `public/assets/fonts/` with their licence recorded; no component uses a literal colour. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** pick open-licence faces (SIL OFL) that match the stretched/blackletter-tech headline and HUD captions; define tokens per state, check contrast, fill the style guide tables. The palette-to-state pairing follows F-003's decision.

**Estimates:** Medium remaining effort, about 2–3 agent hours. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
| Opened | 2026-11-24 |
| Verification | Pending |
| Reviewed | 2026-11-24 |

</details>

---

### F-007

**Repository remote, CI and deploy to the Apache host**

| Signal | Priority | Status | Effort |
|:---:|---|---|---|
| 🔴 | 🔺 P1 | Open | 🟡 Medium |

🧑 **→ Human action required: Decision**<br />Choose the GitHub remote and the deploy method in [design](DESIGN.md#open-decisions).

| | |
|---|---|
| **Issue** | The repository is local only, so CI never runs, and there is no way yet to put the build on the voidbrain.net host. |
| **Reproduce** | `git remote -v` prints nothing; README "Deploying" names no method. |
| **Check** | The repository has a GitHub remote with `main` protected and the `CI` workflow required; a PR runs CI green; the deploy (manual script or CI job) uploads `dist/voidbrain-net/browser/` without deleting legacy folders, and the README says how. |

<details>
<summary>Next action, estimates and PR history</summary>

**Next action / closure evidence:** once the owner chooses, add the remote (for example the existing `voidbrain/voidbrain.net`, which holds the earlier Angular attempt, or a new repository), push, open the first PR so F-001 gets its CI run, and write the deploy (an upload that never uses a "delete extra files" mode). Branch protection and deploy secrets are the owner's settings.

**Estimates:** Medium remaining effort, about 2–3 agent hours plus the owner's repository settings. Estimated 2026-11-24; not acceptance evidence.

| Field | Value |
|---|---|
| PR / evidence | — |
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
