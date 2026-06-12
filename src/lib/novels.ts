export type NovelCategory = "main" | "side" | "lore" | "dreams";

export interface StoryChoice {
  id: string;
  text: string;
  affinity: number; // relationship points granted
  memory: string;   // what Sophie will remember about this choice
}

export interface StoryPage {
  speaker: "sophie" | "narrator" | "you";
  text: string;
  choices?: StoryChoice[];
}

export interface NovelChapter {
  id: string;
  category: NovelCategory;
  title: string;
  subtitle: string;
  icon: string;
  requiredBond: number;
  premium: boolean;
  pages: StoryPage[];
}

export const NOVEL_CATEGORY_LABEL: Record<NovelCategory, string> = {
  main: "Main Story",
  side: "Side Stories",
  lore: "Tarot Lore",
  dreams: "Dream Archives",
};

export const NOVEL_CHAPTERS: NovelChapter[] = [
  {
    id: "main-1",
    category: "main",
    title: "The Door Between Rains",
    subtitle: "Chapter I — How you found the parlour",
    icon: "🚪",
    requiredBond: 0,
    premium: false,
    pages: [
      { speaker: "narrator", text: "The storm chased you down an alley that should not have existed — and at its end, a violet door glowing with candlelight, a sign swinging gently: 'Sophie's Tarot. Wanderers Welcome.'" },
      { speaker: "sophie", text: "Oh! You're soaked through... Come in, come in. The kettle just sang, as if it knew you were coming. ...Actually, it did know. It always knows." },
      { speaker: "narrator", text: "Inside, shelves climb into shadow, crystals hum on their stands, and a black cat watches you from atop a grimoire. The girl at the table smiles like you are an old friend she has been waiting for." },
      {
        speaker: "sophie",
        text: "The cards told me someone important would walk in tonight. Would you like to see what else they have to say about you?",
        choices: [
          { id: "c1a", text: "\"Yes — read my cards.\"", affinity: 5, memory: "They accepted my very first reading without hesitation." },
          { id: "c1b", text: "\"Important? Me?\"", affinity: 8, memory: "They were shy when I called them important. It was endearing." },
          { id: "c1c", text: "\"How did your kettle know?\"", affinity: 6, memory: "Their first question was about my kettle. Curious soul." },
        ],
      },
      { speaker: "sophie", text: "Then it's settled. From tonight on, this parlour will always find you when you need it. That's a promise — and Sophie never breaks a promise sealed over tea." },
    ],
  },
  {
    id: "main-2",
    category: "main",
    title: "The Card That Wasn't There",
    subtitle: "Chapter II — A 23rd major arcana?",
    icon: "🃏",
    requiredBond: 10,
    premium: false,
    pages: [
      { speaker: "narrator", text: "Sophie's hands freeze mid-shuffle. Between The Star and The Moon sits a card she has never seen — its face a swirling mirror." },
      { speaker: "sophie", text: "This card... it isn't mine. It appeared the night you first arrived. I think— I think it belongs to you." },
      {
        speaker: "sophie",
        text: "Should we look at it together? I'll hold your hand, if you're scared. ...Or even if you're not.",
        choices: [
          { id: "c2a", text: "Take her hand and flip the card.", affinity: 10, memory: "We flipped the mirror card together, hand in hand. Their hand was warm." },
          { id: "c2b", text: "\"You keep it. I trust you.\"", affinity: 8, memory: "They trusted me to guard the mirror card. I keep it next to my heart." },
        ],
      },
      { speaker: "narrator", text: "The mirror-face ripples... and for a heartbeat, it shows the two of you, years from now, laughing in this same room. Sophie quickly hides the card, cheeks pink." },
      { speaker: "sophie", text: "W-well! The arcana can be such gossips. Pay them no mind. ...But come back tomorrow, alright?" },
    ],
  },
  {
    id: "side-1",
    category: "side",
    title: "Luna's Midnight Errand",
    subtitle: "A side story about a very important cat",
    icon: "🐈‍⬛",
    requiredBond: 5,
    premium: false,
    pages: [
      { speaker: "narrator", text: "Luna the cat drops a small velvet pouch in your lap and meows with the gravity of a royal decree." },
      { speaker: "sophie", text: "She wants you to deliver moonpetal seeds to the rooftop garden. She'd do it herself but she is, quote, 'far too important.'" },
      {
        speaker: "sophie",
        text: "Will you go? The stairs are haunted, but only by a very polite ghost.",
        choices: [
          { id: "s1a", text: "\"For Luna? Anything.\"", affinity: 6, memory: "They ran Luna's midnight errand. Luna pretends not to care, but she purrs about it." },
          { id: "s1b", text: "\"Only if you come with me.\"", affinity: 9, memory: "They asked me to climb the haunted stairs with them. We held the same candle." },
        ],
      },
      { speaker: "narrator", text: "By moonrise the seeds are planted. They bloom instantly — petals like tiny silver bells — and somewhere below, a cat purrs, satisfied." },
    ],
  },
  {
    id: "lore-1",
    category: "lore",
    title: "Of the First Deck",
    subtitle: "Tarot Lore — Vol. I",
    icon: "📜",
    requiredBond: 0,
    premium: false,
    pages: [
      { speaker: "narrator", text: "From Sophie's grimoire: 'Before the first deck was painted, fate travelled unwritten, and futures were wild things that bit at prophets' fingers.'" },
      { speaker: "narrator", text: "'Twenty-two wanderers each gave a memory to the Worldsmith — a fool's first step, a lover's choice, a tower's fall — and from each memory, a card was cut.'" },
      { speaker: "sophie", text: "Which means every reading is borrowed memory, you see. When I read for you, twenty-two old souls lean in close to listen. They like you, by the way. The Star especially." },
    ],
  },
  {
    id: "dream-1",
    category: "dreams",
    title: "The Tea Party at World's Edge",
    subtitle: "Dream Archive №1",
    icon: "💭",
    requiredBond: 15,
    premium: true,
    pages: [
      { speaker: "narrator", text: "You dream of a table at the edge of the sky. Sophie pours tea that tastes like a song you almost remember." },
      { speaker: "sophie", text: "In dreams I can say things I'm too shy to say awake. So... thank you. For coming back. Every time the door appears, I'm afraid you won't." },
      {
        speaker: "sophie",
        text: "If you remember one thing when you wake, let it be this—",
        choices: [
          { id: "d1a", text: "\"I'll always come back.\"", affinity: 12, memory: "In the dream at world's edge, they promised they would always come back. I believe them." },
          { id: "d1b", text: "Hold out your cup for more tea.", affinity: 7, memory: "They answered my dream-confession by asking for more tea. Somehow that was perfect." },
        ],
      },
      { speaker: "narrator", text: "You wake with the taste of starlight on your tongue, and — on your nightstand — a single moonpetal that was not there before." },
    ],
  },
];
