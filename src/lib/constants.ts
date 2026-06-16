export const LOCALITIES = [
  "Bandra",
  "Andheri",
  "Juhu",
  "Colaba",
  "Powai",
  "Worli",
  "Dadar",
  "Borivali",
  "Thane",
  "Navi Mumbai",
];

export const CATEGORIES = [
  { key: "hair", label: "Hair", icon: "✂️" },
  { key: "skin", label: "Skin", icon: "✨" },
  { key: "nails", label: "Nails", icon: "💅" },
  { key: "bridal", label: "Bridal", icon: "👰" },
  { key: "spa", label: "Spa", icon: "💆" },
  { key: "threading", label: "Threading", icon: "🪡" },
  { key: "waxing", label: "Waxing", icon: "🌿" },
] as const;

export const SORTS = [
  { key: "relevance", label: "Relevance" },
  { key: "rating", label: "Highest Rated" },
  { key: "price_asc", label: "Price: Low to High" },
  { key: "price_desc", label: "Price: High to Low" },
] as const;

export const MUMBAI_CENTER = { lat: 19.076, lng: 72.8777 };
