import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { Button, Spinner } from '@fitness-recoder/ui';
import { Plus } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import VirtualList from '../../../utils/VirtualList';
import SectionSkeleton from '../../SectionSkeleton';
import Routine from './Routine';
import RoutineEmpty from './RoutineEmpty';

interface RoutineSectionProps {
  data: ExercisePresetWithExerciseList[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  startingPresetId?: number | null;
  onLoadMore?: () => void;
  onClickCreateRoutine?: () => void;
  onClickDeleteRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickEditRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickStartRoutine?: (routine: ExercisePresetWithExerciseList) => void;
  onClickOpenActions?: (routine: ExercisePresetWithExerciseList) => void;
}

export default function RoutineSection({
  data,
  isLoading = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  startingPresetId = null,
  onLoadMore,
  onClickCreateRoutine,
  onClickDeleteRoutine,
  onClickEditRoutine,
  onClickStartRoutine,
  onClickOpenActions,
}: RoutineSectionProps) {
  const { t } = useTranslation();
  const handleDeleteRoutine = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      onClickDeleteRoutine?.(routine);
    },
    [onClickDeleteRoutine],
  );
  const handleEditRoutine = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      onClickEditRoutine?.(routine);
    },
    [onClickEditRoutine],
  );
  const handleStartRoutine = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      onClickStartRoutine?.(routine);
    },
    [onClickStartRoutine],
  );
  const handleOpenActions = useCallback(
    (routine: ExercisePresetWithExerciseList) => {
      onClickOpenActions?.(routine);
    },
    [onClickOpenActions],
  );
  const handleCreateRoutine = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);

  return (
    <SectionSkeleton title={t('routines.mine')} useCard={false}>
      {{
        subtitle: (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="px-4 font-bold rounded-full"
            onClick={handleCreateRoutine}
          >
            <Plus size={20} />
            {t('routines.create')}
          </Button>
        ),
        default: isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <RoutineEmpty onClickCreateRoutine={handleCreateRoutine} />
        ) : (
          <VirtualList
            items={data}
            estimateSize={188}
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
              <Routine
                routine={routine}
                onClickDeleteRoutine={handleDeleteRoutine}
                onClickEditRoutine={handleEditRoutine}
                onClickStartRoutine={handleStartRoutine}
                onClickOpenActions={handleOpenActions}
                isStarting={startingPresetId === routine.id}
              />
            )}
          />
        ),
      }}
    </SectionSkeleton>
  );
}
