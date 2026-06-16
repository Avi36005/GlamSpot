export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}

export function formatHour(hour: number) {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 || hour === 24 ? "AM" : "PM";
  return `${h}:00 ${ampm}`;
}

export function formatTime12(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${ampm}`;
}

export function addMinutesToTime(hhmm: string, mins: number) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function formatDateLong(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Deterministic pseudo-random in [0,1) from a string seed
export function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
