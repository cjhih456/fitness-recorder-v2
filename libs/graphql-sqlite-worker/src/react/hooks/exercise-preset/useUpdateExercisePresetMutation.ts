import type { ExercisePresetCacheKey } from "../types/CacheKeys";
import type { ExercisePresetWithExerciseList, ExercisePresetData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation updateExercisePreset($exercisePreset: UpdateExercisePresetInput) {
    updateExercisePreset(exercisePreset: $exercisePreset) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export const useUpdateExercisePresetMutation = (
  options: CustomMutationOptions<ExercisePresetData, ExercisePresetWithExerciseList> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: ExercisePresetData) => {
      const result = await graphqlClient.request<{ updateExercisePreset: ExercisePresetWithExerciseList }>(mutation, { exercisePreset: input });
      return result.updateExercisePreset;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ExercisePresetCacheKey>({ queryKey: ['exercisePreset', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', 'list'] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
