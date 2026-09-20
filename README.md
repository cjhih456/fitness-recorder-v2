# FITLOG (`fitness-recoder-v2`)

브라우저에서 동작하는 피트니스 기록 앱입니다. 서버 없이 WebAssembly SQLite와 GraphQL을 로컬에서 실행하며, 운동 루틴·세션·이력·공유 카드를 한 화면에서 관리합니다.

Nx 워크스페이스 모노레포이며 앱은 `app/web`, 도메인·UI·데이터 계층은 `libs/`에 분리되어 있습니다. 현재 앱 스키마 버전은 `1.5.0`입니다.

## 주요 기능

- **대시보드**: 오늘 루틴과 주간 볼륨 차트
- **운동 세션**: 스케줄 시작/재개, 세트 기록, 타이머, 운동 검색 추가
- **루틴**: 프리셋 생성·수정·삭제, 오늘 스케줄로 복제
- **기록**: 월별 완료 이력과 세션 상세
- **포토 카드**: 완료 세션을 이미지로 저장·공유
- **설정**: 한국어/영어, 라이트/다크 테마
- **오프라인 저장**: Origin Private File System(OPFS) 또는 메모리 SQLite

## 아키텍처

```
React (app/web)
  └── GraphQLSQLiteWorkerProvider
        ├── DB Worker (sqlite-wasm)
        └── Service Worker (GraphQL Yoga)
              └── BroadcastChannel ('graphql-sqlite-worker')
```

1. 메인 스레드는 Worker를 초기화하고 React Query로 GraphQL을 호출합니다.
2. Service Worker는 `/api/graphql` 요청을 GraphQL Yoga로 처리합니다.
3. Resolver는 `dbBus`로 DB Worker에 SQL을 보내고, 시드는 개발/빌드 시 `seed.db`로 미리 생성됩니다.

SharedArrayBuffer를 쓰는 sqlite-wasm 때문에 개발·프리뷰 서버는 COOP/COEP 헤더를 설정합니다.

## 기술 스택


| 영역   | 구성                                                      |
| ---- | ------------------------------------------------------- |
| 앱    | React 19, React Router 6, Vite 7, Tailwind CSS 4        |
| 데이터  | GraphQL Yoga, TanStack Query, `@sqlite.org/sqlite-wasm` |
| 도메인  | Zod (`@fitness-recoder/structure`)                      |
| UI   | shadcn/ui + Radix, lucide-react (`@fitness-recoder/ui`) |
| i18n | i18next, Excel → JSON Vite 플러그인 (ko, en)                |
| 도구   | Nx 22, Yarn 4.9.2, TypeScript, ESLint, Prettier, Vitest |




## 프로젝트 구조

```
fitness-recoder-v2/
├── app/web/                          # FITLOG 웹 앱
│   └── src/
│       ├── app/pages/                # 라우트 화면
│       ├── components/               # 레이아웃·섹션
│       ├── assets/i18n/              # 언어 파일·xlsx 소스
│       └── vite-plugins/             # i18next Excel 로더
├── libs/
│   ├── structure/                    # Zod 스키마·도메인 타입
│   ├── ui/                           # 공통 UI 컴포넌트
│   └── graphql-sqlite-worker/        # GraphQL + SQLite Worker
├── design-system/fitlog/             # 화면 스펙·플로우
├── .github/workflows/                # Validate, GitHub Pages Deploy
├── nx.json
└── package.json
```



### 라우트


| 경로                                    | 화면    |
| ------------------------------------- | ----- |
| `/`                                   | 대시보드  |
| `/history`                            | 운동 기록 |
| `/history/:scheduleId`                | 기록 상세 |
| `/routines`                           | 루틴 목록 |
| `/routines/new`, `/routines/:id/edit` | 루틴 편집 |
| `/workout/:scheduleId`                | 운동 세션 |
| `/photo`                              | 포토 카드 |




## 시작하기



### 요구사항

- **Node.js** 20 이상 (CI는 Node 24)
- **Yarn** 4.9.2 (Corepack 사용)
- 최신 Chromium 계열 브라우저 (OPFS / Service Worker)

```bash
corepack enable
yarn install
```



### 개발 서버

```bash
yarn nx serve web
# 또는
yarn nx dev web
```

`http://localhost:3000`에서 실행됩니다. `serve`/`dev`는 `@fitness-recoder/graphql-sqlite-worker:generate-seed-db`에 의존하므로 시드 DB가 먼저 생성됩니다.

## 명령어



### 웹 앱

