# Page Override: Confirms

> Shared destructive / caution dialogs. Flows: [FLOWS.md](../FLOWS.md) §3 · §5

## Intent

One pattern for confirmations: title, body, cancel (ghost/outline), confirm (destructive or accent).

## Presentation

Bottom sheet on `max-sm`; compact dialog on `min-md`. Focus trap; confirm is not default-focused if destructive.

---

## Catalog

| ID | Title | Body | Confirm | Cancel |
|----|-------|------|---------|--------|
| **Delete Routine** | `루틴을 삭제할까요?` | `삭제하면 되돌릴 수 없습니다.` | **삭제** (destructive) | **취소** |
| **Discard Draft** | `수정을 취소할까요?` | `저장하지 않은 내용이 사라집니다.` | **나가기** | **계속 편집** |
| **Finish Incomplete** | `운동을 종료할까요?` | `아직 끝내지 않은 세트가 있습니다.` | **종료** (accent) | **계속하기** |
| **Replace Photo** | `사진을 바꿀까요?` | `현재 선택한 사진은 대체됩니다.` | **변경** | **취소** |

## Rules

- Never delete without Delete Routine confirm
- Finish Incomplete only when incomplete set count > 0
- Replace Photo optional if product wants one-tap change — include in canvas for consistency
