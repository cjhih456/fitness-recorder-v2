import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SQLiteWorker, type SQLiteWorkerConfig } from '../lib/sqlite-worker';
import { GraphQLServiceWorker } from '../lib/graphql-server';
import { GraphQLClient } from 'graphql-request'
import type { SetData } from '@fitness-recoder/structure';
import { Batcher } from '@yornaath/batshit';
import { useSetQueryBatcher } from './batchers';

/**
 * GraphQL SQLite Worker Context의 값 타입
 */
export interface GraphQLSQLiteWorkerContextValue {
  /** Batchers */
  batchers: { 
    set: Batcher<SetData[], number, SetData>
  };
  /** QueryClient */
  graphqlClient: GraphQLClient;
  /** SQLite Worker 인스턴스 */
  worker: SQLiteWorker | null;
  /** GraphQL Service Worker 인스턴스 */
  graphQLServer: GraphQLServiceWorker | null;
  /** 초기화 상태 */
  initialized: boolean;
  /** 연결 상태 */
  connected: boolean;
  /** 에러 상태 */
  error: Error | null;
  /** Worker 초기화 함수 */
  initialize: () => Promise<void>;
}

/**
 * GraphQL SQLite Worker Context
 */
export const GraphQLSQLiteWorkerContext = createContext<GraphQLSQLiteWorkerContextValue | null>(
  null
);

/**
 * Context Provider의 Props
 */
export interface GraphQLSQLiteWorkerProviderProps {

  /** SQLite Worker 설정 */
  workerConfig: SQLiteWorkerConfig;
  /** 자동 초기화 여부 */
  autoInit?: boolean;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
}

/**
 * GraphQL SQLite Worker Provider 컴포넌트
 */
export function GraphQLSQLiteWorkerProvider({
  workerConfig,
  autoInit = true,
  children,
}: GraphQLSQLiteWorkerProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache(),
    defaultOptions: {
      queries: {
        notifyOnChangeProps: ['data', 'error']
      }
    }
  }))
  const [worker, setWorker] = useState<SQLiteWorker | null>(null);
  const [graphQLServer, setGraphQLServer] = useState<GraphQLServiceWorker | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const [graphqlClient] = useState(() => new GraphQLClient('/api/graphql'));

  /**
   * Worker를 초기화합니다.
   */
  const initialize = useCallback(async () => {
    try {
      setError(null);
      setConnected(false);

      // SQLite Worker 생성 및 초기화
      const sqliteWorker = new SQLiteWorker(workerConfig);
      await sqliteWorker.init();
      setWorker(sqliteWorker);

      // GraphQL Server 생성 및 시작
      const server = new GraphQLServiceWorker();
      setGraphQLServer(server);

      setInitialized(true);
      setConnected(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setConnected(false);
      setInitialized(false);
      throw error;
    }
  }, [workerConfig]);

  /**
   * 자동 초기화
   */
  useEffect(() => {
    if (autoInit && !initialized) {
      initialize().catch((err) => {
        console.error('Failed to initialize GraphQL SQLite Worker:', err);
      });
    }
  }, [autoInit, initialized, initialize]);

  /**
   * 정리 함수
   */
  useEffect(() => {
    return () => {
      if (worker) {
        worker.close().catch(console.error);
      }
    };
  }, [worker]);

  const value: GraphQLSQLiteWorkerContextValue = {
    batchers: {
      set: useSetQueryBatcher(graphqlClient),
    },
    graphqlClient,
    worker,
    graphQLServer,
    initialized,
    connected,
    error,
    initialize,
  };

  return (
    <GraphQLSQLiteWorkerContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GraphQLSQLiteWorkerContext.Provider>
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


