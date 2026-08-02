import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Omni Odyssey account.",
};

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirect } = await searchParams;

  return (
    <div className="space-y-8">
      <SectionHeading
        headingLevel="h1"
        title="Sign in"
        description="Welcome back."
      />
      <SignInForm redirectTo={redirect || "/"} />
    </div>
  );
}
