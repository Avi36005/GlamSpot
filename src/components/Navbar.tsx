"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageCircle, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/search", label: "Discover" },
  { href: "/style-ai", label: "AI Style Match" },
  { href: "/chat", label: "GlamBot" },
  { href: "/dashboard", label: "My Bookings" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-line bg-surface/85 backdrop-blur-md shadow-sm shadow-ink/[0.02]"
          : "border-transparent bg-surface"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white">
            <Sparkles size={16} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">
            GlamSpot
          </span>
          <span className="hidden text-xs font-medium uppercase tracking-[0.2em] text-muted sm:inline">
            Mumbai
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onMouseEnter={() => setHoveredLink(l.href)}
              onMouseLeave={() => setHoveredLink(null)}
              className={cn(
                "relative rounded-full px-4 py-2 text-[13px] tracking-[0.02em] transition-colors duration-200",
                pathname.startsWith(l.href)
                  ? "font-medium text-accent"
                  : "font-normal text-[#404040] hover:text-ink"
              )}
            >
              {/* Active Background Pill */}
              {pathname.startsWith(l.href) && (
                <motion.span
                  layoutId="active-nav"
                  className="absolute inset-0 -z-10 rounded-full bg-highlight"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              {/* Hover Sliding Underline Indicator */}
              {hoveredLink === l.href && !pathname.startsWith(l.href) && (
                <motion.span
                  layoutId="hover-nav"
                  className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-accent"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/chat"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-ink/[0.04]"
            aria-label="GlamBot chat"
          >
            <MessageCircle size={17} />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            <User size={15} /> Account
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-full text-ink md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-line bg-surface md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-medium",
                    pathname.startsWith(l.href)
                      ? "bg-highlight text-accent"
                      : "text-ink hover:bg-ink/[0.04]"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-sm font-medium text-white"
              >
                <User size={15} /> Account
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
