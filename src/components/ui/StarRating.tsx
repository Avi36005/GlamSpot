"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  className,
  showValue = false,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, value - i));
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute text-line" />
              <span
                className="absolute overflow-hidden"
                style={{ width: `${fill * 100}%`, height: size }}
              >
                <Star size={size} className="text-accent fill-accent" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue && <span className="text-sm font-medium text-ink">{value.toFixed(1)}</span>}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
  size = 28,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="inline-flex gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = (hover || value) >= i;
        return (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="transition-transform hover:scale-110"
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={active ? "text-accent fill-accent" : "text-line"}
            />
          </button>
        );
      })}
    </div>
  );
}
