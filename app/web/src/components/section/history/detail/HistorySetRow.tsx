import type { SetData } from '@fitness-recoder/structure';
import { CheckCircle2 } from 'lucide-react';

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
  return (
    <div
      className={`grid grid-cols-12 gap-2 rounded-xl border p-2 ${
        set.isDone
          ? 'border-green-200 bg-green-50 opacity-90 dark:border-green-800 dark:bg-green-900/20'
          : 'border-transparent bg-zinc-50 dark:bg-zinc-900/50'
      }`}
      aria-label={`${exerciseName} ${index + 1}세트`}
    >
      <div className="col-span-2 flex items-center justify-center font-bold text-zinc-500">
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
          aria-label={`${exerciseName} ${index + 1}세트 ${set.isDone ? '완료' : '미완료'}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${
            set.isDone
              ? 'bg-green-500 text-white shadow-md'
              : 'border-2 border-zinc-200 bg-background text-transparent dark:border-zinc-700'
          }`}
        >
          <CheckCircle2 size={20} aria-hidden />
        </span>
      </div>
    </div>
  );
}
