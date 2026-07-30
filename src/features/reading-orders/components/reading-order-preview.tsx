"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ReadingOrderCover } from "@/components/reading-orders/reading-order-cover";
import { PublisherBadge } from "@/components/reading-orders/publisher-badge";
import { CategoryBadge } from "@/components/reading-orders/category-badge";
import { VisibilityBadge } from "@/components/reading-orders/visibility-badge";
import { ReadingOrderEntryList } from "@/components/reading-orders/reading-order-entry-list";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrderEntry } from "@/types/domain";

export function ReadingOrderPreview() {
  const { control } = useFormContext<CreateReadingOrderInput>();
  const values = useWatch<CreateReadingOrderInput>({ control });

  const publishers = values.publishers ?? [];
  const categories = values.categories ?? [];
  const previewEntries: ReadingOrderEntry[] = (values.entries ?? []).map(
    (entry, index) => ({
      id: `preview-entry-${index}`,
      readingOrderId: "preview",
      position: index + 1,
      entryType: entry?.entryType ?? "collected-edition",
      title: entry?.title || "Untitled entry",
      issueRange: entry?.issueRange || undefined,
      notes: entry?.notes || undefined,
      isOptional: entry?.isOptional ?? false,
    })
  );

  return (
    <div className="space-y-6 rounded-lg border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr]">
        <ReadingOrderCover
          title={values.title || "Untitled reading order"}
          seed={values.title || "preview"}
          publisher={publishers[0]}
          imageUrl={values.coverImageUrl || undefined}
          className="mx-auto w-full max-w-40 sm:mx-0"
        />
        <div className="space-y-3">
          <div>
            <h3 className="font-heading text-xl font-medium text-balance">
              {values.title || "Untitled reading order"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {values.summary || "No summary yet."}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <VisibilityBadge visibility={values.visibility ?? "public"} />
            {publishers.map((publisher) => (
              <PublisherBadge key={publisher} publisher={publisher} />
            ))}
            {categories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {previewEntries.length} entr
            {previewEntries.length === 1 ? "y" : "ies"}
          </p>
        </div>
      </div>
      <div>
        <h4 className="mb-2 font-heading text-sm font-medium text-muted-foreground">
          Reading order
        </h4>
        <ReadingOrderEntryList entries={previewEntries} />
      </div>
    </div>
  );
}
