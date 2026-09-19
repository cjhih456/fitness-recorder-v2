# Page Override: Fitness Picker (Dialog)

> Overrides [MASTER.md](../MASTER.md) for “운동 종목 추가” picker.
> Used from Routine Edit and Workout. Flows: [FLOWS.md](../FLOWS.md)

## Intent

Search and select a fitness exercise to add.

## Responsive presentation

| Breakpoint | Presentation | Notes |
|------------|--------------|-------|
| `max-sm` (< 640px) | **Bottom sheet** | Drag handle, rounded top, ~70–85% height, scrim |
| `min-md` (≥ 768px) | **Centered modal** | Max-width ~480px, rounded-2xl, scrim, focus trap |

Same content tree in both variants (title, close, search, virtual list).

## Structure

1. Title **운동 선택** + close (X)
2. Search input with Search icon — label via visible title / `aria-label`
3. Scrollable list rows: name, `primaryMuscles`, Plus affordance
4. Loading: spinner at list bottom; empty: “검색 결과가 없습니다” + suggestion

## Rules (ui-ux-pro-max + shadcn)

- Dialog/Sheet manage focus trap; visible focus ring on controls (`ring-accent`)
- Prefer Drawer/Sheet on mobile; Dialog on md+
- Debounced search; never leave a blank dead-end without empty state
- Selecting a row closes the overlay and returns the fitness to the parent
- Opening picker must not lose parent draft (name/list)

## Empty / Loading

| 상태 | UI |
|------|-----|
| 검색 0건 | `검색 결과가 없습니다` + `다른 키워드로 검색해 보세요` |
| 로딩 | 리스트 하단 spinner; 기존 결과 유지 가능 |
