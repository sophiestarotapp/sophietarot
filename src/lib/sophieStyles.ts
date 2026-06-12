import { CANON_COLORS } from "./sophieCanon";

export type Rarity = "common" | "rare" | "sr" | "ssr" | "ur";

export interface SophieStyle {
  id: string;
  name: string;
  rarity: Rarity;
  /**
   * Outfit invariants (Character Generation System v1.0): pink hair, elf
   * ears, large bow, silhouette, and face are preserved across ALL styles.
   * Styles only re-theme outfit, accents, and the room.
   */
  hair: string;
  hairShade: string;
  dress: string;
  dressShade: string;
  accent: string;
  roomGlow: string;
  description: string;
  unlockBond: number; // 0 = owned by default; otherwise bond required
  /** Full-character sprite; when set, replaces the default Sophie art app-wide. */
  characterSrc?: string;
  /** Height / width ratio for the character sprite. */
  characterAspect?: number;
}

const HAIR = CANON_COLORS.hair;
const HAIR_SHADE = CANON_COLORS.hairShade;

export const SOPHIE_STYLES: SophieStyle[] = [
  {
    id: "classic",
    name: "Classic Sophie",
    rarity: "common",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#fff6f1", dressShade: "#f0ddd2",
    accent: "#f4c96b",
    roomGlow: "#cdb7f5",
    description: "Sophie as you first met her — pink waist-length hair, white blouse, pink ribbon, and her signature big white bow.",
    unlockBond: 0,
    characterSrc: "/sophie-character.png",
    characterAspect: 1.5127,
  },
  {
    id: "premium-dress",
    name: "Premium Dress",
    rarity: "ssr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#fce4f1", dressShade: "#d9577a",
    accent: "#f4c96b",
    roomGlow: "#f9e3b3",
    description: "A lavish pink and gold gown with layered ruffles, rose accents, and star-kissed drapery.",
    unlockBond: 0,
    characterSrc: "/sophie-premium-dress.png",
    characterAspect: 1.4413,
  },
  {
    id: "witch",
    name: "Witch Sophie",
    rarity: "rare",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#432857", dressShade: "#2c1840",
    accent: "#cdb7f5",
    roomGlow: "#8e6cc7",
    description: "Dark violet robes, a well-worn spellbook, and crystal jewellery for moonlit rituals.",
    unlockBond: 10,
  },
  {
    id: "princess",
    name: "Princess Sophie",
    rarity: "sr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#fce4f1", dressShade: "#f7b7d8",
    accent: "#f4c96b",
    roomGlow: "#f9e3b3",
    description: "A royal ballgown and tiara, fit for an enchanted ballroom.",
    unlockBond: 25,
  },
  {
    id: "celestial",
    name: "Celestial Sophie",
    rarity: "ssr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#2b3a78", dressShade: "#1d2a5c",
    accent: "#f4c96b",
    roomGlow: "#a8dfff",
    description: "Stars and moon motifs traced in gold — robes woven from the night sky itself.",
    unlockBond: 50,
  },
  {
    id: "academy",
    name: "Academy Sophie",
    rarity: "ur",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#5d3b78", dressShade: "#432857",
    accent: "#f4c96b",
    roomGlow: "#cdb7f5",
    description: "A magical student among the library stacks — books, ink, and enchanted spectacles.",
    unlockBond: 80,
  },
  {
    id: "summer",
    name: "Summer Sophie",
    rarity: "rare",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#bfeed5", dressShade: "#93d6b4",
    accent: "#ffd6c0",
    roomGlow: "#f4c96b",
    description: "A floral garden outfit in bright, sun-warmed colors.",
    unlockBond: 10,
  },
  {
    id: "winter",
    name: "Winter Sophie",
    rarity: "ssr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#a8dfff", dressShade: "#7e99cf",
    accent: "#fff6f1",
    roomGlow: "#a8dfff",
    description: "A cozy sweater, gentle snow effects, and the warmest lighting in the parlour.",
    unlockBond: 50,
  },
  {
    id: "valentine",
    name: "Valentine Sophie",
    rarity: "sr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#d9577a", dressShade: "#b03a5c",
    accent: "#fce4f1",
    roomGlow: "#efa6c6",
    description: "Rose lace and heart-shaped charms — the parlour smells of chocolate all month.",
    unlockBond: 25,
  },
  {
    id: "halloween",
    name: "Halloween Sophie",
    rarity: "ssr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#3a2a4a", dressShade: "#241730",
    accent: "#ff9d4d",
    roomGlow: "#ff9d4d",
    description: "Pumpkin ribbons, a tiny bat familiar, and candy hidden in every drawer.",
    unlockBond: 50,
  },
  {
    id: "christmas",
    name: "Christmas Sophie",
    rarity: "ssr",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#a8263c", dressShade: "#7e1b2d",
    accent: "#bfeed5",
    roomGlow: "#f4c96b",
    description: "Velvet red with white fur trim — she knits a stocking with your name on it.",
    unlockBond: 50,
  },
  {
    id: "anniversary",
    name: "Anniversary Sophie",
    rarity: "ur",
    hair: HAIR, hairShade: HAIR_SHADE,
    dress: "#f4c96b", dressShade: "#e0ab3f",
    accent: "#fff6f1",
    roomGlow: "#f9e3b3",
    description: "A gilded gown for the day the parlour first opened — worn only for the ones who stayed.",
    unlockBond: 80,
  },
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  rare: "Rare",
  sr: "SR",
  ssr: "SSR",
  ur: "UR",
};

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#c8c8d2",
  rare: "#a8dfff",
  sr: "#cdb7f5",
  ssr: "#f4c96b",
  ur: "#f7b7d8",
};

export function getStyle(id: string): SophieStyle {
  return SOPHIE_STYLES.find((s) => s.id === id) ?? SOPHIE_STYLES[0];
}
