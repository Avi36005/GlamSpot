"use client";

import { BadgeCheck } from "lucide-react";
import { motion } from "motion/react";
import type { ReviewDTO } from "@/lib/types";
import { StarRating } from "./StarRating";
import { Badge } from "./ui";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function ReviewCard({ review, index = 0 }: { review: ReviewDTO; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 4) * 0.05 }}
      whileHover={{ y: -2 }}
      className="rounded-xl border border-line bg-white p-4 transition-all duration-300 hover:border-accent/15 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-cream text-sm font-semibold text-ink">
            {initials(review.author)}
          </span>
          <div>
            <div className="flex items-center gap-1.5 font-medium text-ink">
              {review.author}
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} size={12} />
              <span className="text-xs text-muted">{timeAgo(review.createdAt)}</span>
            </div>
          </div>
        </div>
        {review.verified && (
          <Badge tone="neutral">
            <BadgeCheck size={11} className="text-accent" /> Verified
          </Badge>
        )}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">{review.comment}</p>
    </motion.div>
  );
}

