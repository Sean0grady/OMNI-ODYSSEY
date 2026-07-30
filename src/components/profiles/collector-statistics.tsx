import { formatCompactNumber } from "@/lib/utilities/number";
import type { UserProfile } from "@/types/domain";

interface CollectorStatisticsProps {
  user: UserProfile;
}

export function CollectorStatistics({ user }: CollectorStatisticsProps) {
  const stats = [
    { label: "Reading orders", value: user.publishedReadingOrderCount },
    { label: "Reviews", value: user.reviewCount },
    { label: "Followers", value: user.followerCount },
    { label: "Following", value: user.followingCount },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-md border border-border px-3 py-2.5 text-center"
        >
          <dd className="font-heading text-lg font-medium tabular-nums">
            {formatCompactNumber(stat.value)}
          </dd>
          <dt className="text-xs text-muted-foreground">{stat.label}</dt>
        </div>
      ))}
    </dl>
  );
}
