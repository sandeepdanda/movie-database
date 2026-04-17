export function MovieCardSkeleton() {
  return (
    <div>
      <div className="aspect-[2/3] rounded-lg shimmer mb-3" />
      <div className="h-4 rounded shimmer mb-2" />
      <div className="h-3 w-1/2 rounded shimmer" />
    </div>
  );
}

export function MovieCardSkeletonGrid({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}
