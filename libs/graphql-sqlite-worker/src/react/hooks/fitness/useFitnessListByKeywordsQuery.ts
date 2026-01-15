import { useQuery } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import type { Fitness, FitnessCategory, FitnessMuscle } from "@fitness-recoder/structure";
import { gql } from "graphql-request";
import { Fitness as FitnessFragment } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getFitnessListByKeywords($name: String, $category: [ICategory], $muscle: [IMuscle], $limit: Int, $offset: Int) {
    getFitnessListByKeywords(name: $name, category: $category, muscle: $muscle, limit: $limit, offset: $offset) {
      ...Fitness
    }
  }
  ${FitnessFragment}
`

export interface FitnessListByKeywordsParams {
  name?: string;
  category?: FitnessCategory[];
  muscle?: FitnessMuscle[];
  limit?: number;
  offset?: number;
}

export const useFitnessListByKeywordsQuery = (
  params: FitnessListByKeywordsParams,
  options?: Omit<CustomQueryOptions<['fitness', 'byKeywords', FitnessListByKeywordsParams], Fitness[]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['fitness', 'byKeywords', params],
    queryFn: async () => {
      const result = await graphqlClient.request<{ getFitnessListByKeywords: Fitness[] }>(query, params);
      return result.getFitnessListByKeywords;
    },
  })
}
