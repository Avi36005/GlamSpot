import type { SalonDTO } from "./types";

type AnySalon = {
  id: string;
  name: string;
  slug: string;
  description: string;
  locality: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  coverImage: string;
  gallery: string;
  avgRating: number;
  totalReviews: number;
  verified: boolean;
  openTime: number;
  closeTime: number;
  homeService: boolean;
  priceFrom: number;
  phone: string;
  services?: {
    id: string;
    name: string;
    category: string;
    durationMins: number;
    price: number;
    description: string;
  }[];
  staff?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    specialisation: string;
    bio: string;
  }[];
};

export function serializeSalon(s: AnySalon): SalonDTO {
  const categories = s.services
    ? Array.from(new Set(s.services.map((sv) => sv.category)))
    : [];
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    locality: s.locality,
    address: s.address,
    city: s.city,
    lat: s.lat,
    lng: s.lng,
    coverImage: s.coverImage,
    gallery: safeParse(s.gallery),
    avgRating: s.avgRating,
    totalReviews: s.totalReviews,
    verified: s.verified,
    openTime: s.openTime,
    closeTime: s.closeTime,
    homeService: s.homeService,
    priceFrom: s.priceFrom,
    phone: s.phone || "",
    categories,
    services: s.services,
    staff: s.staff,
  };
}

function safeParse(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
