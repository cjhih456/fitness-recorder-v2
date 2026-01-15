import { Fitness } from "@fitness-recoder/structure";
import { Batcher } from "@yornaath/batshit";
import { gql, GraphQLClient } from "graphql-request";
import { Fitness as FitnessFragment } from '../fragment';
import { createBatcher, BatcherOptions } from "./createBatcher";

const query = gql`
query getFitnessListByIds($ids: [Int!]) {
  getFitnessListByIds(ids: $ids) {
    ...Fitness
  }
}
`

/**
 * Fitness 도메인용 배처 Hook
 * 
 * @param graphqlClient GraphQL Client 인스턴스
 * @param options 배처 옵션
 * @returns Fitness 배처 인스턴스
 */
export const useFitnessQueryBatcher = (
  graphqlClient: GraphQLClient,
  options: BatcherOptions = {}
): Batcher<Fitness[], number, Fitness> => {
  return createBatcher<Fitness, number>({
    name: 'fitness',
    query,
    queryName: 'getFitnessListByIds',
    fragment: gql`${FitnessFragment}`,
    graphqlClient,
    options,
  });
}
