import { Button } from '@fitness-recoder/ui';
import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DbInitErrorProps {
  error: Error | null;
  onRetry: () => void;
}

export default function DbInitError({ error, onRetry }: DbInitErrorProps) {
  const { t } = useTranslation();

  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 py-10"
      role="alert"
    >
      <CircleAlert
        className="size-9 text-destructive"
        aria-hidden
        strokeWidth={2}
      />
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        {t('error.db.init')}
      </h2>
      {error?.message ? (
        <p className="text-center text-[13px] text-muted-foreground">
          {error.message}
        </p>
      ) : null}
      <Button type="button" onClick={onRetry}>
        {t('common.retry')}
      </Button>
    </div>
  );
}
