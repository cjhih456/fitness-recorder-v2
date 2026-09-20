import type { HistoryListItem } from './types';
import { hooks } from '@fitness-recoder/graphql-sqlite-worker';
import { useMemo } from 'react';
import HistoryCardLoader from './HistoryCardLoader';

interface HistoryDayGroupProps {
  year: number;
  month: number;
  date: number;
  onClickHistory?: (workout: HistoryListItem) => void;
}

export default function HistoryDayGroup({
  year,
  month,
  date,
  onClickHistory,
}: HistoryDayGroupProps) {
  const { data: schedules = [] } = hooks.useScheduleByDateQuery({
    year,
    month,
    date,
  });

  const finishSchedules = useMemo(
    () => schedules.filter((schedule) => schedule.type === 'FINISH'),
    [schedules],
  );

  if (finishSchedules.length === 0) return null;

  return (
    <>
      {finishSchedules.map((schedule) => (
        <HistoryCardLoader
          key={schedule.id}
          schedule={schedule}
          onClickHistory={onClickHistory}
        />
      ))}
    </>
  );
}
