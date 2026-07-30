import Link from "next/link";
import { UserX } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function CollectorNotFound() {
  return (
    <PageContainer className="py-20">
      <EmptyState
        icon={UserX}
        headingLevel="h1"
        title="This collector doesn't exist"
        description="The profile you're looking for may have been renamed or the link might be incorrect."
        action={
          <Button render={<Link href="/discover" />}>
            Browse reading orders
          </Button>
        }
      />
    </PageContainer>
  );
}
