import type { ExerciseCacheKey } from "../types/CacheKeys";
import type { ExerciseData } from "@fitness-recoder/structure";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useGraphQLSQLiteWorker } from "../../context";
import { CustomQueryOptions } from "../types/CustomQueryOptions";

/** queryKey는 ['exercise', exerciseId] 형식 */
export const useExerciseQuery = (options: CustomQueryOptions<ExerciseCacheKey, ExerciseData>) => {
  const { batchers } = useGraphQLSQLiteWorker();
  const id = options.queryKey[1];
  return useSuspenseQuery({
    ...options,
    queryKey: options.queryKey,
    queryFn: () => batchers.exercise.fetch(id),
  })
}
