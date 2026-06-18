export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Zap, Wand2, Home as HomeIcon } from "lucide-react";
import { getSalons, getDeals } from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { DealCard } from "@/components/home/DealCard";
import { CategoryChips } from "@/components/salon/CategoryChips";
import { SalonCard } from "@/components/salon/SalonCard";
import { AiPromoCard } from "@/components/home/AiPromoCard";
import { HomeServiceCard } from "@/components/home/HomeServiceCard";
import {
  Reveal,
  MaskText,
  FadeIn,
  ImageReveal,
  Magnetic,
  VelocityMarquee,
  ScrollProgress,
  Preloader,
} from "@/components/motion";

function BeforeAfterCard({ before, after, title, description }: { before: string; after: string; title: string; description: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-300">
      <div className="relative aspect-[4/3] w-full overflow-hidden group">
        {/* After Image */}
        <Image src={after} alt={`${title} After`} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
        
        {/* Before Image (slides out on hover) */}
        <div className="absolute inset-0 w-1/2 overflow-hidden border-r-2 border-white transition-all duration-500 ease-out group-hover:w-0 z-10">
          <div className="absolute inset-0 aspect-[4/3] w-[200%] max-w-none">
            <Image src={before} alt={`${title} Before`} fill sizes="(max-width:768px) 200vw, 66vw" className="object-cover" />
          </div>
        </div>
        
        {/* Slider Indicator Handle */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-500 ease-out group-hover:left-0 flex flex-col items-center gap-1">
          <span className="bg-ink text-[9px] font-bold text-white px-2 py-0.5 rounded uppercase tracking-wider shadow">Before</span>
          <span className="h-6 w-0.5 bg-white" />
        </div>
        <div className="absolute bottom-3 right-3 bg-accent text-[9px] font-bold text-white px-2.5 py-0.5 rounded uppercase tracking-wider shadow z-20">After</div>
      </div>
      <div className="p-4">
        <h4 className="font-display font-bold text-ink">{title}</h4>
        <p className="mt-1 text-xs text-muted leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [salons, deals] = await Promise.all([getSalons({ sort: "rating" }), getDeals()]);
  const trending = salons.slice(0, 8);

  return (
    <div>
      <Preloader />
      <ScrollProgress />
      <Hero />

      {/* Category chips */}
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <CategoryChips />
      </section>

      {/* Trending */}
      <section className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -left-20 top-10 h-[380px] w-[380px] rounded-full bg-[rgba(201,24,74,0.035)] blur-[100px] animate-float-ambient" />
        </div>
        <SectionHead
          kicker="Editor's Picks"
          title="Trending in Mumbai"
          subtitle="The city's highest-rated salons, loved by locals."
          href="/search?sort=rating"
        />
        <div className="no-scrollbar -mx-5 flex gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
          {trending.map((s, i) => (
            <div key={s.id} className="w-[280px] shrink-0 lg:w-auto">
              <SalonCard salon={s} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* Editorial marquee band — reacts to scroll velocity */}
      <div className="mt-16 border-y border-line bg-ink py-5 text-white">
        <VelocityMarquee
          items={[
            "Editor's Picks",
            "Verified Salons",
            "Instant Booking",
            "AI Style Match",
            "Home Service",
            "Mumbai's Finest",
          ]}
        />
      </div>

      {/* Last-minute deals */}
      <section id="deals" className="relative overflow-hidden bg-highlight/70 py-16">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -right-24 bottom-10 h-[400px] w-[400px] rounded-full bg-[rgba(255,181,167,0.15)] blur-[120px] animate-float-ambient" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHead
            kicker={<span className="inline-flex items-center gap-1"><Zap size={13} /> Flash Deals</span>}
            title="Last-Minute Deals"
            subtitle="Same-day slots at a steal. Hurry — these expire soon."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {deals.map((d, i) => (
              <Reveal key={d.salon.id} delay={i * 0.08}>
                <DealCard {...d} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* AI Style Match promo */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <Reveal>
          <AiPromoCard />
        </Reveal>
      </section>

      {/* Home service banner */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <Reveal>
          <HomeServiceCard />
        </Reveal>
      </section>

      {/* Why GlamSpot */}
      <section className="bg-cream py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHead kicker="Why GlamSpot" title="Beauty booking, reimagined" center />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Verified Salons",
                desc: "Every salon is vetted and reviewed so you book with total confidence.",
              },
              {
                icon: Zap,
                title: "Instant Booking",
                desc: "Real-time slots and confirmation in seconds — no calls, no waiting.",
              },
              {
                icon: Wand2,
                title: "AI Style Match",
                desc: "Personalised recommendations powered by Gemini, Groq and GPT-4o.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-line bg-white p-7 transition-shadow hover:shadow-[var(--shadow-card)]">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-highlight text-accent">
                    <f.icon size={22} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  subtitle,
  href,
  center,
}: {
  kicker: React.ReactNode;
  title: string;
  subtitle?: string;
  href?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`mb-7 flex flex-wrap items-end justify-between gap-3 ${
        center ? "flex-col items-center text-center" : ""
      }`}
    >
      <div className={center ? "flex flex-col items-center" : ""}>
        <FadeIn>
          <div className="section-label">{kicker}</div>
        </FadeIn>
        <MaskText
          as="h2"
          delay={0.08}
          className={`mt-2.5 font-display text-3xl font-medium text-ink lg:text-4xl ${
            center ? "text-center" : ""
          }`}
        >
          {title}
        </MaskText>
        {subtitle && (
          <FadeIn delay={0.16}>
            <p className="mt-2 max-w-xl text-muted">{subtitle}</p>
          </FadeIn>
        )}
      </div>
      {href && (
        <FadeIn>
          <Link
            href={href}
            className="group inline-flex items-center gap-1 text-sm font-medium text-ink transition-colors hover:text-accent"
          >
            View all
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </FadeIn>
      )}
    </div>
  );
}
