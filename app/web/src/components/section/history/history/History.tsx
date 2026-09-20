import type { HistoryListItem } from './types';
import { Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import MuscleChip from './MuscleChip';

interface HistoryProps {
  data: HistoryListItem;
  onClickHistory?: (workout: HistoryListItem) => void;
}

export default function History({ data, onClickHistory }: HistoryProps) {
  const { t } = useTranslation();
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
      aria-label={t('history.detailAria', { title: data.title })}
      className="cursor-pointer border border-border transition-all hover:bg-muted/60"
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex min-w-[64px] flex-col items-center rounded-2xl bg-brand-soft p-3 text-brand-text">
          <span className="text-[10px] font-black uppercase leading-tight">
            {t('history.month', { month: data.month })}
          </span>
          <span className="text-xl font-black">{data.date}</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-bold text-foreground">
            {data.title}
          </h3>
          <p className="text-xs font-medium text-muted-foreground">
            {t('history.summary', {
              minutes: data.workoutTimes,
              volume: data.totalVolume,
            })}
          </p>
          {data.muscles.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {data.muscles.map((muscle) => (
                <MuscleChip key={muscle} label={muscle} />
              ))}
            </div>
          ) : null}
          <p className="text-xs font-medium text-muted-foreground">
            {data.exerciseSummary}
          </p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted-foreground/50" />
      </CardContent>
    </Card>
  );
}
