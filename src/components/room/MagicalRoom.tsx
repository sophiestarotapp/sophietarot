"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useSophieStore } from "@/lib/store";
import { getAmbienceLayers } from "@/lib/ambience";
import { getRoomBackground } from "@/lib/roomBackgrounds";
import AmbienceLayers from "@/components/room/AmbienceLayers";

/**
 * Sophie's room — static background with time-of-day ambience.
 */
export default function MagicalRoom({
  children,
  depthBlur = false,
}: {
  children?: React.ReactNode;
  depthBlur?: boolean;
}) {
  const aurora = useSophieStore((s) => s.purchasedShopItemIds.includes("dig-theme-aurora"));
  const activeBackgroundId = useSophieStore((s) => s.activeBackgroundId);
  const room = getRoomBackground(activeBackgroundId);
  const layers = useMemo(() => getAmbienceLayers(new Date(), depthBlur), [depthBlur]);
  const backgroundFilter =
    room.id === "premium-library"
      ? `${layers.roomFilter} brightness(1.03) saturate(1.06)`
      : layers.roomFilter;

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-plum-950">
      <Image
        src={room.src}
        alt=""
        aria-hidden
        fill
        priority
        unoptimized
        sizes="100vw"
        className={`pointer-events-none object-cover transition-[filter,transform] duration-700 ${
          depthBlur ? "scale-[1.015] blur-[1.25px] sm:blur-[1px]" : ""
        }`}
        style={{ filter: backgroundFilter, objectPosition: room.objectPosition }}
      />
      <AmbienceLayers depthBlur={depthBlur} />
      {aurora && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 animate-[pulse_8s_ease-in-out_infinite] opacity-70"
          style={{
            background:
              "linear-gradient(180deg, rgba(64,224,208,0.14) 0%, transparent 38%, rgba(186,85,211,0.18) 72%, transparent 100%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
