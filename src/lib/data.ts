import "server-only";
import { prisma } from "./prisma";
import { serializeSalon } from "./serialize";
import type { SalonDTO, BookingDTO, ReviewDTO } from "./types";
import { addMinutesToTime, seededRandom } from "./utils";

export type SalonFilters = {
  locality?: string[];
  category?: string[];
  priceMin?: number;
  priceMax?: number;
  minRating?: number;
  openNow?: boolean;
  homeService?: boolean;
  sort?: string;
  q?: string;
};

export async function getSalons(filters: SalonFilters = {}): Promise<SalonDTO[]> {
  const salons = await prisma.salon.findMany({
    include: { services: true },
    orderBy: { avgRating: "desc" },
  });

  let result = salons.map(serializeSalon);

  if (filters.locality?.length) {
    result = result.filter((s) =>
      filters.locality!.some(
        (l) =>
          s.locality.toLowerCase().includes(l.toLowerCase()) ||
          s.city.toLowerCase().includes(l.toLowerCase())
      )
    );
  }
  if (filters.category?.length) {
    result = result.filter((s) =>
      s.categories.some((c) => filters.category!.includes(c))
    );
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.categories.some((c) => c.includes(q)) ||
        (s.services ?? []).some((sv) => sv.name.toLowerCase().includes(q))
    );
  }
  if (typeof filters.priceMin === "number") {
    result = result.filter((s) => s.priceFrom >= filters.priceMin!);
  }
  if (typeof filters.priceMax === "number") {
    result = result.filter((s) => s.priceFrom <= filters.priceMax!);
  }
  if (filters.minRating) {
    result = result.filter((s) => s.avgRating >= filters.minRating!);
  }
  if (filters.homeService) {
    result = result.filter((s) => s.homeService);
  }
  if (filters.openNow) {
    const h = new Date().getHours();
    result = result.filter((s) => h >= s.openTime && h < s.closeTime);
  }

  switch (filters.sort) {
    case "price_asc":
      result.sort((a, b) => a.priceFrom - b.priceFrom);
      break;
    case "price_desc":
      result.sort((a, b) => b.priceFrom - a.priceFrom);
      break;
    case "rating":
      result.sort((a, b) => b.avgRating - a.avgRating);
      break;
    default:
      // relevance: featured-ish = verified + rating
      result.sort(
        (a, b) => Number(b.verified) * 0.3 + b.avgRating - (Number(a.verified) * 0.3 + a.avgRating)
      );
  }

  return result;
}

export async function getSalon(id: string): Promise<SalonDTO | null> {
  const salon = await prisma.salon.findUnique({
    where: { id },
    include: { services: true, staff: true },
  });
  if (!salon) return null;
  return serializeSalon(salon);
}

export async function getSalonReviews(
  salonId: string,
  ratingFilter?: number
): Promise<ReviewDTO[]> {
  const reviews = await prisma.review.findMany({
    where: { salonId, ...(ratingFilter ? { rating: ratingFilter } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return reviews.map((r) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    photos: safeArr(r.photos),
    verified: r.verified,
    createdAt: r.createdAt.toISOString(),
  }));
}

/**
 * Slot generation is derived (no slots table): generate the salon's daily grid,
 * then mark slots booked if a confirmed booking exists, plus a deterministic
 * "pre-booked" pattern (~30%) for realism.
 */
export async function getSlots(salonId: string, date: string, serviceId?: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: { services: true },
  });
  if (!salon) return [];

  const service = serviceId
    ? salon.services.find((s) => s.id === serviceId)
    : salon.services[0];
  const step = service ? Math.max(30, Math.round(service.durationMins / 15) * 15) : 45;

  const bookings = await prisma.booking.findMany({
    where: { salonId, date, status: { in: ["pending", "confirmed"] } },
  });
  const bookedTimes = new Set(bookings.map((b) => b.time));

  const isPast = date < new Date().toISOString().slice(0, 10);
  const nowH = new Date().getHours();
  const isToday = date === new Date().toISOString().slice(0, 10);

  const slots: { time: string; available: boolean }[] = [];
  let t = `${String(salon.openTime).padStart(2, "0")}:00`;
  while (parseInt(t) < salon.closeTime) {
    const rand = seededRandom(`${salonId}-${date}-${t}`);
    const preBooked = rand < 0.3;
    const past = isPast || (isToday && parseInt(t) <= nowH);
    const available = !preBooked && !bookedTimes.has(t) && !past;
    slots.push({ time: t, available });
    t = addMinutesToTime(t, step);
  }
  return slots;
}

export async function getDeals(): Promise<
  { salon: SalonDTO; serviceName: string; original: number; deal: number; expiresInMin: number }[]
> {
  const salons = await prisma.salon.findMany({ include: { services: true } });
  const picks = salons.slice(0, 3);
  return picks.map((s, i) => {
    const dto = serializeSalon(s);
    const svc = s.services[i % s.services.length];
    const original = svc.price;
    const deal = Math.round((original * (i === 0 ? 0.6 : i === 1 ? 0.7 : 0.75)) / 10) * 10;
    return {
      salon: dto,
      serviceName: svc.name,
      original,
      deal,
      expiresInMin: [12, 95, 180][i] ?? 120,
    };
  });
}

export async function getUserBookings(
  userId: string,
  scope: "upcoming" | "past" | "all" = "all"
): Promise<BookingDTO[]> {
  const today = new Date().toISOString().slice(0, 10);
  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { salon: true, service: true, staff: true, review: true },
    orderBy: [{ date: "desc" }, { time: "desc" }],
  });

  return bookings
    .filter((b) => {
      if (scope === "upcoming") return b.date >= today && b.status !== "cancelled" && b.status !== "completed";
      if (scope === "past") return b.date < today || b.status === "completed" || b.status === "cancelled";
      return true;
    })
    .map((b) => ({
      id: b.id,
      salonId: b.salonId,
      salonName: b.salon.name,
      salonImage: b.salon.coverImage,
      salonAddress: b.salon.address,
      serviceName: b.service.name,
      staffName: b.staff?.name ?? null,
      date: b.date,
      time: b.time,
      status: b.status,
      totalPrice: b.totalPrice,
      hasReview: !!b.review,
    }));
}

export async function getSavedSalons(userId: string): Promise<SalonDTO[]> {
  const saved = await prisma.savedSalon.findMany({
    where: { userId },
    include: { salon: { include: { services: true } } },
  });
  return saved.map((s) => serializeSalon(s.salon));
}

function safeArr(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
