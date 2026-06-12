"use client";

import { useMemo } from "react";
import { getAmbienceLayers } from "@/lib/ambience";

function WeatherParticles({ weather }: { weather: ReturnType<typeof getAmbienceLayers>["weather"] }) {
  if (weather === "clear") return null;

  const count = weather === "rain" ? 28 : 18;
  const cls = weather === "rain" ? "fall-straight" : "fall-sway";
  const glyph = weather === "rain" ? "|" : weather === "snow" ? "❄" : "✿";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`absolute text-[10px] text-cream-50/50 ${cls}`}
          style={{
            left: `${(i * 17) % 100}%`,
            animationDuration: `${4 + (i % 5) * 1.2}s`,
            animationDelay: `${-(i * 0.35) % 6}s`,
            fontSize: weather === "rain" ? 10 : 9,
          }}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}

export default function AmbienceLayers({ depthBlur = false }: { depthBlur?: boolean }) {
  const layers = useMemo(() => getAmbienceLayers(new Date(), depthBlur), [depthBlur]);

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{ background: layers.tint }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center 46%, transparent 0%, rgba(44,24,64,${layers.vignette * 0.55}) 58%, rgba(28,18,48,${layers.vignette}) 100%)`,
        }}
      />
      <WeatherParticles weather={layers.weather} />
      {layers.seasonal === "valentines" && (
        <div aria-hidden className="pointer-events-none absolute right-[8%] top-[18%] text-lg opacity-40">
          🌹
        </div>
      )}
      {layers.seasonal === "halloween" && (
        <div aria-hidden className="pointer-events-none absolute left-[6%] top-[22%] text-lg opacity-45">
          🎃
        </div>
      )}
      {layers.timePhase === "night" && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[14%] h-16 w-16 -translate-x-1/2 rounded-full bg-lavender-200/10 blur-xl"
        />
      )}
    </>
  );
}
