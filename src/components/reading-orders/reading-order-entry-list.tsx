import { ReadingOrderEntryItem } from "@/components/reading-orders/reading-order-entry-item";
import { EmptyState } from "@/components/shared/empty-state";
import type { ReadingOrderEntry } from "@/types/domain";

interface ReadingOrderEntryListProps {
  entries: ReadingOrderEntry[];
}

export function ReadingOrderEntryList({ entries }: ReadingOrderEntryListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        title="No entries yet"
        description="This reading order doesn't have any entries yet."
      />
    );
  }

  return (
    <ol className="divide-y-0">
      {entries
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((entry) => (
          <ReadingOrderEntryItem key={entry.id} entry={entry} />
        ))}
    </ol>
  );
}
