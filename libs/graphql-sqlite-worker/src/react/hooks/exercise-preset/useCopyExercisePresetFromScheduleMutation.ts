import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import type { ExercisePresetWithExerciseList } from "@fitness-recoder/structure";
import { gql } from "graphql-request";
import { ExercisePreset, Exercise, Fitness } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation copyExercisePresetFromSchedule($scheduleId: Int!, $name: String!) {
    copyExercisePresetFromSchedule(scheduleId: $scheduleId, name: $name) {
      ...ExercisePreset
    }
  }
  ${ExercisePreset}
  ${Exercise}
  ${Fitness}
`

export interface CopyExercisePresetFromScheduleInput {
  scheduleId: number;
  name: string;
}

export const useCopyExercisePresetFromScheduleMutation = (
  options: CustomMutationOptions<CopyExercisePresetFromScheduleInput, ExercisePresetWithExerciseList> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CopyExercisePresetFromScheduleInput) => {
      const result = await graphqlClient.request<{ copyExercisePresetFromSchedule: ExercisePresetWithExerciseList }>(mutation, input);
      return result.copyExercisePresetFromSchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', data.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.scheduleId] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
