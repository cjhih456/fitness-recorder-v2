import type { ExerciseData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Card, CardContent } from '@fitness-recoder/ui';
import { useTranslation } from 'react-i18next';
import HistorySetRow from './HistorySetRow';

interface HistoryExerciseCardProps {
  exercise: ExerciseData;
}

export default function HistoryExerciseCard({
  exercise,
}: HistoryExerciseCardProps) {
  const { t } = useTranslation();
  const exerciseName = exercise.fitness?.name ?? t('workout.exerciseFallback');
  const { data: sets = [] } = hooks.useSetListByExerciseIdQuery(exercise.id);

  return (
    <Card className="border-zinc-100 shadow-sm dark:border-zinc-800">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold">
            <span className="h-6 w-1.5 rounded-full bg-blue-600" />
            {exerciseName}
          </h3>
        </div>

        <div className="grid grid-cols-12 gap-2 px-2 text-[11px] font-bold uppercase text-zinc-400">
          <div className="col-span-2 text-center">{t('workout.set')}</div>
          <div className="col-span-4 text-center">{t('workout.weightKg')}</div>
          <div className="col-span-4 text-center">{t('workout.reps')}</div>
          <div className="col-span-2 text-center">{t('common.done')}</div>
        </div>

        {sets.length === 0 ? (
          <p className="px-2 text-sm text-muted-foreground">{t('history.noSets')}</p>
        ) : (
          sets.map((set, index) => (
            <HistorySetRow
              key={set.id}
              set={set}
              index={index}
              exerciseName={exerciseName}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
