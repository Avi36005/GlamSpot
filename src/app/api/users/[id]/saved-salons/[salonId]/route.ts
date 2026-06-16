import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; salonId: string }> }
) {
  const { id, salonId } = await params;
  await prisma.savedSalon
    .delete({ where: { userId_salonId: { userId: id, salonId } } })
    .catch(() => {});
  return new NextResponse(null, { status: 204 });
}
