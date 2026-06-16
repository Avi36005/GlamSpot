"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Heart, BadgeCheck, MapPin, Home } from "lucide-react";
import type { SalonDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import { StarRating } from "./StarRating";
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 4) * 0.06 }}
      className="h-full"
    >
      <TiltCard className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white glow-card preserve-3d">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          
          {/* Overlaid Badges Container */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10 preserve-3d" style={{ transform: "translateZ(25px)" }}>
            {salon.homeService && (
              <Badge tone="ink" className="backdrop-blur">
                <Home size={11} /> Home service
              </Badge>
            )}
            {seasonal && (
              <Badge 
                tone="neutral" 
                className={seasonal.tone === "accent" 
                  ? "bg-accent text-white border-none font-semibold px-2 py-0.5 text-[10px]" 
                  : "bg-cream text-ink border-none px-2 py-0.5 text-[10px]"
                }
              >
                {seasonal.label}
              </Badge>
            )}
          </div>
        </Link>

        <motion.button
          onClick={() => toggle(salon.id)}
          aria-label={saved ? "Remove from saved" : "Save salon"}
          whileTap={{ scale: 0.9 }}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur hover:bg-white"
          style={{ transform: "translateZ(30px)" }}
        >
          <motion.span
            key={saved ? "on" : "off"}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Heart
              size={16}
              className={
                saved ? "fill-accent text-accent transition-colors duration-200" : "text-ink transition-colors duration-200"
              }
            />
          </motion.span>
        </motion.button>

        <div className="flex flex-1 flex-col p-4 preserve-3d" style={{ transform: "translateZ(20px)" }}>
          <div className="flex items-start justify-between gap-2" style={{ transform: "translateZ(25px)" }}>
            <h3 className="font-display text-[17px] font-semibold leading-tight text-ink">
              <Link href={`/salon/${salon.id}`} className="hover:text-accent transition-colors">
                {salon.name}
              </Link>
            </h3>
            {salon.verified && (
              <BadgeCheck size={18} className="mt-0.5 shrink-0 text-accent" aria-label="Verified" />
            )}
          </div>

          {/* Locality and Travel Time Hint */}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted" style={{ transform: "translateZ(22px)" }}>
            <span className="flex items-center gap-1"><MapPin size={12} /> {salon.locality}</span>
            <span className="text-[10px] text-faint">|</span>
            <span className="text-[10px] font-medium text-accent/85">{getTravelTimeHint(salon.locality)}</span>
          </div>

          <div className="mt-2 flex items-center gap-2" style={{ transform: "translateZ(22px)" }}>
            <StarRating value={salon.avgRating} showValue />
            <span className="text-xs text-muted">· {salon.totalReviews} reviews</span>
          </div>

          {salon.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5" style={{ transform: "translateZ(24px)" }}>
              {salon.categories.slice(0, 3).map((c) => (
                <Badge key={c}>{catLabel(c)}</Badge>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5 preserve-3d" style={{ transform: "translateZ(25px)" }}>
            <div className="text-sm text-muted">
              from <span className="price font-semibold text-ink">{formatINR(salon.priceFrom)}</span>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Link
                href={`/book/${salon.id}`}
                className="block rounded-[8px] bg-accent px-4 py-2 text-sm font-medium uppercase tracking-[0.04em] text-white transition-colors hover:bg-accent-dark"
              >
                Book Now
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
      className="flex gap-3 rounded-xl border border-line bg-white p-2.5 transition-shadow hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-cream">
        <Image src={salon.coverImage} alt={salon.name} fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-sm font-semibold text-ink">{salon.name}</div>
        <div className="text-xs text-muted">{salon.locality}</div>
        <div className="mt-1 flex items-center gap-2">
          <StarRating value={salon.avgRating} size={12} showValue />
          <span className="text-xs text-muted">· from <span className="price">{formatINR(salon.priceFrom)}</span></span>
        </div>
      </div>
    </Link>
  );
}
