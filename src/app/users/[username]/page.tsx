import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { CollectorAvatar } from "@/components/shared/collector-avatar";
import { CollectorStatistics } from "@/components/profiles/collector-statistics";
import { FollowButton } from "@/components/profiles/follow-button";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { ReadingOrderCard } from "@/components/reading-orders/reading-order-card";
import { ReviewCard } from "@/components/reviews/review-card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getReadingOrdersByUserId,
  getReviewsByUserId,
  getUserByUsername,
} from "@/lib/repositories";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: UserProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return { title: "Collector not found" };
  }

  return {
    title: user.displayName,
    description: user.bio,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    notFound();
  }

  const readingOrders = await getReadingOrdersByUserId(user.id);
  const reviews = getReviewsByUserId(user.id);

  return (
    <PageContainer className="space-y-12 py-12">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <CollectorAvatar
            displayName={user.displayName}
            avatarUrl={user.avatarUrl}
            size="lg"
            className="size-16"
          />
          <div className="space-y-2">
            <div>
              <h1 className="font-heading text-2xl font-medium">
                {user.displayName}
              </h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">{user.bio}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {user.location ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden="true" />
                  {user.location}
                </span>
              ) : null}
              {user.favoritePublishers.length > 0 ? (
                <span className="flex flex-wrap items-center gap-1.5">
                  {user.favoritePublishers.map((publisher) => (
                    <PublisherBadge key={publisher} publisher={publisher} />
                  ))}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <FollowButton className="shrink-0" />
      </div>

      <CollectorStatistics user={user} />

      <section aria-labelledby="orders-heading" className="space-y-4">
        <h2 id="orders-heading" className="font-heading text-xl font-medium">
          Published reading orders
        </h2>
        {readingOrders.length === 0 ? (
          <EmptyState
            title="No published reading orders yet"
            description={`${user.displayName} hasn't published any reading orders yet.`}
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {readingOrders.map((order) => (
              <ReadingOrderCard key={order.id} readingOrder={order} creator={user} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="reviews-heading" className="space-y-4">
        <h2 id="reviews-heading" className="font-heading text-xl font-medium">
          Recent reviews
        </h2>
        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description={`${user.displayName} hasn't posted any collected-edition reviews yet.`}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map(({ review, author }) => (
              <ReviewCard key={review.id} review={review} author={author} />
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
