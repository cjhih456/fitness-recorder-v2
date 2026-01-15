import type { ExerciseData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation createExerciseBySchedule($exercise: CreateExerciseByScheduleInput) {
    createExerciseBySchedule(exercise: $exercise) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export interface CreateExerciseByScheduleInput {
  scheduleId: number;
  fitnessIds?: number[];
}

export const useCreateExerciseByScheduleMutation = (
  options: CustomMutationOptions<CreateExerciseByScheduleInput, ExerciseData[]> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CreateExerciseByScheduleInput) => {
      const result = await graphqlClient.request<{ createExerciseBySchedule: ExerciseData[] }>(mutation, { exercise: input });
      return result.createExerciseBySchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['exercise', 'byScheduleId', variables.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.scheduleId] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
