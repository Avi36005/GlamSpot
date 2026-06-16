"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  BadgeCheck,
  MapPin,
  Clock,
  Home,
  Copy,
  Check,
  Navigation,
  X,
  Phone,
} from "lucide-react";
import type { SalonDTO, ReviewDTO, ServiceDTO } from "@/lib/types";
import { formatINR, formatHour } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui";
import { ServiceCard } from "@/components/salon/ServiceCard";
import { StaffCard } from "@/components/salon/StaffCard";
import { ReviewCard } from "@/components/salon/ReviewCard";
import { AIReviewSummary } from "@/components/salon/AIReviewSummary";
import { useSaved } from "@/components/providers";
import { PageFade } from "@/components/motion";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SalonMap = dynamic(() => import("@/components/salon/SalonMap"), { ssr: false });

const TABS = ["Services", "Staff", "Reviews", "About"] as const;
type Tab = (typeof TABS)[number];

export function SalonDetail({
  salon,
  reviews,
}: {
  salon: SalonDTO;
  reviews: ReviewDTO[];
}) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(salon.id);
  const [tab, setTab] = useState<Tab>("Services");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ratingFilter, setRatingFilter] = useState(0);

  const gallery = salon.gallery.length ? salon.gallery : [salon.coverImage];

  const grouped = useMemo(() => {
    const map = new Map<string, ServiceDTO[]>();
    (salon.services ?? []).forEach((s) => {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    });
    return Array.from(map.entries());
  }, [salon.services]);

  const filteredReviews =
    ratingFilter === 0 ? reviews : ratingFilter === 3 ? reviews.filter((r) => r.rating <= 3) : reviews.filter((r) => r.rating === ratingFilter);

  const copyAddress = () => {
    navigator.clipboard.writeText(salon.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PageFade>
      {/* Cover */}
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden bg-cream">
        <Image src={salon.coverImage} alt={salon.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <button
          onClick={() => toggle(salon.id)}
          className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110"
          aria-label="Save"
        >
          <Heart size={18} className={saved ? "fill-accent text-accent" : "text-ink"} />
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        {/* Header card */}
        <div className="-mt-20 relative rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-lift)] lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-bold text-ink lg:text-4xl">{salon.name}</h1>
                {salon.verified && <BadgeCheck size={24} className="text-accent" />}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1"><MapPin size={14} /> {salon.locality}</span>
                <span className="inline-flex items-center gap-1.5"><StarRating value={salon.avgRating} showValue /> · {salon.totalReviews} reviews</span>
                <span className="inline-flex items-center gap-1"><Clock size={14} /> {formatHour(salon.openTime)} – {formatHour(salon.closeTime)}</span>
                {salon.homeService && <Badge tone="ink"><Home size={11} /> Home service</Badge>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-muted">from <span className="price text-lg font-bold text-ink">{formatINR(salon.priceFrom)}</span></span>
              <Link
                href={`/book/${salon.id}`}
                className="rounded-[8px] bg-accent px-7 py-3 font-medium text-white transition-colors hover:bg-accent-dark active:scale-95"
              >
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Gallery */}
          {gallery.length > 1 && (
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {gallery.slice(0, 4).map((g, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(g)}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream"
                >
                  <Image src={g} alt={`${salon.name} ${i + 1}`} fill sizes="25vw" className="object-cover transition-transform hover:scale-105" />
                  {i === 3 && gallery.length > 4 && (
                    <span className="absolute inset-0 grid place-items-center bg-ink/50 text-sm font-medium text-white">
                      View All
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="sticky top-16 z-30 mt-8 flex gap-1 border-b border-line bg-surface/90 backdrop-blur">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "relative px-4 py-3 text-sm font-medium transition-colors",
                tab === t ? "text-accent" : "text-muted hover:text-ink"
              )}
            >
              {t}
              {tab === t && (
                <motion.span layoutId="tab-underline" className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-accent" />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {/* Services */}
          {tab === "Services" && (
            <div className="space-y-8">
              {grouped.map(([cat, items]) => (
                <div key={cat}>
                  <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-ink">
                    <span>{CATEGORIES.find((c) => c.key === cat)?.icon}</span>
                    {CATEGORIES.find((c) => c.key === cat)?.label ?? cat}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {items.map((s, idx) => (
                      <ServiceCard key={s.id} service={s} salonId={salon.id} index={idx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Staff */}
          {tab === "Staff" && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(salon.staff ?? []).map((s, idx) => (
                <StaffCard key={s.id} staff={s} index={idx} />
              ))}
            </div>
          )}

          {/* Reviews */}
          {tab === "Reviews" && (
            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
              <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
                <AIReviewSummary salonId={salon.id} />
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-ink">{salon.avgRating.toFixed(1)}</span>
                    <StarRating value={salon.avgRating} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{salon.totalReviews} verified reviews</p>
                </div>
              </div>
              <div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {[
                    { v: 0, l: "All" },
                    { v: 5, l: "5★" },
                    { v: 4, l: "4★" },
                    { v: 3, l: "3★ & below" },
                  ].map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setRatingFilter(o.v)}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                        ratingFilter === o.v ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-accent"
                      )}
                    >
                      {o.l}
                    </button>
                  ))}
                </div>
                <div className="space-y-3">
                  {filteredReviews.length === 0 ? (
                    <p className="text-muted">No reviews in this range.</p>
                  ) : (
                    filteredReviews.map((r, idx) => <ReviewCard key={r.id} review={r} index={idx} />)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* About */}
          {tab === "About" && (
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">About {salon.name}</h3>
                <p className="mt-3 leading-relaxed text-muted">{salon.description}</p>

                <div className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-white p-4">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-accent" />
                  <div className="flex-1">
                    <div className="text-sm text-ink">{salon.address}</div>
                    <button onClick={copyAddress} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent">
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy address</>}
                    </button>
                  </div>
                </div>

                {salon.phone && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white p-4">
                    <Phone size={18} className="shrink-0 text-accent" />
                    <div className="text-sm text-ink font-medium">
                      <a href={`tel:${salon.phone}`} className="hover:underline">
                        {salon.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-line bg-white p-4">
                  <h4 className="text-sm font-semibold text-ink">Opening hours</h4>
                  <div className="mt-2 space-y-1 text-sm text-muted">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <div key={d} className="flex justify-between">
                        <span>{d}</span>
                        <span>{formatHour(salon.openTime)} – {formatHour(salon.closeTime)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${salon.lat},${salon.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-ink px-5 py-2.5 text-sm font-medium text-white"
                >
                  <Navigation size={15} /> Get Directions
                </a>
              </div>

              <div className="h-80 overflow-hidden rounded-2xl border border-line lg:h-full">
                <SalonMap salons={[salon]} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky mobile book bar */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 p-3 backdrop-blur lg:hidden">
        <Link
          href={`/book/${salon.id}`}
          className="flex w-full items-center justify-center rounded-[8px] bg-accent py-3 font-medium text-white"
        >
          Book Appointment · from&nbsp;<span className="price">{formatINR(salon.priceFrom)}</span>
        </Link>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[60] grid place-items-center bg-ink/90 p-6"
          >
            <button className="absolute right-5 top-5 text-white" onClick={() => setLightbox(null)}>
              <X size={28} />
            </button>
            <div className="grid max-h-[85vh] max-w-4xl gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {gallery.map((g, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                    <Image src={g} alt={`gallery ${i}`} fill sizes="33vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageFade>
  );
}
