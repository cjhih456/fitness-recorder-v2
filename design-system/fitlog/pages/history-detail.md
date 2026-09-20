# Page Override: History Detail

> Overrides [MASTER.md](../MASTER.md) for `/history/:scheduleId` (or equivalent).
> Flows: [FLOWS.md](../FLOWS.md) §6 · Parent list: [history.md](./history.md)

## Intent

Read-only review of a finished workout session.

## Structure

1. Top bar: Back · title (루틴명 또는 `운동 기록`) · optional overflow (루틴으로 저장)
2. Meta strip: date · duration · total volume
3. Muscle chips
4. Exercise cards (Workout `Card/Exercise` layout):
   - Sets frozen (완료 checked, inputs disabled / read-only)
   - No “세트 추가”, no “새로운 운동 종목 추가”
5. No live timer, no **운동 완료**

## Rules

- Only `FINISH` schedules
- Tab bar: hide OR keep shell with **기록** active — prefer **back stack, no tab bar** for focus
- **루틴으로 저장** → copy preset from this schedule

## Empty

상세에 종목이 없으면 muted `이 세션에 기록된 운동이 없습니다` (데이터 손상 edge).
