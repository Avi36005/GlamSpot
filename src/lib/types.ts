export type ServiceDTO = {
  id: string;
  name: string;
  category: string;
  durationMins: number;
  price: number;
  description: string;
};

export type StaffDTO = {
  id: string;
  name: string;
  avatarUrl: string | null;
  specialisation: string;
  bio: string;
};

export type ReviewDTO = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  photos: string[];
  verified: boolean;
  createdAt: string;
};

export type SalonDTO = {
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
  gallery: string[];
  avgRating: number;
  totalReviews: number;
  verified: boolean;
  openTime: number;
  closeTime: number;
  homeService: boolean;
  priceFrom: number;
  phone: string;
  categories: string[];
  services?: ServiceDTO[];
  staff?: StaffDTO[];
};

export type BookingDTO = {
  id: string;
  salonId: string;
  salonName: string;
  salonImage: string;
  salonAddress: string;
  serviceName: string;
  staffName: string | null;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  hasReview: boolean;
};

export type ReviewSummary = {
  best_for: string[];
  strengths: string[];
  watch_out: string[];
  source: "ai" | "heuristic";
};

export type StyleResult = {
  face_shape: string;
  styles: { name: string; reason: string }[];
  colours: { name: string; hex: string; reason: string }[];
  matched_salons: SalonDTO[];
  source: "ai" | "heuristic";
};

export type ChatMessage = { role: "user" | "assistant"; content: string };
