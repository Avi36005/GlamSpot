"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Scissors, Sparkles, Star, Gem, Leaf, Minus, Droplets } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  hair: Scissors,
  skin: Sparkles,
  nails: Star,
  bridal: Gem,
  spa: Leaf,
  threading: Minus,
  waxing: Droplets,
};

export function CategoryChips() {
  return (
    <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-wrap lg:justify-center lg:px-0">
      {CATEGORIES.map((c, i) => {
        const Icon = CATEGORY_ICONS[c.key];
        return (
          <motion.div
            key={c.key}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="shrink-0"
          >
            <Link
              href={`/search?category=${c.key}`}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-ink hover:text-white"
            >
              {Icon && <Icon size={14} strokeWidth={1.75} />}
              {c.label}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
