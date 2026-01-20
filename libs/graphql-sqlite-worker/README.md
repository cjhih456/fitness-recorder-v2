# graphql-sqlite-worker

GraphQL과 SQLite를 Service Worker와 Web Worker를 통해 브라우저에서 실행할 수 있도록 하는 라이브러리입니다.

## 개요

이 라이브러리는 다음과 같은 아키텍처를 제공합니다:

```
메인 스레드 (React App)
  ├── SQLiteWorker (DB Worker 생성 및 관리)
  └── GraphQLServiceWorker (Service Worker 등록 및 관리)
  
Service Worker          DB Worker
(GraphQL Server)        (SQLite Database)
      │                      │
      └─── BroadcastChannel ─┘
           (채널명: 'graphql-sqlite-worker')
```

- **메인 스레드**: React 앱에서 SQLite Worker와 GraphQL Service Worker를 초기화하고 관리
- **Service Worker**: GraphQL 서버를 실행하고 HTTP 요청을 처리
- **DB Worker**: SQLite 데이터베이스를 실행하고 쿼리를 처리
- **BroadcastChannel**: Service Worker와 DB Worker 간 직접 통신 채널

## 주요 기능

- ✅ 브라우저에서 SQLite 데이터베이스 실행 (Web Worker)
- ✅ Service Worker에서 GraphQL 서버 실행
- ✅ BroadcastChannel을 통한 Worker 간 통신
- ✅ OPFS(Origin Private File System) 지원
- ✅ React Context를 통한 간편한 통합
- ✅ React Query와의 완전한 통합
- ✅ 클라이언트별 독립적인 데이터베이스 연결

## 설치

```bash
yarn add @fitness-recoder/graphql-sqlite-worker
```

## 사용 방법

### 1. React 앱에 Provider 설정

```tsx
import { GraphQLSQLiteWorkerProvider } from '@fitness-recoder/graphql-sqlite-worker';
import DbWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/dbWorker?worker&url';
import ServiceWorkerUrl from '@fitness-recoder/graphql-sqlite-worker/serviceWorker?worker&url';

function App() {
  return (
    <GraphQLSQLiteWorkerProvider
      workerConfig={{
        dbName: 'fitness.db',
        dbWorkerUrl: DbWorkerUrl
      }}
      autoInit={true}
      serviceWorkerUrl={ServiceWorkerUrl}
    >
      <YourApp />
    </GraphQLSQLiteWorkerProvider>
  );
}
```

### 2. Context Hook 사용

```tsx
import { useGraphQLSQLiteWorker } from '@fitness-recoder/graphql-sqlite-worker';

function YourComponent() {
  const { graphqlClient, batchers, initialize } = useGraphQLSQLiteWorker();

  // GraphQL Client를 사용하여 GraphQL 쿼리 실행
  // batchers를 사용하여 배치 쿼리 최적화 가능
  return <div>준비 완료</div>;
}
```

### 3. GraphQL Resolver에서 DB 사용

Service Worker의 GraphQL resolver에서 `dbBus`를 통해 데이터베이스에 접근할 수 있습니다:

#### Repository 패턴 사용 예제

