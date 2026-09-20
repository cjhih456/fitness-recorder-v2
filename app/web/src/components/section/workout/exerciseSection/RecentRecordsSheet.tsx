import { Button } from '@fitness-recoder/ui';
import { X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

export interface RecentRecordRow {
  id: string;
  dateLabel: string;
  weight: number;
  repeat: number;
}

interface RecentRecordsSheetProps {
  open: boolean;
  exerciseName: string;
  records?: RecentRecordRow[];
  onOpenChange?: (open: boolean) => void;
}

export default function RecentRecordsSheet({
  open,
  exerciseName,
  records = [],
  onOpenChange,
}: RecentRecordsSheetProps) {
  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="닫기"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="recent-records-title"
        className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col rounded-t-3xl bg-background p-4 pb-8 shadow-lg sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="recent-records-title"
            className="text-lg font-bold text-foreground"
          >
            {exerciseName} · 최근 기록
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            onClick={handleClose}
            aria-label="닫기"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {records.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              아직 이 운동의 기록이 없습니다
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900"
              >
                <span className="text-sm font-medium text-foreground">
                  {record.dateLabel}
                </span>
                <span className="text-sm text-zinc-500">
                  {record.weight} kg · {record.repeat}회
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
