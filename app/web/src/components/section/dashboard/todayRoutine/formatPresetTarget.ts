import type {
  ExercisePresetWithExerciseList,
  FitnessMuscle,
} from '@fitness-recoder/structure';
import type { TFunction } from 'i18next';

function translateMuscle(t: TFunction, muscle: FitnessMuscle | string): string {
  const translated = t(`muscle.${muscle}` as never);
  return translated === `muscle.${muscle}` ? muscle : translated;
}

export function formatPresetTarget(
  routine: ExercisePresetWithExerciseList,
  t: TFunction,
): string {
  const muscles = routine.exerciseList
    .flatMap((exercise) => exercise.fitness?.primaryMuscles ?? [])
    .filter(Boolean);

  const unique = Array.from(new Set(muscles));
  if (unique.length === 0) return t('dashboard.noTarget');

  const labels = unique.map((muscle) => translateMuscle(t, muscle));
  if (labels.length <= 2) return labels.join('/');
  return t('dashboard.moreTargets', {
    labels: labels.slice(0, 2).join('/'),
    count: labels.length - 2,
  });
}
