"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TarotCard from "@/components/tarot/TarotCard";

export function FaceDownCard({
  delay = 0,
  size = "md",
  shuffling = false,
  onTap,
}: {
  delay?: number;
  size?: "sm" | "md";
  shuffling?: boolean;
  onTap?: () => void;
}) {
  const dims =
    size === "md" ? "h-[6.3rem] w-[4.6rem] sm:h-[7.2rem] sm:w-[5.1rem]" : "h-20 w-[3.3rem]";
  const [lifted, setLifted] = useState(false);

  return (
    <motion.button
      type="button"
      aria-label="Tarot card"
      onClick={onTap}
      onPointerDown={() => setLifted(true)}
      onPointerUp={() => setLifted(false)}
      onPointerLeave={() => setLifted(false)}
      initial={{ y: 16, opacity: 0 }}
      animate={{
        x: shuffling ? [0, -42, 34, -18, 0] : 0,
        y: shuffling ? [0, -16, -8, -20, 0] : lifted ? -14 : [0, -5, 0],
        rotate: shuffling ? [0, -12, 10, -8, 0] : lifted ? -2 : 0,
        opacity: 1,
        scale: lifted ? 1.04 : 1,
        boxShadow: lifted
          ? "0 0 24px rgba(244,201,107,0.55), 0 14px 32px rgba(244,201,107,0.18)"
          : [
              "0 0 10px rgba(244,201,107,0.2), 0 8px 24px rgba(244,201,107,0.12)",
              "0 0 18px rgba(244,201,107,0.4), 0 10px 28px rgba(244,201,107,0.16)",
              "0 0 10px rgba(244,201,107,0.2), 0 8px 24px rgba(244,201,107,0.12)",
            ],
      }}
      transition={{
        opacity: { delay, duration: 0.5 },
        x: { duration: 0.65, ease: "easeInOut" },
        rotate: { duration: 0.65, ease: "easeInOut" },
        y: shuffling
          ? { duration: 0.65, ease: "easeInOut" }
          : { delay: delay + 0.5, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
        boxShadow: shuffling
          ? { duration: 0.65 }
          : { delay: delay + 0.5, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      whileHover={{ scale: 1.04, rotate: 1.5 }}
      className={`${dims} relative cursor-pointer overflow-hidden rounded-lg border-0 bg-transparent p-0 shadow-none`}
    >
      <TarotCard className="h-full w-full shadow-[0_8px_28px_rgba(244,201,107,0.22)]" priority={delay === 0.85} />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg"
        animate={{ opacity: [0.04, 0.12, 0.04] }}
        transition={{ duration: 2.8, repeat: Infinity, delay }}
        style={{ boxShadow: "inset 0 0 12px rgba(244,201,107,0.15)" }}
      />
    </motion.button>
  );
}

interface TarotTableProps {
  shuffling?: boolean;
  onStartReading?: () => void;
}

export default function TarotTable({ shuffling = false, onStartReading }: TarotTableProps) {
  return (
    <div className="pointer-events-none relative z-20 mx-auto w-full max-w-[min(88vw,500px)] overflow-visible pt-0">
      <div className="relative w-full">
        <div
          className="relative mx-auto h-24 rounded-[50%/55%] border-t-2 border-gold-300/45 shadow-[0_10px_34px_rgba(44,24,64,0.58),inset_0_4px_18px_rgba(247,183,216,0.07)] sm:h-28"
          style={{
            background:
              "radial-gradient(ellipse at 50% 12%, #6b4f8a 0%, #4a3568 38%, #392952 72%, #2a1d3f 100%)",
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-[68%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-[50%/55%] border border-gold-300/25" />
          <div className="absolute left-1/2 top-1/2 h-[50%] w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-[50%/55%] border border-dashed border-gold-300/15" />

          <div className="pointer-events-auto absolute left-1/2 top-[40%] flex -translate-x-1/2 -translate-y-1/2 items-end gap-2 sm:gap-2.5">
            <div className="-rotate-6">
              <FaceDownCard delay={0.85} shuffling={shuffling} onTap={onStartReading} />
            </div>
            <div className="-translate-y-1.5">
              <FaceDownCard delay={1} shuffling={shuffling} onTap={onStartReading} />
            </div>
            <div className="rotate-6">
              <FaceDownCard delay={1.15} shuffling={shuffling} onTap={onStartReading} />
            </div>
          </div>

          <span className="absolute bottom-2.5 left-[10%] text-lg drop-shadow-glow-gold sm:text-xl">🔮</span>
          <span className="absolute bottom-3 right-[10%] text-base sm:text-lg">🕯️</span>
        </div>
        <div className="mx-auto -mt-1.5 h-3 w-[68%] rounded-[50%] bg-plum-950/80 blur-sm" />
      </div>
    </div>
  );
}
