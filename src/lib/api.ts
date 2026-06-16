import type { SalonDTO, BookingDTO, ReviewDTO, StyleResult } from "./types";
import { DEMO_USER_ID } from "@/components/providers";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? res.statusText);
  return res.json();
}

export async function fetchSalons(query: string): Promise<{
  salons: SalonDTO[];
  total: number;
  hasMore: boolean;
}> {
  return j(await fetch(`/api/salons?${query}`));
}

export async function fetchSalon(id: string): Promise<{ salon: SalonDTO }> {
  return j(await fetch(`/api/salons/${id}`));
}

export async function fetchSlots(
  id: string,
  date: string,
  serviceId?: string
): Promise<{ slots: { time: string; available: boolean }[] }> {
  const sp = new URLSearchParams({ date });
  if (serviceId) sp.set("service_id", serviceId);
  return j(await fetch(`/api/salons/${id}/slots?${sp}`));
}

export async function fetchReviews(
  id: string,
  ratingFilter?: number
): Promise<{ reviews: ReviewDTO[] }> {
  const sp = new URLSearchParams();
  if (ratingFilter) sp.set("rating_filter", String(ratingFilter));
  return j(await fetch(`/api/salons/${id}/reviews?${sp}`));
}

export async function createBooking(payload: Record<string, unknown>) {
  return j<{ booking: { id: string } }>(
    await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
  );
}

export async function fetchBooking(id: string) {
  return j<{ booking: Record<string, string | number> }>(
    await fetch(`/api/bookings/${id}`)
  );
}

export async function cancelBooking(id: string) {
  return j(await fetch(`/api/bookings/${id}`, { method: "PATCH" }));
}

export async function fetchUserBookings(
  scope: "upcoming" | "past" | "all"
): Promise<{ bookings: BookingDTO[] }> {
  return j(await fetch(`/api/users/${DEMO_USER_ID}/bookings?status=${scope}`));
}

export async function fetchSavedSalons(): Promise<{ salons: SalonDTO[] }> {
  return j(await fetch(`/api/users/${DEMO_USER_ID}/saved-salons`));
}

export async function submitReview(payload: Record<string, unknown>) {
  return j(
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, user_id: DEMO_USER_ID }),
    })
  );
}

export async function recommendStyle(imageBase64?: string): Promise<StyleResult> {
  return j(
    await fetch("/api/ai/style-recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64 }),
    })
  );
}
