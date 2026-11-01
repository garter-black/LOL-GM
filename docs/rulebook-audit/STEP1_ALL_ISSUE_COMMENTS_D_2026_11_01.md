# 1단계 — 이슈 본문·댓글 전체 링크 색인 D

> 원문 댓글 ID 전량 추적. 키워드 태그는 사용자 승인·철회 판정이나 구현 완료 증거가 아니다.

## [#244 [P0-02] [검증 우선] 모바일 저장 지연·백그라운드·강제 종료 무결성 수용](https://github.com/lkh0802a/LOL-GM/issues/244)

본문 1752자 · 댓글 7건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227735306](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6227735306) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6244348591](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6244348591) | ## 2026-10-18 모바일 저장 체크포인트 #26·#27 B 승인 | 승인·수정 후보 |
| [6245023681](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6245023681) | #243은 #259/main58e046a의 최종 CI·결과 main 전체/의료 및 게시 작업 성공을 확인해 완료 처리했고 이 #244를 이어갑니다. 운영 직접 GET의 프록시403은 별도 미확인 | 구현/검증 후보 |
| [6245215533](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6245215533) | 진행 업데이트: PR #260, `fix/save-recovery-current`, 최종 고정 `47c42c252b47ed676899a67ac5d9830dc5fa7c1b`(검토한 공개16파일,  | 내용 대조 필요 |
| [6245328723](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6245328723) | 시작 복구 누락까지 같은 PR #260에 보강했습니다. 새 최종 `b968e48e3d3c4599f2f72a1c90011fb1849d24d0`, 미커밋 없음. 정상 보관본이 있어도 DB=null이 | 내용 대조 필요 |
| [6246961138](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6246961138) | PR #260은 검증한 expected_head b968e48 고정으로 main `1a37254d60232623afd74ec5a25a195421c28db4`에 실제 병합됐습니다. `git dif | 구현/검증 후보 |
| [6247057453](https://github.com/lkh0802a/LOL-GM/issues/244#issuecomment-6247057453) | 브라우저 저장/복구 교정의 최종 수용을 확인했습니다. PR #260 → main `1a37254d60232623afd74ec5a25a195421c28db4`, 검증 HEAD b968e48과 전체 | 내용 대조 필요 |

## [#245 [P1-01] [정확성] AI 임대 검토 주기 날짜-of-month %7 제거](https://github.com/lkh0802a/LOL-GM/issues/245)

본문 1274자 · 댓글 4건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227735733](https://github.com/lkh0802a/LOL-GM/issues/245#issuecomment-6227735733) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6247016987](https://github.com/lkh0802a/LOL-GM/issues/245#issuecomment-6247016987) | #244 결과main 검증을 기다리는 동안 읽기 전용 재현을 준비했습니다(아직 #245 소스 편집/완료 아님). 실제 aiReviewLoanDecisions의 빈 임대 인덱스 관측에서 월 경계  | 내용 대조 필요 |
| [6247241801](https://github.com/lkh0802a/LOL-GM/issues/245#issuecomment-6247241801) | 진행 기록: PR #261 / fix/loan-review-calendar / `0e5fcaac4930e521cf6c692e9241d725624b288d`, 공개8파일·미커밋 없음. 임대 시작/ | 내용 대조 필요 |
| [6247402063](https://github.com/lkh0802a/LOL-GM/issues/245#issuecomment-6247402063) | #245 검증 완료: PR #261 병합 결과 main `d3bd47fce8deda4dab1bf2e5babddbd9eca63f4d`는 최종 PR `0e5fcaa`와 전체 트리 동일. 실제 계약  | 구현/검증 후보 |

## [#246 [P1-02] [결정론] 난수 비교 정렬을 고정 시드 셔플/확정 키로 교체](https://github.com/lkh0802a/LOL-GM/issues/246)

본문 1496자 · 댓글 6건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227736186](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6227736186) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6247376029](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6247376029) | #245 결과 main `d3bd47f`의 소스를 바꾸지 않고 선행 재현했습니다. 기존 난수 comparator 7곳/5파일(player, contracts, patch-content, comp | 내용 대조 필요 |
| [6247673851](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6247673851) | 현재 로컬/공개 `fix/seeded-shuffle` HEAD `6d0a1e3bd70fdfd2ee1f060c26a56c0584b716e0`, /workspace/LOL-GM-seeded-shuf | 내용 대조 필요 |
| [6247857618](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6247857618) | 원래 전체 `6d0a1e3`은08:32:17→08:41:33 UTC 종료1/703파일 동일입니다. 마지막 smoke의 기존 RNG 대역에 새 `.shuffle` 메서드가 없어 실패했으며 대역/단 | 내용 대조 필요 |
| [6249887250](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6249887250) | ISSUE/PR: #246 / PR262 / fix/seeded-shuffle / HEAD 14271e576266a831d40a3f8de1f00c54a0fc4dcb | 내용 대조 필요 |
| [6293803928](https://github.com/lkh0802a/LOL-GM/issues/246#issuecomment-6293803928) | 최신 실제 main daf6a1452dfe06f4ae72599eb75cb48465752ec0에서 결정론 집중(전체 npm의 seeded-shuffle 포함)·직접 전체npm·의료 핵심 정상 종료 | 내용 대조 필요 |

## [#247 [P1-05] [모바일 성능] 스카우팅·후보/재정 화면 전체 세계 복사·전체 JSON 비교 최적화](https://github.com/lkh0802a/LOL-GM/issues/247)

본문 1519자 · 댓글 5건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227736639](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6227736639) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6304966833](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6304966833) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6305713873](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6305713873) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6306065153](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6306065153) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6309294470](https://github.com/lkh0802a/LOL-GM/issues/247#issuecomment-6309294470) | [CODEX-CHECKPOINT] | 구현/검증 후보 |

## [#248 [P1-03] [정보 경계] 스카우팅 실제 OVR 하한·상대 의료 비공개 데이터 누출 검증](https://github.com/lkh0802a/LOL-GM/issues/248)

본문 1574자 · 댓글 4건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227737044](https://github.com/lkh0802a/LOL-GM/issues/248#issuecomment-6227737044) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6288789387](https://github.com/lkh0802a/LOL-GM/issues/248#issuecomment-6288789387) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6293046673](https://github.com/lkh0802a/LOL-GM/issues/248#issuecomment-6293046673) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6293800252](https://github.com/lkh0802a/LOL-GM/issues/248#issuecomment-6293800252) | [CODEX-CHECKPOINT] | 구현/검증 후보 |

## [#249 [P1-04] [역사 무결성] 당시 경기 리플레이·과거 소속·기록 보존 기간 경계](https://github.com/lkh0802a/LOL-GM/issues/249)

본문 1651자 · 댓글 7건.

| 댓글 | 원문 제목/첫 문장 | 탐색 태그 |
|---|---|---|
| [6227737410](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6227737410) | ## Codex 전 분야 상세 인수 계약 연결 (2026-10-17) | 구현/검증 후보 |
| [6294343769](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6294343769) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6294351866](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6294351866) | 시간 보완: 도구의 실제 종료 관측은 2026-10-20 15:19:36 UTC, 재개 시작14:10:05 UTC부터 **1시간9분31초** 경과했습니다. 구현·검사·도구 대기를 포함하며 순수  | 내용 대조 필요 |
| [6299045951](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6299045951) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6299793869](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6299793869) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6299995011](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6299995011) | [CODEX-CHECKPOINT] | 구현/검증 후보 |
| [6304836746](https://github.com/lkh0802a/LOL-GM/issues/249#issuecomment-6304836746) | [CODEX-CHECKPOINT] | 구현/검증 후보 |

