# LOL-GM 사용자 확정 규정의 효력·구형 충돌 정리

> **기준일 2026-11-01 | 문서 정합성 지도 (게임 코드 구현 완료 아님).**
> 기존 문서를 삭제하거나 과거 합의를 소급 재작성하지 않고, **나중에 명시적으로 승인된 같은 주제의 결정**이 앞선 결정/초안/예시를 대체하는 범위만 표시한다. GitHub 이슈·코멘트와 현재 게임 코드·미병합 PR은 서로 다른 상태다.
> 정합성 추적: [#257](https://github.com/lkh0802a/LOL-GM/issues/257) · 원칙 [#311](https://github.com/lkh0802a/LOL-GM/issues/311) · 세계 일정 [#234](https://github.com/lkh0802a/LOL-GM/issues/234) · 전체 검증 [#241](https://github.com/lkh0802a/LOL-GM/issues/241).

## 0. 일관된 판정·적용

- **ACTIVE**: 현재 승인 규정. **INITIAL_ONLY**: 첫 세계/초기 사무국 설정일 뿐 사전 공표·정당한 절차를 거쳐 장래 변경 가능. **SUPERSEDED**: 뒤의 명시적 승인으로 그 범위에서 폐기. **UNRESOLVED**: 결정되지 않았거나 문서/코드의 구체적 적용 관계가 미검증. **IMPLEMENTATION_PENDING**: 설계는 확정, 코드·검증/병합이 아직 불완전.
- 이전 문서의 제목에 "확정 규칙"이라고 써 있거나 과거의 같은 달 "최신" 표현이 남아 있어도 **동일 쟁점의 더 새로운 명시적 사용자 결정을 우선**한다. 문서에 추가됐다는 이유로 실제 코드·CI·세이브에 적용됐다고 보지 않는다.
- 규칙은 반드시 **적용 주체·대상·시작/종료 시각·대회 종류·기존 계약/규칙 버전**을 구분한다. 성급한 하나의 예외 규칙으로 전 영역을 무효화하지 않는다.
- **기존 결과의 소급 변경 금지:** 새로운 규정은 적법한 시행일·시즌에만 적용. 과거 확정 경기·명단/참가권·원장·계약·역사 보존. 실제 당시 `rulesVersion`/`effectiveSeasonId` 사용([#311](https://github.com/lkh0802a/LOL-GM/issues/311), [#323](https://github.com/lkh0802a/LOL-GM/issues/323)).

## 1. 확정/대체 규칙 대조

| ID | 이전 문구 또는 흔한 잘못된 해석 | 현재 효력과 구분 | 원본/수정 경로 |
|---|---|---|---|
| P-01 | 신규 지역은 공식 2부와 반드시 동시 개설·계속 유지 | **SUPERSEDED.** 기존 초기 여섯 주요 지역의 초기 2부는 유지; **신규 지역의 정식 2부는 권고**이며 1부만으로 출범 가능. 지역 운영성과·라이선스·육성 환경에 따라 정식 3·4부 이상 자율 확대/축소 가능. 조직 내부 2군·Academy 소유 의무는 **정식 2부 개설**과 다른 축 | [#311](https://github.com/lkh0802a/LOL-GM/issues/311); 기존 문서 시정 [PR #313](https://github.com/lkh0802a/LOL-GM/pull/313), 코드 1차 [PR #315](https://github.com/lkh0802a/LOL-GM/pull/315) |
| P-02 | 글로벌 리그는 모두 동일한 3스플릿 또는 고정 14개 구간 | **SUPERSEDED.** 각 지역이 컵/리그·스플릿·연간 통합 구조를 합법적으로 선택; 운영 엔진은 세계 시간·대회 자격과 일정을 자동 조정. 국제대회·계약·Worlds 결승 고정 제약은 존속 | [#234](https://github.com/lkh0802a/LOL-GM/issues/234), [#311](https://github.com/lkh0802a/LOL-GM/issues/311), [PR #313](https://github.com/lkh0802a/LOL-GM/pull/313) |
| P-03 | 모든 국제대회 동안 모든 국내 공식경기 전면 중단 | **SUPERSEDED.** 중간 국제대회는 실제 선수/팀·이동/중계 점유·공정성을 고려해 **조건부 국내 경기 병행** 가능. **월즈 개막 전에 모든 활성 국내 공식 1~N부·선발전 종료**, Worlds 결승은 해당 시즌 **마지막 공식 경기** | [#311](https://github.com/lkh0802a/LOL-GM/issues/311), [PR #313](https://github.com/lkh0802a/LOL-GM/pull/313) |
| P-04 | LOL-GM 선수 FA는 현실 Riot 일정과 같은 11월 셋째 화요일 | **SUPERSEDED.** **게임은 매년 12월 첫째 화요일 00:00 UTC** 개장. 해당 연도 만료 선수의 표준 계약은 직전 월요일 23:59 UTC까지. 2026-12-01 / 2027-12-07 / 2028-12-05. 현실 Riot 날짜는 외부 참고이며 게임 효력 아님 | [#234 최종](https://github.com/lkh0802a/LOL-GM/issues/234), [PR #320](https://github.com/lkh0802a/LOL-GM/pull/320) |
| P-05 | 월즈/최종 국제대회 종료 후 14일 독점 → 15일째 FA | **SUPERSEDED.** 월즈 종료일에서 FA·만료일을 산출하지 않음. 기존 계약은 정해진 글로벌 만료일까지 유지. 다음 기간은 기존 계약/원소속 재계약과 **동의 있는 외부 조기 접촉**으로 처리 | [#234](https://github.com/lkh0802a/LOL-GM/issues/234), [PR #320](https://github.com/lkh0802a/LOL-GM/pull/320); 구형 문구 `PLAYER_RELATION_CONTRACT_RULES.md`/ `ROSTER_TRANSFER_LOCAL_RULES.md` §4.5 |
| P-06 | 14일 대신 **별도의 7일** 우선 재계약 기간 신설 | **SUPERSEDED. 2026-10-29 더 최신 결정:** **7일 독점 기간 자체도 두지 않음.** 구단 동의 없는 계약 중 외부 접촉은 불허. 과거 #311의 10-28 '최신 7일' 기록을 구현 정본으로 삼지 않음. `exclusive`라는 레거시 내부 단계명은 **7일 독점 기간 존재의 증거가 아님** | [PR #320의 2026-10-29 `docs/DECISIONS.md` 마지막 절](https://github.com/lkh0802a/LOL-GM/blob/fix/december-first-tuesday-fa-20261028/docs/DECISIONS.md) |
| P-07 | FA만 개방 / 일반 이적시장은 따로 순차 운영 / FA 동안 경기 가능 | **SUPERSEDED.** FA·일반 계약 선수 이적 **동일 글로벌 28일 개장**. **공식 지역·국제 + 독립 지역·국제 모두 시장 열려 있는 동안 실제 경기 0건**. 28일 후 정확히 종료(끝 시각 배타). 기존 무소속 FA 연중 계약과 **프로 라이선스 미보유 구단 계약 선수의 의무 바이아웃 연중 예외**는 구분 | [#234](https://github.com/lkh0802a/LOL-GM/issues/234), [#321](https://github.com/lkh0802a/LOL-GM/issues/321), [PR #320](https://github.com/lkh0802a/LOL-GM/pull/320) |
| P-08 | 독립 장기리그는 12/31 전까지만 종료하면 됨 / 월즈가 **모든** 대회의 마지막 경기 | **SUPERSEDED.** 독립 장기 지역·국제리그 **글로벌 FA 시작 전에 해당 회차 완주**. 독립 단기 컵은 Worlds 결승 후에도 적법한 개최 가능하나 **글로벌 28일 시장 중에는 실제 경기 불가**. 공식 일정을 독립 대회가 밀어내지 못함 | [#234](https://github.com/lkh0802a/LOL-GM/issues/234), [#323](https://github.com/lkh0802a/LOL-GM/issues/323) |
| P-09 | 단일 큐는 개인 솔로만 / 듀오·3~5인 파티 미승인 | **SUPERSEDED.** 세계 단일 5v5 통합 큐에 1~5인 파티 허용, 남은 자리만 매칭. MMR·대기·선호 역할·파티 대칭성은 기존 승인. 다만 수치형 MMR 임계값을 임의 고정하지 않음 | [#251의 2026-10-18 사용자 직접 승인](https://github.com/lkh0802a/LOL-GM/issues/251#issuecomment-6244488968), 문구 정정 [#232](https://github.com/lkh0802a/LOL-GM/issues/232), **병합된 [PR #326](https://github.com/lkh0802a/LOL-GM/pull/326)** |
| P-10 | 랭크 티어 승급·강등·티어 초기화 필수 / 익명 또는 실명+닉네임 병행 의무 | **SUPERSEDED.** 공개 **RP 점수·세계 순위**, 내부 MMR 분리, 시즌 RP 소프트 리셋; 별도 티어 승강 시스템 없음. **세계 인물 1명당 고유 랭크 계정 1개, 닉네임 변경 금지, 공개 계정의 소유자 식별 가능**. 이전 #190A의 별도 실명 필드·실명/닉네임 병행 공개 의무는 **사용자 즉시 재정정으로 철회**. 비공개 실제 능력·잠재력·MMR·의료는 계속 보호 | [#140 최종](https://github.com/lkh0802a/LOL-GM/issues/251#issuecomment-6245258798), [#190A 철회·맞춤 최종안](https://github.com/lkh0802a/LOL-GM/issues/251#issuecomment-6246200434), [룰북 PLAYER-006](https://github.com/lkh0802a/LOL-GM/blob/docs/standalone-approved-rulebook-20261101/docs/rulebook/40-PLAYERS.md) |
| P-11 | 1군 비로컬 등록 상한 2명은 모든 미래 시즌에도 절대 바꿀 수 없는 엔진 불변 | **INITIAL_ONLY.** 첫 세계의 당시 **2명 규정은 계속 집행**, 적법한 국제/지역 협의·공표·시즌 발효 이후에만 변경 가능. 이미 확정된 과거 시즌/선수 로컬·계약·등록은 소급 변경 불가 | [#311 10-28 숫자 잠금 완화](https://github.com/lkh0802a/LOL-GM/issues/311). `ROSTER_TRANSFER_LOCAL_RULES.md` §3 구형 '고정' 절대성 주의 |
| P-12 | 구단이 사무국 변경안을 투표로 거부/사무국 최고경영자가 모든 세계 정책을 직접 확정 | **ACTIVE(새 승인, 미구현):** 구단의 의견 제시·협상 허용, **자동 구단 거부권은 없음**. 지역 내 운영권 자율; 국제대회 출전권/다지역 권리는 국제 경영진, 대규모 체제 개편·사무국 통폐합·대형 재정은 **혼합 이사회 승인**. 중앙 이사 의결권 과반·지역대표 참여. 무작위 파벌/해임 엔진 없음 | [#324](https://github.com/lkh0802a/LOL-GM/issues/324), [병합된 PR #325](https://github.com/lkh0802a/LOL-GM/pull/325) |

## 2. **아직 폐기/확정하면 안 되는 문제**

| 사안 | 상태 및 이유 |
|---|---|
| **시즌 중 지역별 계약 선수 이적창** | **ACTIVE(2026-11-01 직접 후속 승인, 구현 미검증).** 공식 국제대회 기간을 **우선 개장 시점**으로 사용하되 국제대회마다 의무 개장하거나 전 지역에 동일 시각·횟수·기간을 강제하지 않는다. 지역사무국이 사전 공표한 유효한 창에서 해당 지역 구단의 계약 선수 완전이적·임대 영입 가능. 타지역 영입은 **영입 지역의 개장**뿐 아니라 원소속 구단의 계약상 동의 또는 적법한 바이아웃·선수 동의·재정·관련 이적/등록 규정을 충족해야 한다. 국제대회 진행 중 협상·계약과 실제 대회 등록/명단 잠금은 별도 판정. 12월 **세계 통합 28일 선수 시장**(기간 중 네 종류 대회 실경기 금지), 무소속 FA의 연중 계약, 프로 라이선스 미보유 팀 계약자의 연중 바이아웃 예외와 병존한다. [#328 TRANS-011](https://github.com/lkh0802a/LOL-GM/blob/docs/standalone-approved-rulebook-20261101/docs/rulebook/30-TRANSFERS.md); 과거 [#224](https://github.com/lkh0802a/LOL-GM/issues/224)/[#234](https://github.com/lkh0802a/LOL-GM/issues/234)/[#321](https://github.com/lkh0802a/LOL-GM/issues/321). **실제 지역 최초 개장일/횟수·운영 세부는 확정 상수가 아님.** |
| **1~N부 소속 vs 조직 1군·2군** | **ACTIVE 핵심 구분 / IMPLEMENTATION_PENDING.** 소유 2군·Academy는 클럽 조직이고 정식 2부·3부는 참가 리그 계층. 소유 2군이 3부 참가해도 자동 승격권 없음. 1부 동일 구단/산하팀 이해충돌 금지는 기존 확정 유지. 구체적 등록·재정·승강은 [#311](https://github.com/lkh0802a/LOL-GM/issues/311). |
| **패치 주기와 국제대회 방식의 초기 프리셋** | **INITIAL_ONLY.** 초기 14일 일반 패치·주요 패치·일부 Bo/슬롯·초기 포맷은 향후 합법적인 제도/게임 메타 변화 여지를 남김. 한 번 적용된 경기는 당시 패치·Fearless/First Selection·규정 스냅샷을 보존. [#311](https://github.com/lkh0802a/LOL-GM/issues/311). |
| **단일 게임 코어/세계 시계·시장·부별 변경** | **IMPLEMENTATION_PENDING.** 새 5v5 코어 초기 단계, `season.js`의 구형 단계 구조, `world.js`/ `office-international.js`의 신규 2부 강제, `contract-window.js` 구형 FA 등 `main`에 옛 코드 잔존. 해당 기존 [#233](https://github.com/lkh0802a/LOL-GM/issues/233)·[#234](https://github.com/lkh0802a/LOL-GM/issues/234)·[#315](https://github.com/lkh0802a/LOL-GM/pull/315)·[#318→#320](https://github.com/lkh0802a/LOL-GM/pull/320)에서 진행. 문서 정정으로 구현 완료라 주장 금지. |

**후속 승인 정정(2026-11-01):** 최초 이 문서의 U-01 '지역별 시즌 중 계약 선수 이적창 UNRESOLVED'는 사용자 후속 대화 승인에 따라 **개장 권한·시점·허용 거래 범위가 해결**되었다. 다만 관할 사무국이 정하는 개별 시각·횟수·등록 마감 및 실제 코드 상태는 별도. 구형 문서에는 여전히 한 지역 창만 열리면 원소속 권리·국제대회 명단을 무조건 우회하는 듯한 표현이 있을 수 있으므로 최신 [TRANS-011](https://github.com/lkh0802a/LOL-GM/blob/docs/standalone-approved-rulebook-20261101/docs/rulebook/30-TRANSFERS.md) 기준으로 대조한다.

## 3. 관련 PR의 교정 및 현재 상태 — 중복 금지

- [PR #313](https://github.com/lkh0802a/LOL-GM/pull/313): `INTERNATIONAL_OFFICE_RULES.md`의 새 지역 2부 권고·중간 국제전 조건부 병행, `LOL_GM_SPEC.md`의 1~N부. **main에는 아직 미병합**.
- [PR #315](https://github.com/lkh0802a/LOL-GM/pull/315): 2부 권고·3부 이상 및 강제 퇴출 일부 코드 교정, **Draft·미병합**.
- [PR #318 → #319 → #320](https://github.com/lkh0802a/LOL-GM/pull/320): 12월 글로벌 FA·시계·28일 시장으로 단계적 전환, **Draft·미병합**. 다만 이 PR의 `docs/design/INDEPENDENT_REGIONAL_ORGANIZER_ENGINE_PROJECT_2026_10_28.md` 2.1.1의 'FA 개방 뒤에도 단기 컵 가능'과 `docs/design/COMPETITION_SYSTEM_REDESIGN_NOTES_2026_10_28.md` 3.1의 **11월 17일 검사 예시**는 여전히 **후속 P-07과 문구 충돌/구형 수용 기준**이므로 최종 HEAD 검사에서 반드시 교정해야 함. 현재 PR에 다른 구현 내용까지 전부 성공했다고 오인 금지.
- [PR #326](https://github.com/lkh0802a/LOL-GM/pull/326): 이미 확정된 랭크 파티 규정의 문구 복원. **병합 완료**. 신규 룰북은 병합된 내용 및 이후 명시적 정정과 의미를 대조한다.
- [PR #325](https://github.com/lkh0802a/LOL-GM/pull/325): 새 이사회·경영진 분리 설계. **병합 완료**. 설계 기록 병합을 실제 사무국 엔진 구현 완료로 보지 않는다.
- [PR #263](https://github.com/lkh0802a/LOL-GM/pull/263): 구형 문서 정합화 초안은 **미병합 종료**. 이 PR의 과거 문구를 새 12월 시장·2부 권고·랭크·28일 경기 금지 정본으로 복구하지 않는다.
- [#257](https://github.com/lkh0802a/LOL-GM/issues/257)는 중복 이슈를 만들지 않는 단일 추적 위치.

## 4. Codex/개발자 작업 체크

1. 구형 규정을 발견하면 **상위 승인 링크·대체 범위·효력 시점**을 명시한 다음 관련 문서를 정정한다. 기존 역사·실제 게임 데이터 삭제/소급 개편 금지.
2. 같은 경로를 수정하는 열린 PR(#313/#320/#263 등)의 정확한 HEAD/대상 브랜치/변경 파일을 먼저 읽고 **충돌 PR을 병렬로 늘리지 않는다**.
3. `main`에서 정책을 읽을 때는 해당 규정이 **미병합 명세/미병합 코드**인지 구분한다. 적용은 최종 병합 후 정확 HEAD 기준으로 재검증한다.
4. 코드 수정 뒤 단일 작성자·타임존·효력 시즌/계약·시장 28일 경기 금지·정확한 경기/랭크 결과·수익 원장/등록·동일 시드·세이브 복원/장기 세계·모바일 UI를 함께 시험한다.
5. **설계 일치 / 문서 PR 업로드 / CI PASS / main 병합 / 사용자에게 제공된 게임이 반영됨**은 서로 다른 상태다. 이 문서는 앞의 두 항목을 위한 감사 자료다.
