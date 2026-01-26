import type { ExercisePresetWithExerciseList, FitnessCategory } from "@fitness-recoder/structure";
import { Card, CardContent, CardTitle, CardFooter, Button, Separator } from "@fitness-recoder/ui";
import { Trash2 } from "lucide-react";
import { useCallback, useMemo } from "react";

interface RoutineProps {
  routine: ExercisePresetWithExerciseList;
  onClickDeleteRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickEditRoutine?: (routine: ExercisePresetWithExerciseList) => void;
}

export default function Routine({
  routine,
  onClickDeleteRoutine,
  onClickEditRoutine
}: RoutineProps) {

  // 루틴 목표 부위 찾기
  const target = useMemo(() => {
    const targets = routine.exerciseList.map(exercise => exercise.fitness?.primaryMuscles).filter(Boolean).flat()
    const uniqueTargets = Array.from(new Set(targets))
    if(uniqueTargets.length === 0) return '없음';
    if(uniqueTargets.length < 3) return uniqueTargets.join(', ');
    return `${uniqueTargets.slice(0, 3).join(', ')} 외 ${uniqueTargets.length - 3}부위`;
  }, [routine.exerciseList]);

  const mostCategory = useMemo(() => {
    const categories = routine.exerciseList.map(exercise => exercise.fitness?.category).filter(Boolean).flat()
    // 종목별 개수 카운트
    const uniqueCategories = categories.reduce((acc, category) => {
      if(!category) return acc;
      if(!acc[category]) {
        acc[category] = 0;
      }
      acc[category]++;
      return acc;
    }, {} as Record<FitnessCategory, number>)

    // 가장 많은 종목 찾기
    const findMostCategory = (Object.keys(uniqueCategories) as FitnessCategory[]).reduce((mostCategory, category) => {
      if(!mostCategory) return category;
      if(uniqueCategories[category] > uniqueCategories[mostCategory]) {
        return category;
      }
      return mostCategory;
    }, 'strength' as FitnessCategory)
    return findMostCategory
  }, [routine.exerciseList]);
  const handleDeleteRoutine = useCallback(() => {
    onClickDeleteRoutine?.(routine);
  }, [routine, onClickDeleteRoutine]);
  const handleEditRoutine = useCallback(() => {
    onClickEditRoutine?.(routine);
  }, [routine, onClickEditRoutine]);
  return (
    <Card className="overflow-hidden pb-0">
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{routine.name}</CardTitle>
            <p className="text-sm text-zinc-500 mb-2">
              {target}
            </p>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 rounded-md text-[10px] font-bold uppercase">
                {mostCategory}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" className="text-zinc-400 hover:text-red-500" onClick={handleDeleteRoutine}>
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-full">
          <Separator />
          <Button variant="ghost" className="rounded-t-none rounded-b-2xl w-full text-xs font-bold text-blue-600 dark:text-blue-400" onClick={handleEditRoutine}>
            편집하기
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}