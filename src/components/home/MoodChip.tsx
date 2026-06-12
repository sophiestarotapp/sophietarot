"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getPresenceStatus, getMoodTheme } from "@/lib/ambience";
import { useSophieStore } from "@/lib/store";

export default function MoodChip() {
  const username = useSophieStore((s) => s.username);
  const notifications = useSophieStore((s) => s.notifications);
  const [status, setStatus] = useState(() =>
    getPresenceStatus(new Date(), {
      hasUnreadLetter: notifications.some((n) => !n.read),
    })
  );

  useEffect(() => {
    const refresh = () => {
      setStatus(
        getPresenceStatus(new Date(), {
          hasUnreadLetter: notifications.some((n) => !n.read),
        })
      );
    };
    refresh();
    const t = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(t);
  }, [notifications]);

  const theme = getMoodTheme(status.emotion);

  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className={`pointer-events-none text-center text-[10px] font-semibold tracking-wide sm:text-[11px] ${theme.chipClass}`}
    >
      <span className="mr-1">{status.icon}</span>
      {status.text.replace("starlight", username)}
    </motion.p>
  );
}
