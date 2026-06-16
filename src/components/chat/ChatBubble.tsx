"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import type { SalonDTO } from "@/lib/types";
import { SalonCardCompact } from "@/components/salon/SalonCard";
import { cn } from "@/lib/utils";

export function ChatBubble({
  role,
  children,
  salons,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
  salons?: SalonDTO[];
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white">
          <Sparkles size={15} />
        </span>
      )}
      <div className={cn("max-w-[85%] space-y-3", isUser && "items-end")}>
        <div
          className={cn(
            "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-br-sm bg-accent text-white"
              : "rounded-bl-sm border border-line bg-white text-ink"
          )}
        >
          {children}
        </div>
        {salons && salons.length > 0 && (
          <div className="space-y-2">
            {salons.map((s) => (
              <SalonCardCompact key={s.id} salon={s} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex gap-3">
      <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white">
        <Sparkles size={15} />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-line bg-white px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot h-1.5 w-1.5 rounded-full bg-faint"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
