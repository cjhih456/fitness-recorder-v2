import { Button } from '@fitness-recoder/ui';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        aria-label={t('common.home')}
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
            {t('finish.doneTitle')}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t('finish.summary', { duration: durationLabel, volume: volumeLabel })}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            className="w-full rounded-2xl py-6 font-bold"
            onClick={onPhoto}
          >
            {t('finish.createPhoto')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl py-6 font-bold"
            onClick={onHistory}
          >
            {t('finish.viewHistory')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full rounded-2xl py-6 font-bold"
            onClick={handleHome}
          >
            {t('common.home')}
          </Button>
        </div>

        {onSaveRoutine ? (
          <button
            type="button"
            className="mt-4 w-full py-2 text-sm font-bold text-blue-600 hover:underline disabled:opacity-50"
            onClick={onSaveRoutine}
            disabled={isSavingRoutine}
          >
            {t('finish.saveAsRoutine')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
