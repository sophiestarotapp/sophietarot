"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  wide?: boolean;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, icon, wide, children }: ModalProps) {
  // Portal to <body>: ancestors with CSS transforms (e.g. translate-centered
  // side rails) would otherwise become the containing block for fixed
  // positioning and squash the overlay.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-plum-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`glass-panel max-h-[88dvh] w-full overflow-y-auto rounded-3xl p-5 ${
              wide ? "max-w-xl" : "max-w-md"
            }`}
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold gold-text">
                {icon && <span className="mr-2">{icon}</span>}
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-plum-700/60 text-cream-100/80 transition hover:bg-plum-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
