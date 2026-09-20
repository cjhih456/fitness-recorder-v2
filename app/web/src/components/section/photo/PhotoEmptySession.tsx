import { Button } from '@fitness-recoder/ui';
import { ImageOff } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoEmptySessionProps {
  onStartWorkout?: () => void;
}

export default function PhotoEmptySession({
  onStartWorkout,
}: PhotoEmptySessionProps) {
  const { t } = useTranslation();
  const handleStart = useCallback(() => {
    onStartWorkout?.();
  }, [onStartWorkout]);

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-muted px-10 py-10 text-center">
      <ImageOff size={32} className="text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {t('photo.emptyTitle')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('photo.emptyHint')}
        </p>
      </div>
      <Button
        type="button"
        className="rounded-full px-5 py-3 text-[13px] font-semibold"
        onClick={handleStart}
      >
        {t('photo.startWorkout')}
      </Button>
    </div>
  );
}
