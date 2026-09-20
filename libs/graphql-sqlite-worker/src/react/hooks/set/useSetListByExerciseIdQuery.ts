import type { SetData } from "@fitness-recoder/structure";
import { useQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Set } from "../../fragment";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

const query = gql`
  query getSetListByExerciseId($id: Int!) {
    getSetListByExerciseId(id: $id) {
      ...Set
    }
  }
  ${Set}
`;

export const useSetListByExerciseIdQuery = (
  exerciseId: number | undefined,
  options?: Omit<
    CustomQueryOptions<
      ["set", "byExerciseId", number | undefined],
      SetData[]
    >,
    "queryKey" | "queryFn"
  >,
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  return useQuery({
    ...options,
    queryKey: ["set", "byExerciseId", exerciseId],
    queryFn: async () => {
      if (exerciseId === undefined) return [];
      const result = await graphqlClient.request<{
        getSetListByExerciseId: SetData[];
      }>(query, { id: exerciseId }).catch(e => {
        console.error(e)
        return {
          getSetListByExerciseId: []
        }
      });
      return result.getSetListByExerciseId;
    },
    enabled: exerciseId !== undefined && (options?.enabled ?? true),
  });
};