```typescript
// worker/service-worker/graphql/YourModule/repository.ts
import type { ResponseBuilder } from '@fitness-recoder/graphql-sqlite-worker';

// 단일 항목 조회
export const getItemById: ResponseBuilder<{ id: number }, Item | null> = async (
  { dbBus },
  { id }
) => {
  const result = await dbBus.sendTransaction<Item>(
    'select',
    'SELECT * FROM items WHERE id = ?',
    [id]
  );
  // 'select' 타입은 배열을 반환하며, 첫 번째 항목을 사용
  return result[0] || null;
};

// 다중 항목 조회
export const getItems: ResponseBuilder<{}, Item[]> = async ({ dbBus }) => {
  const result = await dbBus.sendTransaction<Item>(
    'selects',
    'SELECT * FROM items',
    []
  );
  // 'selects' 타입은 전체 배열을 반환
  return result || [];
};

// 데이터 삽입
export const createItem: ResponseBuilder<{ name: string }, Item> = async (
  { dbBus },
  { name }
) => {
  const result = await dbBus.sendTransaction<Item>(
    'insert',
    'INSERT INTO items (name) VALUES (?) RETURNING *',
    [name]
  );
  // INSERT는 삽입된 행을 반환 (RETURNING * 사용 시)
  return result[0];
};

// 데이터 수정
export const updateItem: ResponseBuilder<{ id: number; name: string }, Item> = async (
  { dbBus },
  { id, name }
) => {
  const result = await dbBus.sendTransaction<Item>(
    'update',
    'UPDATE items SET name = ? WHERE id = ? RETURNING *',
    [name, id]
  );
  return result[0];
};

// 데이터 삭제
export const deleteItem: ResponseBuilder<{ id: number }, void> = async (
  { dbBus },
  { id }
) => {
  await dbBus.sendTransaction(
    'delete',
    'DELETE FROM items WHERE id = ?',
    [id]
  );
};
```

#### Resolver에서 Repository 사용 예제

```typescript
// worker/service-worker/graphql/YourModule/resolvers.ts
import type { ResponseResolver } from '@fitness-recoder/graphql-sqlite-worker';
import { getItemById, getItems, createItem } from './repository';

export default (): IResolvers<unknown, GraphqlContext> => {
  const getItemByIdShell: ResponseResolver<{ id: number }, Item | null> = async (
    _,
    { id },
    context
  ) => {
    return await getItemById(context, { id });
  };

  const getItemsShell: ResponseResolver<{}, Item[]> = async (_, __, context) => {
    return await getItems(context, {});
  };

  const createItemShell: ResponseResolver<{ name: string }, Item> = async (
    _,
    { name },
    context
  ) => {
    return await createItem(context, { name });
  };

  return {
    Query: {
      getItemById: getItemByIdShell,
      getItems: getItemsShell,
    },
    Mutation: {
      createItem: createItemShell,
    },
  };
};
```

## API

### SQLiteWorker

SQLite 데이터베이스를 관리하는 클래스입니다.

#### 메서드

- `init(): Promise<void>` - Worker 초기화 및 데이터베이스 초기화
- `query(sql: string, params: unknown[]): Promise<QueryResult>` - SELECT 쿼리 실행
- `exec(sql: string, params: unknown[]): Promise<void>` - INSERT/UPDATE/DELETE 실행
- `close(): Promise<void>` - Worker 종료 및 리소스 정리

### GraphQLServiceWorker

Service Worker에서 GraphQL 서버를 실행하는 클래스입니다.

#### 생성자 옵션

```typescript
{
  serviceWorkerUrl: string;
  onActive?: (worker: GraphQLServiceWorker) => void;
}
```

- `serviceWorkerUrl`: Service Worker 스크립트의 URL
- `onActive`: Service Worker가 활성화되면 호출되는 선택적 콜백

#### 속성

- `registration: ServiceWorkerRegistration | null` - Service Worker 등록 객체
- `worker: ServiceWorker | null` - 현재 활성화된 Service Worker 인스턴스
- `isActive: boolean` - Service Worker 활성화 여부

### DBBus

GraphQL resolver의 context에서 제공되는 데이터베이스 접근 인터페이스입니다.

#### sendTransaction

```typescript
sendTransaction<T>(
  type: 'select' | 'selects' | 'insert' | 'update' | 'delete',
  sql: string,
  params: unknown[]
): Promise<T[]>
```

**파라미터:**
- `type`: 트랜잭션 타입
  - `'select'`: 단일 행 조회 (결과 배열의 첫 번째 항목 사용)
  - `'selects'`: 다중 행 조회 (전체 배열 반환)
  - `'insert'`: 데이터 삽입 (삽입된 행 배열 반환, RETURNING * 필요)
  - `'update'`: 데이터 수정 (수정된 행 배열 반환, RETURNING * 필요)
  - `'delete'`: 데이터 삭제 (삭제된 행 배열 반환, RETURNING * 필요)
