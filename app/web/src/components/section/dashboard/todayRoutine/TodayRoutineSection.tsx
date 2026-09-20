import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { Spinner } from '@fitness-recoder/ui';
import { useTranslation } from 'react-i18next';
import VirtualList from '../../../utils/VirtualList';
import SectionSkeleton from '../../SectionSkeleton';
import TodayRoutine from './TodayRoutine';
import TodayRoutineEmpty from './TodayRoutineEmpty';

interface TodayRoutineSectionProps {
  data: ExercisePresetWithExerciseList[];
  dateLabel: string;
  onClickStartWorkout?: (routine: ExercisePresetWithExerciseList) => void;
  onClickCreateRoutine?: () => void;
  startingPresetId?: number | null;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function TodayRoutineSection({
  data,
  dateLabel,
  onClickStartWorkout,
  onClickCreateRoutine,
  startingPresetId = null,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: TodayRoutineSectionProps) {
  const { t } = useTranslation();
  return (
    <SectionSkeleton title={t('dashboard.todayRoutine')} useCard={false}>
      {{
        default:
          data.length === 0 ? (
            <TodayRoutineEmpty onClickCreateRoutine={onClickCreateRoutine} />
          ) : (
            <VirtualList
              items={data}
              estimateSize={88}
              gap={16}
              scroll="window"
              getItemKey={(routine) => routine.id}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={onLoadMore}
              renderLoader={() => (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}
              renderItem={(routine) => (
                <TodayRoutine
                  routine={routine}
                  onClickStartWorkout={onClickStartWorkout}
                  isStarting={startingPresetId === routine.id}
                />
              )}
            />
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
