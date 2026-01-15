import type { TargetDateInput, CustomMutationOptions } from "../types";
import type { ScheduleData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";

const mutation = gql`
  mutation cloneSchedule($id: Int!, $targetDate: TargetDateInput) {
    cloneSchedule(id: $id, targetDate: $targetDate) {
      ...Schedule
    }
  }
  ${Schedule}
`


export interface CloneScheduleInput {
  id: number;
  targetDate: TargetDateInput;
}

export const useCloneScheduleMutation = (
  options: CustomMutationOptions<CloneScheduleInput, ScheduleData> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: CloneScheduleInput) => {
      const result = await graphqlClient.request<{ cloneSchedule: ScheduleData }>(mutation, input);
      return result.cloneSchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['schedule', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'date', variables.targetDate.year, variables.targetDate.month, variables.targetDate.date] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'status', variables.targetDate.year, variables.targetDate.month] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
