import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetadataStatProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

export function MetadataStat({ icon: Icon, label, className }: MetadataStatProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
