"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export const DEMO_USER_ID = "demo-user";

type SavedCtx = {
  saved: Set<string>;
  toggle: (salonId: string) => void;
  isSaved: (salonId: string) => boolean;
};

const Ctx = createContext<SavedCtx | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/users/${DEMO_USER_ID}/saved-salons`)
      .then((r) => (r.ok ? r.json() : { salons: [] }))
      .then((d) => setSaved(new Set((d.salons ?? []).map((s: { id: string }) => s.id))))
      .catch(() => {});
  }, []);

  const toggle = useCallback(
    (salonId: string) => {
      setSaved((prev) => {
        const next = new Set(prev);
        const has = next.has(salonId);
        if (has) {
          next.delete(salonId);
          fetch(`/api/users/${DEMO_USER_ID}/saved-salons/${salonId}`, {
            method: "DELETE",
          }).catch(() => {});
        } else {
          next.add(salonId);
          fetch(`/api/users/${DEMO_USER_ID}/saved-salons`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ salon_id: salonId }),
          }).catch(() => {});
        }
        return next;
      });
    },
    []
  );

  const isSaved = useCallback((id: string) => saved.has(id), [saved]);

  return <Ctx.Provider value={{ saved, toggle, isSaved }}>{children}</Ctx.Provider>;
}

export function useSaved() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
