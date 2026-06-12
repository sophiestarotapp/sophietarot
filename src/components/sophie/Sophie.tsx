"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import type { SophieEmotion } from "@/lib/sophieCanon";
import { getMoodTheme } from "@/lib/ambience";
import { useSophieStore } from "@/lib/store";
import {
  CLASSIC_SOPHIE_CHARACTER_ASPECT,
  CLASSIC_SOPHIE_CHARACTER_SRC,
  getStyle,
} from "@/lib/sophieStyles";

export type { SophieEmotion };

interface SophieProps {
  emotion?: SophieEmotion;
  size?: number;
  styleId?: string;
  className?: string;
  /** Disable idle motion — used in wardrobe previews. */
  staticPreview?: boolean;
}

const IDLE_VARIANTS = [
  { x: 0, rotate: 0 },
  { x: -2, rotate: -0.4 },
  { x: 2, rotate: 0.35 },
];

function emotionFilter(emotion: SophieEmotion) {
  switch (emotion) {
    case "sleepy":
      return "saturate(0.92) brightness(0.94) sepia(0.06)";
    case "excited":
    case "playful":
      return "saturate(1.08) brightness(1.04)";
    case "love":
    case "happy":
      return "saturate(1.05) brightness(1.02)";
    case "concerned":
    case "sad":
      return "saturate(0.88) brightness(0.9)";
    default:
      return "none";
  }
}

export default function Sophie({
  emotion = "neutral",
  size = 340,
  styleId,
  className,
  staticPreview = false,
}: SophieProps) {
  const [idleIdx, setIdleIdx] = useState(0);
  const sway = useAnimationControls();
  const theme = getMoodTheme(emotion);
  const activeStyleId = useSophieStore((s) => s.activeStyleId);
  const style = getStyle(styleId ?? activeStyleId);
  const imageSrc = style.characterSrc ?? CLASSIC_SOPHIE_CHARACTER_SRC;
  const imageAspect = style.characterAspect ?? CLASSIC_SOPHIE_CHARACTER_ASPECT;
  const imageHeight = Math.round(size * imageAspect);

  useEffect(() => {
    const idleTimer = window.setInterval(() => {
      setIdleIdx((i) => (i + 1) % IDLE_VARIANTS.length);
    }, 26_000);
    return () => window.clearInterval(idleTimer);
  }, []);

  useEffect(() => {
    sway.start({
      rotate: [0, 0.25, -0.2, 0],
      transition: { duration: 7, repeat: Infinity, ease: "easeInOut" },
    });
  }, [sway]);

  const variant = IDLE_VARIANTS[idleIdx];
  const imageStyle = {
    width: size,
    maxWidth: "100%",
    background: "transparent" as const,
    filter: emotionFilter(emotion),
  };

  const image = (
    <Image
      src={imageSrc}
      alt="Sophie"
      width={size}
      height={imageHeight}
      priority={!staticPreview}
      unoptimized
      className="h-auto select-none bg-transparent"
      style={imageStyle}
      draggable={false}
    />
  );

  if (staticPreview) {
    return (
      <div className={`relative inline-block ${className ?? ""}`} style={{ width: size, maxWidth: "100%" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[10%] bottom-[4%] top-[8%] rounded-[40%] opacity-25 blur-2xl"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${style.roomGlow}, transparent 70%)`,
          }}
        />
        <div className="relative">{image}</div>
      </div>
    );
  }

  return (
    <motion.div
      className={`relative inline-block ${className ?? ""}`}
      animate={{
        y: [0, -4, 0],
        scale: [1, 1.012, 1],
        ...variant,
      }}
      transition={{
        y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 4.2, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 0.8, ease: "easeOut" },
        rotate: { duration: 0.8, ease: "easeOut" },
      }}
      style={{ width: size, maxWidth: "100%" }}
    >
      {!style.characterSrc && style.id !== "classic" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[8%] bottom-[6%] top-[14%] rounded-[45%] opacity-35 blur-2xl"
          style={{
            background: `radial-gradient(circle at 50% 42%, ${style.roomGlow}, transparent 64%)`,
          }}
        />
      )}
      {theme.particleBoost && (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-blush-300/70"
              style={{
                width: 4,
                height: 4,
                left: `${20 + i * 28}%`,
                top: `${12 + i * 8}%`,
                boxShadow: "0 0 8px rgba(247,183,216,0.8)",
              }}
              animate={{ opacity: [0.2, 0.9, 0.2], y: [0, -10, 0] }}
              transition={{ duration: 2.4 + i * 0.4, repeat: Infinity, delay: i * 0.5 }}
            />
          ))}
        </div>
      )}

      <motion.div animate={sway} className="relative">
        {image}
      </motion.div>
    </motion.div>
  );
}
