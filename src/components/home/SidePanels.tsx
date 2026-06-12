"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { getDailyMessage } from "@/lib/dailyMessage";
import { useSophieStore } from "@/lib/store";
import Modal from "@/components/ui/Modal";
import WardrobeModal from "@/components/home/WardrobeModal";

const EVENTS = [
  { icon: "🌙", name: "Moonpetal Festival", desc: "Double bond from all readings this week.", tag: "LIVE", ends: "3d 12h" },
  { icon: "🎃", name: "Hallow's Veil", desc: "Gothic Sophie returns + limited UR companions.", tag: "SOON", ends: "Oct 24" },
  { icon: "📖", name: "New Chapter Friday", desc: "Main Story Chapter III arrives this Friday.", tag: "WEEKLY", ends: "2d" },
];

const RAIL_BUTTONS = [
  {
    id: "events" as const,
    label: "Events",
    icon: "/rail/events.png",
    frame: "from-lavender-300/25 via-blush-200/10 to-plum-950/40 ring-lavender-300/40",
    shell: "from-lavender-500/30 via-plum-800/75 to-plum-950/90",
  },
  {
    id: "closet" as const,
    label: "Wardrobe",
    icon: "/rail/wardrobe.png",
    frame: "from-blush-200/30 via-cream-50/5 to-plum-950/40 ring-blush-300/45",
    shell: "from-blush-400/25 via-plum-800/75 to-plum-950/90",
  },
  {
    id: "gift" as const,
    label: "Gifts",
    icon: "/rail/gift.png",
    frame: "from-gold-300/30 via-blush-200/10 to-plum-950/40 ring-gold-300/50",
    shell: "from-gold-300/20 via-plum-800/75 to-plum-950/90",
  },
  {
    id: "notices" as const,
    label: "Notifications",
    icon: "/rail/notifications.png",
    frame: "from-blush-300/25 via-lavender-300/10 to-plum-950/40 ring-blush-300/40",
    shell: "from-blush-300/22 via-plum-800/75 to-plum-950/90",
  },
];

function PulseBadge() {
  return (
    <>
      <span className="absolute right-1 top-1 h-2.5 w-2.5 animate-ping rounded-full bg-blush-400" />
      <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-blush-400 shadow-[0_0_8px_rgba(247,183,216,0.9)]" />
    </>
  );
}

