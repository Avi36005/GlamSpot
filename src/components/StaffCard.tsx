"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { motion } from "motion/react";
import type { StaffDTO } from "@/lib/types";
import { Badge } from "./ui";

export function StaffCard({ staff, index = 0 }: { staff: StaffDTO; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: (index % 4) * 0.05 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col items-center rounded-2xl border border-line bg-white p-5 text-center transition-all duration-300 hover:border-accent/20 hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative h-20 w-20 overflow-hidden rounded-full bg-cream">
        {staff.avatarUrl ? (
          <Image
            src={staff.avatarUrl}
            alt={staff.name}
            fill
            sizes="80px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-muted">
            <User size={28} />
          </span>
        )}
      </div>
      <h4 className="mt-3 font-display text-base font-semibold text-ink transition-colors group-hover:text-accent">
        {staff.name}
      </h4>
      <Badge tone="rose" className="mt-1.5">
        {staff.specialisation}
      </Badge>
      {staff.bio && <p className="mt-2.5 text-sm leading-relaxed text-muted">{staff.bio}</p>}
    </motion.div>
  );
}

