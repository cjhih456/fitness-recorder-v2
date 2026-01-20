import type { CustomQueryOptions, ScheduleByDateCacheKey } from "../types";
import type { ScheduleData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Schedule } from "../../fragment";

const query = gql`
  query getScheduleByDate($year: Int!, $month: Int!, $date: Int!) {
    getScheduleByDate(year: $year, month: $month, date: $date) {
      ...Schedule
    }
  }
  ${Schedule}
`

export interface ScheduleByDateParams {
  year: number;
  month: number;
  date: number;
}

export const useScheduleByDateQuery = (
  params: ScheduleByDateParams,
  options?: Omit<CustomQueryOptions<ScheduleByDateCacheKey, ScheduleData[]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['schedule', 'date', params.year, params.month, params.date] as ScheduleByDateCacheKey,
    queryFn: async () => {
      const result = await graphqlClient.request<{ getScheduleByDate: ScheduleData[] }>(query, params);
      return result.getScheduleByDate;
    },
  })
}
