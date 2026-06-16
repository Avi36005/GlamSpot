"use client";

import { Scissors } from "lucide-react";
import { TiltCard } from "@/components/motion/TiltCard";

export function AIStyleCard({
  name,
  reason,
  index = 0,
}: {
  name: string;
  reason: string;
  index?: number;
}) {
  return (
    <TiltCard className="iridescent-shimmer flex gap-3 rounded-2xl border border-line bg-white p-4 glow-card preserve-3d">
      <span 
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-highlight text-accent" 
        style={{ transform: "translateZ(20px)" }}
      >
        <Scissors size={16} />
      </span>
      <div className="preserve-3d" style={{ transform: "translateZ(15px)" }}>
        <div className="flex items-center gap-2" style={{ transform: "translateZ(25px)" }}>
          <span className="text-xs font-semibold text-accent">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h4 className="font-display text-base font-semibold text-ink">{name}</h4>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-muted" style={{ transform: "translateZ(20px)" }}>
          {reason}
        </p>
      </div>
    </TiltCard>
  );
}

export function ColourSwatch({
  name,
  hex,
  reason,
}: {
  name: string;
  hex: string;
  reason: string;
}) {
  return (
    <TiltCard className="iridescent-shimmer rounded-2xl border border-line bg-white p-4 text-center glow-card preserve-3d">
      <span
        className="mx-auto block h-14 w-14 rounded-full border border-line shadow-inner"
        style={{ backgroundColor: hex, transform: "translateZ(20px)" }}
      />
      <div className="mt-3 font-medium text-ink" style={{ transform: "translateZ(25px)" }}>
        {name}
      </div>
      <div className="text-xs uppercase tracking-wider text-muted" style={{ transform: "translateZ(20px)" }}>
        {hex}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted" style={{ transform: "translateZ(15px)" }}>
        {reason}
      </p>
    </TiltCard>
  );
}
