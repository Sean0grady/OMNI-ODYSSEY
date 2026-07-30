import Link from "next/link";
import { Compass } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="py-20">
      <EmptyState
        icon={Compass}
        headingLevel="h1"
        title="Page not found"
        description="The page you're looking for doesn't exist or may have moved."
        action={
          <Button render={<Link href="/" />}>Return home</Button>
        }
      />
    </PageContainer>
  );
}
