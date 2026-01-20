import type { SetData, ExerciseData, Fitness } from '@fitness-recoder/structure';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Batcher } from '@yornaath/batshit';
import { GraphQLClient } from 'graphql-request'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { GraphQLServiceWorker } from '../lib/graphql-server';
import { SQLiteWorker, type SQLiteWorkerConfig } from '../lib/sqlite-worker';
import { createSetQueryBatcher, createExerciseQueryBatcher, createFitnessQueryBatcher } from './batchers';

/**
 * GraphQL SQLite Worker Context의 값 타입
 */
export interface GraphQLSQLiteWorkerContextValue {
  /** Batchers */
  batchers: { 
    set: Batcher<SetData[], number, SetData>
    exercise: Batcher<ExerciseData[], number, ExerciseData>
    fitness: Batcher<Fitness[], number, Fitness>
  };
  /** GraphQL Client 설정 */
  graphqlClient: GraphQLClient;
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
  /** Service Worker URL */
  serviceWorkerUrl: string;
}

/**
 * GraphQL SQLite Worker Provider 컴포넌트
 */
export function GraphQLSQLiteWorkerProvider({
  workerConfig,
  autoInit = true,
  children,
  serviceWorkerUrl,
}: GraphQLSQLiteWorkerProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache(),
    defaultOptions: {
      queries: {
        notifyOnChangeProps: ['data', 'error']
      }
    }
  }))
  const worker = useRef<SQLiteWorker | null>(null);
  const graphQLServer = useRef<GraphQLServiceWorker | null>(null);
  
  const graphqlClient = useRef<GraphQLClient>(new GraphQLClient('/api/graphql'));

  const batchers = useRef({
    set: createSetQueryBatcher(graphqlClient.current),
    exercise: createExerciseQueryBatcher(graphqlClient.current),
    fitness: createFitnessQueryBatcher(graphqlClient.current),
  })

  /**
   * Worker를 초기화합니다.
   */
  const initialize = useCallback(async () => {
    try {
      if (!worker.current) {
        worker.current = new SQLiteWorker(workerConfig);
        await worker.current.init();
      }
      if(!graphQLServer.current) {
        const server = new GraphQLServiceWorker({
          serviceWorkerUrl: serviceWorkerUrl,
        });
        graphQLServer.current = server;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw error;
    }
  }, [workerConfig, serviceWorkerUrl]);

  /**
   * 자동 초기화
   */
  useEffect(() => {
    if (autoInit && !worker.current) {
      initialize().catch((err) => {
        console.error('Failed to initialize GraphQL SQLite Worker:', err);
      });
    }
  }, [autoInit, initialize]);

  const value: GraphQLSQLiteWorkerContextValue = {
    batchers: batchers.current,
    graphqlClient: graphqlClient.current,
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


