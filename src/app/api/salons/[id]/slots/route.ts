import { NextRequest, NextResponse } from "next/server";
import { getSlots } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const date = req.nextUrl.searchParams.get("date");
  const serviceId = req.nextUrl.searchParams.get("service_id") ?? undefined;
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  const slots = await getSlots(id, date, serviceId);
  return NextResponse.json({ slots });
}
