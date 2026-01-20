import type { Fitness } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Fitness as FitnessFragment } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getFitnessById($id: Int) {
    getFitnessById(id: $id) {
      ...Fitness
    }
  }
  ${FitnessFragment}
`

export const useFitnessByIdQuery = (
  id: number | undefined,
  options?: Omit<CustomQueryOptions<['fitness', 'byId', number | undefined], Fitness | null>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['fitness', 'byId', id],
    queryFn: async () => {
      if (id === undefined) return null;
      const result = await graphqlClient.request<{ getFitnessById: Fitness | null }>(query, { id });
      return result.getFitnessById;
    },
    enabled: id !== undefined,
  })
}
