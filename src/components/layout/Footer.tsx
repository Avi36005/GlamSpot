import Link from "next/link";
import { Sparkles, AtSign, Send, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-white">
                <Sparkles size={16} />
              </span>
              <span className="font-display text-xl font-bold">GlamSpot</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Mumbai&apos;s most beautiful salons, one tap away. Discover, book and
              experience the best beauty in your neighbourhood.
            </p>
            <div className="mt-5 flex gap-3">
              {[AtSign, Send, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-accent hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { label: "All Salons", href: "/search" },
              { label: "Home Services", href: "/search?home_service=true" },
              { label: "Bridal Beauty", href: "/search?category=bridal" },
              { label: "Last-Minute Deals", href: "/#deals" },
            ]}
          />
          <FooterCol
            title="AI Tools"
            links={[
              { label: "AI Style Match", href: "/style-ai" },
              { label: "GlamBot Assistant", href: "/chat" },
              { label: "My Bookings", href: "/dashboard" },
            ]}
          />
          <FooterCol
            title="Localities"
            links={[
              { label: "Bandra", href: "/search?locality=Bandra" },
              { label: "Andheri", href: "/search?locality=Andheri" },
              { label: "Juhu", href: "/search?locality=Juhu" },
              { label: "Worli", href: "/search?locality=Worli" },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} GlamSpot Mumbai. Built for SuperXgen Buildathon.</p>
          <p>Made with AI · Next.js · Gemini · Groq</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold uppercase tracking-wider text-white/90">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
