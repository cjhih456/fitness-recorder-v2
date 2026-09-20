# Gap Closure Review

> 작성일: 2026-09-19 · 기준: [FLOWS.md](./FLOWS.md) + [design/web.pen](../../design/web.pen)

## Journey closed?

| Step | Doc | Canvas | Notes |
|------|-----|--------|-------|
| 빈 홈 → 루틴 만들기 | dashboard.md Empty | `Dashboard Empty` | 카드 CTA 카피 |
| 루틴 생성 / 빈 루틴 목록 | routine-edit · routines Empty | `Routine Create` · `Routines Empty` | |
| 루틴으로 시작 | FLOWS §2 · routines.md | `Routines Card Actions` | 시작/편집/삭제 |
| 빈 세션 / 종목 추가 | workout Empty · fitness-picker | `Workout Empty` · `Picker Empty` | |
| 일시정지 / 재개 | workout-hubs · FLOWS §1 | `Workout Paused` | |
| 기록 확인 | workout-hubs | `Exercise Recent Records` | |
| 미완료 종료 확인 | confirms | `Confirm Finish Incomplete` | |
| 종료 허브 → 인증/기록/홈 | FLOWS §3 | `Workout Finish Hub` (+ Page) | |
| 인증 empty | photo.md | `Photo No Session` · `Photo No Image` | |
| 히스토리 empty → detail | history · history-detail | `History Empty` · `History Detail` | |
| 설정 | settings.md | `Settings Sheet` (+ Page) | |
| 삭제 / 드래프트 폐기 | confirms | `Confirm Delete Routine` · `Confirm Discard Draft` | |
| 오류 재시도 | FLOWS §9 | `Error + Retry` | |
| Sparse chart | dashboard.md | `Dashboard Sparse Chart` | |

## Intentionally open (out of scope)

- 달력 / `BREAK` / 월별 도트
- 온보딩 · 계정 · 클라우드
- md+ 앱 셸 재설계
- i18n Excel 키 실주입 (매핑만 FLOWS §10)

## Canvas inventory (state frames)

`Dashboard Empty`, `Dashboard Sparse Chart`, `History Empty`, `History Detail`, `Routines Empty`, `Routines Card Actions`, `Workout Empty`, `Workout Paused`, `Workout Finish Hub`, `Workout Finish Hub (Page)`, `Photo No Session`, `Photo No Image`, `Picker Empty`, `Settings Sheet`, `Settings Sheet (Page)`, `Confirm Delete Routine`, `Confirm Finish Incomplete`, `Confirm Discard Draft`, `Exercise Recent Records`, `Error + Retry`

## Verdict

신규 사용자 여정 **빈 홈 → 루틴 → 시작 → 일시정지/재개 → 종료 → 인증 또는 기록** 은 문서 + 캔버스로 폐쇄됨. 구현 티켓은 FLOWS + pages override를 따르면 화면을 재상상할 필요 없음.
