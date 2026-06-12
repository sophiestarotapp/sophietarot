/**
 * Relationship System — bond points are tracked internally but never
 * surfaced as raw numbers. Users see a gentle Relationship Status instead.
 * Display subtly; never gamify aggressively.
 */

export interface RelationshipTier {
  min: number;
  name: string;
  icon: string;
  whisper: string; // how Sophie describes it
}

export const RELATIONSHIP_TIERS: RelationshipTier[] = [
  { min: 0, name: "Acquaintance", icon: "🌱", whisper: "We've only just met... but the cards already like you." },
  { min: 10, name: "Friend", icon: "🌸", whisper: "I save your seat by the window now." },
  { min: 30, name: "Trusted Friend", icon: "🌷", whisper: "I tell you things I don't tell the cards." },
  { min: 60, name: "Close Companion", icon: "💞", whisper: "The parlour feels different when you're away." },
  { min: 100, name: "Moonbound", icon: "🌙", whisper: "Some threads the arcana cannot cut." },
  { min: 150, name: "Starlight Soul", icon: "✨", whisper: "You and I were written in the same constellation." },
];

export function getRelationship(bond: number): RelationshipTier {
  let current = RELATIONSHIP_TIERS[0];
  for (const tier of RELATIONSHIP_TIERS) {
    if (bond >= tier.min) current = tier;
  }
  return current;
}

export function getNextRelationship(bond: number): RelationshipTier | null {
  return RELATIONSHIP_TIERS.find((t) => t.min > bond) ?? null;
}
