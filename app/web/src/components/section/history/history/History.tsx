import type { HistoryListItem } from './types';
import { Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import MuscleChip from './MuscleChip';

interface HistoryProps {
  data: HistoryListItem;
  onClickHistory?: (workout: HistoryListItem) => void;
}

export default function History({ data, onClickHistory }: HistoryProps) {
  const handleClickHistory = useCallback(() => {
    onClickHistory?.(data);
  }, [data, onClickHistory]);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleClickHistory}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleClickHistory();
        }
      }}
      aria-label={`${data.title} 상세 보기`}
      className="cursor-pointer border border-zinc-200 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex min-w-[64px] flex-col items-center rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <span className="text-[10px] font-black uppercase leading-tight">
            {data.month}월
          </span>
          <span className="text-xl font-black">{data.date}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">
            {data.title}
          </h3>
          <p className="text-xs font-medium text-zinc-400">
            시간: {data.workoutTimes}분 · 총 볼륨: {data.totalVolume}
          </p>
          {data.muscles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.muscles.map((muscle) => (
                <MuscleChip key={muscle} label={muscle} />
              ))}
            </div>
          ) : null}
          <p className="text-xs font-medium text-zinc-500">
            {data.exerciseSummary}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-zinc-300" />
      </CardContent>
    </Card>
  );
}
