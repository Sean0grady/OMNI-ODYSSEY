import { cn } from "@/lib/utils";

interface PageContainerProps extends React.ComponentProps<"div"> {
  as?: "div" | "section" | "main" | "article";
}

export function PageContainer({
  as: Tag = "div",
  className,
  ...props
}: PageContainerProps) {
  return (
    <Tag
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
