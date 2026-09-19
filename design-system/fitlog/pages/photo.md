# Page Override: Photo (인증)

> Overrides [MASTER.md](../MASTER.md) for `/photo`.
> Flows: [FLOWS.md](../FLOWS.md) §4

## Intent

Create a shareable workout proof image: photo + caption.

## Structure

1. Title **운동 인증 사진 만들기**
2. 3:4 share card over gym photo:
   - Today's Workout / day title / date
   - Metrics: Total Volume, Duration
   - Highlight banner (e.g. PR line)
3. **문구 추가** text field
4. Actions: **사진 변경** (outline) · **이미지 저장** (primary)

## Rules

- Caption field is required in design even if code lags
- Photo change + save are paired CTAs
- Tab: **인증** active
- Use stock gym photography; do not hand-draw illustrations
- Bound to a `FINISH` schedule (오늘 최근 또는 종료 허브에서 전달)

## Empty

| 상태 | 카피 | 1차 CTA |
|------|------|---------|
| **No Session** | `완료한 운동이 없습니다` / `운동을 마치면 인증 사진을 만들 수 있어요` | **운동 시작** → FAB 규칙 또는 `/` |
| **No Image** | 카드 영역 muted 플레이스홀더 `사진을 선택해 주세요` | **사진 변경** (강조). 저장 disabled |

## Confirm

사진 교체 시 기존 사진이 있으면 [confirms.md](./confirms.md) optional light confirm.
