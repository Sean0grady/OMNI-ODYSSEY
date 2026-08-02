"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CoverPlaceholder } from "@/components/reading-orders/cover-placeholder";
import type { Publisher } from "@/types/domain";

interface ExternalCoverImageProps {
  src: string;
  title: string;
  seed: string;
  publisher?: Publisher;
  compact?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders a user-submitted cover URL. Uses `unoptimized` deliberately: these
 * are arbitrary external URLs pasted by users, not curated app assets, so
 * routing them through Next's image optimizer would turn this server into
 * an open image-fetching proxy for whatever URL anyone submits. Falls back
 * to the same abstract placeholder used when no URL is set at all if the
 * image fails to load (dead link, hotlink protection, etc.) — a reading
 * order must never be unrenderable because of a bad cover URL.
 */
export function ExternalCoverImage({
  src,
  title,
  seed,
  publisher,
  compact = false,
  className,
  sizes,
  priority = false,
}: ExternalCoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <CoverPlaceholder
        title={title}
        seed={seed}
        publisher={publisher}
        compact={compact}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-2/3 w-full overflow-hidden rounded-md ring-1 ring-foreground/10",
        className
      )}
    >
      <Image
        src={src}
        alt={`Cover artwork for ${title}`}
        fill
        unoptimized
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
