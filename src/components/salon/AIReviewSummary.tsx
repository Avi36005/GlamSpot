"use client";

import { useEffect, useState } from "react";
import { Sparkles, Heart, ThumbsUp, AlertCircle } from "lucide-react";
import type { ReviewSummary } from "@/lib/types";

export function AIReviewSummary({ salonId }: { salonId: string }) {
  const [data, setData] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/ai/review-summary/${salonId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active) {
          setData(d?.summary ?? null);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [salonId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-line bg-highlight/60 p-5">
        <div className="shimmer h-4 w-32 rounded" />
        <div className="mt-4 space-y-2">
          <div className="shimmer h-3 w-full rounded" />
          <div className="shimmer h-3 w-4/5 rounded" />
          <div className="shimmer h-3 w-3/5 rounded" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const rows = [
    { icon: Heart, label: "Best for", items: data.best_for },
    { icon: ThumbsUp, label: "Strengths", items: data.strengths },
    { icon: AlertCircle, label: "Watch out for", items: data.watch_out },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-accent/15 bg-highlight p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-white">
            <Sparkles size={14} />
          </span>
          <h3 className="font-display text-base font-semibold text-ink">AI Review Summary</h3>
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-accent/70">
          {data.source === "ai" ? "GPT-4o" : "Auto-generated"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="flex gap-3">
            <span className="mt-0.5 text-accent">
              <row.icon size={16} />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                {row.label}
              </div>
              <div className="text-sm text-ink">{row.items.join(" · ")}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
