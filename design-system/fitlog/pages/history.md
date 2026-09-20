# Page Override: History

> Overrides [MASTER.md](../MASTER.md) for `/history`.
> Flows: [FLOWS.md](../FLOWS.md) §6 · Detail: [history-detail.md](./history-detail.md)

## Intent

Review past workouts: duration, exercise list, trained muscle groups.

## Structure

1. Section **운동 히스토리**
2. List of history cards:
   - Date block (month + day) on accent-soft
   - Title
   - Meta: `시간: {n}분 • 총 볼륨: {volume}`
   - **Muscle chips**
   - **Exercise list summary** (e.g. `벤치프레스 외 4종`)
   - Chevron affordance → [history-detail.md](./history-detail.md)

## Rules

- Show duration, exercises, and body parts — all three
- Tab: **기록** active
- Card tap opens History Detail (read-only)

## Empty

| 상태 | 카피 | 1차 CTA |
|------|------|---------|
| 리스트 0건 | `아직 운동 기록이 없습니다` / `홈이나 루틴에서 운동을 시작해 보세요` | **홈으로** → `/` |

## Out of scope

- 헤더 달력 아이콘 / 월별 필터 UI (달력 IA 금지). 디자인에서 제거하거나 비활성.
