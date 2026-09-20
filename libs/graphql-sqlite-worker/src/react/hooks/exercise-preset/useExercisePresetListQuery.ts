import type { ExercisePresetWithExerciseList } from "@fitness-recoder/structure";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomInfiniteQueryOptions } from "../types/CustomQueryOptions";
import { flattenInfinitePages, getNextOffsetPageParam } from "../utils/infiniteList";

const query = gql`
  query getExercisePresetWithListByOffset($offset: Int!, $size: Int!) {
    getExercisePresetWithListByOffset(offset: $offset, size: $size) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export interface ExercisePresetListParams {
  size: number;
}

export const useExercisePresetListQuery = (
  params: ExercisePresetListParams,
  options?: CustomInfiniteQueryOptions<['exercisePreset', 'list', ExercisePresetListParams], ExercisePresetWithExerciseList[]>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useInfiniteQuery({
    ...options,
    queryKey: ['exercisePreset', 'list', params],
    initialPageParam: 0,
    getNextPageParam: getNextOffsetPageParam(params.size),
    queryFn: async ({ pageParam }) => {
      const result = await graphqlClient.request<{ getExercisePresetWithListByOffset: ExercisePresetWithExerciseList[] }>(query, {
        offset: pageParam,
        size: params.size,
      }).catch(e => {
        console.error(e)
        return {
          getExercisePresetWithListByOffset: []
        }
      });
      return result.getExercisePresetWithListByOffset;
    },
    select: flattenInfinitePages,
  })
}
