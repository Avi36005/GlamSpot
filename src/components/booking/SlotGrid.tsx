"use client";

import { cn } from "@/lib/utils";
import { formatTime12 } from "@/lib/utils";

export type Slot = { time: string; available: boolean };

export function SlotGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: Slot[];
  selected: string | null;
  onSelect: (time: string) => void;
}) {
  if (slots.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
        No slots for this date. Try another day.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {slots.map((s) => {
        const active = selected === s.time;
        return (
          <button
            key={s.time}
            disabled={!s.available}
            onClick={() => onSelect(s.time)}
            className={cn(
              "rounded-[8px] border px-2 py-2.5 text-sm font-medium transition-all",
              !s.available && "cursor-not-allowed border-line bg-cream text-muted/50 line-through",
              s.available && !active && "border-line bg-white text-ink hover:border-accent",
              active && "border-accent bg-accent text-white shadow-sm"
            )}
          >
            {formatTime12(s.time)}
          </button>
        );
      })}
    </div>
  );
}
