"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Heart, User as UserIcon, History, X, LogOut } from "lucide-react";
import type { BookingDTO, SalonDTO } from "@/lib/types";
import {
  fetchUserBookings,
  fetchSavedSalons,
  cancelBooking,
  submitReview,
} from "@/lib/api";
import { BookingCard } from "@/components/booking/BookingCard";
import { SalonCard } from "@/components/salon/SalonCard";
import { StarInput } from "@/components/ui/StarRating";
import { PageFade } from "@/components/motion";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "upcoming", label: "Upcoming", icon: Calendar },
  { key: "past", label: "Past", icon: History },
  { key: "saved", label: "Saved Salons", icon: Heart },
  { key: "profile", label: "Profile", icon: UserIcon },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function Dashboard() {
  const [tab, setTab] = useState<TabKey>("upcoming");
  const [upcoming, setUpcoming] = useState<BookingDTO[]>([]);
  const [past, setPast] = useState<BookingDTO[]>([]);
  const [saved, setSaved] = useState<SalonDTO[]>([]);
  const [reviewing, setReviewing] = useState<BookingDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchUserBookings("upcoming"),
      fetchUserBookings("past"),
      fetchSavedSalons(),
    ])
      .then(([u, p, s]) => {
        setUpcoming(u.bookings);
        setPast(p.bookings);
        setSaved(s.salons);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id: string) => {
    await cancelBooking(id);
    load();
  };

  return (
    <PageFade>
      <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
        {/* User Card */}
        <div className="rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-accent/10 text-xl font-semibold text-accent border border-accent/20 select-none">
              AK
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">Hello, Aanya</h1>
              <p className="text-sm text-muted">aanya@glamspot.in</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 md:gap-12 border-t md:border-t-0 md:border-l border-line pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-mono">Bookings</div>
              <div className="text-xl font-bold text-ink mt-0.5">{upcoming.length + past.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-mono">Saved</div>
              <div className="text-xl font-bold text-ink mt-0.5">{saved.length}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted font-mono">Tier</div>
              <div className="text-[10px] font-semibold text-accent mt-1 bg-highlight px-2 py-0.5 rounded border border-accent/10 w-fit">Gold Member</div>
            </div>
          </div>
        </div>

        {/* Navigation Banner (matching the layout from the right image, blended with rose/pink theme) */}
        <div className="mt-8 bg-accent rounded-full p-2 pl-4 pr-2 flex items-center justify-between shadow-md select-none overflow-hidden max-w-4xl mx-auto">
          {/* Left: Brand logo/initial avatar representing account */}
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-white font-display text-accent font-bold text-base shadow-sm">
              G
            </span>
            <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-white/90">
              GlamSpot
            </span>
          </div>

          {/* Center: Tabs with Framer Motion slide highlights */}
          <div className="flex items-center gap-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer select-none",
                    active
                      ? "text-accent font-bold"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  {/* Sliding Background Pill */}
                  {active && (
                    <motion.span
                      layoutId="active-dashboard-tab"
                      className="absolute inset-0 -z-0 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <t.icon size={13} className="relative z-10 shrink-0" />
                  <span className="relative z-10 hidden md:inline">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Premium button matching the "Discover More ↗" button from the right image */}
          <Link
            href="/search"
            className="bg-white rounded-full pl-5 pr-1.5 py-1.5 flex items-center gap-2 hover:bg-cream/90 active:scale-95 transition-all text-xs font-semibold text-accent shadow-sm shrink-0"
          >
            <span>Discover More</span>
            <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-white shadow-inner">
              <span className="text-[10px] font-bold">↗</span>
            </span>
          </Link>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="shimmer h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {tab === "upcoming" && (
                  <BookingList
                    list={upcoming}
                    empty="No upcoming bookings."
                    onCancel={handleCancel}
                  />
                )}
                {tab === "past" && (
                  <BookingList
                    list={past}
                    empty="No past visits yet."
                    muted
                    onReview={(b) => setReviewing(b)}
                  />
                )}
                {tab === "saved" &&
                  (saved.length === 0 ? (
                    <Empty text="No saved salons yet." />
                  ) : (
                    <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      <AnimatePresence mode="popLayout">
                        {saved.map((s, i) => (
                          <motion.div
                            key={s.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                            className="h-full"
                          >
                            <SalonCard salon={s} index={i} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                {tab === "profile" && <Profile />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {reviewing && (
          <ReviewModal
            booking={reviewing}
            onClose={() => setReviewing(null)}
            onDone={() => {
              setReviewing(null);
              load();
            }}
          />
        )}
      </AnimatePresence>
    </PageFade>
  );
}

function BookingList({
  list,
  empty,
  muted,
  onCancel,
  onReview,
}: {
  list: BookingDTO[];
  empty: string;
  muted?: boolean;
  onCancel?: (id: string) => void;
  onReview?: (b: BookingDTO) => void;
}) {
  if (list.length === 0) return <Empty text={empty} />;
  return (
    <div className="space-y-3">
      {list.map((b, idx) => (
        <BookingCard key={b.id} booking={b} index={idx} muted={muted} onCancel={onCancel} onReview={onReview} />
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white p-14 text-center">
      <p className="text-ink">{text}</p>
      <Link href="/search" className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
        Discover salons →
      </Link>
    </div>
  );
}

function Profile() {
  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent text-xl font-semibold text-white">AK</span>
        <button className="rounded-[8px] border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
          Change photo
        </button>
      </div>
      <Field label="Full name" defaultValue="Aanya Kapoor" />
      <Field label="Phone" defaultValue="+91 98765 43210" />
      <Field label="Email (from sign-in)" defaultValue="aanya@glamspot.in" readOnly />
      <div className="flex gap-3 pt-2">
        <button className="rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark transition-colors">
          Save Changes
        </button>
        <button className="inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-2.5 text-sm font-medium hover:bg-cream">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
      <p className="text-xs text-muted">Firebase auth (Google + Phone OTP) activates once keys are added.</p>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  readOnly,
}: {
  label: string;
  defaultValue: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-ink">{label}</label>
      <input
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={cn(
          "mt-1.5 w-full rounded-[8px] border border-line p-2.5 text-sm outline-none focus:border-accent",
          readOnly && "bg-cream text-muted"
        )}
      />
    </div>
  );
}

function ReviewModal({
  booking,
  onClose,
  onDone,
}: {
  booking: BookingDTO;
  onClose: () => void;
  onDone: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await submitReview({ booking_id: booking.id, salon_id: booking.salonId, rating, comment });
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-5"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink">Rate your visit</h2>
          <button onClick={onClose}><X size={20} className="text-muted" /></button>
        </div>
        <p className="mt-1 text-sm text-muted">{booking.salonName} · {booking.serviceName}</p>

        <div className="mt-5 flex justify-center">
          <StarInput value={rating} onChange={setRating} />
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Tell others about your experience…"
          className="mt-5 w-full rounded-xl border border-line p-3 text-sm outline-none focus:border-accent"
        />

        <button
          onClick={save}
          disabled={saving}
          className="mt-4 w-full rounded-[8px] bg-accent py-3 font-medium text-white hover:bg-accent-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit Review"}
        </button>
      </motion.div>
    </motion.div>
  );
}
