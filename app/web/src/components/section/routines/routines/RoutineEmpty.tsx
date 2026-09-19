import { Button, Card, CardContent, CardFooter, CardTitle, Separator } from '@fitness-recoder/ui';
import { useCallback } from 'react';

interface RoutineEmptyProps {
  onClickCreateRoutine?: () => void;
}

export default function RoutineEmpty({ onClickCreateRoutine }: RoutineEmptyProps) {
  const handleCreate = useCallback(() => {
    onClickCreateRoutine?.();
  }, [onClickCreateRoutine]);

  return (
    <Card className="overflow-hidden pb-0">
      <CardContent>
        <div>
          <CardTitle className="text-lg">나만의 루틴을 만들어 보세요</CardTitle>
          <p className="text-sm text-zinc-500 mb-2">
            자주 하는 운동을 저장해 두면 한 번에 시작할 수 있어요
          </p>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-400 rounded-md text-[10px] font-bold uppercase">
              CREATE
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-full">
          <Separator />
          <Button
            type="button"
            variant="ghost"
            className="rounded-t-none rounded-b-2xl w-full text-xs font-bold text-blue-600 dark:text-blue-400"
            onClick={handleCreate}
          >
            루틴 생성
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
