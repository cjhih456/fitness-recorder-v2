# Page Override: Workout Hubs

> Overlays used from [workout.md](./workout.md). Flows: [FLOWS.md](../FLOWS.md) §3 · §7

## Intent

Session-adjacent hubs without new tabs: pause, finish next-steps, recent records.

---

## 1. Paused session

**Entry:** Pause control on session bar while `STARTED`.

**UI (inline bar or sheet):**

- Badge **일시정지**
- Frozen timer value
- Copy: `휴식 중 · 언제든 다시 시작할 수 있어요` (`breakTime` 별도 UI 없음)
- Primary: **재개하기** → `PAUSED` → `STARTED`
- Ghost: **운동 완료** (finish from paused allowed after confirm if incomplete sets)

---

## 2. Finish Hub

**Entry:** After `FINISH` mutation succeeds.

**UI:** Centered card or bottom sheet on scrim.

| Element | Copy |
|---------|------|
| Title | `운동을 마쳤습니다` |
| Meta | duration · volume summary |
| CTA 1 (accent) | **인증 만들기** → `/photo` |
| CTA 2 (outline) | **기록 보기** → `/history` or detail |
| CTA 3 (ghost) | **홈으로** → `/` |
| Optional | **루틴으로 저장** |

Dismiss (X / scrim) = 홈으로.

---

## 3. Exercise Recent Records (“기록 확인”)

**Entry:** Exercise card action.

**UI:** Bottom sheet.

1. Title: `{운동명} · 최근 기록`
2. List rows: date · weight · reps (read-only)
3. Empty: `아직 이 운동의 기록이 없습니다`

Close returns to Workout; no edit.
