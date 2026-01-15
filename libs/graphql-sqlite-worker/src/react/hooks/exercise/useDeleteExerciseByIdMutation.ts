import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { gql } from "graphql-request";
import { CustomMutationOptions } from "../types/CustomQueryOptions";
import type { ExerciseCacheKey } from "../types/CacheKeys";

const mutation = gql`
  mutation deleteExerciseById($id: Int) {
    deleteExerciseById(id: $id)
  }
`

export const useDeleteExerciseByIdMutation = (
  options: CustomMutationOptions<number, string> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: number) => {
      const result = await graphqlClient.request<{ deleteExerciseById: string }>(mutation, { id });
      return result.deleteExerciseById;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ExerciseCacheKey>({ queryKey: ['exercise', variables] });
      queryClient.invalidateQueries({ queryKey: ['exercise', 'byId', variables] });
      queryClient.invalidateQueries({ queryKey: ['exercise'] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
