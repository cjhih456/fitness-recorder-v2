import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { mergedSchema } from './graphql';

declare const self: ServiceWorkerGlobalScope
export type Version = number

export const version: Version = 1

let yogaServer: YogaServerInstance<GraphqlContext, GraphqlContext> | null = null;

const relationWithClientTemp = new Map<string, DBBus>();
const dbBus = new WeakMap<Client, DBBus>();
/**
 * Service Worker에서 실행되는 GraphQL 서버
 * 실제 구현은 메인 스레드에서 초기화된 서버를 참조해야 합니다.
 */

/**
 * MessagePort를 통해 DB Worker와 통신하는 dbBus 래퍼 객체를 생성합니다.
 */
function createDbBusWrapper(port: MessagePort): DBBus {
  return {
    sendTransaction: <T = unknown>(
      type: 'select' | 'selects' | 'insert' | 'update' | 'delete',
      sql: string,
      params: unknown[]
    ): Promise<T[]> => {
      return new Promise((resolve, reject) => {
        const id = `${Date.now()}-${Math.random().toString(36)}`;
        
        const messageType = type === 'select' || type === 'selects' ? 'query' : 'exec';
        
        const handler = (event: MessageEvent) => {
          const response = event.data;
          if (response.id === id) {
            port.removeEventListener('message', handler);
            if (response.success) {
              resolve(response.data as T[]);
            } else {
              reject(new Error(response.error || 'Unknown error'));
            }
          }
        };

        port.addEventListener('message', handler);
        port.postMessage({
          id,
          type: messageType,
          payload: { sql, params },
        });

        // 타임아웃 설정 (30초)
        setTimeout(() => {
          port.removeEventListener('message', handler);
          reject(new Error('DB Worker message timeout'));
        }, 30000);
      });
    },
  };
}

// Service Worker 등록 및 GraphQL 요청 처리
self.addEventListener('install', () => {
  // Service Worker 설치
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Service Worker 활성화
  yogaServer = createYoga<GraphqlContext, GraphqlContext>({
    schema: mergedSchema,
  });
  event.waitUntil(self.clients.claim());
});

// 메인 스레드로부터 MessagePort 수신
self.addEventListener('message', (event) => {
  
  if (event.data?.type === 'connect-db-port' && event.ports && event.ports.length > 0) {
    const port = event.ports[0];
    relationWithClientTemp.set(event.data.clientId, createDbBusWrapper(port));
  }
});


// GraphQL 요청 처리
self.addEventListener('fetch', async (event) => {
  const client = await self.clients.get(event.clientId)
  if(!client) { return }

  if(!dbBus.has(client)) {
    const clientId = event.request.headers.get('x-client-id')
    if(!clientId) { return }
    const dbBusWrapper = relationWithClientTemp.get(clientId)
    if(!dbBusWrapper) { return }
    dbBus.set(client, dbBusWrapper);
  }
  
  const url = new URL(event.request.url);
  
  // GraphQL 엔드포인트 확인
  if (url.pathname === '/api/graphql' && event.request.method === 'POST') {
    if (!yogaServer) { return; }
    const dbBusWrapper = dbBus.get(client)
    if(!dbBusWrapper) { return }

    const headers = new Headers();
    event.request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    const response = await yogaServer.handle(event.request, {
      dbBus: dbBusWrapper
    })
    const responseHeader = new Headers();
    response.headers.forEach((value, key) => {
      responseHeader.set(key, value);
    });
    event.respondWith(new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: responseHeader
    }));
  }
});
