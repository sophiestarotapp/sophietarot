import type { Rarity } from "./sophieStyles";

export type CollectibleCategory =
  | "tarot-cards"
  | "outfits"
  | "frames"
  | "decorations"
  | "stickers"
  | "companions";

export interface Collectible {
  id: string;
  name: string;
  category: CollectibleCategory;
  rarity: Rarity;
  icon: string;
  description: string;
}

export const CATEGORY_LABEL: Record<CollectibleCategory, string> = {
  "tarot-cards": "Tarot Cards",
  outfits: "Outfits",
  frames: "Frames",
  decorations: "Decorations",
  stickers: "Stickers",
  companions: "Companions",
};

export const COLLECTIBLES: Collectible[] = [
  // Frames
  { id: "frame-rose", name: "Rose Garland Frame", category: "frames", rarity: "rare", icon: "🌹", description: "A profile frame of woven roses from Sophie's garden." },
  { id: "frame-moon", name: "Crescent Halo Frame", category: "frames", rarity: "sr", icon: "🌙", description: "A silver crescent that hums softly at midnight." },
  { id: "frame-gold", name: "Gilded Arcana Frame", category: "frames", rarity: "ssr", icon: "👑", description: "Reserved for those whom the cards favour." },
  // Decorations
  { id: "deco-crystal", name: "Amethyst Cluster", category: "decorations", rarity: "common", icon: "🔮", description: "Glows faintly when Sophie laughs." },
  { id: "deco-candles", name: "Everburn Candles", category: "decorations", rarity: "rare", icon: "🕯️", description: "They never melt, only flicker in greeting." },
  { id: "deco-grimoire", name: "The First Grimoire", category: "decorations", rarity: "ur", icon: "📖", description: "Sophie's oldest spellbook. Some pages turn themselves." },
  { id: "deco-teaset", name: "Stardust Tea Set", category: "decorations", rarity: "sr", icon: "🫖", description: "The tea always tastes like your favourite memory." },
  // Stickers
  { id: "stick-wink", name: "Sophie Wink", category: "stickers", rarity: "common", icon: "😉", description: "A playful wink for your messages." },
  { id: "stick-heart", name: "Sealed With Magic", category: "stickers", rarity: "common", icon: "💜", description: "A kiss of lavender light." },
  { id: "stick-cry", name: "Comfort Tears", category: "stickers", rarity: "rare", icon: "🥺", description: "For days when the cards are heavy." },
  // Companions
  { id: "comp-luna", name: "Luna the Cat", category: "companions", rarity: "ssr", icon: "🐈‍⬛", description: "Sophie's black cat. She judges your card pulls, lovingly." },
  { id: "comp-pip", name: "Pip the Owl", category: "companions", rarity: "sr", icon: "🦉", description: "Delivers Sophie's letters at dawn." },
  { id: "comp-ember", name: "Ember the Fox Spirit", category: "companions", rarity: "ur", icon: "🦊", description: "A spirit of the hearth who adores being admired." },
  // Outfit tokens (mirrors of style unlocks)
  { id: "outfit-witch", name: "Witch Wardrobe Token", category: "outfits", rarity: "rare", icon: "🧙‍♀️", description: "Proof of Witch Sophie's wardrobe." },
  { id: "outfit-celestial", name: "Celestial Wardrobe Token", category: "outfits", rarity: "ssr", icon: "🌌", description: "Proof of Celestial Sophie's wardrobe." },
];

/** Tarot card collectibles are generated from the deck — collected by drawing them in readings. */
export const TAROT_COLLECTIBLE_PREFIX = "card-";
