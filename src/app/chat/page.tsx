"use client";

import { useRef, useState, useEffect } from "react";
import { Sparkles, Send, Zap } from "lucide-react";
import type { ChatMessage, SalonDTO } from "@/lib/types";
import { ChatBubble, TypingBubble } from "@/components/chat/ChatBubble";

type Msg = ChatMessage & { salons?: SalonDTO[] };

const SUGGESTIONS = [
  "Bridal package under ₹5000 in Bandra",
  "Hair spa near Andheri West",
  "Home service today evening in Powai",
  "Best nail art salon in Colaba",
  "What salons are open right now?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const userMsg: Msg = { role: "user", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setBusy(true);

    // placeholder assistant message we stream into
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let salons: SalonDTO[] | undefined;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.replace(/^data: /, "").trim();
            if (!line) continue;
            try {
              const evt = JSON.parse(line);
              if (evt.type === "token") {
                acc += evt.value;
                setMessages((m) => {
                  const copy = [...m];
                  copy[copy.length - 1] = { role: "assistant", content: acc, salons };
                  return copy;
                });
              } else if (evt.type === "salons") {
                salons = evt.salons;
                setMessages((m) => {
                  const copy = [...m];
                  copy[copy.length - 1] = { role: "assistant", content: acc, salons };
                  return copy;
                });
              }
            } catch {
              /* skip */
            }
          }
        }
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Sorry, I hit a snag. Please try again." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-5 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line py-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white">
          <Sparkles size={18} />
        </span>
        <div>
          <h1 className="font-display text-lg font-semibold text-ink">GlamBot</h1>
          <p className="text-xs text-muted">
            Your AI booking assistant ·{" "}
            <span className="inline-flex items-center gap-0.5 text-faint">
              <Zap size={11} /> Powered by Groq
            </span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto py-6">
        {empty ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-highlight text-accent">
                <Sparkles size={28} />
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
                Hi! I&apos;m GlamBot
              </h2>
              <p className="mt-2 text-muted">
                Tell me what you&apos;re looking for and I&apos;ll find the perfect Mumbai salon.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <ChatBubble key={i} role={m.role} salons={m.salons}>
              {m.content || (busy && i === messages.length - 1 ? "…" : "")}
            </ChatBubble>
          ))
        )}
        {busy && messages[messages.length - 1]?.content === "" && <TypingBubble />}
      </div>

      {/* Suggestions */}
      {empty && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-line py-4">
        <div className="flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask GlamBot anything…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={busy || !input.trim()}
            className="grid h-9 w-9 place-items-center rounded-full bg-accent text-white transition-colors hover:bg-accent-dark disabled:opacity-40"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
