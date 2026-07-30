"use client";

import { Controller, useFormContext } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldError } from "@/components/forms/form-field-error";
import {
  READING_ORDER_ENTRY_TYPES,
  READING_ORDER_ENTRY_TYPE_LABELS,
} from "@/lib/constants/catalog";
import { cn } from "@/lib/utils";
import type { CreateReadingOrderInput } from "@/features/reading-orders/schemas/reading-order-schema";
import type { ReadingOrderEntryType } from "@/types/domain";

interface ReadingOrderEntryEditorProps {
  sortableId: string;
  index: number;
  position: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function ReadingOrderEntryEditor({
  sortableId,
  index,
  position,
  onRemove,
  canRemove,
}: ReadingOrderEntryEditorProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateReadingOrderInput>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sortableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const entryErrors = errors.entries?.[index];
  const titleErrorId = `entry-${sortableId}-title-error`;
  const titleFieldId = `entries.${index}.title`;
  const entryTypeFieldId = `entries.${index}.entryType`;
  const issueRangeFieldId = `entries.${index}.issueRange`;
  const issueRangeErrorId = `entry-${sortableId}-issueRange-error`;
  const notesFieldId = `entries.${index}.notes`;
  const notesErrorId = `${notesFieldId}-error`;
  const optionalFieldId = `entries.${index}.isOptional`;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex-row gap-3 p-4",
        isDragging && "relative z-10 opacity-70 ring-2 ring-ring"
      )}
    >
      <div className="flex flex-col items-center gap-2 pt-1">
        <span
          aria-hidden="true"
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium tabular-nums"
        >
          {position}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          {...attributes}
          {...listeners}
          aria-label={`Drag to reorder entry ${position}`}
          className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={titleFieldId}>Entry title</Label>
          <Input
            id={titleFieldId}
            aria-invalid={!!entryErrors?.title}
            aria-describedby={entryErrors?.title ? titleErrorId : undefined}
            placeholder="e.g. Fantastic Four by Jonathan Hickman Omnibus, Vol. 1"
            {...register(`entries.${index}.title` as const)}
          />
          <FormFieldError id={titleErrorId} message={entryErrors?.title?.message} />
        </div>

        <div className="space-y-1">
          <Label htmlFor={entryTypeFieldId}>Entry type</Label>
          <Controller
            control={control}
            name={`entries.${index}.entryType`}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value as ReadingOrderEntryType)
                }
              >
                <SelectTrigger id={entryTypeFieldId} className="w-full">
                  <SelectValue>
                    {(value: ReadingOrderEntryType) =>
                      READING_ORDER_ENTRY_TYPE_LABELS[value]
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {READING_ORDER_ENTRY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {READING_ORDER_ENTRY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor={issueRangeFieldId}>Issue range (optional)</Label>
          <Input
            id={issueRangeFieldId}
            aria-invalid={!!entryErrors?.issueRange}
            aria-describedby={
              entryErrors?.issueRange ? issueRangeErrorId : undefined
            }
            placeholder="e.g. FF (2009) #570–578"
            {...register(`entries.${index}.issueRange` as const)}
          />
          <FormFieldError
            id={issueRangeErrorId}
            message={entryErrors?.issueRange?.message}
          />
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor={notesFieldId}>Notes (optional)</Label>
          <Textarea
            id={notesFieldId}
            rows={2}
            aria-invalid={!!entryErrors?.notes}
            aria-describedby={entryErrors?.notes ? notesErrorId : undefined}
            placeholder="Anything a reader should know before or during this entry"
            {...register(`entries.${index}.notes` as const)}
          />
          <FormFieldError
            id={notesErrorId}
            message={entryErrors?.notes?.message}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Controller
            control={control}
            name={`entries.${index}.isOptional`}
            render={({ field }) => (
              <Checkbox
                id={optionalFieldId}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor={optionalFieldId} className="font-normal">
            Optional / skippable entry
          </Label>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove entry ${position}`}
        onClick={onRemove}
        disabled={!canRemove}
        className="shrink-0"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </Card>
  );
}
