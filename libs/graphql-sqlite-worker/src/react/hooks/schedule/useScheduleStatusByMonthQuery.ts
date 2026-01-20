import type { CustomQueryOptions, ScheduleStatusByMonthCacheKey } from "../types";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";

const query = gql`
  query getScheduleStatusByMonth($year: Int!, $month: Int!) {
    getScheduleStatusByMonth(year: $year, month: $month)
  }
`

export interface ScheduleStatusByMonthParams {
  year: number;
  month: number;
}

export const useScheduleStatusByMonthQuery = (
  params: ScheduleStatusByMonthParams,
  options?: Omit<CustomQueryOptions<ScheduleStatusByMonthCacheKey, string[][]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['schedule', 'status', params.year, params.month] as ScheduleStatusByMonthCacheKey,
    queryFn: async () => {
      const result = await graphqlClient.request<{ getScheduleStatusByMonth: string[][] }>(query, params);
      return result.getScheduleStatusByMonth;
    },
  })
}
