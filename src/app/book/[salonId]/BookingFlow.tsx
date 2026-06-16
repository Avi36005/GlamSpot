"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronLeft, Clock, MapPin, CreditCard, Store, Sparkles } from "lucide-react";
import type { SalonDTO, ServiceDTO, StaffDTO } from "@/lib/types";
import { fetchSalon, fetchSlots, createBooking } from "@/lib/api";
import { SlotGrid, type Slot } from "@/components/booking/SlotGrid";
import { formatINR, formatDateLong, formatTime12, todayISO } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STEPS = ["Service", "Staff", "Date & Time", "Confirm"] as const;

function next14() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function BookingFlow({ salonId }: { salonId: string }) {
  const router = useRouter();
  const sp = useSearchParams();

  const [salon, setSalon] = useState<SalonDTO | null>(null);
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceDTO | null>(null);
  const [staff, setStaff] = useState<StaffDTO | null>(null);
  const [staffChosen, setStaffChosen] = useState(false);
  const [date, setDate] = useState<string>(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalon(salonId).then((d) => {
      setSalon(d.salon);
      const pre = sp.get("service");
      if (pre) {
        const found = d.salon.services?.find((s) => s.id === pre);
        if (found) setService(found);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId]);

  useEffect(() => {
    if (step !== 2 || !service) return;
    setLoadingSlots(true);
    setTime(null);
    fetchSlots(salonId, date, service.id)
      .then((d) => setSlots(d.slots))
      .finally(() => setLoadingSlots(false));
  }, [step, date, service, salonId]);

  if (!salon) {
    return <div className="mx-auto max-w-3xl px-5 py-20 text-center text-muted">Loading…</div>;
  }

  const canNext =
    (step === 0 && !!service) ||
    (step === 1 && staffChosen) ||
    (step === 2 && !!time) ||
    step === 3;

  const submit = async (method: "pay_now" | "pay_at_salon") => {
    if (!service || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      const { booking } = await createBooking({
        salon_id: salonId,
        service_id: service.id,
        staff_id: staff?.id,
        date,
        time,
        notes,
        payment_method: method,
      });
      router.push(`/booking-confirmed/${booking.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 lg:px-8">
      <button
        onClick={() => (step === 0 ? router.back() : setStep((s) => s - 1))}
        className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h1 className="font-display text-2xl font-bold text-ink">Book at {salon.name}</h1>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted">
        <MapPin size={13} /> {salon.locality}
      </p>

      {/* Stepper */}
      <div className="mt-6 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full text-xs font-semibold transition-colors",
                  i < step ? "bg-accent text-white" : i === step ? "bg-ink text-white" : "bg-cream text-muted"
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </span>
              <span className={cn("mt-1.5 hidden text-xs sm:block", i === step ? "text-ink" : "text-muted")}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-px flex-1 transition-colors", i < step ? "bg-accent" : "bg-line")} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mt-8"
      >
        {/* Step 1: Service */}
        {step === 0 && (
          <div className="space-y-3">
            {salon.services?.map((s) => (
              <button
                key={s.id}
                onClick={() => setService(s)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all",
                  service?.id === s.id ? "border-accent bg-highlight" : "border-line bg-white hover:border-accent/40"
                )}
              >
                <div>
                  <div className="font-medium text-ink">{s.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    <Clock size={11} /> {s.durationMins} min
                  </div>
                </div>
                <span className="price font-semibold text-ink">{formatINR(s.price)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Staff */}
        {step === 1 && (
          <div className="space-y-3">
            <button
              onClick={() => {
                setStaff(null);
                setStaffChosen(true);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                staffChosen && !staff ? "border-accent bg-highlight" : "border-line bg-white hover:border-accent/40"
              )}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-cream text-muted">
                <Sparkles size={18} />
              </span>
              <div>
                <div className="font-medium text-ink">No preference</div>
                <div className="text-xs text-muted">We&apos;ll assign the best available stylist</div>
              </div>
            </button>
            {salon.staff?.map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setStaff(st);
                  setStaffChosen(true);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all",
                  staff?.id === st.id ? "border-accent bg-highlight" : "border-line bg-white hover:border-accent/40"
                )}
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-cream font-semibold text-ink">
                  {st.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
                <div>
                  <div className="font-medium text-ink">{st.name}</div>
                  <div className="text-xs text-muted">{st.specialisation}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 2 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-ink">Choose a date</h3>
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
              {next14().map((d) => {
                const dt = new Date(d + "T00:00:00");
                const active = date === d;
                return (
                  <button
                    key={d}
                    onClick={() => setDate(d)}
                    className={cn(
                      "flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-all",
                      active ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-accent"
                    )}
                  >
                    <span className="text-[10px] uppercase">{dt.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                    <span className="text-lg font-semibold">{dt.getDate()}</span>
                    <span className="text-[10px]">{dt.toLocaleDateString("en-IN", { month: "short" })}</span>
                  </button>
                );
              })}
            </div>

            <h3 className="mb-3 mt-6 text-sm font-semibold text-ink">Available slots</h3>
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="shimmer h-10 rounded-[8px]" />
                ))}
              </div>
            ) : (
              <SlotGrid slots={slots} selected={time} onSelect={setTime} />
            )}
          </div>
        )}

        {/* Step 4: Confirm */}
        {step === 3 && service && (
          <div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <h3 className="font-display text-lg font-semibold text-ink">Booking summary</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <Row label="Salon" value={salon.name} />
                <Row label="Address" value={salon.address} />
                <Row label="Service" value={`${service.name} · ${service.durationMins} min`} />
                <Row label="Stylist" value={staff?.name ?? "No preference"} />
                <Row label="When" value={`${formatDateLong(date)} · ${time ? formatTime12(time) : "-"}`} />
                <div className="flex justify-between border-t border-line pt-3 text-base">
                  <dt className="font-semibold text-ink">Total</dt>
                  <dd className="price font-bold text-ink">{formatINR(service.price)}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium text-ink">Any special requests?</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="e.g. I'd like a senior stylist, allergic to certain products…"
                className="mt-2 w-full rounded-xl border border-line bg-white p-3 text-sm outline-none focus:border-accent"
              />
            </div>

            {error && <p className="mt-3 text-sm text-accent">{error}</p>}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                disabled={submitting}
                onClick={() => submit("pay_now")}
                className="flex items-center justify-center gap-2 rounded-[8px] bg-accent px-5 py-3.5 font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-50"
              >
                <CreditCard size={16} /> Pay Now <span className="price">{formatINR(service.price)}</span>
              </button>
              <button
                disabled={submitting}
                onClick={() => submit("pay_at_salon")}
                className="flex items-center justify-center gap-2 rounded-[8px] border border-ink/15 px-5 py-3.5 font-medium text-ink transition-colors hover:bg-cream disabled:opacity-50"
              >
                <Store size={16} /> Pay at Salon
              </button>
            </div>
            <p className="mt-2 text-center text-xs text-muted">
              Online payments (Razorpay) activate once API keys are added.
            </p>
          </div>
        )}
      </motion.div>
      </AnimatePresence>

      {/* Footer nav */}
      {step < 3 && (
        <div className="mt-8 flex justify-end">
          <button
            disabled={!canNext}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-[8px] bg-ink px-8 py-3 font-medium text-white transition-colors hover:bg-ink/90 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
