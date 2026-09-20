import type { ExerciseData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button, Card, CardContent } from '@fitness-recoder/ui';
import { Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExerciseSetInput from './ExerciseSetInput';
import RecentRecordsSheet, {
  type RecentRecordRow,
} from './RecentRecordsSheet';

interface ExerciseCardProps {
  exercise: ExerciseData;
  addSet: (exerciseId: number) => void;
  onUpdateSet: (set: SetData) => void;
  onDeleteSet?: (setId: number) => void;
  onSetsLoaded?: (exerciseId: number, sets: SetData[]) => void;
}

export default function ExerciseCard({
  exercise,
  addSet,
  onUpdateSet,
  onDeleteSet,
  onSetsLoaded,
}: ExerciseCardProps) {
  const { t } = useTranslation();
  const [recordsOpen, setRecordsOpen] = useState(false);
  const exerciseName = exercise.fitness?.name ?? t('workout.exerciseFallback');

  const { data: sets = [] } = hooks.useSetListByExerciseIdQuery(exercise.id);
  const { data: history = [] } = hooks.useExerciseFinishHistoryQuery(
    exercise.fitnessId,
    { enabled: recordsOpen },
  );

  useEffect(() => {
    onSetsLoaded?.(exercise.id, sets);
  }, [exercise.id, sets, onSetsLoaded]);

  const handleAddSet = useCallback(() => addSet(exercise.id), [addSet, exercise.id]);

  const records: RecentRecordRow[] = useMemo(() => {
    return history.flatMap((entry) =>
      entry.historyList.map((set, index) => ({
        id: `${entry.id}-${index}`,
        dateLabel: t('workout.historyDate', {
          month: entry.month,
          date: entry.date,
        }),
        weight: set.weight,
        repeat: set.repeat,
      })),
    );
  }, [history, t]);

  return (
    <>
      <Card className="border-border shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <span className="h-6 w-1.5 rounded-full bg-brand" />
              {exerciseName}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setRecordsOpen(true)}
            >
              {t('workout.checkRecords')}
            </Button>
          </div>

          <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase text-muted-foreground">
            <div className="col-span-2 text-center">{t('workout.set')}</div>
            <div className="col-span-3 text-center">{t('workout.weightKg')}</div>
            <div className="col-span-3 text-center">{t('workout.reps')}</div>
            <div className="col-span-2 text-center">{t('common.done')}</div>
            <div className="col-span-2 text-center">{t('common.delete')}</div>
          </div>

          {sets.map((set, index) => (
            <ExerciseSetInput
              key={set.id}
              set={set}
              index={index}
              exerciseName={exerciseName}
              onUpdate={onUpdateSet}
              onDelete={onDeleteSet}
            />
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

      <RecentRecordsSheet
        open={recordsOpen}
        exerciseName={exerciseName}
        records={records}
        onOpenChange={setRecordsOpen}
      />
    </>
  );
}
