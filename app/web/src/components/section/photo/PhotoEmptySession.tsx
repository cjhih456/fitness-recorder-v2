import { Button } from '@fitness-recoder/ui';
import { ImageOff } from 'lucide-react';
import { useCallback } from 'react';

interface PhotoEmptySessionProps {
  onStartWorkout?: () => void;
}

export default function PhotoEmptySession({
  onStartWorkout,
}: PhotoEmptySessionProps) {
  const handleStart = useCallback(() => {
    onStartWorkout?.();
  }, [onStartWorkout]);

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-muted px-10 py-10 text-center">
      <ImageOff size={32} className="text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          완료한 운동이 없습니다
        </p>
        <p className="text-xs text-muted-foreground">
          운동을 마치면 인증 사진을 만들 수 있어요
        </p>
      </div>
      <Button
        type="button"
        className="rounded-full bg-blue-600 px-5 py-3 text-[13px] font-semibold text-white hover:bg-blue-700"
        onClick={handleStart}
      >
        운동 시작
      </Button>
    </div>
  );
}
