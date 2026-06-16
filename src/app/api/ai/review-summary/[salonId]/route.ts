import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { summarizeReviews } from "@/lib/ai";
import { cacheGet, cacheSet } from "@/lib/cache";
import type { ReviewSummary } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ salonId: string }> }
) {
  const { salonId } = await params;
  const cacheKey = `review_summary:${salonId}`;

  const cached = cacheGet<ReviewSummary>(cacheKey);
  if (cached) return NextResponse.json({ summary: cached, cached: true });

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 30 } },
  });
  if (!salon) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const summary = await summarizeReviews(
    salon.name,
    salon.reviews.map((r) => ({ rating: r.rating, comment: r.comment }))
  );

  if (!summary) return NextResponse.json({ summary: null });

  cacheSet(cacheKey, summary, 86400);
  return NextResponse.json({ summary });
}
