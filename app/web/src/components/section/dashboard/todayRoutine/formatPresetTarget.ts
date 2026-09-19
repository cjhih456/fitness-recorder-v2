import type {
  ExercisePresetWithExerciseList,
  FitnessMuscle,
} from '@fitness-recoder/structure';

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

export function formatPresetTarget(
  routine: ExercisePresetWithExerciseList,
): string {
  const muscles = routine.exerciseList
    .flatMap((exercise) => exercise.fitness?.primaryMuscles ?? [])
    .filter(Boolean);

  const unique = Array.from(new Set(muscles));
  if (unique.length === 0) return '부위 없음';

  const labels = unique.map((muscle) => MUSCLE_LABEL[muscle] ?? muscle);
  if (labels.length <= 2) return labels.join('/');
  return `${labels.slice(0, 2).join('/')} 외 ${labels.length - 2}`;
}
