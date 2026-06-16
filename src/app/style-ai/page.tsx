"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Upload, Sparkles, RefreshCw } from "lucide-react";
import type { StyleResult } from "@/lib/types";
import { recommendStyle } from "@/lib/api";
import { AIStyleCard, ColourSwatch } from "@/components/salon/AIStyleCard";
import { SalonCard } from "@/components/salon/SalonCard";
import { PageFade, Reveal } from "@/components/motion";

export default function StyleAIPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StyleResult | null>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setPreview(data);
      setBase64(data);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyse = async () => {
    setLoading(true);
    try {
      const r = await recommendStyle(base64);
      setResult(r);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setBase64(undefined);
    setResult(null);
  };

  return (
    <PageFade>
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-faint">
            <Sparkles size={12} /> Powered by Gemini Vision
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold text-ink lg:text-5xl">
            Discover Your Perfect Look
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Upload a selfie and let AI suggest styles made for your face — then book a
            Mumbai salon that specialises in them.
          </p>
        </div>

        {/* Upload */}
        <div className="mx-auto mt-10 max-w-xl">
          {!preview ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={`grid cursor-pointer place-items-center rounded-3xl border-2 border-dashed p-14 text-center transition-colors ${
                drag ? "border-accent bg-highlight" : "border-[#d4d4d4] bg-white hover:border-accent/50"
              }`}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-highlight text-accent">
                <Upload size={24} />
              </span>
              <p className="mt-4 font-medium text-ink">Drag & drop your selfie</p>
              <p className="text-sm text-muted">or click to browse · JPG, PNG</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-56 w-56 overflow-hidden rounded-3xl border border-line">
                <Image src={preview} alt="Your selfie" fill className="object-cover" />
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={analyse}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-[8px] bg-accent px-7 py-3 font-medium text-white hover:bg-accent-dark disabled:opacity-60"
                >
                  <Sparkles size={16} /> {loading ? "Analysing…" : "Analyse My Look"}
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 rounded-[8px] border border-line px-5 py-3 font-medium text-ink hover:bg-cream"
                >
                  <RefreshCw size={15} /> New photo
                </button>
              </div>
            </div>
          )}
          {!preview && (
            <p className="mt-4 text-center text-xs text-muted">
              No selfie handy? Just click “Analyse” after uploading any photo — the demo
              works without a real face too.
            </p>
          )}
        </div>

        {/* Loading shimmer */}
        {loading && (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-24 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="mt-14 space-y-12">
            <Reveal>
              <div className="text-center">
                <p className="text-sm uppercase tracking-wider text-muted">Your face shape</p>
                <motion.h2
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="font-display text-4xl font-bold text-accent"
                >
                  {result.face_shape}
                </motion.h2>
                <span className="mt-2 inline-block rounded-full bg-cream px-3 py-1 text-xs text-muted">
                  {result.source === "ai" ? "Analysed by Gemini Vision" : "Smart recommendation"}
                </span>
              </div>
            </Reveal>

            <div>
              <h3 className="mb-4 font-display text-2xl font-semibold text-ink">
                Recommended Hairstyles
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.styles.map((s, i) => (
                  <Reveal key={s.name} delay={i * 0.05}>
                    <AIStyleCard name={s.name} reason={s.reason} index={i} />
                  </Reveal>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-display text-2xl font-semibold text-ink">
                Recommended Colours
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {result.colours.map((c, i) => (
                  <Reveal key={c.name} delay={i * 0.05}>
                    <ColourSwatch {...c} />
                  </Reveal>
                ))}
              </div>
            </div>

            {result.matched_salons.length > 0 && (
              <div>
                <h3 className="mb-1 font-display text-2xl font-semibold text-ink">
                  Salons in Mumbai for These Styles
                </h3>
                <p className="mb-4 text-muted">Hand-picked to bring your new look to life.</p>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {result.matched_salons.map((s, i) => (
                    <SalonCard key={s.id} salon={s} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageFade>
  );
}
