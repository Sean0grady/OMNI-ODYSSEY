import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}

/**
 * A price-guide section header: heavy condensed type sitting on a rule, the
 * way a printed reference divides its sections. The heading carries its own
 * weight — there is no label above it announcing what it is about to say.
 */
export function SectionHeading({
  title,
  description,
  action,
  className,
  headingLevel = "h2",
}: SectionHeadingProps) {
  const Heading = headingLevel;

  return (
    <div className={cn("border-b-2 border-foreground/85 pb-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <Heading
            className={cn(
              "font-extrabold text-balance uppercase",
              headingLevel === "h1"
                ? "text-3xl sm:text-4xl"
                : "text-xl sm:text-2xl"
            )}
            style={{ fontStretch: "82%", letterSpacing: "-0.015em" }}
          >
            {title}
          </Heading>
          {description ? (
            <p className="reading-type mt-1.5 max-w-prose text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
