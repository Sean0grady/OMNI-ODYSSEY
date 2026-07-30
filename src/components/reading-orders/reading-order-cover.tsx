import Image from "next/image";
import { BookOpenText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLISHER_LABELS } from "@/lib/constants/catalog";
import type { Publisher } from "@/types/domain";

const PLACEHOLDER_GRADIENTS: [string, string][] = [
  ["oklch(0.55 0.13 65)", "oklch(0.18 0.02 50)"],
  ["oklch(0.34 0.06 250)", "oklch(0.15 0.02 250)"],
  ["oklch(0.42 0.15 25)", "oklch(0.16 0.02 20)"],
  ["oklch(0.4 0.08 150)", "oklch(0.16 0.02 150)"],
  ["oklch(0.37 0.1 320)", "oklch(0.16 0.02 320)"],
  ["oklch(0.62 0.06 80)", "oklch(0.24 0.03 60)"],
];

function paletteForSeed(seed: string): [string, string] {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return PLACEHOLDER_GRADIENTS[hash % PLACEHOLDER_GRADIENTS.length];
}

interface ReadingOrderCoverProps {
  title: string;
  seed: string;
  imageUrl?: string;
  publisher?: Publisher;
  className?: string;
  sizes?: string;
  priority?: boolean;
  compact?: boolean;
}

export function ReadingOrderCover({
  title,
  seed,
  imageUrl,
  publisher,
  className,
  sizes = "(min-width: 1024px) 320px, 45vw",
  priority = false,
  compact = false,
}: ReadingOrderCoverProps) {
  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative aspect-2/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10",
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={`Cover artwork for ${title}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const [from, to] = paletteForSeed(seed);

  return (
    <div
      role="img"
      aria-label={`Placeholder artwork for ${title}`}
      className={cn(
        "relative flex aspect-2/3 w-full flex-col justify-between overflow-hidden rounded-md p-3 ring-1 ring-foreground/10",
        className
      )}
      style={{ backgroundImage: `linear-gradient(150deg, ${from}, ${to})` }}
    >
      <div className="flex items-center justify-between text-white/70">
        <BookOpenText className={compact ? "size-3" : "size-4"} aria-hidden="true" />
        {publisher && !compact ? (
          <span className="text-[0.625rem] font-medium tracking-[0.12em] uppercase">
            {PUBLISHER_LABELS[publisher]}
          </span>
        ) : null}
      </div>
      {compact ? null : (
        <p className="font-heading text-sm leading-tight font-medium text-balance text-white line-clamp-4">
          {title}
        </p>
      )}
    </div>
  );
}
