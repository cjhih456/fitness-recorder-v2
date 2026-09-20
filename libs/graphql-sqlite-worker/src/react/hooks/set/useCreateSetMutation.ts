import { SetCreateType, SetData } from "@fitness-recoder/structure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Set } from "../../fragment";
import { CustomMutationOptions } from "../types/CustomQueryOptions";

const createSetMutation = gql`
  mutation createSet($sets: CreateSetsInput!) {
    createSet(sets: $sets) {
      ...Set
    }
  }
  ${Set}
`

export const useCreateSetMutation = (options: CustomMutationOptions<SetCreateType, SetData> = {}) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: async (set: SetCreateType) => {
      const result = await graphqlClient.request<{ createSet: SetData }>(createSetMutation, { sets: set }).catch(e => {
        console.error(e)
        throw e
      })
      return result.createSet
    },
    onSuccess: (data, variables, result, context) => {
      queryClient.invalidateQueries({ queryKey: ['set', 'byExerciseId', variables.exerciseId] })
      options.onSuccess?.(data, variables, result, context)
    }
  })
}