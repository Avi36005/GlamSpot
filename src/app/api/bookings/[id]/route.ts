import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const b = await prisma.booking.findUnique({
    where: { id },
    include: { salon: true, service: true, staff: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Enforce ownership
  if (b.userId && b.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    booking: {
      id: b.id,
      salonId: b.salonId,
      salonName: b.salon.name,
      salonAddress: b.salon.address,
      salonImage: b.salon.coverImage,
      serviceName: b.service.name,
      durationMins: b.service.durationMins,
      staffName: b.staff?.name ?? "No preference",
      date: b.date,
      time: b.time,
      status: b.status,
      totalPrice: b.totalPrice,
      paymentMethod: b.paymentMethod,
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      notes: b.notes,
    },
  });
}

// Cancel
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Enforce ownership
  if (booking.userId && booking.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const b = await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ booking: { id: b.id, status: b.status } });
}
