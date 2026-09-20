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
  query getExerciseListByScheduleId($scheduleId: Int, $offset: Int!, $size: Int!) {
    getExerciseListByScheduleId(scheduleId: $scheduleId, offset: $offset, size: $size) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export const useExerciseListByScheduleIdQuery = (
  scheduleId: number | undefined,
  options?: CustomInfiniteQueryOptions<
    ['exercise', 'byScheduleId', number | undefined, number],
    ExerciseData[]
  > & { size?: number }
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const { size = DEFAULT_LIST_PAGE_SIZE, ...queryOptions } = options ?? {};
  const result = useInfiniteQuery({
    ...queryOptions,
    queryKey: ['exercise', 'byScheduleId', scheduleId, size],
    initialPageParam: 0,
    getNextPageParam: getNextOffsetPageParam(size),
    queryFn: async ({ pageParam }) => {
      if (scheduleId === undefined) return [];
      const page = await graphqlClient.request<{ getExerciseListByScheduleId: ExerciseData[] }>(query, {
        scheduleId,
        offset: pageParam,
        size,
      }).catch(e => {
        console.error(e)
        return {
          getExerciseListByScheduleId: []
        }
      });
      return page.getExerciseListByScheduleId;
    },
    enabled: scheduleId !== undefined && (queryOptions.enabled ?? true),
    select: flattenInfinitePages,
  })
  useFetchRemainingPages(result)
  return result
}
