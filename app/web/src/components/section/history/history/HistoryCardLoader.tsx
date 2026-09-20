import type { HistoryListItem, HistorySchedule } from './types';
import type { ExerciseData, SetData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import History from './History';
import { toHistoryListItem } from './formatHistory';

interface HistoryCardLoaderProps {
  schedule: HistorySchedule;
  onClickHistory?: (workout: HistoryListItem) => void;
}

function SetVolumeBridge({
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

export default function HistoryCardLoader({
  schedule,
  onClickHistory,
}: HistoryCardLoaderProps) {
  const { t } = useTranslation();
  const { data: exercises = [] } = hooks.useExerciseListByScheduleIdQuery(
    schedule.id,
  );
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

  const totalVolume = useMemo(
    () => calcVolume(setsByExercise),
    [setsByExercise],
  );

  const item = useMemo(
    () =>
      toHistoryListItem(
        schedule,
        exercises as ExerciseData[],
        t,
        totalVolume,
      ),
    [schedule, exercises, totalVolume, t],
  );

  return (
    <>
      {exercises.map((exercise) => (
        <SetVolumeBridge
          key={`vol-${exercise.id}`}
          exerciseId={exercise.id}
          onSets={handleSets}
        />
      ))}
      <History data={item} onClickHistory={onClickHistory} />
    </>
  );
}
