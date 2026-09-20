import { Button } from '@fitness-recoder/ui';
import { CircleAlert } from 'lucide-react';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
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
            문제가 발생했습니다
          </h2>
          <p className="text-center text-[13px] text-muted-foreground">
            잠시 후 다시 시도해 주세요
          </p>
          <Button
            type="button"
            onClick={resetErrorBoundary}
            className="rounded-full bg-blue-600 px-6 text-white hover:bg-blue-600"
          >
            다시 시도
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
