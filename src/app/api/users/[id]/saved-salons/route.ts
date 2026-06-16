import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSavedSalons } from "@/lib/data";
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

  const salons = await getSavedSalons(id);
  return NextResponse.json({ salons });
}

export async function POST(
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

  const { salon_id } = await req.json();
  if (!salon_id) return NextResponse.json({ error: "salon_id required" }, { status: 400 });

  // Ensure user exists (demo flow)
  await prisma.user.upsert({
    where: { id },
    update: {},
    create: { id, name: user.name || "Guest", email: user.email },
  });

  const saved = await prisma.savedSalon.upsert({
    where: { userId_salonId: { userId: id, salonId: salon_id } },
    update: {},
    create: { userId: id, salonId: salon_id },
  });
  return NextResponse.json({ saved }, { status: 201 });
}
