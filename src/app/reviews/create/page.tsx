import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReviewForm } from "@/features/reviews/components/review-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Write a review",
  description: "Review a collected edition — binding, paper quality, mapping, and extras.",
};

export default async function CreateReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/reviews/create");
  }

  return (
    <PageContainer as="section" className="max-w-lg space-y-8 py-16">
      <SectionHeading
        headingLevel="h1"
        title="Write a review"
        description="Rate a collected edition on more than just the story — binding, paper quality, mapping, and extras all count."
      />
      <ReviewForm />
    </PageContainer>
  );
}
