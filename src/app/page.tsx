import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderCard } from "@/components/reading-orders/reading-order-card";
import { CoverPlaceholder } from "@/components/reading-orders/cover-placeholder";
import { ReviewCard } from "@/components/reviews/review-card";
import {
  Slab,
  SlabLabel,
  SlabAttributes,
  SlabWell,
  SlabCertNumber,
} from "@/components/slab/slab";
import { getFeaturedReadingOrders, getRecentReviews } from "@/lib/repositories";

/**
 * SAMPLE RECORD — authored demonstration content.
 *
 * The live catalogue is thin, and a landing page that shows nothing
 * demonstrates nothing. This is a real, existing collected edition graded the
 * way the product grades one, marked as a sample wherever it appears. Replace
 * it with a real certified record once the catalogue carries one.
 */
const SAMPLE = {
  id: "sample-ff-hickman-v1",
  edition: "Fantastic Four by Jonathan Hickman Omnibus, Vol. 1",
  publisher: "Marvel",
  year: "2013",
  grader: "marcus.reads",
  grade: "9.4",
  designation: "Near Mint",
  attributes: [
    { label: "Binding", value: "9.5", fill: 0.95 },
    { label: "Paper", value: "9.0", fill: 0.9 },
    { label: "Mapping", value: "8.5", fill: 0.85 },
    { label: "Extras", value: "9.5", fill: 0.95 },
  ],
};

/** What each graded attribute actually means, in the product's own language. */
const GRADE_KEY = [
  {
    term: "Binding",
    reading:
      "Sewn or glued, and whether the block holds when the spine is opened flat. The single thing that decides whether a heavy omnibus survives a first read.",
  },
  {
    term: "Paper",
    reading:
      "Stock weight, coating, and how much ink shows through from the reverse. Matte or gloss changes how the original colour separations read.",
  },
  {
    term: "Mapping",
    reading:
      "How much art disappears into the gutter. On an oversized edition this is the difference between a page you can read and a page you fight.",
  },
  {
    term: "Extras",
    reading:
      "Scripts, process pages, cover galleries, letters pages. What you get beyond the run itself, and whether it justifies the shelf space.",
  },
];

