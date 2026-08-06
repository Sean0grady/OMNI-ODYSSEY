import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderForm } from "@/features/reading-orders/components/reading-order-form";
import { getReadingOrderBySlug, getCurrentUser } from "@/lib/repositories";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";

export const metadata: Metadata = {
  title: "Edit reading order",
};

interface EditReadingOrderPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditReadingOrderPage({
  params,
}: EditReadingOrderPageProps) {
  const { slug } = await params;

  const [readingOrder, currentUser] = await Promise.all([
    getReadingOrderBySlug(slug),
    getCurrentUser(),
  ]);

  if (!readingOrder) {
    notFound();
  }

  if (!currentUser) {
    redirect(`/sign-in?redirect=/reading-orders/${slug}/edit`);
  }

  if (currentUser.id !== readingOrder.creatorId) {
    notFound();
  }

  const defaultValues: CreateReadingOrderInput = {
    title: readingOrder.title,
    summary: readingOrder.summary,
    publishers: readingOrder.publishers,
    categories: readingOrder.categories,
    visibility: readingOrder.visibility,
    coverImageUrl: readingOrder.coverImageUrl || "",
    entries: readingOrder.entries.map((entry) => ({
      title: entry.title,
      entryType: entry.entryType,
      issueRange: entry.issueRange || "",
      notes: entry.notes || "",
      isOptional: entry.isOptional,
    })),
  };

  return (
    <PageContainer as="section" className="max-w-3xl space-y-8 py-12">
      <SectionHeading
        headingLevel="h1"
        title={`Edit "${readingOrder.title}"`}
        description="Update the details or entries in this reading order."
      />
      <ReadingOrderForm
        mode="edit"
        readingOrderId={readingOrder.id}
        defaultValues={defaultValues}
      />
    </PageContainer>
  );
}
