import { ApolloServer, HeaderMap } from '@apollo/server';
import { mergedSchema } from './graphql';

declare const self: ServiceWorkerGlobalScope
export type Version = number

export const version: Version = 1

let apolloServer: ApolloServer<GraphqlContext> | null = null;
/**
 * Service Worker에서 실행되는 GraphQL 서버
 * 실제 구현은 메인 스레드에서 초기화된 서버를 참조해야 합니다.
 */

// Service Worker 등록 및 GraphQL 요청 처리
self.addEventListener('install', (event) => {
  // Service Worker 설치
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Service Worker 활성화
  apolloServer = new ApolloServer({
    schema: mergedSchema,
  });
  event.waitUntil(self.clients.claim());
});

// GraphQL 요청 처리
self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  
  // GraphQL 엔드포인트 확인
  if (url.pathname === '/api/graphql' && event.request.method === 'POST') {
    if (!apolloServer) { return; }
    const headers = new HeaderMap();
    const clientId = event.request.headers.get('X-Client-Id');
    if (!clientId) {
      return new Response('Unauthorized', { status: 401 });
    }
    event.request.headers.forEach((value, key) => {
      headers.set(key, value);
    });
    const response = await apolloServer.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: event.request.method,
        body: event.request.body,
        headers: headers,
        search: url.search,
      },
      context: () => {
        return new Promise((resolve) => {
          resolve({
            client: clientId,
            dbBus: {}
          })
        })
      }
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
