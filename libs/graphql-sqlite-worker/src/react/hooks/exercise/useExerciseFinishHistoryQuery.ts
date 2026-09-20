import type { ExerciseHistoryData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getExerciseFinishHistory($fitnessId: Int) {
    getExerciseFinishHistory(fitnessId: $fitnessId) {
      id
      year
      month
      date
      fitnessId
      weightUnit
      historyList {
        weight
        repeat
      }
    }
  }
`;

export const useExerciseFinishHistoryQuery = (
  fitnessId: number | undefined,
  options?: Omit<
    CustomQueryOptions<
      ["exercise", "finishHistory", number | undefined],
      ExerciseHistoryData[]
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ["exercise", "finishHistory", fitnessId],
    queryFn: async () => {
      if (fitnessId === undefined) return [];
      const result = await graphqlClient.request<{
        getExerciseFinishHistory: ExerciseHistoryData[];
      }>(query, { fitnessId }).catch(e => {
        console.error(e)
        return {
          getExerciseFinishHistory: []
        }
      });
      return result.getExerciseFinishHistory ?? [];
    },
    enabled: fitnessId !== undefined && (options?.enabled ?? true),
  });
};
