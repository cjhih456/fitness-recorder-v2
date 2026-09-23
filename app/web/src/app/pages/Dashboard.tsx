import type { ChartData } from '../../components/section/dashboard/chart/Chart';
import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import type { TFunction } from 'i18next';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ChartSection from '../../components/section/dashboard/chart/ChartSection';
import TodayRoutineSection from '../../components/section/dashboard/todayRoutine/TodayRoutineSection';
import PageLoadingSkeleton from '../../components/utils/PageLoadingSkeleton';
import {
  trackOperationFail,
  trackOperationSuccess,
} from '../../libs/analytics';
import dayjs from '../../libs/dayjs';

function getTodayParts() {
  const today = dayjs();
  return {
    year: today.year(),
    month: today.month() + 1,
    date: today.date(),
  };
}

function formatTodayLabel(t: TFunction, now = dayjs()): string {
  return t('dashboard.todayLabel', {
    month: now.month() + 1,
    date: now.date(),
    weekday: t(`weekdayLong.${now.day()}`),
  });
}

/**
 * Volume-by-day aggregation API is not available yet.
 * Empty series → Sparse chart (HMRbz) until ≥4 points can be derived.
 */
function useWeeklyVolumeData(): ChartData[] {
  return [];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    data = [],
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = hooks.useExercisePresetListQuery({
    size: 20,
  });
  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);
  const cloneMutation = hooks.useCloneScheduleFromPresetMutation();
  const [startingPresetId, setStartingPresetId] = useState<number | null>(null);
  const volumeData = useWeeklyVolumeData();
  const dateLabel = useMemo(() => formatTodayLabel(t), [t]);

  const handleCreateRoutine = useCallback(() => {
    navigate('/routines');
  }, [navigate]);

  const handleStartWorkout = useCallback(
    async (routine: ExercisePresetWithExerciseList) => {
      setStartingPresetId(routine.id);
      try {
        const schedule = await cloneMutation.mutateAsync({
          presetId: routine.id,
          targetDate: getTodayParts(),
        });
        trackOperationSuccess('preset_start');
        navigate(`/workout/${schedule.id}`);
      } catch (error) {
        trackOperationFail('preset_start');
        throw error;
      } finally {
        setStartingPresetId(null);
      }
    },
    [cloneMutation, navigate],
  );

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <ChartSection data={volumeData} />
      <TodayRoutineSection
        data={data}
        dateLabel={dateLabel}
        startingPresetId={startingPresetId}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={loadMore}
        onClickStartWorkout={handleStartWorkout}
        onClickCreateRoutine={handleCreateRoutine}
      />
    </div>
  );
}
