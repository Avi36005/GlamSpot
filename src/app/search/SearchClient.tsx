"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, LayoutGrid, Map as MapIcon, X } from "lucide-react";
import { LOCALITIES, CATEGORIES, SORTS } from "@/lib/constants";
import type { SalonDTO } from "@/lib/types";
import { fetchSalons } from "@/lib/api";
import { SalonCard, SalonCardCompact } from "@/components/salon/SalonCard";
import { CATEGORY_ICONS } from "@/components/salon/CategoryChips";
import { LocalityMultiSelect } from "@/components/salon/LocalityMultiSelect";
import { PriceSlider } from "@/components/salon/PriceSlider";
import { cn } from "@/lib/utils";

const SalonMap = dynamic(() => import("@/components/salon/SalonMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-cream" />,
});

const PRICE_MIN = 0;
const PRICE_MAX = 10000;

export function SearchClient() {
  const params = useSearchParams();

  const [localities, setLocalities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [price, setPrice] = useState<[number, number]>([PRICE_MIN, PRICE_MAX]);
  const [minRating, setMinRating] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [homeService, setHomeService] = useState(false);
  const [sort, setSort] = useState("relevance");
  const [q, setQ] = useState("");
  const [searchVal, setSearchVal] = useState("");

  const [view, setView] = useState<"grid" | "map">("grid");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [salons, setSalons] = useState<SalonDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialise from URL once
  useEffect(() => {
    const loc = params.get("locality");
    const cat = params.get("category");
    if (loc) setLocalities([loc]);
    if (cat) setCategories([cat]);
    if (params.get("home_service") === "true") setHomeService(true);
    if (params.get("open_now") === "true") setOpenNow(true);
    if (params.get("sort")) setSort(params.get("sort")!);
    if (params.get("q")) {
      setQ(params.get("q")!);
      setSearchVal(params.get("q")!);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const query = useMemo(() => {
    const sp = new URLSearchParams();
    if (localities.length) sp.set("locality", localities.join(","));
    if (categories.length) sp.set("category", categories.join(","));
    if (price[0] > PRICE_MIN) sp.set("price_min", String(price[0]));
    if (price[1] < PRICE_MAX) sp.set("price_max", String(price[1]));
    if (minRating) sp.set("min_rating", String(minRating));
    if (openNow) sp.set("open_now", "true");
    if (homeService) sp.set("home_service", "true");
    if (sort) sp.set("sort", sort);
    if (q) sp.set("q", q);
    sp.set("limit", "50");
    return sp.toString();
  }, [localities, categories, price, minRating, openNow, homeService, sort, q]);

  useEffect(() => {
    setLoading(true);
    fetchSalons(query)
      .then((d) => setSalons(d.salons))
      .catch(() => setSalons([]))
      .finally(() => setLoading(false));
  }, [query]);

  const toggle = useCallback(
    (setter: React.Dispatch<React.SetStateAction<string[]>>) => (v: string) =>
      setter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])),
    []
  );

  const clearAll = () => {
    setLocalities([]);
    setCategories([]);
    setPrice([PRICE_MIN, PRICE_MAX]);
    setMinRating(0);
    setOpenNow(false);
    setHomeService(false);
    setQ("");
    setSearchVal("");
  };

  const Filters = (
    <div className="space-y-7">
      <FilterBlock title="Search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQ(searchVal);
          }}
          className="relative flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-1.5"
        >
          <input
            type="text"
            placeholder="Search city, salon, service..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal("");
                setQ("");
              }}
              className="text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </form>
      </FilterBlock>
      <FilterBlock title="Locality">
        <LocalityMultiSelect
          options={LOCALITIES}
          selected={localities}
          onToggle={toggle(setLocalities)}
        />
      </FilterBlock>

      <FilterBlock title="Service Category">
        <div className="space-y-0.5">
          {CATEGORIES.map((c) => {
            const checked = categories.includes(c.key);
            const Icon = CATEGORY_ICONS[c.key];
            return (
              <label
                key={c.key}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-cream"
              >
                <span
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded border text-[10px]",
                    checked ? "border-accent bg-accent text-white" : "border-line bg-white"
                  )}
                >
                  {checked && "✓"}
                </span>
                <input type="checkbox" checked={checked} onChange={() => toggle(setCategories)(c.key)} className="sr-only" />
                {Icon && <Icon size={14} strokeWidth={1.75} className="text-muted" />} {c.label}
              </label>
            );
          })}
        </div>
      </FilterBlock>

      <FilterBlock title="Price Range">
        <PriceSlider min={PRICE_MIN} max={PRICE_MAX} value={price} onChange={setPrice} />
      </FilterBlock>

      <FilterBlock title="Minimum Rating">
        <div className="space-y-1">
          {[
            { v: 0, l: "Any" },
            { v: 3, l: "3+ stars" },
            { v: 4, l: "4+ stars" },
            { v: 4.5, l: "4.5+ stars" },
          ].map((o) => (
            <label key={o.v} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-cream">
              <span className={cn("grid h-4 w-4 place-items-center rounded-full border", minRating === o.v ? "border-accent" : "border-line")}>
                {minRating === o.v && <span className="h-2 w-2 rounded-full bg-accent" />}
              </span>
              <input type="radio" checked={minRating === o.v} onChange={() => setMinRating(o.v)} className="sr-only" />
              {o.l}
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Quick Filters">
        <Toggle label="Open now" checked={openNow} onChange={setOpenNow} />
        <Toggle label="Home service available" checked={homeService} onChange={setHomeService} />
      </FilterBlock>

      <button
        onClick={clearAll}
        className="w-full rounded-[8px] border border-line py-2.5 text-sm font-medium text-ink transition-colors hover:bg-cream"
      >
        Clear All Filters
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Discover Salons</h1>
        <p className="mt-1 text-muted">
          {loading ? "Finding salons…" : `${salons.length} salons found`}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-line bg-white p-5">{Filters}</div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              onClick={() => setSheetOpen(true)}
              className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium lg:hidden"
            >
              <SlidersHorizontal size={15} /> Filters
            </button>

            <div className="ml-auto flex items-center gap-3">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-line bg-white px-4 py-2 text-sm outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
              <div className="flex rounded-full border border-line bg-white p-0.5">
                <button
                  onClick={() => setView("grid")}
                  className={cn("grid h-8 w-8 place-items-center rounded-full", view === "grid" ? "bg-ink text-white" : "text-muted")}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("map")}
                  className={cn("grid h-8 w-8 place-items-center rounded-full", view === "map" ? "bg-ink text-white" : "text-muted")}
                  aria-label="Map view"
                >
                  <MapIcon size={15} />
                </button>
              </div>
            </div>
          </div>

          {view === "grid" ? (
            loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
                    <div className="shimmer aspect-[4/3]" />
                    <div className="space-y-2 p-4">
                      <div className="shimmer h-4 w-2/3 rounded" />
                      <div className="shimmer h-3 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : salons.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-16 text-center">
                <p className="font-display text-xl text-ink">No salons match your filters</p>
                <button onClick={clearAll} className="mt-3 text-sm font-medium text-accent">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {salons.map((s, i) => (
                  <SalonCard key={s.id} salon={s} index={i} />
                ))}
              </div>
            )
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="h-[600px] overflow-hidden rounded-2xl border border-line">
                <SalonMap salons={salons} />
              </div>
              <div className="no-scrollbar hidden max-h-[600px] space-y-2 overflow-y-auto lg:block" data-lenis-prevent>
                {salons.map((s) => (
                  <SalonCardCompact key={s.id} salon={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-surface p-5 lg:hidden"
              data-lenis-prevent
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Filters</h2>
                <button onClick={() => setSheetOpen(false)}><X size={22} /></button>
              </div>
              {Filters}
              <button
                onClick={() => setSheetOpen(false)}
                className="mt-5 w-full rounded-[8px] bg-accent py-3 font-medium text-white"
              >
                Show {salons.length} salons
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[#f5f5f5] pt-5 first:border-t-0 first:pt-0">
      <h3 className="section-label mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
      {label}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-10 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}
