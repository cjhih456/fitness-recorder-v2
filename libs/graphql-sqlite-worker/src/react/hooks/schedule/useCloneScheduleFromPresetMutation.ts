import type { CustomMutationOptions, TargetDateInput } from "../types";
import type { ScheduleData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";

const mutation = gql`
  mutation cloneScheduleFromPreset($presetId: Int!, $targetDate: TargetDateInput) {
    cloneScheduleFromPreset(presetId: $presetId, targetDate: $targetDate) {
      ...Schedule
    }
  }
  ${Schedule}
`
export interface CloneScheduleFromPresetInput {
  presetId: number;
  targetDate: TargetDateInput;
}

export const useCloneScheduleFromPresetMutation = (
  options: CustomMutationOptions<CloneScheduleFromPresetInput, ScheduleData> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CloneScheduleFromPresetInput) => {
      const result = await graphqlClient.request<{ cloneScheduleFromPreset: ScheduleData }>(mutation, input);
      return result.cloneScheduleFromPreset;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'date', variables.targetDate.year, variables.targetDate.month, variables.targetDate.date] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'status', variables.targetDate.year, variables.targetDate.month] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', variables.presetId] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
