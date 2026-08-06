import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { PRIMARY_NAV_LINKS } from "@/lib/constants/navigation";

const FOOTER_LINKS = [
  ...PRIMARY_NAV_LINKS,
  { label: "Publish a route", href: "/reading-orders/create" },
  { label: "Write a review", href: "/reviews/create" },
];

/**
 * The indicia: the small-print block printed at the foot of a comic's first
 * page, carrying the publisher, the terms, and the disclaimers nobody reads
 * but everybody expects to be there. It is the natural home for a footer.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-foreground/85">
      <PageContainer className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <p
            className="text-base font-extrabold uppercase"
            style={{ fontStretch: "78%", letterSpacing: "-0.01em" }}
          >
            Omni Odyssey
          </p>
          <p className="reading-type mt-2 text-sm leading-relaxed text-muted-foreground">
            Ordered routes through collected comics, graded on the things that
            decide whether a book is worth owning.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-10 gap-y-2.5 sm:flex sm:flex-wrap sm:gap-x-8"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="label-type rounded-[2px] text-[0.65rem] text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </PageContainer>

      <div className="border-t border-border bg-muted/40">
        <PageContainer className="py-4">
          <p className="data-type max-w-3xl text-[0.68rem] leading-relaxed text-muted-foreground">
            Reading orders, reviews, and collector profiles on this site are
            created by its members and stored in a live database. Grades are
            collectors&apos; own assessments of the physical editions they own —
            they are not affiliated with, or endorsed by, any third-party
            grading service. Records marked <span className="label-type">sample</span>{" "}
            are illustrative and are not real certifications. Publisher and
            series names are the property of their respective owners.
          </p>
        </PageContainer>
      </div>
    </footer>
  );
}
