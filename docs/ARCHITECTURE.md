## 2026-10-27 실제 빌드·개발 운영 경계

현재 `scripts/build.mjs`는 `build-ui-v2.mjs`를 호출한다. 후자는 `artifact-modules.mjs:ENGINE_MODULES`의 기존 엔진과 `src/ui-v2`의 state/market/contracts/views/management/champion-art/official/dialog/app, 기존 native browser storage를 조립한다. 구형 UI 모듈은 새 화면 조립에 넣지 않는다. index.html/dist는 이 경로의 생성물이며 직접 편집하지 않는다. 아래 구형 UI 모듈 소유 설명은 참조/호환성 조사 자료이지 현재 새 화면이 전부 그 renderer를 호출한다는 뜻이 아니다.

게임의 사실은 기존 command/writer·단일 시계/결과·관측·기록/저장이 소유한다. `match-core-*`의 새 코어 자료/입력/복원 골격을 실제 경기 물리/운영 전환으로 혼동하지 않는다. #233 원자료 차단과 #234 승인된 변형 대회/일정 명세를 보존한다. 과정/품질 도구가 게임 결과를 생성하거나 기존 writer를 복제하지 않는다.

개발 자동화와 게임의 사무국 AI는 분리한다. `codex-development-preflight.mjs`는 로컬 worktree/같은 UID cwd 관측·공유 환경 lease, `codex-change-risk.mjs`는 실제 Git diff의 보수적 검토 분류를 담당한다. 원격/다른 머신의 생존을 보장하거나 사람 승인/보호를 대체하지 않는다. CI는 테스트/위험 증거만, 기존 long-career는 실제 생성 월드 플레이테스트/분기 측정만 수행하고 소스를 자동 수정하지 않는다. 초기 Codex는 단일 실행으로 분석→기능/엔진 구현→QA→PR을 수행하며 자동 병합/릴리스는 비활성이다.

---

> Documentation review 2026-10-03: [navigation](README.md), [active priorities and validation](DEVELOPMENT.md). Latest explicit user direction and later confirmed decisions supersede dated instructions; historical evidence is retained.

# LOL GM Architecture Guardrails

## Purpose

LOL GM currently uses a standalone HTML development preview. The final delivery target is an offline-capable Android app (see ANDROID_TARGET.md). Canonical source is split by simulation domain and concatenated only at build time; mobile packaging must preserve clear engine/UI/storage boundaries.

## Module boundaries

The authoritative module order lives in `scripts/artifact-modules.mjs`.

- source snapshots: `champion-source.js`, `system-source.js`
- deterministic utilities: `random.js` (RNG streams and shared numeric helpers)
- simulation core: `engine.js` (one-game match), `draft.js` (draft), `systems.js` (automatic items/runes and system-meta)
- baseline/domain data: `data.js` (templates), `champion-data.js` (champion normalization), `system-data.js` (item/rune normalization), `champs2.js`
- player lifecycle: `player.js` (evaluation/identity, squad-role promises, champion learning, player generation, rookie cohorts)
- player development/training: `development.js` (training plans, facilities, daily recovery, age curves, seasonal growth)
- professional meta evidence: `meta.js`
- patch lifecycle/balance: `patch.js` (replay/calendar), `patch-balance.js` (diagnosis), `patch-content.js` (content lifecycle)
- series engine: `series.js` (First Selection, Fearless, best-of sessions, replay)
- competition engine: `competition.js` (schedules, stages, standings, scheduled-series orchestration)
- world configuration/bootstrap: `world.js`
- calendar: `calendar.js` (world clock positioning, next calendar day, dated patches and once-per-day effects)
- season orchestration: `season.js` (league/international calendar, official-match pause/resume, day progression)
- offseason orchestration: `offseason.js` (season closeout, market close, promotion/relegation)
- persistence: `save.js` (non-mutating compact save view and parse handoff), `save-migration.js` (versioned encoding migration, legacy v15 normalization and transient cache cleanup)
- roster/registration: `roster.js` (local eligibility, contracted-move accounting, organization roster rules, 1st↔reserve planning/movement, roster integrity)
- transaction gateway: `state-transaction.js` (shared read-only validation/preview, stale-state guards, revalidation and guarded commit), `state-player-actions.js` (signing/renewal, full transfer, release and contract-option command handlers) and `state-rollback.js` (action-scoped undo log and post-commit membership checks)
- facilities and club economy: `development.js` owns infrastructure levels, timed construction and physical training/analysis/recovery effects. `finance.js` owns budgets, prepaid cash movements, conservative forecasts and audited annual statements, while `offseason.js` chooses board investments and `calendar.js` activates completed construction on world days. See `docs/PHASE_12_FINANCE.md`.
- management domains: `office.js` (regions), `office-international.js` (global governance), `finance.js`, `contracts.js`, `contract-negotiation.js`, `transfer.js`, `scouting.js`, `staff.js`, `scrim.js`, `player-relations.js`, `features.js`, `role-conversion.js`, `career.js`
- draft information layer: `draft-analysis.js` (scouting-bounded mastery estimates, meta/composition evidence, opponent-intent explanation); legality and selection remain in `draft.js`
- domain UI: `ui-setup.js`, `ui-match.js`, `ui-manager.js`, `ui-data.js`, `ui-patch.js`, `ui-market.js`, `ui-market-initial.js`, `ui-negotiations.js`, `ui-market-staff.js`, `ui-champion.js`, `ui-player.js`, `ui-roster.js`, `ui-draft.js`, `ui-season.js`
- modal/keyboard ownership: `ui-overlay.js` (single dialog lifecycle, background inerting, focus containment/return, dismissibility policy for match reports, practice drafts and locked official First Selection)
- shared transient UI state and screen routing: `ui-state.js` (cross-screen view state, six routes, route bindings, scroll restoration and world-replacement reset). Programmatic route focus and keyboard access to overflowing tables are owned here; the markup shell carries the main landmark/skip link and narrow-screen/reduced-motion rules. Cooperative season-day/Monte-Carlo work carries a world/slot/view/render token; route changes cancel outstanding batches and persist completed days.
- Persistence controller: `app.js` serializes every write per save-slot key, prioritizes successful local fallbacks over stale IndexedDB writes on load, and atomically commits a new active slot only after outgoing save and incoming load succeed. UI navigation and interactions are blocked while a slot switch is in progress.
- application shell/controller: `app.js` (storage/bootstrap, shared read helpers and season landing surface)

