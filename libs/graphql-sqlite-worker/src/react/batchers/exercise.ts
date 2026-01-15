import { ExerciseData } from "@fitness-recoder/structure";
import { Batcher } from "@yornaath/batshit";
import { gql, GraphQLClient } from "graphql-request";
import { Exercise, Fitness } from '../fragment';
import { createBatcher, BatcherOptions } from "./createBatcher";

const query = gql`
query getExerciseListByIds($ids: [Int!]) {
  getExerciseListByIds(ids: $ids) {
    ...Exercise
  }
}
`

/**
 * Exercise 도메인용 배처 Hook
 * 
 * @param graphqlClient GraphQL Client 인스턴스
 * @param options 배처 옵션
 * @returns Exercise 배처 인스턴스
 */
export const useExerciseQueryBatcher = (
  graphqlClient: GraphQLClient,
  options: BatcherOptions = {}
): Batcher<ExerciseData[], number, ExerciseData> => {
  return createBatcher<ExerciseData, number>({
    name: 'exercise',
    query,
    queryName: 'getExerciseListByIds',
    fragment: gql`${Exercise} ${Fitness}`,
    graphqlClient,
    options,
  });
}
