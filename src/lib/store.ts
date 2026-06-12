"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DrawnCard } from "./tarot";
import { SOPHIE_STYLES } from "./sophieStyles";
import { normalizeBackgroundId } from "./roomBackgrounds";

/** Bump when the persisted save shape changes — triggers a clean reset. */
export const SAVE_VERSION = 3;
export const SAVE_KEY = "sophies-tarot-save";
export const VERSION_KEY = "sophies-tarot-version";

export type MemoryCategory = "long-term" | "recent" | "emotional" | "ritual";

export interface MemoryEntry {
  id: string;
  category: MemoryCategory;
  text: string;
  createdAt: number;
}

export interface SavedReading {
  id: string;
  typeId: string;
  typeName: string;
  question: string;
  cards: { cardId: string; cardName: string; reversed: boolean; position: string }[];
  interpretation: string;
  mood?: string;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  icon: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  body: string;
  createdAt: number;
}

interface SophieState {
  // identity
  username: string;
  setUsername: (name: string) => void;

  /** when the visitor first stepped into the parlour (Shared Journey) */
  firstVisitAt: number;

  // progression
  level: number;
  xp: number;
  addXp: (amount: number) => void;

  // relationship with Sophie
  bond: number;
  addBond: (amount: number) => void;

  // premium
  isPremium: boolean;
  setPremium: (v: boolean) => void;

  // style system
  activeStyleId: string;
  unlockedStyleIds: string[];
  setActiveStyle: (id: string) => void;
  unlockStyle: (id: string) => void;
  activeBackgroundId: string;
  setActiveBackground: (id: string) => void;
  activeTarotDesignId: string;
  setActiveTarotDesign: (id: string) => void;

  // readings
  readings: SavedReading[];
  saveReading: (reading: SavedReading) => void;

  // memory system
  memories: MemoryEntry[];
  remember: (category: MemoryCategory, text: string) => void;

  // collection
  ownedCollectibleIds: string[];
  grantCollectible: (id: string) => void;

  // non-collectible digital purchases (themes, special readings)
  purchasedShopItemIds: string[];
  markPurchased: (id: string) => void;

  // story
  completedChapterIds: string[];
  storyChoices: Record<string, string>; // chapterId:pageIdx -> choiceId
  completeChapter: (id: string) => void;
  recordChoice: (key: string, choiceId: string) => void;

  // live service
  lastDailyClaim: string | null; // YYYY-MM-DD
  lastDailyReading: string | null;
  loginStreak: number;
  claimDaily: () => boolean;
  markDailyReading: () => void;

  // notifications
  notifications: AppNotification[];
  notify: (icon: string, title: string, body: string) => void;
  markNotificationsRead: () => void;

  // journal & greetings
  journalEntries: JournalEntry[];
  appendJournalEntry: (entry: JournalEntry) => void;
  lastVoiceGreetingDate: string | null;
  markVoiceGreeted: () => void;
}

