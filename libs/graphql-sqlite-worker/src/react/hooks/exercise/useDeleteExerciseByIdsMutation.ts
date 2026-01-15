import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { gql } from "graphql-request";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const mutation = gql`
  mutation deleteExerciseByIds($ids: [Int!]) {
    deleteExerciseByIds(ids: $ids)
  }
`

export const useDeleteExerciseByIdsMutation = (
  options: CustomMutationOptions<number[], string> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (ids: number[]) => {
      const result = await graphqlClient.request<{ deleteExerciseByIds: string }>(mutation, { ids });
      return result.deleteExerciseByIds;
    },
    onSuccess: (data, variables, ...rest) => {
      variables.forEach(id => {
        queryClient.invalidateQueries({ queryKey: ['exercise', id] });
        queryClient.invalidateQueries({ queryKey: ['exercise', 'byId', id] });
      });
      queryClient.invalidateQueries({ queryKey: ['exercise'] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
