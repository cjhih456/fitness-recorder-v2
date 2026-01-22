import { Suspense, useCallback } from "react";
import { ErrorBoundary } from 'react-error-boundary'

interface SuspenseBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onError?: (error: unknown) => void;
}

export default function SuspenseBoundary({
  fallback, children, onError
}: SuspenseBoundaryProps) {
  const getErrorMessage = useCallback((error: unknown) => {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }, [])
  const handleError = useCallback((error: unknown) => {
    // TODO: 오류 트래커 추가시 여기 진행
    onError?.(error);
  }, [onError])
  return (
    <ErrorBoundary
      onError={handleError}
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-2xl font-bold">Error: {getErrorMessage(error)}</div>
          <button onClick={resetErrorBoundary} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Retry</button>
        </div>
      )}
    >
      <Suspense fallback={fallback || <div>Loading...</div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}