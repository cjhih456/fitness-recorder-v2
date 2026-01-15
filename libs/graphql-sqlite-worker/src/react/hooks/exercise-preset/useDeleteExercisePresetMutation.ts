import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { gql } from "graphql-request";
import { CustomMutationOptions } from "../types/CustomQueryOptions";
import type { ExercisePresetCacheKey } from "../types/CacheKeys";

const mutation = gql`
  mutation deleteExercisePreset($id: Int!) {
    deleteExercisePreset(id: $id)
  }
`

export const useDeleteExercisePresetMutation = (
  options: CustomMutationOptions<number, string> = {}
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: async (id: number) => {
      const result = await graphqlClient.request<{ deleteExercisePreset: string }>(mutation, { id });
      return result.deleteExercisePreset;
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<ExercisePresetCacheKey>({ queryKey: ['exercisePreset', variables] });
      queryClient.invalidateQueries({ queryKey: ['exercisePreset', 'list'] });
      options.onSuccess?.(data, variables, ...rest);
    },
  });
}
