"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocalityMultiSelect({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="relative mb-2">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search localities"
          className="w-full rounded-lg border border-line bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-accent"
        />
      </div>
      <div className="max-h-44 space-y-0.5 overflow-y-auto pr-1">
        {filtered.map((o) => {
          const checked = selected.includes(o);
          return (
            <label
              key={o}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-cream"
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded border transition-colors",
                  checked ? "border-accent bg-accent text-white" : "border-line bg-white"
                )}
              >
                {checked && <span className="text-[10px] leading-none">✓</span>}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(o)}
                className="sr-only"
              />
              {o}
            </label>
          );
        })}
      </div>
    </div>
  );
}
