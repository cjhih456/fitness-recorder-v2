import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { useTranslation } from 'react-i18next';
import SectionSkeleton from '../../SectionSkeleton';
import TodayRoutine from './TodayRoutine';
import TodayRoutineEmpty from './TodayRoutineEmpty';

interface TodayRoutineSectionProps {
  data: ExercisePresetWithExerciseList[];
  dateLabel: string;
  onClickStartWorkout?: (routine: ExercisePresetWithExerciseList) => void;
  onClickCreateRoutine?: () => void;
  startingPresetId?: number | null;
}

export default function TodayRoutineSection({
  data,
  dateLabel,
  onClickStartWorkout,
  onClickCreateRoutine,
  startingPresetId = null,
}: TodayRoutineSectionProps) {
  const { t } = useTranslation();
  return (
    <SectionSkeleton title={t('dashboard.todayRoutine')} useCard={false}>
      {{
        default: (
          <div className="flex flex-col gap-4">
            {data.length === 0 ? (
              <TodayRoutineEmpty onClickCreateRoutine={onClickCreateRoutine} />
            ) : (
              data.map((routine) => (
                <TodayRoutine
                  key={routine.id}
                  routine={routine}
                  onClickStartWorkout={onClickStartWorkout}
                  isStarting={startingPresetId === routine.id}
                />
              ))
            )}
          </div>
        ),
        subtitle: (
          <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-bold text-brand-text">
            {dateLabel}
          </span>
        ),
      }}
    </SectionSkeleton>
  );
}
