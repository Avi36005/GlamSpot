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

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const service = await tx.service.findUnique({ where: { id: service_id } });
      if (!service) {
        throw new Error("INVALID_SERVICE");
      }

      const salon = await tx.salon.findUnique({
        where: { id: salon_id },
        include: { staff: true },
      });
      if (!salon) {
        throw new Error("INVALID_SALON");
      }

      // Check slot availability at the exact date and time
      const existingBookings = await tx.booking.findMany({
        where: {
          salonId: salon_id,
          date,
          time,
          status: { in: ["pending", "confirmed"] },
        },
      });

      let assignedStaffId: string | null = null;

      if (staff_id) {
        const staffExists = salon.staff.some((s) => s.id === staff_id);
        if (!staffExists) {
          throw new Error("INVALID_STAFF");
        }

        const isBooked = existingBookings.some((b) => b.staffId === staff_id);
        if (isBooked) {
          throw new Error("SLOT_CLASH");
        }
        assignedStaffId = staff_id;
      } else {
        // Find any stylist who is not booked at this slot time
        const freeStaff = salon.staff.find((st) => !existingBookings.some((b) => b.staffId === st.id));
        if (!freeStaff) {
          throw new Error("SLOT_CLASH");
        }
        assignedStaffId = freeStaff.id;
      }

      const user = await tx.user.findUnique({ where: { id: user_id } });

      return tx.booking.create({
        data: {
          userId: user ? user_id : null,
          salonId: salon_id,
          serviceId: service_id,
          staffId: assignedStaffId,
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
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: any) {
    console.error("Booking error:", err);
    if (err.message === "INVALID_SERVICE") {
      return NextResponse.json({ error: "Invalid service selected" }, { status: 400 });
    }
    if (err.message === "INVALID_SALON") {
      return NextResponse.json({ error: "Invalid salon selected" }, { status: 400 });
    }
    if (err.message === "INVALID_STAFF") {
      return NextResponse.json({ error: "Invalid staff member selected" }, { status: 400 });
    }
    if (err.message === "SLOT_CLASH") {
      return NextResponse.json({ error: "This slot is no longer available. Please choose another." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
