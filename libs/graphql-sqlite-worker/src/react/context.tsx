import type { SetData, ExerciseData, Fitness } from '@fitness-recoder/structure';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Batcher } from '@yornaath/batshit';
import { GraphQLClient } from 'graphql-request';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { GraphQLServiceWorker, resolveServiceWorkerScope } from '../lib/graphql-server';
import { initializeDatabase, insertInitialFitnessData } from '../lib/init';
import { SQLiteWorker, type SQLiteWorkerConfig } from '../lib/sqlite-worker';
import {
  createSetQueryBatcher,
  createExerciseQueryBatcher,
  createFitnessQueryBatcher,
} from './batchers';

export type GraphQLSQLiteWorkerStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'error';

/**
 * GraphQL SQLite Worker Context의 값 타입
 */
export interface GraphQLSQLiteWorkerContextValue {
  /** Batchers */
  batchers: {
    set: Batcher<SetData[], number, SetData>;
    exercise: Batcher<ExerciseData[], number, ExerciseData>;
    fitness: Batcher<Fitness[], number, Fitness>;
  };
  /** GraphQL Client 설정 */
  graphqlClient: GraphQLClient;
  /** Worker 초기화 함수 */
  initialize: () => Promise<void>;
  /** 초기화 상태 */
  status: GraphQLSQLiteWorkerStatus;
  /** 초기화 실패 시 에러 */
  error: Error | null;
}

/**
 * GraphQL SQLite Worker Context
 */
export const GraphQLSQLiteWorkerContext =
  createContext<GraphQLSQLiteWorkerContextValue | null>(null);

/**
 * Context Provider의 Props
 */
export interface GraphQLSQLiteWorkerProviderProps {
  /** SQLite Worker 설정 */
  workerConfig: SQLiteWorkerConfig;
  /** 자동 초기화 여부 */
  autoInit?: boolean;
  /** 개발 환경 여부 */
  isDev?: boolean;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** Service Worker URL */
  serviceWorkerUrl: string;
  /** ready 전 표시할 fallback UI */
  fallback?: ReactNode;
  /** 초기화 실패 시 표시할 UI */
  errorFallback?: (props: {
    error: Error | null;
    retry: () => void;
  }) => ReactNode;
}

const DefaultFallback = () => (
  <div aria-busy="true" aria-label="로딩 중">
    Loading…
  </div>
);

/**
 * GraphQL SQLite Worker Provider 컴포넌트
 */
export function GraphQLSQLiteWorkerProvider({
  workerConfig,
  autoInit = true,
  isDev = false,
  children,
  serviceWorkerUrl,
  fallback,
  errorFallback,
}: GraphQLSQLiteWorkerProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache(),
        defaultOptions: {
          queries: {
            notifyOnChangeProps: ['data', 'error'],
          },
        },
      })
  );
  const [status, setStatus] = useState<GraphQLSQLiteWorkerStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const worker = useRef<SQLiteWorker | null>(null);
  const graphQLServer = useRef<GraphQLServiceWorker | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  const graphqlClient = useRef<GraphQLClient>(
    new GraphQLClient(window.location.origin + '/api/graphql')
  );

  const batchers = useRef({
    set: createSetQueryBatcher(graphqlClient.current),
    exercise: createExerciseQueryBatcher(graphqlClient.current),
    fitness: createFitnessQueryBatcher(graphqlClient.current),
  });

  /**
   * Worker를 초기화합니다.
   */
  const initialize = useCallback(async () => {
    if (initPromiseRef.current) {
      return initPromiseRef.current;
    }

    initPromiseRef.current = (async () => {
      setStatus('initializing');
      setError(null);
      try {
        if (!worker.current) {
          worker.current = new SQLiteWorker(workerConfig);
          await worker.current.init();
          await initializeDatabase(worker.current, workerConfig);
          await insertInitialFitnessData(worker.current);
        }
        if (!graphQLServer.current) {
          const server = new GraphQLServiceWorker({
            serviceWorkerUrl,
            scope: isDev ? '/' : resolveServiceWorkerScope(serviceWorkerUrl, document.baseURI),
          });
          graphQLServer.current = server;
          await server.whenReady();
        }
        setStatus('ready');
      } catch (err) {
        initPromiseRef.current = null;
        const nextError =
          err instanceof Error
            ? err
            : new Error(
                'Failed to initialize GraphQL SQLite Worker:' + String(err)
              );
        setError(nextError);
        setStatus('error');
        throw nextError;
      }
    })();

    return initPromiseRef.current;
  }, [workerConfig, serviceWorkerUrl, isDev]);

  /**
   * 자동 초기화
   * 자동 초기화
   */
  useEffect(() => {
    if (autoInit) {
      void initialize().catch(() => {
        // 에러는 status/error state에 반영됨
      });
    }
  }, [autoInit, initialize]);

  const value: GraphQLSQLiteWorkerContextValue = {
    batchers: batchers.current,
    graphqlClient: graphqlClient.current,
    initialize,
    status,
    error,
  };

  let content: ReactNode;
  if (status === 'ready') {
    content = children;
  } else if (status === 'error') {
    console.error(error);
    const retry = () => {
      void initialize();
    };
    content = errorFallback ? (
      errorFallback({ error, retry })
    ) : (
      <div role="alert">
        <p>{error?.message ?? 'Failed to initialize database'}</p>
        <p>{error?.stack ?? ''}</p>
        <button type="button" onClick={retry}>
          재시도
        </button>
      </div>
    );
  } else {
    content = fallback ?? <DefaultFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GraphQLSQLiteWorkerContext.Provider value={value}>
        {content}
      </GraphQLSQLiteWorkerContext.Provider>
    </QueryClientProvider>
  );
}

/**
 * Context를 사용하는 Hook
 */
export function useGraphQLSQLiteWorker(): GraphQLSQLiteWorkerContextValue {
  const context = useContext(GraphQLSQLiteWorkerContext);
  if (!context) {
    throw new Error(
      'useGraphQLSQLiteWorker must be used within a GraphQLSQLiteWorkerProvider'
    );
  }
  return context;
}
