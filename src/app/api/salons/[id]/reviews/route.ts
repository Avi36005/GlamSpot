import { NextRequest, NextResponse } from "next/server";
import { getSalonReviews } from "@/lib/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rf = req.nextUrl.searchParams.get("rating_filter");
  const reviews = await getSalonReviews(id, rf ? Number(rf) : undefined);
  return NextResponse.json({ reviews });
}
