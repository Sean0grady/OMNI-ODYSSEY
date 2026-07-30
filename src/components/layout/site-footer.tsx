import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";

const FOOTER_LINKS = [
  ...PRIMARY_NAV_LINKS,
  { label: "Create Reading Order", href: "/reading-orders/create" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <PageContainer className="flex flex-col gap-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-2">
          <p className="font-heading text-base font-semibold tracking-tight">
            Omni Odyssey
          </p>
          <p className="text-sm text-muted-foreground">
            Build, share, and discover the definitive reading paths through
            collected comics.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </PageContainer>
      <PageContainer className="border-t border-border py-4">
        <p className="text-xs text-muted-foreground">
          Omni Odyssey is a frontend prototype. Reading orders, reviews, and
          collector data shown here are illustrative mock content, not a real
          catalog.
        </p>
      </PageContainer>
    </footer>
  );
}
