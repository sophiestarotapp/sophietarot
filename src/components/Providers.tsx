"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { initAnalytics } from "@/lib/analytics";
import { useSophieStore, SAVE_VERSION, VERSION_KEY } from "@/lib/store";

/**
 * First-open cache clearing.
 *
 * On the very first launch (or whenever SAVE_VERSION is bumped), any stale
 * storage from previous builds is wiped — old localStorage saves, session
 * storage, and Cache Storage entries — so the app always boots clean.
 * Afterwards the version is stamped and the Zustand save is hydrated.
 */
function bootstrapStorage() {
  try {
    const seenVersion = localStorage.getItem(VERSION_KEY);
    if (seenVersion !== String(SAVE_VERSION)) {
      // clear every key this app family has ever written
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sophies-tarot"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
      // clear HTTP/service-worker caches left by older builds
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      localStorage.setItem(VERSION_KEY, String(SAVE_VERSION));
    }
  } catch {
    // storage unavailable (private mode etc.) — run in-memory only
  }
  // hydrate the save AFTER the cache check (skipHydration is set in the store)
  useSophieStore.persist.rehydrate();
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 1 },
        },
      })
  );

  useEffect(() => {
    bootstrapStorage();
    initAnalytics();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
