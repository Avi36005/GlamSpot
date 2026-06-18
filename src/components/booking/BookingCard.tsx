"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Calendar, Clock, User as UserIcon } from "lucide-react";
import type { BookingDTO } from "@/lib/types";
import { formatINR, formatDateLong, formatTime12 } from "@/lib/utils";
import { StatusBadge } from "@/components/ui";

export function BookingCard({
  booking,
  onCancel,
  onReview,
  muted = false,
  index = 0,
}: {
  booking: BookingDTO;
  onCancel?: (id: string) => void;
  onReview?: (b: BookingDTO) => void;
  muted?: boolean;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: (index % 6) * 0.05 }}
      whileHover={{ x: 3 }}
      className={`group flex gap-4 rounded-2xl border border-line border-l-[3px] border-l-line bg-white p-4 transition-all hover:border-l-accent hover:shadow-[var(--shadow-card)] ${
        muted ? "opacity-80" : ""
      }`}
    >
      <Link
        href={`/salon/${booking.salonId}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream"
      >
        <Image
          src={booking.salonImage}
          alt={booking.salonName}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-sans text-base font-bold text-ink transition-colors group-hover:text-accent">
              {booking.salonName}
            </h3>
            <p className="text-sm text-muted">{booking.serviceName}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} /> {formatDateLong(booking.date)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {formatTime12(booking.time)}
          </span>
          {booking.staffName && (
            <span className="inline-flex items-center gap-1">
              <UserIcon size={12} /> {booking.staffName}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="price text-sm font-semibold text-ink">
            {formatINR(booking.totalPrice)}
          </span>
          <div className="flex gap-2">
            {onCancel && booking.status !== "cancelled" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCancel(booking.id)}
                className="rounded-[8px] border border-line px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-cream"
              >
                Cancel
              </motion.button>
            )}
            {onReview && !booking.hasReview && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReview(booking)}
                className="rounded-[8px] bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-dark"
              >
                Rate Your Visit
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

