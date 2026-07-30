import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
  headingLevel = "h2",
}: SectionHeadingProps) {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-[0.14em] text-primary uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="mt-1 text-2xl font-medium text-balance sm:text-3xl">
          {title}
        </Heading>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
