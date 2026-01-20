import type { ExercisePresetCacheKey } from "../types/CacheKeys";
import type { ExercisePresetWithExerciseList } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExercisePresetWithListById($id: Int) {
    getExercisePresetWithListById(id: $id) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export const useExercisePresetQuery = (
  id: number | undefined,
  options?: Omit<CustomQueryOptions<ExercisePresetCacheKey, ExercisePresetWithExerciseList | null>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['exercisePreset', id] as ExercisePresetCacheKey,
    queryFn: async () => {
      if (id === undefined) return null;
      const result = await graphqlClient.request<{ getExercisePresetWithListById: ExercisePresetWithExerciseList | null }>(query, { id });
      return result.getExercisePresetWithListById;
    },
    enabled: id !== undefined,
  })
}
