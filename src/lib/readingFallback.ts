import { MAJOR_ARCANA } from "@/lib/tarot";

export interface FallbackReadingInput {
  username: string;
  question: string;
  cards: { cardId: string; reversed: boolean; position: string }[];
}

/** Local Sophie reading when AI or the network is unavailable. */
export function buildFallbackReading(req: FallbackReadingInput): string {
  const cardLookup = new Map(MAJOR_ARCANA.map((c) => [c.id, c]));
  const lines: string[] = [];
  const name = req.username || "dear starlight";

  lines.push(
    `Mm... lean in close, ${name}. The candles just steadied — the cards are ready to speak.`
  );

  for (const drawn of req.cards) {
    const card = cardLookup.get(drawn.cardId);
    if (!card) continue;
    const meaning = drawn.reversed ? card.reversed : card.upright;
    lines.push(
      `For **${drawn.position}**, ${card.name}${drawn.reversed ? ", reversed," : ""} appears. ${meaning}`
    );
  }

  if (req.question) {
    lines.push(
      `Held against your question — “${req.question}” — I feel the cards leaning toward gentleness rather than alarm. Move with intention, not haste.`
    );
  }

  lines.push(
    `That's what the arcana whisper tonight, ${name}. Will you come tell me how it unfolds? Luna will save your seat. 🌙`
  );

  return lines.join("\n\n");
}
