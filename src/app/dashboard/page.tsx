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
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-ink text-xl font-semibold text-white">
            AK
          </span>
          <div>
            <h1 className="font-display text-[32px] font-medium leading-none text-ink">Hello, Aanya</h1>
            <p className="mt-1.5 text-sm text-muted">aanya@glamspot.in</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="no-scrollbar mt-8 flex gap-1 overflow-x-auto border-b border-line">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                tab === t.key ? "text-accent" : "text-muted hover:text-ink"
              )}
            >
              <t.icon size={15} /> {t.label}
              {tab === t.key && (
                <motion.span layoutId="dash-underline" className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-accent" />
              )}
            </button>
          ))}
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
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {saved.map((s, i) => (
                        <SalonCard key={s.id} salon={s} index={i} />
                      ))}
                    </div>
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
      <Link href="/search" className="mt-3 inline-block text-sm font-medium text-accent">
        Discover salons →
      </Link>
    </div>
  );
}

function Profile() {
  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-line bg-white p-6">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-ink text-xl font-semibold text-white">AK</span>
        <button className="rounded-[8px] border border-line px-4 py-2 text-sm font-medium hover:bg-cream">
          Change photo
        </button>
      </div>
      <Field label="Full name" defaultValue="Aanya Kapoor" />
      <Field label="Phone" defaultValue="+91 98765 43210" />
      <Field label="Email (from sign-in)" defaultValue="aanya@glamspot.in" readOnly />
      <div className="flex gap-3 pt-2">
        <button className="rounded-[8px] bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dark">
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
          className="mt-4 w-full rounded-[8px] bg-accent py-3 font-medium text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {saving ? "Submitting…" : "Submit Review"}
        </button>
      </motion.div>
    </motion.div>
  );
}
