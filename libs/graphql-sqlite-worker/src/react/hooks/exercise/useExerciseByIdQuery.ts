import type { ExerciseData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExerciseById($id: Int) {
    getExerciseById(id: $id) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export const useExerciseByIdQuery = (id: number | undefined, options?: Omit<CustomQueryOptions<['exercise', 'byId', number | undefined], ExerciseData | null>, 'queryKey' | 'queryFn'>) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['exercise', 'byId', id],
    queryFn: async () => {
      if (id === undefined) return null;
      const result = await graphqlClient.request<{ getExerciseById: ExerciseData | null }>(query, { id });
      return result.getExerciseById;
    },
    enabled: id !== undefined,
  })
}
