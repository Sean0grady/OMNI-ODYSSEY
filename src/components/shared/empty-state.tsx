import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3" | "p";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  headingLevel = "p",
}: EmptyStateProps) {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-md border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      {Icon ? (
        <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      ) : null}
      <div className="max-w-sm space-y-1">
        <Heading className="font-heading text-base font-medium">{title}</Heading>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
