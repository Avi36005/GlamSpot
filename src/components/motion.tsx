"use client";

import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useVelocity,
  useAnimationFrame,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Expo-out — the slow, confident curve luxury/editorial sites lean on.
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

/**
 * MaskText — a line (or words) rising from behind a clip mask.
 * The signature editorial reveal: nothing fades, it *emerges*.
 */
export function MaskText({
  children,
  className,
  delay = 0,
  duration = 0.9,
  as: Tag = "div",
  once = true,
  animate = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "div" | "h1" | "h2" | "h3" | "span" | "p";
  once?: boolean;
  /** use mount animation instead of scroll-triggered */
  animate?: boolean;
}) {
  const MotionTag = motion.span;
  const reveal = { y: "0%" };
  const trigger = animate
    ? { animate: reveal }
    : { whileInView: reveal, viewport: { once, margin: "-12%" } };
  return (
    <Tag className={className} style={{ overflow: "hidden", display: "block" }}>
      <MotionTag
        initial={{ y: "115%" }}
        {...trigger}
        transition={{ duration, ease: EASE_EXPO, delay }}
        style={{ display: "block", willChange: "transform" }}
      >
        {children}
      </MotionTag>
    </Tag>
  );
}

/** FadeIn — quiet supporting fade for eyebrows, subtitles, captions. */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 14,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, ease: EASE_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * ImageReveal — a clip-path curtain wipe with a slow inner zoom-out,
 * the way Gucci/Prada unveil their hero imagery.
 */
export function ImageReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      style={{ overflow: "hidden" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-15%" }}
    >
      <motion.div
        variants={{
          hidden: { clipPath: "inset(100% 0% 0% 0%)" },
          show: { clipPath: "inset(0% 0% 0% 0%)" },
        }}
        transition={{ duration: 1.1, ease: EASE_EXPO }}
        style={{ height: "100%", position: "relative" }}
      >
        <motion.div
          variants={{ hidden: { scale: 1.25 }, show: { scale: 1 } }}
          transition={{ duration: 1.4, ease: EASE_EXPO }}
          style={{ height: "100%", position: "relative" }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Magnetic — element drifts toward the cursor and springs back.
 * The hover tell of award-site CTAs (Nike, agency portfolios).
 */
export function Magnetic({
  children,
  className,
  strength = 0.35,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** ScrollProgress — the thin reading bar editorial sites pin to the top. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[60] h-[2px] w-full origin-left bg-accent"
    />
  );
}

function wrapRange(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * VelocityMarquee — a ticker that speeds up, reverses, and skews with the
 * page's scroll velocity. The signature kinetic-type band of award sites.
 */
export function VelocityMarquee({
  items,
  baseVelocity = -3,
  className,
}: {
  items: string[];
  baseVelocity?: number;
  className?: string;
}) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const factor = useTransform(smooth, [0, 1000], [0, 5], { clamp: false });
  const skewX = useTransform(smooth, [-2000, 2000], [-6, 6], { clamp: true });
  const x = useTransform(baseX, (v) => `${wrapRange(-25, -50, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    let moveBy = dir.current * baseVelocity * (delta / 1000);
    if (factor.get() < 0) dir.current = -1;
    else if (factor.get() > 0) dir.current = 1;
    moveBy += dir.current * moveBy * factor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const loop = [...items, ...items, ...items, ...items];
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ x, skewX }} className="flex w-max flex-nowrap">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="whitespace-nowrap px-8 font-display text-2xl italic">
              {item}
            </span>
            <span className="text-accent">&#10022;</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Preloader — an editorial intro curtain that wipes up after the wordmark
 * settles. Plays once per full page load; client-side navigations back to
 * the page do not replay it (module flag survives across mounts, resets on
 * a hard refresh). Initialising state from the flag keeps SSR/CSR in sync
 * and avoids a synchronous setState in the effect.
 */
export function Preloader({ word = "GlamSpot" }: { word?: string }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const played = sessionStorage.getItem("intro-played");
      if (played) {
        setDone(true);
        return;
      }
      const t = setTimeout(() => {
        sessionStorage.setItem("intro-played", "true");
        setDone(true);
      }, 1700);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
          className="fixed inset-0 z-[100] grid place-items-center bg-ink"
        >
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "110%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EASE_EXPO, delay: 0.1 }}
              className="flex items-baseline gap-2"
            >
              <span className="font-display text-5xl font-medium text-white sm:text-6xl">
                {word}
              </span>
              <span className="text-sm uppercase tracking-[0.3em] text-white/50">
                Mumbai
              </span>
            </motion.div>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.4, ease: EASE_EXPO }}
            className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-accent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
  y = 24,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PageFade({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.08 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
