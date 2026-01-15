import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import type { ExercisePresetWithExerciseList, ExercisePresetCreateType } from "@fitness-recoder/structure";
import { gql } from "graphql-request";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation createExercisePreset($exercisePreset: CreateExercisePresetInput) {
    createExercisePreset(exercisePreset: $exercisePreset) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export const useCreateExercisePresetMutation = (
  options: CustomMutationOptions<ExercisePresetCreateType, ExercisePresetWithExerciseList> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: ExercisePresetCreateType) => {
      const result = await graphqlClient.request<{ createExercisePreset: ExercisePresetWithExerciseList }>(mutation, { exercisePreset: input });
      return result.createExercisePreset;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', data.id] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
