"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, Home, RefreshCw, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function HomeServiceCard() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div 
      className="w-full [perspective:2000px]"
      whileHover={{ y: -6, scale: 1.008 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      <div
        className="relative w-full transition-transform duration-700 preserve-3d"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Card 1: Front (Intro) */}
        <div className="w-full backface-hidden">
          <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-line bg-ink text-white md:grid-cols-2">
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-highlight">
                <Home size={13} /> Home Service
              </span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight lg:text-4xl">
                Beauty at Your Doorstep
              </h2>
              <p className="mt-4 max-w-md text-white/70 text-sm leading-relaxed">
                Skip the traffic. Book trusted, vetted stylists who come directly to your home, across Mumbai's suburbs and beyond.
              </p>

              {/* Service Stepper */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-8 text-[11px] text-white/60">
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">1</span>
                    Select Service
                  </div>
                  <div>Choose hair, skin or nails</div>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">2</span>
                    Set Time Slot
                  </div>
                  <div>Any day from 7 AM - 10 PM</div>
                </div>
                <div className="space-y-1">
                  <div className="text-white font-semibold flex items-center gap-1.5">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white text-[9px] font-bold">3</span>
                    Relax & Glow
                  </div>
                  <div>All tools & setup included</div>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4 flex-wrap">
                <Link
                  href="/search?home_service=true"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-dark hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer text-sm"
                >
                  Explore Home Services <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/15 cursor-pointer transition-colors shadow-sm"
                >
                  See How It Works <RefreshCw size={14} className="animate-spin-slow text-accent" />
                </button>
              </div>
            </div>
            
            <div className="relative h-64 md:h-full md:min-h-[420px] self-stretch">
              <Image
                src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1200&q=80"
                alt="Home service beauty"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
            </div>
          </div>
        </div>

        {/* Card 2: Back (Details / Inside Look) */}
        <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)]">
          <div className="grid h-full items-center gap-10 overflow-hidden rounded-3xl border border-line bg-ink text-white md:grid-cols-2">
            <div className="p-8 lg:p-12 flex flex-col justify-center h-full">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={13} /> Certified Safe • Hygienic Setup
              </span>
              <h2 className="mt-5 font-display text-3xl font-medium leading-tight lg:text-4xl text-white">
                The GlamAtHome Difference
              </h2>
              
              {/* Home Service Key Features */}
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-3.5 text-xs">
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Stylist Vetting</span>
                    <span className="font-semibold text-white mt-0.5">Top 1% Certified</span>
                  </div>
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Products</span>
                    <span className="font-semibold text-white mt-0.5">100% Sealed Kits</span>
                  </div>
                  <div>
                    <span className="block text-white/50 text-[10px] uppercase font-mono tracking-wider">Hygiene</span>
                    <span className="font-semibold text-white mt-0.5">Single-Use Tools</span>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex gap-3 items-start">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">A</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Sanitized Protective Workstations</h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">Our artists set up custom mats and protective gear, ensuring absolute cleanliness.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/20 text-accent text-xs font-bold mt-0.5">B</span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Zero Clean-up Guarantee</h4>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">We clean, vacuum, and pack away everything post-session, leaving your home spotless.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex items-center gap-4 flex-wrap">
                <Link
                  href="/search?home_service=true"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-semibold text-white transition-all hover:bg-accent-dark hover:scale-[1.02] active:scale-95 shadow-md cursor-pointer text-sm"
                >
                  Book Home Service <ArrowRight size={15} />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsFlipped(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-medium text-white/90 hover:bg-white/15 cursor-pointer transition-colors shadow-sm"
                >
                  ← Go Back
                </button>
              </div>
            </div>
            
            <div className="relative h-64 md:h-full md:min-h-[420px] self-stretch overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
                alt="Home salon session"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-transparent z-10" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