The match, draft, item/rune, series and competition engines stay separate. `engine.js` owns one-game simulation; `draft.js` owns draft legality/selection; `series.js` owns First Selection/Fearless and best-of state; `competition.js` owns schedules/stages/standings. Scouting-bounded draft analysis stays in `draft-analysis.js`; interactive draft state and confirmation stay in `ui-draft.js`. `draft-preparation.js` reads the actual live pick context through existing legality/utility helpers; it does not create another session or selection policy. `ui-draft-analysis.js` owns existing candidate details, and `ui-draft-preparation.js` owns live comparison presentation and guarded selection back into the existing confirmation path. Focused acceptance is `draft-preparation-acceptance.mjs`; official modal locks, role uncertainty, opponent-private boundaries and pending-seed resume remain required.

`draft-history.js` owns event-time manual pick snapshots, public-sequence/source validation and observer-first private history reads. `draft.js` captures only actual manual confirmations, `series.js` persists authorized snapshots with original public draft order through scheduled commits, and `save.js` retains these source fields through existing lite compaction. `ui-draft-history.js` owns optional archived evidence presentation and revalidated current player/champion navigation, connected by `ui-match.js:renderSeries/bindSeries`. This does not recompute historical utility or certify replayed current-state explanations. Focused acceptance: `draft-history-acceptance.mjs` (scheduled full Bo3, exact seeded outcome/lines/public-meta parity, authority, legacy/pending/lite saves and source buttons).

`match-history.js` captures explicitly public actual game observations and validates archived sources; `series.js` is its writer and `save.js` retains them through lite saves. `ui-match-history.js` owns stored official result rendering and the Analysis Room match selector. Historical series clicks read these records rather than re-running current player state. `ui-match.js` gates owned current mastery/selection reasons and keeps internal explanatory instrumentation out of public result rendering. Focused acceptance: `match-history-acceptance.mjs`; 24-event excerpts, missing quiet/legacy evidence and original model limits remain explicit.

`ui-market-initial.js` owns first-season roster markets; `ui-negotiations.js` owns negotiation forms; `ui-market-staff.js` owns staffing and sponsorship panels and bindings. `ui-match.js` owns scrim/match/series-result rendering, `ui-setup.js` owns world/team selection, `ui-manager.js` owns finance/Monte-Carlo surfaces, and `ui-data.js` owns save-slot/import-export surfaces. `app.js` is not a view bucket.

New large UI surfaces should be added as `ui-<domain>.js` modules instead of extending `app.js`. Squad editing lives in `ui-roster.js`; player detail/scouting lives in `ui-player.js`; draft UI lives in `ui-draft.js`. Small files are kept separate only when they own a coherent domain boundary, not merely to increase module count.

## Domain ownership notes

- `meta.js` owns match-derived meta evidence and query indexes. `patch.js` may consume that evidence for balance diagnosis but does not own meta-history storage/query logic.

- `finance.js` owns club cash flow, payroll/spending controls, revenue/cost closeout and sponsorship acceptance.
- `contracts.js` owns player market valuation, contract terms/options/signing and the AI contract/FA market.
- `contract-negotiation.js` owns shared persisted negotiation state, player terms/rounds, reopening and agreement through the player-action gateway. It serves initial, FA, renewal and transfer personal terms.
- `transfer.js` owns recruitment workflow, seller fee negotiations and permanent transfer execution. Recruitment tracking remains a shared consumer of player negotiation outcomes.
- `scouting.js` owns observed player knowledge and reports; contract/transfer code may consume its public estimates but must not reimplement scouting uncertainty.
- `staff.js` owns staff departments, staffing limits, coaching profile, generation, AI management and manager staff actions.
- `player-relations.js` owns player condition modifiers, relationships, usage and satisfaction/transfer-request lifecycle.

- World-office league expansion (`office-international.js`) combines historical region presets with `FUTURE_LEAGUE_MARKETS`. The latter contains only potential geographic markets, not real league identities. On a successful expansion roll the office selects historical or speculative candidates; speculative leagues receive a generated, collision-checked `leagueName` and unique `short`. The initial world preset list remains unchanged. New league history and branding must survive v15 saves, and the same canonical `addRegion` team generation, roster and `leagueComp` schedule rules apply. No static preset-only assumption is allowed when reading the chosen candidate's strength.

- `scrim.js` owns scrim readiness, AI partner scheduling/value and practice effects.

Static reachability audits distinguish dead wrappers from supported entrypoints. Legacy stage 5-3 removes uncalled initial-signing, forced-salary-floor, match-ID, scheduled-opening-draft, direct squad-moving and FA-offer aliases; canonical negotiation, competition and `roster.plan` transaction paths remain. Both `autoBuildInitialSquad` and `rosterMoveCheck` are still required by smoke acceptance and must not be removed. This is not permission to delete save migration or compatibility code.

Required cross-domain hooks are not optional features: the ordered standalone manifest always loads `SYSTEM_EFFECT_KEYS`, champion-pool patch adaptation, satisfaction/player-state/role-conversion usage rules, staff migration and initial-market budget/ownership checks. Do not hide a missing engine dependency behind a `typeof ...==='function'` fallback. Runtime-dependent browser APIs (`indexedDB`, preview timers) and the supported legacy save-migration procedures are separate concerns and must not be pruned simply because a static reference appears rare. A previous player-aging call to the undefined `resetRoleConversionSeasonLoad` symbol was dead and has been removed without introducing a new yearly reset mechanic.

## State and cache rules

