import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { SearchInput } from "@/components/navigation/search-input";
import { UserMenu } from "@/components/navigation/user-menu";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";
import { getCurrentUser } from "@/lib/repositories";

export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
      <PageContainer className="flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="font-heading text-lg font-semibold tracking-tight"
          >
            Omni Odyssey
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <SearchInput className="hidden max-w-xs flex-1 sm:block" />
          <Button
            variant="default"
            size="sm"
            className="hidden lg:inline-flex"
            render={<Link href="/reading-orders/create" />}
          >
            <PlusCircle aria-hidden="true" />
            Create Reading Order
          </Button>
          <div className="hidden lg:block">
            <UserMenu currentUser={currentUser} />
          </div>
          <MobileNav currentUser={currentUser} />
        </div>
      </PageContainer>
    </header>
  );
}
