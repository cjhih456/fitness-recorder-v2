import type { ExerciseData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Exercise, Fitness } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExerciseListByScheduleId($scheduleId: Int) {
    getExerciseListByScheduleId(scheduleId: $scheduleId) {
      ...Exercise
    }
  }
  ${Exercise}
  ${Fitness}
`

export const useExerciseListByScheduleIdQuery = (
  scheduleId: number | undefined,
  options?: Omit<CustomQueryOptions<['exercise', 'byScheduleId', number | undefined], ExerciseData[]>, 'queryKey' | 'queryFn'>
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ['exercise', 'byScheduleId', scheduleId],
    queryFn: async () => {
      if (scheduleId === undefined) return [];
      const result = await graphqlClient.request<{ getExerciseListByScheduleId: ExerciseData[] }>(query, { scheduleId });
      return result.getExerciseListByScheduleId;
    },
    enabled: scheduleId !== undefined,
  })
}