Roster mutation must flow through the roster-domain helpers (`assignPlayerToTeam`, `removePlayerFromTeam`, `validateRosterPlan`/`applyRosterPlan`) instead of ad-hoc cross-module array edits when the operation is covered by those APIs. Managed-club and AI reserve-squad decisions submit `roster.plan` through the shared `validateWorldAction` / `previewWorldAction` / `applyWorldAction` gateway. Manager negotiations, yearly contract/FA markets, AI transfers, releases and options use the same gateway with `player.sign`, `player.transfer`, `player.release` or `player.option`. Engine-enforced roster maintenance is explicitly marked as `system`, distinct from user-selected `manager` and club-decided `ai` actions; these all share underlying player transaction validators. The preview contains only command intent, save-identity/roster/date ownership snapshots and proposed changes; never store the preview in a save. Domain writer failures, partial financial updates and invalid post-write membership roll back the affected player's state, club rosters/depth charts, cash/fees, news and derived market-demand cache before returning an error. This journal is action-scoped, not a global world-undo facility. Old direct low-level roster helpers remain available for world bootstrap and migration. Low-level `signContract` and `doTransfer` also remain as domain writers for world bootstrap and transaction application. The gateway does not yet cover every retirement, league restructure or youth intake mutation. Match-slot changes are a separate concern owned by `lineup.js`.

Read-only eligibility lookups and contracted-move counting belong exclusively to `roster.js` and never normalize player state during command previews. Domain writers and save restoration explicitly normalize legacy eligibility. The same `localRegistrationError`, `contractedMoveError` and `teamNonLocalCount` functions serve AI candidate selection, manager actions and transaction validation; do not introduce parallel registration or move-limit implementations. Permanent reassignment and release both use the roster domain's `detachPlayerFromRosters` helper to clear stale memberships. The old empty `PAY_SCALE` compatibility table and unused renewal alias have been retired; regional finance remains configurable, and old version-15 save migrations remain supported.

Player generation and rookie-supply rules belong in `player.js`. Training/facilities/seasonal attribute growth belong in `development.js`.

World bootstrap must not own season execution, offseason processing or persistence. `season.js` owns competition orchestration, `calendar.js` owns world-clock positioning and daily effects, `offseason.js` owns year-transition processing, and `save.js` owns serialization. `world.js` is limited to configuration, region/team topology and career bootstrap.


Persistent game state lives under the world DB object. Module-level caches must never own persistent state.

Caches that depend on a world or patch use `WeakMap` ownership so a reset/new save can be garbage-collected and cannot reuse another world's values. Cached champion/system evaluation and item/rune fit are invalidated by patch revision counters. Draft pool snapshots also include world date and tournament pool identity so professional-eligibility changes cannot reuse stale pools. Meta-history patch/competition/region indexes incrementally append newly recorded matches and rebuild on history array replacement, truncation or tail-row identity change. Filtered-query results and sorted patch evidence have 64/12-entry LRU bounds, and patch UI filter facets use the same index. Current-patch item/rune usage evidence is aggregated once per patch/row revision, preserving direct-scan statistics. Historical reconstructed patch snapshots are held in a per-world 8-entry LRU and can be reconstructed from retained note history after eviction. These derived caches never enter saves.

Historical patch objects are reconstructed from the pinned 26.19 source plus retained patch deltas. A full baseline copy is not serialized into every save.

## Save rules

`SAVE_VERSION` and the `buildWorld().version` schema must match; CI rejects drift. The world schema remains 15; storage encoding changes are independently tracked by `saveFormat` (current format 2), and missing markers mean legacy format 1. Unsupported world/encoding versions or malformed payloads cause a clear load error, never a silent new-world replacement.

High-volume records may use a compact persisted representation only when `unpackDB` restores the exact runtime structure. Meta-history packing preserves date, patch/competition dimensions, teams, players, positions, items, runes and bans.

Derived caches and baseline snapshots must not be serialized. Save compaction must build a serialization view; it may not delete or rewrite fields in live runtime objects merely to reduce persisted size. Save migration is a load-time operation only; it restores player attr/tendency/pool arrays, legacy staff fields, eligibility data, compressed meta history and safe missing world-market containers without changing pending official series, career history, contracts or negotiation state. Older storage namespaces are kept as backups and not purged during startup; cross-major world-schema upgrades (e.g. 14 → 15) are not assumed safe. Corrupt/unsupported saves are preserved for recovery. Slot writes capture the destination key and world when scheduled to prevent writing into the wrong slot after switching.

## Build and CI rules

`scripts/artifact-modules.mjs` is the only module-order manifest used by build/check/smoke tooling.

CI rejects:

- JavaScript syntax failures
- duplicate top-level global symbols across concatenated artifact modules
- save-schema version mismatch
- incomplete pinned champion/item/rune source coverage
- core UI monolith growth past the maintainability budget
- dedicated 11.5 regression-baseline violations from `scripts/regression.mjs` (world/player/roster/contracts/staff/local rules/patch/system/draft/Bo3/Bo5/save-resume)
- smoke-test violations including patch-cache isolation, query-cache invalidation, non-mutating save packing and save round trips
- performance-probe execution failures for series simulation, draft/system caches and indexed meta queries

The generated root `index.html` is a deployment artifact. Canonical edits belong in `src/artifact/*`. CI rebuilds it from the canonical module manifest and uploads the HTML with its exact source SHA, repository, run ID, byte length and SHA-256. The historical standalone-sync job now verifies that artifact with read-only contents permission; it never commits or pushes generated files to main. Pages consumes the same successful main-run artifact, verifies provenance and rechecks current main before deployment. The existing launcher and identical online/offline HTML downloads remain. scripts/sync-standalone.mjs and its original tests are retained as historical behavior evidence, without a workflow consumer; they are not the publication path.

- lineup domain: `lineup.js` owns official five-player slot assignment and validation; `p.role` is player identity, not an eligibility gate.
- role conversion domain: `role-conversion.js` owns proposal acceptance/refusal, long-term training progress, role-use acceleration, opportunity cost and primary-role identity changes. It does not gate one-off lineup assignment.
- player detail/scouting domain: `ui-player.js` owns player detail, scouting search/report rendering and role-conversion controls; `ui-roster.js` owns squad editing/bindings.

