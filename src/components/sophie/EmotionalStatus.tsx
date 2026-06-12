"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getEmotionalStatus, type EmotionalStatus as Status } from "@/lib/ambience";

/**
 * Floating status near Sophie — changes daily (and at night) so she
 * always feels alive, never idle.
 */
export default function EmotionalStatus({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    setStatus(getEmotionalStatus());
    const t = setInterval(() => setStatus(getEmotionalStatus()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.9 }}
      animate={{ opacity: 1, y: [0, -5, 0], scale: 1 }}
      transition={{
        opacity: { delay: 1.6, duration: 0.6 },
        scale: { delay: 1.6, duration: 0.6 },
        y: { delay: 2.2, duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      className={`glass-panel pointer-events-none flex items-center gap-1.5 rounded-full px-3 py-1.5 ${className ?? ""}`}
    >
      <motion.span
        animate={{ scale: [1, 1.18, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-sm"
      >
        {status.icon}
      </motion.span>
      <span className="text-[11px] font-semibold tracking-wide text-cream-100/90">
        {status.text}
      </span>
    </motion.div>
  );
}
