import type { ExerciseData } from "@fitness-recoder/structure";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomInfiniteQueryOptions } from "../types/CustomQueryOptions";
import {
  DEFAULT_LIST_PAGE_SIZE,
  flattenInfinitePages,
  getNextOffsetPageParam,
  useFetchRemainingPages,
} from "../utils/infiniteList";

const query = gql`
  query getExerciseListByExercisePresetId($exercisePresetId: Int, $offset: Int!, $size: Int!) {
    getExerciseListByExercisePresetId(exercisePresetId: $exercisePresetId, offset: $offset, size: $size) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export const useExerciseListByExercisePresetIdQuery = (
  exercisePresetId: number | undefined,
  options?: CustomInfiniteQueryOptions<
    ['exercise', 'byExercisePresetId', number | undefined, number],
    ExerciseData[]
  > & { size?: number }
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const { size = DEFAULT_LIST_PAGE_SIZE, ...queryOptions } = options ?? {};
  const result = useInfiniteQuery({
    ...queryOptions,
    queryKey: ['exercise', 'byExercisePresetId', exercisePresetId, size],
    initialPageParam: 0,
    getNextPageParam: getNextOffsetPageParam(size),
    queryFn: async ({ pageParam }) => {
      if (exercisePresetId === undefined) return [];
      const page = await graphqlClient.request<{ getExerciseListByExercisePresetId: ExerciseData[] }>(query, {
        exercisePresetId,
        offset: pageParam,
        size,
      }).catch(e => {
        console.error(e)
        return {
          getExerciseListByExercisePresetId: []
        }
      });
      return page.getExerciseListByExercisePresetId;
    },
    enabled: exercisePresetId !== undefined && (queryOptions.enabled ?? true),
    select: flattenInfinitePages,
  })
  useFetchRemainingPages(result)
  return result
}
