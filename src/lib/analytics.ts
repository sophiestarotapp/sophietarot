"use client";

import posthog from "posthog-js";

let initialized = false;

export function initAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key || initialized || typeof window === "undefined") return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    capture_pageview: true,
    persistence: "localStorage",
  });
  initialized = true;
}

/** Safe no-op when PostHog isn't configured. */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}
