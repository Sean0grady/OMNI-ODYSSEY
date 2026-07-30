import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfirmationMessageProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ConfirmationMessage({
  title,
  description,
  action,
  className,
}: ConfirmationMessageProps) {
  return (
    <Card role="status" className={cn("items-center", className)}>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <CheckCircle2 className="size-9 text-primary" aria-hidden="true" />
        <div className="max-w-sm space-y-1">
          <p className="font-heading text-lg font-medium">{title}</p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
