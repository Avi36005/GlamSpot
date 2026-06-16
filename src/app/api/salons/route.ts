import { NextRequest, NextResponse } from "next/server";
import { getSalons, getSalonsCount } from "@/lib/data";
import { syncGoogleSalons } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const list = (key: string) =>
    sp.get(key) ? sp.get(key)!.split(",").filter(Boolean) : undefined;

  const q = sp.get("q") ?? undefined;
  const localities = list("locality");

  // Run Google Places sync in the background without blocking the query response
  if (q || (localities && localities.length > 0)) {
    const syncQ = q ?? "";
    const syncLoc = localities && localities.length > 0 ? localities[0] : undefined;
    syncGoogleSalons(syncQ, syncLoc).catch((e) => {
      console.error("Live Google sync background error:", e);
    });
  }

  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const limit = Math.max(1, Number(sp.get("limit") ?? 12));

  const filterParams = {
    locality: localities,
    category: list("category"),
    q,
    priceMin: sp.get("price_min") ? Number(sp.get("price_min")) : undefined,
    priceMax: sp.get("price_max") ? Number(sp.get("price_max")) : undefined,
    minRating: sp.get("min_rating") ? Number(sp.get("min_rating")) : undefined,
    openNow: sp.get("open_now") === "true",
    homeService: sp.get("home_service") === "true",
    sort: sp.get("sort") ?? "relevance",
    page,
    limit,
  };

  const [pagedSalons, totalCount] = await Promise.all([
    getSalons(filterParams),
    getSalonsCount(filterParams),
  ]);

  return NextResponse.json({
    salons: pagedSalons,
    total: totalCount,
    page,
    limit,
    hasMore: (page - 1) * limit + pagedSalons.length < totalCount,
  });
}
