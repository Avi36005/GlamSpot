import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSavedSalons } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const salons = await getSavedSalons(id);
  return NextResponse.json({ salons });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { salon_id } = await req.json();
  if (!salon_id) return NextResponse.json({ error: "salon_id required" }, { status: 400 });

  // Ensure user exists (demo flow)
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, name: "Guest", email: `${id}@glamspot.in` },
  });

  const saved = await prisma.savedSalon.upsert({
    where: { userId_salonId: { userId: id, salonId: salon_id } },
    update: {},
    create: { userId: id, salonId: salon_id },
  });
  return NextResponse.json({ saved }, { status: 201 });
}
