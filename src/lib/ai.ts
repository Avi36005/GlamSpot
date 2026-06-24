import "server-only";
import type { ReviewSummary } from "./types";
import { fetchGroqCompletion } from "./groq";

/**
 * AI provider layer.
 *
 * Each function calls the real model when the relevant API key is present in the
 * environment, and otherwise falls back to a deterministic heuristic so the
 * product is fully demoable with zero keys. Drop keys into .env to go live.
 */

export const aiStatus = () => ({
  gemini: !!process.env.GEMINI_API_KEY,
  groq: !!(process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY),
});

function extractJson<T>(text: string): T | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Review summary — Groq Llama 3.3 70B (fallback: heuristic)          */
/* ------------------------------------------------------------------ */

export async function summarizeReviews(
  salonName: string,
  reviews: { rating: number; comment: string }[]
): Promise<ReviewSummary | null> {
  if (reviews.length < 3) return null;

  if (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY) {
    try {
      const reviewsText = reviews
        .map((r, i) => `${i + 1}. (${r.rating}/5) ${r.comment}`)
        .join("\n");
      const prompt = `You are summarising reviews for ${salonName}, a beauty salon in Mumbai. Here are ${reviews.length} customer reviews:\n${reviewsText}\n\nProduce a summary with exactly 3 sections. Return ONLY valid JSON: { "best_for": [string, string], "strengths": [string, string], "watch_out": [string] }. Each item is a short phrase (max 8 words). Be honest and balanced.`;
      const text = await fetchGroqCompletion(
        [{ role: "user", content: prompt }],
        { temperature: 0.4, jsonMode: true }
      );
      const parsed = text ? extractJson<Omit<ReviewSummary, "source">>(text) : null;
      if (parsed?.best_for && parsed?.strengths && parsed?.watch_out) {
        return { ...parsed, source: "ai" };
      }
    } catch (e) {
      console.error("Groq review summary failed, using fallback", e);
    }
  }

  return heuristicReviewSummary(salonName, reviews);
}

function heuristicReviewSummary(
  salonName: string,
  reviews: { rating: number; comment: string }[]
): ReviewSummary {
  const avg = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  const text = reviews.map((r) => r.comment.toLowerCase()).join(" ");
  const has = (w: string) => text.includes(w);

  const best_for: string[] = [];
  if (has("haircut") || has("cut") || has("stylist")) best_for.push("Precision haircuts & styling");
  if (has("bridal") || has("makeup")) best_for.push("Bridal & party makeup");
  if (has("relax") || has("spa") || has("pamper")) best_for.push("Relaxing spa sessions");
  if (has("nail")) best_for.push("Manicures & nail art");
  while (best_for.length < 2) best_for.push("First-time salon visits");

  const strengths: string[] = [];
  if (has("warm") || has("friendly") || has("listen")) strengths.push("Warm, attentive staff");
  if (has("clean") || has("professional")) strengths.push("Clean & professional");
  if (has("time") || has("effortless") || has("easy")) strengths.push("On time & easy booking");
  if (has("result") || has("perfect") || has("happy")) strengths.push("Consistently great results");
  while (strengths.length < 2) strengths.push("Skilled, trained team");

  const watch_out: string[] = [];
  if (has("wait") || has("crowded") || has("weekend")) watch_out.push("Can get busy on weekends");
  else if (has("pricier") || has("price")) watch_out.push("Premium pricing");
  else watch_out.push(avg >= 4.6 ? "Book early — slots fill fast" : "Service can vary by stylist");

  return {
    best_for: best_for.slice(0, 2),
    strengths: strengths.slice(0, 2),
    watch_out: watch_out.slice(0, 1),
    source: "heuristic",
  };
}

/* ------------------------------------------------------------------ */
/* Style recommender — Gemini 1.5 Flash vision (fallback: heuristic)  */
/* ------------------------------------------------------------------ */

export type StyleCore = {
  face_shape: string;
  styles: { name: string; reason: string }[];
  colours: { name: string; hex: string; reason: string }[];
  source: "ai" | "heuristic";
};

