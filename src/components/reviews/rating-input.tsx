"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  label: string;
  value: number | undefined;
  onChange: (value: number) => void;
  id?: string;
  maxRating?: number;
  className?: string;
}

export function RatingInput({
  label,
  value,
  onChange,
  id,
  maxRating = 5,
  className,
}: RatingInputProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const ratingValues = Array.from({ length: maxRating }, (_, index) => index + 1);
  const displayValue = hovered ?? value ?? 0;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      id={id}
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={() => setHovered(null)}
    >
      {ratingValues.map((ratingValue) => (
        <button
          key={ratingValue}
          type="button"
          role="radio"
          aria-checked={value === ratingValue}
          aria-label={`${ratingValue} out of ${maxRating}`}
          onMouseEnter={() => setHovered(ratingValue)}
          onClick={() => onChange(ratingValue)}
          className="rounded-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Star
            className={cn(
              "size-6 text-muted-foreground/35",
              ratingValue <= displayValue && "fill-primary text-primary"
            )}
            aria-hidden="true"
          />
        </button>
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        {value ? `${value}/${maxRating}` : "Not rated"}
      </span>
    </div>
  );
}
