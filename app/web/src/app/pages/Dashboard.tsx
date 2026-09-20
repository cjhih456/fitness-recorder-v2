import type { ChartData } from '../../components/section/dashboard/chart/Chart';
import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChartSection from '../../components/section/dashboard/chart/ChartSection';
import TodayRoutineSection from '../../components/section/dashboard/todayRoutine/TodayRoutineSection';
import PageLoadingSkeleton from '../../components/utils/PageLoadingSkeleton';
import dayjs from '../../libs/dayjs';

const WEEKDAY_KO = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

function getTodayParts() {
  const today = dayjs();
  return {
    year: today.year(),
    month: today.month() + 1,
    date: today.date(),
  };
}

function formatTodayLabel(now = dayjs()): string {
  return `${now.month() + 1}월 ${now.date()}일 ${WEEKDAY_KO[now.day()]}`;
}

/**
 * Volume-by-day aggregation API is not available yet.
 * Empty series → Sparse chart (HMRbz) until ≥4 points can be derived.
 */
function useWeeklyVolumeData(): ChartData[] {
  return [];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data = [], isLoading } = hooks.useExercisePresetListQuery({
    offset: 0,
    size: 20,
  });
  const cloneMutation = hooks.useCloneScheduleFromPresetMutation();
  const [startingPresetId, setStartingPresetId] = useState<number | null>(null);
  const volumeData = useWeeklyVolumeData();
  const dateLabel = formatTodayLabel();

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
        navigate(`/workout/${schedule.id}`);
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
        onClickStartWorkout={handleStartWorkout}
        onClickCreateRoutine={handleCreateRoutine}
      />
    </div>
  );
}
