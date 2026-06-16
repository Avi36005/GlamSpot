"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Sparkles,
  Flame,
  Paintbrush,
  Crown,
  BadgeCheck,
  Zap,
  Star,
  ChevronRight,
} from "lucide-react";
import { LOCALITIES } from "@/lib/constants";
import { EASE_EXPO, Magnetic } from "@/components/motion";
import dynamic from "next/dynamic";

const ThreeGLHero = dynamic(() => import("@/components/ThreeGLHero"), {
  ssr: false,
});

const HERO_POSTER =
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1920&q=80";
const HERO_VIDEO =
  "https://videos.pexels.com/video-files/3998400/3998400-uhd_2560_1440_25fps.mp4";

// Headline split into 3 visual lines for better hierarchy
const LINE1 = ["Mumbai's", "Most"];
const LINE2 = ["Beautiful", "Salons"];
const LINE3 = ["One", "Tap", "Away"];

function AnimatedCounter({
  value,
  duration = 1.2,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMs = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMs / end), 25);

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMs / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span>{count.toLocaleString()}{suffix}</span>
  );
}

/** A single word that rises from behind a clip mask. */
function MaskWord({
  children,
  delay,
  italic,
}: {
  children: string;
  delay: number;
  italic?: boolean;
}) {
  return (
    <span className="mr-[0.25em] inline-block overflow-hidden pb-[0.14em] align-bottom">
      <motion.span
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.95, ease: EASE_EXPO, delay }}
        className={`-mb-[0.14em] inline-block ${italic ? "italic" : ""}`}
      >
        {children}
      </motion.span>
    </span>
  );
}

const PLACEHOLDERS = [
  "Keratin Treatment near Bandra...",
  "Bridal Makeup in Juhu...",
  "Hair Spa under ₹1500...",
  "Nail Extensions near me...",
  "Balayage in Colaba...",
];

const TRENDING = [
  { label: "Keratin Treatment", query: "Keratin Treatment", icon: Flame },
  { label: "Gel Nails", query: "Gel Nails", icon: Paintbrush },
  { label: "Bridal Makeup", query: "Bridal Makeup", icon: Crown },
  { label: "Hair Spa", query: "Hair Spa", icon: Sparkles },
];

