import type { DraftExercise, DraftSet } from './types';
import { Button, Card, CardContent, Input } from '@fitness-recoder/ui';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createDefaultSet } from './types';

interface RoutineExerciseCardProps {
  exercise: DraftExercise;
  onRemove?: (localId: string) => void;
  onChangeSets?: (localId: string, sets: DraftSet[]) => void;
}

export default function RoutineExerciseCard({
  exercise,
  onRemove,
  onChangeSets,
}: RoutineExerciseCardProps) {
  const { t } = useTranslation();
  const handleRemove = useCallback(() => {
    onRemove?.(exercise.localId);
  }, [exercise.localId, onRemove]);

  const handleAddSet = useCallback(() => {
    onChangeSets?.(exercise.localId, [...exercise.sets, createDefaultSet()]);
  }, [exercise.localId, exercise.sets, onChangeSets]);

  const handleSetChange = useCallback(
    (setLocalId: string, field: 'weight' | 'repeat', value: number) => {
      onChangeSets?.(
        exercise.localId,
        exercise.sets.map((set) =>
          set.localId === setLocalId ? { ...set, [field]: value } : set,
        ),
      );
    },
    [exercise.localId, exercise.sets, onChangeSets],
  );

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1.5 rounded-full bg-brand" />
            {exercise.fitness.name}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={handleRemove}
          >
            {t('common.delete')}
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase text-muted-foreground">
          <div className="col-span-2 text-center">{t('workout.set')}</div>
          <div className="col-span-4 text-center">{t('workout.weightKg')}</div>
          <div className="col-span-4 text-center">{t('workout.reps')}</div>
          <div className="col-span-2 text-center">{t('common.done')}</div>
        </div>

        {exercise.sets.map((set, index) => (
          <div
            key={set.localId}
            className="grid grid-cols-12 gap-2 rounded-xl border border-transparent bg-muted p-2 shadow-inner"
          >
            <div className="col-span-2 flex items-center justify-center font-bold text-muted-foreground">
              {index + 1}
            </div>
            <div className="col-span-4">
              <Input
                type="number"
                inputMode="decimal"
                aria-label={t('workout.setWeightAria', {
                  name: exercise.fitness.name,
                  index: index + 1,
                })}
                value={set.weight}
                onChange={(event) =>
                  handleSetChange(
                    set.localId,
                    'weight',
                    Number(event.target.value) || 0,
                  )
                }
                className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
              />
            </div>
            <div className="col-span-4">
              <Input
                type="number"
                inputMode="numeric"
                aria-label={t('workout.setRepsAria', {
                  name: exercise.fitness.name,
                  index: index + 1,
                })}
                value={set.repeat}
                onChange={(event) =>
                  handleSetChange(
                    set.localId,
                    'repeat',
                    Number(event.target.value) || 0,
                  )
                }
                className="rounded-lg border-none bg-background p-2 text-center font-bold shadow-sm"
              />
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <span
                aria-disabled="true"
                title={t('routines.completeDisabled')}
                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-muted text-muted-foreground/40"
              >
                <span className="sr-only">{t('routines.completeInactive')}</span>
              </span>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed py-3 text-muted-foreground hover:border-brand/40 hover:text-brand-text"
          onClick={handleAddSet}
        >
          <Plus size={18} className="mr-2" />
          {t('workout.addSet')}
        </Button>
      </CardContent>
    </Card>
  );
}