- `sql`: 실행할 SQL 쿼리 (prepared statement 사용 권장)
- `params`: SQL 파라미터 배열

**반환값:**
- `Promise<T[]>`: 쿼리 결과 배열
  - `'select'`의 경우: 단일 행 또는 빈 배열
  - `'selects'`의 경우: 다중 행 또는 빈 배열
  - `'insert'`/`'update'`/`'delete'`의 경우: RETURNING 절이 있을 때만 결과 반환

**참고사항:**
- SQL Injection 방지를 위해 항상 prepared statement (`?` 플레이스홀더) 사용
- `'insert'`, `'update'`, `'delete'`에서 결과를 받으려면 SQL에 `RETURNING *` 절 추가 필요
- 타임아웃: 30초 (응답 없을 경우 자동 실패)

## 파일 구조

```
libs/graphql-sqlite-worker/src/
├── index.ts                          # 메인 export
├── lib/
│   ├── sqlite-worker.ts              # SQLite Worker 핵심 클래스
│   ├── graphql-server.ts             # GraphQL Service Worker 클래스
│   ├── types.ts                      # 공통 타입 정의
│   └── migration.ts                  # 마이그레이션 시스템
├── react/
│   ├── context.tsx                   # React Context 및 Provider
│   ├── batchers/                     # GraphQL 쿼리 배처
│   │   ├── createBatcher.ts
│   │   ├── exercise.ts
│   │   ├── fitness.ts
│   │   └── set.ts
│   ├── fragment/                     # GraphQL Fragment 정의
│   └── hooks/                        # React Hooks (각 모듈별)
│       ├── exercise/
│       ├── exercise-preset/
│       ├── fitness/
│       ├── schedule/
│       └── set/
├── worker/
│   ├── db-worker.worker.ts           # DB Worker 스크립트
│   └── service-worker/
│       ├── service-worker.worker.ts  # Service Worker 스크립트
│       └── graphql/                  # GraphQL 스키마 및 resolver
│           ├── Exercise/
│           ├── ExercisePreset/
│           ├── Fitness/
│           ├── Schedule/
│           ├── Sets/
│           └── index.ts
└── types/
    └── gql.d.ts                      # GraphQL 타입 정의
```

## 아키텍처 상세

### 초기화 과정

1. **메인 스레드**에서 `SQLiteWorker` 생성 및 초기화
   - DB Worker 생성 및 데이터베이스 초기화
   - 마이그레이션 실행 (필요한 경우)
2. **메인 스레드**에서 `GraphQLServiceWorker` 생성 및 Service Worker 등록
   - Service Worker 스크립트 등록
   - 활성화 대기 및 콜백 호출
3. **Service Worker**와 **DB Worker**는 `BroadcastChannel`을 통해 통신
   - 동일한 채널 이름(`graphql-sqlite-worker`) 사용
   - 메시지 기반 통신으로 요청/응답 처리

### 통신 흐름

```
GraphQL 요청
  ↓
Service Worker (fetch 이벤트)
  ↓
GraphQL Yoga (GraphQL 처리)
  ↓
Resolver (context.dbBus.sendTransaction)
  ↓
BroadcastChannel (메시지 전송)
  ↓
DB Worker (SQLite 쿼리 실행)
  ↓
BroadcastChannel (응답 전송)
  ↓
Service Worker (결과 반환)
  ↓
클라이언트 (GraphQL 응답)
```

### 통신 방식

- **BroadcastChannel**: Service Worker와 DB Worker 간 통신에 사용
  - 동일한 채널 이름으로 모든 Worker가 연결
  - 메시지 ID를 통한 요청/응답 매칭
  - 타임아웃 처리 (30초)

### 클라이언트 격리

현재 구현에서는 각 탭/창이 독립적인 DB Worker 인스턴스를 가지며, Service Worker는 단일 인스턴스로 모든 요청을 처리합니다. 향후 멀티 클라이언트 지원을 위한 확장 가능한 구조입니다.

