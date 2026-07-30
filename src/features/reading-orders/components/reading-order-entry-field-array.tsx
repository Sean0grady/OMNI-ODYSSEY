"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ListOrdered, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ReadingOrderEntryEditor } from "@/features/reading-orders/components/reading-order-entry-editor";
import {
  emptyReadingOrderEntry,
  type CreateReadingOrderInput,
} from "@/features/reading-orders/schemas/reading-order-schema";

export function ReadingOrderEntryFieldArray() {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateReadingOrderInput>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "entries",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((field) => field.id === active.id);
    const newIndex = fields.findIndex((field) => field.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      move(oldIndex, newIndex);
    }
  }

  const announcements: Announcements = {
    onDragStart({ active }) {
      const index = fields.findIndex((field) => field.id === active.id);
      return `Picked up entry ${index + 1}. Use the arrow keys to move it, space bar to drop it, escape to cancel.`;
    },
    onDragOver({ active, over }) {
      if (!over) {
        return undefined;
      }
      const fromIndex = fields.findIndex((field) => field.id === active.id);
      const toIndex = fields.findIndex((field) => field.id === over.id);
      return `Entry ${fromIndex + 1} is now over position ${toIndex + 1}.`;
    },
    onDragEnd({ active, over }) {
      const fromIndex = fields.findIndex((field) => field.id === active.id);
      if (!over) {
        return `Entry ${fromIndex + 1} was dropped without a valid position and returned to its original spot.`;
      }
      const toIndex = fields.findIndex((field) => field.id === over.id);
      return `Entry ${fromIndex + 1} was moved to position ${toIndex + 1}.`;
    },
    onDragCancel({ active }) {
      const index = fields.findIndex((field) => field.id === active.id);
      return `Dragging was cancelled. Entry ${index + 1} returned to its original position.`;
    },
  };

  const arrayErrorMessage =
    typeof errors.entries?.message === "string" ? errors.entries.message : undefined;

  return (
    <div className="space-y-4">
      {fields.length === 0 ? (
        <EmptyState
          icon={ListOrdered}
          title="No entries yet"
          description="Add the first collected edition, individual issue, or story arc in this reading order."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => append(emptyReadingOrderEntry)}
            >
              <PlusCircle aria-hidden="true" />
              Add first entry
            </Button>
          }
        />
      ) : (
        <>
          <DndContext
            id="reading-order-entries"
            accessibility={{ announcements }}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((field) => field.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <ReadingOrderEntryEditor
                    key={field.id}
                    sortableId={field.id}
                    index={index}
                    position={index + 1}
                    onRemove={() => remove(index)}
                    canRemove={fields.length > 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {arrayErrorMessage ? (
            <p role="alert" className="text-xs text-destructive">
              {arrayErrorMessage}
            </p>
          ) : null}
          <Button
            type="button"
            variant="outline"
            onClick={() => append(emptyReadingOrderEntry)}
          >
            <PlusCircle aria-hidden="true" />
            Add another entry
          </Button>
        </>
      )}
    </div>
  );
}
