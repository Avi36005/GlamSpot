import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { booking_id, salon_id, rating, comment, photos = [], user_id = "demo-user" } = body ?? {};

  if (!salon_id || !rating) {
    return NextResponse.json({ error: "salon_id and rating required" }, { status: 400 });
  }

  if (booking_id) {
    const existing = await prisma.review.findUnique({ where: { bookingId: booking_id } });
    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }
  }

  const user = await prisma.user.findUnique({ where: { id: user_id } });

  const review = await prisma.review.create({
    data: {
      bookingId: booking_id || null,
      userId: user ? user_id : null,
      salonId: salon_id,
      author: user?.name ?? "Guest",
      rating: Number(rating),
      comment: comment || "",
      photos: JSON.stringify(photos),
      verified: !!booking_id,
    },
  });

  // Recalculate salon aggregate rating
  const agg = await prisma.review.aggregate({
    where: { salonId: salon_id },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.salon.update({
    where: { id: salon_id },
    data: {
      avgRating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
      totalReviews: agg._count,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
