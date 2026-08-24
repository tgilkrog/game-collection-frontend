import type { Transition, Variants } from "framer-motion";

// Header-anchored popover entrance (search results dropdown, ProfileMenu, etc.)
export const popupVariants: Variants = {
    initial: { opacity: 0, y: -14, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -14, scale: 0.95 },
};
export const popupTransition: Transition = { duration: 0.28, ease: "easeOut" };

// Routed page enter/exit, used by PageTransition
export const pageVariants: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
};
export const pageTransition: Transition = { duration: 0.2, ease: "linear" };

// GameCard hover/tap lift
export const cardHover = {
    whileHover: { y: -6, scale: 1.04 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 300, damping: 20 } satisfies Transition,
};

// FilterPanel collapse/expand sections
export const collapseVariants: Variants = {
    initial: { opacity: 0, height: 0 },
    animate: { opacity: 1, height: "auto" },
    exit: { opacity: 0, height: 0 },
};
export const collapseTransition: Transition = { duration: 0.22, ease: "easeOut" };

// Grid entrance stagger + crossfade for card grids (GameList / GameCopyList)
export const gridContainer: Variants = {
    animate: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
export const gridItem: Variants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
    exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: "easeOut" } },
};
