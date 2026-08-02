"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FormFieldError } from "@/components/forms/form-field-error";
import { PUBLISHERS, PUBLISHER_LABELS } from "@/lib/constants/catalog";
import {
  createProfileSchema,
  type CreateProfileInput,
} from "@/features/profiles/schemas/profile-schema";
import { createProfileAction } from "@/features/profiles/actions/create-profile";
import type { Publisher } from "@/types/domain";

function toggleValue<T>(current: T[], value: T, checked: boolean): T[] {
  if (checked) {
    return current.includes(value) ? current : [...current, value];
  }
  return current.filter((item) => item !== value);
}

export function OnboardingForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProfileInput>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      username: "",
      displayName: "",
      bio: "",
      location: "",
      favoritePublishers: [],
    },
  });

  async function onSubmit(data: CreateProfileInput) {
    setFormError(null);
    const result = await createProfileAction(data);

    if (!result.success) {
      setFormError(result.error);
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof CreateProfileInput, { message });
        }
      }
      return;
    }

    router.push(`/users/${result.username}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          aria-invalid={!!errors.username}
          aria-describedby={errors.username ? "username-error" : undefined}
          placeholder="e.g. marcus.reads"
          {...register("username")}
        />
        <FormFieldError id="username-error" message={errors.username?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          aria-invalid={!!errors.displayName}
          aria-describedby={errors.displayName ? "displayName-error" : undefined}
          {...register("displayName")}
        />
        <FormFieldError
          id="displayName-error"
          message={errors.displayName?.message}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio (optional)</Label>
        <Textarea
          id="bio"
          rows={3}
          aria-invalid={!!errors.bio}
          aria-describedby={errors.bio ? "bio-error" : undefined}
          {...register("bio")}
        />
        <FormFieldError id="bio-error" message={errors.bio?.message} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Location (optional)</Label>
        <Input
          id="location"
          aria-invalid={!!errors.location}
          aria-describedby={errors.location ? "location-error" : undefined}
          {...register("location")}
        />
        <FormFieldError id="location-error" message={errors.location?.message} />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          Favorite publishers (optional)
        </legend>
        <Controller
          control={control}
          name="favoritePublishers"
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PUBLISHERS.map((publisher: Publisher) => {
                const checked = field.value?.includes(publisher) ?? false;
                const fieldId = `favorite-publisher-${publisher}`;
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
      </fieldset>

      {formError ? (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Saving…" : "Create profile"}
      </Button>
    </form>
  );
}
