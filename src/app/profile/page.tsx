"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import MagicalRoom from "@/components/room/MagicalRoom";
import BottomNav from "@/components/nav/BottomNav";
import { useSophieStore, xpForLevel } from "@/lib/store";
import { MAJOR_ARCANA } from "@/lib/tarot";
import { COLLECTIBLES, TAROT_COLLECTIBLE_PREFIX } from "@/lib/collectibles";
import { NOVEL_CHAPTERS } from "@/lib/novels";
import { getSupabase, signInWithProvider, signInWithEmail } from "@/lib/supabase";
import { getRelationship } from "@/lib/relationship";
import { formatJournalHeading } from "@/lib/journal";

function AccountCard() {
  const notify = useSophieStore((s) => s.notify);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const configured = !!getSupabase();

  const oauth = async (provider: "google" | "apple") => {
    try {
      await signInWithProvider(provider);
    } catch {
      notify(
        "☁️",
        "Cloud sync not connected yet",
        "Your progress is safe on this device. Once Supabase keys are added, sign-in will sync it everywhere."
      );
    }
  };

  const emailSignIn = async () => {
    if (!email.includes("@")) return;
    try {
      await signInWithEmail(email);
      setEmailSent(true);
    } catch {
      notify("☁️", "Cloud sync not connected yet", "Your progress is safe on this device.");
    }
  };

  return (
    <div className="glass-panel mt-4 w-full rounded-3xl p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-lavender-200">
        ☁️ Account & Cloud Sync
      </p>
      <p className="mt-1 text-xs text-cream-100/60">
        {configured
          ? "Sign in to keep your bond with Sophie on every device."
          : "Offline mode — progress is saved on this device. Sign-in activates once cloud keys are configured."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => oauth("google")}
          className="glass-panel rounded-xl px-3.5 py-2 text-xs font-bold text-cream-50 transition hover:brightness-125"
        >
          Continue with Google
        </button>
        <button
          onClick={() => oauth("apple")}
          className="glass-panel rounded-xl px-3.5 py-2 text-xs font-bold text-cream-50 transition hover:brightness-125"
        >
          Continue with Apple
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@moonmail.com"
          className="min-w-0 flex-1 rounded-xl bg-plum-950/60 px-3 py-2 text-xs text-cream-50 placeholder:text-cream-100/35 outline-none ring-1 ring-lavender-400/25 focus:ring-gold-300/60"
        />
        <button
          onClick={emailSignIn}
          disabled={emailSent}
          className="btn-magical rounded-xl px-3.5 py-2 text-xs font-bold text-plum-900 disabled:opacity-50"
        >
          {emailSent ? "Letter sent ✉️" : "Email link"}
        </button>
      </div>
    </div>
  );
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

export default function ProfilePage() {
  const store = useSophieStore();
  const [tab, setTab] = useState<"history" | "achievements" | "journey" | "journal">("history");
  const relationship = getRelationship(store.bond);
  const daysTogether = useMemo(() => {
    const start = store.firstVisitAt;
    if (!start || !Number.isFinite(start)) return 1;
    return Math.max(1, Math.floor((Date.now() - start) / 86_400_000) + 1);
  }, [store.firstVisitAt]);

  const totalCollectibles = MAJOR_ARCANA.length + COLLECTIBLES.length;
  const collectionPct = Math.round((store.ownedCollectibleIds.length / totalCollectibles) * 100);
  const storyPct = Math.round((store.completedChapterIds.length / NOVEL_CHAPTERS.length) * 100);
  const cardsDrawn = useMemo(
    () =>
      new Set(
        store.ownedCollectibleIds
          .filter((id) => id.startsWith(TAROT_COLLECTIBLE_PREFIX))
          .map((id) => id.slice(TAROT_COLLECTIBLE_PREFIX.length))
      ).size,
    [store.ownedCollectibleIds]
  );

  const achievements: Achievement[] = [
    { id: "first-reading", icon: "🔮", name: "First Whisper", desc: "Complete your first reading", earned: store.readings.length >= 1 },
    { id: "ten-readings", icon: "🌟", name: "Devoted Seeker", desc: "Complete 10 readings", earned: store.readings.length >= 10 },
    { id: "first-chapter", icon: "📖", name: "Once Upon a Storm", desc: "Finish a story chapter", earned: store.completedChapterIds.length >= 1 },
    { id: "bond-10", icon: "💞", name: "A Familiar Face", desc: "Become Sophie's Friend", earned: store.bond >= 10 },
    { id: "bond-30", icon: "💖", name: "Trusted Friend", desc: "Earn Sophie's trust", earned: store.bond >= 30 },
    { id: "style-2", icon: "👗", name: "Wardrobe Whimsy", desc: "Unlock a second style for Sophie", earned: store.unlockedStyleIds.length >= 2 },
    { id: "streak-3", icon: "🔥", name: "Three Dawns", desc: "3-day login streak", earned: store.loginStreak >= 3 },
    { id: "half-arcana", icon: "🃏", name: "Arcana Keeper", desc: "Draw 11 different major arcana", earned: cardsDrawn >= 11 },
    { id: "level-5", icon: "⭐", name: "Rising Starlight", desc: "Reach Level 5", earned: store.level >= 5 },
  ];
  const earnedCount = achievements.filter((a) => a.earned).length;

  const ritualStats = [
    { label: "Readings", value: store.readings.length, icon: "🔮" },
    { label: "Cards Drawn", value: cardsDrawn, icon: "🃏" },
    { label: "Chapters Read", value: store.completedChapterIds.length, icon: "📖" },
    { label: "Login Streak", value: store.loginStreak, icon: "🔥" },
  ];

  // relationship timeline from memories + milestones
  const timeline = useMemo(() => {
    const items = [
      ...store.memories
        .filter((m) => m.category === "long-term" || m.category === "ritual")
        .slice(0, 12)
        .map((m) => ({
          at: m.createdAt,
          icon: m.category === "ritual" ? "🕯️" : "💭",
          text: m.text,
        })),
      ...store.readings.slice(0, 6).map((r) => ({
        at: r.createdAt,
        icon: "🔮",
        text: `${r.typeName}${r.question ? ` — “${r.question}”` : ""}`,
      })),
    ];
    return items.sort((a, b) => b.at - a.at).slice(0, 14);
  }, [store.memories, store.readings]);

  return (
    <MagicalRoom>
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-2xl flex-col items-center px-4 pb-28 pt-8">
        {/* identity card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel w-full rounded-3xl p-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blush-300 to-lavender-400 text-3xl ring-2 ring-gold-300/70">
              🧝‍♀️
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-cream-50">{store.username}</p>
              <p className="text-xs gold-text font-bold">
                LV {store.level} · {store.xp}/{xpForLevel(store.level)} XP
                {store.isPremium && " · 🌙 Moonkeeper"}
              </p>
              <p className="mt-0.5 text-xs text-blush-200">
                {relationship.icon} {relationship.name}
              </p>
              <p className="mt-0.5 truncate font-display text-[11px] italic text-cream-100/50">
                “{relationship.whisper}”
              </p>
            </div>
          </div>

          {/* completion bars */}
          <div className="mt-4 space-y-2">
            {[
              { label: "Collection", pct: collectionPct, grad: "from-blush-300 to-gold-300" },
              { label: "Story", pct: storyPct, grad: "from-lavender-300 to-blush-300" },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className="w-20 text-[10px] font-bold uppercase tracking-wider text-cream-100/60">
                  {bar.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-plum-950/70">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${bar.grad}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <span className="w-9 text-right text-[10px] font-bold text-cream-100/80">{bar.pct}%</span>
              </div>
            ))}
          </div>

          {/* ritual statistics */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {ritualStats.map((s) => (
              <div key={s.label} className="rounded-xl bg-plum-950/50 p-2 text-center ring-1 ring-lavender-400/15">
                <p className="text-base">{s.icon}</p>
                <p className="text-sm font-bold text-cream-50">{s.value}</p>
                <p className="text-[9px] uppercase tracking-wider text-cream-100/50">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <AccountCard />

        {/* tabs */}
        <div className="my-4 flex gap-2">
          {(
            [
              { id: "history", label: "Reading History", icon: "🔮" },
              { id: "achievements", label: `Achievements ${earnedCount}/${achievements.length}`, icon: "🏆" },
              { id: "journey", label: "Our Journey", icon: "💞" },
              { id: "journal", label: "Sophie's Journal", icon: "📓" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-bold transition ${
                tab === t.id ? "btn-magical text-plum-900" : "glass-panel text-cream-100/70 hover:brightness-125"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "history" && (
          <div className="w-full space-y-3">
            {store.readings.length === 0 && (
              <p className="py-8 text-center font-display text-base italic text-cream-100/60">
                “No readings yet... shall we fix that, starlight?” — Sophie
              </p>
            )}
            {store.readings.slice(0, 20).map((r) => (
              <details key={r.id} className="glass-panel group rounded-2xl p-4">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-cream-50">{r.typeName}</p>
                    <span className="text-[10px] text-cream-100/50">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.question && <p className="mt-0.5 text-xs italic text-cream-100/60">“{r.question}”</p>}
                  <p className="mt-1 text-[11px] text-lavender-200">
                    {r.cards.map((c) => `${c.cardName}${c.reversed ? " ⤵" : ""}`).join(" · ")}
                  </p>
                </summary>
                <p className="mt-3 whitespace-pre-wrap border-t border-lavender-400/15 pt-3 font-display text-[13px] italic leading-relaxed text-cream-100/85">
                  {r.interpretation.replaceAll("**", "")}
                </p>
              </details>
            ))}
          </div>
        )}

        {tab === "achievements" && (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {achievements.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className={`glass-panel rounded-2xl p-3 text-center ${
                  a.earned ? "aura-ssr" : "opacity-45 grayscale"
                }`}
              >
                <p className="text-2xl">{a.icon}</p>
                <p className="mt-1 text-xs font-bold text-cream-50">{a.name}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-cream-100/60">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "journal" && (
          <div className="w-full space-y-3">
            <p className="text-center font-display text-sm italic text-cream-100/70">
              Sophie&apos;s private notebook — written for you.
            </p>
            {store.journalEntries.length === 0 && (
              <p className="py-8 text-center font-display text-base italic text-cream-100/60">
                “I&apos;ll start writing the moment you visit again.” — Sophie
              </p>
            )}
            {store.journalEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl bg-cream-50/92 p-4 text-plum-900 ring-1 ring-gold-300/35"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-plum-700/75">
                  {formatJournalHeading(entry.date)}
                </p>
                <p className="mt-2 font-display text-sm italic leading-relaxed text-plum-900/88">
                  {entry.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {tab === "journey" && (
          <div className="w-full">
            {/* SHARED JOURNEY — the story of you and Sophie */}
            <div className="glass-panel mb-4 rounded-3xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-lavender-200">
                💞 Our Shared Journey
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                {[
                  { label: "Days Together", value: daysTogether, icon: "🗓️" },
                  { label: "Readings Shared", value: store.readings.length, icon: "🔮" },
                  { label: "Stories Unlocked", value: store.completedChapterIds.length, icon: "📖" },
                  { label: "Styles Collected", value: store.unlockedStyleIds.length, icon: "👗" },
                  { label: "Special Moments", value: timeline.length, icon: "✨" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl bg-plum-950/50 p-2.5 text-center ring-1 ring-lavender-400/15"
                  >
                    <p className="text-base">{s.icon}</p>
                    <p className="text-base font-bold text-cream-50">{s.value}</p>
                    <p className="text-[8px] uppercase tracking-wider text-cream-100/50">{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-center font-display text-xs italic text-cream-100/60">
                {relationship.icon} {relationship.name} — “{relationship.whisper}”
              </p>
            </div>

            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-lavender-200">
              ✨ Special Moments
            </p>
            {timeline.length === 0 && (
              <p className="py-8 text-center font-display text-base italic text-cream-100/60">
                “Our story is just beginning — every visit writes a new line.” — Sophie
              </p>
            )}
            <div className="relative ml-3 border-l border-gold-300/30 pl-5">
              {timeline.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative mb-4"
                >
                  <span className="absolute -left-[1.85rem] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-plum-900 text-[10px] ring-1 ring-gold-300/50">
                    {item.icon}
                  </span>
                  <p className="text-xs leading-relaxed text-cream-100/85">{item.text}</p>
                  <p className="mt-0.5 text-[9px] text-cream-100/40">
                    {new Date(item.at).toLocaleString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </MagicalRoom>
  );
}
