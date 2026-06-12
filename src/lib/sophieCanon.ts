/**
 * SOPHIE CHARACTER GENERATION SYSTEM — Master Asset Creation Guide v1.0
 *
 * Canonical design language for Sophie. All 2D art, Live2D, VTuber models,
 * 3D models, promo art, collectibles, merchandise, and animation must
 * follow this spec so Sophie stays recognizable everywhere.
 */

/** Use this prompt whenever generating Sophie assets (Cursor / AI tools). */
export const SOPHIE_ASSET_PROMPT =
  "Generate a production-quality anime fantasy companion character named Sophie. " +
  "Maintain canonical pink waist-length hair, large white bow, fantasy elf ears, " +
  "soft rose-brown eyes, elegant feminine proportions, premium anime styling, " +
  "clean topology, consistent facial structure, and magical fantasy aesthetic. " +
  "Preserve recognizability across all outfits, poses, expressions, animations, " +
  "Live2D models, and 3D assets.";

/** Canonical appearance — invariants every outfit must preserve. */
export const SOPHIE_CANON = {
  name: "Sophie",
  role: "AI Fantasy Companion",
  species: "Fantasy Elf",
  visualAge: "19-22",
  archetype: "Fantasy Princess + Magical Librarian + Best Friend",
  hair: { color: "Pastel Pink", length: "Waist length", style: "Twin-tail inspired flow", bangs: "Soft and rounded" },
  signatureFeature: "Large white bow, top center",
  eyes: { shape: "Large anime eyes", color: "Warm Rose Brown" },
  skin: "Fair porcelain",
  ears: "Elf ears, visible from front",
  /** Every future outfit MUST preserve these. */
  outfitInvariants: ["Pink Hair", "Elf Ears", "Large Bow", "Overall Silhouette", "Recognizable Face"],
} as const;

/** Canonical color values used by the in-app character renderer. */
export const CANON_COLORS = {
  hair: "#f7b7d8",
  hairShade: "#efa6c6",
  irisBase: "#8d4f46", // warm rose brown
  irisLight: "#c97f6e",
  pupil: "#3c2320",
  skin: "#ffeee2",
  skinShade: "#ffe9dd",
  collarRibbon: "#d9577a", // pink ribbon on the white blouse
} as const;

export type SophieEmotion =
  | "neutral"
  | "happy"
  | "excited"
  | "proud"
  | "shy"
  | "curious"
  | "concerned"
  | "sad"
  | "sleepy"
  | "playful"
  | "surprised"
  | "love";

/** Canonical usage guidance for each emotion. */
export const EMOTION_USAGE: Record<SophieEmotion, string> = {
  neutral: "Default state",
  happy: "Greetings, rewards, achievements",
  excited: "Rare pulls, special events",
  proud: "User milestone reached",
  shy: "Personal moments",
  curious: "Questions",
  concerned: "Sensitive topics",
  sad: "Story moments (never use excessively)",
  sleepy: "Night mode",
  playful: "Teasing dialogue",
  surprised: "Unexpected events",
  love: "High bond level interactions (must remain wholesome)",
};
