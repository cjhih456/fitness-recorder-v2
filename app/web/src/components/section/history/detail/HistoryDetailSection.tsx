import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import VirtualList from '../../../utils/VirtualList';
import MuscleChip from '../history/MuscleChip';
import {
  formatHistoryDateLabel,
  formatMuscleLabels,
  formatScheduleTitle,
} from '../history/formatHistory';
import HistoryExerciseCard from './HistoryExerciseCard';

interface HistoryDetailSectionProps {
  schedule: ScheduleData;
  exercises: ExerciseData[];
  onBack?: () => void;
  onSaveAsRoutine?: () => void;
  isSavingRoutine?: boolean;
}

function calcVolume(setsByExercise: Map<number, SetData[]>) {
  let volume = 0;
  for (const sets of setsByExercise.values()) {
    for (const set of sets) {
      if (!set.isDone) continue;
      volume += (set.weight ?? 0) * set.repeat;
    }
  }
  return volume;
}

function VolumeCollector({
  exerciseId,
  onSets,
}: {
  exerciseId: number;
  onSets: (exerciseId: number, sets: SetData[]) => void;
}) {
  const { data: sets = [] } = hooks.useSetListByExerciseIdQuery(exerciseId);
  useEffect(() => {
    onSets(exerciseId, sets);
  }, [exerciseId, sets, onSets]);
  return null;
}

export default function HistoryDetailSection({
  schedule,
  exercises,
  onBack,
  onSaveAsRoutine,
  isSavingRoutine = false,
}: HistoryDetailSectionProps) {
  const { t, i18n } = useTranslation();
  const [setsByExercise, setSetsByExercise] = useState(
    () => new Map<number, SetData[]>(),
  );

  const handleSets = useCallback((exerciseId: number, sets: SetData[]) => {
    setSetsByExercise((prev) => {
      const next = new Map(prev);
      next.set(exerciseId, sets);
      return next;
    });
  }, []);

  const title = formatScheduleTitle(schedule, t);
  const dateLabel = formatHistoryDateLabel(
    schedule.year,
    schedule.month,
    schedule.date,
    t,
  );
  const muscles = useMemo(() => formatMuscleLabels(exercises, t), [exercises, t]);
  const volume = useMemo(() => calcVolume(setsByExercise), [setsByExercise]);
  const volumeLabel = volume.toLocaleString(
    i18n.language === 'en' ? 'en-US' : 'ko-KR',
  );

  return (
    <div className="mx-auto max-w-md space-y-6 p-4 pb-24">
      {exercises.map((exercise) => (
        <VolumeCollector
          key={`vol-${exercise.id}`}
          exerciseId={exercise.id}
          onSets={handleSets}
        />
      ))}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground"
          aria-label={t('common.back')}
        >
          <ChevronLeft size={20} />
          <span className="truncate font-semibold text-foreground">{title}</span>
        </button>
        {onSaveAsRoutine ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-brand-text"
            onClick={onSaveAsRoutine}
            disabled={isSavingRoutine}
          >
            {t('history.saveAsRoutine')}
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight">{dateLabel}</h2>
        <p className="text-sm font-medium text-muted-foreground">
          {t('history.minutes', { minutes: schedule.workoutTimes })}{' '}
          <span className="text-primary">
            {t('history.totalVolume', { volume: volumeLabel })}
          </span>
        </p>
        {muscles.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {muscles.map((muscle) => (
              <MuscleChip key={muscle} label={muscle} />
            ))}
          </div>
        ) : null}
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t('history.sessionEmpty')}
        </p>
      ) : (
        <VirtualList
          items={exercises}
          estimateSize={200}
          gap={16}
          scroll="window"
          getItemKey={(exercise) => exercise.id}
          renderItem={(exercise) => (
            <HistoryExerciseCard exercise={exercise} />
          )}
        />
      )}
    </div>
  );
}
