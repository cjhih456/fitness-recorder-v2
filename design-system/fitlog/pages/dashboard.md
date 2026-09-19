# Page Override: Dashboard

> Overrides [MASTER.md](../MASTER.md) for `/`.
> Flows: [FLOWS.md](../FLOWS.md) §2 시작 · §9 로딩/오류

## Intent

Home overview: weekly volume trend + quick start into today's routines.

## Structure

1. Section **총 볼륨 변화 (kg)** — subtitle `최근 7일`
2. Line chart (chest / back / legs) **또는** Sparse 스탯 카드
3. Section **오늘의 루틴** — date pill (accent-soft)
4. Routine start cards: icon circle, name, `{target} • {n}개 종목`, chevron CTA

## Rules

- Chart series must use `--chart-chest/back/legs` + distinct line styles
- Primary action on cards: start workout via `cloneScheduleFromPreset` → `/workout/:id`
- Tab: **홈** active

## Empty / Sparse

| 상태 | UI | 1차 CTA |
|------|-----|---------|
| **Empty routines** | muted copy: `오늘 시작할 루틴이 없습니다` + 보조 `루틴 탭에서 만들어 보세요` | **루틴 만들기** → `/routines` |
| **Sparse chart** (< 4 time points) | 차트 대신 3열 스탯 카드 (가슴/등/하체 주간 합계 kg). 데이터 0이면 `—` | 없음 (정보만) |
| 둘 다 empty | Sparse 스탯(전부 —) + Empty routines 블록 | 루틴 만들기 |

## Out of scope

- 달력 / 날짜 피커로 다른 날 루틴 보기
