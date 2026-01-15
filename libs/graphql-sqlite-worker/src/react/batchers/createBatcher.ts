import { create, windowedFiniteBatchScheduler, keyResolver, Batcher } from "@yornaath/batshit";
import { GraphQLClient, gql } from "graphql-request";

/**
 * 배처 옵션 인터페이스
 */
export interface BatcherOptions {
  /** 시간 윈도우 (밀리초) */
  windowMs?: number;
  /** 최대 배치 크기 */
  maxBatchSize?: number;
}

/**
 * 배처 설정 인터페이스
 */
export interface BatcherConfig<TData, TKey = number> {
  /** 배처 이름 */
  name: string;
  /** GraphQL 쿼리 DocumentNode */
  query: ReturnType<typeof gql>;
  /** GraphQL 쿼리 이름 (예: 'getSetByIds') */
  queryName: string;
  /** 응답 필드명 (기본값: queryName과 동일) */
  responseField?: string;
  /** Fragment DocumentNode (선택적) */
  fragment?: ReturnType<typeof gql>;
  /** GraphQL Client 인스턴스 */
  graphqlClient: GraphQLClient;
  /** 배처 옵션 */
  options?: BatcherOptions;
  /** keyResolver에서 사용할 필드명 (기본값: 'id') */
  keyField?: string;
}

/**
 * 제네릭 배처를 생성하는 팩토리 함수
 * 
 * @template TData 도메인 데이터 타입
 * @template TKey 키 타입 (기본값: number)
 * @param config 배처 설정
 * @returns Batcher 인스턴스
 * 
 * @example
 * ```typescript
 * const setBatcher = createBatcher<SetData, number>({
 *   name: 'set',
 *   query: gql`query getSetByIds($ids: [Int!]) { ... }`,
 *   queryName: 'getSetByIds',
 *   fragment: Set,
 *   graphqlClient,
 *   options: { windowMs: 50, maxBatchSize: 20 }
 * })
 * ```
 */
export function createBatcher<TData, TKey = number>(
  config: BatcherConfig<TData, TKey>
): Batcher<TData[], TKey, TData> {
  const {
    name,
    query,
    queryName,
    fragment,
    responseField = queryName,
    graphqlClient,
    options = {},
    keyField = 'id',
  } = config;

  const { windowMs = 50, maxBatchSize = 20 } = options;

  return create({
    name,
    fetcher: async (keys: TKey[]) => {
      const response = await graphqlClient.request<Record<string, TData[]>>(
        query + fragment,
        { ids: keys }
      );
      return response[responseField];
    },
    resolver: keyResolver<TData[], TKey>(keyField as keyof TData, { indexed: true }),
    scheduler: windowedFiniteBatchScheduler({
      windowMs,
      maxBatchSize,
    }),
  });
}
