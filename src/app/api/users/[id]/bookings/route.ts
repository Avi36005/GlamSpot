import { NextRequest, NextResponse } from "next/server";
import { getUserBookings } from "@/lib/data";
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
  if (id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const scope = (req.nextUrl.searchParams.get("status") ?? "all") as
    | "upcoming"
    | "past"
    | "all";
  const bookings = await getUserBookings(id, scope);
  return NextResponse.json({ bookings });
}
