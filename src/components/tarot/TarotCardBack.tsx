"use client";

import Image from "next/image";

export const TAROT_CARD_BACK_SRC = "/tarot/card-back.png";

interface TarotCardBackProps {
  className?: string;
  priority?: boolean;
}

/** Official Sophie tarot card back art. Parent must be `relative` with defined size. */
export default function TarotCardBack({ className, priority }: TarotCardBackProps) {
  return (
    <Image
      src={TAROT_CARD_BACK_SRC}
      alt=""
      aria-hidden
      fill
      sizes="(max-width: 640px) 240px, 384px"
      quality={95}
      priority={priority}
      draggable={false}
      className={`tarot-card-art object-cover ${className ?? ""}`}
    />
  );
}
