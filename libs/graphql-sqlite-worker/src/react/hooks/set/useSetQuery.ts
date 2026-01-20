import type { SetCacheKey } from "../types/CacheKeys";
import type { SetData } from "@fitness-recoder/structure";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

/** queryKey는 ['set', setId] 형식 */
export const useSetQuery = (options: CustomQueryOptions<SetCacheKey, SetData>) => {
  const { batchers } = useGraphQLSQLiteWorker();
  const id = options.queryKey[1];
  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey,
    queryFn: () => batchers.set.fetch(id),
  })
}