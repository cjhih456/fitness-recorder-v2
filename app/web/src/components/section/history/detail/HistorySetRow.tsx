import type { SetData } from '@fitness-recoder/structure';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HistorySetRowProps {
  set: SetData;
  index: number;
  exerciseName: string;
}

export default function HistorySetRow({
  set,
  index,
  exerciseName,
}: HistorySetRowProps) {
  const { t } = useTranslation();
  return (
    <div
      className={`grid grid-cols-12 gap-2 rounded-xl border p-2 ${
        set.isDone
          ? 'border-success/30 bg-success-soft opacity-90'
          : 'border-transparent bg-muted'
      }`}
      aria-label={t('history.setAria', {
        name: exerciseName,
        index: index + 1,
      })}
    >
      <div className="col-span-2 flex items-center justify-center font-bold text-muted-foreground">
        {index + 1}
      </div>
      <div className="col-span-4 flex items-center justify-center">
        <span className="w-full rounded-lg bg-background p-2 text-center text-sm font-bold shadow-sm">
          {set.weight ?? 0}
        </span>
      </div>
      <div className="col-span-4 flex items-center justify-center">
        <span className="w-full rounded-lg bg-background p-2 text-center text-sm font-bold shadow-sm">
          {set.repeat}
        </span>
      </div>
      <div className="col-span-2 flex items-center justify-center">
        <span
          aria-label={t('history.setDoneAria', {
            name: exerciseName,
            index: index + 1,
            status: set.isDone ? t('common.done') : t('common.incomplete'),
          })}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            set.isDone
              ? 'bg-success text-success-foreground shadow-md'
              : 'border-2 border-border bg-background text-transparent'
          }`}
        >
          <CheckCircle2 size={20} aria-hidden />
        </span>
      </div>
    </div>
  );
}
