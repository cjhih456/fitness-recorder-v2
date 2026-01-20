import type { SetCacheKey } from "../types/CacheKeys";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const deleteSetMutation = gql`
  mutation deleteSetById($id: Int!) {
    deleteSetById(id: $id)
  }
`

export const useDeleteSetMutation = (options: CustomMutationOptions<number, string> = {}) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async (id: number) => {
      const result = await graphqlClient.request<{ deleteSetById: string }>(deleteSetMutation, { id })
      return result.deleteSetById
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<SetCacheKey>({ queryKey: ['set', variables] })
      options.onSuccess?.(data, variables, ...rest)
    }
  })
}