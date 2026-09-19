export default function PageLoadingSkeleton() {
  return (
    <div
      className="max-w-md mx-auto space-y-6 p-4"
      aria-busy="true"
      aria-label="로딩 중"
    >
      <div className="space-y-2">
        <div className="h-4 w-28 animate-pulse rounded-md bg-muted" />
        <div className="h-3 w-40 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-40 w-full animate-pulse rounded-2xl bg-muted" />
      <div className="space-y-3">
        <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="h-16 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
