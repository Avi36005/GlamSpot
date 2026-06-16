import "server-only";
import { prisma } from "./prisma";
import { serializeSalon } from "./serialize";
import type { SalonDTO, BookingDTO, ReviewDTO } from "./types";
import { addMinutesToTime, seededRandom } from "./utils";
import { Prisma } from "@prisma/client";

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
  page?: number;
  limit?: number;
};

function caseInsensitiveFilter(value: string) {
  const isPostgres = process.env.DATABASE_URL?.startsWith("postgres") || process.env.DATABASE_URL?.startsWith("postgresql");
  return {
    contains: value,
    ...(isPostgres ? { mode: "insensitive" } : {}),
  } as any;
}

function buildWhereClause(filters: SalonFilters): Prisma.SalonWhereInput {
  const where: Prisma.SalonWhereInput = {};

  if (filters.locality?.length) {
    where.OR = filters.locality.flatMap((l) => [
      { locality: caseInsensitiveFilter(l) },
      { city: caseInsensitiveFilter(l) },
    ]);
  }

  if (filters.category?.length) {
    where.services = {
      some: {
        category: { in: filters.category },
      },
    };
  }

  if (filters.q) {
    const q = filters.q.trim();
    const searchConditions: Prisma.SalonWhereInput[] = [
      { name: caseInsensitiveFilter(q) },
      { locality: caseInsensitiveFilter(q) },
      { city: caseInsensitiveFilter(q) },
      { address: caseInsensitiveFilter(q) },
      {
        services: {
          some: {
            OR: [
              { name: caseInsensitiveFilter(q) },
              { category: caseInsensitiveFilter(q) }
            ]
          }
        }
      }
    ];

    if (where.OR) {
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions }
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  if (typeof filters.priceMin === "number" || typeof filters.priceMax === "number") {
    where.priceFrom = {
      ...(typeof filters.priceMin === "number" ? { gte: filters.priceMin } : {}),
      ...(typeof filters.priceMax === "number" ? { lte: filters.priceMax } : {}),
    };
  }

  if (typeof filters.minRating === "number") {
    where.avgRating = { gte: filters.minRating };
  }

  if (filters.homeService) {
    where.homeService = true;
  }

  if (filters.openNow) {
    const h = new Date().getHours();
    where.openTime = { lte: h };
    where.closeTime = { gt: h };
  }

  return where;
}

export async function getSalons(filters: SalonFilters = {}): Promise<SalonDTO[]> {
  const where = buildWhereClause(filters);

  let orderBy: Prisma.SalonOrderByWithRelationInput | Prisma.SalonOrderByWithRelationInput[] = { avgRating: "desc" };

  switch (filters.sort) {
    case "price_asc":
      orderBy = { priceFrom: "asc" };
      break;
    case "price_desc":
      orderBy = { priceFrom: "desc" };
      break;
    case "rating":
      orderBy = { avgRating: "desc" };
      break;
    default:
      orderBy = [
        { verified: "desc" },
        { avgRating: "desc" },
      ];
  }

  const take = filters.limit;
  const skip = filters.page && filters.limit ? (filters.page - 1) * filters.limit : undefined;

  const salons = await prisma.salon.findMany({
    where,
    orderBy,
    include: { services: true },
    ...(take !== undefined ? { take } : {}),
    ...(skip !== undefined ? { skip } : {}),
  });

  return salons.map(serializeSalon);
}

export async function getSalonsCount(filters: SalonFilters = {}): Promise<number> {
  const where = buildWhereClause(filters);
  return prisma.salon.count({ where });
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

export async function getSlots(salonId: string, date: string, serviceId?: string, staffId?: string) {
  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: { services: true, staff: true },
  });
  if (!salon) return [];

  const service = serviceId
    ? salon.services.find((s) => s.id === serviceId)
    : salon.services[0];
  const step = service ? Math.max(30, Math.round(service.durationMins / 15) * 15) : 45;

  const bookings = await prisma.booking.findMany({
    where: { salonId, date, status: { in: ["pending", "confirmed"] } },
  });

  const isPast = date < new Date().toISOString().slice(0, 10);
  const nowH = new Date().getHours();
  const isToday = date === new Date().toISOString().slice(0, 10);

  const slots: { time: string; available: boolean }[] = [];
  let t = `${String(salon.openTime).padStart(2, "0")}:00`;
  const totalStaffCount = salon.staff.length || 1;

  while (parseInt(t) < salon.closeTime) {
    const rand = seededRandom(`${salonId}-${date}-${t}`);
    const preBooked = rand < 0.2; // 20% organic pre-booked fallback for visual realism
    const past = isPast || (isToday && parseInt(t) <= nowH);
    
    let available = !past;

    if (available) {
      if (staffId) {
        const isStaffBooked = bookings.some((b) => b.staffId === staffId && b.time === t);
        available = !isStaffBooked && !preBooked;
      } else {
        const activeBookingsCount = bookings.filter((b) => b.time === t).length;
        available = activeBookingsCount < totalStaffCount && !preBooked;
      }
    }

    slots.push({ time: t, available });
    t = addMinutesToTime(t, step);
  }
  return slots;
}

export async function getDeals(): Promise<
  { salon: SalonDTO; serviceName: string; original: number; deal: number; expiresInMin: number }[]
> {
  const salons = await prisma.salon.findMany({
    take: 3,
    include: { services: true },
    orderBy: [
      { verified: "desc" },
      { avgRating: "desc" },
    ],
  });
  return salons.map((s, i) => {
    const dto = serializeSalon(s);
    const svc = s.services[i % s.services.length] || { name: "Special Service", price: 500 };
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
