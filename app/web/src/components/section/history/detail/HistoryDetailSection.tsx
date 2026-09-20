import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { Button } from '@fitness-recoder/ui';
import { ChevronLeft } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const title = formatScheduleTitle(schedule);
  const dateLabel = formatHistoryDateLabel(
    schedule.year,
    schedule.month,
    schedule.date,
  );
  const muscles = useMemo(() => formatMuscleLabels(exercises), [exercises]);
  const volume = useMemo(() => calcVolume(setsByExercise), [setsByExercise]);
  const volumeLabel = volume.toLocaleString('ko-KR');

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
          className="flex items-center gap-1 text-sm font-medium text-zinc-600"
          aria-label="뒤로"
        >
          <ChevronLeft size={20} />
          <span className="truncate font-semibold text-foreground">{title}</span>
        </button>
        {onSaveAsRoutine ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 text-blue-600"
            onClick={onSaveAsRoutine}
            disabled={isSavingRoutine}
          >
            루틴으로 저장
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black tracking-tight">{dateLabel}</h2>
        <p className="text-sm font-medium text-zinc-500">
          {schedule.workoutTimes}분{' '}
          <span className="text-blue-600">총 볼륨 {volumeLabel} kg</span>
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
        <p className="text-sm text-zinc-400">
          이 세션에 기록된 운동이 없습니다
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {exercises.map((exercise) => (
            <HistoryExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}
