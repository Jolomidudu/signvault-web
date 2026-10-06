export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return <div className="space-y-3" aria-label="Loading content"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{Array.from({ length: count }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />)}</div></div>;
}
