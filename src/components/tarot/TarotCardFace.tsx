"use client";

import TarotCard from "@/components/tarot/TarotCard";
import type { TarotCard as TarotCardData } from "@/lib/tarot";

interface TarotCardFaceProps {
  card: TarotCardData;
  reversed?: boolean;
  className?: string;
}

export default function TarotCardFace({ card, reversed, className }: TarotCardFaceProps) {
  return (
    <TarotCard reversed={reversed} className={className}>
      <span className="rounded-full bg-plum-950/55 px-1.5 py-0.5 font-display text-[9px] font-bold tracking-wider text-cream-50">
        {card.numeral}
      </span>
      <span className="drop-shadow-[0_2px_6px_rgba(28,18,48,0.85)] text-2xl">{card.symbol}</span>
      <span className="rounded-full bg-plum-950/55 px-1.5 py-0.5 text-center font-display text-[9px] font-bold leading-tight text-cream-50">
        {card.name}
      </span>
    </TarotCard>
  );
}
