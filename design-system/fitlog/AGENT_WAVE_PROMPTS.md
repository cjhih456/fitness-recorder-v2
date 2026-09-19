# FITLOG Agent Wave Prompts

> 오케스트레이터가 `Task`에 그대로 붙이거나, 아래 **공통 전문** + **Wave 본문**을 합쳐 보낸다.
> 계획 파일(`.cursor/plans/*`)은 수정하지 않는다.

워크스페이스: `/Users/choeinhwan/Desktop/Project/fitness-recoder-v2`  
Pen: `/Users/choeinhwan/Desktop/Project/fitness-recoder-v2/design/web.pen`  
테스트 러너: Vitest + Testing Library (`*.spec.tsx` / `*.test.tsx`, 기존 [app.spec.tsx](../../app/web/src/app/app.spec.tsx) 패턴)

---

## 공통 전문 (모든 Wave에 필수 첨부)

```text
You are a FITLOG web feature agent. Workspace: /Users/choeinhwan/Desktop/Project/fitness-recoder-v2

## Hard rules
- Implement ONLY the assigned Wave. Do not commit/push unless the user asked.
- Do NOT edit any files under .cursor/plans/.
- No calendar / BREAK / onboarding / account / i18n Excel schema work.
- Orchestrator does not write feature code; you own this wave end-to-end.
- Visual SoT: design/web.pen. BEFORE coding, use Pencil MCP
  (user-highagency.pencildev-extension-pencil) execute Get and/or TakeScreenshot
  on every pen frame id listed for this wave. Align UI to pen structure;
  align copy/rules to design-system/fitlog pages md + FLOWS.md sections cited.

## Tests (mandatory — ship with the feature)
- Add or update Vitest + Testing Library specs colocated with changed code
  (prefer `*.spec.tsx` next to the page/section under app/web/src).
- Cover at least:
  1) Happy render matching key copy from pen/md
  2) Empty / error / confirm state when this wave defines one
  3) Primary user action (click/navigate/mutation call) with hooks mocked
- Mock `@fitness-recoder/graphql-sqlite-worker` hooks (vi.mock) — do not hit real SQLite worker in unit tests.
- Wrap with MemoryRouter / BrowserRouter as needed; match existing app.spec.tsx style.
- Run tests for touched project, e.g. `nx test web` or the repo’s equivalent vitest target; fix failures you introduce.
- If app.spec.tsx still asserts obsolete “Welcome web”, update it only if this wave breaks it (Wave 0 may fix).

## Deliverable
- Code + specs
- Short summary: files changed, pen ids verified, test commands run + results
```

---

## Wave 0 — Shell

**Pen:** `igSBF` TabBar · `fHOcP` Header · `glSNK` Page Loading · `cVesS` Error + Retry  
**Docs:** FLOWS §2, §9 · pages/loading.md · MASTER shell  
**Own:** `app/web/src/app/app.tsx`, `components/layout/LayoutFooter.tsx`, `components/utils/SuspenseBoundary.tsx`, minimal stub pages for new routes  
**Hooks:** `useScheduleByDateQuery`, `useCreateScheduleMutation`, `useUpdateScheduleMutation` (FAB only)

```text
## Wave 0 — Shell

### Pen frames (inspect first)
- igSBF TabBar
- fHOcP Header/FITLOG
- glSNK Page Loading
- cVesS Error + Retry

### Requirements
1. Lazy routes in app.tsx: /photo, /routines/new, /routines/:id/edit, /history/:scheduleId
   (stubs OK for RoutineEdit / HistoryDetail; Photo may use existing page).
2. FAB: remove /workout/1 hardcode. FLOWS §2 — resume today STARTED/PAUSED else createSchedule→STARTED→navigate.
3. SuspenseBoundary error UI → cVesS Korean copy (문제 발생 / 다시 시도).
4. Prefer glSNK-style skeleton fallback over bare “Loading Page...”.

### Tests required
- LayoutFooter FAB: mock schedule-by-date returning STARTED → navigates to that id;
  mock empty → createSchedule (+ update if needed) then navigate to new id.
- app routes: /photo, /routines/new, /history/:id render stub/page without crash (MemoryRouter + Routes smoke).
- SuspenseBoundary: throw in child → shows retry CTA; retry callable.
```