export function xpForLevel(level: number) {
  return 80 + (level - 1) * 40;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const MAX_RECENT_MEMORIES = 40;

export const useSophieStore = create<SophieState>()(
  persist(
    (set, get) => ({
      username: "Starlight",
      setUsername: (name) => set({ username: name.trim() || "Starlight" }),

      firstVisitAt: Date.now(),

      level: 1,
      xp: 0,
      addXp: (amount) => {
        let { level, xp } = get();
        xp += amount;
        while (xp >= xpForLevel(level)) {
          xp -= xpForLevel(level);
          level += 1;
          get().notify("🎉", `Level ${level}!`, "Sophie claps excitedly — you've grown closer to the arcana.");
        }
        set({ level, xp });
      },

      bond: 0,
      addBond: (amount) => set((s) => ({ bond: s.bond + amount })),

      isPremium: false,
      setPremium: (v) => set({ isPremium: v }),

      activeStyleId: "classic",
      unlockedStyleIds: ["classic"],
      setActiveStyle: (id) => {
        const style = SOPHIE_STYLES.find((s) => s.id === id);
        if (!style) return;
        set((s) => {
          const alreadyUnlocked = s.unlockedStyleIds.includes(id);
          if (!alreadyUnlocked && style.unlockBond > 0) return s;
          const unlockedStyleIds = alreadyUnlocked
            ? s.unlockedStyleIds
            : [...s.unlockedStyleIds, id];
          return { unlockedStyleIds, activeStyleId: id };
        });
      },
      unlockStyle: (id) =>
        set((s) =>
          s.unlockedStyleIds.includes(id)
            ? s
            : { unlockedStyleIds: [...s.unlockedStyleIds, id] }
        ),
      activeBackgroundId: "library",
      setActiveBackground: (id) => set({ activeBackgroundId: id }),
      activeTarotDesignId: "rose",
      setActiveTarotDesign: (id) => set({ activeTarotDesignId: id }),

      readings: [],
      saveReading: (reading) =>
        set((s) => ({ readings: [reading, ...s.readings].slice(0, 200) })),

      memories: [],
      remember: (category, text) =>
        set((s) => {
          const entry: MemoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            category,
            text,
            createdAt: Date.now(),
          };
          const memories = [entry, ...s.memories];
          // keep recent memory bounded; long-term/emotional/ritual persist
          const recent = memories.filter((m) => m.category === "recent");
          if (recent.length > MAX_RECENT_MEMORIES) {
            const cutoff = recent[MAX_RECENT_MEMORIES - 1].createdAt;
            return {
              memories: memories.filter(
                (m) => m.category !== "recent" || m.createdAt >= cutoff
              ),
            };
          }
          return { memories };
        }),

      ownedCollectibleIds: ["deco-crystal", "stick-heart"],
      grantCollectible: (id) =>
        set((s) =>
          s.ownedCollectibleIds.includes(id)
            ? s
            : { ownedCollectibleIds: [...s.ownedCollectibleIds, id] }
        ),

      purchasedShopItemIds: [],
      markPurchased: (id) =>
        set((s) =>
          s.purchasedShopItemIds.includes(id)
            ? s
            : { purchasedShopItemIds: [...s.purchasedShopItemIds, id] }
        ),

      completedChapterIds: [],
      storyChoices: {},
      completeChapter: (id) =>
        set((s) =>
          s.completedChapterIds.includes(id)
            ? s
            : { completedChapterIds: [...s.completedChapterIds, id] }
        ),
      recordChoice: (key, choiceId) =>
        set((s) => ({ storyChoices: { ...s.storyChoices, [key]: choiceId } })),

      lastDailyClaim: null,
      lastDailyReading: null,
      loginStreak: 0,
      claimDaily: () => {
        const s = get();
        const today = todayKey();
        if (s.lastDailyClaim === today) return false;
        const yesterday = new Date(Date.now() - 86_400_000)
          .toISOString()
          .slice(0, 10);
        const streak = s.lastDailyClaim === yesterday ? s.loginStreak + 1 : 1;
        set({
          lastDailyClaim: today,
          loginStreak: streak,
        });
        get().addXp(15 + streak * 5);
        get().addBond(1);
        return true;
      },
      markDailyReading: () => set({ lastDailyReading: todayKey() }),

      notifications: [
        {
          id: "welcome",
          icon: "💌",
          title: "A letter from Sophie",
          body: "Welcome to my parlour! The cards have been whispering about you all morning.",
          createdAt: Date.now(),
          read: false,
        },
      ],
      notify: (icon, title, body) =>
        set((s) => ({
          notifications: [
            {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              icon,
              title,
              body,
              createdAt: Date.now(),
              read: false,
            },
            ...s.notifications,
          ].slice(0, 50),
        })),
      markNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      journalEntries: [],
      appendJournalEntry: (entry) =>
        set((s) =>
          s.journalEntries.some((j) => j.date === entry.date)
            ? s
            : { journalEntries: [entry, ...s.journalEntries].slice(0, 120) }
        ),
      lastVoiceGreetingDate: null,
      markVoiceGreeted: () => set({ lastVoiceGreetingDate: todayKey() }),
    }),
    {
      name: SAVE_KEY,
      /**
       * Bump SAVE_VERSION when the save shape changes. Old saves are
       * discarded by the persist middleware (and by the first-open cache
       * clear in <Providers>), so the app always boots from a clean state.
       */
      version: SAVE_VERSION,
      /**
       * Hydration is skipped during render and triggered manually in
       * <Providers> after the cache check — this keeps server and first
       * client render identical (no hydration mismatches).
       */
      skipHydration: true,
      migrate: (persisted) => persisted as SophieState,
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const patch: Partial<SophieState> = {};
        // sanitize stale saves: unknown style ids fall back to classic
        const valid = new Set(SOPHIE_STYLES.map((s) => s.id));
        const unlocked = state.unlockedStyleIds.filter((id) => valid.has(id));
        if (!unlocked.includes("classic")) unlocked.unshift("classic");
        const active = valid.has(state.activeStyleId) ? state.activeStyleId : "classic";
        if (
          unlocked.length !== state.unlockedStyleIds.length ||
          active !== state.activeStyleId
        ) {
          patch.unlockedStyleIds = unlocked;
          patch.activeStyleId = active;
        }
        if (!state.firstVisitAt || !Number.isFinite(state.firstVisitAt)) {
          patch.firstVisitAt = Date.now();
        }
        if (!state.journalEntries) patch.journalEntries = [];
        if (state.lastVoiceGreetingDate === undefined) patch.lastVoiceGreetingDate = null;
        const normalizedBackground = normalizeBackgroundId(state.activeBackgroundId);
        if (normalizedBackground !== state.activeBackgroundId) {
          patch.activeBackgroundId = normalizedBackground;
        }
        if (Object.keys(patch).length > 0) {
          useSophieStore.setState(patch);
        }
      },
    }
  )
);

