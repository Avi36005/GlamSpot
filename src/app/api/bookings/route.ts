import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    user_id = "demo-user",
    salon_id,
    service_id,
    staff_id,
    date,
    time,
    notes = "",
    payment_method = "pay_at_salon",
    customer_name,
    customer_email,
    customer_phone,
  } = body ?? {};

  if (!salon_id || !service_id || !date || !time) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { id: service_id } });
  if (!service) return NextResponse.json({ error: "Invalid service" }, { status: 400 });

  // Guard against a double-book of the same slot
  const clash = await prisma.booking.findFirst({
    where: { salonId: salon_id, date, time, status: { in: ["pending", "confirmed"] } },
  });
  if (clash) {
    return NextResponse.json({ error: "Slot just got booked. Pick another." }, { status: 409 });
  }

  const user = await prisma.user.findUnique({ where: { id: user_id } });

  const booking = await prisma.booking.create({
    data: {
      userId: user ? user_id : null,
      salonId: salon_id,
      serviceId: service_id,
      staffId: staff_id || null,
      customerName: customer_name || user?.name || "Guest",
      customerEmail: customer_email || user?.email || "guest@glamspot.in",
      customerPhone: customer_phone || user?.phone || "",
      date,
      time,
      notes,
      paymentMethod: payment_method,
      paymentStatus: payment_method === "pay_now" ? "paid" : "pending",
      status: "confirmed",
      totalPrice: service.price,
    },
  });

  return NextResponse.json({ booking }, { status: 201 });
}
