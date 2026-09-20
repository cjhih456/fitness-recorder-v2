import type { HistoryListItem } from '../../components/section/history/history/types';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HistorySection from '../../components/section/history/history/HistorySection';
import dayjs from '../../libs/dayjs';

interface MonthParts {
  year: number;
  month: number;
}

function getMonthParts(offset = 0): MonthParts {
  const d = dayjs().subtract(offset, 'month');
  return {
    year: d.year(),
    month: d.month() + 1,
  };
}

function collectFinishDates(status: string[][] | undefined): number[] {
  if (!status) return [];
  const dates: number[] = [];
  status.forEach((types, date) => {
    if (types?.includes('FINISH')) {
      dates.push(date);
    }
  });
  return dates.sort((a, b) => b - a);
}

export default function History() {
  const navigate = useNavigate();
  const current = useMemo(() => getMonthParts(0), []);
  const previous = useMemo(() => getMonthParts(1), []);

  const { data: currentStatus, isLoading: currentLoading } =
    hooks.useScheduleStatusByMonthQuery(current);
  const { data: previousStatus, isLoading: previousLoading } =
    hooks.useScheduleStatusByMonthQuery(previous);

  const currentDates = useMemo(
    () => collectFinishDates(currentStatus),
    [currentStatus],
  );
  const previousDates = useMemo(
    () => collectFinishDates(previousStatus),
    [previousStatus],
  );

  const isLoading = currentLoading || previousLoading;
  const isEmpty =
    !isLoading && currentDates.length === 0 && previousDates.length === 0;

  const handleClickHistory = useCallback(
    (workout: HistoryListItem) => {
      navigate(`/history/${workout.id}`);
    },
    [navigate],
  );

  const handleClickHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <div className="mx-auto max-w-md space-y-4 p-4 pb-28">
      {isEmpty ? (
        <HistorySection
          year={current.year}
          month={current.month}
          finishDates={[]}
          isLoading={false}
          onClickHistory={handleClickHistory}
          onClickHome={handleClickHome}
        />
      ) : (
        <>
          {currentDates.length > 0 || currentLoading ? (
            <HistorySection
              year={current.year}
              month={current.month}
              finishDates={currentDates}
              isLoading={currentLoading}
              onClickHistory={handleClickHistory}
            />
          ) : null}
          {previousDates.length > 0 ? (
            <HistorySection
              year={previous.year}
              month={previous.month}
              finishDates={previousDates}
              isLoading={previousLoading}
              onClickHistory={handleClickHistory}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
