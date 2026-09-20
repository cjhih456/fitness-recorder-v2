import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { Button, Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPresetTarget } from './formatPresetTarget';

interface TodayRoutineProps {
  routine: ExercisePresetWithExerciseList;
  onClickStartWorkout?: (routine: ExercisePresetWithExerciseList) => void;
  isStarting?: boolean;
}

export default function TodayRoutine({
  routine,
  onClickStartWorkout,
  isStarting = false,
}: TodayRoutineProps) {
  const { t } = useTranslation();
  const target = useMemo(
    () => formatPresetTarget(routine, t),
    [routine, t],
  );
  const exerciseCount = routine.exerciseList?.length ?? 0;

  const handleStartWorkout = useCallback(() => {
    onClickStartWorkout?.(routine);
  }, [routine, onClickStartWorkout]);

  return (
    <Card
      className="cursor-pointer transition-all hover:border-brand/40 group"
      onClick={handleStartWorkout}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleStartWorkout();
        }
      }}
      aria-label={t('dashboard.startRoutineAria', { name: routine.name })}
      aria-disabled={isStarting}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-brand-soft group-hover:text-brand-text">
            <Dumbbell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {routine.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.routineMeta', {
                target,
                count: exerciseCount,
              })}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          disabled={isStarting}
          onClick={(event) => {
            event.stopPropagation();
            handleStartWorkout();
          }}
          aria-hidden="true"
          tabIndex={-1}
        >
          <ChevronRight size={20} className="text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  );
}
