"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getHotspotLine } from "@/lib/ambience";

type HotspotId = "window" | "bookshelf" | "crystal" | "candles" | "flowers";

const HOTSPOTS: { id: HotspotId; label: string; emoji: string; className: string }[] = [
  { id: "window", label: "Window", emoji: "🪟", className: "left-[18%] top-[22%] h-14 w-16 sm:left-[20%] sm:top-[20%] sm:h-16 sm:w-20" },
  { id: "bookshelf", label: "Bookshelf", emoji: "📚", className: "left-[4%] top-[38%] h-12 w-14 sm:left-[6%] sm:top-[36%]" },
  { id: "crystal", label: "Crystal ball", emoji: "🔮", className: "left-[22%] bottom-[34%] h-10 w-10 sm:bottom-[32%]" },
  { id: "candles", label: "Candles", emoji: "🕯️", className: "right-[20%] bottom-[36%] h-10 w-12 sm:right-[22%]" },
  { id: "flowers", label: "Flowers", emoji: "🌸", className: "right-[8%] top-[42%] h-10 w-10" },
];

export default function RoomHotspots({
  onSophieLine,
}: {
  onSophieLine: (line: string) => void;
}) {
  const [active, setActive] = useState<HotspotId | null>(null);

  const tap = useCallback(
    (id: HotspotId) => {
      setActive(id);
      onSophieLine(getHotspotLine(id));
      window.setTimeout(() => setActive(null), 1200);
    },
    [onSophieLine]
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[15]">
      {HOTSPOTS.map((h) => (
        <button
          key={h.id}
          type="button"
          aria-label={h.label}
          onClick={() => tap(h.id)}
          className={`pointer-events-auto absolute ${h.className} rounded-full border border-transparent transition hover:border-gold-300/35 hover:bg-blush-300/10 focus-visible:border-blush-300/50 focus-visible:outline-none`}
        >
          <AnimatePresence>
            {active === h.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-7 left-1/2 -translate-x-1/2 text-base drop-shadow-lg"
              >
                {h.emoji}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}
