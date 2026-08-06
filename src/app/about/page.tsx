import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Omni Odyssey is for, and why reading orders matter for collected-edition comics.",
};

const SUBSECTION_HEADING_CLASS = "font-heading text-xl font-medium";

export default function AboutPage() {
  return (
    <PageContainer as="section" className="space-y-12 py-12">
      <SectionHeading
        headingLevel="h1"
        title="Continuity is the hard part"
        description="Omni Odyssey exists to solve one specific problem: figuring out what to actually read, and in what order, once you decide to collect a character, creator, or event in omnibus or deluxe form."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className={SUBSECTION_HEADING_CLASS}>
              What a reading order actually is
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              A reading order is a sequence someone worked out by hand:
              which omnibus comes first, where a crossover issue needs to be
              read out of its own series, which spinoff mini can be skipped
              without losing anything. That knowledge usually lives scattered
              across forum threads, wiki edit histories, and years-old blog
              posts that have since gone stale. Omni Odyssey gives that
              knowledge a permanent, structured home: a title, a creator, a
              publisher and category, and an ordered list of entries with
              notes on where the optional material fits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={SUBSECTION_HEADING_CLASS}>
              Built for collectors of the physical object
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              This isn&apos;t a general comics database, and it isn&apos;t
              trying to replace one. It&apos;s specifically for people
              collecting omnibuses, absolute editions, deluxe hardcovers,
              compendiums, and manga deluxe editions — where reviews cover
              binding and paper stock alongside the story, and where a
              reading order needs to specify which physical collection an
              entry actually belongs to.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className={SUBSECTION_HEADING_CLASS}>
              Where this stands right now
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Omni Odyssey is currently a frontend prototype. Every reading
              order, collector profile, and review you can browse here is
              illustrative mock content, and actions like saving a reading
              order or following a collector are local UI demonstrations
              rather than real, persisted account activity. The reading-order
              builder is fully functional against that mock data, which is
              the point: it&apos;s meant to prove out the core experience before
              a real database and accounts are wired in behind it.
            </p>
          </section>
        </div>

        <aside className="space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-heading text-base font-medium">
            See it for yourself
          </h2>
          <p className="text-sm text-muted-foreground">
            Browse the mock catalog, or try building a reading order of your
            own against the sample data.
          </p>
          <div className="flex flex-col gap-2">
            <Button render={<Link href="/discover" />}>
              Discover reading orders
            </Button>
            <Button variant="outline" render={<Link href="/reading-orders/create" />}>
              Create a reading order
            </Button>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
