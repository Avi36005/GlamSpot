"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[8px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-dark",
  outline: "border border-ink/15 text-ink hover:bg-ink/[0.04]",
  ghost: "text-ink hover:bg-ink/[0.05]",
  dark: "bg-ink text-white hover:bg-ink/90",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-3.5 py-2",
  md: "text-sm px-5 py-2.5",
  lg: "text-base px-7 py-3.5",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...(rest as object)}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
}: CommonProps & { href: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-flex"
    >
      <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
        {children}
      </Link>
    </motion.div>
  );
}

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "rose" | "ink" | "neutral";
}) {
  const tones = {
    // Category tags on cards — white bg, light border, neutral text
    default: "border border-line bg-white text-muted rounded-[4px]",
    neutral: "border border-line bg-white text-muted rounded-[4px]",
    rose: "bg-highlight text-accent rounded-full",
    ink: "bg-ink text-white rounded-full",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-[3px] text-[11px] font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_CLASS: Record<string, string> = {
  confirmed: "status-confirmed",
  pending: "status-pending",
  cancelled: "status-cancelled",
  completed: "status-completed",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("status-badge", STATUS_CLASS[status] ?? "status-pending")}>
      {status}
    </span>
  );
}
