import type { ScheduleData } from '@fitness-recoder/structure';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PhotoEmptySession from '../../components/section/photo/PhotoEmptySession';
import PhotoSession from '../../components/section/photo/PhotoSession';
import { pickLatestFinish } from '../../components/section/photo/formatPhoto';
import PageLoadingSkeleton from '../../components/utils/PageLoadingSkeleton';
import dayjs from '../../libs/dayjs';

function getTodayParts() {
  const today = dayjs();
  return {
    year: today.year(),
    month: today.month() + 1,
    date: today.date(),
  };
}

function parseScheduleId(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

export default function Photo() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramScheduleId = parseScheduleId(searchParams.get('scheduleId'));
  const today = useMemo(() => getTodayParts(), []);

  const { data: paramSchedule, isLoading: isParamLoading } =
    hooks.useScheduleQuery(paramScheduleId);
  const { data: todaySchedules, isLoading: isTodayLoading } =
    hooks.useScheduleByDateQuery(today, {
      enabled: paramScheduleId === undefined,
    });

  const schedule: ScheduleData | undefined = useMemo(() => {
    if (paramScheduleId !== undefined) {
      if (paramSchedule?.type === 'FINISH') return paramSchedule;
      return undefined;
    }
    return pickLatestFinish(todaySchedules);
  }, [paramScheduleId, paramSchedule, todaySchedules]);

  const isLoading =
    paramScheduleId !== undefined ? isParamLoading : isTodayLoading;

  const handleStartWorkout = useCallback(() => {
    navigate('/');
  }, [navigate]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
      <h2 className="text-lg font-semibold text-foreground">
        {t('photo.createTitle')}
      </h2>

      {schedule ? (
        <PhotoSession schedule={schedule} />
      ) : (
        <PhotoEmptySession onStartWorkout={handleStartWorkout} />
      )}
    </div>
  );
}
