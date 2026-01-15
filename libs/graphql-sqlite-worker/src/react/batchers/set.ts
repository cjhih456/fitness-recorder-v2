import { SetData } from "@fitness-recoder/structure";
import { Set } from '../fragment';
import { gql, GraphQLClient } from "graphql-request";
import { createBatcher, BatcherOptions } from "./createBatcher";
import { Batcher } from "@yornaath/batshit";


const query = gql`
query getSetByIds($ids: [Int!]) {
  getSetByIds(ids: $ids) {
    ...Set
  }
}
`

/**
 * Set 도메인용 배처 Hook
 * 
 * @param graphqlClient GraphQL Client 인스턴스
 * @param options 배처 옵션
 * @returns Set 배처 인스턴스
 */
export const useSetQueryBatcher = (
  graphqlClient: GraphQLClient,
  options: BatcherOptions = {}
): Batcher<SetData[], number, SetData> => {
  return createBatcher<SetData, number>({
    name: 'set',
    query,
    queryName: 'getSetByIds',
    fragment: gql`${Set}`,
    graphqlClient,
    options,
  });
}
