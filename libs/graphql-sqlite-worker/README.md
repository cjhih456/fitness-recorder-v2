# graphql-sqlite-worker

GraphQL과 SQLite를 Service Worker와 Web Worker를 통해 브라우저에서 실행할 수 있도록 하는 라이브러리입니다.

## 개요

이 라이브러리는 다음과 같은 아키텍처를 제공합니다:

```
메인 스레드 (React App)
  ├── SQLiteWorker (DB Worker 관리)
  ├── GraphQLServiceWorker (Service Worker 관리)
  └── MessageChannel 생성 및 전달
  
Service Worker ← MessagePort1 ─┐
  (GraphQL Server)              ├── MessageChannel
                                 │
DB Worker      ← MessagePort2 ─┘
  (SQLite Database)
```

- **메인 스레드**: React 앱에서 SQLite Worker와 GraphQL Service Worker를 초기화하고 관리
- **Service Worker**: GraphQL 서버를 실행하고 HTTP 요청을 처리
- **DB Worker**: SQLite 데이터베이스를 실행하고 쿼리를 처리
- **MessageChannel**: Service Worker와 DB Worker 간 직접 통신 채널

## 주요 기능

- ✅ 브라우저에서 SQLite 데이터베이스 실행 (Web Worker)
- ✅ Service Worker에서 GraphQL 서버 실행
- ✅ MessageChannel을 통한 Worker 간 직접 통신
- ✅ OPFS(Origin Private File System) 지원
- ✅ React Context를 통한 간편한 통합
- ✅ Apollo Client와의 완전한 통합
- ✅ 클라이언트별 독립적인 데이터베이스 연결

## 설치

```bash
yarn add @fitness-recoder/graphql-sqlite-worker
```

## 사용 방법

### 1. React 앱에 Provider 설정

```tsx
import { GraphQLSQLiteWorkerProvider } from '@fitness-recoder/graphql-sqlite-worker';

function App() {
  return (
    <GraphQLSQLiteWorkerProvider
      workerConfig={{
        dbName: 'fitness.db',
        useOPFS: true, // OPFS 사용 (선택사항)
        initScript: `
          CREATE TABLE IF NOT EXISTS fitness (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
          );
        `,
      }}
      autoInit={true}
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
  const { client, worker, initialized, connected } = useGraphQLSQLiteWorker();

  if (!initialized || !connected) {
    return <div>초기화 중...</div>;
  }

  // Apollo Client를 사용하여 GraphQL 쿼리 실행
  // client는 이미 ApolloProvider에 연결되어 있음
  return <div>준비 완료</div>;
}
```

### 3. GraphQL Resolver에서 DB 사용

Service Worker의 GraphQL resolver에서 `dbBus`를 통해 데이터베이스에 접근할 수 있습니다:

```typescript
// worker/service-worker/graphql/YourModule/repository.ts
export const getItemById: ResponseBuilder<{ id: number }, Item | null> = async (
  { dbBus },
  { id }
) => {
  const result = await dbBus.sendTransaction<Item>(
    'select',
    'SELECT * FROM items WHERE id = ?',
    [id]
  );
  return result[0] || null;
};

export const getItems: ResponseBuilder<{}, Item[]> = async ({ dbBus }) => {
  const result = await dbBus.sendTransaction<Item>(
    'selects',
    'SELECT * FROM items',
    []
  );
  return result || [];
};

export const createItem: ResponseBuilder<{ name: string }, Item> = async (
  { dbBus },
  { name }
) => {
  const result = await dbBus.sendTransaction<Item>(
    'insert',
    'INSERT INTO items (name) VALUES (?)',
    [name]
  );
  return result[0];
};
```

## API

### SQLiteWorker

SQLite 데이터베이스를 관리하는 클래스입니다.

#### 메서드

- `init(): Promise<void>` - Worker 초기화
- `query(sql: string, params: unknown[]): Promise<QueryResult>` - SELECT 쿼리 실행
- `exec(sql: string, params: unknown[]): Promise<void>` - INSERT/UPDATE/DELETE 실행
- `createMessageChannel(): Promise<MessagePort>` - Service Worker와 통신하기 위한 MessageChannel 생성
- `close(): Promise<void>` - Worker 종료
- `getOPFSSupport(): OPFSSupport | null` - OPFS 지원 여부 확인

### GraphQLServiceWorker

Service Worker에서 GraphQL 서버를 실행하는 클래스입니다.

#### 생성자 옵션

```typescript
{
  onActive: (worker: GraphQLServiceWorker) => void;
}
```

Service Worker가 활성화되면 `onActive` 콜백이 호출됩니다.

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

- `select`: 단일 행 조회 (결과 배열의 첫 번째 항목 사용)
- `selects`: 다중 행 조회 (전체 배열 반환)
- `insert`: 데이터 삽입 (삽입된 행 배열 반환)
- `update`: 데이터 수정 (수정된 행 배열 반환)
- `delete`: 데이터 삭제 (삭제된 행 배열 반환)

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
│   └── hooks.ts                      # React Hooks
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
2. `createMessageChannel()` 호출하여 MessageChannel 생성
3. **DB Worker**에 `port2` 전달 (connect-port 메시지)
4. **GraphQLServiceWorker** 생성 및 Service Worker 등록
5. Service Worker 활성화 시 **Service Worker**에 `port1` 전달 (connect-db-port 메시지)
6. 클라이언트 ID를 헤더(`x-client-id`)에 포함하여 요청 전송

### 통신 흐름

```
GraphQL 요청
  ↓
Service Worker (fetch 이벤트)
  ↓
Apollo Server (GraphQL 처리)
  ↓
Resolver (context.dbBus.sendTransaction)
  ↓
MessagePort (MessageChannel)
  ↓
DB Worker (SQLite 쿼리 실행)
  ↓
결과 반환
```

### 클라이언트 식별

각 클라이언트는 고유한 UUID를 가지며, 이는 다음 용도로 사용됩니다:

- Apollo Client 요청 헤더에 `x-client-id`로 포함
- Service Worker에서 클라이언트별 `dbBus` 인스턴스 매핑
- 여러 탭/창에서 독립적인 데이터베이스 연결 보장

## 기술 스택

- **SQLite**: `@sqlite.org/sqlite-wasm` - WebAssembly 기반 SQLite
- **GraphQL**: `@apollo/server` - GraphQL 서버
- **Apollo Client**: `@apollo/client` - GraphQL 클라이언트
- **React**: Context API를 통한 상태 관리
- **타입 검증**: Zod (structure 라이브러리와 통합)
- **스토리지**: OPFS (Origin Private File System) 또는 메모리

## 주요 고려사항

1. **OPFS 지원**: `navigator.storage.getDirectory()` API 사용 가능 여부를 자동 감지
2. **Worker 통신**: MessageChannel을 통한 직접 통신으로 성능 최적화
3. **클라이언트 격리**: 각 클라이언트는 독립적인 데이터베이스 연결을 가짐
4. **Service Worker 범위**: Service Worker는 `/` 범위에서 등록되며 모든 경로를 처리

## 빌드

```bash
yarn nx build graphql-sqlite-worker
```

## 개발

```bash
# 라이브러리 빌드
yarn nx build graphql-sqlite-worker

# 타입 체크
yarn nx type-check graphql-sqlite-worker

# 린트
yarn nx lint graphql-sqlite-worker
```

## 예제

더 자세한 사용 예제는 다음 파일들을 참고하세요:

- `app/web/src/app/pages/index.tsx` - 기본 사용 예제
- `libs/graphql-sqlite-worker/src/worker/service-worker/graphql/` - GraphQL resolver 예제
