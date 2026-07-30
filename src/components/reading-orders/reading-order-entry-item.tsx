import { Badge } from "@/components/ui/badge";
import { READING_ORDER_ENTRY_TYPE_LABELS } from "@/lib/constants/catalog";
import type { ReadingOrderEntry } from "@/types/domain";

interface ReadingOrderEntryItemProps {
  entry: ReadingOrderEntry;
}

export function ReadingOrderEntryItem({ entry }: ReadingOrderEntryItemProps) {
  return (
    <li className="flex gap-4 border-b border-border py-4 last:border-b-0">
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-sm font-medium tabular-nums"
      >
        {entry.position}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-balance">
            {entry.title}
            {entry.subtitle ? (
              <span className="text-muted-foreground"> — {entry.subtitle}</span>
            ) : null}
          </p>
          {entry.isOptional ? (
            <Badge variant="ghost">Optional</Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{READING_ORDER_ENTRY_TYPE_LABELS[entry.entryType]}</span>
          {entry.issueRange ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{entry.issueRange}</span>
            </>
          ) : null}
        </div>
        {entry.notes ? (
          <p className="text-sm text-muted-foreground">{entry.notes}</p>
        ) : null}
      </div>
    </li>
  );
}