/** Build the memory context block sent to the AI for personalised readings. */
export function buildMemoryContext(state: {
  username: string;
  bond: number;
  memories: MemoryEntry[];
  readings: SavedReading[];
}): string {
  const byCategory = (cat: MemoryCategory, n: number) =>
    state.memories
      .filter((m) => m.category === cat)
      .slice(0, n)
      .map((m) => `- ${m.text}`)
      .join("\n");

  const recentReadings = state.readings
    .slice(0, 3)
    .map(
      (r) =>
        `- ${r.typeName}${r.question ? ` about "${r.question}"` : ""}: drew ${r.cards
          .map((c) => c.cardName + (c.reversed ? " (reversed)" : ""))
          .join(", ")}`
    )
    .join("\n");

  return [
    `The visitor's name is ${state.username}. Bond level with Sophie: ${state.bond}.`,
    byCategory("long-term", 6) && `Long-term memories:\n${byCategory("long-term", 6)}`,
    byCategory("emotional", 4) && `Emotional memories:\n${byCategory("emotional", 4)}`,
    byCategory("ritual", 4) && `Ritual memories:\n${byCategory("ritual", 4)}`,
    byCategory("recent", 5) && `Recent moments:\n${byCategory("recent", 5)}`,
    recentReadings && `Recent readings:\n${recentReadings}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function summarizeMood(cards: DrawnCard[]): string {
  const heavy = ["tower", "death", "devil", "moon"];
  const bright = ["sun", "star", "world", "lovers", "empress"];
  const heavyCount = cards.filter((c) => heavy.includes(c.card.id)).length;
  const brightCount = cards.filter((c) => bright.includes(c.card.id)).length;
  if (brightCount > heavyCount) return "hopeful";
  if (heavyCount > brightCount) return "introspective";
  return "balanced";
}
