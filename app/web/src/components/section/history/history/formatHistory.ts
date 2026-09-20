import type { HistoryListItem, HistorySchedule } from './types';
import type { ExerciseData, FitnessMuscle } from '@fitness-recoder/structure';

const MUSCLE_LABEL: Partial<Record<FitnessMuscle, string>> = {
  chest: '가슴',
  shoulders: '어깨',
  triceps: '삼두',
  biceps: '이두',
  lats: '광배',
  middle_back: '등',
  lower_back: '하부 등',
  traps: '승모',
  abdominals: '복근',
  quadriceps: '대퇴',
  hamstrings: '햄스트링',
  glutes: '둔근',
  calves: '종아리',
  adductors: '내전근',
  abductors: '외전근',
  forearms: '전완',
  neck: '목',
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export function formatMuscleLabels(exercises: ExerciseData[]): string[] {
  const muscles = exercises.flatMap(
    (exercise) => exercise.fitness?.primaryMuscles ?? [],
  );
  const unique = Array.from(new Set(muscles));
  return unique
    .map((muscle) => MUSCLE_LABEL[muscle] ?? muscle)
    .slice(0, 4);
}

export function formatExerciseSummary(exercises: ExerciseData[]): string {
  if (exercises.length === 0) return '기록된 운동 없음';
  const firstName = exercises[0]?.fitness?.name ?? '운동';
  if (exercises.length === 1) return firstName;
  return `${firstName} 외 ${exercises.length - 1}종`;
}

export function formatScheduleTitle(schedule: HistorySchedule): string {
  const title = schedule.title.trim();
  return title ? title : '운동 기록';
}

export function formatHistoryDateLabel(
  year: number,
  month: number,
  date: number,
): string {
  const weekday = WEEKDAYS[new Date(year, month - 1, date).getDay()] ?? '';
  return `${month}월 ${date}일 ${weekday}요일`;
}

export function toHistoryListItem(
  schedule: HistorySchedule,
  exercises: ExerciseData[],
  totalVolume = 0,
): HistoryListItem {
  return {
    id: schedule.id,
    year: schedule.year,
    month: schedule.month,
    date: schedule.date,
    title: formatScheduleTitle(schedule),
    workoutTimes: schedule.workoutTimes,
    totalVolume,
    muscles: formatMuscleLabels(exercises),
    exerciseSummary: formatExerciseSummary(exercises),
  };
}
