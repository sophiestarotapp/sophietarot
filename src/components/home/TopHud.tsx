"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSophieStore, xpForLevel } from "@/lib/store";
import { getRelationship } from "@/lib/relationship";

function PlayerBadge() {
  const { username, level, xp, bond, setUsername } = useSophieStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(username);
  const need = xpForLevel(level);
  const relationship = getRelationship(bond);

  return (
    <div className="glass-panel flex items-center gap-1.5 rounded-xl px-1.5 py-1 shadow-glow-pink/20 sm:gap-2 sm:px-2 sm:py-1.5">
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blush-200 via-blush-300 to-lavender-300 ring-2 ring-gold-300/55 shadow-glow-pink sm:h-8 sm:w-8">
        <span className="absolute top-0 text-[8px]">🎀</span>
        <span className="mt-1 text-sm">✦</span>
      </div>
      <div className="min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => {
              setUsername(draft);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setUsername(draft);
                setEditing(false);
              }
            }}
            maxLength={20}
            className="w-24 rounded-md bg-plum-950/60 px-1.5 py-0.5 text-xs font-semibold text-cream-50 outline-none ring-1 ring-gold-300/50 sm:w-28 sm:text-sm"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(username);
              setEditing(true);
            }}
            className="block max-w-20 truncate text-left text-xs font-bold text-cream-50 hover:underline sm:max-w-24 sm:text-[0.8rem]"
            title="Tap to change your name"
          >
            {username} ✦
          </button>
        )}
        <p className="-mt-0.5 text-[8px] font-medium tracking-wide text-blush-200/90 sm:text-[9px]">
          {relationship.icon} {relationship.name}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="text-[7px] font-bold tracking-wider gold-text sm:text-[8px]">LV {level}</span>
          <div className="h-1 w-10 overflow-hidden rounded-full bg-plum-950/70 sm:w-12">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-gold-300 to-blush-300"
              animate={{ width: `${Math.min(100, (xp / need) * 100)}%` }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TopHud() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-2 pt-1.5 md:px-3 md:pt-2">
      <div className="flex items-start justify-between gap-2">
        <motion.img
          src="/logo.png"
          alt="Sophie's Tarot"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-[4.75rem] shrink-0 drop-shadow-[0_3px_10px_rgba(247,183,216,0.32)] sm:w-[6rem]"
        />

        <div className="pointer-events-auto shrink-0">
          <PlayerBadge />
        </div>
      </div>
    </div>
  );
}
