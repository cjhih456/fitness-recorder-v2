import type { ExerciseData, ScheduleData, SetData } from '@fitness-recoder/structure';
import dayjs from '../../../libs/dayjs';

const WEEKDAY_KO = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

export function formatPhotoDateLabel(schedule: ScheduleData): string {
  const weekday =
    WEEKDAY_KO[new Date(schedule.year, schedule.month - 1, schedule.date).getDay()] ??
    '';
  const y = String(schedule.year);
  const m = String(schedule.month).padStart(2, '0');
  const d = String(schedule.date).padStart(2, '0');
  return `${y}.${m}.${d} ${weekday}`;
}

export function formatPhotoTitle(schedule: ScheduleData): string {
  const title = schedule.title.trim();
  return title ? title : '오늘의 운동';
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

export function formatVolumeLabel(volume: number): string {
  return volume.toLocaleString('ko-KR');
}

/** Heaviest completed set → highlight line (e.g. "데드리프트 140kg 성공"). */
export function formatHighlightLine(
  exercises: ExerciseData[],
  setsByExercise: Map<number, SetData[]>,
): string | null {
  let best: { name: string; weight: number } | null = null;

  for (const exercise of exercises) {
    const sets = setsByExercise.get(exercise.id) ?? [];
    for (const set of sets) {
      if (!set.isDone) continue;
      const weight = set.weight ?? 0;
      if (!best || weight > best.weight) {
        best = {
          name: exercise.fitness?.name ?? '운동',
          weight,
        };
      }
    }
  }

  if (!best || best.weight <= 0) return null;
  return `${best.name} ${best.weight}kg 성공`;
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