## 기술 스택

- **SQLite**: `@sqlite.org/sqlite-wasm` - WebAssembly 기반 SQLite
- **GraphQL**: `graphql-yoga` - GraphQL 서버
- **React Query**: `@tanstack/react-query` - GraphQL 데이터 페칭 및 캐싱
- **GraphQL Request**: `graphql-request` - GraphQL 클라이언트
- **Batching**: `@yornaath/batshit` - GraphQL 쿼리 배치 처리
- **React**: Context API를 통한 상태 관리
- **타입 검증**: Zod (structure 라이브러리와 통합)
- **스토리지**: OPFS (Origin Private File System) 또는 메모리

## 주요 고려사항

1. **OPFS 지원**: `@sqlite.org/sqlite-wasm`의 `OpfsDb` 클래스 사용 가능 여부를 자동 감지하여 사용
2. **Worker 통신**: BroadcastChannel을 통한 통신으로 Service Worker와 DB Worker 간 메시지 교환
3. **데이터베이스 초기화**: Worker 초기화 시 자동으로 테이블 생성 및 마이그레이션 실행
4. **Service Worker 범위**: Service Worker는 `/` 범위에서 등록되며 `/api/graphql` 경로의 요청을 처리
5. **에러 처리**: 모든 Worker 통신은 타임아웃(30초)과 에러 핸들링을 포함
6. **마이그레이션 시스템**: 버전 기반 마이그레이션 시스템으로 스키마 업데이트 지원

## 빌드

```bash
yarn nx build @fitness-recorder/graphql-sqlite-worker
```

## 개발

```bash
# 라이브러리 빌드
yarn nx build @fitness-recorder/graphql-sqlite-worker

# 타입 체크
yarn nx type-check @fitness-recorder/graphql-sqlite-worker

# 린트
yarn nx lint @fitness-recorder/graphql-sqlite-worker
```

## 마이그레이션

라이브러리는 버전 기반 마이그레이션 시스템을 제공합니다. 데이터베이스 스키마 변경 시 마이그레이션 스크립트를 작성하여 버전 업데이트를 수행할 수 있습니다.

### 마이그레이션 파일 생성

```typescript
// libs/graphql-sqlite-worker/src/lib/migrations/1.4.0.ts
import type { MigrationScript } from '../migration';

export const migration_1_4_0: MigrationScript = {
  version: 14, // 버전은 숫자로 지정 (1.4.0 -> 14)
  description: '새로운 컬럼 추가',
  up: async (worker) => {
    await worker.exec(
      'ALTER TABLE items ADD COLUMN description TEXT'
    );
  },
  // 선택적: 롤백 스크립트
  down: async (worker) => {
    // SQLite는 ALTER TABLE DROP COLUMN을 직접 지원하지 않으므로
    // 테이블 재생성이 필요할 수 있습니다
  },
};
```

**주의사항:**
- `version` 필드는 숫자로 지정됩니다 (예: `1.4.0` -> `14`, `1.3.0` -> `13`)
- 마이그레이션은 버전 순서대로 자동 실행됩니다
- `up` 함수는 필수이며, `down` 함수는 선택사항입니다
- 트랜잭션은 자동으로 관리됩니다 (실패 시 자동 롤백)

### 마이그레이션 등록

```typescript
// libs/graphql-sqlite-worker/src/lib/migrations/index.ts
import { migration_1_4_0 } from './1.4.0';

export const getAllMigrations = () => [
  migration_1_4_0,
  // 다른 마이그레이션들...
];
```

마이그레이션은 데이터베이스 초기화 시 자동으로 실행됩니다.

## 예제

더 자세한 사용 예제는 다음 파일들을 참고하세요:

- `app/web/src/app/app.tsx` - 기본 Provider 설정 예제
- `libs/graphql-sqlite-worker/src/worker/service-worker/graphql/` - GraphQL resolver 예제
- `libs/graphql-sqlite-worker/src/react/hooks/` - React Hook 사용 예제
