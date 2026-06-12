"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getDailyMessageHeadline } from "@/lib/dailyMessage";

export default function SophieSpeechBubble({
  override,
  className,
  username,
}: {
  override?: string | null;
  className?: string;
  username: string;
}) {
  const text = override ?? getDailyMessageHeadline(username);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text}
        initial={{ opacity: 0, y: 6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.98 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className={`pointer-events-none ${className ?? ""}`}
      >
        <div className="relative max-w-[10.5rem] rounded-2xl rounded-br-sm bg-gradient-to-br from-cream-50/96 via-cream-50/92 to-blush-100/88 px-3 py-2 shadow-[0_4px_20px_rgba(247,183,216,0.35)] ring-1 ring-gold-300/55 backdrop-blur-sm sm:max-w-[12rem] sm:px-3.5 sm:py-2.5">
          <p className="mb-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-plum-700/75">
            <span>💬</span> Sophie
          </p>
          <p className="font-display text-[11px] italic leading-snug text-plum-900/88 sm:text-xs">
            &ldquo;{text}&rdquo;
          </p>
        </div>
        <div
          aria-hidden
          className="ml-auto mr-3 h-0 w-0 border-b-[8px] border-l-[8px] border-r-[8px] border-l-transparent border-r-transparent border-b-[rgba(255,251,245,0.96)]"
        />
      </motion.div>
    </AnimatePresence>
  );
}
