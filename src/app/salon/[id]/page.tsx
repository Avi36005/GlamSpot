export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getSalon, getSalonReviews } from "@/lib/data";
import { SalonDetail } from "./SalonDetail";

export default async function SalonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [salon, reviews] = await Promise.all([getSalon(id), getSalonReviews(id)]);
  if (!salon) notFound();
  return <SalonDetail salon={salon} reviews={reviews} />;
}
