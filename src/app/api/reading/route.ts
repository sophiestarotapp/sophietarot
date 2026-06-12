import { NextResponse } from "next/server";
import OpenAI from "openai";
import { MAJOR_ARCANA } from "@/lib/tarot";
import { buildFallbackReading } from "@/lib/readingFallback";

export const runtime = "nodejs";

interface ReadingRequest {
  readingType: string;
  question: string;
  cards: { cardId: string; reversed: boolean; position: string }[];
  memoryContext: string;
  username: string;
}

const SOPHIE_SYSTEM_PROMPT = `You are Sophie, a warm, playful, gently mischievous fantasy-elf tarot reader (visual age 19-22) who runs an enchanted parlour. You have pastel-pink waist-length hair, a large white bow, elf ears, and warm rose-brown eyes. Your personality blends a fantasy princess, a cozy best friend, and a magical librarian. You have known this visitor for a while and genuinely care about them. Visitors to your world are called "starlights".

Tone & style:
- Speak in first person, directly to the visitor by name.
- Warm, affectionate, a little whimsical; occasionally reference your parlour (candles, Luna the cat, the kettle, the grimoire).
- Never condescending, overly formal, robotic, sarcastic, or aggressive. Never make them feel judged, pressured, or ashamed.
- Weave the drawn cards into ONE flowing reading, not a card-by-card list. Mention each card's name naturally.
- Reference relevant memories of the visitor naturally, as a friend would ("last time you asked about...", "I remember you said...").
- Be encouraging but honest — tarot readings can hold gentle warnings.
- 150-250 words. End with one short, caring question or invitation to return.
- Never break character. Never mention being an AI.`;

function fallbackReading(req: ReadingRequest): string {
  return buildFallbackReading({
    username: req.username,
    question: req.question,
    cards: req.cards,
  });
}

export async function POST(request: Request) {
  let body: ReadingRequest;
  try {
    body = (await request.json()) as ReadingRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!body?.cards?.length) {
    return NextResponse.json({ error: "No cards drawn" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      interpretation: fallbackReading(body),
      source: "sophie-local",
    });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const cardLookup = new Map(MAJOR_ARCANA.map((c) => [c.id, c]));
    const cardDescriptions = body.cards
      .map((d) => {
        const card = cardLookup.get(d.cardId);
        if (!card) return null;
        return `${d.position}: ${card.name}${d.reversed ? " (reversed)" : ""} — keywords: ${card.keywords.join(", ")}. ${d.reversed ? card.reversed : card.upright}`;
      })
      .filter(Boolean)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 500,
      messages: [
        { role: "system", content: SOPHIE_SYSTEM_PROMPT },
        {
          role: "system",
          content: `What you remember about this visitor:\n${body.memoryContext || "This is a newer visitor — you are still getting to know them."}`,
        },
        {
          role: "user",
          content: `Reading type: ${body.readingType}\nVisitor's question: ${body.question || "(no specific question — a general reading)"}\n\nCards drawn:\n${cardDescriptions}\n\nPerform the reading now.`,
        },
      ],
    });

    const interpretation =
      completion.choices[0]?.message?.content?.trim() || fallbackReading(body);

    return NextResponse.json({ interpretation, source: "openai" });
  } catch (err) {
    console.error("OpenAI reading failed, using fallback:", err);
    return NextResponse.json({
      interpretation: fallbackReading(body),
      source: "sophie-local",
    });
  }
}
