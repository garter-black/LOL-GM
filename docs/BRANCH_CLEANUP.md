# 병합 완료 PR의 잔여 브랜치 정리 (수동 전용)

[GitHub Actions: Manual merged-branch cleanup](https://github.com/lkh0802a/LOL-GM/actions/workflows/manual-merged-branch-cleanup.yml)은 **수동 실행만** 가능하다. 기본값은 `execute=false`인 미리보기이며, **PR이 병합됐고 지금 브랜치 SHA가 그 PR 최종 HEAD와 정확히 같을 때만** 정리 후보로 선택한다. `main`, 보호 브랜치, 진행 중 PR head/base, 미병합 종료 PR, 연결 PR 없는 브랜치, HEAD가 변경된 브랜치, 최근 2일 내 병합 PR은 자동 제외한다.

**실행 절차:** workflow가 main에 반영된 뒤 Actions에서 해당 workflow를 열고, 먼저 `execute=false`로 실행해 report artifact의 후보를 검토. 실제 정리가 승인되면 `execute=true`와 정확한 `DELETE_MERGED_BRANCHES` 확인 문자열을 함께 제출한다. 실행 중에도 열린 PR의 head/base 및 브랜치 SHA를 다시 조회한다. 실패/재확인 불가 항목은 보존하고 기록한다.

**2026-11-01 감사 스냅샷:** 298 브랜치/289 PR 대조, **268개가 merged PR HEAD와 현재 SHA 일치**. 1개는 HEAD가 달라 제외, 14개 미병합 종료 PR, 8개 PR 비연결, 7개 기본/열린 PR 브랜치 보존. 최소 경과 일수 적용 시 실행일 후보 수는 달라질 수 있다. **현재 브랜치 삭제는 실행하지 않았다.**

향후 자동 잔여 브랜치 정리는 저장소 Settings → General → Pull Requests의 **Automatically delete head branches** 설정을 저장소 관리자가 켜야 한다(현황 `false`). 이 PR은 해당 설정을 변경하지 않는다. 과거 PR/커밋 역사를 삭제하는 기능은 포함하지 않는다.
