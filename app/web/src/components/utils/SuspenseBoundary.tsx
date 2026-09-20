import { Button } from '@fitness-recoder/ui';
import { CircleAlert } from 'lucide-react';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import PageLoadingSkeleton from './PageLoadingSkeleton';

interface SuspenseBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onError?: (error: unknown) => void;
}

export default function SuspenseBoundary({
  fallback,
  children,
  onError,
}: SuspenseBoundaryProps) {
  const { t } = useTranslation();
  const handleError = useCallback(
    (error: unknown) => {
      onError?.(error);
    },
    [onError],
  );

  return (
    <ErrorBoundary
      onError={handleError}
      fallbackRender={({ resetErrorBoundary }) => (
        <div
          className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-10"
          role="alert"
        >
          <CircleAlert
            className="size-9 text-destructive"
            aria-hidden
            strokeWidth={2}
          />
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t('error.boundary.title')}
          </h2>
          <p className="text-center text-[13px] text-muted-foreground">
            {t('error.boundary.message')}
          </p>
          <Button
            type="button"
            onClick={resetErrorBoundary}
            className="rounded-full px-6"
          >
            {t('common.tryAgain')}
          </Button>
        </div>
      )}
    >
      <Suspense fallback={fallback ?? <PageLoadingSkeleton />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
