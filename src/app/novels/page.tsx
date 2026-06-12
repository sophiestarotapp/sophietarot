"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MagicalRoom from "@/components/room/MagicalRoom";
import BottomNav from "@/components/nav/BottomNav";
import Sophie from "@/components/sophie/Sophie";
import {
  NOVEL_CHAPTERS,
  NOVEL_CATEGORY_LABEL,
  type NovelCategory,
  type NovelChapter,
  type StoryChoice,
} from "@/lib/novels";
import { useSophieStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { getRelationship } from "@/lib/relationship";

const CATEGORIES: NovelCategory[] = ["main", "side", "lore", "dreams"];

function ChapterReader({
  chapter,
  onExit,
}: {
  chapter: NovelChapter;
  onExit: () => void;
}) {
  const store = useSophieStore();
  const [pageIdx, setPageIdx] = useState(0);
  const [chosen, setChosen] = useState<StoryChoice | null>(null);
  const page = chapter.pages[pageIdx];
  const isLast = pageIdx >= chapter.pages.length - 1;
  const needsChoice = !!page.choices && !chosen;

  const advance = () => {
    if (needsChoice) return;
    if (isLast) {
      if (!store.completedChapterIds.includes(chapter.id)) {
        store.completeChapter(chapter.id);
        store.addXp(40);
        store.addBond(2);
        store.notify("📖", `Chapter complete!`, `"${chapter.title}" — Sophie will remember this night.`);
        track("chapter_completed", { chapter: chapter.id });
      }
      onExit();
      return;
    }
    setPageIdx((i) => i + 1);
    setChosen(null);
  };

  const choose = (choice: StoryChoice) => {
    setChosen(choice);
    store.recordChoice(`${chapter.id}:${pageIdx}`, choice.id);
    store.addBond(choice.affinity);
    store.remember("long-term", choice.memory);
    track("story_choice", { chapter: chapter.id, choice: choice.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex w-full flex-col items-center"
    >
      <div className="mb-3 flex w-full items-center justify-between">
        <button
          onClick={onExit}
          className="glass-panel rounded-full px-4 py-1.5 text-xs font-bold text-cream-100/80"
        >
          ← Library
        </button>
        <span className="text-xs text-cream-100/60">
          {pageIdx + 1} / {chapter.pages.length}
        </span>
      </div>

      {page.speaker === "sophie" && <Sophie emotion="neutral" size={150} />}

      <motion.div
        key={pageIdx}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full rounded-3xl p-5"
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-lavender-200">
          {page.speaker === "sophie" ? "✨ Sophie" : page.speaker === "you" ? "💭 You" : "🕯️ Narrator"}
        </p>
        <p className="font-display text-base italic leading-relaxed text-cream-50">
          {page.speaker === "sophie" ? `“${page.text}”` : page.text}
        </p>

        {page.choices && (
          <div className="mt-4 space-y-2">
            {page.choices.map((choice) => {
              const isChosen = chosen?.id === choice.id;
              return (
                <button
                  key={choice.id}
                  disabled={!!chosen}
                  onClick={() => choose(choice)}
                  className={`w-full rounded-xl p-3 text-left text-sm transition ${
                    isChosen
                      ? "bg-gradient-to-r from-blush-300/30 to-lavender-400/30 ring-2 ring-gold-300"
                      : chosen
                        ? "bg-plum-950/40 opacity-40"
                        : "bg-plum-950/50 ring-1 ring-lavender-400/25 hover:ring-gold-300/60"
                  }`}
                >
                  {choice.text}
                  {isChosen && (
                    <span className="mt-1 block text-[10px] font-bold text-blush-200">
                      💞 Sophie will remember this
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      <button
        onClick={advance}
        disabled={needsChoice}
        className="btn-magical mt-4 w-full max-w-xs rounded-2xl py-3 text-sm font-bold text-plum-900 disabled:opacity-40"
      >
        {needsChoice ? "Choose your answer..." : isLast ? "Finish Chapter ✨" : "Continue →"}
      </button>
    </motion.div>
  );
}

export default function NovelsPage() {
  const [category, setCategory] = useState<NovelCategory>("main");
  const [activeChapter, setActiveChapter] = useState<NovelChapter | null>(null);
  const { bond, isPremium, completedChapterIds, notify } = useSophieStore();

  const chapters = NOVEL_CHAPTERS.filter((c) => c.category === category);

  const openChapter = (chapter: NovelChapter) => {
    if (chapter.requiredBond > bond) {
      notify("💞", "Not just yet", `"${chapter.title}" will open as you and Sophie grow closer. Share a few more readings together.`);
      return;
    }
    if (chapter.premium && !isPremium) {
      notify("🌙", "A Moonkeeper tale", "This story is reserved for Moonkeepers. You can join them in the Shop.");
      return;
    }
    setActiveChapter(chapter);
    track("chapter_opened", { chapter: chapter.id });
  };

  return (
    <MagicalRoom>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center px-4 pb-28 pt-8">
        <h1 className="font-display text-3xl font-semibold gold-text">The Story Library</h1>
        <p className="mb-5 mt-1 text-xs text-cream-100/60">
          Every choice echoes in Sophie&apos;s memory · {getRelationship(bond).icon}{" "}
          {getRelationship(bond).name}
        </p>

        <AnimatePresence mode="wait">
          {activeChapter ? (
            <ChapterReader
              key="reader"
              chapter={activeChapter}
              onExit={() => setActiveChapter(null)}
            />
          ) : (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      category === cat
                        ? "btn-magical text-plum-900"
                        : "glass-panel text-cream-100/70 hover:brightness-125"
                    }`}
                  >
                    {NOVEL_CATEGORY_LABEL[cat]}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {chapters.map((chapter, i) => {
                  const done = completedChapterIds.includes(chapter.id);
                  const locked = chapter.requiredBond > bond || (chapter.premium && !isPremium);
                  return (
                    <motion.button
                      key={chapter.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => openChapter(chapter)}
                      className={`glass-panel flex w-full items-center gap-4 rounded-2xl p-4 text-left transition hover:brightness-125 ${
                        locked ? "opacity-60" : ""
                      }`}
                    >
                      <span className="text-3xl">{locked ? "🔒" : chapter.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2 text-sm font-bold text-cream-50">
                          {chapter.title}
                          {done && <span className="text-[10px] text-gold-300">✓ read</span>}
                          {chapter.premium && (
                            <span className="rounded-full bg-gold-400/20 px-1.5 py-0.5 text-[9px] font-bold text-gold-300">
                              🌙
                            </span>
                          )}
                        </span>
                        <span className="block text-xs text-cream-100/60">{chapter.subtitle}</span>
                        {chapter.requiredBond > bond && (
                          <span className="mt-0.5 block text-[10px] text-blush-200">
                            Unlocks as you grow closer 💞
                          </span>
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </MagicalRoom>
  );
}
