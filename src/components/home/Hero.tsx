"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { Search, MapPin, ChevronDown, Sparkles, Flame, Paintbrush, Crown } from "lucide-react";
import { LOCALITIES } from "@/lib/constants";
import { EASE_EXPO, Magnetic } from "@/components/motion";
import dynamic from "next/dynamic";

const ThreeGLHero = dynamic(() => import("@/components/ThreeGLHero"), {
  ssr: false,
});

const HERO_POSTER =
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=1920&q=80";
// Free Pexels clip; poster image shows if it fails to load.
const HERO_VIDEO =
  "https://videos.pexels.com/video-files/3998400/3998400-uhd_2560_1440_25fps.mp4";

const LINE1 = ["Mumbai’s", "Most", "Beautiful", "Salons,"];
const LINE2 = ["One", "Tap", "Away"];

function AnimatedCounter({ value, duration = 1.2, suffix = "" }: { value: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 25);

    const timer = setInterval(() => {
      start += Math.ceil(end / (totalMiliseconds / incrementTime));
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
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
  "Balayage in Bandra...",
  "Bridal makeup in Juhu...",
  "Same-day haircut near me...",
  "Nail art in Colaba...",
  "Facial in Andheri...",
];

export function Hero() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const [service, setService] = useState("");
  const [locality, setLocality] = useState("");
  const [focused, setFocused] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(PLACEHOLDERS[0]);

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
          timer = setTimeout(tick, 2200); // Pause on complete word
        } else {
          timer = setTimeout(tick, 60); // Type speed
        }
      } else {
        setPlaceholderText(fullText.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          currentIdx = (currentIdx + 1) % PLACEHOLDERS.length;
          timer = setTimeout(tick, 300); // Pause before typing next
        } else {
          timer = setTimeout(tick, 30); // Erase speed
        }
      }
    };

    timer = setTimeout(tick, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-driven parallax: the footage drifts + zooms, the copy lifts away.
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

  const total = LINE1.length + LINE2.length;
  const subDelay = total * 0.07 + 0.25;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Background video + poster (parallax) */}
      <motion.div style={{ y: videoY, scale: videoScale }} className="absolute inset-0 z-0">
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
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.45)]" />
      </motion.div>

      {/* Interactive WebGL 3D Particle and Orb Scene */}
      <ThreeGLHero />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-20 mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-5 py-20 lg:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_EXPO }}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur-md"
        >
          <Sparkles size={14} className="text-highlight animate-pulse" /> AI-powered beauty discovery for Mumbai
        </motion.div>

        <h1 className="heading-hero mt-6 max-w-[700px] font-display text-5xl text-white sm:text-6xl lg:text-7xl">
          <span className="block">
            {LINE1.map((w, i) => (
              <MaskWord key={`l1-${i}`} delay={i * 0.07 + 0.1}>
                {w}
              </MaskWord>
            ))}
          </span>
          <span className="block text-highlight">
            {LINE2.map((w, i) => (
              <MaskWord key={`l2-${i}`} delay={(LINE1.length + i) * 0.07 + 0.1} italic>
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

        {/* Search bar with glassmorphic panel & glowing accents */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: focused ? 1.02 : 1,
          }}
          transition={{
            opacity: { duration: 0.6, ease: EASE_EXPO, delay: subDelay + 0.12 },
            y: { duration: 0.6, ease: EASE_EXPO, delay: subDelay + 0.12 },
            scale: { duration: 0.25, ease: "easeOut" },
          }}
          style={{
            borderColor: focused ? "#C9184A" : "rgba(255, 255, 255, 0.25)",
            borderWidth: 1.5,
            boxShadow: focused
              ? "0 0 25px rgba(201, 24, 74, 0.35), 0 20px 40px rgba(0, 0, 0, 0.3)"
              : "0 10px 30px rgba(0, 0, 0, 0.2)",
          }}
          className="mt-8 w-full max-w-3xl rounded-2xl glass-premium p-2 md:flex md:items-center md:gap-2 transition-all duration-300"
        >
          <div className="flex flex-1 items-center gap-2 px-3 py-2">
            <Search size={18} className="text-muted" />
            <input
              id="service-search"
              name="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder={placeholderText}
              className="w-full bg-transparent text-ink outline-none placeholder:text-faint"
            />
          </div>
          <div className="relative flex items-center gap-2 border-t border-line px-3 py-2 md:border-l md:border-t-0">
            <MapPin size={18} className="text-muted" />
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
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted" />
          </div>
          <Magnetic className="mt-2 w-full md:mt-0 md:w-auto">
            <motion.button
              onClick={search}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-full rounded-xl bg-accent px-7 py-3.5 font-medium uppercase tracking-[0.04em] text-white transition-colors hover:bg-accent-dark cursor-pointer"
            >
              Search
            </motion.button>
          </Magnetic>
        </motion.div>

        {/* Trending Searches */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: subDelay + 0.2 }}
          className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/90"
        >
          <span className="font-medium">Trending:</span>
          {[
            { label: "Keratin Treatment", query: "Keratin Treatment", icon: Flame },
            { label: "Gel Nails", query: "Gel Nails", icon: Paintbrush },
            { label: "Bridal Makeup", query: "Bridal Makeup", icon: Crown },
            { label: "Hair Spa", query: "Hair Spa", icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.query}
                onClick={() => {
                  setService(item.query);
                  const sp = new URLSearchParams();
                  sp.set("q", item.query);
                  if (locality && locality !== "All Mumbai") sp.set("locality", locality);
                  router.push(`/search?${sp.toString()}`);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 hover:bg-white/25 hover:border-white/40 transition-all cursor-pointer"
              >
                <Icon size={12} className="text-highlight" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Animated Statistics Counters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: subDelay + 0.3 }}
          className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85"
        >
          <span className="inline-flex items-center gap-1">
            ✦ <AnimatedCounter value={54} /> Verified Salons
          </span>
          <span className="inline-flex items-center gap-1">
            ✦ <AnimatedCounter value={21} /> Localities
          </span>
          <span className="inline-flex items-center gap-1">
            ✦ <AnimatedCounter value={5000} suffix="+" /> Bookings
          </span>
        </motion.div>
      </motion.div>

      {/* Scroll cue — fades out as the hero scrolls away */}
      <motion.div
        style={{ opacity: contentOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/70 md:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="block h-8 w-px bg-white/50"
        />
      </motion.div>
    </section>
  );
}
