import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { OnboardingForm } from "@/features/profiles/components/onboarding-form";
import { getCurrentUser } from "@/lib/repositories";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Complete your profile",
  description: "Set up your public collector profile.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?redirect=/onboarding");
  }

  const existingProfile = await getCurrentUser();
  if (existingProfile) {
    redirect(`/users/${existingProfile.username}`);
  }

  return (
    <PageContainer as="section" className="max-w-lg space-y-8 py-16">
      <SectionHeading
        headingLevel="h1"
        title="Set up your profile"
        description="This is what other collectors will see on your public profile page."
      />
      <OnboardingForm />
    </PageContainer>
  );
}
