# Page Override: Workout

> Overrides [MASTER.md](../MASTER.md) for `/workout/:scheduleId`.
> Flows: [FLOWS.md](../FLOWS.md) §1–3 · Hubs: [workout-hubs.md](./workout-hubs.md)

## Intent

Active session: elapsed time, progress, edit sets, add exercises, pause/resume, finish.

## Structure

1. Sticky session bar: **오늘의 운동**, timer (`HH:mm:ss`), set progress (`8/12`), Pause affordance, **운동 완료**
2. Exercise cards:
   - Accent left bar + exercise name + **기록 확인** → [workout-hubs.md](./workout-hubs.md)
   - Columns: 세트 / 무게 (kg) / 횟수 / 완료
   - Editable set rows + **세트 추가**
3. Dashed **새로운 운동 종목 추가** → [fitness-picker.md](./fitness-picker.md)

## Rules

- Timer and completion ratio visible together
- Set rows are interactive (weight, reps, done checkbox)
- `STARTED`: timer running; Pause → `PAUSED` hub styling
- `PAUSED`: timer frozen; primary becomes **재개하기** (see workout-hubs)
- Footer FAB may still show; page uses `pb-24`
- Tab: Play FAB visually active / elevated
- **운동 완료** → incomplete-sets confirm (if needed) → Finish Hub

## Empty

| 상태 | 카피 | 1차 CTA |
|------|------|---------|
| 종목 0개 (FAB 빈 세션) | `아직 추가된 운동이 없습니다` | **새로운 운동 종목 추가** |

## Out of scope

- 별도 휴식(`breakTime`) 카운트다운 UI — pause 카피에 흡수