---

## Wave 1a — Routines

**Pen:** `VMGSA` · `nGJRr` · `kOuVq` · `U2VMtk` · `eofJt`  
**Docs:** pages/routines.md · pages/confirms.md · FLOWS §2·§5  
**Own:** `app/pages/Routines.tsx`, `components/section/routines/**`  
**Hooks:** `useExercisePresetListQuery`, `useDeleteExercisePresetMutation`, `useCloneScheduleFromPresetMutation`

```text
## Wave 1a — Routines

### Pen frames
- VMGSA Routines (happy)
- nGJRr Routines Empty
- kOuVq Routines Card Actions
- U2VMtk Confirm Delete Routine
- eofJt Card/Routine

### Requirements
- List presets; Empty copy from nGJRr; CTA 루틴 생성 → /routines/new
- Card actions: 이 루틴으로 시작 (cloneScheduleFromPreset→/workout/:id), 편집하기, 삭제→U2VMtk confirm
- Do not edit app.tsx (routes already from Wave 0)

### Tests required
- Empty list → shows “나만의 루틴을 만들어 보세요” (or pen/md copy)
- With mock presets → renders names; start calls clone + navigate
- Delete opens confirm; confirm calls delete mutation; cancel does not
```

---

## Wave 1b — Routine Edit / Create

**Pen:** `E1n9KG` · `B6AA3` · `KlilV` · `MqtgL` · `qqlL8` · `mBLk0`  
**Docs:** pages/routine-edit.md · pages/fitness-picker.md · FLOWS §5  
**Own:** RoutineEdit page + related section components (not app.tsx)  
**Hooks:** create/update preset, create exercise by preset, set CRUD

```text
## Wave 1b — Routine Edit / Create

### Pen frames
- E1n9KG Routine Edit
- B6AA3 Routine Create
- KlilV / MqtgL Fitness Picker; apply jDNqt empty copy when 0 results
- qqlL8 Confirm Discard Draft
- mBLk0 Card/Exercise (완료 column disabled)

### Requirements
- /routines/new and /routines/:id/edit share layout; name required; 0 exercises → save disabled
- Picker overlay; discard confirm on dirty back
- Tab bar hidden preferred on editor

### Tests required
- Create: empty name or 0 exercises → save disabled
- Add exercise via picker mock → count updates; save calls create/update mutation
- Dirty back → discard confirm; leave vs continue
```

---

## Wave 2 — Workout

**Pen:** `j6iqb` · `X2A1lx` · `SPpqd` · `nIGc9`/`aPSNV` · `nE6Jk` · `Z1z22` · `jDNqt` · `mBLk0` · `KlilV`/`MqtgL`  
**Docs:** pages/workout.md · workout-hubs.md · confirms.md · fitness-picker.md · FLOWS §1·§3·§7  
**Own:** `Workout.tsx`, `components/section/workout/**`  
**Hooks:** schedule/exercise/set + updateSchedule PAUSED/STARTED/FINISH + copyExercisePresetFromSchedule

```text
## Wave 2 — Workout

### Pen frames
- j6iqb Workout, mBLk0 Card/Exercise
- X2A1lx Workout Empty
- SPpqd Workout Paused
- nIGc9 / aPSNV Finish Hub
- nE6Jk Exercise Recent Records
- Z1z22 Confirm Finish Incomplete
- KlilV / MqtgL / jDNqt Picker Empty

### Requirements
- Pause/resume; incomplete finish confirm; finish hub CTAs (photo/history/home)
- Empty exercises; recent records sheet; picker empty state
- Do not edit app.tsx

### Tests required
- STARTED → pause control calls update PAUSED; PAUSED UI (일시정지/재개)
- Finish with incomplete sets → Z1z22; confirm → FINISH + hub visible
- Finish hub CTAs navigate correctly (mock router)
- 0 exercises → empty copy; picker 0 results → “검색 결과가 없습니다”
```

