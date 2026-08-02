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

interface CoverPlaceholderProps {
  title: string;
  seed: string;
  publisher?: Publisher;
  compact?: boolean;
  className?: string;
}

export function CoverPlaceholder({
  title,
  seed,
  publisher,
  compact = false,
  className,
}: CoverPlaceholderProps) {
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
