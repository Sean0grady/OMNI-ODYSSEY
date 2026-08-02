import { CoverPlaceholder } from "@/components/reading-orders/cover-placeholder";
import { ExternalCoverImage } from "@/components/reading-orders/external-cover-image";
import type { Publisher } from "@/types/domain";

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
      <ExternalCoverImage
        src={imageUrl}
        title={title}
        seed={seed}
        publisher={publisher}
        compact={compact}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

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
