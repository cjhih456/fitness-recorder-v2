import type { ScheduleData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";
import { CustomQueryOptions, ScheduleCacheKey } from "../types";

const query = gql`
  query getScheduleById($id: Int!) {
    getScheduleById(id: $id) {
      ...Schedule
    }
  }
  ${Schedule}
`

export const useScheduleQuery = (
  id: number | undefined,
  options?: Omit<CustomQueryOptions<ScheduleCacheKey, ScheduleData | null>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['schedule', id] as ScheduleCacheKey,
    queryFn: async () => {
      if (id === undefined) return null;
      const result = await graphqlClient.request<{ getScheduleById: ScheduleData | null }>(query, { id });
      return result.getScheduleById;
    },
    enabled: id !== undefined,
  })
}
