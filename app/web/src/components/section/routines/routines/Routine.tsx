import type {
  ExercisePresetWithExerciseList,
  FitnessCategory,
} from '@fitness-recoder/structure';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardTitle,
  Separator,
} from '@fitness-recoder/ui';
import { Trash2 } from 'lucide-react';
import { useCallback, useMemo, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface RoutineProps {
  routine: ExercisePresetWithExerciseList;
  onClickDeleteRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickEditRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickStartRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickOpenActions?: (routine: ExercisePresetWithExerciseList) => void;
  isStarting?: boolean;
}

export default function Routine({
  routine,
  onClickDeleteRoutine,
  onClickEditRoutine,
  onClickStartRoutine,
  onClickOpenActions,
  isStarting = false,
}: RoutineProps) {
  const { t } = useTranslation();
  const target = useMemo(() => {
    const targets = routine.exerciseList
      .map((exercise) => exercise.fitness?.primaryMuscles)
      .filter(Boolean)
      .flat();
    const uniqueTargets = Array.from(new Set(targets));
    if (uniqueTargets.length === 0) return t('routines.none');
    const labels = uniqueTargets.map((muscle) => {
      const key = `muscle.${muscle}`;
      const translated = t(key as never);
      return translated === key ? muscle : translated;
    });
    if (labels.length < 3) return labels.join(', ');
    return t('routines.moreTargets', {
      targets: labels.slice(0, 3).join(', '),
      count: labels.length - 3,
    });
  }, [routine.exerciseList, t]);

  const mostCategory = useMemo(() => {
    const categories = routine.exerciseList
      .map((exercise) => exercise.fitness?.category)
      .filter(Boolean);
    const uniqueCategories = categories.reduce(
      (acc, category) => {
        if (!category) return acc;
        acc[category] = (acc[category] ?? 0) + 1;
        return acc;
      },
      {} as Record<FitnessCategory, number>,
    );

    return (
      (Object.keys(uniqueCategories) as FitnessCategory[]).reduce(
        (most, category) => {
          if (!most) return category;
          if (uniqueCategories[category] > uniqueCategories[most]) {
            return category;
          }
          return most;
        },
        'strength' as FitnessCategory,
      ) ?? 'strength'
    );
  }, [routine.exerciseList]);

  const handleDeleteRoutine = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onClickDeleteRoutine?.(routine);
    },
    [routine, onClickDeleteRoutine],
  );

  const handleEditRoutine = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onClickEditRoutine?.(routine);
    },
    [routine, onClickEditRoutine],
  );

  const handleStartRoutine = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onClickStartRoutine?.(routine);
    },
    [routine, onClickStartRoutine],
  );

  const handleOpenActions = useCallback(() => {
    onClickOpenActions?.(routine);
  }, [routine, onClickOpenActions]);

  return (
    <Card
      className="overflow-hidden pb-0 cursor-pointer"
      onClick={handleOpenActions}
    >
      <CardContent>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{routine.name}</CardTitle>
            <p className="text-sm text-muted-foreground mb-2">{target}</p>
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[10px] font-bold uppercase">
                {mostCategory}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDeleteRoutine}
            aria-label={t('routines.deleteAria', { name: routine.name })}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-border bg-surface-subtle flex-col">
        <div className="w-full">
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="rounded-none w-full text-xs font-bold text-brand-text"
            onClick={handleStartRoutine}
            disabled={isStarting}
          >
            {t('routines.startWithThis')}
          </Button>
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="rounded-t-none rounded-b-2xl w-full text-xs font-bold text-brand-text"
            onClick={handleEditRoutine}
          >
            {t('routines.editAction')}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
