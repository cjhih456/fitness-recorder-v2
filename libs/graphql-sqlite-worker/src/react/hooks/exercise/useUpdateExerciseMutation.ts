import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import type { ExerciseData } from "@fitness-recoder/structure";
import { gql } from "graphql-request";
import { Exercise } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";
import type { ExerciseCacheKey } from "../types/CacheKeys";

const mutation = gql`
  mutation updateExercise($exercise: UpdateExerciseInput) {
    updateExercise(exercise: $exercise) {
      id
      fitnessId
      deps
    }
  }
`

export interface UpdateExerciseInput {
  id: number;
  fitnessId: number;
}

export const useUpdateExerciseMutation = (
  options: CustomMutationOptions<UpdateExerciseInput, ExerciseData> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: UpdateExerciseInput) => {
      const result = await graphqlClient.request<{ updateExercise: ExerciseData }>(mutation, { exercise: input });
      return result.updateExercise;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ExerciseCacheKey>({ queryKey: ['exercise', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exercise', 'byId', variables.id] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
