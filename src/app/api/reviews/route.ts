import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { booking_id, salon_id, rating, comment, photos = [] } = body ?? {};

  if (!salon_id || !rating) {
    return NextResponse.json({ error: "salon_id and rating required" }, { status: 400 });
  }

  if (booking_id) {
    const existing = await prisma.review.findUnique({ where: { bookingId: booking_id } });
    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
    }
  }

  // Ensure user exists (demo flow)
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: { id: user.id, name: user.name || "Guest", email: user.email },
  });

  const review = await prisma.review.create({
    data: {
      bookingId: booking_id || null,
      userId: dbUser.id,
      salonId: salon_id,
      author: dbUser.name || "Guest",
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