Market FA replenishment uses the same preview/commit/rollback gateway via
`roster.market-callup`, with decision and assignment owned by `roster.js`. This
maintenance operation precedes complete registration and preserves historical
market behavior (including no squad-move satisfaction/event changes); it is
AI-only, market-only and cannot operate on a manually managed club. Ordinary
manager/weekly reserve swaps retain full `roster.plan` validation.

Release cost is read from `contracts.js::contractReleaseCost` by both the UI
and player commands. `finance.js` owns release liability accrual, payroll and
spending-tax calculations; current contract state remains their only input.

R06/R07 remove unused mulberry32, monteCarlo, ensureChampionVisual,
seriesOpeningDraft, spendingTax and potLabel. The supported RNG, batched
simulation, generated visuals, resumable series and finance payroll queries
remain canonical. UI overlay/state dependencies are required by the manifest;
engine modules may not consume application UI/storage globals.


Club closure is composed by club-closure.js through the system-only club.close
action. Office calls this gateway; roster release remains player-writer-owned
and cash/debt allocation finance-owned. The action journal additionally restores
club lifecycle, selected agreements/negotiations and the managed club fired flag.
Preview snapshots organization membership, contracts, finance and commitments.
Paid/unpaid closure statements persist; annual close excludes inactive clubs.
Separate club cash pools and player-only claims are explicit current scope,
not an assertion about insolvency law or parent guarantees.


D04-B4d2 adds financeTeamIds to closure canonical commands so an active supporting
parent is snapshotted and journaled even when only its reserve closes. The pure
funding plan protects parent claims, proposes matched cash transfers and then
reuses claim allocation. Finance owns both transfer sides; an active parent's
bounded closureSupportHistory is a settled cash record, not annual operating cost.
Closed statements retain funding details; old statements without funding remain valid.


Match/coaching ownership and recruitment ownership are distinct for owned-reserve
careers. managedTeamId remains the actual coached squad for match pauses and saves;
managedRecruitmentTeamId is null for an owned reserve so parent AI continues its
economic work. managerControlsSquad permits only that reserve's sporting controls.
Player-action and negotiation entry points independently reject academy-coach
recruitment; hiding controls alone is insufficient. Parent organization roster.plan
remains AI-owned. First-year academy start uses the shared global initial market,
then the coach confirms the provided roster without rebuilding it at finalization.


D04-B4d3 closure planning recovers a closing owned reserve's surplus after its
claims, then calculates parent support using recovered cash while protecting
parent claims. Negative reserve cash contributes to the liquidity gap when
player claims exist. Existing finance transfer writes and closure journal are
reused. cash_recovery and reserve_support describe matched internal transfers;
active-parent recovery history is bounded to 20 settled entries and never feeds
annual operating revenue. UI renders the transfer direction/kind; legacy support
rows without kind still display as support.


contract-market-behavior owns permanent-transfer consent. Decision evaluation
clones the target team/player and isolates market-demand cache so legacy
normalization in negotiation utilities cannot mutate original preview state.
Player transaction validation checks it for player.transfer and transfer-kind
player.sign, and canonical consent evidence is freshly recomputed before writes.
The transfer writer archives consent with the move; roster internal assignment
continues to use its separate gateway. AI candidate and swap selection reuse the
same consent policy instead of assuming club fee agreement authorizes the player.


D04-B4e2: contract-transfer-market owns AI permanent-transfer proposals and the
market purchase loop. It consumes shared player consent and sends retained/new
contracts to the existing atomic commands. Payroll room is computed from actual
contracts and cash after the fee, with no speculative swap credit. Proposal views
clone player/team data; contracts retains FA/renewal processing and invokes this
module once. Both standalone and engine manifests include the module.


D04-B4f1: player-relations owns signed-role promise status and its usage baseline.
Contract/transfer writers start the baseline inside existing atomic actions;
roster role edits leave promisedRole intact. Official usage tracks unavailable
medical games and satisfaction consumes eligible contract-relative appearances.
The current-role and contractual-role UI are distinct. Optional baseline fields
persist with existing player/contract saves and rollback snapshots.


D04-B4f2/B4g1: player-representation owns embedded stable agent entities and
oral role promises. It registers player.promise with the existing atomic handler
registry after player actions. The player journal already captures promise/agent
fields and career events. Satisfaction selects the stronger commitment and reuses
one usage evaluator. Representatives shape negotiating demands and patience, not
client utility. UI-player-commitments owns compact status and confirm/cancel
controls; player detail/roster delegate to it. Agents/promises are optional save
fields; no second contract, roster, finance or preview ledger is introduced.

상단 내비게이션과 표시 상태는 `ui-state.js:updateAppNavigation`, 공통 토큰·레이아웃은 `shell.html`이 소유한다. 주요 이동은 모바일을 고려해 상단에 유지한다. 시작 전에는 새 게임/불러오기, 커리어 시작 후에는 기존 목적별 route를 표시한다. (12.3.1 이전의 표시 설명을 보존한 문장이다. 최신 세 작업 startup/설정·복구 ownership은 아래12.3.1을 따른다.) 분석실 경기 복기는 `ui-match-history.js`의 목록/선택 요약/실제 기록·사건·밴픽 탭으로 구성하며 transient review/reviewTab 상태와 source authority를 분리한다. 전체 도메인 UI 교체는 12.3–12.5의 다음 실제 연결 검증 단위로 남는다.

`match-adjudication.js` owns the first nexus terminal state and aggregate event clock, independent of optional trace storage. `engine.js` applies termination guards to actual phases/actions and final duration; `seriesResultLines` and public official observations consume that exact duration. `match-history.js` preserves/validates optional versioned ending provenance; old observations remain unchanged. `ui-match-history.js` shows only stored ending source. Acceptance: match-adjudication/match-ending plus real official pending/save/review and quiet/logged parity. This is an ordered aggregate model, not exact simultaneous geometry; Purchase ledger follows in DEVELOPMENT 8.2.1; source-backed XP/wave adjudication remains 8.5.1.

