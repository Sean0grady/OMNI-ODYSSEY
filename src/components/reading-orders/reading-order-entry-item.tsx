import { Badge } from "@/components/ui/badge";
import { READING_ORDER_ENTRY_TYPE_LABELS } from "@/lib/constants/catalog";
import { cn } from "@/lib/utils";
import type { ReadingOrderEntry } from "@/types/domain";

interface ReadingOrderEntryItemProps {
  entry: ReadingOrderEntry;
}

/**
 * One stop on the run.
 *
 * The position number is the one place section numbering genuinely carries
 * information rather than decorating: this is a *reading order*, so the
 * sequence is the product. It is set as a heavy plate number in the margin,
 * the way a run is numbered on a spine.
 *
 * Optional entries are printed lighter and marked, because a reader deciding
 * what they can skip is the entire reason the notes exist.
 */
export function ReadingOrderEntryItem({ entry }: ReadingOrderEntryItemProps) {
  return (
    <li className="group relative flex gap-5 border-b border-foreground/12 py-5 last:border-b-0">
      <div className="relative shrink-0">
        <span
          aria-hidden="true"
          className={cn(
            "grade-numeral block w-11 text-right text-2xl",
            entry.isOptional ? "text-muted-foreground/45" : "text-foreground/22"
          )}
        >
          {String(entry.position).padStart(2, "0")}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p
            className={cn(
              "text-base leading-snug font-bold text-balance",
              entry.isOptional && "text-muted-foreground"
            )}
          >
            {entry.title}
            {entry.subtitle ? (
              <span className="font-normal text-muted-foreground">
                {" "}
                — {entry.subtitle}
              </span>
            ) : null}
          </p>
          {entry.isOptional ? <Badge variant="secondary">Optional</Badge> : null}
        </div>

        <div className="label-type flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.55rem] text-muted-foreground">
          <span>{READING_ORDER_ENTRY_TYPE_LABELS[entry.entryType]}</span>
          {entry.issueRange ? (
            <>
              <span aria-hidden="true" className="text-foreground/25">
                /
              </span>
              <span className="data-type tracking-normal normal-case">
                {entry.issueRange}
              </span>
            </>
          ) : null}
        </div>

        {entry.notes ? (
          <p className="reading-type max-w-prose border-l-2 border-foreground/15 pl-3 text-sm leading-relaxed text-muted-foreground">
            {entry.notes}
          </p>
        ) : null}
      </div>
    </li>
  );
}
