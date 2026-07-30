"use client";

import { useState } from "react";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmationMessage } from "@/components/forms/confirmation-message";
import { ReadingOrderMetadataFields } from "@/features/reading-orders/components/reading-order-metadata-fields";
import { ReadingOrderEntryFieldArray } from "@/features/reading-orders/components/reading-order-entry-field-array";
import { ReadingOrderPreview } from "@/features/reading-orders/components/reading-order-preview";
import {
  createReadingOrderSchema,
  emptyReadingOrderEntry,
  type CreateReadingOrderInput,
} from "@/features/reading-orders/schemas/reading-order-schema";
import { createReadingOrderMock } from "@/lib/repositories";
import type { ReadingOrder } from "@/types/domain";

const DEFAULT_VALUES: CreateReadingOrderInput = {
  title: "",
  summary: "",
  publishers: [],
  categories: [],
  visibility: "public",
  coverImageUrl: "",
  entries: [emptyReadingOrderEntry],
};

export function ReadingOrderForm() {
  const [showPreview, setShowPreview] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<ReadingOrder | null>(null);

  const form = useForm<CreateReadingOrderInput>({
    resolver: zodResolver(createReadingOrderSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onBlur",
  });

  function onSubmit(data: CreateReadingOrderInput) {
    const order = createReadingOrderMock(data);
    setCreatedOrder(order);
  }

  function handleCreateAnother() {
    setCreatedOrder(null);
    setShowPreview(false);
    form.reset(DEFAULT_VALUES);
  }

  if (createdOrder) {
    return (
      <ConfirmationMessage
        title="Reading order created"
        description={`"${createdOrder.title}" was created with ${createdOrder.entries.length} ${createdOrder.entries.length === 1 ? "entry" : "entries"}. This is a mock submission — it exists only in this browser session and won't appear in Discover after a refresh.`}
        action={
          <>
            <Button onClick={handleCreateAnother}>Create another</Button>
            <Button variant="outline" render={<Link href="/discover" />}>
              Back to Discover
            </Button>
          </>
        }
      />
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-10"
      >
        <section aria-labelledby="metadata-heading" className="space-y-4">
          <h2 id="metadata-heading" className="font-heading text-lg font-medium">
            Details
          </h2>
          <ReadingOrderMetadataFields />
        </section>

        <section aria-labelledby="entries-heading" className="space-y-4">
          <h2 id="entries-heading" className="font-heading text-lg font-medium">
            Entries
          </h2>
          <ReadingOrderEntryFieldArray />
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button type="submit">Create reading order</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview((current) => !current)}
          >
            {showPreview ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
            {showPreview ? "Hide preview" : "Preview"}
          </Button>
        </div>

        {showPreview ? (
          <section aria-labelledby="preview-heading" className="space-y-4">
            <h2 id="preview-heading" className="font-heading text-lg font-medium">
              Preview
            </h2>
            <ReadingOrderPreview />
          </section>
        ) : null}
      </form>
    </FormProvider>
  );
}