`item-purchases.js` owns pure pinned recipe/inventory validation and atomic actual-bank purchase commits; systems owns plans, engine owns cash accrual/cache revision, role-quest-match owns existing free transforms and actual ward debit. match-history owns optional actual resources v1 validation, ui-match-history owns optional archived economy presentation, save retains whole publicRecord in full/lite histories. Focused verification: item-purchase-ledger-acceptance, system-patch-experiments and real official pending/history browser flow. No manager purchase command, generic earned-power redesign, new refund or complete exclusive metadata is implied. Startup three-action replacement remains the next authorized UI slice; engine source priorities are DEVELOPMENT 8.2.1/8.5.1.


## 구매 장소 조사 도구와 구현 경계

`scripts/shop-availability-probe.mjs`는 테스트 harness의 실제 엔진을 독립 VM에서 실행한다. `npm run investigate:shop -- --output=/tmp/shop-probe.json`으로 기본 네 시드/기록·무기록을 관측하고 `--seeds=seed1,seed2`로 1–8개 시드를 지정한다. 도구는 제품 모듈/저장 형식에 포함되지 않는다. 원래 함수와 같은 입력의 승패·개인 기록·골드/장비/퀘스트·종료·기록/설명 동등성 및 세계 저장 불변을 검사한다. 합성 직접 writer 호출은 물리적 위치 또는 공식 경기 증거로 사용하지 않는다. 귀환·사망은 `engine.js`, 장비 골드 writer는 `item-purchases.js`, 와드 골드 writer는 `role-quest-match.js`가 소유한다. 아직 실제 기지/복귀 가용성이 구매에 연결되지 않았으며, 출처 없는 시간을 추가하지 않는다. 현재 증거·원자료 요청 제한·구체적인 연결 수용은 DEVELOPMENT의 8.2.2에 유지한다.


## 8.3.1 장비 기반 방어 소비

`system-data.js:itemDefenseStatEffect`는 기존 source 정규화에서 HP/armor/MR의 방어 proxy 기여만 분리한다. 새 `itemDefs.defenseStatEffect`는 source 기준으로 저장되고 legacy 누락은 순수 읽기로 유도한다. `systems.js:inventoryDefenseStats`는 실제 inventory/퀘스트 장비의 raw stats를 합산한다. `engine.js`는 base+level+gear를 사용하며 동일 raw proxy를 중복 적용하지 않고 기존 effect delta/비수치 proxy와 aggregate식을 유지한다. patch revision은 실제 combat cache 갱신에 포함한다. 장비/장부 writer, 공식 source/history UI와 저장 소유권은 바뀌지 않는다. `inventory-defense-acceptance.mjs`와 기존 ledger/ending/patch/domain runner가 소비 경계를 확인한다. 이 절 작성 당시 공격 earned-gold는 미완료였고 아래8.3.2에서 현금 경로를 제거한다. 전체 raw stat/effect mechanics는 아직 미완료다. 과거 공식 source는 재계산하지 않는다.


## 8.3.2 공격 장비 소비

`system-data.js:itemAttackStatEffects`는 기존 정규화의 AD/AP source 기여를 분리해 저장한다. `systems.js:inventoryAttackStats`는 실제 inventory/quest equipment의 raw AD/AP를 읽으며 legacy split을 순수 유도한다. `engine.js:combatStats0`는 base+level+owned AD를 소비하고 raw AD의 기존 proxy 중복 및 cash conversion을 제거한다. 기존 AP/AS/crit는 집계 proxy로 남으며 MID bonusPower는 장비 AD/남은 AP 기여에 적용한다. 구매/패치/퀘스트 cache, 원자적 장부와 source/UI/history 소유자는 유지한다. 집중 acceptance는 inventory-offense, 기존 실제 scheduled draft-history 및 domain runner에 있다. 전체 피해/주문/가용성·shop 구현으로 확대 주장하지 않는다.


## 8.4.1 교전 자원·실제 기록 연결

`combat-resources.js:applyFightDamage`는 target remaining aggregate EHP를 소비하는 작은 shared writer다. module list에서 engine 앞에 로드하며 기존 quest/terminal 함수를 소비한다. `engine.js:fight`는 실제 starting/survivor HP fraction, 기존 queued order/RNG를 유지하고 effective packet 결과를 공통 writer에 전달한다. `simulateMatch.damageBasis`→`match-history.js:publicMatchRecord` optional source→`ui-match-history.js` 공식/분석 설명→기존 full/lite save로 이어진다. legacy는 source를 추정하지 않는다. `combat-resource-acceptance.mjs`가 writer/fight/official/source/UI/legacy/저장 경계를 확인한다. engine size budget을 바꾸지 않았다. 나머지 효과/피해/동시 처리 및 old record의 진짜 source 인증은 별도 미완료다.


## 8.6.1 오브젝트 작성자와 당시 source

`objective-awards.js`는 actual availability/identity·participant validation과 기존 reward/quest/respawn/buff를 소유한다. engine의 call 및 fight participant IDs/survivor conversion이 명시적으로 공급한다. actual result.objectiveEvents→match-history optional source/validation→ui-match-history의 공식/Analysis 펼침→기존 full/lite save가 연결된다. gold eligibility는 기존 모델을 유지하며 실제 위치를 추정하지 않는다. `objective-award-acceptance.mjs`가 paired actual writers, 실제 경기·source/UI/legacy/save를 검증한다. 나머지 reviewed reward/transition와 rollback 범위는 DEVELOPMENT8.6.1에 유지한다.


## 8.4.2 실제 처치 보상과 당시 설명

`takedown-rewards.js`는 기존 `killPlayer` actual writer와 preflight actor ownership/availability·unique assist·기존 gold/XP/quest를 소유한다. `engine.js`의 fight/라인/갱킹은 실제 actors를 공급하고 결과 receipt를 반환한다. `match-history.js`의 optional bounded takedowns v1 검증/복사→`ui-takedown-history.js` 순수 표현을 official/Analysis에서 호출→기존 full/lite save로 이어진다. 새 UI module의 의존 fixture를 명시적으로 로드하며 budget을 올리지 않는다. takedown-reward-acceptance와 existing domain/regression/browser에서 actual writer/normal parity/source/권한/save를 확인한다. 반올림·거리·simultaneous policy와 exception rollback의 미완료 범위는 DEVELOPMENT8.4.2를 따른다.


