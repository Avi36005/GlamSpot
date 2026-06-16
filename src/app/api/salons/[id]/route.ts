import { NextResponse } from "next/server";
import { getSalon } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const salon = await getSalon(id);
  if (!salon) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ salon });
}
