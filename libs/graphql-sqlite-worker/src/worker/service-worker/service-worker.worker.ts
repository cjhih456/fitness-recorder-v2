import { createYoga, type YogaServerInstance } from 'graphql-yoga';
import { createDbBusWrapper } from '../../lib/create-db-bus';
import { mergedSchema } from './graphql';

declare const self: ServiceWorkerGlobalScope;
export type Version = number;

export const version: Version = 1;

let yogaServer: YogaServerInstance<GraphqlContext, GraphqlContext> | null =
  null;
const broadcastChannel = new BroadcastChannel('graphql-sqlite-worker');
const dbBus = createDbBusWrapper(broadcastChannel);

/**
 * Service Worker에서 실행되는 GraphQL 서버
 */

// Service Worker 등록 및 GraphQL 요청 처리
self.addEventListener('install', () => {
  // Service Worker 설치
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (!yogaServer) {
    yogaServer = createYoga<GraphqlContext, GraphqlContext>({
      schema: mergedSchema,
      batching: true,
      healthCheckEndpoint: '/health',
    });
  }
  event.waitUntil(self.clients.claim());
});

// GraphQL 요청 처리
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // GraphQL 엔드포인트 확인
  if (url.pathname.includes('/api/graphql') && yogaServer) {
    event.respondWith(
      yogaServer.handleRequest(event.request, {
        dbBus,
      })
    );
  } else if (url.pathname.endsWith('.wasm')) {
    event.respondWith(respondWithWasm(event.request));
  }
});

async function respondWithWasm(request: Request): Promise<Response> {
  const cache = await caches.open('fitness-recorder-caches');
  const cached = await cache.match(request);
  if (cached?.headers.get('content-type')?.includes('application/wasm')) {
    return cached;
  }
  if (cached) {
    await cache.delete(request);
  }
  const response = await fetch(request);
  if (
    response.ok &&
    response.headers.get('content-type')?.includes('application/wasm')
  ) {
    await cache.put(request, response.clone());
  }
  return response;
}
