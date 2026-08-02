"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteReadingOrderAction } from "@/features/reading-orders/actions/delete-reading-order";

interface DeleteReadingOrderButtonProps {
  readingOrderId: string;
  readingOrderTitle: string;
  creatorUsername: string;
}

export function DeleteReadingOrderButton({
  readingOrderId,
  readingOrderTitle,
  creatorUsername,
}: DeleteReadingOrderButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteReadingOrderAction(readingOrderId);

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      return;
    }

    router.push(`/users/${creatorUsername}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2 aria-hidden="true" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{readingOrderTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            This permanently deletes the reading order and all of its entries.
            This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete reading order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
