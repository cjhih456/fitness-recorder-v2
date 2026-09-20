import type { Fitness, FitnessCategory, FitnessMuscle } from "@fitness-recoder/structure";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Fitness as FitnessFragment } from "../../fragment";
import { CustomInfiniteQueryOptions } from "../types/CustomQueryOptions";
import { flattenInfinitePages, getNextOffsetPageParam } from "../utils/infiniteList";

const query = gql`
  query getFitnessListByKeywords($name: String, $category: [ICategory], $muscle: [IMuscle], $limit: Int!, $offset: Int!) {
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
  limit: number;
}

export const useFitnessListByKeywordsQuery = (
  params: FitnessListByKeywordsParams,
  options?: CustomInfiniteQueryOptions<['fitness', 'byKeywords', FitnessListByKeywordsParams], Fitness[]>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useInfiniteQuery({
    ...options,
    queryKey: ['fitness', 'byKeywords', params],
    initialPageParam: 0,
    getNextPageParam: getNextOffsetPageParam(params.limit),
    queryFn: async ({ pageParam }) => {
      const result = await graphqlClient.request<{ getFitnessListByKeywords: Fitness[] }>(query, {
        ...params,
        offset: pageParam,
      }).catch(e => {
        console.error(e)
        return {
          getFitnessListByKeywords: []
        }
      });
      return result.getFitnessListByKeywords;
    },
    select: flattenInfinitePages,
  })
}
