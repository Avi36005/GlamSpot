import { BadgeCheck } from "lucide-react";
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

export function ReviewCard({ review }: { review: ReviewDTO }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
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
    </div>
  );
}
