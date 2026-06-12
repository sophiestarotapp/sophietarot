"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import TarotCard from "@/components/tarot/TarotCard";
import { SOPHIE_STYLES, getStyle } from "@/lib/sophieStyles";
import { ROOM_BACKGROUNDS, getRoomBackground } from "@/lib/roomBackgrounds";
import { useSophieStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import Sophie from "@/components/sophie/Sophie";

const SOPHIE_DESIGNS = SOPHIE_STYLES.filter((style) =>
  ["classic", "premium-dress"].includes(style.id)
);

const BACKGROUND_DESIGNS = ROOM_BACKGROUNDS;

const TAROT_DESIGNS = [
  {
    id: "rose",
    name: "Rose Deck",
    description: "Dusty rose, berry pink, and gold filigree.",
  },
  {
    id: "moonlit",
    name: "Moonlit Deck",
    description: "Lavender shadows with a darker mystical finish.",
  },
] as const;

type ClosetTab = "outfits" | "room" | "deck";

const TABS: { id: ClosetTab; label: string; icon: string }[] = [
  { id: "outfits", label: "Outfits", icon: "👗" },
  { id: "room", label: "Room", icon: "🏰" },
  { id: "deck", label: "Deck", icon: "🃏" },
];

function SelectedBadge() {
  return (
    <span className="absolute right-2 top-2 rounded-full bg-gold-300/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-plum-950 shadow-sm">
      Wearing
    </span>
  );
}

export default function WardrobeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const {
    activeStyleId,
    setActiveStyle,
    activeBackgroundId,
    setActiveBackground,
    activeTarotDesignId,
    setActiveTarotDesign,
  } = useSophieStore();

  const [tab, setTab] = useState<ClosetTab>("outfits");
  const [previewStyleId, setPreviewStyleId] = useState(activeStyleId);
  const [previewBackgroundId, setPreviewBackgroundId] = useState(activeBackgroundId);

  const activeStyle = getStyle(activeStyleId);
  const previewStyle = getStyle(previewStyleId);
  const previewBackground = getRoomBackground(previewBackgroundId);
  const activeTarot = TAROT_DESIGNS.find((d) => d.id === activeTarotDesignId) ?? TAROT_DESIGNS[0];

  useEffect(() => {
    if (open) {
      setPreviewStyleId(activeStyleId);
      setPreviewBackgroundId(activeBackgroundId);
      setTab("outfits");
    }
  }, [open, activeStyleId, activeBackgroundId]);

  const equipStyle = (styleId: string) => {
    setPreviewStyleId(styleId);
    setActiveStyle(styleId);
    track("style_equipped", { style: styleId });
  };

  return (
    <Modal open={open} onClose={onClose} title="Sophie's Closet" icon="👗" wide>
      <div className="mb-4 flex gap-1 rounded-2xl bg-plum-950/60 p-1 ring-1 ring-lavender-400/15">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition ${
                isActive
                  ? "bg-gradient-to-b from-blush-300/35 to-lavender-400/25 text-cream-50 shadow-sm ring-1 ring-gold-300/40"
                  : "text-cream-100/55 hover:bg-plum-800/40 hover:text-cream-100/80"
              }`}
            >
              <span aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "outfits" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-plum-900/80 via-plum-950/70 to-plum-950 ring-1 ring-lavender-400/20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background: `radial-gradient(circle at 50% 85%, ${previewStyle.roomGlow}55, transparent 62%)`,
              }}
            />
            <div className="relative flex min-h-[13.5rem] flex-col items-center justify-end px-4 pb-3 pt-4">
              <Sophie
                size={168}
                styleId={previewStyleId}
                emotion="happy"
                staticPreview
                className="drop-shadow-[0_10px_28px_rgba(44,24,64,0.45)]"
              />
              <div className="mt-2 text-center">
                <p className="font-display text-base font-semibold text-cream-50">{previewStyle.name}</p>
                <p className="mt-0.5 text-[11px] text-cream-100/55">
                  {previewStyleId === activeStyleId ? "Currently equipped" : "Tap an outfit below to try it on"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold-300/80">
              Choose an outfit
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SOPHIE_DESIGNS.map((style) => {
                const isActive = style.id === activeStyleId;
                const isPreview = style.id === previewStyleId;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => equipStyle(style.id)}
                    onMouseEnter={() => setPreviewStyleId(style.id)}
                    onFocus={() => setPreviewStyleId(style.id)}
                    className={`relative overflow-hidden rounded-2xl text-left transition ${
                      isPreview
                        ? "bg-gradient-to-br from-blush-300/25 to-lavender-400/25 ring-2 ring-gold-300"
                        : "bg-plum-950/50 ring-1 ring-lavender-400/20 hover:ring-gold-300/45"
                    }`}
                  >
                    {isActive && <SelectedBadge />}
                    <div className="relative mx-auto mt-3 h-[9.5rem] w-[72%]">
                      {style.characterSrc ? (
                        <Image
                          src={style.characterSrc}
                          alt={style.name}
                          fill
                          unoptimized
                          className="object-contain object-bottom drop-shadow-[0_6px_16px_rgba(44,24,64,0.35)]"
                          sizes="140px"
                        />
                      ) : (
                        <div
                          className="h-full w-full rounded-full ring-2 ring-white/20"
                          style={{
                            background: `linear-gradient(160deg, ${style.hair}, ${style.dress})`,
                          }}
                        />
                      )}
                    </div>
                    <div className="px-3 pb-3 pt-2">
                      <p className="text-xs font-bold text-cream-50">{style.name}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cream-100/55">
                        {style.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "room" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl ring-1 ring-lavender-400/20">
            <div className="relative h-40">
              <Image
                src={previewBackground.src}
                alt=""
                fill
                unoptimized
                className="object-cover"
                style={{ objectPosition: previewBackground.objectPosition }}
                sizes="360px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-950/85 via-plum-950/20 to-transparent" />
            </div>
            <div className="relative bg-plum-950/70 px-4 py-3">
              <p className="font-display text-base font-semibold text-cream-50">{previewBackground.name}</p>
              <p className="mt-1 text-[11px] text-cream-100/55">
                {previewBackgroundId === activeBackgroundId
                  ? "Currently equipped"
                  : "Tap a room below to preview it"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold-300/80">
              Choose a background
            </p>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_DESIGNS.map((design) => {
                const isActive = design.id === activeBackgroundId;
                const isPreview = design.id === previewBackgroundId;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setPreviewBackgroundId(design.id);
                      setActiveBackground(design.id);
                      track("background_equipped", { background: design.id });
                    }}
                    onMouseEnter={() => setPreviewBackgroundId(design.id)}
                    onFocus={() => setPreviewBackgroundId(design.id)}
                    className={`relative overflow-hidden rounded-2xl text-left transition ${
                      isPreview
                        ? "ring-2 ring-gold-300"
                        : "ring-1 ring-lavender-400/20 hover:ring-gold-300/45"
                    }`}
                  >
                    {isActive && <SelectedBadge />}
                    <div className="relative h-28">
                      <Image
                        src={design.src}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                        style={{ objectPosition: design.objectPosition }}
                        sizes="180px"
                      />
                    </div>
                    <div className="bg-plum-950/60 px-3 py-2.5">
                      <p className="text-xs font-bold text-cream-50">{design.name}</p>
                      <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cream-100/55">
                        {design.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "deck" && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-plum-950/60 px-4 py-4 ring-1 ring-lavender-400/20">
            <div className="h-24 w-[3.6rem] shrink-0">
              <TarotCard className="h-full w-full" design={activeTarot.id} />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-cream-50">{activeTarot.name}</p>
              <p className="mt-1 text-[11px] text-cream-100/55">{activeTarot.description}</p>
              <p className="mt-2 text-[10px] font-medium text-gold-300/80">Active deck design</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold-300/80">
              Choose a deck
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TAROT_DESIGNS.map((design) => {
                const isActive = design.id === activeTarotDesignId;
                return (
                  <button
                    key={design.id}
                    type="button"
                    onClick={() => {
                      setActiveTarotDesign(design.id);
                      track("tarot_design_equipped", { design: design.id });
                    }}
                    className={`relative rounded-2xl p-3 text-left transition ${
                      isActive
                        ? "bg-gradient-to-br from-blush-300/25 to-lavender-400/25 ring-2 ring-gold-300"
                        : "bg-plum-950/50 ring-1 ring-lavender-400/20 hover:ring-gold-300/45"
                    }`}
                  >
                    {isActive && <SelectedBadge />}
                    <div className="mb-3 flex h-20 items-center justify-center">
                      <div className="h-20 w-12">
                        <TarotCard className="h-full w-full" design={design.id} />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-cream-50">{design.name}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-cream-100/55">
                      {design.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[10px] text-cream-100/35">
        Currently wearing <span className="text-cream-100/55">{activeStyle.name}</span>
        {" · "}
        <span className="text-cream-100/55">{getRoomBackground(activeBackgroundId).name}</span>
      </p>
    </Modal>
  );
}
