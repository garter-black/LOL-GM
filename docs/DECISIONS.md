## 2026-10-22 PR253 통합 범위
- 2026-10-17 퇴역 결정의 실제 연결: 포인트/독립 강도·가상 잔여 시간 드릴 제거, 기존 수동 선발·전술·선수 역할·시설·의료·실제 경기/스크림 참가 유지. 실제 참가 없이 잠재력만으로 새 양의 성장을 생성하지 않는다. 기존 성장·의료 계수는 퇴역 제어의 배율 제거 외에 임의 조정하지 않는다.
- 자동 스크림도 감독의 합법 선발표를 기존 검증기로 소비하고, 수락한 전향은 실제 목표 포지션 참가 기록으로만 누적한다. 손상된 공식 경기 점유 근거는 일일 자원 작성 전에 계속 거절한다.
- 옛 저장의 실제 경기·스크림·날짜별 활동 이력/ID·계약·재정은 보존하고 live 훈련 제어만 정리한다. 옛 배분/강도 명령은 명시적으로 거절한다.
- 의료 검사의 옛 강도 코호트는 기존 정상/경량 회복 계획과 실제 normal/light/rest/rehab 노출로 대체한다. 원래 네 시드·시즌 수·표본·발생률/번아웃 상한·저장·원래 VM 한도를 유지한다. 합성 의료 실험은 별도이며 실제 시즌 빈도로 보고하지 않는다.
- 원래 공개 초안95f0917과 과거 증거/실패를 보존한다. main의 역사 원문 검증기/단언은 그대로 유지하며, 초안의 해시 예외를 현재 검증 성공으로 사용하지 않는다. 현재 기능의 필수 게이트와 별도 역사 리플레이 실패는 구분한다.
- 통합 랭크·성장 원인 전체 분석·새 UI 전면 교체·전체 세계 시즌·APK/실기기 수용은 이번 퇴역 연결의 완료 범위가 아니다. 최종 검증/병합/게시 상태는 PR253 체크포인트에서 추적한다.

## 2026-10-17 선수 성장 설계 정정 — 수동 훈련 배분/강도 삭제
- 최신 사용자 승인: 기존 `TRAIN_POINTS`를 사용하는 수동 능력치 배분·훈련 강도 조절 UI 및 그것이 성장/의료/재정에 주는 가공 보정은 제거한다. 실제 공식전·스크림·통합 랭크 활동을 성장 근거로 사용한다.
- 스크림 코치 분석 제안은 유지하되 실제 기록·표본에 근거한 보고서로 구현. 코치/시설/의료는 활동 지원 역할을 보존한다.
- 해당 변경의 초기 소스 클린업은 별도 브랜치/PR로 다루고, 자동화 회귀 검증 및 5:5 통합 랭크 경험 엔진까지 완료한 것으로 취급하지 않는다.

## 2026-10-17 — GitHub 열린 21건의 우선순위 정렬 확정

