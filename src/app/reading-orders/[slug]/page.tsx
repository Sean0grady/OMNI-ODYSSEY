import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { ReadingOrderEntryList } from "@/components/reading-orders/reading-order-entry-list";
import { CompactReadingOrderCard } from "@/components/reading-orders/compact-reading-order-card";
import { CreatorSummary } from "@/components/profiles/creator-summary";
import { SaveButton } from "@/components/reading-orders/save-button";
import { DeleteReadingOrderButton } from "@/components/reading-orders/delete-reading-order-button";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { CategoryBadge } from "@/components/reading-orders/category-badge";
import { Button } from "@/components/ui/button";
import { Slab, SlabLabel, SlabWell, SlabCertNumber } from "@/components/slab/slab";
import { CATEGORY_BAND } from "@/lib/constants/bands";
import { formatRelativeTime } from "@/lib/utilities/date";
import { formatCompactNumber } from "@/lib/utilities/number";
import {
  getReadingOrderBySlug,
  getRelatedReadingOrders,
  getUserById,
  getCurrentUser,
  getSaveStatus,
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
  const [relatedReadingOrders, isSaved] = await Promise.all([
    getRelatedReadingOrders(readingOrder),
    currentUser
      ? getSaveStatus(readingOrder.id, currentUser.id)
      : Promise.resolve(false),
  ]);

  const bookCount = readingOrder.estimatedBookCount;

  /** The record's own figures, set the way a census table sets them. */
  const census = [
    { label: "Books", value: String(bookCount) },
    { label: "Saves", value: formatCompactNumber(readingOrder.saveCount) },
    { label: "Views", value: formatCompactNumber(readingOrder.viewCount) },
    { label: "Updated", value: formatRelativeTime(readingOrder.updatedAt) },
  ];

  return (
    <PageContainer as="article" className="space-y-14 py-12">
      {/* The record, opened: the label on the left, the run itself below. */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr]">
        <div className="mx-auto w-full max-w-xs lg:mx-0">
          <Slab>
            <SlabLabel
              band={CATEGORY_BAND[readingOrder.categories[0]] ?? "universal"}
              bandLabel={
                readingOrder.visibility === "private" ? "Private record" : "Certified"
              }
              title={
                <p
                  className="text-sm leading-[1.12] font-extrabold text-balance uppercase"
                  style={{ fontStretch: "86%", letterSpacing: "-0.01em" }}
                >
                  {readingOrder.title}
                </p>
              }
              byline={
                <p className="label-type text-[0.52rem] text-muted-foreground">
                  {creator.displayName}
                </p>
              }
              grade={{
                value: String(bookCount),
                designation: bookCount === 1 ? "Book" : "Books",
                srLabel: `${bookCount} ${bookCount === 1 ? "book" : "books"} in this reading order`,
              }}
            />
            <SlabCertNumber id={readingOrder.id} />
            <SlabWell className="p-4">
              <ReadingOrderCover
                title={readingOrder.title}
                seed={readingOrder.id}
                publisher={readingOrder.publishers[0]}
                imageUrl={readingOrder.coverImageUrl || undefined}
              />
            </SlabWell>
          </Slab>
        </div>

        <div className="space-y-7">
          <div className="space-y-4">
            <h1
              className="text-3xl leading-[0.95] font-extrabold text-balance uppercase sm:text-4xl"
              style={{ fontStretch: "84%", letterSpacing: "-0.025em" }}
            >
              {readingOrder.title}
            </h1>
            <CreatorSummary user={creator} />
            <p className="reading-type max-w-2xl text-base leading-relaxed text-muted-foreground">
              {readingOrder.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {readingOrder.publishers.map((publisher) => (
              <PublisherBadge key={publisher} publisher={publisher} />
            ))}
            {readingOrder.categories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>

          {/* Census strip: the figures a collector compares between records. */}
          <dl className="grid grid-cols-2 border-y border-foreground/20 sm:grid-cols-4">
            {census.map((item, index) => (
              <div
                key={item.label}
                className={
                  index > 0
                    ? "border-l border-foreground/12 px-3 py-2.5 first:pl-0"
                    : "py-2.5 pr-3"
                }
              >
                <dt className="label-type text-[0.55rem] text-muted-foreground">
                  {item.label}
                </dt>
                <dd className="data-type mt-0.5 text-base font-bold">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-2">
            <SaveButton
              readingOrderId={readingOrder.id}
              slug={readingOrder.slug}
              initialSaved={isSaved}
              initialSaveCount={readingOrder.saveCount}
            />
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

      <section aria-labelledby="entries-heading" className="space-y-6">
        <SectionHeading
          headingLevel="h2"
          title="The run"
          description={`Read in this order. ${bookCount} ${bookCount === 1 ? "book" : "books"}.`}
        />
        <ReadingOrderEntryList entries={readingOrder.entries} />
      </section>

      {relatedReadingOrders.length > 0 ? (
        <section aria-labelledby="related-heading" className="space-y-6">
          <SectionHeading
            headingLevel="h2"
            title="Related routes"
            description="Other records sharing a publisher or category with this one."
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
