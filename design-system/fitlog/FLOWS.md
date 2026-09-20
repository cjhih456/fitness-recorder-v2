# FITLOG Flow Spec

> **목적:** 화면이 아니라 **결정**을 고정한다. 구현은 이 문서 + [pages/](./pages/) + [design/web.pen](../../design/web.pen)을 따른다.
> **범위:** 5탭 IA (홈 / 기록 / Play FAB / 루틴 / 인증). 달력·휴식일(`BREAK`) 전용 UI는 **금지**.

관련: [MASTER.md](./MASTER.md) · GraphQL `ScheduleType` (`SCHEDULED | STARTED | PAUSED | FINISH`)

---

## 1. ScheduleType 전이

```
SCHEDULED ──start──► STARTED ◄──resume──► PAUSED
                         │                   │
                         │ pause             │
                         ▼                   │
                      PAUSED ────────────────┘
                         │
                         │ finish (from STARTED or PAUSED)
                         ▼
                      FINISH  (terminal)
```

| 전이 | 트리거 | 규칙 |
|------|--------|------|
| → `STARTED` | 시작 CTA | `createSchedule` 또는 `cloneScheduleFromPreset` 후 `type: STARTED`. `start` 타임스탬프 기록 |
| `STARTED` → `PAUSED` | 일시정지 | 타이머 정지. 경과 시간·`breakTime` 누적 유지. 별도 휴식 타이머 UI 없음 |
| `PAUSED` → `STARTED` | 재개 | 타이머 재개 |
| → `FINISH` | 운동 완료 (확인 후) | 미완료 세트 있어도 **경고 후 허용**. 종료 허브로 이동 |

`BREAK` / 월별 캘린더 도트 / 휴식일 지정 화면은 **만들지 않는다**.

---

## 2. 운동 시작 소스

모든 시작은 **오늘 날짜**의 스케줄을 만들고(또는 재개하고) `/workout/:scheduleId`로 이동한다.

| 소스 | 동작 | 스케줄 내용 |
|------|------|-------------|
| **Dashboard** 루틴 카드 | `cloneScheduleFromPreset(presetId, today)` → `STARTED` | 프리셋 종목·세트 복사 |
| **Routines** “이 루틴으로 시작” | 동일 | 동일 |
| **FAB** | 오늘 `STARTED`/`PAUSED` 세션이 있으면 **재개**. 없으면 `createSchedule(today, SCHEDULED)` → 즉시 `STARTED`인 **빈 세션** | 종목 0개 → Workout Empty |
| **이미 열린 Workout** | 시작 버튼 없음 (이미 세션) | — |

동시 진행 세션은 **하루 1개**를 권장한다. FAB는 진행 중 세션을 우선한다.

---

## 3. 운동 종료 → 다음 허브

**운동 완료** 탭 시:

1. 미완료 세트 > 0이면 Confirm: “아직 끝내지 않은 세트가 있습니다. 그래도 종료할까요?”
2. 확인 → `FINISH`
3. **종료 허브** (바텀 시트 / 전체 화면 카드) 3선택:

| CTA | 이동 |
|-----|------|
| **인증 만들기** | `/photo` (방금 끝난 `scheduleId` 바인딩) |
| **기록 보기** | `/history` (해당 카드 하이라이트 가능) 또는 History Detail |
| **홈으로** | `/` |

닫기(X) / 스크림 탭 = 홈과 동일.

### 세션 → 프리셋

종료 허브 또는 Workout overflow 메뉴: **루틴으로 저장** → `copyExercisePresetFromSchedule` → Routines 목록. 이름 기본값: “오늘의 운동” 또는 날짜 기반.

---

## 4. 인증(Photo) 구속

| 진입 | 세션 바인딩 | UI |
|------|-------------|-----|
| 종료 허브 → 인증 만들기 | 방금 `FINISH`된 schedule | Happy path (메트릭 + 사진) |
| 탭 **인증** 직접 | 오늘 가장 최근 `FINISH` 세션 | 있으면 happy / 없으면 **No Session** empty |
| 세션은 있는데 사진 미선택 | 동일 | **No Image** — 플레이스홀더 + “사진 변경” 강조 |

