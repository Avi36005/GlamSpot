"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Wand2, RefreshCw, CheckCircle2, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiPromoCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      className="w-full [perspective:2000px]"
      whileHover={{ y: -6, scale: 1.006 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div
        className="relative w-full transition-transform duration-700 preserve-3d"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Card 1: Front (Intro & Scanner Promo) */}
        <div className="w-full backface-hidden">
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-line bg-ink text-white md:grid-cols-2">
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-highlight">
                <Wand2 size={13} /> AI Style Match
              </span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight lg:text-4xl">
                Find the look that was made for you
              </h2>
              <p className="mt-4 max-w-md text-white/70 text-sm leading-relaxed">
                Upload a selfie and our AI reads your face shape to recommend hairstyles
                and colours — then matches you with Mumbai salons that nail them.
              </p>

              {/* Visual AI Process Stepper */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-8 text-[11px] text-white/60">
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">1</span>
                    Upload Selfie
                  </div>
                  <div>Simple smartphone snap</div>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">2</span>
                    AI Face Scan
                  </div>
                  <div>Detects shape & tones</div>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">3</span>
                    Match & Book
                  </div>
                  <div>Direct instant booking</div>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4 flex-wrap">
                <Link
                  href="/style-ai"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-dark hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer text-sm"
                >
                  Try AI Style Match <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/15 cursor-pointer transition-colors shadow-sm"
                >
                  See Demo Scan <RefreshCw size={14} className="animate-spin-slow text-accent" />
                </button>
              </div>
            </div>
            
            <div className="relative h-64 md:h-full md:min-h-[420px] self-stretch">
              <Image
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
                alt="AI style match"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
            </div>
          </div>
        </div>

        {/* Card 2: Back (Simulated Scan Result) */}
        <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)]">
          <div className="grid h-full items-center gap-10 overflow-hidden rounded-3xl border border-line bg-ink text-white md:grid-cols-2">
            <div className="p-8 lg:p-12 flex flex-col justify-center h-full">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={13} /> Scan Complete • Oval Face Shape
              </span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight lg:text-4xl text-white">
                Your AI Style Matches
              </h2>
              
              {/* Scan Metrics / Results */}
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-3.5 text-xs">
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Face Shape</span>
                    <span className="font-semibold text-white flex items-center gap-1 mt-0.5">Oval <span className="text-[10px] text-accent">(98%)</span></span>
                  </div>
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Skin Tone</span>
                    <span className="font-semibold text-white mt-0.5">Warm Golden</span>
                  </div>
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Hair Density</span>
                    <span className="font-semibold text-white mt-0.5">Medium-Thick</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex gap-3 items-start">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">A</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Face-Framing Shag with Curtain Bangs</h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">Slight layering breaks up vertical length, accentuating eyes and cheekbones.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">B</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Warm Honey Balayage</h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">Soft hand-painted highlights bring out the golden undertones of your skin.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4 flex-wrap">
                <Link
                  href="/search?q=balayage"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-dark hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer text-sm"
                >
                  Book Recommended Salon <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/15 cursor-pointer transition-colors shadow-sm"
                >
                  ← Reset Demo Scan
                </button>
              </div>
            </div>
            
            {/* Visual Scan Simulation */}
            <div className="relative h-64 md:h-full md:min-h-[420px] self-stretch overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
                alt="AI scanner result"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover brightness-75 saturate-[0.8]"
              />
              
              {/* Scan Line Overlay (Framer Motion) */}
              <motion.div 
                className="absolute left-0 right-0 h-[3px] bg-accent z-20 shadow-[0_0_15px_#c9184a]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
                style={{
                  backgroundImage: "linear-gradient(to right, transparent, var(--color-accent) 20%, var(--color-accent) 80%, transparent)"
                }}
              />
              
              {/* Tech Overlay HUD */}
              <div className="absolute inset-0 bg-accent/5 pointer-events-none z-10 flex flex-col justify-center items-center p-6 select-none">
                {/* Face Scanning Matrix Overlay */}
                <div className="relative w-48 h-48 border border-accent/30 rounded-full flex items-center justify-center pointer-events-none">
                  <motion.div 
                    className="absolute w-40 h-40 border border-dashed border-accent/25 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, ease: "linear", repeat: Infinity }}
                  />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-accent/15" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-accent/15" />
                  <span className="text-[10px] font-mono text-white/40 tracking-wider">ALIGN FACE</span>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent z-10" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
