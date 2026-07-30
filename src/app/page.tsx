import Link from "next/link";
import {
  BookMarked,
  Compass,
  ListOrdered,
  PlusCircle,
  Share2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeading } from "@/components/shared/section-heading";
import { ReadingOrderCard } from "@/components/reading-orders/reading-order-card";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { ReviewCard } from "@/components/reviews/review-card";
import {
  getFeaturedReadingOrders,
  getRecentReviews,
  getUserById,
} from "@/lib/repositories";

const HOW_IT_WORKS_STEPS = [
  {
    icon: Compass,
    title: "Find your entry point",
    description:
      "Browse reading orders built around a character, creator, event, or era — filtered by publisher and category until you find the right one.",
  },
  {
    icon: ListOrdered,
    title: "Follow a mapped sequence",
    description:
      "Each order lists collected editions and story arcs in a deliberate sequence, with notes on optional detours and where they rejoin the main path.",
  },
  {
    icon: BookMarked,
    title: "Track your own shelf",
    description:
      "Save orders you're following, and keep tabs on what you own, want, and have already read as you work through the stack.",
  },
  {
    icon: Share2,
    title: "Publish your own path",
    description:
      "Built a better sequence than what's out there? Assemble your own reading order and share it publicly, or keep it private for your own reference.",
  },
];

export default function HomePage() {
  const featuredReadingOrders = getFeaturedReadingOrders(4);
  const recentReviews = getRecentReviews(3);
  const heroCovers = featuredReadingOrders.slice(0, 3);

  return (
    <>
      <section className="overflow-hidden border-b border-border">
        <PageContainer className="grid grid-cols-1 items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div className="max-w-xl space-y-6">
            <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
              For collectors, by collectors
            </p>
            <h1 className="font-heading text-4xl leading-[1.05] font-medium text-balance sm:text-5xl">
              Build, share, and discover the definitive reading paths through
              collected comics.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Omni Odyssey is where collectors map complicated continuity —
              omnibuses, absolute editions, deluxe manga volumes, and
              compendiums — into reading orders other people can actually
              follow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" render={<Link href="/discover" />}>
                Explore reading orders
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/reading-orders/create" />}
              >
                <PlusCircle aria-hidden="true" />
                Create a reading order
              </Button>
            </div>
          </div>

          {heroCovers.length > 0 ? (
            <div className="relative hidden h-80 lg:block">
              {heroCovers.map((order, index) => (
                <div
                  key={order.id}
                  className="absolute top-0 w-44"
                  style={{
                    left: `${index * 88}px`,
                    transform: `rotate(${(index - 1) * 4}deg)`,
                    zIndex: heroCovers.length - index,
                  }}
                >
                  <ReadingOrderCover
                    title={order.title}
                    seed={order.id}
                    publisher={order.publishers[0]}
                    imageUrl={order.coverImageUrl || undefined}
                    className="shadow-xl"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </PageContainer>
      </section>

      {featuredReadingOrders.length > 0 ? (
        <section className="border-b border-border py-16">
          <PageContainer className="space-y-8">
            <SectionHeading
              eyebrow="Featured"
              title="Featured reading orders"
              description="Well-saved orders from collectors mapping out dense runs and long-running continuity."
              action={
                <Button variant="ghost" render={<Link href="/discover" />}>
                  Browse all
                </Button>
              }
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {featuredReadingOrders.map((order) => {
                const creator = getUserById(order.creatorId);
                if (!creator) {
                  return null;
                }
                return (
                  <ReadingOrderCard
                    key={order.id}
                    readingOrder={order}
                    creator={creator}
                  />
                );
              })}
            </div>
          </PageContainer>
        </section>
      ) : null}

      <section className="border-b border-border bg-muted/40 py-16">
        <PageContainer className="space-y-10">
          <SectionHeading
            eyebrow="How it works"
            title="A better way to navigate continuity"
            description="Reading orders exist to answer one question: what do I read, and in what order, to get the story right?"
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div key={step.title} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-sm text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="font-heading font-medium">{step.title}</p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      {recentReviews.length > 0 ? (
        <section className="border-b border-border py-16">
          <PageContainer className="space-y-8">
            <SectionHeading
              eyebrow="From the community"
              title="Recent collector reviews"
              description="Notes on binding, paper quality, and presentation from collectors evaluating the physical editions themselves."
              action={
                <Button variant="ghost" render={<Link href="/reviews" />}>
                  Browse all reviews
                </Button>
              }
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentReviews.map((review) => {
                const author = getUserById(review.authorId);
                if (!author) {
                  return null;
                }
                return (
                  <ReviewCard key={review.id} review={review} author={author} />
                );
              })}
            </div>
          </PageContainer>
        </section>
      ) : null}

      <section className="py-16">
        <PageContainer>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-14 text-center">
            <Users className="size-8 text-primary" aria-hidden="true" />
            <h2 className="font-heading max-w-lg text-2xl font-medium text-balance sm:text-3xl">
              Your shelf has a story. Help other collectors read it in order.
            </h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Publish the reading order you wish existed when you started, or
              save one from another collector to work through at your own
              pace.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button render={<Link href="/reading-orders/create" />}>
                Create a reading order
              </Button>
              <Button variant="outline" render={<Link href="/discover" />}>
                Discover reading orders
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
