import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * THE SLAB.
 *
 * A certified comic is sealed in a two-piece acrylic shell with a printed
 * label across the top and the book recessed in an inner well below it. This
 * component is that object.
 *
 * The certification band's colour is load-bearing, not decorative: on a real
 * label the band tells you which *kind* of certification you are looking at
 * before you have read a single word, and it does the same job here.
 */

export type CertBand = "universal" | "signature" | "restored" | "qualified";

const BAND_SURFACE: Record<CertBand, string> = {
  universal: "bg-universal text-universal-foreground",
  signature: "bg-signature text-signature-foreground",
  restored: "bg-restored text-restored-foreground",
  qualified: "bg-qualified text-qualified-foreground",
};

interface SlabProps {
  children: ReactNode;
  className?: string;
}

export function Slab({ children, className }: SlabProps) {
  return (
    <div
      className={cn(
        "slab relative overflow-hidden rounded-[3px] ring-1 ring-foreground/12",
        className
      )}
    >
      {children}
      {/*
        The sonic weld: the hairline seam where the two halves of the shell are
        joined. It runs the full height just inside the right edge.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-2 w-px bg-foreground/[0.07]"
      />
    </div>
  );
}

interface SlabLabelProps {
  band?: CertBand;
  /** The band's printed designation, e.g. "UNIVERSAL". */
  bandLabel: string;
  /** Small run of label fields above the title, e.g. publisher and year. */
  meta?: string;
  title: ReactNode;
  /** Attribution line, e.g. the collector who certified it. */
  byline?: ReactNode;
  grade?: SlabGradeProps;
  className?: string;
}

export function SlabLabel({
  band = "universal",
  bandLabel,
  meta,
  title,
  byline,
  grade,
  className,
}: SlabLabelProps) {
  return (
    <div className={cn("bg-label-stock text-foreground", className)}>
      <div
        className={cn(
          "label-type flex items-center justify-between px-3 py-1 text-[0.6rem]",
          BAND_SURFACE[band]
        )}
      >
        <span>{bandLabel}</span>
        <span aria-hidden="true" className="foil h-2.5 w-10 rounded-[1px] opacity-80" />
      </div>

      <div className="flex items-stretch gap-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          {meta ? (
            <p className="label-type text-[0.58rem] text-muted-foreground">{meta}</p>
          ) : null}
          <div className="mt-0.5 text-pretty">{title}</div>
          {byline ? <div className="mt-1">{byline}</div> : null}
        </div>

        {grade ? <SlabGrade {...grade} /> : null}
      </div>
    </div>
  );
}

interface SlabGradeProps {
  /** The figure itself. Real data only — a review's rating, or a volume count. */
  value: string;
  /** What the figure means, printed under it, e.g. "NEAR MINT" or "BOOKS". */
  designation: string;
  /** Screen-reader sentence, since the numeral alone is not self-describing. */
  srLabel: string;
}

export function SlabGrade({ value, designation, srLabel }: SlabGradeProps) {
  return (
    <div className="flex shrink-0 flex-col items-end justify-center border-l border-foreground/12 pl-3">
      <span className="grade-numeral text-3xl" aria-hidden="true">
        {value}
      </span>
      <span
        className="label-type mt-1 text-[0.53rem] text-muted-foreground"
        aria-hidden="true"
      >
        {designation}
      </span>
      <span className="sr-only">{srLabel}</span>
    </div>
  );
}

export interface SlabAttribute {
  label: string;
  /** Rendered value. Pass null for a genuinely ungraded attribute. */
  value: string | null;
  /** 0–1, drives the printed bar. Omit when the attribute is ungraded. */
  fill?: number;
}

/**
 * The attribute rows. This is where the product's actual differentiator lives:
 * a collector deciding on an expensive book wants the object graded, not only
 * the story. Ungraded attributes print as a rule rather than disappearing,
 * because an absent grade is information too.
 */
export function SlabAttributes({
  attributes,
  className,
}: {
  attributes: SlabAttribute[];
  className?: string;
}) {
  return (
    // text-foreground is explicit: this block sits on label stock but is not a
    // child of SlabLabel, so it would otherwise inherit the surrounding
    // section's colour and print white-on-white.
    <dl className={cn("divide-y divide-foreground/10 text-foreground", className)}>
      {attributes.map((attribute) => (
        <div
          key={attribute.label}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-1.5"
        >
          <dt className="label-type text-[0.58rem] text-muted-foreground">
            {attribute.label}
          </dt>
          <dd className="data-type flex items-center gap-2 text-xs font-semibold">
            {attribute.value === null ? (
              <span className="text-muted-foreground">Not graded</span>
            ) : (
              <>
                <span
                  aria-hidden="true"
                  className="hidden h-1 w-16 overflow-hidden rounded-[1px] bg-foreground/12 sm:block"
                >
                  <span
                    className="block h-full bg-universal"
                    style={{ width: `${Math.round((attribute.fill ?? 0) * 100)}%` }}
                  />
                </span>
                {attribute.value}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** The recessed well the book sits in, below the acrylic face. */
export function SlabWell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("slab-well relative overflow-hidden", className)}>
      {children}
    </div>
  );
}

/**
 * The certification number strip along the foot of the label. Real slabs carry
 * one and collectors quote them; here it is derived from the record's own id so
 * it is stable and real rather than decorative noise.
 */
export function SlabCertNumber({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  // Fold the whole id into the strip rather than slicing the first few
  // characters: ids like "sample-ff-hickman-v1" carry too few hex digits to
  // fill ten slots, and a half-empty cert number reads as a rendering fault.
  let checksum = 0;
  for (let index = 0; index < id.length; index += 1) {
    checksum = (checksum * 31 + id.charCodeAt(index)) >>> 0;
  }
  const digits = checksum.toString().padStart(10, "0").slice(0, 10);

  return (
    <p
      className={cn(
        "label-type bg-label-stock px-3 py-1 text-[0.55rem] text-muted-foreground",
        className
      )}
    >
      Cert {digits.slice(0, 4)}-{digits.slice(4, 7)}-{digits.slice(7, 10)}
    </p>
  );
}
