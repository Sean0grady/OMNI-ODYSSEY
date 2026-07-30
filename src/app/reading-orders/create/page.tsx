import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderForm } from "@/features/reading-orders/components/reading-order-form";

export const metadata: Metadata = {
  title: "Create Reading Order",
  description:
    "Build a custom reading order: add entries, arrange them by drag and drop, and publish publicly or privately.",
};

export default function CreateReadingOrderPage() {
  return (
    <PageContainer as="section" className="max-w-3xl space-y-8 py-12">
      <SectionHeading
        headingLevel="h1"
        eyebrow="Create"
        title="Build a reading order"
        description="Add the collected editions, issues, and story arcs that make up your reading order, then arrange them into the sequence you recommend."
      />
      <ReadingOrderForm />
    </PageContainer>
  );
}
