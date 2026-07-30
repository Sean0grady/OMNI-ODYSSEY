"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormFieldError } from "@/components/forms/form-field-error";
import {
  PUBLISHERS,
  PUBLISHER_LABELS,
  READING_ORDER_CATEGORIES,
  READING_ORDER_CATEGORY_LABELS,
} from "@/lib/constants/catalog";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";
import type { Publisher, ReadingOrderCategory } from "@/types/domain";

export function ReadingOrderMetadataFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateReadingOrderInput>();

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          placeholder="e.g. Jonathan Hickman's Marvel Saga"
          {...register("title")}
        />
        <FormFieldError id="title-error" message={errors.title?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          rows={3}
          aria-invalid={!!errors.summary}
          aria-describedby={errors.summary ? "summary-error" : undefined}
          placeholder="A short, one- or two-sentence description of what this reading order covers."
          {...register("summary")}
        />
        <FormFieldError id="summary-error" message={errors.summary?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
        <Input
          id="coverImageUrl"
          type="url"
          aria-invalid={!!errors.coverImageUrl}
          aria-describedby={
            errors.coverImageUrl ? "coverImageUrl-error" : undefined
          }
          placeholder="https://…"
          {...register("coverImageUrl")}
        />
        <FormFieldError
          id="coverImageUrl-error"
          message={errors.coverImageUrl?.message}
        />
      </div>

      <fieldset
        className="space-y-2"
        aria-describedby={errors.publishers ? "publishers-error" : undefined}
      >
        <legend className="text-sm font-medium">Publishers</legend>
        <p className="text-xs text-muted-foreground">
          Select every publisher represented in this reading order.
        </p>
        <Controller
          control={control}
          name="publishers"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PUBLISHERS.map((publisher) => {
                const checked = field.value?.includes(publisher) ?? false;
                const fieldId = `publisher-${publisher}`;
                return (
                  <div key={publisher} className="flex items-center gap-2">
                    <Checkbox
                      id={fieldId}
                      checked={checked}
                      onCheckedChange={(next) =>
                        field.onChange(
                          toggleValue(field.value ?? [], publisher, !!next)
                        )
                      }
                    />
                    <Label htmlFor={fieldId} className="font-normal">
                      {PUBLISHER_LABELS[publisher]}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        />
        <FormFieldError
          id="publishers-error"
          message={errors.publishers?.message}
        />
      </fieldset>

      <fieldset
        className="space-y-2"
        aria-describedby={errors.categories ? "categories-error" : undefined}
      >
        <legend className="text-sm font-medium">Categories</legend>
        <p className="text-xs text-muted-foreground">
          Select one or more categories that describe this reading order.
        </p>
        <Controller
          control={control}
          name="categories"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {READING_ORDER_CATEGORIES.map((category) => {
                const checked = field.value?.includes(category) ?? false;
                const fieldId = `category-${category}`;
                return (
                  <div key={category} className="flex items-center gap-2">
                    <Checkbox
                      id={fieldId}
                      checked={checked}
                      onCheckedChange={(next) =>
                        field.onChange(
                          toggleValue(field.value ?? [], category, !!next)
                        )
                      }
                    />
                    <Label htmlFor={fieldId} className="font-normal">
                      {READING_ORDER_CATEGORY_LABELS[category]}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}
        />
        <FormFieldError
          id="categories-error"
          message={errors.categories?.message}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Visibility</legend>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="public" id="visibility-public" />
                <Label htmlFor="visibility-public" className="font-normal">
                  Public — visible to everyone on Discover
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="private" id="visibility-private" />
                <Label htmlFor="visibility-private" className="font-normal">
                  Private — only visible to you
                </Label>
              </div>
            </RadioGroup>
          )}
        />
      </fieldset>
    </div>
  );
}

function toggleValue<T extends Publisher | ReadingOrderCategory>(
  current: T[],
  value: T,
  checked: boolean
): T[] {
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }
  return current.filter((item) => item !== value);
}