### 8.3.3 실제 아이템 수치 패치

`system-data.js:itemRawStatFields/applyItemRawStatNote`는 pinned source provenance와 raw AD/HP/armor/MR old/new·단위를 검증하고 stats/effects/source split을 함께 작성한다. `patch.js:applyNote`가 성공한 노트의 patch/system revision을 갱신한다. `patch-balance.js`는 기존 stat size profile/관측 meta 정책을 재사용하며 private planning copy로 같은 패치 내 노트 순서를 구성하고 stat 타입을 기존 cooldown에 포함한다. owned gear/combat·choice/draft의 기존 consumers/caches, 역사 replay/save는 동일 note 경로를 사용한다. `ui-patch.js:noteText`가 당시 이름/수치/기준 source와 fictional 조정을 표현한다. 검증 위치는 `scripts/item-stat-patch-acceptance.mjs`와 `scripts/item-stat-patch-scenarios.mjs`, 근거/한계/정확한 다음은 DEVELOPMENT8.3.3이다. AP/AS/crit/조건 효과·exact spell execution은 별도 미완료 범위다.

## 8.6.2 실제 스틸 실행자 source

`engine.js:objectiveTick`가 실제 lj 스틸 성공 때 actor를 `objective-awards.js`에 전달한다. 공통 writer는 소유/alive JGL을 기존 participant와 중복 없이 합치고 quest를 작성하며 optional receipt.stealer를 기록한다. `match-history.js`는 실제 source를 복사하고 `recordedObjectivesValid`는 archived JGL/participant 포함을 검증한다. `ui-match-history.js:renderRecordedObjectives`는 당시 이름을 optional details에 표시한다. 구형/일반 receipt에 actor를 추정하지 않는다. focused source/official/save/UI/거절 검증은 `objective-steal-acceptance.mjs`, bounded 자연 재현은 `objective-steal-probe.mjs`이며 확률/보상/위치 규칙은 변경하지 않는다.

## 8.6.3 구조물 선택의 실제 rule/source

`engine.js:selectStructureLane`가 허용 후보의 progress 우선·canonical seeded tie를 소유하며 `takeStructure`가 opt.lane/allowInhib/terminal과 실제 tier/기존 gold/quest writer를 소유한다. 실제 result.structureSelectionBasis→match-history 복사/지원 marker 검증→ui-match-history의 당시 한국어 rule 설명→기존 full/lite save. `structure-selection-acceptance.mjs`가 permutation/RNG·양측 자원/거절·official/legacy/save/UI를, `structure-selection-probe.mjs`가 bounded actual trace를 검증한다. 기존 RNG 순서/결과는 의도적으로 바뀌며 macro hunters comparator와 정확한 geometry는 미완료다.

`macro-picks.js` owns canonical seeded macro hunter selection and actual archived pick participant capture/validation; engine macroTick retains existing tactics/help/fight/conversion rules. `publicMacroPicks` is called by match-history and `ui-takedown-history:renderRecordedMacroPicks` renders archived public participants, connected through official/Analysis match reviews. Focused ownership/save/permutation acceptance is `macro-hunter-acceptance.mjs`; reproduction is `macro-hunter-probe.mjs`. Neither module decides physical reach or exact simultaneous spell timing.

`combat-resources.js:applyPreparedFightRound` owns the aggregate round-start participant budget and whole packet input preflight. `applyFightDamage` owns actual side.ps ownership, opposite-side/availability/finite damage and effective target-budget consumption. Engine fight prepares and shuffles using existing streams; a prepared actor can resolve after its HP reaches zero in that round, but cannot prepare a new round attack. Optional `combatRoundBasis` goes through match-history to `ui-takedown-history:renderRecordedAdjudicationBasis` in official/Analysis reviews and full/lite saves. `fight-round-probe.mjs` preserves actual observer traces; `fight-round-acceptance.mjs` checks mutual damage, invalid batch rejection, official/source/save and legacy purity. This is no exact cast-time model or callback-exception rollback.

`combat-resources.js:applyLaningHpCost` owns finite0–1 owned/alive nonlethal lane HP-cost mutation. Engine laningTick passes existing loser/winner/failed-all-in costs/floors; costs never heal and do not manufacture damage stats/deaths. Existing recall and kill writers remain separate. Optional `laningHpBasis` travels through public official source/record validation to archived Korean review/Analysis explanations and full/lite saves. Focused128 boundaries/phase/official acceptance: laning-hp-acceptance.mjs; raw observer: laning-hp-probe.mjs. Exact spells, shop transitions and wave XP remain outside this boundary.

### 8.4.5 isolated match combat cache

`engine.js:combatStats` caches `combatStats0` by minute/level/questRevision/buff flags plus actual itemRevision and patch identity/revision. Earned/held/spent cash is not a combat input. Player profiles, attrs/playerMod and team mods are fixed for one isolated simulation; future supported in-match mutations must add their revision. HP/deadline availability is consumed outside cached maximum stats. No global cache or persistent schema change. `combat-cache-acceptance.mjs` compares actual supported mutations and every request in bounded logged/quiet pairs against uncached calculation, then official/pending/full-lite/review continuity. `combat-cache-probe.mjs` preserves baseline/corrected computations and exact bounded outcomes; DEVELOPMENT8.4.5 owns measurements/limits.

### Initial observed recruitment presentation (12.5.1)

`ui-initial-candidates.js` owns pure observed read snapshots, origin-region/overseas/all filtering, full paging, stable sorting, detail and ephemeral return context. `ui-market-initial.js` owns shared initial action markup and guarded calls to existing recruitment/scouting/negotiation commands. `ui-negotiations.js` accepts an explicit read DB (default current DB), with optional initial-context guard before action bindings. No engine economics, permission policy or save schema is duplicated in presentation. Focused executable coverage is `scripts/initial-recruitment-acceptance.mjs`; real keyboard/layout/command and missing-source limits live in DEVELOPMENT12.5.1.

