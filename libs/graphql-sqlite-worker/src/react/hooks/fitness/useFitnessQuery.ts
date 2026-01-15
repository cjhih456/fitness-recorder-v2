import type { FitnessCacheKey } from "../types/CacheKeys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import type { Fitness } from "@fitness-recoder/structure";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

/** queryKey는 ['fitness', fitnessId] 형식 */
export const useFitnessQuery = (options: CustomQueryOptions<FitnessCacheKey, Fitness>) => {
  const { batchers } = useGraphQLSQLiteWorker();
  const id = options.queryKey[1];
  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey,
    queryFn: () => batchers.fitness.fetch(id),
  })
}
