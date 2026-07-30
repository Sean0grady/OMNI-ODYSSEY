import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  label?: string;
  size?: "sm" | "default";
  className?: string;
}

const STAR_INDEXES = [0, 1, 2, 3, 4];

export function RatingDisplay({
  rating,
  maxRating = 5,
  label = "Rating",
  size = "default",
  className,
}: RatingDisplayProps) {
  const fillPercent = Math.max(0, Math.min(1, rating / maxRating)) * 100;
  const starSize = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex gap-0.5 text-muted-foreground/35">
          {STAR_INDEXES.map((index) => (
            <Star key={index} className={starSize} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-primary"
          style={{ width: `${fillPercent}%` }}
        >
          {STAR_INDEXES.map((index) => (
            <Star key={index} className={cn(starSize, "fill-current")} />
          ))}
        </span>
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
