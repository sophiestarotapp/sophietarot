/**
 * Dynamic Environment System — time of day, season, weather, presence status,
 * and mood-driven UI theming. Deterministic per calendar day.
 */

import type { SophieEmotion } from "./sophieCanon";

export type TimePhase = "morning" | "afternoon" | "evening" | "night";
export type SeasonalEvent =
  | "none"
  | "lunar-new-year"
  | "valentines"
  | "halloween"
  | "christmas";
export type Weather = "clear" | "rain" | "snow" | "petals";

export interface EmotionalStatus {
  icon: string;
  text: string;
  emotion: SophieEmotion;
}

export interface MoodTheme {
  chipClass: string;
  particleBoost: boolean;
  roomTint: string;
}

export interface AmbienceLayers {
  timePhase: TimePhase;
  seasonal: SeasonalEvent;
  weather: Weather;
  /** CSS filter stack on the room image */
  roomFilter: string;
  /** Gradient overlay tint */
  tint: string;
  /** Vignette strength 0–1 */
  vignette: number;
}

export interface PresenceContext {
  dailyGiftClaimed?: boolean;
  hasUnreadLetter?: boolean;
  readingsToday?: number;
}

/** Stable per-day number for deterministic daily variation. */
export function dayHash(date = new Date()): number {
  const n = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  let x = n ^ 0x5f356495;
  x = (x ^ (x << 13)) & 0x7fffffff;
  x = (x ^ (x >> 17)) & 0x7fffffff;
  return Math.abs(x);
}

