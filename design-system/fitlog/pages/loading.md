# Page Override: Page Loading

> Overrides [MASTER.md](../MASTER.md) for page-level suspense / data loading.
> Flows: [FLOWS.md](../FLOWS.md) §9

## Intent

Keep shell stable while page content loads.

## Structure

1. Status bar + FITLOG header (real, not skeleton)
2. Main: skeleton blocks matching dashboard/list rhythm
   - Title bar skeleton
   - Chart-height muted rectangle
   - 2–3 list-row skeletons
3. Tab bar (real, not skeleton)

## Rules

- Never replace entire viewport with "Loading Page..." text alone
- Skeletons match final layout dimensions to avoid content jump
- Mark main with busy semantics (`aria-busy`)
- Prefer delayed spinner only for very short waits; default to skeleton

## Related

- 치명적 오류 → Error + Retry 프레임 (셸 유지). See canvas `Error + Retry` / FLOWS §9
- 피커·저장 버튼 로딩은 각 페이지 override 참고
