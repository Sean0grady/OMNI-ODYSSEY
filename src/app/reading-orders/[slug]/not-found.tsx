import Link from "next/link";
import { BookX } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function ReadingOrderNotFound() {
  return (
    <PageContainer className="py-20">
      <EmptyState
        icon={BookX}
        headingLevel="h1"
        title="This reading order doesn't exist"
        description="It may have been unpublished, made private, or the link might be incorrect."
        action={
          <Button render={<Link href="/discover" />}>
            Browse reading orders
          </Button>
        }
      />
    </PageContainer>
  );
}
