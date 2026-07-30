import { PageContainer } from "@/components/layout/page-container";
import { ReadingOrderGridSkeleton } from "@/components/shared/loading-skeleton";

export default function DiscoverLoading() {
  return (
    <PageContainer as="section" className="space-y-8 py-12">
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-8 w-72 animate-pulse rounded bg-muted" />
      </div>
      <ReadingOrderGridSkeleton />
    </PageContainer>
  );
}
