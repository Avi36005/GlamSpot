import { NextRequest, NextResponse } from "next/server";
import { getSalons } from "@/lib/data";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const list = (key: string) =>
    sp.get(key) ? sp.get(key)!.split(",").filter(Boolean) : undefined;

  const salons = await getSalons({
    locality: list("locality"),
    category: list("category"),
    q: sp.get("q") ?? undefined,
    priceMin: sp.get("price_min") ? Number(sp.get("price_min")) : undefined,
    priceMax: sp.get("price_max") ? Number(sp.get("price_max")) : undefined,
    minRating: sp.get("min_rating") ? Number(sp.get("min_rating")) : undefined,
    openNow: sp.get("open_now") === "true",
    homeService: sp.get("home_service") === "true",
    sort: sp.get("sort") ?? "relevance",
  });

  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.max(1, Number(sp.get("limit") ?? 12));
  const start = (page - 1) * limit;
  const paged = salons.slice(start, start + limit);

  return NextResponse.json({
    salons: paged,
    total: salons.length,
    page,
    limit,
    hasMore: start + limit < salons.length,
  });
}
