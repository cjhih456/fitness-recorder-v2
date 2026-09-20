# Page Override: Routine Edit / Create

> Overrides [MASTER.md](../MASTER.md) for `/routines/new` and `/routines/:id/edit`.
> Flows: [FLOWS.md](../FLOWS.md) §5 · Confirm: [confirms.md](./confirms.md)

## Intent

Create or edit a user routine: name + ordered exercise list.

## Structure

1. Top bar: Back · title (`루틴 생성` / `루틴 편집`) · optional trash (edit only)
2. **루틴 이름** labeled input (never placeholder-only)
3. Section **운동 종목** + count badge · exercise cards (same pattern as Workout `Card/Exercise`):
   - Name + 삭제
   - Columns: **세트 / 무게 (kg) / 횟수 / 완료**
   - Editable set rows + **세트 추가**
4. Dashed CTA **운동 종목 추가** → Fitness Picker
5. Sticky primary **저장하기**

## Rules

- Create and Edit share one layout; Edit pre-fills name/list and shows delete
- Empty exercise list: muted hint + same add CTA
- Tab bar: prefer **no tab bar** for editor focus
- Opening picker must not lose draft name/list (overlay)
- Preset set rows define default weight/reps
- **완료** column visible for layout parity but **disabled** (muted checkbox)
- 이름 공백 또는 종목 0개 → **저장하기** disabled
- Back with dirty draft → Confirm Discard
- Trash → Confirm Delete Routine

## Empty (create, 0 exercises)

카피: `아직 추가된 운동이 없습니다` / `아래에서 종목을 검색해 추가하세요`
