import type { CustomMutationOptions } from "../types";
import type { ScheduleData, ScheduleCreateType } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";

const mutation = gql`
  mutation createSchedule($schedule: CreateScheduleDataInput) {
    createSchedule(schedule: $schedule) {
      ...Schedule
    }
  }
  ${Schedule}
`

export const useCreateScheduleMutation = (
  options: CustomMutationOptions<ScheduleCreateType, ScheduleData> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (input: ScheduleCreateType) => {
      const result = await graphqlClient.request<{ createSchedule: ScheduleData }>(mutation, { schedule: input });
      return result.createSchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries({ queryKey: ['schedule', 'date', variables.year, variables.month, variables.date] });
      queryClient.invalidateQueries({ queryKey: ['schedule', 'status', variables.year, variables.month] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
