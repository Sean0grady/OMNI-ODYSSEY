"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { createReadingOrderAction } from "@/features/reading-orders/actions/create-reading-order";
import { updateReadingOrderAction } from "@/features/reading-orders/actions/update-reading-order";
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

interface ReadingOrderFormProps {
  mode?: "create" | "edit";
  readingOrderId?: string;
  defaultValues?: CreateReadingOrderInput;
}

export function ReadingOrderForm({
  mode = "create",
  readingOrderId,
  defaultValues,
}: ReadingOrderFormProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<ReadingOrder | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateReadingOrderInput>({
    resolver: zodResolver(createReadingOrderSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
    mode: "onBlur",
  });

  async function onSubmit(data: CreateReadingOrderInput) {
    setSubmitError(null);

    if (mode === "edit" && readingOrderId) {
      const result = await updateReadingOrderAction(readingOrderId, data);
      if (!result.success) {
        setSubmitError(result.error);
        return;
      }
      router.push(`/reading-orders/${result.readingOrder.slug}`);
      router.refresh();
      return;
    }

    const result = await createReadingOrderAction(data);
    if (!result.success) {
      setSubmitError(result.error);
      return;
    }
    setCreatedOrder(result.readingOrder);
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
        description={`"${createdOrder.title}" was published with ${createdOrder.entries.length} ${createdOrder.entries.length === 1 ? "entry" : "entries"}.`}
        action={
          <>
            <Button render={<Link href={`/reading-orders/${createdOrder.slug}`} />}>
              View reading order
            </Button>
            <Button variant="outline" onClick={handleCreateAnother}>
              Create another
            </Button>
          </>
        }
      />
    );
  }

  const isSubmitting = form.formState.isSubmitting;

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

        {submitError ? (
          <p role="alert" className="text-sm text-destructive">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving…"
              : mode === "edit"
                ? "Save changes"
                : "Create reading order"}
          </Button>
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
