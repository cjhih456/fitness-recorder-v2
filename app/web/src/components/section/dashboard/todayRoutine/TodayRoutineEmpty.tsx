import { Card, CardContent } from '@fitness-recoder/ui';
import { ChevronRight, Dumbbell } from 'lucide-react';
import { useCallback } from 'react';

interface TodayRoutineEmptyProps {
  onClickCreateRoutine?: () => void;
}

export default function TodayRoutineEmpty({
  onClickCreateRoutine,
}: TodayRoutineEmptyProps) {
  const handleCreate = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);

  return (
    <Card
      className="cursor-pointer border bg-zinc-100 transition-colors hover:border-blue-200 dark:bg-zinc-800/60"
      onClick={handleCreate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCreate();
        }
      }}
      aria-label="루틴 만들기"
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Dumbbell size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-foreground">
            오늘 시작할 루틴이 없습니다
          </p>
          <p className="text-[13px] font-medium text-blue-600">
            루틴 탭에서 만들어 보세요
          </p>
        </div>
        <ChevronRight size={20} className="shrink-0 text-zinc-400" />
      </CardContent>
    </Card>
  );
}
