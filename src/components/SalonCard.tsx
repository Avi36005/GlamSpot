"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Heart, BadgeCheck, MapPin, Star, Home, Zap, Flame } from "lucide-react";
import type { SalonDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { Badge } from "./ui";
import { useSaved } from "./providers";
import { TiltCard } from "@/components/motion/TiltCard";

function catLabel(key: string) {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function getTravelTimeHint(locality: string) {
  const loc = locality.toLowerCase();
  if (loc.includes("bandra")) return "~5 min from Bandra West";
  if (loc.includes("juhu")) return "~12 min from Bandra West";
  if (loc.includes("andheri")) return "~20 min from Bandra West";
  if (loc.includes("worli")) return "~15 min from Bandra (via Sea Link)";
  if (loc.includes("colaba")) return "~35 min from Bandra West";
  if (loc.includes("powai")) return "~25 min from Bandra West";
  if (loc.includes("lower parel")) return "~18 min from Bandra West";
  return "~15 min away";
}

function getSeasonalBadge(salonName: string, index: number) {
  const badges = [
    { label: "Bridal Season 🌸", tone: "accent" },
    { label: "Diwali-Ready ✦", tone: "neutral" },
    { label: "Monsoon Hair Care ☔", tone: "neutral" },
  ];
  const idx = (salonName.length + index) % 4;
  if (idx < 3) {
    return badges[idx];
  }
  return null;
}

export function SalonCard({ salon, index = 0 }: { salon: SalonDTO; index?: number }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(salon.id);
  const seasonal = getSeasonalBadge(salon.name, index);

  // Deterministic social proof and scarcity metrics based on name/id
  const bookedCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < salon.name.length; i++) {
      hash = salon.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 90) + 40; // 40-130 bookings
  }, [salon.name]);

  const slotsCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < salon.id.length; i++) {
      hash = salon.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 4) + 2; // 2-5 slots left
  }, [salon.id]);

  const viewCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < salon.locality.length; i++) {
      hash = salon.locality.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 25) + 12; // 12-37 views today
  }, [salon.locality]);

  const trustBadge = useMemo(() => {
    const badges = [
      { label: "Popular Today", icon: Flame },
      { label: "Instant Booking", icon: Zap },
      { label: "Verified Partner", icon: BadgeCheck },
    ];
    const idx = (salon.name.length + index) % 3;
    return badges[idx];
  }, [salon.name, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 4) * 0.06 }}
      className="h-full"
    >
      <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white hover:-translate-y-2 hover:shadow-[0_25px_50px_rgba(0,0,0,0.07)] transition-all duration-300 preserve-3d">
        <Link
          href={`/salon/${salon.id}`}
          className="relative block aspect-[4/3] overflow-hidden rounded-t-2xl bg-cream preserve-3d"
          style={{ transform: "translateZ(15px)" }}
        >
          <Image
            src={salon.coverImage}
            alt={salon.name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
          
          {/* Overlaid Trust Badges (Top Left) */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10 preserve-3d" style={{ transform: "translateZ(25px)" }}>
            <Badge 
              tone="accent" 
              className="border-none font-bold px-2.5 py-1 text-[9px] uppercase tracking-wider shadow-sm gap-1 inline-flex items-center"
            >
              {(() => {
                const Icon = trustBadge.icon;
                return <Icon size={10} className="text-white shrink-0" />;
              })()}
              <span>{trustBadge.label}</span>
            </Badge>
            {salon.homeService && (
              <Badge 
                tone="ink" 
                className="backdrop-blur bg-ink/75 border-none text-white px-2.5 py-1 text-[9px] uppercase tracking-wider shadow-sm gap-1 inline-flex items-center"
              >
                <Home size={10} className="text-white shrink-0" />
                <span>Home service</span>
              </Badge>
            )}
          </div>

          {/* Rating Badge (Top Right) */}
          <div 
            className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-bold text-ink shadow-sm backdrop-blur z-10 preserve-3d"
            style={{ transform: "translateZ(25px)" }}
          >
            <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
            <span>{salon.avgRating.toFixed(1)}</span>
          </div>

          {/* Saved Heart Button (Bottom Right) */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(salon.id);
            }}
            aria-label={saved ? "Remove from saved" : "Save salon"}
            whileTap={{ scale: 0.9 }}
            className="absolute right-3 bottom-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur hover:bg-white z-20 cursor-pointer preserve-3d"
            style={{ transform: "translateZ(30px)" }}
          >
            <motion.span
              key={saved ? "on" : "off"}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.35, ease: "easeOut", type: "tween" }} // FIXED: added type: "tween" to avoid spring keyframe error
            >
              <Heart
                size={16}
                className={saved ? "fill-accent text-accent" : "text-ink"}
              />
            </motion.span>
          </motion.button>
        </Link>

        <div className="flex flex-1 flex-col p-5 preserve-3d" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-start justify-between gap-2" style={{ transform: "translateZ(25px)" }}>
            <h3 className="font-display text-[18px] font-bold leading-tight text-ink group-hover:text-accent transition-colors">
              <Link href={`/salon/${salon.id}`}>
                {salon.name}
              </Link>
            </h3>
            {salon.verified && (
              <BadgeCheck size={18} className="mt-0.5 shrink-0 text-accent" aria-label="Verified" />
            )}
          </div>

          {/* Premium Partner Sub-label */}
          <div style={{ transform: "translateZ(22px)" }}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/[0.04] border border-accent/10 px-2 py-0.5 rounded-md inline-block mt-1.5">
              Verified Premium Partner
            </span>
          </div>

          {/* Locality and Travel Time Hint */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted" style={{ transform: "translateZ(22px)" }}>
            <span className="flex items-center gap-1"><MapPin size={12} className="text-accent/70" /> {salon.locality}</span>
            <span className="text-faint font-light">·</span>
            <span className="font-medium text-accent/80">{getTravelTimeHint(salon.locality)}</span>
          </div>

          {/* Social Proof and Urgency / Scarcity Box */}
          <div 
            className="mt-3.5 rounded-xl bg-highlight/35 border border-line/45 p-3 space-y-1.5 text-[11px] text-muted preserve-3d"
            style={{ transform: "translateZ(23px)" }}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Flame size={11} className="text-accent shrink-0" />
                <span>Booked <strong className="text-ink font-semibold">{bookedCount} times</strong> this month</span>
              </span>
              <span className="text-[10px] text-accent font-semibold">{viewCount} views today</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {slotsCount} appointments left today
              </span>
            </div>
          </div>

          {salon.categories.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5" style={{ transform: "translateZ(24px)" }}>
              {salon.categories.slice(0, 3).map((c) => (
                <Badge key={c}>{catLabel(c)}</Badge>
              ))}
            </div>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 preserve-3d" style={{ transform: "translateZ(25px)" }}>
            <div className="text-xs text-muted">
              from <span className="price font-display text-[17px] font-bold text-ink">{formatINR(salon.priceFrom)}</span>
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Link
                href={`/book/${salon.id}`}
                className="block rounded-lg bg-accent px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-dark shadow-sm hover:shadow-md cursor-pointer"
              >
                BOOK IN 10 SEC
              </Link>
            </motion.div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export function SalonCardCompact({ salon }: { salon: SalonDTO }) {
  return (
    <Link
      href={`/salon/${salon.id}`}
      className="flex gap-3 rounded-xl border border-line bg-white p-2.5 transition-all hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 duration-200"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
        <Image src={salon.coverImage} alt={salon.name} fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold text-ink">{salon.name}</div>
        <div className="text-xs text-muted">{salon.locality}</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
            <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
            <span>{salon.avgRating.toFixed(1)}</span>
          </span>
          <span className="text-xs text-muted">· from <span className="price">{formatINR(salon.priceFrom)}</span></span>
        </div>
      </div>
    </Link>
  );
}
