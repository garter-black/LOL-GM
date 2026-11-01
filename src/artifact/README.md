# LOL GM Shared Engine and Legacy UI Modules

**Current product UI is `src/ui-v2/`**, built by `scripts/build-ui-v2.mjs`.
The authoritative shared engine order is `ENGINE_MODULES` in
`scripts/artifact-modules.mjs`; root `index.html` is a generated output and
must not be edited directly. `UI_MODULES`/`ARTIFACT_MODULES` describe the
retained older UI and historical regression-test assembly, **not** the active
product UI. The old UI must not be used to infer missing/new UI features.

Canonical module ownership after 11.5 Stage 5:

- `random.js` provides reusable deterministic RNG, hashing and math; `engine.js` simulates a single game.
- `data.js` owns reference constants and baseline templates; `champion-data.js` owns champion source/visual normalization; `system-data.js` owns item and rune source normalization.
- `draft.js` owns champion draft evaluation/state; `systems.js` owns automatic item/rune selection and its patch-aware system-meta cache.
- `patch.js` owns patch replay/calendar; `patch-balance.js` computes balance diagnosis; `patch-content.js` implements generated content lifecycle.
- `office.js` handles domestic/regional regulation; `office-international.js` handles global governance.
- Legacy screen implementations (`ui-market.js`, `ui-negotiations.js`, etc.)
  are **not** loaded by the shipped UI v2. The active search/negotiation screens
  are `src/ui-v2/market.js` and `src/ui-v2/contracts.js`.

- `state-transaction.js` provides the shared `validate → preview → apply` command gateway; `state-player-actions.js` owns contracts/transfers/releases/options; `state-rollback.js` owns action-scoped undo and post-commit roster integrity.
- `save.js` packs persistable views; `save-migration.js` restores existing
  world-v15 format-1 and format-2 saves. These migrations are still active
  compatibility and data-protection code and must not be removed as dead UI.
- **Temporary save coupling:** `scripts/ui-v2-browser-storage.mjs` extracts
  native save/load functions from `src/artifact/app.js` and
  `src/artifact/ui-save-library.js`. Extract the shared storage API and migrate
  the old acceptance tests **before** deleting those older files.
- `office-international.js` may found speculative geographic leagues as well as historically modeled regions; speculative league names and abbreviations are procedurally created, collision checked and persisted.

These are ordered, concatenated classic JavaScript source files. The new
product build uses shared `ENGINE_MODULES` plus `src/ui-v2/`; legacy UI files
must not be imported into the product build. Preserve version-15 save
migrations and regression coverage until replacement tests prove parity.
Current continuation and focused validation: [DEVELOPMENT](../../docs/DEVELOPMENT.md).
Full fallback/build commands:

```bash
npm run check
npm run perf
npm run build
```

CI on `main` automatically updates the generated standalone `index.html`.
