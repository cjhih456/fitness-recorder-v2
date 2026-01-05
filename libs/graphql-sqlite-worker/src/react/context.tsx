import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { SQLiteWorker, type SQLiteWorkerConfig } from '../lib/sqlite-worker';
import { GraphQLServiceWorker } from '../lib/graphql-server';
import { v4 as uuidv4 } from 'uuid';
/**
 * GraphQL SQLite Worker Context의 값 타입
 */
export interface GraphQLSQLiteWorkerContextValue {
  /** Apollo Client */
  client: ApolloClient;
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
  const [clientId] = useState<string>(uuidv4());
  const [client] = useState(() => new ApolloClient({
    link: new BatchHttpLink({
      uri: 'http://localhost:3000/api/graphql',
      batchInterval: 10,
      batchDebounce: true,
      headers: {
        'x-client-id': clientId,
      }
    }),
    cache: new InMemoryCache(),
  }))
  const [worker, setWorker] = useState<SQLiteWorker | null>(null);
  const [graphQLServer, setGraphQLServer] = useState<GraphQLServiceWorker | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

      // MessageChannel 생성
      const dbPort = await sqliteWorker.createMessageChannel();

      // GraphQL Server 생성 및 시작
      const server = new GraphQLServiceWorker({
        onActive: () => {
          // Service Worker에 MessagePort 전달
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(
              {
                type: 'connect-db-port',
                clientId,
              },
              [dbPort]
            );
          }
        }
      });
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
    client,
    worker,
    graphQLServer,
    initialized,
    connected,
    error,
    initialize,
  };

  return (
    <GraphQLSQLiteWorkerContext.Provider value={value}>
      <ApolloProvider client={client}>
        {children}
      </ApolloProvider>
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