`scouting.js:obsOvr` now delegates role aggregation to existing `playerRoleRating` with `observedPlayerAttributes` only. This removes the observed MID NaN caused by the tendency-only roaming key while preserving the established role-rating normalization. It does not expose true attributes/tendencies or alter the role-key policy. The acceptance retains the original expression for bounded non-MID parity and actual MID counterexamples.

### Initial same-context observed comparison (12.5.2)

`ui-initial-comparison.js` owns ephemeral max-three IDs, pure FA-authorized snapshots, shared public-sample conditions, archived-source details and guarded existing actions/return. `ui-observed-radar.js` renders only the same ten compatible observed 1–99 metrics; missing axes never become zero and the numeric table remains primary. Existing role-source/getters and initial command ownership are reused, with no permanent save schema. Public meta rows lack game IDs: source rows are not authenticated independent-game denominators. `ui-market-initial.js` must not overwrite guarded bindings with later direct handlers. Existing public champion labels use `championLabel`, not an undefined alias. General/match-metric radar and language/finance remain separate approved work.

### Conditional initial offer impact (12.5.3)

`ui-initial-offer-preview.js` owns FA/owned-target permission checks, private-copy existing transaction projection, numeric before/after presentation and ephemeral return context. Existing career/finance/roster/contract writers own rules and actual agreement. `ui-negotiations.js:initialNegotiationDraft` preserves raw form fields through preview rerenders; round/attempt changes invalidate restoration. No live-world mutation, new saved schema, alternate agreement writer or acceptance prediction. Existing initial shared action guards remain the command boundary.

### Startup and career/save boundary (12.3.1)

`ui-startup.js` owns ephemeral home/career/load/settings and boot-error recovery, with actual `ui-state.nav` dispatch. Existing setup/career and app per-slot queues/storage own rules and persistence. New career runs on a private copy and commits identity after successful save; occupied/unknown slots are not silently replaced. Boot recovery with DB=null writes no outgoing corrupted slot. `ui-data.js` guards actual callbacks by DB/slot/render and rebinds after import. `app.loadDB` distinguishes unreadable backend from genuine empty data. No new saved UI schema or game economy. Focused acceptance is `startup-flow-acceptance.mjs`; raw source failures/actual browser/storage limits are retained in DEVELOPMENT12.3.1.

### 12.3.2 구단 브리핑·동시 입력 소유

`ui-club-briefing.js`가 ephemeral owned-club read/context와 overlay 이동·복귀를 소유한다. `app.viewSeason`/`ui-season.bindSeason`이 소비하며 날짜·official·contract writer는 기존 engine/shared command다. 복사본 단일 negotiation render와 선택적 root를 가진 공통 UI controls가 배경 시장과 팝업 입력을 분리한다. root 기본값 document는 기존 호출을 유지한다. live world에 view용 negotiationStore를 만들거나 새 저장 schema/계수를 추가하지 않는다. 순수 조회/현재 권한·stale·실제 원문/수동 행동·저장 수용은 club-briefing-acceptance.mjs와 DEVELOPMENT12.3.2를 따른다.

### 12.3.3 소유 구단 등록·가용 조회와 기존 수동 명령

ui-club-eligibility는 full JSON 읽기 복사본에서 다음 실제 fixture의 공식/국제 명단, 현재 의료 가용, 저장 선발과 existing officialMatchView 보정을 구분한다. ui-club-briefing에 읽기·행동 진입을 제공하고 ui-registration의 선택적 db/allowed/root/after를 통해 기존 roster.register·roster.official-lineup writer를 재사용한다. 기존 default caller·AI/규칙/save schema를 바꾸지 않는다. UI context·actual dialog identity·등록 source snapshot과 확인 후 guard로 오래된 입력을 거절하며 world reset은 ephemeral draft만 지운다. 실제 의료 대체·정확한 미래 출전/전체 등록 adjudication은 이 presentation의 완료 범위가 아니다.

`ui-club-finance.js` owns pure owned finance snapshots, provisional existing-writer sponsor projections and context guarded finance/sponsor overlay actions. `finance.js` remains the single sponsor/cash/settlement writer; `ui-manager.js:financePanel` and `ui-transfer-terms.js:transferPaymentsPanel` accept an optional read DB while default callers retain DB. Sponsorship bindings in the market use the same current world/slot/view/offer guard; staff bindings retain their separate writer. No new engine or save schema.

### 현재 구단 직원 presentation (12.3.5)

ui-club-staff는 private cloned read/ephemeral filter·draft와 실제 현장 source를 소유한다. ui-staff-controls는 market/overlay scoped root와 현재 world-slot-manager-dialog guards를 공유하고 기존 staff commands·rollback만 사용한다. 고용 full profile과 official filtered staff profile은 기존 consumers로 분리한다. 등록은 ui-registration의 기존 writer를 사용하며 새 saved schema·engine/economy coefficients는 없다.

ui-club-medical은 owned/ownedreserve full JSON read로 현재 의료 가용·저장 계획·실제 plan consumer·일일 기록·의료 이력을 분리한다. ui-roster의 기존 단일 medicalPlan writer를 current-context scoped binding과 공유하고 의료/AI/등록/자동 대체/save 규칙은 바꾸지 않는다. confirmed popup 입력과 실제 dialog/DB/world/slot/manager 객체·render/날짜·source snapshot을 재검사한다. 기존 비동기 saveDB/SAVEFAIL을 유지하며 전체 I/O rollback을 보장하지 않는다.

### 소유 선수 계약 presentation (12.3.7)

ui-club-contracts는 private full JSON의 현재 계약·기존 재계약/옵션 가능 조건·역할 사용량·지연 합의를 읽고 guarded 계약 진입을 시장/독점 창구/브리핑과 공유한다. 기존 startNegotiation/option journal/contract agreement activation/player-relations usage/finance payroll이 단일 writer·consumer다. ui-club-briefing의 기존 scoped negotiation controls와 return focus를 재사용한다. 실제 dialog/DB/world/slot/manager 객체·source snapshot은 stale callback을 막고 읽기에 lazy negotiationStore를 쓰지 않는다. 저장 schema·AI·가격·의료/등록/계약 규칙은 바꾸지 않는다.

