"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";
import type { SalonDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { TiltCard } from "@/components/motion/TiltCard";

function useCountdown(minutes: number) {
  const [secs, setSecs] = useState(minutes * 60);
  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const timeString = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const isUrgent = secs < 15 * 60 && secs > 0;
  return { timeString, isUrgent };
}

export function DealCard({
  salon,
  serviceName,
  original,
  deal,
  expiresInMin,
}: {
  salon: SalonDTO;
  serviceName: string;
  original: number;
  deal: number;
  expiresInMin: number;
}) {
  const { timeString, isUrgent } = useCountdown(expiresInMin);
  const off = Math.round((1 - deal / original) * 100);

  return (
    <TiltCard className="group overflow-hidden rounded-2xl border border-line bg-white glow-card preserve-3d">
      <div className="relative aspect-[16/10] overflow-hidden bg-cream preserve-3d" style={{ transform: "translateZ(15px)" }}>
        <Image
          src={salon.coverImage}
          alt={salon.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white" style={{ transform: "translateZ(25px)" }}>
          <Zap size={12} /> {off}% OFF
        </span>
        <span 
          className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur transition-all duration-300 ${
            isUrgent 
              ? "bg-accent text-white animate-pulse shadow-[0_0_12px_rgba(201,24,74,0.5)] font-semibold" 
              : "bg-ink/85 text-white"
          }`} 
          style={{ transform: "translateZ(25px)" }}
        >
          <Clock size={12} className={isUrgent ? "animate-spin-slow" : ""} /> {timeString}
        </span>
      </div>
      <div className="p-4 preserve-3d" style={{ transform: "translateZ(20px)" }}>
        <h3 className="font-sans text-base font-bold text-ink" style={{ transform: "translateZ(25px)" }}>{salon.name}</h3>
        <p className="text-sm text-muted" style={{ transform: "translateZ(22px)" }}>{salon.locality} · {serviceName}</p>
        <div className="mt-3 flex items-end justify-between preserve-3d" style={{ transform: "translateZ(24px)" }}>
          <div className="flex items-baseline gap-2">
            <span className="price text-lg font-bold text-accent">{formatINR(deal)}</span>
            <span className="price text-sm text-muted line-through">{formatINR(original)}</span>
          </div>
          <Link
            href={`/book/${salon.id}`}
            className="rounded-[8px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90 active:scale-95"
            style={{ transform: "translateZ(28px)" }}
          >
            Grab Deal
          </Link>
        </div>
      </div>
    </TiltCard>
  );
}