```bash
yarn nx serve web
yarn nx build web
yarn nx preview web
yarn nx test web
yarn nx lint web
yarn nx typecheck web
```

프로덕션 빌드 결과는 `dist/app/web`입니다. GitHub Pages용으로 `VITE_BASE_PATH`를 바꿀 수 있습니다.

```bash
VITE_BASE_PATH=/fitness-recorder-v2/ yarn nx build web
```



### 라이브러리

Nx 프로젝트 이름은 패키지명 또는 디렉터리명으로 지정할 수 있습니다.

```bash
yarn nx build structure
yarn nx build ui
yarn nx build graphql-sqlite-worker
yarn nx generate-seed-db graphql-sqlite-worker

yarn nx lint <library-name>
yarn nx typecheck <library-name>
yarn nx test ui
```



### 워크스페이스

```bash
yarn nx show project web
yarn nx run-many -t lint
yarn nx run-many -t typecheck
yarn nx run-many -t test
yarn nx run-many -t build
yarn nx graph
```



## 라이브러리



### `@fitness-recoder/structure`

운동, 프리셋, 피트니스 카탈로그, 스케줄, 세트, 측정값에 대한 Zod 스키마와 타입입니다.

```ts
import { IScheduleSchema, type ScheduleData } from '@fitness-recoder/structure';
```



### `@fitness-recoder/ui`

shadcn/ui 기반 공통 컴포넌트입니다. Button, Card, Drawer, Input, Chart 등을 앱에서 재사용합니다.

```ts
import { Button, Card } from '@fitness-recoder/ui';
```



### `@fitness-recoder/graphql-sqlite-worker`

브라우저에서 SQLite와 GraphQL을 Worker로 실행합니다.

- GraphQL 모듈: Schedule, Exercise, ExercisePreset, Sets, Fitness
- React `hooks` 네임스페이스로 Query/Mutation 제공
- 버전 마이그레이션 (`0.1.0` ~ `1.5.0`)
- 피트니스 카탈로그가 들어 있는 `seed.db` 생성

앱 연결 예:

```tsx
import { GraphQLSQLiteWorkerProvider, APP_VERSION } from '@fitness-recoder/graphql-sqlite-worker';
import DbWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url';
import SeedDbUrl from '@fitness-recoder/graphql-sqlite-worker/seedDb?url';
import ServiceWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url';

<GraphQLSQLiteWorkerProvider
  workerConfig={{
    dbName: 'fitness.db',
    appVersion: APP_VERSION,
    dbWorkerUrl: DbWorkerUrl,
    seedDbUrl: SeedDbUrl,
  }}
  serviceWorkerUrl={ServiceWorkerUrl}
>
  <App />
</GraphQLSQLiteWorkerProvider>
```

상세 API는 `[libs/graphql-sqlite-worker/README.md](libs/graphql-sqlite-worker/README.md)`를 참고하세요.

## i18n

`app/web/src/assets/i18n/languages.xlsx`가 소스입니다. Vite 플러그인이 빌드/개발 시작 시 `ko.json`, `en.json`과 타입 정의를 생성합니다. 기본 언어는 한국어이며 설정에서 영어를 선택할 수 있습니다.

## 테스트

Vitest + Testing Library를 사용하며, 테스트 파일은 `*.spec.ts` / `*.spec.tsx`입니다.

```bash
yarn nx test web
yarn nx test web --coverage
yarn nx test web --ui
```



## CI / 배포

- **Validate** (`pull_request` → `main`): lint, typecheck, test, web build
- **Deploy** (`push` → `main`): `dist/app/web`을 GitHub Pages에 배포

Pages는 저장소 이름 기준 `VITE_BASE_PATH`를 넣고 SPA 폴백으로 `404.html`을 복사합니다. 저장소: [cjhih456/fitness-recorder-v2](https://github.com/cjhih456/fitness-recorder-v2).

## 개발 가이드



### 코드 스타일

```bash
yarn prettier --write .
yarn nx lint web --fix
```



### 새 라이브러리

```bash
yarn nx g @nx/js:lib <library-name> \
  --directory=libs/<library-name> \
  --bundler=vite \
  --unitTestRunner=none \
  --linter=eslint \
  --publishable=false \
  --importPath=@fitness-recoder/<library-name>
```

화면·플로우 규칙은 `design-system/fitlog/`를 따릅니다.

## 참고

- [Nx](https://nx.dev)
- [Vite](https://vite.dev)
- [React](https://react.dev)
- [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server)
- [sqlite-wasm](https://sqlite.org/wasm)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui](https://ui.shadcn.com)

