"use client";

import TarotCardBack from "@/components/tarot/TarotCardBack";

interface TarotCardProps {
  className?: string;
  reversed?: boolean;
  priority?: boolean;
  design?: "rose" | "moonlit";
  children?: React.ReactNode;
}

/** Official Sophie tarot card shell — card art with optional face overlay. */
export default function TarotCard({
  className,
  reversed,
  priority,
  children,
}: TarotCardProps) {
  return (
    <div
      className={`relative h-full w-full isolate overflow-hidden rounded-lg border border-gold-300/70 bg-transparent shadow-card ${
        reversed ? "rotate-180" : ""
      } ${className ?? ""}`}
    >
      <TarotCardBack className="rounded-lg" priority={priority} />
      {children ? (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-between p-1.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}
