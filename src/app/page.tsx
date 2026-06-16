import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Zap, Wand2, Home as HomeIcon } from "lucide-react";
import { getSalons, getDeals } from "@/lib/data";
import { Hero } from "@/components/home/Hero";
import { DealCard } from "@/components/home/DealCard";
import { CategoryChips } from "@/components/CategoryChips";
import { SalonCard } from "@/components/SalonCard";
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
        <div className="grid items-center gap-10 overflow-hidden rounded-3xl border border-line bg-ink text-white md:grid-cols-2">
          <div className="p-8 lg:p-12">
            <FadeIn>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-highlight">
                <Wand2 size={13} /> AI Style Match
              </span>
            </FadeIn>
            <MaskText
              as="h2"
              className="mt-5 font-display text-3xl font-medium leading-tight lg:text-4xl"
            >
              Find the look that was made for you
            </MaskText>
            <FadeIn delay={0.1}>
              <p className="mt-4 max-w-md text-white/70">
                Upload a selfie and our AI reads your face shape to recommend hairstyles
                and colours — then matches you with Mumbai salons that nail them.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <Magnetic className="mt-7 inline-block">
                <Link
                  href="/style-ai"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-dark"
                >
                  Try AI Style Match <ArrowRight size={16} />
                </Link>
              </Magnetic>
            </FadeIn>
          </div>
          <ImageReveal className="relative h-64 md:h-full md:min-h-[340px]">
            <Image
              src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"
              alt="AI style match"
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
          </ImageReveal>
        </div>
      </section>

      {/* Home service banner */}
      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          <ImageReveal>
            <Image
              src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=1600&q=80"
              alt="Home service"
              width={1600}
              height={600}
              className="h-72 w-full object-cover md:h-80"
            />
          </ImageReveal>
          <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 lg:p-14">
            <FadeIn>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                <HomeIcon size={13} /> Home Service
              </span>
            </FadeIn>
            <MaskText
              as="h2"
              className="mt-4 max-w-md font-display text-3xl font-medium text-white lg:text-4xl"
            >
              Beauty at Your Doorstep
            </MaskText>
            <FadeIn delay={0.1}>
              <p className="mt-3 max-w-md text-white/80">
                Skip the traffic. Book trusted stylists who come to you, across Mumbai&apos;s
                suburbs and beyond.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <Magnetic className="mt-6 inline-block">
                <Link
                  href="/search?home_service=true"
                  className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-ink"
                >
                  Explore Home Services <ArrowRight size={16} />
                </Link>
              </Magnetic>
            </FadeIn>
          </div>
        </div>
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
