import { Button } from '@fitness-recoder/ui';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface DiscardDraftConfirmProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function DiscardDraftConfirm({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}: DiscardDraftConfirmProps) {
  const { t } = useTranslation();
  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange?.(false);
  }, [onCancel, onOpenChange]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onOpenChange?.(false);
  }, [onConfirm, onOpenChange]);

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
        className="absolute inset-0 bg-scrim"
        aria-label={t('common.close')}
        onClick={handleCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-draft-title"
        aria-describedby="discard-draft-body"
        className="relative z-10 w-full max-w-md rounded-t-3xl bg-background p-6 pb-8 shadow-lg sm:rounded-3xl"
      >
        <div className="space-y-2 pb-6 pt-2 text-center">
          <h2
            id="discard-draft-title"
            className="text-lg font-bold text-foreground"
          >
            {t('routines.discardTitle')}
          </h2>
          <p id="discard-draft-body" className="text-sm text-muted-foreground">
            {t('routines.discardBody')}
          </p>
        </div>
        <div className="flex flex-row gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 rounded-full font-bold"
            onClick={handleCancel}
          >
            {t('routines.keepEditing')}
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-full font-bold bg-primary text-primary-foreground hover:bg-primary/80"
            onClick={handleConfirm}
          >
            {t('routines.leave')}
          </Button>
        </div>
      </div>
    </div>
  );
}