export function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [service, setService] = useState("");
  const [locality, setLocality] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(PLACEHOLDERS[0]);

  // Rotating placeholder typewriter
  useEffect(() => {
    let charIdx = 0;
    let currentIdx = 0;
    let isDeleting = false;
    let timer: NodeJS.Timeout;

    const tick = () => {
      const fullText = PLACEHOLDERS[currentIdx];
      if (!isDeleting) {
        setPlaceholderText(fullText.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === fullText.length) {
          isDeleting = true;
          timer = setTimeout(tick, 2200);
        } else {
          timer = setTimeout(tick, 60);
        }
      } else {
        setPlaceholderText(fullText.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % PLACEHOLDERS.length;
          timer = setTimeout(tick, 300);
        } else {
          timer = setTimeout(tick, 30);
        }
      }
    };

    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-driven parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const search = () => {
    const sp = new URLSearchParams();
    if (service) sp.set("q", service);
    if (locality && locality !== "All Mumbai") sp.set("locality", locality);
    router.push(`/search?${sp.toString()}`);
  };

  const total = LINE1.length + LINE2.length + LINE3.length;
  const subDelay = total * 0.07 + 0.25;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background video + poster (parallax) with slow zoom micro-animation */}
      <motion.div
        style={{ y: videoY, scale: videoScale }}
        className="absolute inset-0 z-0"
      >
        <motion.div
          animate={{ scale: [1, 1.04] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="h-full w-full"
        >
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        </motion.div>
        {/* Lightened overlay for luxury feel (was 0.45, now 0.40) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/40 to-black/55" />
      </motion.div>

      {/* Interactive WebGL 3D Particle and Orb Scene */}
      <ThreeGLHero />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-5 py-20 lg:px-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Left Column: Headline + Search */}
          <div className="max-w-2xl flex-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_EXPO }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-md"
            >
              <Sparkles size={14} className="text-highlight animate-pulse" /> AI-powered beauty
              discovery for Mumbai
            </motion.div>

            {/* Headline — 3 visual lines with breathing room */}
            <h1 className="heading-hero mt-6 font-display text-5xl text-white sm:text-6xl lg:text-7xl">
              <span className="block">
                {LINE1.map((w, i) => (
                  <MaskWord key={`l1-${i}`} delay={i * 0.07 + 0.1}>
                    {w}
                  </MaskWord>
                ))}
              </span>
              <span className="block">
                {LINE2.map((w, i) => (
                  <MaskWord key={`l2-${i}`} delay={(LINE1.length + i) * 0.07 + 0.1}>
                    {w}
                  </MaskWord>
                ))}
              </span>
              <span className="mt-2 block text-highlight">
                {LINE3.map((w, i) => (
                  <MaskWord
                    key={`l3-${i}`}
                    delay={(LINE1.length + LINE2.length + i) * 0.07 + 0.1}
                    italic
                  >
                    {w}
                  </MaskWord>
                ))}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE_EXPO, delay: subDelay }}
              className="mt-5 max-w-xl text-lg font-medium text-white/95"
            >
              Find salons, artists & beauty services near you
            </motion.p>

            {/* Search bar — heavier glassmorphism + stronger shadow */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: focused ? 1.015 : 1,
              }}
              transition={{
                opacity: { duration: 0.7, ease: EASE_EXPO, delay: subDelay + 0.12 },
                y: { type: "spring", stiffness: 200, damping: 22, delay: subDelay + 0.12 },
                scale: { duration: 0.25, ease: "easeOut" },
              }}
              style={{
                borderColor: focused ? "#C9184A" : "rgba(255, 255, 255, 0.3)",
                borderWidth: 1.5,
                boxShadow: focused
                  ? "0 0 30px rgba(201, 24, 74, 0.4), 0 25px 60px rgba(0, 0, 0, 0.35)"
                  : "0 20px 60px rgba(0, 0, 0, 0.25)",
              }}
              className="mt-8 w-full max-w-3xl rounded-2xl bg-white/75 backdrop-blur-[20px] p-2.5 md:flex md:items-center md:gap-2 transition-all duration-300"
            >
              <div className="flex flex-1 items-center gap-2.5 px-3 py-2.5">
                <Search size={20} className="shrink-0 text-muted" />
                <input
                  id="service-search"
                  name="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  placeholder={placeholderText}
                  className="w-full bg-transparent text-base text-ink outline-none placeholder:text-faint"
                />
              </div>
              <div className="relative flex items-center gap-2 border-t border-line px-3 py-2.5 md:border-l md:border-t-0">
                <MapPin size={18} className="shrink-0 text-muted" />
                <select
                  id="locality-select"
                  name="locality"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full appearance-none bg-transparent pr-6 text-ink outline-none md:w-44"
                >
                  <option value="">All Mumbai</option>
                  {LOCALITIES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 text-muted"
                />
              </div>
              <Magnetic className="mt-2 w-full md:mt-0 md:w-auto">
                <motion.button
                  onClick={search}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="w-full rounded-xl bg-accent px-8 py-3.5 text-base font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-accent-dark cursor-pointer"
                >
                  Search
                </motion.button>
              </Magnetic>
            </motion.div>

            {/* Trust badge line — below search */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: subDelay + 0.25 }}
              className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/70 font-medium tracking-wide"
            >
              <span className="inline-flex items-center gap-1">
                <Zap size={11} className="text-highlight" /> Instant Booking
              </span>
              <span className="text-white/30">•</span>
              <span className="inline-flex items-center gap-1">
                <BadgeCheck size={11} className="text-highlight" /> Verified Salons
              </span>
              <span className="text-white/30">•</span>
              <span className="inline-flex items-center gap-1">
                <Star size={11} className="text-highlight" /> No Phone Calls Needed
              </span>
            </motion.div>

            {/* Trending Searches — hover scale + fill search box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: subDelay + 0.3 }}
              className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/90"
            >
              <span className="font-medium">Trending:</span>
              {TRENDING.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.query}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.22)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    onClick={() => {
                      setService(item.query);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 hover:border-white/40 transition-colors cursor-pointer"
                  >
                    <Icon size={12} className="text-highlight" />
                    <span>{item.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Animated Statistics — descriptive labels with vector icons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: subDelay + 0.4 }}
              className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm"
            >
              <span className="inline-flex items-center gap-1.5 text-white/90">
                <BadgeCheck size={14} className="text-highlight shrink-0" />
                <strong className="text-white font-bold">
                  <AnimatedCounter value={54} />
                </strong>{" "}
                Verified Salons
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/90">
                <MapPin size={14} className="text-highlight shrink-0" />
                Across{" "}
                <strong className="text-white font-bold">
                  <AnimatedCounter value={21} />
                </strong>{" "}
                Mumbai Localities
              </span>
              <span className="inline-flex items-center gap-1.5 text-white/90">
                <Star size={14} className="text-highlight shrink-0" />
                Trusted by{" "}
                <strong className="text-white font-bold">
                  <AnimatedCounter value={5000} suffix="+" />
                </strong>{" "}
                Beauty Lovers
              </span>
            </motion.div>
          </div>

          {/* Right Column: Floating AI Match Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_EXPO, delay: subDelay + 0.5 }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-[260px] rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            >
              {/* Glow effect */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-highlight/10 pointer-events-none" />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/20">
                    <Sparkles size={16} className="text-highlight" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Style Match</div>
                    <div className="text-[10px] text-white/50">Just now</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="rounded-lg bg-white/10 px-3 py-2">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                      Face Shape Detected
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-white">Oval</div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                      Recommended Styles
                    </div>
                    {["Curtain Bangs", "Warm Brown Highlights", "Layered Bob"].map(
                      (style) => (
                        <div
                          key={style}
                          className="flex items-center gap-2 text-xs text-white/90"
                        >
                          <BadgeCheck size={11} className="text-highlight shrink-0" />
                          {style}
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-accent/20 px-3 py-2 mt-1">
                    <span className="text-xs font-semibold text-white">12 salons nearby</span>
                    <ChevronRight size={14} className="text-highlight" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll cue — "Discover Salons" with floating animation */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.25em]">
          Discover Salons
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="block h-6 w-px bg-white/40" />
          <ChevronDown size={14} className="text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
