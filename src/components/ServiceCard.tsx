"use client";

import { Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import type { ServiceDTO } from "@/lib/types";
import { formatINR } from "@/lib/utils";
import { CATEGORY_ICONS } from "./CategoryChips";

export function ServiceCard({
  service,
  salonId,
  index = 0,
}: {
  service: ServiceDTO;
  salonId: string;
  index?: number;
}) {
  const Icon = CATEGORY_ICONS[service.category] ?? Sparkles;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 6) * 0.04 }}
      whileHover={{ y: -3 }}
      className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4 transition-all duration-300 hover:border-accent/20 hover:shadow-[var(--shadow-card)]"
    >
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-highlight text-accent">
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <div className="font-medium text-ink">{service.name}</div>
          {service.description && (
            <p className="mt-0.5 line-clamp-1 text-sm text-muted">{service.description}</p>
          )}
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} /> {service.durationMins} min
            </span>
            <span className="price font-semibold text-ink">{formatINR(service.price)}</span>
          </div>
        </div>
      </div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
        <Link
          href={`/book/${salonId}?service=${service.id}`}
          className="block shrink-0 rounded-[8px] border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Book
        </Link>
      </motion.div>
    </motion.div>
  );
}

