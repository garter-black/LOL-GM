# 1단계 — PR 본문·설계/구현 근거 후보 전량 색인 A

> 생성 시기 2026-09~2026-10-01 구간 PR의 **제목/본문 초록/원문 링크** 검색 인덱스. PR 설명의 '사용자 승인' 문장과 실제 사용자 후속 승인 원문을 혼동하지 않는다. 변경 코드와 리뷰 전체는 이 메타 인덱스만으로 검증되지 않는다.

| PR | 제목 | 규범/구현 탐색 범주 | 본문 첫 부분 |
|---|---|---|---|
| [#3](https://github.com/lkh0802a/LOL-GM/pull/3) | 11.5 / 2차: 도메인 책임 분리 및 UI 시장 구조 정리 | 구현/검증 우선 분류 | ## Scope |
| [#4](https://github.com/lkh0802a/LOL-GM/pull/4) | 11.5 / 3-1: 공통 상태 트랜잭션 기반과 로스터 API | 후속 본문 검토 | ## Scope (Stage 3-1 only) |
| [#5](https://github.com/lkh0802a/LOL-GM/pull/5) | 11.5 / 3-2: 계약·이적·방출·옵션 공통 트랜잭션 | 후속 본문 검토 | ## Scope: Stage 3-2 only |
| [#6](https://github.com/lkh0802a/LOL-GM/pull/6) | 11.5 / 3-3: 저장 복원 마이그레이션 및 기존 슬롯 보호 | 후속 본문 검토 | ## Scope: Stage 3-3 only |
| [#7](https://github.com/lkh0802a/LOL-GM/pull/7) | 11.5 / 3-4: 트랜잭션 원자성 롤백·전체 통합 검증 | 후속 본문 검토 | ## Scope — final 11.5 stage 3 substage |
| [#8](https://github.com/lkh0802a/LOL-GM/pull/8) | 11.5 / 4: 장기 커리어 메타 인덱스 및 캐시 성능 최적화 | 후속 본문 검토 | ## Stage 11.5/4 performance scope |
| [#9](https://github.com/lkh0802a/LOL-GM/pull/9) | 11.5 / 5: 레거시 코드 및 중복 등록 규칙 정리 | 후속 본문 검토 | ## Stage 11.5/5 — legacy and duplicated rule ownership |
| [#10](https://github.com/lkh0802a/LOL-GM/pull/10) | 11.5 / 5: 레거시 optional fallback 제거 | 후속 본문 검토 | ## Stage 11.5/5 legacy cleanup |
| [#11](https://github.com/lkh0802a/LOL-GM/pull/11) | 11.5 / 5-1: 등록 자격·시즌 이적 제한 중복 로직 통합 | 후속 본문 검토 | This PR was opened for 11.5/5-1 rule deduplication, but the default branch advanced concurrently: 11.5/5-1 equiv |
| [#12](https://github.com/lkh0802a/LOL-GM/pull/12) | 11.5 / 5-2: 미사용 엔진 fallback 감사·제거 | 후속 본문 검토 | ## 11.5 / Stage 5-2 — Dead/optional engine fallback audit |
| [#13](https://github.com/lkh0802a/LOL-GM/pull/13) | 11.5 / 5-3: 미사용 레거시 래퍼·중복 진입점 6개 제거 | 후속 본문 검토 | ## 11.5 Stage 5-3 — source reachability audit and safe cleanup |
| [#14](https://github.com/lkh0802a/LOL-GM/pull/14) | 11.5 / 5-4a: 계약 협상·공식 경기·2군 콜업 회귀 검증 | 후속 본문 검토 | ## Stage 5-4a only — critical-path regression acceptance |
| [#15](https://github.com/lkh0802a/LOL-GM/pull/15) | 11.5 / 5-4b·c: 2개 시즌·저장 복원 최종 수용 검증 | 후속 본문 검토 | ## Scope — stage 5-4b + 5-4c only |
| [#16](https://github.com/lkh0802a/LOL-GM/pull/16) | 11.5 / 5차 전체 완료 검증 기록 | 후속 본문 검토 | Documentation-only Stage 5 sign-off, after PR #15 and main CI #36406723092 succeeded. |
| [#17](https://github.com/lkh0802a/LOL-GM/pull/17) | 세계 변화: 실존 리그 프리셋 외 가상 지역 리그 창설 | 후속 본문 검토 | ## 문제 |
| [#18](https://github.com/lkh0802a/LOL-GM/pull/18) | 11.5/6-1: consolidate transient UI state and screen routing | 구현/검증 우선 분류 | ## Scope |
| [#19](https://github.com/lkh0802a/LOL-GM/pull/19) | 11.5/6-2: unify modal lifecycle, focus and keyboard handling | 후속 본문 검토 | ## Scope |
| [#20](https://github.com/lkh0802a/LOL-GM/pull/20) | 11.5/6-3: guard async world tasks, slot switches and stale UI callbacks | 구현/검증 우선 분류 | ## Scope |
| [#21](https://github.com/lkh0802a/LOL-GM/pull/21) | 11.5/6-4: mobile accessibility polish and final UI acceptance | 구현/검증 우선 분류 | ## Scope (11.5 stage 6-4 only) |
| [#22](https://github.com/lkh0802a/LOL-GM/pull/22) | Phase 12: timed facilities, prepaid cash-flow accounting and finance outlook | 구현/검증 우선 분류 | ## Existing functionality retained |
| [#23](https://github.com/lkh0802a/LOL-GM/pull/23) | Phase 12-B: substantive club economy, sponsorship, specialized facilities and AI budget discipline | 구현/검증 우선 분류 | ## Why reopen Phase 12 |
| [#24](https://github.com/lkh0802a/LOL-GM/pull/24) | Docs: audit functional depth of previously accepted Items 1–11 and 11.5 | 정책·문서 확인 후보 | ## Purpose |
| [#25](https://github.com/lkh0802a/LOL-GM/pull/25) | Retrofit D01: simulate every actual world day before official matches | 구현/검증 우선 분류 | ## Why |
| [#26](https://github.com/lkh0802a/LOL-GM/pull/26) | Fix D01: twice-weekly league fixture contract and multi-block daily scrims | 구현/검증 우선 분류 | ## Design correction requested |
| [#27](https://github.com/lkh0802a/LOL-GM/pull/27) | Realism: weekly LoL broadcast slate, playable recovery intervals and chemistry swings | 후속 본문 검토 | ## Player-facing fixes |
| [#28](https://github.com/lkh0802a/LOL-GM/pull/28) | Add TV-style league fixture calendar and realistic international/governance rules | 정책·문서 확인 후보 | ## Major gameplay realism corrections |
| [#29](https://github.com/lkh0802a/LOL-GM/pull/29) | Schedule domestic LoL broadcast weeks and reserve scrims only when both teams are free | 후속 본문 검토 | ## Requested gameplay changes |
| [#30](https://github.com/lkh0802a/LOL-GM/pull/30) | Scrim AI: mutual partner choice, tactical secrecy, strength gap and confidence-rebuilding sessions | 구현/검증 우선 분류 | ## Why |
| [#31](https://github.com/lkh0802a/LOL-GM/pull/31) | Schedule LoL broadcasts by regional and international venue time zones with DST-safe UTC world dates | 후속 본문 검토 | Superseded by merged PR #32, which already implemented venue/IANA/DST conversion and mutual UTC scrim overlap. T |
| [#32](https://github.com/lkh0802a/LOL-GM/pull/32) | Schedule LoL esports in real IANA time zones and DST-aware UTC clocks | 후속 본문 검토 | ## Why |
| [#33](https://github.com/lkh0802a/LOL-GM/pull/33) | Rebalance scrim partner acceptance to avoid extreme strength-gap and slump swings | 구현/검증 우선 분류 | Superseded by PR #34 (rebased to the timezone-aware main with identical scrim balance changes). |
| [#34](https://github.com/lkh0802a/LOL-GM/pull/34) | Balance scrim acceptance: moderate strength-gap reluctance and gradual slump boosts | 구현/검증 우선 분류 | Replacement for conflicting PR #33, based on the latest UTC timezone-aware main. The original scrim matchmaking  |
| [#35](https://github.com/lkh0802a/LOL-GM/pull/35) | Fix DST calendar rollover: split TV slots across UTC days, preserve Swiss results and shared scrim w | 구현/검증 우선 분류 | ## Scope: correct real-world timezone edge cases after PR #32 |
| [#36](https://github.com/lkh0802a/LOL-GM/pull/36) | D02-A: Rare player injuries, illness, burnout and rehabilitated match eligibility | 후속 본문 검토 | Introduce per-player rare medical incidents on the D01 day clock with independent deterministic odds, officially |
| [#37](https://github.com/lkh0802a/LOL-GM/pull/37) | D02-B/1: atomic academy emergency registrations when starters become unavailable | 후속 본문 검토 | Medical incidents on a five-healthy-player squad now check its owned reserve or first-team sibling for an availa |
| [#38](https://github.com/lkh0802a/LOL-GM/pull/38) | D02-B/2: Player-specific rest, recovery and rehabilitation | 구현/검증 우선 분류 | Manager-controlled individual training/rest/rehab plan, AI-specific auto-scheduling, scrim-only substitutions fo |
| [#39](https://github.com/lkh0802a/LOL-GM/pull/39) | D02-B3: Budgeted emergency FA signing when academy callups are unavailable | 후속 본문 검토 | ## Scope |
| [#40](https://github.com/lkh0802a/LOL-GM/pull/40) | D02-B4: Keep a small local FA market after first-season roster auctions | 후속 본문 검토 | ## Scope |
| [#41](https://github.com/lkh0802a/LOL-GM/pull/41) | D02-B5: Evaluate recent medical availability in AI transfers and contracts | 후속 본문 검토 | ## Scope |
| [#42](https://github.com/lkh0802a/LOL-GM/pull/42) | D02-B6: Run deterministic medical incidence audits across seeded seasons | 구현/검증 우선 분류 | ## Implemented |
| [#43](https://github.com/lkh0802a/LOL-GM/pull/43) | D02-B7: True short-term medical FA contracts with paid guarantees and lawful expiry | 후속 본문 검토 | ## Scope |
| [#44](https://github.com/lkh0802a/LOL-GM/pull/44) | D02-B8: Preventive recovery support and real-world-calendar medical career audit | 후속 본문 검토 | ## Scope |
| [#45](https://github.com/lkh0802a/LOL-GM/pull/45) | D02-B9: Expand medical incidence audit to 2/3-split multi-region seasons and international play | 구현/검증 우선 분류 | ## Added |
| [#46](https://github.com/lkh0802a/LOL-GM/pull/46) | Separate each league's split count from result aggregation (independent / cumulative / points) | 후속 본문 검토 | ## Feature |
| [#47](https://github.com/lkh0802a/LOL-GM/pull/47) | 리그 사무국이 스플릿·성적 집계 방식을 결정하도록 변경 | 후속 본문 검토 | ## 변경 사항 |
| [#48](https://github.com/lkh0802a/LOL-GM/pull/48) | D02-B10.1: audit real-calendar burnout exposure without modifying medical odds | 후속 본문 검토 | ## Scope — one bounded development unit |
| [#49](https://github.com/lkh0802a/LOL-GM/pull/49) | D02-B10.2: audit longitudinal burnout exposure across live seasons | 후속 본문 검토 | ## Scope |
| [#50](https://github.com/lkh0802a/LOL-GM/pull/50) | D03-B1: add club-specific scouting memory for AI market decisions | 정책·문서 확인 후보 | ## Scope |
| [#51](https://github.com/lkh0802a/LOL-GM/pull/51) | D03-B2: persist founding scouting dossiers in the initial roster market | 후속 본문 검토 | ## Scope |
| [#52](https://github.com/lkh0802a/LOL-GM/pull/52) | D03-B3: add finance-backed active AI scouting operations | 후속 본문 검토 | ## Scope |
| [#53](https://github.com/lkh0802a/LOL-GM/pull/53) | D03-B4: validate stale-report recruitment mistakes and reassessment | 구현/검증 우선 분류 | ## Scope |
| [#54](https://github.com/lkh0802a/LOL-GM/pull/54) | D04-B1: reconcile contract duration rules and share player-specific preferences | 정책·문서 확인 후보 | ## Scope |
| [#55](https://github.com/lkh0802a/LOL-GM/pull/55) | D04-B2: add renewal cooldown and hard-breakdown reopen rules | 정책·문서 확인 후보 | ## Scope |
| [#56](https://github.com/lkh0802a/LOL-GM/pull/56) | D04-B3: add post-Worlds exclusivity, contact waivers and day-15 FA | 후속 본문 검토 | ## Scope |
| [#58](https://github.com/lkh0802a/LOL-GM/pull/58) | perf(ci): remove check.mjs subprocess and reread overhead | 구현/검증 우선 분류 | ## Scope |
| [#59](https://github.com/lkh0802a/LOL-GM/pull/59) | ci: gate and parallelize validation workflow | 구현/검증 우선 분류 | ## Scope |
| [#60](https://github.com/lkh0802a/LOL-GM/pull/60) | ci(medical): shard deterministic medical seeds | 구현/검증 우선 분류 | ## Scope |
| [#61](https://github.com/lkh0802a/LOL-GM/pull/61) | perf(test): share engine harness in UI finance contract gate | 구현/검증 우선 분류 | ## Scope |
| [#63](https://github.com/lkh0802a/LOL-GM/pull/63) | perf(test): share engine harness in calendar scouting gate | 구현/검증 우선 분류 | ## Scope |
| [#64](https://github.com/lkh0802a/LOL-GM/pull/64) | ci: parallelize regression smoke and career gates | 구현/검증 우선 분류 | ## Scope |
| [#65](https://github.com/lkh0802a/LOL-GM/pull/65) | test(smoke): add phase timing instrumentation | 구현/검증 우선 분류 | ## Scope |
| [#66](https://github.com/lkh0802a/LOL-GM/pull/66) | ci(smoke): isolate patch-system with exact state and RNG parity | 구현/검증 우선 분류 | Smoke's patch/system/cache probes consumed several seconds inside the monolithic job. Run core and patch-system  |
| [#67](https://github.com/lkh0802a/LOL-GM/pull/67) | fix(engine): remove wall-clock seed from pre-career simulation | 구현/검증 우선 분류 | Full smoke on main 580956b passed three times but produced 811/810/813 players. The first divergent field was th |
| [#68](https://github.com/lkh0802a/LOL-GM/pull/68) | ci: publish structured validation results and failure summaries | 구현/검증 우선 분류 | Diagnosing CI currently requires fetching whole job logs even when acceptance scripts already emit structured JS |
| [#69](https://github.com/lkh0802a/LOL-GM/pull/69) | ci: publish standalone only from validated build | 구현/검증 우선 분류 | ## 문제 |
| [#70](https://github.com/lkh0802a/LOL-GM/pull/70) | ci: reuse tested standalone build and skip stale publication | 구현/검증 우선 분류 | The main publication step rebuilt after resetting to a potentially newer, untested main commit. Reuse the produc |
| [#71](https://github.com/lkh0802a/LOL-GM/pull/71) | ci: publish standalone only after full validation | 구현/검증 우선 분류 | Standalone synchronization currently runs inside perf-build before the aggregate validation gate can finish. Mov |
| [#72](https://github.com/lkh0802a/LOL-GM/pull/72) | docs: record Android acceptance and development handoff | 정책·문서 확인 후보 | Record the user's Android-first offline production target and explicitly distinguish the current HTML preview fr |
| [#73](https://github.com/lkh0802a/LOL-GM/pull/73) | docs(refactor): record R01 ownership and mutation audit | 정책·문서 확인 후보 | ## Scope |
| [#74](https://github.com/lkh0802a/LOL-GM/pull/74) | ci: add explicit full validation with optional smoke parity | 구현/검증 우선 분류 | Add workflow_dispatch to the existing CI workflow. An explicit run always executes full validation, including on |
| [#75](https://github.com/lkh0802a/LOL-GM/pull/75) | docs: align development roles and current sequence | 정책·문서 확인 후보 | Corrects documentation merged in #72 so it matches the active project operating model and current repository sta |
| [#76](https://github.com/lkh0802a/LOL-GM/pull/76) | refactor: guard known cross-domain mutation sites | 구현/검증 우선 분류 | Add an R02 source-ownership guard to the existing static check. It records 26 recognized direct writes/calls acr |
| [#77](https://github.com/lkh0802a/LOL-GM/pull/77) | refactor: move signing bonus and transfer settlement into finance | 구현/검증 우선 분류 | Move signing-bonus debit and permanent-transfer debit/credit plus prepaid rows into finance-owned writers. Prese |
| [#78](https://github.com/lkh0802a/LOL-GM/pull/78) | refactor: route facility, scouting and staff expenses through finance | 구현/검증 우선 분류 | Continue the finance writer migration using the R03 API from #77. Move facility investments, manual/AI scouting  |
| [#79](https://github.com/lkh0802a/LOL-GM/pull/79) | refactor: centralize medical replacement wage settlement | 구현/검증 우선 분류 | Move medical replacement signing and conditional daily wage settlement into `finance.js::payMedicalReplacementWa |
| [#80](https://github.com/lkh0802a/LOL-GM/pull/80) | refactor: isolate player contract negotiation domain | 구현/검증 우선 분류 | Player contract rounds, renewal reopening and shared negotiation state were owned by transfer.js alongside selle |
| [#81](https://github.com/lkh0802a/LOL-GM/pull/81) | refactor: centralize world calendar ownership | 구현/검증 우선 분류 | Season, contract-window and offseason code previously positioned db.worldDate directly. Move calendar-day select |
| [#82](https://github.com/lkh0802a/LOL-GM/pull/82) | refactor: route AI market callups through roster transactions | 구현/검증 우선 분류 | AI contract-market callups bypassed action validation and rollback with two direct roster assignments in contrac |
| [#83](https://github.com/lkh0802a/LOL-GM/pull/83) | refactor: unify release cost and finance settlement ownership | 구현/검증 우선 분류 | Release confirmation, command preview and application duplicated the same termination-cost formula, while player |
| [#84](https://github.com/lkh0802a/LOL-GM/pull/84) | refactor: remove proven unused wrappers and UI fallbacks | 구현/검증 우선 분류 | Remove six uncalled private helpers after runtime/shell candidate inventory and repository source/test/document  |
| [#85](https://github.com/lkh0802a/LOL-GM/pull/85) | R08: prove exact refactor state parity and finalize domain ownership map | 구현/검증 우선 분류 | The final refactor gate now compares the pinned R01 engine with current HEAD using the same full smoke and two-s |
| [#86](https://github.com/lkh0802a/LOL-GM/pull/86) | D04-B4a: preserve player release liability detail through settlement | 후속 본문 검토 | After a player release, finance previously retained only an aggregate buyout balance. Releases now preserve the  |
| [#87](https://github.com/lkh0802a/LOL-GM/pull/87) | Fix validated standalone HTML publication after optional parity skip | 구현/검증 우선 분류 | Main CI run 36837142020 passed changes, perf-build and verify, but standalone-sync was skipped and root index.ht |
| [#88](https://github.com/lkh0802a/LOL-GM/pull/88) | Perf: reuse scored rune candidates for secondary page selection | 구현/검증 우선 분류 | Secondary rune selection recomputed slot winners already available from primary-style ranking. It now reuses tho |
| [#89](https://github.com/lkh0802a/LOL-GM/pull/89) | feat: negotiate contractual release guarantees (D04-B4b) | 구현/검증 우선 분류 | Player contract negotiations now expose 50%, 75% and 100% release protection. The signed percentage affects offe |
| [#90](https://github.com/lkh0802a/LOL-GM/pull/90) | docs: perform remaining optimization during feature development | 정책·문서 확인 후보 | Record the user's decision that development-efficiency optimization and the planned refactor are complete. Remai |
| [#91](https://github.com/lkh0802a/LOL-GM/pull/91) | fix: Worlds tournament names and fixed normal world evolution | 구현/검증 우선 분류 | World setup now names the end-of-season events Worlds Masters and Worlds Open. Existing MASTERS/OPEN IDs and rul |
| [#92](https://github.com/lkh0802a/LOL-GM/pull/92) | feat: offseason mutual contract termination (D04-B4c) | 구현/검증 우선 분류 | Managers can propose mutual termination in the offseason contract window and market. Players consent based on de |
| [#93](https://github.com/lkh0802a/LOL-GM/pull/93) | D04-B4d1: atomic club closure and cash-limited player claim settlement | 후속 본문 검토 | Office-directed closure previously removed roster membership while leaving player contracts attached and outstan |
| [#94](https://github.com/lkh0802a/LOL-GM/pull/94) | D04-B4d2: fund reserve closure from actual parent surplus cash | 후속 본문 검토 | Owned reserves previously retained unpaid termination claims even when their parent had spare cash. Extend the e |
| [#95](https://github.com/lkh0802a/LOL-GM/pull/95) | Allow coaching owned Academy teams with parent-controlled recruitment | 구현/검증 우선 분류 | Owned Academy/Challengers teams were excluded from manager selection, leaving default Korean/Chinese second divi |
| [#96](https://github.com/lkh0802a/LOL-GM/pull/96) | D04-B4d3: recover reserve surplus before organization closure support | 후속 본문 검토 | Closing owned reserves could strand spare cash while their parent retained unpaid player claims. Recover only re |
| [#97](https://github.com/lkh0802a/LOL-GM/pull/97) | Require player consent for permanent transfers (D04-B4e1) | 구현/검증 우선 분류 | Permanent transfers previously moved contracted players after club agreement without checking their personal ter |
| [#98](https://github.com/lkh0802a/LOL-GM/pull/98) | Negotiate affordable AI transfer personal terms (D04-B4e2) | 후속 본문 검토 | AI purchases previously skipped every player who refused their retained contract. AI now first keeps affordable  |
| [#99](https://github.com/lkh0802a/LOL-GM/pull/99) | Enforce signed role promises using actual official usage (D04-B4f1) | 구현/검증 우선 분류 | Changing a player's roster label to backup previously erased the starter expectation used by satisfaction, even  |
| [#100](https://github.com/lkh0802a/LOL-GM/pull/100) | Bundle player agents, oral role promises and confirmation UI | 구현/검증 우선 분류 | High-reputation players now have persistent identified representatives whose independent traits affect actual co |
| [#101](https://github.com/lkh0802a/LOL-GM/pull/101) | feat: connect loan gameplay, salary sharing and mobile controls | 구현/검증 우선 분류 | Players can now join another club temporarily while their original club retains the contract. This batch connect |
| [#102](https://github.com/lkh0802a/LOL-GM/pull/102) | Connect loan purchases, deferred transfer fees and regional local service | 후속 본문 검토 | Loans can now carry agreed purchase options or binding obligations, convert ownership without another squad move |
| [#103](https://github.com/lkh0802a/LOL-GM/pull/103) | Separate official rosters from contracts and training squads | 구현/검증 우선 분류 | Contract/training assignment no longer automatically grants official participation in new seasons. Clubs submit  |
| [#104](https://github.com/lkh0802a/LOL-GM/pull/104) | Fix new-career flow, public estimates and game-facing rules | 정책·문서 확인 후보 | New careers no longer require a redundant world-generation confirmation and always start with manual contract/re |
| [#105](https://github.com/lkh0802a/LOL-GM/pull/105) | Contextual First Selection and training NaN recovery | 후속 본문 검토 | First Selection now weighs eligible patch picks, registered-player mastery, bounded opponent scouting and remain |
| [#106](https://github.com/lkh0802a/LOL-GM/pull/106) | Superseded by #109: actual daily career clock and long-season QA | 후속 본문 검토 | The existing short career fixture skips directly to match dates. Add a separate career driver that calls the act |
| [#107](https://github.com/lkh0802a/LOL-GM/pull/107) | Superseded by #109: ownership transitions and club continuity | 구현/검증 우선 분류 | Ordinary acquisitions previously renamed a club without changing its owner. Record stable distinct owners and an |
| [#108](https://github.com/lkh0802a/LOL-GM/pull/108) | Superseded by #109: region succession and local eligibility | 후속 본문 검토 | Region restructuring now preserves continuing club IDs, owned reserves, contracts and historical succession inst |
| [#109](https://github.com/lkh0802a/LOL-GM/pull/109) | Integrate D daily careers, ownership, regional and license continuity | 구현/검증 우선 분류 | Daily career progression, acquisitions and regional reorganization must preserve the continuing club, contracts, |
| [#110](https://github.com/lkh0802a/LOL-GM/pull/110) | Reduce paid CI minutes with scoped validation and single-runner medical QA | 구현/검증 우선 분류 | Paid Actions previously repeated complete game suites after each validated merge and provisioned six runners for |
| [#111](https://github.com/lkh0802a/LOL-GM/pull/111) | Reduce long-career history restore memory and QA-held copies | 후속 본문 검토 | The prior 100-season daily QA exhausted V8 heap after 30 seasons; its original reports and fatal logs are preser |
| [#112](https://github.com/lkh0802a/LOL-GM/pull/112) | D07: connect staff contracts, interviews and atomic career transitions | 후속 본문 검토 | Staff now have primary/secondary expertise, stored public/interview estimates, fixed wages, 1–3-year contracts a |
| [#113](https://github.com/lkh0802a/LOL-GM/pull/113) | Connect lineup cohesion, shared practice time and international scrims | 후속 본문 검토 | Teamwork previously increased after every series even when every teammate relationship was hostile. Cohesion now |
| [#114](https://github.com/lkh0802a/LOL-GM/pull/114) | Budget player conversion drills and batch scrim venue calculations | 후속 본문 검토 | Role conversion received daily practice independently of scrims, medical rest and the shared drill budget. It no |
| [#115](https://github.com/lkh0802a/LOL-GM/pull/115) | Connect relationships to lineup, recruitment and contract willingness | 구현/검증 우선 분류 | Relationships influenced match cohesion but did not affect who AI selected or recruited. Role-fit DP now receive |
| [#116](https://github.com/lkh0802a/LOL-GM/pull/116) | Connect manual scrim requests, consent and reservations to daily practice | 후속 본문 검토 | Managers can request 1–3 scrim sets in an afternoon/evening block within the next seven days. Opponent consent,  |
| [#117](https://github.com/lkh0802a/LOL-GM/pull/117) | Record supervised career process lifetime and source identity | 후속 본문 검토 | Career runs can lose their observer while the partial game report still says running. The existing command obser |