export function getTimePhase(date = new Date()): TimePhase {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

export function getSeasonalEvent(date = new Date()): SeasonalEvent {
  const m = date.getMonth();
  if (m === 0) return "lunar-new-year";
  if (m === 1) return "valentines";
  if (m === 9) return "halloween";
  if (m === 11) return "christmas";
  return "none";
}

export function getWeather(date = new Date()): Weather {
  const m = date.getMonth();
  const h = dayHash(date);
  if (m === 11 || m === 0 || m === 1) return h % 3 === 0 ? "clear" : "snow";
  if (m >= 2 && m <= 4) return h % 3 === 0 ? "petals" : "clear";
  return h % 5 === 0 ? "rain" : "clear";
}

const PRESENCE_POOL: EmotionalStatus[] = [
  { icon: "✨", text: "Preparing today's reading", emotion: "excited" },
  { icon: "💖", text: "Thinking about you", emotion: "love" },
  { icon: "📚", text: "Organizing new stories", emotion: "curious" },
  { icon: "🔮", text: "Drew a card for you", emotion: "happy" },
  { icon: "💌", text: "Wrote you a letter", emotion: "love" },
  { icon: "🫖", text: "Brewing your favourite tea", emotion: "neutral" },
  { icon: "🌸", text: "Feeling cheerful today", emotion: "playful" },
  { icon: "🌷", text: "Saved your seat by the window", emotion: "happy" },
  { icon: "✦", text: "Polishing the crystal ball", emotion: "curious" },
  { icon: "🕯️", text: "Lighting the candles for you", emotion: "neutral" },
];

/** Sophie's presence line under the logo — context-aware when possible. */
export function getPresenceStatus(
  date = new Date(),
  ctx: PresenceContext = {}
): EmotionalStatus {
  const phase = getTimePhase(date);

  if (ctx.hasUnreadLetter) {
    return { icon: "🔔", text: "You have notifications", emotion: "love" };
  }
  if (phase === "night") {
    return { icon: "🌙", text: "Waiting for you", emotion: "sleepy" };
  }
  if (phase === "morning") {
    return { icon: "🌅", text: "Good morning, starlight", emotion: "happy" };
  }
  if (phase === "evening") {
    return { icon: "🕯️", text: "The parlour is warm tonight", emotion: "neutral" };
  }

  return PRESENCE_POOL[dayHash(date) % PRESENCE_POOL.length];
}

/** @deprecated use getPresenceStatus */
export function getEmotionalStatus(date = new Date()): EmotionalStatus {
  return getPresenceStatus(date);
}

export function getMoodTheme(emotion: SophieEmotion): MoodTheme {
  switch (emotion) {
    case "sleepy":
      return {
        chipClass: "text-lavender-200/90",
        particleBoost: false,
        roomTint: "rgba(120, 90, 180, 0.12)",
      };
    case "excited":
    case "playful":
      return {
        chipClass: "text-blush-200",
        particleBoost: true,
        roomTint: "rgba(247, 183, 216, 0.14)",
      };
    case "love":
    case "happy":
      return {
        chipClass: "text-blush-200/95",
        particleBoost: true,
        roomTint: "rgba(255, 200, 210, 0.1)",
      };
    case "concerned":
    case "sad":
      return {
        chipClass: "text-cream-100/75",
        particleBoost: false,
        roomTint: "rgba(80, 60, 110, 0.18)",
      };
    case "curious":
      return {
        chipClass: "text-lavender-200/90",
        particleBoost: false,
        roomTint: "rgba(185, 156, 228, 0.1)",
      };
    default:
      return {
        chipClass: "text-cream-100/85",
        particleBoost: false,
        roomTint: "rgba(44, 24, 64, 0.08)",
      };
  }
}

/** Room image treatment — ~70% clarity on home (soft vignette, minimal blur). */
export function getAmbienceLayers(date = new Date(), depthBlur = false): AmbienceLayers {
  const timePhase = getTimePhase(date);
  const seasonal = getSeasonalEvent(date);
  const weather = getWeather(date);

  let tint = "transparent";
  let roomFilter = depthBlur ? "brightness(0.94) saturate(1.05)" : "brightness(1) saturate(1.02)";
  let vignette = depthBlur ? 0.28 : 0.12;

  switch (timePhase) {
    case "morning":
      tint = "linear-gradient(180deg, rgba(255,220,160,0.22) 0%, transparent 42%, rgba(255,200,140,0.08) 100%)";
      roomFilter = depthBlur ? "brightness(0.96) saturate(1.08) sepia(0.06)" : roomFilter;
      break;
    case "afternoon":
      tint = "linear-gradient(180deg, rgba(255,240,210,0.1) 0%, transparent 50%)";
      break;
    case "evening":
      tint = "linear-gradient(180deg, rgba(255,170,120,0.16) 0%, transparent 40%, rgba(120,80,160,0.12) 100%)";
      roomFilter = depthBlur ? "brightness(0.9) saturate(1.05) sepia(0.08)" : roomFilter;
      break;
    case "night":
      tint = "linear-gradient(180deg, rgba(80,60,140,0.2) 0%, transparent 45%, rgba(20,10,40,0.35) 100%)";
      roomFilter = depthBlur ? "brightness(0.82) saturate(0.95) hue-rotate(-8deg)" : "brightness(0.88) saturate(0.96)";
      vignette = depthBlur ? 0.38 : 0.22;
      break;
  }

  if (seasonal === "valentines") {
    tint = `${tint}, linear-gradient(135deg, rgba(255,120,160,0.12), transparent 60%)`;
  } else if (seasonal === "halloween") {
    tint = `${tint}, linear-gradient(180deg, rgba(120,60,20,0.15), transparent 55%)`;
  } else if (seasonal === "christmas") {
    tint = `${tint}, linear-gradient(180deg, rgba(200,40,50,0.08), transparent 40%, rgba(40,120,60,0.08) 100%)`;
  }

  if (weather === "rain") {
    roomFilter += " contrast(1.02)";
  }

  return { timePhase, seasonal, weather, roomFilter, tint, vignette };
}

export const HOTSPOT_LINES: Record<string, string[]> = {
  window: [
    "It's beautiful tonight — the stars feel close enough to touch.",
    "Rain is tapping the glass. Perfect reading weather.",
    "The moonlight makes the stained glass glow.",
  ],
  bookshelf: [
    "I reorganized the grimoires today. The Moon volume keeps falling open.",
    "There's a story here with your name written in the margins… metaphorically.",
  ],
  crystal: [
    "The crystal is warm. That usually means someone's thinking of you.",
    "I saw a little spark in the orb when you arrived.",
  ],
  candles: [
    "I lit these for you. The flame turned pink — a good sign.",
    "The candles smell like roses and old parchment.",
  ],
  flowers: [
    "Fresh petals today. They always bloom when visitors I like arrive.",
  ],
};

export function getHotspotLine(id: keyof typeof HOTSPOT_LINES, date = new Date()): string {
  const lines = HOTSPOT_LINES[id];
  return lines[dayHash(date) % lines.length];
}
