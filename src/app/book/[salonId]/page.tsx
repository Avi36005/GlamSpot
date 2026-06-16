import { Suspense } from "react";
import { BookingFlow } from "./BookingFlow";

export default async function BookPage({
  params,
}: {
  params: Promise<{ salonId: string }>;
}) {
  const { salonId } = await params;
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-5 py-20 text-center text-muted">Loading…</div>}>
      <BookingFlow salonId={salonId} />
    </Suspense>
  );
}
