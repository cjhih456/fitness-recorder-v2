import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import type { TFunction } from 'i18next';
import dayjs from '../../../libs/dayjs';

export function formatPhotoDateLabel(
  schedule: ScheduleData,
  t: TFunction,
): string {
  const weekday = t(
    `weekdayLong.${new Date(schedule.year, schedule.month - 1, schedule.date).getDay()}` as never,
  );
  const y = String(schedule.year);
  const m = String(schedule.month).padStart(2, '0');
  const d = String(schedule.date).padStart(2, '0');
  return t('photo.date', { date: `${y}.${m}.${d}`, weekday });
}

export function formatPhotoTitle(schedule: ScheduleData, t: TFunction): string {
  const title = schedule.title.trim();
  return title ? title : t('workout.todayTitle');
}

export function formatDurationFromMinutes(minutes: number): string {
  const ms = Math.max(0, minutes) * 60_000;
  return dayjs.duration(ms).format('HH:mm:ss');
}

export function calcVolume(setsByExercise: Map<number, SetData[]>): number {
  let volume = 0;
  for (const sets of setsByExercise.values()) {
    for (const set of sets) {
      if (!set.isDone) continue;
      volume += (set.weight ?? 0) * set.repeat;
    }
  }
  return volume;
}

export function formatVolumeLabel(volume: number, locale: string): string {
  return volume.toLocaleString(locale === 'en' ? 'en-US' : 'ko-KR');
}

/** Heaviest completed set → highlight line (e.g. "데드리프트 140kg 성공"). */
export function formatHighlightLine(
  exercises: ExerciseData[],
  setsByExercise: Map<number, SetData[]>,
  t: TFunction,
): string | null {
  let best: { name: string; weight: number } | null = null;

  for (const exercise of exercises) {
    const sets = setsByExercise.get(exercise.id) ?? [];
    for (const set of sets) {
      if (!set.isDone) continue;
      const weight = set.weight ?? 0;
      if (!best || weight > best.weight) {
        best = {
          name: exercise.fitness?.name ?? t('workout.exerciseFallback'),
          weight,
        };
      }
    }
  }

  if (!best || best.weight <= 0) return null;
  return t('photo.highlight', { name: best.name, weight: best.weight });
}

export function pickLatestFinish(
  schedules: ScheduleData[] | undefined,
): ScheduleData | undefined {
  if (!schedules?.length) return undefined;
  return schedules
    .filter((schedule) => schedule.type === 'FINISH')
    .reduce<ScheduleData | undefined>((latest, schedule) => {
      if (!latest || schedule.id > latest.id) return schedule;
      return latest;
    }, undefined);
}
