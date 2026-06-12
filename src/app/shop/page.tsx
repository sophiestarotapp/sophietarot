"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import MagicalRoom from "@/components/room/MagicalRoom";
import BottomNav from "@/components/nav/BottomNav";
import Sophie from "@/components/sophie/Sophie";
import { SHOP_ITEMS, type ShopItem, type ShopSection } from "@/lib/shop";
import { RARITY_COLOR, RARITY_LABEL } from "@/lib/sophieStyles";
import { useSophieStore } from "@/lib/store";
import { track } from "@/lib/analytics";

const SECTIONS: { id: ShopSection; label: string; icon: string }[] = [
  { id: "digital", label: "Boutique", icon: "🎀" },
  { id: "physical", label: "Atelier", icon: "📦" },
  { id: "membership", label: "Moonkeeper", icon: "🌙" },
];

export default function ShopPage() {
  const [section, setSection] = useState<ShopSection>("digital");
  const store = useSophieStore();
  const items = SHOP_ITEMS.filter((i) => i.section === section);

  const buy = (item: ShopItem) => {
    if (item.priceUsd) {
      if (item.id === "sub-moonkeeper") {
        store.setPremium(true);
        store.notify("🌙", "Welcome, Moonkeeper", "Sophie curtsies — unlimited readings, premium stories, and exclusive styles are yours.");
        track("subscription_started");
      } else {
        store.notify("📦", "Checkout coming soon", `"${item.name}" will ship via Stripe checkout once the boutique till is connected.`);
      }
      return;
    }

    const alreadyOwned =
      store.purchasedShopItemIds.includes(item.id) ||
      (item.grantsCollectibleId &&
        store.ownedCollectibleIds.includes(item.grantsCollectibleId));

    if (alreadyOwned) {
      store.notify("💝", "Already yours", `${item.name} is already in your cabinet.`);
      return;
    }

    if (item.grantsCollectibleId) store.grantCollectible(item.grantsCollectibleId);
    if (item.grantsStyleId) store.unlockStyle(item.grantsStyleId);
    store.markPurchased(item.id);
    store.addXp(10);

    if (item.id === "dig-theme-aurora") {
      store.notify("🌌", "Aurora theme awakened", "Northern lights drift across the library whenever you visit.");
    } else if (item.id === "dig-reading-eclipse") {
      store.notify("🌒", "Eclipse Rite unlocked", "Find it at the Reading Table — a ritual of uncommon depth.");
    } else {
      store.notify("🛍️", "A lovely choice!", `"${item.name}" has been wrapped in ribbon and added to your collection.`);
    }
    track("item_purchased", { item: item.id });
  };

  return (
    <MagicalRoom>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-4 pb-28 pt-8">
        <h1 className="font-display text-3xl font-semibold gold-text">Sophie&apos;s Boutique</h1>
        <p className="mb-4 mt-1 text-xs text-cream-100/60">
          “Browse all you like — everything here was chosen with love.”
        </p>

        <div className="mb-2 flex items-center gap-3">
          <Sophie emotion="excited" size={110} />
          <div className="glass-panel rounded-2xl rounded-bl-sm px-4 py-2.5">
            <p className="max-w-56 font-display text-sm italic text-cream-50">
              {section === "digital" && "“The frames are enchanted to flatter, I promise.”"}
              {section === "physical" && "“Real treasures, delivered to your door by very dependable owls.”"}
              {section === "membership" && "“Moonkeepers get my favourite rituals and the stories I save for closest friends.”"}
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap justify-center gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                section === s.id
                  ? "btn-magical text-plum-900"
                  : "glass-panel text-cream-100/70 hover:brightness-125"
              }`}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item, i) => {
            const owned =
              (item.grantsCollectibleId && store.ownedCollectibleIds.includes(item.grantsCollectibleId)) ||
              store.purchasedShopItemIds.includes(item.id) ||
              (item.id === "sub-moonkeeper" && store.isPremium);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-panel flex flex-col rounded-3xl p-4"
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-3xl">{item.icon}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[8px] font-bold"
                    style={{ color: RARITY_COLOR[item.rarity], background: `${RARITY_COLOR[item.rarity]}22` }}
                  >
                    {RARITY_LABEL[item.rarity]}
                  </span>
                </div>
                <p className="text-sm font-bold leading-tight text-cream-50">{item.name}</p>
                <p className="mb-3 mt-1 flex-1 text-[11px] leading-snug text-cream-100/60">
                  {item.description}
                </p>
                <button
                  onClick={() => buy(item)}
                  disabled={!!owned}
                  className={`w-full rounded-xl py-2 text-xs font-bold transition ${
                    owned
                      ? "bg-plum-950/60 text-cream-100/40"
                      : "btn-magical text-plum-900"
                  }`}
                >
                  {owned
                    ? "Owned 💝"
                    : item.priceUsd
                      ? `$${item.priceUsd.toFixed(2)}`
                      : "Collect ✨"}
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-6 max-w-md text-center text-[10px] leading-relaxed text-cream-100/40">
          Cosmetics only — never pay-to-win. Sophie earns because you love her, not because you must.
          Physical goods check out securely via Stripe.
        </p>
      </main>
      <BottomNav />
    </MagicalRoom>
  );
}
