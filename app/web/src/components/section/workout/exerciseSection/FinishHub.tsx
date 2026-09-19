import { Button } from '@fitness-recoder/ui';
import { useCallback, useEffect } from 'react';

interface FinishHubProps {
  open: boolean;
  durationLabel: string;
  volumeLabel: string;
  onOpenChange?: (open: boolean) => void;
  onPhoto?: () => void;
  onHistory?: () => void;
  onHome?: () => void;
  onSaveRoutine?: () => void;
  isSavingRoutine?: boolean;
}

export default function FinishHub({
  open,
  durationLabel,
  volumeLabel,
  onOpenChange,
  onPhoto,
  onHistory,
  onHome,
  onSaveRoutine,
  isSavingRoutine = false,
}: FinishHubProps) {
  const handleHome = useCallback(() => {
    onHome?.();
    onOpenChange?.(false);
  }, [onHome, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleHome();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleHome]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="홈으로"
        onClick={handleHome}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-hub-title"
        className="relative z-10 w-full max-w-sm rounded-3xl border border-zinc-100 bg-background p-6 shadow-lg dark:border-zinc-800"
      >
        <div className="space-y-2 pb-6 text-center">
          <h2
            id="finish-hub-title"
            className="text-xl font-bold text-foreground"
          >
            운동을 마쳤습니다
          </h2>
          <p className="text-sm text-zinc-500">
            {durationLabel} · 총 볼륨 {volumeLabel}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full rounded-2xl bg-blue-600 py-6 font-bold text-white hover:bg-blue-700"
            onClick={onPhoto}
          >
            인증 만들기
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl py-6 font-bold"
            onClick={onHistory}
          >
            기록 보기
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl py-6 font-bold"
            onClick={handleHome}
          >
            홈으로
          </Button>
        </div>

        {onSaveRoutine ? (
          <button
            type="button"
            className="mt-4 w-full py-2 text-sm font-bold text-blue-600 hover:underline disabled:opacity-50"
            onClick={onSaveRoutine}
            disabled={isSavingRoutine}
          >
            루틴으로 저장
          </button>
        ) : null}
      </div>
    </div>
  );
}