**사용자 지시:** 게임 전수조사 후속을 단순 신규 이슈 번호가 아닌 **우선순위순으로 정리**. 전체 열린 이슈 21건에 `priority:P0`/`priority:P1`/`priority:P2` 라벨과 `[P0-01]` 형식의 제목 실행 순번을 적용하고 [#242 공식 큐](https://github.com/lkh0802a/LOL-GM/issues/242), [개발 계획](DEVELOPMENT.md), [문서 안내](README.md)를 갱신했다.

- **P0:** #242(총괄), **#243(첫 실제 수정)**, #244(저장 위험 재현/교정). **#241은 P0 상시 수용 게이트**로 모든 작업에서 병행 적용하며 첫 구현 작업으로 오인하지 않는다.
- **P1:** #245 → #246 → #248 → #249 → #247 → #234 → #224 → #225.
- **P2:** #250 → #233 → #232 → #235 → #236 → #237 → #238 → #239 → #240.
- 순위는 **착수 순서**이며 개별 엔진 장기 가치/현재 완료율이 아니다. 외부 실행 의존성·기존 진행 PR 충돌이 없는 독립 수용 가능한 소형 작업은 병렬 허용. P0 상태/기록/저장 오류가 재현되면 상향. 원래 C안 10개, 기존 1–13 및 더 구체적인 승인 수치/정책과 완료 이력은 유지. 문서/이슈 수정은 코드·검증/출시 완료 증거가 아니다.

---

## 2026-10-17 — 전체 게임 전수조사 후속 수정 최우선

**사용자 결정:** 2026-10-17 게임 **102개 엔진/70개 UI 모듈을 대상으로 한 소스 기반 전체 감사**에서 발견한 사소한 결함·성능·정보 공개·역사·UI 문제까지 GitHub 등록하고 **최우선**으로 처리. 이는 같은 날짜 확정된 **10개 C안 엔진 방향을 폐기·축소하는 결정이 아니라**, 신규 대규모 엔진 확장 **전에 정확성·저장·권한·실사용 연결의 위험을 먼저 해결**하라는 개발 순서 변경임.

- **최우선 백로그:** [#242 전수조사 수정/검증 인덱스](https://github.com/lkh0802a/LOL-GM/issues/242). P0 [#243 Bo1 스크림 결과/화면 일치](https://github.com/lkh0802a/LOL-GM/issues/243) 첫 수정 및 [#244 모바일 저장/중단·복원 위험](https://github.com/lkh0802a/LOL-GM/issues/244) 재현·수용 우선.
- 이후 P1 [#245 AI 임대 날짜 %7](https://github.com/lkh0802a/LOL-GM/issues/245), [#246 무작위 comparator 결정론](https://github.com/lkh0802a/LOL-GM/issues/246), [#248 스카우팅/의료 공개정보 경계](https://github.com/lkh0802a/LOL-GM/issues/248), [#249 과거 경기·역사](https://github.com/lkh0802a/LOL-GM/issues/249), [#247 모바일 UI 전체 세계 복사](https://github.com/lkh0802a/LOL-GM/issues/247)와 P2 [#250 선수 닉네임 fallback](https://github.com/lkh0802a/LOL-GM/issues/250)을 각 독립 근거/집중 회귀와 함께 실행.
- 기존 [#224](https://github.com/lkh0802a/LOL-GM/issues/224)·[#225](https://github.com/lkh0802a/LOL-GM/issues/225)·[#232](https://github.com/lkh0802a/LOL-GM/issues/232)·[#233–#241](https://github.com/lkh0802a/LOL-GM/issues/241), 단계1–13, 경기 38항목/감사8항목, 소스 기반 기존 수용/전체 실제 연결의 최우선 지침 [#241](https://github.com/lkh0802a/LOL-GM/issues/241)은 **계속 유지**. 이번 이슈는 작은 실제 버그를 우선 해결할 추적 분리이며 중복 구현/개발 범위 축소를 의미하지 않는다.
- 감사의 소스 코드 위험·사용성 제안과 **실행 재현 완료된 버그를 구분**한다. 800ms 저장 I/O·의료/잠재력 노출·전체 JSON 복사·과거 replay 위험의 사용자 체감/실제 불일치 빈도는 아직 미측정/미재현. 중요한 결함 가능성은 우선 검증한다.
- [DEVELOPMENT.md](DEVELOPMENT.md) 상단 최신 P0 우선순위/수용 목록을 우선 적용. 게임 코드·테스트·CI 결과/PR·게시물까지 이 문서 변경만으로 자동 수정되는 것은 아님.

---

## 2026-10-17 — 엔진 전체 C안 최종 승인 및 GitHub 추적

**사용자 결정:** 2026-10-17 연속 검토에서 10개 영역 모두 **C안** 확정. 범위는 (1) 초정밀 경기, (2) 시간형 이적 협상 혼합형, (3) 통합 실시간 일정·대회, (4) 초정밀 밴픽·전술·상대 AI, (5) 세부 선수 성장·잠재력·노화·의료·훈련, (6) 초정밀 구단 재정/스태프/시설/AI 경영, (7) 관측 불확실성 기반 스카우팅/데이터 분석, (8) 장기 세계·역사·저장, (9) 정밀 계산을 유지하는 모바일 성능 아키텍처, (10) 전체 1–13단계 실사용 연결·원자성·재현성 검증.

- 사용자 C안은 **최종 목표 깊이의 승인**이다. 모든 도메인을 지우고 재작성하거나 기존 수용을 일괄 미완으로 돌리지 않는다. 현실적인 원인→상태 변경→실제 결과를 만드는 작은 구현/검증 단위로 진행한다.
- 신규 GitHub 상위 추적: [#233 경기](https://github.com/lkh0802a/LOL-GM/issues/233), [#234 세계 시계·대회](https://github.com/lkh0802a/LOL-GM/issues/234), [#235 밴픽·AI](https://github.com/lkh0802a/LOL-GM/issues/235), [#236 선수 커리어](https://github.com/lkh0802a/LOL-GM/issues/236), [#237 구단 경영](https://github.com/lkh0802a/LOL-GM/issues/237), [#238 스카우팅](https://github.com/lkh0802a/LOL-GM/issues/238), [#239 장기 역사·저장](https://github.com/lkh0802a/LOL-GM/issues/239), [#240 모바일 성능](https://github.com/lkh0802a/LOL-GM/issues/240), [#241 통합 수용](https://github.com/lkh0802a/LOL-GM/issues/241).
- 기존 [#224 시간형 협상](https://github.com/lkh0802a/LOL-GM/issues/224), [#225 모바일 이적시장](https://github.com/lkh0802a/LOL-GM/issues/225), [#232 패치 엔진 2.0](https://github.com/lkh0802a/LOL-GM/issues/232)은 **별도 신규 중복 이슈 없이 기존 본문+후속 코멘트**로 보강. 시간형 협상 C안은 수동 시 진행과 다음 중요 이벤트 자동 진행/중단. 기존 확정 응답 **일반 2–8게임시간, 고민/경쟁 24–72게임시간, 조건 충족 즉시 수락 예외**와 계약 합의/수동 최종 확정 분리 유지.
- 패치 2.0의 **순수 밸런스 핫픽스**는 해당 날 모든 공식 대회/경기가 끝난 뒤 시행. 게임 세계에서 챔피언·스킬·아이템 버그/악용, 버그성 글로벌 프로 밴, 서버·장비·중계/송출 기술 사고는 발생시키지 않는다. 정상적인 경기/대회 운영 규칙과 Fearless/밴픽 기본 규칙은 유지한다.
- AI·감독 모두 합법적 정보·시장·재정/훈련 자원·경기 규칙 적용. 선수 숨은 잠재력·상대 비공개 연습·미래 경기의 결과를 선취하지 않음. 장기 왕조/쇠퇴·패치 승률을 인위적으로 강제하지 않음.
- 최신 사용자는 **별도 직원/감독 인수인계 기능 제외**를 유지; 기본 계약·재정·자료 소유권 무결성만 필요. 기존 훈련은 스크림을 별도 '팀 연습'과 중복 계산하지 않는다.
- [상위 개발 지침/담당 단계·순서·수용 상세](DEVELOPMENT.md). 문서와 이슈 등록 자체는 **미구현/검증·배포 미완료**이다.

---

> Documentation review 2026-10-03: [navigation](README.md), [active priorities and validation](DEVELOPMENT.md). Latest explicit user direction and later confirmed decisions supersede dated instructions; historical evidence is retained.

# LOL GM — Decision Log

This file records high-impact product/development decisions that future AI work should not repeatedly reopen without new user direction.

## D-001 — Product name

**Decision:** The game/project name is **LOL GM**.

Repository: `LOL-GM`

Canonical master specification: `docs/LOL_GM_SPEC.md`

## D-002 — Development surface

**Decision:** GitHub is the long-term primary codebase.

The existing Claude Artifact is not discarded. It is migrated into GitHub as the current UI/UX starting point.

After migration, Artifact is optional for prototyping/experimentation rather than the primary source of truth.

## D-003 — User role

**Decision:** The user is the game/product director and tester, not the manual developer/integrator.

Do not require routine manual coding, CSS editing, Git manipulation or file transfer when the AI can perform the work.

## D-004 — AI collaboration

**Decision:** ChatGPT and Claude collaborate on the **same repository and implementation**.

There are no separate ChatGPT and Claude versions of LOL GM.

A handoff means continuing existing work.

## D-005 — Claude usage strategy

**Decision:** Claude usage is relatively constrained, so prefer using Claude for high-value implementation work such as:

- difficult UI/UX implementation
- complex multi-file implementation
- architectural refactors
- hard debugging

ChatGPT should reduce ambiguity beforehand, inspect/review afterwards, and handle work that does not require scarce Claude usage.

This is a workflow preference, not a permanent technical ownership boundary.

## D-006 — Current Phase 0 direction

**Decision:** Do not continue expanding the Artifact indefinitely before migration.

The current Artifact should be migrated into GitHub now.

Phase 0 ends when the migration is runnable, stable, mobile-viable and passes the acceptance criteria.

## D-007 — Mobile-first

**Decision:** LOL GM is a mobile-first web game.

Primary UX target: smartphone portrait.

Tablet/desktop support follows responsively.

## D-008 — Engine separation

**Decision:** UI is not game truth.

Simulation, rules, draft legality, standings calculation, growth and other domain logic must be separable from presentation.

## D-009 — Stable identity

**Decision:** Persistent entities use stable IDs.

Display names are presentation data and must not be permanent cross-entity keys.

## D-010 — First real playable milestone

**Decision:** After migration, priority is a real core loop:

`New Game → Team Selection → World Creation → Date Progression → Schedule → Draft → Match → Result/Stats → Standings → Continue Season`

Management depth comes after this loop has real persistent state.

## D-011 — Long-term scope is preserved

**Decision:** The master specification remains the target.

Do not delete previously requested systems merely because they are deferred to later phases.

Deferral is not deletion.

## D-012 — Validation philosophy

**Decision:** A feature is not complete merely because UI exists.

Important systems must produce real state changes/results and survive navigation, season progression and later save/load work.

A 100-season automated simulation is a developer/QA validation target, not a player-facing mode.


## D-013 — Current implementation ownership

**Decision:** ChatGPT is the current primary implementation, GitHub integration, review and debugging agent.

Claude/GitHub integration is not available in the current workflow and is not required for progress.

If Claude or another external AI is used later, it is an optional specialist contributor. It must receive a bounded task and return work that continues the same GitHub implementation.

## D-014 — Artifact migration accepted

**Decision:** Phase 0 Artifact migration was accepted on 2026-09-26.

Evidence:

- migrated source modules match the supplied Artifact source byte-for-byte except the intentional product branding change in `shell.html` and Artifact README
- `npm run check` succeeds locally
- `npm run build` succeeds locally
- `npm run dev` serves the app successfully
- GitHub Actions CI succeeds on `main`
- generated source and repository source blob hashes match

The project advances to `PHASE_1_CORE_GAME`.


## D-015 — No legacy save compatibility

**Decision:** During the current pre-release Phase 1 refactor, legacy Artifact saves do not need to remain compatible.

There are no user saves that must be preserved.

Consequences:

- Phase 1 starts a clean save schema at version 10.
- browser storage from pre-current development namespaces is not imported
- old save migration helpers are removed rather than carried indefinitely
- schema changes may invalidate current development saves when that produces a cleaner long-term model
- once real user saves matter, explicit save migrations become mandatory again


## D-016 — Stable champion, season and match identity

**Decision:** Phase 1 no longer uses champion display names or season-local match numbers as durable identity.

- champions have stable `ChampionId` values separate from display names
- player champion mastery/pools use `ChampionId`
- draft picks/bans and champion statistics use `ChampionId`
- patch notes target `ChampionId`
- seasons have stable IDs containing year, competition and deterministic identity
- match IDs are namespaced by their season ID and carry season/competition references

These changes intentionally invalidate older development saves, so the active save schema is version 10.


## D-017 — Blank-roster first season and save schema v11

**Decision:** The first season no longer offers an existing-roster start mode. Every active club begins with a blank roster, every generated player enters the global FA pool without a contract, and the season cannot open until registration rules are satisfied.

- the player selects an eligible independent club, then constructs the first-team roster and any owned reserve roster from the global FA pool
- AI clubs construct their rosters from the remaining FA pool under the same core registration constraints
- owned reserve movement is an ownership privilege; independent second-division clubs are manager-selectable but are not call-up/send-down partners
- the common default roster profile is first team 5–10, owned reserve 5–10, integrated organization 11–20, with league-specific profiles available for later overrides
- the active save schema is version 11 under the `lol-gm-v11` namespace
- older development saves remain unsupported


## D-018 — Player domain schema v12

**Decision:** Player-system work uses save schema version 12 under the `lol-gm-v12` namespace.

- player overall ratings are position-weighted rather than a flat average
- primary/secondary position familiarity was explicit and trainable in the v12 implementation; this permission model is superseded by D-058
- nationality is explicit while region remains the registration/scouting origin key
- reputation and market value are distinct from raw ability and feed player-market logic
- form, condition, fatigue, morale, match sharpness, team adaptation and tactical adaptation are bounded match modifiers
- champion profiles retain official, scrim and training experience; learning ability, champion difficulty and meta adaptation affect mastery
- each player has an individualized growth/peak/decline profile; potential is not a guaranteed future rating
- player career snapshots/events preserve team, division/squad, contract, transfers, titles, awards and retirement information
- match lines carry position-sensitive ratings plus gold/GPM/DPM-compatible data

Older development saves remain unsupported.


## D-020 — Player roles and satisfaction accepted

**Decision:** Major item 3, `선수 만족도 / 역할`, is accepted as complete on 2026-09-27.

- roster expectations use five explicit levels: core starter, starter, competition, backup and prospect
- each role carries an expected playing-time share; actual team and player games are accumulated from real series
- satisfaction is persistent and gradual rather than an instant performance-collapse switch
- dissatisfaction can come from playing-time gaps, reserve assignment, under-market contract, weak team results, role mismatch, missing international opportunities and unmet career goals
- players have career goals derived from age, potential, reputation and ambition
- severe unresolved dissatisfaction can produce a transfer request only after persistence; recovered satisfaction can withdraw it
- manager role changes are explicit UI actions and role downgrades can carry a satisfaction cost
- AI clubs rebalance roster roles after offseason market changes
- satisfaction affects renewal and transfer intent while detailed contract negotiation remains reserved for major item 5
- item 3 was verified by smoke tests and a mobile standalone-browser scenario that created and displayed a playing-time-driven transfer request


### D-020a — Conservative LoL roster expectations

LOL GM treats pro LoL lineups as relatively stable rather than football-style rotation squads.

- core starters expect about 90% usage and normal starters about 76%
- competition players expect only limited spot usage; backups and prospects can spend long periods without official games
- ordinary bench usage does not create playing-time complaints
- playing-time dissatisfaction starts primarily for promised core/starter players after a substantial sample of team games
- satisfaction decays slowly and transfer requests require severe dissatisfaction that persists across repeated evaluations
- weak team results, reserve assignment, salary and career-goal complaints also use stricter thresholds so discontent remains exceptional rather than routine


## D-021 — Fixed starting five and conservative dissatisfaction

**Decision:** LOL GM uses a LoL-style persistent starting five rather than FM-style automatic rotation.

- every active squad keeps one explicit starter per TOP/JGL/MID/ADC/SUP in a persistent Depth Chart
- a small OVR change never replaces a valid starter automatically
- the manager changes starters explicitly from the squad screen
- AI reviews starters mainly in the offseason and requires a clear performance/ability reason: roughly a 5-point ability gap, or a 3-point gap combined with severe form/condition/transfer-request trouble
- if a starter leaves the squad, only that now-invalid slot is automatically repaired
- core starters normally expect about 98% availability and starters about 94%; competition/backup roles do not imply football-style rotation
- normal bench life does not create playing-time complaints for backup/prospect players
- playing-time dissatisfaction requires a large, sustained breach of a core/starter promise after a meaningful sample of games
- transfer requests require very low satisfaction and a long unresolved concern streak, and can be withdrawn after conditions recover

This supersedes any interpretation of item 3 that would cause frequent routine starter rotation.


## D-022 — Cross-system realism baseline

**Decision:** Before major item 4, existing simulation systems use a conservative LoL-esports realism baseline rather than FM-style high churn.

- normal live-game patches target a roughly 14-day cadence with occasional longer gaps; league offices cannot dynamically speed up or slow down the developer patch calendar
- ordinary balance patches are smaller, systemic rule changes are rare, and new champions are not tied to every major patch
- current Tier-1 seasonal structure remains three regional splits separated by First Stand and MSI, ending at Worlds; fictional league team counts/formats may intentionally differ
- LCK-style spending regulation is a soft system based on the five highest salaries, not a hard total-payroll registration cap
- spending above the reference line creates a progressive burden that is redistributed only to eligible teams; the recommended floor is not enforced by automatically inflating salaries
- other regions do not automatically inherit Korean spending regulation; fictional league offices may adopt a similar mechanism only as a rare long-term reform
- offseason AI roster moves require materially larger upgrades; academy call-ups need a clear ability/performance reason; contracted transfers are rarer than FA moves
- player contracts are mostly one or two years, with three-year deals concentrated among young or elite players
- annual rookie intake scales from first-division ecosystem size, not total reserve-team count
- league structural reforms occur only in the offseason, at most one material regional change per year, with multi-year cooldowns for repeated reform types
- ownership changes require sustained financial or competitive pressure and are rarer than before

This baseline is a calibration pass, not completion of later dedicated systems such as contracts, finance, patch engine, league office, or season structure.


## D-023 — Region-first realism

**Supersession note:** D-025 supersedes the policy-output parts of D-023 and D-024. Region names no longer assign derived financial, roster, import, market, or office policies; only observable world-state inputs may differ.

**Decision:** Real-world regional leagues are modeled from their own ecosystem rules and market behavior. LCK is never the generic template for another named region.

- LCK keeps its own integrated first/reserve roster model and Korean SFR interpretation
- LEC uses its own top-five SFR model, including a 50% floor, a 50% excess fee up to 150% of the threshold, a 100% fee above that level, and only half of collected SFR fees returning directly to compliant LEC teams; the rest is treated as ecosystem support
- LCS uses a wider full-roster profile and an open-market recruiting bias instead of inheriting LCK integrated-roster rules
- LCP uses a multi-region/promotion-relegation identity and its own roster profile
- LPL remains a high-spending, high-competition market without silently inheriting Korean SFR parameters
- Historical baseline: CBLOL was a distinct Brazilian ecosystem. The confirmed 2026-10-04 new-career South American LSA identity supersedes this geography; legacy saves retain their recorded region identities.
- when a current rule cannot be verified, LOL GM uses a neutral global baseline and records the uncertainty rather than copying another region's rule
- fictional regions can choose any model explicitly, but named real-world regions must not receive another region's rules by default

This principle applies to future work on scouting, contracts, Tier 2, finance, league offices, schedules, and international qualification.


## D-024 — Policy engine over global defaults

**Decision:** LOL GM does not use a static global league-policy template when a rule is unspecified.

- verified or intentionally configured regional rules are treated as initial conditions and are locked only for the dimensions explicitly supplied
- missing policy dimensions are inferred independently from the region's own structure and economy
- the policy engine considers first-division team count, owner wealth, top-five payroll dispersion, local talent depth, Tier-2 ownership structure, market scale, and current league system
- it independently resolves roster structure, market profile, import openness, recruiting appetite, and whether a soft spending-control mechanism is justified
- custom/fictional regions are policy-engine-native from creation
- after creation, league-office reforms continue to respond to multi-year regional evidence; weak evidence means no change
- policy changes are component-based rather than choosing a whole 'LCK model', 'LEC model', or 'global model'

The correct fallback for uncertainty is evidence-driven inference or status quo, not copying another region.


## D-025 — Engine owns policy outputs

**Decision:** The simulation engine, not hand-authored regional labels, owns all derived league-policy outputs.

- named-region presets may provide observable world-state inputs such as identity, strength, team count, current competition structure, or whether a Tier-2 scene exists
- presets must not directly assign spending regulation, salary thresholds, market archetype, import appetite, roster-policy profile, office ideology, or regional pay scale
- regional pay scale is derived from market strength, league size, tier and structural context
- roster policy is derived from the actual Tier-2 ownership structure
- market behavior and import policy are derived from local talent depth, fan demand, owner spending power and regional strength
- spending regulation is introduced only when measured payroll dispersion, ownership resources and league size create enough pressure
- spending thresholds, redistribution share, floor and excess burden are calculated from the region's own payroll/fan/talent data
- office style is derived from the same regional conditions rather than assigned by region name
- engine decisions persist their evidence in policyBasis so UI, tests and future systems can explain why a policy exists
- no special-case branch is allowed solely because region id equals KR, CN, EU, NA, AP or BR

Constants may define simulation mechanics, but regional outcomes must result from shared engine logic and observable inputs.


## D-026 — Rookie and scouting pipeline accepted

**Decision:** Major system 4 is complete with an engine-driven long-term talent pipeline and uncertainty-based scouting.

- rookie intake volume is calculated from first-division size, Tier-2 size, current young-player depth, development infrastructure and regional competitive strength
- position generation responds to shortages in the existing young-player pool instead of using a fixed equal quota
- rookie quality follows a shared ordinary → solid → good → rare elite distribution; each regional class also gets an engine-sampled quality wave, so most classes have 0–1 elite prospects but genuine golden generations can produce multiple elite prospects, while weak classes can produce none
- generated rookies are 17–19 and receive the same full player schema: identity, nationality, attributes, potential, personality, champion pool, role familiarity and development profile
- regions with Tier 2 mark rookie entry through the development pipeline; market logic naturally pushes most non-immediate starters toward reserve/second-tier roster filling
- scouting is stored as a player-specific report, not a single fixed percentage
- report uncertainty expands for young, foreign, Tier-2 and low-sample players
- observations from official matches and manual assignments increase knowledge with diminishing returns
- current ability estimates narrow with knowledge; potential always remains a range even at high knowledge
- reports include public official-match samples, recent growth direction and observed champion-pool information
- reports lose knowledge when they become stale
- scouting search supports region, role, competition, contract status, rookie/prospect status, name and an observed-information-only undervalued-prospect filter
- the active save schema is v13 under the lol-gm-v13 namespace; older development saves remain unsupported

Item 5 (contracts / transfer market) is now active.


## D-027 — No hard elite-rookie cap

**Decision:** Rookie quality uses probabilities and class conditions, never a fixed per-region elite quota.

- there is no maximum of one elite rookie per region or per year
- each regional rookie class receives a stochastic class-quality wave derived inside the shared rookie engine
- elite and high-level prospect probabilities respond to regional ecosystem quality and that year's class wave
- most classes naturally produce zero or one elite prospect because elite probability is low, not because of a hard cap
- genuine golden generations may produce multiple elite prospects in one region and year
- weak generations may produce none
- the pro labor market is maintained with enough visible players before the transfer window; per-team emergency player generation is forbidden


## D-028 — No emergency roster generation

**Decision:** A normal LOL GM world must never solve a roster shortage by creating a player at the moment a club needs one.

- structural league changes are finalized before the annual rookie class is generated
- rookie intake calculations include total active pro roster demand, a free-agent labor buffer and position-specific supply
- the engine guarantees enough visible regional ecosystem players to cover all active rosters before the transfer window opens
- final roster filling searches the existing eligible global FA market, subject to import rules, instead of silently creating a local player
- if the invariant is ever broken, the simulation throws a development error so the supply model is repaired rather than hidden
- talent scarcity is allowed to mean a shortage of quality, experience or affordability; it must not mean the world literally runs out of players


## D-029 — Maintain a liquid prospect market

**Decision:** Rookie generation targets a healthy labor market, not merely enough bodies to fill active rosters.

- annual intake has a materially larger natural flow than the minimum roster-replacement requirement
- the engine maintains a free-agent/prospect liquidity buffer of roughly one extra player per active team, adjusted upward by Tier-2 scale and expected turnover
- expected contract expiries and older-player retirement risk increase the next class before shortages occur
- each position keeps additional supply beyond one player per team, so clubs can have actual choices in the market
- the visible pool self-corrects because unsigned careerless players can leave the simulation after prolonged failure to find a club
- quality remains probabilistic: increasing quantity does not directly increase any individual prospect's rating or potential


## D-030 — Cohort-based rookie quality

**Decision:** Rookie supply quantity and rookie-class quality are separate engine processes.

- player quantity is determined by pro labor demand, Tier-2 scale, expected turnover and market liquidity
- class quality is determined by a cohort engine with a shared world-year component plus a regional component
- regional class strength weakly mean-reverts after extreme years, preventing permanent streaks of golden generations without imposing a hard quota
- each role receives its own smaller cohort wave, allowing years such as a strong jungle/support generation but weak mid/ADC generation
- the engine records each regional class as 흉작 / 약한 세대 / 평년 / 풍년 / 황금세대 from the realized quality index
- class-quality waves change the probability distribution and slightly shift within-tier quality; they do not guarantee a number of elite players
- a golden generation may still produce no elite prospect by chance, while multiple elite prospects can appear in the same year
- a global cohort factor can make several regions strong or weak in the same year, while regional shocks preserve independent variation
- cohort volume varies modestly, but it may never reduce generation below the labor-market supply invariant

This replaces the earlier single independent classWave draw with a persistent, explainable cohort model.


## D-031 — Contract and transfer market accepted

**Decision:** Major system 5, `계약 / 이적시장`, is accepted as complete on 2026-09-27.

- player salary demand and market value are derived from ability, age, upside, reputation, recent performance, contract state, role demand and regional economy rather than fixed tables
- contracts support realistic short durations plus optional signing bonus, performance/title/international bonuses, buyout, team/player option and promised roster role; clauses are optional rather than mandatory
- player negotiations are persistent, multi-round exchanges with demands, counteroffers, patience and collapse risk instead of one-click acceptance
- contracted transfers separate club-to-club fee negotiation from player personal terms; seller counteroffers and buyouts are supported
- recruitment follows `interest → observation/scouting → internal evaluation → formal offer → negotiation`; A/B/C priorities persist as the manager shortlist
- rival offers remain intentionally opaque; the player evaluates money, promised role, team strength, international opportunity, facilities/coaching, career goal, contract stability and other relevant terms, and may choose a competitor while talks continue
- renewals are negotiations rather than automatic extensions, while release/expiry and contract options are handled explicitly
- AI clubs use the same market constraints and contract concepts, execute renewals, FA signings, releases and selected contracted transfers, and move to alternatives over market rounds
- AI recruitment of external players uses imperfect market observations instead of reading hidden potential directly
- first-season blank-roster construction now uses the formal contract-negotiation workflow for the player club; AI clubs use the same contract structure and registration/budget constraints
- open negotiations expire at the registration/market deadline and cannot silently remain live into the season
- recruitment and negotiation state survives save round trips
- item 5 is verified by smoke coverage, production build/standalone HTML generation and successful GitHub Actions CI

Item 6 (Tier 1 / Tier 2 / Academy) was accepted complete on 2026-09-27 after ownership/promotion rules, atomic first/reserve roster planning, AI parity, reserve closure handling, repeated lifecycle validation and promotion-cycle pressure tests passed.


## D-UX-001 — Management convenience is part of completion

**Decision:** Management UX is evaluated as part of system completion, not as optional polish.

- prefer staged multi-edit workflows when users naturally make several related choices before committing
- validate the final proposed state atomically when temporary intermediate states may be illegal
- show actionable validation reasons and expected corrections
- preserve list/filter/scroll context across repeated scouting, market and roster actions where practical
- provide batch actions for genuinely repetitive management work
- optimize dense management screens for smartphone portrait rather than treating horizontal desktop tables as the primary interaction
- destructive and financially material actions require clear consequences before commitment
- AI and player actions must converge on the same final domain validation even when their interaction flows differ

This applies retroactively to completed major items during later UI touches and must be checked again in item 22 final integration.


## D-032 — International ecosystem and qualification contract

**Decision:** LOL GM uses three seasonal international phases for first-division professional teams. Competition prestige tiers never mean domestic Tier 2/Academy participation.

- Phase 1: First Stand (`FIRST_STAND`), 12 teams, six core leagues initially receive two slots each. Two groups of six play BO3 single round robin; top four per group advance to an eight-team BO5 single-elimination bracket. Same-league teams are separated across groups.
- Phase 2 Tier 1: Mid-Season Invitational (`MID_SEASON_INVITATIONAL`, display `MSI`), 16 teams. Six core leagues receive two base slots each and four additional slots are distributed by international coefficient/office. All teams enter Swiss; ordinary Swiss matches are BO1 and advancement/elimination matches are BO3. Eight advance to a BO5 double-elimination bracket; the Grand Final has no bracket reset.
- Phase 2 Tier 2: Eastern Cup (`EASTERN_CUP`, `EC`) and Western Cup (`WESTERN_CUP`, `WEC`), eight teams each. Initial regional allocation is 3-3-2 by regional international coefficient. Two groups of four play BO3 double round robin; top two advance to BO5 semifinals/final.
- Phase 3 Tier 1: World Championship (`WORLD_CHAMPIONSHIP`, display `Worlds`), 24 teams. Initially six core leagues receive four slots each and no league may exceed four Worlds slots. The league phase uses three pots of eight; every team plays six BO3s, exactly two opponents from each pot including its own pot, with no rematches and no same-domestic-league pairing. Top 16 advance. At the Round of 16 only, ranks 1–8 are drawn against ranks 9–16; that draw fixes the entire BO5 single-elimination bracket through the Final.
- Worlds league-phase ties use match wins, strength of schedule, set differential, opponents' set differential and set wins. A still-unresolved 8/9 seeding boundary or 16/17 qualification boundary is decided by a BO1 tiebreaker rather than random elimination.
- Worlds boundary-tie refinement (user confirmed 2026-10-24, issue #234 comment 6377687670): after the five league-phase metrics, use the actual head-to-head winner for a two-team tie if a match exists. For three or more tied teams, use their mini-league match wins only when every pair has played; incomplete or still-tied boundary groups enter a BO1 single round robin. After each full round robin, repeat only the subgroup still tied across ranks 8/9 or 16/17 until actual results resolve the boundary. Preserve completed matches and support saving/resuming between new tiebreak matches; never force a winner.
- Phase 3 Tier 2: Masters (`MASTERS`), 16 teams. Six core leagues receive two base slots; four additional slots are coefficient/office allocated, with a hard total maximum of three Masters teams from one league. Four groups of four play BO3 double round robin; top two advance to a BO5 single-elimination bracket.
- Phase 3 Tier 3: Open (`OPEN`), 12 teams. Initially each of the six core leagues receives two slots. Two groups of six play BO3 single round robin; same-league teams are separated and the top four per group advance to a BO5 single-elimination bracket.
- A team may enter only one international competition in the same phase. Slot rights and one-season vacancy filling are separate concepts; league size alone never determines international slots.
- All international knockout series are BO5. Fearless remains fixed.
- International slot allocation is owned by the international office and may evolve from in-world international results. Initial strength seeding is only a bootstrap when no in-world history exists.
- Each domestic league office independently chooses its season structure (one long season, multiple splits, or another format) and its international qualification tournament/competition procedure.
- Direct qualification by regular-season table cutoff is forbidden. League standings may determine qualifier eligibility, seeding or byes, but the international berth itself must be decided through competitive matches such as playoffs or a qualification tournament.
- During every international phase, all first-division domestic official competition pauses globally, including for clubs not attending an international event. Training, scrims, rest and roster management remain available.
- Exact calendar dates, international coefficient arithmetic, tournament patch lock and emergency international roster rules remain to be finalized before major item 19 is accepted.
- These canonical specifications are recorded now; executable tournament scheduling/format support remains owned by the later international-season system rather than being approximated through legacy formats.


## D-033 — Club infrastructure and staff control boundary

**Decision:** Facilities are organization infrastructure, not repetitive manager chores. Training, analysis, recovery and youth facilities have distinct simulation effects and upkeep; club management automatically decides capex from finances and philosophy through the same validated upgrade rules for every club. The player observes infrastructure state/effects but does not manually click upgrades. Sporting staff appointments remain player-controlled because they create meaningful strategic trade-offs. Specialist staff age, circulate through the market and materially affect development, analysis and recovery; AI clubs manage them under the same financial constraints without hidden information.


## 2026-09-27 — Champion/meta simulation rules
- New champions are globally unavailable in professional draft for 14 days after release, then unlock automatically by stable champion ID and date.
- Competitive meta evidence is tracked both globally and per region. Teams learn from both, with their own regional sample weighted more strongly; coach analysis and scrim analysis still control observation noise and adaptation speed.
- Champion base stats and abstract kit dimensions are simulation inputs, not display-only metadata: they feed draft valuation, composition/counter logic, phase scaling, combat offense/EHP, and patch balance changes.


## D-034 — Champion data, eligibility and evolving meta

**Decision:** LOL GM champion/meta simulation uses pinned source data and persistent public-learning state rather than fixed tier labels.

- The initial 26.19 world embeds the complete 173-champion Data Dragon baseline with stable internal IDs and Korean display data.
- Global professional eligibility and tournament champion-pool eligibility are separate; training/scrims may use globally banned new champions before official unlock.
- Tournament champion pools lock at competition start and do not silently expand after a later global unlock.
- Official games preserve long-term champion meta history with competition, season, year, stage, league, region, team, player and actual-position context.
- Team analysis creates persistent meta knowledge; repeated losses create counter-research state, so adoption and answers emerge at different rates by team.
- International games accelerate cross-region learning; tier presentation remains derived from observed presence/performance.
- Major champion reworks are rare stochastic patch events and retain champion identity.


## D-035 — Champion/meta/patch stage accepted

**Decision:** Major system 9, `챔피언 / 메타 / 패치`, is accepted as complete on 2026-09-27.

- The canonical starting dataset is pinned to LoL 26.19 / Riot Data Dragon 16.19.1 and covers all 173 initial champions with stable LOL GM identity, Korean champion/skill names and Korean passive/Q/W/E/R descriptions.
- Source-derived fields and simulation-derived mechanics remain distinguishable. Source descriptions are normalized for safe display; missing mechanics are not falsely labeled as authoritative Riot values.
- Champion source fields materially feed draft/composition/combat calculations; meta tiers remain derived from observed match evidence rather than fixed champion power labels.
- Official meta history supports region, patch, competition, season, year, split, league, domestic/international, period and actual-position analysis, with player/team/matchup/recent champion insights.
- Global pro eligibility, tournament pool locking, practice access, regional learning/counter-research and rare stable-ID reworks remain persistent simulation rules.
- Major system 10 owns the deeper autonomous patch engine: diagnosis, change targeting/magnitude, rollback/oscillation control and long-run balance validation are not implied complete by this decision.


## D-036 — Evidence-driven live patch ecosystem

**Decision:** Major system 10, `패치 엔진`, is accepted as complete on 2026-09-27. LOL GM treats patches as evidence-driven changes to a living champion/item/rune/system ecosystem rather than fixed random ± values.

- Balance diagnosis uses per-patch sample reliability, pick/ban pressure, win rate, recent trend, actual-position flex, regional/international spread, top-team usage, player/team concentration and composition dependence. Win rate alone never determines a patch.
- Same-direction consecutive changes are damped; severe evidence can override the guardrail, while opposite evidence after an overshoot can produce a partial rollback.
- Champion changes may touch base/growth stats, attack range, spell range, resource costs, cooldowns, damage, utility, healing, shielding and mobility. Notes retain exact old→new values and internal size (`micro/small/medium/large`).
- Mid-scope and rare major reworks preserve stable champion IDs and therefore preserve player mastery, career records and historical meta references.
- The canonical 26.19 system baseline is the pinned Riot Data Dragon 16.19.1 Summoner's Rift catalog: 254 purchasable item records and 62 selectable runes across five styles. Item IDs, Korean text, source prices/stats and recipe edges are retained; rune IDs remain attached to their original style/slot. Matches consume this full source automatically by selecting starters, purchasing component recipes toward final/boot builds, and building a legal 4-primary + 2-secondary rune page. Players are not expected to micromanage these choices; system balance changes are intended to shift champion draft value, match performance and the resulting meta. Patches can buff, nerf, add or deactivate/remove stable-ID items/runes, and long-save guardrails keep class build pools and every required rune slot viable.
- New champions target 2–3 releases per year and remain unavailable to professional competition for 14 days after release while practice remains allowed under the Item 9 rule.
- Patch history is reconstructible across seasons from the initial baseline plus retained patch records, so historical replays/spec inspection do not silently use current values.
- Major system 11 now owns the actual LoL-style draft interaction UI; this decision does not mark draft UX complete.


## D-038 — Pre-draft architecture stabilization

**Decision:** Before Major System 11, LOL GM performs a cross-cutting architecture/performance stabilization pass rather than continuing to grow the prototype-shaped global script.

- Persistent state remains world-owned. Reusable caches that depend on a world or patch use WeakMap ownership and revision invalidation; they must not leak values across new games, resets or save slots.
- Draft hot paths may cache the professionally eligible champion pool, champion strengths, role indexes and champion/system fit only while the patch revision and relevant date/pool identity remain valid. Eligibility changes must invalidate or extend cached state without changing deterministic draft results.
- Meta-history readers share a world-owned index/query cache keyed by history identity/length and filter dimensions. Patch diagnosis must not repeatedly scan and resort the complete history when an indexed patch subset is available.
- Historical patch reconstruction uses the pinned source baseline plus retained deltas. Full baseline copies are derived state and are excluded from saves.
- High-volume meta history is compacted only at persistence boundaries and restored losslessly on load; runtime consumers continue to use the normal object schema. Save-only season compaction must not mutate live runtime objects.
- The world save schema and UI save namespace/version are one contract and CI must reject mismatches.
- Artifact module order has one manifest. Build, syntax checks and smoke tests may not maintain independent copies of the module list.
- Large UI domains live in `ui-*.js` modules. Patch/meta, market/roster and season/world/progression surfaces are separated from `app.js`; Item 11 draft UI must be a separate domain module.
- Because the artifact is concatenated into one script, CI rejects duplicate top-level global symbols across source modules.
- Optimization work must preserve deterministic simulation behavior and accepted Items 1–10; performance shortcuts may not remove engine rules or player/AI parity. CI runs a performance probe to record simulation/cache/query costs without using unstable wall-clock thresholds as correctness gates.


## D-039 — Live draft keeps flex positions hidden

**Decision:** Major System 11 stores live picks as ordered champion selections, not fixed lane assignments. A legal five-role assignment is resolved only after all ten picks are complete.

- Every pick must preserve at least one legal one-champion-per-role matching across TOP/JGL/MID/ADC/SUP. An invalid pick is rejected before lock-in.
- A flex champion may remain feasible in multiple roles throughout the draft. The UI does not disclose an internal intended role because no committed role exists yet.
- Draft AI evaluates opponent counters against the set of publicly possible role assignments, not a hidden fixed lane. Internal candidate scoring may consider which of the AI team's own feasible roles would make a pick valuable, but that intent is discarded after lock-in.
- Final role assignment is deterministic and optimizes the team's own player mastery, meta evaluation and champion/system fit. It does not inspect a hidden opponent assignment to gain a second-mover advantage.
- Match simulation, Fearless tracking, meta recording and replays continue to consume the finalized role map; recorded games remain replayable through the existing forced-draft contract.


## D-040 — Champion portrait identity is stable derived presentation

**Decision:** Champion portraits use a stable identity contract without storing binary images in saves.

- Pinned real champions prefer their Riot Data Dragon square champion icon by stable Riot alias. The standalone client supplies a deterministic local SVG fallback when the network image is unavailable.
- Newly generated LOL GM champions receive a versioned visual profile at release: seed, theme, silhouette, weapon, ornament, pose and aura. The profile is stored in patch history so historical reconstruction and save/reload retain the same visual identity.
- The rendered generated portrait is derived presentation data. It is an original high-fantasy painted-card composition produced locally from the stable visual profile; saves do not embed image bytes.
- Major reworks may increment the generated champion's portrait revision while preserving the stable champion ID and visual identity seed.
- Draft cards, pick slots and later champion surfaces must use the shared portrait resolver rather than inventing per-screen placeholders.


## D-041 — Generated content uses semantic naming, not blind prefix/suffix concatenation

**Decision:** Long-save champion, item and rune names are generated from the content's gameplay identity before uniqueness checks.

- New champion naming selects a phonetic family from role, archetype and damage identity, then produces paired internal English and Korean display names. Name candidates are rejected when they are identical or too similar to existing champion names.
- New item naming derives its vocabulary from the strongest gameplay effect and intended class. Offensive, defensive, sustain, mobility, haste, utility, early-game and scaling items therefore draw from different semantic word banks.
- New rune naming derives from both the rune style and its strongest effect; keystones may use a stronger naming form than minor runes.
- Generated definitions persist a small versioned naming profile containing theme/effect and prefix identity. Recent-prefix checks prevent the same naming stem from being emitted repeatedly in sequence.
- Existing official names remain untouched. Generated names are stable after release and are preserved in patch history/save reconstruction.
- CI smoke tests generate batches across champions/items/runes and reject duplicate, near-duplicate or single-language outputs.


## D-042 — Managed official matches pause world progression at the draft boundary

**Decision:** Official matches involving the managed team are deferred before simulation and exposed through a persistent world-level pending queue.

- A competition day may simulate and record AI-only matches while leaving the managed match unresolved. The season day does not advance or run stage-transition logic until every scheduled match on that day has a result.
- The pending official state persists the date plus season/match identifiers. While it is non-empty, world progression returns that pending state without rerunning patch ticks, recovery, training, scrims or reserve management for the date.
- The official draft UI is modal and locked. Reloading reconstructs the pending first-game draft from the stable series seed, side/first-pick rules and tournament champion pool.
- Managed official Bo3/Bo5 series are persisted as game-level series sessions. Every game opens a fresh live draft, then its result updates series score, loser-controlled next-game choice, mental modifiers, series adaptation and Fearless history before the next draft is prepared.
- Every completed game contributes all ten picked champions to the fixed Fearless lock set for later games in that series; regular bans remain additional to those locks.
- Scheduled result commit is guarded against duplication. Statistics, meta, player usage, scouting and stage advancement continue through the same official pipelines after the full series resolves.


## D-043 — First Selection source depends on competition context

**Decision:** Game-one First Selection is assigned by the competition context, while games two onward always belong to the previous game's loser.

- Domestic double round-robin: match side A is the home team and receives game-one First Selection. The return fixture reverses the pairing, so the other club receives the same home advantage once.
- Domestic seeded playoffs may explicitly set `firstChoice: seed`, giving the higher seeded side game-one First Selection.
- International knockout/bracket stages use seeds only for qualification, bracket placement and byes. Once a knockout matchup exists, both single- and double-elimination game-one First Selection use a coin toss; seed order does not carry into that match.
- From game two onward, the previous game's losing team owns First Selection regardless of how game one was assigned.
- First Selection means choosing either side (blue/red) or pick order (first/last). The opponent then chooses the remaining dimension. A managed team gets a UI choice whether it is the First Selection holder or the team making the remaining selection.

## D-045 — Managed-club sporting decisions require explicit player authority

**Decision:** Convenience automation may assist the managed club but may not commit consequential sporting choices on the player's behalf.

- The player is the managed club's head coach and final sporting decision-maker.
- Player signings, transfers, releases, renewals, team-option exercise, roster movement, starters/roles, tactics/training direction and all senior/specialist coaching appointments require explicit player action.
- Staff AI may recommend, filter, rank, prefill, batch administrative steps and surface consequences, but cannot turn a recommendation into a transaction or lineup decision.
- Player options are exercised by the player/agent side, not the club. Contract expiry at the registration/market deadline is a rules consequence rather than an AI roster decision.
- A managed-team staff retirement leaves a vacancy; the engine does not silently generate a replacement. AI clubs may still replace staff automatically.
- The human player occupies the managed club's head-coach role. There is no separate generic senior-assistant role in the target staff model; legacy `team.coach` dependencies must be migrated into specialist staff systems rather than surfaced as a senior assistant.
- Board-owned infrastructure remains outside this sporting-control boundary; its automation is not treated as head-coach convenience automation.


## D-046 — League rules are global capabilities with regional office ownership

**Decision:** A league-rule feature is not complete if it only works for LCK or any other single named region.

- Every active regional league owns its own league-office policy state for every implemented rule category that applies to domestic competition.
- Verified real-world rules may seed a named region's initial state, but they are inputs to the shared rules engine, not special-case engine branches.
- Missing or uncertain regional rules must remain region-local: infer from that region's own structure/evidence or preserve the status quo. Never copy LCK, LPL, LEC, LCS, LCP, CBLOL, or another region merely as a fallback.
- Rule categories include roster/registration, contracts where league-governed, coaching-staff registration, local/non-local eligibility administration, spending controls, Tier-2 ownership and movement, promotion/relegation, domestic competition formats, scheduling, licensing and other office-owned constraints. Fearless and First Selection are fixed match-system concepts and are not regional-office policy.
- International-tournament rules belong to the international office and do not inherit a domestic office rule unless the international rule explicitly references it.
- Human-managed and AI-managed clubs use the same rule checks and transaction/state-transition paths. The only ownership difference is who chooses an action: the player or that club's AI.
- AI clubs are bounded decision-makers, not optimal solvers. Their choices are based on available/scouted information, staff quality, finances, goals and philosophy, so they can make explainable mistakes without bypassing rules.
- Acceptance for a new rule system must include cross-region coverage: at least two different regional policy states, plus parity checks showing human and AI clubs cannot bypass the same constraints.


## D-047 — Local eligibility, transfers and roster registration are separate rule layers

**Decision:** Player identity, local eligibility, transfer counting and competition registration are distinct state machines and must not be inferred from one `player.region` comparison.

- A player keeps nationality/origin identity independently from the one active registration-local eligibility.
- Multi-national players choose one origin local at career start; that first selection remains the permanent origin-local entitlement.
- A player may acquire a non-origin local only through continuous service in one region under qualification terms agreed by that regional office and the international office. Qualification grants a player/agent choice; it does not auto-switch the active local. If qualification is completed mid-season, activation of the newly acquired local is deferred until the next season.
- Only one active local exists at a time. A switch, including restoration of the origin local after an acquired local was active, takes effect from the next season and is chosen during the offseason. An earned non-origin eligibility that was never activated remains available only for its rule-defined validity period; a non-origin local that was actually activated and later relinquished must be earned again from scratch.
- Same-region club movement preserves service. A same-region FA gap preserves progress but adds no service time. Cross-region loan pauses progress without adding service in either region. Registration to another region by normal contract resets the previous region's progress.
- When a qualification rule measures service by seasons, a partial/half season with actual registration and service in that region counts as one service season; paused FA or cross-region-loan time does not create service credit.
- The official first-team registered-roster non-local cap is globally fixed at two; it does not cap the club's total contracted players or reserve/Academy holdings.
- Contracted club-to-club moves are capped at two per player per **season**, measured from season start through season end. A loan departure counts once, while return to the parent club does not add another move. Free-agent signings, same-organization first/reserve movement and league-restructuring movement are not transfers.
- Regional offices own transfer-window timing, official registration windows and broader first/reserve internal-movement windows. Free agents may sign year-round, but official eligibility begins at a valid registration opportunity.
- Official first-team registration is 5–10 players and must contain at least one player eligible for each of TOP/JGL/MID/ADC/SUP. The ten-player cap does not limit the club's total contracted players. A player may occupy only one official roster at a time, so simultaneous first-team and reserve/Academy registration is prohibited. A loanee may be officially registered only by the borrowing club during the loan.
- Domestic official-roster changes have no separate count limit: clubs may change the list freely while a regional registration window is open and cannot make ordinary changes while it is closed. A deregistered player may return when a later registration window opens.
- Emergency replacement rules are office-owned exceptions: the competition office predefines whether a full ten-player roster must first deregister someone or may temporarily exceed ten for the emergency replacement.
- International tournaments lock the initially submitted final roster for the event; only pre-published international-office emergency replacement rules may override the lock.
- Detailed canonical rules are maintained in `docs/ROSTER_TRANSFER_LOCAL_RULES.md`.


## D-048 — Fearless and First Selection are fixed match-system invariants

**Decision:** Fearless and First Selection are core LOL GM match rules, not policy toggles owned by regional or international offices.

- Fearless remains fixed for official series and cannot be enabled/disabled by a league office.
- First Selection's concept and choice procedure remain fixed.
- Game-one source follows D-043: domestic double round-robin home team; explicitly seeded domestic playoff higher seed; international knockout/bracket coin toss after matchup formation.
- Games two onward always assign First Selection to the previous game's loser.
- Offices may schedule competitions and registration rules around these systems but may not replace or disable the systems themselves.


## D-049 — Internal squad assignment is separate from official competition registration

**Decision:** First-team/reserve/Academy squad assignment and official competition registration are separate states.

- Regional offices define broad internal-movement windows for first-team↔reserve/Academy promotion and demotion. These windows should be materially more permissive than official competition-registration windows.
- There is no promotion/demotion count limit inside an open internal-movement window.
- Internal movement can occur while the official registration window is closed if the internal-movement window is still open.
- Such a move changes training/scrim/squad assignment immediately but does not silently change official match eligibility.
- Official match eligibility changes only through an open official registration window or a valid emergency exception.
- Selection changes among players already on the same official roster, including between games of a Bo3/Bo5 where otherwise legal, are not roster-registration changes and have no separate count limit.


## D-050 — Superseded registered-primary-role model

**Status:** **SUPERSEDED by D-058.** This checkpoint documented the earlier registered-primary-role design and is retained only as decision history. Runtime and current rules must not use it as an eligibility source.


## D-051 — Reserve/Academy registration remains region-owned

**Decision:** Reserve/Academy roster structure is not forced to mirror the first team.

- Reserve/Academy official rosters have a global minimum of five players. They do **not** need five different natural primary roles; a match uses five distinct registered players assigned to the five game slots under D-058. Each regional office sets the maximum size and its own non-local rule.
- An organization that directly owns a reserve/Academy team has an integrated organization-roster minimum of **11 players**. This is not a third roster; it is the first team plus owned reserve units viewed as one organization. The extra player above the two five-player minima exists as an emergency-callup buffer so one ordinary temporary absence does not automatically force a first-team or reserve forfeit. Independent second-division clubs do not share this privilege.
- A first-team player may appear in a reserve/Academy official match only when both the internal-movement window and that competition's registration window allow the move.
- Regional offices may set a cooldown between call-up and send-down actions.
- A first-team-registered player may train with the reserve group without automatically losing first-team registration, and reserve players may freely join first-team training/scrims without a formal internal move. Official-match eligibility remains registration-controlled.
- Academy units that are structurally separate from reserve teams are development-only and do not participate in league-pyramid promotion/relegation.
- Internal movement is locked for the duration of an international tournament.
- The managed club and AI clubs use the same reserve/Academy eligibility and movement checks.


## D-052 — Loans and offseason contract exits use explicit clauses

**Decision:** Loan and contract-exit behavior is clause-driven rather than free-form.

- Loans last either half a season or one full season.
- Early recall is legal only when the loan contract contains a recall clause.
- Loan fees may be zero. Salary responsibility is negotiable from 0–100% between parent and borrowing clubs.
- Both optional purchase clauses and mandatory purchase clauses are supported.
- A loan departure consumes one of the player's two allowed contracted moves that season; returning to the parent club does not consume another.
- Mutual contract termination is restricted to the offseason.
- Unilateral club release pays the guaranteed remainder defined by that player's contract guarantee percentage/amount.


## D-053 — Renewal intent and relationship breakdown precede transfer requests

**Decision:** Player dissatisfaction primarily affects relationships and retention, not automatic transfer requests.

- Negative playing time, role, team results, coaching, contract treatment or interpersonal conditions reduce satisfaction and club/player relationship quality.
- The largest sporting-business consequence is lower renewal willingness: higher demands, shorter patience, negotiation breakdown and eventual free departure become more likely.
- Explicit transfer wishes are rare escalation events reserved for severe, sustained breakdowns rather than the default response to dissatisfaction.
- After the season's final international tournament, the incumbent club receives a 14-day exclusive renewal-negotiation period for expiring players. Other clubs may contact/negotiate from day 15 onward. This is exclusivity only, not a right to match or automatic retention.


## D-054 — Matchday use is the registered roster, not a second mini-roster

**Decision:** Official registration is the player-eligibility boundary.

- Every officially registered player is available for match selection; no separate reduced matchday roster is required.
- A game itself has no player substitutions after it starts. Between games of a Bo3/Bo5, registered players may be changed.
- Five eligible starters are sufficient; no minimum bench size exists.
- Fewer than five eligible players means a forfeit unless a pre-published emergency-replacement rule validly restores eligibility.
- Injuries exist but are rare; condition, fatigue and illness are the normal availability pressures.
- The first-team non-local cap is a roster cap, not a starting-lineup cap, so both registered non-local players may start together.


## D-055 — Staff employment is departmental; competition accreditation is office-owned

**Decision:** Club employment limits and competition-event accreditation are separate.

- The managed user is the head coach. The target model has no generic senior assistant.
- Coaching staff are a separate department with up to **9 employed coaches**, allowing strategic/development/performance specialists and all five positional coaches if the club chooses.
- Analysts are a separate department with up to **4 analysts**.
- Scouts are a separate department with up to **6 scouts**.
- These are club employment caps, not mandatory staffing levels; wages and club finances should make full departments expensive.
- Regional/international offices may separately limit how many employed staff can be officially accredited or present for a competition/event.
- Legacy `team.coach` behavior must be migrated into specialist staff attributes before the generic slot is removed from runtime.


## D-056 — Final rule sweep: player, staff, international and governance rules

**Decision:** The remaining 69 pre-implementation choices are frozen by the 2026-09-28 rule sweep.

- Player↔manager uses separate relationship and trust dimensions; all player pairs have relationship state that can affect teamwork.
- There is no formal captain slot. Leadership is emergent and mainly stabilizes morale/relationships.
- Explicit agents are reserved for notable players; others use personal negotiation tendencies.
- Renewal rejection creates cooldowns; fully broken talks reopen only after meaningful context change.
- Contract lengths are negotiated rather than globally fixed. Playing-time/role promises may be contractual or verbal.
- Every permanent transfer requires player consent. Outside pre-contracts open after the incumbent club's 14-day exclusivity period.
- Incoming-region transfer windows govern cross-region transfers; loan-to-purchase conversion does not consume an extra move.
- Position conversion is consensual and completed from long-term training progress, role-fit development, champion preparation and scrim/official use. General secondary-role familiarity is not part of the current model.
- Academy has no global age cap; veteran eligibility is regional policy.
- Earned-but-inactive local eligibility has a validity period. Qualification-rule changes grandfather existing progress.
- Region split/merge lets players choose successor local status, with legacy-local protection through the current contract for players made non-local only by restructuring.
- Staff may hold multiple specialties with diluted effect; duplicate analysts have diminishing returns; pre-hire exact staff ability is hidden.
- International patch lock is seven days before event start. International coefficients use weighted results from the prior three years with tournament-specific weights, with recent Worlds as extra-slot tiebreak.
- International phases pause all top-division domestic official play globally.
- Administrative violations may be adjudicated after submission; clearly illegal state transitions are blocked before submission.
- Injuries are rare and representative; illness is more common; burnout is a rare sustained-overload outcome.

Canonical detail:
- `docs/PLAYER_RELATION_CONTRACT_RULES.md`
- `docs/ROSTER_TRANSFER_LOCAL_RULES.md`
- `docs/STAFF_RULES.md`
- `docs/INTERNATIONAL_OFFICE_RULES.md`
- `docs/GOVERNANCE_RESTRUCTURE_RULES.md`

## D-057 — Initial market, scouting memory, club philosophy and scrim geography follow-up

**Decision:** The 2026-09-28 realism follow-up replaces simplifying defaults with the following rules.

- The first-season AI roster market behaves like a market: clubs make competing offers in rounds and players compare offers instead of clubs receiving players through a fixed sequential draft order.
- AI clubs do not share one fixed roster size. Their target squad depth varies within the legal roster limits from finances, goals and club philosophy.
- Non-local slots are strategic assets, not local-first restrictions. AI recruitment may use them for stars, value signings or prospects according to team philosophy, provided the eventual legal roster remains feasible.
- AI scouting knowledge is persistent per club/player rather than a stateless perfect-information lookup.
- True potential may have a weak indirect effect on the market, but clubs do not read exact hidden potential for decisions.
- Scrims are easiest within the same region, are routinely possible with geographically nearby regions, and become much easier across long distance when teams are co-located for international events or future bootcamps/travel.
- Club philosophy evolves from ownership, finances, results, development structure and club history rather than remaining a permanently random creation-time label.
- Player contracts are freely negotiated within a **maximum duration of three years**.

Implementation must keep these decisions separate from temporary tuning constants and preserve player/AI legality parity.

## D-058 — Match roles are lineup assignments, not registration permissions

**Decision:** A professional player's primary role is identity/specialization, not an official-match eligibility gate.

- A legal match lineup is five distinct registered players assigned one each to TOP/JGL/MID/ADC/SUP. The players do not need matching primary roles.
- First-team and reserve/Academy registration no longer require one natural-primary player for each of the five roles.
- General secondary-role permission/familiarity fields are removed. Off-role performance comes from role-weighted attributes, champion pool, tactics/adaptation and accumulated experience rather than a stored eligibility flag or flat percentage penalty.
- There is no separate emergency-off-role exception. Emergency call-ups use the same lineup rule; if the reserve side has to move another player into the vacated slot, the organization bears the resulting performance cost rather than a forfeit caused solely by primary-role labels.
- Long-term role conversion remains a distinct career/training decision. The manager may propose it and the player may accept or reject it. Conversion is not required for one-off off-role match usage.
- Conversion spam is discouraged by training opportunity cost, adaptation/champion-preparation loss and possible relationship/satisfaction effects, not by a hard system cooldown or a match-eligibility lock.
- Once sustained training and real usage establish the new specialization, the player's primary-role identity may change; this identity update is not tied to a registration window.
- **Role-conversion implementation status:** manager proposals can be accepted or rejected; accepted conversions accumulate daily training plus target-role official/scrim usage, prepare target-role champion pools, consume part of general development opportunity, can be cancelled or redirected with sunk costs, and persist role-change history. AI clubs use the same conversion API and may propose conversions for players they are already using off-role.

## Player champion disclosure refinement (2026-10-03)

Foreign player champion information is public observed identity/count/result/date
history, never hidden pool membership or a mastery ranking. Scouting knowledge
alone cannot turn appearance counts into numerical mastery. Current controlled
squads retain private preparation; owned reserves follow manager scope, outgoing
loans follow their current borrower, and fired managers lose internal access.
Missing player-attributed legacy records remain unknown rather than inferred.
This refinement does not claim the rest of foreign player profiles are protected;
derived traits and exact live fields remain the next documented implementation.

## Observer-safe player profile refinement (2026-10-03)

Foreign derived metrics reuse the existing observed attribute signal; unsupported
exact tendencies/personality/development and live management state are private.
Foreign displayed market value uses observed ability, the displayed potential
range midpoint and neutral form with the existing formula; own values and AI
market decisions remain unchanged. Private management events are filtered from
foreign display without deleting history. Firing removes automatic 100-percent
owned-club knowledge. Draft mastery/pool observation still requires the next
separate information-boundary slice; the whole game is not declared leak-free.

## Draft opponent information refinement (2026-10-03)

Foreign mastery has no saved numerical observation yet. Legacy scouting
knowledge, staff context and public appearances do not imply a mastery estimate.
Use the existing 25 calculation fallback uniformly for unknown foreign mastery,
retain [20,99] only as a compatibility representation of the whole unknown range,
and display unobserved numerical skill explicitly. Ban shortlists and scores use
the observer's meta and neutral unknown opponent scaling, while own skill and
public draft/series information remain legitimate inputs. This intentionally
changes decisions and outcomes. A later bounded scouting-time saved signal may
restore justified numerical estimates; no live foreign skill or unobserved pool
membership is consulted by the corrected draft paths.

## Regional league naming and new-career geography — 2026-10-04

Confirmed by the user: keep familiar LCK/LPL-style identities, use three-letter
L-prefixed league abbreviations, and give tier two distinct names without an
all-D pattern. Initial major pairs: LCK/LKC, LPL/LDL, LEC/LEA, LCS/LNA,
LCP/LPA, LSA/LSC. Newly named competitions are fictional aliases, not asserted
real esports policy. Minor presets also use distinct L-prefixed abbreviations.

New careers include all six major tier-twos. Existing franchise/mixed governance,
owned-reserve authority and independent promotion eligibility determine teams;
a league alias must not assign Korean financial or registration policies.
North America retains LCS; South America replaces Brazil-only CBLOL with LSA.
The LA expansion key becomes Central America/Caribbean, attached to North America.
Its independence does not exhaust or automatically dissolve North America.
Player origin/local identity remains region-based; no country list was fabricated.

Stable BR/LA keys and top-short + 2 competition IDs remain compatible. Loading
old saves only repairs generated default tier-two display names/shorts, keeping
custom names, prior geography, player contracts/eligibility, season keys and
archived result names. Existing careers do not gain new reserve clubs on load.

Every newly founded regional league must create a real tier two and retain it;
only legacy optional structures may still abolish theirs. New founded leagues
receive distinct, collision-checked three-letter L-prefixed aliases for both tiers.

Confirmed next vertical boundary: integrated regions keep a shared top tier but
run country-level tier-two leagues. Add explicit club home-country identity and
country competition membership/schedules/standings; preserve umbrella local
eligibility, owned-club recruitment authority and international regional attribution.
This is authorized but pending; current region-wide tier-twos do not prove it done.

The expanded initial ecosystem reproduced an exhausted local pool during the
first auction. New-world generation now fills a deterministic regional FA supply
shortfall before bidding, using the actual sum of legal minimum targets plus
maximum outside-region non-local capacity. Existing players are retained and
normal generation/salary rules apply. This conservative bound protects roster
formation without changing import caps, minimum squad sizes or club budgets,
but creates a larger FA pool; it is capacity support, not measured pro talent supply.
No athletes are fabricated mid-auction to rescue a failing bid.

2026-10-04 추가 확인: 통합 1부/국가별 2부 연결에서 승강제 규칙은 리그 사무국이
결정한다. 개발자는 참가 자격·승강 인원·선발전·시행 시점의 데이터와 실제 다음 시즌
편성을 연결하며 임의의 고정 승강 규칙을 대신 확정하지 않는다. 소유 2군은
모구단과 같은 1부로 승격할 수 없다. 국가별 하부 편성과 이 사무국 연결은 후속 10.2 범위다.

Country affiliation refinement, confirmed 2026-10-04: club home-country and
reserve development/operating country are independently selectable. Reserves
may develop abroad; league participation needs office approval, and a training
location does not grant athlete nationality or local registration eligibility.
This supersedes the proposed compulsory parent-country reserve assignment.

Broadcast scope correction, confirmed 2026-10-04: prohibit overlapping official
international series broadcasts globally and overlapping series within the same
domestic league. Different domestic leagues may run in parallel. Whole tournament
periods may overlap; Eastern/Western Cup are equal-standing events, not an ordered
higher/lower pair. Add planned-window reservation and actual overrun shifts; merely
staggering starts is insufficient. Preserve venue time zones and UTC/KST views.
This scheduler/overrun connection is pending 10.3, not implemented by whole-event
serialization in the current naming/governance slice.

Default official domestic labels are 스플릿 1/2/3. Regional office `splitNames`
overrides affect generated domestic season labels; historical aliases stay.

## UI 전면 재설계 승인 — 2026-10-04 (Asia/Seoul)

사용자는 내부 구현과 UI 사이의 괴리를 이유로 기존 화면에 부분 수정만 누적하는 대신 UI 전면 재설계를 승인했다. 개발 범위와 순서는 [개발 가이드의 12.3–12.5](DEVELOPMENT.md#ui-전면-재설계--승인된-현재-범위)를 따른다. 구단 운영 흐름 중심으로 정보 구조와 내비게이션, 각 도메인의 화면을 새로 구성하되 검증된 엔진/공유 명령과 저장·기록 호환성을 유지한다.

내부 기능 존재나 시각적 개편만으로 완료로 보지 않는다. 실제 조작, 조건/권한 안내, 엔진 상태 반영, 결과와 이유 표시, 저장·재접속의 일관성이 각 화면 교체의 완료 기준이다. 의미 있는 경영 선택과 직접 운영 권한을 보존하면서 반복 입력/이동/알림을 줄인다. 기능 연결이 검증된 화면부터 순차 교체하고 UI 변경으로 새로운 규칙이나 밸런스 정책을 몰래 도입하지 않는다. 현재 상태는 승인/구현 예정이며 리그 선택 UI 수정은 전면 재설계의 완료 증거가 아니다.

UI 재설계의 추가 확정 기준은 수정 용이성이다. 공통 표현/스타일은 중앙 관리하고 화면별 책임과 엔진 명령 경계를 명확히 하며, 불필요한 프레임워크·깊은 추상화·규칙 복제를 피한다. 화면별 수정 위치와 집중 검증 진입점을 개발 문서에 유지한다.

## 아마추어 생태계의 이야기 활용 — 2026-10-04 (Asia/Seoul)

사용자는 정식 3부 리그가 아닌 아마추어 생태계를 선수 배경과 사건의 기반으로 추가하도록 승인했다. 아마추어 경기 시뮬레이션은 수행하지 않는다. 가상 생성 배경/보존된 실제 게임 이력을 스카우팅 제보·테스트·영입 기회와 선택적 프로필 이야기에 연결한다. 긴 필수 이야기나 반복 입력/알림을 추가하지 않고, 미계산 경기의 상세 결과를 계산한 것처럼 제시하지 않는다. 능력·관계·성공·2부 참가권을 이야기만으로 부여하지 않는다. [작업 3.1과 전체 승인 디테일](DEVELOPMENT.md#31-아마추어-배경과-선수-이야기--승인된-구현-예정-범위)를 따른다. 현재는 구현 예정이다.

## 뉴스 보강 승인 — 2026-10-04 (Asia/Seoul)

실제 공개 게임 사건에 근거한 짧은 뉴스와 관련 화면 연결, 관심 대상/종류 필터를 추가·보강한다. 기존 뉴스/이력 체계를 재사용하며 처리할 업무 알림과 선택적 뉴스는 구분한다. 중복 알림을 줄이고 비공개 정보·가짜 경기 결과를 노출하지 않는다. 소문 정책은 별도 제안이다. 구현 예정 범위와 검증은 [개발 작업 12.6](DEVELOPMENT.md#126-뉴스와-실제-사건-연결)을 따른다.

## 이야기 디테일 전체 승인 — 2026-10-04 (Asia/Seoul)

사용자가 아마추어 배경, 선수 경력, 육성 발자취, 동료의 진로, 재대결, 라이벌, 구단 역사, 영입 평가, 운영 결정의 후속, 은퇴 이후 경로, 팬 기대/반응, 뉴스, 시즌 회고를 모두 승인했다. 이전 후보/제안 표기는 이 결정으로 대체된다. 구현 예정 범위는 개발 가이드 3.1/12.6/12.7/12.8을 따른다. 우선순위는 순서이며 범위 축소가 아니다. 향후 후보 보고는 전체 목록과 승인/구현/보류 상태를 구분해 제공한다. 실제 기록·가상 배경 출처·관측 권한을 보존하고 추가 조작 부담, 임의 능력/승패 보정, 감정 페널티/여론 업무를 도입하지 않는다.

## 전 부문 현실성 검토와 사무국 개정 엔진 — 2026-10-04 (Asia/Seoul)

사용자는 제시된 전 부문 현실성/편의성 항목 전체 문서화와 사무국이 규정을 개정하는 엔진 연결·보강을 요청했다. 전체 검토표와 구현/새 정책 구분은 [개발 가이드](DEVELOPMENT.md#전-부문-현실성편의성-검토-목록--전체-문서화), 개정 엔진은 [10.4](DEVELOPMENT.md#104-사무국-규정-개정-엔진--승인된-연결고도화-범위)를 따른다. 기존 효용/의견 수렴/간격 제한/시행 기록을 재사용하며 관할→실제 근거→영향 검토→공표→시행→writer/consumer→UI/save를 연결한다. 확정 규칙을 임의로 뒤집거나 과거 대회/계약을 소급 변경하지 않는다. 새 정책과 계수의 타당성은 구현 결함과 구분하며 단순 문서화는 구현 완료가 아니다.

## 추가 현실성 항목 승인과 중복 제안 방지 — 2026-10-04 (Asia/Seoul)

직전 제시한 추가/수정/삭제 항목 전체가 승인됐다. 기존 전 부문 범위와 겹치는 항목은 별도 기능으로 중복 등록하지 않고 [단일 담당 단계와 완료 조건](DEVELOPMENT.md#추가-승인-항목의-단일-배치와-중복-방지)에 통합한다. 선수 경력 목표·수급·비상 계획·국제 준비·계약 연속성·소유주 변화 등 기존 연결을 검토하고, 사무국 개정은 시행 후 평가까지 확장한다. 신규 후보 제시 전 승인 목록과 대조하며 실제 신규/기존 보강/중복 제외를 구분한다. 승인된 목적은 임의 효과·가격·승패 보정 허가가 아니며 실제 상태/권한/저장/검증 근거를 유지한다.

## 세부 검토 목록 전체 승인과 수량 제한 없는 누락 검토 — 2026-10-04 (Asia/Seoul)

직전 선수/전술/경기/시장·구단/뉴스/편의성 세부 목록 전체가 승인됐다. [개발 가이드의 담당 단계별 전체 내용](DEVELOPMENT.md#세부-연결완료-조건-전체-승인)에 통합하며 새 기능 수로 중복 계산하지 않는다. 이후 후보는 개수를 정하거나 채우지 않고 기존 승인과 대조해 필요한 누락을 제시한다. 기존 판정/정보/권한/저장·모델 한계를 유지하며 정책 근거와 실제 완료 증거를 기록한다.

## 지속적인 발굴/등록과 정확도 개선 — 2026-10-04 (Asia/Seoul)

사용자는 아이디어를 계속 발굴·등록하고 판정 정확도를 높이도록 명시했다. 개발 중 새 발견을 전체 등록하며 기존 항목의 중복은 합치고 새 근거/조건은 보존한다. 직전 선수 선택/세계 연속성/동시 판정/정보 신뢰/편의성 후보 전체는 [개발 가이드](DEVELOPMENT.md#지속적인-아이디어-발굴등록과-판정-정확도-개선)에 등록됐다. 실제 근거·작성자/소비자·검증·비용·UI·저장/권한 영향과 상태를 명시한다. 계속 발굴하되 목록 작성만 반복하지 않고 합의 내 검증 가능한 구현을 진행한다. 임의 수치·확정 규칙의 무단 변경·모델 능력 과장은 정확도 개선으로 간주하지 않는다.

## 분석실 독립 탭 승인 — 2026-10-04 (Asia/Seoul)

분석실을 메인 내비게이션의 독립 탭으로 추가한다. 우리 팀/상대/경기 복기/밴픽·메타/선수 비교를 실제 관측·공개 자료와 기존 집계로 연결하며 대중 티어와 팀 내부 티어를 구분한다. 지원되는 기록·권한·패치/표본/출처를 표시하고 관련 근거 화면으로 이동한다. 전술/훈련 반영은 기존 명령/설정으로 연결하고 별도 필수 업무나 숨은 정보 노출을 만들지 않는다. [개발 작업 12.9](DEVELOPMENT.md#129-분석실-독립-탭--승인된-구현-예정-범위)가 구현/집중 검증 기준이며 현재는 구현 예정이다.

## 감독 커리어/분석 도구/효과 판정/사용성 목록 전체 승인 — 2026-10-04 (Asia/Seoul)

직전 제시한 감독 커리어, 분석실 도구, 경기 효과 판정, 장기 운영 도구와 제거/경계 목록 전체를 사용자 승인으로 기존 단계에 통합했다. [전체 목록](DEVELOPMENT.md#감독-커리어분석-도구효과-판정사용성-전체-승인)이 단일 작업 기준이다. 기존 소스/권한/저장·메커니즘을 조사해 실제 연결과 집중 검증을 진행하며 문서화와 구현 완료를 구분한다. 효과를 발명하거나 모든 경기 판정을 정확한 시전/좌표 모델로 주장하지 않는다.


## 2026-10-04 — 사용자 승인: 의사소통 적응 복원과 초기 영입 흐름

사용자 ‘의사소통 패널티 되살리자’는 이전 가상 공용어/해외 선수 언어 장벽 없음 정책을 대체한다. 원래 결정/과거 결과는 보존하고 실제 언어 숙련·업무 언어·적응 기간·훈련/경기 consumer·관측·legacy 경계를 연결한 뒤 적용한다. 국적/활동 지역/로컬 자격은 언어 능력이 아니며 nationality-only penalty나 일반 팀워크와의 중복 적용을 피한다. 현재 미구현이다.

영입 기본은 지역 내 후보, 해외/전체 별도 구분이며 actual activity-region 정의와 eligibility 구분을 검토한다. FM에서 가져올 것은 목록→관측 능력/보고서→협상 흐름과 명료한 정보 위계다. 자산/문구 복제가 아니며 처음 화면은 새로 시작하기/불러오기/설정만 제공한다. 초기 기량 범위는 이미 있지만 상세 연결이 없으므로 real profile/observed report/sorting/return/save를 연결한다. 모든 추가 세부 아이디어/담당 단계/상태/수용은 [현재 가이드의 통합 절](DEVELOPMENT.md#recruitment-language-refinements)을 따른다. 문서 등록은 구현 완료가 아니다.

2026-10-04 추가 승인: 긴 추가 목록도 모두 기존 단계에 병합한다. 업무 언어/언어 지원 지출은 구단 차원에서 선수·스태프 상태/재정·existing authority로 판단하고 실제 ledger/공통 command·AI parity를 사용한다. 감독의 반복 언어비용 입력은 요구하지 않는다. 결정이유/actual spend/적응은 볼 수 있어야 한다. 미확인 지원 가격/학습 rate/능력 보너스를 발명하지 않으며 기존 manual authority 전체의 자동화로 확대하지 않는다. 구현·검증은 아직 남아 있다.


## 2026-10-04 실제 장비 방어 소비의 구현 경계 (8.3.1)

미사용 골드를 HP/armor/MR로 환산하는 재현 결함은 제거하고 패치 고정 raw inventory stats와 챔피언 레벨 성장으로 연결한다. 동일 source의 기존 방어 proxy는 중복 적용하지 않으며 기존 효과 패치 delta와 비수치 proxy는 보존한다. 이는 승인된 인과 판정 교정이며 새로운 balance policy/계수·전문 목표가 아니다. 큰8.3는 방어/공격 자연 경계로 나눈다. offense earned-gold와 실제 AP/스킬 피해, 조건부 효과, 구매 장소/귀환·오른 metadata는 미완료다. 기존 기록을 새 수식으로 소급 변경하지 않는다. 상세 근거/진단/반례/다음 작업은 DEVELOPMENT8.3.1이다.


## 2026-10-04 실제 공격 장비 소비의 구현 경계 (8.3.2)

현금/earned 골드의 class별 공격 전환을 제거하고 실제 소유 raw AD와 챔피언 기본값/레벨 성장을 사용한다. 동일 AD source proxy는 한 번 제외하고 AP/AS/crit/기타 기존 집계 proxy와 effect patch delta는 유지한다. 기존 MID bonusPower는 장비 AD/남은 AP source 기여로 연결한다. 가격·지출을 스탯으로 바꾸거나 새로운 AP→AD/스킬 계수·치명타 배율은 만들지 않는다. AP/AS/crit의 정확한 mechanics 및 shop/가용성은 별도 미완료다. 결과 변화와 원래 역전 fixture 실패를 보존하며 기존 역사에 소급하지 않는다. DEVELOPMENT8.3.2의 source/반례/remaining을 따른다.


## 2026-10-04 교전 남은 자원·유효 기록의 교정 경계 (8.4.1)

실제 회복·부활 없이 HP ratio를 다음 교전에서20%/생존 저장에서5%로 올리던 재현 경로를 실제 fraction 보존으로 교정한다. damage는 남은 aggregate EHP 안에서 소비하고 기존 .9 보고/rounding을 유지해 통계·quest에 동일 전달한다. 새 전투/스킬 계수, 공짜 retarget 또는 물리적 동시 규칙은 만들지 않는다. 새 공식 source에만 집계 방식 marker를 저장하고 옛 기록은 방식 미확인/원본 유지다. reviewed wave XP/귀환 metadata 부족은 임의 수치로 대체하지 않으며 나머지 승인 inventory를 축소하지 않는다. 상세 source/진단/수용/한계는 DEVELOPMENT8.4.1이다.


## 2026-10-04 오브젝트 경로 연결의 교정 경계 (8.6.1)

한타 후 실제 바론에서 관여/quest 사건이 빠진 재현 경로를 기존 공통 규칙으로 교정한다. actual fight participant IDs 중 생존한 실제 참가자가 관여를 받으며 alive 전원과 구분한다. 기존 alive 금전 지급/확률·보상 상수·buff/respawn 규칙은 새 정책으로 바꾸지 않는다. 단위·proximity·global/local source 부족을 완료로 숨기지 않고 당시 source와 old history를 보존한다. 실제 종료 이후 claim 거절은 보강하지만 현재 정상 경로에서 terminal 지급 결함을 재현했다고 주장하지 않는다.


## 2026-10-04 처치 관여 중복·당시 지급 경계 (8.4.2)

같은 실제 지원자를 두 번 지급하거나 이미 사망 처리된 target의 동일 처치를 재호출해 경제/quest를 변경하는 actual writer 반례를 소유/가용성·유일 지원자로 방지한다. 실제 정상 hitter/call source와 죽은 관여자의 기존 지급 eligibility, base/quest·사망 시간/로그 RNG는 유지한다. assistGold150을 네 명에게 각38 지급하는152 현상은 실제 재현됐으나 reviewed server rounding metadata가 없어 새 정수/소수 배분 정책을 임의 도입하지 않는다. 설정과 실제 지급을 당시 source/UI에 구분하며 과거 missing history는 재구성하지 않는다. 거리·bounty·동시/캐시/XP·shop 범위 완료 주장이 아니다.

## Initial recruitment observed workflow boundary (2026-10-05, UTC10-04)

The approved region-first explorer uses the current source `player.region` as **origin region**, explicitly separate from nationality, activity region, local eligibility and language. It connects legitimate observed reports to existing interest, paid observation, evaluation and negotiation without new automatic authority. Viewing/filtering must not create persisted reports; unavailable observed values remain unavailable. Ephemeral filters/selection reset across world/save-slot ownership boundaries; persisted actual reports/contracts retain existing save semantics. Removing the superseded no-language-penalty notice does not implement the separately approved club language/support-spending engine. Comparison/radar and full UI remain approved continuations.

## Initial observed comparison implementation boundary (12.5.2, 2026-10-05 UTC10-04)

The approved temporary two-to-three candidate comparison reuses current authorized observed ranges/ten metrics and existing role attributes. Shared patch/event/date filters describe public sample rows, never historical reconstructed ability. Public rows lack game IDs and are labelled source rows. Missing axes stay missing; radar is a visual encoding of the same observed metrics, not normalization, potential truth or a win ranking. Current-FA/owned-context checks apply before getters and before all existing actions. Removing later direct bindings enforces the already approved stale-world guard without creating a new authority policy. Full match-metric radar/UI/language remain approved and unfinished.

### 2026-10-05 — 12.5.3 초기 조건부 영입 미리보기

기존 초기 계약 명령을 private copy에서 적용한 전후 숫자만 표시한다. 선수 수락/공식 출전 자격을 보장하거나 다른 진행중 제안을 확정 의무로 합산하지 않는다. 전문 역할 인원은 참고이며 새 등록 의무가 아니다. 초기 예산·계약금·로컬/SFR는 기존 가상 규칙의 실제 소비자를 사용하고 새 금액/재정/언어 정책은 추가하지 않는다. 실제 계약은 기존 수동 협상 명령의 최신 검사와 rollback을 유지한다.
