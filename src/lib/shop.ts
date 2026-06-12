import type { Rarity } from "./sophieStyles";

export type ShopSection = "digital" | "physical" | "membership";

export interface ShopItem {
  id: string;
  section: ShopSection;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  /** USD price for physical goods / membership (handled via Stripe) */
  priceUsd?: number;
  grantsCollectibleId?: string;
  grantsStyleId?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  // ── Digital ──────────────────────────────────────────────
  { id: "dig-frame-rose", section: "digital", name: "Rose Garland Frame", description: "Adorn your profile with Sophie's garden roses.", icon: "🌹", rarity: "rare", grantsCollectibleId: "frame-rose" },
  { id: "dig-frame-moon", section: "digital", name: "Crescent Halo Frame", description: "A silver crescent for your portrait.", icon: "🌙", rarity: "sr", grantsCollectibleId: "frame-moon" },
  { id: "dig-teaset", section: "digital", name: "Stardust Tea Set", description: "Decorate the parlour table.", icon: "🫖", rarity: "sr", grantsCollectibleId: "deco-teaset" },
  { id: "dig-luna", section: "digital", name: "Companion: Luna", description: "Sophie's cat joins your collection.", icon: "🐈‍⬛", rarity: "ssr", grantsCollectibleId: "comp-luna" },
  { id: "dig-pip", section: "digital", name: "Companion: Pip", description: "A dawn-post owl of impeccable manners.", icon: "🦉", rarity: "sr", grantsCollectibleId: "comp-pip" },
  { id: "dig-theme-aurora", section: "digital", name: "Room Theme: Aurora", description: "Northern lights drift across the parlour ceiling.", icon: "🌌", rarity: "ssr" },
  { id: "dig-reading-eclipse", section: "digital", name: "Special Reading: Eclipse Rite", description: "A once-per-moon ritual reading of uncommon depth.", icon: "🌒", rarity: "ur" },
  // ── Physical ─────────────────────────────────────────────
  { id: "phy-deck", section: "physical", name: "Sophie's Tarot Deck", description: "78 gilt-edged cards, illustrated. Velvet pouch included.", icon: "🃏", rarity: "ssr", priceUsd: 39.99 },
  { id: "phy-plush", section: "physical", name: "Sophie Plushie", description: "30cm of huggable fortune-teller. Hat removable.", icon: "🧸", rarity: "ur", priceUsd: 34.99 },
  { id: "phy-luna-plush", section: "physical", name: "Luna Plushie", description: "Perpetually unimpressed. Perpetually soft.", icon: "🐈‍⬛", rarity: "ssr", priceUsd: 24.99 },
  { id: "phy-journal", section: "physical", name: "Moonpetal Journal", description: "A5 gilded journal for recording your readings.", icon: "📔", rarity: "rare", priceUsd: 19.99 },
  { id: "phy-hoodie", section: "physical", name: "Arcanum Academy Hoodie", description: "Lavender fleece, embroidered crest.", icon: "🧥", rarity: "sr", priceUsd: 54.99 },
  // ── Membership ───────────────────────────────────────────
  { id: "sub-moonkeeper", section: "membership", name: "Moonkeeper Membership", description: "Become a Moonkeeper: unlimited readings, advanced memory, premium stories, exclusive styles.", icon: "🌙", rarity: "ur", priceUsd: 9.99 },
];
