import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { DiscoverBrowser } from "@/features/reading-orders/components/discover-browser";
import { searchReadingOrders } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "Discover",
  description:
    "Browse and search public reading orders by title, creator, publisher, and category.",
};

interface DiscoverPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const { q } = await searchParams;
  const items = await searchReadingOrders();

  return (
    <PageContainer as="section" className="space-y-8 py-12">
      <SectionHeading
        headingLevel="h1"
        eyebrow="Discover"
        title="Discover reading orders"
        description="Search and filter reading orders published by collectors across every publisher and category."
      />
      <DiscoverBrowser items={items} initialQuery={q ?? ""} />
    </PageContainer>
  );
}
