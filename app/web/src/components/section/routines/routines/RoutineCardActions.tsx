import type { ExercisePresetWithExerciseList } from '@fitness-recoder/structure';
import { Button } from '@fitness-recoder/ui';
import { useCallback, useEffect } from 'react';

interface RoutineCardActionsProps {
  open: boolean;
  routine: ExercisePresetWithExerciseList | null;
  onOpenChange?: (open: boolean) => void;
  onClickStart?: (routine: ExercisePresetWithExerciseList) => void;
  onClickEdit?: (routine: ExercisePresetWithExerciseList) => void;
  onClickDelete?: (routine: ExercisePresetWithExerciseList) => void;
  isStarting?: boolean;
}

export default function RoutineCardActions({
  open,
  routine,
  onOpenChange,
  onClickStart,
  onClickEdit,
  onClickDelete,
  isStarting = false,
}: RoutineCardActionsProps) {
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const handleStart = useCallback(() => {
    if (!routine) return;
    onClickStart?.(routine);
  }, [routine, onClickStart]);

  const handleEdit = useCallback(() => {
    if (!routine) return;
    onClickEdit?.(routine);
    onOpenChange?.(false);
  }, [routine, onClickEdit, onOpenChange]);

  const handleDelete = useCallback(() => {
    if (!routine) return;
    onClickDelete?.(routine);
    onOpenChange?.(false);
  }, [routine, onClickDelete, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  if (!open || !routine) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-actions-title"
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-background p-6 pb-8 shadow-lg"
      >
        <p
          id="routine-actions-title"
          className="text-sm font-medium text-zinc-500 mb-4"
        >
          {routine.name}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="default"
            className="w-full rounded-2xl h-12 font-bold"
            onClick={handleStart}
            disabled={isStarting}
          >
            이 루틴으로 시작
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl h-12 font-bold"
            onClick={handleEdit}
          >
            편집하기
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full h-11 font-bold text-red-500 hover:text-red-600"
            onClick={handleDelete}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