- 12.3.8 `ui-club-practice.js` owns private cloned current training/resource presentation and scoped ephemeral drafts; `ui-squad-controls.js` binds existing roster/tactics/lineup/role draft inputs with the shared current context guard. Existing squad-preparation command/journal, practice-resources/development/calendar and save writers retain rules/state ownership. UI budgets10500/3000 are new owned budgets; engine101 files and all prior budgets stay unchanged. See DEVELOPMENT12.3.8 for actual acceptance, counterexamples and limitations.

### 12.3.9 스크림 예약 UI 소유 경계

`ui-club-scrim.js`는 current owned clone 조회·저장된 own 참가 원자료·임시 팝업 초안/문맥 방어만 소유한다. `ui-scrim-plans.js`의 optional db/root는 기존 선수단 호출을 유지하고 동일 private preview/current recheck/commit binding을 공유한다. `scrim-plans`·`scrim-partner`·`practice-resources`·일일 calendar와 기록/저장 writer는 기존 규칙/가격/동의 seed/의료·공식 가용을 소유한다. UI가 미래 선발이나 상대 private practice를 생성하지 않는다.


### 현재 관심 후보 브리핑의 읽기·수동 쓰기 소유권 (12.3.10)

`ui-club-recruitment.js`는 닫힌 화면에서 관심 수만 읽고, 열린 목록·상세를 private JSON clone에서 생성한다. `ui-market.js`와 공유하는 현재 문맥 guard는 기존 recruitment/scouting domain writer를 확인 뒤 호출한다. UI는 보고서·평가·공개 출전 source를 소비하며 가격/AI/engine/save schema를 소유하지 않는다. 공개 출전 검사는 기존 `ui-initial-comparison.js`의 순수 source helper를 재사용하고 초기 FA 권한은 재사용하지 않는다. 현재 수용·한계·후속의 단일 active guide는 DEVELOPMENT12.3.10이며, 손실 없는 원로그 archive는 `scripts/verify-club-recruitment-evidence.mjs`로 tmp 없이 검증한다.

12.5.4.4 표현 경계: `shell.html`의 ink/surf/control-line과 native color-scheme이 실제 기존 밝게/어둡게/자동 테마 소비를 소유한다. 장식용 line과 활성 입력 경계는 분리한다. `ui-startup.js`는 기존 설정 저장/current guard를 유지하고, `ui-setup.js`는 같은 수동 구단 선택 writer 앞에 필수 선택을 배치하며 원래 설명을 native details 안에 보존한다. 테마/접힘은 엔진·계약·save schema 상태가 아니다. Python Playwright 수용은 rebuilt 로컬 HTML/차단된 외부 요청에서 실행하며 productionHTTP/실기기 완전 검증을 뜻하지 않는다.

기존 `applyStartupTheme`와 운영 설정 실패 피드백의 소유자는 `ui-theme.js`이다. `ui-state.js:updateAppNavigation`이 nav render 증가 전인 순서를 유지하므로 다음 render 토큰을 전달한다. 역할은 저장된 global preference이며 계약/감독 권한 명령이 아니다. DB/slot/render/select 교체 후 retained handler는 inert이다. 새 테마 파일1500자·기존 startup7000/state6500자 한도는 유지한다.

## 현재 운영 조건·초기 후보 비교표 (12.5.4.5–12.5.4.6)

ui-club-actions는 private cloned 현재 owned 상태를 읽고 scoped 실제 브리핑 버튼으로 기존 writer에 진입한다. manager/DB/world/slot/render/source stamp 검사를 거치며 명령·기한·저장 schema를 소유하지 않는다. ui-initial-table은 transient INITMK의 복수 열과 최대3 정렬 기준/방향만 소유한다. ui-initial-candidates는 기존 관측 obsOvr·잠재 범위 중간값·asking·공개 identity를 비교하고 ui-market-initial은 실제 후보/기존 절차를 표로 렌더한다. shell의 sticky 이름 열과 가로 scroll은 모바일에서 이름/숫자를 함께 확인하기 위한 표시다. 세계/load 변경 시 transient 상태가 초기화되고 계약/의료/등록 소비·역사는 기존 단일 writer/save 경로를 유지한다.

`ui-roster`는 DB/world/slot/manager에 귀속된 임시 후보 복귀 문맥을 소유하며, `ui-player`는 private read copy에서20명 페이지와 관측 상세를 표시한다. `ui-state`는 화면 이동의 스크롤/focus를 보존·복원하고 세계 교체 때 이전 문맥 참조를 지운다. 관찰은 기존 `scoutPlayers`/원자적 domain rollback, 전향은 기존 writer/현재 소유 준비 guard를 사용한다. 선택·미완료 검색어는 schema15/format2 저장에 들어가지 않는다. 집중 수용은 `scout-return-acceptance.mjs`, `scout-return-browser.py`이며 독립 fixture를 기존 전체 UI runner에 등록했다.


## 12.5.4.8.2.2 공식 편집 읽기와 권한 경계

`ui-official-edit.js`는 공식 편집의 일시 시작값과 현재/미적용 비교를 담당한다. 현재 DB를 private JSON clone으로 읽고 기존 roster/staff preview의 거절을 표시하며, 저장 상태·규칙·스키마를 작성하지 않는다. 적용은 계속 ui-registration에서 기존 세계 명령과 atomic rollback만 사용한다. officialRegistrationSnapshot과 기존 staffRegistrationSnapshot을 화면 문맥 및 초안 복원 키에 연결한다. 시작값은 화면의 실제 선택값으로 유지하고 닫기/복원에서 현재값으로 다시 기준화하지 않는다. 현재 저장 공식 선발과 경기뷰 가용 보정은 분리해 설명한다. 거절된 popup 입력은 수동 수정·명시 취소를 기다리며, changed world/slot/manager/render 또는 정책·등록·의료·고용·진행 중 경기 변경은 오래된 writer를 차단한다.
