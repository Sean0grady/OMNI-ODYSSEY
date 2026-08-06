import { cn } from "@/lib/utils";
import { PUBLISHER_LABELS } from "@/lib/constants/catalog";
import type { Publisher } from "@/types/domain";

/**
 * Authored cover artwork, in the grammar of four-colour offset printing —
 * the process that actually made comics look like comics.
 *
 * Every book gets solid trapped colour blocks, a halftone dot field where the
 * second ink overlaps, and registration crosshairs bled off the trim. It is
 * deterministic from the record's id, so a given book always prints the same
 * way, and it is honestly a stand-in: real cover scans replace it wherever the
 * record carries one.
 */

interface InkSet {
  ground: string;
  block: string;
  halftone: string;
  type: string;
}

const INK_SETS: InkSet[] = [
  {
    ground: "oklch(0.47 0.163 257)",
    block: "oklch(0.84 0.166 88)",
    halftone: "oklch(0.99 0 0)",
    type: "oklch(0.99 0 0)",
  },
  {
    ground: "oklch(0.55 0.223 27)",
    block: "oklch(0.24 0.06 258)",
    halftone: "oklch(0.84 0.166 88)",
    type: "oklch(0.99 0 0)",
  },
  {
    ground: "oklch(0.84 0.166 88)",
    block: "oklch(0.47 0.163 257)",
    halftone: "oklch(0.55 0.223 27)",
    type: "oklch(0.22 0.05 258)",
  },
  {
    ground: "oklch(0.45 0.19 312)",
    block: "oklch(0.84 0.166 88)",
    halftone: "oklch(0.99 0 0)",
    type: "oklch(0.99 0 0)",
  },
  {
    ground: "oklch(0.53 0.145 155)",
    block: "oklch(0.24 0.06 258)",
    halftone: "oklch(0.99 0 0)",
    type: "oklch(0.99 0 0)",
  },
  {
    ground: "oklch(0.24 0.06 258)",
    block: "oklch(0.55 0.223 27)",
    halftone: "oklch(0.84 0.166 88)",
    type: "oklch(0.99 0 0)",
  },
];

function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
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
  const seedValue = hash(seed);
  const ink = INK_SETS[seedValue % INK_SETS.length];
  // The block's baseline shifts per book so no two covers compose identically.
  const blockY = 46 + (seedValue % 5) * 6;
  const patternId = `halftone-${seedValue.toString(36)}`;

  return (
    <div
      role="img"
      aria-label={`Cover artwork for ${title}`}
      className={cn(
        "relative aspect-2/3 w-full overflow-hidden rounded-[2px] ring-1 ring-foreground/15",
        className
      )}
    >
      <svg
        viewBox="0 0 100 150"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id={patternId}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(15)"
          >
            <circle cx="2" cy="2" r="1.15" fill={ink.halftone} />
          </pattern>
        </defs>

        <rect width="100" height="150" fill={ink.ground} />

        {/* The second ink, laid as a halftone field that fades as the dots thin. */}
        <rect
          y={blockY - 26}
          width="100"
          height="34"
          fill={`url(#${patternId})`}
          opacity="0.55"
        />

        {/* Solid trapped block: where the heavy ink sits. */}
        <polygon
          points={`0,${blockY} 100,${blockY - 9} 100,${blockY + 30} 0,${blockY + 39}`}
          fill={ink.block}
        />

        {/* Registration crosshairs, bled off the trim the way a press sheet is. */}
        <g stroke={ink.type} strokeWidth="0.6" opacity="0.5">
          <line x1="6" y1="0" x2="6" y2="9" />
          <line x1="1.5" y1="5" x2="10.5" y2="5" />
          <circle cx="6" cy="5" r="2.6" fill="none" />
          <line x1="94" y1="141" x2="94" y2="150" />
          <line x1="89.5" y1="145" x2="98.5" y2="145" />
          <circle cx="94" cy="145" r="2.6" fill="none" />
        </g>
      </svg>

      {compact ? null : (
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
          <p
            className="text-[0.9rem] leading-[1.05] font-extrabold text-balance uppercase"
            style={{ color: ink.type, fontStretch: "88%", letterSpacing: "-0.02em" }}
          >
            {title}
          </p>
          {publisher ? (
            <p
              className="label-type text-[0.5rem] opacity-75"
              style={{ color: ink.type }}
            >
              {PUBLISHER_LABELS[publisher]}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