export async function recommendStyle(imageBase64?: string): Promise<StyleCore> {
  if (process.env.GEMINI_API_KEY && imageBase64) {
    try {
      const clean = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const prompt =
        'Analyse the face shape and features in this image. Suggest 5 specific hairstyle names and 3 hair colour options that would suit this person. For each style give a 1-sentence reason. Return ONLY valid JSON with this structure: { "face_shape": string, "styles": [{"name": string, "reason": string}], "colours": [{"name": string, "hex": string, "reason": string}] }';
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: "image/jpeg", data: clean } },
                ],
              },
            ],
          }),
        }
      );
      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = extractJson<Omit<StyleCore, "source">>(text);
      if (parsed?.face_shape && parsed?.styles?.length) {
        return { ...parsed, source: "ai" };
      }
    } catch (e) {
      console.error("Gemini style recommend failed, using fallback", e);
    }
  }
  return heuristicStyle(imageBase64);
}

function heuristicStyle(seed?: string): StyleCore {
  const shapes = ["Oval", "Round", "Heart", "Square", "Oblong"];
  const idx = seed ? seed.length % shapes.length : Math.floor(Math.random() * shapes.length);
  const face = shapes[idx];

  const byShape: Record<string, { name: string; reason: string }[]> = {
    Oval: [
      { name: "Layered Lob", reason: "Balances your proportions and adds soft movement." },
      { name: "Curtain Bangs", reason: "Frames the face without hiding your even features." },
      { name: "Beach Waves", reason: "Effortless texture that suits an oval shape beautifully." },
      { name: "Sleek Straight Cut", reason: "Shows off your balanced bone structure." },
      { name: "Side-Swept Pixie", reason: "Bold yet flattering on versatile oval faces." },
    ],
    Round: [
      { name: "Long Layers", reason: "Adds length to visually slim a rounder face." },
      { name: "Side-Parted Lob", reason: "Creates angles that elongate the face." },
      { name: "High Volume Top", reason: "Lift at the crown adds flattering height." },
      { name: "Face-Framing Highlights", reason: "Draws the eye downward for a slimmer look." },
      { name: "Asymmetric Bob", reason: "Sharp lines counter soft round curves." },
    ],
    Heart: [
      { name: "Chin-Length Bob", reason: "Adds width at the jaw to balance a wider forehead." },
      { name: "Soft Curtain Bangs", reason: "Softens the forehead and highlights the eyes." },
      { name: "Textured Shag", reason: "Volume around the jawline balances heart shapes." },
      { name: "Low Side Bun", reason: "Elegant and balances your delicate chin." },
      { name: "Wavy Mid-Length", reason: "Adds fullness exactly where you need it." },
    ],
    Square: [
      { name: "Soft Layers", reason: "Rounds off a strong, angular jawline." },
      { name: "Side-Swept Fringe", reason: "Softens the forehead and adds movement." },
      { name: "Long Waves", reason: "Curves counterbalance defined square angles." },
      { name: "Rounded Bob", reason: "Gentle curves flatter a structured face." },
      { name: "Tousled Updo", reason: "Soft texture offsets sharp features." },
    ],
    Oblong: [
      { name: "Blunt Bob", reason: "Adds width to balance a longer face." },
      { name: "Full Fringe", reason: "Shortens the appearance of face length." },
      { name: "Voluminous Curls", reason: "Width and bounce flatter oblong shapes." },
      { name: "Shoulder-Length Layers", reason: "Keeps focus horizontal, not vertical." },
      { name: "Soft Side Part", reason: "Breaks up length for a balanced look." },
    ],
  };

  const colours = [
    { name: "Espresso Brown", hex: "#3b2417", reason: "A rich, universally flattering everyday shade." },
    { name: "Warm Caramel", hex: "#a9743b", reason: "Adds warmth and dimension under Mumbai light." },
    { name: "Soft Auburn", hex: "#7a3b2e", reason: "A subtle red lift that brightens the complexion." },
  ];

  return { face_shape: face, styles: byShape[face], colours, source: "heuristic" };
}

/* ------------------------------------------------------------------ */
/* Chat — Groq Llama 3.3 70B (fallback: heuristic recommender)        */
/* ------------------------------------------------------------------ */

export const GLAMBOT_SYSTEM = `You are GlamBot, a warm and knowledgeable AI assistant for GlamSpot Mumbai. Help users find salons and book appointments. You know Mumbai localities well: Bandra, Andheri, Juhu, Colaba, Worli, Powai, Dadar, Borivali, Thane, Navi Mumbai. When a user describes what they want (service type, budget, location, date/time preference), extract these details and suggest 2-3 salons by name with a brief reason for each. Keep responses concise (under 100 words). Always end with a question to narrow down their needs or offer to help them book.`;
