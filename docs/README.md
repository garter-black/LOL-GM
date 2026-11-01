## 현재 개발 진입점 — 2026-10-27

[최신 AGENTS](../AGENTS.md) → [살아 있는 #242 백로그](https://github.com/lkh0802a/LOL-GM/issues/242)·실제 이슈/PR 체크포인트 → 관련 코드/테스트 순서로 복원한다. 아래 날짜별 고정 첫 작업은 역사 기록이다. 신규 기능과 개선을 함께 평가하며 초기에는 검증/PR까지만 자동 처리하고 병합은 사람 검토를 따른다. 정치·파벌·권력투쟁 시스템은 개발하지 않는다.

| 지식 목적 | 기존 정본 |
| --- | --- |
| 제품 비전·핵심 루프 / 확정 디자인 | CODEX_MASTER_BLUEPRINT §1 / DECISIONS·개별 이슈 최신 확정 |
| 구조·소유 코드 | ARCHITECTURE / CODEX_DOMAIN_INDEX 및 A·B·C 상세 |
| 로드맵·백로그 | #242 / 각 소유 이슈, DEVELOPMENT |
| 현재 상태·중단 복원 | 개별 PR/이슈의 정확 HEAD CODEX-CHECKPOINT |
| 업데이트 후보·실제 적용 | [CHANGELOG](../CHANGELOG.md)와 정확 CI/Pages 근거 |
| 자동 개발·위험/유지보수·관리자 설정 | [CODEX_AUTOMATION_5H §8](CODEX_AUTOMATION_5H.md#8-지속-개발과-유지보수--2026-10-27) |

동일 목적의 새 문서 10개를 복제하지 않는다. 운영 파일의 과거5시간 명칭은 링크 보존용이며 최신 실제 Codex 예약은 매일08:00 서울로 갱신했다. 주간/분기 Actions는 PR 구성과 main 적용/실행을 구분한다.

---

## 2026-10-21 #234 공통 시간·기존 PR230 연결 (구현 중)

최신 기준은 main `eb228b7`의 AGENTS.md/CODEX_AUTOMATION_5H.md, [#242 최신 실제 순서](https://github.com/lkh0802a/LOL-GM/issues/242)와 #241이다. #247은 [정확 PR/main 검증·기존 Pages 근거](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6309294470)로 종료했다. 기존 PR230의 시간 writer와 후속 PR231 공개 보강을 현재 엔진·수동 결정·저장에 재사용 연결하며 아직 새 최종 HEAD 수용 전이다. 아래 고정 번호·시간 목표·게시 상태는 해당 날짜의 원문이고 현재 예약/실행 상한/완료 상태를 뜻하지 않는다. 기존 예약 하나/같은 Codex/동시 개발 하나, 임의 실행 상한 없이 실제 플랫폼 한도를 지킨다.

## 전체 게임 통합 마스터 명세 — Codex 읽기 시작점

> 과거 안내 원문(현재 AGENTS/자동화 지침으로 대체): **코덱스 예약 운영 기준:** [CODEX_AUTOMATION_5H.md](CODEX_AUTOMATION_5H.md)에서 5시간 사용량 창 기준 예약 간격(가능하면 5h10m), 회당 작업 목표90분, 예약 설정을 수정할 때 사용할 명령, 차선 6시간 정각/주간 한도·중복 실행 방지 조건을 확인한다. 저장소 문서 작성만으로 기존 예약 실행 시각이 변경되지 않는다.

**[CODEX_MASTER_BLUEPRINT.md — LOL-GM 통합 개발 마스터 명세](CODEX_MASTER_BLUEPRINT.md)**는 새 게임→계약/선수→훈련·경기→리그/이적·패치→장기 역사·저장→모바일/Android로 이어지는 핵심 사용자 여정, **22개 엔진 간 불변식**, 10개 확정 C안 엔진 목표, 16개 도메인 수직 개발/검증 계약, UI·소스 writer/consumer·경제/정보·시드·시간 제약, QA/CI/배포·코덱스 보고 템플릿을 제공한다.

우선순위는 별도 [CODEX_EXECUTION.md](CODEX_EXECUTION.md)/[#242](https://github.com/lkh0802a/LOL-GM/issues/242)에 따라 **#243 → #244 → P1 → P2**, #241은 상시 통합 수용. 아래 33개 상세 문서는 이 마스터 명세의 영역별 심층 정의이며 기존 개발 계획/역사·승인 사항을 대체하지 않는다. 문서 작성 자체는 게임 코드 구현/검증 아님.

---



## 코덱스 전 분야 상세 계약 — 33개 세부 영역

[**전체 분야 인덱스**](CODEX_DOMAIN_INDEX.md)에서 A1–A10, B1–B11, C1–C12의 개발 소유 코드/상세 기준/테스트·담당 이슈를 찾아갈 수 있다.

- [A. 새 게임·선수·의료·스카우팅·계약/임대·2군/스태프·재정·훈련/스크림](CODEX_DOMAIN_A_CLUB.md)
- [B. 챔피언/아이템·밴픽/전술·경기/패치·대회/일정·AI·역사/뉴스](CODEX_DOMAIN_B_MATCH_WORLD.md)
- [C. 모바일 홈/선수/시장·공식 경기 UI·접근성/저장·메모리/권한/CI·Android](CODEX_DOMAIN_C_UI_QA.md)

코덱스 기본 실행 계약은 [루트 AGENTS.md](../AGENTS.md), [우선순위 실행 지침](CODEX_EXECUTION.md), [#242 최우선 P0 작업표](https://github.com/lkh0802a/LOL-GM/issues/242). 세부 문서의 모든 계약은 **이미 승인된 1–13단계/10개 C안의 심화 구현·검증 기준**이며 33개 신규 이슈나 즉시 전체 구현을 뜻하지 않는다. 게임 코드/테스트/배포는 별도로 작업해야 한다.

---

## Codex implementation entrypoint

Codex/구현 에이전트는 저장소 루트 [AGENTS.md](../AGENTS.md) → [단계별 작업 실행 지침 CODEX_EXECUTION.md](CODEX_EXECUTION.md) → [#242 우선순위 인덱스](https://github.com/lkh0802a/LOL-GM/issues/242) → 대상 이슈의 본문/댓글을 순서대로 확인한다. 실제 첫 수정은 **[#243 Bo1 스크림 단일 계산](https://github.com/lkh0802a/LOL-GM/issues/243)**, 다음은 **[#244 저장/복원 안정성](https://github.com/lkh0802a/LOL-GM/issues/244)**. #241은 모든 작업의 통합 수용 게이트다. 코드/테스트/PR·CI 증거 없이 이슈·문서 등록만으로 완료 처리하지 않는다.

---

## 2026-10-17 열린 이슈 21건 우선순위별 실행 큐

**GitHub P0/P1/P2 라벨과 제목 순번 전부 적용.** 이슈 단순 번호순이 아니라 [#242 최우선 전체 작업표](https://github.com/lkh0802a/LOL-GM/issues/242)의 순번을 개발 착수 기준으로 사용한다. **P0:** #242 총괄 → #243 Bo1 중복 계산(첫 수정) → #244 저장/복원, #241 상시 통합 검증. **P1:** #245 → #246 → #248 → #249 → #247 → #234 → #224 → #225. **P2:** #250 → #233 → #232 → #235 → #236 → #237 → #238 → #239 → #240. 기존 상세 범위·완료 이력·C안 엔진 목표 유지.

우선순위별 GitHub 필터: [P0 최우선](https://github.com/lkh0802a/LOL-GM/issues?q=is%3Aissue+is%3Aopen+label%3A%22priority%3AP0%22) · [P1 핵심 수정](https://github.com/lkh0802a/LOL-GM/issues?q=is%3Aissue+is%3Aopen+label%3A%22priority%3AP1%22) · [P2 후속 개발](https://github.com/lkh0802a/LOL-GM/issues?q=is%3Aissue+is%3Aopen+label%3A%22priority%3AP2%22). GitHub 기본 목록은 우선순위순 자동 정렬을 보장하지 않으므로 [DEVELOPMENT.md](DEVELOPMENT.md)의 순위표와 제목 접두사 참조. 이는 **이슈 정리**이며 게임 코드 수정·출시 완료가 아니다.

---

## 2026-10-17 최우선 — 게임 전체 전수조사 후속 개선

게임 엔진 **102개 + UI 모듈 70개** 소스 감사를 기반으로 사용자가 **[#242 P0 최우선 전체 후속 개선](https://github.com/lkh0802a/LOL-GM/issues/242)**을 승인. 새 C안 깊이 개발 전에 실제 결함·저장/정보·권한·장기 역사/모바일 성능을 먼저 검증·교정한다. 세부 작업: [#243 Bo1 기록/화면](https://github.com/lkh0802a/LOL-GM/issues/243), [#244 저장·백그라운드](https://github.com/lkh0802a/LOL-GM/issues/244), [#245 AI 임대 날짜](https://github.com/lkh0802a/LOL-GM/issues/245), [#246 RNG 안정성](https://github.com/lkh0802a/LOL-GM/issues/246), [#248 정보 경계](https://github.com/lkh0802a/LOL-GM/issues/248), [#249 역사·리플레이](https://github.com/lkh0802a/LOL-GM/issues/249), [#247 UI 세계 복사](https://github.com/lkh0802a/LOL-GM/issues/247), [#250 닉네임](https://github.com/lkh0802a/LOL-GM/issues/250).

[최신 우선순위/검증 계약](DEVELOPMENT.md) · [사용자 확정 결정](DECISIONS.md). 기존 C안 이슈 #224·#225·#232·#233–#241과 단계1–13 전체 계획은 **유지**한다. 이슈/문서 등록 자체는 수정·CI 통과·게시 완료가 아니다.

---

## 2026-10-17 C안 엔진 고도화 — 신규 추적 이슈 등록

사용자는 **경기·이적시장 시간·대회 일정·전술 AI·선수 커리어·구단 경영·스카우팅·장기 세계/저장·모바일 고성능·전 엔진 실사용 검증**의 10개 방향에서 모두 C안을 확정했다. 등록한 신규 이슈는 **[#233 경기](https://github.com/lkh0802a/LOL-GM/issues/233) · [#234 시간·일정](https://github.com/lkh0802a/LOL-GM/issues/234) · [#235 전략 AI](https://github.com/lkh0802a/LOL-GM/issues/235) · [#236 선수](https://github.com/lkh0802a/LOL-GM/issues/236) · [#237 경영](https://github.com/lkh0802a/LOL-GM/issues/237) · [#238 스카우팅](https://github.com/lkh0802a/LOL-GM/issues/238) · [#239 역사·저장](https://github.com/lkh0802a/LOL-GM/issues/239) · [#240 성능](https://github.com/lkh0802a/LOL-GM/issues/240) · [#241 전체 검증](https://github.com/lkh0802a/LOL-GM/issues/241)**이다.

기존 **[#224 시간형 협상](https://github.com/lkh0802a/LOL-GM/issues/224) · [#225 모바일 시장](https://github.com/lkh0802a/LOL-GM/issues/225) · [#232 패치 2.0](https://github.com/lkh0802a/LOL-GM/issues/232)**은 보강 코멘트로 연결했고 원래 세부 규칙은 유지한다. [개발 지침 C안 통합 등록표](DEVELOPMENT.md)와 [최신 확정 결정](DECISIONS.md)을 우선 읽는다. 기존 단계1–13/경기38+감사8·전체 승인 범위를 보존하며, **등록은 구현·검증·게시 완료가 아니다.**

<details>
<summary>2026-10-13~14 PR230 당시 원문·실패/미완료 기록 (보존)</summary>

## 최신 실제 중계 소비 연결 — 2026-10-14

[개발 지침12.5.4.12.14](DEVELOPMENT.md)의 앞 시리즈 실제 종료→다음 시작 순연을 기존 사건 소비·원래 편성/실제 시작 저장·현재 수동 준비/연락·화면에 연결 중입니다. 국제 공통 중계의 격리된 기존 생성 사례에서12:00 준비가 실제 앞 경기 종료12:44:42를 기다리며, 전체 대회 기간/장소 작성자·자동 운영/판매 구단과 전체 승인은 남습니다. PR230은 초안·미병합이며 게시PR229/main과 아래 전체 원문·승인·실패·증거를 보존합니다. 정확한 새 최종 검증 전 출시로 표시하지 않습니다.

---

## 자정을 넘긴 공식 경기의 날짜 소비 교정 — 2026-10-14

[개발 지침12.5.4.12.13](DEVELOPMENT.md)의 기존 UTC23시 경기 반례에서 시작한 게임의 결과를 보존하며 자정의 기존 일일 처리·실제 연락·수동 최종 계약·저장·화면을 연결 중입니다. 원래 편성 날짜는 유지합니다. 새 최종 필수 검사/의료7과 전체 의미상 수용 전 초안·미병합이며 게시 게임은PR229/main입니다. 아래 전체 승인/원문/실패·미확인 경계를 보존합니다.

## 진행 게임의 저장 비용 교정 — 2026-10-14

PR230의 실제 진행 저장에서 반복 객체 직렬화 비용을 확인해 같은 객체를 한 번 저장하고 전체 값을 복원하는 방식으로 교정 중입니다. 같은 실제 시작 사례의 진행 기록은19,503,912→1,960,796바이트, 전체 저장은21,857,424→4,314,308바이트이며 전체 게임 값/복원한 전체 저장 상태가 같습니다. 이전 진행 저장·현재 권한·실제 저장 쓰기/불러오기·수동 최종 계약·명시적 종료·원래 결과/시드·실패 복구와1280/320 화면을 검사합니다. 전체 경력 속도/운영 저장 용량 검증은 아닙니다. 단일 개발 지침12.5.4.12.12와 아래 전체 원문·승인·실패·증거를 보존하며 새 최종 검사/의료7/종합과 의미상 수용 전 초안·미병합/게시PR229main을 유지합니다.

## 진행 중 수동 게임의 이른 연락 연결 — 2026-10-14

PR230에서 제출한 시작 입력과 진행 게임을 별도 저장하고, 게임 종료보다 먼저 도착한 선수 연락에서 실제 결과를 미리 기록하지 않고 중단하는 연결을 교정 중입니다. 실제08:29:38/0게임 연락 저장·복원·수동 최종 계약·명시적08:29:39 넥서스 종료·현재 권한/손상 입력 거절과1280/320 화면을 확인했습니다. 원래 게임 결과·시드·계약 작성자/수동 권한·전체 단계1–13/모든 승인·이전 원문/실패/증거는 보존합니다. 정확한 새 최종의 전체 검사·의료7·종합 판정과 의미상 수용 전 초안·미병합이며 자정 날짜 소비/중계 자원·초과 순연/자동 운영·판매 구단과 전체 승인은 남습니다. 게시 게임은PR229/main 그대로입니다. 상세 범위·한계는 단일 개발 지침12.5.4.12.11에 연결합니다.

## 수동 게임 종료·세계 사건 연결의 현재 경계 — 2026-10-13

[단일 개발 지침12.5.4.12.10](DEVELOPMENT.md#12541210-수동-게임-종료와-세계-사건연락의-연결--2026-10-13-교정-중)에 기존 단계1–13 전체 원문과 함께 연결한다. 수동 게임의 실제 종료보다 앞선 다른 경기 시작은 당시 완료 관측만 읽고, 완료 게임 뒤 선수 연락은 검토와 다음 수동 준비를 분리한다. 실제 게임 중 연락·자정 하루 소비·중계 자원/초과 순연 및 전체 승인은 계속 미완료다. PR230은 초안·미병합이며 게시 게임은PR229/main 기준이다. 직전b1의 전체 필수/의료7/한 시즌 정상 종료는 당시 증거이며 새 수동 코드로 승계하지 않는다.

## 실제 경기 준비의 측정 교정 — 2026-10-13

[개발 지침12.5.4.12.9](DEVELOPMENT.md)의 실제 진행 복사·되돌리기 비용을 교정 중입니다. 같은 실제 경기일의 제한된 세 쌍은 전체 상태/결과가 같고 중앙값4.73초→2.11초였으며, 느려진 첫 시도·기존 일일 경력 취소/최종 판정 실패도 보존합니다. 전체 한 시즌/정확한 새 최종 필수 검사·의료7·종합 판정은 별도 확인합니다. 수동 경기 중 시간/연락·자정/순연·전체 승인은 미완료이며PR230은 초안·미병합, 게시 게임은PR229입니다. 아래 전체 지침·승인·실패·증거/원문을 연속 보존합니다.

---

## 세계 전체 경기 사건 순서 — 2026-10-13

[개발 지침12.5.4.12.8](DEVELOPMENT.md)의 다른 경기 시작·게임별 실제 종료·판단 연락을 세계 전체 시각 순서로 연결 중입니다. 저장의 대회 속성 순서만 바꿔도 종료 기록과 동일 시드 결과가 달라지던 반례를 교정하고, 시작 때 아직 끝나지 않은 경기의 관측을 읽지 않도록 검사합니다. 저장·권한·실패 복구·기존 작성자·실제 화면을 함께 수용합니다. 수동 경기 중 연락 인계·자정 날짜 소비·중계 실제 초과 순연·자동 운영/판매 구단 응답·전체 승인은 미완료이며PR230은 초안·미병합, 게시 게임은PR229/main을 유지합니다. 아래 전체 원문·증거·실패를 연속 보존합니다.

---

## 최신 실제 게임 종료 경계 — 2026-10-13

[개발 지침12.5.4.12.7](DEVELOPMENT.md)의 이미 시작한 다른 경기와 판단 연락을 게임별 종료 경계로 연결 중입니다. 예정08:29:39 연락이09:06:58/2게임 뒤 처리되던 격리된 재현은 첫 종료08:29:39/1게임에서 멈추도록 교정합니다. 진행 게임/세션의 실제 저장·현재 권한·수동 계약 보존·기존 작성자 결과 동일성·화면 문맥을 집중 검사합니다. 모든 중계 종료의 세계 전체 순서·자정 하루 소비/순연·자동 운영/판매 구단 응답·전체 승인은 아직 미완료이며 PR230은 초안·미병합, 게시 게임은 PR229/main을 유지합니다. 약50분은 예상 묶음이며 대기/문서/병합·성능 개선·추가 여력/초기화로 계산하지 않습니다. 아래 전체 원문과 이전 실패/증거를 보존합니다.

---

## 경기와 판단 연락의 작성 순서 — 2026-10-13

[개발 지침12.5.4.12.6](DEVELOPMENT.md)의 수동 준비/연락 뒤에 시작할 경기 결과·효과를 앞당겨 작성하지 않는 경계를 PR230에서 교정 중입니다. 같은 날짜 재개·실제 저장·기존 작성자·연락 중단을 함께 확인합니다. 겹친 경기의 종료 사건·자정 소비·전체 순연은 미완료여서 초안·미병합이며 게시 기준은 PR229입니다. 아래 전체 지침·증거·실패를 보존합니다.

---

## 공식 경기 시간 교정 — 2026-10-13

[개발 지침12.5.4.12.5](DEVELOPMENT.md)의 실제 경기 시간 작성/저장과 협상 시계 되감기 방지를 PR230에서 교정 중입니다. 초안·미병합이며 날짜 소비·다른 경기와 연락의 순서·초과 순연은 미완료입니다. 게시 기준은 PR229입니다. 기존 전체 지침·실패·증거와 아래 원문을 유지합니다.

---

## 최신 시간 응답 구현 — 2026-10-13

PR229/maina4241b9의 합의·수동 최종 계약 출시는 기존 증거와 한계를 따른다. 승인된 응답2–8시간/고민·경쟁24–72시간과 실제 연락 중단·저장·마감 연결은 [단일 개발 지침12.5.4.12.4](DEVELOPMENT.md)의 별도 브랜치에서 구현·검증 중이며 출시 전이다. 전체 단계1–13/모든 승인·수용·실패·증거 및 약50분 연결 구현 기준을 유지한다. 아래 원래 기록은 당시 상태로 연속 보존한다.

</details>

---

## 최신 구현 경계 — 2026-10-13

[개발 지침12.5.4.12.3](DEVELOPMENT.md)의 실제 수락→합의 저장→별도 수동 최종 계약 연결을 구현·검증 중입니다. 기존 선수 판정과 가격/계약 작성자는 유지하며 응답 시각/시간 진행은 후속입니다. 최신 기준main8fa903c5(PR228 문서 출시)와 게임 동작PR227을 구분하고 아래 전체 원문을 보존합니다. 필수 검사/의료7·병합·결과main/게시 전 출시로 표시하지 않습니다.

---

## 최신 전체 진행 상태 — 2026-10-12

**최우선 개발 기준:** [모든 승인 기능의 실제 연결 완결](DEVELOPMENT.md#integration-first-priority-2026-10-12). 이름·안내·설정·표시만으로 완료 처리하지 않고, 규칙/권한→수동 결정→실제 상태와 시간/경기/재정 소비→당시 기록/저장 복원→화면까지 검증합니다. 실제 진행·저장·권한 및 경기 판정 결함부터 교정하고 기존 전체 승인 범위를 유지합니다.

[단계1–13 전체 남은 작업·현재 출시·다음 구현·최적화 기준](DEVELOPMENT.md#current-status-2026-10-12)을 먼저 읽습니다. 단일 개발 지침은 docs/DEVELOPMENT.md이며 아래 원래 문서/출시 기록은 작성 당시 상태로 보존합니다. 전체 승인 목록과 실패·증거·수용 조건을 대체하지 않습니다.

현재 검증된 게임 출시는 PR227/main7622a625de58c9baf46becd0a400607152ba14d7입니다. 첫 영입 표·저장된 게임 목록/시작 복원·결산 전 날짜 진행·제안 검토/실제 역제안 기록은 부분 출시됐습니다. 시간 단위 이적시장 응답·별도 최종 계약, 전체 경기 엔진38항목/감사8항목, 국가별2부·업무 언어/재정·감독 경력·전체 화면·분석실/레이더·13서사와 최종 수용은 남아 있습니다.

사용자는 날짜·시각이 흐르며 다음 연락/일정에서 멈추는 영입을 요청했습니다. 첫 영입부터 선수별 즉시 수락/몇 시간 뒤 답변/고민·경쟁 시 며칠 지연과 판단할 답변·역제안마다 중단하는 방식을 승인했고, 시장은 기존 개막 전에 수동 마감하는 방향입니다. 응답 소요 시간·마감 시각의 구체적인 값은 임의로 만들지 않습니다. 이번 정리는 문서 탐색/최신화이며 새 게임 기능이나 실행 성능 최적화 완료가 아닙니다.

일정 진행표의 날짜는 독립 디자인 시안이며 실제 게임 일정은 변경하지 않았습니다. 기존 일정 엔진의 같은 리그/공통 중계 순차 편성·실제 경기 초과 순연을 포함한 전체 분야 보강은 개발 지침10.3·12.4의 최신 연결 목록을 따릅니다. 전체 보강은 구현/수용/출시 전입니다.

[2026-10-12 전 항목 보강 승인과 기존 담당 작업](DEVELOPMENT.md#approved-refinements-2026-10-12)에 직전 전체 보강16분야를 모두 연결했습니다. 분야별 구분이며 새 기능 수나 완료율이 아닙니다. 원래 전체 승인과 실제 구현/검증/출시 경계를 유지합니다.

화면 미관·실제 상태 연결과 나머지 일곱 분야 보강을 모두 승인받았으며, 하부리그는 1부당 하나의 고정 연결로 가정하지 않습니다. 복수 권역/하부리그·하부리그 없음·별도 육성/승격 경로의 실제 자료와 자격·편성·저장 연결은 개발 지침의 추가 명시를 따릅니다. 구현 완료 선언은 아닙니다.

전 분야 검수·합리적 교정·명목 기능의 실제 효과 연결도 승인됐습니다. 개발 지침의 전 분야 실체화 수용표에서 규칙/권한→수동 결정→상태 작성→날짜/경기 소비→역사/저장→화면을 확인합니다. 시작·계약·재정·대여·직원·훈련·분석·화면 집중12개 검사는 정상 종료했지만 전체 검사/의료7/기능 완료 증거는 아닙니다. 실제 성능 최적화는 측정 전후 결과가 있는 범위만 인정합니다.

---

# Documentation navigation

## Active entry points

| Purpose | Document |
| --- | --- |
| Current priorities, continuation and validation | [DEVELOPMENT](DEVELOPMENT.md) |
| Full game design | [LOL_GM_SPEC](LOL_GM_SPEC.md) |
| Settled decisions and later overrides | [DECISIONS](DECISIONS.md) |
| Source-backed depth gaps; dated evidence needs current-code review | [RETROACTIVE_DEPTH_AUDIT_1_11](RETROACTIVE_DEPTH_AUDIT_1_11.md) |
| Code ownership and build | [ARCHITECTURE](ARCHITECTURE.md), [artifact modules](../src/artifact/README.md) |
| Professional-only calibration and static champion sources | [CHAMPION_DATA](CHAMPION_DATA.md) |
| Item/rune baseline | [SYSTEM_DATA](SYSTEM_DATA.md) |
| CI interpretation | [CI_RESULTS](CI_RESULTS.md) |
| HTML first, Android later | [ANDROID_TARGET](ANDROID_TARGET.md) |

## Confirmed domain rules

[Player relationships/contracts](PLAYER_RELATION_CONTRACT_RULES.md),
[rosters/transfers/local status](ROSTER_TRANSFER_LOCAL_RULES.md),
[staff](STAFF_RULES.md), [international offices](INTERNATIONAL_OFFICE_RULES.md),
[governance/restructuring](GOVERNANCE_RESTRUCTURE_RULES.md).
Use current decisions and explicit user overrides if a dated rule conflicts.

## Historical and focused records

[Retained implementation evidence](archive/DEVELOPMENT_HISTORY_2026_10_03.md)
contains still-relevant delivery, decisions, failures and measurements.
Dated focused acceptance records live in archive/phase-records. Obsolete migration
handoffs, migration checklist and first-core planning documents are deleted;
duplicate old workflow/planning prose is removed from the history. Retain history
only where it explains current behavior, compatibility or a reproducible regression.
Do not treat historical next-work instructions as the active plan.

## Unified stage hierarchy

Use [numeric stages 1–13 and dotted work units](DEVELOPMENT.md#unified-numeric-roadmap) for current tasks. Phase records now live in archive/phase-records; current guidance remains here.

[8.1.1 넥서스 종료 결함의 원본·교정 비교](evidence/match-end-original-series.json)는 가상 엔진 재현 자료이며 프로 경기 보정 데이터가 아닙니다. 현재 상태·한계·후속은 DEVELOPMENT의 8.1.1을 따릅니다.

[전체 엔진 판정·검증 목록과 실제 구매 장부/시작 화면 후속](DEVELOPMENT.md#821-실제-구매-장부원자적-조합기록-연결--2026-10-04)은 현재 개발 가이드에 통합되어 있습니다. 등록/구현/검증/출시 상태를 구분합니다.

[영입·언어 복원·FM 참고·지역 후보·세부 아이디어 전체](DEVELOPMENT.md#recruitment-language-refinements)는 승인/조사/구현 상태와 실제 검증 조건을 함께 기록합니다.

[2026-10-04 전 영역 조사·소스 근거·구현 한계](DEVELOPMENT.md#whole-domain-audit-2026-10-04)는 모든 알려진 도메인의 coverage와 재현/미검증 상태를 구분합니다. 전체 함수 실행·전체 기능 완료 선언이 아닙니다.

[8.2.2 실제 구매 장소·귀환 경로 조사와 자료 제한](DEVELOPMENT.md#822-구매-장소귀환부활-경로의-재현-가능한-조사-경계--2026-10-04)은 재현 도구와 원본 증거를 연결합니다. 구매 위치 구현 완료가 아닙니다.

[8.3.2 실제 공격 장비 소비·현금 전투력 제거](DEVELOPMENT.md#832-실제-보유-공격-장비와-미사용-골드-소비-교정--2026-10-04)는 원본/교정 사건·실패·AP/AS/crit proxy 한계와 다음 경험치 단위를 연결합니다.

[8.4.1 남은 체력·유효 피해와 공식 기록](DEVELOPMENT.md#841-교전의-남은-체력유효-피해-보존--2026-10-04)은 실제 재현·공통 writer·복기/저장 및 웨이브 source 부족과 후속 경계를 구분합니다.

[8.6.1 실제 획득·참여·퀘스트와 당시 기록](DEVELOPMENT.md#861-실제-오브젝트-획득의-참여보상퀘스트-공통-경로--2026-10-04)은 두 바론 경로의 실제 재현·공통 작성자·복기/저장과 아직 미완료인 이동/보상 metadata를 연결합니다.

[8.4.2 실제 처치 지원 보상·중복 방지·당시 지급](DEVELOPMENT.md#842-처치-지원-보상의-대상중복당시-지급-연결--2026-10-04)은 실제 지급 재현과 합성 writer 반례, 반올림 정책 미완료·공식 설명/저장 및 다음 스탯 패치 단위를 구분합니다.

[8.6.2 실제 스틸 실행자와 참여·퀘스트·당시 기록](DEVELOPMENT.md#862-스틸-실행자참여퀘스트당시-기록의-일치--2026-10-04)은 자연 재현, 공통 작성자와 공식 복기/저장, 원본 보존 한계를 연결합니다. 전체 스틸/오브젝트 판정 완료가 아닙니다.

[8.6.3 구조물의 합법 대상·동률 시드 순서](DEVELOPMENT.md#863-구조물-전환의-합법-대상동률-난수-순서--2026-10-04)는 원본 재현·의도적 결과 변화·기존 보상/공식 기록·저장 및 남은 macro 참여자 선택을 연결합니다.

[8.6.4 끊기 실제 참여자·시드 순서와 당시 복기](DEVELOPMENT.md#864-macro-끊기-참여자-선택시드-순서당시-기록--2026-10-04)는 원본 순열/경기와 의도적 결과 변화·공식 저장/한계를 연결합니다.

[8.4.3 준비된 라운드 피해·잘못된 입력 경계](DEVELOPMENT.md#843-준비된-라운드-피해소유생존입력-경계--2026-10-04)는 원본 패킷·기존 라운드 정책·writer 교정·공식 복기/저장과 한계를 연결합니다.

[8.4.4 라인전 HP 비용의 자원 보존](DEVELOPMENT.md#844-라인전-hp-비용자원-보존당시-설명--2026-10-04)은 정상4경기/통제저체력 재현, nonlethal 정책 유지, 공식 설명/저장 및 한계를 연결합니다.

[8.4.5 전투 캐시 입력·측정된 재계산 감소](DEVELOPMENT.md#845-전투-캐시-실제-입력측정된-현금-재계산-제거--2026-10-04)는 실제 writer 감사·원본/교정 동일 결과·공식 저장과 남은 범위를 구분합니다.

[12.5.1 초기 영입의 관측 목록·상세·평가·협상·복귀](DEVELOPMENT.md#1251-최초-영입의-관측-후보-탐색상세기존-명령-연결--2026-10-05-utc-10-04)는 실제 명령/권한/저장 수용과 아직 미완료인 비교·언어·전면 UI를 구분합니다.

[12.5.2 초기 영입 같은 문맥 관측 비교·원자료·행동](DEVELOPMENT.md#1252-초기-영입의-같은-문맥-관측-비교원자료행동--2026-10-05-utc-10-04)은 임시3인 숫자 비교/관측 radar, 실제 source·권한/복귀 수용과 남은 전면 UI를 구분합니다.

[12.5.3 실제 초기 영입 전후·수동 계약 근거](evidence/initial-offer-impact.json)는 private projection과 실제 합의/현재 권한/저장 경계를 검증합니다. 전체 UI·언어·AnalysisRoom 완료는 DEVELOPMENT의 별도 수용 조건을 따릅니다.

[12.3.1 처음 화면·커리어 선택·저장 보존/복원](evidence/startup-career-flow.json)은 실제 세 작업·기존 writer와 오류 경계를 연결합니다. 전체 UI/언어/AnalysisRoom 완료가 아닙니다.

[12.3.2 현재 구단의 실제 일정·수동 협상 브리핑](evidence/club-operational-briefing.json)은 실제 소유·조회·명령·결과·저장 경계를 연결합니다. 전체 등록·재정·UI 완료를 뜻하지 않습니다.

- 12.3.3 소유 구단의 공식 등록·의료 가용·수동 선발과 실제 공식 소비: [수용 증거](evidence/club-registration-briefing.json), [원본 진단](evidence/club-registration-briefing-diagnostics.json), [실행 검사](../scripts/club-eligibility-acceptance.mjs). 전체 등록/의료/재정/UI 완료가 아니다.

- 12.3.4 현재 현금·의무·조건부 예상과 실제 수동 후원/결산: [수용](evidence/club-finance-briefing.json), [원본 진단](evidence/club-finance-briefing-diagnostics.json). 전체 UI·재정·언어 완료가 아니다.

- 12.3.5 관측 직원·수동 고용과 공식 현장 지원: [수용](evidence/club-staff-briefing.json), [원본 진단](evidence/club-staff-briefing-diagnostics.json). 전체 직원/UI/언어 완료가 아니다.

- 12.3.6 현재 소유 의료 가용·수동 휴식/재활·저장 이력과 실제 일일·훈련·스크림·공식 소비: [수용](evidence/club-medical-briefing.json), [원본 진단](evidence/club-medical-briefing-diagnostics.json). 전체 의료/UI/언어 완료가 아니다.

- 12.3.7 소유 선수 계약·옵션·역할 약속과 기존 수동 재계약·실제 공식 사용량: [수용](evidence/club-contract-briefing.json), [원본 진단](evidence/club-contract-briefing-diagnostics.json). 전체 계약/UI/언어 완료가 아니다.

- 12.3.8 현재 훈련·공유 연습 자원과 실제 수동 준비/일일·성장·공식 소비: [수용](evidence/club-practice-briefing.json), [원본 진단](evidence/club-practice-briefing-diagnostics.json), [실행](../scripts/club-practice-acceptance.mjs). 스크림 예약 UI 확대·전체 훈련/언어/UI 완료가 아니다.

- 12.3.9 내 구단 날짜별 스크림 예약·기존 수동 요청/취소와 실제 자원·참가 원자료: [수용](evidence/club-scrim-briefing.json), [원본 진단](evidence/club-scrim-briefing-diagnostics.json), [실행](../scripts/club-scrim-acceptance.mjs). 전체 스크림/훈련/UI/AnalysisRoom/언어 완료가 아니다.

[12.3.10 현재 관심 후보·보고서와 수동 관찰·평가](DEVELOPMENT.md#12310-현재-관심-후보보고서와-수동-관찰내부-평가-연결--2026-10-06)는 실제 source·비용·공개 원자료·저장과 비교 확대의 남은 경계를 기록합니다.

[12.3.11 현재 관심 후보 관측 비교·공개 근거·복귀/저장](evidence/shortlist-comparison-2026-10-08.json)은 시즌 소속 후보의 실제 보고서/권한/표본·수동 행동 경계를 연결한다. 테마·전면 UI·AnalysisRoom·언어/전체 승인 완료는 아니다.

2026-10-08 구현 경계: [12.5.4.4 테마 가독성·새 게임·선택 우선 흐름](DEVELOPMENT.md#12544-테마-가독성새-게임필수-선택-먼저--2026-10-08), [실제 수용/한계](evidence/startup-theme-readability-2026-10-08.json). main f090의 Pages 취소는 게시 성공으로 세지 않는다. 전체 승인 범위는 미완료다.

- 12.5.4.5–12.5.4.6 현재 운영 조건·후보 비교표의 실제 수동 행동/관측/저장 수용과 실패 보존: [증거](evidence/club-current-actions-2026-10-08.json). 원래 안내·전체 승인 범위는 DEVELOPMENT를 따른다.

- 12.5.4.7.1 선수단 후보의20명 페이지·복수 선택·미완료 입력/상세 복귀와 실제 관찰·전향/저장: [수용/원본 진단](evidence/scout-return-context-2026-10-08.json). 정확한 다음12.5.4.8과 전체 승인 미완료는 DEVELOPMENT를 따른다.

- 12.5.4.8.2.1 공식 편집의 시작 문맥·오래된 입력 거절·수동 취소 후 현재 재편집: [원본 반례와 수용](evidence/official-edit-context-2026-10-08.json). 전체 공식 편집 비교표와 입력 복귀는 미완료이며 정확한 출시 상태는 DEVELOPMENT 및 PR 검증 기록을 따른다.


- 12.5.4.8.2.2: 공식 등록·선발·현장 스태프 편집에서 시작 입력/현재 적용/미적용 입력을 표로 비교하고, 거절된 입력을 유지하여 직접 수정하거나 명시 취소 후 현재 상태로 재편집한다. 실제 명령·공식 소비·저장 수용 범위와 원본 실패는 DEVELOPMENT와 official-draft-comparison 증거를 참조한다. 전체 UI/Analysis/언어/엔진 승인 범위의 완료 선언은 아니다.

2026-10-08 공식 시즌 기록 보존·무소속 진행 교정의 현재 구현/수용 경계는 DEVELOPMENT12.5.4.8.3을 따른다. 과거 원문·승인·미완료는 보존하며, 새 정확한 PR/main CI·게시 검증 전 출시 완료로 세지 않는다.

12.5.4.8.4 무소속 공개 시즌 화면·기존 수동 선택/취소·실제 오프시즌 진행의 수용/원본 실패와 정확한 다음 경계는 DEVELOPMENT 및 [증거](evidence/unemployed-season-context-2026-10-08.json)를 따른다. 전체 승인 범위 완료가 아니며 PR209 private 원문 공개 전송 승인은 미해결이다.

- [날짜 진행 권한·수동 중단 증거](evidence/season-progress-authority-2026-10-09.json):12.5.4.8.5 실제 held continuation·완료 일일/공식 기록·저장/키보드 복귀의 집중 수용. 전체 게임 구현 완료가 아니다.

- [12.5.4.8.6 공식 경기 준비 권한·중단/취소·수동 재개](evidence/official-ui-authority-2026-10-09.json): 실제 frame/선택/밴픽/공식 nexus·저장 수용과 원본 실패를 연결한다. exact PR/main 출시 게이트와 전체 승인 미완료는 DEVELOPMENT를 따른다.


2026-10-09 대기 공식 경기 인계: 수동 참가 감독은 준비를 유지하고, 무소속·해임·AI 운영·다른 구단으로 이동한 pending은 기존 AI 공식 writer로 한 세트씩 진행한다. 날짜·일일 효과/완료 기록·저장을 보존하며 missing metadata와 실패는 근거 표시/rollback으로 처리한다. 수용 및 원본·실패 증거는 DEVELOPMENT12.5.4.8.7과 docs/evidence/pending-official-handoff-2026-10-09.json을 참조한다. 전체 UI/엔진 승인 범위 완료와 운영 HTTP 독립 검증은 별개다.

- 운영 홈 첫 UI 재설계 경계·수동 행동/복귀·검증/미완료: [DEVELOPMENT 12.4.1](DEVELOPMENT.md).

- 회귀 검증 반복 비용·원래 검사/새 VM 보존·실패와 출시 경계: DEVELOPMENT11.5.1을 따른다.

선수단 공개 조회·명단 우선 첫 경계의 검토 자료: [12.4.2.1 증거](evidence/squad-overview-2026-10-09.json). 로컬 수용과 exact-head CI/게시 완료를 구분하며, 필터·페이지·표시열과 전체 재설계는 미완료입니다.

[12.4.2.2.1 선수단 표의 복수 포지션·이름 검색/표시 열/20행 페이지·상세 읽기 분리](DEVELOPMENT.md#124221-선수단-표의-복수-필터표시-열20행-페이지와-상세-읽기-분리--2026-10-09)는 실제 기존 관측/수동 명단을 사용한다. 공식 등록·의료 상태의 상세 구분/필터와 전체 UI는 후속 수용이 남았다. 새 PR·main CI/게시 결과는 확인 전 성공으로 표시하지 않는다.

[12.4.2.2.2 선수단 등록·공식 저장/경기뷰 선발·훈련 초안·의료 근거](DEVELOPMENT.md)는 현재 상태/불확실성과 기존 수동 writer를 구분한다. 신규 source-backed 수용과 exact-head CI·main 게시/전체 승인 미완료는 별도로 확인한다.

2026-10-10 UI 후속: 첫 영입 표의 정렬 숫자·큰 버튼을 줄이고 관측 능력 조건과 문맥 이적시장/선수단 구성을 검증 중입니다. 전체 UI는 필요한 정보부터 보여주고 상세·고급 조건은 펼치는 방향으로 이어갑니다. 배포 완료와 전체 승인 범위 완료는 별개이며 `DEVELOPMENT.md`의 전체 기록·수용 조건을 유지합니다.

[12.5.4.10 저장된 게임 목록](evidence/save-library-2026-10-10.json): 구단·시즌 중심 목록, 실제 원본 조회와 기존 불러오기·취소·저장 보존의 집중 수용. 필수 검사·병합·게시와 전체 화면 완료는 별도이며 시작 복원 화면/스토브리그 날짜 진행은 미완료다.

[스토브리그 독점 기간의 실제 날짜·협상·취소/저장 수용 경계](DEVELOPMENT.md#1254111-독점-계약-기간의-실제-하루-진행과-협상-요약--2026-10-10)는 구현과 검사/병합/게시를 구분합니다. 일반 시장의 날짜 진행과 전체 승인 범위는 계속 미완료입니다.

[12.5.4.11.2.1 결산 전 자유계약 하루와 실제 정산/저장](evidence/stove-fa-daily-2026-10-10.json)은 독점 기간 뒤 날짜 소비를 연결합니다. 연간 결산 뒤 시장 단계와 전체 승인 범위는 계속 미완료이며 최종 검사/게시와 구분합니다.

- 12.5.4.10.2 시작 복원 실패/빈 저장 선택의 실제 원본 조회·수동 복원·취소/원본 보존 후속: [현재 개발 지침](DEVELOPMENT.md). 현재 구현·로컬 수용과 필수 검사/출시를 구분한다.


첫 영입의 제안 조건 검토 후 명시적 제출 개선은 개발 지침12.5.4.12.1에서 진행 중이다. 조건 검토·취소·명시적 제출·저장 복원은 로컬 수용을 통과했다. 현재 선수 판정의 즉시 처리와 날짜 대기 협상은 구분하며 필수 검사·출시 전이다.

협상 초기 요구·실제 역제안과 저장된 제안 기록의 화면 개선은 DEVELOPMENT12.5.4.12.2를 따른다. 날짜 응답 규칙 선택·전체 영입 개선·필수 검사/출시는 별도이며 원래 승인 범위를 보존한다.