export default async function HomePage() {
  const [featuredReadingOrders, recentReviews] = await Promise.all([
    getFeaturedReadingOrders(4),
    getRecentReviews(3),
  ]);

  return (
    <>
      {/*
        The first viewport is the thesis: a route through continuity presented
        as a certified object. The blue owns the whole field rather than
        appearing as an accent on a neutral ground.
      */}
      <section className="bg-universal text-universal-foreground">
        <PageContainer className="grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.05fr_minmax(0,0.95fr)] lg:py-24">
          <div className="max-w-xl">
            <h1
              className="text-[2.6rem] leading-[0.92] font-extrabold text-balance uppercase sm:text-6xl"
              style={{ fontStretch: "84%", letterSpacing: "-0.03em" }}
            >
              Know what to read,
              <br />
              and what to buy.
            </h1>
            <p className="reading-type mt-5 max-w-md text-base leading-relaxed text-universal-foreground/85 sm:text-lg">
              Collectors map complicated continuity into ordered routes through
              collected editions, then grade the books themselves on binding,
              paper, mapping, and extras. Not just whether the story is good —
              whether the object is worth owning.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="secondary"
                render={<Link href="/discover" />}
              >
                Browse reading orders
                <ArrowRight aria-hidden="true" />
              </Button>
              <Link
                href="/reading-orders/create"
                className="label-type rounded-[2px] px-1 py-1 text-xs underline underline-offset-4 outline-none focus-visible:ring-3 focus-visible:ring-universal-foreground/50"
              >
                Publish your own route
              </Link>
            </div>
          </div>

          {/* The hero slab, tilted the way one sits when you hold it up. */}
          <div className="mx-auto w-full max-w-sm lg:max-w-md">
            <Slab className="rotate-[-1.4deg]">
              <SlabLabel
                band="universal"
                bandLabel="Universal · Sample record"
                meta={`${SAMPLE.publisher} · ${SAMPLE.year}`}
                title={
                  <p
                    className="text-base leading-[1.1] font-extrabold text-balance uppercase"
                    style={{ fontStretch: "86%", letterSpacing: "-0.015em" }}
                  >
                    {SAMPLE.edition}
                  </p>
                }
                byline={
                  <p className="label-type text-[0.55rem] text-muted-foreground">
                    Graded by {SAMPLE.grader}
                  </p>
                }
                grade={{
                  value: SAMPLE.grade,
                  designation: SAMPLE.designation,
                  srLabel: `Overall grade ${SAMPLE.grade} out of 10, ${SAMPLE.designation}`,
                }}
              />

              <SlabAttributes
                attributes={SAMPLE.attributes}
                className="bg-label-stock"
              />
              <SlabCertNumber
                id={SAMPLE.id}
                className="border-t border-foreground/12"
              />

              {/* The book dominates the well, the way it does in a real slab. */}
              <SlabWell className="px-6 py-5">
                <CoverPlaceholder title={SAMPLE.edition} seed={SAMPLE.id} />
              </SlabWell>
            </Slab>

            <p className="label-type mt-3 text-center text-[0.55rem] text-universal-foreground/70">
              Sample record — illustrative, not a real certification
            </p>
          </div>
        </PageContainer>
      </section>

      {/*
        The differentiator, explained the way a guide explains its own
        notation. Deliberately a definition list, not a row of icon cards.
      */}
      <section className="border-b border-border py-16">
        <PageContainer className="space-y-8">
          <SectionHeading
            title="What the grade covers"
            description="Every review rates the physical object alongside the story, because a $100 out-of-print book is a purchase before it is a read."
          />
          <dl className="grid grid-cols-1 gap-x-12 gap-y-7 sm:grid-cols-2">
            {GRADE_KEY.map((entry) => (
              <div key={entry.term} className="border-t border-foreground/15 pt-4">
                <dt
                  className="text-lg font-extrabold uppercase"
                  style={{ fontStretch: "82%", letterSpacing: "-0.01em" }}
                >
                  {entry.term}
                </dt>
                <dd className="reading-type mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {entry.reading}
                </dd>
              </div>
            ))}
          </dl>
        </PageContainer>
      </section>

      {featuredReadingOrders.length > 0 ? (
        <section className="border-b border-border py-16">
          <PageContainer className="space-y-8">
            <SectionHeading
              title="Certified routes"
              description="Reading orders other collectors have published and saved."
              action={
                <Button variant="outline" render={<Link href="/discover" />}>
                  Browse all
                </Button>
              }
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {featuredReadingOrders.map(({ order, creator }) => (
                <ReadingOrderCard
                  key={order.id}
                  readingOrder={order}
                  creator={creator}
                />
              ))}
            </div>
          </PageContainer>
        </section>
      ) : null}

      {recentReviews.length > 0 ? (
        <section className="border-b border-border py-16">
          <PageContainer className="space-y-8">
            <SectionHeading
              title="Recent grading notes"
              description="What collectors found when the book actually arrived."
              action={
                <Button variant="outline" render={<Link href="/reviews" />}>
                  All reviews
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentReviews.map(({ review, author }) => (
                <ReviewCard key={review.id} review={review} author={author} />
              ))}
            </div>
          </PageContainer>
        </section>
      ) : null}

      {/* The close: a real anchor, drenched the way the opening is. */}
      <section className="bg-foreground py-20 text-background">
        <PageContainer className="flex flex-col items-start gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-lg">
            <h2
              className="text-3xl leading-[0.95] font-extrabold text-balance uppercase sm:text-4xl"
              style={{ fontStretch: "84%", letterSpacing: "-0.025em" }}
            >
              You already worked it out. Write it down.
            </h2>
            <p className="reading-type mt-4 text-sm leading-relaxed text-background/80 sm:text-base">
              The order you pieced together from six forum threads is worth more
              than the forum threads. Publish it once and it stops decaying.
            </p>
          </div>
          <Button size="lg" render={<Link href="/reading-orders/create" />}>
            Publish a reading order
            <ArrowRight aria-hidden="true" />
          </Button>
        </PageContainer>
      </section>
    </>
  );
}
