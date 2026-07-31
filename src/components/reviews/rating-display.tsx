import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  label?: string;
  size?: "sm" | "default";
  className?: string;
}

export function RatingDisplay({
  rating,
  maxRating = 5,
  label = "Rating",
  size = "default",
  className,
}: RatingDisplayProps) {
  const starIndexes = Array.from(
    { length: Math.max(0, Math.round(maxRating)) },
    (_, index) => index
  );
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex gap-0.5" aria-hidden="true">
        {starIndexes.map((index) => {
          const starFillPercent =
            Math.max(0, Math.min(clampedRating - index, 1)) * 100;

          return (
            <span key={index} className="relative inline-flex">
              <Star className={cn(starSize, "text-muted-foreground/35")} />
              <span
                className="absolute inset-0 overflow-hidden text-primary"
                style={{ width: `${starFillPercent}%` }}
              >
                <Star className={cn(starSize, "fill-current")} />
              </span>
            </span>
          );
        })}
      </span>
      <span
        className={cn(
          "font-medium tabular-nums",
          size === "sm" ? "text-xs text-muted-foreground" : "text-sm"
        )}
      >
        {rating.toFixed(1)}
        <span className="text-muted-foreground">/{maxRating}</span>
      </span>
      <span className="sr-only">
        {label}: {rating.toFixed(1)} out of {maxRating}
      </span>
    </div>
  );
}
