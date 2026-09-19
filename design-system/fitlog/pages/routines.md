# Page Override: Routines

> Overrides [MASTER.md](../MASTER.md) for `/routines`.
> Flows: [FLOWS.md](../FLOWS.md) §2 · §5 · Confirm: [confirms.md](./confirms.md)

## Intent

Browse user-created routine presets. Start a session from a preset or edit/delete.

## Structure

1. Header row: **나의 루틴** + **루틴 생성** CTA
2. Routine cards:
   - Name
   - Target muscles summary
   - Category badge (e.g. STRENGTH)
   - Delete (ghost destructive) → [confirms.md](./confirms.md) Delete Routine
   - Primary footer: **이 루틴으로 시작** (`cloneScheduleFromPreset`)
   - Secondary: **편집하기** → [routine-edit.md](./routine-edit.md)

## Rules

- List is the primary content; creation is the secondary CTA in the header
- Tab: **루틴** active (Plus icon)
- Empty list still shows create CTA
- **루틴 생성** / **편집하기** → [routine-edit.md](./routine-edit.md)
- 종목 추가 피커 → [fitness-picker.md](./fitness-picker.md)

## Empty

| 상태 | 카피 | 1차 CTA |
|------|------|---------|
| 리스트 0건 | `나만의 루틴을 만들어 보세요` / `자주 하는 운동을 저장해 두면 한 번에 시작할 수 있어요` | **루틴 생성** |

## Card actions (overflow optional)

카드가 좁으면 footer를 `시작` + `⋯` overflow로 압축: 시작 / 편집 / 삭제.