export function RightRail({ onOpenCloset }: { onOpenCloset?: () => void }) {
  const [open, setOpen] = useState<null | "events" | "closet" | "gift" | "notices">(null);
  const { username, claimDaily, loginStreak, notify, lastDailyClaim, notifications, markNotificationsRead } =
    useSophieStore();
  const today = new Date().toISOString().slice(0, 10);
  const claimed = lastDailyClaim === today;
  const unread = notifications.filter((n) => !n.read).length;
  const dailyMessage = getDailyMessage(username);

  const showPulse = (id: (typeof RAIL_BUTTONS)[number]["id"]) => {
    if (id === "events") return true;
    if (id === "gift") return !claimed;
    if (id === "notices") return unread > 0;
    return false;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="pointer-events-auto flex flex-col gap-2"
      >
        {RAIL_BUTTONS.map((b) => (
          <motion.button
            key={b.id}
            type="button"
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (b.id === "closet" && onOpenCloset) {
                onOpenCloset();
                return;
              }
              if (b.id === "notices") markNotificationsRead();
              setOpen(b.id);
            }}
            title={b.label}
            className={`group relative flex w-[4.35rem] flex-col items-center gap-0.5 overflow-hidden rounded-[0.95rem] border border-gold-300/28 bg-gradient-to-b px-1 pb-1.5 pt-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_5px_18px_rgba(247,183,216,0.12)] backdrop-blur-md transition hover:border-gold-300/48 hover:shadow-glow-pink/50 sm:w-[4.6rem] ${b.shell}`}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/40 to-transparent"
            />

            <div
              className={`relative flex h-[3.05rem] w-[3.05rem] items-center justify-center rounded-[0.75rem] bg-gradient-to-br shadow-[inset_0_2px_9px_rgba(255,255,255,0.05)] ring-1 sm:h-[3.2rem] sm:w-[3.2rem] ${b.frame}`}
            >
              <Image
                src={b.icon}
                alt=""
                aria-hidden
                width={64}
                height={64}
                unoptimized
                draggable={false}
                className="h-[3.75rem] w-[3.75rem] object-contain drop-shadow-[0_4px_12px_rgba(44,24,64,0.4)] transition duration-200 group-hover:scale-105 sm:h-[3.9rem] sm:w-[3.9rem]"
              />
            </div>

            <span className="relative max-w-full px-0.5 text-center text-[7.5px] font-medium leading-tight tracking-wide text-cream-50/82 sm:text-[8px]">
              {b.label}
            </span>

            {showPulse(b.id) && <PulseBadge />}
          </motion.button>
        ))}
      </motion.div>

      {!onOpenCloset && (
        <WardrobeModal open={open === "closet"} onClose={() => setOpen(null)} />
      )}

      <Modal open={open === "events"} onClose={() => setOpen(null)} title="Events" icon="🎪">
        <div className="space-y-3">
          {EVENTS.map((e) => (
            <div key={e.name} className="rounded-xl bg-plum-950/50 p-3 ring-1 ring-lavender-400/20">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-cream-50">
                  <span className="mr-1.5">{e.icon}</span>
                  {e.name}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    e.tag === "LIVE"
                      ? "bg-blush-400/30 text-blush-200"
                      : "bg-lavender-400/30 text-lavender-200"
                  }`}
                >
                  {e.tag}
                </span>
              </div>
              <p className="mt-1 text-xs text-cream-100/70">{e.desc}</p>
              <p className="mt-1 text-[10px] text-gold-300">⏳ {e.ends}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal open={open === "gift"} onClose={() => setOpen(null)} title="Gift From Sophie" icon="🎁">
        <div className="text-center">
          <motion.div
            animate={{ rotate: claimed ? 0 : [0, -6, 6, -4, 4, 0] }}
            transition={{ duration: 1.2, repeat: claimed ? 0 : Infinity, repeatDelay: 1.5 }}
            className="mx-auto mb-3 flex h-20 w-20 items-center justify-center"
          >
            <Image
              src="/rail/gift.png"
              alt=""
              width={80}
              height={80}
              unoptimized
              className="h-full w-full object-contain drop-shadow-glow-pink"
            />
          </motion.div>
          <p className="font-display text-lg italic text-cream-100/90">
            {claimed
              ? "“Come back tomorrow — I'm already wrapping something for you.”"
              : "“I saved this for you! Open it, open it!”"}
          </p>
          <p className="mt-2 text-xs text-cream-100/60">
            Login streak: {loginStreak} day{loginStreak === 1 ? "" : "s"} 🔥
          </p>
          <button
            disabled={claimed}
            onClick={() => {
              if (claimDaily()) {
                notify("🎁", "Daily gift claimed!", "Sophie saved a little warmth just for you.");
              }
            }}
            className="btn-magical mt-4 w-full rounded-2xl py-3 text-sm font-bold text-plum-900 disabled:opacity-40 disabled:saturate-50"
          >
            {claimed ? "Claimed Today" : "Claim Daily Gift"}
          </button>
        </div>
      </Modal>

      <Modal open={open === "notices"} onClose={() => setOpen(null)} title="Notifications" icon="🔔">
        <div className="space-y-3 text-sm text-cream-100/80">
          <div className="rounded-xl bg-cream-50/90 p-3 text-plum-900 ring-1 ring-gold-300/30">
            <p className="text-[10px] font-bold uppercase tracking-widest text-plum-700">
              💬 Sophie&apos;s Note
            </p>
            <p className="mt-1 whitespace-pre-line font-display text-sm italic leading-relaxed">
              &ldquo;{dailyMessage}&rdquo;
            </p>
          </div>
          {notifications.map((n) => (
            <div key={n.id} className="rounded-xl bg-plum-950/50 p-3 ring-1 ring-lavender-400/20">
              <p className="text-sm font-bold text-cream-50">
                <span className="mr-1.5">{n.icon}</span>
                {n.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-cream-100/70">{n.body}</p>
            </div>
          ))}
          <div className="rounded-xl bg-plum-950/50 p-3 ring-1 ring-lavender-400/20">
            <p className="font-bold text-cream-50">🕯️ Ver. 1.0 — &ldquo;The Door Between Rains&rdquo;</p>
            <p className="mt-1 text-xs">
              The parlour opens its doors. Daily readings, the Main Story, and Sophie&apos;s wardrobe are now
              available.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