캡션(`문구 추가`)은 선택. **이미지 저장**은 사진이 있을 때만 enabled.

---

## 5. 루틴 CRUD 유효성

| 규칙 | 결정 |
|------|------|
| 루틴 이름 | **필수**. 공백-only 불가. 저장 CTA disabled + 인라인 힌트 |
| 종목 0개 | **저장 불가**. Empty 힌트 유지 + 저장 disabled |
| 삭제 | Confirm Delete Routine 필수 |
| 편집 중 이탈(Back) | 변경 있으면 Confirm Discard; 없으면 즉시 pop |
| 종목 추가 | Fitness Picker 오버레이 — 드래프트 이름/목록 유지 |

---

## 6. 히스토리

| 액션 | 결과 |
|------|------|
| 카드 탭 | **History Detail** — 읽기 전용 (타이머 없음, 세트 완료 고정) |
| 달력 아이콘 | **이번 범위에서 no-op 또는 숨김** (달력 IA 금지). 디자인에서 제거 권장 |

---

## 7. Workout 중 허브

| 허브 | 진입 | 내용 |
|------|------|------|
| **일시정지** | 세션 바 Pause / 타이머 옆 | `PAUSED` 배지, 경과 시간, **재개** primary, 선택적 “루틴으로 저장” |
| **기록 확인** | Exercise 카드 “기록 확인” | 동일 fitness 최근 N세트 (무게·횟수) 읽기 전용 시트. 데이터 없으면 empty copy |
| **종료 허브** | 위 §3 | — |

---

## 8. Settings

헤더 Settings 아이콘 → **Settings Sheet** (바텀 시트).

| 항목 | 동작 |
|------|------|
| 테마 | 라이트 / 다크 (MASTER 토큰). 기본 라이트 |
| 언어 | ko / en (i18n 준비). 기본 시스템 또는 ko |
| 앱 버전 | 읽기 전용 |

계정·온보딩·클라우드 동기화 **없음**.

---

## 9. 오류 · 로딩

| 상태 | UI |
|------|-----|
| 페이지 데이터 로딩 | [loading.md](./pages/loading.md) 스켈레톤 (셸 유지) |
| 치명적 오류 (Suspense / GraphQL) | Error + **다시 시도** (셸 유지) |
| 피커 검색 로딩 | 리스트 하단 spinner |
| 저장 중 | Primary 버튼 loading / disabled |

---

## 10. i18n 키 매핑 (후속 Excel용)

현재 UI는 한글 하드코딩. 키는 나중에 Excel에 옮긴다.

| 영역 | 예시 키 | 카피 |
|------|---------|------|
| empty.dashboard.routines | `empty.dashboard.routines` | 오늘 시작할 루틴이 없습니다 |
| empty.history | `empty.history` | 아직 운동 기록이 없습니다 |
| empty.routines | `empty.routines` | 나만의 루틴을 만들어 보세요 |
| empty.picker | `empty.picker` | 검색 결과가 없습니다 |
| empty.photo.session | `empty.photo.session` | 완료한 운동이 없습니다 |
| empty.photo.image | `empty.photo.image` | 사진을 선택해 주세요 |
| workout.pause | `workout.pause` | 일시정지 |
| workout.resume | `workout.resume` | 재개하기 |
| workout.finishHub.title | `workout.finishHub.title` | 운동을 마쳤습니다 |
| workout.finishHub.photo | `workout.finishHub.photo` | 인증 만들기 |
| confirm.deleteRoutine | `confirm.deleteRoutine` | 이 루틴을 삭제할까요? |
| confirm.finishIncomplete | `confirm.finishIncomplete` | 아직 끝내지 않은 세트가 있습니다 |
| settings.title | `settings.title` | 설정 |

---

## 11. 금지 목록

- 달력 / 월별 도트 / `BREAK` 휴식일 UI
- 온보딩·계정·클라우드
- 전 화면 다크 시안 필수화 (Settings에서만 토글)
- md+ 앱 셸 재설계 (피커 모달만 유지)
