import { NextRequest, NextResponse } from "next/server";
import { getSalons } from "@/lib/data";
import { syncGoogleSalons } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const list = (key: string) =>
    sp.get(key) ? sp.get(key)!.split(",").filter(Boolean) : undefined;

  const q = sp.get("q") ?? undefined;
  const localities = list("locality");

  if (q || (localities && localities.length > 0)) {
    try {
      const syncQ = q ?? "";
      const syncLoc = localities && localities.length > 0 ? localities[0] : undefined;
      await syncGoogleSalons(syncQ, syncLoc);
    } catch (e) {
      console.error("Live Google sync failed:", e);
    }
  }

  const salons = await getSalons({
    locality: localities,
    category: list("category"),
    q,
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
