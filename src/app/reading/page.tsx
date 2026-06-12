"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import MagicalRoom from "@/components/room/MagicalRoom";
import Sophie, { type SophieEmotion } from "@/components/sophie/Sophie";
import BottomNav from "@/components/nav/BottomNav";
import TarotCardVisual from "@/components/tarot/TarotCard";
import TarotCardFace from "@/components/tarot/TarotCardFace";
import {
  CUSTOM_READING,
  shuffleDeck,
  type ReadingType,
  type TarotCard,
} from "@/lib/tarot";
import {
  useSophieStore,
  buildMemoryContext,
  summarizeMood,
  type SavedReading,
} from "@/lib/store";
import { TAROT_COLLECTIBLE_PREFIX } from "@/lib/collectibles";
import { buildFallbackReading } from "@/lib/readingFallback";
import { track } from "@/lib/analytics";

type Step = "question" | "shuffle" | "pick" | "reveal" | "result";

interface PickedCard {
  card: TarotCard;
  reversed: boolean;
  position: string;
}

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState(0);
  const doneRef = useRef(false);
  useEffect(() => {
    setShown(0);
    doneRef.current = false;
    const interval = setInterval(() => {
      setShown((s) => {
        if (s >= text.length) {
          clearInterval(interval);
          if (!doneRef.current) {
            doneRef.current = true;
            onDone?.();
          }
          return s;
        }
        return s + 2;
      });
    }, 18);
    return () => clearInterval(interval);
  }, [text, onDone]);

  const visible = text.slice(0, shown);
  return (
    <div className="whitespace-pre-wrap font-display text-[15px] leading-relaxed text-cream-50">
      {visible.split("**").map((chunk, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-bold gold-text">
            {chunk}
          </span>
        ) : (
          <span key={i}>{chunk}</span>
        )
      )}
      {shown < text.length && <span className="animate-pulse">▍</span>}
    </div>
  );
}

