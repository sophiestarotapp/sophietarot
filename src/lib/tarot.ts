export interface TarotCard {
  id: string;
  name: string;
  numeral: string;
  symbol: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export interface DrawnCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

export interface ReadingType {
  id: string;
  name: string;
  tagline: string;
  cardCount: number;
  positions: string[];
  premium: boolean;
  icon: string;
  /** Unlocked by purchasing this shop item id */
  shopItemId?: string;
}

export function isReadingUnlocked(
  type: ReadingType,
  opts: { isPremium: boolean; purchasedShopItemIds: string[] }
) {
  if (type.shopItemId) {
    return opts.purchasedShopItemIds.includes(type.shopItemId) || opts.isPremium;
  }
  if (type.premium) return opts.isPremium;
  return true;
}

export const MAJOR_ARCANA: TarotCard[] = [
  { id: "fool", name: "The Fool", numeral: "0", symbol: "🌸", keywords: ["beginnings", "innocence", "leap of faith"], upright: "A fresh chapter is opening before you — step forward with an open heart, even if the path is unclear.", reversed: "Hesitation or recklessness clouds a new start. Pause and ask what you are truly afraid of." },
  { id: "magician", name: "The Magician", numeral: "I", symbol: "✨", keywords: ["manifestation", "willpower", "skill"], upright: "Everything you need is already in your hands. Focus your intention and the universe will answer.", reversed: "Scattered energy or self-doubt is diluting your power. Gather yourself before you act." },
  { id: "high-priestess", name: "The High Priestess", numeral: "II", symbol: "🌙", keywords: ["intuition", "mystery", "inner voice"], upright: "Your intuition already knows the answer. Be still, and listen to the whisper beneath the noise.", reversed: "You may be ignoring your inner voice in favour of others' opinions. Return to your own knowing." },
  { id: "empress", name: "The Empress", numeral: "III", symbol: "🌹", keywords: ["abundance", "nurture", "creativity"], upright: "Abundance is blooming around you. Nurture what you love and let yourself receive softness.", reversed: "You have been giving more than you receive. Tend to your own garden before another's." },
  { id: "emperor", name: "The Emperor", numeral: "IV", symbol: "🏰", keywords: ["structure", "stability", "authority"], upright: "Strong foundations will carry your dreams. Bring order and discipline to what matters most.", reversed: "Rigidity or control — yours or another's — is constraining growth. Loosen your grip gently." },
  { id: "hierophant", name: "The Hierophant", numeral: "V", symbol: "🕯️", keywords: ["tradition", "guidance", "belief"], upright: "Wisdom from a teacher, tradition, or trusted path offers grounding now. Learning is sacred.", reversed: "It is time to question inherited rules and find a belief that is genuinely yours." },
  { id: "lovers", name: "The Lovers", numeral: "VI", symbol: "💞", keywords: ["love", "union", "choice"], upright: "A meaningful union or heartfelt choice stands before you. Choose with your whole heart.", reversed: "Disharmony or avoidance of a choice creates distance. Honesty will restore the bond." },
  { id: "chariot", name: "The Chariot", numeral: "VII", symbol: "🌠", keywords: ["determination", "victory", "drive"], upright: "Direct your will like an arrow — momentum is on your side and victory is within reach.", reversed: "Forces pull you in opposing directions. Reclaim the reins before pressing forward." },
  { id: "strength", name: "Strength", numeral: "VIII", symbol: "🦁", keywords: ["courage", "compassion", "patience"], upright: "True strength is gentle. Your patience and compassion will tame what force cannot.", reversed: "Self-doubt gnaws at your courage. Be as kind to yourself as you are to others." },
  { id: "hermit", name: "The Hermit", numeral: "IX", symbol: "🏮", keywords: ["solitude", "reflection", "wisdom"], upright: "Step back into quiet. The answer you seek glows softly within, waiting for stillness.", reversed: "Isolation has tipped into loneliness. Let a trusted light back into your world." },
  { id: "wheel", name: "Wheel of Fortune", numeral: "X", symbol: "🎡", keywords: ["fate", "cycles", "turning point"], upright: "The wheel turns in your favour. Embrace the change — destiny is rearranging the board.", reversed: "A cycle resists closing. Release what you cannot control and the wheel will move again." },
  { id: "justice", name: "Justice", numeral: "XI", symbol: "⚖️", keywords: ["truth", "fairness", "balance"], upright: "Truth surfaces and balance is restored. Act with integrity and the scales tip your way.", reversed: "An unfairness or avoided truth weighs on you. Face it honestly to be free of it." },
  { id: "hanged-man", name: "The Hanged Man", numeral: "XII", symbol: "🌀", keywords: ["surrender", "new perspective", "pause"], upright: "Surrender the struggle. Seen from another angle, this pause is actually a gift.", reversed: "You are clinging to a stalled situation. Release it, and movement returns." },
  { id: "death", name: "Death", numeral: "XIII", symbol: "🦋", keywords: ["transformation", "endings", "rebirth"], upright: "Something is ending so something truer can begin. Let the old self be carried away kindly.", reversed: "Resisting a necessary ending prolongs the ache. Trust the transformation already underway." },
  { id: "temperance", name: "Temperance", numeral: "XIV", symbol: "🕊️", keywords: ["harmony", "moderation", "alchemy"], upright: "Blend opposites with patience and grace — the middle path is where your magic mixes.", reversed: "Excess in one area unbalances the whole. Pour a little less, breathe a little more." },
  { id: "devil", name: "The Devil", numeral: "XV", symbol: "⛓️", keywords: ["attachment", "shadow", "temptation"], upright: "Look honestly at what binds you. The chain is looser than it appears — you can lift it off.", reversed: "You are already breaking free of an old pattern. Keep walking toward the light." },
  { id: "tower", name: "The Tower", numeral: "XVI", symbol: "⚡", keywords: ["upheaval", "revelation", "awakening"], upright: "A sudden truth shakes a false foundation. What remains standing afterwards is real.", reversed: "You sense the tremor coming and resist it. A gentle, chosen change spares a harsher one." },
  { id: "star", name: "The Star", numeral: "XVII", symbol: "⭐", keywords: ["hope", "healing", "renewal"], upright: "After the storm, the sky clears. Hope is not naive — it is your compass. Healing has begun.", reversed: "Your light feels dim, but it is not gone. Small acts of self-kindness rekindle faith." },
  { id: "moon", name: "The Moon", numeral: "XVIII", symbol: "🌕", keywords: ["illusion", "dreams", "subconscious"], upright: "Not everything is as it appears. Move slowly through the fog and trust your dreams' messages.", reversed: "Confusion lifts; a hidden fear loses its power once named in the light." },
  { id: "sun", name: "The Sun", numeral: "XIX", symbol: "☀️", keywords: ["joy", "vitality", "success"], upright: "Pure warmth shines on you — joy, success, and clarity arrive together. Let yourself be radiant.", reversed: "Joy hides behind a cloud of doubt. It is still there; step toward what makes you feel alive." },
  { id: "judgement", name: "Judgement", numeral: "XX", symbol: "🎺", keywords: ["awakening", "calling", "renewal"], upright: "A calling rises within you. Forgive the past, answer the summons, and rise renewed.", reversed: "Harsh self-judgement drowns out your calling. Grant yourself the mercy you deserve." },
  { id: "world", name: "The World", numeral: "XXI", symbol: "🌍", keywords: ["completion", "wholeness", "celebration"], upright: "A great cycle completes in triumph. Celebrate how far you have come — you are whole.", reversed: "Completion waits on one final, avoided step. Finish it, and the circle closes beautifully." },
];

export const CUSTOM_READING: ReadingType = {
  id: "custom",
  name: "Custom Reading",
  tagline: "Ask Sophie anything",
  cardCount: 3,
  positions: ["Heart of the Matter", "What Crosses You", "Sophie's Counsel"],
  premium: false,
  icon: "💌",
};

/** @deprecated Reading selection removed — app uses custom readings only. */
export const READING_TYPES: ReadingType[] = [CUSTOM_READING];

export function shuffleDeck(): TarotCard[] {
  const deck = [...MAJOR_ARCANA];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function drawCards(type: ReadingType): DrawnCard[] {
  const deck = shuffleDeck();
  return type.positions.map((position, i) => ({
    card: deck[i],
    reversed: Math.random() < 0.3,
    position,
  }));
}
