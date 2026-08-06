"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/forms/form-field-error";
import { RatingInput } from "@/components/reviews/rating-input";
import { PUBLISHERS, PUBLISHER_LABELS } from "@/lib/constants/catalog";
import {
  createReviewSchema,
  type CreateReviewInput,
} from "@/features/reviews/schemas/review-schema";
import { createReviewAction } from "@/features/reviews/actions/create-review";
import type { Publisher } from "@/types/domain";

const SUB_RATINGS: {
  name: "bindingRating" | "paperQualityRating" | "mappingRating" | "extrasRating";
  label: string;
}[] = [
  { name: "bindingRating", label: "Binding (optional)" },
  { name: "paperQualityRating", label: "Paper quality (optional)" },
  { name: "mappingRating", label: "Mapping / gutter loss (optional)" },
  { name: "extrasRating", label: "Extras (optional)" },
];

export function ReviewForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      editionTitle: "",
      publisher: "marvel",
      coverImageUrl: "",
      overallRating: undefined,
      reviewText: "",
    },
  });

  async function onSubmit(data: CreateReviewInput) {
    setFormError(null);
    const result = await createReviewAction(data);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    router.push("/reviews");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="editionTitle">Edition title</Label>
        <Input
          id="editionTitle"
          aria-invalid={!!errors.editionTitle}
          aria-describedby={errors.editionTitle ? "editionTitle-error" : undefined}
          placeholder="e.g. Fantastic Four by Jonathan Hickman Omnibus, Vol. 1"
          {...register("editionTitle")}
        />
        <FormFieldError
          id="editionTitle-error"
          message={errors.editionTitle?.message}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="publisher">Publisher</Label>
        <Controller
          control={control}
          name="publisher"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => field.onChange(value as Publisher)}
            >
              <SelectTrigger id="publisher" className="w-full">
                <SelectValue>
                  {(value: Publisher) => PUBLISHER_LABELS[value]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PUBLISHERS.map((publisher) => (
                  <SelectItem key={publisher} value={publisher}>
                    {PUBLISHER_LABELS[publisher]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <FormFieldError id="publisher-error" message={errors.publisher?.message} />
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

      <div className="space-y-1.5">
        <Label id="overallRating-label">Overall rating</Label>
        <Controller
          control={control}
          name="overallRating"
          render={({ field }) => (
            <RatingInput
              id="overallRating"
              label="Overall rating"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <FormFieldError
          id="overallRating-error"
          message={errors.overallRating?.message}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reviewText">Review</Label>
        <Textarea
          id="reviewText"
          rows={5}
          aria-invalid={!!errors.reviewText}
          aria-describedby={errors.reviewText ? "reviewText-error" : undefined}
          placeholder="What's this edition like — binding, paper quality, mapping, extras — beyond just the story?"
          {...register("reviewText")}
        />
        <FormFieldError id="reviewText-error" message={errors.reviewText?.message} />
      </div>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Sub-ratings (optional)</legend>
        {SUB_RATINGS.map(({ name, label }) => (
          <div key={name} className="space-y-1.5">
            <Label id={`${name}-label`}>{label}</Label>
            <Controller
              control={control}
              name={name}
              render={({ field }) => (
                <RatingInput
                  id={name}
                  label={label}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        ))}
      </fieldset>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Posting…" : "Post review"}
      </Button>
    </form>
  );
}
