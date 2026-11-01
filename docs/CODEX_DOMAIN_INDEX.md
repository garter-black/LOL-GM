# LOL-GM Codex — 전 분야 실행 인덱스 (2026-10-17)

**이 문서를 읽는 이유:** 현재 사용자가 승인한 **10개 C안 엔진 고도화/Stage 1–13/게임 전반의 작은 결함·UI·Android**를 빠뜨리지 않고, 이미 구현된 부분은 다시 만들지 않도록 분야별 소유 코드·첫 검증·관련 이슈에 빠르게 도달하기 위함.

## 통합 마스터 명세 — 전체 사용자 여정과 엔진 간 불변식

33개 도메인 상세 계약을 개별로 수정하기 전 **[#242 현재 우선순위](https://github.com/lkh0802a/LOL-GM/issues/242)와 해당 이슈·실제 코드/테스트만 먼저 읽는다.** 복합 도메인 불변식이 필요할 때만 [CODEX_MASTER_BLUEPRINT.md](CODEX_MASTER_BLUEPRINT.md)의 관련 INV/D 절을 검색한다. 매번 마스터 전체 재독은 하지 않는다. 본 문서는 상세 분야 색인이며, 마스터는 **분야 사이의 합법 정보·세계 시각/경기·재정·스토리지 통합 계약**이다.



## 코덱스의 읽기 순서

1. **보통 작업:** [AGENTS.md](../AGENTS.md) → 현재 선택한 이슈 본문·관련 댓글 → 코드와 관련 테스트만 읽는다.
2. **작업 순서/첫 P0 세부사항 확인 시:** [CODEX_EXECUTION.md](CODEX_EXECUTION.md)의 해당 절만 참조한다.
3. **담당 코드·승인 기준 불명확할 때만:** 이 표에서 연관 A/B/C 절을 찾아 읽는다. 다른 도메인에 영향이 있다면 관련 교차 분야도 확인한다.
4. **전역 불변식·설계 충돌 시:** [마스터 명세](CODEX_MASTER_BLUEPRINT.md)의 해당 INV/D 항목과 `DEVELOPMENT.md`·`DECISIONS.md`의 해당 정책만 검색한다.
5. 모든 문서를 매 작업마다 통째로 읽지 않는다. 기존 코드/검증/승인 범위는 줄이지 않는다.

> 문서가 있다고 구현되었다고 주장하지 말 것. 파일 수정 자체는 Codex 실행/CI/배포가 아니다. 기존 C안 모두 승인 유지, P0 결함 보전이 착수 순서상 우선.

## 상세 구현·검증 계약 33개 분야

| 분야 번호 | 구체 기능/수용 | 상세 문서 | 주요 이슈 |
| --- | --- | --- | --- |
| A1 | 새 게임/구단/초기 FA/등록/세이브 슬롯 | [A](CODEX_DOMAIN_A_CLUB.md#a1-새-게임--감독구단-선택--초기-선수단--저장-슬롯) | #241·#244 |
| A2 | 선수 실능력/성장/숙련/신인·닉네임 | [A](CODEX_DOMAIN_A_CLUB.md#a2-선수-데이터--능력--챔피언-숙련--이름신인) | #236·#250 |
| A3 | 의료·휴식/치료·재활·대체등록/공개 | [A](CODEX_DOMAIN_A_CLUB.md#a3-의료--질병--피로--재활--대체-등록) | #236·#248 |
| A4 | 관계/팀워크/역할/감독 경력·권한 | [A](CODEX_DOMAIN_A_CLUB.md#a4-관계--팀워크--역할-약속--선수-불만--감독-커리어) | #236·#239 |
| A5 | 스카우트 관측/지식·오차/AI 분석 | [A](CODEX_DOMAIN_A_CLUB.md#a5-스카우팅--관측-오차--신인-평가--분석실) | #238·#248 |
| A6 | FA·에이전트·제안/역제안·계약·재정 | [A](CODEX_DOMAIN_A_CLUB.md#a6-선수-계약--재계약--fa--이적--에이전트--시간형-협상) | #224·#225 |
| A7 | 임대/리콜·옵션/의무·2군 소유 | [A](CODEX_DOMAIN_A_CLUB.md#a7-임대--옵션의무-매입--리콜--1군2군-이동) | #245·#237 |
| A8 | 구단조직·하부리그/시설·스태프 | [A](CODEX_DOMAIN_A_CLUB.md#a8-구단-조직--2군--시설--스태프--소유권라이선스) | #237·#234 |
| A9 | 회계·임금/분할금·스폰서·AI 투자 | [A](CODEX_DOMAIN_A_CLUB.md#a9-구단-재정--스폰서--방송--지출--회계) | #237·#247 |
| A10 | 스크림/훈련 자원·Bo1 단일 경기 결과 | [A](CODEX_DOMAIN_A_CLUB.md#a10-훈련--스크림--상대-섭외--회복--연습-결과) | **#243** |
| B1 | 챔피언 원본·스킬/아이템/룬·데이터 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b1-챔피언아이템룬소환사-주문패치-원본-데이터) | #233·#232 |
| B2 | 밴픽·Fearless/First Selection·AI 선택 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b2-밴픽fearless--first-selection--조합카운터) | #235 |
| B3 | 실제 경기/스킬·웨이브·전투/경제/종료 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b3-경기-초정밀-전장스킬웨이브캠프전투-인과) | #233 |
| B4 | 경기 전술 AI/시야/가능 행동·Bo 적응 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b4-경기-전술-ai--라인-운영--오브젝트변형-전략) | #235·#238 |
| B5 | 패치 2.0/사전 예고·당일 종료 핫픽스 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b5-패치-20--메타진단--글로벌-밴--팀별-적응) | #232 |
| B6 | 공식/스크림 Bo·당시 기록/리플레이 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b6-bo-시리즈--스크림공식-대회--경기-기록--리플레이) | #243·#249 |
| B7 | 하나의 세계 시계·중계/이적/훈련 시간 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b7-세계-시계--달력--훈련이적중계-점유) | #234·#245 |
| B8 | 지역/국가 2부·라이선스/승강/국제전 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b8-리그-규정--지역국가별-12부--라이선스--승강--국제대회) | #234·#239 |
| B9 | AI 재정/시장/밴픽·실제 정보 공정성 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b9-ai-구단--의사결정-공정성--미래-정보권한-방어) | #235·#237·#248 |
| B10 | 세계 세대교체·뉴스/사건·영구 역사 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b10-장기-세계--뉴스스토리--영구-기록--당시-스냅샷) | #239·#249 |
| B11 | 경기/계약/대회/AI 교차 통합 시나리오 | [B](CODEX_DOMAIN_B_MATCH_WORLD.md#b11-승인된-복합-시나리오-체크) | #241 |
| C1 | 모바일 상단 메뉴/홈·실제 업무 알림 | [C](CODEX_DOMAIN_C_UI_QA.md#c1-제품-내비게이션--홈--구단-상태업무함) | #225·#241 |
| C2 | 선수/시장/스카우팅/회계 화면 실사용 | [C](CODEX_DOMAIN_C_UI_QA.md#c2-선수로스터스카우팅이적시장코칭-화면) | #224·#225·#247 |
| C3 | 경기/시리즈/대회·분석실 상세 화면 | [C](CODEX_DOMAIN_C_UI_QA.md#c3-공식-경기--밴픽--스크림--분석실통계--대회-화면) | **#243**·#235 |
| C4 | 모바일 디자인/접근성·모달/스크롤 | [C](CODEX_DOMAIN_C_UI_QA.md#c4-디자인-시스템--접근성--입력취소--좁은-화면) | #225·#240 |
| C5 | IndexedDB/슬롯10/오프라인 저장·복원 | [C](CODEX_DOMAIN_C_UI_QA.md#c5-저장-슬롯--세계-직렬화--중단복원--데이터-버전) | **#244** |
| C6 | 성능·메모리/배터리·전체 world 복사 | [C](CODEX_DOMAIN_C_UI_QA.md#c6-성능--메모리--전력--장기-데이터--정확한-계산) | #247·#240 |
| C7 | actor 권한/미리보기 순수성·원자적 롤백 | [C](CODEX_DOMAIN_C_UI_QA.md#c7-정보보호--내부-권한--액션-원자성--반복-실행) | #241·#248 |
| C8 | 빌드/정적 검사/CI·Pages 배포 | [C](CODEX_DOMAIN_C_UI_QA.md#c8-빌드정적-검사ci배포의-실제-게이트) | #241 |
| C9 | 모바일 HTML 후 Android APK/실기기 | [C](CODEX_DOMAIN_C_UI_QA.md#c9-android-네이티브-배포--오프라인-웹-마일스톤) | #240 |
| C10 | 통합 사용자 시나리오·회귀 매트릭스 | [C](CODEX_DOMAIN_C_UI_QA.md#c10-통합-사용자-시나리오--품질-매트릭스) | #241 |
| C11 | PR 구현·원인/테스트/커밋 보고 | [C](CODEX_DOMAIN_C_UI_QA.md#c11-코덱스-pr-완료-보고서-복사해서-채울-형식) | #242·#241 |
| C12 | 허위 완료 선언/재작성·데이터 삭제 금지 | [C](CODEX_DOMAIN_C_UI_QA.md#c12-금지하는-완료-선언과-작업-방식) | 전 이슈 |

*각 세부 링크는 GitHub 마크다운의 제목 자동 앵커를 사용하므로 환경에 따라 정확한 앵커는 바뀔 수 있다. 링크가 열리지 않으면 파일 상단의 A1~C12 제목 검색 사용.*

## 구체적인 실행 지시와 필수 리그/패치 정책

- **완료/과거 #243:** Bo1 스크림 단일 실행 [PR #259](https://github.com/lkh0802a/LOL-GM/pull/259) 병합. 원래 반례/원본은 [CODEX_EXECUTION.md §3](CODEX_EXECUTION.md)의 역사적 검증으로 참고할 수 있으나 문제 재발 없이 새로 착수하지 않는다.
- **완료/과거 #244·#245:** 저장·복구 [PR #260](https://github.com/lkh0802a/LOL-GM/pull/260), AI 임대 실제 7일 [PR #261](https://github.com/lkh0802a/LOL-GM/pull/261) 병합. 완료 이슈를 정규 개발 큐에서 재착수하지 않는다.
- **현재 우선순위 정본:** [#242 맨 위](https://github.com/lkh0802a/LOL-GM/issues/242). 2026-10-18 스냅샷: [#246/PR #262](https://github.com/lkh0802a/LOL-GM/pull/262) CI 성공·미병합 리뷰 → #248 → #249 → **[#252 월즈 ID/상금·세이브 P1-04B](https://github.com/lkh0802a/LOL-GM/issues/252)** → #247 → #234 → #224 → #225 → 기존 P2 #250→#233→#232→#235→#236→#237→#238→#239→#240. #241 검증 상시, 완료 #243/#244/#245/#255 제외. 이후 실제 상태가 바뀌면 #242·이슈/PR HEAD/CI가 이 문장의 번호보다 우선한다.
- **리그:** 확정 게임상의 가상 1부 LCK/LPL/LEC/LCS/LCP/LSA와 2부 LKC/LDL/LEA/LNA/LPA/LSC. 지역 1부/국가별 2부 발전/소유 2군/독립 2부·로컬 자격/역사 보존.
- **패치:** 근거 있는 순수 밸런스 핫픽스만 당일 **모든 공식 경기 종료 후** 적용하고, 버그성 임시 글로벌 프로 밴·기술 사고 이벤트는 생성하지 않음. Fearless·기존 대회 patch 잠금 보존.
- **계약:** 일반 2–8게임시간/경쟁 24–72게임시간·합법 즉시 수락 예외, 합의와 감독의 명시적 최종 서명은 다른 상태, AI도 합법 시장/예산·정보.
- **제외:** 직원/감독의 별도 인수인계 시스템·무분별한 신규 현실 대회 규정·근거 없는 스킬/아이템/룬 수치·승률/AI 강제 보정.
- **최종 사용자 플랫폼:** 모바일 오프라인 HTML 완성/실사용 후 Android 릴리스 앱. 100시즌·실기기/TalkBack 최종 QA는 전체 기능 연결·사용자 시험 이후.

## 소스·테스트를 찾는 방법

1. 소유 모듈 전수: `scripts/artifact-modules.mjs` (ENGINE_MODULES 102 / UI_MODULES 70); 소스는 `src/artifact/`.
2. 테스트 스크립트: `package.json` `scripts`와 `scripts/*-acceptance.mjs`. 찾고 싶은 모듈/actor/명령 문자열로 좁게 검색한 뒤 적어도 **하나의 실제 happy case + 권한/동시성/실패/저장·시드 반례**를 실행.
3. 경기: `match-ending-acceptance`, `item-purchase-ledger-acceptance`, `combat-resource-acceptance`, `objective-steal-acceptance`; 스크림: `scrim-plans-acceptance`, `cohesion-practice-acceptance`; 시장: `contract-negotiation-state-acceptance`, `transfer-stage-acceptance`, `player-loan-acceptance`; 등록: `registration-acceptance`; 관측: `scouting-depth/operations/reassessment-acceptance`; 역사: `season-history-compaction-acceptance`, `match-history-acceptance`; 모바일/저장: `ui-mobile-a11y`, `ui-async`, `save-history` acceptance.
4. 필요한 경우 `npm run build`, `npm run check` 및 정확한 최종 head 필수 CI/배포 증거. **이슈 작성/문서만으로 PASS 표시하지 않는다.**

## 보고와 종료

개별 이슈마다 **이전에 있던 기능 / 원본 직접 확인된 결함 / 실제 재현 / 수정한 단일 writer/consumer / 집중 테스트 / 인접 회귀 / 최종 head·CI / PR·배포 증거 / 미완 사항**을 기록. 수직 작업이 완결된 경우에만 해당 이슈 종료. 신규 C안 상위 이슈는 작은 수정 PR 하나로 모두 완료 처리하지 않는다.
