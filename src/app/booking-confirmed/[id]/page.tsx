"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, Copy, Calendar, MessageSquare, MapPin, Clock } from "lucide-react";
import { fetchBooking } from "@/lib/api";
import { formatINR, formatDateLong, formatTime12 } from "@/lib/utils";

type B = Record<string, string | number>;

export default function ConfirmedPage() {
  const { id } = useParams<{ id: string }>();
  const [b, setB] = useState<B | null>(null);
  const [copied, setCopied] = useState(false);
  const [waSent, setWaSent] = useState(false);

  useEffect(() => {
    fetchBooking(id).then((d) => setB(d.booking)).catch(() => {});
  }, [id]);

  if (!b) {
    return <div className="mx-auto max-w-xl px-5 py-24 text-center text-muted">Loading your booking…</div>;
  }

  const addToCalendar = () => {
    const start = new Date(`${b.date}T${b.time}:00`);
    const end = new Date(start.getTime() + Number(b.durationMins || 60) * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${fmt(start)}`,
      `DTEND:${fmt(end)}`,
      `SUMMARY:${b.serviceName} at ${b.salonName}`,
      `LOCATION:${b.salonAddress}`,
      `DESCRIPTION:GlamSpot booking ${b.id}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "glamspot-booking.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center lg:py-24">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink"
      >
        <Check size={40} className="text-white" strokeWidth={3} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="mt-6 font-display text-3xl font-bold uppercase tracking-tight text-ink"
      >
        Booking Confirmed
      </motion.h1>
      <p className="mt-2 text-muted">
        We&apos;ve reserved your slot. A confirmation will reach you shortly.
      </p>

      <div className="mt-8 rounded-2xl border border-line bg-white p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">Booking ID</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(String(b.id));
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-accent"
          >
            {copied ? "Copied" : <><Copy size={12} /> Copy</>}
          </button>
        </div>
        <div className="rounded-[8px] bg-[#f5f5f5] px-3 py-2 font-mono text-sm text-ink">{b.id}</div>

        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <div>
            <div className="font-display text-lg font-semibold text-ink">{b.salonName}</div>
            <div className="text-sm text-muted">{b.serviceName}</div>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted">
            <MapPin size={15} className="mt-0.5 shrink-0" /> {b.salonAddress}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Calendar size={15} /> {formatDateLong(String(b.date))}
            <Clock size={15} className="ml-2" /> {formatTime12(String(b.time))}
          </div>
          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="text-sm text-muted">Total · {String(b.paymentMethod) === "pay_now" ? "Paid" : "Pay at salon"}</span>
            <span className="price font-bold text-ink">{formatINR(Number(b.totalPrice))}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          onClick={addToCalendar}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-ink/15 px-5 py-3 text-sm font-medium text-ink hover:bg-cream"
        >
          <Calendar size={15} /> Add to Calendar
        </button>
        <button
          onClick={() => setWaSent(true)}
          className="flex items-center justify-center gap-2 rounded-[8px] border border-ink/15 px-5 py-3 text-sm font-medium text-ink hover:bg-cream"
        >
          <MessageSquare size={15} /> {waSent ? "Reminder set ✓" : "Get WhatsApp Reminder"}
        </button>
      </div>
      {waSent && (
        <p className="mt-2 text-xs text-muted">WhatsApp reminders go live once Twilio keys are added.</p>
      )}

      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-[8px] bg-accent px-7 py-3 font-medium text-white hover:bg-accent-dark"
      >
        View My Bookings
      </Link>
    </div>
  );
}
