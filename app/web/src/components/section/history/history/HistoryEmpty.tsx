import { Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight } from 'lucide-react';
import { useCallback } from 'react';
import MuscleChip from './MuscleChip';

interface HistoryEmptyProps {
  onClickHome?: () => void;
}

export default function HistoryEmpty({ onClickHome }: HistoryEmptyProps) {
  const handleHome = useCallback(() => {
    onClickHome?.();
  }, [onClickHome]);

  return (
    <Card
      role="button"
      tabIndex={0}
      className="cursor-pointer border border-zinc-200 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
      onClick={handleHome}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleHome();
        }
      }}
      aria-label="홈으로"
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex min-w-[64px] flex-col items-center rounded-2xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          <span className="text-[10px] font-black uppercase leading-tight">
            —
          </span>
          <span className="text-xl font-black">—</span>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <h3 className="font-bold text-zinc-800 dark:text-zinc-100">
            아직 운동 기록이 없습니다
          </h3>
          <p className="text-xs font-medium text-zinc-400">
            홈이나 루틴에서 운동을 시작해 보세요
          </p>
          <div className="flex gap-1.5">
            <MuscleChip label="가슴" muted />
            <MuscleChip label="등" muted />
          </div>
          <p className="text-xs font-medium text-blue-600">홈으로 →</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-zinc-300" />
      </CardContent>
    </Card>
  );
}
