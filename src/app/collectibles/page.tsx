"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import MagicalRoom from "@/components/room/MagicalRoom";
import BottomNav from "@/components/nav/BottomNav";
import TarotCard from "@/components/tarot/TarotCard";
import {
  COLLECTIBLES,
  CATEGORY_LABEL,
  TAROT_COLLECTIBLE_PREFIX,
  type Collectible,
  type CollectibleCategory,
} from "@/lib/collectibles";
import { MAJOR_ARCANA } from "@/lib/tarot";
import { RARITY_COLOR, RARITY_LABEL, type Rarity } from "@/lib/sophieStyles";
import { useSophieStore } from "@/lib/store";

const CATEGORIES: CollectibleCategory[] = [
  "tarot-cards",
  "outfits",
  "frames",
  "decorations",
  "stickers",
  "companions",
];

const AURA: Record<Rarity, string> = {
  common: "aura-common",
  rare: "aura-rare",
  sr: "aura-sr",
  ssr: "aura-ssr",
  ur: "aura-ur",
};

export default function CollectiblesPage() {
  const [category, setCategory] = useState<CollectibleCategory>("tarot-cards");
  const owned = useSophieStore((s) => s.ownedCollectibleIds);

  const items: Collectible[] = useMemo(() => {
    if (category === "tarot-cards") {
      return MAJOR_ARCANA.map((card) => ({
        id: `${TAROT_COLLECTIBLE_PREFIX}${card.id}`,
        name: card.name,
        category: "tarot-cards" as const,
        rarity: (["fool", "world", "sun"].includes(card.id)
          ? "ssr"
          : ["star", "moon", "lovers", "wheel"].includes(card.id)
            ? "sr"
            : "rare") as Rarity,
        icon: card.symbol,
        description: `Collected by drawing ${card.name} in a reading.`,
      }));
    }
    return COLLECTIBLES.filter((c) => c.category === category);
  }, [category]);

  const ownedCount = items.filter((i) => owned.includes(i.id)).length;
  const totalOwned = [...MAJOR_ARCANA.map((c) => `${TAROT_COLLECTIBLE_PREFIX}${c.id}`), ...COLLECTIBLES.map((c) => c.id)].filter(
    (id) => owned.includes(id)
  ).length;
  const totalAll = MAJOR_ARCANA.length + COLLECTIBLES.length;

  return (
    <MagicalRoom>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-4 pb-28 pt-8">
        <h1 className="font-display text-3xl font-semibold gold-text">The Curio Cabinet</h1>
        <p className="mb-1 mt-1 text-xs text-cream-100/60">
          An Arcana Keeper&apos;s treasures, gathered alongside Sophie
        </p>
        <div className="mb-5 flex items-center gap-2">
          <div className="h-2 w-40 overflow-hidden rounded-full bg-plum-950/70">
            <motion.div
              className="h-full bg-gradient-to-r from-blush-300 to-gold-300"
              animate={{ width: `${(totalOwned / totalAll) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-cream-100/80">
            {totalOwned}/{totalAll}
          </span>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                category === cat
                  ? "btn-magical text-plum-900"
                  : "glass-panel text-cream-100/70 hover:brightness-125"
              }`}
            >
              {CATEGORY_LABEL[cat]}
            </button>
          ))}
        </div>

        <p className="mb-3 text-[11px] text-cream-100/50">
          {ownedCount} of {items.length} collected in this category
        </p>

        <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {items.map((item, i) => {
            const has = owned.includes(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.6) }}
                whileHover={has ? { scale: 1.06, y: -3 } : {}}
                className={`glass-panel relative flex aspect-[3/4] flex-col items-center justify-center gap-1.5 rounded-2xl p-2 text-center ${
                  has ? AURA[item.rarity] : "opacity-50 grayscale"
                }`}
                title={item.description}
              >
                <span
                  className="absolute right-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                  style={{
                    color: RARITY_COLOR[item.rarity],
                    background: `${RARITY_COLOR[item.rarity]}22`,
                  }}
                >
                  {RARITY_LABEL[item.rarity]}
                </span>
                {category === "tarot-cards" ? (
                  <span className={`relative block h-[4.75rem] w-[3rem] sm:h-20 sm:w-[3.25rem] ${has ? "" : "opacity-80"}`}>
                    <TarotCard className="h-full w-full">
                      {has ? (
                        <>
                          <span className="rounded-full bg-plum-950/60 px-1 py-0.5 text-lg drop-shadow-lg">
                            {item.icon}
                          </span>
                          <span />
                          <span />
                        </>
                      ) : null}
                    </TarotCard>
                  </span>
                ) : (
                  <span className="text-3xl">{has ? item.icon : "❔"}</span>
                )}
                <span className="text-[10px] font-bold leading-tight text-cream-50">
                  {has ? item.name : "???"}
                </span>
                {!has && category === "tarot-cards" && (
                  <span className="text-[8px] text-cream-100/50">Draw it in a reading</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </MagicalRoom>
  );
}
