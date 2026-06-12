"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { href: "/", label: "Home", icon: "/nav/home.png" },
  { href: "/novels", label: "Novels", icon: "/nav/novels.png" },
  { href: "/collectibles", label: "Collectibles", icon: "/nav/collectibles.png" },
  { href: "/shop", label: "Shop", icon: "/nav/shop.png" },
  { href: "/profile", label: "Profile", icon: "/nav/profile.png" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-1 pb-[max(env(safe-area-inset-bottom),0.3rem)] pt-0.5">
      <div className="glass-panel flex w-full max-w-[min(100%,36rem)] items-end justify-between gap-0.5 rounded-[1.5rem] border-gold-300/22 px-1 py-1 shadow-glow-pink/40 sm:max-w-[38rem] sm:gap-1 sm:px-1.5 sm:py-1.25">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-0.5 sm:gap-0.5 sm:py-1"
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-b from-blush-300/40 to-lavender-400/30 shadow-[0_0_12px_rgba(247,183,216,0.28)] ring-1 ring-gold-300/45"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <motion.div
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="relative flex h-[3.1rem] w-[3.1rem] shrink-0 items-center justify-center sm:h-[3.25rem] sm:w-[3.25rem]"
              >
                <Image
                  src={tab.icon}
                  alt=""
                  aria-hidden
                  width={56}
                  height={56}
                  unoptimized
                  draggable={false}
                  className={`h-full w-full object-contain transition duration-200 ${
                    active ? "drop-shadow-[0_0_8px_rgba(247,183,216,0.45)]" : "opacity-88 group-hover:opacity-100"
                  }`}
                />
              </motion.div>
              <span
                className={`relative max-w-full px-0.5 text-center text-[7px] font-normal leading-tight tracking-wide sm:text-[8px] ${
                  active ? "gold-text" : "text-cream-100/65 group-hover:text-cream-50/90"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