---

## Wave 3 — Dashboard

**Pen:** `oeSEw` · `G8pLwZ` · `HMRbz`  
**Docs:** pages/dashboard.md · FLOWS §2  
**Own:** `Dashboard.tsx`, `components/section/dashboard/**`  
**Hooks:** preset list / today data, `useCloneScheduleFromPresetMutation`

```text
## Wave 3 — Dashboard

### Pen frames
- oeSEw Dashboard
- G8pLwZ Dashboard Empty
- HMRbz Dashboard Sparse Chart

### Requirements
- Remove mock constants where possible; start routine via clone→/workout/:id
- Empty routines UI; sparse chart when <4 points
- Do not edit app.tsx

### Tests required
- Empty presets → G8pLwZ copy + CTA toward routines
- With presets → start triggers clone + navigate
- Sparse: fixture with <4 points renders stat cards not line chart (or as designed)
```

---

## Wave 4 — History + Detail

**Pen:** `WGNGi` · `D9HpL` · `q4AgFA` · `ZjWb0` · `mEerc` · `mBLk0`  
**Docs:** pages/history.md · history-detail.md · FLOWS §6  
**Own:** `History.tsx`, HistoryDetail page, `components/section/history/**`  
**Hooks:** FINISH schedules, exercise list by schedule read-only  
**Forbidden:** calendar icon behavior

```text
## Wave 4 — History + History Detail

### Pen frames
- WGNGi History, ZjWb0 Card/History, mEerc Chip/Muscle
- D9HpL History Empty
- q4AgFA History Detail (mBLk0 read-only)

### Requirements
- List FINISH sessions; empty state; navigate to /history/:scheduleId
- Detail read-only (no timer/finish/add set)
- Calendar no-op or hidden

### Tests required
- Empty → D9HpL copy
- Mock FINISH list → cards; click → navigates to detail
- Detail renders exercises read-only; no finish CTA
```

---

## Wave 5 — Photo

**Pen:** `uQQTo` · `RmDkP` · `G5Nmj7` · `Z5GEpq` · `VpeTR`  
**Docs:** pages/photo.md · FLOWS §4  
**Own:** `Photo.tsx` and related under photo section  
**Binding:** query scheduleId or today’s latest FINISH

```text
## Wave 5 — Photo

### Pen frames
- uQQTo Photo
- RmDkP Photo No Session
- G5Nmj7 Photo No Image
- Z5GEpq / VpeTR action buttons

### Requirements
- No FINISH → No Session; session without image → No Image (save disabled)
- Happy: caption, change photo, save
- Do not edit app.tsx

### Tests required
- No session mock → RmDkP copy + CTA
- Session without image → save disabled; change photo enabled
- With image → save enabled / handler called
```

---

## Wave 6 — Settings

**Pen:** `VVEtL` · `d0zvH` · `fHOcP`  
**Docs:** pages/settings.md · FLOWS §8  
**Own:** `LayoutHeader.tsx` + Settings sheet component  
**Items:** theme / language / app version (no account)

```text
## Wave 6 — Settings

### Pen frames
- VVEtL Settings Sheet
- d0zvH Settings Sheet (Page)
- fHOcP Header entry (settings icon)

### Requirements
- Header settings opens sheet; theme via next-themes; language; version read-only
- Do not edit app.tsx

### Tests required
- Settings icon opens sheet with 설정 title
- Theme control calls theme setter (mock next-themes)
- Version row visible
```

---

## 오케스트레이터 사용법

1. Task prompt = **공통 전문** + 해당 **Wave 본문**
2. Wave 순차 실행 (병렬 금지)
3. Agent 완료 후: pen id 대비 검수 + 테스트 결과 확인 → 다음 Wave
