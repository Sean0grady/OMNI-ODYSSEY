import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { ReadingOrderMetadata } from "@/components/reading-orders/reading-order-metadata";
import { ReadingOrderEntryList } from "@/components/reading-orders/reading-order-entry-list";
import { CompactReadingOrderCard } from "@/components/reading-orders/compact-reading-order-card";
import { CreatorSummary } from "@/components/profiles/creator-summary";
import { SaveButton } from "@/components/reading-orders/save-button";
import { DeleteReadingOrderButton } from "@/components/reading-orders/delete-reading-order-button";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import {
  getReadingOrderBySlug,
  getRelatedReadingOrders,
  getUserById,
  getCurrentUser,
} from "@/lib/repositories";

interface ReadingOrderDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ReadingOrderDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const readingOrder = await getReadingOrderBySlug(slug);

  if (!readingOrder) {
    return { title: "Reading order not found" };
  }

  return {
    title: readingOrder.title,
    description: readingOrder.summary,
  };
}

export default async function ReadingOrderDetailPage({
  params,
}: ReadingOrderDetailPageProps) {
  const { slug } = await params;
  const readingOrder = await getReadingOrderBySlug(slug);

  if (!readingOrder) {
    notFound();
  }

  const [creator, currentUser] = await Promise.all([
    getUserById(readingOrder.creatorId),
    getCurrentUser(),
  ]);

  if (!creator) {
    notFound();
  }

  const isOwner = currentUser?.id === readingOrder.creatorId;
  const relatedReadingOrders = await getRelatedReadingOrders(readingOrder);

  return (
    <PageContainer as="article" className="space-y-12 py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <div className="mx-auto w-full max-w-xs lg:mx-0">
          <ReadingOrderCover
            title={readingOrder.title}
            seed={readingOrder.id}
            publisher={readingOrder.publishers[0]}
            imageUrl={readingOrder.coverImageUrl || undefined}
            priority
            sizes="280px"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="font-heading text-3xl font-medium text-balance sm:text-4xl">
              {readingOrder.title}
            </h1>
            <CreatorSummary user={creator} />
            <p className="max-w-2xl text-base text-muted-foreground">
              {readingOrder.description}
            </p>
          </div>

          <ReadingOrderMetadata readingOrder={readingOrder} />

          <div className="flex flex-wrap items-center gap-2">
            <SaveButton initialSaveCount={readingOrder.saveCount} />
            {isOwner ? (
              <>
                <Button
                  variant="outline"
                  render={<Link href={`/reading-orders/${readingOrder.slug}/edit`} />}
                >
                  <Pencil aria-hidden="true" />
                  Edit
                </Button>
                <DeleteReadingOrderButton
                  readingOrderId={readingOrder.id}
                  readingOrderTitle={readingOrder.title}
                  creatorUsername={creator.username}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <section aria-labelledby="entries-heading" className="space-y-4">
        <h2 id="entries-heading" className="font-heading text-xl font-medium">
          Reading order
        </h2>
        <ReadingOrderEntryList entries={readingOrder.entries} />
      </section>

      {relatedReadingOrders.length > 0 ? (
        <section aria-labelledby="related-heading" className="space-y-4">
          <SectionHeading
            headingLevel="h2"
            title="Related reading orders"
            description="Other orders sharing a publisher or category with this one."
            className="[&_h2]:text-xl"
          />
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {relatedReadingOrders.map((related) => (
              <CompactReadingOrderCard key={related.id} readingOrder={related} />
            ))}
          </div>
        </section>
      ) : null}
    </PageContainer>
  );
}
