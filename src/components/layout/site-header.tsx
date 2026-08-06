import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { SearchInput } from "@/components/navigation/search-input";
import { UserMenu } from "@/components/navigation/user-menu";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";
import { getCurrentUser } from "@/lib/repositories";

/**
 * The masthead of a grading authority: a foil band across the very top, the
 * mark set in the same heavy condensed caps the labels use, and a hard rule
 * closing it off. Solid rather than translucent — a printed label does not
 * blur what is behind it.
 */
export async function SiteHeader() {
  const currentUser = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 bg-background">
      <span aria-hidden="true" className="foil block h-1 w-full" />
      <div className="border-b-2 border-foreground/85">
        <PageContainer className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <Link
              href="/"
              className="rounded-[2px] text-lg font-extrabold uppercase outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              style={{ fontStretch: "78%", letterSpacing: "-0.01em" }}
            >
              Omni Odyssey
            </Link>
            <nav
              aria-label="Primary"
              className="hidden items-center gap-6 lg:flex"
            >
              {PRIMARY_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="label-type rounded-[2px] text-[0.68rem] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <SearchInput className="hidden max-w-xs flex-1 sm:block" />
            <Button
              size="sm"
              className="hidden lg:inline-flex"
              render={<Link href="/reading-orders/create" />}
            >
              <PlusCircle aria-hidden="true" />
              Publish a route
            </Button>
            <div className="hidden lg:block">
              <UserMenu currentUser={currentUser} />
            </div>
            <MobileNav currentUser={currentUser} />
          </div>
        </PageContainer>
      </div>
    </header>
  );
}
