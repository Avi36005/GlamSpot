import { NextRequest, NextResponse } from "next/server";
import { recommendStyle } from "@/lib/ai";
import { getSalons } from "@/lib/data";
import type { StyleResult } from "@/lib/types";

export async function POST(req: NextRequest) {
  let imageBase64: string | undefined;
  try {
    const body = await req.json();
    imageBase64 = body?.image_base64;
  } catch {
    /* allow empty body */
  }

  const core = await recommendStyle(imageBase64);

  // Match Mumbai salons whose services relate to the recommended styles.
  const allSalons = await getSalons();
  const keywords = ["hair", "cut", "color", "colour", "spa", "style", "keratin"];
  const styleWords = core.styles
    .flatMap((s) => s.name.toLowerCase().split(/\s+/))
    .concat(keywords);

  const scored = allSalons
    .map((s) => {
      const text = (s.services ?? []).map((sv) => sv.name.toLowerCase()).join(" ");
      const score =
        styleWords.filter((w) => text.includes(w)).length + s.avgRating / 5;
      return { s, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => x.s);

  const result: StyleResult = {
    ...core,
    matched_salons: scored,
  };

  return NextResponse.json(result);
}
