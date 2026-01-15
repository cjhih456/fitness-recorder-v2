import type { ExerciseData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation createExerciseByExercisePreset($exercise: CreateExerciseByExercisePresetInput) {
    createExerciseByExercisePreset(exercise: $exercise) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export interface CreateExerciseByExercisePresetInput {
  exercisePresetId: number;
  fitnessIds?: number[];
}

export const useCreateExerciseByExercisePresetMutation = (
  options: CustomMutationOptions<CreateExerciseByExercisePresetInput, ExerciseData[]> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateExerciseByExercisePresetInput) => {
      const result = await graphqlClient.request<{ createExerciseByExercisePreset: ExerciseData[] }>(mutation, { exercise: input });
      return result.createExerciseByExercisePreset;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['exercise', 'byExercisePresetId', variables.exercisePresetId] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', variables.exercisePresetId] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
