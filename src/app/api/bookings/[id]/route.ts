import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const b = await prisma.booking.findUnique({
    where: { id },
    include: { salon: true, service: true, staff: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const b = await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ booking: { id: b.id, status: b.status } });
}
