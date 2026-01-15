
import type { SetData } from "@fitness-recoder/structure";
import type { SetCacheKey } from "../types/CacheKeys";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { gql } from "graphql-request"
import { Set } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const updateSetMutation = gql`
  mutation updateSet($sets: UpdateSetsInput!) {
    updateSet(sets: $sets) {
      ...Set
    }
  }
  ${Set}
`
export const useUpdateSetMutation = (options: CustomMutationOptions<SetData, SetData>) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async (set: SetData) => {
      const result = await graphqlClient.request<{ updateSet: SetData }>(updateSetMutation, { sets: set })
      return result.updateSet
    },
    onSuccess: (data, variables, ...rest) => {
      queryClient.invalidateQueries<SetCacheKey>({ queryKey: ['set', variables.id] })
      options.onSuccess?.(data, variables, ...rest)
    }
  })
}