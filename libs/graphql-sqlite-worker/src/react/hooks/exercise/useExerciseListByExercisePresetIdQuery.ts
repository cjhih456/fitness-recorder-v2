import type { ExerciseData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExerciseListByExercisePresetId($exercisePresetId: Int) {
    getExerciseListByExercisePresetId(exercisePresetId: $exercisePresetId) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export const useExerciseListByExercisePresetIdQuery = (
  exercisePresetId: number | undefined,
  options?: Omit<CustomQueryOptions<['exercise', 'byExercisePresetId', number | undefined], ExerciseData[]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['exercise', 'byExercisePresetId', exercisePresetId],
    queryFn: async () => {
      if (exercisePresetId === undefined) return [];
      const result = await graphqlClient.request<{ getExerciseListByExercisePresetId: ExerciseData[] }>(query, { exercisePresetId });
      return result.getExerciseListByExercisePresetId;
    },
    enabled: exercisePresetId !== undefined,
  })
}
