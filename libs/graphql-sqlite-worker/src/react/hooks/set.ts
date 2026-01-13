import { useSuspenseQuery } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../context";

export const useSetQuery = (id: number) => {
  const { batchers } = useGraphQLSQLiteWorker();
  return useSuspenseQuery({
    queryKey: ['set', id],
    queryFn: () => batchers.set.fetch(id),
  })
}