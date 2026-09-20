import type { SetData } from "@fitness-recoder/structure";
import { useInfiniteQuery } from "@tanstack/react-query";
import { gql } from "graphql-request";
import { useGraphQLSQLiteWorker } from "../../context";
import { Set } from "../../fragment";
import { CustomInfiniteQueryOptions } from "../types/CustomQueryOptions";
import {
  DEFAULT_LIST_PAGE_SIZE,
  flattenInfinitePages,
  getNextOffsetPageParam,
  useFetchRemainingPages,
} from "../utils/infiniteList";

const query = gql`
  query getSetListByExerciseId($id: Int!, $offset: Int!, $size: Int!) {
    getSetListByExerciseId(id: $id, offset: $offset, size: $size) {
      ...Set
    }
  }
  ${Set}
`;

export const useSetListByExerciseIdQuery = (
  exerciseId: number | undefined,
  options?: CustomInfiniteQueryOptions<
    ["set", "byExerciseId", number | undefined, number],
    SetData[]
  > & { size?: number },
) => {
  const { graphqlClient } = useGraphQLSQLiteWorker();
  const { size = DEFAULT_LIST_PAGE_SIZE, ...queryOptions } = options ?? {};
  const result = useInfiniteQuery({
    ...queryOptions,
    queryKey: ["set", "byExerciseId", exerciseId, size],
    initialPageParam: 0,
    getNextPageParam: getNextOffsetPageParam(size),
    queryFn: async ({ pageParam }) => {
      if (exerciseId === undefined) return [];
      const page = await graphqlClient.request<{
        getSetListByExerciseId: SetData[];
      }>(query, { id: exerciseId, offset: pageParam, size }).catch(e => {
        console.error(e)
        return {
          getSetListByExerciseId: []
        }
      });
      return page.getSetListByExerciseId;
    },
    enabled: exerciseId !== undefined && (queryOptions.enabled ?? true),
    select: flattenInfinitePages,
  });
  useFetchRemainingPages(result);
  return result;
};
