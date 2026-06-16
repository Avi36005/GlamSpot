import { NextRequest } from "next/server";
import { getSalons } from "@/lib/data";
import { GLAMBOT_SYSTEM } from "@/lib/ai";
import { LOCALITIES, CATEGORIES } from "@/lib/constants";
import type { SalonDTO, ChatMessage } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { fetchGroqChatStream } from "@/lib/groq";

export const runtime = "nodejs";

function sse(obj: unknown) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

/** Heuristic: pick relevant salons from the user's last message. */
async function matchSalons(query: string): Promise<SalonDTO[]> {
  const q = query.toLowerCase();
  const locality = LOCALITIES.find((l) => q.includes(l.toLowerCase()));
  const category = CATEGORIES.find(
    (c) => q.includes(c.key) || q.includes(c.label.toLowerCase())
  );
  const budget = (() => {
    const m = q.match(/(\d{3,6})/);
    return m ? Number(m[1]) : undefined;
  })();

  const all = await getSalons({
    locality: locality ? [locality] : undefined,
    category: category ? [category.key] : undefined,
  });

  let result = all;
  if (budget) result = result.filter((s) => s.priceFrom <= budget);
  if (q.includes("home")) result = result.filter((s) => s.homeService);
  if (q.includes("open")) {
    const h = new Date().getHours();
    result = result.filter((s) => h >= s.openTime && h < s.closeTime);
  }
  if (result.length === 0) result = all;
  return result.slice(0, 3);
}

function heuristicReply(query: string, salons: SalonDTO[]): string {
  if (salons.length === 0) {
    return "I couldn't find a match just yet. Could you tell me the locality and the service you're after?";
  }
  const intro = "Here are a few lovely options I'd recommend:\n";
  const lines = salons
    .map(
      (s) =>
        `• ${s.name} in ${s.locality} — ${s.avgRating.toFixed(1)}★, from ${formatINR(
          s.priceFrom
        )}.`
    )
    .join("\n");
  return `${intro}${lines}\n\nWould you like me to check availability for any of these, or narrow by budget or date?`;
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: ChatMessage[] };
  const lastUser = [...(messages ?? [])].reverse().find((m) => m.role === "user");
  const query = lastUser?.content ?? "";
  const salons = await matchSalons(query);

  const encoder = new TextEncoder();
  const useGroq = !!(process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (o: unknown) => controller.enqueue(encoder.encode(sse(o)));
      try {
        if (useGroq) {
          const res = await fetchGroqChatStream(messages);
          const reader = res.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const parts = buffer.split("\n\n");
              buffer = parts.pop() ?? "";
              for (const part of parts) {
                const line = part.replace(/^data: /, "").trim();
                if (!line || line === "[DONE]") continue;
                try {
                  const json = JSON.parse(line);
                  const token = json?.choices?.[0]?.delta?.content;
                  if (token) send({ type: "token", value: token });
                } catch {
                  /* skip */
                }
              }
            }
          }
        } else {
          // Stream the heuristic reply word-by-word for a live feel.
          const reply = heuristicReply(query, salons);
          for (const word of reply.split(/(\s+)/)) {
            send({ type: "token", value: word });
            await new Promise((r) => setTimeout(r, 18));
          }
        }

        if (salons.length > 0) send({ type: "salons", salons });
        send({ type: "done" });
      } catch (e) {
        send({ type: "token", value: "Sorry, I hit a snag. Please try again." });
        send({ type: "done" });
        console.error("chat error", e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
