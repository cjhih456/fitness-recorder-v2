import { Button } from '@fitness-recoder/ui';
import { useCallback, useEffect } from 'react';

interface FinishIncompleteConfirmProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  isPending?: boolean;
}

export default function FinishIncompleteConfirm({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isPending = false,
}: FinishIncompleteConfirmProps) {
  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange?.(false);
  }, [onCancel, onOpenChange]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="닫기"
        onClick={handleCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finish-incomplete-title"
        aria-describedby="finish-incomplete-body"
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-background p-6 pb-8 shadow-lg sm:rounded-3xl"
      >
        <div className="space-y-2 pb-6 pt-2 text-center">
          <h2
            id="finish-incomplete-title"
            className="text-lg font-bold text-foreground"
          >
            운동을 종료할까요?
          </h2>
          <p id="finish-incomplete-body" className="text-sm text-zinc-500">
            아직 끝내지 않은 세트가 있습니다.
          </p>
        </div>
        <div className="flex flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-full font-bold"
            onClick={handleCancel}
            disabled={isPending}
          >
            계속하기
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full font-bold bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleConfirm}
            disabled={isPending}
          >
            종료
          </Button>
        </div>
      </div>
    </div>
  );
}
