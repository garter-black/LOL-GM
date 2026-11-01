# LOL GM

**Codex execution and automation:** See [AGENTS.md](AGENTS.md), the [current GitHub execution map #242](https://github.com/lkh0802a/LOL-GM/issues/242), and [the existing 5-hour automation instructions](docs/CODEX_AUTOMATION_5H.md). Use one existing Codex scheduler/session, one active code writer, and the latest issue/PR/checkpoint. Scheduling and usage limits are governed by the actual automation settings and platform limits; updating these GitHub instructions does **not** start or reschedule Codex.

Mobile-first esports management simulation, playable as offline standalone HTML.
Desktop/mobile HTML comes first; Android packaging follows later.

## Instructions for Codex and implementation agents

**Overall game master specification:** [CODEX_MASTER_BLUEPRINT.md](docs/CODEX_MASTER_BLUEPRINT.md) consolidates the full game loop, cross-engine ownership, 22 invariants, all 10 C-tier directions, 16 implementation groups, user-facing acceptance paths, failure scenarios, and release validation. Pair it with [the execution queue](docs/CODEX_EXECUTION.md) and [33 domain-specific contracts](docs/CODEX_DOMAIN_INDEX.md). **Use the current live [#242 execution map](https://github.com/lkh0802a/LOL-GM/issues/242), not the old #243/#244 historical starting point.**



**All-domain implementation reference:** The [33-section Codex domain index](docs/CODEX_DOMAIN_INDEX.md) links [A — club/player/market/training](docs/CODEX_DOMAIN_A_CLUB.md), [B — match/draft/patch/world/AI/history](docs/CODEX_DOMAIN_B_MATCH_WORLD.md), and [C — mobile UI/save/performance/QA/Android](docs/CODEX_DOMAIN_C_UI_QA.md). Read the relevant sections and cross-domain acceptance before coding. No roadmap or issue document is proof of implementation.


**Codex-only, low-context workflow:** Before coding, read the short [AGENTS.md](AGENTS.md) and the selected issue/current code/tests. Open only the relevant sections of the [execution runbook](docs/CODEX_EXECUTION.md), [master blueprint](docs/CODEX_MASTER_BLUEPRINT.md), or [domain contracts](docs/CODEX_DOMAIN_INDEX.md) when a rule or cross-engine behavior is unclear. No alternative AI/model handoffs. The **current 01 → 01.5 → 02~10 execution sequence** is maintained in [#242](https://github.com/lkh0802a/LOL-GM/issues/242). The next Codex work is **[#331 full approved rulebook](https://github.com/lkh0802a/LOL-GM/issues/331)** using Draft [PR #328](https://github.com/lkh0802a/LOL-GM/pull/328); after its verified completion, proceed to **[#332 codebase/evidence slimming](https://github.com/lkh0802a/LOL-GM/issues/332)** and then **[#233 new 5v5 match core](https://github.com/lkh0802a/LOL-GM/issues/233)**. [#241](https://github.com/lkh0802a/LOL-GM/issues/241) is the continuous integration/acceptance gate, while [#333](https://github.com/lkh0802a/LOL-GM/issues/333) tracks final HTML/Android product release acceptance. The old #243/#244 first-work instructions and P0/P1/P2 labels are historical and must not be used to select work.

Treat issue text as a target, **not proof that code is missing or tested**. Check the latest code, existing PRs and tests, implement the smallest fix, retain established simulation/save rules, report verified test and commit evidence, and only close truly completed issues. The older P2 C-tier engine plan remains in scope. GitHub docs/issue prioritization does not start Codex or mean an issue is fixed.

## Current work

Continue the approved game scope in the [live GitHub execution map #242](https://github.com/lkh0802a/LOL-GM/issues/242), then the verified product/UI/engine work that depends on it. Domain history and detailed design remain in [DEVELOPMENT](docs/DEVELOPMENT.md) and [LOL_GM_SPEC](docs/LOL_GM_SPEC.md).
Historical scoped acceptance is not whole-game completion. No current global
completion percentage is claimed.

Use [document navigation](docs/README.md) for confirmed rules, code ownership,
data provenance and historical evidence. Latest explicit user instructions take
precedence over dated phase/handoff records. One implementation worker owns each
coherent slice; preserve direct management and the confirmed fictional leagues.

## Run and build

Node.js 20+; dependency-free browser application.

```sh
npm run dev
npm run build
```

Open the address printed by the development server. **The shipped interface is
`src/ui-v2/`**, assembled by `scripts/build-ui-v2.mjs`. Shared simulation,
world, contract, competition, and persistence code lives in `src/artifact/`;
`scripts/artifact-modules.mjs` lists the engine modules used by the active build.
The old `src/artifact/ui-*.js`, `src/artifact/app.js` UI entry, and
`src/artifact/shell.html` are **not a second active product UI**. They remain
only where legacy acceptance tests or the native save bridge still depend on
specific code. New screen work must be made in `src/ui-v2/`, not the old UI.
`scripts/build.mjs` generates root `index.html` and `dist/index.html`; do not edit
generated HTML manually. Use the [focused checks](docs/DEVELOPMENT.md#focused-development-map)
for the changed domain; `npm run check` is the full serial local fallback.
All PRs and main pushes receive required complete Actions validation.

## Data and simulation

Champion/item/rune static mechanics are patch-pinned Riot source data; reviewed
supplements and derived simulation fields retain explicit provenance. Draft/match
calibration uses **organized competition records only**, never solo-queue/ranked
statistics. See [source policy](docs/CHAMPION_DATA.md#competition-only-calibration).
Professional source acquisition and validation are not yet complete. The engine
is an aggregate simulation; it does not claim exact spell casts or geometry.

## Saves and delivery

Active world schema v15, compact save format 2, storage namespace `lol-gm-v15`,
ten save slots (defined by `SAVE_SLOTS` in `src/artifact/app.js`). Supported older v15 encodings normalize on load; arbitrary old
schemas and unknown forward formats are not guaranteed compatible. Save files,
source history and failures are preserved. No runtime external API is required
for offline play.

Read [Android delivery](docs/ANDROID_TARGET.md) for later packaging. Long
100-season, device and TalkBack final QA follow implementation and user playtest
feedback/fixes; focused acceptance is not that final QA.
