import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  defaultValue?: string;
  className?: string;
}

export function SearchInput({ defaultValue, className }: SearchInputProps) {
  return (
    <form
      action="/discover"
      method="GET"
      role="search"
      className={cn("relative", className)}
    >
      <label htmlFor="site-search" className="sr-only">
        Search reading orders
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id="site-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search reading orders, creators, publishers…"
        className="pl-8"
      />
    </form>
  );
}
