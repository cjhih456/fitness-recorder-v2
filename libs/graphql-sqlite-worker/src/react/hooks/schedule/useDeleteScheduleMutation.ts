import type { CustomMutationOptions, ScheduleCacheKey } from "../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";

const mutation = gql`
  mutation deleteSchedule($id: Int!) {
    deleteSchedule(id: $id)
  }
`

export const useDeleteScheduleMutation = (
  options: CustomMutationOptions<number, string> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: number) => {
      const result = await graphqlClient.request<{ deleteSchedule: string }>(mutation, { id });
      return result.deleteSchedule;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ScheduleCacheKey>({ queryKey: ['schedule', variables] });
      queryClient.invalidateQueries({ queryKey: ['schedule'] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
