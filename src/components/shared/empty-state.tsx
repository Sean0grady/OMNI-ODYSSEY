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

/**
 * An empty slot in the registry, printed rather than blank.
 *
 * The catalogue is thin and will stay thin early, so this is one of the most
 * frequently seen surfaces in the product — it gets the same label vocabulary
 * as a filled record instead of an apologetic grey box. The hatched field is
 * the printer's convention for an area intentionally left unset.
 */
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
        "relative overflow-hidden rounded-[3px] border border-dashed border-foreground/25",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 9px)",
        }}
      />
      <div className="label-type relative border-b border-dashed border-foreground/25 px-3 py-1.5 text-[0.55rem] text-muted-foreground">
        No record on file
      </div>
      <div className="relative flex flex-col items-center gap-3 px-6 py-11 text-center">
        {Icon ? (
          <Icon className="size-7 text-muted-foreground" aria-hidden="true" />
        ) : null}
        <div className="max-w-sm space-y-1.5">
          <Heading
            className="text-base font-extrabold uppercase"
            style={{ fontStretch: "84%", letterSpacing: "-0.01em" }}
          >
            {title}
          </Heading>
          {description ? (
            <p className="reading-type text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="mt-1">{action}</div> : null}
      </div>
    </div>
  );
}
