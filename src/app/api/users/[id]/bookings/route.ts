import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const scope = (req.nextUrl.searchParams.get("status") ?? "all") as
    | "upcoming"
    | "past"
    | "all";
  const bookings = await getUserBookings(id, scope);
  return NextResponse.json({ bookings });
}
