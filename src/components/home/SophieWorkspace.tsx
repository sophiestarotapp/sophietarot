"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sophie from "@/components/sophie/Sophie";
import TarotTable from "@/components/home/TarotTable";
import type { SophieEmotion } from "@/lib/sophieCanon";

const SOPHIE_SIZE = 492;

interface SophieWorkspaceProps {
  emotion: SophieEmotion;
}

export default function SophieWorkspace({ emotion }: SophieWorkspaceProps) {
  const router = useRouter();
  const [shuffling, setShuffling] = useState(false);

  const startReading = () => {
    if (shuffling) return;
    setShuffling(true);
    window.setTimeout(() => router.push("/reading"), 680);
  };

  return (
    <div className="relative mx-auto w-full max-w-[min(88vw,500px)] overflow-visible px-2">
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-[min(86vw,492px)]">
          <div className="relative z-10 mx-auto">
            <Sophie
              emotion={emotion}
              size={SOPHIE_SIZE}
              className="relative z-[2] mx-auto drop-shadow-[0_8px_32px_rgba(44,24,64,0.35)]"
            />
          </div>
        </div>
      </div>

      <div className="pointer-events-auto relative z-30 -mt-[7.1rem] flex justify-center sm:-mt-[7.8rem]">
        <button
          type="button"
          onClick={startReading}
          className="btn-start-reading flex h-14 w-[72vw] max-w-[21rem] items-center justify-center px-6 text-[0.95rem] font-bold tracking-wide text-cream-50 sm:h-16 sm:max-w-[22rem] sm:text-base"
        >
          ✨ Start Reading ✨
        </button>
      </div>

      <div className="relative z-20 mt-7 w-full sm:mt-8">
        <TarotTable shuffling={shuffling} onStartReading={startReading} />
      </div>
    </div>
  );
}
