"use client";

import { useEffect, useMemo, useState } from "react";
import MagicalRoom from "@/components/room/MagicalRoom";
import TopHud from "@/components/home/TopHud";
import SophieWorkspace from "@/components/home/SophieWorkspace";
import { RightRail } from "@/components/home/SidePanels";
import WardrobeModal from "@/components/home/WardrobeModal";
import BottomNav from "@/components/nav/BottomNav";
import { getPresenceStatus } from "@/lib/ambience";
import { buildJournalEntry } from "@/lib/journal";
import { useSophieStore } from "@/lib/store";

export default function HomePage() {
  const username = useSophieStore((s) => s.username);
  const bond = useSophieStore((s) => s.bond);
  const readings = useSophieStore((s) => s.readings);
  const loginStreak = useSophieStore((s) => s.loginStreak);
  const firstVisitAt = useSophieStore((s) => s.firstVisitAt);
  const notifications = useSophieStore((s) => s.notifications);
  const appendJournalEntry = useSophieStore((s) => s.appendJournalEntry);

  const [closetOpen, setClosetOpen] = useState(false);

  const presence = useMemo(
    () =>
      getPresenceStatus(new Date(), {
        hasUnreadLetter: notifications.some((n) => !n.read),
      }),
    [notifications]
  );

  useEffect(() => {
    const daysTogether = Math.max(
      1,
      Math.floor((Date.now() - (firstVisitAt || Date.now())) / 86_400_000) + 1
    );
    appendJournalEntry(
      buildJournalEntry(username, {
        readings: readings.length,
        bond,
        loginStreak,
        daysTogether,
      })
    );
  }, [appendJournalEntry, username, bond, readings.length, loginStreak, firstVisitAt]);

  return (
    <MagicalRoom depthBlur>
      <TopHud />

      <main className="relative z-10 flex min-h-dvh flex-col items-center justify-end pb-[5rem] pt-[4.5rem] sm:pb-[5.25rem] sm:pt-[4.25rem]">
        <SophieWorkspace emotion={presence.emotion} />

        <div className="pointer-events-none absolute right-1.5 top-[42%] z-30 sm:right-2 sm:top-[43%]">
          <RightRail onOpenCloset={() => setClosetOpen(true)} />
        </div>
      </main>

      <WardrobeModal open={closetOpen} onClose={() => setClosetOpen(false)} />
      <BottomNav />
    </MagicalRoom>
  );
}