export default function ReadingPage() {
  const store = useSophieStore();
  const readingType: ReadingType = CUSTOM_READING;
  const [step, setStep] = useState<Step>("question");
  const [question, setQuestion] = useState("");
  const [fan, setFan] = useState<TarotCard[]>([]);
  const [picked, setPicked] = useState<PickedCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [interpretation, setInterpretation] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [emotion, setEmotion] = useState<SophieEmotion>("happy");
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [pickClosing, setPickClosing] = useState(false);
  const savedRef = useRef(false);

  useEffect(() => {
    setEmotion("curious");
    track("reading_started", { type: "custom" });
  }, []);

  // shuffle step auto-advances into the fan
  useEffect(() => {
    if (step !== "shuffle") return;
    const t = setTimeout(() => {
      setFan(shuffleDeck().slice(0, 12));
      setStep("pick");
    }, 2600);
    return () => clearTimeout(t);
  }, [step]);

  const pickCard = (card: TarotCard) => {
    if (pickClosing || picked.some((p) => p.card.id === card.id)) return;
    if (picked.length >= readingType.cardCount) return;

    const next: PickedCard = {
      card,
      reversed: Math.random() < 0.3,
      position: readingType.positions[picked.length],
    };
    const all = [...picked, next];
    setPicked(all);
    setEmotion("happy");

    if (all.length >= readingType.cardCount) {
      setEmotion("surprised");
      setPickClosing(true);
      window.setTimeout(() => {
        setPickClosing(false);
        setHoveredCardId(null);
        setStep("reveal");
      }, 1200);
    }
  };

  // reveal cards one by one
  useEffect(() => {
    if (step !== "reveal") return;
    if (revealedCount >= picked.length) return;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 800);
    return () => clearTimeout(t);
  }, [step, revealedCount, picked.length]);

  const requestInterpretation = useCallback(async () => {
    setLoadingAi(true);
    setEmotion("neutral");
    const memoryContext = buildMemoryContext({
      username: store.username,
      bond: store.bond,
      memories: store.memories,
      readings: store.readings,
    });
    const cardPayload = picked.map((p) => ({
      cardId: p.card.id,
      reversed: p.reversed,
      position: p.position,
    }));
    const localFallback = () =>
      buildFallbackReading({
        username: store.username,
        question,
        cards: cardPayload,
      });

    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readingType: readingType.name,
          question,
          cards: cardPayload,
          memoryContext,
          username: store.username,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setInterpretation(
          typeof data.error === "string" ? data.error : localFallback()
        );
        return;
      }
      setInterpretation(data.interpretation ?? localFallback());
    } catch {
      setInterpretation(localFallback());
    } finally {
      setLoadingAi(false);
      // love is reserved for high-bond moments (canon)
      setEmotion(store.bond >= 30 ? "love" : "happy");
      setStep("result");
    }
  }, [readingType, question, picked, store.username, store.bond, store.memories, store.readings]);

  // persist reading + rewards once the result is shown
  useEffect(() => {
    if (step !== "result" || !interpretation || savedRef.current) return;
    savedRef.current = true;

    const drawn = picked.map((p) => ({ card: p.card, reversed: p.reversed, position: p.position }));
    const mood = summarizeMood(drawn);
    const reading: SavedReading = {
      id: `${Date.now()}`,
      typeId: readingType.id,
      typeName: readingType.name,
      question,
      cards: picked.map((p) => ({
        cardId: p.card.id,
        cardName: p.card.name,
        reversed: p.reversed,
        position: p.position,
      })),
      interpretation,
      mood,
      createdAt: Date.now(),
    };
    store.saveReading(reading);
    store.addXp(25 + picked.length * 5);
    store.addBond(3);

    // memory system: Sophie remembers the ritual + emotional tone
    store.remember(
      "ritual",
      `${readingType.name}${question ? ` about "${question}"` : ""}: ${picked
        .map((p) => p.card.name + (p.reversed ? " reversed" : ""))
        .join(", ")}.`
    );
    store.remember("emotional", `After that reading they seemed ${mood}.`);
    if (question) store.remember("recent", `They asked: "${question}".`);

    // card collectibles
    picked.forEach((p) => store.grantCollectible(`${TAROT_COLLECTIBLE_PREFIX}${p.card.id}`));
    track("reading_completed", { type: readingType.id, mood });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, interpretation]);

  const reset = () => {
    setStep("question");
    setQuestion("");
    setFan([]);
    setPicked([]);
    setRevealedCount(0);
    setInterpretation("");
    setEmotion("happy");
    setHoveredCardId(null);
    setPickClosing(false);
    savedRef.current = false;
  };

  const fanAngles = useMemo(
    () => fan.map((_, i) => (i - (fan.length - 1) / 2) * 9),
    [fan]
  );

  const sophieSize =
    step === "result"
      ? 108
      : step === "question"
        ? 120
        : step === "pick" || step === "reveal"
          ? 118
          : 112;

  const ritualStep = step === "shuffle" || step === "pick" || step === "reveal";

  const stepContent = (
    <AnimatePresence mode="wait">
      {step === "question" && (
        <motion.div
          key="question"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <p className="mb-3 shrink-0 text-center font-display text-[15px] leading-snug text-cream-50">
            Whisper your question to the cards — or stay silent. They listen either way.
          </p>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What weighs on your heart?"
            rows={4}
            maxLength={280}
            className="min-h-[7.5rem] w-full flex-1 resize-none rounded-2xl border border-gold-300/25 bg-plum-800/80 p-4 text-[15px] leading-relaxed text-cream-50 placeholder:text-cream-100/75 focus:border-gold-300/45 focus:outline-none focus:ring-2 focus:ring-gold-300/40"
          />
          <button
            type="button"
            onClick={() => setStep("shuffle")}
            className="btn-magical shimmer mt-4 shrink-0 w-full rounded-2xl py-3.5 text-sm font-bold text-plum-900"
          >
            {question.trim() ? "Ask the Cards ✨" : "A Silent Reading 🤫"}
          </button>
        </motion.div>
      )}

      {step === "shuffle" && (
        <motion.div
          key="shuffle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-0 flex-1 flex-col items-center pt-1"
        >
          <p className="relative z-30 mb-4 shrink-0 px-2 text-center font-display text-[15px] leading-snug text-cream-50">
            Shuffling... I can feel them getting excited.
          </p>
          <div className="relative z-20 flex h-[7.5rem] w-full max-w-[240px] items-center justify-center overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-x-[8%] bottom-2 top-[38%] rounded-[50%/55%] border border-gold-300/15 bg-plum-900/40"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute h-[5.5rem] w-[3.45rem] origin-center"
                animate={{
                  x: [-34, 34, -20, 26, -34],
                  y: [0, -6, 2, -4, 0],
                  rotate: [-10, 8, -5, 12, -10],
                  zIndex: [i, 4 - i, i, 4 - i, i],
                }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
              >
                <TarotCardVisual className="h-full w-full shadow-[0_8px_20px_rgba(244,201,107,0.22)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {step === "pick" && (
        <motion.div
          key="pick"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="flex min-h-0 flex-1 flex-col items-center pt-1"
        >
          <p className="mb-1 text-center font-display text-[15px] text-cream-50">
            {pickClosing
              ? "The three cards answer your call..."
              : `Let your hand drift... choose ${readingType.cardCount}.`}
          </p>
          <p className="mb-3 text-xs font-semibold text-gold-300">
            {picked.length} / {readingType.cardCount} chosen
          </p>

          <div className="mb-4 flex justify-center gap-2.5">
            {readingType.positions.map((position, idx) => {
              const chosen = picked[idx];
              return (
                <div
                  key={position}
                  className={`relative flex h-[4.5rem] w-[3rem] flex-col items-center justify-end rounded-xl border-2 transition-all duration-300 sm:h-[4.75rem] sm:w-[3.15rem] ${
                    chosen
                      ? "border-gold-300 bg-plum-900/80 shadow-[0_0_16px_rgba(244,201,107,0.35)]"
                      : "border-dashed border-lavender-400/35 bg-plum-900/30"
                  }`}
                >
                  {chosen ? (
                    <>
                      <motion.div
                        initial={{ scale: 0.6, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="h-[3.75rem] w-[2.35rem]"
                      >
                        <TarotCardVisual className="h-full w-full ring-2 ring-gold-300/80" />
                      </motion.div>
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold-300 text-[10px] font-bold text-plum-950 shadow-md">
                        {idx + 1}
                      </span>
                    </>
                  ) : (
                    <span className="pb-3 text-[10px] font-semibold text-cream-100/35">{idx + 1}</span>
                  )}
                  <span className="absolute -bottom-5 max-w-[4.5rem] truncate text-center text-[8px] font-medium text-cream-100/50">
                    {position}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative flex h-44 w-full max-w-md items-end justify-center">
            {fan.map((card, i) => {
              const isPicked = picked.some((p) => p.card.id === card.id);
              const pickOrder = picked.findIndex((p) => p.card.id === card.id);
              const isHovered = hoveredCardId === card.id;
              const spreadX = pickOrder >= 0 ? (pickOrder - (readingType.cardCount - 1) / 2) * 88 : 0;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  disabled={pickClosing || (picked.length >= readingType.cardCount && !isPicked)}
                  initial={{ opacity: 0, y: 48 }}
                  animate={{
                    opacity: pickClosing && !isPicked ? 0 : 1,
                    y: pickClosing && isPicked ? -52 : isPicked ? -34 : isHovered ? -20 : 0,
                    x: pickClosing && isPicked ? spreadX : 0,
                    scale: pickClosing && isPicked ? 1.06 : isPicked ? 1.07 : isHovered ? 1.05 : 1,
                    rotate: pickClosing && isPicked ? 0 : fanAngles[i],
                    zIndex: isPicked ? 40 : isHovered ? 30 : i,
                  }}
                  transition={{
                    delay: pickClosing ? pickOrder * 0.08 : i * 0.04,
                    type: "spring",
                    stiffness: pickClosing ? 280 : 260,
                    damping: pickClosing ? 24 : 20,
                  }}
                  whileTap={pickClosing || isPicked ? undefined : { scale: 0.96, y: -10 }}
                  onHoverStart={() => !pickClosing && !isPicked && setHoveredCardId(card.id)}
                  onHoverEnd={() => setHoveredCardId((id) => (id === card.id ? null : id))}
                  onFocus={() => !pickClosing && !isPicked && setHoveredCardId(card.id)}
                  onBlur={() => setHoveredCardId((id) => (id === card.id ? null : id))}
                  onClick={() => pickCard(card)}
                  className={`absolute bottom-0 h-36 w-[5.625rem] origin-bottom outline-none ${
                    pickClosing && !isPicked ? "pointer-events-none" : ""
                  } ${isPicked ? "cursor-default" : "cursor-pointer"}`}
                  style={{
                    marginLeft: `${(i - fan.length / 2) * 26}px`,
                  }}
                >
                  <motion.div
                    className="relative h-full w-full"
                    animate={{
                      boxShadow: isPicked
                        ? "0 0 22px rgba(244,201,107,0.65), 0 8px 24px rgba(244,201,107,0.25)"
                        : isHovered
                          ? "0 0 18px rgba(247,183,216,0.55), 0 10px 28px rgba(244,201,107,0.2)"
                          : "0 4px 16px rgba(20,8,34,0.35)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <TarotCardVisual
                      className={`h-full w-full transition-all duration-200 ${
                        isPicked
                          ? "ring-2 ring-gold-300"
                          : isHovered
                            ? "ring-2 ring-blush-300/80"
                            : ""
                      }`}
                    />
                    {isPicked && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-gold-300 text-xs font-bold text-plum-950 shadow-lg ring-2 ring-plum-950/40"
                      >
                        {pickOrder + 1}
                      </motion.span>
                    )}
                    {isHovered && !isPicked && !pickClosing && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pointer-events-none absolute inset-x-0 -top-6 text-center text-[10px] font-semibold text-blush-200"
                      >
                        Choose me
                      </motion.span>
                    )}
                  </motion.div>
                </motion.button>
              );
            })}
          </div>

          {pickClosing && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-xs font-medium text-gold-300"
            >
              ✨ Preparing your reveal...
            </motion.p>
          )}
        </motion.div>
      )}

      {step === "reveal" && (
        <motion.div
          key="reveal"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="flex min-h-0 flex-1 flex-col items-center pt-1"
        >
          <p className="mb-4 text-center font-display text-[15px] text-cream-50">
            Here they come... breathe with me.
          </p>
          <div className="flex flex-wrap items-start justify-center gap-4">
            {picked.map((p, i) => {
              const revealed = i < revealedCount;
              return (
                <div key={p.card.id} className="flex w-[5.625rem] flex-col items-center gap-1.5">
                  <div className="h-40 w-[5.625rem]" style={{ perspective: 800 }}>
                    <motion.div
                      className="preserve-3d relative h-full w-full"
                      animate={{ rotateY: revealed ? 180 : 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      <TarotCardVisual className="backface-hidden absolute inset-0 h-full w-full" />
                      <div
                        className="backface-hidden absolute inset-0 h-full w-full"
                        style={{ transform: "rotateY(180deg)" }}
                      >
                        <TarotCardFace card={p.card} reversed={p.reversed} className="h-full w-full" />
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-center text-[10px] font-bold uppercase tracking-wider text-lavender-200">
                    {p.position}
                  </span>
                  {revealed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-[11px] font-bold text-cream-50"
                    >
                      {p.card.name}
                      {p.reversed && <span className="block text-[9px] text-blush-300">reversed</span>}
                    </motion.span>
                  )}
                </div>
              );
            })}
          </div>
          {revealedCount >= picked.length && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={requestInterpretation}
              disabled={loadingAi}
              className="btn-magical shimmer mt-6 rounded-2xl px-8 py-3 text-sm font-bold text-plum-900 disabled:opacity-60"
            >
              {loadingAi ? "Sophie is reading the threads..." : "Hear Sophie's Reading 🔮"}
            </motion.button>
          )}
        </motion.div>
      )}

      {step === "result" && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-1 flex-col"
        >
          <div className="mb-3 flex justify-center gap-2">
            {picked.map((p) => (
              <div key={p.card.id} className="h-[5.25rem] w-[3.5rem] sm:h-24 sm:w-16">
                <TarotCardFace card={p.card} reversed={p.reversed} className="h-full w-full" />
              </div>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gold-300/20 bg-plum-800/75 p-4">
            <Typewriter text={interpretation} />
          </div>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-cream-100/80">
            <span>+{25 + picked.length * 5} XP</span>·<span>+40 🪙</span>·
            <span className="text-blush-200">Sophie will remember this 💞</span>
          </div>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="flex-1 rounded-2xl bg-plum-800/80 py-3 text-sm font-bold text-cream-50 ring-1 ring-lavender-400/25 transition hover:bg-plum-700"
            >
              Another Reading
            </button>
            <Link
              href="/"
              className="btn-magical flex-1 rounded-2xl py-3 text-center text-sm font-bold text-plum-900"
            >
              Return to Sophie 💜
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <MagicalRoom>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-plum-950/65"
      />
      <main className="relative z-10 mx-auto flex min-h-dvh w-full max-w-lg flex-col px-3 pb-[5.25rem] pt-3 sm:px-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gold-300/35 bg-plum-950/96 shadow-[0_16px_48px_rgba(20,8,34,0.62)] backdrop-blur-md">
          <div className="flex shrink-0 items-center justify-between border-b border-lavender-400/20 px-4 py-3">
            <Link
              href="/"
              className="rounded-full bg-plum-800 px-3 py-1 text-xs font-bold text-cream-50 ring-1 ring-gold-300/30 transition hover:bg-plum-700"
            >
              ← Parlour
            </Link>
            <h1 className="font-display text-lg font-semibold text-cream-50">{readingType.name}</h1>
            <div className="w-[4.5rem]" />
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5">
            {ritualStep ? (
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="relative mx-auto w-full max-w-[min(100%,340px)] shrink-0">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-[12%] bottom-8 top-[18%] rounded-[45%] bg-lavender-300/10 blur-2xl"
                  />
                  <div className="relative z-10 flex justify-center">
                    <Sophie
                      emotion={emotion}
                      size={sophieSize}
                      className="relative z-[2] -mb-[2.85rem] drop-shadow-[0_8px_24px_rgba(20,8,34,0.45)] sm:-mb-12"
                    />
                  </div>
                  <div className="relative z-20 mx-auto w-full px-1">
                    <div
                      className="relative mx-auto h-[4.25rem] w-full max-w-[17.5rem] rounded-[50%/55%] border-t-2 border-gold-300/40 shadow-[0_10px_28px_rgba(44,24,64,0.45),inset_0_4px_14px_rgba(247,183,216,0.06)] sm:h-[4.75rem]"
                      style={{
                        background:
                          "radial-gradient(ellipse at 50% 12%, #6b4f8a 0%, #4a3568 38%, #392952 72%, #2a1d3f 100%)",
                      }}
                    >
                      <div className="absolute left-1/2 top-1/2 h-[62%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[50%/55%] border border-gold-300/20" />
                      <span className="absolute bottom-2 left-[12%] text-sm drop-shadow-glow-gold">🔮</span>
                      <span className="absolute bottom-2.5 right-[12%] text-sm">🕯️</span>
                    </div>
                    <div className="mx-auto -mt-1 h-2.5 w-[62%] rounded-[50%] bg-plum-950/80 blur-sm" />
                  </div>
                </div>
                <div className="relative z-30 mt-2 flex min-h-0 flex-1 flex-col">{stepContent}</div>
              </div>
            ) : (
              <>
                <div className="mb-3 flex shrink-0 justify-center">
                  <Sophie
                    emotion={emotion}
                    size={sophieSize}
                    className="drop-shadow-[0_8px_24px_rgba(20,8,34,0.45)]"
                  />
                </div>
                {stepContent}
              </>
            )}
          </div>
        </div>
      </main>
      <BottomNav />
    </MagicalRoom>
  );
}
