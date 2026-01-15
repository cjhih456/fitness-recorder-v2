import type { CustomMutationOptions, ScheduleCacheKey } from "../types";
import type { ScheduleData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";

const mutation = gql`
  mutation updateSchedule($schedule: UpdateScheduleDataInput) {
    updateSchedule(schedule: $schedule) {
      ...Schedule
    }
  }
  ${Schedule}
`

export const useUpdateScheduleMutation = (
  options: CustomMutationOptions<ScheduleData, ScheduleData> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: ScheduleData) => {
      const result = await graphqlClient.request<{ updateSchedule: ScheduleData }>(mutation, { schedule: input });
      return result.updateSchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ScheduleCacheKey>({ queryKey: ['schedule', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'date', variables.year, variables.month, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'status', variables.year, variables.month] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
