import type { ExercisePresetWithExerciseList } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExercisePresetWithListByOffset($offset: Int, $size: Int) {
    getExercisePresetWithListByOffset(offset: $offset, size: $size) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export interface ExercisePresetListParams {
  offset?: number;
  size?: number;
}

export const useExercisePresetListQuery = (
  params: ExercisePresetListParams = {},
  options?: Omit<CustomQueryOptions<['exercisePreset', 'list', ExercisePresetListParams], ExercisePresetWithExerciseList[]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['exercisePreset', 'list', params],
    queryFn: async () => {
      const result = await graphqlClient.request<{ getExercisePresetWithListByOffset: ExercisePresetWithExerciseList[] }>(query, params);
      return result.getExercisePresetWithListByOffset;
    },
  })
}
