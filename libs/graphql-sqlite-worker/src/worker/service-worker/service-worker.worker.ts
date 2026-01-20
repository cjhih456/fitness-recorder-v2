import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { mergedSchema } from './graphql';

declare const self: ServiceWorkerGlobalScope
export type Version = number

export const version: Version = 1

let yogaServer: YogaServerInstance<GraphqlContext, GraphqlContext> | null = null;
const broadcastChannel = new BroadcastChannel('graphql-sqlite-worker');
const dbBus = createDbBusWrapper(broadcastChannel)

/**
 * Service Worker에서 실행되는 GraphQL 서버
 * 실제 구현은 메인 스레드에서 초기화된 서버를 참조해야 합니다.
 */

/**
 * MessagePort를 통해 DB Worker와 통신하는 dbBus 래퍼 객체를 생성합니다.
 */
function createDbBusWrapper(port: BroadcastChannel): DBBus {
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
  if(!yogaServer) {
    yogaServer = createYoga<GraphqlContext, GraphqlContext>({
      schema: mergedSchema,
      batching: true,
      healthCheckEndpoint: '/health'
    });
  }
  event.waitUntil(self.clients.claim());
});

// GraphQL 요청 처리
self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  
  // GraphQL 엔드포인트 확인
  if (url.pathname.includes('/api/graphql') && yogaServer) {
    return event.respondWith(yogaServer.handleRequest(event.request, {
      dbBus
    }))
  } else if (event.request.url.includes('.wasm') || event.request.url.includes('.js')){
    if (!(event.request.url.startsWith('https://') || event.request.url.startsWith('http://'))) {
      return
    }
    const cache = await caches.open('fitness-recorder-caches');
    const matched = await cache.match(event.request)
    if (matched) {
      try {
        return event.respondWith(matched);
      } catch {
        await cache.delete(event.request)
      }
    }
    const response = await fetch(event.request)
    const clonedResponse = response.clone()
    try {
      cache.put(event.request, clonedResponse)
      return event.respondWith(response)
    } catch {
      await cache.delete(event.request)
    }
  }
});
