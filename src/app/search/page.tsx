import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-5 py-20 text-center text-muted">
          Loading salons…
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
