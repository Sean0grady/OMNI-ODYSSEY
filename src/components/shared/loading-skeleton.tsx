import { Skeleton } from "@/components/ui/skeleton";

export function ReadingOrderCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-2/3 w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function ReadingOrderGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ReadingOrderCardSkeleton key={index} />
      ))}
    </div>
  );
}
