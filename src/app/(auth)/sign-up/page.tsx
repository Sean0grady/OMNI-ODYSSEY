import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create an Omni Odyssey account.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        headingLevel="h1"
        title="Create an account"
        description="Sign up to build and publish your own reading orders."
      />
      <SignUpForm />
    </div>
  );
}
