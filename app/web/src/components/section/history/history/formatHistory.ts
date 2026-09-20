import type { HistoryListItem, HistorySchedule } from './types';
import type { ExerciseData, FitnessMuscle } from '@fitness-recoder/structure';
import type { TFunction } from 'i18next';

function translateMuscle(t: TFunction, muscle: FitnessMuscle | string): string {
  const translated = t(`muscle.${muscle}` as never);
  return translated === `muscle.${muscle}` ? muscle : translated;
}

export function formatMuscleLabels(
  exercises: ExerciseData[],
  t: TFunction,
): string[] {
  const muscles = exercises.flatMap(
    (exercise) => exercise.fitness?.primaryMuscles ?? [],
  );
  const unique = Array.from(new Set(muscles));
  return unique.map((muscle) => translateMuscle(t, muscle)).slice(0, 4);
}

export function formatExerciseSummary(
  exercises: ExerciseData[],
  t: TFunction,
): string {
  if (exercises.length === 0) return t('history.noExercises');
  const firstName = exercises[0]?.fitness?.name ?? t('workout.exerciseFallback');
  if (exercises.length === 1) return firstName;
  return t('history.moreExercises', {
    name: firstName,
    count: exercises.length - 1,
  });
}

export function formatScheduleTitle(
  schedule: HistorySchedule,
  t: TFunction,
): string {
  const title = schedule.title.trim();
  return title ? title : t('history.recordTitle');
}

export function formatHistoryDateLabel(
  year: number,
  month: number,
  date: number,
  t: TFunction,
): string {
  const weekday = t(
    `weekday.${new Date(year, month - 1, date).getDay()}` as never,
  );
  return t('history.dateLabel', { month, date, weekday });
}

export function toHistoryListItem(
  schedule: HistorySchedule,
  exercises: ExerciseData[],
  t: TFunction,
  totalVolume = 0,
): HistoryListItem {
  return {
    id: schedule.id,
    year: schedule.year,
    month: schedule.month,
    date: schedule.date,
    title: formatScheduleTitle(schedule, t),
    workoutTimes: schedule.workoutTimes,
    totalVolume,
    muscles: formatMuscleLabels(exercises, t),
    exerciseSummary: formatExerciseSummary(exercises, t),
  };
}
